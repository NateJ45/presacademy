// About page singleton — the school's identity page. Hero + "Page sections" +
// closing CTA.
//
// 2026-08-27 (Phase 5 of the page-builder conversion): the whole "Page copy"
// group went away. The mission, the "what we believe" distinctives, the
// teach/why pair and the faculty band are now section blocks in
// `flexibleSections`, seeded from these fields by scripts/seed-builder-about.mjs
// and then unset from the dataset by scripts/cleanup-builder-fields.mjs.
//
// The church / template-era fields (the building, who-we-are, mural + feature
// photos, hero image, hero/CTA script accents) were removed in the 2026-06
// editability pass; the about document held no data in them, so removal was
// clean (no "unknown field" warnings).

import { defineType, defineField } from 'sanity';
import { pageBuilderAuthoring } from '../pageBuilderAuthoring';
import {
  PAGE_SECTION_MEMBERS,
  FLEXIBLE_SECTIONS_DESCRIPTION,
  PAGE_SECTIONS_OPTIONS,
} from './blocks';
import { SEO_GROUP, seoFields } from './seo';
import { PUBLISH_AT_GROUP, publishAtField } from './_publishAt';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'sections', title: 'Page sections' },
    { name: 'final', title: 'Final CTA' },
    SEO_GROUP,
    PUBLISH_AT_GROUP,
  ],
  fields: [
    // ---- Hero ----
    defineField({
      name: 'heroEyebrow',
      title: 'Hero eyebrow',
      type: 'string',
      group: 'hero',
      description: 'Small label above the headline.',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      group: 'hero',
      description: 'The big opening line.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Hero subhead',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),

    // ---- Page sections ----
    // The whole body of the About page lives here now (2026-08-27, Phase 5).
    // The "why we exist" copy names the funder (the Presbytery of Cincinnati);
    // it is a section block's field today, so update it there.
    defineField({
      name: 'flexibleSections',
      title: 'Page sections',
      type: 'array',
      group: 'sections',
      description: FLEXIBLE_SECTIONS_DESCRIPTION,
      of: PAGE_SECTION_MEMBERS,
      // "Insert a saved section" and the page warnings (card 109).
      ...pageBuilderAuthoring,
      options: PAGE_SECTIONS_OPTIONS,
    }),

    // ---- Final CTA ----
    defineField({
      name: 'finalCtaEyebrow',
      title: 'Closing band: eyebrow',
      type: 'string',
      group: 'final',
    }),
    defineField({
      name: 'finalCtaHeadline',
      title: 'Closing band: headline',
      type: 'string',
      group: 'final',
    }),
    defineField({
      name: 'finalCtaSubhead',
      title: 'Closing band: subhead',
      type: 'text',
      rows: 2,
      group: 'final',
    }),
    defineField({
      name: 'finalCta',
      title: 'Closing band: button',
      type: 'ctaBlock',
      group: 'final',
    }),
    defineField({
      name: 'finalCtaBackgroundImage',
      title: 'Closing band: background image (optional)',
      type: 'image',
      group: 'final',
      options: { hotspot: true },
      description:
        'Optional photo behind the closing call-to-action. Auto-darkened so the text stays readable. Leave empty for the solid panel.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    // ---- Search & sharing (shared definition: ./seo.ts) ----
    ...seoFields({ group: 'seo' }),
    publishAtField(),
  ],
  preview: { prepare: () => ({ title: 'About Page' }) },
});
