# Animation layer

> Lenis smooth scroll, scroll reset on navigation, Motion integration, scroll-triggered reveals, hero entry stagger, Ken Burns slideshow, view-transition cross-fade, the refined-kinetic-editorial motion system, and the opt-in script accent.

Non-animation polish (brand stripe, card-lift, surface-warm, reading-progress, sticky-header, paper-grain, print stylesheet) is covered in `polish-layer.md`.

> **Refined kinetic editorial (2026-06-14, PR #9, commit 864d173).** A CSS-first motion pass layered the "academic notebook" idioms below onto the existing reveal system: the graph-paper hero atmosphere, the kinetic hero headline, choreographed directional reveals + a self-drawing eyebrow rubric, the topics ticker, the stat count-up, and a scroll-driven image parallax. Everything is transform / opacity / clip-path only (zero CLS) and is neutralized by a dedicated `prefers-reduced-motion` reset block at the end of the motion section in `globals.css`. The full writeup is the [Refined kinetic editorial motion system](#refined-kinetic-editorial-motion-system) section below; `src/styles/globals.css` and `BaseLayout.astro` are the source of truth.

## Lenis smooth scroll

Lenis is initialized once in `BaseLayout.astro` and exposed as `window.lenis`. The instance persists across View Transitions navigations -- it is NOT re-created on `astro:page-load`. This is intentional: re-creating Lenis on every navigation causes a flash of native scroll before the new instance takes over.

Lenis init is wrapped in `requestIdleCallback` so it doesn't compete with first-paint work.

In-page anchor navigation routes through the persistent `window.lenis` instance so it glides instead of snapping. Controls that need programmatic scroll (home hero scroll cue, case-study TOC) call `window.lenis.scrollTo(target)` and fall back to native `scrollTo` when Lenis hasn't loaded or the user prefers reduced motion. Lenis honors `scroll-mt-*` values on heading targets, so TOC targets clear the sticky header without a manual offset -- don't add one (it double-applies).

`prefers-reduced-motion` is respected: when the OS prefers reduced motion, Lenis is initialized with its `lerp: 1` (instant) or not initialized at all, depending on implementation. Verify the current behavior in `BaseLayout.astro` before changing.

### Scroll reset on navigation (do not remove)

Because the single Lenis instance persists, any in-flight scroll momentum carries across a View Transitions swap. While Lenis is actively smoothing it ignores the router's scroll-to-top reset, so a link clicked mid-scroll would open the next page partway down (the stale scroll target clamps to the new, often shorter, page's maximum).

The fix lives in the Lenis init block:
- An `astro:after-swap` listener calls `lenis.scrollTo(0, { immediate: true, force: true })` (cancels momentum and resets to top) plus `lenis.resize()`.
- It runs on **forward navigations only**: the listener reads `navigationType` off the `astro:before-swap` event and skips the reset when that is `traverse`, so browser back/forward keeps Astro's built-in scroll restoration.

**Caveat for testing:** Astro dev full-reloads on back/forward, so the traverse (restore-position) behavior can only be verified against the production build via `npm run preview`, not `npm run dev`.

---

## Motion integration

