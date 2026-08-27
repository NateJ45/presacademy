# PENDING — the open-loops registry

The live registry of open patches, known gaps, and waiting-on-a-human items.
Read it early in a session; update it in the same commit that closes,
opens, or discovers an item. Pattern borrowed from the WCP site repo.

Format: each item says what it is, why it's open, and what unblocks it.
Move finished items to the "Recently closed" section with a date; prune
that section when it gets long.

## Open — needs a human (Nathan)

- **Set the `SANITY_TOKEN` Worker secret before the next deploy.** The new
  SSR preview routes read it at request time. Locally it lives in
  `.dev.vars` (gitignored, already written). In production:
  `npx wrangler secret put SANITY_TOKEN` (a Viewer token with draft read
  access is enough). Without it the preview routes fail closed: the live
  public site is unaffected.
- **Add the site origin to Sanity CORS.** The embedded Studio at
  `/studio` talks to the Sanity API from the site's own origin, so
  `https://www.presbyterianacademy.org` (and any workers.dev preview
  origin you use) must be listed under Project → API → CORS origins with
  credentials allowed. sanity.io/manage.
- **Confirm the Home page's live EDIT loop in the deployed Studio**
  (2026-08-26, Phase 4). The home preview was verified end to end under
  `wrangler dev`: the whole body renders, the slideshow runs, the console
  is clean. What cannot be checked without a signed-in editor is the last
  link in the chain: open Presentation, edit a Home **Page sections** block
  (say the "where to begin" row's second cell) without publishing, and
  confirm the change appears in the iframe and that click-to-edit opens the
  right field. Everything the check exercises is shared code that already
  works on twelve other pages, so this is confirmation, not suspicion.
- **Real Academy photography.** The whole dataset still runs on Pexels
  CC0 placeholders (`acad-*`). Editors can swap photos in Studio any time;
  until then the site is presentable but generic. Unblocks: a photo shoot
  or a curated real-photo set.
- **`siteSettings.phone` and social links are unseeded.** Deliberately
  left empty by `seed-editability.mjs` because they need real values.
  Empty fields hide rather than show stand-ins, so nothing is broken,
  just absent.
- **GitHub Actions secrets/variables may be unset.** `deploy-staging.yml`
  (needs `CLOUDFLARE_API_TOKEN`), `sanity-backup.yml` (needs
  `SANITY_AUTH_TOKEN`), and `uptime.yml` (needs the `SITE_URL` repo
  variable) all warn-and-skip when their secret is missing, so staging
  deploys, nightly dataset backups, and uptime checks may be silently
  inert. Check the repo settings on GitHub and set whichever are missing.

## Open — code/content work queued

- **Page-builder conversion (PHASES 1 THROUGH 4 LANDED 2026-08-26. ALL 13 PAGES
  ARE CONVERTED; only Phase 5, cleanup + docs, remains, and it is deliberately
  unhurried).**
  Convert the 13 bespoke singleton pages to a sections-array page-builder
  with zero visual change. The full plan — governing decisions, the ~15
  new section types mapped to every page, phasing, parity harness, risks
  — is `docs/superpowers/plans/2026-08-26-page-builder-conversion.md`.
  Estimated 5–7 sessions; each phase lands deployed and verified.
  Phase 0 built the foundations (`src/components/PageHeader.astro`,
  `src/components/SingletonPage.astro`, `src/lib/heading-id.ts` + tests,
  `src/lib/default-sections.ts`, `scripts/page-parity.mjs`).
  **Phase 1 converted four pages** — resources, privacy, accessibility,
  for-you — each verified at 13/13 page parity, 79 unit tests, 109
  Playwright tests, plus the empty-env axe run. It added two section
  types (`sectionLegalBody`, `sectionNumberedCards`), their components,
  their DEFAULT_SECTIONS entries, three seed scripts
  (`scripts/seed-builder-*.mjs`, all run against production), and
  full-fidelity `/preview` for the four converted pages.
  **Phase 2 converted six more** — pricing, about, faq, events, contact,
  get-started — each verified at 13/13 page parity, 79 unit tests, 109
  Playwright tests, the empty-credential axe run (32 chromium tests,
  light + dark), and all six `/preview/*` routes opened under
  `wrangler dev`. It added nine section types (`sectionScholarship`,
  `sectionLedgerStats`, `sectionEditorialColumns`, `sectionInlineBand`,
  `sectionFaqGrouped`, `sectionEventGrid`, `sectionRuledList`,
  `sectionContactDetails`, `sectionRequestPanel`), patched two existing
  ones without changing their output for current users
  (`sectionPricingTiers` gained `headingLevel` + `surface`, `sectionForm`
  gained `variant`/`eyebrow`/`headingId`/`fallbackLabel`), and shipped six
  seed scripts (`scripts/seed-builder-*.mjs`, all run against production
  and re-run clean).
  The four Phase 1 carry-forwards, settled:
  1. **about.astro's hero delta is KEPT**, behind PageHeader's new
     `emphasis="editorial"` prop (opt-in, set only by About in
     SingletonPage's hero map). Unifying the seven heroes would have been
     a real visual change; making the two classes unconditional would have
     changed six pages. PageHeader's header comment records the call.
  2. **`sectionNumberedCards`' variants: `ledger` and a new `steps` are
     now PROVEN** (about's beliefs, get-started's steps). The type's
     `variant` turned out to select a whole treatment, not just a border:
     the three bands differ in surface, rhythm, grid, heading size and
     header shape, so each renders its source markup verbatim. `full`
     remains declared and unproven.
  3. **The Checkup rule `page-heading-ids` is now actionable.** Phase 2
     added types with a mandatory heading or landmark label
     (`sectionEventGrid`, `sectionRuledList`, `sectionFaqGrouped`,
     `sectionContactDetails`), so `PORTED_SECTION_TYPES` can list those
     without warning about correct content. Still to do.
  4. **Photo heroes stay in their page files, not in SingletonPage**
     (Astro collects CSS from the module graph, so importing `Hero.astro`
     into the shared renderer injected its scoped `.hero-fill` style into
     every text-hero page). faq and contact followed the
     privacy/accessibility slot pattern in Phase 2.
  **Phase 3 converted the two pages with pinned code regions** — courses
  and faculty — each verified at 13/13 page parity, 79 unit tests, 109
  Playwright tests, the empty-credential axe run (32 chromium tests,
  light + dark), and both `/preview/*` routes opened under `wrangler dev`
  with their filter islands exercised and a clean console. It added one
  section type (`sectionCourseRail`, built whole: `source` startHere +
  featured, two band treatments, `dedupeAgainstStartHere`), one seed
  (`scripts/seed-builder-courses.mjs`, run against production and re-run
  clean), and `src/components/pinned/` for the two shared code regions.
  Three Phase 3 findings worth keeping:
  1. **The pinned slot is single and always after the sections.** A second
     "before sections" slot was considered and rejected; the reasoning and
     the editorial consequence (a new section on courses lands above the
     catalog, not below it) are in `SingletonPage.astro`'s header.
  2. **The parity normalizer gained rule 3**, `<astro-island prefix="rN">`.
     Moving the catalog into a component shifted its island's render-order
     counter with zero markup change. The 13 committed baselines were
     re-normalized in place (not re-captured).
  3. **A hero-map bug was found by the PREVIEW, not by parity.** The
     faculty entry named the trust-line field `trustLine`; the field is
     `aggregateTrustLine`, so an editor's edit would never have reached
     the page. Parity missed it because the fallback string and the field
     hold the same sentence. Fixed. Worth remembering when Phase 4 wires
     home's hero map: check every field NAME against the schema.
  **Phase 4 converted home, the last page**, verified at 13/13 page parity
  TWICE (once on `DEFAULT_SECTIONS`, then again after the seed ran, so both
  the code fallback and the Sanity-driven path are proven byte-identical),
  79 unit tests, 109 Playwright tests, the empty-credential axe run (32
  chromium tests, light + dark), and `/preview` opened under `wrangler dev`
  with the whole body, the running Ken Burns slideshow and a clean console.
  It added three section types (`sectionTicker`, `sectionFacultyRail`,
  `sectionTestimonialRail`), a fourth `sectionNumberedCards` variant
  (`wayfinding`, with the `landmarkLabel` and per-card `href` it needs),
  `src/components/home/HomeHero.astro` (the split hero, page-level per D2,
  rendered into SingletonPage's hero slot), one seed
  (`scripts/seed-builder-home.mjs`, run against production and re-run
  clean), and it DELETED `src/components/home/HomeBody.astro` along with the
  preview route's home special case.
  The five Phase 3 carry-forwards, settled:
  1. **`sectionLedgerStats`' `quad` is PROVEN.** It needed no change: the
     markup copied ahead of time in Phase 2 matched home byte for byte.
  2. **Auto sections still preview PUBLISHED collection data, EXCEPT on
     home.** Home's preview showed draft courses, faculty and testimonials
     before the conversion, so a `fetcher` prop now runs SingletonPage →
     Sections → the auto blocks, and the preview route passes the draft
     fetcher for `homePage` only. Every other page's blocks take the
     default and read published data, as the risk register allows. Pass the
     fetcher from another page's branch the day it matters.
  3. **`sectionCourseRail` is fully proven.** `feature`, `featured`,
     `adaptiveColumns` and `dedupeAgainstStartHere` all held against home.
  4. **Home's rails really do differ from the Courses rail** in a class
     attribute, as predicted; `adaptiveColumns` is why both pages are
     byte-exact.
  5. **The Events page's `upcomingEmpty` copy in Sanity already ends in a
     full sentence** ("...is a course."), while the page appends a link
     reading "course." to it. The seed carried the value across
     faithfully, so nothing changed, but the live empty state reads
     oddly. Worth an editor fixing the field (it is now
     `sectionEventGrid.emptyCopy`). STILL OPEN.
  Two findings from Phase 4 worth keeping:
  1. **`data-countup-grid` cannot be interpolated.** Astro serializes
     `data-x={true}` as `data-x="true"`, and home wrote the attribute bare.
     That single byte was the ONLY parity diff in the whole home
     conversion; `LedgerStatsBlock`'s `quad` branch now spells the grid out
     twice so the attribute's presence is a branch, not a value.
  2. **The plan's slice map was wrong about home's wayfinding row**, which
     it pencilled in as `sectionNumberedCards`' `ledger` variant. The row
     has no heading, each cell is a link, and it is named by an aria-label:
     it earned a fourth variant. Parity decided it, exactly as the plan
     said it would.
  What Phase 5 (cleanup) should now unset, on top of the earlier pages'
  superseded fields: `homePage.wayfinding`, `.stats`, `.tickerTopics`,
  `.startHereEyebrow`, `.startHereHeadline`, `.coursesEyebrow`,
  `.coursesHeadline`, `.coursesLinkLabel`, `.facultyEyebrow`,
  `.facultyHeadline`, `.facultyLinkLabel`, `.testimonialsEyebrow`,
  `.testimonialsHeadline` (all now unread by any renderer; only
  `seed-builder-home.mjs` still reads them). The hero fields, the final-CTA
  fields and the SEO fields all STAY. Phase 5 can also drop the "code-owned
  middle" note from the preview route's generic branch if `404` is given a
  better preview, and retire the `autoData` prop on SingletonPage, which no
  page ever used (every auto block fetches for itself).

- **Home page P1s from the 2026-06-20 Impeccable critique**
  (`.impeccable/critique/`): several course cards render empty image
  wells, and the faculty strip is text-only, which makes a polished page
  look half-loaded. Placeholder art or a layout that tolerates missing
  images would close it. Second finding: CTA wording drift ("Request
  info" vs "Request information", "Free intro" vs "Book a free intro");
  pick one form of each and sweep.
- **Re-record `acad-*` photo credits.** The per-photo Pexels source URLs
  for the academic placeholder set live only in gitignored curation
  scratch (`scripts/_stock*`). `MANIFEST.md` currently records the set
  without per-photo links. Low stakes (Pexels needs no attribution) but
  worth restoring if the scratch still exists.
- **CSP is hand-maintained** in `public/_headers` (see CLAUDE.md gotcha
  #10). Standing risk, not a task: any new embed origin needs a manual
  edit there.

## Recently closed

- 2026-08-26 — **Hosted Studio deleted** (Nathan, via sanity.io/manage).
  The embedded /studio is now the only Studio.
- 2026-08-26 — **Unsplash plugin re-enabled** after the Studio crash root
  cause proved it innocent (held at 7.0.15 for @sanity/ui v3 compat).
- 2026-08-26 — **Studio folded into the root package** (the WCP shape):
  `studio/` is gone; sources live in `src/sanity/`, config at the root
  `sanity.config.ts` + `sanity.cli.ts`, one node_modules. This
  permanently ends the dual-module-tree class of bug behind the day's
  Studio crashes. CI/backup/staging workflows updated; typegen runs
  from the root.

- 2026-08-25 — **Live draft preview shipped.** Studio embedded at
  `/studio`; Presentation tool with a page navigator; SSR `/preview/**`
  routes rendering drafts with click-to-edit stega; SSE auto-refresh
  proxy; fingerprint-gated draft-mode cookie. Deploy now uses the
  adapter-generated `dist/server/wrangler.json`.
- 2026-08-25 — **Automated test safety net ported from WCP**: 109
  Playwright tests (smoke, axe light+dark, focus indicators, 320-1440
  reflow), theme-token contrast unit tests, Lighthouse accessibility
  hard-gated at 1.0, CI wired. Fixed 4 real a11y bugs it caught.
- 2026-08-25 — **Studio editor-experience port**: 18 guides with
  clickable breadcrumbs, Welcome launcher, soft-delete Trash, grouped
  section insert menu, SEO + "Used on" tabs, "+ New" templates,
  drag-to-reorder lists, Checkup + New term setup tools, real dark mode.
- 2026-08-25 — **Upgraded to Astro 7 + Sanity Studio v6.**
- 2026-08-25 — **Cut loose from the church starter**: removed `modules/`
  + `docs/modules/`, `rebrand.mjs` + bootstrap configs,
  `seed-starter-content.mjs`, `seed-placeholder-images.mjs`,
  `docs/bootstrap/NEW-PROJECT.md`, the church-era placeholder photos and
  videos, the `upstream` git remote, and the dead deps (`@astrojs/mdx`,
  `@astrojs/rss`, `react-photo-album`, `yet-another-react-lightbox`,
  studio `sanity-plugin-iframe-pane`). Renamed the Studio workspace
  `churchstarter` → `presacademy`. Rewrote `README.md` and `CLAUDE.md`
  for the academy (fixing the typegen-in-build contradiction and the
  ghost component lists). Swapped the six church-era hero fallbacks to
  `acad-*` images.
