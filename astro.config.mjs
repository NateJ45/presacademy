// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';

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
      filter: (page) =>
        !page.includes('/404') &&
        !page.includes('/style-guide') &&
        !page.includes('/preview') &&
        !page.includes('/studio'),
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    // -------------------------------------------------------------------------
    // Keep styled-components to ONE instance in the client bundle.
    // -------------------------------------------------------------------------
    // Defensive, not the cure. The Studio's styled-components error #18
    // ("Accessing useTheme hook outside of a <ThemeProvider>") was ultimately
    // caused by MIXED @sanity/ui majors in the dependency tree, not by chunk
    // splitting (the whole story is in CLAUDE.md). Grouping still guarantees a
    // single styled-components instance, which is cheap insurance against a
    // second ThemeContext ever reappearing.
    //
    //   grep -l "errors.md#" dist/client/_astro/*.js   # must list exactly ONE
    // -------------------------------------------------------------------------
    build: {
      rollupOptions: {
        output: {
          advancedChunks: {
            groups: [
              {
                name: 'sanity-ui-runtime',
                test: /[\\/]node_modules[\\/](styled-components|@sanity[\\/]ui)[\\/]/,
              },
            ],
          },
        },
      },
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
