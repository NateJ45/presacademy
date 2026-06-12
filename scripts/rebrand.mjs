// Rebrand the starter for a new church in one command.
//
//   1. Copy bootstrap.config.example.json -> bootstrap.config.json and fill it in.
//   2. node scripts/rebrand.mjs            (dry run: shows per-file replacement counts)
//   3. node scripts/rebrand.mjs --apply    (writes)
//   4. Review `git diff`, then run `npm run typegen` and `npm run og`.
//
// How it works: the template ships with EXACT, unique placeholder strings
// ("First Church of Springfield", "example-church.org", "123 Main Street"...).
// This script replaces them, longest-first, across every text file in the
// project. It is intentionally dumb and reviewable: after --apply, the git
// diff IS the rebrand. Anything the mapping misses (a photo, a color) is in
// docs/bootstrap/setup-checklist.md.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const configPath = resolve(root, 'bootstrap.config.json');
if (!existsSync(configPath)) {
  console.error('No bootstrap.config.json found at the project root.');
  console.error('Copy bootstrap.config.example.json to bootstrap.config.json and fill it in.');
  process.exit(1);
}
const cfg = JSON.parse(readFileSync(configPath, 'utf-8'));

for (const key of ['churchName', 'shortName', 'wordmarkLine2', 'domain', 'storageKeyPrefix', 'workerName', 'studioHost', 'city', 'addressLine', 'cityStateZip', 'email', 'pastorEmail', 'phone']) {
  if (typeof cfg[key] !== 'string' || cfg[key].trim() === '') {
    console.error(`bootstrap.config.json is missing "${key}".`);
    process.exit(1);
  }
}

// Ordered longest-first so overlapping placeholders resolve correctly.
const REPLACEMENTS = [
  ['First Church of Springfield', cfg.churchName],
  ['downtown Springfield', `downtown ${cfg.city}`],
  ['Springfield, IL 62701', cfg.cityStateZip],
  ['123 Main Street', cfg.addressLine],
  ['hello@example-church.org', cfg.email],
  ['pastor@example-church.org', cfg.pastorEmail],
  ['(555) 555-0100', cfg.phone],
  ['www.example-church.org', `www.${cfg.domain}`],
  ['example-church.org', cfg.domain],
  // studioHost placeholder (sanity.cli.ts) — after the domain so the dot-form wins first.
  ['example-church', cfg.studioHost],
  ['of Springfield', cfg.wordmarkLine2],
  ['First Church', cfg.shortName],
  ['Springfield', cfg.city],
  ['firstchurch', cfg.storageKeyPrefix],
  ['church-starter', cfg.workerName],
];

// Files swept. sanity.types.ts is skipped (regenerate with `npm run typegen`).
const INCLUDE_DIRS = ['src', 'studio/schemaTypes', 'studio/components', 'studio/guides', 'modules', 'docs/bootstrap', 'scripts'];
const INCLUDE_FILES = [
  'astro.config.mjs', 'wrangler.jsonc', 'package.json', 'README.md', 'CLAUDE.md',
  'public/robots.txt', 'public/llms.txt',
  'studio/structure.ts', 'studio/sanity.cli.ts', 'studio/sanity.config.ts', 'studio/package.json',
];
const TEXT_EXT = new Set(['.ts', '.tsx', '.astro', '.mjs', '.js', '.json', '.jsonc', '.txt', '.md', '.xml', '.css', '.ndjson']);
const SKIP = new Set(['node_modules', 'dist', '.astro', '.git', 'sanity.types.ts', 'schema.json']);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (TEXT_EXT.has(extname(name))) yield p;
  }
}

const files = new Set();
for (const d of INCLUDE_DIRS) {
  const p = resolve(root, d);
  if (existsSync(p)) for (const f of walk(p)) files.add(f);
}
for (const f of INCLUDE_FILES) {
  const p = resolve(root, f);
  if (existsSync(p)) files.add(p);
}

let totalFiles = 0;
let totalHits = 0;
for (const file of files) {
  if (file.endsWith('sanity.types.ts') || file.endsWith('rebrand.mjs')) continue;
  let text = readFileSync(file, 'utf-8');
  let hits = 0;
  for (const [from, to] of REPLACEMENTS) {
    if (from === to) continue;
    const parts = text.split(from);
    if (parts.length > 1) {
      hits += parts.length - 1;
      text = parts.join(to);
    }
  }
  if (hits > 0) {
    totalFiles += 1;
    totalHits += hits;
    console.log(`${APPLY ? 'STAMPED' : 'would stamp'}  ${file.slice(root.length + 1)}  (${hits})`);
    if (APPLY) writeFileSync(file, text, 'utf-8');
  }
}

console.log(`\n${APPLY ? 'Done' : 'Dry run'}: ${totalHits} replacements across ${totalFiles} files.`);
if (!APPLY) console.log('Re-run with --apply to write.');
else console.log('Now: review `git diff`, then `npm run typegen` and `npm run og`, and finish docs/bootstrap/setup-checklist.md.');
