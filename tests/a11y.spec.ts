import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routes } from './routes';
import { settle } from './helpers';

// =============================================================================
// Accessibility (axe-core) — every route, WCAG 2.2 AA plus best-practice
// =============================================================================
// WCAG AA is a hard requirement, and Lighthouse's a11y gate is wired into CI.
// Lighthouse scores on axe's DEFAULT rules — which include best-practice
// checks (heading-order, landmark-unique, region, …) beyond the wcag2a/aa
// tags. So the run is tagged WCAG 2.0, 2.1 and 2.2 A/AA plus best-practice on
// ALL routes, which keeps it in step with the Lighthouse gate and makes the
// 2.2 rules (target-size, SC 2.5.8) run by name. axe leaves target-size off in a plain
// `analyze()`, so the old untagged run never checked it (found 2026-11-08, starter card 223).
// Never drop `best-practice` from the list. ~1s/page.

test.describe('Accessibility — no axe violations', () => {
  for (const route of routes) {
    test(`${route} passes axe`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      // Settle fonts + force the reveal/stagger/hero choreography to its end
      // state so axe audits the real, fully-rendered page — mid-transition
      // opacity produces false contrast results, and axe skips opacity-0
      // (not-yet-revealed) content entirely.
      await settle(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      expect(
        results.violations,
        results.violations.map((v) => `[${v.impact}] ${v.id}: ${v.help}`).join('\n'),
      ).toEqual([]);
    });
  }
});
