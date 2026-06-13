# The Presbyterian Academy — IA + Content-Model Spec (Phase 2)

- Date: 2026-06-13
- Status: PROPOSED (rev. 2, post adversarial review). Pending user approval before Phase 3 (design language) and Phase 4 (build).
- Source research: `docs/research/2026-06-13-lay-school-ia-patterns.md`
- Scope: the sitemap, per-page feature list, and the Sanity content-model changes (new types, modified types, retired types, Studio registration, code-integration landmines) to turn the church starter into a lay theological school. Visual/section design language is Phase 3. Brand tokens are locked.
- Rev. 2 changes (from a 3-lens review): course↔faculty made one-directional (derive courses-taught); `term` is the single calendar source of truth; catalog card resolves a derived "next offering"; faculty `teachingAreas` required + free-text `specializations` added; year fields are strings; `nextTerm` derived by query not a stored ref; a Webinar/Online event category added; the landmine list (section 6) expanded with the `churchPages.ts` factory file, the full `serviceTime` consumer chain, the JSON-LD `churchSchema` surgery, `llms.txt`, the OG-page generator, and the header utility bar; a seed-phase voice guardrail added (section 9).

## Locked product decisions (this session)

1. **Money:** named pricing stated plainly per course/track, plus named scholarships. Adds a `pricingTier` type and a Pricing & Scholarships page.
2. **Delivery:** cohort-based and in-person/local. Courses run in scheduled terms at a physical location. No self-paced video in v1 (Hybrid and a Webinar/Online event category leave room for online later). The free on-ramp is an in-person info session / visiting the first class, plus a Calendly intro call and a downloadable syllabus, NOT a free streaming lesson.
3. **IA scope:** include a `/for-you` lay-persona front door and a `/get-started` express-interest hub beyond the brief's base page list.
4. From the brief (unchanged): brand stays Oxblood & Stone; content is realistic placeholder loaded into Sanity; signups are express-interest only (no payment/checkout); Calendly free intros + newsletter retained; remove all church-only pages/modules; Pastors & Staff becomes an academically serious Faculty.

---

## 1. Sitemap (final)

**Primary nav:** `Courses` · `Faculty` · `About` · `Events` · `Resources`
**Header CTA pair (persistent):** "Request info" (-> `/get-started`) and "Book a free intro" (-> `/get-started#intro` Calendly).
**Footer:** PC(USA) identity statement, contact (named humans + email + phone + address), socials, secondary links (Pricing, FAQ, For You, Privacy).

