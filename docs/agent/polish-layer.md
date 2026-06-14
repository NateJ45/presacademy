# Polish layer

> Custom CSS utilities and JS behaviors layered on Tailwind: the eyebrow rubric, brand stripe, card-lift, surface-warm / surface-chapel, reading-progress, sticky-header, nav-underline, and print stylesheet.

Animation behaviors (Lenis, scroll reveals, stagger grid, hero entry, view transitions, Ken Burns slideshow, script accent opt-in) are documented separately in `animation.md`.

> **Direction A note (2026-06-14).** The brand evolution changed parts of this layer: the structural bands now read forest green (not oxblood), keyword emphasis is green, the Romanesque arch is retired (`.arch-top` renders near-rectangular), and the paper grain is turned off (`body::before` at `opacity: 0`). The new unifying signature is the **eyebrow rubric** below. Background: `docs/research/2026-06-14-brand-direction-debate.md`.

## Polish layer

Custom CSS utilities and JS behaviors layered on top of Tailwind + shadcn. All declared in `src/styles/globals.css` and (where JS is needed) initialized in `BaseLayout.astro` with re-init on `astro:page-load` so they survive View Transitions.

### Eyebrow rubric (`.eyebrow` / `.eyebrow-inverse`) — the Direction A signature

The starter's unifying section mark, and the device that REPLACES the retired arch. A short brand-green leading rule is drawn (via `::before`) before any uppercase eyebrow label that introduces a headline, so every section / hero eyebrow reads as one system across the site — the manuscript "rubric." Usage: add the `eyebrow` class to an uppercase `tracking-eyebrow` label that sits above a headline.

```html
<p class="text-xs uppercase tracking-eyebrow text-foreground/80 eyebrow">Our courses</p>
```

On dark / green / photo-scrim surfaces, add `eyebrow-inverse` as well so the rule lifts to brass (`#C7A875`) and stays visible (the green rule would vanish on the green band):

```html
<p class="... eyebrow eyebrow-inverse text-chapel-foreground/80">This term</p>
```

Deliberately NOT applied to inline category tags, stat labels, footer/nav labels, or button text — those are a different element. `SectionHeading.astro` is the canonical place the rubric is wired.

### Brand-stripe rhythm (a repeating visual signature)

A 2px brand-color line -- `<div class="h-0.5 bg-primary" aria-hidden="true"></div>` (now green) -- is a repeating visual signature alongside the eyebrow rubric. It appears at the top of:

- The site header (above the eyebrow strip)
- The mobile menu drawer (`border-t-4 border-t-primary` on SheetContent)
- The footer (above the brand block)
- Every marketing card (ServiceCard, JournalCard, TestimonialCard)
- The FinalCta panel (now a green band)

If you add a new card-like component or section that should feel part of the brand, include this stripe at the top edge. The repetition is what makes the site read as one designed object.

### Card resting + hover shadow

All marketing cards share a soft resting shadow that deepens on hover via `.card-lift`:

```html
<article class="card-lift ... shadow-[0_4px_18px_-14px_rgba(42,45,49,0.18)]">
```

The `card-lift` utility class lives in `globals.css`. Defines `:hover { translateY(-2px); box-shadow: 0 16px 34px -18px ... }`. Always-on-card components opt in via the class.

### Tactile button press

`.press-tactile` adds a 1px depress on `:active` so CTAs feel physical:

```html
<a class="press-tactile bg-primary text-primary-foreground ...">Book a consultation</a>
```

Applied to CtaLink, header consultation pill, contact form submit, sticky CTA chip, filter chips. Honors reduced-motion via the global transition kill.

### Animated nav underline (`.nav-underline`)

Brand-primary underline that slides in from the center on hover and locks full-width on `[aria-current="page"]`. Applied to every link in the primary nav. Defined in `globals.css`.

### Sticky header behavior (`.site-header`)

