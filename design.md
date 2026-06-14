# Design Brief — NCS Church Starter (reference design system)

The one-file design system reference. Attach this (plus screenshots) when asking
any AI agent or designer for visual work on this site. Tokens are declared
in `src/styles/globals.css` and that file is the source of truth; if this brief
and the CSS ever disagree, the CSS wins. Deeper rationale lives in `docs/agent/`
(theme-and-color, design-tokens, polish-layer, animation).

This is the REFERENCE design the starter ships with (developed for a historic
1901 sanctuary, benchmarked against the strongest church sites, then evolved for
The Presbyterian Academy lay-formation school; see `docs/research/`, including
the 2026-06-14 brand-direction debate). A new church can keep it wholesale,
reskin the tokens (see docs/bootstrap/NEW-PROJECT.md § Design seam) while keeping
the system, or replace it. When reskinning, update this brief to match.
Last synced: 2026-06-14 (brand evolution — Direction A).

## Essence

A Reformed lay-formation school with a warm, plain-spoken voice. The design
language is **clean, bookish, near-white paper + deep Reformed green**: a
printed-book and study-hall feel that reads modern but long-standing and
credible. It should feel like a well-set academic catalog or a serious
reading room, NOT a church. Deep forest green ("chapel") carries the structural
moments; oxblood survives only as a sparing secondary accent. Polish and elevate
this direction; never swap it mid-project.

> **Brand evolution (Direction A, 2026-06-14).** The starter originally shipped
> the "Oxblood & Stone" palette (cream paper, walnut ink, oxblood interactions,
> oxblood structural bands, a Romanesque arch, and a paper-grain texture). A
> stakeholder read that as "too old," and a structured multi-agent debate
> (grounded in real seminaries, divinity schools, and modern Christian-formation
> brands) concluded the "old" read came from the *sanctuary layer* (the arches,
> the grain, the oxblood bands), not from the serif or the warmth. The verdict
> was **evolve, don't pivot**: keep the serif-over-sans bones, the near-white
> warmth, and the deep structural bands; swap the anchor to green, retire the
> arch and the grain, and add an editorial "rubric" mark. Full writeup:
> `docs/research/2026-06-14-brand-direction-debate.md`. The CSS token names
> `chapel` / `chapel-ink` were KEPT for reversibility and now carry GREEN, not
> oxblood.

