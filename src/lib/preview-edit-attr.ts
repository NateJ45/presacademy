// Foundation, edit with care
// =============================================================================
// preview-edit-attr — explicit `data-sanity` targets for whole SECTIONS
// (ported from the WCP site, 2026-08-27)
// =============================================================================
// Stega markers give click-to-edit on TEXT. A whole section (its band, its
// images, its empty space) has no text of its own to click, so the Presentation
// overlay cannot draw section-level controls from stega alone. An explicit
// `data-sanity` attribute on each section wrapper fixes that: the overlay
// outlines the section as ONE array item and shows the array controls in the
// canvas (insert before/after through the grouped insert menu, duplicate,
// remove, drag to reorder). That is the Squarespace feel.
//
// PREVIEW SURFACES ONLY. The live site never renders these attributes: the
// static pages pass no `editDoc`, so `Sections.astro` emits no wrapper and no
// attribute there. `scripts/page-parity.mjs` is the gate on that promise.
//
// The attribute must sit on a REAL block box. The overlay outlines the
// element's rect, and a `display: contents` element has no rect.
// =============================================================================
import { createDataAttribute } from '@sanity/visual-editing/create-data-attribute';

export interface EditDoc {
  /** The PUBLISHED document id (no `drafts.` prefix). */
  id: string;
  /** The document _type, e.g. "page" or "aboutPage". */
  type: string;
  /**
   * The array field holding the sections. Two names exist in this schema and
   * they are not interchangeable: the thirteen singletons build their body in
   * `flexibleSections`, while a custom `page` doc uses `sections`. Point the
   * overlay at the wrong one and every control silently edits nothing.
   */
  field?: 'flexibleSections' | 'sections';
}

/** The `data-sanity` value that targets one section array item on a doc. */
export function sectionEditAttr(doc: EditDoc, key: string): string {
  return createDataAttribute({
    id: doc.id.replace(/^drafts\./, ''),
    type: doc.type,
    baseUrl: '/studio',
  })(`${doc.field ?? 'flexibleSections'}[_key=="${key}"]`).toString();
}
