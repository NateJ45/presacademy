/* ============================================================================
   Visual regression: the style guide wall (see playwright.visual.config.ts)
   ============================================================================
   /style-guide renders the whole design system from FIXED data (the token
   tables, type scale, and example components are written into the page, not
   read from Sanity), so its pixels move only when the design system moves.
   One full-page shot per theme. Baselines live in
   tests/visual/__screenshots__/ and are generated in CI
   (update-visual-baselines.yml), never from a Windows machine.
   ============================================================================ */
import { test, expect, type Page } from '@playwright/test';
import { site } from '../../src/data/site';

// The main suites' settle(): let fonts, layout, and late paints finish so the
// shot is deterministic. Reduced motion (config) keeps reveals at rest.
async function settle(page: Page) {
  await page.goto('/style-guide/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

test('style guide, light', async ({ page }) => {
  await settle(page);
  await expect(page).toHaveScreenshot('style-guide-light.png', { fullPage: true });
});

test('style guide, dark', async ({ page }) => {
  // Dark mode is CLASS-driven (localStorage under site.themeStorageKey, the
  // raw string 'dark', applied by BaseLayout's head script before first
  // paint), not media-driven, so emulateMedia does nothing here. Seeding the
  // site's own storage key uses the real mechanism, so the screenshot can
  // never catch a light flash.
  await page.addInitScript((key) => {
    localStorage.setItem(key, 'dark');
  }, site.themeStorageKey);
  await settle(page);
  await expect(page).toHaveScreenshot('style-guide-dark.png', { fullPage: true });
});
