// POST-MERGE live-content gate. Flips the live page singletons (siteSettings,
// homePage, aboutPage, faqPage) from church/empty values to school copy, so the
// LIVE site renders the Academy content (not just the .astro fallbacks) and
// editors see school copy in Studio.
//
// RUN THIS ONLY AFTER the revamp branch is merged to main. The publish webhook
// rebuilds main on any content change; running it before merge would rebuild the
// CURRENT (church-code) live site with school content and look broken.
//
//   node scripts/seed-live-singletons.mjs            (dry run: lists the patches)
//   node scripts/seed-live-singletons.mjs --apply    (writes to the dataset)
//
// Uses patch.set/.unset (not createOrReplace) so it only touches the named
// fields and clears the retired church ones, leaving nav/footer/newsletter
// config untouched. Copy follows docs/brand/voice.md (no em-dashes).

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const env = Object.fromEntries(
  readFileSync(resolve(root, '.env'), 'utf-8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; }),
);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
const token = env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env');
  process.exit(1);
}

// Each entry: which singleton, the fields to set, and the church fields to clear.
const patches = [
  {
    id: 'siteSettings',
    set: {
      tagline: 'Reformed theological formation for everyday leaders.',
      mission: 'We make Reformed theological formation accessible to adult lay leaders across the Presbyterian and Reformed family.',
      denominationStatement: 'A PC(USA) school of theological formation, holding to the Westminster Standards and the Book of Confessions.',
      admissionsEmail: 'info@presbyterianacademy.org',
      officeHours: 'Monday to Thursday, 9am to 4pm',
    },
    unset: ['worshipService', 'watchUrl', 'giveUrl', 'appUrl', 'directoryUrl', 'prayerUrl', 'pastorEmail'],
  },
  {
    id: 'homePage',
    set: {
      heroEyebrow: 'The Presbyterian Academy',
      heroHeadline: 'Theological depth, taught for ordinary believers.',
      heroSubhead: 'Reformed formation for the people who actually lead the church: elders, teachers, small-group hosts, and the lifelong curious. In person, in cohorts, at a pace that fits a working life.',
      seoTitle: 'The Presbyterian Academy — Reformed lay formation',
      seoDescription: 'A PC(USA) Reformed school of theological formation for adult lay leaders. Courses taught in person, in cohorts, by ministers and scholars.',
      finalCtaEyebrow: 'Begin your formation',
      finalCtaHeadline: 'Tell us what you want to learn',
      finalCtaSubhead: 'We will help you find the right course, point you to a free intro, and answer any question. No application fee, no pressure.',
    },
    unset: ['thisSunday', 'seasonalHero', 'serviceBand', 'weeklyRhythms'],
  },
  {
    id: 'aboutPage',
    set: {
      heroEyebrow: 'About the Academy',
      heroHeadline: 'Reformed formation, for the whole church',
      heroSubhead: 'The Presbyterian Academy teaches the depth of the Reformed tradition to the people who carry the church day to day: elders, teachers, leaders, and ordinary believers who want to know God better.',
      seoTitle: 'About — The Presbyterian Academy',
      seoDescription: 'A PC(USA) Reformed school of theological formation for adult lay leaders. What we believe, how we teach, and why.',
    },
    unset: [],
  },
  {
    id: 'faqPage',
    set: {
      categoryOrder: ['Courses & Format', 'Cost & Scholarships', "Who It's For", 'Reformed Identity', 'Getting Started'],
      heroEyebrow: 'Common questions',
      heroHeadline: 'Everything you want to know',
    },
    unset: [],
  },
];

console.log(`Live-singleton patches (${patches.length}):`);
for (const p of patches) {
  console.log(`  ${p.id}  set: ${Object.keys(p.set).join(', ')}${p.unset.length ? `  unset: ${p.unset.join(', ')}` : ''}`);
}

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply (POST-MERGE only) to write to the dataset.');
  process.exit(0);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
let tx = client.transaction();
for (const p of patches) {
  let patch = client.patch(p.id).set(p.set);
  if (p.unset.length) patch = patch.unset(p.unset);
  tx = tx.patch(patch);
}
const res = await tx.commit();
console.log(`\nPatched ${patches.length} singletons. Transaction ${res.transactionId}.`);
