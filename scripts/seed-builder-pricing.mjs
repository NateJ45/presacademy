#!/usr/bin/env node
// =============================================================================
// seed-builder-pricing.mjs — move the pricing body into the page builder
// (2026-08-26, Phase 2 of the page-builder conversion)
// =============================================================================
// Writes the Pricing page's CURRENT EFFECTIVE body into `flexibleSections` as
// three blocks, so the Studio mirrors the live site:
//
//   1. sectionPricingTiers on its Rule & Ledger surface (the tier cards; the
//      block fetches the pricingTier documents itself, so it carries no copy).
//   2. sectionScholarship, the warm statement band.
//   3. sectionLedgerStats, the three-cell heritage band.
//
// "Effective" means: the Sanity field values where an editor has set them, and
// the page's built-in literals where they have not, so what the editor opens is
// what the page renders today.
//
// D4, additive: this script writes ONLY the sections array. `scholarshipEyebrow`,
// `scholarshipHeadline`, `scholarshipBody`, `footnote` and `stats` stay exactly
// where they are, so reverting the page file brings the old page back with its
// content intact. Those fields get unset in the cleanup phase, with their own
// dry-run-first script.
//
// Idempotent: the blocks carry stable _keys (the same ones DEFAULT_SECTIONS
// uses), so a re-run replaces them in place instead of appending copies, and a
// run that would change nothing says so and writes nothing.
//
//   node scripts/seed-builder-pricing.mjs           # dry run (default)
//   node scripts/seed-builder-pricing.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _keys in DEFAULT_SECTIONS (src/lib/default-sections.ts) so the
// seeded document and the code fallback describe the same three sections.
const KEYS = ['pricingTiers', 'pricingScholarship', 'pricingStats'];

const doc = await client.fetch(
  `*[_type == "pricingPage"][0]{
    _id, scholarshipEyebrow, scholarshipHeadline, scholarshipBody, footnote,
    stats, flexibleSections
  }`,
);

if (!doc) {
  console.error('No pricingPage document in the dataset. Nothing to seed.');
  process.exit(1);
}

// The page's inline fallbacks, character for character. Kept here (rather than
// imported) because scripts run in plain node against the dataset, and because
// a seed should record what it wrote at the time it ran.
const FALLBACK_STATS = [
  { value: 'Free', label: 'Sit in on a class first' },
  { value: 'Per course', label: 'Pay as you go, no degree debt' },
  { value: 'Need-based', label: 'Scholarships every term' },
];

const stats = doc.stats?.length ? doc.stats : FALLBACK_STATS;

const sections = [
  {
    _key: 'pricingTiers',
    _type: 'sectionPricingTiers',
    // The two fields added for this page: its own fixed surface (no
    // SectionShell), and h2 tier names because they are the top-level headings
    // of the page body.
    surface: 'ledger',
    headingLevel: 'h2',
  },
  {
    _key: 'pricingScholarship',
    _type: 'sectionScholarship',
    eyebrow: doc.scholarshipEyebrow ?? 'Scholarships',
    headline: doc.scholarshipHeadline ?? 'No one is turned away for cost',
    body:
      doc.scholarshipBody ??
      'Need-based scholarships are available every term, funded by our supporters. If tuition is a barrier, tell us on the interest form and we will work it out. Formation should be within reach of anyone called to it.',
    // The page read the footnote straight off the document with no fallback, so
    // an empty field means no footnote line, then and now.
    ...(doc.footnote ? { footnote: doc.footnote } : {}),
  },
  {
    _key: 'pricingStats',
    _type: 'sectionLedgerStats',
    variant: 'trio',
    items: stats.map((s, i) => ({
      _key: s._key ?? `stat${i + 1}`,
      _type: 'ledgerStat',
      value: s.value,
      label: s.label,
    })),
  },
];

const existing = Array.isArray(doc.flexibleSections) ? doc.flexibleSections : [];
const rest = existing.filter((s) => !KEYS.includes(s?._key));
const next = [...sections, ...rest];

// Sanity returns object keys in its own order, so a plain JSON.stringify
// comparison reports "changed" on every re-run. Canonicalize first (sort keys at
// every level) so the idempotency check is about VALUES.
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
  console.log('pricingPage: page sections already match the page body. Nothing to do.');
  done(0);
} else {
  console.log(
    `pricingPage: writing 3 sections (tier cards, scholarship band, ${stats.length} stats)` +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after them` : ''}.`,
  );
  await apply('pricingPage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
