# TESTING — which suite covers what

The map of the repo's automated checks. Pattern borrowed from the WCP
site repo. (Stub created 2026-08-25; the Playwright + axe suite is being
ported in the same work wave and this file is filled in with it.)

| Suite | Command | Covers |
|---|---|---|
| Unit tests | `npm test` | `src/lib/*.test.ts` via Node's built-in test runner (sectionVisibility, slugify, utils) |
| Lighthouse CI | `npx lhci autorun` | Perf/a11y/SEO/best-practices budgets per `lighthouserc.json` |
| CI (GitHub Actions) | on push/PR | typegen-staleness guard, lint, empty-env build, studio build, unit tests |
