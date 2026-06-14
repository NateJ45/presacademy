# Change history

> Running change log, moved out of CLAUDE.md so it does not load on every task.
> Each client project starts its own history from the extraction entry below.

*2026-06-14 — Lighthouse re-run after the kinetic motion pass (home page, on the
workers.dev preview). Performance ~100 (LCP 205ms, CLS 0.01 — the animation pass
did NOT regress performance), Accessibility 100, Best Practices 100. SEO showed
66 ON THE PREVIEW ONLY: Cloudflare auto-injects an X-Robots-Tag: noindex header
on every *.workers.dev URL, which fails Lighthouse's is-crawlable audit. The page
itself has no noindex meta and carries a valid description + canonical, so on the
production custom domain SEO is 100. Documented in performance.md so a future
SEO-66 on a preview is not mistaken for a regression.*

*2026-06-14 — Placeholder images seeded into the dataset so the site renders
fully for styling while real photography is pending. New script
scripts/seed-placeholder-images.mjs (commit 8a644e5) uploads placeholders and
patches ONLY empty image fields (idempotent; never clobbers an editor's real
images). Course coverImages and page heroImages use the in-repo Pexels library
(src/assets/placeholders/teach-*, study-*, community-*); faculty photos come from
pravatar.cc. Run `node scripts/seed-placeholder-images.mjs` (dry run) /
`--apply`; the apply run patched 22 docs (8 course covers, 5 faculty portraits, 9
page heroes incl. home). The editor swaps in real photography later. Static
deploys show the placeholders only after a rebuild; the dev server shows them
immediately. Docs: images.md, sanity.md.*

*2026-06-14 — Animation / effects pass: a CSS-first "refined kinetic editorial"
motion system, shipped on PR #9 (commit 864d173). All transform / opacity /
clip-path only (zero CLS), and the whole system is neutralized by a dedicated
prefers-reduced-motion reset block at the end of the motion section in
globals.css. New globals.css idioms: the academic graph-paper / dotted-grid
texture + soft green hero glow (.hero-atmos / .surface-grid / .surface-dots,
theme-aware via a new --grid-rgb token); choreographed reveals extending
[data-reveal] (directional .reveal-l / .reveal-r, a headline clip-wipe
.reveal-rise, and the eyebrow rubric drawing itself in via .eyebrow::before scaleX
keyed to .is-visible); a per-word hero-headline rise (.kinetic-words,
transform-only so it stays LCP-safe); micro-interactions (.link-arrow arrow
nudge, .card-link green hover border, .img-tint-evergreen green duotone image
hover); a seamless edge-faded hover-pausing topics ticker (.marquee /
.marquee__group, two groups, -50% loop); and an @supports-guarded CSS
scroll-driven parallax on hero media (.parallax-slow, animation-timeline: view()).
BaseLayout's initPolish gained a stat count-up for
[data-countup-grid] / [data-countup] (easeOutCubic, snaps to the exact final
text; year-style stats opt out by carrying no data-countup) — guarded with a
per-element dataset.counted flag because initPolish runs on load AND
astro:page-load. SectionHeading's wrapper is now [data-reveal] so the reveal +
eyebrow-draw cascade to nearly every section; Course/Faculty cards gained the
green duotone hover; FinalCta reveals its content. The home page is the showcase
(kinetic hero, graph-paper atmosphere + image parallax, topics ticker, stat
count-up). Docs: design.md, animation.md, polish-layer.md, performance.md.*

*2026-06-14 — Brand evolution (Direction A): "green-anchored bookish
minimalism," shipped on PR #9 (branch feat/brand-evolution-direction-a).
Prompted by stakeholder feedback that the "Oxblood & Stone" brand "feels too
old." A structured multi-agent debate (four research agents grounded in real
seminaries, divinity schools, prestige-academic, and modern Christian-formation
brands; three PRO/CON rounds; one judge) concluded EVOLVE, DON'T PIVOT: the
"old" read came from the sanctuary layer (the Romanesque arches, the paper
grain, the oxblood structural bands), not from the serif or the warmth, which
are credibility assets. Verdict and full method: docs/research/2026-06-14-brand-direction-debate.md.

