# NCS Church Starter — CLAUDE.md

This is the always-loaded reference for the `ncs-presacademy` codebase: the conventions and landmines an agent needs on every task. Deep detail for specific areas (theme, components, SEO, performance, Sanity, deployment) lives under `docs/agent/` and is read on demand. The topic index at the bottom is the map.

> **This repository is a reusable church-website starter** (Astro + Sanity + Cloudflare Workers), extracted from a finished, live church build. It ships with placeholder identity ("The Presbyterian Academy", presbyterianacademy.org) that `scripts/rebrand.mjs` stamps with a real church's details, a starter Sanity dataset (`npm run seed`), and the **Events** and **Sermons** modules enabled. (This particular repo has moved well past that starting point: see the Current project state note below.) **Sanity is the single source of truth for all site content** (see the callout below). New-project flow: `README.md` quick start, then `docs/bootstrap/NEW-PROJECT.md`.
>
> **Content model — Sanity is the single source of truth.** Every piece of visible content (page copy, headings, buttons/links, images, the nav menus, SEO titles/descriptions, the worship service time, contact details) is a Sanity field; on a launched site every field should be populated so Sanity Studio mirrors the live site exactly. The literal strings in `src/pages/*.astro` are **safety-net fallbacks** (in the template they carry the placeholder-church example copy) that render only when a field is empty; on a live project they are NOT the live content. **Change content in Studio (the site rebuilds), not in the `.astro` files** — a populated Sanity field overrides the inline string. Values that repeat are single-sourced: the worship time is `siteSettings.worshipService` (derived everywhere via `src/lib/serviceTime.ts`); identity / contact / social (church name, email, pastoral email, phone, address, office hours, socials, give/watch links) resolve through `src/lib/siteSettings.ts` (`resolveSiteSettings`), read by the header, footer, nav, JSON-LD, and every page. There is deliberately no hardcoded contact/social fallback in `src/data/site.ts`, so an empty Sanity field renders blank or hides rather than showing a stand-in. Live page-by-page map: `docs/agent/content-editability-audit.md` (it supersedes the older `editor-vs-hardcoded.md`). Note: the worship-time single-sourcing example below is church-era; the school's equivalent derived cue is the next term (`getNextTerm`), shown in the header utility bar.

Companion tactical runbook: `OPERATIONS.md`. New-project setup entry point: `docs/bootstrap/NEW-PROJECT.md` with `docs/bootstrap/setup-checklist.md` as the launch gate.

Project slash commands (in `.claude/commands/`): `/sanity-audit` (ground truth on the dataset: counts, gaps, drafts — run it before debugging any "content looks wrong" report), `/rebuild` (trigger the production rebuild that makes published Sanity content live), `/visual-verify` (the both-themes-both-viewports screenshot loop). The design system summary for visual work is `design.md` at the repo root.

> **Current project state (2026-06-14).** This repo is no longer a generic church-starter instance: it is the live build for **The Presbyterian Academy, a Reformed lay-formation SCHOOL** (not a church). The church routes/modules (sermons, worship, ministries, kids, weddings, give, what-we-believe, music, journal) were removed in the lay-school revamp and replaced by the school catalog: **courses, faculty, terms, pricing tiers, teaching areas, testimonials**. The brand is **"Direction A": green-anchored bookish minimalism** — near-white warm paper, soft near-black ink, a deep Reformed forest green anchor, brass hairlines, Fraunces over Source Sans 3, and a green eyebrow-rubric signature; the Romanesque arch and the paper-grain texture are retired. Current palette lives in `design.md` and `docs/agent/theme-and-color.md`; the branding decision is written up in `docs/research/2026-06-14-brand-direction-debate.md`. A live visual reference of every token, font, and example component is the secret **`/style-guide`** route (noindex, unlinked, sitemap-excluded). The site also carries a CSS-first "refined kinetic editorial" motion system (graph-paper atmosphere, a kinetic hero headline, choreographed scroll reveals, a topics ticker, stat count-ups; details in `docs/agent/animation.md`), and the Sanity dataset is seeded with PLACEHOLDER images (`scripts/seed-placeholder-images.mjs`) so the site renders fully for styling until real photography is added. The Header utility bar shows live enrollment status (the next term via `getNextTerm`); the Footer is a printed-book "colophon" (oversized wordmark, brass-ruled imprint, monogram seal, designer credit). The theme **defaults to LIGHT** (a new visitor no longer follows the OS; "system" is opt-in via the toggle, and the choice persists). **The school was founded in 2026: never highlight a founding year or imply a long history or large enrollment** (the placeholder "Est. 1998" / "1,200+ learners" copy was scrubbed); the **Presbytery of Cincinnati funds the school**, surfaced as an editable `siteSettings.funder` footer line ("Made possible by the ..."). A 2026-06 **content-editability pass** made the home + about sections and the detail-page data-loss fields editor-driven and added a per-document "View on the live site" banner to Studio; the live page-by-page editability map is `docs/agent/content-editability-audit.md`, and `scripts/seed-page-copy.mjs` mirrors the built-in copy into Studio. Much of the generic *starter* framing below still describes the reusable template this was extracted from; trust this note for the current site.

