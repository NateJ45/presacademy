// Pricing tier — a named price level (e.g. "Per course", "Audit", "Full
// certificate track"). A `course` references one tier (course.priceTier), and
// the Pricing & Scholarships page lists every tier. Display precedence on a
// course: course.priceNote, if set, is shown verbatim; otherwise the tier's
// amount + unit. Express-interest only — no checkout is wired to these.

import { defineType, defineField } from 'sanity';

export const pricingTier = defineType({
  name: 'pricingTier',
  title: 'Pricing tier',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tier name',
      type: 'string',
      description: 'Example: "Per course", "Audit", "Full certificate track".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 64 },
    }),
    defineField({
      name: 'amount',
      title: 'Amount (USD)',
      type: 'number',
      description: 'The dollar figure. Leave blank for "free".',
    }),
    defineField({
      name: 'unit',
      title: 'Unit',
      type: 'string',
      options: {
        list: [
          { title: 'per course', value: 'per course' },
          { title: 'per track', value: 'per track' },
          { title: 'per term', value: 'per term' },
        ],
        layout: 'radio',
      },
      initialValue: 'per course',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 2,
      description: 'One line on who this tier is for.',
    }),
    defineField({
      name: 'includes',
      title: 'What it includes',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'isAudit',
      title: 'Audit / listen-only tier',
      type: 'boolean',
      description: 'The low-commitment way to take a course.',
      initialValue: false,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
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
    select: { title: 'name', amount: 'amount', unit: 'unit' },
    prepare: ({ title, amount, unit }) => ({
      title: title ?? 'Untitled tier',
      subtitle: amount != null ? `$${amount} ${unit ?? ''}`.trim() : 'Free',
    }),
  },
  orderings: [
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
  ],
});
