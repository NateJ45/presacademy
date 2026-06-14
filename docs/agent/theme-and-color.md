# Theme and color

> Default palette tokens, shadcn token mapping, the three-state light/dark theme system, and the re-skin design seam.

## Default palette

The starter ships a green-anchored, near-white palette (Geneva Green / soft near-black ink / near-white warm paper), the result of the **Direction A** brand evolution (2026-06-14). It originally shipped as "Oxblood & Stone"; a stakeholder read that as too old, and a structured debate concluded to evolve rather than pivot — swap the anchor to deep Reformed green, keep the serif-over-sans bones and the warmth, retire the arch and the paper grain. Background on the decision: `docs/research/2026-06-14-brand-direction-debate.md`. The CSS token NAMES (`chapel`, `chapel-ink`) were kept for reversibility and now carry GREEN, not oxblood. These are the defaults to build on and test against; a consuming project re-skins by editing the design seam described at the end of this document.

Declared in the `@theme` block inside `src/styles/globals.css`. Reference via utility classes (`bg-primary`, `text-foreground`, `border-border`) rather than hardcoded hex anywhere in component code.

| Role | Hex | Name | Notes |
|---|---|---|---|
| Primary (action) | `#33503F` | Geneva Green | Buttons, primary CTAs, links, nav underline, focus rings |
| Primary deep / link text | `#2A4233` | Green Deep | Deeper anchor, link text |
| Foreground / headings | `#1F1B18` | Soft near-black | Primary text and headings on light surfaces |
| Background | `#FAF8F4` | Near-white warm paper | Primary page surface |
| Raised surface | `#FFFFFF` | White | Cards, popovers |
| Quiet alt band | `#F1F0EB` | Warm grey | `bg-muted` bands |
| Structural band | `#2A4233` / `#1F3227` | Forest Green | `chapel` band token (footer, closing CTA) |
| Secondary accent | `#7A2A2C` | Oxblood | Demoted from the lead color to a sparing accent (`--color-oxblood`) |
| Hairline accent | `#A87C3E` | Aged Brass | Hairline rules, small accents, the inverse rubric |
| Tint (light mode) | `168, 124, 62` | -- | `--tint-rgb` for polish overlays — the brass hue (see below) |
| Tint (dark mode) | `198, 160, 106` | -- | `--tint-rgb` lifted for dark surfaces |

Every token must clear WCAG AA against every surface it appears on. Body text needs 4.5:1, large text and UI components need 3:1. Run the math in both light and dark before introducing a new token. In dark mode the primary lifts to green `#74A98A` and link/keyword green to `#9CC6AC`; the warm near-black surfaces are unchanged.

### `--tint-rgb` token

The `--tint-rgb` CSS custom property holds the brand tint color as a bare RGB triplet (no `rgb()` wrapper). This lets the polish layer compose tinted overlays at arbitrary opacity using `rgba(var(--tint-rgb), 0.07)` without duplicating the hex. The value flips between light and dark modes via the `:root` / `.dark` cascade:

```css
:root {
  --tint-rgb: 168, 124, 62;   /* Aged Brass */
}
.dark {
  --tint-rgb: 198, 160, 106;  /* lifted brass for dark surfaces */
}
```

In Direction A the tint is the warm brass accent, not the green primary, so the polish overlays read as a faint warm wash over the near-white paper rather than tinting everything green. When you re-skin the project, set `--tint-rgb` to whichever warm accent should carry these overlays (`surface-warm`, `img-tint`; the paper-grain overlay itself is retired at `opacity: 0`).

### shadcn token mapping (foundation, do not change casually)

shadcn's CLI defines its own `@theme inline` block that points `--color-primary`, `--color-secondary`, `--color-accent`, `--color-background`, `--color-foreground` at semantic tokens (`--primary`, `--secondary`, etc.) declared further down in `:root`. Without intervention, `bg-primary` would produce shadcn's default grayscale.

The `:root` block in `globals.css` overrides shadcn's defaults so `--primary` is Geneva Green, `--foreground` is the soft near-black ink, and so on. This means:

