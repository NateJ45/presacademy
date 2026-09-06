/* ============================================================================
   Visual-regression config, SEPARATE from the main suite on purpose
   (family standard, same shape as the WCP repo's playwright.visual.config.ts)
   ============================================================================
   Screenshot baselines are platform-sensitive (font rasterisation differs
   between Windows and the Linux CI runners), so baselines are generated IN CI
   by .github/workflows/update-visual-baselines.yml and committed under
   tests/visual/__screenshots__/. A local run on Windows will diff against
   Linux baselines and fail; that is expected. Treat CI as the arbiter, same
   as the a11y sweeps. Regenerate baselines (workflow_dispatch) only when a
   visual change is INTENDED, in the same change that causes it.
   ============================================================================ */
import { defineConfig, devices } from '@playwright/test';

// Same port rule as playwright.config.ts (PLAYWRIGHT_PORT override for a
// local session whose :4321 is held by a sibling project).
const PORT = Number(process.env.PLAYWRIGHT_PORT) || 4321;

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? ([['github'], ['list']] as const) : ([['list']] as const),
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      // Loose enough to ignore antialiasing shimmer, tight enough that a
      // moved band, a lost swatch, or a colour shift trips it.
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Reduced motion freezes the reveal/scroll systems: content renders in
    // its resting state, which is exactly what a stable screenshot needs.
    // (A browser-context option, so it lives under contextOptions; at the
    // top level of `use` it is a type error and silently does nothing.)
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      PORT === 4321
        ? 'npm run build && npm run serve:dist'
        : `npm run build && npx http-server dist/client -p ${PORT} -s -c-1 --silent`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
