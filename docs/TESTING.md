# TESTING — which suite covers what

The map of the repo's automated checks. This is the **family test standard**:
every Astro site in the studio runs the same gates, with the same script
names, copied from the WCP site repo (the reference implementation).

## The suites

| Suite               | Command                                                             | Browser / runtime                                                  | Covers                                                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type check + lint   | `npm run check` (= `astro check && npm run lint`)                   | TypeScript via `@astrojs/check`, eslint                            | Every `.astro` / `.ts` / `.tsx` file type-checks (0 errors); eslint flat config in `eslint.config.js`                                                                                                             |
| Format check        | `npm run format:check` (fix with `npm run format`)                  | prettier + `prettier-plugin-astro` + `prettier-plugin-tailwindcss` | The whole repo is prettier-clean (`.prettierrc`, exclusions in `.prettierignore`)                                                                                                                                 |
| Unit tests          | `npm run test:unit`                                                 | Node's built-in test runner (`node --test`, type-stripped)         | Pure functions in `src/lib/*.test.ts`: sectionVisibility, slugify, utils, **theme-tokens** (see below)                                                                                                            |
| E2E: chromium       | `npm test` (= `playwright test`; `npm run test:ui`)                 | Desktop Chrome                                                     | ALL Playwright suites: smoke, axe a11y light + dark, dark-mode focus indicators, reflow at 320/768/1024/1440                                                                                                      |
| E2E: webkit-iphone  | same command (second project)                                       | Real WebKit, iPhone 14 profile                                     | The viewport-agnostic suites only: smoke + the light-mode axe sweep. Safari's engine finds layout/JS issues Chromium never will; reflow drives its own viewports, which conflicts with mobile emulation           |
| Visual regression   | `npm run test:visual`                                               | Desktop Chrome, reduced motion                                     | Full-page screenshots of `/style-guide` in light + dark against the committed Linux baselines in `tests/visual/__screenshots__/` (`playwright.visual.config.ts`). Baselines are generated in CI only; see below   |
| Internal links      | `npm run check:links` (after `npm run build`)                       | linkinator over `dist/client`                                      | Every internal link in the static build resolves. External URLs and the `/studio`, `/preview`, `/api` plumbing are skipped                                                                                        |
| Lighthouse CI       | `npx lhci autorun` (after `npm run build`)                          | Headless Chrome, mobile default                                    | Budgets on every fixed route per `lighthouserc.json`. **Accessibility is a hard error gate (minScore 1)**, LCP (4.5s) and CLS (0.1) are error gates; SEO / best-practices warn at 0.95, performance warns at 0.85 |
| CI                  | `.github/workflows/ci.yml` (push / PR / dispatch)                   | GitHub Actions                                                     | `build` job: typegen-staleness guard, astro check, lint, format check, unit tests, empty-env build (Studio included), link check. `test` job: the full Playwright run + the visual suite                          |
| Lighthouse workflow | `.github/workflows/lighthouse.yml` (main / staging / PR / dispatch) | GitHub Actions                                                     | The Lighthouse gate above, as its own workflow so every repo in the family matches. Runs on staging pushes too, so the budgets are proven before the fast-forward to main                                         |

## What the Playwright suites assert

All of them iterate `tests/routes.ts` — the single source of truth for the
fixed public routes. Add a route there when a new fixed page ships. Dynamic
`[slug]` detail routes are excluded from the fixed list (content-dependent;
the CI empty-env build emits none), but smoke discovers up to one real
course/faculty/event detail page from the built sitemap and tests it when the
local build has content (`discoverDetailRoutes` in `tests/helpers.ts`).