- `bg-primary` on a marketing surface and shadcn's Button default variant both produce Geneva Green.
- `text-foreground` produces the soft near-black ink everywhere, including shadcn primitives.
- `--ring` points at Geneva Green so focus rings stay on-brand.

If a new shadcn primitive ever looks off-brand, the fix is almost always in that `:root` block, not in the primitive's source.

---

## Theme system

Three-state toggle (light / dark / system), persisted to `localStorage["theme"]`. **Light is the default for first-time visitors** (no saved choice) — the site does NOT follow the OS by default. "System" is opt-in: only a visitor who explicitly picks System from the toggle gets OS-following behavior, and while set to System the page listens to `matchMedia('(prefers-color-scheme: dark)')` and flips live when the OS changes. The choice persists in `localStorage` either way. (Changed 2026-06-14 — the bootstrap and `ThemeToggle` both default to `'light'`, previously `'system'`.)

The wiring, in order of execution:

1. **Anti-FOUC script in `BaseLayout.astro`** runs inline in `<head>` before first paint. The script does these things every time it fires (initial load, `astro:after-swap` on View Transitions, and `DOMContentLoaded` after body parses):
   - Reads the localStorage key, defaulting to `'light'` when nothing is stored (`localStorage.getItem(key) ?? 'light'`); only resolves `prefers-color-scheme` when the stored value is the literal `'system'`
   - Applies the `.dark` class on `<html>` plus an inline `color-scheme` style so native widgets (scrollbars, form controls) follow
   - Updates the single `<meta name="theme-color" id="theme-color-meta">` to the dark value (`#1C1813`) when dark is active, else the light value (`#ECE4DA`), so the mobile browser chrome follows the APP theme (see the theme-color note below)
   - Walks every `<img data-theme-logo>` and assigns the matching variant's `src` + `srcset` (theme-aware logo, see below)
2. **`ThemeToggle.tsx`** (React island, single instance in the Header) cycles light -> dark -> system on click, writes to the same localStorage key, and re-binds the matchMedia listener whenever the chosen theme changes. Its `applyTheme()` function also walks the `[data-theme-logo]` images and swaps their srcs, so toggling the theme doesn't leave a dark-ink logo on a dark background.
3. **`globals.css`** defines color tokens for both modes. `:root` carries light; `.dark` carries the overrides. The static `bg-primary` green holds in both modes; the shadcn `--primary` lifts to a brighter green in dark for rings / underlines / decoration, and only surface and muted-text tokens flip.

### View Transitions persistence (the gotcha)

Astro's View Transitions runtime swaps the document `<head>` and `<body>` between navigations but **resets `<html>`'s className** to whatever the new page's source HTML had (empty -- `.dark` is applied at runtime). Without intervention, a user who set dark mode would see the next page render in light despite `localStorage` still holding `"dark"`. This was an actual bug that was fixed.

The fix lives in the anti-FOUC script and has three triggers:
- **Initial inline call** -- runs in `<head>` before body parses. Catches the first paint.
- **`DOMContentLoaded` listener** -- re-runs after the body is in the DOM. Required so theme-aware imgs that appear below the first parsed scripts (notably the footer logo) get their `src` set. Bound with `{ once: true }`.
- **`astro:after-swap` listener** -- re-runs after every View Transitions navigation. Re-applies the `.dark` class and re-sets the logo `src` because both get reset by the swap.

A `__themeBootstrapBound` flag on `window` guards against double-binding if the script ever runs twice. If you touch this script, preserve all three triggers.

### theme-color meta follows the app theme

The mobile browser chrome color tracks the chosen APP theme, not the OS. There is a single `<meta name="theme-color" id="theme-color-meta">` in `<head>`, authored with the light value (`#ECE4DA`); the anti-FOUC bootstrap rewrites its `content` to the dark value (`#1C1813`) whenever dark is active. This replaced the older two-`<meta>` `prefers-color-scheme` media-query approach, which keyed off the OS and so disagreed with the app theme once Light became the default. Because only the bootstrap updates the meta (and it re-fires on `astro:after-swap`), a `ThemeToggle` click updates the chrome color on the next navigation rather than instantly — acceptable, and not worth a second code path.

