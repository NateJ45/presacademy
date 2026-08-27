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

- **Page-builder conversion (PHASES 1, 2 AND 3 LANDED 2026-08-26, Phase 4 —
  home — is the last conversion phase).**
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
  Carry-forwards for Phase 4:
  1. **`sectionLedgerStats`' `quad` variant is declared, not proven.** It
     is home's stat band copied ahead of time; hold it against home with
     the parity harness in Phase 4, the way `trio` was held against
     pricing.
  2. **Auto sections still preview PUBLISHED collection data** (FAQ items,
     events, pricing tiers, site settings, and now courses and faculty).
     Accepted at conversion time, as the plan's risk register allows:
     parameterize each block's query with the draft fetcher when it
     matters. The preview route fetches the pinned regions' collections
     the same published way, for the same reason.
  3. **`sectionCourseRail` is half-proven, on purpose.** `source:
     'startHere'` with `variant: 'rail'` is what the Courses page runs on.
     `source: 'featured'`, `variant: 'feature'` (the paper band with the
     gold rule and the "see all" link), `adaptiveColumns` and
     `dedupeAgainstStartHere` are home's three rails built ahead of time
     and NOT yet held against the harness. Home #3 is the rail with
     `adaptiveColumns` on; home #6 is the feature band with the dedup.
  4. **Home's two rails and the Courses rail differ in a real class
     attribute today.** Home narrows its grid below three courses; Courses
     never does, and the dataset currently has exactly two Start-here
     courses, so the two pages emit different `class` values from the same
     data. That is why `adaptiveColumns` exists rather than one rule.
  5. **The Events page's `upcomingEmpty` copy in Sanity already ends in a
     full sentence** ("...is a course."), while the page appends a link
     reading "course." to it. The seed carried the value across
     faithfully, so nothing changed, but the live empty state reads
     oddly. Worth an editor fixing the field (it is now
     `sectionEventGrid.emptyCopy`).

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
