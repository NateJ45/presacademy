---
paths:
  - 'src/sanity/**'
  - 'src/lib/sanity*.ts'
  - 'src/lib/queries.ts'
  - 'src/lib/schemas.ts'
  - 'src/lib/siteSettings.ts'
  - 'scripts/**'
  - 'package.json'
  - 'sanity.config.ts'
  - 'sanity.cli.ts'
---

# Sanity code and scripts

## Gotcha #19 (Sanity UI imports)

<!-- prettier-ignore-start -->
19. **`@sanity/ui` v3 has no subpath exports beyond `./theme`.** `import { useToast } from '@sanity/ui/toast'` is v4-only syntax and fails `sanity schema extract` with "is not exported under the conditions". On v3, import it from the package root. v3 exports exactly: `.`, `./_visual-editing`, `./theme`, `./package.json`.
<!-- prettier-ignore-end -->

## Build pipeline

`npm run build` is: `node scripts/generate-og-pages.mjs` (per-page OG cards), then `astro build`. Pages fetch content from Sanity at build time via `sanityFetch`; with no Sanity project configured every query returns its fallback and the build still completes with empty-state pages. **Typegen is NOT part of this chain** (gotcha #2): run it yourself after schema edits, or use `npm run build:full`.

Standalone scripts:

- `npm run typegen` regenerates `src/lib/sanity.types.ts` from the schemas (committed, CI-guarded).
- `npm run og` regenerates `public/og-default.png` (after changing brand colors, tagline, or wordmark inputs in `scripts/generate-og-default.mjs`).
- There is no separate studio dev server or deploy: `npm run dev` serves the Studio at `/studio`, and deploying the site deploys the Studio. For CLI work (`sanity dataset`, `sanity cors`, typegen) run `npx sanity ...` from the repo root; `sanity.cli.ts` configures it.
- Content seeds, all **dry-run by default** (add `--apply` to write), all idempotent:
  - `node scripts/seed-academic-images.mjs` sets the home hero slideshow and fills empty course covers + page heroes with academic placeholders. Protects real editor images.
  - `node scripts/seed-page-copy.mjs` patches the built-in inline-fallback copy into any EMPTY home / about / get-started / faculty / `siteSettings.funder` field, so Studio mirrors the live site. Never clobbers an editor's copy.
  - `node scripts/seed-editability.mjs` is the full editability seed (2026-06-15): render-neutral, only-empty + `createIfNotExists`. Re-run safe.
  - `node scripts/sanity-audit.mjs` (also `/sanity-audit`) reports dataset ground truth.
