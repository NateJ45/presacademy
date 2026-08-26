#!/usr/bin/env node
// =============================================================================
// seed-builder-privacy.mjs — move the privacy body into the page builder
// (2026-08-26, Phase 1 of the page-builder conversion)
// =============================================================================
// Writes the privacy page's CURRENT EFFECTIVE body into `flexibleSections` as a
// single `sectionLegalBody` block, so the Studio mirrors the live site.
//
// "Effective" means: the Sanity field values where an editor has set them, and
// the page's built-in literals where they have not. Here that is the `body`
// Portable Text and the `lastUpdated` date, both of which the editor already
// owns; the built-in policy copy stays in the component as its no-content
// fallback (it is markup, not data, and seeding it would freeze it).
//
// D4, additive: this script writes ONLY the sections array. `body` and
// `lastUpdated` stay exactly where they are, so reverting the page file brings
// the old page back with its content intact. The old fields get unset in the
// cleanup phase, with their own dry-run-first script.
//
// Idempotent: the block carries a stable _key, so a re-run replaces it in place
// instead of appending a second copy, and a run that would change nothing says
// so and writes nothing.
//
//   node scripts/seed-builder-privacy.mjs           # dry run (default)
//   node scripts/seed-builder-privacy.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _key in DEFAULT_SECTIONS (src/lib/default-sections.ts) so the
// seeded document and the code fallback describe the same section.
const KEY = 'privacyBody';

const doc = await client.fetch(
  `*[_type == "privacyPage"][0]{ _id, lastUpdated, body, flexibleSections }`,
);

if (!doc) {
  console.error('No privacyPage document in the dataset. Nothing to seed.');
  process.exit(1);
}

const section = {
  _key: KEY,
  _type: 'sectionLegalBody',
  // Read aloud for this landmark. It MUST differ from the hero h1 ("Privacy
  // Policy") or axe flags two regions with the same accessible name.
  landmarkLabel: 'Privacy policy contents',
  dateLabel: 'Last updated',
  ...(doc.lastUpdated ? { lastUpdated: doc.lastUpdated } : {}),
  ...(doc.body?.length ? { body: doc.body } : {}),
  // The safety net if an editor ever empties the body.
  fallbackStatement: 'privacy',
};

const existing = Array.isArray(doc.flexibleSections) ? doc.flexibleSections : [];
const rest = existing.filter((s) => s?._key !== KEY);
const next = [section, ...rest];

// Sanity returns object keys in its own order, so a plain JSON.stringify
// comparison reports "changed" on every re-run. Canonicalize first (sort keys
// at every level) so the idempotency check is about VALUES.
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
  console.log('privacyPage: page sections already match the page body. Nothing to do.');
  done(0);
} else {
  console.log(
    `privacyPage: writing 1 legal body section` +
      `${doc.body?.length ? ` (${doc.body.length} rich-text blocks)` : ' (no body: the built-in policy will render)'}` +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after it` : ''}.`,
  );
  await apply('privacyPage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
