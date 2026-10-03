# The Presbyterian Academy: CLAUDE.md

Always-loaded reference for the `ncs-presacademy` codebase. File-specific guidance loads on demand from `.claude/rules/` (path-scoped); long reference lives in `docs/claude/` and `docs/agent/`. The docs map below says what to open and when.

> **What this is.** The live website for **The Presbyterian Academy**, a Reformed lay-formation SCHOOL (not a church), funded by the Presbytery of Cincinnati. Astro 7 + Sanity v6 + Cloudflare Workers, fully static output. The repo was forked from the NCS church starter, de-churched in 2026-06, and **cut loose from the starter entirely on 2026-08-25** (the rebrand machinery, opt-in modules, church placeholder media, and the `upstream` remote are gone). Do not resurrect starter framing: this is a single-purpose site.
>
> **Content model: Sanity is the single source of truth.** Every piece of visible content (page copy, headings, buttons/links, images, nav menus, SEO titles/descriptions, contact details) is a Sanity field; on the live site every field should be populated so Sanity Studio mirrors the site exactly. The literal strings in `src/pages/*.astro` are **safety-net fallbacks** that render only when a field is empty; they are NOT the live content. **Change content in Studio (the site rebuilds), not in the `.astro` files.** Identity and contact values resolve through `src/lib/siteSettings.ts` (`resolveSiteSettings`); the header utility bar's enrollment cue derives from the next term via `getNextTerm` in `src/lib/queries.ts`. There is deliberately no hardcoded contact/social fallback in `src/data/site.ts`, so an empty Sanity field renders blank or hides rather than showing a stand-in. Live page-by-page map: `docs/agent/content-editability-audit.md`.

**Read `docs/PENDING.md` early in a session.** It is the live registry of open loops: queued work, known gaps, and waiting-on-a-human items. If you finish or discover one, update it in the same commit.

Companion tactical runbook: `OPERATIONS.md`. Test-suite map: `docs/TESTING.md`. Project slash commands (in `.claude/commands/`): `/sanity-audit` (ground truth on the dataset: counts, gaps, drafts; run it before debugging any "content looks wrong" report), `/rebuild` (trigger the production rebuild that makes published Sanity content live), `/visual-verify` (the both-themes-both-viewports screenshot loop). The design system summary for visual work is `design.md` at the repo root.