The header has `position: sticky; top: 0`. A scroll listener in BaseLayout sets `data-state="hidden"` on it when the user scrolls down past 120px, which CSS translates to `translateY(-100%)`. Scroll up = the header reveals. Pinned permanently under reduced-motion.

### Reading progress (`.reading-progress`)

3px brand-color track at the top of journal posts. Inner div `scaleX`'s from 0 to 1 as the reader scrolls through `<article>`. GPU-only animation (transform), throttled via requestAnimationFrame. Reduced-motion users get a static full bar so the affordance remains.

Lives in `ReadingProgress.astro` (rendered inside `BaseLayout`'s slot on journal post pages).

### Surface-warm (`.surface-warm`)

A tinted radial gradient overlay for sections that want dimensional warmth. Uses the warm brass tint at `rgba(var(--tint-rgb), 0.07)` in light, `rgba(var(--tint-rgb), 0.10)` in dark. Apply alongside `bg-muted` or `bg-background`:

```html
<section class="surface-warm bg-muted">...</section>
```

Update `--tint-rgb` in `globals.css` when re-skinning so this overlay picks up the new accent hue. (In Direction A the tint is brass, not the green primary, so the wash stays a faint warm note over the near-white paper.)

### Surface-chapel (`.surface-chapel`)

The structural-green sibling of `.surface-warm`, for the forest-green bands. Adds a faint cream glow at the top plus a `chapel` -> `chapel-deep` vertical fade so the green bands read as lit surfaces instead of a flat single-hex slab. Apply ALONGSIDE `bg-chapel` (which stays the fallback fill). Static across themes, so one rule serves both.

### Graph-paper atmosphere (`.hero-atmos` / `.surface-grid` / `.surface-dots`)

The academic-notebook texture added in the 2026-06-14 kinetic pass. A faint graph-paper grid (and a dotted variant) painted on the element's own `background-image`, plus a soft green glow on the hero. `.surface-grid` is the bare 32px notebook grid; `.surface-dots` is a dotted variant; `.hero-atmos` adds a brand-green radial glow above the grid for the hero. All three are theme-aware via the new `--grid-rgb` token (ink lines on near-white, cream on dark) at very low alpha, so they read as atmosphere, not pattern. These are static textures, not motion; the full description is in `animation.md` under the refined-kinetic-editorial section.

### Paper grain (`body::before`) — RETIRED in Direction A

The 4% SVG-noise grain is turned off (`body::before` set to `opacity: 0` in both light and dark). The rule is left in `globals.css` for an easy restore, but Direction A intentionally reads as clean near-white paper with no texture; large flat fills are meant to look flat, not grainy. Don't reintroduce the grain without a deliberate brand decision.

### Image zoom + tint on hover (`.img-zoom` / `.img-tint` / `.img-tint-light` / `.img-tint-evergreen`)

Card hero images scale to 1.06 and gain a faint brand-color wash on hover. Add `.img-zoom` to the `overflow-hidden` image wrapper and drop an `.img-tint` (heavier, ~0.15 opacity) or `.img-tint.img-tint-light` (lighter, ~0.08 opacity) div inside it. The tint color is `rgba(var(--tint-rgb), <opacity>)` so it inherits the project palette. Transitions are gated behind `prefers-reduced-motion: no-preference`.

`.img-tint-evergreen` is a green-duotone variant added in the 2026-06-14 kinetic pass: drop `.img-tint.img-tint-evergreen` inside an `.img-zoom` well and the wash becomes a deeper Geneva-green (`rgba(51, 80, 63, 0.22)`) on hover, reading as a green duotone over the photo. The `Course` and `Faculty` cards use it. It fires on `.img-zoom:hover` and on `.group:hover` so it can ride a parent card's hover state.

### Micro-interaction hovers (`.link-arrow` / `.card-link`)

Two small hover affordances added in the 2026-06-14 kinetic pass:

- **`.link-arrow`** — an inline "read more" arrow that nudges forward. Put `.link-arrow` on the link and wrap the arrow glyph in `.link-arrow__icon`; on `:hover` / `:focus-visible` the icon slides `translateX(0.28rem)` over 320ms. Transform-only.
- **`.card-link`** — a linked card whose border breathes green on hover. `.card-link:hover` transitions `border-color` to a translucent Geneva-green (`0.45` alpha; the dark-mode lift `116, 169, 138`) over 440ms, pairing with the `.card-lift` shadow.

### Process connector lines (`.step-connector`)

A 2px thread draws downward from each step number badge toward the next step. `ProcessStep.astro` renders `<div class="step-connector">` in its left flex column when `!isLast`; the article grid is `items-stretch` so the connector's `flex: 1` fills the step height. The track rests at a muted color and a `::after` fill animates to the brand primary color (`scaleY` 0 to 1) when the BaseLayout observer adds `.is-visible`. Pass `isLast` on the final step in any sequence. Reduced-motion users get the filled track instantly, no draw.

### Editorial typography -- drop cap + blockquote (`.prose-drop-cap` / `.prose-blockquote`)

Journal posts open with a floated display-font drop cap on the first paragraph and render blockquotes with a 3px brand-primary left border in italic. `JournalPortableText.tsx` adds `.prose-drop-cap` to the first `normal` block only (a `firstNormalRendered` flag in the `makeComponents()` closure, rebuilt per render) and sets `className="prose-blockquote"` on blockquotes. The drop cap is pure CSS (`::first-letter`) -- nothing to gate for reduced motion. Don't apply `.prose-drop-cap` to short paragraphs; the floated cap needs a substantial opening paragraph to wrap against.

### Section dividers (when to use)

`SectionDivider.astro` renders a brand ornament for the specific case where two adjacent sections share a background color and need a visual break. **Don't sprinkle between every section** -- the alternating `bg-background` / `bg-muted` cadence already does that work. Reserve dividers for the edge case where two same-background sections would blur together.

### Print stylesheet

A `@media print` block in `globals.css` suppresses nav, footer, CTAs, and decorative elements, and sets `color: black; background: white` on the body so journal post content prints cleanly. This is intentionally minimal -- the goal is a legible print, not a designed one.

### Refined kinetic editorial idioms (cross-reference)

The 2026-06-14 motion pass added several more utilities that are CSS-first animation rather than static polish, so their full writeups live in `animation.md`. Listed here so the catalog is complete:

- **`.kinetic-words`** — the per-word hero-headline rise on load (transform-only, LCP-safe).
- **Choreographed reveals** — `[data-reveal]` directional variants (`.reveal-l` / `.reveal-r`), the headline clip-wipe (`.reveal-rise`), and the self-drawing eyebrow rubric (`.eyebrow::before` scaleX keyed to `[data-reveal].is-visible`).
- **`.marquee` / `.marquee__track` / `.marquee__group`** — the seamless, edge-faded, hover-pausing topics ticker (two groups, `-50%` loop).
- **`[data-countup-grid]` / `[data-countup]`** — the `BaseLayout`-driven stat count-up (easeOutCubic, snaps to the exact final text; opt out by omitting `data-countup`).
- **`.parallax-slow`** — the `@supports`-guarded CSS scroll-driven parallax (`animation-timeline: view()`) on hero media.

All honor `prefers-reduced-motion` via a dedicated reset block in `globals.css`.

### View Transitions discipline

Astro View Transitions are wired via `<ClientRouter />` in BaseLayout. Any client-side script that needs to re-run on every navigation must listen to `astro:page-load`:

```js
function initThing() { /* ... */ }
initThing();
document.addEventListener('astro:page-load', initThing);
```

Pattern used by: scroll-reveal observer, sticky-header listener, reading-progress, sticky CTA chip. See `animation.md` for details on the Lenis + view-transitions interaction, which is a special case.

---

Cross-reference: `animation.md` covers Lenis smooth scroll, scroll reveals, stagger reveals, hero entry stagger, Ken Burns slideshow, view-transition cross-fade, and the opt-in script accent. (The paper grain that used to be listed here is retired in Direction A — see Paper grain above.)
