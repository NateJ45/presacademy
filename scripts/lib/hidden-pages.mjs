// The build-time half of "Hide this page from search engines"
// (hideFromSearch, see src/sanity/schemaTypes/seo.ts).
//
// The <meta name="robots"> half is BaseLayout's job and happens per page. This
// is the other half: astro.config.mjs asks for the list once, before the build,
// and hands @astrojs/sitemap a filter that drops those routes from
// sitemap-index.xml. A hidden page stays live at its address; it just stops
// advertising itself.
//
// FAILING IS FINE. No Sanity project, no token, no network, a slow response:
// every one of those returns an empty list, which means "hide nothing" and the
// sitemap comes out exactly as it did before this file existed. The build must
// never fall over because a nice-to-have lookup did not answer.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// Same .env reader the OG scripts use: process env first, then a .env file.
function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(resolve(root, '.env'), 'utf-8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    /* .env is optional */
  }
  return env;
}

// Live route per singleton. MIRRORS SINGLETON_LIVE_PATHS in src/lib/nav-href.ts
// and pathForDoc in src/sanity/urls.ts — this file cannot import either (the
// Astro config is loaded before the TS pipeline is up), so keep the three in
// step when a route moves. The 404 page is left out: it is noindex already.
const SINGLETON_PATHS = {
  homePage: '/',
  aboutPage: '/about',
  faqPage: '/faq',
  contactPage: '/contact',
  privacyPage: '/privacy',
  accessibilityPage: '/accessibility',
  eventsPage: '/events',
  coursesPage: '/courses',
  facultyPage: '/faculty',
  pricingPage: '/pricing',
  getStartedPage: '/get-started',
  forYouPage: '/for-you',
  resourcesPage: '/resources',
};

const TYPES = [...Object.keys(SINGLETON_PATHS), 'page'];

const QUERY = `*[_type in $types && hideFromSearch == true && !(_id in path("drafts.**"))]{ _type, "slug": slug.current }`;

/**
 * The site-relative paths of every published page whose "Hide this page from
 * search engines" switch is on. Always resolves; never throws.
 *
 * @returns {Promise<string[]>} e.g. ['/pricing', '/thank-you']
 */
export async function fetchHiddenPagePaths() {
  const env = loadEnv();
  const projectId = env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
  const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
  // Anonymous reads of this dataset only surface the page singletons; the token
  // is what makes custom `page` documents visible. Same story as src/lib/sanity.ts.
  const token = env.SANITY_API_READ_TOKEN || env.SANITY_API_WRITE_TOKEN;

  if (!projectId || projectId === 'your-project-id') return [];

  // The CDN host is only usable without a token (Sanity rejects token + CDN).
  const host = token ? 'api.sanity.io' : 'apicdn.sanity.io';
  const url =
    `https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}` +
    `?query=${encodeURIComponent(QUERY)}` +
    `&$types=${encodeURIComponent(JSON.stringify(TYPES))}`;

  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { result } = await res.json();
    if (!Array.isArray(result)) return [];

    const paths = [];
    for (const doc of result) {
      const path =
        doc?._type === 'page' ? (doc.slug ? `/${doc.slug}` : null) : SINGLETON_PATHS[doc?._type];
      if (path) paths.push(path);
    }
    return paths;
  } catch (err) {
    console.warn(
      '[sitemap] could not read the hidden-page list from Sanity; nothing will be excluded.',
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}
