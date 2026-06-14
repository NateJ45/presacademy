# Lay Theological School — IA / UX / Feature Patterns Report

- Date: 2026-06-13
- Status: Phase 1 deliverable (research). Pending user approval before Phase 2 (IA + content model).
- Purpose: turn the `ncs-presacademy` church starter into The Presbyterian Academy, a PC(USA) Reformed lay-formation school, with a section/component language that reads unmistakably as a credible school, not a recolored church. Brand tokens (Oxblood & Stone, Fraunces + Source Sans 3) are locked; this report is about structure only.

## Method

Eight respected institutions were studied for IA/UX/feature patterns (not branding): Ligonier Connect, BibleProject, Regent College, Davenant Hall, C.S. Lewis Institute, Reformed Theological Seminary, Princeton Theological Seminary, Westminster Theological Seminary. Findings were synthesized across four lenses (IA + course catalog/detail, faculty presentation, conversion flows, trust + money), then mapped onto this codebase. The throughline: keep the credibility signals of a serious Reformed institution, deliver them in the plainspoken warm register of a school for ordinary adults, and make every section read as a place you enroll to learn.

This report pairs each recommendation with the concrete codebase surface it touches, so Phase 2 (schema) and Phase 4 (build) can move fast.

---

## A. Recommended IA / sitemap

**Primary nav (content-forward, low to high commitment):**
`Courses` · `Faculty` · `About` · `Events` · `Resources` — with a persistent primary CTA pair in the header ("Request info" / "Book a free intro").

Faculty is promoted into the nav because, for a lay school, the teachers are both the draw and the social proof. No "apply/enroll portal" anchors the bar; the high-intent path lives on a Get Started hub and is repeated per course.

**Full page list:**

