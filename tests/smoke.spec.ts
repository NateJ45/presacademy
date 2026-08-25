import { test, expect } from '@playwright/test';
import { routes } from './routes';
import { discoverDetailRoutes } from './helpers';
import { site } from '../src/data/site';

// =============================================================================
// Smoke — every route builds and renders (not a 404 / error page)
// =============================================================================
// The static server redirects /about -> /about/ (directory index); page.goto
// follows it, so the asserted status is the final 200. BaseLayout guarantees
// every document title carries the school name (it appends the brand suffix
// unless the title already contains it), so the title check proves a real
// rendered page rather than a blank or default-error body. site.name is
// imported (not hardcoded) so the rebrand script keeps this test correct.

test.describe('Smoke — every fixed route renders', () => {
  for (const route of routes) {
    test(`${route} returns 200 and renders`, async ({ page }) => {
      const resp = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(resp?.status(), `${route} HTTP status`).toBe(200);
      await expect(page).toHaveTitle(new RegExp(site.name));
    });
  }
});

// =============================================================================
// Smoke — dynamic detail pages, when the build has content
// =============================================================================
// Local builds run with real Sanity credentials, so /courses/[slug] etc. exist
// and are listed in the build's sitemap. Pull up to one real detail page per
// template out of it and prove it renders. The CI empty-env build emits no
// detail pages (and may emit a near-empty sitemap) — then this skips instead
// of failing, which is the honest result: there is nothing to test.

test.describe('Smoke — one real detail page per dynamic template', () => {
  test('discovered course/faculty/event detail pages render', async ({ page, request }) => {
    const details = await discoverDetailRoutes(request);
    test.skip(details.length === 0, 'build has no dynamic detail pages (no Sanity content)');
    for (const route of details) {
      const resp = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(resp?.status(), `${route} HTTP status`).toBe(200);
      await expect(page).toHaveTitle(new RegExp(site.name));
    }
  });
});
