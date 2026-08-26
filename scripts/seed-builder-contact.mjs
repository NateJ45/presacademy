#!/usr/bin/env node
// =============================================================================
// seed-builder-contact.mjs — move the Contact body into the page builder
// (2026-08-26, Phase 2 of the page-builder conversion)
// =============================================================================
// Writes two blocks into the Contact page's `flexibleSections`:
//
//   1. sectionContactDetails  the details list, who-to-reach rows, the
//      getting-here note and the map. The address, phone, email and office
//      hours are NOT copied here: they stay site settings, and the block
//      resolves them, so the footer and the map cannot disagree with them.
//   2. sectionForm on its "page body" style, pointing at the SAME form
//      document the page already used. The form renderer is untouched.
//
// "Effective" content as everywhere else: editor values where set, the page's
// built-in literals where not. The who-to-reach rows are copied only when an
// editor has actually set them, because the built-in list is computed from
// siteSettings (and drops its email row when no address is configured, which a
// frozen copy could not do).
//
// D4, additive: contactReasons, whoToReachLabel, gettingHere*, the form-section
// headings and the contactForm reference all stay exactly where they are.
//
// Idempotent: stable _keys, matching DEFAULT_SECTIONS.
//
//   node scripts/seed-builder-contact.mjs           # dry run (default)
//   node scripts/seed-builder-contact.mjs --apply   # write
// =============================================================================
import { client, apply, done } from './lib/sanity-lib.mjs';

// Must match the _keys in DEFAULT_SECTIONS (src/lib/default-sections.ts).
const KEYS = ['contactDetails', 'contactForm'];

const doc = await client.fetch(
  `*[_type == "contactPage"][0]{
    _id, contactReasons, whoToReachLabel, gettingHereLabel, gettingHereBody,
    whatToExpectEyebrow, formSectionHeadline, formIntroNote,
    "formRef": contactForm._ref,
    flexibleSections
  }`,
);

if (!doc) {
  console.error('No contactPage document in the dataset. Nothing to seed.');
  process.exit(1);
}

const details = {
  _key: 'contactDetails',
  _type: 'sectionContactDetails',
  // Read aloud for this landmark. It MUST differ from the hero h1 ("Get in
  // touch") or axe flags two regions with the same accessible name.
  landmarkLabel: 'Contact details',
  whoToReachLabel: doc.whoToReachLabel ?? 'Who to reach',
  gettingHereLabel: doc.gettingHereLabel ?? 'Getting here',
  gettingHereBody:
    doc.gettingHereBody ??
    'Courses meet in person on the West Chester campus, with free on-site parking. The building is a short drive from the interstate.',
  mapTitle: 'Map to The Presbyterian Academy',
  // Only when the editor has set rows of their own: the built-in list is
  // computed from siteSettings and hides its email row when no address is set.
  ...(doc.contactReasons?.length
    ? {
        reasons: doc.contactReasons.map((r, i) => ({
          _key: r._key ?? `reason${i + 1}`,
          _type: 'contactReason',
          label: r.label,
          value: r.value,
          href: r.href,
        })),
      }
    : {}),
};

const form = {
  _key: 'contactForm',
  _type: 'sectionForm',
  variant: 'pageBody',
  eyebrow: doc.whatToExpectEyebrow ?? 'Send a Note',
  heading: doc.formSectionHeadline ?? 'Start the conversation',
  headingId: 'contact-form',
  fallbackLabel: 'Email the Office',
  ...(doc.formIntroNote ? { intro: doc.formIntroNote } : {}),
  // The same form document the page referenced. Absent it, the block shows the
  // email button, which is exactly what the page did.
  ...(doc.formRef ? { form: { _type: 'reference', _ref: doc.formRef } } : {}),
};

const existing = Array.isArray(doc.flexibleSections) ? doc.flexibleSections : [];
const rest = existing.filter((s) => !KEYS.includes(s?._key));
const next = [details, form, ...rest];

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
  console.log('contactPage: page sections already match the page body. Nothing to do.');
  done(0);
} else {
  console.log(
    `contactPage: writing 2 sections (details + map, form section` +
      `${doc.formRef ? ' with the page\'s form' : ' with no form: the email button renders'})` +
      `${doc.contactReasons?.length ? `, carrying ${doc.contactReasons.length} who-to-reach row(s)` : ', using the built-in who-to-reach rows'}` +
      `${rest.length ? `, keeping ${rest.length} existing section(s) after them` : ''}.`,
  );
  await apply('contactPage: set flexibleSections', () =>
    client.patch(doc._id).set({ flexibleSections: next }).commit(),
  );
  done(1);
}
