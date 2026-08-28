// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { fetchHiddenPagePaths } from './scripts/lib/hidden-pages.mjs';
import { fetchRedirectDocs } from './scripts/lib/redirects.mjs';
import { buildRedirectMap } from './src/lib/redirects.ts';

// Pages an editor switched "Hide this page from search engines" on, as
// site-relative paths. Read once, here, because @astrojs/sitemap's filter is
// synchronous. The lookup never throws: with no project, no token or no
// network it returns [] and the sitemap is exactly what it always was.
const hiddenPagePaths = await fetchHiddenPagePaths();

// Editor-managed redirects. Each published `redirect` document becomes one
// entry in Astro's `redirects` map below, which the Cloudflare adapter emits as
// a real 301/302. Most entries are filed automatically when a page's web
// address changes on publish (src/sanity/components/slugRedirect.tsx); the
// shaping rules live in src/lib/redirects.ts, so the Studio and the build agree
// on what a path is. Fail-open to none, same as the hidden-page lookup above.
const cmsRedirects = buildRedirectMap(await fetchRedirectDocs());

// https://astro.build/config
export default defineConfig({
  // REPLACE before launch (rebrand.mjs stamps this): the canonical production URL.
  site: 'https://www.presbyterianacademy.org',
  output: 'static',
  // No sessions anywhere on this site (there is no gated area or login), so
  // opt out. Left on, @astrojs/cloudflare auto-declares a "SESSION" KV binding
  // in the generated dist/server/wrangler.json, and a KV binding with no
  // namespace id fails the deploy.
  session: false,
  // `imageService: 'compile'` tells @astrojs/cloudflare to process images
  // with Sharp at build time and ship plain static files — no Cloudflare
  // Images runtime, no per-transform fees, no Workers binding required.
  // The adapter's default would otherwise wire up the IMAGES binding which
  // is meant for SSR sites that want on-demand transforms (we don't).
  adapter: cloudflare({ imageService: 'compile' }),
  // Old address -> new address forwards, managed by the editor in the Studio
  // and read at build time above. A repo that also needs hand-written launch
  // redirects puts them BEFORE the spread, so an editor entry can correct one
  // without a code change.
  redirects: { ...cmsRedirects },
  // The /style-guide route is an internal brand reference: kept out of the
  // sitemap (and noindex'd in BaseLayout) so it stays unlinked and unindexed.
  integrations: [
    // Embedded Sanity Studio at /studio (the ONE studio — the old hosted
    // *.sanity.studio deploy is retired; an embedded studio rebuilds with
    // every deploy so it can never drift stale). The config it loads is the
    // root sanity.config.ts, which re-exports studio/sanity.config.ts.
    // The project id is public by design (it ships in every client bundle).
    sanity({
      projectId: 'uz2sl3zp',
      dataset: 'production',
      useCdn: false,
      studioBasePath: '/studio',
    }),
    sitemap({
      // /preview and /studio are Studio plumbing (SSR/noindex) — mostly
      // excluded already because the sitemap only walks prerendered routes,
      // but the filter makes it explicit and future-proof.
      //
      // The last clause is the editor's own switch: a page with
      // "Hide this page from search engines" turned on drops out here as well
      // as carrying a noindex tag. `page` arrives as a full URL, so compare on
      // the pathname with any trailing slash trimmed.
      filter: (page) => {
        if (
          page.includes('/404') ||
          page.includes('/style-guide') ||
          page.includes('/preview') ||
          page.includes('/studio')
        ) {
          return false;
        }
        if (hiddenPagePaths.length === 0) return true;
        let pathname;
        try {
          pathname = new URL(page).pathname;
        } catch {
          pathname = page;
        }
        const trimmed = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
        return !hiddenPagePaths.includes(trimmed);
      },
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    // @sanity/ui ships an ESM build that Vite's dependency pre-bundler
    // mis-scans on this stack (MISSING_EXPORT errors for styled-components).
    // Excluding it from pre-bundling matches the WCP repo's working config;
    // it is still bundled correctly by `astro build`.
    //
    // Deliberately NO custom chunking here. An `advancedChunks` group that
    // forced styled-components + @sanity/ui into one chunk was tried on
    // 2026-08-26 (chasing a theming crash) and made things worse: merging
    // those modules changes evaluation order and broke @sanity/ui's theme
    // initialization, surfacing as
    //   TypeError: Cannot read properties of undefined (reading 'v2')
    // from inside styled-components' generateAndInjectStyles. Leave the
    // bundler's default chunking alone.
    optimizeDeps: {
      exclude: ['@sanity/ui', 'styled-components'],
    },
    // -------------------------------------------------------------------------
    // ONE module instance per package — the fix for the signed-in Studio crash
    // -------------------------------------------------------------------------
    // The studio is a NESTED npm package (studio/ has its own node_modules).
    // The embedded /studio therefore mixes two resolution roots: the Studio
    // shell (@sanity/astro) imports sanity/styled-components from the ROOT
    // node_modules, while every file under studio/ (structure, custom panes,
    // actions) resolves them from studio/node_modules — same versions, two
    // module instances, two React contexts. The ThemeProvider mounted by one
    // styled-components is invisible to useTheme in the other, so the desk
    // died on first render of our custom components (styled-components error
    // #18, then `Cannot read properties of undefined (reading 'v2')`) while
    // the login screen — core code only — rendered fine. WCP never hits this
    // because its studio lives in the same package as the site.
    //
    // @sanity/icons is deliberately NOT here: sanity core wants v5 while
    // @sanity/ui v3 wants v3.8, and icons are stateless SVG components with no
    // React context, so two instances are harmless. Deduping them broke the
    // build (CogIcon is gone in v5).
    // dedupe forces every import of these packages to the root copy, whatever
    // directory the importing file sits in. Verify after any dependency work:
    //   grep -l "errors.md#" dist/client/_astro/*.js   # must list ONE file
    resolve: {
      dedupe: [
        'react',
        'react-dom',
        'react-is',
        'styled-components',
        '@sanity/ui',
        '@sanity/client',
        'sanity',
        'rxjs',
      ],
    },
  },
  // NOTE: A previous attempt at `security.csp` shipped a hash-based CSP
  // meta tag. It got past Lighthouse's csp-xss check on paper, but Astro
  // missed at least one runtime-generated inline script (probably from
  // ClientRouter view-transitions) and one inline style, which the browser
  // then blocked — breaking theme bootstrap and various islands. The
  // current `public/_headers` carries a `frame-ancestors` CSP for the
  // Sanity iframe-pane preview, which is enough for the actual security
  // surface. Re-enabling a full CSP needs an audit of every inline script
  // (incl. ClientRouter's runtime scripts), or a switch to a nonce-based
  // SSR strategy. Not worth chasing for the cookie/csp-xss informational
  // warnings — our Lighthouse runs already score Best Practices 100.
});
