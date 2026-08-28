// Accessibility statement page singleton. Route: /accessibility.
// Mirrors privacyPage. One instance only; singleton enforcement in
// sanity.config.ts. Safe to edit by hand.
//
// 2026-08-27 (Phase 5 of the page-builder conversion): the statement text and
// its "last reviewed" date live on this page's `sectionLegalBody` block in "Page
// sections" now, so the old page-level `body` and `lastUpdated` fields (and the
// "Content" group) went away. scripts/seed-builder-accessibility.mjs copied the
// values across; scripts/cleanup-builder-fields.mjs unset the originals.
//
// The site still ships a complete, on-brand statement as the block's built-in
// fallback, so the page is live and accurate even with an empty body.

import { defineType, defineField } from 'sanity';
import {
  FLEXIBLE_SECTION_MEMBERS,
  FLEXIBLE_SECTIONS_DESCRIPTION,
  FLEXIBLE_SECTIONS_OPTIONS,
} from './blocks';
import { SEO_GROUP, seoFields } from './seo';
import { PUBLISH_AT_GROUP, publishAtField } from './_publishAt';

export const accessibilityPage = defineType({
  name: 'accessibilityPage',
  title: 'Accessibility Page',
  type: 'document',
  // Configuration, not prose the editor writes — exclude from Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    SEO_GROUP,
    { name: 'hero', title: 'Hero' },
    { name: 'sections', title: 'Page sections' },
    PUBLISH_AT_GROUP,
  ],
  fields: [
    // SEO
    // ---- Search & sharing (shared definition: ./seo.ts) ----
    ...seoFields({ group: 'seo', imageTitle: 'Social share image (this page)' }),

    // Hero
    defineField({
      name: 'heroEyebrow',
      title: 'Hero eyebrow',
      type: 'string',
      group: 'hero',
      initialValue: 'Built for everyone.',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      group: 'hero',
      initialValue: 'Accessibility',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Hero subhead',
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero background image (optional)',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (R) => R.required(),
        }),
      ],
    }),
    defineField({
      name: 'heroScriptAccent',
      title: 'Script-font accent word (optional)',
      type: 'string',
      group: 'hero',
      description:
        'A single word from the headline to render in the script accent font. Must match exactly. Leave blank to skip.',
    }),

    // The statement text itself is the "Policy or statement" block below.
    defineField({
      name: 'flexibleSections',
      title: 'Page sections',
      type: 'array',
      group: 'sections',
      description: FLEXIBLE_SECTIONS_DESCRIPTION,
      of: FLEXIBLE_SECTION_MEMBERS,

      options: FLEXIBLE_SECTIONS_OPTIONS,
    }),
    publishAtField(),
  ],
  preview: { prepare: () => ({ title: 'Accessibility Page' }) },
});
