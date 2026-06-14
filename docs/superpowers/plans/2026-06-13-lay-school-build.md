# The Presbyterian Academy — Lay-School Build Plan (Phase 4)

- Date: 2026-06-13
- Status: PROPOSED. Awaiting go-ahead before code.
- Specs this executes: content model `docs/superpowers/specs/2026-06-13-lay-school-ia-content-model.md`, design language `docs/superpowers/specs/2026-06-13-design-language.md`, research `docs/research/2026-06-13-lay-school-ia-patterns.md`.

**Goal:** turn the church starter into The Presbyterian Academy lay school: new Sanity content model, the "Rule & Ledger" design language built as real components, all church pages/modules removed, placeholder content seeded, and the express-interest form + Calendly + newsletter wired. Brand tokens stay locked.

**Architecture / approach:** work on a branch, in verification-gated tasks. The site is statically prerendered and `sanityFetch` returns inline fallbacks when Sanity is unconfigured, so `npm run build` and a local visual pass work WITHOUT a Sanity token. Schema correctness is proven by `npm run typegen` (offline) and the Studio dev server. Heavy, independent files (individual schemas, individual page components) are authored in parallel by subagents, then integrated and verified centrally.

## Who-does-what (credential-gated steps)

I can do all code, schema, component, seed-file, and docs work and run `npm run typegen` + `npm run build` + local Playwright verification. The following need YOU (or a token):
- **`npm run studio:deploy`** (Sanity login) after schema changes, host `presbyterian-academy`.
- **`npm run seed`** to import the placeholder content (needs the Sanity write token; memory says it is currently blank). I will write `studio/starter-content.ndjson`; you run the import, or hand me a token.
- **Merge to `main`** (triggers the Cloudflare production build) and confirming prod.

I will pause at each gate rather than assume credentials.

---

## Task 0 — Branch
`git checkout -b revamp/lay-school` off `main`. Clean tree.

## Task 1 — New content types (schemas)
Author `studio/schemaTypes/`: `teachingArea.ts`, `term.ts`, `course.ts` (with inline `courseOffering` + `courseSession` objects), `facultyMember.ts`, `testimonial.ts`, `pricingTier.ts`. Field lists per the content-model spec §3 (course/faculty one-directional reference; `term` owns dates; year fields are strings; faculty `teachingAreas` + `degrees` required).
- Verify: `npm run typegen` regenerates `src/lib/sanity.types.ts` clean; the new types appear.

## Task 2 — New + modified page singletons
- New singletons via the `definePageSingleton` factory (new `studio/schemaTypes/schoolPages.ts`, mirroring `churchPages.ts`): `coursesPage`, `facultyPage`, `pricingPage`, `getStartedPage`, `forYouPage`, `resourcesPage`, each with the `extra.fields` enumerated in spec §3.
- Modify: `homePage` (retire church groups, add school fields), `aboutPage` (absorb beliefs fields), `eventsPage` (school categories), `contactPage` (map), `faqPage` (category defaults), `siteSettings` (drop worship/give/church URLs + `worshipService`; add `denominationStatement`, `admissionsEmail`, `mapEmbedUrl`).
- Verify: `typegen` clean.

## Task 3 — Retire church types + dependent enums
- Remove church schema files / factory entries: `sermon`, `sermonsPage`, `worshipResource`, `ministry`, `staffMember`, and the 11 church page singletons in `churchPages.ts`.
- Update `blocks.ts` `sectionDynamicList.source` enum to `featuredCourses`/`upcomingEvents`/`faculty`/`latestResources`; update `ctaBlock.ts` `internalLink.to[]` to the new singletons.
- Verify: `typegen` clean; no schema references a removed type.

## Task 4 — Studio registration + desk + deploy
- Update the four parallel lists: `index.ts`, `sanity.config.ts` (`SINGLETON_TYPES` + `urlForDoc()` incl. removing `sermon`/`staffMember` collection cases), `structure.ts` (`SINGLETON_TYPES` + `HIDDEN_FROM_DEFAULT` + desk tree: add Catalog/People groups, remove Sermons + church Content).
- Verify locally: `npm run studio:dev` loads, desk shows the new structure, no console errors.
- GATE: **YOU run `npm run studio:deploy`** (host `presbyterian-academy`) after this lands. Commit.

