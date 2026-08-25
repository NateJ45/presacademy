# The Presbyterian Academy — CLAUDE.md

This is the always-loaded reference for the `ncs-presacademy` codebase: the conventions and landmines an agent needs on every task. Deep detail for specific areas (theme, components, SEO, performance, Sanity, deployment) lives under `docs/agent/` and is read on demand. The topic index at the bottom is the map.

> **What this is.** The live website for **The Presbyterian Academy**, a Reformed lay-formation SCHOOL (not a church), funded by the Presbytery of Cincinnati. Astro + Sanity v5 + Cloudflare Workers, fully static output. The repo was forked from the NCS church starter, de-churched in 2026-06, and **cut loose from the starter entirely on 2026-08-25** (the rebrand machinery, opt-in modules, church placeholder media, and the `upstream` remote are gone). Do not resurrect starter framing: this is a single-purpose site.
>
> **Content model: Sanity is the single source of truth.** Every piece of visible content (page copy, headings, buttons/links, images, nav menus, SEO titles/descriptions, contact details) is a Sanity field; on the live site every field should be populated so Sanity Studio mirrors the site exactly. The literal strings in `src/pages/*.astro` are **safety-net fallbacks** that render only when a field is empty; they are NOT the live content. **Change content in Studio (the site rebuilds), not in the `.astro` files.** Identity and contact values resolve through `src/lib/siteSettings.ts` (`resolveSiteSettings`); the header utility bar's enrollment cue derives from the next term via `getNextTerm` in `src/lib/queries.ts`. There is deliberately no hardcoded contact/social fallback in `src/data/site.ts`, so an empty Sanity field renders blank or hides rather than showing a stand-in. Live page-by-page map: `docs/agent/content-editability-audit.md`.

**Read `docs/PENDING.md` early in a session.** It is the live registry of open loops: queued work, known gaps, and waiting-on-a-human items. If you finish or discover one, update it in the same commit.

Companion tactical runbook: `OPERATIONS.md`. Test-suite map: `docs/TESTING.md`. Project slash commands (in `.claude/commands/`): `/sanity-audit` (ground truth on the dataset: counts, gaps, drafts; run it before debugging any "content looks wrong" report), `/rebuild` (trigger the production rebuild that makes published Sanity content live), `/visual-verify` (the both-themes-both-viewports screenshot loop). The design system summary for visual work is `design.md` at the repo root.

> **Current project state (updated 2026-08-25).** The site carries the school catalog: **courses, faculty, terms, pricing tiers, teaching areas, testimonials, events, FAQ**, plus a 19-block page builder for custom pages. The brand is **"Direction A": green-anchored bookish minimalism** (near-white warm paper, soft near-black ink, a deep Reformed forest green anchor, brass hairlines, Fraunces over Source Sans 3, a green eyebrow-rubric signature; the Romanesque arch and paper grain are retired). Palette lives in `design.md` and `docs/agent/theme-and-color.md`; the branding decision is `docs/research/2026-06-14-brand-direction-debate.md`; a live visual reference of every token is the secret **`/style-guide`** route (noindex, unlinked, sitemap-excluded). The site has a CSS-first "refined kinetic editorial" motion system (`docs/agent/animation.md`) and a 6-image Ken Burns home hero (`HeroSlideshow.astro` rendering `homePage.heroImages`). The theme **defaults to LIGHT** ("system" is opt-in via the toggle; the choice persists). **The school was founded in 2026: never highlight a founding year or imply a long history or large enrollment.** The **Presbytery of Cincinnati funds the school**, surfaced as the editable `siteSettings.funder` footer line. The Sanity dataset still runs on **placeholder CC0 photography** (`src/assets/placeholders/acad-*.jpg`, seeded by `scripts/seed-academic-images.mjs`); real Academy photography has never been added. Git workflow is **staging-first**: work on `staging`, then fast-forward `main`.

---

## Stack essentials

Full stack notes and the `astro.config.mjs` landmines are in `docs/agent/stack-and-config.md`. The must-knows:

- **Astro**, TypeScript strict, `output: 'static'`. Node 22.12+.
- **Sanity v5** is the CMS (schemas in `studio/schemaTypes/`; the Studio is a nested npm package in `studio/`, deployed to `presbyterian-academy.sanity.studio`). All editable content lives in Sanity.
- **Tailwind 4 via `@tailwindcss/vite`.** There is no `tailwind.config.mjs`. Brand tokens live in `@theme` blocks in `src/styles/globals.css`.
- **React 19 islands** for interactivity; Astro components for everything static.
- **Cloudflare Workers** for hosting, not Pages (Pages is in maintenance mode). Deploy with `wrangler deploy`.
- **Web3Forms** contact + express-interest forms with **hCaptcha**, **Calendly** intro calls, **Cloudflare Web Analytics** (cookieless, no banner).
- **`sanityFetch(query, params, fallback)`** in `src/lib/sanity.ts` is the single chokepoint for all Sanity reads. When `PUBLIC_SANITY_PROJECT_ID` is absent or set to the placeholder value, it returns the fallback without any network call, so `npm run build` succeeds with no Sanity project configured; pages render empty-state content.

