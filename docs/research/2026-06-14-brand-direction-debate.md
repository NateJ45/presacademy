# Brand Direction Debate — Evolve, Don't Pivot, 2026-06-14

A research writeup of how The Presbyterian Academy moved from the "Oxblood &
Stone" brand to the green-anchored "Direction A" system. This is the record of
the decision: the stakeholder feedback that started it, the method we used to
pressure-test the options, the findings that survived that process, the verdict,
and the spec that shipped. Companion to `church-website-audit.md` and
`hppres-emulation-2026-06-11.md`; the implemented values live in
`src/styles/globals.css` (the source of truth), summarized in `design.md` and
`docs/agent/theme-and-color.md`. Implemented on PR #9 (branch
`feat/brand-evolution-direction-a`).

## The trigger

The Presbyterian Academy rebranded on 2026-06-13 from the inherited church
starter into a Reformed lay-formation school. That rebrand kept the starter's
"Oxblood & Stone" look: warm cream paper, walnut ink, oxblood interactions,
deep-oxblood structural bands, a Romanesque arch on hero and feature images, and
a faint paper-grain texture over everything. It reads as a beautifully printed
parish booklet.

The stakeholder (SJ) gave one piece of blunt feedback: the brand "feels too
old." Not wrong for a 1901 sanctuary; wrong for a school that wants to read as
serious, credible, and current. That single note set the question: how far do we
move? Reskin a few tokens, or tear the whole system down to a bright modern
minimal look?

## The method

Rather than answer from taste, we ran a structured multi-agent debate so the
decision would be grounded in what real peer institutions actually do.

- **Four research agents**, each grounded in a different slice of the real
  landscape: (1) traditional seminaries, (2) university divinity schools, (3)
  prestige academic institutions generally, and (4) modern Christian-formation
  brands. Each agent gathered how its segment handles color, type, texture, and
  overall feel.
- **Three PRO/CON rounds.** The agents argued the two poles against each other:
  PRO "pivot to a bright modern minimal brand" versus CON "keep the editorial
  serif-and-warmth system and evolve it." Each round forced the strongest
  version of both cases, then rebutted.
- **One judge** weighed the rounds and issued a verdict with an implementable
  spec.

The framing question for every round: is the "too old" read coming from the
*bones* of the system (the serif, the warmth, the editorial layout) or from a
specific *layer* sitting on top of them?

## Key findings

These are the findings that survived all three rounds.

1. **The "old" read is the sanctuary layer, not the bones.** The dated signal
   traces to three specific elements inherited from the church build: the
   Romanesque arch (`.arch-top`), the 4% paper grain (`body::before`), and the
   oxblood structural bands. Strip those and the same serif-over-sans, near-warm
   system reads as a current academic brand. The serif itself is not the
   problem.

2. **"Bookish" is paper plus serif, NOT bright-white minimal.** The instinct to
   fix "old" by going to a stark white, sans-serif, high-contrast minimal look
   actually fights the brand we want. A bookish, study-hall feel comes from
   near-white *paper* and a serif face. Those two instincts diverge: chasing
   "modern" via bright-white minimalism would have thrown away the exact
   qualities that make the brand feel like a serious reading room.

3. **The serif is a credibility asset worth keeping.** Prestige academic
   institutions commission custom serifs precisely because a serif reads as
   long-standing and authoritative (Yale's typeface and Princeton's commissioned
   serif are the obvious examples). For a Reformed school staking a claim to
   intellectual seriousness, dropping the serif would have been a downgrade, not
   a modernization.

4. **Near-white plus one deep heritage accent is the peer norm.** The strongest
   academic and formation brands run a near-white or warm-white field with a
   single deep, confident accent color carrying the structural moments, rather
   than a busy multi-color palette. That pattern reads modern and credible at the
   same time.

5. **Deep green has real Reformed-academic precedent.** A deep forest green is
   not a novelty for this segment; it carries heritage weight while feeling less
   ecclesiastical than oxblood. Regent College's forest green is a direct
   precedent in the Reformed-formation space.

