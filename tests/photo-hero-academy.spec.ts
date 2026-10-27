import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

// =============================================================================
// "Photo behind the words" on the Academy's inner pages (starter card 189, phase D)
// =============================================================================
// /style-guide/photo-hero/ draws the style with example data (no live page uses
// it until an editor picks it). The contrast promise itself is arithmetic, held
// by src/lib/photo-hero-academy.test.ts; this pins what a browser shows: white
// words in the band, the Academy's green shade, the short-facts card beside the
// words on a wide screen and under them on a phone, no sideways scroll at 320px,
// and no axe violations. The live pages' own heroes are held byte-identical by
// scripts/page-parity.mjs, and no page but this one carries a .ph- rule.
// =============================================================================

const PAGE = '/style-guide/photo-hero/';

test.describe('Photo hero (inner pages)', () => {
  test('draws the band, the words in white and the card', async ({ page }) => {
    await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
    const hero = page.locator('[data-fixture="photo-card"] [data-hero="photo"]');
    await expect(hero).toBeVisible();
    await expect(hero.locator('h1')).toHaveText('Example: learn the faith with others');
    const ink = await hero.locator('h1').evaluate((el) => getComputedStyle(el).color);
    expect(ink).toBe('rgb(255, 255, 255)');
    // The shade is the Academy's forest green, not the starter's ink.
    const scrim = await hero.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--photo-scrim').trim(),
    );
    expect(['#1f3227', 'var(--color-chapel-deep)']).toContain(scrim.toLowerCase());
    await expect(hero.locator('.ph-card')).toContainText('Example: open evening');
    await expect(
      page.locator('[data-fixture="photo-plain"] [data-hero="photo"] .ph-card'),
    ).toHaveCount(0);
    // The styles are written once, however many photo heroes the page has.
    const sheets = await page.evaluate(
      () =>
        [...document.querySelectorAll('style')].filter((s) => s.textContent?.includes('.ph-hero'))
          .length,
    );
    expect(sheets).toBe(1);
  });

  test('the card sits beside the words on a wide screen and under them on a phone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
    const hero = page.locator('[data-fixture="photo-card"]');
    const copy = (await hero.locator('.ph-copy').boundingBox())!;
    const card = (await hero.locator('.ph-card').boundingBox())!;
    expect(card.x).toBeGreaterThan(copy.x + copy.width - 1);

    await page.setViewportSize({ width: 375, height: 800 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    const copy2 = (await hero.locator('.ph-copy').boundingBox())!;
    const card2 = (await hero.locator('.ph-card').boundingBox())!;
    expect(card2.y).toBeGreaterThanOrEqual(copy2.y + copy2.height - 1);
  });

  test('no sideways scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 760 });
    await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(over).toBe(false);
  });

  test('passes axe', async ({ page }) => {
    await page.goto(PAGE, { waitUntil: 'load' });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});
