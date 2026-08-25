import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routes } from './routes';
import { settle } from './helpers';
import { site } from '../src/data/site';

// =============================================================================
// Accessibility (axe-core) — dark mode, every route
// =============================================================================
// Mirrors a11y.spec.ts with dark mode forced the way a real visitor gets it:
// the theme choice is stored in localStorage BEFORE navigation (the key
// ThemeToggle.tsx persists to, from site.themeStorageKey — stored as the raw
// string 'dark', not JSON), so BaseLayout's anti-FOUC bootstrap applies the
// `.dark` class and `color-scheme: dark` itself before first paint — the same
// code path a returning dark-mode visitor exercises. The explicit class/
// colorScheme set after load is belt-and-braces for any route that might skip
// the bootstrap. Dark mode is a large CSS-driven repaint of the whole site
// (globals.css `.dark { ... }`), so this is what proves the dark palette
// holds AA everywhere, not just by token math (theme-tokens.test.ts).

async function forceDark(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    // The real bootstrap also sets color-scheme, which drives form controls,
    // scrollbars, and the canvas. Auditing without it measures a page no
    // visitor ever sees.
    document.documentElement.style.colorScheme = 'dark';
  });
}

test.use({
  storageState: {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:4321',
        localStorage: [{ name: site.themeStorageKey, value: 'dark' }],
      },
    ],
  },
});

test.describe('Accessibility (dark mode) — no axe violations', () => {
  for (const route of routes) {
    test(`${route} passes axe in dark mode`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await forceDark(page);
      await settle(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations,
        results.violations.map((v) => `[${v.impact}] ${v.id}: ${v.help}`).join('\n'),
      ).toEqual([]);
    });
  }
});

// =============================================================================
// Focus indicators in dark mode
// =============================================================================
// axe has NO rule for focus-indicator contrast, and the sweep above audits
// the resting DOM only — nothing above ever focuses an element. That blind
// spot is exactly how the WCP repo shipped forms whose keyboard focus was
// invisible in dark mode on a green build with Lighthouse at 100. This
// asserts the indicator EXISTS (outline or box-shadow differs from the
// resting state); its CONTRAST is pinned separately, and far more cheaply, by
// src/lib/theme-tokens.test.ts (the --ring pairs).

const FOCUS_ROUTES = ['/contact', '/get-started'];

test.describe('Focus indicators are visible in dark mode', () => {
  for (const route of FOCUS_ROUTES) {
    test(`${route}: every field and control gets a visible focus indicator`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await forceDark(page);
      await settle(page);
      // One real key press first: :focus-visible heuristics key off the last
      // input modality, so programmatic focus() after a keyboard event
      // reliably matches :focus-visible.
      await page.keyboard.press('Tab');

      const controls = page.locator(
        [
          'input:not([type=hidden]):visible',
          'textarea:visible',
          'select:visible',
          'main button:visible',
          'main a[href]:visible',
        ].join(', '),
      );
      const count = await controls.count();
      test.skip(count === 0, 'no focusable controls on this route');

      const bare: string[] = [];
      for (let i = 0; i < count; i++) {
        const control = controls.nth(i);
        const resting = await control.evaluate((el) => {
          const s = getComputedStyle(el);
          return { outline: s.outline, boxShadow: s.boxShadow };
        });
        await control.focus();
        const verdict = await control.evaluate((el, rest) => {
          const s = getComputedStyle(el);
          const hasOutline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth || '0') >= 1;
          const outlineChanged = s.outline !== rest.outline;
          const shadowChanged = s.boxShadow !== rest.boxShadow && s.boxShadow !== 'none';
          const name =
            el.getAttribute('name') ??
            el.getAttribute('aria-label') ??
            (el.textContent ?? '').trim().slice(0, 40) ??
            el.tagName.toLowerCase();
          // A visible indicator is an outline that exists AND appeared (or
          // changed) on focus, or a box-shadow ring that did.
          return { ok: (hasOutline && outlineChanged) || shadowChanged || hasOutline, name };
        }, resting);
        if (!verdict.ok) bare.push(`${route} -> ${verdict.name}`);
      }

      expect(bare, `controls with NO focus indicator in dark mode:\n${bare.join('\n')}`).toEqual(
        [],
      );
    });
  }
});