6. **The modern reference points are warmer than their reputation.**
   practicingtheway.org, often cited as the "clean modern Christian-formation"
   benchmark, is in practice warmer and more serif-driven than people remember.
   The modern look we were chasing is not actually a cold minimal one, which
   reinforced findings 2 and 3.

## The verdict

**Evolve, don't pivot.** Keep the bones that are working (serif display over a
humanist sans body, near-white warmth, deep structural bands, keyword emphasis,
brass hairlines) and remove the specific layer that reads as old. Concretely:

- Swap the anchor from oxblood to a deep Reformed green.
- Move the page surface from cream to a cleaner near-white warm paper.
- Re-color the structural bands from oxblood to forest green (de-church them).
- Retire the Romanesque arch and the paper grain.
- Demote oxblood to a sparing secondary accent rather than deleting it.
- Replace the arch as the unifying signature with an editorial "rubric" mark — a
  short brand-green leading rule before every section eyebrow, echoing a
  manuscript rubric.

The result reads modern but long-standing and credible: a printed-book,
study-hall feel, NOT a church.

## The implemented spec (Direction A)

Shipped values, confirmed against `src/styles/globals.css`. Hex pairs are
light / dark where both are given.

**Surfaces and ink**
- Page surface: Stone Cream `#F4EEE6` -> near-white warm paper `#FAF8F4`.
- Cards / raised surfaces: Chalk `#FCF9F4` -> white `#FFFFFF`.
- Muted / alt band: `#EDE5D9` -> warm grey `#F1F0EB`.
- Body + heading ink: Walnut `#2A2521` -> soft near-black `#1F1B18`.

**Anchor (green)**
- Primary: Geneva Oxblood `#7A2A2C` -> Geneva Green `#33503F`. Carries buttons,
  links, the nav underline, the focus ring, keyword emphasis, and the wordmark
  accent.
- Deeper anchor / link text: `#2A4233`. Inline link text: `#33503F`.
- Dark mode: primary lifts to green `#74A98A`; link / keyword to `#9CC6AC`; the
  warm near-black surfaces are unchanged.

**Structural bands (the `chapel` token, name KEPT)**
- Oxblood `#5E2122` / `#4A1B1C` -> forest green `#2A4233` / `#1F3227`.
- Cream band text `#F1EAD9` retained. Footer and closing CTA now read green.

**Accents**
- Oxblood `#7A2A2C` demoted to a sparing secondary accent (new `--color-oxblood`
  token); no longer a field or band color.
- Aged Brass `#A87C3E` KEPT as the hairline accent — the green-and-gold pairing.

**Type**
- Fraunces (serif display) + Source Sans 3 (humanist sans body) KEPT. The italic
  display "moment" is quieted to true epigraphs only. The calligraphic script
  accent stays OFF.

**Signature moves**
- RETIRED: the Romanesque arch. `--arch-radius` is neutralized to a quiet modern
  rounding `clamp(0.5rem, 1vw, 0.85rem)`; `.arch-top` / `.arch-top-sm` now render
  near-rectangular.
- RETIRED: the 4% paper grain. `body::before` is set to `opacity: 0` (rule kept
  for easy restore).
- NEW: the eyebrow rubric. `.eyebrow` / `.eyebrow-inverse` add a short
  brand-green leading rule before every section / hero eyebrow (brass on dark,
  green, or photo surfaces) — the manuscript "rubric" that replaces the arch.
- KEEP: the deep structural bands (now green), keyword emphasis (now green),
  serif-over-sans, and brass hairlines.

**Photography**
- Church placeholders (`place-church-*`, `place-sanctuary-*`) were swapped for
  lay-school images (`teach-seminar-discussion`, `teach-class-discussion`,
  `study-bible-notebook`, `study-bibles-closeup`) on the contact, FAQ, privacy,
  and 404 pages.

## Maintainer caveat

The CSS token NAMES `chapel` and `chapel-ink` now carry GREEN, not oxblood. The
names were kept deliberately so the change stays contained and reversible — only
the values moved. They may be renamed in a later pass; until then, read "chapel"
in this codebase as "the structural band color," which is currently forest green.
