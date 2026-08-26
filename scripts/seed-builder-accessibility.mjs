#!/usr/bin/env node
// =============================================================================
// seed-builder-accessibility.mjs — move the accessibility body into the builder
// (2026-08-26, Phase 1 of the page-builder conversion)
// =============================================================================
// Privacy's twin. See scripts/seed-builder-privacy.mjs for the full reasoning;
// the only differences here are the landmark label ("Accessibility statement")
// and the date wording ("Last reviewed"), which is exactly how the two pages
// differed before they converted.
//
// D4, additive: writes ONLY the sections array. `body` and `lastUpdated` stay
// where they are, so reverting the page file brings the old page back intact.
//
//   node scripts/seed-builder-accessibility.mjs           # dry run (default)
//   node scripts/seed-builder-accessibility.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _key in DEFAULT_SECTIONS (src/lib/default-sections.ts).
const KEY = 'accessibilityBody';

const doc = await client.fetch(
  `*[_type == "accessibilityPage"][0]{ _id, lastUpdated, body, flexibleSections }`,
);

if (!doc) {
  console.error('No accessibilityPage document in the dataset. Nothing to seed.');
  process.exit(1);
}

const section = {
  _key: KEY,
  _type: 'sectionLegalBody',
  // Must differ from the hero h1 ("Accessibility") or axe flags two regions
  // with the same accessible name.
  landmarkLabel: 'Accessibility statement',
  dateLabel: 'Last reviewed',
  ...(doc.lastUpdated ? { lastUpdated: doc.lastUpdated } : {}),
  ...(doc.body?.length ? { body: doc.body } : {}),
  fallbackStatement: 'accessibility',
};

const existing = Array.isArray(doc.flexibleSections) ? doc.flexibleSections : [];
const rest = existing.filter((s) => s?._key !== KEY);
const next = [section, ...rest];

// Sanity returns object keys in its own order, so canonicalize before comparing
// or every re-run would look like a change.
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
  console.log('accessibilityPage: page sections already match the page body. Nothing to do.');
  done(0);
} else {
  console.log(
    `accessibilityPage: writing 1 legal body section` +
      `${doc.body?.length ? ` (${doc.body.length} rich-text blocks)` : ' (no body: the built-in statement will render)'}` +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after it` : ''}.`,
  );
  await apply('accessibilityPage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
