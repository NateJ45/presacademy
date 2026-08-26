# The Presbyterian Academy — CLAUDE.md

This is the always-loaded reference for the `ncs-presacademy` codebase: the conventions and landmines an agent needs on every task. Deep detail for specific areas (theme, components, SEO, performance, Sanity, deployment) lives under `docs/agent/` and is read on demand. The topic index at the bottom is the map.

> **What this is.** The live website for **The Presbyterian Academy**, a Reformed lay-formation SCHOOL (not a church), funded by the Presbytery of Cincinnati. Astro 7 + Sanity v6 + Cloudflare Workers, fully static output. The repo was forked from the NCS church starter, de-churched in 2026-06, and **cut loose from the starter entirely on 2026-08-25** (the rebrand machinery, opt-in modules, church placeholder media, and the `upstream` remote are gone). Do not resurrect starter framing: this is a single-purpose site.
>
> **Content model: Sanity is the single source of truth.** Every piece of visible content (page copy, headings, buttons/links, images, nav menus, SEO titles/descriptions, contact details) is a Sanity field; on the live site every field should be populated so Sanity Studio mirrors the site exactly. The literal strings in `src/pages/*.astro` are **safety-net fallbacks** that render only when a field is empty; they are NOT the live content. **Change content in Studio (the site rebuilds), not in the `.astro` files.** Identity and contact values resolve through `src/lib/siteSettings.ts` (`resolveSiteSettings`); the header utility bar's enrollment cue derives from the next term via `getNextTerm` in `src/lib/queries.ts`. There is deliberately no hardcoded contact/social fallback in `src/data/site.ts`, so an empty Sanity field renders blank or hides rather than showing a stand-in. Live page-by-page map: `docs/agent/content-editability-audit.md`.

**Read `docs/PENDING.md` early in a session.** It is the live registry of open loops: queued work, known gaps, and waiting-on-a-human items. If you finish or discover one, update it in the same commit.

Companion tactical runbook: `OPERATIONS.md`. Test-suite map: `docs/TESTING.md`. Project slash commands (in `.claude/commands/`): `/sanity-audit` (ground truth on the dataset: counts, gaps, drafts; run it before debugging any "content looks wrong" report), `/rebuild` (trigger the production rebuild that makes published Sanity content live), `/visual-verify` (the both-themes-both-viewports screenshot loop). The design system summary for visual work is `design.md` at the repo root.

> **Current project state (updated 2026-08-25).** Upgraded to **Astro 7 + Sanity Studio v6** on 2026-08-25 (adapter `@astrojs/cloudflare` ^14, vite 7 override removed, `sanity schema extract --force` in typegen). The Sanity packages are PINNED to exact versions (sanity 6.4.0 / @sanity/ui 3.5.3 and friends) — see gotcha #17 before changing any of them. The site carries the school catalog: **courses, faculty, terms, pricing tiers, teaching areas, testimonials, events, FAQ**, plus a 19-block page builder for custom pages. The brand is **"Direction A": green-anchored bookish minimalism** (near-white warm paper, soft near-black ink, a deep Reformed forest green anchor, brass hairlines, Fraunces over Source Sans 3, a green eyebrow-rubric signature; the Romanesque arch and paper grain are retired). Palette lives in `design.md` and `docs/agent/theme-and-color.md`; the branding decision is `docs/research/2026-06-14-brand-direction-debate.md`; a live visual reference of every token is the secret **`/style-guide`** route (noindex, unlinked, sitemap-excluded). The site has a CSS-first "refined kinetic editorial" motion system (`docs/agent/animation.md`) and a 6-image Ken Burns home hero (`HeroSlideshow.astro` rendering `homePage.heroImages`). The theme **defaults to LIGHT** ("system" is opt-in via the toggle; the choice persists). **The school was founded in 2026: never highlight a founding year or imply a long history or large enrollment.** The **Presbytery of Cincinnati funds the school**, surfaced as the editable `siteSettings.funder` footer line. The Sanity dataset still runs on **placeholder CC0 photography** (`src/assets/placeholders/acad-*.jpg`, seeded by `scripts/seed-academic-images.mjs`); real Academy photography has never been added. Git workflow is **staging-first**: work on `staging`, then fast-forward `main`.

