# The Presbyterian Academy

The website for **The Presbyterian Academy**, a Reformed lay-formation school offering theological education for everyday leaders. Funded by the Presbytery of Cincinnati. Built on Astro + Sanity + Cloudflare Workers.

**Live:** [presbyterianacademy.org](https://presbyterianacademy.org)

---

## The brief

A new school has a specific problem: it needs to look considered and trustworthy on day one, without pretending to a history it does not have yet. The Presbyterian Academy launched in 2026, so the site could not lean on a founding year or an enrollment number. It had to earn confidence through craft: a clear catalog, a real faculty, and an identity that feels like a place of serious study.

## The work

**A catalog, not a brochure.** The site is organized the way a prospective student thinks: **courses**, **faculty**, **terms**, **tuition tiers**, and teaching areas, each a structured content type in the CMS rather than flat pages. A course links to who teaches it and when it runs; the header's utility bar shows live enrollment status by surfacing the next term automatically.

**An identity built to read as "study."** The design is green-anchored bookish minimalism: warm near-white paper, soft near-black ink, a deep Reformed forest green, and brass hairlines, with Fraunces set over Source Sans 3. The home page opens on a slow Ken Burns slideshow, and a restrained editorial motion system (a kinetic headline, choreographed scroll reveals, a topics ticker, quiet stat count-ups) adds life without noise. The footer is a printed-book colophon.

**Honest by construction.** There is deliberately no fake legacy and no hardcoded contact details standing in for real ones: an empty field renders blank rather than showing a placeholder, so the live site only ever says what is true. The funding line ("made possible by the Presbytery of Cincinnati") is an editable footer credit.

**Editor-run.** Sanity is the single source of truth. On the live site the Studio mirrors the pages exactly, so staff change copy, add a course, or update a term without touching code.

## The result

A brand-new school that looks established because the work is good, not because the copy oversells. Course catalog, faculty, terms, and tuition, all editable, fast, and accessible.

---

## Stack

- **Astro 6** (static output) + TypeScript strict mode
- **Sanity v5** headless CMS; every visible string is a field, and the Studio mirrors the live site
- **Tailwind 4** via `@tailwindcss/vite` (brand tokens in `src/styles/globals.css`); the token/component reference lives at the unlisted `/style-guide` route
- **React 19** islands for interactivity; a CSS-first editorial motion system
- **Cloudflare Workers** hosting via `wrangler deploy`

Provenance: pivoted from the reusable NCS church starter into a school build (courses, faculty, terms, tuition). Photography in the repo is placeholder pending real Academy images.

## Running it locally

```sh
npm install
npm run dev
```

Conventions and architecture in [`CLAUDE.md`](./CLAUDE.md); tactical runbook in [`OPERATIONS.md`](./OPERATIONS.md).

---

Built by [Nixon Creative Studio](https://nixoncreativestudio.com).