### Theme-aware single-img logo pattern

Header and Footer each render ONE `<img>` for the logo, with no `src` attribute in the HTML. Four data attributes carry the URLs:

```html
<img
  alt="[Your Brand]"
  width="100" height="106"
  class="h-[6.25rem] w-auto"
  loading="eager"
  data-theme-logo
  data-logo-light-src="/_astro/logo-light.{hash}.webp"
  data-logo-light-srcset="/_astro/logo-light.{1xhash}.webp 1x, /_astro/logo-light.{2xhash}.webp 2x"
  data-logo-dark-src="/_astro/logo-dark.{hash}.webp"
  data-logo-dark-srcset="/_astro/logo-dark.{1xhash}.webp 1x, /_astro/logo-dark.{2xhash}.webp 2x"
>
```

The URLs come from `getImage()` calls at build time (Astro's image pipeline pre-renders the four variants). The src is set by:
- An inline `<script is:inline>` immediately after the header img (runs synchronously, before browser begins fetching).
- BaseLayout's anti-FOUC script for the footer img (runs on `DOMContentLoaded` since the footer doesn't exist when the head script first fires).

Net effect: **only one logo file is ever fetched per page load**, regardless of theme. Lighthouse's "Properly size images" and "Improve image delivery" audits no longer see an inactive variant in the DOM. Toggling the theme via `ThemeToggle` swaps the src in place; navigating via View Transitions re-applies via `astro:after-swap`.

**Don't revert to two img tags with CSS hide/show.** Modern browsers usually skip `display:none + loading="lazy"` fetches, but Lighthouse still analyses the DOM and counts the inactive variant against the score.

The site is designed and tested first in light mode. Don't optimize dark mode at the expense of light.

### Light/dark discipline (build with both in mind)

Every new component renders correctly in BOTH modes. This is a foundation rule, not a "we'll get to it." The bug it prevents is real: using a static color (e.g. the soft near-black ink `#1F1B18`) for body copy without a dark-mode override produces ink-on-near-black at low contrast ratios. Lighthouse catches it; the rule below prevents it from recurring.

**Dynamic tokens (flip with theme -- use these for text and surfaces):**
- `bg-background`, `text-foreground` -- body text + page background
- `bg-card`, `text-card-foreground` -- card surfaces
- `bg-popover`, `text-popover-foreground` -- popovers and tooltips
- `bg-muted`, `text-muted-foreground` -- quiet surfaces and secondary text
- `bg-accent`, `text-accent-foreground` -- hover backgrounds on interactive elements
- `border-border`, `border-input` -- borders that need to read in both modes
- `ring-ring` -- focus rings
- `text-link` -- primary-tinted link/anchor color. Dark enough for light mode, lifted for dark mode. Use this anywhere a tinted link or link-style button needs to read in both themes.

These are shadcn's semantic tokens, defined in `:root` for light and overridden in `.dark` for dark. Always use these for anything that should adapt to mode.

**Static brand tokens (do NOT flip -- use only where the brand color must hold in both modes):**
- `bg-primary`, `text-primary-foreground` -- CTA buttons (Geneva Green stays Geneva Green)
- `bg-primary/90` (or a dedicated darker variant) -- CTA hover state
- `bg-chapel`, `bg-chapel-deep`, `text-chapel-foreground` -- the forest-green structural bands (footer, closing CTA), static cream-on-green in both modes

**`text-accent` and `bg-accent` are theme-aware via shadcn's `--accent` token.** The `@theme inline` block remaps `--color-accent -> var(--accent)` so `bg-accent` works as a hover surface that flips with theme. **Don't use `text-accent` for body text** -- its color mirrors `--accent` which is meant for hover surfaces, not text. Always use `text-foreground` for headings and body copy.

