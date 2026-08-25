import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// =============================================================================
// Playwright config — the automated QA safety net (ported from the WCP repo)
// =============================================================================
// Tests run against the REAL production build (dist/client) served statically
// with http-server, not `astro dev` — the dev server can serve error pages a
// naive check would read as "fine", and a fresh build + no-cache serve each
// run avoids stale-CSS false results. Locally the build reads the real .env
// Sanity credentials, so dynamic detail pages exist; in CI it runs the
// empty-env fallback build, which still renders every fixed route.
// =============================================================================

const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

// ---------------------------------------------------------------------------
// workerd workaround (found 2026-08-25, Windows): the workerd binary pinned by
// the build's miniflare (1.20260526.1) aborts on startup ("std::terminate()
// called with no exception" -> MiniflareCoreError ERR_RUNTIME_FAILURE) when
// the @cloudflare/vite-plugin prerenders the site during `npm run build` on
// this machine. The newer workerd that ships nested under wrangler
// (1.20260825.1) starts fine with the identical config. Miniflare honors
// MINIFLARE_WORKERD_PATH, so when that newer platform binary exists, point
// the webServer's build at it. Remove once @astrojs/cloudflare's miniflare
// catches up. (Standalone `npm run build` needs the same env var — see
// docs/TESTING.md.)
// ---------------------------------------------------------------------------
const nestedWorkerd = join(
  import.meta.dirname,
  'node_modules/wrangler/node_modules/@cloudflare',
  `workerd-${{ win32: 'windows', darwin: 'darwin', linux: 'linux' }[process.platform as string] ?? process.platform}-64`,
  'bin',
  process.platform === 'win32' ? 'workerd.exe' : 'workerd',
);
const workerdEnv =
  !process.env.MINIFLARE_WORKERD_PATH && existsSync(nestedWorkerd)
    ? { MINIFLARE_WORKERD_PATH: nestedWorkerd }
    : {};

export default defineConfig({
  testDir: './tests',
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
  // matches a11y.spec.ts but NOT a11y-dark.spec.ts — the dark sweep and its
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
    command: 'npm run build && npm run serve:dist',
    port: PORT,
    // Locally, reuse a server you started yourself — but beware: anything
    // stale already holding :4321 (an orphaned `astro dev`) silently becomes
    // the test target and invalidates every result. Check the port before
    // trusting a surprising local run. CI always builds fresh.
    reuseExistingServer: !process.env.CI,
    // The build renders the whole site (Sanity reads + sharp image work);
    // give it real headroom.
    timeout: 300_000,
    env: {
      ...(process.env as Record<string, string>),
      ...workerdEnv,
    },
  },
});
