// Term — the cohort calendar and the SINGLE SOURCE OF TRUTH for course dates.
// A `course` runs in one or more `term`s (via course.offerings[].term), and a
// term owns the start/end and registration dates so they are never duplicated
// per offering. The global "Next cohort begins" cue is derived by query
// (the soonest term with a future startDate), not stored anywhere.

import { defineType, defineField } from 'sanity';

export const term = defineType({
  name: 'term',
  title: 'Term',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Term name',
      type: 'string',
      description: 'Example: "Fall 2026", "Spring 2027".',
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
      name: 'startDate',
      title: 'Term begins',
      type: 'date',
      options: { dateFormat: 'MMM D, YYYY' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Term ends',
      type: 'date',
      options: { dateFormat: 'MMM D, YYYY' },
    }),
    defineField({
      name: 'registrationOpens',
      title: 'Registration opens',
      type: 'date',
      options: { dateFormat: 'MMM D, YYYY' },
    }),
    defineField({
      name: 'registrationDeadline',
      title: 'Apply by',
      type: 'date',
      options: { dateFormat: 'MMM D, YYYY' },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'Registration open', value: 'open' },
          { title: 'In session', value: 'inSession' },
          { title: 'Closed', value: 'closed' },
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
    }),
    defineField({
      name: 'note',
      title: 'Note (optional)',
      type: 'text',
      rows: 2,
      description: 'Example: "Evening cohort, West Chester campus".',
    }),
  ],
  preview: {
    select: { title: 'title', start: 'startDate', status: 'status' },
    prepare: ({ title, start, status }) => ({
      title: title ?? 'Untitled term',
      subtitle: [start ? new Date(start).toLocaleDateString() : null, status].filter(Boolean).join(' · '),
    }),
  },
  orderings: [
    { title: 'Start date (soonest first)', name: 'startAsc', by: [{ field: 'startDate', direction: 'asc' }] },
  ],
});
