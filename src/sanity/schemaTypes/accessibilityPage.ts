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
import { FLEXIBLE_SECTION_MEMBERS, FLEXIBLE_SECTIONS_DESCRIPTION, FLEXIBLE_SECTIONS_OPTIONS } from './blocks';

export const accessibilityPage = defineType({
  name: 'accessibilityPage',
  title: 'Accessibility Page',
  type: 'document',
  // Configuration, not prose the editor writes — exclude from Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'sections', title: 'Page sections' },
  ],
  fields: [
    // SEO
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'Browser tab and Google result title. Aim for 50 to 60 characters.',
      validation: (Rule) => Rule.max(60).warning('Titles longer than about 60 characters get cut off in Google search results.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'The sentence under the title in Google results. Aim for 150 to 160 characters. Write it for a person, not a search engine.',
      validation: (Rule) => Rule.max(160).warning('Descriptions longer than about 160 characters get cut off in Google search results.'),
    }),
    defineField({
      name: 'seoImage',
      title: 'Social share image (this page)',
      type: 'image',
      group: 'seo',
      description: 'Optional. The image shown when this page is shared on social media or in a text. Overrides the site default in Site Settings. Use a wide image, about 1200 by 630 pixels. Leave blank to use the site default.',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),

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
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 2, group: 'hero' }),
    defineField({
      name: 'heroImage',
      title: 'Hero background image (optional)',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() }),
      ],
    }),
    defineField({
      name: 'heroScriptAccent',
      title: 'Script-font accent word (optional)',
      type: 'string',
      group: 'hero',
      description: 'A single word from the headline to render in the script accent font. Must match exactly. Leave blank to skip.',
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
  ],
  preview: { prepare: () => ({ title: 'Accessibility Page' }) },
});
