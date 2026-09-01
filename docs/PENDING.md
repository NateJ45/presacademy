# PENDING — the open-loops registry

The live registry of open patches, known gaps, and waiting-on-a-human items.
Read it early in a session; update it in the same commit that closes,
opens, or discovers an item. Pattern borrowed from the WCP site repo.

Format: each item says what it is, why it's open, and what unblocks it.
Move finished items to the "Recently closed" section with a date; prune
that section when it gets long.

## Open — needs a human (Nathan)

- **Click-through the two Presentation fixes in the DEPLOYED Studio**
  (2026-08-28). Both were reported live and neither can be reproduced
  locally, so both need your eyes once staging is up. (1) The section
  **🎨 handle** now opens a labelled "Section style" card instead of a bare
  column of dots: open it, move the mouse down onto the rows, and it should
  stay put until you press ✕, Escape, or click the page. Picking a colour
  should recolour the band immediately and keep the card open so you can
  set the accent too. (2) Clicking a page in the left-hand page list should
  move the preview on the FIRST click. If it still bounces, the retry now
  fires automatically, so what you should see is a brief flicker back and
  then the right page, never a second click. If either is still wrong, say
  which of the two and what you saw.
- **Wire a deploy webhook so publishing rebuilds the site** (2026-08-28,
  opened with PORTS.md card 20). Nothing in this repo rebuilds the public
  site when a document is published: `.github/workflows/` has CI, a
  staging deploy on push to `staging`, backup and uptime, and now
  `publish-due.yml`. Production is `npm run deploy`, by hand. That was
  survivable while every publish had a human beside it, but scheduled
  publishing makes the gap visible: a page can publish itself at 6am and
  still not be on the website. The Studio guide "Schedule a page to
  publish itself" says so out loud rather than promising something the
  repo cannot keep. The fix is a Sanity webhook (Project → API → Webhooks)
  pointed at a `repository_dispatch` workflow that runs the same steps as
  `deploy-staging.yml` against the production Worker. Worth debouncing so
  a burst of edits does not queue a dozen builds. Note the existing
  "Start here" guide already tells editors the site "rebuilds itself",
  so today that sentence is aspirational too.
- **Set the `SANITY_AUTH_TOKEN` repo secret, or comment the
  `publish-due.yml` schedule back out** (2026-08-28). The new workflow
  runs at `*/30` with the house two-job gate, so with the secret missing
  it warns and skips 48 times a day, which is the same small waste that
  got `sanity-backup.yml` and `uptime.yml` disabled in 2026-07. Scheduled
  publishing is inert either way until the secret exists, and it must be
  a WRITE token here (Editor permission), not the read token the backup
  workflow wants. Pick one: set the secret, or comment out the two
  `schedule:` lines until you do.

- **Mint `CF_ANALYTICS_TOKEN` and set it as a Worker secret** (2026-08-28,
  opened with the "Site stats" panel). The Studio's new **Site stats** tool
  reads `/api/stats`, which asks Cloudflare's GraphQL Analytics API how many
  requests this Worker served. It needs ONE Cloudflare API token with ONE
  permission: **Account · Account Analytics · Read**, scoped to the account
  already named in `wrangler.jsonc` (`CF_ACCOUNT_ID`, the same account as the
  WCP site). Read-only: it can change nothing. Then
  `npx wrangler secret put CF_ANALYTICS_TOKEN` and redeploy. Until it exists
  the panel says so in plain language and names the missing variable, and
  nothing else on the site is affected. For local `wrangler dev`, put the
  same value in `.dev.vars` beside `SANITY_TOKEN`. NEVER paste the token into
  a tracked file; the endpoint never logs or echoes it.
- **Confirm which of the two Cloudflare stats queries answers** (2026-08-28).
  `/api/stats` asks for the `date` dimension first and falls back once to
  `datetimeHour`; both bucket into the same UTC days, so the panel cannot
  tell which one replied. Neither path can be exercised without the real
  token. Once the secret is set, open the tool: numbers mean one of them
  worked. If it reports "Cloudflare could not answer", the message is the
  GraphQL one, passed through on purpose.

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
  `SANITY_AUTH_TOKEN` AND `BACKUP_PASSPHRASE` — the artifact is encrypted
  because the repo is public; keep an off-GitHub copy of the passphrase,
  see docs/agent/ci-cd-and-ops.md), and `uptime.yml` (needs the `SITE_URL` repo
  variable) all warn-and-skip when their secret is missing, so staging
  deploys, nightly dataset backups, and uptime checks may be silently
  inert. Check the repo settings on GitHub and set whichever are missing.