## Keep the docs in sync

A change is not done until the documentation that describes the changed behavior is updated **in the same commit**:

1. The affected files under `docs/` (and `README.md` / this file / `OPERATIONS.md` when the architecture or commands shift).
2. The in-Studio editor guides (`studio/guides/content.tsx`) when the change touches anything a faculty editor does in Studio.
3. `docs/PENDING.md` when the change closes, opens, or discovers an open loop.

Stale docs in this repo have already shipped real bugs (the 2026-06-14 stale-types incident traced to a doc claiming typegen ran in the build when it did not). Doc drift is a defect, not a chore.

## Gotchas: the rules that bite if you forget them

Each entry carries the date it bit (or was decided) and the symptom, so future sessions can judge whether it still applies.

1. **Run `npm run studio:deploy` after ANY schema change** (2026-06). Skip it and the hosted Studio shows "unknown fields" next to a "Remove field" prompt. **Never click "Remove field":** it deletes that field's data across every document and cannot be undone without a dataset restore. Correct sequence: edit schema, `npm run typegen`, `npm run studio:deploy`, commit.
2. **`npm run build` does NOT run typegen** (bit 2026-06-14: schema changed, committed `src/lib/sanity.types.ts` went stale, build used old types). Run `npm run typegen` manually after any schema change, or use `npm run build:full`. CI fails if the committed types are stale; that guard is the durable fix, keep it.
3. **No em-dashes in public-facing site copy** (standing rule). Use commas, colons, or restructure. Code comments, commit messages, and internal docs are exempt, but avoid them there too.
4. **Build in both light AND dark mode** on every UI change (standing rule). **Light is the default** (a new visitor does not follow the OS; "system" is opt-in). Detail in `docs/agent/theme-and-color.md`.
5. **Desktop nav is server-rendered** in `Header.astro` (standing rule). Do not regress it to a client-only island. Detail in `docs/agent/page-architecture.md`.
6. **The Lenis scroll reset on navigation** (forward goes to top, back/forward restores) lives in the BaseLayout Lenis init. Do not remove it. Detail in `docs/agent/polish-layer.md`.
7. **Content is statically built** (standing). A Sanity edit only goes live after a rebuild (push to `main`, or the publish webhook). Detail in `docs/agent/deployment.md`.
8. **`@astrojs/cloudflare` was pinned to exactly `13.5.5`** (2026-06: `13.6.0` regressed Astro's image optimizer, writing optimized images to `dist/client/_astro/` while the optimizer read from `dist/_astro/`). Do not bump the adapter without a verifying build that checks image output paths.
9. **`overflow-x: clip` on `html` + `body`** (in `globals.css`, `@layer base`) is the mobile horizontal-scroll guard: the scroll-reveal `.reveal-l`/`.reveal-r` `translate` would otherwise shift not-yet-revealed elements off-screen and let every page wobble sideways on phones. Don't remove it or swap it to `overflow: hidden` (which breaks the sticky course-detail aside and Lenis's smooth scroll).
10. **The CSP is hand-maintained in `public/_headers`** (2026-06: Astro's `security.csp` missed runtime inline scripts and broke theme bootstrap + islands; it was reverted). Any new embed origin (video host, captcha, analytics) must be added there manually or the widget silently fails to render (bit 2026-06-15 with hCaptcha).
11. **Dev-server React `Invalid hook call` noise is a known dev-only Cloudflare-adapter bug** (astro#16529). The production build is clean. Don't chase it.
12. **`src/components/ui/accordion.tsx` is customized** (removed the `h-(--radix-accordion-content-height)` lock, dropped `text-sm font-medium` from the trigger). Reinstalling via `npx shadcn add` reverts it; reapply the changes.

---

## Build pipeline

`npm run build` is: `node scripts/generate-og-pages.mjs` (per-page OG cards), then `astro build`. Pages fetch content from Sanity at build time via `sanityFetch`; with no Sanity project configured every query returns its fallback and the build still completes with empty-state pages. **Typegen is NOT part of this chain** (gotcha #2): run it yourself after schema edits, or use `npm run build:full`.

Standalone scripts:

- `npm run typegen` regenerates `src/lib/sanity.types.ts` from the schemas (committed, CI-guarded).
- `npm run og` regenerates `public/og-default.png` (after changing brand colors, tagline, or wordmark inputs in `scripts/generate-og-default.mjs`).
- `npm run studio:dev` / `npm run studio:deploy` for the Studio (see gotcha #1).
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