## Task 5 — App-code landmine fixes (spec §6)
- `CtaLink.astro` `TYPE_TO_PATH` -> new routes. `ctaBlock` already updated (Task 3) — keep in sync.
- `Header.astro`: replace `FALLBACK_NAV_ITEMS` (school nav), the Watch/Give utility bar (-> "Next cohort" + Request info), and the "Plan a Visit" CTA (-> Request info / Free intro).
- Remove `src/lib/serviceTime.ts`; pull `worshipService` out of `siteSettings.ts` + `queries.ts`; rewrite `src/lib/schemas.ts` `churchSchema()` -> `EducationalOrganization` (drop opening-hours), fix the `BaseLayout.astro` call site; delete orphaned `serviceListSchema`/`projectSchema`.
- `public/llms.txt` -> regenerate/rewrite to school routes. `scripts/generate-og-pages.mjs` `SINGLETONS` -> school routes + titles. `DynamicListBlock.astro` switch + `queries.ts` helpers -> school sources.
- Verify: `npm run build` clean (no dangling imports/types).

## Task 6 — Design-system foundation ("Rule & Ledger")
- `src/styles/globals.css`: add `--radius-edge` + brass rule utilities; retire `--arch-radius`, `.arch-top`/`.arch-top-sm`, `surface-chapel` mid-page use (keep a colophon variant), and the rule-draw motion. Delete/retire `ArchOrnament.astro`, neutralize `ArchMedia` arch dependence.
- Update `SectionHeading.astro` (full rule + optional index numeral instead of the gold stub).
- Verify: build clean; spot-check a page renders with new tokens.

## Task 7 — Components (the §6 archetype library)
Build/adapt: course card, course catalog + filter rail, course-detail facts ledger + numbered session list + instructor block, faculty card, faculty directory, faculty CV bio, testimonials (ledger quotes), pricing table, persona cards, get-started form panel, stat/heritage band, wayfinding ledger, colophon CTA. Compose from the existing block library + shadcn primitives per the component-sources cheat sheet. Authored in parallel from the approved mockup, integrated centrally for consistency.

## Task 8 — Pages + routes
Rebuild `index.astro` and build `/courses`, `/courses/[slug]`, `/faculty`, `/faculty/[slug]`, `/about` (absorb beliefs), `/events` (+ trim), `/resources` (rename from `/journal`, with redirect), `/pricing`, `/get-started`, `/for-you`, `/faq`, `/contact`. DELETE church page files + routes: `worship`, `sermons/*`, `give`, `serve`, `grow`, `kids`, `food`, `music`, `weddings`, `use-our-space`, `what-we-believe`, `pastor-staff`. Each page wires Sanity fields with inline fallbacks (CLAUDE.md content model).
- Verify: `npm run build` clean; no 404-to-self CTAs.

## Task 9 — Conversion wiring
- Express-interest: a `form` document (native fields per spec §3) referenced by `getStartedPage` + course CTAs, rendered by `FormRenderer.tsx`.
- Calendly: `CalendlyInline.tsx` on `/get-started#intro`.
- Newsletter: `NewsletterSignup.tsx` in the footer + home + get-started, driven by `siteSettings.newsletter`.
- Verify: forms render, validate, and submit to the configured provider (test mode).

## Task 10 — Placeholder seed content
Write `studio/starter-content.ndjson`: ~4 terms, ~10 teaching areas, ~10 courses (with offerings + sessions), ~7 faculty (full CVs), ~6 testimonials, ~4 pricing tiers, ~8 events, ~6 resources, and all page-singleton copy. Apply the spec §8 voice guardrail (no em-dashes; banned vocab; warm-not-stuffy faculty bios; pastoral counterweight on beliefs). Clear the placeholder phone.
- GATE: **YOU run `npm run seed`** (or provide a write token). Without it, pages render the inline fallbacks (still a clean build).

## Task 11 — Verify
- `npm run build` clean (no `[sanity]` warnings beyond the documented fallback).
- Playwright: home, courses, course detail, faculty, faculty bio at 375 + 1280 in BOTH light and dark. No regressions, no invisible text.
- Lighthouse (chrome-devtools) on home + a course page: target 100/100/100/100 desktop. Fix any drop.

## Task 12 — Ship
- Open PR `revamp/lay-school` -> `main` (confirm before push).
- GATE: **YOU merge** (triggers Cloudflare prod build) and run `npm run studio:deploy` if not already; regenerate OG (`npm run og`) + `llms`.
- Confirm prod in both themes; check the build log for no unexpected `[sanity]` warnings.

---

## Out of scope / follow-ups
- Real licensed photography (placeholders only; pre-launch requirement).
- Real Sanity write token + live content authoring by the client.
- The `--color-chapel*` token rename to `--color-band*` (optional, deferred).
- Any payment/enrollment (express-interest only by decision).

## Execution notes
- Verification gate after each task; do not stack unverified schema changes.
- Never click "Remove field" in the hosted Studio; retire types via schema removal + reseed on placeholder data.
- Run `typegen` after every schema change; `studio:deploy` once per schema-stable checkpoint.
- Keep desktop nav server-rendered; keep Lenis + reveal observers; defend Lighthouse 100s; both themes + viewports on every UI task.
