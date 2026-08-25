// Every FIXED public route on the site — the single source of truth for the
// Playwright sweeps (smoke, a11y light+dark, reflow). The suites serve the
// static `dist/client` build, so only routes that exist as build-time HTML
// belong here.
//
// Dynamic detail routes ([slug] pages — /courses/*, /faculty/*, /events/*,
// and the Sanity page-builder [slug].astro pages) are deliberately EXCLUDED:
// their paths are content-dependent, and a build without Sanity credentials
// (the CI empty-env build) emits none of them. Smoke has a runtime helper
// (`discoverDetailRoutes` in helpers.ts) that reads the built sitemap and
// pulls in up to one real course/faculty/event detail page when the local
// build has content; the other sweeps stay fixed-route only.
//
// Add a route here when a new fixed page ships in src/pages/.
export const routes = [
  '/',
  '/about',
  '/courses',
  '/faculty',
  '/events',
  '/pricing',
  '/for-you',
  '/get-started',
  '/resources',
  '/faq',
  '/contact',
  '/privacy',
  '/accessibility',
  '/style-guide',
  // The 404 page builds to a top-level 404.html file, not 404/index.html.
  // http-server has no not-found rewrite, so the file is addressed directly;
  // this also means the smoke test gets a genuine 200 for it.
  '/404.html',
];
