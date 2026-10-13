// =============================================================================
// seed-course-covers.mjs: the Term Issue cover fields on the 8 seed courses
// (2026-10-13, PR 1 "cover system")
// =============================================================================
//   node scripts/seed-course-covers.mjs            (dry run: prints the plan)
//   node scripts/seed-course-covers.mjs --apply    (writes to the dataset)
//
// Sets courseCode, coverColor, coverOrnament and centralQuestion on the eight
// courses from scripts/seed-school-content.mjs, using the values from the
// approved Term Issue mockup. FILL-EMPTY ONLY: a field an editor has already
// set is never touched, so the script is idempotent and a second run reports
// 0 changes. Courses are matched by slug (so a recreated document still
// matches); a draft of a course gets the same fill-empty patch as its
// published copy, so publishing the draft later does not drop the values.
//
// The QUESTIONS ARE PLACEHOLDERS written for the mockup, not faculty copy.
// docs/PENDING.md tracks replacing them with each teacher's own question.
//
// The plan's dataset routine applies: back up, dry run, --apply, re-run (0
// changes), scripts/sanity-audit.mjs, then /rebuild. The cover renders
// without any of this (src/lib/cover.ts derives a colour and ornament), so
// running it is a content step, not a deploy dependency.
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// slug -> [code, colour, ornament, question]. Colours and ornaments are the
// values in src/lib/cover.ts; the mockup's pairing, one of each.
const COVERS = {
  'bible-one-story': ['SCR 101', 'green', 'circle', 'Is the Bible one book or sixty-six?'],
  'leading-small-group': [
    'LDR 110',
    'ink',
    'dots',
    'How do you lead a study past the easy answers?',
  ],
  'reformed-confessions': [
    'THE 120',
    'cream',
    'stripes',
    'What do Presbyterians actually believe, and why write it down?',
  ],
  'prayer-psalms': [
    'SPF 130',
    'oxblood',
    'half-moon',
    'What do you say to God when you don’t know what to say?',
  ],
  'calvin-everyday': ['THE 140', 'brass', 'cross', 'Was Calvin as grim as his reputation?'],
  'early-church-creeds': [
    'HIS 150',
    'sage',
    'ring',
    'Why did the first Christians fight so hard over a few words?',
  ],
  'preaching-gospels': [
    'PRE 160',
    'slate',
    'diagonal',
    'How do you preach a story everyone thinks they already know?',
  ],
  'story-reformation': [
    'HIS 170',
    'parchment',
    'steps',
    'What were the Reformers trying to recover?',
  ],
};
const FIELDS = ['courseCode', 'coverColor', 'coverOrnament', 'centralQuestion'];

const isEmpty = (v) => v == null || (typeof v === 'string' && v.trim() === '');

// raw perspective: see drafts alongside published documents.
const raw = client.withConfig({ perspective: 'raw' });
const docs = await raw.fetch(
  `*[_type == "course" && slug.current in $slugs]{ _id, "slug": slug.current, ${FIELDS.join(', ')} } | order(slug asc, _id asc)`,
  { slugs: Object.keys(COVERS) },
);

let changes = 0;
const found = new Set();
for (const doc of docs) {
  found.add(doc.slug);
  const values = Object.fromEntries(FIELDS.map((f, i) => [f, COVERS[doc.slug][i]]));
  const toSet = Object.fromEntries(Object.entries(values).filter(([f]) => isEmpty(doc[f])));
  const kept = FIELDS.filter((f) => !isEmpty(doc[f]));
  if (Object.keys(toSet).length === 0) {
    console.log(`--  ${doc._id}: all four cover fields already set, skipped`);
    continue;
  }
  const summary = Object.entries(toSet)
    .map(([f, v]) => `${f}=${JSON.stringify(v)}`)
    .join(', ');
  await apply(
    `${doc._id}: set ${summary}${kept.length ? ` (kept editor's ${kept.join(', ')})` : ''}`,
    () => raw.patch(doc._id).set(toSet).commit({ autoGenerateArrayKeys: false }),
  );
  changes++;
}

for (const slug of Object.keys(COVERS)) {
  if (!found.has(slug)) console.log(`!!  no course with slug "${slug}" in the dataset, skipped`);
}

done(changes);
