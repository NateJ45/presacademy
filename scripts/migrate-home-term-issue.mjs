// =============================================================================
// migrate-home-term-issue.mjs: rewrite the home page body as the Term Issue
// (2026-10-13, PR 2 "the homepage issue")
// =============================================================================
//   node scripts/migrate-home-term-issue.mjs            (dry run: prints the plan)
//   node scripts/migrate-home-term-issue.mjs --apply    (writes to the dataset)
//
// Rewrites `homePage.flexibleSections` (and the draft's, when a draft exists)
// into the issue's departments, in this order:
//
//   1. contents   sectionTermContents (new)
//   2. covers     sectionCourseRail, variant "covers", source "all" (new)
//   3. finder     sectionCourseFinder (new), answers pointed at courses by slug
//   4. faculty    the existing faculty strip, set to the "contributors" style
//   5. letters    the existing testimonials, set to the "letters" style
//   6. rates      sectionPricingTiers, surface "rates" (new)
//   7. next       sectionNextIssue (new, PR 4): the term after next + sign-up
//   8. pastors    sectionForPastors (new, PR 4): copy only. The insert PDF and
//                 the catalog link are left EMPTY (nothing invented), so the
//                 band stays hidden on the live site until Nathan adds one.
//
// PR 4 (2026-10-13) extended this script rather than adding a second one, so
// a re-run of the PR 2 shape can never strip the back page off again. On a
// home page already migrated by the PR 2 version, it only appends 7 and 8.
//
// and REMOVES everything else from the home body: the wayfinding row
// (homeWayfinding), the stat band (homeStats), the topics ticker (homeTicker)
// and the two old course rails (homeStartHere, homeCourses), which the cover
// grid replaces. It also clears any eyebrow left on the kept sections.
//
// SAFE BY CONSTRUCTION
//   - Dry run by default; --apply writes. Every change is logged.
//   - Idempotent: a section already in the target shape is left alone, so a
//     second run reports "nothing to do".
//   - An editor's wording is kept: the faculty and testimonial headings are
//     only replaced when they still hold the 2026-08-26 seed text, and a new
//     section that already exists on the page (by type and style) is reused
//     as is, not overwritten.
//   - The removed sections' data is NOT kept in the document. The revert path
//     is the backup the dataset routine takes first (plan ground rules:
//     backups/pre-term-issue-2-<date>.tar.gz), plus git: default-sections.ts
//     before this PR holds the same copy.
//
// The dataset routine (docs/PENDING.md, the plan's ground rules): backup, dry
// run, --apply, re-run (nothing to do), scripts/sanity-audit.mjs, /rebuild.
// Run it AFTER the code that renders the new sections has merged and deployed.
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

const raw = client.withConfig({ perspective: 'raw' });

const OLD_FACULTY_HEADING = 'Taught by ministers and scholars';
const OLD_TESTIMONIAL_HEADING = 'From the people we serve';

// The finder's answers, pointed at courses by SLUG (resolved to ids below).
// null = the answer suggests nothing on its own and falls back to the default.
const FINDER_Q1 = [
  ['q1a', 'Lead a study or group', 'leading-small-group'],
  ['q1b', 'Teach or preach', 'preaching-gospels'],
  ['q1c', 'Serve as an elder', 'reformed-confessions'],
  ['q1d', 'Just curious', null],
];
const FINDER_Q2 = [
  ['q2a', 'Know the Bible better', 'bible-one-story'],
  ['q2b', 'Understand what we believe', 'reformed-confessions'],
  ['q2c', 'Learn to pray', 'prayer-psalms'],
  ['q2d', 'Know our history', 'story-reformation'],
];
const FINDER_DEFAULT = 'bible-one-story';

// ---- course ids by slug (published documents only) ---------------------------
const slugs = [...new Set([...FINDER_Q1, ...FINDER_Q2].map((o) => o[2]).filter(Boolean))];
slugs.push(FINDER_DEFAULT);
const courseRows = await client.fetch(
  `*[_type == "course" && !(_id in path("drafts.**")) && slug.current in $slugs]{ _id, "slug": slug.current }`,
  { slugs },
);
const idBySlug = Object.fromEntries(courseRows.map((c) => [c.slug, c._id]));
for (const s of new Set(slugs)) {
  if (!idBySlug[s])
    console.log(`!!  no published course with slug "${s}": that answer will point nowhere`);
}
const courseRef = (slug) =>
  slug && idBySlug[slug] ? { _type: 'reference', _ref: idBySlug[slug] } : undefined;
