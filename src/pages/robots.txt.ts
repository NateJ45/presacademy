// Build-time robots.txt endpoint. Generates the file from site.url so the
// sitemap reference is always correct — the URL is stamped by rebrand.mjs
// into src/data/site.ts (not public/robots.txt), so there is only one source
// of truth and the two can never drift.
//
// public/robots.txt has been deleted; this endpoint replaces it.

import type { APIRoute } from 'astro';
import { site } from '@/data/site';

export const GET: APIRoute = () => {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap-index.xml\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
