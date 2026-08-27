#!/usr/bin/env node
// HISTORICAL, kept for the record. RAN 2026-08-26 against production. This one
// never wrote anything and still runs (it reads only `flexibleSections` and
// `emptyStateBody`, both of which survived Phase 5's cleanup on 2026-08-27); its
// eleven siblings read fields that are now gone. Kept as the record of why this
// page had nothing to convert.
// =============================================================================
// seed-builder-resources.mjs — the resources page's builder seed (2026-08-26)
// =============================================================================
// Phase 1 of docs/superpowers/plans/2026-08-26-page-builder-conversion.md gives
// every converted page a seed that writes the page's CURRENT EFFECTIVE content
// into its sections array, so the Studio mirrors the live site (decision D4:
// it only ever writes the array, never touches an existing field).
//
// Resources is the one page in Phase 1 with NOTHING to write, and that is worth
// stating out loud rather than leaving as a missing file:
//
//   - Its body has always BEEN `flexibleSections`. There is no bespoke middle to
//     port, so there are no literals to lift into a section type.
//   - Its one piece of non-section body copy is the empty state, which renders
//     only when the sections array is empty. Seeding it AS a section would make
//     it permanent (and would immediately suppress itself, since the array would
//     no longer be empty). It stays a pinned code region in resources.astro,
//     fed by the editable `emptyStateBody` field.
//
// So this script writes nothing. It reports the dataset state that justifies
// that, which is the useful thing to run before or after the conversion.
//
//   node scripts/seed-builder-resources.mjs          # report (no writes ever)
//   node scripts/seed-builder-resources.mjs --apply  # same report; still no writes
// =============================================================================
import { client, done } from './lib/sanity-lib.mjs';

const doc = await client.fetch(
  `*[_type == "resourcesPage"][0]{ _id, "sectionCount": count(flexibleSections), emptyStateBody }`,
);

if (!doc) {
  console.log('resourcesPage: no document in the dataset. Nothing to seed either way.');
} else {
  console.log(`resourcesPage: ${doc.sectionCount ?? 0} page section(s) in Sanity.`);
  console.log(
    `resourcesPage: empty state ${doc.emptyStateBody ? 'set by an editor' : 'falling back to the built-in copy'}.`,
  );
}
console.log('Nothing to seed: this page had no bespoke body to port. See the header comment.');

done(0);
