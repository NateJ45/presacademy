// Seed the built-in page copy into Sanity so Studio mirrors the live site.
//
//   node scripts/seed-page-copy.mjs            (dry run: shows what would be set)
//   node scripts/seed-page-copy.mjs --apply    (patch the docs)
//
// For the re-schematized page singletons (home, about), this writes the current
// inline-fallback copy from the .astro pages into any EMPTY field, so an editor
// opening the page in Studio sees the live wording instead of a blank field.
// It ONLY fills empty fields — it never clobbers copy an editor has already
// changed — and it is idempotent (re-running does nothing once fields are set).
// Run it once after deploying the new home/about schema (npm run studio:deploy).

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
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env');
  process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: '2024-08-01', useCdn: false });

// Add a stable _key (+ _type) to each object in an array, as Sanity requires.
const keyed = (type, items) => items.map((o, i) => ({ _type: type, _key: `${type}${i + 1}`, ...o }));

// ---- The built-in copy, mirroring the fallbacks in index.astro / about.astro ----
const HOME = {
  heroEyebrow: 'The Presbyterian Academy',
  heroHeadline: 'Theological depth, taught for ordinary believers.',
  heroSubhead:
    'Reformed formation for the people who actually lead the church: elders, teachers, small-group hosts, and the lifelong curious. In person, in cohorts, at a pace that fits a working life.',
  heroPrimaryLabel: 'Browse courses',
  heroSecondaryLabel: 'Book a free intro',
  nextCohortLabel: 'Next cohort begins',
  wayfinding: keyed('wayfindingStep', [
    { title: 'Take a course', body: 'Browse the catalog by topic or teacher.', href: '/courses' },
    { title: 'Meet the teachers', body: 'Ordained ministers and Reformed scholars.', href: '/faculty' },
    { title: 'Find your path', body: 'A starting point for where you are now.', href: '/for-you' },
    { title: 'Start free', body: 'Sit in on a class, no commitment.', href: '/get-started' },
  ]),
  startHereEyebrow: 'Start here',
  startHereHeadline: 'A few courses to begin with',
  stats: keyed('stat', [
    { value: '100%', label: 'Ordained or credentialed faculty', count: true },
    { value: 'In person', label: 'Taught in cohorts', count: false },
    { value: 'Need-based', label: 'Scholarships every term', count: false },
    { value: 'Reformed', label: 'Rooted in the Westminster Standards', count: false },
  ]),
  tickerTopics: [
    'Old Testament', 'Systematic Theology', 'Church History', 'Reformed Worship',
    'Biblical Greek', 'Christian Ethics', 'Apologetics', 'Pastoral Care',
    'The Confessions', 'Spiritual Formation',
  ],
  coursesEyebrow: 'Courses',
  coursesHeadline: 'Learn something worth knowing',
  coursesLinkLabel: 'See all courses',
  facultyEyebrow: 'The faculty',
  facultyHeadline: 'Taught by ministers and scholars',
  facultyLinkLabel: 'Meet the faculty',
  testimonialsEyebrow: 'In their words',
  testimonialsHeadline: 'From the people we serve',
  finalCtaEyebrow: 'Begin your formation',
  finalCtaHeadline: 'Tell us what you want to learn',
  finalCtaSubhead:
    'We will help you find the right course, point you to a free intro, and answer any question. No application fee, no pressure.',
};

const ABOUT = {
  heroEyebrow: 'About the Academy',
  heroHeadline: 'Reformed formation, for the whole church',
  heroSubhead:
    'The Presbyterian Academy teaches the depth of the Reformed tradition to the people who carry the church day to day: elders, teachers, leaders, and ordinary believers who want to know God better.',
  missionEyebrow: 'Our mission',
  missionStatement:
    'We make Reformed theological formation accessible to adult lay leaders across the Presbyterian and Reformed family.',
  missionBody:
    'We are a school, not a church. We exist to equip the people who already serve: ruling elders, small-group leaders, Sunday-school teachers, and lifelong learners in PC(USA), ECO, and EPC congregations. We teach in person, in cohorts, at a pace that fits a working life.',
  believeEyebrow: 'What we believe',
  believeHeadline: 'Confessional, and warm about it',
  beliefs: keyed('belief', [
    { title: 'Scripture is our final authority', body: 'We read the Bible as the Word of God, trustworthy and sufficient, and we teach you to read it for yourself.' },
    { title: 'Salvation is by grace alone', body: 'We are saved by what God has done, not by what we achieve. That changes how we learn and how we lead.' },
    { title: 'The confessions guide us', body: 'We hold to the Westminster Confession and Catechisms and the PC(USA) confessional standards, taught for ordinary believers, not just scholars.' },
    { title: 'Formation is for everyone', body: 'The depth of the tradition belongs to the whole church, not only the ordained. That conviction is why we exist.' },
  ]),
  believeFootnote:
    'Rooted in the Westminster Standards, taught for ordinary believers. Our full statement of faith is the PC(USA) Book of Confessions.',
  teachEyebrow: 'How we teach',
  teachHeadline: 'Formation, not just information',
  teachBody:
    'A course here is more than a lecture. You read real texts, you discuss them with a cohort that sticks together, and you leave able to teach what you have learned. The goal is not to make you a scholar. It is to make you a wiser, steadier leader of the people God has already given you.',
  whyEyebrow: 'Why we exist',
  whyHeadline: 'A school for the whole church',
  whyBody:
    'The Presbyterian Academy is supported by the Presbytery of Cincinnati, bringing seminary-grade teaching to lay leaders who cannot leave their jobs and families for a degree. We teach the historic Reformed faith for the people who actually lead the church: elders, teachers, small-group hosts, and the lifelong curious, taught by ministers and scholars who believe ordinary believers deserve the real thing.',
  facultyBandEyebrow: 'The people who teach',
  facultyBandHeadline: 'Every course is led by an ordained minister or a credentialed Reformed scholar.',
  facultyBandCtaLabel: 'Meet the faculty',
  finalCtaEyebrow: 'Ready to learn?',
  finalCtaHeadline: 'Find a course to begin',
  finalCtaSubhead: 'Browse the catalog, meet the teachers, and start when you are ready.',
};

const isEmpty = (v) =>
  v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

async function seedDoc(type, fields) {
  const existing = await client.fetch(`*[_type == $type][0]`, { type });
  if (!existing) {
    console.warn(`  (no ${type} document found — skipping)`);
    return 0;
  }
  const toSet = {};
  for (const [k, v] of Object.entries(fields)) {
    if (isEmpty(existing[k])) toSet[k] = v;
  }
  const keys = Object.keys(toSet);
  console.log(`  ${type} (${existing._id}): ${keys.length} empty field(s)${keys.length ? ` -> ${keys.join(', ')}` : ''}`);
  if (APPLY && keys.length) await client.patch(existing._id).set(toSet).commit();
  return keys.length;
}

async function main() {
  console.log(`Seeding page copy -> ${projectId}/${dataset}  (${APPLY ? 'APPLY' : 'dry run'})\n`);
  let n = 0;
  n += await seedDoc('homePage', HOME);
  n += await seedDoc('aboutPage', ABOUT);
  console.log(`\n${APPLY ? 'Patched' : 'Would patch'} ${n} field(s) total.${APPLY ? '' : '  Re-run with --apply to write.'}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
