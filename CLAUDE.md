# The Presbyterian Academy: CLAUDE.md

Always-loaded reference for the `ncs-presacademy` codebase. File-specific guidance loads on demand from `.claude/rules/` (path-scoped); long reference lives in `docs/claude/` and `docs/agent/`. The docs map below says what to open and when.

> **What this is.** The live website for **The Presbyterian Academy**, a Reformed lay-formation SCHOOL (not a church), funded by the Presbytery of Cincinnati. Astro 7 + Sanity v6 + Cloudflare Workers, fully static output. The repo was forked from the NCS church starter, de-churched in 2026-06, and **cut loose from the starter entirely on 2026-08-25** (the rebrand machinery, opt-in modules, church placeholder media, and the `upstream` remote are gone). Do not resurrect starter framing: this is a single-purpose site.
>
> **Content model: Sanity is the single source of truth.** Every piece of visible content (page copy, headings, buttons/links, images, nav menus, SEO titles/descriptions, contact details) is a Sanity field; on the live site every field should be populated so Sanity Studio mirrors the site exactly. The literal strings in `src/pages/*.astro` are **safety-net fallbacks** that render only when a field is empty; they are NOT the live content. **Change content in Studio (the site rebuilds), not in the `.astro` files.** Identity and contact values resolve through `src/lib/siteSettings.ts` (`resolveSiteSettings`); the header utility bar's enrollment cue derives from the next term via `getNextTerm` in `src/lib/queries.ts`. There is deliberately no hardcoded contact/social fallback in `src/data/site.ts`, so an empty Sanity field renders blank or hides rather than showing a stand-in. Live page-by-page map: `docs/agent/content-editability-audit.md`.

**Read `docs/PENDING.md` early in a session.** It is the live registry of open loops: queued work, known gaps, and waiting-on-a-human items. If you finish or discover one, update it in the same commit.

Companion tactical runbook: `OPERATIONS.md`. Test-suite map: `docs/TESTING.md`. Design system summary: `design.md`. Slash commands in `.claude/commands/`: `/sanity-audit`, `/rebuild`, `/visual-verify`. Current state, the Studio admin note and the slash command descriptions: `docs/claude/project-state.md`.

## Stack essentials

Full stack notes and the `astro.config.mjs` landmines are in `docs/agent/stack-and-config.md`. The must-knows:

- **Astro**, TypeScript strict, `output: 'static'`. Node 22.23.4 (pinned in `.nvmrc`, which every workflow reads; starter card 209).
- **Sanity v6** is the CMS. The Studio lives IN THIS PACKAGE (folded in from the old nested `studio/` package 2026-08-26): schemas in `src/sanity/schemaTypes/`, desk in `src/sanity/structure.ts`, config at the repo-root `sanity.config.ts`, CLI config in `sanity.cli.ts`. It is **embedded at `/studio`** via `@sanity/astro` and rebuilds with every deploy. The old hosted `presbyterian-academy.sanity.studio` is retired (a hosted Studio drifts stale), and there is deliberately no `studioHost`/`deployment` in `sanity.cli.ts` so a stray `sanity deploy` cannot recreate it.
- **Tailwind 4 via `@tailwindcss/vite`.** There is no `tailwind.config.mjs`. Brand tokens live in `@theme` blocks in `src/styles/globals.css`.
- **React 19 islands** for interactivity; Astro components for everything static.
- **Cloudflare Workers** for hosting, not Pages (Pages is in maintenance mode). Deploy with `wrangler deploy`.
- **More stack notes** (forms and D1, Analytics, GA4 events and the Report): `docs/agent/stack-and-config.md`.
- **`sanityFetch(query, params, fallback)`** in `src/lib/sanity.ts` is the single chokepoint for all Sanity reads. When `PUBLIC_SANITY_PROJECT_ID` is absent or set to the placeholder value, it returns the fallback without any network call, so `npm run build` succeeds with no Sanity project configured; pages render empty-state content.

## Commands

- `npm run dev`: dev server; the Studio is at `/studio`. `npm run build`: OG pages then `astro build` (does NOT run typegen). `npm run build:full`: typegen then build.
- `npm run typegen`: regenerate `src/lib/sanity.types.ts` after any schema edit (committed, CI-guarded).
- `npm run check` (astro check + eslint), `npm run lint`, `npm run format` / `npm run format:check`.
- Tests: `npm run test:unit` (node --test on `src/lib/*.test.ts`, then `npm run test:scripts` on `scripts/lib/*.test.mjs`), `npm test` (Playwright), `npm run test:visual`. Suite map: `docs/TESTING.md`.
- `npm run audit:data`: read-only check of the live dataset against the compiled schema (starter card 95). Every Sanity write script is dry by default and needs `--apply` plus `NCS_PRODUCTION_WRITE=yes` on production (starter card 86; `.claude/rules/sanity-and-scripts.md`).
- `npm run deploy`: build then `wrangler deploy -c dist/server/wrangler.json`. `npm run sync-check`: drift against the starter.

