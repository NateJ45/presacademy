#!/usr/bin/env node
// =============================================================================
// seed-builder-home.mjs — move the Home body into the page builder
// (2026-08-26, Phase 4 of the page-builder conversion: the last page)
// =============================================================================
// Writes the Home page's CURRENT EFFECTIVE body into `flexibleSections` as seven
// blocks, in the order the page rendered them:
//
//   1. sectionNumberedCards (wayfinding)  the "where to begin" row.
//   2. sectionCourseRail (startHere/rail) the "Start here" rail.
//   3. sectionLedgerStats (quad)          the at-a-glance stat band.
//   4. sectionTicker                      the decorative topics marquee.
//   5. sectionCourseRail (featured/feature) the catalog preview, deduped.
//   6. sectionFacultyRail                 the faculty strip.
//   7. sectionTestimonialRail             the quotes.
//
// The split hero is NOT here. Heroes stay page-level fields (decision D2), so
// heroEyebrow/heroHeadline/heroSubhead/heroImages/the two button labels/
// nextCohortLabel are untouched and editors go on editing them where they are.
//
// "Effective" means: the Sanity field values where an editor has set them, and
// the page's built-in literals where they have not, so what the editor opens is
// what the page renders today. The CARDS are not copied into the sections at
// all: every rail fetches its own slice of the catalog, which is what the page
// did.
//
// D4, additive: this script writes ONLY the sections array. Every
// wayfinding/stats/tickerTopics/startHere*/courses*/faculty*/testimonials* field
// stays exactly where it is, so reverting the page file brings the old page back
// with its content intact. Those fields get unset in the cleanup phase, with
// their own dry-run-first script.
//
// Idempotent: stable _keys throughout (each section, each card, each stat),
// matching DEFAULT_SECTIONS, so re-runs replace in place and a no-op run writes
// nothing.
//
//   node scripts/seed-builder-home.mjs           # dry run (default)
//   node scripts/seed-builder-home.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _keys in DEFAULT_SECTIONS (src/lib/default-sections.ts).
const KEYS = [
  'homeWayfinding',
  'homeStartHere',
  'homeStats',
  'homeTicker',
  'homeCourses',
  'homeFaculty',
  'homeTestimonials',
];

const doc = await client.fetch(
  `*[_type == "homePage"][0]{
    _id,
    wayfinding,
    startHereEyebrow, startHereHeadline,
    stats,
    tickerTopics,
    coursesEyebrow, coursesHeadline, coursesLinkLabel,
    facultyEyebrow, facultyHeadline, facultyLinkLabel,
    testimonialsEyebrow, testimonialsHeadline,
    flexibleSections
  }`,
);

if (!doc) {
  console.error('No homePage document in the dataset. Nothing to seed.');
  process.exit(1);
}

// The page's inline fallbacks, character for character (HomeBody.astro).
const FALLBACK_WAYFINDING = [
  { title: 'Take a course', body: 'Browse the catalog by topic or teacher.', href: '/courses' },
  { title: 'Meet the teachers', body: 'Ordained ministers and Reformed scholars.', href: '/faculty' },
  { title: 'Find your path', body: 'A starting point for where you are now.', href: '/for-you' },
  { title: 'Start free', body: 'Sit in on a class, no commitment.', href: '/get-started' },
];

const FALLBACK_STATS = [
  { value: '100%', label: 'Ordained or credentialed faculty', count: true },
  { value: 'In person', label: 'Taught in cohorts' },
  { value: 'Need-based', label: 'Scholarships every term' },
  { value: 'Reformed', label: 'Rooted in the Westminster Standards' },
];

const FALLBACK_TOPICS = [
  'Old Testament',
  'Systematic Theology',
  'Church History',
  'Reformed Worship',
  'Biblical Greek',
  'Christian Ethics',
  'Apologetics',
  'Pastoral Care',
  'The Confessions',
  'Spiritual Formation',
];

const wayfinding = doc.wayfinding?.length ? doc.wayfinding : FALLBACK_WAYFINDING;
const stats = doc.stats?.length ? doc.stats : FALLBACK_STATS;
const topics = doc.tickerTopics?.length ? doc.tickerTopics : FALLBACK_TOPICS;

const sections = [
  {
    _key: 'homeWayfinding',
    _type: 'sectionNumberedCards',
    variant: 'wayfinding',
    // The row has no visible heading, so it is named for screen readers instead.
    // The page hard-coded this label; it is a field now so an editor can reword
    // it without a developer.
    landmarkLabel: 'Where to begin',
    cards: wayfinding.map((w, i) => ({
      _key: w._key ?? `wayfindingStep${i + 1}`,
      _type: 'numberedCard',
      title: w.title,
      body: w.body,
      href: w.href,
    })),
  },
  {
    _key: 'homeStartHere',
    _type: 'sectionCourseRail',
    source: 'startHere',
    variant: 'rail',
    eyebrow: doc.startHereEyebrow ?? 'Start here',
    heading: doc.startHereHeadline ?? 'A few courses to begin with',
    headingId: 'home-start',
    limit: 3,
    // Home narrows its grid below three courses; the Courses page never does.
    adaptiveColumns: true,
  },
  {
    _key: 'homeStats',
    _type: 'sectionLedgerStats',
    variant: 'quad',
    landmarkLabel: 'The Academy at a glance',
    items: stats.map((s, i) => ({
      _key: s._key ?? `stat${i + 1}`,
      _type: 'ledgerStat',
      value: s.value,
      label: s.label,
      count: s.count ?? false,
    })),
  },
  {
    _key: 'homeTicker',
    _type: 'sectionTicker',
    topics,
  },
  {
    _key: 'homeCourses',
    _type: 'sectionCourseRail',
    source: 'featured',
    variant: 'feature',
    eyebrow: doc.coursesEyebrow ?? 'Courses',
    heading: doc.coursesHeadline ?? 'Learn something worth knowing',
    headingId: 'home-courses',
    limit: 6,
    linkLabel: doc.coursesLinkLabel ?? 'See all courses',
    // The page hard-coded these two links; the fields exist so a future editor
    // can point them elsewhere without a developer.
    linkHref: '/courses',
    // So the same course card never appears in both rails.
    dedupeAgainstStartHere: true,
  },
  {
    _key: 'homeFaculty',
    _type: 'sectionFacultyRail',
    eyebrow: doc.facultyEyebrow ?? 'The faculty',
    heading: doc.facultyHeadline ?? 'Taught by ministers and scholars',
    headingId: 'home-faculty',
    limit: 3,
    linkLabel: doc.facultyLinkLabel ?? 'Meet the faculty',
    linkHref: '/faculty',
  },
  {
    _key: 'homeTestimonials',
    _type: 'sectionTestimonialRail',
    eyebrow: doc.testimonialsEyebrow ?? 'In their words',
    heading: doc.testimonialsHeadline ?? 'From the people we serve',
    headingId: 'home-stories',
    limit: 3,
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
  console.log('homePage: page sections already match the page body. Nothing to do.');
  done(0);
} else {
  console.log(
    `homePage: writing 7 sections (${wayfinding.length} wayfinding cells, the Start-here rail, ` +
      `${stats.length} stats, ${topics.length} ticker topics, the catalog preview, the faculty ` +
      `strip, the quotes)` +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after them` : ''}.`,
  );
  await apply('homePage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
