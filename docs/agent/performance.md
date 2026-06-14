# Performance budgets

> Core Web Vitals targets, bundle and image budgets, font loading, hydration strategy, and the current Lighthouse scorecard.

## Performance budgets

Performance is a UX feature, not a vanity score. Lighthouse 100 on Performance is the ceiling target; the more honest measures are the field metrics below.

### Core Web Vitals targets

- **LCP (Largest Contentful Paint)** < 1.0s on the home hero, < 1.5s site-wide. The hero image is usually LCP -- size it for mobile (750px wide, quality ~65) and let it grow on larger viewports.
- **CLS (Cumulative Layout Shift)** < 0.05. Reserve space for images with explicit width/height (or aspect-ratio CSS). Don't lazy-load above-the-fold images. Web fonts use `font-display: swap` to avoid invisible-text shifts.
- **INP (Interaction to Next Paint)** < 200ms. Keep React island hydration light. Favor `client:visible` and `client:idle` over `client:load` for anything below the fold.

### Bundle budgets

| Slot | Target |
|---|---|
| Total JS on home page (compressed) | < 100KB |
| Largest single React island bundle (compressed) | < 50KB |
| Total CSS (compressed) | < 30KB |
| Hero image (any viewport) | < 200KB |

If a new dependency pushes a budget, that's a discussion before merging. Some are worth it (Lenis adds smooth scroll, motion is the interaction language); some aren't (a 60KB icon library when three lucide-react icons would cover it).

### Image weight by slot

| Slot | Display max | SanityImage props | Notes |
|---|---|---|---|
| Home hero (full-bleed) | viewport | `width={2400} sizes="100vw" loading="eager" fetchpriority="high" quality={70}` | LCP element |
| Portfolio/Journal cover | ~896px | `width={1800} sizes="(min-width: 920px) 896px, 100vw" loading="eager"` | Capped at `max-w-4xl` |
| Project gallery thumbnail | viewport-dependent | `width={900} quality={75}` (via `urlFor`) | Lightbox loads larger on tap |
| Project gallery fullscreen | viewport | passed to `yet-another-react-lightbox` directly | |
| Testimonial avatar | 120x120 | `urlFor(...).width(120).height(120).fit('crop')` | Static thumbnail |
| OG image (committed) | 1200x630 | n/a, generated once via `npm run og` | Per-page via `scripts/generate-og-pages.mjs` |

Use `<SanityImage />`'s `width` prop to drive these. **Never request larger than the slot renders at.** Format defaults to `auto` (AVIF / WebP / JPEG fallback), quality to 75 -- drop to 65 for big hero photos.

### Font loading

- **Fraunces** (display serif): self-hosted via `@fontsource-variable/fraunces`. The variable file covers all weights in a single request.
- **Source Sans 3** (humanist sans body): self-hosted via `@fontsource-variable/source-sans-3`. The variable file covers all weights in a single request.
- **Script accent font** (opt-in): no script font is loaded by default. To enable the `font-script` utility, add a `@fontsource` import in `globals.css` and point `--font-script` at the family. See `animation.md` for the full opt-in steps.
- No `<link rel="preload">` on font URLs. Vite hashes the filenames at build time, so a static preload tag would 404. The cost is one extra paint; the benefit is no broken preload (and Lighthouse stays at 100 Best Practices).

### Lighthouse scorecard

Target: 100 on all four categories (Performance, Accessibility, Best Practices, SEO) for all core routes on both mobile and desktop. Measure on the deployed Cloudflare URL via Chrome DevTools' bundled Lighthouse, not the dev server.

**Latest run — 2026-06-14 (home page, on the `workers.dev` preview), after the refined-kinetic-editorial motion pass (PR #9):**

| Category | Score | Notes |
|---|---|---|
| Performance | ~100 | LCP 205ms, CLS 0.01 — the animation pass did NOT regress performance. |
| Accessibility | 100 | |
| Best Practices | 100 | |
| SEO | 66 **on the preview only** | See the workers.dev caveat below — this is a preview-host artifact, not a regression. Production custom domain is 100. |

The kinetic motion system holds the CLS budget because every piece animates transform / opacity / clip-path only (the stat count-up and the topics marquee included — the count-up mutates `textContent` over an already-laid-out element and the marquee is a `translateX` loop, so neither reflows). Confirm a low CLS after any change that adds motion.

#### The `workers.dev` preview shows SEO 66 — that is expected, not a regression

Cloudflare auto-injects an `X-Robots-Tag: noindex` response header on every `*.workers.dev` URL (it does not want preview subdomains indexed). Lighthouse's "Page is not blocked from indexing" / `is-crawlable` SEO audit reads that header and fails, which drags the whole SEO category down to ~66 on the preview. The **page itself is clean**: no `noindex` meta tag, a valid meta description, and a valid canonical. On the production custom domain (where Cloudflare does not inject the header) the same page scores SEO 100. So if a future preview run shows SEO 66 with that single failing audit, do NOT treat it as a regression — re-check on the real domain before investigating.

**Levers that achieve this -- preserve unless you have a stronger reason than "I want to simplify":**
- All islands hydrate at `client:idle` or `client:visible` except `MobileNav` (Radix Sheet portal requires `client:only="react"`)
- Lenis init wrapped in `requestIdleCallback`
- Logo PNGs moved from `public/` to `src/assets/` so Astro emits WebPs
- Single-img theme-aware logo (one fetch per page load instead of two)
- SanityImage emits real width-descriptor srcset with 8 breakpoints (400-2400)
- AVIF as default format (`'auto'`) -- Sanity picks AVIF on supporting browsers
- `fetchpriority="high"` on hero LCP image
- Portrait inline images capped to `max-w-[600px]` (smaller files at the smaller cap)
- Cloudflare adapter `imageService: 'compile'` (build-time Sharp, no runtime image binding)

### Hydration strategy

| Component | Directive | Why |
|---|---|---|
| `ThemeToggle` | `client:idle` | Anti-FOUC inline script in `BaseLayout` already applies the correct theme class before first paint, so the React island only needs to hydrate by the time the visitor moves to click it. Demoting from `client:load` shaves real TBT off mobile Lighthouse runs. |
| `MobileNav` | `client:only="react"` | Radix Sheet portal can't SSR |
| `ContactForm` | `client:visible` | Below the fold on most pages |
| `BackToTop` | `client:idle` | Doesn't appear until the visitor scrolls 600px, so the JS doesn't need to race first paint |
| `Toaster` (Sonner) | `client:idle` | Region only -- toast calls fire from elsewhere, plenty of time for the region to mount |
| `FaqAccordion` | `client:visible` | Interactive but not critical-path |

Default to `client:visible` or `client:idle` for anything not immediately above the fold. Astro ships less JS up front. `client:load` is reserved for islands that genuinely must be live before first interaction -- and even then, ask twice whether `client:idle` is acceptable.

### Verifying

- `npm run build` then check `dist/` size for sanity. Astro reports the largest bundles in the build log.
- Run Lighthouse on the deployed Cloudflare URL after every push that touches a page template or component.
- Cloudflare Web Analytics surfaces real-user LCP, INP, CLS once traffic exists. Watch weekly post-launch; investigate any page that drifts past the budgets above.
