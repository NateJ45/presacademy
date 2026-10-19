// =============================================================================
// sectionPreset — a saved section, ready to drop onto another page
// =============================================================================
// THE PROBLEM. An editor spends twenty minutes getting a "Request information"
// band right, then wants the same band on four more pages and rebuilds it by
// hand each time (or duplicates a whole page to get at one strip of it).
//
// THE SHAPE. `section` is an ARRAY of every section type, capped at twelve
// (one band, or a whole pattern; card 109 raised it from one, 2026-10-18). A
// single-object field would need a union type Sanity has no syntax for, and a
// per-type field would mean thirty-five fields. The array gets us three things
// for free: the same grouped "+ Add" picker the page builder uses (the shared
// FLEXIBLE_SECTIONS_OPTIONS, thumbnails and all), the normal section FORM (so a
// saved section can be edited in place, not just replayed), and the ordinary
// preview of whichever type it holds.
//
// The member list is FLEXIBLE_SECTION_MEMBERS itself, the same union every page
// builder array uses, so the picker reads here exactly as it does on a page.
//
// `sectionType` is the type name copied out of that array when the preset is
// captured. It is read-only and exists so the list and the navigator can label
// a preset without opening it.
//
// HOW ONE IS MADE. Usually not here: open a page and use "Save a section as
// preset..." in the publish menu (../actions/saveSectionPreset.tsx). Creating
// one from scratch in this list works too.
//
// HOW ONE IS USED. The "Saved sections" group under the page list beside the
// live preview (../components/PreviewNavigator.tsx) adds it to the page you are
// looking at. The "+ Add section" picker inside a page can only offer schema
// TYPES, never documents, which is why the insert surface lives there.
//
// A preset goes in as a COPY (editing it never changes the pages it was added
// to) or, through "Insert a saved section" on a page, SYNCED: a syncedSection
// block that shows the preset as it is now (blocks.ts, card 109).
//
// No field groups on purpose: an undefined group name is a fatal Studio-runtime
// error in Sanity 6.4 that a build does not catch, and four fields need none.
// =============================================================================

import { defineType, defineField } from 'sanity';
import { BlockElementIcon } from '@sanity/icons/BlockElement';
import { FLEXIBLE_SECTION_MEMBERS, FLEXIBLE_SECTIONS_OPTIONS } from './blocks';

export const sectionPreset = defineType({
  name: 'sectionPreset',
  title: 'Saved section',
  type: 'document',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      description: 'Name this saved section so you can find it again.',
      validation: (R) => R.required().error('Give it a name so you can find it again.'),
    }),
    defineField({
      name: 'sectionType',
      title: 'Kind of section',
      type: 'string',
      readOnly: true,
      description: 'Filled in for you when the section is saved.',
    }),
    defineField({
      name: 'section',
      title: 'The sections',
      type: 'array',
      of: FLEXIBLE_SECTION_MEMBERS,
      options: FLEXIBLE_SECTIONS_OPTIONS,
      description:
        'One section, or a group of up to twelve that go together (a notice band and the key dates, say). Change them here: a page that added this as a COPY keeps its own version, a page that added it SYNCED changes too once you publish.',
      // Up to twelve (the authoring kit, PORTS.md card 109): a whole pattern, not just one band.
      validation: (R) =>
        R.max(12).error('A saved section holds up to twelve sections. Remove the extra ones.'),
    }),
    defineField({
      name: 'note',
      title: 'Note (optional)',
      type: 'text',
      rows: 2,
      description: 'A reminder for whoever finds this later, e.g. "course pages only".',
    }),
  ],
  preview: {
    select: { title: 'title', sectionType: 'sectionType', note: 'note', sections: 'section' },
    prepare({ title, sectionType, note, sections }) {
      const count = Array.isArray(sections) ? sections.length : 0;
      return {
        title: title || '(unnamed saved section)',
        subtitle: [
          count > 1 ? `${count} sections` : sectionType ? prettySectionType(sectionType) : null,
          note,
        ]
          .filter(Boolean)
          .join(' · '),
      };
    },
  },
});

/** `sectionImageText` -> "Image text". Same rule as src/lib/page-checks.ts. */
function prettySectionType(type: string): string {
  const bare = type.replace(/^section(?=[A-Z])/, '').replace(/Section$|Object$/, '');
  const words = bare.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
