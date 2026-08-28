// Home page singleton — the lay-school home. Holds the hero, the closing CTA,
// and SEO. THE BODY IS NO LONGER HERE: it is the "Page sections" array, built
// and reordered by the editor.
//
// 2026-08-27 (Phase 5 of the page-builder conversion): the whole "Page copy"
// group went away. The wayfinding ledger, the stat band, the topics ticker and
// the eyebrow/heading/link labels around the Start-here / Courses / Faculty /
// Testimonials rails are now section blocks in `flexibleSections`, seeded from
// these fields by scripts/seed-builder-home.mjs and then unset from the dataset
// by scripts/cleanup-builder-fields.mjs. Nothing read them any more.
//
// The hero, the final CTA and the SEO fields stay page-level by decision D2 of
// docs/superpowers/plans/2026-08-26-page-builder-conversion.md: an editor can
// rearrange the body, never delete the page's h1.
//
// The church-era fields (Sunday worship band, weekly rhythms, "The Record",
// Welcome section, seasonal hero, etc.) were removed in the 2026-06 editability
// pass — the home document held no data in them, so removal was clean.

import { defineType, defineField, defineArrayMember } from 'sanity';
import {
  FLEXIBLE_SECTION_MEMBERS,
  FLEXIBLE_SECTIONS_DESCRIPTION,
  FLEXIBLE_SECTIONS_OPTIONS,
} from './blocks';
import { SEO_GROUP, seoFields } from './seo';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  // Marketing copy is structural — edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'sections', title: 'Page sections' },
    { name: 'final', title: 'Final CTA' },
    SEO_GROUP,
  ],
  fields: [
    // ---- Hero ----
    defineField({
      name: 'heroEyebrow',
      title: 'Hero eyebrow',
      type: 'string',
      group: 'hero',
      description: 'Small label above the headline. Leave empty for the default.',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      group: 'hero',
      description: 'The big opening line. Leave empty for the default.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Hero subhead',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'One or two sentences under the headline.',
    }),
    defineField({
      name: 'heroImages',
      title: 'Hero image(s)',
      type: 'array',
      group: 'hero',
      description:
        'The photo beside the hero text. Add one for a static image, or two or more for a slow cross-fading slideshow. Drag to set the order.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        }),
      ],
    }),
    defineField({
      name: 'heroPrimaryLabel',
      title: 'Hero primary button',
      type: 'string',
      group: 'hero',
      description:
        'The filled button label (links to the Courses page). Leave empty for "Browse courses".',
    }),
    defineField({
      name: 'heroSecondaryLabel',
      title: 'Hero secondary button',
      type: 'string',
      group: 'hero',
      description:
        'The outlined button label (links to Get Started). Leave empty for "Book a free intro".',
    }),
    defineField({
      name: 'nextCohortLabel',
      title: '"Next cohort" label',
      type: 'string',
      group: 'hero',
      description:
        'The small label before the next-term date under the hero. The date, term, and city come from the Term and Site Settings, not here. Leave empty for "Next cohort begins".',
    }),

    // ---- Page sections ----
    // The whole body of the home page lives here now (2026-08-27, Phase 5).
    defineField({
      name: 'flexibleSections',
      title: 'Page sections',
      type: 'array',
      group: 'sections',
      description: FLEXIBLE_SECTIONS_DESCRIPTION,
      of: FLEXIBLE_SECTION_MEMBERS,
      options: FLEXIBLE_SECTIONS_OPTIONS,
    }),

    // ---- Final CTA ----
    defineField({
      name: 'finalCtaEyebrow',
      title: 'Final CTA — eyebrow',
      type: 'string',
      group: 'final',
    }),
    defineField({
      name: 'finalCtaHeadline',
      title: 'Final CTA — headline',
      type: 'string',
      group: 'final',
    }),
    defineField({
      name: 'finalCtaSubhead',
      title: 'Final CTA — subhead',
      type: 'text',
      rows: 2,
      group: 'final',
    }),
    defineField({
      name: 'finalCta',
      title: 'Final CTA — button',
      type: 'ctaBlock',
      group: 'final',
    }),
    defineField({
      name: 'finalCtaBackgroundImage',
      title: 'Final CTA — background image (optional)',
      type: 'image',
      group: 'final',
      options: { hotspot: true },
      description:
        'Optional photo behind the closing call-to-action. Auto-darkened so the text stays readable. Leave empty for the solid panel.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    // ---- Search & sharing (shared definition: ./seo.ts) ----
    ...seoFields({ group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Home Page' }) },
});