- **`tests/smoke.spec.ts`** — every route answers 200 (after the static
  server's `/about` → `/about/` redirect) and renders a real `<title>`
  carrying the school name (BaseLayout appends the brand suffix to every
  page, and `site.name` is imported so the rebrand script keeps the
  assertion true).
- **`tests/a11y.spec.ts`** — axe-core's **default** rule set on every route,
  zero violations. Deliberately NOT narrowed to `.withTags([...])`: the
  default set includes the best-practice rules Lighthouse also scores on,
  plus the one machine-checkable WCAG 2.2 AA rule (`target-size`).
- **`tests/a11y-dark.spec.ts`** — the same sweep with dark mode forced, plus
  a focus pass on `/contact` and `/get-started`: every visible form field and
  main-content control is focused and must show a visible indicator (outline
  or box-shadow that differs from rest). axe never focuses anything and has
  no focus-contrast rule — this pass covers that blind spot; the indicator's
  _contrast_ is pinned by `src/lib/theme-tokens.test.ts`.
- **`tests/reflow.spec.ts`** — WCAG 1.4.10: no horizontal overflow at a
  320px viewport, then a second sweep resizing through 1440/1024/768 without
  reload. Measured on `document.scrollingElement.scrollWidth` (+1px rounding
  tolerance) — note globals.css clips `overflow-x` on html/body, which hides
  a scrollbar from users but NOT from this measurement, so genuinely
  too-wide content still fails.

`tests/helpers.ts` exports `settle(page)`: waits for web fonts, then forces
the site's entire motion system to its end state (the `[data-reveal]` /
`[data-stagger-grid]` observers, `.hero-entry-stagger` + `.kinetic-words`
load choreography, `.img-curtain`, `.step-connector`, marquee/Ken Burns
loops). The injected CSS mirrors the `prefers-reduced-motion` block in
`src/styles/globals.css` — keep the two in sync when the motion vocabulary
grows. Without settling, axe sees half-faded text (false contrast results)
and _skips_ still-hidden opacity-0 content entirely.

## Visual regression (the style guide wall)

`tests/visual/styleguide.spec.ts` (own config: `playwright.visual.config.ts`)
takes one full-page screenshot of `/style-guide` per theme and diffs it
against `tests/visual/__screenshots__/` at a 1% pixel tolerance. The page
qualifies because it is fixture-driven: the token tables, type scale, and
example components are written into the page, not read from Sanity, so its
pixels move only when the design system moves. CMS-driven pages are never
screenshotted (they change with content and would flake).

Baselines are platform-sensitive (font rasterisation differs between Windows
and the Linux runners), so they are generated **in CI only** by
`.github/workflows/update-visual-baselines.yml` (manual dispatch), which
commits them with the Actions bot. A local Windows run diffs against Linux
truth and fails; that is expected, CI is the arbiter. When a red diff is an
INTENDED design change, look at the `visual-diffs` artifact first, then
dispatch the baselines workflow on the branch, then dispatch CI by hand (bot
pushes never trigger workflows).

## The Presentation drift gate

`src/lib/sanity-resolve.test.ts` reads SOURCE TEXT (never imports the Studio
modules) and pins the facts `src/sanity/resolve.ts` and `src/sanity/locations.ts`
assume about the rest of the repo. It exists because a GROQ filter string is not
type-checked against the schema: a filter naming a field that does not exist
fails **silently**, and Presentation simply stops following the preview. The
gate holds four things: `page.slug` is Sanity's `slug` type here (so the filters
keep `.current`, deliberately the opposite of the WCP repo, where `page.slug` is
a plain string that must hold slashes), the singleton routes are generated from
one map and the `:slug` catch-all comes last, the "Used on" query looks in BOTH
page-builder array names and excludes drafts and trashed pages, and every section
type the "Used on" resolver watches for still exists in `blocks.ts`.

## The theme-token unit test

