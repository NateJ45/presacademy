#!/usr/bin/env node
// =============================================================================
// seed-builder-courses.mjs — move the Courses body into the page builder
// (2026-08-26, Phase 3 of the page-builder conversion)
// =============================================================================
// Writes the Courses page's one convertible band into `flexibleSections`:
//
//   1. sectionCourseRail, source "startHere" — the "Start here" rail. It pulls
//      the flagged courses from the catalog itself, so it carries no cards, only
//      the eyebrow, the heading, the anchor id the page already used, and the
//      three-card cap the page applied with `.slice(0, 3)`.
//
// The CATALOG below it is NOT seeded and never will be: the filter island, its
// facet counting and its empty state stay code (the plan's "Stays code,
// deliberately"), rendered through SingletonPage's pinned slot. Faculty has no
// seed at all for the same reason: its body is entirely the roster.
//
// "Effective" means: the Sanity field values where an editor has set them, and
// the page's built-in literals where they have not, so what the editor opens is
// what the page renders today.
//
// D4, additive: this script writes ONLY the sections array. `startHereEyebrow`,
// `startHereHeadline` and `emptyState` stay exactly where they are, so
// reverting the page file brings the old page back with its content intact.
// (`emptyState` is still read by the live page: the catalog that uses it is
// still code.) Those fields get unset in the cleanup phase, with their own
// dry-run-first script.
//
// Idempotent: the block carries a stable _key (the same one DEFAULT_SECTIONS
// uses), so a re-run replaces it in place instead of appending a copy, and a run
// that would change nothing says so and writes nothing.
//
//   node scripts/seed-builder-courses.mjs           # dry run (default)
//   node scripts/seed-builder-courses.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _key in DEFAULT_SECTIONS (src/lib/default-sections.ts) so the
// seeded document and the code fallback describe the same section.
const KEYS = ['coursesStartHere'];

const doc = await client.fetch(
  `*[_type == "coursesPage"][0]{
    _id, startHereEyebrow, startHereHeadline, flexibleSections
  }`,
);

if (!doc) {
  console.error('No coursesPage document in the dataset. Nothing to seed.');
  process.exit(1);
}

const sections = [
  {
    _key: 'coursesStartHere',
    _type: 'sectionCourseRail',
    source: 'startHere',
    variant: 'rail',
    eyebrow: doc.startHereEyebrow ?? 'Start here',
    heading: doc.startHereHeadline ?? 'New to the Academy? Begin with these.',
    // The landmark id the page's <section aria-labelledby> already used, so
    // anchors and screen-reader labels keep working.
    headingId: 'start-here',
    // The page's `.slice(0, 3)`.
    limit: 3,
    // Deliberately NOT set: `adaptiveColumns` (the Courses grid has always been
    // a fixed three columns, unlike home's rail) and `dedupeAgainstStartHere`
    // (there is only one rail on this page).
  },
];

const existing = Array.isArray(doc.flexibleSections) ? doc.flexibleSections : [];
const rest = existing.filter((s) => !KEYS.includes(s?._key));
const next = [...sections, ...rest];

// Sanity returns object keys in its own order, so a plain JSON.stringify
// comparison reports "changed" on every re-run. Canonicalize first (sort keys at
// every level) so the idempotency check is about VALUES.
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
  console.log('coursesPage: page sections already match the page body. Nothing to do.');
  done(0);
} else {
  console.log(
    'coursesPage: writing 1 section (the "Start here" rail)' +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after it` : ''}.`,
  );
  await apply('coursesPage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