---

## Stack essentials

Full stack notes and the `astro.config.mjs` landmines are in `docs/agent/stack-and-config.md`. The must-knows:

- **Astro**, TypeScript strict, `output: 'static'`. Node 22.12+.
- **Sanity v6** is the CMS (schemas in `studio/schemaTypes/`). The Studio is **embedded at `/studio`** via `@sanity/astro` (mounted in `astro.config.mjs`; the root `sanity.config.ts` re-exports `studio/sanity.config.ts` so the embedded Studio and the nested `studio/` package can never drift). It rebuilds with every deploy. The old hosted `presbyterian-academy.sanity.studio` is retired: a hosted Studio drifts stale between schema deploys. The nested package still exists for `typegen` / `schema extract`.
- **Tailwind 4 via `@tailwindcss/vite`.** There is no `tailwind.config.mjs`. Brand tokens live in `@theme` blocks in `src/styles/globals.css`.
- **React 19 islands** for interactivity; Astro components for everything static.
- **Cloudflare Workers** for hosting, not Pages (Pages is in maintenance mode). Deploy with `wrangler deploy`.
- **Web3Forms** contact + express-interest forms with **hCaptcha**, **Calendly** intro calls, **Cloudflare Web Analytics** (cookieless, no banner).
- **`sanityFetch(query, params, fallback)`** in `src/lib/sanity.ts` is the single chokepoint for all Sanity reads. When `PUBLIC_SANITY_PROJECT_ID` is absent or set to the placeholder value, it returns the fallback without any network call, so `npm run build` succeeds with no Sanity project configured; pages render empty-state content.

## Live draft preview (`/preview/**`)

Editors see their **unpublished drafts** rendered in the real design, live, inside the Studio: open the **Presentation** tool at `/studio`, and the page list on the left drives an iframe of the site.