**Current state, in brief.** Astro 7 + Sanity Studio v6; the Sanity packages are PINNED to exact versions (never bump one alone; see gotcha #18). The theme **defaults to LIGHT**. **The school was founded in 2026: never highlight a founding year or imply a long history or large enrollment.** The Sanity dataset still runs on placeholder CC0 photography. Full state and history: `docs/claude/project-state.md`.

## Stack essentials

Full stack notes and the `astro.config.mjs` landmines are in `docs/agent/stack-and-config.md`. The must-knows:

- **Astro**, TypeScript strict, `output: 'static'`. Node 22.12+.
- **Sanity v6** is the CMS. The Studio lives IN THIS PACKAGE (folded in from the old nested `studio/` package 2026-08-26): schemas in `src/sanity/schemaTypes/`, desk in `src/sanity/structure.ts`, config at the repo-root `sanity.config.ts`, CLI config in `sanity.cli.ts`. It is **embedded at `/studio`** via `@sanity/astro` and rebuilds with every deploy. The old hosted `presbyterian-academy.sanity.studio` is retired (a hosted Studio drifts stale), and there is deliberately no `studioHost`/`deployment` in `sanity.cli.ts` so a stray `sanity deploy` cannot recreate it.
- **Tailwind 4 via `@tailwindcss/vite`.** There is no `tailwind.config.mjs`. Brand tokens live in `@theme` blocks in `src/styles/globals.css`.
- **React 19 islands** for interactivity; Astro components for everything static.
- **Cloudflare Workers** for hosting, not Pages (Pages is in maintenance mode). Deploy with `wrangler deploy`.
- **Web3Forms** contact + express-interest forms with **hCaptcha**, **Calendly** intro calls, **Cloudflare Web Analytics** (cookieless, no banner).
- **`sanityFetch(query, params, fallback)`** in `src/lib/sanity.ts` is the single chokepoint for all Sanity reads. When `PUBLIC_SANITY_PROJECT_ID` is absent or set to the placeholder value, it returns the fallback without any network call, so `npm run build` succeeds with no Sanity project configured; pages render empty-state content.

## Commands

- `npm run dev`: dev server; the Studio is at `/studio`. `npm run build`: OG pages then `astro build` (does NOT run typegen). `npm run build:full`: typegen then build.
- `npm run typegen`: regenerate `src/lib/sanity.types.ts` after any schema edit (committed, CI-guarded).
- `npm run check` (astro check + eslint), `npm run lint`, `npm run format` / `npm run format:check`.
- Tests: `npm run test:unit` (node --test on `src/lib/*.test.ts`), `npm test` (Playwright), `npm run test:visual`. Suite map: `docs/TESTING.md`.
- `npm run deploy`: build then `wrangler deploy -c dist/server/wrangler.json`. `npm run sync-check`: drift against the starter.

## Branch, CI and deploy

- Git workflow: `main` is the only branch (staging abandoned 2026-10-03). Work on short-lived branches, open a PR to `main`, CI must be green (required checks `build` and `test`, now aggregator jobs over parallel `static` / `site` / sharded `e2e` with weighted blocks, `PWTEST_SHARD_WEIGHTS` in `ci.yml`, re-cut when tests are added in bulk, see `docs/agent/ci-cd-and-ops.md`; Lighthouse is scheduled and path-filtered, not required), merge = production deploy (Cloudflare watches `main`). Detail: `docs/agent/ci-cd-and-ops.md`, `docs/agent/deployment.md`, `OPERATIONS.md`.
- The PUBLIC site is statically built; a Sanity edit reaches visitors only after a rebuild (gotcha #7).

## Never-break rules (numbered gotchas)

Numbers are stable (code comments cite them). Gotchas #8, #11 to #18 and #22 are in `.claude/rules/build-and-deps.md`, #9 and #21 in `.claude/rules/ui-and-verification.md`, #19 in `.claude/rules/sanity-and-scripts.md`.

Each entry carries the date it bit (or was decided) and the symptom, so future sessions can judge whether it still applies.

<!-- prettier-ignore-start -->
1. **Never click "Remove field" in the Studio** (2026-06). It deletes that field's data across every document and cannot be undone without a dataset restore. It appears when the Studio's schema is older than the data. Since the Studio is now embedded (it ships with the site build), the sequence after a schema change is: edit schema, `npm run typegen`, commit, deploy. No separate `studio:deploy` step.
2. **`npm run build` does NOT run typegen** (bit 2026-06-14: schema changed, committed `src/lib/sanity.types.ts` went stale, build used old types). Run `npm run typegen` manually after any schema change, or use `npm run build:full`. CI fails if the committed types are stale; that guard is the durable fix, keep it.
3. **No em-dashes in public-facing site copy** (standing rule). Use commas, colons, or restructure. Code comments, commit messages, and internal docs are exempt, but avoid them there too.
4. **Build in both light AND dark mode** on every UI change (standing rule). **Light is the default** (a new visitor does not follow the OS; "system" is opt-in). Detail in `docs/agent/theme-and-color.md`.
5. **Desktop nav is server-rendered** in `Header.astro` (standing rule). Do not regress it to a client-only island. Detail in `docs/agent/page-architecture.md`.
6. **The Lenis scroll reset on navigation** (forward goes to top, back/forward restores) lives in the BaseLayout Lenis init. Do not remove it. Detail in `docs/agent/polish-layer.md`.
7. **The PUBLIC site is statically built** (standing). A Sanity edit only reaches visitors after a rebuild (push to `main`, or the publish webhook). Editors do not have to wait to SEE their work, though: the `/preview` routes are SSR and draft-aware, so the Presentation tool shows unpublished edits immediately. Detail in `docs/agent/deployment.md`.
10. **The CSP is hand-maintained in `public/_headers`** (2026-06: Astro's `security.csp` missed runtime inline scripts and broke theme bootstrap + islands; it was reverted). Any new embed origin (video host, captcha, analytics) must be added there manually or the widget silently fails to render (bit 2026-06-15 with hCaptcha).
20. **Curling a page is not verifying it.** `/studio` returned 200 with real HTML while being completely broken at React mount. Anything that mounts a client framework has to be opened in a real browser with the console read. Same rule as the schema gotcha: a green build proves nothing about runtime.
<!-- prettier-ignore-end -->

## Keep the docs in sync

A change is not done until the documentation that describes the changed behavior is updated **in the same commit**:

1. The affected files under `docs/` (and `README.md` / this file / `OPERATIONS.md` when the architecture or commands shift).
2. The in-Studio editor guides (`src/sanity/guides/content.tsx`) when the change touches anything a faculty editor does in Studio.
3. `docs/PENDING.md` when the change closes, opens, or discovers an open loop.

Stale docs in this repo have already shipped real bugs (the 2026-06-14 stale-types incident traced to a doc claiming typegen ran in the build when it did not). Doc drift is a defect, not a chore.

## Code conventions

- TypeScript strict mode. No `any`.
- Comment generously, especially in components a future maintainer might edit by hand.
- At the top of each component file, a header comment marks it `// Safe to edit by hand` or `// Foundation, edit with care`.
- Astro components for static content. React islands only where interactivity is required.
- Prefer Astro's `<Image />` / `<Picture />` for locally-bundled assets; the `<SanityImage />` wrapper for Sanity-hosted images.
- Tailwind utility classes inline. Pull into `@apply` only when a pattern repeats four or more times.
- `clsx` / `class-variance-authority` for conditional classes once components get state-dependent styling.

## Working with Claude

- Use Claude Code from the desktop app. Show diffs clearly so they read well in that UI.
- Prefer Plan Mode for any multi-file change, especially when touching Sanity schemas (schema changes propagate to live content).
- Pause for confirmation before installing new dependencies.
- When proposing design changes, describe the visual outcome in plain language, not just the code.
- Don't report a UI change as done without screenshots in both themes and both viewports.

## Communication style

These apply to everything written: code comments, PR descriptions, commit messages, and copy on the site itself.

- Warm, conversational tone. Not stiff or corporate.
- Step-by-step structure for any process or how-to.
- No em-dashes in public-facing site copy (see gotcha #3).
- No AI-tell phrases: delve, navigate (as a verb), leverage, robust, seamless, meticulous, tapestry, realm, landscape, testament to, ever-evolving, crucial, pivotal.
- No AI-tell sentence patterns: "It's not just X, it's Y," "Not only... but also," "It's important to note that," "When it comes to," "In the realm of," "That said" as a transition.
- Don't open replies with filler like "Certainly!" or close with "I hope this helps!" End on the actual content.
- Avoid three-item lists where the third item is filler. Two items is fine if two is the truth.
- Use bold for genuine emphasis or list labels only. Default to prose unless content is genuinely a list.

Site copy voice and banned vocabulary: `.claude/rules/site-copy-voice.md` (also `docs/brand/voice.md`).

## Docs map

Path-scoped rules (load automatically when you touch matching files):

- `.claude/rules/live-preview.md`: the `/preview/**` SSR draft preview, stega, SSE proxy, in-canvas controls.
- `.claude/rules/build-and-deps.md`: gotchas #8, #11 to #18, #22 (adapter, workerd, wrangler pin, Sanity version pins, deploy config, never regenerate the lockfile).
- `.claude/rules/sanity-and-scripts.md`: gotcha #19, build pipeline, seeds and standalone scripts.
- `.claude/rules/pages-and-routes.md`: routes table, page-builder conversion, pinned code regions.
- `.claude/rules/ui-and-verification.md`: gotchas #9 and #21, the both-themes-both-viewports verification loop.
- `.claude/rules/site-copy-voice.md`: voice for live-site copy.
- `.claude/rules/portable-files.md`: PORTABLE-marked files and the shared-file sync system.

Read on demand:

- `docs/claude/project-state.md`: current state, stack-pin history, brand direction. Read for background.
- `docs/claude/file-ownership.md`: safe-to-edit vs foundation file lists. Read before touching foundation files.
- `docs/claude/topic-index.md`: index of every `docs/agent/*` deep dive, research and checklists. Read when a task touches those areas.
- `docs/PENDING.md` (open loops), `docs/TESTING.md`, `OPERATIONS.md`, `design.md`, `PRODUCT.md`, `docs/agent/changelog.md` (change history).

## Vault (business context)

Business context, decisions and the Work log live in `_vault/clients/presacademy.md` at the Projects root, never in this repo. Read its `## Current state` before strategy questions. Update the repo docs in the same piece of work as any change. Work log: the note keeps a `## Work log`, so append a row (`- YYYY-MM-DD | ~Xh | summary`) at the end of each real-work session and commit and push `_vault/` (`_vault/README.md` rule 6), even though `plan` is `none` (free portfolio build, hours still logged).

## Ports

`internal/ncs-astro-sanity-starter/PORTS.md` is the registry. Files marked `PORTABLE:` on their first lines are canonical in the starter and checked by `node scripts/sync-check.mjs` (CI runs it); never edit a marked file here. A fix that generalises gets a port card in the same commit. Cross-project lessons go to `_vault/gotchas/` with a "Ported to" checklist. Detail: `.claude/rules/portable-files.md`.
