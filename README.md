# NCS Church Starter

A production-ready church website starter: **Astro 6 + Sanity v5 + Cloudflare Workers**,
by [Nixon Creative Studio](https://nixoncreativestudio.com). Fork it, stamp a new
church's identity onto it, import the starter content, and you have a polished,
editor-friendly church site in an afternoon instead of a month.

This is not a minimal scaffold. It was extracted from a finished, live church
build (a historic congregation in Chicago) and keeps everything that made that
site good: a Lighthouse 100/100/100/100 baseline, a warm editorial design
system with light + dark themes, a complete Sanity content model where the
Studio mirrors the live site exactly, and the gotchas of production documented
where you'll trip on them.

## What a church gets out of the box

- **Pages**: home, plan-a-visit ("I'm New"), what we believe, music, pastor &
  staff, grow, serve, kids, food ministry, events (+detail), sermons (+detail),
  weddings, use our space, give, contact, FAQ, privacy, 404, and a generic
  page-builder for anything else.
- **Worship plumbing**: one canonical service time that updates the header,
  footer, home, visit page, and Google's structured data together; a "This
  Sunday" module; a seasonal hero for Christmas/Easter.
- **Sermons**: livestream CTA, optional podcast links, featured message, and a
  per-service archive on every sermon (bulletin PDF, sermon notes, hymns,
  choir/organ music, who served, liturgical day).
- **Events**: recurring rhythms + one-time events with categories, special
  services band, registration links.
- **Connect**: configurable forms (general contact, connect card, prayer
  request ship as examples), newsletter signup hooks, announcement banner.
- **Editor experience**: a themed Sanity Studio with an in-Studio help center,
  status badges, singleton enforcement, and every visible string editable.
- **Design system**: serif editorial type, arch-top image signature, structural
  accent color bands, keyword gold emphasis, restrained CSS-only motion, all
  documented in `design.md`.

## Quick start (new church project)

```bash
# 1. Clone, install, and prove the empty-state build works
npm install && npm --prefix studio install
npm run build        # builds with placeholder content, no Sanity needed

# 2. Stamp the church's identity
cp bootstrap.config.example.json bootstrap.config.json
#    ...fill it in...
npm run rebrand -- --apply
npm run typegen && npm run og

# 3. Create the Sanity project (sanity.io/manage), then
cp .env.example .env                 # fill in project ID + tokens
cp studio/.env.example studio/.env   # same project ID
npm run seed -- --apply              # imports starter content, pre-stamped

# 4. Run it
npm run dev            # site on :4321
npm run studio:dev     # Studio for content editing
```

Full setup, including Cloudflare deploy, webhooks, and the pre-launch
checklist: **`docs/bootstrap/NEW-PROJECT.md`**.

## The three files that orient you

| File | What it is |
|---|---|
| `CLAUDE.md` | The constitution: stack, conventions, landmines, content model |
| `design.md` | The one-file design brief (palette, type, motion, signature moves) |
| `OPERATIONS.md` | The tactical runbook (deploy, audit content, patch data, gotchas) |

AI-assisted workflow: project slash commands ship in `.claude/commands/`
(`/sanity-audit`, `/rebuild`, `/visual-verify`), and `design.md` plus
screenshots is the intended input for any visual work.

## Provenance

Extracted 2026-06 from the Second Presbyterian Church of Chicago build (itself
built on the NCS Astro + Sanity starter). Photography in `src/assets/` is from
that build and is **placeholder-only: replace every photo before launching a
client site** (see the checklist).
