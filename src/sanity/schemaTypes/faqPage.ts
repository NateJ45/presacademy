// FAQ page singleton. Questions auto-populate from the faqItem collection.
//
// 2026-08-27 (Phase 5 of the page-builder conversion): the category order moved
// onto the page's `sectionFaqGrouped` block, which is what groups and renders
// the questions now, so the page-level `categoryOrder` field (and its "Category
// order" group) went away. The FAQPage JSON-LD in src/pages/faq.astro reads the
// QUESTIONS through the page query, never that field.

import { defineType, defineField } from 'sanity';
import {
  FLEXIBLE_SECTION_MEMBERS,
  FLEXIBLE_SECTIONS_DESCRIPTION,
  FLEXIBLE_SECTIONS_OPTIONS,
} from './blocks';
import { SEO_GROUP, seoFields } from './seo';
import { PUBLISH_AT_GROUP, publishAtField } from './_publishAt';

export const faqPage = defineType({
  name: 'faqPage',
  title: 'FAQ Page',
  type: 'document',
  // Marketing copy is locked and structural — edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    SEO_GROUP,
    { name: 'hero', title: 'Hero' },
    { name: 'sections', title: 'Page sections' },
    { name: 'final', title: 'Final CTA' },
    PUBLISH_AT_GROUP,
  ],
  fields: [
    // ---- Search & sharing (shared definition: ./seo.ts) ----
    ...seoFields({ group: 'seo', imageTitle: 'Social share image (this page)' }),

    defineField({
      name: 'heroEyebrow',
      title: 'Hero eyebrow',
      type: 'string',
      group: 'hero',
      initialValue: 'Common Questions.',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      group: 'hero',
      initialValue: 'Everything You Want to Know.',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Hero subhead',
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    defineField({
      name: 'heroKeyword',
      title: 'Hero keyword (gold emphasis)',
      type: 'string',
      group: 'hero',
      description:
        'One word or short phrase from the headline to set in liturgical gold. It must match the headline exactly, including capitals. Leave empty for a single-color headline.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero background image',
      type: 'image',
      group: 'hero',
      description:
        'Full-bleed photo behind the hero text. Pick a landscape shot; the page applies a dark gradient over the bottom for readability.',
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
        'A single word from the headline to render in handwritten Pinyon Script. Must match exactly (case-sensitive). Leave blank to skip.',
    }),

    defineField({
      name: 'finalCtaEyebrow',
      title: 'Final CTA eyebrow',
      type: 'string',
      group: 'final',
      initialValue: 'Not Finding Your Answer?',
    }),
    defineField({
      name: 'finalCtaHeadline',
      title: 'Final CTA headline',
      type: 'string',
      group: 'final',
      initialValue: 'Just ask.',
    }),
    defineField({
      name: 'finalCtaScriptAccent',
      title: 'Final CTA heading script accent (optional)',
      type: 'string',
      group: 'final',
      description:
        'Optional. One word or short phrase from the headline to render in handwritten Pinyon Script. Must match the headline text exactly (case-sensitive). Leave blank to skip. Use sparingly, one accent per heading.',
    }),
    defineField({
      name: 'finalCtaSubhead',
      title: 'Final CTA subhead',
      type: 'text',
      rows: 2,
      group: 'final',
    }),
    defineField({
      name: 'finalCta',
      title: 'Final CTA button (primary)',
      type: 'ctaBlock',
      group: 'final',
    }),
    defineField({
      name: 'finalCtaBackgroundImage',
      title: 'Final CTA background image (optional)',
      type: 'image',
      group: 'final',
      options: { hotspot: true },
      description:
        'Optional. A photo behind the closing call-to-action. The site automatically darkens it so the headline and button stay readable. Leave empty to keep the solid charcoal panel.',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA (optional)',
      type: 'ctaBlock',
      group: 'final',
      description:
        'Optional second button next to the primary CTA. Use for "plan a visit" / "explore ministries" style secondary actions.',
    }),

    defineField({
      name: 'note',
      title: 'Editor note (not shown on the site)',
      type: 'text',
      rows: 3,
      description:
        'Internal-only reminder for editors. Anything you write here stays in Studio and never renders on the live page.',
    }),
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
  preview: { prepare: () => ({ title: 'FAQ Page' }) },
});
