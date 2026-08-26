# Page-builder conversion plan — same pixels, editor-owned structure

**Written 2026-08-26. Status: PLANNED, not started.**

Convert the 13 bespoke singleton pages into a Sanity page-builder (the WCP
shape: one renderer, sections arrays, brand-locked schemas) **without changing
a single rendered pixel**. The constraint that shapes every decision below:
this is a *conversion*, not a redesign. Markup is moved, never rewritten.

Why: the Studio's Presentation preview can only be trustworthy when the page
and the preview share one renderer (see how home earned full fidelity via the
shared `HomeBody`); editors gain add/reorder/remove on real pages; new pages
stop needing code. The full argument and WCP precedent live in the repo's
CLAUDE.md ("Live draft preview") and the WCP repo's `docs/PAGE_BUILDER.md`.

The complete per-page section inventory that grounds this plan was surveyed
on 2026-08-26; the load-bearing findings are inlined below.

---

## The four governing decisions

### D1. Ported sections do NOT join SectionShell (pixel-exactness wins)

The 19 existing blocks are tone-adaptive (`opacity-70`, `SectionShell`
backgrounds) so editors can recolor them. The bespoke pages are art-directed
Rule & Ledger (`text-foreground/80`, `bg-gold/50` hairlines, `border-t-2
border-gold` cells, ledger dividers). **Those two are mutually exclusive**:
wrapping ported markup in SectionShell means subtly different pixels.

So the ported types render their own exact markup with their surfaces fixed
in code, and expose **no background/tone field at all**. This is the WCP
brand-lock philosophy taken one notch further: editors control *which
sections in what order*, never how they look. The existing 19 tone-adaptive
blocks remain available alongside them for free-form content.

### D2. Heroes and the final CTA stay PAGE-LEVEL fields — only the body converts

