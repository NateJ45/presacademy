// Seed placeholder images into Sanity so the site renders fully for styling.
//
//   node scripts/seed-placeholder-images.mjs            (dry run: counts only)
//   node scripts/seed-placeholder-images.mjs --apply    (upload + patch)
//
// What it does: for every doc that still LACKS an image, it uploads a placeholder
// and patches the image field. Course covers + page heroes + events use the
// in-repo Pexels library (src/assets/placeholders/, license-clean). Faculty
// portraits are pulled from pravatar.cc (direct placeholder headshots). It only
// fills EMPTY fields, so a real image an editor later adds is never clobbered,
// and it is idempotent (Sanity dedupes identical assets by hash; the GROQ
// filters skip already-filled docs). These are placeholders: the editor swaps
// real Academy photography in Studio later.

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

// --- env: parse studio/.env + root .env (root wins), then process.env ---------
function parseEnv(p) {
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}
const env = { ...parseEnv(resolve(root, 'studio/.env')), ...parseEnv(resolve(root, '.env')), ...process.env };
const projectId = env.PUBLIC_SANITY_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || env.SANITY_STUDIO_DATASET || 'production';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_AUTH_TOKEN;
if (!projectId || !token) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env'); process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: '2024-08-01', useCdn: false });

// --- image pools --------------------------------------------------------------
const DIR = resolve(root, 'src/assets/placeholders');
const COVERS = [
  'teach-seminar-discussion', 'teach-class-discussion', 'teach-lecture-hall',
  'teach-adult-education-retirees', 'teach-group-reading-bibles', 'teach-intergenerational-study',
  'teach-womens-bible-study', 'teach-bible-study-group', 'study-bibles-closeup',
  'study-bible-notebook', 'study-bible-open-outdoor', 'study-bible-pencil-notes',
];
const HEROES = [
  'teach-seminar-discussion', 'teach-group-reading-bibles', 'teach-class-discussion',
  'teach-intergenerational-study', 'community-outdoor-gathering', 'teach-lecture-hall',
  'study-bible-open-outdoor', 'community-shared-meal',
];
const PORTRAITS = [3, 5, 8, 11, 12, 14, 15, 25, 32, 33, 40, 47, 52, 60, 68]; // pravatar.cc ids

const cache = new Map();
async function uploadLocal(name) {
  if (cache.has('l:' + name)) return cache.get('l:' + name);
  const path = resolve(DIR, name + '.jpg');
  if (!existsSync(path)) { console.warn('  (missing local image: ' + name + ')'); return null; }
  const asset = await client.assets.upload('image', readFileSync(path), { filename: name + '.jpg' });
  cache.set('l:' + name, asset._id);
  return asset._id;
}
async function uploadPortrait(id) {
  if (cache.has('p:' + id)) return cache.get('p:' + id);
  const res = await fetch('https://i.pravatar.cc/600?img=' + id);
  if (!res.ok) { console.warn('  (portrait fetch failed: ' + id + ')'); return null; }
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload('image', buf, { filename: 'faculty-portrait-' + id + '.jpg' });
  cache.set('p:' + id, asset._id);
  return asset._id;
}
const imgField = (assetId, alt) => ({ _type: 'image', asset: { _type: 'reference', _ref: assetId }, alt });

const PAGE_IDS = ['homePage', 'aboutPage', 'coursesPage', 'facultyPage', 'pricingPage',
  'getStartedPage', 'forYouPage', 'resourcesPage', 'eventsPage', 'faqPage', 'contactPage', 'privacyPage'];

async function main() {
  console.log(`Seeding placeholder images -> ${projectId}/${dataset}  (${APPLY ? 'APPLY' : 'dry run'})\n`);
  const [courses, faculty, events, pages] = await Promise.all([
    client.fetch(`*[_type=='course' && !defined(coverImage.asset)]{_id, title}`),
    client.fetch(`*[_type=='facultyMember' && !defined(photo.asset)]{_id, name}`),
    client.fetch(`*[_type=='event' && !defined(image.asset)]{_id, title}`),
    client.fetch(`*[_id in $ids && !defined(heroImage.asset)]{_id}`, { ids: PAGE_IDS }),
  ]);
  console.log(`  courses needing a cover photo : ${courses.length}`);
  console.log(`  faculty needing a portrait    : ${faculty.length}`);
  console.log(`  events needing an image       : ${events.length}`);
  console.log(`  page heroes needing an image  : ${pages.length}  [${pages.map((p) => p._id).join(', ')}]`);

  if (!APPLY) { console.log('\nDry run only. Re-run with --apply to upload + patch.'); return; }

  const tx = client.transaction();
  let n = 0;
  for (let i = 0; i < courses.length; i++) {
    const id = await uploadLocal(COVERS[i % COVERS.length]);
    if (id) { tx.patch(courses[i]._id, (p) => p.set({ coverImage: imgField(id, courses[i].title || 'Course') })); n++; }
  }
  for (let i = 0; i < faculty.length; i++) {
    const id = await uploadPortrait(PORTRAITS[i % PORTRAITS.length]);
    if (id) { tx.patch(faculty[i]._id, (p) => p.set({ photo: imgField(id, faculty[i].name || 'Faculty portrait') })); n++; }
  }
  for (let i = 0; i < events.length; i++) {
    const id = await uploadLocal(HEROES[i % HEROES.length]);
    if (id) { tx.patch(events[i]._id, (p) => p.set({ image: imgField(id, events[i].title || 'Event') })); n++; }
  }
  for (let i = 0; i < pages.length; i++) {
    const id = await uploadLocal(HEROES[i % HEROES.length]);
    if (id) { tx.patch(pages[i]._id, (p) => p.set({ heroImage: imgField(id, 'The Presbyterian Academy') })); n++; }
  }

  const res = await tx.commit();
  console.log(`\nDone. Patched ${res.results?.length ?? n} documents. The dev server (and the next build) will show the images.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