## Branch, CI and deploy

- Git workflow: `main` is the only branch and a merge is the production deploy. Required checks `build` and `test`. CI never reads live content (`scripts/snapshot.mjs`). Detail: `docs/agent/ci-cd-and-ops.md`, `docs/agent/deployment.md`, `OPERATIONS.md`.
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
6. **Scroll reset on navigation** (forward goes to top, back/forward restores) comes from Astro's `<ClientRouter />` (2026-10-13: Lenis smooth scroll removed at Nathan's request; scrolling is native). Do not add a smooth-scroll library back without a decision. Detail in `docs/agent/animation.md`.
7. **The PUBLIC site is statically built** (standing). A Sanity edit only reaches visitors after a rebuild (push to `main`, or the publish webhook). Editors do not have to wait to SEE their work, though: the `/preview` routes are SSR and draft-aware, so the Presentation tool shows unpublished edits immediately. Detail in `docs/agent/deployment.md`.
10. **The CSP is hand-maintained in `public/_headers`** (2026-06: Astro's `security.csp` missed runtime inline scripts and broke theme bootstrap + islands; it was reverted). Any new embed origin (video host, captcha, analytics) must be added there manually or the widget silently fails to render (bit 2026-06-15 with hCaptcha, since replaced by Turnstile).
20. **Curling a page is not verifying it.** `/studio` returned 200 with real HTML while being completely broken at React mount. Anything that mounts a client framework has to be opened in a real browser with the console read. Same rule as the schema gotcha: a green build proves nothing about runtime.
23. **A block carries no colour or surface field** (the starter's rule 9, gated by `src/lib/section-fields.test.ts`). The renderer owns the band and the cadence; the only exceptions are the frozen allowlist of older blocks that call `bgField()` (hidden in the Studio, still registered) and `sectionPricingTiers.surface`. A new block gets a `look` enum at most (`src/lib/section-looks.ts`).
24. **Layout is a config axis** (the starter's rule 18): `brand/brand.config.json` `layout` (header, hero, density, cards, motion). A default emits nothing, so the page does not move. `src/data/layout.ts` is written by hand here and `src/lib/site-layout.test.ts` fails if it differs from the config.
<!-- prettier-ignore-end -->

## Keep the docs in sync

A change is not done until the docs that describe it are updated in the same commit: files under `docs/` (and README, this file, OPERATIONS), the in-Studio guides (`src/sanity/guides/content.ts`) when an editor-facing step changes, and `docs/PENDING.md` for open loops. Detail: `docs/claude/project-state.md`.

## Code conventions and Working with Claude

Shared by every site repo in the family, so they live in one PORTABLE file imported here (it is expanded into context at launch, so this saves lines in this file, not tokens): the code conventions (strict TypeScript, header comments, Astro and React islands, images, Tailwind) and the working-with-Claude habits (desktop app, Plan Mode, confirm before installing, describe design in plain language, verify in a real browser). This site ships light AND dark, so "every theme" in the shared verification bullet means both (gotcha #4); the loop is `.claude/rules/ui-and-verification.md`.

@docs/claude/family-conventions.md

## Communication style

Warm, conversational, step-by-step, no em-dashes in public-facing site copy (gotcha #3), no AI-tell phrases or filler openers. Full lists: `docs/claude/communication-style.md`, `.claude/rules/site-copy-voice.md`.

## Docs map

Path-scoped rules are in `.claude/rules/` (live-preview, build-and-deps, sanity-and-scripts, pages-and-routes, ui-and-verification, site-copy-voice, portable-files). Read on demand: `docs/claude/project-state.md`, `docs/claude/file-ownership.md`, `docs/claude/topic-index.md` (full map with one line per file), `docs/agent/studio-kit.md`, `docs/PENDING.md`, `docs/TESTING.md`, `OPERATIONS.md`, `design.md`, `PRODUCT.md`, `docs/agent/changelog.md`.

## Vault (business context)

Business context, decisions and the Work log live in `_vault/clients/presacademy.md` at the Projects root, never in this repo. Read its `## Current state` before strategy questions. Update the repo docs in the same piece of work as any change. Work log: the note keeps a `## Work log`, so append a row (`- YYYY-MM-DD | ~Xh | summary`) at the end of each real-work session and commit and push `_vault/` (`_vault/README.md` rule 6).

## Ports

`internal/ncs-astro-sanity-starter/PORTS.md` is the registry. Files marked `PORTABLE:` on their first lines are canonical in the starter and checked by `node scripts/sync-check.mjs` (CI runs it); never edit a marked file here. A fix that generalises gets a port card in the same commit. Cross-project lessons go to `_vault/gotchas/` with a "Ported to" checklist. Detail: `.claude/rules/portable-files.md`.
