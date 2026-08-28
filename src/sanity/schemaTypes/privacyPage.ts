// Privacy policy page singleton. Route: /privacy.
// One instance only; singleton enforcement in sanity.config.ts.
// Safe to edit by hand.
//
// 2026-08-27 (Phase 5 of the page-builder conversion): the policy text and its
// last-updated date live on this page's `sectionLegalBody` block in "Page
// sections" now, so the old page-level `body` and `lastUpdated` fields (and the
// "Content" group that held them) went away. scripts/seed-builder-privacy.mjs
// copied the values into the block; scripts/cleanup-builder-fields.mjs unset the
// originals. If an editor empties the block's body, the built-in policy in
// LegalBodyBlock.astro renders, so the page is never blank.

import { defineType, defineField } from 'sanity';
import {
  FLEXIBLE_SECTION_MEMBERS,
  FLEXIBLE_SECTIONS_DESCRIPTION,
  FLEXIBLE_SECTIONS_OPTIONS,
} from './blocks';
import { SEO_GROUP, seoFields } from './seo';
import { PUBLISH_AT_GROUP, publishAtField } from './_publishAt';

export const privacyPage = defineType({
  name: 'privacyPage',
  title: 'Privacy Policy Page',
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
      initialValue: 'Studio Name.',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      group: 'hero',
      initialValue: 'Privacy Policy',
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
        'A single word from the headline to render in Pinyon Script. Must match exactly. Leave blank to skip.',
    }),

    // The policy text itself is the "Policy or statement" block below.
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
  preview: { prepare: () => ({ title: 'Privacy Policy Page' }) },
});