| Page | Purpose | Codebase action |
|---|---|---|
| `/` Home | One thesis line, identity, wayfinding, proof, conversion. | Rebuild `src/pages/index.astro` sections (see B). |
| `/courses` | Browsable catalog + filters + "Start here" rail. | New page + `course` collection. |
| `/courses/[slug]` | Fixed course-detail template. | New dynamic route (model on `events/[slug]`). |
| `/faculty` | Filterable teacher roster. | Rebuild `pastor-staff.astro` -> `/faculty`. |
| `/faculty/[slug]` | The credibility engine (degree+institution, ordination, courses taught). | New detail route; `facultyMember` schema. |
| `/about` | Mission, Reformed identity, What We Believe, history, Statement of Faith, leadership. | Repurpose `about.astro`; fold in `what-we-believe`. |
| `/events` + `/events/[slug]` | Cohort starts, info sessions, open lectures, intensives, deadlines. | Reuse Events module; trim liturgical fields. |
| `/resources` (+ detail) | Teaching articles / formation essays (SEO + funnel). | Reuse the `/journal` route + `page`/blocks. |
| `/pricing` Pricing & Scholarships | Plain price (or "free, and here's why") + scholarship posture. | New singleton + optional `pricingTier`. |
| `/get-started` | Express-interest hub: request-info form + free-intro (Calendly) + free first lesson. | New page; reuse `form` + `CalendlyInline`. |
| `/for-you` (optional) | Named lay personas, each resolving to one CTA. | New page (recommended, see G). |
| `/faq` | Grouped Q&A (cost, format, who it's for, Reformed identity). | Reuse `faqItem`/`faqCategory`. |
| `/contact` | Named humans, direct email, phone, map only if a physical site. | Repurpose `contact.astro`. |
| `/privacy`, `/404`, sitemap | Standard. | Keep. |

**Church pages dropped (no school analog):** `/worship`, `/sermons` (+ the sermon module), `/give`, `/serve`, `/kids`, `/food`, `/music`, `/weddings`, `/use-our-space`, `/grow`. `/what-we-believe` is folded into About rather than kept as a standalone confession page.

---

## B. Homepage section order

Identity first, proof second, catalog third, conversion last (the convergent WTS/RTS/PTS/Davenant spine), tuned for a lay learner.

1. **Hero** — one plainspoken thesis line (who the school is for). CTA: primary "Browse courses," secondary "Book a free intro."
2. **Identity / founding block** — short warm statement of Reformed (PC(USA)) identity + founding story. CTA: "About the Academy."
3. **Wayfinding grid** — four tiles (Take a course / Meet the teachers / Find your path / Start free). Each links onward.
4. **"Start here" rail** — one or two featured courses + one explicitly recommended starting course (BibleProject's anti-choice-paralysis move). CTA: "Start this course."
5. **Social proof: testimonials + stat/heritage band** — named lay learners (occupation + city) above a single repeated stat band (founded year + founder, learners formed, faculty ordination rate).
6. **Course catalog preview** — three to six cards + "See all courses."
7. **Faculty strip** — three or four portraits with the degree line under each name. CTA: "Meet the faculty."
8. **Final CTA block** — dual soft "Request info" + hard "Start a course," plus a one-line newsletter capture.

This replaces the current home structure (split arched hero, oxblood service-times band, inclusive-welcome band, get-involved ministry cards, weekly-rhythms teaser) which is church-shaped end to end.

---

## C. Course catalog + course detail

**Catalog filters (3 to 4 axes, lean, not a heavy faceted sidebar):**
1. **Topic / subject** from ONE shared taxonomy reused on the faculty directory (~8-11 plain-English areas: Scripture, Reformed Theology, Prayer & Spiritual Life, Church History, Leading a Group, etc.).
2. **Teacher**, with per-teacher counts ("Rev. Jane Doe (4)"), because the faculty are the draw.
3. **Format** (only if more than one modality ships).
4. **"Free only" toggle** to surface the free/paid boundary at a glance.

Pin one or two featured courses above a "Recommended starting course" rail.

**Course-card fields (no price, no rating on the card):** cover artwork, title (human-readable, no course codes), instructor name at equal weight to the title, a time-commitment chip ("8 sessions, ~6 hrs"), optional badge ("Free" / "Start here" / "New cohort").

**Course-detail anatomy (fixed across every course):**
1. Title + instructor (instructor linked to bio).
2. **At-a-glance facts strip** — format, length / session count, cost or "Free," next cohort start (the single most reusable detail-page component; model on the existing `events/[slug]` header).
3. Plain-language overview / value prop.
4. **"Who this is for"** — two or three named human personas, not an adjective list.
5. **Numbered module / lesson list** with per-item runtime; lesson 1 free to preview (the most school-like component on the site).
6. Instructor credibility block (portrait, degree-with-institution, ordination, link to full bio).
7. Final CTA pair (soft "Request info" + hard "Express interest / Start"), repeated top and bottom.

---

## D. Faculty (the differentiator)

This is where the build most decisively stops reading like a church staff page. The current `staffMember` schema is seven lightweight fields (name, role, photo, email, bio, favorites, displayOrder). The school needs a structured credibility instrument.

**Listing:** a text-forward directory with a uniform portrait treatment (so no teacher reads as "lesser"), filterable by teaching area from the shared taxonomy. Each card leads with Honorific + Name + Role, with the degree-with-institution line directly under the name.

**`facultyMember` field set (single Sanity schema, fixed stack):**

| Field | Credibility note |
|---|---|
| Honorific | Dr. / Rev. |
| Full name | Heading. |
| Role / title | Plain-English ("Teacher of Scripture"), not endowed-chair language. |
| `degrees[]` | Each = degree + field + granting institution as SEPARATE subfields, so it always renders "MDiv, Pittsburgh Theological Seminary." Make degree-without-institution structurally impossible. |
| Ordination status + denomination | The PC(USA)/Reformed differentiator a church staff page lacks. Surface prominently. |
| Years serving / teaching | Scholar-practitioner signal. |
| Teaching areas | From the ONE shared taxonomy (drives faculty filter + course filter). |
| Narrative bio | Portable text, widened from the current bio block to allow headings/lists/links; warm and plainspoken. |
| One warm human line | A disarming sentence so depth reads inviting, not ivory-tower. |
| `publications[]` | title + publisher + year (structured); optional, so lay teachers without books still read serious. |
| `coursesTaught[]` | References to `course` docs; renders as linked tiles, reciprocal with the course-detail instructor link. |

**Two structural rules:** one shared teaching-area taxonomy filters both `/courses` and `/faculty`; bios cross-link reciprocally to courses. Consider an aggregate trust line ("Every teacher is an ordained PC(USA) minister or a credentialed Reformed scholar") if the numbers support it.

---

## E. Conversion

All capture is express-interest only (no payment/enrollment), plus a Calendly free-intro and a newsletter. Two tracks by commitment: soft "Request info" everywhere, free-intro as the warmest next step.

**Express-interest form (one screen, routes to a named person, not `info@`):** first name, last name, email, phone (optional), course/track of interest (dropdown), preferred start/term (dropdown), format (if multiple), "Where are you in deciding?" (just exploring / planning to enroll / ready now), "How did you hear about us?" (checkboxes), an open "What are you hoping to learn?" box, simple anti-spam (no math captcha). Confirmation points to the free first lesson and the Calendly intro. Build on the existing `form` schema + `FormRenderer.tsx`.

**Free-intro:** a `/free-intro` (or section of `/get-started`) with the existing `CalendlyInline.tsx` inline widget for a free 1:1 intro or "sit in on a class." Pair with lesson 1 of every course free to watch, no account wall (the highest-leverage conversion asset). Optional audit/listen-only framing surfaced via the catalog "free only" toggle.

**Newsletter / lead magnet:** a named bundle with a concrete incentive ("a short intro video series + a downloadable study guide"), not a generic "subscribe." Fields: email + first name + interest-area checkboxes so subscribers self-segment. Optional per-course syllabus/study-guide PDF behind a short email form as a second lead magnet. Reuse `NewsletterSignup.tsx`.

---

## F. Trust + money

**Testimonials / social proof:** card fields = name + role/occupation + city + (where applicable) course completed, with a short transformation-focused quote. Mirror the target personas in WHO you quote (small-group leader, ruling/teaching elder, Sunday-school teacher, parent). No star ratings. There is NO `testimonial` type in the repo today (it was removed in the church remodel), so this is a new schema. Build ONE repeated stat/heritage band (founded year + named founder, learners formed, faculty ordination rate) reused on home, about, and the pricing page. Heritage/longevity anchors substitute for review volume. If a recognized Reformed voice will endorse, add an outside-endorsement line.

**Pricing & scholarships:** say the price plainly (a Ligonier/Davenant posture and a hard CLAUDE.md voice rule). State per-course price with bundle math if courses stack into a track. Show any audit/listen-only price beside the full price to legitimize the low-commitment on-ramp. Pick one scholarship posture and commit: either name each award with its exact figure (RTS/WTS), or, if donor-funded and free, say so plainly and explain why ("already provided for by our supporters") and make affordability itself the accessibility story.

**Reformed-identity signaling (About scaffold):** Mission -> What We Believe (name the Westminster Confession + Catechisms and PC(USA) standards explicitly) -> How We Define Formation -> History (founder + year) -> Statement of Faith. Render the core distinctives as a small crest/shield set for scannability. Pair every confessional cue with a pastoral counterweight ("rooted in the Westminster Standards, taught for ordinary believers"). Confident and specific, never academic.

---

## G. Distinctiveness playbook — reads as a SCHOOL, not a recolored church

The church identity lives in five tight code locations (see the codebase orientation): the `--arch-radius` token + `.arch-top`/`.arch-top-sm` utilities, the `chapel` oxblood band tokens + `surface-chapel`, `ArchOrnament.astro`, the keyword-emphasis split (`splitHeadline` in `index.astro` + `keyword` in `Hero`/`FinalCta`), and the `SectionHeading` eyebrow -> gold-hairline -> serif rhythm. Reworking those is how the build sheds the "historic chapel" read while keeping the brand tokens.

**DROP (church archetypes that betray the origin):**
- The worship-service-time singleton (`siteSettings.worshipService`) and all `serviceTime.ts`-derived "Sundays at 10am" strings. A school has cohort start dates, not a service time.
- The `/worship` plan-a-visit page, the sermon module, `/give`, and the church-life pages.
- "Meet the team / our staff" as a ministry-bio grid.
- Home idioms: "Join us this Sunday," "Plan your visit," the service-times hero band, a directions-first contact page.
- The arch-top image motif and `ArchOrnament` as the universal signature (the brief explicitly flags rethinking it). A school has no building to evoke.

**REPLACE (same slot, school component):**
- Staff grid -> faculty directory + structured bio (section D).
- Sermon archive -> course catalog with time-commitment chips and free-first-lesson previews.
- "Plan a visit" -> free-intro (Calendly) + free first lesson + `/for-you` personas.
- Service-time hero band -> "Next cohort starts" + "Start here" recommended-course rail.
- Weekly-giving page -> support/scholarships (or omit).
- Events-as-church-calendar -> cohort starts, info sessions, intensives.

**INTRODUCE (section archetypes a church site never has):**
- At-a-glance facts strip on every course (format / length / sessions / cost / start date).
- Numbered module/lesson list with per-item runtime and a free lesson 1.
- "Who this is for" persona blocks + a `/for-you` lay front door.
- Time-commitment chip on every course card.
- Degree-line-under-the-name on every faculty card and bio header.
- One shared teaching-area taxonomy wiring Courses <-> Faculty reciprocally.
- Stat / heritage band reused across home/about/pricing.
- Plainly-stated price (or "free, and here's why") plus an audit tier.
- Reformed-identity crest/shield set + Statement of Faith scaffold on About.

**A divergence move on the signature shape:** replace the Romanesque arch (a building cue) with a school-appropriate structural motif. Candidate directions for Phase 3: a flat editorial "catalog card" system with a thin brass top-rule and squared corners (reads like a printed course bulletin), or a ruled "syllabus" grid. The point is a new repeatable shape with the same brand color, not the arch.

**Hard "avoid" guardrails (don't over-correct into a seminary):** no course codes ("BIBL 503"), credit-hour maps, PDF-only registrar catalogs, or academic-Latin term names; no endowed-chair titles, rank ladders, exhaustive degree stacks, output-bragging, or downloadable CVs (keep credentials present but lightweight, wrapped in one warm human line); no gated "apply" wall, external admissions portal, price-coyness, or long intent-mining intake.

---

## H. Content-model implications (preview for Phase 2)

New document types: `course`, `facultyMember` (replacing `staffMember`), `testimonial`, `pricingTier` (if priced), `teachingArea` (the shared taxonomy, or a string list), plus page singletons `coursesPage`, `facultyPage`, `pricingPage`, `getStartedPage`, and optionally `forYouPage`. Repurpose `event` (trim `liturgicalSeason`/`specialService`), reuse `faqItem`/`faqCategory`, `form`, `ctaBlock`, `embed`, `announcement`, `page` + the 16-block page-builder. Retire `sermon`, `sermonsPage`, `worshipResource`, and the church page singletons.

Two integration landmines for Phase 2/4: every new singleton must be registered in three files that must agree (`studio/schemaTypes/index.ts`, `studio/sanity.config.ts` SINGLETON_TYPES + `urlForDoc()`, `studio/structure.ts`), and the hardcoded CTA route table in `CtaLink.astro` must be updated on every page rename or internal CTAs silently fall back to `/contact`. After any schema change: `npm run typegen` then `npm run studio:deploy`, and never click "Remove field" in the hosted Studio.
