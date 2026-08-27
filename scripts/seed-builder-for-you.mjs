#!/usr/bin/env node
// HISTORICAL, kept for the record. RAN 2026-08-26 against production. The
// singleton fields this script reads were unset in Phase 5 (2026-08-27) by
// scripts/cleanup-builder-fields.mjs and removed from the schemas, so re-running
// it now is a no-op or an error by design. It stays in the tree because it is
// the record of how this page's content moved into the page builder.
// =============================================================================
// seed-builder-for-you.mjs — move the persona cards into the page builder
// (2026-08-26, Phase 1 of the page-builder conversion)
// =============================================================================
// Writes the For You page's CURRENT EFFECTIVE persona cards into
// `flexibleSections` as one `sectionNumberedCards` block.
//
// "Effective" means the Sanity `personas` array where an editor has filled it
// in, and the page's four built-in personas where they have not. Both paths end
// up as the same section data, so the Studio mirrors the live site either way.
//
// Field mapping (the type is a general numbered-cards block now):
//   persona.label   -> card.title
//   persona.promise -> card.body
//   persona.cta     -> card.cta   (copied as-is)
//
// D4, additive: writes ONLY the sections array. `personas` stays exactly where
// it is, so reverting the page file brings the old page back with its content
// intact. The old field gets unset in the cleanup phase.
//
// Idempotent: stable _keys throughout (the section and every card), so re-runs
// replace in place, and a run that would change nothing writes nothing.
//
//   node scripts/seed-builder-for-you.mjs           # dry run (default)
//   node scripts/seed-builder-for-you.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _keys in DEFAULT_SECTIONS (src/lib/default-sections.ts) so the
// seeded document and the code fallback describe the same section.
const KEY = 'forYouPersonas';
const CARD_KEY = (i) => `persona${i + 1}`;

// The page's built-in personas, used only when Sanity has none. Kept in step
// with DEFAULT_SECTIONS.forYouPage.
const BUILT_IN = [
  { label: 'The small-group leader', promise: 'Lead a study with more depth and less guesswork.', cta: { label: 'Courses for leaders', linkType: 'external', externalUrl: '/courses' } },
  { label: 'The lifelong learner', promise: 'Finally read the whole Bible as one story.', cta: { label: 'Start with Scripture', linkType: 'external', externalUrl: '/courses' } },
  { label: 'New to Reformed thought', promise: 'Understand what we believe, in plain words.', cta: { label: 'Explore the confessions', linkType: 'external', externalUrl: '/courses' } },
  { label: 'Discerning a call', promise: 'Test the waters before seminary, in good company.', cta: { label: 'Book a free intro', linkType: 'external', externalUrl: '/get-started' } },
];

const doc = await client.fetch(`*[_type == "forYouPage"][0]{ _id, personas, flexibleSections }`);

if (!doc) {
  console.error('No forYouPage document in the dataset. Nothing to seed.');
  process.exit(1);
}

const source = doc.personas?.length ? doc.personas : BUILT_IN;
const fromSanity = Boolean(doc.personas?.length);

const cards = source.map((p, i) => ({
  _key: CARD_KEY(i),
  _type: 'numberedCard',
  title: p.label,
  ...(p.promise ? { body: p.promise } : {}),
  // The CTA object carries its own _type from Sanity; the built-in literals do
  // not, so stamp it on either way.
  ...(p.cta ? { cta: { _type: 'ctaBlock', ...p.cta } } : {}),
}));

const section = {
  _key: KEY,
  _type: 'sectionNumberedCards',
  variant: 'top2',
  cards,
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
  console.log('forYouPage: page sections already match the persona cards. Nothing to do.');
  done(0);
} else {
  console.log(
    `forYouPage: writing 1 numbered-cards section with ${cards.length} card(s), ` +
      `${fromSanity ? 'from the personas field' : 'from the built-in personas (the field is empty)'}` +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after it` : ''}.`,
  );
  await apply('forYouPage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
