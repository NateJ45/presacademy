# Accessibility

> WCAG AA patterns, touch targets, focus traps, screen-reader pass, form error UX, and the pre-merge checklist.

## Accessibility

Target: WCAG 2.1 AA in both light and dark modes. Aim for 100 Lighthouse Accessibility on every page and preserve that bar after edits.

### Required patterns

**Landmarks and structure.** `BaseLayout` provides `<header>`, `<main id="main">`, `<footer>`, and a "Skip to main content" link as the first focusable element. Each top-level `<section>` needs an accessible name, via either `aria-labelledby` pointing at its heading (preferred when there's a visible heading) or `aria-label="..."` (for sections without one). When using `SectionHeading`, always pass `headingId="..."` so the parent's `aria-labelledby` actually resolves; without it, the reference points at nothing.

**Heading hierarchy.** One `<h1>` per page (usually inside the hero). Don't skip levels. Section headings are `<h2>`; subsections inside them are `<h3>`. Heading text describes the content, not its position ("How we work", not "Section 5").

**Forms.** Every input gets an associated `<label for="...">`. Use native input types (`email`, `tel`, `url`) and `autocomplete` hints so browsers and password managers help. Required fields get `required`. Error containers get `role="alert"`.

**Images.**

- Sanity content images: alt text comes from the Sanity field. Editors are responsible for writing meaningful alt text.
- Image immediately adjacent to a heading that names the same thing (testimonial photo with attribution, hero photo below an h1): `alt=""`. Empty alt explicitly marks the image decorative so screen readers skip it instead of announcing the title twice.
- Decorative gradients, shapes, or pseudo-elements: `aria-hidden="true"` on the wrapper.

**Interactive elements.**

- Icon-only buttons and links require `aria-label`. SVG icons carry no accessible name on their own; the label lives on the wrapper.
- Hover and focus states must not be color-only. Pair color changes with underline, motion, or icon swap.
- Stick to native interactive elements (`<button>`, `<a>`, `<details>`, `<summary>`) whenever possible.
- The before/after slider (if the portfolio module is active) needs keyboard support: arrow keys move the divider, the handle is focusable, and the focus indicator is visible.

**Color tokens by responsibility** (definitions and contrast math in `globals.css`):

- `--primary` (Geneva Green, the Direction A anchor): buttons, focus rings, CTA backgrounds at large size, brand-stripe rhythm, the eyebrow-rubric rule. Paired with white or cream foreground.
- `--link`: theme-aware accent for inline links, anchor-style body text, price numerals, step numerals, any always-on text that needs to read in both modes.
- `--accent` (theme-aware): hover surfaces only -- NOT body text. Light-mode value must be visibly darker than `--muted` so hover states are actually visible.
- `--foreground` (Ink in light, Paper in dark): headings and body text.
- `--secondary`: borders, dividers, decorative ornaments. NOT eyebrow labels (those use `text-foreground/65`).

**Motion.** `globals.css` disables animations and transitions globally under `prefers-reduced-motion: reduce`, and Lenis smooth scroll becomes a no-op. The before/after slider (if active) falls back to a tap-to-toggle behavior. View Transitions become instant cross-fades. New animations inherit this; no per-component handling needed. Transitions are zeroed (`0s` duration AND delay), not `0.01ms`: WebKit never finishes a 10-microsecond transition and holds the old value (starter PORTS.md card 61, 2026-09-30). `transitionend` therefore does not fire under reduce, so nothing may wait on it; animations keep `0.01ms` so `animationend` still fires. `tests/reduced-motion.spec.ts` holds it on chromium and webkit-iphone.

**Native `<select>` focus (WebKit).** Tailwind `ring` utilities compile to `box-shadow`, and WebKit drops `box-shadow` on natively-rendered form controls, so `focus:outline-none focus:ring-2` leaves a `<select>` with NO focus indicator in Safari and on iPhone (WCAG 2.4.7). `FormRenderer.tsx` therefore gives its `<select>` `selectCls`, which carries no focus utilities, and the global `:focus-visible` 2px `--ring` outline in `globals.css` paints it (fixed 2026-10-03; `CourseFilters.tsx` already worked this way). Inputs and textareas keep `inputCls` (ring is fine there). Any NEW native select must carry no `focus:outline-none`. Note the built-in `a11y-dark.spec.ts` cannot see this regression on the empty-env CI build: forms come from Sanity, so no `<select>` exists on `/contact` or `/get-started` there, and that spec runs under chromium only (`webkit-iphone`'s `testMatch` is smoke, a11y and reduced-motion).

**Language and metadata.** `<html lang="en">` and the document `title` and `description` come from `BaseLayout`. Pass `title` and `description` through every page that uses the layout. Any Calendly embed needs an `aria-label` on its iframe.

### Touch targets and tap spacing

All interactive elements get at least a 44x44 px hit area on mobile (WCAG 2.5.5 AAA, and table stakes on touch screens). For icon-only buttons, that means generous padding even if the icon glyph is 20 px. For inline links in body copy, ensure adequate line-height so adjacent links aren't fat-finger collisions.

**How we meet it (since 2026-10-04).** `.hit-44` (invisible area, standalone links and buttons; needs `relative`; do not combine with `.link-underline`), `.tap-44` (real 44px box for stacked lists such as the footer) and `.check-44` (checkboxes) live in `globals.css`. Inputs, selects, textareas and submit buttons carry `min-h-[44px]`. Links inside a sentence are exempt under WCAG 2.5.8 and are left alone. Measure with `node scripts/measure-tap-targets.mjs <baseUrl> --paths /,/contact/` (390px; exit 1 on any target under 44px or any stolen tap). The static build has no Sanity content, so also scan the live site after a deploy. The script scrolls in 500px steps and keys by position, so a sticky element can repeat in the list; read the per-route TOTAL, not the row count.

Adjacent independent controls (two side-by-side icon buttons, two stacked nav links) get at least 8 px of clear space between them. The shadcn primitives generally handle this; verify any custom button or link adheres.

### Focus traps in modals and drawers

The mobile nav uses shadcn Sheet (Radix Dialog under the hood) and gets focus trap for free. Same applies to any shadcn Dialog. Don't roll your own modal. If you build a custom overlay, you owe: focus moves into the overlay on open, Tab cycles within the overlay, Escape closes, focus returns to the trigger on close. Test with keyboard before merging.

### Screen reader pass

Lighthouse catches missing alt text and contrast but doesn't catch:

- Heading order that's logical visually but jumps levels in the DOM
- "Click here" or "Learn more" link text that's meaningless out of context
- Form fields where the visible label is far from the input in the DOM
- Live regions that announce too often (every keystroke) or not at all (silent state changes)

Before launch and after any structural change, do one screen-reader pass with NVDA (Windows, free at nvaccess.org) or VoiceOver (Mac, built-in, Cmd+F5 to toggle). Close your eyes, move through the page with only the keyboard, listen. If you can complete: landing, understanding what the business does, and submitting the contact form, the page works. If you stumble, find the friction.

### Form error UX

When the contact form fails validation or submission:

- Error container has `role="alert"` and `aria-live="polite"`
- Focus moves to the first invalid field on submit-attempt with errors
- Error text is visible AND descriptive ("Please enter an email address" not "Invalid input")
- Inline validation runs on blur, not on every keystroke (avoids announcer spam)
- Success states get a confirmation message in the same region so the reader announces it

### Animation discipline

The site uses motion for hero entrances, View Transitions, and component micro-interactions. Discipline:

- **Durations:** 150-300ms for state changes (hover, focus), 400-600ms for content reveals, never longer than 800ms for a single animation. Long animations feel laggy.
- **Easing:** `ease-out` for entrances, `ease-in` for exits. Avoid spring physics for primary content at large scales (disorienting).
- **What to animate:** opacity, transform (translate/scale). NOT layout properties (width, height, top) -- expensive and janky.
- **Reduced motion:** the global stylesheet kills animations and transitions under `prefers-reduced-motion: reduce`, and Lenis becomes a no-op. New components inherit this; verify by toggling the OS setting and reloading.
- **Don't animate to grab attention.** If users need to look at something, the design should pull the eye structurally, not by wiggling.

### Before merging

Run Lighthouse against any page changed. Accessibility should stay at 100. Common regressions:

- `color-contrast`: a token or literal used in a new context that doesn't pass. Check both modes.
- `image-alt`: missing `alt` attribute (empty `alt=""` is fine; missing isn't). For Sanity images, this usually means an editor forgot to fill the alt field; add validation on the schema if it becomes a pattern.
- `label`: input without an associated label.
- `link-name` or `button-name`: icon-only element without `aria-label`.

For structural changes, do a manual keyboard pass: Tab from the address bar through every interactive element. Each should be reachable, the focus indicator visible, and the order logical.

### Don't

- `aria-hidden="true"` on a focusable element.
- `tabindex` greater than 0.
- Remove focus outlines without a visible replacement.
- Use color as the only state cue.
- Add ARIA roles to native elements that already have the right role.