Every singleton already has hero fields and finalCta fields that editors know.
They stay exactly where they are (no churn, no way for an editor to delete the
page's h1). What converts is the middle: the bespoke body sections become
members of the page's existing `flexibleSections` array (retitled "Page
sections" in the Studio), which today sits second-to-last and will become the
whole body.

The hero VARIANT per page (split / text+rule / text+trustLine / image) is a
small static map in the new singleton renderer — code doctrine, mirroring how
`SINGLETON_BY_PATH` already works. FinalCta renders last, from the page's
fields, exactly as today (privacy/accessibility have none and keep having
none).

### D3. Fallback literals become DEFAULT SECTION ARRAYS in code

Today every page carries `??` fallback copy (~250 lines across 13 pages), so
an empty dataset — including the CI credential-less build — renders a
complete, correct page. That behavior is load-bearing (CI's axe/reflow
sweeps run against it) and must survive.

Mechanism: each converted page keeps a `DEFAULT_SECTIONS` array in code
(the same literals, restructured as section data) that the renderer uses
when the Sanity doc has no sections. The seed scripts write the same content
into Sanity so editors see and own it; if they delete everything, the page
falls back to defaults instead of going blank. Empty-env CI renders
byte-identically to today.

### D4. Additive migration, instant rollback

Seed scripts only ever WRITE the sections arrays; every existing singleton
field is left untouched until the final cleanup phase. Rolling back a
converted page = `git revert` of its commit (the old page file returns and
reads the old fields, still present). No content is destroyed mid-flight.
Old-field cleanup (patch scripts + schema removal) happens only after all
pages are verified live — and never via the Studio's "Remove field" button
(CLAUDE.md gotcha).

---

## New section-type vocabulary (~15 types)

Grouped in a new fifth insert-menu band, **"Page sections (Rule & Ledger)"**
(`INSERT_MENU_GROUPS` throws at Studio load if any member is unassigned —
that guard stays). Every enum that drives rendering joins `NON_STEGA_FIELDS`
in `src/lib/cms-preview.ts` (the stega-on-enum trap).

| Type | Replaces (page#section) | Notes |
|---|---|---|
| `sectionPageHeader` | about#1, courses#1, events#1, pricing#1, get-started#1, for-you#1, resources#1, faculty#1 | 8×. eyebrow + h1 + subhead + optional intro paragraph; variant `rule` \| `trustLine` \| `none`. *Rendered by the hero map (D2), not editor-placed — listed here because it's the shared component the map uses.* |
| `sectionNumberedCards` | about#3 beliefs, get-started#3 steps, for-you#2 personas, home#2 wayfinding | 4×. Border variant `top2` \| `full` \| `ledger`; optional footnote; optional per-card CTA (`CtaLink`). |
| `sectionCourseRail` | home#3, home#6, courses#2 | 3×. **Auto**: `source: startHere \| featured`; `dedupeAgainstStartHere` boolean re-derives home's rail dedup inside the block (it refetches start-here slugs); adaptive column count ported verbatim (3/2/1 by result length). |
| `sectionLedgerStats` | home#4, pricing#4 | 2×. Ruled band; `count: true` items keep `data-countup`. |
| `sectionEditorialColumns` | about#2 mission, about#4 teach/why | 2×. 1–2 columns; optional `[200px_1fr]` label layout; `reveal-l`/`reveal-r` preserved. |
| `sectionLegalBody` | privacy#2, accessibility#2 | 2×. `lastUpdated` + PT body, `max-w-3xl`; keeps the empty-email link guard and the landmark `aria-label` distinct from the hero (both test-guarded). |
| `sectionFacultyRail` | home#7 | Auto, `FacultyCard` grid. |
| `sectionTestimonialRail` | home#8 | Auto, `getFeaturedTestimonials`. |
| `sectionInlineBand` | about#5 faculty band | Bordered strip, copy left / pill CTA right. |
| `sectionTicker` | home#5 | Decorative marquee, `aria-hidden`. |
| `sectionEventGrid` | events#2 | Auto upcoming events; 1-vs-N column logic and `whenLabel()` formatter move in verbatim. |
| `sectionRuledList` | events#3 recurring rhythms | Auto recurring events with the 3-item fallback. |
| `sectionFaqGrouped` | faq#2 | Auto; `categoryOrder` grouping, PT-or-string answers. FAQPage JSON-LD stays page-level (frontmatter still fetches the faqs to build it). Distinct from the flat `sectionFaqList`. |
| `sectionContactDetails` | contact#2 | Icon list from siteSettings + who-to-reach + getting-here + map iframe; keeps the empty-email guards. |
| `sectionRequestPanel` | get-started#2 | Narrow bespoke type: form + Calendly aside 2-col, env-var fallback (`PUBLIC_CALENDLY_URL`), mailto fallback. |
| `sectionScholarship` | pricing#3 | Or fold into `sectionEditorialColumns` with a `warm` surface variant if exact. |

**Existing blocks patched, not duplicated** (the only two reuse wins):
- `sectionForm` gains `eyebrow` + `headingId` → renders contact#3 exactly.
- `sectionPricingTiers` gains `headingLevel` → renders pricing#2 exactly.

**Stays code, deliberately** (not sections): the courses catalog (React
`CourseFilters` island + 4-collection facet counting), the faculty roster
(`FacultyFilter`), all JSON-LD / breadcrumb emission (page frontmatter), the
detail routes (`courses/[slug]` etc.), 404, style-guide. On courses/faculty
these code regions render between the sections array and FinalCta, pinned by
the singleton renderer's per-page map — same doctrine mechanism as heroes.

**Cross-cutting rules for every ported type** (all test-guarded today):
- `headingId` field with a deterministic fallback, so `aria-labelledby`
  landmarks stay unique per page (today's ids ported into the seeds).
- Heading levels: ported blocks render h2 (cards h3), matching today. The
  Checkup tool gains a rule: "page body starts at h2, no skipped levels".
- Motion attributes (`data-reveal`, `data-stagger-grid`, `data-countup`,
  `kinetic-words`, `marquee__*`) move with the markup — grep-verify each.
- Date formatters stay three separate functions (they differ on purpose).

---

## The renderer

One new `src/components/SingletonPage.astro` (used by all 13 page files AND
the preview route — the HomeBody contract, generalized):

```
props: { pageType, page, settings, ...auto-data }
  → hero (variant from the per-page map, fields from `page`)
  → SectionsRenderer(page.flexibleSections ?? DEFAULT_SECTIONS[pageType])
  → pinned code regions (courses catalog / faculty roster), if any
  → FinalCta (from page fields; skipped for privacy/accessibility)
```

`Sections.astro` grows the ~15 new type mappings (ported blocks rendered
OUTSIDE SectionShell, per D1). Auto blocks fetch through the same
`fetcher`-parameterized query functions established for HomeBody, so the
preview passes its draft fetcher and even auto sections are draft-aware where
the underlying query supports it (collection data previews as published — the
same as today — until a block's queries are parameterized; do them as they
convert).

Each page file shrinks to: queries + JSON-LD + `<BaseLayout><SingletonPage/></BaseLayout>`.
The preview route's generic branch renders `SingletonPage` with the draft
fetcher — the per-page conversion **automatically upgrades that page's
preview to full fidelity**, and the HomeBody special case is deleted when
home converts.

---

## Verification harness (built once, in Phase 0)

`scripts/page-parity.mjs`: builds the site, saves each converted page's
rendered HTML normalized (strip hashed asset names + whitespace), and diffs
against a `scripts/.parity/` snapshot captured BEFORE the page converted.
A page's conversion is done only when:

1. `page-parity.mjs` reports zero meaningful diff against its pre-conversion
   snapshot (allowed diffs are listed per page in the script, e.g. sanity
   `data-sanity` attributes in preview builds);
2. the full suites pass (68 unit + 109 Playwright incl. axe light/dark and
   320–1440 reflow) — plus once per phase, the empty-env run
   (`PUBLIC_SANITY_PROJECT_ID="" npx playwright test`) proving D3 held;
3. the page AND its `/preview` render are eyeballed in a real browser with a
   clean console (the "curl is not verifying" gotcha);
4. the Studio desk opens the page's sections without warnings (typegen run,
   insert-menu guard passing).

---

## Phases and order (easy → hard; home last)

**Phase 0 — foundations** (one session)
`SingletonPage.astro` skeleton + hero-variant map; `sectionPageHeader`;
parity harness + pre-conversion snapshots of all 13 pages; insert-menu group;
`NON_STEGA_FIELDS` additions; `headingId` helper; Checkup heading rule;
retitle `flexibleSections` → "Page sections". Also fix in passing: add
`accessibility` + `style-guide` to `[slug].astro`'s RESERVED set (existing
route-collision gap the survey found).

**Phase 1 — prove the loop** (one session)
`resources` (already 90% builder) → `privacy` → `accessibility` (twins,
`sectionLegalBody`) → `for-you` (`sectionNumberedCards`). Four pages, four
commits, each deployed and parity-verified before the next.

**Phase 2 — the middle weight** (one to two sessions)
`pricing` (patched `sectionPricingTiers` + `sectionLedgerStats` +
scholarship) → `about` (editorial columns, numbered cards, inline band) →
`faq` (`sectionFaqGrouped`, JSON-LD stays frontmatter) → `events`
(`sectionEventGrid` + `sectionRuledList`) → `contact` (patched `sectionForm`
+ `sectionContactDetails`) → `get-started` (`sectionRequestPanel` +
numbered steps).

**Phase 3 — pages with pinned code regions** (one session)
`courses` and `faculty`: hero + rails convert; catalog/roster stay pinned
code regions in the renderer map. Documents the pinned-region pattern.

**Phase 4 — home** (one session)
Cheapest conversion relative to its weight: HomeBody is already extracted and
componentized, so this is mostly slicing HomeBody into the section types
(most already exist by now: course rail ×2, faculty rail, testimonial rail,
ledger stats, numbered cards, ticker) + `sectionHeroSplit` handled by the
hero map. Delete the HomeBody preview special case. The home dedup moves into
`sectionCourseRail`'s `dedupeAgainstStartHere` (already built in Phase 0's
schema, exercised since Phase 3).

