# Typography and spacing

> Font families, typographic micro-rules, fluid spacing tokens, and the Tailwind v4 collision trap.

## Typography

- Headings (h1 through h6): **Fraunces** (variable). Self-hosted via `@fontsource-variable/fraunces`. Editorial serif display that reads as premium without narrowing the brand voice to any specific style.
- Body, UI, buttons: **Source Sans 3** (variable, humanist sans). Self-hosted via `@fontsource-variable/source-sans-3`. Single file covers all weights.
- Script accent (opt-in): no script font is loaded by default. The `@utility font-script` declaration and `--font-script` token exist in `globals.css`, but the font file is only fetched when you add a `@fontsource` import for a script typeface and point `--font-script` at it. See `animation.md` for the full opt-in steps and usage discipline.
- Labels, eyebrows, monospace numerals: `ui-monospace, 'SF Mono', monospace` (system, no file).

Font families are declared in the `@theme` block in `src/styles/globals.css` as `--font-display`, `--font-body`, `--font-mono`, which Tailwind exposes automatically as `font-display`, `font-body`, `font-mono` utility classes.

### Typographic micro-rules

Two utility classes layered on top of the families. Use them instead of ad-hoc arbitrary values so the system stays consistent across components.

- `tracking-eyebrow` (`0.18em`) -- applied to every uppercase eyebrow label above a heading. Token: `--tracking-eyebrow`.
- `leading-headline-tight` (`1.05`) -- applied to hero-scale H1s. Combined with `tracking-[-0.02em]` it gives Fraunces editorial display proportions at the 40px to 80px hero range. Token: `--leading-headline-tight`.

Both are declared in `src/styles/globals.css` via `@utility`. Don't replace with arbitrary values (`leading-[1.05]`, `tracking-[0.18em]`) in new code; use the named utilities so a future scale change is one edit.

### Eyebrow rubric classes (`.eyebrow` / `.eyebrow-inverse`)

The Direction A signature mark. Add `.eyebrow` to an uppercase `tracking-eyebrow` label that introduces a headline; a short brand-green leading rule is drawn before it via `::before`. On dark / green / photo surfaces add `.eyebrow-inverse` so the rule lifts to brass and stays visible. Declared in `globals.css` (not a token — a pair of utility classes). Full usage discipline: `polish-layer.md`. These are independent of the type/spacing tokens above, which are unchanged by the brand evolution.

---

## Spacing tokens

Fluid spacing is declared in the `@theme` block in `src/styles/globals.css`:

| Token                  | Value                           | Notes                                                |
| ---------------------- | ------------------------------- | ---------------------------------------------------- |
| `--spacing-xs`         | `clamp(0.25rem, 0.5vw, 0.5rem)` | Tightest paddings, icon gaps                         |
| `--spacing-s`          | `clamp(0.5rem, 1vw, 1rem)`      | Small UI gaps                                        |
| `--spacing-m`          | `clamp(1rem, 2vw, 1.5rem)`      | Default content padding                              |
| `--spacing-l`          | `clamp(2rem, 4vw, 3rem)`        | Card padding, larger gaps                            |
| `--spacing-section-md` | `clamp(3rem, 6vw, 5rem)`        | Section-internal padding                             |
| `--spacing-section-lg` | `clamp(4rem, 8vw, 7rem)`        | Section block padding (top/bottom of major sections) |

Utility classes follow the standard Tailwind pattern: `p-l`, `py-section-lg`, `gap-m`, `mt-section-md`, `space-y-section-lg`, and so on.

### Tailwind v4 collision trap (don't recreate)

In Tailwind v4, `max-w-{key}` resolves to `--spacing-{key}` BEFORE `--container-{key}` when both exist for the same key. Naming a fluid spacing token `--spacing-xl` or `--spacing-2xl` would silently break `max-w-xl` / `max-w-2xl` sitewide (they would inherit the fluid clamp instead of the container width). The two largest section-padding tokens use the `--spacing-section-*` prefix specifically to avoid this collision.

**Rule for adding new spacing tokens:** the key must NOT match any Tailwind built-in container size: `3xs`, `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`, `7xl`. Use `--spacing-section-*` or another distinct prefix.

If you ever suspect this regressed, the diagnostic is: open the page in the dev server and inspect the compiled CSS for a `.max-w-2xl` rule. It MUST read `max-width: var(--container-2xl)`. If it reads `var(--spacing-2xl)`, a colliding token has been re-introduced somewhere in the cascade.

---

## The one scale (starter card 188, 2026-10-27)

