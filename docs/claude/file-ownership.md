# File ownership: safe to edit vs foundation

Moved out of CLAUDE.md. Read before editing anything outside the design seam.

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
- `src/sanity/schemaTypes/*.ts` Sanity schemas. Changing fields can break existing content. See gotcha #1.
- `src/sanity/structure.ts`, `sanity.config.ts`, `src/sanity/guides/` (the desk structure, workspace config, and editor help center).
- `src/lib/sanity.ts` (client + `sanityFetch` + `urlFor`; the graceful-fallback behavior is load-bearing for fresh-clone builds), `src/lib/queries.ts`, `src/lib/sanity.types.ts` (generated), `src/lib/schemas.ts`, `src/lib/siteSettings.ts`, `src/lib/sectionVisibility.ts`, `src/lib/scriptAccent.ts`, `src/lib/slugify.ts`, `src/lib/subscribe.ts`, `src/lib/phone.ts`, `src/lib/reading-time.ts`, `src/lib/portable-text-headings.ts`, `src/lib/utils.ts`.
- `src/layouts/BaseLayout.astro`: anti-FOUC theme bootstrap, skip link, ClientRouter, Lenis init, scroll-reveal observer, sticky-header listener, analytics, OG meta, JSON-LD.
- React islands: `MobileNav.tsx`, `ThemeToggle.tsx`, `BackToTop.tsx`, `CourseFilters.tsx`, `FacultyFilter.tsx`, `FaqAccordion.tsx`, `FormRenderer.tsx`, `NewsletterSignup.tsx`, `CopyEmailButton.tsx`, `PortableText.tsx`, `Embed.tsx`.
- Astro components: `Header.astro`, `Footer.astro`, `Hero.astro`, `HeroBackground.astro`, `HeroSlideshow.astro`, `Sections.astro` (the block renderer), `SectionShell.astro`, `SectionHeading.astro`, `SanityImage.astro`, `PortableTextStatic.astro`, `CourseCard.astro`, `FacultyCard.astro`, `PricingTierCards.astro`, `FinalCta.astro`, `CtaLink.astro`, `ShowcaseMedia.astro`, `EmbedBlock.astro`, `FormBlock.astro`, `SingletonPage.astro` (the one renderer all 13 singletons run through), `PageHeader.astro`, `home/HomeHero.astro`, the pinned code regions in `src/components/pinned/`, plus the block components in `src/components/blocks/` (the 19 tone-adaptive ones and the 15 ported Rule & Ledger ones).
- `src/components/ui/` shadcn primitives (see gotcha #12 for `accordion.tsx`).
- `scripts/generate-*.mjs`, `scripts/optimize-logo-files.mjs`, `scripts/lib/`.
- `astro.config.mjs`, `wrangler.jsonc`, `package.json`, `tsconfig.json`, `components.json`, `public/_headers` (see gotcha #10), `public/llms.txt`.

If a change requires editing the foundation set, do it deliberately and update this doc when the architecture shifts.
