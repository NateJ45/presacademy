#!/usr/bin/env node
// =============================================================================
// seed-builder-events.mjs — move the Events body into the page builder
// (2026-08-26, Phase 2 of the page-builder conversion)
// =============================================================================
// Writes two auto blocks into the Events page's `flexibleSections`:
//
//   1. sectionEventGrid   the "Upcoming" cards (fetches upcoming one-time
//                         events itself), plus the sentence shown when nothing
//                         is scheduled.
//   2. sectionRuledList   the recurring rhythms (fetches recurring events
//                         itself; the three built-in rhythms stay in the
//                         component as its no-content fallback).
//
// Neither block carries event CONTENT, only the headings around it, so adding
// an event stays a job you do in the Events collection.
//
// D4, additive: the singleton's upcoming*/rhythms* fields stay exactly where
// they are; they get unset in the cleanup phase.
//
// Idempotent: stable _keys, matching DEFAULT_SECTIONS.
//
//   node scripts/seed-builder-events.mjs           # dry run (default)
//   node scripts/seed-builder-events.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _keys in DEFAULT_SECTIONS (src/lib/default-sections.ts).
const KEYS = ['eventsUpcoming', 'eventsRhythms'];

const doc = await client.fetch(
  `*[_type == "eventsPage"][0]{
    _id, upcomingEyebrow, upcomingHeadline, upcomingEmpty,
    rhythmsEyebrow, rhythmsHeadline, flexibleSections
  }`,
);

if (!doc) {
  console.error('No eventsPage document in the dataset. Nothing to seed.');
  process.exit(1);
}

const sections = [
  {
    _key: 'eventsUpcoming',
    _type: 'sectionEventGrid',
    eyebrow: doc.upcomingEyebrow ?? 'Mark your calendar',
    heading: doc.upcomingHeadline ?? 'Upcoming',
    // The id the page's landmark already used, so any anchor pointing at it
    // keeps working.
    headingId: 'upcoming-heading',
    emptyCopy:
      doc.upcomingEmpty ??
      'Nothing dated on the calendar right now. The recurring rhythms below never stop, and the best place to start is a',
  },
  {
    _key: 'eventsRhythms',
    _type: 'sectionRuledList',
    eyebrow: doc.rhythmsEyebrow ?? 'Every month',
    heading: doc.rhythmsHeadline ?? 'Ways to get a feel for the Academy',
    headingId: 'recurring-heading',
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
  console.log('eventsPage: page sections already match the page body. Nothing to do.');
  done(0);
} else {
  console.log(
    `eventsPage: writing 2 sections (upcoming grid, recurring rhythms)` +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after them` : ''}.`,
  );
  await apply('eventsPage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
