#!/usr/bin/env node
// =============================================================================
// seed-builder-about.mjs — move the About body into the page builder
// (2026-08-26, Phase 2 of the page-builder conversion)
// =============================================================================
// Writes the About page's CURRENT EFFECTIVE body into `flexibleSections` as
// four blocks, in the order the page rendered them:
//
//   1. sectionEditorialColumns (labeled)  the mission band.
//   2. sectionNumberedCards (ledger)      "What we believe" + its footnote.
//   3. sectionEditorialColumns (pair)     how we teach / why we exist.
//   4. sectionInlineBand                  the faculty signpost.
//
// "Effective" means: the Sanity field values where an editor has set them, and
// the page's built-in literals where they have not, so what the editor opens is
// what the page renders today.
//
// D4, additive: this script writes ONLY the sections array. Every
// mission*/believe*/teach*/why*/facultyBand* field stays exactly where it is, so
// reverting the page file brings the old page back with its content intact.
// Those fields get unset in the cleanup phase, with their own dry-run-first
// script.
//
// Idempotent: stable _keys throughout (each section and every card), matching
// DEFAULT_SECTIONS, so re-runs replace in place and a no-op run writes nothing.
//
//   node scripts/seed-builder-about.mjs           # dry run (default)
//   node scripts/seed-builder-about.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _keys in DEFAULT_SECTIONS (src/lib/default-sections.ts).
const KEYS = ['aboutMission', 'aboutBeliefs', 'aboutTeachWhy', 'aboutFacultyBand'];

const doc = await client.fetch(
  `*[_type == "aboutPage"][0]{
    _id,
    missionEyebrow, missionStatement, missionBody,
    believeEyebrow, believeHeadline, beliefs, believeFootnote,
    teachEyebrow, teachHeadline, teachBody,
    whyEyebrow, whyHeadline, whyBody,
    facultyBandEyebrow, facultyBandHeadline, facultyBandCtaLabel,
    flexibleSections
  }`,
);

if (!doc) {
  console.error('No aboutPage document in the dataset. Nothing to seed.');
  process.exit(1);
}

// The page's inline fallbacks, character for character.
const FALLBACK_BELIEFS = [
  {
    title: 'Scripture is our final authority',
    body: 'We read the Bible as the Word of God, trustworthy and sufficient, and we teach you to read it for yourself.',
  },
  {
    title: 'Salvation is by grace alone',
    body: 'We are saved by what God has done, not by what we achieve. That changes how we learn and how we lead.',
  },
  {
    title: 'The confessions guide us',
    body: 'We hold to the Westminster Confession and Catechisms and the PC(USA) confessional standards, taught for ordinary believers, not just scholars.',
  },
  {
    title: 'Formation is for everyone',
    body: 'The depth of the tradition belongs to the whole church, not only the ordained. That conviction is why we exist.',
  },
];

const beliefs = doc.beliefs?.length ? doc.beliefs : FALLBACK_BELIEFS;

const sections = [
  {
    _key: 'aboutMission',
    _type: 'sectionEditorialColumns',
    variant: 'labeled',
    columns: [
      {
        _key: 'mission',
        _type: 'editorialColumn',
        eyebrow: doc.missionEyebrow ?? 'Our mission',
        // In the labeled layout this is the large opening sentence, set as a
        // statement rather than a heading (the page has no heading there).
        heading:
          doc.missionStatement ??
          'We make Reformed theological formation accessible to adult lay leaders across the Presbyterian and Reformed family.',
        body:
          doc.missionBody ??
          'We are a school, not a church. We exist to equip the people who already serve: ruling elders, small-group leaders, Sunday-school teachers, and lifelong learners in PC(USA), ECO, and EPC congregations. We teach in person, in cohorts, at a pace that fits a working life.',
      },
    ],
  },
  {
    _key: 'aboutBeliefs',
    _type: 'sectionNumberedCards',
    variant: 'ledger',
    eyebrow: doc.believeEyebrow ?? 'What we believe',
    heading: doc.believeHeadline ?? 'Confessional, and warm about it',
    cards: beliefs.map((b, i) => ({
      _key: b._key ?? `belief${i + 1}`,
      _type: 'numberedCard',
      title: b.title,
      body: b.body,
    })),
    footnote:
      doc.believeFootnote ??
      'Rooted in the Westminster Standards, taught for ordinary believers. Our full statement of faith is the PC(USA) Book of Confessions.',
  },
  {
    _key: 'aboutTeachWhy',
    _type: 'sectionEditorialColumns',
    variant: 'pair',
    columns: [
      {
        _key: 'teach',
        _type: 'editorialColumn',
        eyebrow: doc.teachEyebrow ?? 'How we teach',
        heading: doc.teachHeadline ?? 'Formation, not just information',
        body:
          doc.teachBody ??
          'A course here is more than a lecture. You read real texts, you discuss them with a cohort that sticks together, and you leave able to teach what you have learned. The goal is not to make you a scholar. It is to make you a wiser, steadier leader of the people God has already given you.',
      },
      {
        _key: 'why',
        _type: 'editorialColumn',
        eyebrow: doc.whyEyebrow ?? 'Why we exist',
        heading: doc.whyHeadline ?? 'A school for the whole church',
        body:
          doc.whyBody ??
          'The Presbyterian Academy is supported by the Presbytery of Cincinnati, bringing seminary-grade teaching to lay leaders who cannot leave their jobs and families for a degree. We teach the historic Reformed faith for the people who actually lead the church: elders, teachers, small-group hosts, and the lifelong curious, taught by ministers and scholars who believe ordinary believers deserve the real thing.',
      },
    ],
  },
  {
    _key: 'aboutFacultyBand',
    _type: 'sectionInlineBand',
    eyebrow: doc.facultyBandEyebrow ?? 'The people who teach',
    headline:
      doc.facultyBandHeadline ??
      'Every course is led by an ordained minister or a credentialed Reformed scholar.',
    ctaLabel: doc.facultyBandCtaLabel ?? 'Meet the faculty',
    // The page hard-coded this link; the field exists so a future editor can
    // point the band somewhere else without a developer.
    ctaUrl: '/faculty',
  },
];

const existing = Array.isArray(doc.flexibleSections) ? doc.flexibleSections : [];
const rest = existing.filter((s) => !KEYS.includes(s?._key));
const next = [...sections, ...rest];

// Sanity returns object keys in its own order, so canonicalize (sort keys at
// every level) before comparing: the idempotency check is about VALUES.
const canonical = (v) =>
  Array.isArray(v)
    ? v.map(canonical)
    : v && typeof v === 'object'
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, canonical(v[k])]),
        )
      : v;

const unchanged = JSON.stringify(canonical(existing)) === JSON.stringify(canonical(next));

if (unchanged) {
  console.log('aboutPage: page sections already match the page body. Nothing to do.');
  done(0);
} else {
  console.log(
    `aboutPage: writing 4 sections (mission, ${beliefs.length} beliefs, teach/why pair, faculty band)` +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after them` : ''}.`,
  );
  await apply('aboutPage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
