import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routes } from './routes';
import { settle } from './helpers';

// =============================================================================
// Accessibility (axe-core) — every route, default rule set
// =============================================================================
// WCAG AA is a hard requirement, and Lighthouse's a11y gate is wired into CI.
// Lighthouse scores on axe's DEFAULT rules — which include best-practice
// checks (heading-order, landmark-unique, region, …) beyond the wcag2a/aa
// tags. So we run the default rule set on ALL routes to stay in sync with
// (and slightly ahead of) the Lighthouse gate. Do NOT narrow this to
// `.withTags([...])`: that would DROP the best-practice coverage plus the one
// machine-checkable WCAG 2.2 AA rule the default set carries (`target-size`,
// SC 2.5.8). ~1s/page.

test.describe('Accessibility — no axe violations', () => {
  for (const route of routes) {
    test(`${route} passes axe`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      // Settle fonts + force the reveal/stagger/hero choreography to its end
      // state so axe audits the real, fully-rendered page — mid-transition
      // opacity produces false contrast results, and axe skips opacity-0
      // (not-yet-revealed) content entirely.
      await settle(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations,
        results.violations.map((v) => `[${v.impact}] ${v.id}: ${v.help}`).join('\n'),
      ).toEqual([]);
    });
  }
});
