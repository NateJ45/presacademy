// =============================================================================
// CMS content client — for the Studio-only PREVIEW path (/preview/*)
// (ported from the WCP site, 2026-08-25)
// =============================================================================
// Unlike src/lib/sanity.ts (which reads once at BUILD time for the static
// public pages), this client runs per request on `prerender = false` preview
// routes and must read live DRAFT content, so the token comes from the Worker
// runtime env (`cloudflare:workers`), never from a build-time var. Never
// import this from a prerendered page.
//
// perspective/stega both switch on `draftMode`, which callers derive from the
// presence of the Presentation Tool's perspective cookie. There is no fallback
// argument here (unlike sanityFetch): a preview page should show real Sanity
// state, including empty/missing fields, so an editor notices a gap instead of
// silently seeing built-in fallback copy.
// =============================================================================
import { createClient, type SanityClient } from '@sanity/client';
import { env } from 'cloudflare:workers';

export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string;
export const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string) || 'production';
export const apiVersion = '2026-05-01';

// Fields chosen from a fixed dropdown / radio in the schema — NEVER free text
// an editor types, and never displayed as prose. They drive class and
// component selection in the block renderers (e.g. SectionShell does
// `tone === 'chapel'`, layouts branch on `imageSide`/`columns`). Stega encodes
// a ~1KB run of invisible marker characters into every string it touches so
// click-to-edit knows which field to open; on a DISPLAY string that is the
// whole point, but on one of these it silently breaks the exact-string
// comparison (`"chapel" + <markers>` !== `"chapel"`), so the preview
// mis-renders while the live static site is fine. Excluding them from stega
// loses nothing — you pick these from a list, there is no text to click into.
// ADD ANY NEW LOGIC-DRIVING ENUM FIELD TO THIS LIST. (WCP's #1 preview gotcha.)
const NON_STEGA_FIELDS = new Set([
  'tone',
  'align',
  'columns',
  'imageSide',
  'mediaSide',
  'mediaType',
  'padding',
  'source',
  'style',
  'layout',
  'variant',
  'icon',
  'format',
  'overlay',
  'size',
  // Ported page sections (Rule & Ledger), 2026-08-26. `variant` above already
  // covers sectionNumberedCards' border choice; this one picks WHICH built-in
  // legal statement renders when a sectionLegalBody has an empty body, so a
  // stega-encoded value would silently render neither.
  'fallbackStatement',
  // Phase 2, 2026-08-26 (pricing). `variant` above already covers
  // sectionLedgerStats' layout choice; these two are sectionPricingTiers' new
  // opt-in fields, and both pick MARKUP: `surface` decides whether the block is
  // wrapped in SectionShell at all, `headingLevel` whether the tier names are
  // h2 or h3. Stega-encoded, each would silently fall back to its default
  // branch, in preview only.
  'surface',
  'headingLevel',
]);

export function getPreviewClient(draftMode: boolean): SanityClient {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: (env as { SANITY_TOKEN?: string }).SANITY_TOKEN,
    perspective: draftMode ? 'drafts' : 'published',
    stega: {
      enabled: draftMode,
      studioUrl: '/studio',
      // Encode display strings (click-to-edit) but skip the dropdown fields
      // above, whose exact values are used in rendering logic.
      filter: (props) =>
        NON_STEGA_FIELDS.has(String(props.sourcePath.at(-1))) ? false : props.filterDefault(props),
    },
  });
}

/** Run a GROQ query with the draft-aware preview client. */
export async function previewFetch<T>(
  draftMode: boolean,
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return getPreviewClient(draftMode).fetch<T>(query, params);
}