const options = (rows) =>
  rows.map(([_key, label, slug]) => {
    const o = { _key, _type: 'finderOption', label };
    const ref = courseRef(slug);
    if (ref) o.course = ref;
    return o;
  });

// ---- the new sections, as written when the page does not have them yet -----
const NEW = {
  contents: {
    _key: 'homeContents',
    _type: 'sectionTermContents',
    heading: 'Contents',
    headingId: 'contents',
    scope: 'all',
    noteLabel: 'A note before you browse',
    note: 'Every course in this issue meets in person, in the evening, around a table. You will read real books, ask real questions, and go home with more to think about than you came with. You do not need a theology degree. You need a Bible, a free evening, and some curiosity. If cost is in the way, tell us. We would rather have you in the room.',
    signature: 'The faculty',
  },
  covers: {
    _key: 'homeCovers',
    _type: 'sectionCourseRail',
    source: 'all',
    variant: 'covers',
    heading: 'The courses',
    headingId: 'courses',
    note: 'Turn a cover over for week one',
    linkLabel: 'See the full catalog',
    linkHref: '/courses/',
  },
  finder: {
    _key: 'homeFinder',
    _type: 'sectionCourseFinder',
    kicker: 'Reply card',
    heading: 'Three questions, one course',
    headingId: 'finder',
    intro: 'Tick one answer for each. We will suggest a single place to start.',
    question1: { question: 'What do you do at church?', options: options(FINDER_Q1) },
    question2: { question: 'What do you want most right now?', options: options(FINDER_Q2) },
    question3: 'How much can you take on this term?',
    ...(courseRef(FINDER_DEFAULT) ? { defaultCourse: courseRef(FINDER_DEFAULT) } : {}),
    resultLabel: 'We suggest',
    ctaLabel: 'Express interest',
    ctaHref: '/get-started/',
  },
  faculty: {
    _key: 'homeFaculty',
    _type: 'sectionFacultyRail',
    variant: 'contributors',
    heading: 'Contributors',
    headingId: 'contributors',
    intro: 'Ordained ministers and Reformed scholars teaching in this issue.',
    limit: 4,
    linkLabel: 'Meet the faculty',
    linkHref: '/faculty/',
  },
  letters: {
    _key: 'homeTestimonials',
    _type: 'sectionTestimonialRail',
    variant: 'letters',
    heading: 'Letters',
    headingId: 'letters',
    salutation: 'To the faculty,',
    limit: 3,
  },
  rates: {
    _key: 'homeRates',
    _type: 'sectionPricingTiers',
    surface: 'rates',
    heading: 'Rates',
  },
  // PR 4: the issue's back page. Same copy as src/lib/default-sections.ts.
  next: {
    _key: 'homeNextIssue',
    _type: 'sectionNextIssue',
    kicker: 'Next issue',
    heading: '{term} is taking shape.',
    headingId: 'next-issue',
    body: 'Get the {season} issue first, plus One Question a week: one teacher, one real question, a short answer.',
    buttonLabel: 'Send it to me',
  },
  pastors: {
    _key: 'homeForPastors',
    _type: 'sectionForPastors',
    kicker: 'For pastors',
    heading: 'Take the issue to your church.',
    headingId: 'for-pastors',
    body: 'A bulletin insert for Sunday and printed catalogs for your session, in the same design as this issue.',
    insertLabel: 'Download the insert',
    catalogLabel: 'Order printed catalogs',
  },
};

/** Drop `eyebrow` (the issue retires eyebrow-everywhere). */
function withoutEyebrow(s) {
  const { eyebrow: _drop, ...rest } = s;
  return rest;
}

/** The faculty strip: the contributors style, the issue's copy where the seed's still stands. */
function toContributors(s) {
  const out = withoutEyebrow({ ...s, variant: 'contributors' });
  if (!out.heading || out.heading === OLD_FACULTY_HEADING) out.heading = NEW.faculty.heading;
  if (!out.headingId || out.headingId === 'home-faculty') out.headingId = 'contributors';
  if (!out.intro) out.intro = NEW.faculty.intro;
  if (!out.limit || out.limit === 3) out.limit = 4;
  return out;
}

