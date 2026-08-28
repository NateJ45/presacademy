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
  // Phase 3, 2026-08-26 (courses). sectionCourseRail's two rendering enums are
  // ALREADY covered above: `source` picks which catalog query runs, `variant`
  // picks which of the two bands renders. Checked rather than assumed, because
  // stega-encoded, `source` would never equal "featured" and `variant` would
  // never equal "feature", and the preview would quietly show the wrong rail
  // while the live site was right. Nothing to add here; the note is the record.
  //
  // Phase 4, 2026-08-26 (home). Checked type by type, and again nothing to add:
  // sectionNumberedCards' new `wayfinding` value rides the `variant` entry
  // above, and the three new types (sectionTicker, sectionFacultyRail,
  // sectionTestimonialRail) carry no enum at all. Their only logic-bearing
  // values are numbers and booleans (`limit`), which stega never touches -- it
  // encodes strings. Recorded because "no change needed" is only trustworthy
  // when someone actually looked.
  //
  // Appearance controls, 2026-08-28 (Waves 1 + 2). Audited field by field:
  //   accent         NEW, and exactly the classic case. SectionShell looks it
  //                  up in a map to pick a class; encoded, it would miss and
  //                  every section would silently render the default accent in
  //                  the preview while the live page showed the chosen one.
  //   headingAccent  NEW, and the sharper case: it is matched against the
  //                  heading with indexOf, so an encoded value would never find
  //                  its own word. src/lib/heading-accent.ts ALSO strips both
  //                  sides with plain() -- belt and braces, because that helper
  //                  runs on the live site too, where this list does not exist.
  //   tone           already listed above; unchanged, and now carries two more
  //                  values ("card", "ink") that select classes the same way.
  //   padding        already listed above.
  // Nothing else in this mission drives logic from a string: the rich twins are
  // portable text meant to be clicked into, so they KEEP their stega.
  'accent',
  'headingAccent',
  // Layout variants, 2026-08-28 (Wave 3). Audited, and NOTHING was added, which
  // is the point of the note: the wave's two new fields are both named
  // `columns` (on sectionSteps and sectionDynamicList), and `columns` has been
  // on this list from the start. `imageSide`, `mediaSide` and `padding` are
  // here too, so the media-side and vertical-spacing controls the wave rewords
  // and documents are already safe. Every one of them is looked up in a map in
  // src/lib/layout-variants.ts or SectionShell.astro, so an encoded value would
  // miss the map and silently render the DEFAULT layout in the preview while
  // the live page showed the chosen one. Recorded because "no change needed" is
  // only trustworthy when someone actually looked.
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
