#!/usr/bin/env node
// =============================================================================
// seed-builder-get-started.mjs — move the Get Started body into the builder
// (2026-08-26, Phase 2 of the page-builder conversion)
// =============================================================================
// Writes two blocks into the Get Started page's `flexibleSections`:
//
//   1. sectionRequestPanel  the express-interest form (the SAME form document
//      the page referenced) beside the intro-call panel.
//   2. sectionNumberedCards on its "steps" style: what happens next.
//
// The booking link is copied only when the page document actually carries one.
// Left empty, the block falls through to the PUBLIC_CALENDLY_URL build variable
// and then to a mailto, which is the behavior the page had.
//
// D4, additive: request*/calendly*/visitClass/syllabus/steps and the
// requestForm reference all stay exactly where they are.
//
// Idempotent: stable _keys, matching DEFAULT_SECTIONS.
//
//   node scripts/seed-builder-get-started.mjs           # dry run (default)
//   node scripts/seed-builder-get-started.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _keys in DEFAULT_SECTIONS (src/lib/default-sections.ts).
const KEYS = ['getStartedRequest', 'getStartedSteps'];

const doc = await client.fetch(
  `*[_type == "getStartedPage"][0]{
    _id, requestEyebrow, requestHeadline, requestBody,
    calendlyEyebrow, calendlyHeadline, calendlyBody, calendlyUrl,
    visitClassBody, syllabusBody, stepsHeadline, steps,
    "formRef": requestForm._ref,
    flexibleSections
  }`,
);

if (!doc) {
  console.error('No getStartedPage document in the dataset. Nothing to seed.');
  process.exit(1);
}

// The page's inline fallbacks, character for character.
const FALLBACK_STEPS = [
  { title: 'You tell us a little', body: 'A short form, just enough for us to point you in the right direction.' },
  { title: 'We reply, person to person', body: 'A real teacher or staff member answers your questions within a few days.' },
  { title: 'You try before you decide', body: 'Sit in on a class or book a free intro. Enroll only when you are ready.' },
];

const steps = doc.steps?.length ? doc.steps : FALLBACK_STEPS;

const sections = [
  {
    _key: 'getStartedRequest',
    _type: 'sectionRequestPanel',
    requestEyebrow: doc.requestEyebrow ?? 'Request information',
    requestHeadline: doc.requestHeadline ?? 'Ask us anything',
    requestBody:
      doc.requestBody ??
      'Tell us what you are hoping to learn and we will help you find the right course.',
    calendlyEyebrow: doc.calendlyEyebrow ?? 'Or talk to us first',
    calendlyHeadline: doc.calendlyHeadline ?? 'Book a free intro session',
    calendlyBody:
      doc.calendlyBody ?? 'A short, no-pressure conversation about where you are and what fits.',
    visitClassBody:
      doc.visitClassBody ??
      'You are welcome to sit in on the first session of any course, free, before you decide.',
    syllabusBody:
      doc.syllabusBody ??
      'Every course page has a downloadable syllabus, so you can see exactly what a term covers.',
    ...(doc.calendlyUrl ? { calendlyUrl: doc.calendlyUrl } : {}),
    ...(doc.formRef ? { form: { _type: 'reference', _ref: doc.formRef } } : {}),
  },
  {
    _key: 'getStartedSteps',
    _type: 'sectionNumberedCards',
    variant: 'steps',
    // In the steps style the eyebrow IS the band's heading line, which is what
    // the page's stepsHeadline field rendered as.
    eyebrow: doc.stepsHeadline ?? 'What happens next',
    cards: steps.map((s, i) => ({
      _key: s._key ?? `step${i + 1}`,
      _type: 'numberedCard',
      title: s.title,
      ...(s.body ? { body: s.body } : {}),
    })),
  },
];

const existing = Array.isArray(doc.flexibleSections) ? doc.flexibleSections : [];
const rest = existing.filter((s) => !KEYS.includes(s?._key));
const next = [...sections, ...rest];

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
  console.log('getStartedPage: page sections already match the page body. Nothing to do.');
  done(0);
} else {
  console.log(
    `getStartedPage: writing 2 sections (request panel${doc.formRef ? " with the page's form" : ' with no form: the email button renders'}, ${steps.length} steps)` +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after them` : ''}.`,
  );
  await apply('getStartedPage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
