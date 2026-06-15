# Content editability audit (2026-06-14)

> **This supersedes the "all page copy is editor-driven" claim in `editor-vs-hardcoded.md`** for the school pages. That doc described the finished *church* build. The lay-school rebuild + brand evolution reused the church schemas and shipped many sections as hardcoded literals, so large parts of the site are NOT editable in Studio, and Studio shows editors fields that no longer render.

## The two failure modes

1. **Hardcoded live copy** — a literal string in a `.astro` file with **no backing Sanity field**. Faculty cannot change what they see on the live site.
2. **Orphan / mismatched fields** — a Sanity field that is **fetched but never rendered** (church-era leftover, or a field wired to nothing). Studio does **not** mirror the live site, and "silent data-loss" fields quietly discard whatever the editor types.

The goal state: every visitor-facing string is `{page?.field ?? 'inline fallback'}`, and Studio shows only fields that render. Pricing / For You / Resources already follow this pattern and are the template.

## Severity map

| Page / area | Editable today | Verdict |
|---|---|---|
| **Home** (`index.astro`) | hero text, SEO, final CTA only | **Worst.** ~90% hardcoded; schema is church-era (~30 orphan fields) |
| **About** (`about.astro`) | hero, final CTA only | **Worst.** Entire editorial body hardcoded (incl. the Presbytery line); church orphans |
| **Course / Faculty detail** | the document data | **Bad.** All section labels hardcoded; 6 silent data-loss fields |
| **Global chrome** (Header/Footer) | identity/contact/nav | **Bad.** Funder line, "Now enrolling", "PA" seal, "PC(USA)", type credit, labels all hardcoded |
| **Get Started** | most panels | Mixed: "Request information" panel + sub-labels hardcoded |
| **Events** (index/detail) | section eyebrows, event data | Mixed: recurring fallback list hardcoded; church orphans (`specialEyebrow/Headline`) |
| **Courses / Faculty index** | hero, intros, empty states | Good-ish: filter labels in React islands hardcoded; `catalogIntro`/`directoryIntro` orphans |
| **Contact / FAQ / Privacy / 404** | most copy | Good wiring, but **stale church defaults** seed wrong examples; `seoImage` ignored on contact+faq |
| **Accessibility** (`accessibility.astro`, new 2026-06) | hero, SEO, body, last-reviewed date, sections | **Reference pattern.** Editable `accessibilityPage` singleton + complete static fallback (twin of Privacy); barrier-report contact single-sourced from `siteSettings` |
| **Pricing / For You / Resources** | nearly all | **Reference pattern.** Only pricing stats band + 2 labels hardcoded |

## Per-page findings + fixes

### Home — `src/pages/index.astro` (worst)
Hardcoded (no field): the `wayfinding` array (4 items), the `stats` array (4), the `topics` ticker (10), the hero buttons ("Browse courses" / "Book a free intro" — should wire to `heroPrimaryCta`/`heroSecondaryCta` which already exist + are fetched), "Next cohort begins" label, and the eyebrow+heading pairs for Start-here / Courses / Faculty / Testimonials strips.
Church orphans in `homePage.ts` (fetched, never render): `serviceBand`, `weeklyRhythms`, `thisSunday`, `seasonalHero`, `welcome*` (+ image), `events*`, `inclusive*`, `involved*`, `record*` ("The Record"), `welcomeCtaPrimary/Secondary`, `serviceBandVisitCta/WatchCta`, `eventsCalendarCta`, plus `heroVideo*`, `heroRotatingWords`, `heroKeyword`, `heroScriptAccent` (none wired to the kinetic hero).
**Fix:** re-schema `homePage.ts` — add `wayfinding[]`, `stats[]`, `tickerTopics[]`, the 4 strip eyebrow/heading pairs, `nextCohortLabel`, `startHere*`; wire the hero buttons to the existing CTA fields; `hidden: true` the church orphans (keep data, drop from UI). Update `getHomePage` projection + `index.astro` to read the new fields with the current literals as fallbacks.

### About — `src/pages/about.astro` (worst)
Hardcoded (no field): Mission block (`missionEyebrow/Statement/Body`), the 4-item `beliefs` array + its eyebrow/headline/footnote, "How we teach" block (`teach*`), "Why we exist" block (`why*` — contains "supported by the Presbytery of Cincinnati"), the faculty band (`facultyBand*` + CTA).
Church orphans in `aboutPage.ts`: `building*`, `who*`, `muralCaption`, `featureImage`, `buildingImage`, their CTAs (the whole "content" group is dead).
**Fix:** re-schema `aboutPage.ts` — add `mission*`, `believe*` + `beliefs[]`, `teach*`, `why*`, `facultyBand*`; `hidden`-retire the church fields; wire `getAboutPage` + `about.astro`.

