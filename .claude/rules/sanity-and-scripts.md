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
  - `npm run audit:data` (`scripts/audit-data-vs-schema.mjs`, PORTABLE, starter card 95) walks every stored value against the compiled schema: array items with no `_type` or `_key`, orphan fields (data with no schema field, the "Unknown fields" banner), wrong kinds, unknown document types. Read only, exit 1 on any finding. `scripts/backfill-array-types.mjs` adds a missing `_type` (through `sanity-lib`, so dry by default).

## Every write: dry by default, and a second factor on production

Added 2026-10-13 (starter PORTS.md card 86). Wording matches the starter's `.claude/rules/data-scripts.md`.

- **A script that writes is dry by default.** Build it on `scripts/lib/sanity-lib.mjs` (`apply()` and `done()`), which prints the plan and writes nothing unless the run carries `--apply`. A script that cannot use it gives itself the same gate: call `guardProductionWrite({ apply: APPLY, dataset })` from `scripts/lib/production-guard.mjs` before any request (`fix-missing-keys`, `seed-academic-images`, `seed-editability`, `seed-live-singletons`, `seed-page-copy`, `seed-school-content` and `sanity-apply-asset-patches` do). `publish-due.mjs` (the scheduled publisher, run with `--apply` by its workflow) and `restore-dataset.mjs` (its own `--i-understand-this-overwrites-production` flag) are PORTABLE and keep the starter's gates.
- **On the `production` dataset `--apply` is not enough.** The run also needs `NCS_PRODUCTION_WRITE=yes` in the process environment: `NCS_PRODUCTION_WRITE=yes node scripts/x.mjs --apply` (PowerShell: `$env:NCS_PRODUCTION_WRITE='yes'; node scripts/x.mjs --apply; Remove-Item Env:NCS_PRODUCTION_WRITE`). It is read from `process.env` directly, never from `.env`, so it cannot be set once and forgotten. A delegated agent may set it, but only under the write protocol, in this order: back up first (`sanity dataset export production <file> --raw`, saved outside the repo), do a dry run and read its output, run the write with `--apply` plus the variable set in the same command, then verify. The variable never goes in `.env`, a shell profile or a scheduled CI job. This site has only the `production` dataset, so in practice every write needs it.
- **Test a guard against a dummy host, never against what it guards.** Point the client at `SANITY_API_HOST=https://example.invalid` with a fake project and token (as `scripts/lib/sanity-lib.test.mjs` and `scripts/lib/production-guard.test.mjs` do; `npm run test:scripts`, part of `npm run test:unit`), or unit-test the pure check. Running the real write command to "see if the guard stops it" is how a guard gets tested on production.
- **Never put text containing backticks or `$(...)` inside a shell string** (`node -e "..."`, `echo "..."`, a heredoc with an unquoted delimiter). The shell runs what is inside as a command substitution: on 2026-10-04 a markdown plan written through `node -e` quoted a content-load command in backticks, and bash ran it against production. Write such text with the file-writing tool (Write/Edit), then run a script file. Git Bash heredocs also drop backslashes, which is a second reason to write scripts to a file first.
- **Array objects need `_type` and `_key`** in anything a script writes, and `npm run audit:data` checks the result (PORTS.md card 95).
