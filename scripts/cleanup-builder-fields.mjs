#!/usr/bin/env node
// =============================================================================
// cleanup-builder-fields.mjs — the PHASE 5 ARTIFACT of the page-builder
// conversion (2026-08-26 plan, run 2026-08-27)
// =============================================================================
// Unsets the singleton fields the conversion superseded. Every value listed
// below now lives inside a `flexibleSections` block on the same document (the
// seed-builder-*.mjs scripts put it there in Phases 1 through 4), and no
// renderer reads the old field any more. This is the ONLY sanctioned way to
// remove that data: never the Studio's "Remove field" button, which wipes a
// field across every document and cannot be undone without a dataset restore
// (CLAUDE.md gotcha #1).
//
// WHAT IS NOT HERE, deliberately:
//   - every hero* field, every finalCta* field, every seo* field, slug/title;
//   - fields a renderer still reads: pricingPage.pricingIntro,
//     forYouPage.personasIntro, resourcesPage.listIntro (the hero map's
//     `introField`), facultyPage.aggregateTrustLine (the hero map's trust
//     line), coursesPage.emptyState + facultyPage.emptyState (the pinned code
//     regions), resourcesPage.emptyStateBody (the pinned zero state),
//     coursesPage.detail* (the course detail route), eventsPage.detailFinalCta*
//     (the event detail route);
//   - pre-existing orphans the CONVERSION did not create (coursesPage
//     .catalogIntro, facultyPage.directoryIntro, eventsPage.specialEyebrow /
//     .specialHeadline, faqPage.finalCtaScriptAccent / .secondaryCta / .note,
//     contactPage.note). They were unread before this work started, so they are
//     a separate decision, not this script's business.
//
// SAFETY: a document is skipped entirely unless its `flexibleSections` array is
// non-empty. That is the check that its content was actually migrated, made
// against the live dataset rather than trusted from the notes.
//
// Idempotent: unsetting an absent field is a no-op, and a second run reports
// nothing left to do.
//
//   node scripts/cleanup-builder-fields.mjs           # dry run (default)
//   node scripts/cleanup-builder-fields.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Superseded field → the section type that now carries its value.
const PLAN = {
  homePage: {
    // Phase 4. The wayfinding ledger, the stat band, the ticker, and the copy
    // around the four rails.
    fields: [
      'wayfinding',
      'stats',
      'tickerTopics',
      'startHereEyebrow',
      'startHereHeadline',
      'coursesEyebrow',
      'coursesHeadline',
      'coursesLinkLabel',
      'facultyEyebrow',
      'facultyHeadline',
      'facultyLinkLabel',
      'testimonialsEyebrow',
      'testimonialsHeadline',
    ],
  },
  aboutPage: {
    // Phase 2. Mission, the beliefs ledger, the teach/why pair, the faculty band.
    fields: [
      'missionEyebrow',
      'missionStatement',
      'missionBody',
      'believeEyebrow',
      'believeHeadline',
      'beliefs',
      'believeFootnote',
      'teachEyebrow',
      'teachHeadline',
      'teachBody',
      'whyEyebrow',
      'whyHeadline',
      'whyBody',
      'facultyBandEyebrow',
      'facultyBandHeadline',
      'facultyBandCtaLabel',
    ],
  },
  pricingPage: {
    // Phase 2. sectionScholarship + sectionLedgerStats. `pricingIntro` STAYS:
    // the hero map reads it as the page header's intro paragraph.
    fields: ['scholarshipEyebrow', 'scholarshipHeadline', 'scholarshipBody', 'footnote', 'stats'],
  },
  getStartedPage: {
    // Phase 2. sectionRequestPanel carries the panel copy, the Calendly URL and
    // the form reference; sectionNumberedCards ("steps") carries the steps.
    fields: [
      'requestForm',
      'calendlyUrl',
      'requestEyebrow',
      'requestHeadline',
      'requestBody',
      'calendlyEyebrow',
      'calendlyHeadline',
      'calendlyBody',
      'visitClassBody',
      'syllabusBody',
      'stepsHeadline',
      'steps',
    ],
  },
  forYouPage: {
    // Phase 1. The persona cards. `personasIntro` STAYS (hero intro).
    fields: ['personas'],
  },
  coursesPage: {
    // Phase 3. The "Start here" rail's copy. `emptyState` STAYS: the pinned
    // catalog still reads it. So do the three `detail*` course-page fields.
    fields: ['startHereEyebrow', 'startHereHeadline'],
  },
  eventsPage: {
    // Phase 2. sectionEventGrid + sectionRuledList. The `detailFinalCta*`
    // fields STAY: the event DETAIL route renders them.
    fields: [
      'upcomingEyebrow',
      'upcomingHeadline',
      'upcomingEmpty',
      'rhythmsEyebrow',
      'rhythmsHeadline',
    ],
  },
  faqPage: {
    // Phase 2. sectionFaqGrouped carries the category order now. The page's
    // FAQPage JSON-LD reads the QUESTIONS (a query projection), never this field.
    fields: ['categoryOrder'],
  },
  contactPage: {
    // Phase 2. sectionContactDetails + sectionForm.
    fields: [
      'formIntroNote',
      'contactForm',
      'whatToExpectEyebrow',
      'whoToReachLabel',
      'contactReasons',
      'gettingHereLabel',
      'gettingHereBody',
      'formSectionHeadline',
    ],
  },
  privacyPage: {
    // Phase 1. sectionLegalBody carries the policy and its date.
    fields: ['lastUpdated', 'body'],
  },
  accessibilityPage: {
    // Phase 1. Privacy's twin.
    fields: ['lastUpdated', 'body'],
  },
};

let changes = 0;
let skipped = 0;

for (const [type, { fields }] of Object.entries(PLAN)) {
  // Both twins: a document and its unpublished draft hold the same fields, and
  // an editor with a draft open would otherwise keep the old values alive.
  const docs = await client.fetch(
    `*[_type == $type]{ _id, flexibleSections, ${fields.join(', ')} }`,
    { type },
  );

  if (!docs.length) {
    console.log(`${type}: no document in the dataset. Nothing to do.`);
    continue;
  }

  for (const doc of docs) {
    const migrated = Array.isArray(doc.flexibleSections) && doc.flexibleSections.length > 0;
    if (!migrated) {
      console.log(
        `SKIP ${doc._id}: flexibleSections is empty, so its body was never migrated. ` +
          `Unsetting would destroy the only copy. Run the page's seed-builder script first.`,
      );
      skipped += 1;
      continue;
    }

    const present = fields.filter((f) => doc[f] !== undefined && doc[f] !== null);
    if (!present.length) {
      console.log(`${doc._id}: already clean (${fields.length} superseded field(s) absent).`);
      continue;
    }

    console.log(`${doc._id}: unset ${present.length} superseded field(s): ${present.join(', ')}`);
    await apply(`${doc._id}: unset ${present.join(', ')}`, () =>
      client.patch(doc._id).unset(present).commit(),
    );
    changes += 1;
  }
}

if (skipped) {
  console.log(`\n${skipped} document(s) skipped by the migration guard (see above).`);
}
done(changes);
