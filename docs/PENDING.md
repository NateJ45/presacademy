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

- **The Events page's empty-state line reads oddly.** The copy ends in a full
  sentence ("...is a course.") while the block appends a link reading "course."
  to it. Carried across faithfully by the conversion, so nothing changed, but an
  editor should fix the wording. It now lives on the Events page's
  `sectionEventGrid` block, as **Empty-state copy**, in `Page sections`.
- **The Checkup tool's `page-heading-ids` rule is still to write.** Phase 2 of
  the conversion added the section types with a mandatory heading or landmark
  label (`sectionEventGrid`, `sectionRuledList`, `sectionFaqGrouped`,
  `sectionContactDetails`), so `PORTED_SECTION_TYPES` can now list them without
  warning about correct content. The rule itself was never written.
- **Four pre-conversion orphan fields were deliberately left alone** in Phase 5
  (2026-08-27). They are unread by any renderer, but they predate the
  page-builder work and nothing superseded them, so removing them is a separate
  decision: `coursesPage.catalogIntro`, `facultyPage.directoryIntro`,
  `eventsPage.specialEyebrow` / `.specialHeadline`, plus `faqPage`'s
  `finalCtaScriptAccent` / `secondaryCta` / `note` and `contactPage.note`. None
  hold data except the two `note` fields (editor scratchpads, which is what they
  are for). Decide per field: delete with a dry-run unset, or wire one up.

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

- 2026-08-27 — **PAGE-BUILDER CONVERSION COMPLETE (Phase 5, cleanup + docs).**
  All thirteen singleton pages had converted on 2026-08-26 (Phases 0 through 4:
  the shared `src/components/SingletonPage.astro` renderer, ~17 ported section
  types, `src/lib/default-sections.ts` as the empty-dataset fallback,
  `scripts/page-parity.mjs` as the pixel guard, and full-fidelity `/preview` for
  every page). Phase 5 removed the scaffolding:
  - **A full dataset export was taken first**:
    `backups/pre-phase5-2026-08-26.tar.gz` (28.8 MB, 65 documents, 35 assets;
    `backups/` is gitignored). That is the restore point if a field turns out to
    have been read after all.
  - **63 superseded fields were unset across 11 documents** by the new
    `scripts/cleanup-builder-fields.mjs` (dry-run by default, `--apply` to
    write, idempotent, and it refuses to touch a document whose
    `flexibleSections` array is empty). Never the Studio's "Remove field"
    button. Per document: homePage 13, aboutPage 16, pricingPage 4,
    getStartedPage 11, forYouPage 1, coursesPage 2, eventsPage 5, faqPage 1,
    contactPage 6, privacyPage 2, accessibilityPage 2.
  - **The same fields were removed from the schemas** in the same commit, with
    five now-empty field groups (homePage and aboutPage "Page copy",
    getStartedPage "Form & scheduling", contactPage "Form intro + expectations",
    faqPage "Category order", and the two legal pages' "Content"), and the
    matching GROQ projections dropped from `src/lib/queries.ts`. Typegen re-run.
  - **What stayed, and why**: every hero, closing-CTA and SEO field (decision
    D2), plus the extras a renderer still reads: `pricingIntro` /
    `personasIntro` / `listIntro` (the hero map's intro paragraph),
    `aggregateTrustLine` (the faculty hero), `coursesPage.emptyState` +
    `facultyPage.emptyState` + `resourcesPage.emptyStateBody` (the pinned code
    regions), and the course and event DETAIL-page fields.
  - **Code retired**: `SingletonPage`'s `autoData` prop (no page ever passed
    one) and the preview route's stale "the code-owned middle renders on the
    live site only" note, now reworded for the only branch that reaches it
    (`404`).
  - **The twelve `scripts/seed-builder-*.mjs` are historical now** and carry a
    header saying so; `scripts/seed-page-copy.mjs` gained a DO NOT RUN warning,
    because applying it would write the removed fields back as unknown fields.
  - **Docs**: the plan doc is marked COMPLETE, CLAUDE.md's routes and preview
    sections say so, OPERATIONS.md's seed section is corrected, and the Studio
    guides now teach "every page's body is built from sections".

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
