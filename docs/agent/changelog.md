# Change history

> Running change log, moved out of CLAUDE.md so it does not load on every task.
> Each client project starts its own history from the extraction entry below.

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