### Course detail — `src/pages/courses/[slug].astro`
Hardcoded section labels (no field): "Who this is for", "The sessions", "At a glance", the 8 ledger row labels (Term/Begins/Schedule/Sessions/Format/Venue/Tuition/Apply by), "Express interest" / "Request information" aside CTAs, the "visit the first session free" trust line, "Your teacher(s)". FinalCta button label is hardcoded here (the index binds it).
Silent data-loss orphans (fetched, never rendered): `course.offerings[].seatsNote`, `course.syllabusFile` (→ `syllabusUrl`), `priceTier.summary`/`unit`.
**Fix:** add a shared "section labels" object to `coursesPage` (or accept structural labels as hardcoded + document it); render the syllabus download + seats note; bind the aside trust line + CTAs to fields.

### Faculty detail — `src/pages/faculty/[slug].astro`
Hardcoded labels: "Teaching areas", "Faculty" eyebrow, "Degrees", "Selected publications", "Affiliations", "Courses taught". FinalCta button hardcoded.
Silent data-loss orphans: `facultyMember.specializations`, `yearsTeaching`, `email` (all fetched, none rendered — a bio's email vanishes).
**Fix:** render specializations / years / email; add label fields or document the structural labels.

### Courses index / Faculty index
Hardcoded: filter legends in `CourseFilters.tsx` ("Topic", "Teacher", "Term", "All upcoming terms", "Reset") + `FacultyFilter.tsx` ("All"); the pre-seed empty states; CourseCard "New dates coming"; the filtered empty-state tail ("ask us what is coming next").
Orphans: `coursesPage.catalogIntro` and `facultyPage.directoryIntro` (defined, queried, never rendered — both pages use `heroSubhead`). `facultyPage` lacks an `emptyState` field that `coursesPage` has.
**Fix:** decide filter labels = structural (document) or add fields; render or remove `catalogIntro`/`directoryIntro`; add `facultyPage.emptyState`; fold the empty-state tail into the field.

### Get Started — `src/pages/get-started.astro`
Hardcoded: the whole "Request information" left panel (`requestEyebrow/Headline/Body`), the Calendly button label, "Visit a class" + "Take a syllabus with you" sub-labels (their bodies ARE editable), "Browse courses" link.
**Fix:** add the panel + sub-label fields to `getStartedPage`.

### Events index / detail
Hardcoded: `RECURRING_FALLBACK` (3 events) renders as live content until real recurring events exist; date-format locale strings; the "course" link grafted onto `upcomingEmpty`; detail "Events" breadcrumb + "Questions? Contact… at…" template.
Orphans: `eventsPage.specialEyebrow/Headline` (church); `event.allDay` toggle never consulted (silent no-op); dead `specialService`/`liturgicalSeason` GROQ selections (no schema field).
**Fix:** honor `allDay`; drop the dead projections; church orphans → hide; consider a `recurring` collection vs the hardcoded fallback.

### Contact / FAQ / Privacy / 404 (wiring OK, defaults stale)
- `seoImage` fetched but **not passed to BaseLayout** on `contact.astro` + `faq.astro` (privacy does it right) — per-page share images ignored. **Fix: pass `seoImage`.**
- `heroScriptAccent` / `finalCtaScriptAccent` / `faqPage.secondaryCta` are orphans (fetched, not passed to the component). **Fix: wire or remove.**
- Stale `initialValue` church defaults seed wrong Studio examples: `notFoundPage.secondaryCtaHref = '/worship'` (dead route!), `faqPage.categoryOrder` = church taxonomy, `privacyPage.heroEyebrow = 'Studio Name.'`, plus punctuation-mismatched hero/CTA defaults on contact/faq. **Fix: update the defaults to school values.**
- Privacy static fallback is church-voiced ("email the church") with a baked-in "May 2026" date. **Fix: reword the fallback (or require `body`).**

### Global chrome — Header / Footer
Hardcoded (no field, every page): Footer `funder` const + "Made possible by the {funder}", "Set in Fraunces & Source Sans 3" type credit, the "PA" monogram seal, the "PC(USA)" tag, "Where we meet" / "Follow along" / "Get directions" / "Get in touch" labels, masthead CTA labels; Header "Now enrolling", "Reformed lay formation" (NOT `settings.tagline` — a real mismatch), "Request info", "Free intro".
Editable-with-fallback (OK): designer credit (`siteSettings.footerCredit`), nav (`navItems`), footer columns (`footerColumns`).
**Fix:** add `siteSettings` fields for the funder line, the colophon tag, and the brand monogram; make the Header bar use `settings.tagline`; decide which chrome labels are worth fielding vs structural.

## Editor experience + Sanity onboarding

**Already strong (keep):** the repo-locked "How This Works" 16-guide help center (first desk item), thorough field `description`s, grouped field tabs, the live character-count input, document badges, a brand-themed Studio, singleton protection. The project is already well past a default Studio.

**The "click the live page to edit it" feature = Sanity's Presentation tool, and it cannot run here.** It requires SSR + draft mode; this is `output: 'static'` (Sanity docs: "Static output mode will not work"). Enabling it = converting the whole site to SSR. Not recommended just for this.

**No good off-the-shelf welcome-modal / tour plugin exists** (the only first-party one is Sanity's internal, unlicensed, self-removing onboarding widget). A tour would be hand-built React and would duplicate the help center.

**Highest-leverage editor win (works on static):** a per-document root-input **banner** at the top of each page form — "This is your *Home* page" + a **"View this page on the live site ↗"** deep link (from the existing `urlForDoc()`) + the publish→rebuild reminder. Reuses the `CharacterCountInput` root-input pattern. Directly maps Studio → live page.

**Quick wins:** fix `documentBadges.tsx` (its `SEO_PAGE_TYPES`/`PHOTO_FIELD` still list deleted church types — the "Needs a photo/Add SEO" badges do nothing on `course`/`facultyMember` today); add inline notes on the 3 gotcha fields (hero keyword "must match the headline exactly", nav "this becomes the entire menu", slug "this is the web address").

## Fix plan (phases)

0. **This doc** — the map. ✅ `b6c6b0c`
1. **Editor-UX wins** ✅ — the "view it live" banner on every form (`PageHelpBanner` + `StudioFormInput`, links to a dedicated `LIVE_SITE_URL`), and fixed the stale photo/SEO `documentBadges` (they pointed at deleted church types). Gotcha-field notes folded into the schema phases. Deployed.
2. **Home re-schema** ✅ `91c1e4d` — added school fields (wayfinding, stats, ticker, strip labels, hero button labels, next-cohort label), removed the ~30 church orphans (the home doc held no data in them), wired `index.astro` + `getHomePage`. Live page unchanged.
3. **About re-schema** ✅ `bf88d1d` — added mission / beliefs / teach / why / faculty-band fields, removed the church orphans, wired `about.astro` + `getAboutPage`.
   - **Seed** ✅ `scripts/seed-page-copy.mjs` patched 35 empty home/about fields with the live copy, so Studio mirrors the site (idempotent, only-empty). Studio redeployed (`npm run studio:deploy`).
4. **Detail pages + data-loss** ✅ — rendered the silent-data-loss orphans (course `syllabusUrl` download link + a `seatsNote` ledger row + tier `unit` on the price; faculty `specializations`, `yearsTeaching`, `email`; event `allDay` now honored in the date format), and removed the dead `specialService`/`liturgicalSeason` GROQ selections. Passed `seoImage` to BaseLayout on contact + faq (their share image was ignored). Fixed the dead `notFoundPage` default (`/worship` → `/courses`). Made the footer **funder** editable (`siteSettings.funder` + Footer wiring) and the Header bar use `settings.tagline`. Fielded the get-started "Request information" panel and the faculty empty-state. Seeded the new copy + `studio:deploy`.
   - **Intentionally left hardcoded (structural scaffolding, NOT editorial copy):** detail-page section labels ("At a glance", "Degrees", "Who this is for", "The sessions", "Affiliations", "Courses taught"), the catalog/faculty filter legends ("Topic"/"Teacher"/"Term"/"All", in the React islands), and the colophon "PC(USA)" tag + "PA" monogram (brand constants). Fielding these would bloat Studio with dozens of never-touched fields, working *against* the editor goal. Minor remaining orphans left in place (no data, harmless): `coursesPage.catalogIntro`, `facultyPage.directoryIntro`, `eventsPage.specialEyebrow`/`specialHeadline`; plus cosmetic stale `initialValue` examples on faq/privacy/contact (only ever seen on a brand-new singleton, which never happens since the singletons already exist).
5. **Finish** ✅ — every phase ran `typegen` + `studio:deploy` + build + verify + commit, pushed to `main`.

**Schema-change safety (gotcha #1):** after any schema edit run `typegen` + `studio:deploy`; to remove a church field, set `hidden: true` first (keeps data, drops it from the editor UI) — never click "Remove field" in Studio on a populated field without a dataset migration.
