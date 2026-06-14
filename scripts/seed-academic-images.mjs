// Seed ACADEMIC placeholder images into Sanity so the live site renders fully
// while real Academy photography is still being gathered.
//
//   node scripts/seed-academic-images.mjs            (dry run: report only)
//   node scripts/seed-academic-images.mjs --apply    (bundle + upload + patch)
//
// What it does:
//   1. Sets the home hero to a 6-image Ken Burns slideshow (homePage.heroImages),
//      only if that field is still empty.
//   2. Fills every EMPTY course cover, page hero, and event image from an
//      academic photo pool (people learning, study, campus, library, books).
//   3. Fills every EMPTY faculty portrait from pravatar.cc (generic headshots).
//
// All scene photos are CC0 / public domain (sourced via Openverse from rawpixel,
// Wikimedia, StockSnap), so they carry no attribution duty. They are
// PLACEHOLDERS: the editor swaps real Academy photography in Studio later.
//
// The image files live in src/assets/placeholders/ (version-controlled). On the
// first run this script copies the curated picks there from the scratch
// scripts/_stock* folders if they are still present; after that it just reads
// the bundled files, so it stays re-runnable. It only fills empty fields, so a
// real image an editor adds is never clobbered.

import { createClient } from '@sanity/client';
import { readFileSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

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
if (!projectId || !token) { console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env'); process.exit(1); }
const client = createClient({ projectId, dataset, token, apiVersion: '2024-08-01', useCdn: false });

const DIR = resolve(root, 'src/assets/placeholders');

// name -> { alt, from } where `from` is the scratch source used for first-run bundling.
const IMAGES = {
  'acad-friends-talking':   { alt: 'Three students talking together',              from: '_stock3/img_12.jpg' },
  'acad-campus-walk':       { alt: 'Students walking across a university campus',   from: '_stock3/img_16.jpg' },
  'acad-study-overhead':    { alt: 'Students working together over books and notes', from: '_stock/img_0.jpg' },
  'acad-library-room':      { alt: 'A university library reading room',             from: '_stock/img_17.jpg' },
  'acad-table-group':       { alt: 'A small group studying around a table',         from: '_stock3/img_2.jpg' },
  'acad-writing-notes':     { alt: 'Taking notes by hand during study',             from: '_stock3/img_19.jpg' },
  'acad-lecture-hall':      { alt: 'Students in a lecture hall',                     from: '_stock/img_2.jpg' },
  'acad-markers-notebooks': { alt: 'Notebooks and markers laid out for study',      from: '_stock/img_7.jpg' },
  'acad-campus-quad':       { alt: 'A green campus quad',                            from: '_stock/img_22.jpg' },
  'acad-campus-building':   { alt: 'A university building',                          from: '_stock/img_26.jpg' },
  'acad-reading-together':  { alt: 'Reading together at a table',                    from: '_stock3/img_14.jpg' },
  'acad-woman-reading':     { alt: 'A student reading',                             from: '_stock3/img_20.jpg' },
  'acad-write-desk':        { alt: 'A desk set up for writing and study',           from: '_stock3/img_27.jpg' },
};

// The home hero slideshow, in fade order.
const HERO = ['acad-friends-talking', 'acad-campus-walk', 'acad-study-overhead', 'acad-library-room', 'acad-table-group', 'acad-writing-notes'];
// Pool used to fill empty covers / page heroes / event images (varied subjects).
const POOL = ['acad-table-group', 'acad-study-overhead', 'acad-lecture-hall', 'acad-markers-notebooks', 'acad-library-room', 'acad-campus-quad', 'acad-campus-building', 'acad-reading-together', 'acad-woman-reading', 'acad-write-desk', 'acad-campus-walk', 'acad-writing-notes', 'acad-friends-talking'];
const PORTRAITS = [3, 5, 8, 11, 12, 14, 15, 25, 32, 33, 40, 47, 52, 60, 68]; // pravatar.cc ids
const PAGE_IDS = ['aboutPage', 'coursesPage', 'facultyPage', 'pricingPage', 'getStartedPage', 'forYouPage', 'resourcesPage', 'eventsPage', 'faqPage', 'contactPage', 'privacyPage', 'accessibilityPage'];

// Ensure the bundled file exists (copy from scratch on first run), return its path.
function bundledPath(name) {
  const dest = resolve(DIR, name + '.jpg');
  if (!existsSync(dest)) {
    const src = resolve(__dirname, IMAGES[name].from);
    if (existsSync(src)) copyFileSync(src, dest);
  }
  return dest;
}

const cache = new Map();
async function uploadLocal(name) {
  if (cache.has(name)) return cache.get(name);
  const path = bundledPath(name);
  if (!existsSync(path)) { console.warn('  (missing image: ' + name + ' — run the collector first)'); return null; }
  const asset = await client.assets.upload('image', readFileSync(path), { filename: name + '.jpg' });
  cache.set(name, asset._id);
  return asset._id;
}
async function uploadPortrait(id) {
  const key = 'p:' + id;
  if (cache.has(key)) return cache.get(key);
  const res = await fetch('https://i.pravatar.cc/600?img=' + id);
  if (!res.ok) { console.warn('  (portrait fetch failed: ' + id + ')'); return null; }
  const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), { filename: 'faculty-portrait-' + id + '.jpg' });
  cache.set(key, asset._id);
  return asset._id;
}
const imgField = (assetId, alt) => ({ _type: 'image', asset: { _type: 'reference', _ref: assetId }, alt });

