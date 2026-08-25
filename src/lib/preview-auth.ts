// =============================================================================
// preview-auth — the UNFORGEABLE value inside the Studio preview cookie
// (ported from the WCP site, 2026-08-25)
// =============================================================================
// /api/draft-mode/enable is only reachable with Sanity's one-time preview
// secret, so the cookie it sets proves "this browser came through the Studio".
// The cookie's VALUE must prove it too: the visual-editing package's own
// convention is a static 'true', which anyone could type into their cookie
// jar. Forging it here would merely show public DRAFTS (this site has no
// gated content), but the fingerprint costs nothing and keeps the preview
// surface honest: a hash of the server-side Sanity token, which nobody
// without the token can produce.
//
// Rotating SANITY_TOKEN invalidates every preview cookie (editors just reopen
// the Presentation tool). Never import this from a prerendered page — it reads
// the Worker runtime env.
// =============================================================================
import { env } from 'cloudflare:workers';

const VERSION = 'presacademy-preview:v1:';

/** The value the preview cookie must carry. Empty token → empty string, which
 *  can never match a non-empty cookie, so a missing secret FAILS CLOSED. */
export async function previewCookieValue(): Promise<string> {
  const token = (env as { SANITY_TOKEN?: string }).SANITY_TOKEN;
  if (!token) return '';
  const bytes = new TextEncoder().encode(VERSION + token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** True only when the request carries the Studio-issued preview cookie with
 *  the correct fingerprint. */
export async function isStudioPreview(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await previewCookieValue();
  return expected.length > 0 && cookieValue === expected;
}
