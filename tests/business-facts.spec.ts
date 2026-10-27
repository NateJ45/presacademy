import { test, expect } from './fixtures';

// =============================================================================
// Office hours and the map in a real browser (starter card 196, the Academy's copy)
// =============================================================================
// /style-guide/sections/ draws the Office hours and Map blocks with made-up
// facts: Monday to Thursday 9 to 4, Friday 9 to noon, and a closure ten days
// after the build. The browser's clock is fixed, so these pin what node --test
// cannot: the live "Open now" line on the site's time zone (America/New_York),
// today's row, and a past closure disappearing without a rebuild. The rules
// themselves are pinned in src/lib/business-hours.test.ts. The live pages show
// none of this until the office hours by day are filled in Site settings.
// =============================================================================

const box = (type: string) => `[data-thumb="${type}"]`;
const DAY = 86_400_000;

test.describe('Office hours and map blocks', () => {
  test('a Wednesday morning reads open until 4 pm, on the Monday to Thursday row', async ({
    page,
  }) => {
    // 16:00 UTC on Wednesday 15 January 2025 is 11 am in New York.
    await page.clock.setFixedTime(new Date('2025-01-15T16:00:00Z'));
    await page.goto('/style-guide/sections/', { waitUntil: 'domcontentloaded' });
    const hours = page.locator(box('hoursSection'));
    const status = hours.locator('[data-biz-status]');
    await expect(status).toHaveAttribute('data-open', 'true');
    await expect(status).toContainText('Open now');
    await expect(status).toContainText('until 4 pm');
    await expect(hours.locator('[data-biz-days="1,2,3,4"]')).toHaveAttribute('data-today', 'true');
    await expect(hours.getByText('Example: term break')).toBeVisible();
  });

  test('a Saturday afternoon names Monday as the next opening', async ({ page }) => {
    // 20:00 UTC on Saturday 18 January 2025 is 3 pm in New York.
    await page.clock.setFixedTime(new Date('2025-01-18T20:00:00Z'));
    await page.goto('/style-guide/sections/', { waitUntil: 'domcontentloaded' });
    const status = page.locator(`${box('hoursSection')} [data-biz-status]`);
    await expect(status).toHaveAttribute('data-open', 'false');
    await expect(status).toContainText('Closed now');
    await expect(status).toContainText('Opens Monday at 9 am');
  });

  test('a closure whose day has passed is gone without a rebuild', async ({ page }) => {
    await page.clock.setFixedTime(new Date(Date.now() + 20 * DAY));
    await page.goto('/style-guide/sections/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator(`${box('hoursSection')} [data-biz-changes]`)).toBeHidden();
  });

  test('the map card has the address and both directions links', async ({ page }) => {
    await page.goto('/style-guide/sections/', { waitUntil: 'domcontentloaded' });
    const map = page.locator(box('mapSection'));
    await expect(map.locator('address')).toContainText('100 Example Street');
    await expect(map.locator('address')).toContainText('Cincinnati, OH 45202');
    await expect(map.getByRole('link', { name: /Directions/ })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=100%20Example%20Street%2C%20Cincinnati%2C%20OH%2C%2045202',
    );
    await expect(map.getByRole('link', { name: /Apple Maps/ })).toHaveAttribute(
      'href',
      /^https:\/\/maps\.apple\.com\/\?q=100%20Example/,
    );
  });

  test('the contact card fills itself and tags the unconfirmed phone', async ({ page }) => {
    await page.goto('/style-guide/sections/', { waitUntil: 'domcontentloaded' });
    const card = page.locator(box('contactCardSection')).filter({ hasText: 'visit or call' });
    await expect(card).toContainText('(555) 555-0142');
    await expect(card.locator('[data-to-confirm]')).toHaveCount(1);
    await expect(card.locator('[data-biz-status]')).toHaveCount(1);
  });
});
