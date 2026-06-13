// Testimonial — a short quote from a learner, used in the home proof band and
// elsewhere. Quote WHO matters: name + role/occupation + city mirrors the
// target lay personas (a ruling elder, a Sunday-school teacher, a parent) so a
// visitor sees themselves. No star ratings. Keep quotes transformation-focused
// without the banned hype words (see docs/brand/voice.md).

import { defineType, defineField } from 'sanity';

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role / occupation',
      type: 'string',
      description: 'Example: "Ruling elder", "Sunday-school teacher", "Small-group leader".',
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
    }),
    defineField({
      name: 'courseCompleted',
      title: 'Course completed (optional)',
      type: 'reference',
      to: [{ type: 'course' }],
    }),
    defineField({
      name: 'photo',
      title: 'Photo (optional)',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Pin to the home page proof band.',
      initialValue: false,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 10,
    }),
  ],
  preview: {
    select: { title: 'name', role: 'role', city: 'city', media: 'photo' },
    prepare: ({ title, role, city, media }) => ({
      title: title ?? 'Testimonial',
      subtitle: [role, city].filter(Boolean).join(' · '),
      media,
    }),
  },
  orderings: [
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
  ],
});
