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

- **Page-builder conversion (PHASE 0 LANDED 2026-08-26, Phase 1 next).**
  Convert the 13 bespoke singleton pages to a sections-array page-builder
  with zero visual change. The full plan — governing decisions, the ~15
  new section types mapped to every page, phasing, parity harness, risks
  — is `docs/superpowers/plans/2026-08-26-page-builder-conversion.md`.
  Estimated 5–7 sessions; each phase lands deployed and verified.
  Phase 0 built the foundations, all render-neutral (no page imports them
  yet): `src/components/PageHeader.astro`,
  `src/components/SingletonPage.astro`, `src/lib/heading-id.ts` (+ tests),
  `src/lib/default-sections.ts`. Three carry-forwards for Phase 1:
  1. **about.astro's hero differs from the other six** rule-variant pages
     by two classes (`max-w-4xl` on the h1, `leading-relaxed` on the
     subhead). PageHeader renders the six-page form. Settle the About
     delta explicitly when About converts; do not widen the component by
     reflex. The full comparison is in PageHeader's header comment.
  2. **The fifth insert-menu group is a commented-out scaffold** in
     `blocks.ts`. The repo's own drift guard tolerates `of: []`, but
     @sanity/insert-menu renders one tab per group with no emptiness
     filter, so shipping it empty would show editors an empty
     "Page sections (Rule & Ledger)" tab. Uncomment it in the same commit
     as the first ported type.
  3. **The Checkup rule `page-heading-ids` no-ops** until
     `PORTED_SECTION_TYPES` in `HealthTool.tsx` lists a real type. Add
     each ported type's name to it as that type lands.

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
