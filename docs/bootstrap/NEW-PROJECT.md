# NEW-PROJECT.md — Spin up a church site from this starter

The runbook for taking this starter to a new church client. Worked through in
order, a comfortable first pass is an afternoon; launch-ready is a few working
days depending on how fast the church supplies content and photos.

Companion: `setup-checklist.md` (the tick-box version of this file). Read
`CLAUDE.md` first for the Foundation-vs-Safe-to-edit taxonomy; it tells you
which files change freely and which need a planned session.

---

## 0. Prerequisites

- Node 22.12+, a GitHub account, a Cloudflare account, a Sanity account.
- From the church: name, address, service time(s), contact details, social
  URLs, giving-portal URL, photography (or a plan to shoot it), and whoever
  will edit content (the Studio is built for a church secretary, not a dev).

## 1. Fork and verify

```bash
git clone <this-starter> <church-name> && cd <church-name>
npm install && npm --prefix studio install
npm run build
```

The build MUST pass with no `.env` at all: pages render placeholder
empty-state content. If it doesn't, stop and fix before customizing
(`sanityFetch` fallbacks are load-bearing; see CLAUDE.md).

## 2. Stamp the identity

```bash
cp bootstrap.config.example.json bootstrap.config.json
# fill in: church name, short name, wordmark line 2, domain, city, address,
# emails, phone, storage prefix, worker name, studio host
npm run rebrand              # dry run: see what will change
npm run rebrand -- --apply
git diff                     # the diff IS the rebrand; review it
npm run typegen
```

`rebrand.mjs` replaces the template's exact placeholder strings ("First Church
of Springfield", "123 Main Street", "example-church.org"...) across the code,
schemas, and docs. Anything it can't know (photos, colors, denomination
wording) is in the checklist.

## 3. Design seam (optional but probably yes)

The starter ships the reference palette (warm cream paper, espresso ink,
bronze, deep chapel green, liturgical gold) and serif pairing (Instrument
Serif + Newsreader). To reskin for the new church:

1. `src/styles/globals.css` `@theme` block: palette tokens + `--tint-rgb`.
2. Mirror the colors in `src/data/site.ts` `brandColors`.
3. Swap `@fontsource` imports + `--font-display`/`--font-body` if changing type.
4. `scripts/generate-og-default.mjs` inputs, then `npm run og`.
5. Favicon + apple-touch-icon in `public/`, church mark in
   `studio/components/church-mark.png`.
6. Read `design.md` first; it explains the signature moves (arch images,
   structural color bands, keyword emphasis) so a reskin keeps the system.

Build in BOTH light and dark mode (CLAUDE.md rule #3).

## 4. Sanity project

1. Create a project at sanity.io/manage; dataset `production`.
2. `cp .env.example .env` → fill `PUBLIC_SANITY_PROJECT_ID`, create a Viewer
   token (`SANITY_API_READ_TOKEN`) and an Editor token
   (`SANITY_API_WRITE_TOKEN`).
3. `cp studio/.env.example studio/.env` → same project ID.
4. Seed the starter content (pre-stamped with the bootstrap identity):

```bash
npm run seed             # dry run, lists the documents
npm run seed -- --apply  # imports: siteSettings, home/visit/contact pages,
                         # example FAQ/events/sermon/ministries, and three
                         # ready-made forms (contact, connect card, prayer request)
```

5. `npm run studio:dev` → walk the Studio as an editor would. Fill the
   remaining Site Settings (socials, give URL, worship time) and publish.
6. First Studio deploy: `npm run studio:deploy` (pick a unique host; then pin
   the printed appId in `studio/sanity.cli.ts` so future deploys are
   non-interactive).

## 5. Content load

Sanity is the single source of truth (CLAUDE.md content-model callout): every
visible string is a field, and the goal is every field populated so the Studio
mirrors the live site. The starter dataset gives the skeleton; the church's
real copy goes in via Studio (or write a one-off seed script per
OPERATIONS.md → "Patch Sanity content programmatically").

Photos: replace EVERY image in `src/assets/` (they are reference-build
placeholders, not licensed for reuse) and upload the church's photography in
Studio. Authentic people-photography beats building shots; see the church
website audit in `docs/research/` — it is the #1 differentiator.

## 6. Cloudflare

1. Push to GitHub. Cloudflare → Workers & Pages → create from repo.
   Build command `npm run build`, output `dist`. Set the env vars from
   `.env.example` (mark tokens Secret).
2. `wrangler.jsonc` name was stamped by rebrand; add the custom domain when
   DNS is ready.
3. **Publish-to-live webhook** (do not skip; without it editors wait for the
   next code push): Cloudflare build hook + Sanity webhook with the deny-list
   GROQ filter, exactly as written in `docs/agent/deployment.md`.

## 7. Pre-launch

Run `docs/bootstrap/setup-checklist.md` top to bottom. Highlights: Lighthouse
100s on home + a content page, both themes + both viewports eyeballed
(`/visual-verify`), `node scripts/sanity-audit.mjs --fields` shows no
unexpected gaps, privacy page reviewed, analytics token set, OG image
regenerated, 404 reads right, forms deliver (Web3Forms key set + a test
submission), DNS cutover plan.

## 8. Hand off to the editor

The Studio has a built-in "How This Works" help center written for
non-technical church staff. Walk the editor through: edit → Publish → the
site rebuilds in ~2 minutes. Leave them `OPERATIONS.md` § "When something
feels wrong" and your support contact.