---

## About this starter

`ncs-presacademy` is a production-ready Astro + Sanity + Cloudflare Workers church-website template extracted from a finished client build. The infrastructure — build pipeline, CMS integration, deploy hooks, polish layer, component library, the full church page set (visit, believe, music, staff, grow, serve, kids, food, events, sermons, weddings, space, give, contact, FAQ), and a Lighthouse 100/100/100/100 baseline — is already standing. A new project stamps in its identity (`npm run rebrand`), seeds the starter content (`npm run seed`), and pours in its own design seam: colors, fonts, mark, photography, copy.

This starter is not a minimal scaffold. It ships with real patterns and real gotchas documented from production. The point is to skip the month of discovering them.

_Provenance: Reid Design build → ncs-astro-sanity-starter → Second Presbyterian Church of Chicago build (2026-06) → this church starter → The Presbyterian Academy build. Reference-build photography in `src/assets/` is placeholder-only: replace before any client launch._

---

## Stack essentials

Full stack notes and the `astro.config.mjs` landmines are in `docs/agent/stack-and-config.md`. The must-knows:

- **Astro 6.3.x**, TypeScript strict, `output: 'static'`. Node 22.12+.
- **Sanity v5** is the CMS (schemas in `studio/schemaTypes/`). All editable content lives in Sanity. `npm run typegen` regenerates types from the schemas.
- **Tailwind 4 via `@tailwindcss/vite`.** There is no `tailwind.config.mjs`. Brand tokens live in `@theme` blocks in `src/styles/globals.css`.
- **React 19 islands** for interactivity; Astro components for everything static.
- **Cloudflare Workers** for hosting, not Pages (Pages is in maintenance mode). Deploy with `wrangler deploy`.
- **Web3Forms** contact form, **Calendly** discovery call, **Cloudflare Web Analytics** (cookieless, no banner).
- **`sanityFetch(query, params, fallback)`** in `src/lib/sanity.ts` is the single chokepoint for all Sanity reads. When `PUBLIC_SANITY_PROJECT_ID` is absent or set to the placeholder value, it returns the fallback without any network call, so `npm run build` succeeds with no Sanity project configured — pages render empty-state content.

### The rules that bite if you forget them

1. **Run `npm run studio:deploy` after ANY schema change.** Skip it and the hosted Studio shows "unknown fields" next to a "Remove field" prompt. **Never click "Remove field":** it deletes that field's data across every document and cannot be undone without a dataset restore. Correct sequence: edit schema, `npm run typegen`, `npm run studio:deploy`, commit.
2. **No em-dashes in public-facing site copy** (the text visitors read: page copy, component text, Sanity content). Use commas, colons, or restructure. Code comments, commit messages, plans, specs, and internal docs are exempt.
3. **Build in both light AND dark mode** on every UI change. **Light is the default** (a new visitor no longer follows the OS; "system" is opt-in). Detail in `docs/agent/theme-and-color.md`.
4. **Desktop nav is server-rendered** in `Header.astro`. Do not regress it to a client-only island. Detail in `docs/agent/page-architecture.md`.
5. **The Lenis scroll reset on navigation** (forward goes to top, back/forward restores) lives in the BaseLayout Lenis init. Do not remove it. Detail in `docs/agent/polish-layer.md`.
6. **Content is statically built.** A Sanity edit only goes live after a rebuild (push to `main`, or the publish webhook). Detail in `docs/agent/deployment.md`.
7. **`npm run typegen` runs before `astro build`** as part of the build chain. `src/lib/sanity.types.ts` is committed so collaborators don't need to run typegen to see the schema types in code. Run it locally after any schema change.
8. **`@astrojs/cloudflare` is pinned to exactly `13.5.5`.** Version `13.6.0` regressed Astro's image optimizer: optimized images write to `dist/client/_astro/` while the optimizer reads from `dist/_astro/`. Do not bump the adapter version without doing a verifying build.
9. **`overflow-x: clip` on `html` + `body`** (in `globals.css`, `@layer base`) is the mobile horizontal-scroll guard: the scroll-reveal `.reveal-l`/`.reveal-r` `translate` would otherwise shift not-yet-revealed elements off-screen and let every page wobble sideways on phones. Don't remove it or swap it to `overflow: hidden` (which breaks the sticky course-detail aside and Lenis's smooth scroll).

