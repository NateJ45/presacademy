// Teaching area — the shared subject taxonomy. Referenced by BOTH `course`
// and `facultyMember` so the course catalog and the faculty directory filter
// on one vocabulary (e.g. "Scripture", "Reformed Theology", "Prayer & the
// Spiritual Life"). Keep the list small and plain-English, ~8 to 11 entries.

import { defineType, defineField } from 'sanity';

export const teachingArea = defineType({
  name: 'teachingArea',
  title: 'Teaching area',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      description: 'A subject area, in plain words. Example: "Scripture", "Reformed Theology", "Leading a Group".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short description (optional)',
      type: 'text',
      rows: 2,
      description: 'One line, shown as a catalog or filter header.',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first.',
      initialValue: 10,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
  orderings: [
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }, { field: 'title', direction: 'asc' }] },
  ],
});
