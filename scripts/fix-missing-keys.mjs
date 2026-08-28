// =============================================================================
// fix-missing-keys.mjs - add _key to array items the seed scripts left keyless
// =============================================================================
// The original seeding wrote reference arrays (course.teachingAreas,
// course.instructors, facultyMember.teachingAreas, ...) without _key, so the
// Studio shows "Missing keys" and refuses to edit those lists (2026-08-28,
// Nathan's screenshots). This walks EVERY document (drafts included, raw
// perspective), finds arrays of objects where any item lacks _key, and adds a
// random key to each keyless item. Nothing else is touched; items that already
// have keys keep them. Arrays of plain strings need no keys and are skipped.
//
//   node scripts/fix-missing-keys.mjs           # dry run - report only
//   node scripts/fix-missing-keys.mjs --apply   # patch, one mutation per doc
//
// Requires a write token in .env (SANITY_API_WRITE_TOKEN or
// SANITY_AUTH_TOKEN). The token is never printed.
// =============================================================================
import { loadEnv } from './lib/loadEnv.mjs';
import crypto from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const env = loadEnv(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const projectId = env.PUBLIC_SANITY_PROJECT_ID || 'uz2sl3zp';
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_AUTH_TOKEN;
const APPLY = process.argv.includes('--apply');

if (!token) {
  console.error('fix-missing-keys: no write token in .env (SANITY_API_WRITE_TOKEN).');
  process.exit(1);
}

const api = (path, init) =>
  fetch(`https://${projectId}.api.sanity.io/v2026-05-01${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  }).then(async (r) => {
    if (!r.ok) throw new Error(`${path} -> ${r.status}: ${await r.text()}`);
    return r.json();
  });

const newKey = () => crypto.randomBytes(6).toString('hex');

/** Walk a document; return patches as {path, value} set-operations for every
    keyless object item found inside any array. Nested arrays included. */
function findKeyless(value, path, out) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        if (!('_key' in item)) out.push(`${path}[${i}]._key`);
        findKeyless(item, `${path}[${i}]`, out);
      }
    });
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('_')) continue;
      findKeyless(v, path ? `${path}.${k}` : k, out);
    }
  }
}

const { result: docs } = await api(
  `/data/query/${dataset}?perspective=raw&query=${encodeURIComponent('*[!(_type match "system.*")]')}`,
);

let docCount = 0;
let itemCount = 0;
const mutations = [];

for (const doc of docs) {
  const paths = [];
  findKeyless(doc, '', paths);
  if (paths.length === 0) continue;
  docCount += 1;
  itemCount += paths.length;
  console.log(`  ${doc._id}  (${doc._type})  ${paths.length} keyless item(s)`);
  for (const p of paths) console.log(`      ${p}`);
  const set = {};
  for (const p of paths) set[p] = newKey();
  mutations.push({ patch: { id: doc._id, set, ifRevisionID: doc._rev } });
}

console.log(`\n${docCount} document(s), ${itemCount} keyless item(s).`);

if (!APPLY) {
  console.log('DRY RUN - nothing written. Re-run with --apply to add the keys.');
  process.exit(0);
}
if (mutations.length === 0) {
  console.log('Nothing to do.');
  process.exit(0);
}

// One transaction per document so an ifRevisionID conflict (someone editing
// right now) fails only that document, with a clear message.
let ok = 0;
for (const m of mutations) {
  try {
    await api(`/data/mutate/${dataset}?returnIds=true`, {
      method: 'POST',
      body: JSON.stringify({ mutations: [m] }),
    });
    ok += 1;
  } catch (err) {
    console.error(`  FAILED ${m.patch.id}: ${String(err).slice(0, 200)}`);
  }
}
console.log(`Applied to ${ok}/${mutations.length} document(s).`);
