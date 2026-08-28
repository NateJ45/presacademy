// The build-time READER for editor-managed redirects.
//
// The shaping rules (what "/old-page/" means, which entries are dropped) live
// in src/lib/redirects.ts, which the Studio also imports, so the two always
// agree. This file only does the network part: ask Sanity for the published
// `redirect` documents. astro.config.mjs feeds the answer through
// buildRedirectMap() into Astro's `redirects` config, and the Cloudflare
// adapter emits real 301/302s.
//
// FAILING IS FINE, exactly like ./hidden-pages.mjs. No project, no token, no
// network, a slow response: every one of those returns an empty list, which
// means "no redirects" and the build comes out exactly as it did before this
// file existed. A nice-to-have lookup must never fall over a build.

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './loadEnv.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// Published documents only. A DRAFT redirect must not fire: the editor is
// still deciding, and the site would forward a live address on a guess.
const QUERY = `*[_type == "redirect" && defined(from) && defined(to) && !(_id in path("drafts.**"))]{ from, to, permanent }`;

/**
 * Every published redirect document, in the loose shape buildRedirectMap()
 * expects. Always resolves; never throws.
 *
 * @returns {Promise<Array<{ from?: string, to?: string, permanent?: boolean }>>}
 */
export async function fetchRedirectDocs() {
  const env = loadEnv(root);
  const projectId = env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
  const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
  const token = env.SANITY_API_READ_TOKEN || env.SANITY_API_WRITE_TOKEN;

  if (!projectId || projectId === 'your-project-id' || projectId === 'placeholder-project-id') {
    return [];
  }

  // The CDN host is only usable without a token (Sanity rejects token + CDN).
  const host = token ? 'api.sanity.io' : 'apicdn.sanity.io';
  const url =
    `https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}` +
    `?query=${encodeURIComponent(QUERY)}`;

  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { result } = await res.json();
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.warn(
      '[redirects] could not read the redirect list from Sanity; none will be applied.',
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}