`src/lib/theme-tokens.test.ts` (with the WCAG math in `src/lib/contrast.ts`)
parses the REAL token values out of `src/styles/globals.css` — the `@theme`
blocks plus the `:root` / `.dark` semantic maps, following `var()` aliases —
and asserts AA (4.5:1 text, 3:1 UI/focus) for the load-bearing pairs in BOTH
themes: body/muted/card text, links, gold-ink text, the status pill, button
text on the static primary fill, the chapel band, and the `--ring` focus
indicator against page and card. It runs in milliseconds under `npm test`,
which is what lets it catch a palette edit at authoring time — the class of
dark-mode bug (invisible focus ring, sub-3:1 border) that axe, Lighthouse,
and the resting-DOM sweeps can never see.

Known documented shortfall: the resting `--input` field border measures
~1.21:1 (light) and ~1.58:1 (dark composite) against the page — under the
3:1 SC 1.4.11 UI threshold. Fields stay identifiable via labels/fill and the
focused state gets the fully-passing ring, so the test pins the TRUE current
floors with a TODO instead of failing; raising the floors to 3:1 requires
darkening `--input` in both themes first.

## How parity verification works

`scripts/page-parity.mjs` guards the page-builder conversion's core promise:
the 13 singleton pages must render byte-identical HTML before and after their
markup moves into Sanity section types. It has two modes, and **neither one
builds** (the caller builds; both read an existing `dist/client` and warn if
that build is over an hour old):

```powershell
npm run build
node scripts/page-parity.mjs capture            # snapshot all 13 pages
# ...convert a page, then rebuild...
npm run build
node scripts/page-parity.mjs compare            # PASS/DIFF per page, exit 1 on any diff
node scripts/page-parity.mjs compare privacy    # one page only
```

Before diffing, each page's HTML is normalized so two identical rebuilds match
exactly: `/_astro/` asset content hashes collapse to `.HASH.`, Astro's
generated scoped-style ids collapse to `astro-cid-CID`, and whitespace
_between_ tags plus trailing whitespace is dropped. Everything else (text,
classes, ids, aria, inline styles, JSON-LD) stays byte-faithful, because that
is exactly what must not drift. The script header explains each rule.

Baselines live in `scripts/.parity/*.html` and **are committed**: git history
is the record of when a baseline legitimately moved. Re-capture only when you
mean to move it, and say so in the commit message. Verified 2026-08-26: a
capture followed by a clean rebuild reports 13/13 PASS, and an injected
one-attribute change is caught with a unified diff.

## Gotchas (each cost real time)

