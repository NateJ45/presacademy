// Foundation, edit with care
// =============================================================================
// Deterministic heading ids for page-builder sections (added 2026-08-26 as part
// of Phase 0 of the page-builder conversion, docs/superpowers/plans/
// 2026-08-26-page-builder-conversion.md).
// =============================================================================
// WHY this exists: once a page's body is an editor-ordered sections array, the
// ids that `aria-labelledby` points at can no longer be hand-written into the
// markup one page at a time. Two rules have to survive the move:
//
//   1. Every landmark on a page needs a UNIQUE accessible name. Two <section>
//      elements labelled by the same id (or by two headings with the same text)
//      is an axe landmark-unique violation, which the a11y suite already
//      catches on the live pages.
//   2. The id has to be STABLE across builds. Anchors get linked, and a
//      random or index-derived id would move whenever an editor reorders.
//
// So: slugify the heading text, and disambiguate collisions with a counter that
// is scoped to one render pass. An explicit id, when an editor or a seed script
// sets one, passes through untouched — that is the escape hatch for anchors we
// have already published (today's hand-written ids get seeded verbatim, so no
// existing #anchor breaks).
//
// Explicit ids are deliberately NOT deduplicated. If two sections both claim
// "our-mission", that is an authoring mistake the editor should see and fix,
// not something this helper should paper over by silently renaming one of them.
// The Studio's Checkup tool has the matching read-only rule ("Page body heading
// structure") that surfaces missing and duplicate ids.
// =============================================================================

import { slugify } from './slugify.ts';

/** Used when a section has no heading text and no explicit id to slugify. */
export const HEADING_ID_FALLBACK = 'section';

export interface HeadingIdAllocator {
  /**
   * Resolve one section's heading id.
   *
   * @param heading  The section's visible heading text. Slugified when no
   *                 explicit id is given.
   * @param explicit An editor-set `headingId`. Returned verbatim (trimmed) when
   *                 non-empty, so published anchors keep working.
   */
  (heading?: string | null, explicit?: string | null): string;
  /** Ids handed out so far, in the order they were issued. Handy for tests. */
  readonly issued: readonly string[];
}

/**
 * Make a fresh allocator. ONE PER RENDER PASS: the uniqueness counter lives in
 * the closure, so a module-level singleton would leak ids between pages (and,
 * worse, between requests on the SSR preview routes, where the same module
 * instance serves every editor). Call this inside the component that renders
 * the sections array, never at module scope.
 *
 * Collisions get a `-2`, `-3`, ... suffix in first-come order:
 *
 *   allocate('Our mission')  -> 'our-mission'
 *   allocate('Our mission')  -> 'our-mission-2'
 *   allocate('', 'legacy-id') -> 'legacy-id'   (passthrough)
 */
export function createHeadingIds(): HeadingIdAllocator {
  const seen = new Set<string>();
  const issued: string[] = [];

  function take(id: string): string {
    seen.add(id);
    issued.push(id);
    return id;
  }

  const allocate = ((heading?: string | null, explicit?: string | null): string => {
    const provided = typeof explicit === 'string' ? explicit.trim() : '';
    if (provided) {
      // Passthrough. Registered as seen so a LATER derived id never collides
      // with an explicit one that was declared earlier in the array.
      return take(provided);
    }

    const base = slugify(heading ?? '') || HEADING_ID_FALLBACK;
    if (!seen.has(base)) return take(base);

    let n = 2;
    while (seen.has(`${base}-${n}`)) n += 1;
    return take(`${base}-${n}`);
  }) as HeadingIdAllocator;

  Object.defineProperty(allocate, 'issued', { get: () => issued });
  return allocate;
}