What changed (src/styles/globals.css is the source of truth):
- Palette: page surface Stone Cream #F4EEE6 -> near-white warm paper #FAF8F4;
  cards #FCF9F4 -> white #FFFFFF; muted band #EDE5D9 -> warm grey #F1F0EB; ink
  Walnut #2A2521 -> soft near-black #1F1B18.
- Anchor: Geneva Oxblood #7A2A2C -> Geneva Green #33503F (buttons, links, nav
  underline, focus ring, keyword emphasis, wordmark accent; deeper anchor
  #2A4233). Dark mode primary lifts to #74A98A, link/keyword to #9CC6AC.
- De-churched structural bands: the `chapel` token (NAME kept for reversibility)
  flips from oxblood #5E2122/#4A1B1C to forest green #2A4233/#1F3227; cream text
  retained. Footer and closing CTA now read green.
- Oxblood demoted to a sparing secondary accent (new --color-oxblood); Aged
  Brass #A87C3E kept as the hairline accent (green + gold pairing).
- Signature moves: RETIRED the Romanesque arch (--arch-radius neutralized to a
  quiet modern rounding; .arch-top/.arch-top-sm now near-rectangular) and the 4%
  paper-grain body::before (opacity 0). ADDED the eyebrow rubric (.eyebrow /
  .eyebrow-inverse) — a short brand-green leading rule before every section/hero
  eyebrow (brass on dark/green/photo) — as the new unifying mark. Italic display
  quieted to true epigraphs; script accent stays OFF.
- Photography: church placeholders (place-church-*, place-sanctuary-*) swapped
  for lay-school images (teach-seminar-discussion, teach-class-discussion,
  study-bible-notebook, study-bibles-closeup) on contact/faq/privacy/404.
- Docs updated: design.md, theme-and-color.md, polish-layer.md, design-tokens.md,
  components.md, and a new research writeup. Maintainer caveat: the CSS token
  names `chapel` / `chapel-ink` now carry GREEN, not oxblood — kept for
  reversibility, may be renamed in a later pass.*

*2026-06-13 — Rebranded to The Presbyterian Academy, a PC(USA) Reformed
lay-formation school (presbyterianacademy.org). Identity stamped via
scripts/rebrand.mjs from bootstrap.config.json. New brand: the "Oxblood &
Stone" palette (Geneva Oxblood #7A2A2C, Walnut Ink #2A2521, Stone Cream
#F4EEE6, Aged Brass #A87C3E; deep-oxblood structural bands replacing the old
chapel green) and a Fraunces (display) + Source Sans 3 (body) type system,
replacing Instrument Serif + Newsreader. Plainspoken wordmark ("The
Presbyterian" / "Academy", final word in oxblood) and a PA-monogram favicon;
OG image and the Sanity Studio theme rebranded to match. Brand spec +
implementation plan in docs/superpowers/. Shipped via PR #2; Studio deployed to
presbyterian-academy.sanity.studio. Still pending before launch: content seed
(starter-content.ndjson still carries placeholder copy), real photography, and
a Lighthouse pass on the live site.*

*2026-06-12 — ncs-church-starter extracted from the Second Presbyterian Church
of Chicago build. Everything that made that site good ships here: the full
page set, the Sanity content model (singletons + collections + page builder +
configurable forms), the worship-time single-sourcing, the sermons module with
per-service records, the events module, the design system (documented in
design.md) with its Lighthouse 100/100/100/100 baseline, the themed Studio
with its editor help center, and the agent tooling (.claude/commands,
scripts/sanity-audit.mjs, OPERATIONS runbook). New for the template: identity
placeholders throughout ("First Church of Springfield"), scripts/rebrand.mjs
(config-driven identity stamp), studio/starter-content.ndjson +
scripts/seed-starter-content.mjs (a pre-stamped starter dataset including
connect-card and prayer-request forms), site.ts-driven wordmark (no hardcoded
church name in components), docs/bootstrap/NEW-PROJECT.md + setup-checklist.md
(the spin-up runbook), and a blanked docs/brand/voice.md template. Client
secrets, Sanity project IDs, deploy hosts, and one-off content seed scripts
were removed. Reference-build photography remains in src/assets/ as
placeholder-only imagery: replace before any client launch.*