- **On Windows the build needs wrangler's workerd, not the plugin's — this is
  now automatic.** Since the Astro 7 + @astrojs/cloudflare 14 upgrade
  (2026-08-25), the build prerenders through @cloudflare/vite-plugin's
  miniflare, whose pinned workerd 1.20260526.1 aborts on startup here
  (`std::terminate() called with no exception`, surfaced as
  `MiniflareCoreError ERR_RUNTIME_FAILURE` right after "prerendering static
  routes"). It is NOT shell-dependent (Git Bash and PowerShell fail alike)
  and not config-dependent (minimal miniflare configs with the same binary
  work; only the full prerender config crashes). The workerd nested under
  wrangler, 1.20260825.1, runs the identical config fine.

  `npm run build` now routes through `scripts/with-workerd.mjs`, which points
  `MINIFLARE_WORKERD_PATH` at wrangler's binary on win32 when the caller has
  not set one. So `npm run build`, `npm run deploy`, and `npx playwright test`
  all just work with no manual env setup. (This bit a real deploy on
  2026-08-26: the workaround was documented but not wired into the build, so
  `npm run deploy` died at prerender.) `playwright.config.ts` keeps its own
  copy of the same logic. Linux CI is unaffected and stays on the stock
  binary. Delete the wrapper when @astrojs/cloudflare bumps its
  miniflare/workerd.

- **Anything stale holding :4321 silently invalidates the e2e run.** The
  Playwright webServer has `reuseExistingServer` locally, so an orphaned
  server (a forgotten `wrangler dev`/`npm run preview`, an old http-server,
  or a SIBLING project's test server: on 2026-09-05 a whole run passed axe
  against another site's pages) becomes the test target and every result is
  meaningless. Check with `netstat -ano | findstr :4321` before trusting a
  surprising local run. When the port belongs to someone else, move the run
  instead of killing it: `$env:PLAYWRIGHT_PORT = 4399; npm test` (both
  Playwright configs and the dark-mode storage origin honor it; CI never
  sets it). Relatedly, a running `wrangler dev` holds a lock on
  `dist/client` and used to make the build fail with EPERM while emptying
  `dist`. **This is now handled automatically**: the `prebuild` hook runs
  `scripts/free-dist.mjs`, which stops any node/workerd process whose command
  line mentions BOTH this project's directory AND a dev server
  (wrangler/miniflare/http-server/astro preview), printing the PIDs it kills.
  Windows-only; a no-op on Linux CI. If you ever need to do it by hand,
  remember: **killing `workerd.exe` alone is NOT enough** — the parent
  `wrangler`/node process keeps the handle (and can respawn the child), so
  the lock survives and the next build still fails. Find and kill the whole
  set by command line:

  ```powershell
  Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='workerd.exe'" |
    Where-Object { $_.CommandLine -match 'wrangler|miniflare|http-server|sanity' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
  ```

  Never blanket-kill `node.exe`: the editor/agent session is itself node.

- **Static-server trailing slashes.** `http-server` (the e2e server) serves
  `/about` via a redirect to `/about/` — tests follow it and assert the final 200. It has NO clean-URL mapping, so the 404 page is addressed as
  `/404.html` in `tests/routes.ts`. Lighthouse serves `dist/client` itself
  (`staticDistDir`) and addresses files directly, so `lighthouserc.json`
  lists `/about/index.html` and `/404.html`.
- **`check:links` must skip by `127.0.0.1`, not `localhost`.** linkinator
  serves `dist/client` on `http://127.0.0.1:<port>`, so a skip pattern of
  `^(?!http://localhost)` (the WCP script) skips the root page itself and
  reports "Successfully scanned 0 links": green, and checking nothing. This
  repo's script skips `^https?://(?!127\.0\.0\.1)` and scans ~40 internal
  links on the empty-env build; if the count ever reads 0, the check is
  broken, not the site.
- **Dark mode in tests = the visitor path, not a hack.** The theme choice
  lives in localStorage under `site.themeStorageKey` (raw string `'dark'`,
  not JSON — see `ThemeToggle.tsx`). `a11y-dark.spec.ts` pre-seeds it via
  `test.use({ storageState })`, so BaseLayout's anti-FOUC bootstrap applies
  `.dark` + `color-scheme: dark` before first paint, exactly like a returning
  dark-mode visitor; the explicit class-add after load is belt-and-braces.
- **Windows-only: local `lhci autorun` dies with an EPERM temp-cleanup crash.**
  chrome-launcher's `destroyTmp` `rmSync` hits a Defender lock on the
  `%TEMP%\lighthouse.*` profile dir and the whole run aborts after the FIRST
  URL (no report saved — worse than the "exit 1 but audits passed" variant).
  Verified fix on this machine (2026-08-25): wrap that `rmSync` in a
  try/catch in chrome-launcher's `dist/chrome-launcher.js` (since
  2026-09-05 `@lhci/cli` is a devDependency, so the copy to patch is under
  `node_modules/`, not the npx cache) — after which all 15 URLs audit and
  assertions run to completion. An `npm ci` (or lhci version bump) brings
  the crash back; re-apply the same one-liner. Linux CI is the real
  Lighthouse gate and is unaffected.
- **CI runs the e2e suite with no Sanity credentials on purpose** (empty
  `PUBLIC_SANITY_PROJECT_ID` → `sanityFetch()` fallbacks): every fixed route
  still renders, and the dynamic-detail smoke test skips itself when the
  sitemap lists no detail pages. Locally, the real `.env` makes the build
  full-fat and the detail test run.
