import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// =============================================================================
// Playwright config: the automated QA safety net (family standard, same shape
// as the WCP repo's playwright.config.ts)
// =============================================================================
// Tests run against the REAL production build (dist/client) served statically
// with http-server, not `astro dev`: the dev server can serve error pages a
// naive check would read as "fine", and a fresh build + no-cache serve each
// run avoids stale-CSS false results. Locally the build reads the real .env
// Sanity credentials, so dynamic detail pages exist; in CI it runs the
// empty-env fallback build, which still renders every fixed route.
// =============================================================================

// PLAYWRIGHT_PORT moves the whole run off :4321 for a LOCAL session when a
// sibling project already holds that port (found 2026-09-05: with
// reuseExistingServer on, another site's server on :4321 silently became the
// test target and every result was about the wrong site). CI never sets it.
const PORT = Number(process.env.PLAYWRIGHT_PORT) || 4321;
const baseURL = `http://localhost:${PORT}`;

// ---------------------------------------------------------------------------
// workerd workaround (found 2026-08-25, Windows): the workerd binary pinned by
// the build's miniflare aborts on startup ("std::terminate() called with no
// exception" -> MiniflareCoreError ERR_RUNTIME_FAILURE) when the
// @cloudflare/vite-plugin prerenders the site during `npm run build` on this
// machine. The newer workerd that ships nested under wrangler starts fine with
// the identical config. Miniflare honors MINIFLARE_WORKERD_PATH, so when that
// newer platform binary exists, point the webServer's build at it. Remove once
// @astrojs/cloudflare's miniflare catches up. (Standalone `npm run build`
// routes through scripts/with-workerd.mjs for the same reason; see
// docs/TESTING.md.)
// ---------------------------------------------------------------------------
const nestedWorkerd = join(
  import.meta.dirname,
  'node_modules/wrangler/node_modules/@cloudflare',
  `workerd-${{ win32: 'windows', darwin: 'darwin', linux: 'linux' }[process.platform as string] ?? process.platform}-64`,
  'bin',
  process.platform === 'win32' ? 'workerd.exe' : 'workerd',
);
const workerdEnv: Record<string, string> =
  !process.env.MINIFLARE_WORKERD_PATH && existsSync(nestedWorkerd)
    ? { MINIFLARE_WORKERD_PATH: nestedWorkerd }
    : {};

export default defineConfig({
  testDir: './tests',
  // tests/visual/ belongs to playwright.visual.config.ts: run here, its spec
  // loses its snapshot path and reduced-motion setup and fails with
  // "snapshot doesn't exist".
  testIgnore: [/visual[\\/].*\.spec\.ts$/],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  // Chromium runs everything. A real WebKit iPhone profile runs the
  // viewport-agnostic suites (smoke + the light-mode axe sweep): Safari's
  // engine finds layout/JS issues Chromium never will, and reflow drives its
  // own viewport sizes, which conflicts with mobile emulation. (The regex
  // matches a11y.spec.ts but NOT a11y-dark.spec.ts: the dark sweep and its
  // focus pass are Chromium-only, same as WCP.)
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'webkit-iphone',
      use: { ...devices['iPhone 14'] },
      testMatch: /(smoke|a11y)\.spec\.ts$/,
    },
  ],
  webServer: {
    command:
      PORT === 4321
        ? 'npm run build && npm run serve:dist'
        : `npm run build && npx http-server dist/client -p ${PORT} -s -c-1 --silent`,
    url: baseURL,
    // Locally, reuse a server you started yourself, but beware: anything
    // stale already holding :4321 (an orphaned `astro dev`) silently becomes
    // the test target and invalidates every result. Check the port before
    // trusting a surprising local run. CI always builds fresh.
    reuseExistingServer: !process.env.CI,
    // The empty-env build completes in about 20s locally; 120s is the family
    // standard and leaves room for a cold CI runner.
    timeout: 120_000,
    env: {
      ...(process.env as Record<string, string>),
      ...workerdEnv,
    },
  },
});