## Open — code/content work queued

- **Re-test undo/redo in the deployed Studio, then discard the
  `drafts.pricingPage` fixture** (2026-08-28, opened with the card 27 bug
  fix). The fix is unit-tested but nothing in this repo can exercise a real
  Studio, so these four need a human with the deployed Studio open:
  1. **The original repro.** Open a page in Presentation, change a section
     background with an in-canvas chip (card 28), then `Undo last change`
     from the `Publish` menu. On a page whose draft did not exist before the
     chip, the correct behaviour is now that the DRAFT IS REMOVED and the
     page falls back to its published state. Confirm the toast says
     "Draft change undone" and the value actually moves.
  2. **Multi-step undo.** Make three separate changes, then undo three
     times, and confirm it walks back three states rather than
     oscillating between two. This is what the server-assigned transaction
     id fix buys, and it is the part with no live evidence yet.
  3. **`drafts.pricingPage` is a leftover test fixture** with
     `flexibleSections[0].background.tone = 'chapel'` and three no-op
     transactions on it from the broken build. It has a published twin, so
     one undo should now remove it cleanly. DO NOT PUBLISH IT. If undo
     does not take it, discard the draft in the Studio.
  4. **Whole-document write vs. the optimistic actor.** Undo writes the
     whole document with `createOrReplace` while Presentation may be
     holding in-flight local patches for the same draft. The transaction
     log shows no sign of this having happened during the incident, but it
     is not proven safe: try an undo immediately after a chip click, with
     the preview open, and watch whether the preview and the form agree.
     If they diverge, the fix is to send a narrower patch rather than a
     whole-document replace.
- **Ctrl+Z is not heard while focus is inside the Presentation preview
  iframe** (2026-08-28, known limit, deliberately not fixed). A key pressed
  over the page picture goes to the iframe's window, not the Studio's, so
  the shortcut does nothing right after using an in-canvas chip. The two
  document actions are unaffected and the guide now says to use them or to
  click into the Studio panel first. Fixing it means a postMessage protocol
  between the public preview island
  (`src/components/preview/overlay/`) and the Studio layout wrapper: key
  handling shipped in a public bundle plus an origin check, for a shortcut
  with a working button two inches away. Reconsider only if editors
  actually ask.
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

- 2026-08-27 — **MARKER SYNC SESSION: this repo joined the shared-file sync system.**
  `ncs-astro-sanity-starter` is the library of record (`PORTS.md` there is the registry).
  Presacademy was the source of most of these files, but the starter improved them on the
  way in, so this session pulled the canonical versions back: `scripts/free-dist.mjs`
  (bracket-safe ordinal command-line match instead of PowerShell `-like`),
  `scripts/with-workerd.mjs` (genericized header), `src/lib/contrast.ts` (comment-only;
  export surface unchanged), and `scripts/lib/sanity-lib.mjs` reconciled onto the stricter
  `scripts/lib/loadEnv.mjs`, which is new here and must travel with sanity-lib. Added
  `scripts/sync-check.mjs`. `scripts/page-parity.mjs` was left alone and given a
  PORTED-pattern note instead of a marker: it is the origin of the starter's harness and
  both copies carry site-specific normalizer rules.
  Verified: `node scripts/seed-builder-privacy.mjs` dry-run clean, `npm test` 79/79,
  `npm run build` then parity compare 13/13 PASS, `sync-check` 5/5 SAME exit 0.

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
  - `docs/modules/`, `rebrand.mjs` + bootstrap configs,
    `seed-starter-content.mjs`, `seed-placeholder-images.mjs`,
    `docs/bootstrap/NEW-PROJECT.md`, the church-era placeholder photos and
    videos, the `upstream` git remote, and the dead deps (`@astrojs/mdx`,
    `@astrojs/rss`, `react-photo-album`, `yet-another-react-lightbox`,
    studio `sanity-plugin-iframe-pane`). Renamed the Studio workspace
    `churchstarter` → `presacademy`. Rewrote `README.md` and `CLAUDE.md`
    for the academy (fixing the typegen-in-build contradiction and the
    ghost component lists). Swapped the six church-era hero fallbacks to
    `acad-*` images.