**Quick checklist before adding a color class:**
1. Does this text or surface need to be readable in BOTH modes? -> semantic token (`text-foreground`, `bg-background`, `bg-muted`, etc.)
2. Is this a brand-color CTA or surface that should hold its hue in both modes? -> brand token (`bg-primary`, etc.)
3. Adding opacity? -> `text-foreground/80`, not `text-accent/80`
4. Not sure? -> render it in both modes before merging.

### Eyebrow contrast lesson (post-audit)

Muted colors at small sizes fail WCAG AA easily. The pattern for eyebrow labels that passes AA on both light and dark surfaces:

```html
<p class="text-xs uppercase tracking-eyebrow text-foreground/80">Eyebrow text</p>
```

`text-foreground/80` reaches ~5.4:1+ on the near-white background, passing AA. Do not use `text-muted-foreground` or a raw brand color for small uppercase labels -- verify the contrast ratio first.

If you spot any `text-foreground/65` or `/70` on `bg-muted`/`bg-background` surfaces, bump them to `/80` or `/85`.

### Tailwind v4 cascade gotcha: className overrides usually lose

Tailwind v4 generates utilities **alphabetically** in the stylesheet. Two utilities affecting the same property fight at the CSS layer, not at the order they appear in your `class:list`. So:

- `text-link` (variant) + `text-bg` (override) -> `text-link` wins (later in alphabetical sort).
- `text-sm` (base) + `text-h3` (override) -> `text-sm` wins.

Solutions:
1. **Add a variant prop instead of overriding via className.** This is why some components accept an `onDark` prop and shadcn's `accordion.tsx` had its base font-size removed (so consumer `text-h3` actually wins).
2. **Drop the conflicting base class.** If you control the base component, remove the class that's interfering.
3. **Use `!important`** as last resort (`!text-bg`). Rare in this codebase.

If a class isn't taking effect, inspect the computed CSS -- usually the issue is another utility further down the alphabet beating it.

### Server-only console warnings

`src/lib/sanity.ts` warns about missing env vars (project ID, read token). These warnings are wrapped in `if (import.meta.env.SSR)` so they only fire during the build / SSR pass, not in the browser. Why: the Sanity client module gets imported by React components for the `urlFor` image helper. Without the SSR guard, every browser session would see the "SANITY_API_READ_TOKEN is not set" warning, even though the token is irrelevant in the browser.

Use this pattern for any future `console.*` call in code that gets imported by client components:

```ts
if (import.meta.env.SSR) {
  console.warn('[some-module] build-only warning...');
}
```

---

## Design seam: how to re-skin this starter

Changing the visual identity of a project built on this starter requires touching exactly four areas. Everything else (components, layout, spacing, animation) inherits from these.

1. **`src/styles/globals.css` -- `@theme` block and `:root` / `.dark`**
   Replace the Geneva Green / soft near-black / near-white paper hex values and `--tint-rgb` triplets with your palette. Update the shadcn semantic overrides in `:root` and `.dark` so `bg-primary`, `text-foreground`, `bg-background`, etc. resolve to your colors. Keep the token structure; only change the values. Note the `chapel` band tokens and `--color-oxblood` carry the green-anchored Direction A values — re-skin those too if your structural bands or secondary accent differ.

2. **Font imports and `--font-*` tokens**
   Replace the `@fontsource-variable/fraunces` and `@fontsource-variable/source-sans-3` imports at the top of `globals.css` with your chosen typefaces. Update `--font-display` (the serif display face) and `--font-body` (the humanist sans body face) in the `@theme` block to match. To enable the optional script accent, add a `@fontsource` import for a script font and point `--font-script` at it (see `animation.md`).

3. **`src/data/site.ts`**
   Update the brand name, domain, tagline, social URLs, and any other hardcoded identity strings the build needs at compile time.

4. **Logo, favicon, and OG inputs**
   Drop your `logo-light.*` and `logo-dark.*` files into `src/assets/` (or wherever `BaseLayout.astro` imports them from). Replace the favicon in `public/`. Re-run `npm run og` if you want updated default OG images.

No other files need to change for a basic re-skin. The `--tint-rgb` token propagates your hue through all the polish-layer overlays automatically.
