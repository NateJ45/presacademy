# The Presbyterian Academy

The website for **The Presbyterian Academy**, a Reformed lay-formation school
funded by the Presbytery of Cincinnati. Live at
[presbyterianacademy.org](https://www.presbyterianacademy.org).

**Stack:** Astro + Sanity + Cloudflare Workers, by
[Nixon Creative Studio](https://nixoncreativestudio.com).

The repo began life as a fork of the NCS church starter and was cut loose from
it on 2026-08-25: the rebrand machinery, opt-in church modules, and starter
seed are gone. What remains is a single-purpose school site: a course catalog
(courses, faculty, terms, pricing tiers, teaching areas, testimonials, events),
a 19-block page builder for custom pages, a "Direction A" green-anchored
bookish design system with light + dark themes, and a themed Sanity Studio
with an in-Studio help center where every visible string is editable.

## Working on it

```bash
# install both packages (the Studio is a nested package in studio/)
npm install && npm --prefix studio install

# run it
npm run dev            # site on :4321
npm run studio:dev     # Sanity Studio for content editing

# ship it
npm run build          # OG cards + astro build (static output in dist/)
npm run deploy         # build + wrangler deploy to the production Worker
```

Content lives in Sanity (project `uz2sl3zp`). The site is statically built:
a Sanity publish goes live after a rebuild (push to `main`, or the publish
webhook). Work lands on `staging`, then fast-forwards to `main`.

## The files that orient you

| File | What it is |
|---|---|
| `CLAUDE.md` | The constitution: stack, conventions, landmines, content model |
| `design.md` | The one-file design brief (palette, type, motion, signature moves) |
| `OPERATIONS.md` | The tactical runbook (deploy, audit content, patch data, gotchas) |
| `docs/PENDING.md` | The live registry of open loops: queued work, waiting-on-human items |
| `docs/TESTING.md` | Which test suite covers what |
| `docs/agent/` | Deep-dives per area (theme, components, Sanity, deployment, ...) |

AI-assisted workflow: project slash commands ship in `.claude/commands/`
(`/sanity-audit`, `/rebuild`, `/visual-verify`), and `design.md` plus
screenshots is the intended input for any visual work.

## Provenance

Reid Design build → ncs-astro-sanity-starter → Second Presbyterian Church of
Chicago build → ncs-church-starter → this repo (forked 2026-05, de-churched
2026-06, cut loose 2026-08). Photography in `src/assets/placeholders/` is
license-clean Pexels stock standing in until real Academy photography exists
(see `src/assets/placeholders/MANIFEST.md`).