| Route | Type | Purpose |
|---|---|---|
| `/` | `homePage` singleton (rebuilt) | Thesis hero, identity, wayfinding, start-here rail, proof, catalog + faculty preview, conversion. |
| `/courses` | `coursesPage` singleton + `course` collection | Catalog with topic/teacher/term filters + "Start here" rail. |
| `/courses/[slug]` | `course` | Fixed detail: facts strip (next term, start, schedule, venue, price), overview, who-it's-for, session arc, instructor, dual CTA. |
| `/faculty` | `facultyPage` singleton + `facultyMember` collection | Filterable teacher roster; degree-line under each name. |
| `/faculty/[slug]` | `facultyMember` | Structured CV bio (degrees, ordination, publications, derived courses taught). |
| `/about` | `aboutPage` singleton (repurposed) | Mission, Reformed/PC(USA) identity, What We Believe (folded in), how we define formation, history (founder + year), Statement of Faith, leadership. |
| `/events` + `/events/[slug]` | `eventsPage` + `event` (repurposed) | Info sessions, open lectures, workshops, webinars, term starts, application deadlines. |
| `/resources` + `/resources/[slug]` | `resourcesPage` + `resource`/`page` | Teaching articles / formation essays (SEO + funnel). Reuses the existing journal route + blocks. |
| `/pricing` | `pricingPage` singleton + `pricingTier` | Plain prices + bundle math + scholarship posture. |
| `/get-started` | `getStartedPage` singleton + `form` ref | Express-interest form + Calendly intro + "visit a class" + syllabus download. |
| `/for-you` | `forYouPage` singleton | Named lay personas, each resolving to one CTA. |
| `/faq` | `faqPage` + `faqItem`/`faqCategory` | Grouped Q&A (cost, format, who it's for, Reformed identity). |
| `/contact` | `contactPage` (repurposed) | Named contacts, email, phone, address, map. |
| `/privacy`, `/404`, `/sitemap-index.xml` | as-is | Standard. |

**Retired routes (and their content types):** `/worship` (`worshipPage`), `/sermons` + `/sermons/[slug]` (`sermon`, `sermonsPage`), `/give` (`givePage`), `/serve` (`servePage`), `/grow` (`growPage`), `/kids` (`kidsPage`), `/food` (`foodPage`), `/music` (`musicPage`), `/weddings` (`weddingsPage`), `/use-our-space` (`useOurSpacePage`), `/what-we-believe` (`beliefsPage`, content folded into About), `/pastor-staff` (`staffPage`, replaced by `/faculty`). Plus the `worshipResource` collection and (proposed) the `ministry` collection.

---

## 2. Per-page feature list

**Home (`/`)** — see research §B. Sections: thesis hero (dual CTA) -> identity/founding -> wayfinding grid (4 tiles) -> "Start here" featured-course rail -> testimonials + stat/heritage band -> course catalog preview (3-6 cards) -> faculty strip (degree line under name) -> final dual CTA + newsletter.

**Courses (`/courses`)** — filter rail (Topic, Teacher with counts, Term) + "has upcoming term" toggle; pinned featured + "Recommended starting course"; responsive card grid; result count. Card resolves the derived next offering (see `course` schema): cover, title (no codes), instructor at equal weight, time-commitment chip from the next offering ("8 weeks, Tue 7-9pm"), badge from the next offering status ("Open" / "Starts soon" / "Waitlist"); if no upcoming offering, card shows "New dates coming" and no status badge.

**Course detail (`/courses/[slug]`)** — title + instructor (linked); **at-a-glance facts strip** from the next offering (term, start date, weekly schedule, # sessions, venue, price, registration deadline, seats status); overview; "Who this is for" (2-3 personas); **numbered session list** (title + focus per week); instructor credibility block; dual CTA (Request info / Express interest) top and bottom; "Visit the first session free" note (static copy, v1).

**Faculty (`/faculty`)** — text-forward directory, uniform portrait, filter by teaching area; card = Honorific + Name + Role + degree-with-institution line + ordination tag.

**Faculty detail (`/faculty/[slug]`)** — header (portrait, name, role, degree line, ordination + denomination, teaching areas); narrative bio + one warm human line; degrees list; specializations; current positions/affiliations; selected publications; "Courses taught" linked tiles (derived by GROQ back-query, not a stored field).

**About (`/about`)** — mission; Reformed/PC(USA) identity; What We Believe (Westminster Confession + Catechisms + PC(USA) standards) rendered as a small distinctives set; how we define formation; history (founder + year); Statement of Faith; leadership snapshot linking to Faculty.

**Events (`/events`)** — upcoming (info sessions, lectures, workshops, webinars, term starts, deadlines) + a recurring/term rhythm list; detail page per event with register/RSVP CTA.

**Resources (`/resources`)** — article grid with topic chips; detail = reading-progress long-read (reuse journal layout).

**Pricing & Scholarships (`/pricing`)** — tier table (per-course, audit, full-track with bundle math), plainly stated; scholarship section (named awards or donor-funded posture); stat/heritage band; FAQ link; dual CTA.

**Get Started (`/get-started`)** — express-interest form (fields enumerated in §3 `getStartedPage`); Calendly inline intro (`#intro`); "visit a class" invite; syllabus/study-guide download (newsletter lead magnet); what-happens-next steps.

**For You (`/for-you`)** — persona cards ("the small-group leader," "the lifelong learner," "discerning a call," "new to Reformed thought"), each with a one-line promise + single CTA into a matching course/track or Get Started.

**FAQ / Contact** — reuse existing patterns with school content.

---

## 3. Content model — new document types (full field lists)

Conventions reused from the existing model: the SEO triad (`seoTitle`/`seoDescription`/`seoImage`+alt), the hero set (`heroEyebrow`/`heroHeadline`/`heroSubhead`/`heroImage`/`heroKeyword`), `ctaBlock` for buttons, and `flexibleSections` (the page builder) on singletons. New collection/object types:

### `teachingArea` (collection — the shared taxonomy)
The structural keystone: referenced by BOTH `course` and `facultyMember` so Courses and Faculty filter on one vocabulary.
- `title` (string, required) — e.g. "Reformed Theology", "Scripture", "Prayer & Spiritual Life"
- `slug` (slug, from title, required)
- `description` (text, optional) — one line for catalog headers
- `displayOrder` (number)

### `term` (collection — the cohort calendar; SINGLE SOURCE OF TRUTH for dates)
- `title` (string, required) — e.g. "Fall 2026"
- `slug` (slug, required)
- `startDate` (date, required), `endDate` (date)
- `registrationOpens` (date), `registrationDeadline` (date)
- `status` (string list: upcoming / open / in-session / closed)
- `note` (text) — e.g. "Evening cohort, West Chester campus"

The global "next cohort starts" cue is DERIVED by query (`*[_type=="term" && startDate > now()] | order(startDate) [0]`), not stored on `siteSettings`.

### `course` (collection)
- `title` (string, required) — human-readable, no course codes
- `slug` (slug, required)
- `summary` (text, max 240, required) — catalog card + meta description
- `coverImage` (image + alt)
- `level` (string list: Intro / Foundational / Advanced)
- `teachingAreas` (array of reference -> `teachingArea`, min 1 required) — drives catalog filter
- `instructors` (array of reference -> `facultyMember`, min 1 required) — the ONLY direction of the course/faculty link
- `format` (string list: In person / Hybrid; default In person)
- `location` (string) — venue/campus label
- `offerings` (array of object `courseOffering`): `term` (ref -> `term`, required — owns the dates), `schedule` (string, e.g. "Tuesdays 7-9pm, 8 weeks"), `sessions` (number), `seatsNote` (string), `status` (string list: open / waitlist / closed). No dates on the offering itself; dates come from the referenced `term`. The build resolves a derived **next offering** = the offering whose `term.startDate` is the soonest future date; the catalog card and facts strip read from it.
- `sessionOutline` (array of object `courseSession`): `title` (string), `focus` (text) — the numbered week-by-week arc
- `whoFor` (array of string) — 2-3 persona lines
- `priceTier` (reference -> `pricingTier`) + `priceNote` (string, optional). Display precedence: if `priceNote` is set it is shown verbatim; otherwise show `priceTier.amount` + `priceTier.unit`.
- `syllabusFile` (file, .pdf) — the lead-magnet download
- `featured` (bool), `startHere` (bool, the recommended starting course), `displayOrder` (number)
- SEO triad

Note: "Courses taught" on a faculty bio is derived from `course.instructors` via GROQ (`*[_type=="course" && references(^._id)]`); there is intentionally NO `facultyMember.coursesTaught` field, to avoid two-way-reference desync.

### `facultyMember` (collection — replaces `staffMember`)
- `name` (string, required), `honorific` (string: Dr. / Rev. / Dr. Rev.)
- `slug` (slug, required)
- `title` (string, required) — plain-English teaching role
- `photo` (image + alt)
- `teachingAreas` (array of reference -> `teachingArea`, min 1 required) — drives the faculty filter, shared vocabulary with `course`. Required so no teacher silently drops out of the filter.
- `specializations` (array of string, optional) — free-text narrow research interests distinct from the shared taxonomy (e.g. "Bavinck studies", "Second Temple Judaism")
- `degrees` (array of object `degree`, min 1 required): `degree` (string, e.g. "MDiv"), `field` (string, optional), `institution` (string, required), `year` (string, optional — string allows "in progress"). Institution required so "degree without institution" cannot render.
- `ordination` (string) + `denomination` (string list: PC(USA) / ECO / EPC / Other) — surfaced prominently
- `affiliations` (array of object): `role` (string), `organization` (string)
- `yearsTeaching` (string)
- `bio` (Portable Text, widened: normal/h3, bullet list, bold/italic, link) — scholarly but warm
- `humanLine` (string) — one disarming sentence
- `publications` (array of object `publication`): `title` (string), `publisher` (string), `year` (string), `url` (url, optional)
- `email` (string, optional), `displayOrder` (number)

### `testimonial` (collection — a re-add; an interior-designer `testimonial` type existed and was removed in the church remodel, so confirm no leftover `Testimonial` in `src/lib/sanity.types.ts` before adding)
- `quote` (text, required), `name` (string, required)
- `role` (string) — occupation ("Ruling elder", "Sunday-school teacher")
- `city` (string)
- `courseCompleted` (reference -> `course`, optional)
- `photo` (image + alt, optional)
- `featured` (bool), `displayOrder` (number)

### `pricingTier` (collection)
- `name` (string, required) — "Per course", "Audit", "Full Certificate Track"
- `slug` (slug)
- `amount` (number), `unit` (string: per course / per track / per term)
- `summary` (text), `includes` (array of string)
- `isAudit` (bool), `featured` (bool), `displayOrder` (number)

### New page singletons (all via the `definePageSingleton` factory in `churchPages.ts`, which gives each a hero set + SEO + `flexibleSections` + `finalCta`; per-page `extra.fields` enumerated below)
- **`coursesPage`** — `catalogIntro` (text), `filterLabel` fields, `startHereEyebrow`/`startHereHeadline`, `emptyState` (string).
- **`facultyPage`** — `directoryIntro` (text), `aggregateTrustLine` (string, e.g. "Every teacher is an ordained PC(USA) minister or a credentialed Reformed scholar"), `filterLabel`.
- **`pricingPage`** — `pricingIntro` (text), `scholarshipEyebrow`/`scholarshipHeadline`/`scholarshipBody` (Portable Text), `footnote` (string).
- **`getStartedPage`** — `requestForm` (reference -> `form`, required), `calendlyUrl` (url), `calendlyEyebrow`/`calendlyHeadline`/`calendlyBody`, `visitClassBody` (text), `syllabusBody` (text), `stepsHeadline` + `steps` (array of {title, body}).
- **`forYouPage`** — `personasIntro` (text), `personas` (array of object: `label`, `promise`, `cta` (ctaBlock)).
- **`resourcesPage`** — `listIntro` (text), `categoryChips` (array of string or ref to a resource taxonomy).

The express-interest form itself is configured on the referenced `form` document (native fields): first name, last name, email, phone (optional), course/track of interest (select), preferred term (select), format (select, if multiple), "Where are you in deciding?" (select: just exploring / planning to enroll / ready now), "How did you hear about us?" (checkbox), and an open "What are you hoping to learn?" (textarea). No payment fields.

---

## 4. Content model — modified existing types

### `event` (repurpose, keep collection)
- Change `category` options to: Info Session, Open Lecture, Workshop, Webinar / Online, Term Start, Application Deadline, Community, Other. (Webinar/Online covers the brief's "webinars" without a full online-course modality.)
- Remove `liturgicalSeason` and `specialService` (church-only), via schema removal + reseed on placeholder data; never the Studio "Remove field" button on a live dataset.
- Keep `eventType` (recurring/oneTime), `start`/`end`, `location`, `registrationUrl`/`registrationLabel`, `cost`, `image`, `featured`.
- Reseed AFTER the schema change so no event keeps an orphaned `category: "Worship"`.

### `siteSettings` (trim church plumbing, add school identity)
- Remove/retire: `worshipService` (and the `serviceTime.ts` chain it feeds — see §6), `watchUrl`, `giveUrl`, `appUrl`, `directoryUrl`, `prayerUrl`, `pastorEmail`.
- Keep: `title`, `tagline`, `mission`, `email`, `phone`, `officeHours`, `favicon`, `addressLine`, `cityStateZip`, geo, `navItems`, `footerColumns`, socials, `seoImage`, `newsletter`, footer credit.
- Add: `denominationStatement` (text — the PC(USA)/Reformed footer line), `admissionsEmail` (string), `mapEmbedUrl` (url, contact page). The "next cohort starts" cue is derived from `term` by query, NOT stored here.

### `aboutPage` (absorb the beliefs content)
Add the What We Believe fields previously on `beliefsPage` (scripture quote, distinctives cards, statement-of-faith body) so About becomes the single identity page.

### `faqPage.categoryOrder` defaults
Reseed categories to: Courses & Format, Cost & Scholarships, Who It's For, Reformed Identity, Getting Started.

### `homePage`
Retire the church-specific field groups (`thisSunday`, `seasonalHero` Advent framing, `serviceBand`, `weeklyRhythms`, the inclusive-welcome band) and add the school home fields (wayfinding tiles, start-here rail selection, stat/heritage band items, faculty-strip selection). Detailed field diff in the build plan.

### `blocks.ts` -> `sectionDynamicList.source` (update the enum NOW, with the schema work)
Replace the church source options (`latestSermons`, `ministries`, `staff`, `worshipResources`) with school sources (`featuredCourses`, `upcomingEvents`, `faculty`, `latestResources`). The matching switch in `src/components/blocks/DynamicListBlock.astro` and the helper functions in `src/lib/queries.ts` must change in the same pass (see §6).

### `staffMember` -> retired
Introduce `facultyMember` as a NEW type rather than mutating `staffMember` in place (avoids the destructive "Remove field" path and keeps the diff clean). Remove `staffMember` from registration + desk after faculty is seeded; delete its placeholder docs in the reseed; remove the `staff` source from `sectionDynamicList` and the `staffMember` case from `urlForDoc` in the same schema pass so nothing dangles.

---

## 5. Studio registration + desk structure

Singletons are wired across FOUR coordinated places (the review corrected my earlier "three"):

1. **`studio/schemaTypes/churchPages.ts`** — this factory file DEFINES the 11 church page singletons via `definePageSingleton(...)`, collected into `churchPageSingletons` (~line 584) and `CHURCH_PAGE_TYPES` (~line 599), then spread into `index.ts`. Build the NEW school singletons with this same factory here (or a parallel `schoolPages.ts`), and retire the church ones by removing them from this file's arrays.
2. **`studio/schemaTypes/index.ts`** — import + add each type to the `schemaTypes` array (the church set is spread in via `...churchPageSingletons`).
3. **`studio/sanity.config.ts`** — add each singleton to the `SINGLETON_TYPES` set (~lines 218-240) AND add a `case` in `urlForDoc()` (~lines 106-123, which also has collection cases for `sermon`/`staffMember` to remove).
4. **`studio/structure.ts`** — add to its own `SINGLETON_TYPES` array + `HIDDEN_FROM_DEFAULT` set (~lines 40-81) and place it in the desk tree via the `singleton(...)` helper (~lines 154-208).

Note for the build: these four lists are hardcoded in parallel and do NOT auto-derive from `CHURCH_PAGE_TYPES`, so each must be edited by hand and kept in sync.

Desk tree (proposed): **How This Works** -> **Site Settings** -> **Pages** (home, courses, faculty, about, events, resources, pricing, get-started, for-you, faq, contact, privacy, 404, + Custom Pages) -> **Catalog** (course, term, teachingArea, pricingTier) -> **People** (facultyMember) -> **Content** (testimonial, faqCategory, faqItem, form, announcement) -> top-level **Events** list. Remove the Sermons list and the church Content entries (`ministry`, `worshipResource`, `staffMember`).

After all schema changes: `npm run typegen` then `npm run studio:deploy`, then commit. Never click "Remove field" in the hosted Studio.

---

## 6. Code-integration landmines (must-fix during build; expanded post-review)

**CRITICAL**
- **`churchPages.ts` factory file** (see §5.1) defines all church page singletons and exports `CHURCH_PAGE_TYPES`. Retirement happens here, not by deleting 11 separate files.
- **`serviceTime.ts` full consumer chain** — removing `src/lib/serviceTime.ts` requires touching every importer: `src/components/Header.astro` (`:23,75`, utility-bar time), `src/components/Footer.astro`, `src/pages/index.astro` (`:26,157`), `src/pages/worship.astro` (retired anyway), `src/lib/schemas.ts` (`:11,40`, JSON-LD opening hours), `src/lib/siteSettings.ts` (`worshipService` flows through `resolveSiteSettings`, ~`:52,107,185`), and the `worshipService` projection in `src/lib/queries.ts`. Pull `worshipService` from the schema AND from `siteSettings.ts` + `queries.ts`, or types break.
- **JSON-LD `churchSchema()`** in `src/lib/schemas.ts:35-90` emits `'@type': 'Church'` (`:54`), `'@id': '.../#church'` (`:55`), and an `openingHoursSpecification` (`:75-80`) from `serviceTime`. It is injected on every page by `src/layouts/BaseLayout.astro:104,169`. Rename to an `EducationalOrganization` schema, drop the opening-hours block, fix the `@id` anchor, and update the BaseLayout call site. Orphaned `serviceListSchema`/`projectSchema` exports (point at `/services`, `/portfolio`) can be deleted.
- **`public/llms.txt`** is hardcoded church content shipped to crawlers — it lists every retired route as a live link and describes "a welcoming church." Regenerate (`npm run llms:full`) or hand-rewrite to the school routes.
- **`scripts/generate-og-pages.mjs`** has a hardcoded `SINGLETONS` array (`:84-103`) of church pages with church default titles, and a church `WORDMARK` default. Rewrite to the school singletons or new routes get no per-page OG card (silent fallback to `og-default.png`).

**SHOULD-FIX**
- **`src/components/CtaLink.astro` route table** (`TYPE_TO_PATH`, `:61-82`) hardcodes church singleton -> path; fallback is `/contact` (`:49`), so a missed/renamed type silently lands on Contact. Replace with the new singleton routes.
- **`studio/schemaTypes/ctaBlock.ts` `internalLink.to[]`** (`:49-59`) lists the 11 church singletons; both files carry "keep these two in sync" comments. Every type in `ctaBlock.ts` `to[]` needs a matching `TYPE_TO_PATH` entry in `CtaLink.astro`.
- **`src/components/Header.astro` has THREE church couplings:** `FALLBACK_NAV_ITEMS` (`:130-151`, the default nav), the utility bar rendering `serviceTimes` + Watch Live + Give (`:204-233`, via `watchHref`/`giveHref` from `siteSettings.ts:186-187`), and a hardcoded "Plan a Visit" CTA -> `/worship` (`:371-380`). All three must be reworked to school equivalents.
- **`src/components/blocks/DynamicListBlock.astro`** (`:23-53`) branches on `latestSermons`/`upcomingEvents`/`ministries`/`staff`(->`/pastor-staff`)/`worshipResources`, pulling from `queries.ts` helpers (`getRecentSermons`/`getWorshipResources`/`getMinistries`/`getStaffMembers`). Rework the switch + the `queries.ts` helpers to school sources, in sync with the `blocks.ts` enum (`:488-502`).
- **`urlForDoc()` collection cases** in `sanity.config.ts` (`sermon` `:122`, `staffMember` `:123`) need removal alongside the singleton cases.

**NICE-TO-HAVE / NOTE**
- **`@astrojs/sitemap`** (`astro.config.mjs:21`) auto-generates the sitemap from built pages (only `/404` filtered), so retired routes drop and new ones appear with no manual edit. There is NO `public/robots.txt` source file in the repo (CLAUDE.md lists one as foundation; confirm the actual generation path before assuming an edit target).
- **Arch motif as church iconography** — `ArchOrnament.astro` / `ArchMedia.astro` / `.arch-top` describe themselves as "the sanctuary's Romanesque arched windows / the nave elevation." This is a Phase-3 design-language decision (brief: rethink or drop the arch), flagged here so it does not silently survive.

---

## 7. Build sequencing (preview; detailed plan authored in Phase 4)

Schemas + `sectionDynamicList`/`ctaBlock`/`urlForDoc` updates + `typegen` + `studio:deploy` -> retire church types + desk cleanup (`churchPages.ts`, the four parallel lists) -> placeholder seed (terms, teaching areas, ~8-12 courses, ~6-8 faculty, testimonials, pricing tiers, events, resources) -> Phase 3 design language -> page/section components -> remove church routes + fix `CtaLink`/Header/`serviceTime`/JSON-LD/`llms.txt`/OG-pages -> wire express-interest form + Calendly + newsletter -> verify (both themes, both viewports, Lighthouse 100s) -> PR -> merge -> `studio:deploy`.

---

## 8. Seed-phase voice guardrail (applies to all placeholder copy in Phase 4)

Every seeded Sanity string is live site copy and MUST follow `docs/brand/voice.md` and the CLAUDE.md rules:
- **No em-dashes** in any visitor-facing copy (course summaries, faculty bios, testimonials, page copy). Use commas, colons, or split sentences.
- **Banned vocabulary** includes the generic AI-tells (delve, leverage, robust, seamless, elevate, transformative, curated experience, tailored solutions, etc.) and the church-copy bans (worship experience, life-changing, do life together, on fire for, authentic community). Watch that testimonials read transformation-focused WITHOUT the banned "life-changing"/"transformative."
- **Faculty bios** carry the research §G guardrails: credentials present but lightweight, always wrapped in one warm human line. No endowed-chair titles, rank ladders, exhaustive degree stacks, output-bragging, or CV downloads.
- **About / What We Believe** pairs every confessional cue with a pastoral counterweight ("rooted in the Westminster Standards, taught for ordinary believers"). Confident and specific, never an academic wall.
- **Courses** use human-readable titles, no course codes, no academic-Latin term names.

---

## 9. Open sub-decisions (sensible defaults chosen; confirm at approval)

1. **`ministry` type:** propose retiring it (not needed for v1). If a "tracks / certificate programs" layer above courses is wanted later, repurpose it then. Default: retire.
2. **Resources route name:** keep the existing `/journal` URL or rename to `/resources`? Default: `/resources` (clearer for a school); renaming touches the route file + internal links (and a redirect is cheap on Cloudflare).
3. **Webinars:** added as a `Webinar / Online` event category (cheap, covers the brief). Full online-course delivery stays out of v1.
4. **Locations:** single campus (West Chester Township, OH) as a string on course/siteSettings, vs a `location` type if multiple venues. Default: string field now, promote to a type only if multiple campuses appear.
5. **Aggregate trust line** (e.g. "Every teacher is an ordained PC(USA) minister or credentialed Reformed scholar") is an editable string on `facultyPage`, not a computed stat, for v1 simplicity.