[Motion](https://motion.dev) (formerly Framer Motion) provides the animation primitives for React islands. Use `motion` components for enter/exit transitions on interactive UI (drawers, modals, toast regions). For scroll-triggered reveals on static content, prefer the lightweight `[data-reveal]` IntersectionObserver approach below -- it doesn't require hydrating a React island just to fade in a static section.

---

## Scroll-triggered reveals

### `[data-reveal]`

Any element marked `data-reveal` starts at `opacity: 0; transform: translateY(0.75rem)`. An IntersectionObserver in BaseLayout adds `.is-visible` when the element crosses the viewport edge, transitioning to opacity 1 + no translate. Reduced-motion users get content immediately (the global reset short-circuits the start-hidden state).

Apply selectively to section blocks. Don't add `data-reveal` to above-the-fold content -- it defeats the purpose and hides content from users with slow connections before the observer fires.

### Grid stagger entrance (`[data-stagger-grid]` / `.is-staggered`)

Card grids fade their children up in sequence as the grid crosses the viewport. Add `data-stagger-grid` to a grid container; the BaseLayout observer adds `.is-staggered` on intersection, and per-`nth-child` `transition-delay`s (0 / 100 / 200 / 300ms, capped at 400ms for item 5+) sequence the reveal.

Reduced-motion users get every child visible instantly.

**Filter caveat:** if a `[data-stagger-grid]` container also has filtered children (`.is-filtered-out`), the filter's hide state must be re-asserted at matching specificity (`[data-stagger-grid] > .is-filtered-out`, with `!important`) so the stagger rules don't override the filter's hide state.

### Choreographed reveals (extend `[data-reveal]`)

The base `[data-reveal]` rise-and-fade gained variants that ride the same BaseLayout IntersectionObserver (`.is-visible` toggle), so no new JS is needed:

- **Directional reveals** (`.reveal-l` / `.reveal-r`) — pair the class with `data-reveal` on any element to slide it in from the left (`translate: -1.5rem 0`) or right (`1.5rem 0`); `.is-visible` settles it to `translate: 0 0`. Transform-only.

  **Horizontal-overflow guard (do not remove).** That `translate: +/-1.5rem` shifts a not-yet-revealed element 1.5rem past the viewport edge, so on mobile every page would gain an ~8-24px sideways scroll until each element reveals. `globals.css` clips it by setting `overflow-x: clip` on **both** `html` and `body` (in the `@layer base` block). It must be `clip`, NOT `hidden`: `clip` still allows `position: sticky` to work (the course-detail aside is `lg:sticky`) and does not interfere with Lenis's vertical smooth scroll, whereas `overflow: hidden` would break both. Keep this guard whenever the directional reveals (or anything else that translates content off-screen) are in play.
- **Headline mask-rise** (`.reveal-rise`) — put it on an `inline-block` display line *inside* a `[data-reveal]` wrapper. The line starts clipped (`clip-path: inset(-0.12em 0 105% 0)`) and nudged down (`translateY(0.32em)`), then wipes up from behind its own baseline over 820ms when the wrapper reveals. clip-path + transform only, no reflow.
- **Self-drawing eyebrow rubric** — the eyebrow rubric's leading rule (`.eyebrow::before`, see `polish-layer.md`) now DRAWS ITSELF IN. While the section is hidden the rule is `transform: scaleX(0)`; when the enclosing `[data-reveal]` gains `.is-visible` it scales to `scaleX(1)` over 560ms with a 120ms lead-in. Because `SectionHeading.astro`'s wrapper is itself `[data-reveal]`, the reveal + eyebrow-draw cascade to nearly every section on the site as one system.

Reduced-motion users get all of these in their settled state instantly: the dedicated reset block forces the directional translate to 0, drops the `.reveal-rise` clip/transform, and pins the eyebrow rule at `scaleX(1)`.

### Image curtain reveal (`.img-curtain` / `.is-revealed`)

A surface-colored panel (`color: var(--background)`) scales away from the top edge to reveal an image, reading as materialization rather than a sliding panel. Wrap the image in a `relative overflow-hidden` div and drop `<div class="img-curtain" aria-hidden="true">` in as the last child; the BaseLayout observer adds `.is-revealed` on intersection (`scaleY` 1 to 0, 900ms). The curtain sits at `z-index: 10` so it covers any in-wrapper overlays during the reveal. Reduced-motion users never see the curtain (`display: none`).

---

## Refined kinetic editorial motion system

Added 2026-06-14 (PR #9, commit 864d173). A CSS-first pass that gives the site its distinctive "academic notebook" motion character without adding a single JS-driven decorative animation. Every piece animates transform / opacity / clip-path only, so it contributes zero CLS, and the whole system is switched off by a dedicated `@media (prefers-reduced-motion: reduce)` reset block at the end of the motion section in `globals.css`. The home page is the showcase: a kinetic hero, the graph-paper atmosphere with image parallax, a topics ticker, and the stat count-up.

The directional reveals, headline mask-rise, and self-drawing eyebrow rubric that this pass also added are documented above under [Choreographed reveals](#choreographed-reveals-extend-data-reveal) because they extend the `[data-reveal]` observer. The rest of the pass:

### Graph-paper atmosphere (`.hero-atmos` / `.surface-grid` / `.surface-dots`)

The academic-notebook texture. A faint graph-paper grid painted directly on the element's `background-image` (two 1px linear-gradients at 32px spacing), so it always sits behind content with no extra DOM and no stacking surprises. Variants:

- `.surface-grid` — the bare 32px notebook grid for band backgrounds.
- `.surface-dots` — a dotted-grid variant (a radial-gradient dot at 22px spacing).
- `.hero-atmos` — the grid plus a soft brand-green glow up top (a radial-gradient stacked above the grid lines), the hero treatment.

All three are theme-aware via the new `--grid-rgb` token: soft near-black ink lines on the near-white page (`31, 27, 24`), warm cream on the dark page (`241, 234, 217`). Alpha is intentionally very low (~0.05 for the grid, ~0.10 for the dots) so it reads as atmosphere, not pattern. The hero glow lifts its own green for dark mode (`116, 169, 138`).

### Kinetic hero headline (`.kinetic-words`)

The hero signature. Each word of the headline is wrapped in a `.kinetic-words .w` box (`inline-block`, `overflow: hidden`) holding a `<span>`; on load each span lifts from `translateY(1em)` to `0` over 760ms, lightly staggered by a per-word `--i` index (`calc(var(--i) * 65ms + 120ms)`). It is **transform-only and fires once** (`forwards`), so it never moves layout and stays LCP-safe even though it animates the largest text on the page. The `.w` box carries a small `padding-bottom` / negative `margin-bottom` pair so descenders are not clipped by the `overflow: hidden`.

### Topics ticker (`.marquee` / `.marquee__track` / `.marquee__group`)

A slow, edge-faded, hover-pausing ticker for the home page's topics row. Structure: a `.marquee` clip with a left/right `mask-image` fade (transparent to opaque at 7% / 93%), containing a `.marquee__track` flex row that holds **two identical `.marquee__group` groups** flush against each other. The track animates `translateX(0)` to `-50%` (`marquee-loop`, 46s linear infinite), so the second group slides exactly into the first group's starting position for a seamless loop. Trailing padding on each group (`padding-right: var(--gap)`) gives the seam the same rhythm as the internal gaps. `:hover` sets `animation-play-state: paused`.

### Stat count-up (`[data-countup-grid]` / `[data-countup]`)

Driven by `initPolish` in `BaseLayout.astro` (not pure CSS). Numbers inside a `[data-countup-grid]` band climb from 0 to their printed value as the band enters view: a dedicated IntersectionObserver (`rootMargin: '0px 0px -15% 0px'`, `threshold: 0.2`) adds `.is-counted` and animates each `[data-countup]` element via `requestAnimationFrame` with an easeOutCubic curve over 1200ms, then **snaps to the exact original text** on the final frame (so commas, suffixes like `+`, and any prefix survive). A stat opts OUT of the count simply by not carrying `data-countup` — that is how the founding-year stat on the home page stays a literal year instead of counting up from zero.

**Gotcha worth remembering:** `initPolish` runs on initial load AND again on every `astro:page-load` (so polish survives View Transitions). Without a guard, two observers would race the same `requestAnimationFrame` on the same number. The fix is a per-element `el.dataset.counted === '1'` guard (set before the rAF starts) plus an `.is-counted` class on the grid, so a re-init is a no-op. If you add another count-up surface, keep that guard.

### Image parallax (`.parallax-slow`)

A bolder, modern scroll-driven set-piece on hero media: a slow vertical drift (`translateY(-3%)` to `3%`, holding a `scale(1.06)`) tied to the element's own scroll progress via `animation-timeline: view()` with `animation-range: cover`. No JS and no scroll listener. It is double-guarded — wrapped in both `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)` — so on browsers without CSS scroll-driven animation (or for reduced-motion users) the element simply renders static with no fallback script.

### Where these are wired

- `SectionHeading.astro`'s wrapper became `[data-reveal]`, so the reveal + eyebrow-draw cascade reaches nearly every section.
- `Course` and `Faculty` cards gained the green duotone image hover (`.img-tint-evergreen`, see `polish-layer.md`).
- `FinalCta` reveals its content.
- The home page composes the whole showcase (kinetic hero, `.hero-atmos` + `.parallax-slow`, the topics `.marquee`, and the `[data-countup-grid]` stat band with the founding-year stat opted out).

---

## Hero entry stagger (`.hero-entry-stagger`)

The hero's content column wraps in `<div class="hero-entry-stagger">`. Each direct child fades up with a 120ms staggered delay on first paint (eyebrow -> decorative hairline -> h1 -> subhead -> CTAs). Animation lives in `globals.css`. Reduced-motion users get the final composition instantly via the global media-query reset.

Don't apply this class to other components -- the per-child delays are tuned for the hero's specific 4-5-element composition.

---

## Home hero slideshow (`HeroBackground.astro`)

The home hero can be a single static image (default) or a slow cross-fading slideshow with a subtle Ken Burns zoom. `homePage.heroImages` in Sanity controls this: one image renders the static hero, two or more render the slideshow.

`HeroBackground.astro` owns the background markup (single `SanityImage` for 0-1 images, or stacked `.hero-slide` images for 2+) plus the readability overlays.

**Why the slide CSS lives in `globals.css` (not a scoped component style):** the slides are rendered by the child `SanityImage` component and would not inherit a scoped style. Same reasoning as `.img-zoom` and `.hero-entry-stagger`.

Each slide is `position: absolute`, `opacity: 0` with a `1.5s` opacity transition; the active slide is `opacity: 1` and all slides run a gentle continuous Ken Burns (`scale(1)` to `scale(1.07)`, alternating origin and duration). A small `<script is:inline>` in HeroBackground advances the active slide every 4500ms (3s hold + 1.5s fade):
- Uses a single `window`-scoped timer that is cleared on every re-init.
- Pauses while the tab is hidden (`visibilitychange`).
- Re-registers once on `astro:page-load` (guarded by a `window.__heroSlideshowBound` flag).
- Never starts under `prefers-reduced-motion`.

The first slide stays the eager `fetchpriority="high"` LCP image; the rest lazy-load. The first slide carries its descriptive alt; the additional slides use empty alt so they are decorative.

---

## View-transition cross-fade

`<main id="main">` carries `view-transition-name: main-content` and cross-fades on every navigation (`vt-fade-out` 150ms -> `vt-fade-in` 200ms). The header and footer are named (`site-header` / `site-footer`) and pinned with `animation: none` so they stay put through the swap instead of flashing. Astro respects `prefers-reduced-motion` automatically -- reduced-motion users get an instant cut. Pure CSS, no JS.

---

## Script accent font (opt-in)

The `@utility font-script` declaration and `--font-script` CSS custom property exist in `globals.css`, but no script font file is loaded by default. This is intentional: a calligraphic accent is project-specific and adds a font request for every visitor, so it should only be enabled when the design calls for it.

### How to enable the script accent

1. **Choose a script typeface** and install its `@fontsource` package, for example:
   ```
   npm install @fontsource/dancing-script
   ```

2. **Add the import** near the top of `src/styles/globals.css`, after the other `@fontsource` imports:
   ```css
   @import "@fontsource/dancing-script/400.css";
   ```

3. **Point `--font-script` at the family** in the `@theme` block in `globals.css`:
   ```css
   @theme {
     --font-script: 'Dancing Script', cursive;
   }
   ```

Once this is done, any element with the `font-script` Tailwind utility class will render in the script typeface.

### Usage discipline

The `font-script` utility is for a single-word editorial accent on hero headlines and section headings -- not for body text, buttons, or repeated decorative elements.

The shared logic lives in `src/lib/scriptAccent.ts` (`splitScriptAccent(headline, accent)`), which splits a headline string around the matching accent word and returns the before/after fragments for the template to wrap in `<span class="font-script">`. If the accent word is not found in the current headline, the heading renders plain -- editors can update copy without breaking anything.

**Discipline:** use at most one script accent per heading. Over-use dilutes the effect. The accent word must match the headline text exactly (case-sensitive). Think of it as an editorial signature, not decoration.

---

Cross-reference: `polish-layer.md` covers the non-animation visual layer (brand stripe, card-lift, surface-warm, reading-progress, sticky-header, paper-grain, print stylesheet).
