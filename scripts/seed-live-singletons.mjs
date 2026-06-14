// POST-MERGE live-content gate. Creates/sets the core page singletons
// (siteSettings, homePage, aboutPage, faqPage) with school copy, so the LIVE
// site renders the Academy content (not just the .astro fallbacks) and editors
// see school copy in Studio. These core singletons do not exist in the dataset
// yet, so this uses createOrReplace.
//
// RUN THIS ONLY AFTER the revamp branch is merged to main. The publish webhook
// rebuilds main on any content change.
//
//   node scripts/seed-live-singletons.mjs            (dry run: lists the docs)
//   node scripts/seed-live-singletons.mjs --apply    (writes to the dataset)
//
// Copy follows docs/brand/voice.md (no em-dashes, warm + plainspoken).

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

const docs = [
  {
    _id: 'siteSettings', _type: 'siteSettings',
    title: 'The Presbyterian Academy',
    tagline: 'Reformed theological formation for everyday leaders.',
    mission: 'We make Reformed theological formation accessible to adult lay leaders across the Presbyterian and Reformed family.',
    email: 'info@presbyterianacademy.org',
    officeHours: 'Monday to Thursday, 9am to 4pm',
    addressLine: '9463 Cincinnati Columbus Rd',
    cityStateZip: 'West Chester Township, OH 45069',
    denominationStatement: 'A PC(USA) school of theological formation, holding to the Westminster Standards and the Book of Confessions.',
    admissionsEmail: 'info@presbyterianacademy.org',
    newsletter: {
      enabled: true,
      heading: 'Stay in the loop',
      blurb: 'Occasional notes on new courses, open lectures, and term dates. No spam.',
      buttonLabel: 'Subscribe',
      successMessage: 'Thank you. You are on the list.',
      consentNote: 'We will never share your email.',
    },
  },
  {
    _id: 'homePage', _type: 'homePage',
    heroEyebrow: 'The Presbyterian Academy',
    heroHeadline: 'Theological depth, taught for ordinary believers.',
    heroSubhead: 'Reformed formation for the people who actually lead the church: elders, teachers, small-group hosts, and the lifelong curious. In person, in cohorts, at a pace that fits a working life.',
    seoTitle: 'The Presbyterian Academy — Reformed lay formation',
    seoDescription: 'A PC(USA) Reformed school of theological formation for adult lay leaders. Courses taught in person, in cohorts, by ministers and scholars.',
    finalCtaEyebrow: 'Begin your formation',
    finalCtaHeadline: 'Tell us what you want to learn',
    finalCtaSubhead: 'We will help you find the right course, point you to a free intro, and answer any question. No application fee, no pressure.',
  },
  {
    _id: 'aboutPage', _type: 'aboutPage',
    heroEyebrow: 'About the Academy',
    heroHeadline: 'Reformed formation, for the whole church',
    heroSubhead: 'The Presbyterian Academy teaches the depth of the Reformed tradition to the people who carry the church day to day: elders, teachers, leaders, and ordinary believers who want to know God better.',
    seoTitle: 'About — The Presbyterian Academy',
    seoDescription: 'A PC(USA) Reformed school of theological formation for adult lay leaders. What we believe, how we teach, and why.',
  },
  {
    _id: 'faqPage', _type: 'faqPage',
    heroEyebrow: 'Common questions',
    heroHeadline: 'Everything you want to know',
    categoryOrder: ['Courses & Format', 'Cost & Scholarships', "Who It's For", 'Reformed Identity', 'Getting Started'],
  },
];

console.log(`Live singletons (${docs.length}):`);
for (const d of docs) console.log(`  ${d._type}`);

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply (POST-MERGE only) to write to the dataset.');
  process.exit(0);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
const tx = docs.reduce((t, d) => t.createOrReplace(d), client.transaction());
const res = await tx.commit();
console.log(`\nWrote ${docs.length} live singletons. Transaction ${res.transactionId}.`);