---

## Build pipeline

`npm run build` is a chain:

1. `npm run typegen` runs `sanity typegen generate` against the schemas in `studio/schemaTypes/`. Writes `src/lib/sanity.types.ts` so Astro queries get full type safety on Sanity responses. Runs before `astro build` so the types exist when the prerender worker imports them.
2. `astro build` runs as normal. Pages fetch content from Sanity at build time via the `sanityFetch` wrapper in `src/lib/sanity.ts`. When no Sanity project is configured, `sanityFetch` returns the provided fallback for every query, and the build still completes successfully with empty-state pages.

Standalone scripts:

- `npm run typegen` to regenerate Sanity TypeScript types after editing schemas (run this after any schema change before testing locally).
- `npm run og` to re-run `scripts/generate-og-default.mjs` and regenerate `public/og-default.png` (after changing brand colors, tagline, or the wordmark in the script's inputs block).
- `npm run studio:dev` to start the Sanity Studio locally for content editing.
- `npm run studio:deploy` to deploy the Sanity Studio to its hosted URL. **Run this after every schema change.** If you skip it, the hosted Studio shows "unknown fields" warnings next to data in new fields, and the editor sees a prompt to "Remove field." Do NOT click "Remove field" in Studio: it deletes the Sanity document data for every document with that field populated, and it cannot be undone without a dataset restore. The correct sequence is: edit schema, `npm run typegen`, `npm run studio:deploy`, commit.
- `node scripts/seed-placeholder-images.mjs` (add `--apply` to write) fills any empty course cover, faculty portrait, or page hero in the Sanity dataset with a placeholder image, so the site renders fully for styling. Idempotent; the editor swaps real photography later.
- `node scripts/seed-page-copy.mjs` (add `--apply` to write) patches the built-in inline-fallback copy into any EMPTY home / about / get-started / faculty / `siteSettings.funder` field, so Studio mirrors the live site instead of showing blank fields. Only-empty and idempotent (never clobbers an editor's copy). Run it after a re-schema, then `npm run studio:deploy`.

`public/og-default.png` is committed to the repo because it is a real asset shipped to visitors. `src/lib/sanity.types.ts` is also committed so collaborators don't need to run typegen to see what the schemas look like in code.

---

## Code conventions

- TypeScript strict mode. No `any`.
- Comment generously, especially in components that a future maintainer might edit by hand.
- At the top of each component file, add a header comment marking it `// Safe to edit by hand` or `// Foundation, edit with care`.
- Astro components for static content. React islands only where interactivity is required (lightbox, mobile nav, form handler, before/after slider, accordions).
- Prefer Astro's built-in `<Image />` and `<Picture />` components over plain `<img>` tags for any locally-bundled assets. For Sanity-hosted images, use the project's `<SanityImage />` wrapper (see image handling section).
- Tailwind utility classes inline. Pull into `@apply` only when a pattern repeats four or more times.
- Use `clsx` or `class-variance-authority` for conditional classes once components get state-dependent styling.

---

## Routes summary

The actual routes of this lay-school build (this replaces the church-starter route set):

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
| `/privacy` | `src/pages/privacy.astro` | Privacy policy singleton, with static fallback when the doc is absent |
| `/[slug]` | `src/pages/[slug].astro` | Custom pages: the `page` collection + the 16-block page builder |
| `/style-guide` | `src/pages/style-guide.astro` | SECRET internal brand reference: noindex, unlinked, sitemap-excluded |
| `/sitemap-index.xml` | `@astrojs/sitemap` (auto) | Production sitemap |
| `/404` | `src/pages/404.astro` | Custom 404 |

The opt-in modules under `modules/` are mostly church-era. `events` is active (reframed for school events); the former `sermons`, `worship`, `journal`, and ministry modules were removed in the lay-school revamp. The other staged modules (`portfolio`, `process`, `newsletter`, `lead-magnets`, `style-quiz`, `budget-calculator`, `shop`, `e-design`, `gift-certificates`, `press`, `resources`) are unused by this build.

---

## Safe to edit by hand

These are the files where a project maintainer can make changes without risk of breaking the underlying architecture:

- Inline **fallback** copy inside `src/pages/*.astro` — but note this is the safety-net default, NOT the live content. The live content is the (populated) Sanity field, which overrides it. Edit live copy in Studio; editing a fallback here only changes what shows if that field is ever cleared.
- `src/data/site.ts` — static identity constants (site name, domain, brand color mirrors for scripts, asset paths). Replace all placeholder values before launch.
- The design seam — files that define the visual identity of the project:
  - `src/styles/globals.css` `@theme` block: palette tokens (`--color-primary`, `--color-ink`, `--color-paper`, etc.), the `--tint-rgb` token (controls polish-layer tint color across card-lift, surface-warm, and branded overlays), and font-family tokens
  - Font imports at the top of `src/styles/globals.css` (swap `@fontsource-variable/fraunces` and `@fontsource-variable/source-sans-3` for a project's chosen fonts; update `--font-display` and `--font-body` tokens accordingly)
  - `src/data/site.ts` brand color mirrors and identity values
  - `public/favicon.png` + `public/apple-touch-icon.png` (the church mark; also overridable per-site via `siteSettings.favicon`), `public/og-default.png` (regenerate OG via `npm run og` after changing brand inputs in `scripts/generate-og-default.mjs`)
  - Logo files in `src/assets/` (imported by `Header.astro` / `Footer.astro` via `getImage()`)
- Images in `src/assets/` (logo variants, OG image)
- Copy strings and `href` values in static page components
- Tailwind utility classes on existing components when content needs different visual weight
- Brand colors, tagline, and wordmark inputs in `scripts/generate-og-default.mjs` (re-run `npm run og` after editing)

**Enabling the script accent (opt-in):** The calligraphic script accent is OFF by default. No script font loads unless you opt in. To enable it for a project: (1) add a `@fontsource` import for your chosen calligraphic face (e.g. `@fontsource/great-vibes/400.css`), and (2) update `--font-script` in the `@theme` block to name that face first. Components using the `font-script` utility class will then render the calligraphic accent.

## Foundation, edit with care (route through a planned session)

- `src/styles/globals.css` — the full file beyond the design seam tokens: shadcn `:root` / `.dark` overrides, **polish-layer utilities** (`.card-lift`, `.press-tactile`, `.nav-underline`, `.site-header`, `.reading-progress`, `.surface-warm`, `[data-reveal]`), base resets, paper-grain `body::before`, print stylesheet
- `studio/schemaTypes/*.ts` — Sanity schemas. Changing fields can break existing content. See gotcha #1 above.
- `src/lib/sanity.ts` — Sanity client, `sanityFetch` wrapper, `urlFor`, `parseSanityAssetDimensions`. The `isSanityUnconfigured` guard and graceful-fallback behavior are load-bearing for fresh-clone builds.
- `src/lib/queries.ts`, `src/lib/sanity.types.ts` — GROQ queries and generated types
- `src/lib/scriptAccent.ts` — shared helper `splitScriptAccent(headline, accent)` used by `Hero.astro`, `SectionHeading.astro`, and `FinalCta.astro`
- `src/lib/sectionVisibility.ts` — `getSectionVisibility(raw)` converts the raw `siteSettings.sectionVisibility` Sanity object into a flat boolean map. Rule: `value !== false` (unset/null/true = visible; only explicit false = hidden). Every toggleable page imports this. See [Section visibility](docs/agent/page-architecture.md#section-visibility).
- `src/layouts/BaseLayout.astro` — anti-FOUC theme bootstrap, skip link, header/main/footer wiring, View Transitions ClientRouter, Lenis init, **scroll-reveal observer**, **sticky-header scroll listener**, Cloudflare Analytics, OG meta, JSON-LD, title-suffix-doubling guard
- `src/components/ui/` shadcn primitives — **note: `accordion.tsx` is customized** (removed `h-(--radix-accordion-content-height)` lock + dropped `text-sm font-medium` from trigger). If you reinstall via `npx shadcn add` it will revert; reapply the changes.
- React islands: `MobileNav.tsx`, `ThemeToggle.tsx`, `BackToTop.tsx`, `ContactForm.tsx`, `BeforeAfterSlider.tsx`, `FaqAccordion.tsx`, `CalendlyInline.tsx`, `StickyCTAChip.tsx`, `CopyEmailButton.tsx`, `PortableText.tsx`, `JournalPortableText.tsx`, `StatsCounter.tsx`, `NewsletterSignup.tsx`
- Astro wrappers: `SanityImage.astro`, `StructuredData.astro` (if present), `SectionHeading.astro`, `SectionDivider.astro`, `ServiceAreaCue.astro`, `ReadingProgress.astro`, `ProcessStepIllustration.astro`, `Hero.astro`, `HeroBackground.astro`, `FinalCta.astro`, `CtaLink.astro`, `StatsRow.astro`, `FeaturedWork.astro`, `FeaturedJournal.astro`, `PressStrip.astro`
- `scripts/generate-og-default.mjs`, `scripts/generate-og-pages.mjs`, `scripts/generate-llms-full.mjs`, `scripts/generate-logo-variants.mjs`, `scripts/optimize-logo-files.mjs`, `scripts/import-content.mjs` — reusable generator and import scripts
- `astro.config.mjs`, `wrangler.jsonc`, `package.json`, `tsconfig.json`, `components.json`
- `public/_headers` (security response headers shipped with the deploy)
- `public/robots.txt` (allow-all + sitemap reference)
- `public/llms.txt` (AI/LLM crawler index — update if major pages change)

**Modules:** files under `modules/` each contain the page, islands, and schema additions for an opt-in feature. Activate a module by following its own `README.md` (authored per module in `docs/modules/`). Do not edit module internals without reading its doc first.

If a change requires editing the foundation set, do it in a planned session, write the change deliberately, and update this doc when the architecture shifts.

---

## Visual verification workflow

Every UI change is verified visually before being reported done. The build that ships first-time-right is the one where the person who wrote the code saw it rendering correctly in every state that matters. This is a rule, not a habit.

### What to verify

For any change touching components, layouts, styles, or copy that affects layout:

1. **Both themes.** Light AND dark. Toggle in the running site via the header `ThemeToggle`, or use Chrome DevTools' "Emulate CSS prefers-color-scheme" while testing system mode. Light is primary, but dark must read as the brand, not as broken.
2. **Both viewports.** Mobile (~375px wide) and desktop (~1280px wide). Most visitors arrive on mobile. Never ship desktop-only.
3. **Interactive states.** Hover, focus (keyboard Tab), active. Test with mouse AND keyboard.
4. **Adjacent regressions.** Look at the sections immediately before and after the change. Cascading styles wreck neighbors more often than expected.

### How to verify

Use the Playwright MCP for screenshot-and-compare loops:

1. `npm run dev` (or hit the deployed URL for deployed changes)
2. Open the page via Playwright MCP at both viewports
3. Take screenshots, light and dark
4. Compare against the intent (spec, mockup, or prior screenshot)
5. If something's off, fix and re-screenshot. Don't ship a change you haven't seen rendered.

For accessibility-affecting changes, run Lighthouse on the changed page before opening a PR. Targets: 100/100/100/100 desktop. Defend them — when a score drops, find out why before merging.

For Sanity Studio testing (schema or structure changes), run `npm run studio:dev` and check the editor experience as a content editor would see it. The Studio is the editor's UI; broken Studio = broken editor workflow.

### When NOT to skip this

Even "tiny" changes — a color tweak, a spacing nudge, a copy edit — go through the same loop. The smallest changes are where regressions hide because no one looks at them.

---

## Working with Claude

- Use Claude Code from the desktop app, not the terminal. Show diffs clearly so they read well in that UI.
- Prefer Plan Mode for any multi-file change, especially when touching Sanity schemas (schema changes propagate to live content).
- Pause for confirmation before installing new dependencies.
- When proposing design changes, describe the visual outcome in plain language, not just the code.
- For browser-based verification, prefer the Playwright MCP. See the [Visual verification workflow](#visual-verification-workflow) section above for what to verify and when.
- For Sanity Studio testing, run `npm run studio:dev` and check the editor experience as a content editor would see it.
- Don't report a UI change as done without screenshots in both themes and both viewports.

---

## Communication style

These apply to everything written: code comments, PR descriptions, commit messages, and copy on the site itself.

- Warm, conversational tone. Not stiff or corporate.
- Step-by-step structure for any process or how-to.
- No em-dashes in public-facing site copy. Use commas, periods, colons, or restructure the sentence. This rule is scoped to site copy only: code comments, commit messages, plans, specs, and internal docs may use em-dashes.
- No AI-tell phrases: delve, navigate (as a verb), leverage, robust, seamless, meticulous, tapestry, realm, landscape, testament to, ever-evolving, crucial, pivotal.
- No AI-tell sentence patterns: "It's not just X, it's Y," "Not only... but also," "It's important to note that," "When it comes to," "In the realm of," "That said" or "With that being said" as transitions.
- Don't open replies with filler like "Certainly!", "Absolutely!", "Great question!", or "I'd be happy to help."
- Don't close replies with "I hope this helps!" or "Let me know if you have any questions." End on the actual content.
- Avoid three-item lists where the third item is filler. Two items is fine if two is the truth.
- Use bold for genuine emphasis or list labels only, never random nouns mid-sentence.
- Default to prose, not headers and bullets, unless content is genuinely a list or step-by-step.
- Comment code generously so future maintainers can follow without reverse-engineering.

### Site copy voice (for copy that appears on the live site)

The church's specific voice, tone, and banned words live in `docs/brand/voice.md` (read it before writing site copy). The general patterns below still apply.

1. **Say it plainly. Especially about money.** Don't apologize, don't pad, don't soften prices with hedging language.
2. **Sound like a smart friend, not a brochure.** No "transformative experiences" or "elevated living."
3. **Show the thinking, not the credentials.** Specific reasoning beats generic claims of expertise.
4. **Stop talking when you're done.** End the paragraph. Don't tack on a closing line that restates the point.
5. **Be specific.** Concrete details beat generic descriptors.

Banned vocabulary: "transformative," "curated experience," "investment in your space," "elevated living," "tailored solutions."

---

## Topic index

Read these on demand. They are NOT auto-loaded, and they are referenced as plain paths so they stay lazy. Open with the Read tool when a task touches the area.

**Note:** the `docs/agent/` deep-dives are being genericized in a later pass. Some may still contain client-specific examples until that pass completes. Trust the patterns; ignore client-specific nouns.

`docs/bootstrap/NEW-PROJECT.md` is the setup entry point for adapting this starter to a new church, with `setup-checklist.md` as the launch gate.

| Area | Doc |
|---|---|
| **Design brief (one-file system: palette, type, motion, idioms, hard rules)** | `design.md` — attach it (plus screenshots) for any visual work. Live visual reference: the secret `/style-guide` route. |
| Stack detail + astro.config landmines | `docs/agent/stack-and-config.md` |
| Page + section architecture, nav, visibility toggles | `docs/agent/page-architecture.md` |
| Brand colors + theme system (light/dark discipline) | `docs/agent/theme-and-color.md` |
| Polish layer (brand stripe, card-lift, scroll, Lenis, script accents) | `docs/agent/polish-layer.md` |
| Animation layer (Lenis, motion, scroll-reveal, script accent) | `docs/agent/animation.md` |
| Typography + spacing tokens | `docs/agent/design-tokens.md` |
| Component catalog + long-read layout | `docs/agent/components.md` |
| Component sourcing guide (approved sources, token-remap cheat sheet, bundle flags) | `docs/agent/component-sources.md` |
| Error + empty states | `docs/agent/error-states.md` |
| Image handling | `docs/agent/images.md` |
| Accessibility | `docs/agent/accessibility.md` |
| SEO + JSON-LD | `docs/agent/seo.md` |
| Performance budgets + Lighthouse | `docs/agent/performance.md` |
| Content data + Sanity integration | `docs/agent/sanity.md` |
| Deployment + env vars + rebuild model | `docs/agent/deployment.md` |
| Editor-driven vs hardcoded | `docs/agent/editor-vs-hardcoded.md` |
| Change history | `docs/agent/changelog.md` |
| New-project setup runbook + pre-launch checklist | `docs/bootstrap/NEW-PROJECT.md`, `docs/bootstrap/setup-checklist.md` |
| Per-module enable guides | `docs/modules/<module-name>.md` |
| Research (church peer audit, lay-school IA patterns, the 2026-06 brand-direction debate + verdict) | `docs/research/` |

---

*Structure: this file is the always-loaded constitution. Deep reference lives under `docs/agent/` (see the topic index above). Change history is in `docs/agent/changelog.md`.*

See `OPERATIONS.md` for the tactical playbook (deploy, patch content, run audits, common gotchas).
