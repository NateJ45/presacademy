# Design Brief — NCS Church Starter (reference design system)

The one-file design system reference. Attach this (plus screenshots) when asking
any AI agent or designer for visual work on this site. Tokens are declared
in `src/styles/globals.css` and that file is the source of truth; if this brief
and the CSS ever disagree, the CSS wins. Deeper rationale lives in `docs/agent/`
(theme-and-color, design-tokens, polish-layer, animation).

This is the REFERENCE design the starter ships with (developed for a historic
1901 sanctuary and benchmarked against the strongest church sites; see
`docs/research/`). A new church can keep it wholesale, reskin the tokens
(see docs/bootstrap/NEW-PROJECT.md § Design seam) while keeping the system,
or replace it. When reskinning, update this brief to match. Last synced: 2026-06-12.

## Essence

A historic congregation with a warm, plain-spoken voice. The design language
is **warm editorial paper + liturgical color**: cream paper surfaces, walnut
ink, oxblood interactions, and a deep oxblood ("chapel") as the
structural counterpoint. It should feel like a beautifully printed parish
booklet, not a SaaS template. Polish and elevate this direction; never swap it
mid-project.

**The signature moves** (use them, don't dilute them):
1. **Arch-top images** (`.arch-top`, `.arch-top-sm`) — the Romanesque crown on
   hero/feature/staff photos. One shared radius token (`--arch-radius`).
2. **Deep oxblood structural bands** — utility bar, footer, closing CTA, quote
   band. Always `bg-chapel`/`bg-chapel-deep` with cream `text-chapel-foreground`,
   in BOTH themes (static, intentionally not theme-flipped).
3. **Keyword emphasis** — one word/phrase of a display headline in a second
   color. On cream: `text-chapel-ink` (home hero). On photo-scrim heroes:
   lifted brass `#C9A06A` via the `heroKeyword` Sanity field + Hero.astro's
   `keyword` prop. One flourish per headline, never stacked with the script
   accent or rotator.
4. **Serif display over a humanist sans body** — Fraunces display, Source Sans 3 body.
5. **Arch ornament** (`ArchOrnament.astro`) — a triple Romanesque arch in gold
   stroke; the page-close mark in FinalCta and at most one reflective moment
   per page. Keep it scarce so it stays a signature.

## Palette

| Token (utility) | Light | Dark | Role |
|---|---|---|---|
| `bg-background` | `#F4EEE6` Stone Cream | `#1E1A17` | page surface |
| `text-foreground` | `#2A2521` Walnut Ink | `#F1EAD9` | body text |
| `bg-card` / `bg-popover` | `#FCF9F4` Chalk | `#2A2420` | raised surfaces |
| `bg-muted` | `#EDE5D9` | `#262019` | quiet alt bands |
| `bg-primary` (static) | `#7A2A2C` Geneva Oxblood | same | CTA pills (white text) |
| `text-link` | `#5E2122` | `#E0998C` | inline links, oxblood text |
| `bg-chapel` (static) | `#5E2122` deep oxblood | same | structural bands |
| `bg-chapel-deep` (static) | `#4A1B1C` | same | footer/CTA deepest base |
| `text-chapel-foreground` | `#F1EAD9` cream | same | text on chapel |
| `text-chapel-ink` | `#5E2122` | `#E0998C` | keyword emphasis on page bg |
| `text-gold` / `bg-gold` (static) | `#A87C3E` Aged Brass | (dark ref `#C9A06A` via `--gold-ink`) | hairline rules, small accents |
| `border-border-soft` | `#E0D6C7` | — | faint warm dividers |

Contrast guardrails that already bit once: eyebrows on light surfaces need
`text-foreground/80`+ (`/65` fails AA); white-on-`bg-primary` is for
semibold-small or large text; cream-on-chapel is ~9:1, always safe.

## Type

- Display: **Fraunces** (variable, + italic) via `font-display`. Headings are
  weight 400, `letter-spacing: -0.01em`, `line-height: 1.1` (heroes:
  `leading-headline-tight` = 1.05).
- Body: **Source Sans 3 Variable** via the default `font-body` on `html`.
- Fluid scale tokens: `text-h1` clamp(2.5–5rem) … `text-h6` 1rem. Hero h1 uses
  `text-h1`; section headlines `text-h2`; card titles `text-h4`/`h5`.
- Eyebrows: uppercase, `tracking-eyebrow` (0.18em), small size, muted color
  (`text-foreground/80` on light; on chapel use `text-chapel-foreground/80`).
- Italic display is the approved "moment" device (epigraphs, blockquotes,
  hero accent words). The calligraphic `font-script` accent is OFF by default.

## Space + layout

- Fluid spacing tokens: `xs s m l` + `section-md` clamp(3–5rem) +
  `section-lg` clamp(4–7rem). Sections use `py-section-lg` (or `-md` for
  compact bands). Content max width: `max-w-content` (82.5rem).
- Rhythm rule from the design direction: alternate cream / chalk / chapel
  bands and alternate image side so pages read as composed sections, not a
  uniform stack. Asymmetry is on-brand; chaos is not.
- Mobile first reality: most visitors are at ~375px. Anything new must be
  checked there before desktop.

## Motion (restrained, CSS-only)

Defaults: 440ms `cubic-bezier(0.16,1,0.3,1)` on all interactive elements.
Idioms (all in globals.css, all honor `prefers-reduced-motion`):
`[data-reveal]` scroll reveal (+`is-visible`), `[data-stagger-grid]` card
stagger, `.card-lift` hover, `.press-tactile` CTA press, `.img-zoom`/`.img-tint`
photo hover, `.hero-entry-stagger` load-in, hero Ken Burns, `.nav-underline` /
`.link-underline`, View Transitions cross-fade. Do not add JS-driven animation;
do not exceed these durations; performance (Lighthouse 100s) is defended.

## Component idioms

- Buttons: pill (`rounded-full`), uppercase tracked label. Primary = oxblood fill
  + white text; secondary = outline. Always `.press-tactile`.
- Cards: `bg-card`, soft border, `.card-lift`, optional arch-top image, generous
  padding. Title serif, meta as eyebrow.
- Photos: through `SanityImage.astro` (Sanity) or Astro `<Image>` (local). Hero
  and feature photos take `.arch-top`; headshots/cards `.arch-top-sm`.
- Section heading pattern: eyebrow + serif headline (optional keyword span) +
  optional lede. Use `SectionHeading.astro`.
- Paper grain (`body::before`) sits over everything at 4%; large flat fills are
  fine, they won't look dead.

## Hard rules for any visual change

1. Verify in BOTH themes and BOTH viewports (375 / 1280) before calling it done
   (`/visual-verify`; remember the `[data-reveal]` blank-screenshot gotcha).
2. No new fonts, no new dependencies, no client-side JS for decoration.
3. Desktop nav stays server-rendered; Lenis + reveal observers stay.
4. No em-dashes in visitor-facing copy. Voice rules: `docs/brand/voice.md`.
5. Defend Lighthouse 100/100/100/100 and zero CLS (animate transform/opacity
   only; never height/top).
6. Content comes from Sanity. Don't bake copy into components; wire a field
   with an inline fallback (see CLAUDE.md content model).