/** The testimonials: the letters style, the issue's copy where the seed's still stands. */
function toLetters(s) {
  const out = withoutEyebrow({ ...s, variant: 'letters' });
  if (!out.heading || out.heading === OLD_TESTIMONIAL_HEADING) out.heading = NEW.letters.heading;
  if (!out.headingId || out.headingId === 'home-stories') out.headingId = 'letters';
  if (!out.salutation) out.salutation = NEW.letters.salutation;
  return out;
}

/** The target body for one home document, from its current sections. */
function plan(current) {
  const find = (pred) => current.find(pred);
  const contents = find((s) => s._type === 'sectionTermContents') ?? NEW.contents;
  const covers =
    find((s) => s._type === 'sectionCourseRail' && s.variant === 'covers') ?? NEW.covers;
  const finder = find((s) => s._type === 'sectionCourseFinder') ?? NEW.finder;
  const facultyNow = find((s) => s._type === 'sectionFacultyRail');
  const faculty = facultyNow ? toContributors(facultyNow) : NEW.faculty;
  const lettersNow = find((s) => s._type === 'sectionTestimonialRail');
  const letters = lettersNow ? toLetters(lettersNow) : NEW.letters;
  const rates =
    find((s) => s._type === 'sectionPricingTiers' && s.surface === 'rates') ?? NEW.rates;
  const next = find((s) => s._type === 'sectionNextIssue') ?? NEW.next;
  const pastors = find((s) => s._type === 'sectionForPastors') ?? NEW.pastors;
  return [contents, covers, finder, faculty, letters, rates, next, pastors].map(withoutEyebrow);
}

const label = (s) => `${s._key} (${s._type}${s.variant ? `/${s.variant}` : ''})`;
// Key-order-insensitive JSON, so "already done" does not depend on the order
// the API happens to return an object's fields in.
const canon = (v) =>
  Array.isArray(v)
    ? `[${v.map(canon).join(',')}]`
    : v && typeof v === 'object'
      ? `{${Object.keys(v)
          .sort()
          .map((k) => `${JSON.stringify(k)}:${canon(v[k])}`)
          .join(',')}}`
      : JSON.stringify(v);

/** Field-level differences between two versions of one section, for the log. */
function fieldDiff(before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const out = [];
  for (const k of keys) {
    const a = JSON.stringify(before[k]);
    const b = JSON.stringify(after[k]);
    if (a === b) continue;
    if (b === undefined) out.push(`unset ${k} (was ${a})`);
    else if (a === undefined) out.push(`set ${k}=${b}`);
    else out.push(`${k}: ${a} -> ${b}`);
  }
  return out;
}

// ---- run ----------------------------------------------------------------------
const docs = await raw.fetch(
  `*[_id in ["homePage", "drafts.homePage"]]{ _id, _rev, flexibleSections }`,
);
if (docs.length === 0) {
  console.log('!!  no homePage document found. Nothing to migrate.');
}

let changes = 0;
for (const doc of docs) {
  const current = doc.flexibleSections ?? [];
  const next = plan(current);
  if (canon(current) === canon(next)) {
    console.log(`--  ${doc._id}: already the Term Issue body, nothing to do`);
    continue;
  }

  console.log(`\n${doc._id}: ${current.length} section(s) now, ${next.length} after`);
  const nextKeys = new Set(next.map((s) => s._key));
  const nowByKey = Object.fromEntries(current.map((s) => [s._key, s]));
  for (const s of current) {
    if (!nextKeys.has(s._key)) console.log(`    remove  ${label(s)}`);
  }
  next.forEach((s, i) => {
    const before = nowByKey[s._key];
    if (!before) {
      console.log(`    add     #${i + 1} ${label(s)}`);
      return;
    }
    const diff = fieldDiff(before, s);
    const moved = current.indexOf(before) !== i;
    console.log(
      `    keep    #${i + 1} ${label(s)}${moved ? ` (moved from #${current.indexOf(before) + 1})` : ''}`,
    );
    for (const d of diff) console.log(`              ${d}`);
  });

  await apply(`${doc._id}: write the eight-section Term Issue body`, () =>
    raw
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({ flexibleSections: next })
      .commit({ autoGenerateArrayKeys: false }),
  );
  changes++;
}

done(changes);