**The signature moves** (use them, don't dilute them):
1. **The eyebrow rubric** (`.eyebrow`, `.eyebrow-inverse`) — a short brand-green
   leading rule set before every section / hero eyebrow, the manuscript "rubric"
   that introduces a headline. This is the unifying mark that REPLACES the
   retired arch. On dark / green / photo surfaces add `.eyebrow-inverse` so the
   rule lifts to brass (`#C7A875`) and stays visible.
2. **Deep green structural bands** — utility bar, footer, closing CTA, quote
   band. Always `bg-chapel`/`bg-chapel-deep` (forest green `#2A4233` / `#1F3227`)
   with cream `text-chapel-foreground`, in BOTH themes (static, intentionally not
   theme-flipped). These read green now, de-churched from the old oxblood.
3. **Keyword emphasis** — one word/phrase of a display headline in a second
   color. On near-white: `text-chapel-ink` (now green, home hero). On photo-scrim
   heroes: lifted brass `#C9A06A` via the `heroKeyword` Sanity field +
   Hero.astro's `keyword` prop. One flourish per headline, never stacked with the
   script accent or rotator.
4. **Serif display over a humanist sans body** — Fraunces display, Source Sans 3
   body. A deliberate credibility asset (the peer norm at prestige academic
   institutions); KEPT through the evolution.
5. **Green + brass pairing** — Aged Brass (`#A87C3E`) survives as the hairline
   accent against the green anchor (rules, small badges, the inverse rubric).
   Use it scarce, as a hairline, so it stays a signature.

The italic display "moment" (epigraphs, blockquotes) is now quieted to true
epigraphs only, and the calligraphic script accent stays OFF by default.

**Retired in Direction A** (don't reintroduce without a deliberate decision):
- **The Romanesque arch.** `--arch-radius` is neutralized to a quiet modern
  rounding (`clamp(0.5rem, 1vw, 0.85rem)`); `.arch-top` / `.arch-top-sm` now
  render near-rectangular. The arch utilities remain in the codebase but no
  longer read as a Romanesque crown.
- **The paper grain.** The 4% `body::before` SVG-noise texture is set to
  `opacity: 0` (rule kept for easy restore). Large flat near-white fills are
  intentional now; don't paper-grain them back.

## Palette

Direction A: green-anchored, near-white, soft near-black. Oxblood is demoted
from the lead/field color to a sparing secondary accent (`--color-oxblood`).
The `chapel` token names are kept but now carry green.

| Token (utility) | Light | Dark | Role |
|---|---|---|---|
| `bg-background` | `#FAF8F4` near-white warm paper | `#1E1A17` | page surface |
| `text-foreground` | `#1F1B18` soft near-black | `#F1EAD9` | body text |
| `bg-card` / `bg-popover` | `#FFFFFF` white | `#2A2420` | raised surfaces |
| `bg-muted` | `#F1F0EB` warm grey | `#262019` | quiet alt bands |
| `bg-primary` (static) | `#33503F` Geneva Green | same | CTA pills (white text) |
| `text-link` | `#33503F` Geneva Green | `#9CC6AC` | inline links, green text |
| `bg-chapel` (static) | `#2A4233` forest green | same | structural bands |
| `bg-chapel-deep` (static) | `#1F3227` forest green deepest | same | footer/CTA deepest base |
| `text-chapel-foreground` | `#F1EAD9` cream | same | text on chapel |
| `text-chapel-ink` | `#33503F` green | `#9CC6AC` | keyword emphasis on page bg |
| `text-gold` / `bg-gold` (static) | `#A87C3E` Aged Brass | (dark ref `#C9A06A` via `--gold-ink`) | hairline rules, small accents, inverse rubric |
| `--color-oxblood` | `#7A2A2C` Oxblood | same | demoted; sparing secondary accent only |
| `border-border-soft` | `#EAE7DF` | — | faint warm dividers |

Anchor deepens to `#2A4233` (Green Deep) for a deeper green where needed.
Dark mode lifts the primary to green `#74A98A` and link/keyword green to
`#9CC6AC`; the warm near-black surfaces are unchanged.

Contrast guardrails that already bit once: eyebrows on light surfaces need
`text-foreground/80`+ (`/65` fails AA); white-on-`bg-primary` (green) is for
semibold-small or large text; cream-on-chapel (green) is ~9:1+, always safe.

## Type

- Display: **Fraunces** (variable, + italic) via `font-display`. Headings are
  weight 400, `letter-spacing: -0.01em`, `line-height: 1.1` (heroes:
  `leading-headline-tight` = 1.05).
- Body: **Source Sans 3 Variable** via the default `font-body` on `html`.
- Fluid scale tokens: `text-h1` clamp(2.5–5rem) … `text-h6` 1rem. Hero h1 uses
  `text-h1`; section headlines `text-h2`; card titles `text-h4`/`h5`.
- Eyebrows: uppercase, `tracking-eyebrow` (0.18em), small size, muted color
  (`text-foreground/80` on light; on chapel use `text-chapel-foreground/80`).
  An eyebrow that introduces a headline also carries the `.eyebrow` rubric class
  (green leading rule), or `.eyebrow-inverse` on dark / green / photo surfaces.
- Italic display is the approved "moment" device, now quieted to true epigraphs
  and blockquotes only (not hero accent words). The calligraphic `font-script`
  accent is OFF by default.

## Space + layout

- Fluid spacing tokens: `xs s m l` + `section-md` clamp(3–5rem) +
  `section-lg` clamp(4–7rem). Sections use `py-section-lg` (or `-md` for
  compact bands). Content max width: `max-w-content` (82.5rem).
- Rhythm rule from the design direction: alternate near-white / white-card /
  green-chapel bands and alternate image side so pages read as composed
  sections, not a uniform stack. Asymmetry is on-brand; chaos is not.
- Mobile first reality: most visitors are at ~375px. Anything new must be
  checked there before desktop.
- Mobile responsive idioms (current): large two-column images are constrained
  on mobile rather than left to go full-width and dominate the column. Constrain
  with a shorter aspect ratio (the home split-hero is `aspect-[3/2] lg:aspect-[4/5]`,
  the 404 photo `aspect-[3/2] md:aspect-[5/6]` + text-first) or a capped, centered
  width (the faculty-detail portrait is `max-w-[240px]` centered on mobile).
  Cover-on-top cards compact to a thumbnail + text row on mobile so card lists
  scroll fast (CourseCard goes cover-on-top only from `sm` up). And `overflow-x: clip`
  on `html` / `body` guards against the scroll-reveal animations' horizontal
  overflow (see Motion below).

## Motion (refined kinetic editorial, CSS-first)

Defaults: 440ms `cubic-bezier(0.16,1,0.3,1)` on all interactive elements. The
motion system is CSS-first (transform / opacity / clip-path only, so zero CLS),
and the whole thing is neutralized by a `prefers-reduced-motion` reset block at
the end of the motion section in `globals.css`. The home page is the showcase.

Base idioms (all in globals.css): `[data-reveal]` scroll reveal (+`is-visible`),
`[data-stagger-grid]` card stagger, `.card-lift` hover, `.press-tactile` CTA
press, `.img-zoom`/`.img-tint` photo hover, `.hero-entry-stagger` load-in, hero
Ken Burns, `.nav-underline` / `.link-underline`, View Transitions cross-fade.

The "refined kinetic editorial" idioms (added 2026-06-14, the academic-notebook
layer):

- **Kinetic hero headline** (`.kinetic-words`) — each word sits in an
  overflow-hidden box and rises into place on load, lightly staggered by a
  `--i` index. Transform-only, so it stays LCP-safe.
- **Graph-paper atmosphere** (`.hero-atmos` / `.surface-grid` / `.surface-dots`)
  — a faint academic notebook grid (and dotted variant) plus a soft green hero
  glow, theme-aware via the `--grid-rgb` token (ink lines on near-white, cream
  on dark). This is the distinctive academic-notebook texture, painted on the
  element background so it sits behind content with no extra DOM.
- **Choreographed reveals + eyebrow draw** — `[data-reveal]` gains directional
  variants (`.reveal-l` / `.reveal-r`) and a headline clip-wipe (`.reveal-rise`,
  a display line wiping up from its own baseline via clip-path + transform), and
  the eyebrow rubric now DRAWS ITSELF IN: `.eyebrow::before` scales its leading
  rule from 0 keyed to `[data-reveal].is-visible`. `SectionHeading`'s wrapper is
  `[data-reveal]`, so the reveal + eyebrow-draw cascade to nearly every section.
- **Topics ticker** (`.marquee` / `.marquee__group`) — a slow, edge-faded,
  hover-pausing ticker; two identical groups loop seamlessly at -50%.
- **Stat count-up** (`[data-countup-grid]` / `[data-countup]`) — numbers climb
  from 0 to their value as the band enters view (easeOutCubic, snaps to the
  exact final text). Year-style stats opt out by carrying no `data-countup`.
- **Image parallax** (`.parallax-slow`) — a CSS scroll-driven drift on hero
  media (`animation-timeline: view()`), `@supports`-guarded so it degrades to a
  static element where unsupported.
- **Micro-interactions** — `.link-arrow` (arrow nudge on hover/focus),
  `.card-link` (green border on hover), `.img-tint-evergreen` (green duotone
  image hover, pairs with `.img-zoom`).

Do not add JS-driven decorative animation; do not exceed these durations; animate
transform / opacity / clip-path only, never height or top. Performance (Lighthouse
100s, zero CLS) is defended and the kinetic pass did not regress it.

## Component idioms

- Buttons: pill (`rounded-full`), uppercase tracked label. Primary = green fill
  (`bg-primary`) + white text; secondary = outline. Always `.press-tactile`.
- Cards: `bg-card` (white), soft border, `.card-lift`, generous padding. Title
  serif, meta as eyebrow. Card images now use the quiet modern rounding (the
  arch is retired), not a Romanesque crown.
- Photos: through `SanityImage.astro` (Sanity) or Astro `<Image>` (local). The
  `.arch-top` / `.arch-top-sm` utilities still exist but render near-rectangular
  in Direction A; treat them as a soft rounding, not an arch.
- Section heading pattern: rubric eyebrow (`.eyebrow`) + serif headline (optional
  green keyword span) + optional lede. Use `SectionHeading.astro`.
- **Footer colophon.** The footer is composed as a printed-book *colophon* page
  (oversized Fraunces wordmark masthead, a brass-ruled imprint row, a monogram
  seal, and a typeface credit), not a generic link grid. It is a current brand
  idiom: keep the bookish colophon read on any footer work.
- **Rule & Ledger frame** (404, framed media). Framed photos now use a brass top
  rule above a clean rectangular crop, not a Romanesque arch. The arch was
  retired in Direction A; treat `.arch-top` as a soft rounding only.
- No paper grain. `body::before` is set to `opacity: 0` in Direction A; large
  flat near-white fills are intentional and read clean, not dead.

## Hard rules for any visual change

1. Verify in BOTH themes and BOTH viewports (375 / 1280) before calling it done
   (`/visual-verify`; remember the `[data-reveal]` blank-screenshot gotcha).
   LIGHT is the default theme (the site no longer follows the OS preference);
   light is primary, but dark must still read as the brand.
2. No new fonts, no new dependencies, no client-side JS for decoration.
3. Desktop nav stays server-rendered; Lenis + reveal observers stay.
4. No em-dashes in visitor-facing copy. Voice rules: `docs/brand/voice.md`.
5. Defend Lighthouse 100/100/100/100 and zero CLS (animate transform/opacity
   only; never height/top).
6. Content comes from Sanity. Don't bake copy into components; wire a field
   with an inline fallback (see CLAUDE.md content model).
7. The school was **founded in 2026.** Never reintroduce a founding year, an
   "Est." line, or long-history / large-enrollment claims (the old "Est. 1998 /
   a thousand learners / long view" placeholder copy was removed everywhere).
   Stats lead with structure and standards (credentialed faculty, in-person
   cohorts, need-based scholarships, Westminster grounding), not age or size.