A `:root` block "The one scale" in `src/styles/globals.css` (after the palette's `:root` and `.dark`) names every size, corner, gap, shadow and button measure a component or block stylesheet asks for. A value that is not on the scale is a bug: add a token before a one-off. Every value is one the Academy already drew, so nothing moved (every route compared at 375 and 1280, full page, before and after; HTML parity differs only by the numeral class below):

| Group   | Tokens                                                     | Academy value                                                                                                                                                                                                                                       |
| ------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text    | `--fs-tag`, `-small`, `-body`, `-lead`, `-button`          | 12, 14, 16, 18px; the button reads the tag size. Tailwind's `text-xs` to `text-lg` read these.                                                                                                                                                      |
| Titles  | `--fs-title`, `-title-sm`, `-numeral`                      | `--text-h4`, `--text-h5`, `--text-h3`                                                                                                                                                                                                               |
| Leading | `--lh-body`, `--lh-title`, `--lh-heading`                  | 1.5, 1.2, 1.1 (the base heading rule reads `--lh-heading`)                                                                                                                                                                                          |
| Figures | `--figures`, `--figures-numeral`                           | `normal` on `<html>`; `lining-nums tabular-nums` through the `figures-numeral` utility on the ledger stats, numbered cards and the course week list (was `tabular-nums`; Fraunces and Source Sans 3 already draw lining figures, so no pixel moved) |
| Corners | `--radius-card`, `-inner`, `-tag`, `-control`, `-pill`     | 0, 0, 0 (Rule & Ledger is square), rounded-sm, 9999px                                                                                                                                                                                               |
| Space   | `--pad-card`, `--pad-panel`, `--gap-grid`, `--gap-heading` | all `--spacing-l`                                                                                                                                                                                                                                   |
| Shadows | `--shadow-card` (+ `.dark` twin), `--shadow-raised`        | the `.card-lift` hover shadow, which now reads it                                                                                                                                                                                                   |
| Buttons | `--btn-height`, `--tracking-label`, `--btn-tracking`       | 44px, `--tracking-eyebrow` (0.18em)                                                                                                                                                                                                                 |
| Focus   | `--focus-ring-width`, `--focus-ring-offset`                | 2px, 2px                                                                                                                                                                                                                                            |

The builder kit (`builder-blocks.css`, `builder-blocks-more.css`) and the photo hero read these names; until this card `builder-blocks-academy.css` defined stand-ins for them, now removed.

**The shape contract** (`src/styles/shapes.css`, PORTABLE; used by the kit's hub and icon cards). Its tokens sit in the same block in Rule & Ledger's forms: a picture in a card is the squared photo well (`--radius-inner: 0`); a picture that stands alone takes the quiet `--arch-radius` with no cut (`--shape-feature-clip: none`); a card with no photo (`--shape-tile`) and the slab behind a standalone picture (`--shape-slab`) are the hatched brass photo well (`.image-well`), with a `.dark` twin. The only pixels that changed are the hub's photo-less tiles on `/style-guide/sections/` (a fixture; no live page holds a hub). `hero: board` stays off (`brand.config.json` `layout.hero` is `bleed`).

**Fallback faces.** The metric-matched fallbacks at the top of `globals.css` already name the Linux and ChromeOS metric twins (Liberation Serif and Tinos after Times New Roman, Liberation Sans and Arimo after Arial, Liberation Mono and Cousine after Courier New), the fix card 192 found for CI-only layout shift, so the starter's `font-fallback` script was not taken: the Academy's faces are measured by hand and cover three families.

## Motion tokens (starter card 192, 2026-10-27)

A `:root` block "Motion" near the top of `src/styles/globals.css` holds the flow layer's timings: `--motion-ease`, `--motion-fade` (200ms) and `--motion-fade-distance` (8px), `--motion-stagger-calm` (40ms), and the fuller `flow` values (`--motion-rise`, `--motion-line`, `--motion-photo`, `--motion-side`, `--motion-page-*`) at the starter's numbers. The Academy runs `layout.motion: fade`, so only the first four are drawn; `src/scripts/flow.ts` reads the durations from them. Detail: `animation.md`, "The flow layer".

## Color tokens

See `theme-and-color.md` for the full palette reference, the `--tint-rgb` token, and the light/dark discipline. The brand anchor is Geneva Green (`#33503F`) as of the Direction A evolution; `bg-primary`, `text-link`, and the `chapel` bands all resolve to green. A short summary of what to use in component code:

- Body text and headings: `text-foreground`
- Page and card surfaces: `bg-background`, `bg-card`, `bg-muted`
- Brand action color: `bg-primary`, `text-primary-foreground` (Geneva Green)
- Tinted overlays (polish layer): `rgba(var(--tint-rgb), <opacity>)` (warm brass)
- Borders: `border-border`

Never hardcode hex values in component markup. All palette and semantic tokens are in `globals.css`; change the token, not every usage site.
