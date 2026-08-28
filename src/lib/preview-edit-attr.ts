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

/**
 * The `data-sanity` value that targets one FIELD inside one section
 * (2026-08-28, in-canvas controls).
 *
 * The distinction from `sectionEditAttr` above is load-bearing, and was learned
 * the hard way in a deployed Studio. The overlay will happily OUTLINE an element
 * whose attribute names a bare array item, which is what gives the section its
 * insert/duplicate/drag menu. But a custom overlay COMPONENT only mounts on a
 * node the Studio schema resolves to a field, and an array item on its own is
 * not one: `getField` returns nothing and the component resolver is never
 * called. Pointing a small handle at `…[_key=="…"].background` gives the same
 * section a node that does resolve, which is how the swatch row gets on screen.
 */
export function sectionFieldEditAttr(doc: EditDoc, key: string, field: string): string {
  return createDataAttribute({
    id: doc.id.replace(/^drafts\./, ''),
    type: doc.type,
    baseUrl: '/studio',
  })(`${doc.field ?? 'flexibleSections'}[_key=="${key}"].${field}`).toString();
}

/**
 * The `data-sanity` value that targets a field on ANY document — the
 * WordPress-template-part gesture (2026-08-28). The preview wraps the shared
 * Header and Footer in this attribute pointed at `siteSettings`, so in Edit
 * mode the chrome outlines as one editable surface and a click switches the
 * Presentation edit panel to the owning document, opened at `path`.
 */
export function docEditAttr(id: string, type: string, path: string): string {
  return createDataAttribute({
    id: id.replace(/^drafts\./, ''),
    type,
    baseUrl: '/studio',
  })(path).toString();
}
