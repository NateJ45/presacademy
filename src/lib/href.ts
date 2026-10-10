// Safe to edit by hand
// Trailing-slash normalisation for internal links.
//
// The site builds with `trailingSlash: 'always'` (astro.config.mjs), so the
// canonical tags and the sitemap use `/about/`. A link written `/about` makes
// Cloudflare answer with a redirect, which search engines report as "Page with
// redirect". Every internal page link therefore ends in a slash.
//
// Left untouched: external URLs, protocol-relative `//host`, `#anchors`,
// `mailto:` / `tel:`, anything whose last segment has a file extension
// (.pdf, .xml, .png ...), and the non-page prefixes /preview, /studio, /api.
// `?query` and `#hash` are kept, with the slash inserted before them.

const SKIP_PREFIX = /^\/(?:preview|studio|api)(?:[/?#]|$)/;
// Sanity's stega encoder hides these characters in preview strings.
const INVISIBLE = /[\u200B-\u200F\uFEFF\u{E0000}-\u{E007F}]/u;

export function withTrailingSlash(href: string): string;
export function withTrailingSlash(href: string | undefined): string | undefined;
export function withTrailingSlash(href: string | undefined): string | undefined {
  if (typeof href !== 'string') return href;
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (INVISIBLE.test(href) || SKIP_PREFIX.test(href)) return href;
  const m = href.match(/^([^?#]*)([?#].*)?$/);
  if (!m) return href;
  const path = m[1];
  const rest = m[2] ?? '';
  if (path.endsWith('/')) return href;
  const last = path.slice(path.lastIndexOf('/') + 1);
  if (/\.[A-Za-z0-9]+$/.test(last)) return href;
  return `${path}/${rest}`;
}

const LINK_KEYS = new Set([
  'href',
  'ctaUrl',
  'linkHref',
  'externalUrl',
  'primaryCtaHref',
  'secondaryCtaHref',
  'tertiaryCtaHref',
]);

/**
 * Walk a Sanity result and add the trailing slash to every internal link field
 * (hand-typed addresses, button URLs, rich-text link marks). Mutates in place
 * and returns the same value. Called once, from sanityFetch, so no render site
 * has to remember it.
 */
export function slashInternalLinks<T>(data: T): T {
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
    } else if (node && typeof node === 'object') {
      const obj = node as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        const v = obj[key];
        if (typeof v === 'string') {
          if (LINK_KEYS.has(key)) obj[key] = withTrailingSlash(v);
        } else {
          walk(v);
        }
      }
    }
  };
  walk(data);
  return data;
}