How it fits together (ported from the WCP site 2026-08-25; that repo's architecture notes are the reference):

- `/preview/**` and `/api/draft-mode/*` are the site's only **SSR** routes (`prerender = false`). Everything else stays statically built. They are `noindex` and never appear in the sitemap.
- `src/lib/cms-preview.ts` is a THIRD Sanity client, separate from `src/lib/sanity.ts` (build-time): it reads the token from the **Worker runtime env** per request, uses `perspective: 'drafts'`, and turns on **stega** so click-to-edit works.
- **Never compare a stega-encoded string in logic.** Stega hides ~1KB of invisible markers inside every string it touches, so `tone === 'chapel'` is `false` on an encoded value and the component silently picks the wrong branch, in preview only. Every enum that drives rendering is excluded via `NON_STEGA_FIELDS` in `cms-preview.ts`. **Add any new logic-driving dropdown field to that list.**
- `src/pages/preview/live.ts` is an **SSE proxy**: it holds ONE long-lived connection to Sanity's listen API server-side (the token never reaches the browser) and forwards a tiny "change" signal. `VisualEditingOverlay` soft-refetches the page and swaps `#main`. It is event-driven on purpose. **Never replace it with an interval poll** (that is what burned the WCP Sanity quota).
- The preview cookie carries an **unforgeable fingerprint** of the server-side token (`src/lib/preview-auth.ts`), not the package's default `'true'`.
- Preview pages render chrome-less (a slim bar says so). The real Header/Footer link to the live site and would bounce the editor's iframe out of the preview.
- Singleton pages preview their **editable surface only**: hero, the `flexibleSections` builder blocks, and the closing CTA. The code-owned middle (course rails, filters, stats) renders on the live site only, and a note in the preview says so. Custom `page` docs preview in full.
- Path→type mapping lives in TWO places that must stay in sync: `SINGLETON_PREVIEW_PATHS` in `studio/resolve.ts` and `SINGLETON_BY_PATH` in `src/pages/preview/[...slug].astro`.
- Runtime secret: `SANITY_TOKEN` (`.dev.vars` locally, `wrangler secret put SANITY_TOKEN` in production). Without it the preview routes fail closed.

## Keep the docs in sync

A change is not done until the documentation that describes the changed behavior is updated **in the same commit**:

1. The affected files under `docs/` (and `README.md` / this file / `OPERATIONS.md` when the architecture or commands shift).
2. The in-Studio editor guides (`studio/guides/content.tsx`) when the change touches anything a faculty editor does in Studio.
3. `docs/PENDING.md` when the change closes, opens, or discovers an open loop.

Stale docs in this repo have already shipped real bugs (the 2026-06-14 stale-types incident traced to a doc claiming typegen ran in the build when it did not). Doc drift is a defect, not a chore.

## Gotchas: the rules that bite if you forget them

Each entry carries the date it bit (or was decided) and the symptom, so future sessions can judge whether it still applies.

1. **Never click "Remove field" in the Studio** (2026-06). It deletes that field's data across every document and cannot be undone without a dataset restore. It appears when the Studio's schema is older than the data. Since the Studio is now embedded (it ships with the site build), the sequence after a schema change is: edit schema, `npm run typegen`, commit, deploy. No separate `studio:deploy` step.
2. **`npm run build` does NOT run typegen** (bit 2026-06-14: schema changed, committed `src/lib/sanity.types.ts` went stale, build used old types). Run `npm run typegen` manually after any schema change, or use `npm run build:full`. CI fails if the committed types are stale; that guard is the durable fix, keep it.
3. **No em-dashes in public-facing site copy** (standing rule). Use commas, colons, or restructure. Code comments, commit messages, and internal docs are exempt, but avoid them there too.
4. **Build in both light AND dark mode** on every UI change (standing rule). **Light is the default** (a new visitor does not follow the OS; "system" is opt-in). Detail in `docs/agent/theme-and-color.md`.
5. **Desktop nav is server-rendered** in `Header.astro` (standing rule). Do not regress it to a client-only island. Detail in `docs/agent/page-architecture.md`.
6. **The Lenis scroll reset on navigation** (forward goes to top, back/forward restores) lives in the BaseLayout Lenis init. Do not remove it. Detail in `docs/agent/polish-layer.md`.
7. **The PUBLIC site is statically built** (standing). A Sanity edit only reaches visitors after a rebuild (push to `main`, or the publish webhook). Editors do not have to wait to SEE their work, though: the `/preview` routes are SSR and draft-aware, so the Presentation tool shows unpublished edits immediately. Detail in `docs/agent/deployment.md`.
8. **Verify image output paths after any `@astrojs/cloudflare` bump** (2026-06: `13.6.0` regressed Astro's image optimizer and the adapter sat pinned at `13.5.5` until the 2026-08-25 Astro 7 upgrade moved it to `^14`; the upgrade also removed the old `overrides: {vite: "^7"}` pin, which broke Astro 7's prerender step). The v14 adapter splits output into `dist/client` + `dist/server`; `wrangler.jsonc` points assets at `./dist/client`.
9. **`overflow-x: clip` on `html` + `body`** (in `globals.css`, `@layer base`) is the mobile horizontal-scroll guard: the scroll-reveal `.reveal-l`/`.reveal-r` `translate` would otherwise shift not-yet-revealed elements off-screen and let every page wobble sideways on phones. Don't remove it or swap it to `overflow: hidden` (which breaks the sticky course-detail aside and Lenis's smooth scroll).
10. **The CSP is hand-maintained in `public/_headers`** (2026-06: Astro's `security.csp` missed runtime inline scripts and broke theme bootstrap + islands; it was reverted). Any new embed origin (video host, captcha, analytics) must be added there manually or the widget silently fails to render (bit 2026-06-15 with hCaptcha).
11. **Dev-server React `Invalid hook call` noise is a known dev-only Cloudflare-adapter bug** (astro#16529). The production build is clean. Don't chase it.
12. **`react` and `react-dom` must be the EXACT same version, in both packages** (bit 2026-08-25: installing Sanity into the root pulled react to 19.2.8 while react-dom stayed 19.2.6, and the build died inside workerd with a wall of Miniflare stack frames; the real message, `Incompatible React versions`, was buried above them). Both are pinned exact (no caret) in `package.json` and `studio/package.json`. When a Miniflare/workerd failure looks unexplainable, read the lines ABOVE the `MiniflareCoreError` wrapper.
13. **The Windows build needs wrangler's workerd; `npm run build` handles it.** The plugin's pinned workerd aborts at prerender on Windows (`std::terminate`), so `scripts/with-workerd.mjs` sets `MINIFLARE_WORKERD_PATH` to wrangler's newer binary on win32. Bit a real deploy 2026-08-26 back when the workaround lived only in the docs. Detail in `docs/TESTING.md`.
14. **`wrangler` is pinned to `~4.110.0`** (2026-08-25). `@astrojs/cloudflare` v14 writes `legacy_env: true` into the generated `dist/server/wrangler.json`, and wrangler 4.126+ rejects that field outright ("no longer supported"), so every `wrangler dev`/`deploy` against the generated config fails. Revisit when a newer adapter stops emitting it.
15. **Deploy with the generated config: `wrangler deploy -c dist/server/wrangler.json`** (baked into `npm run deploy`). The build is now hybrid static + SSR; a bare `wrangler deploy` reads the root `wrangler.jsonc`, which knows nothing about the SSR entrypoint, and every sub-route 404s.
16. **`session: false` in `astro.config.mjs` is load-bearing.** Left on, the Cloudflare adapter auto-declares a `SESSION` KV binding in the generated config, and a KV binding with no namespace id fails the deploy. This site has no login, so there is nothing to keep.
17. **The nested studio package means TWO node_modules trees — `resolve.dedupe` in `astro.config.mjs` is what makes the embedded Studio possible. Never remove it** (this was the ACTUAL cause of the 2026-08-26 production Studio crashes, behind four failed fixes). The Studio shell (`@sanity/astro`) resolves `sanity`/`styled-components`/`@sanity/ui` from the ROOT `node_modules`; every file under `studio/` resolves them from `studio/node_modules` — same pinned versions, two module instances, two React contexts. The ThemeProvider mounted by one styled-components is invisible to `useTheme` in the other, so the desk died on its first custom-component render (styled-components error #18, then `Cannot read properties of undefined (reading 'v2')`) while the login screen — core code only — rendered fine. WCP never hits this because its studio lives in the same package as the site. Verification that matters: `grep -l "errors.md#" dist/client/_astro/*.js` must list exactly ONE file (every broken build listed two), and any disk-copy audit must sweep BOTH trees: `find node_modules studio/node_modules -path "*@sanity/ui/package.json"`. `@sanity/icons` is deliberately NOT deduped (sanity core wants v5, @sanity/ui v3 wants v3.8; icons are stateless so duplication is harmless — deduping them broke the build on the missing v5 `CogIcon`).
18. **The Sanity stack is PINNED to exact versions that are known to work together — do not bump one in isolation** (cost most of 2026-08-26 and three failed production fixes). The Studio threw styled-components **error #18** ("Accessing `useTheme` hook outside of a `<ThemeProvider>`") for every signed-in editor. Root cause: **mixed `@sanity/ui` majors**. `sanity` 6.11 pulls `@sanity/ui` v4 (a rewrite that themes via CSS variables), while much of the plugin ecosystem still ships v3 components that read their theme through styled-components. npm nested a second copy, and the v3 components found no styled-components ThemeProvider. The fix was to mirror the WCP repo's proven, working combination **exactly**: `sanity` 6.4.0, `@sanity/ui` **3.3.5**, `sanity-plugin-media` 5.0.11, `sanity-plugin-utils` 2.0.6 (pinned through `overrides`; the default 2.0.17 drags in v4), `sanity-plugin-asset-source-unsplash` 7.0.15, `styled-components` 6.4.3, react/react-dom/react-is 19.2.7.
    **"Latest v3" is not close enough.** Pinning `@sanity/ui` to 3.5.3 instead of 3.3.5 cleared error #18 but then failed differently — `TypeError: Cannot read properties of undefined (reading 'v2')` from inside styled-components' `generateAndInjectStyles`, because `sanity` 6.4.0 expects the 3.3.x theme shape. The unsplash plugin is held at 7.0.15 for the same reason (7.0.20 demands `@sanity/ui` ^3.4.0, which would drag 3.3.5 forward again). Any Sanity dependency change must be checked against the sibling repo's resolved versions, not just its semver ranges. **Invariant: `find node_modules -path "*@sanity/ui/package.json"` must print exactly ONE line.** Check it after touching any Sanity dependency.
    Two traps this hid behind: the Studio shell and the LOGIN screen render fine (they are core code), so the crash only appears AFTER signing in; and the chunk named in the stack trace changes between builds (`layer-*`, `button-*`, `sanity-ui-runtime-*`), which makes one bug look like several.
19. **`@sanity/ui` v3 has no subpath exports beyond `./theme`.** `import { useToast } from '@sanity/ui/toast'` is v4-only syntax and fails `sanity schema extract` with "is not exported under the conditions". On v3, import it from the package root. v3 exports exactly: `.`, `./_visual-editing`, `./theme`, `./package.json`.
20. **Curling a page is not verifying it.** `/studio` returned 200 with real HTML while being completely broken at React mount. Anything that mounts a client framework has to be opened in a real browser with the console read. Same rule as the schema gotcha: a green build proves nothing about runtime.
21. **`src/components/ui/accordion.tsx` is customized** (removed the `h-(--radix-accordion-content-height)` lock, dropped `text-sm font-medium` from the trigger). Reinstalling via `npx shadcn add` reverts it; reapply the changes.

---

## Build pipeline

`npm run build` is: `node scripts/generate-og-pages.mjs` (per-page OG cards), then `astro build`. Pages fetch content from Sanity at build time via `sanityFetch`; with no Sanity project configured every query returns its fallback and the build still completes with empty-state pages. **Typegen is NOT part of this chain** (gotcha #2): run it yourself after schema edits, or use `npm run build:full`.

Standalone scripts:

- `npm run typegen` regenerates `src/lib/sanity.types.ts` from the schemas (committed, CI-guarded).
- `npm run og` regenerates `public/og-default.png` (after changing brand colors, tagline, or wordmark inputs in `scripts/generate-og-default.mjs`).
- `npm run studio:dev` runs the Studio standalone (rarely needed; the embedded `/studio` is the real one). There is no `studio:deploy`: deploying the site deploys the Studio.
- Content seeds, all **dry-run by default** (add `--apply` to write), all idempotent:
  - `node scripts/seed-academic-images.mjs` sets the home hero slideshow and fills empty course covers + page heroes with academic placeholders. Protects real editor images.
  - `node scripts/seed-page-copy.mjs` patches the built-in inline-fallback copy into any EMPTY home / about / get-started / faculty / `siteSettings.funder` field, so Studio mirrors the live site. Never clobbers an editor's copy.
  - `node scripts/seed-editability.mjs` is the full editability seed (2026-06-15): render-neutral, only-empty + `createIfNotExists`. Re-run safe.
  - `node scripts/sanity-audit.mjs` (also `/sanity-audit`) reports dataset ground truth.

## Code conventions

- TypeScript strict mode. No `any`.
- Comment generously, especially in components a future maintainer might edit by hand.
- At the top of each component file, a header comment marks it `// Safe to edit by hand` or `// Foundation, edit with care`.
- Astro components for static content. React islands only where interactivity is required.
- Prefer Astro's `<Image />` / `<Picture />` for locally-bundled assets; the `<SanityImage />` wrapper for Sanity-hosted images.
- Tailwind utility classes inline. Pull into `@apply` only when a pattern repeats four or more times.
- `clsx` / `class-variance-authority` for conditional classes once components get state-dependent styling.

---

## Routes summary

| Path | Source | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Home: split hero, wayfinding ledger, start-here rail, stats, course + faculty + testimonial strips |
| `/about` | `src/pages/about.astro` | About page singleton |
| `/courses` | `src/pages/courses/index.astro` | Course catalog + filters (topic, teacher, term) |
| `/courses/[slug]` | `src/pages/courses/[slug].astro` | Course detail: sessions, pricing, instructors |
| `/faculty` | `src/pages/faculty/index.astro` | Faculty index |
| `/faculty/[slug]` | `src/pages/faculty/[slug].astro` | Faculty profile: degrees, publications, courses taught |
| `/events` | `src/pages/events/index.astro` | Events: info sessions, lectures, term starts |
| `/events/[slug]` | `src/pages/events/[slug].astro` | Event detail |
| `/pricing` | `src/pages/pricing.astro` | Pricing tiers + scholarships |
| `/for-you` | `src/pages/for-you.astro` | "Find your path" audience routing |
| `/get-started` | `src/pages/get-started.astro` | Express-interest + Calendly intro |
| `/resources` | `src/pages/resources.astro` | Resources page |
| `/faq` | `src/pages/faq.astro` | FAQ page + faqItem collection grouped by category |
| `/contact` | `src/pages/contact.astro` | Contact details + map |
| `/privacy` | `src/pages/privacy.astro` | Privacy policy singleton, static fallback when the doc is absent |
| `/accessibility` | `src/pages/accessibility.astro` | Accessibility statement singleton + static fallback; barrier-report contact from `siteSettings` |
| `/[slug]` | `src/pages/[slug].astro` | Custom pages: the `page` collection + the 19-block page builder (with a `RESERVED` slug guard) |
| `/style-guide` | `src/pages/style-guide.astro` | SECRET internal brand reference: noindex, unlinked, sitemap-excluded |
| `/studio` | `@sanity/astro` (mounted) | The embedded Sanity Studio (SSR shell) |
| `/preview/**` | `src/pages/preview/[...slug].astro` | SSR draft preview for the Studio's Presentation tool. noindex, sitemap-excluded |
| `/preview/live` | `src/pages/preview/live.ts` | SSE proxy for preview auto-refresh (403 without the Studio cookie) |
| `/api/draft-mode/*` | `src/pages/api/draft-mode/` | Turns draft mode on/off for the preview |
| `/sitemap-index.xml` | `@astrojs/sitemap` (auto) | Production sitemap |
| `/404` | `src/pages/404.astro` | Custom 404 |

Most fixed routes end with `<Sections sections={page?.flexibleSections} />`: the page-builder blocks an editor appends below the built-in content.

---

## Safe to edit by hand

Files a maintainer can change without risk of breaking the architecture:

- Inline **fallback** copy inside `src/pages/*.astro` (the safety net, NOT the live content; live copy is edited in Studio).
- `src/data/site.ts` static identity constants (site name, domain, derived storage keys).
- The design seam:
  - `src/styles/globals.css` `@theme` block: palette tokens, font-family tokens.
  - Font imports at the top of `globals.css` (`@fontsource-variable/fraunces`, `@fontsource-variable/source-sans-3`).
  - `public/favicon.png` + `public/apple-touch-icon.png` (overridable per-site via `siteSettings.favicon`), `public/og-default.png` (regenerate via `npm run og`).
  - Logo files in `src/assets/`.
- Placeholder images in `src/assets/placeholders/` (see its `MANIFEST.md`).
- Copy strings and `href` values in static page components.
- Tailwind utility classes on existing components when content needs different visual weight.
- Brand inputs in `scripts/generate-og-default.mjs` (re-run `npm run og` after editing).

## Foundation, edit with care (route through a planned session)

- `src/styles/globals.css` beyond the design-seam tokens: shadcn `:root` / `.dark` overrides, polish-layer utilities, base resets, print styles.
- `studio/schemaTypes/*.ts` Sanity schemas. Changing fields can break existing content. See gotcha #1.
- `studio/structure.ts`, `studio/sanity.config.ts`, `studio/guides/` (the desk structure, workspace config, and editor help center).
- `src/lib/sanity.ts` (client + `sanityFetch` + `urlFor`; the graceful-fallback behavior is load-bearing for fresh-clone builds), `src/lib/queries.ts`, `src/lib/sanity.types.ts` (generated), `src/lib/schemas.ts`, `src/lib/siteSettings.ts`, `src/lib/sectionVisibility.ts`, `src/lib/scriptAccent.ts`, `src/lib/slugify.ts`, `src/lib/subscribe.ts`, `src/lib/phone.ts`, `src/lib/reading-time.ts`, `src/lib/portable-text-headings.ts`, `src/lib/utils.ts`.
- `src/layouts/BaseLayout.astro`: anti-FOUC theme bootstrap, skip link, ClientRouter, Lenis init, scroll-reveal observer, sticky-header listener, analytics, OG meta, JSON-LD.
- React islands: `MobileNav.tsx`, `ThemeToggle.tsx`, `BackToTop.tsx`, `CourseFilters.tsx`, `FacultyFilter.tsx`, `FaqAccordion.tsx`, `FormRenderer.tsx`, `NewsletterSignup.tsx`, `CopyEmailButton.tsx`, `PortableText.tsx`, `Embed.tsx`.
- Astro components: `Header.astro`, `Footer.astro`, `Hero.astro`, `HeroBackground.astro`, `HeroSlideshow.astro`, `Sections.astro` (the block renderer), `SectionShell.astro`, `SectionHeading.astro`, `SanityImage.astro`, `PortableTextStatic.astro`, `CourseCard.astro`, `FacultyCard.astro`, `PricingTierCards.astro`, `FinalCta.astro`, `CtaLink.astro`, `ShowcaseMedia.astro`, `EmbedBlock.astro`, `FormBlock.astro`, plus the 19 block components in `src/components/blocks/`.
- `src/components/ui/` shadcn primitives (see gotcha #12 for `accordion.tsx`).
- `scripts/generate-*.mjs`, `scripts/optimize-logo-files.mjs`, `scripts/lib/`.
- `astro.config.mjs`, `wrangler.jsonc`, `package.json`, `tsconfig.json`, `components.json`, `public/_headers` (see gotcha #10), `public/llms.txt`.

If a change requires editing the foundation set, do it deliberately and update this doc when the architecture shifts.

---

## Visual verification workflow

Every UI change is verified before being reported done. The automated suites (see `docs/TESTING.md`) are the regression net; the screenshot loop below is for judging the change itself.

For any change touching components, layouts, styles, or copy that affects layout:

1. **Both themes.** Light AND dark. Light is primary, but dark must read as the brand, not as broken.
2. **Both viewports.** Mobile (~375px) and desktop (~1280px). Most visitors arrive on mobile.
3. **Interactive states.** Hover, focus (keyboard Tab), active. Mouse AND keyboard.
4. **Adjacent regressions.** Look at the sections immediately before and after the change.

Use the Playwright MCP for the screenshot-and-compare loop against `npm run dev`. Don't ship a change you haven't seen rendered. For accessibility-affecting changes, the automated axe + Lighthouse gates are the floor, not the ceiling: targets stay 100/100/100/100 desktop.

For Sanity Studio changes (schema or structure), run `npm run studio:dev` and check the editor experience as a content editor would see it. Broken Studio = broken editor workflow.

Even "tiny" changes (a color tweak, a spacing nudge, a copy edit) go through the same loop. The smallest changes are where regressions hide.

---

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

### Site copy voice (for copy that appears on the live site)

The Academy's specific voice, tone, and banned words live in `docs/brand/voice.md` (read it before writing site copy). The general patterns:

1. **Say it plainly. Especially about money.** Don't apologize, don't pad, don't soften prices.
2. **Sound like a smart friend, not a brochure.**
3. **Show the thinking, not the credentials.** Specific reasoning beats generic claims of expertise.
4. **Stop talking when you're done.** End the paragraph.
5. **Be specific.** Concrete details beat generic descriptors.

Banned vocabulary: "transformative," "curated experience," "investment in your space," "elevated living," "tailored solutions."

---

## Topic index

Read these on demand. They are NOT auto-loaded; open with the Read tool when a task touches the area.

**Note:** some `docs/agent/` deep-dives still carry examples from the builds this repo descends from. Trust the patterns; ignore off-brand nouns, and fix them when you touch a file.

| Area | Doc |
|---|---|
| **Open loops registry (read early each session)** | `docs/PENDING.md` |
| **Test-suite map (which suite covers what)** | `docs/TESTING.md` |
| **Design brief (one-file system: palette, type, motion, idioms, hard rules)** | `design.md`; live visual reference: the secret `/style-guide` route |
| **Product strategy (register, users, anti-references, design principles)** | `PRODUCT.md` (root); companion to `design.md`, read by the Impeccable design skill |
| Stack detail + astro.config landmines | `docs/agent/stack-and-config.md` |
| Page + section architecture, nav, visibility toggles | `docs/agent/page-architecture.md` |
| Brand colors + theme system (light/dark discipline) | `docs/agent/theme-and-color.md` |
| Polish layer (card-lift, scroll, Lenis, script accents) | `docs/agent/polish-layer.md` |
| Animation layer (Lenis, motion, scroll-reveal, Ken Burns hero) | `docs/agent/animation.md` |
| Typography + spacing tokens | `docs/agent/design-tokens.md` |
| Component catalog + long-read layout | `docs/agent/components.md` |
| Component sourcing guide (approved sources, token-remap cheat sheet) | `docs/agent/component-sources.md` |
| Error + empty states | `docs/agent/error-states.md` |
| Image handling | `docs/agent/images.md` |
| Accessibility | `docs/agent/accessibility.md` |
| SEO + JSON-LD | `docs/agent/seo.md` |
| Performance budgets + Lighthouse | `docs/agent/performance.md` |
| Content data + Sanity integration | `docs/agent/sanity.md` |
| Content editability (live page-by-page map) | `docs/agent/content-editability-audit.md` |
| Deployment + env vars + rebuild model | `docs/agent/deployment.md` |
| CI/CD, staging preview, Sanity backups, uptime, hCaptcha (ops hardening) | `docs/agent/ci-cd-and-ops.md` |
| Change history | `docs/agent/changelog.md` |
| Launch-gate checklist | `docs/bootstrap/setup-checklist.md` |
| Research (peer audits, lay-school IA patterns, the 2026-06 brand-direction debate) | `docs/research/` |
| Placeholder media licensing | `src/assets/placeholders/MANIFEST.md` |

---

*Structure: this file is the always-loaded constitution. Deep reference lives under `docs/agent/`. Change history is in `docs/agent/changelog.md`. Tactical playbook: `OPERATIONS.md`.*
