// Events index page singleton. Drives the hero copy, the closing CTAs and SEO
// on /events.
//
// 2026-08-27 (Phase 5 of the page-builder conversion): the upcoming-events and
// weekly-rhythms band copy moved to their `sectionEventGrid` and
// `sectionRuledList` blocks in "Page sections", and the old fields were unset by
// scripts/cleanup-builder-fields.mjs. The `detailFinalCta*` fields stay: the
// event DETAIL route renders them.

import { defineType, defineField } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS, FLEXIBLE_SECTIONS_DESCRIPTION, FLEXIBLE_SECTIONS_OPTIONS } from './blocks';

export const eventsPage = defineType({
  name: 'eventsPage',
  title: 'Events (index page)',
  type: 'document',
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2 }),
    defineField({
      name: 'seoImage',
      title: 'Social share image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string' }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 2 }),
    defineField({
      name: 'heroKeyword',
      title: 'Hero keyword (gold emphasis)',
      type: 'string',
      description:
        'One word or short phrase from the headline to set in liturgical gold. It must match the headline exactly, including capitals. Leave empty for a single-color headline.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'specialEyebrow', title: 'Special services eyebrow', type: 'string' }),
    defineField({ name: 'specialHeadline', title: 'Special services headline', type: 'string' }),
    defineField({ name: 'finalCtaEyebrow', title: 'Closing CTA eyebrow', type: 'string' }),
    defineField({ name: 'finalCtaHeadline', title: 'Closing CTA headline', type: 'string' }),
    defineField({ name: 'finalCtaSubhead', title: 'Closing CTA subhead', type: 'text', rows: 2 }),
    defineField({ name: 'finalCta', title: 'Closing CTA button', type: 'ctaBlock', description: 'The button in the closing call-to-action band. Leave empty to use the built-in default button.' }),
    defineField({ name: 'detailFinalCtaEyebrow', title: 'Event detail — closing CTA eyebrow', type: 'string', description: 'Shown in the closing band at the bottom of every individual event page. Leave empty to use the built-in default.' }),
    defineField({ name: 'detailFinalCtaHeadline', title: 'Event detail — closing CTA headline', type: 'string', description: 'Shown in the closing band at the bottom of every individual event page. Leave empty to use the built-in default.' }),
    defineField({ name: 'detailFinalCtaSubhead', title: 'Event detail — closing CTA subhead', type: 'text', rows: 2, description: 'Shown in the closing band at the bottom of every individual event page. Leave empty to use the built-in default.' }),
    defineField({ name: 'detailFinalCta', title: 'Event detail — closing CTA button', type: 'ctaBlock', description: 'The button in the closing band at the bottom of every individual event page. Leave empty to use the built-in default button.' }),
    defineField({
      name: 'flexibleSections',
      title: 'Page sections',
      type: 'array',
      description: FLEXIBLE_SECTIONS_DESCRIPTION,
      of: FLEXIBLE_SECTION_MEMBERS,

      options: FLEXIBLE_SECTIONS_OPTIONS,
    }),
  ],
  preview: { prepare: () => ({ title: 'Events (index page)' }) },
});
