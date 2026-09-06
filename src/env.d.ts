// Ambient declarations `astro check` needs and nothing generates for us.
//
// The `cloudflare:workers` virtual module is provided by workerd at runtime and
// bundled by @astrojs/cloudflare at build time; TypeScript still needs a
// declaration to resolve the `import { env } from 'cloudflare:workers'` the
// SSR routes use for Worker secrets (src/lib/cms-preview.ts, preview-auth.ts,
// /api/stats, /preview/live). Each caller narrows `env` to the secrets it
// reads. If `wrangler types` (npm run generate-types) is ever adopted, drop
// this in favor of the generated worker-configuration.d.ts.
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
