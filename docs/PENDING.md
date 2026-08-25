# PENDING — the open-loops registry

The live registry of open patches, known gaps, and waiting-on-a-human items.
Read it early in a session; update it in the same commit that closes,
opens, or discovers an item. Pattern borrowed from the WCP site repo.

Format: each item says what it is, why it's open, and what unblocks it.
Move finished items to the "Recently closed" section with a date; prune
that section when it gets long.

## Open — needs a human (Nathan)

- **Real Academy photography.** The whole dataset still runs on Pexels
  CC0 placeholders (`acad-*`). Editors can swap photos in Studio any time;
  until then the site is presentable but generic. Unblocks: a photo shoot
  or a curated real-photo set.
- **`siteSettings.phone` and social links are unseeded.** Deliberately
  left empty by `seed-editability.mjs` because they need real values.
  Empty fields hide rather than show stand-ins, so nothing is broken,
  just absent.
- **GitHub Actions secrets/variables may be unset.** `deploy-staging.yml`
  (needs `CLOUDFLARE_API_TOKEN`), `sanity-backup.yml` (needs
  `SANITY_AUTH_TOKEN`), and `uptime.yml` (needs the `SITE_URL` repo
  variable) all warn-and-skip when their secret is missing, so staging
  deploys, nightly dataset backups, and uptime checks may be silently
  inert. Check the repo settings on GitHub and set whichever are missing.

## Open — code/content work queued

- **Home page P1s from the 2026-06-20 Impeccable critique**
  (`.impeccable/critique/`): several course cards render empty image
  wells, and the faculty strip is text-only, which makes a polished page
  look half-loaded. Placeholder art or a layout that tolerates missing
  images would close it. Second finding: CTA wording drift ("Request
  info" vs "Request information", "Free intro" vs "Book a free intro");
  pick one form of each and sweep.
- **Re-record `acad-*` photo credits.** The per-photo Pexels source URLs
  for the academic placeholder set live only in gitignored curation
  scratch (`scripts/_stock*`). `MANIFEST.md` currently records the set
  without per-photo links. Low stakes (Pexels needs no attribution) but
  worth restoring if the scratch still exists.
- **CSP is hand-maintained** in `public/_headers` (see CLAUDE.md gotcha
  #10). Standing risk, not a task: any new embed origin needs a manual
  edit there.

## Recently closed

- 2026-08-25 — **Cut loose from the church starter**: removed `modules/`
  + `docs/modules/`, `rebrand.mjs` + bootstrap configs,
  `seed-starter-content.mjs`, `seed-placeholder-images.mjs`,
  `docs/bootstrap/NEW-PROJECT.md`, the church-era placeholder photos and
  videos, the `upstream` git remote, and the dead deps (`@astrojs/mdx`,
  `@astrojs/rss`, `react-photo-album`, `yet-another-react-lightbox`,
  studio `sanity-plugin-iframe-pane`). Renamed the Studio workspace
  `churchstarter` → `presacademy`. Rewrote `README.md` and `CLAUDE.md`
  for the academy (fixing the typegen-in-build contradiction and the
  ghost component lists). Swapped the six church-era hero fallbacks to
  `acad-*` images.
