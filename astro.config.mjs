// @ts-check
import { defineConfig } from 'astro/config';
import { execSync } from 'node:child_process';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { fetchHiddenPagePaths } from './scripts/lib/hidden-pages.mjs';
import { fetchRedirectDocs } from './scripts/lib/redirects.mjs';
import { buildRedirectMap } from './src/lib/redirects.ts';
import { fixSanityDedupeAlias } from './src/lib/sanity-dedupe-alias.ts';
import { studioConfigModule } from './src/lib/studio-route.ts';

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
// The commit this build came from, for /build-info.json (the Studio kit, PORTS.md
// card 106). Read HERE, in Node, because the route prerenders inside workerd,
// where process.env is not the build machine's. GitHub Actions sets GITHUB_SHA,
// Cloudflare Workers Builds sets WORKERS_CI_COMMIT_SHA; a local build asks git;
// no git (a tarball) gives null. Handed to the route as a Vite define below.
const BUILD_COMMIT = (() => {
  const sha = process.env.GITHUB_SHA || process.env.WORKERS_CI_COMMIT_SHA;
  if (sha) return sha.slice(0, 7);
  try {
    return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
})();

export default defineConfig({
  // REPLACE before launch (rebrand.mjs stamps this): the canonical production URL.
  site: 'https://www.presbyterianacademy.org',
  output: 'static',
  // Canonical URLs and the sitemap end in a slash; every internal link must too,
  // or Cloudflare answers it with a redirect (src/lib/href.ts).
  trailingSlash: 'always',
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
    //
    // NO studioBasePath (PORTS.md card 120): the site owns the /studio page
    // (src/pages/studio/index.astro: its title, icons and a branded splash).
    // Setting studioBasePath would also inject Sanity's own page at /studio.
    // studioConfigModule() in vite.plugins below serves the Studio its config
    // instead, exactly as the integration did (hash history, basePath "/").
    sanity({
      projectId: 'uz2sl3zp',
      dataset: 'production',
      useCdn: false,
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
    // fixSanityDedupeAlias() repairs @sanity/astro's dev-only alias, which is
    // broken on Windows (it points `sanity` at a package.json FILE, so `astro
    // dev` dies with MISSING_EXPORT). It does nothing in `astro build` and on
    // macOS/Linux. Do not delete it, and do not "fix" this with
    // SANITY_ASTRO_DISABLE_MODULE_DEDUPE=1 (the Studio then fails to hydrate).
    // Full story: src/lib/sanity-dedupe-alias.ts and PORTS.md card 60.
    // studioConfigModule(): the `sanity:studio` module for /studio (see above).
    plugins: [tailwindcss(), fixSanityDedupeAlias(), studioConfigModule()],
    // Read by src/pages/build-info.json.ts (see BUILD_COMMIT above).
    define: { __NCS_BUILD_COMMIT__: JSON.stringify(BUILD_COMMIT) },
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
    //
    // `react/compiler-runtime` has to be INCLUDED because of that exclusion
    // (Sanity phase 2, PORTS.md card 103). @sanity/ui 4 is compiled with the
    // React Compiler and imports React's own CommonJS `react/compiler-runtime`.
    // An excluded package's imports are served raw, so without this the dev
    // Studio fails to hydrate with "react/compiler-runtime.js does not provide
    // an export named 'c'". @sanity/astro only includes the older
    // `react-compiler-runtime` package. Dev only; `astro build` is unaffected.
    optimizeDeps: {
      exclude: ['@sanity/ui', 'styled-components'],
      include: ['react/compiler-runtime'],
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
