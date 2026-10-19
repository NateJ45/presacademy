// Seeds the Academy's seasonal saved sections (enrollment open, apply by, info session, term
// begins, first week, term ends, between terms, a course is full, help with the cost, Advent or
// Lent study, share with your congregation) so staff can add them to any page with "Insert a
// saved section" (the authoring kit, PORTS.md card 109; 2026-10-18).
//
// The words live in src/sanity/sectionPatterns.ts, which src/sanity/templates.test.ts checks
// (block types, keys, example markers, no em-dashes, schema limits). This script only copies them into the
// dataset, because the page builder's insert menu reads saved sections from there.
//
// What it writes: one DRAFT `sectionPreset` per pattern, id `drafts.pattern-<id>`. Drafts on
// purpose: "Add a copy" works from a draft, but "Add synced" needs a published saved section, so
// the Example text in these can never go live through a synced section.
//
// What it never does: overwrite or delete. A pattern whose draft OR published id already exists is
// skipped, so re-running it after staff have edited (or published, or renamed) one is safe.
// Nothing is replaced, so there is nothing to back up first (rule 16 covers retiring data).
//
// Dry by default. Production needs --apply AND NCS_PRODUCTION_WRITE=yes (.claude/rules/sanity-and-scripts.md).
// It imports a .ts file, so Node 22 needs the strip-types flag (Node 24 accepts it too):
//   node --experimental-strip-types scripts/seed-section-patterns.mjs
//   NCS_PRODUCTION_WRITE=yes node --experimental-strip-types scripts/seed-section-patterns.mjs --apply
// PowerShell:
//   $env:NCS_PRODUCTION_WRITE='yes'; node --experimental-strip-types scripts/seed-section-patterns.mjs --apply; Remove-Item Env:NCS_PRODUCTION_WRITE
// Verify afterwards: Content, Pages, Saved sections lists the eleven, each marked as a draft.

import { client, apply, done } from './lib/sanity-lib.mjs';
import { SECTION_PATTERNS } from '../src/sanity/sectionPatterns.ts';

const ids = SECTION_PATTERNS.map((p) => `pattern-${p.id}`);
// perspective 'raw': newer API versions read the published view by default, which hides the
// drafts this script writes, so a rerun would report them as missing.
const found = await client.withConfig({ perspective: 'raw' }).fetch('*[_id in $ids]._id', {
  ids: [...ids, ...ids.map((id) => `drafts.${id}`)],
});
const existing = new Set(found.map((id) => id.replace(/^drafts\./, '')));

let changes = 0;
for (const pattern of SECTION_PATTERNS) {
  const id = `pattern-${pattern.id}`;
  if (existing.has(id)) {
    console.log(`SKIP "${pattern.title}": already in the dataset, never overwritten.`);
    continue;
  }
  const section = pattern.sections();
  const doc = {
    _id: `drafts.${id}`,
    _type: 'sectionPreset',
    title: pattern.title,
    note: pattern.note,
    sectionType: section[0]?._type,
    section,
  };
  await apply(
    `create draft saved section "${pattern.title}" (${section.map((s) => s._type).join(', ')})`,
    () => client.createIfNotExists(doc),
  );
  changes++;
}
done(changes);
