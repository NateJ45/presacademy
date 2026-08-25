// =============================================================================
// sanity-lib.mjs — shared plumbing for the Sanity seed/patch scripts
// =============================================================================
// Ported from the WCP site repo's patch-lib.mjs + pagebuilder-lib.mjs
// (2026-08-25). Gives every script the same three things so they stop
// re-inlining them:
//
//   1. A token-authed client built from studio/.env + root .env (root wins).
//   2. A DRY-RUN-BY-DEFAULT apply gate: scripts print exactly what they would
//      change and write nothing unless run with --apply (the convention the
//      existing presacademy seeds already use).
//   3. Portable Text builders, _key generation, and an IDEMPOTENT asset
//      uploader (re-runs never re-upload: asset ids cache in
//      scripts/.asset-map.json, which is gitignored).
//
// Usage in a script:
//   import { client, APPLY, apply, done, toPT, p, bullet, h2, key, ref,
//            makeUploader, imageValue } from './lib/sanity-lib.mjs';
//   ...
//   await apply(`page-about: set hero title`, () =>
//     client.patch('aboutPage').set({ heroTitle: '...' }).commit());
//   done(count);
// =============================================================================
import { readFileSync, existsSync, writeFileSync, createReadStream } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, '..', '..');
const ASSET_MAP_PATH = resolve(__dirname, '..', '.asset-map.json');

// --- env: parse studio/.env + root .env (root wins), then process.env --------
function parseEnv(p) {
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}
const env = { ...parseEnv(resolve(ROOT, 'studio/.env')), ...parseEnv(resolve(ROOT, '.env')), ...process.env };

export const projectId = env.PUBLIC_SANITY_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID;
export const dataset = env.PUBLIC_SANITY_DATASET || env.SANITY_STUDIO_DATASET || 'production';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_AUTH_TOKEN;
if (!projectId || !token) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env');
  process.exit(1);
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-05-01',
  token,
  useCdn: false,
});

// --- dry-run gate ------------------------------------------------------------
export const APPLY = process.argv.includes('--apply');

/** Log one planned change; run it only under --apply. */
export async function apply(label, fn) {
  console.log(`${APPLY ? '✓' : 'DRY'} ${label}`);
  if (APPLY) await fn();
}

/** Print the run summary. Call once at the end with the change count. */
export function done(n) {
  console.log(
    `\n${APPLY ? 'APPLIED' : 'DRY RUN'}: ${n} change(s).` +
      (APPLY ? '' : ' Re-run with --apply to write.'),
  );
}

// --- _key + reference helpers ------------------------------------------------
let n = 0;
/** Monotonic _key generator: every array member in Sanity needs a unique _key. */
export const key = () => `k${n++}`;

export const ref = (id) => ({ _type: 'reference', _ref: id });

// --- Portable Text builders --------------------------------------------------
// Plain text (\n\n paragraph breaks) → Portable Text blocks.
export const toPT = (text) =>
  String(text || '')
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({
      _type: 'block',
      _key: key(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: key(), text: s, marks: [] }],
    }));

// A single Portable Text block with an explicit style (h2/h3/normal).
export const block = (text, style = 'normal') => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
});

// A bullet-list Portable Text block.
export const li = (text) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  level: 1,
  listItem: 'bullet',
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
});

// Inline part markers for p()/bullet(): plain string, strong(), or link().
export const strong = (text) => ({ text, marks: ['strong'] });
export const link = (text, href) => ({ text, href });

const spansOf = (parts, markDefs) =>
  parts.map((part) => {
    if (typeof part === 'string') return { _type: 'span', _key: key(), text: part, marks: [] };
    if (part.href) {
      const k = key();
      markDefs.push({ _type: 'link', _key: k, href: part.href });
      return { _type: 'span', _key: key(), text: part.text, marks: [k] };
    }
    return { _type: 'span', _key: key(), text: part.text, marks: part.marks ?? [] };
  });

/** A normal paragraph block from mixed string/strong()/link() parts. */
export const p = (...parts) => {
  const markDefs = [];
  return { _type: 'block', _key: key(), style: 'normal', markDefs, children: spansOf(parts, markDefs) };
};

/** A bullet-list item block from mixed parts. */
export const bullet = (...parts) => {
  const markDefs = [];
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    level: 1,
    listItem: 'bullet',
    markDefs,
    children: spansOf(parts, markDefs),
  };
};

export const h2 = (text) => block(text, 'h2');
export const h3 = (text) => block(text, 'h3');

// --- Image/file upload (idempotent via a local asset-id cache) ---------------
// Re-runs of a seed never re-upload: the uploaded asset id is remembered per
// repo-relative path in scripts/.asset-map.json (gitignored).
export function makeUploader(uploadClient = client) {
  const map = existsSync(ASSET_MAP_PATH) ? JSON.parse(readFileSync(ASSET_MAP_PATH, 'utf8')) : {};
  const save = () => writeFileSync(ASSET_MAP_PATH, JSON.stringify(map, null, 2));
  return {
    async upload(relPath) {
      if (map[relPath]) return map[relPath];
      const asset = await uploadClient.assets.upload('image', createReadStream(resolve(ROOT, relPath)), {
        filename: relPath.split('/').pop(),
      });
      map[relPath] = asset._id;
      save();
      return asset._id;
    },
    async uploadFile(relPath) {
      const cacheKey = `file:${relPath}`;
      if (map[cacheKey]) return map[cacheKey];
      const asset = await uploadClient.assets.upload('file', createReadStream(resolve(ROOT, relPath)), {
        filename: relPath.split('/').pop(),
      });
      map[cacheKey] = asset._id;
      save();
      return asset._id;
    },
  };
}

export const imageValue = (assetId) => ({ _type: 'image', asset: ref(assetId) });
export const fileValue = (assetId) => ({ _type: 'file', asset: ref(assetId) });
