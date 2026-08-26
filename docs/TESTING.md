# TESTING — which suite covers what

The map of the repo's automated checks. The pattern (and most of the test
code) is ported from the WCP site repo's safety net.

## The suites

| Suite | Command | Browser / runtime | Covers |
|---|---|---|---|
| Unit tests | `npm test` | Node's built-in test runner (`node --test`, type-stripped) | Pure functions in `src/lib/*.test.ts`: sectionVisibility, slugify, utils, **theme-tokens** (see below) |
| E2E — chromium | `npm run test:e2e` (or `npx playwright test`) | Desktop Chrome | ALL Playwright suites: smoke, axe a11y light + dark, dark-mode focus indicators, reflow at 320/768/1024/1440 |
| E2E — webkit-iphone | same command (second project) | Real WebKit, iPhone 14 profile | The viewport-agnostic suites only: smoke + the light-mode axe sweep. Safari's engine finds layout/JS issues Chromium never will; reflow drives its own viewports, which conflicts with mobile emulation |
| Lighthouse CI | `npx --yes @lhci/cli@0.14.x autorun` (after `npm run build`) | Headless Chrome, desktop preset | Category budgets on every fixed route per `lighthouserc.json`. **Accessibility is a hard error gate (minScore 1)**; SEO / best-practices warn at 0.95, performance warns at 0.85 |
| CI guards | on push / PR (`.github/workflows/ci.yml`) | GitHub Actions | typegen-staleness guard, lint, empty-env Astro build, Studio build, unit tests, the full Playwright run, and the Lighthouse gate |

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
  *contrast* is pinned by `src/lib/theme-tokens.test.ts`.
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
and *skips* still-hidden opacity-0 content entirely.

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
  server (a forgotten `wrangler dev`/`npm run preview`, an old http-server)
  becomes the test target and every result is meaningless. Check with
  `netstat -ano | findstr :4321` and `taskkill /F /PID <pid>` before trusting
  a surprising local run. Relatedly, a running `wrangler dev` holds a lock on
  `dist/client` and makes the build itself fail with EPERM while emptying
  `dist` — kill it first.
- **Static-server trailing slashes.** `http-server` (the e2e server) serves
  `/about` via a redirect to `/about/` — tests follow it and assert the final
  200. It has NO clean-URL mapping, so the 404 page is addressed as
  `/404.html` in `tests/routes.ts`. `serve` (the Lighthouse server) DOES
  clean-map `/404` → `404.html`, so `lighthouserc.json` uses `/404`.
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
  try/catch inside the npx cache copy
  (`%LOCALAPPDATA%\npm-cache\_npx\<hash>\node_modules\lighthouse\node_modules\chrome-launcher\dist\chrome-launcher.js`)
  — after which all 15 URLs audit and assertions run to completion. The
  patch lives in the npm cache, so a cache eviction (or lhci version bump)
  brings the crash back; re-apply the same one-liner. Linux CI is the real
  Lighthouse gate and is unaffected.
- **CI runs the e2e suite with no Sanity credentials on purpose** (empty
  `PUBLIC_SANITY_PROJECT_ID` → `sanityFetch()` fallbacks): every fixed route
  still renders, and the dynamic-detail smoke test skips itself when the
  sitemap lists no detail pages. Locally, the real `.env` makes the build
  full-fat and the detail test run.
