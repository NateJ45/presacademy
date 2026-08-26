// Foundation, edit with care
// =============================================================================
// Sanity CLI config — used by `sanity typegen`, `sanity dataset`, `sanity cors`
// =============================================================================
// There is ONE canonical Studio: the one embedded at /studio on the live site.
// It rebuilds on every deploy, so its schema is always current and can't drift.
//
// DO NOT run `npx sanity deploy`. That publishes a SEPARATE standalone Studio
// to <studioHost>.sanity.studio, which only updates when someone re-runs the
// deploy by hand — it silently falls behind the embedded Studio while pointing
// at the same production data. The old hosted Studio
// (presbyterian-academy.sanity.studio, appId usl3ubscklxyewmtgfv3v4xy) is
// retired, and there is deliberately no studioHost/deployment block here so a
// stray `sanity deploy` can't silently recreate the split. (The old ids are
// recorded in docs/PENDING.md for the one-time undeploy.)
// (Pattern copied from the WCP repo, which learned this the hard way.)

import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production',
  },
  // The embedded Studio is served at /studio (set by @sanity/astro's
  // studioBasePath in astro.config.mjs). Mirror it here so standalone CLI
  // tooling (`sanity dev`, `sanity schema deploy`) agrees the Studio lives at
  // the sub-path.
  project: { basePath: '/studio' },
  // Typegen reads the extracted schema and writes types into src/lib/.
  // Extract via `sanity schema extract --force`; generate via
  // `sanity typegen generate` (both wrapped by `npm run typegen`).
  typegen: {
    path: './schema.json',
    generates: './src/lib/sanity.types.ts',
  },
});