**Phase 5 — cleanup + docs** (one session)
Patch scripts unset the superseded singleton fields (dry-run first, per
`sanity-lib.mjs` convention); schema fields removed in the same deploy as the
unsets; `pageSingleton` factory slimmed; Studio guides rewritten ("every page
works like the page builder now" — edit-page, sections, build-page guides);
CLAUDE.md routes/preview sections updated; PENDING closed out. Only after
every page has run live for a while — there is no hurry on this phase.

Estimated total: **five to seven working sessions**, each ending in a
deployed, fully-verified state. The site is never half-converted in any
user-visible way — unconverted pages keep their current files untouched.

---

## Risk register

| Risk | Mitigation |
|---|---|
| Pixel drift during markup moves | Markup cut-and-paste only, never rewritten; parity harness diffs rendered HTML per page; screenshots before/after. |
| Editor reorders sections into broken heading order / duplicate landmarks | `headingId` uniqueness + Checkup heading rule; guides explain the h2 convention; axe in CI catches regressions on the default arrangements. |
| Stega breaks an enum branch in preview | Every new `variant`/`source`/`border` enum added to `NON_STEGA_FIELDS` at schema-authoring time (checklist item per type). |
| Empty dataset (CI, or an editor deleting all sections) renders a broken page | D3 default-section arrays; empty-env Playwright run per phase. |
| Seeds write wrong keys/shapes | `sanity-lib.mjs` typed factories + dry-run-by-default `--apply` gate; idempotent (stable `_key`s) so re-runs are safe. |
| Auto-section preview shows published collection data | Accepted at conversion time (matches today); parameterize each block's queries with the fetcher as it converts. |
| Losing the empty-email/link-name guards, the privacy landmark label, the TZ-safe date formatters | Each is named in the relevant type's spec above; the test suite guards all three. |
| Rollback needed after a page ships | D4: revert the commit; old fields still populated until Phase 5. |

## Out of scope

Detail routes (`courses/[slug]`, `faculty/[slug]`, `events/[slug]`), the
custom `page` type (already pure builder), forms plumbing, SEO/JSON-LD
architecture, any visual change whatsoever.
