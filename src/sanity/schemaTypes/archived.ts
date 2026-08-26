// Soft-delete support. Content types in ARCHIVABLE_TYPES get this hidden flag:
// the "Delete (move to trash)" action (studio/actions/archive.tsx) sets it to
// true instead of destroying the document. Desk lists filter archived docs out
// (structure.ts), and the Trash section at the bottom of the desk lists them
// with Restore / Delete forever.
//
// The field is hidden and additive, so existing documents are untouched: on old
// docs the value is simply undefined, which every filter treats the same as
// false (`archived != true`).
//
// NOTE for the frontend: the site's GROQ queries must ALSO exclude archived
// docs (`&& archived != true`) or a trashed course would still render on the
// live site. See src/lib/queries.ts (owned by the root project).

import { defineField } from 'sanity';

/** Document types whose Delete is replaced by the soft-delete Archive. */
export const ARCHIVABLE_TYPES = new Set<string>([
  'course',
  'facultyMember',
  'event',
  'testimonial',
  'faqItem',
  'pricingTier',
  'page',
  'announcement',
  'term',
  'teachingArea',
  'form',
]);

/** The hidden soft-delete flag. Add to every schema in ARCHIVABLE_TYPES. */
export function archivedField() {
  return defineField({
    name: 'archived',
    title: 'In the trash',
    type: 'boolean',
    hidden: true,
    initialValue: false,
  });
}

/** GROQ fragment: keeps normal desk lists free of trashed documents. */
export const NOT_ARCHIVED = 'archived != true';
