// Foundation, edit with care
// =============================================================================
// DEFAULT_SECTIONS — the code-side safety net for the page builder (2026-08-26)
// =============================================================================
// Decision D3 of docs/superpowers/plans/2026-08-26-page-builder-conversion.md.
//
// Today every singleton page carries `??` fallback literals inline, so an empty
// dataset still renders a complete, correct page. Two things depend on that and
// neither is optional:
//
//   - CI builds with no Sanity credentials at all (`sanityFetch` returns its
//     fallback without a network call), and the axe + reflow sweeps run against
//     that build. A blank body would mean the accessibility gates are grading
//     an empty page.
//   - An editor who deletes every section in the Studio should get the page
//     back, not a hole between the hero and the closing CTA.
//
// When a page converts, its inline literals move here as section DATA, keyed by
// the page's Sanity type name. The seed scripts write the same content into
// Sanity so editors can see and own it; this map is what renders when the doc's
// sections array is empty. Empty-env CI then renders byte-identically to today.
//
// It is EMPTY on purpose right now. Phase 0 is render-neutral: no page reads
// this yet. Each entry lands in the same commit as the page that needs it
// (Phase 1 onward), so the fallback copy and the page it belongs to are never
// out of step. Until then every lookup returns undefined and the renderer falls
// through to an empty sections array, exactly as an unconverted page does.
// =============================================================================

/**
 * One entry per converted singleton, keyed by its Sanity document type
 * (`aboutPage`, `pricingPage`, ...) — the same keys `SINGLETON_BY_PATH` maps
 * paths onto in src/pages/preview/[...slug].astro.
 *
 * The values are plain section objects in the same shape Sanity returns for
 * `flexibleSections`: `_type` plus that block's fields, and a stable `_key` so
 * the entries match what the seed scripts write (idempotent re-runs).
 */
// `any[]` matches the shape Sections.astro already takes (Sanity blocks are
// heterogeneous and only the renderer's per-_type branch knows their fields).
export const DEFAULT_SECTIONS: Record<string, any[]> = {
  // Populated page by page as the conversion proceeds. See the header comment.
};

/** The sections a page should render: the editor's array, else the defaults. */
export function sectionsFor(pageType: string, sections?: any[] | null): any[] {
  if (Array.isArray(sections) && sections.length > 0) return sections;
  return DEFAULT_SECTIONS[pageType] ?? [];
}
