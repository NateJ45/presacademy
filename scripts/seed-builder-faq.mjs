#!/usr/bin/env node
// HISTORICAL, kept for the record. RAN 2026-08-26 against production. The
// singleton fields this script reads were unset in Phase 5 (2026-08-27) by
// scripts/cleanup-builder-fields.mjs and removed from the schemas, so re-running
// it now is a no-op or an error by design. It stays in the tree because it is
// the record of how this page's content moved into the page builder.
// =============================================================================
// seed-builder-faq.mjs — move the FAQ body into the page builder
// (2026-08-26, Phase 2 of the page-builder conversion)
// =============================================================================
// Writes ONE `sectionFaqGrouped` block into the FAQ page's `flexibleSections`.
// The block is an auto section: it pulls every question from the faqItem
// collection itself, so the only thing to carry over is the page's category
// ORDER and the section's screen-reader label.
//
// D4, additive: the singleton's own `categoryOrder` field stays exactly where it
// is, so reverting the page file brings the old page back working. It gets unset
// in the cleanup phase, with its own dry-run-first script.
//
// Idempotent: stable _key, matching DEFAULT_SECTIONS.
//
//   node scripts/seed-builder-faq.mjs           # dry run (default)
//   node scripts/seed-builder-faq.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _key in DEFAULT_SECTIONS (src/lib/default-sections.ts).
const KEY = 'faqGrouped';

const doc = await client.fetch(
  `*[_type == "faqPage"][0]{ _id, categoryOrder, flexibleSections }`,
);

if (!doc) {
  console.error('No faqPage document in the dataset. Nothing to seed.');
  process.exit(1);
}

const section = {
  _key: KEY,
  _type: 'sectionFaqGrouped',
  // Read aloud for this landmark. It MUST differ from the hero h1 or axe flags
  // two regions with the same accessible name.
  landmarkLabel: 'Frequently asked questions',
  // Only when the editor has actually set one: an empty array here would look
  // like a deliberate "no categories" and the block's own default order is the
  // behavior the page had.
  ...(doc.categoryOrder?.length ? { categoryOrder: doc.categoryOrder } : {}),
};

const existing = Array.isArray(doc.flexibleSections) ? doc.flexibleSections : [];
const rest = existing.filter((s) => s?._key !== KEY);
const next = [section, ...rest];

// Sort keys at every level before comparing: Sanity returns its own key order,
// and the idempotency check is about VALUES.
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
  console.log('faqPage: page sections already match the page body. Nothing to do.');
  done(0);
} else {
  console.log(
    `faqPage: writing 1 grouped FAQ section` +
      `${doc.categoryOrder?.length ? ` (${doc.categoryOrder.length} categories in the editor's order)` : ' (using the built-in category order)'}` +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after it` : ''}.`,
  );
  await apply('faqPage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
