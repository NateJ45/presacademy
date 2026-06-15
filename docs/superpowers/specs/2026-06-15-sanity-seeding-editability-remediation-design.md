# Sanity seeding + editability remediation — design

**Date:** 2026-06-15
**Branch:** `staging` (work here, verify, fast-forward to `main`, then rebuild)
**Source of truth for the audit:** `scripts/sanity-audit.mjs --fields` + the three page-by-page agent reports (2026-06-15 session).

## Goal

Every visitor-facing string should be backed by a **populated** Sanity field, so Studio mirrors the live site. Today the schemas mostly exist, but the dataset is under-seeded and five live routes have no document at all. Close the gap by seeding existing copy into Studio, creating the missing documents, and adding fields for the handful of truly hardcoded editorial bits.

This change is **render-neutral**: every page must look pixel-identical before and after, because we seed the exact copy the code currently falls back to (reworded only where it is church-era). The win is in Studio, not on the page.

## The findings being remediated

- **Bucket C — no backing document (renders 100% from code):** `/contact` (`contactPage`), `/privacy` (`privacyPage`), `/accessibility` (`accessibilityPage`), `/404` (`notFoundPage`), `/events` (`eventsPage` + empty `event` collection). Plus empty collections rendering fabricated content: `faqItem` = 0 (11 hardcoded Q&As, incl. prices, also in JSON-LD) and `event` = 0 (3 fabricated recurring events).
- **Bucket B — field exists but empty → code fallback shows, Studio blank:** the closing-CTA band (`finalCtaEyebrow/Headline/Subhead` + `finalCta` button) is empty on all 9 page singletons; `faqPage.heroSubhead`; `getStartedPage.calendlyUrl`; `siteSettings.navItems` / `footerColumns` / `footerCredit` / `footerCreditUrl`; socials; SEO titles/descriptions site-wide.
- **Bucket A — truly fieldless editorial:** `/pricing` heritage stats band (no `stats[]` on `pricingPage`); `/courses/[slug]` aside trust line + two CTA labels; `/resources` empty-state body.
- **Stale / bugs:** church-era privacy fallback ("email the church"), church `faqItem.category` options + `faqPage.categoryOrder` default, blank dead `tel:` link on `/contact` when `siteSettings.phone` is empty, `notFoundPage` schema initialValues diverging from the page fallbacks.

## Plan (phased; staging branch)

### Phase A — Schema (all edits together, then ONE `typegen` + `studio:deploy`)
Per gotcha #1: batch schema changes, regenerate types, deploy Studio once, commit. Additive only — no field removals, so no "Remove field" risk.

1. `pricingPage` (schoolPages.ts): add `stats[]` (array of `{ value, label }`) for the heritage band — mirrors `homePage.stats` shape (minus the count flag).
2. `coursesPage` (schoolPages.ts): add course-detail aside fields, shared across all course pages — `detailTrustLine` (string), `detailExpressLabel` (string), `detailRequestLabel` (string).
3. `resourcesPage` (schoolPages.ts): add `emptyStateBody` (text) for the "no essays yet" copy.
4. FAQ categories → school set: update `faqItem.category` legacy option list and `faqPage.categoryOrder` `initialValue` to the school categories. Actual grouping uses `faqCategory` docs via `categoryRef` (created in Phase C); the legacy string stays hidden/readOnly for data safety.

### Phase B — Page wiring (Astro; current literals stay as fallbacks → render-neutral)
1. `pricing.astro`: read `page.stats ?? <current literal stats>` for the heritage band.
2. `courses/[slug].astro`: read the three `coursesPage.detail*` labels with the current literals as fallbacks.
3. `resources.astro`: read `page.emptyStateBody ?? <current literal>`.
4. `contact.astro`: wrap the phone `<li>` in `{phone && (...)}` so an empty phone hides instead of rendering a blank dead `tel:` link. (Bug fix.)
5. `privacy.astro`: reword the church-era static fallback ("email the church" → "email us" / school voice) so the fallback is correct even though Phase C will populate `privacyPage.body`.

### Phase C — Seeding (idempotent, only-empty; one script, `--apply`)
A new `scripts/seed-editability.mjs` (modeled on `seed-page-copy.mjs`: `setIfMissing` / `createIfNotExists`, never clobber populated fields, dry-run by default). It:

- **Closing-CTA bands** on all 9 singletons (home, about, courses, faculty, for-you, pricing, resources, get-started, faq): seed `finalCtaEyebrow/Headline/Subhead` from the exact `.astro` literals; seed the `finalCta` button object likewise.
- **faqPage**: seed `heroSubhead`, the final-CTA band, and `categoryOrder` (school set).
- **New fields**: seed `pricingPage.stats`, `coursesPage.detail*`, `resourcesPage.emptyStateBody` from the current literals.
- **siteSettings**: seed `navItems`, `footerColumns`, `footerCredit`, `footerCreditUrl` from the code `FALLBACK_*` defaults. Leave `phone` + socials EMPTY (need real values from the school — flagged, not invented).
- **Missing singletons**: `createIfNotExists` for `contactPage`, `privacyPage`, `accessibilityPage`, `notFoundPage`, `eventsPage`, each seeded from that page's current fallback copy (privacy reworded to school voice).
- **Collections**: create 5 `faqCategory` docs + 11 `faqItem` docs (the current fallback Q&As, linked via `categoryRef`) + 3 recurring `event` docs (the `RECURRING_FALLBACK` set). FAQ prices seeded as-is (already live); flagged that prices now also live in `pricingTier`.

### Phase D — Verify + ship
`typegen` freshness check, `npm run build`, visual-verify the touched pages in both themes + both viewports (home, pricing, courses/[slug], resources, contact, privacy, accessibility, 404, events, faq), confirm render-neutrality, commit on `staging`, push (staging preview deploy runs), then fast-forward `main` and rebuild so the seeded content goes live.

## Decisions (flagged for sign-off)
1. **FAQ categories** via new `faqCategory` docs + `categoryRef` (the intended mechanism); legacy church `category` options updated to the school set but left hidden/readOnly.
2. **Socials + phone** left empty pending real values — the only "needs your input" gap; everything else mirrors existing copy.
3. **Church-era rewording** limited to the privacy fallback/body ("the church" → "us"/"the Academy"); no other voice changes.
4. **FAQ prices** ($195 / $95 audit / $1,400 track) seeded as the live copy; noted that they now duplicate `pricingTier` data.

## Safety / constraints
- Schema edits → `typegen` → `studio:deploy` before seeding new fields; never click "Remove field".
- Seeding is only-empty + idempotent; re-running is a no-op.
- No em-dashes in any seeded site copy.
- Content lands in the dataset instantly but the live site only changes after the rebuild (Phase D).
- Render-neutral: if any page visibly changes, that is a bug to fix before shipping.