async function main() {
  console.log(`Seeding academic images -> ${projectId}/${dataset}  (${APPLY ? 'APPLY' : 'dry run'})\n`);
  const [home, courses, faculty, events, pages] = await Promise.all([
    client.fetch(`*[_id=='homePage'][0]{ "n": count(heroImages[defined(asset)]) }`),
    client.fetch(`*[_type=='course' && !defined(coverImage.asset)]{_id, title}`),
    client.fetch(`*[_type=='facultyMember' && !defined(photo.asset)]{_id, name}`),
    client.fetch(`*[_type=='event' && !defined(image.asset)]{_id, title}`),
    client.fetch(`*[_id in $ids && !defined(heroImage.asset)]{_id}`, { ids: PAGE_IDS }),
  ]);
  const homeNeedsHero = !home || !home.n;
  console.log(`  home hero slideshow needed    : ${homeNeedsHero ? 'YES (6 images)' : 'no (already set)'}`);
  console.log(`  courses needing a cover photo : ${courses.length}`);
  console.log(`  faculty needing a portrait    : ${faculty.length}`);
  console.log(`  events needing an image       : ${events.length}`);
  console.log(`  page heroes needing an image  : ${pages.length}  [${pages.map((p) => p._id).join(', ')}]`);

  if (!APPLY) { console.log('\nDry run only. Re-run with --apply to bundle, upload, and patch.'); return; }

  const tx = client.transaction();
  let n = 0;
  if (homeNeedsHero) {
    const arr = [];
    for (const name of HERO) {
      const id = await uploadLocal(name);
      if (id) arr.push({ ...imgField(id, IMAGES[name].alt), _key: name });
    }
    if (arr.length) { tx.patch('homePage', (p) => p.set({ heroImages: arr })); n++; }
  }
  for (let i = 0; i < courses.length; i++) {
    const id = await uploadLocal(POOL[i % POOL.length]);
    if (id) { tx.patch(courses[i]._id, (p) => p.set({ coverImage: imgField(id, courses[i].title || 'Course') })); n++; }
  }
  for (let i = 0; i < faculty.length; i++) {
    const id = await uploadPortrait(PORTRAITS[i % PORTRAITS.length]);
    if (id) { tx.patch(faculty[i]._id, (p) => p.set({ photo: imgField(id, faculty[i].name || 'Faculty portrait') })); n++; }
  }
  for (let i = 0; i < events.length; i++) {
    const id = await uploadLocal(POOL[(i + 2) % POOL.length]);
    if (id) { tx.patch(events[i]._id, (p) => p.set({ image: imgField(id, events[i].title || 'Event') })); n++; }
  }
  for (let i = 0; i < pages.length; i++) {
    const id = await uploadLocal(POOL[(i + 5) % POOL.length]);
    if (id) { tx.patch(pages[i]._id, (p) => p.set({ heroImage: imgField(id, 'The Presbyterian Academy') })); n++; }
  }

  const res = await tx.commit();
  console.log(`\nDone. Patched ${res.results?.length ?? n} documents. Rebuild (or the publish webhook) makes them live.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
