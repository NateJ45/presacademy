// Contact page singleton. Email, social links, service area come from siteSettings.
//
// 2026-08-27 (Phase 5 of the page-builder conversion): the body of this page is
// two blocks in "Page sections" now, `sectionContactDetails` (details,
// who-to-reach rows, getting-here copy, the map) and `sectionForm` (the form
// reference and its intro), so the whole "Form intro + expectations" group and
// the who-to-reach / getting-here / form-headline fields went away. The seeds
// carried their values across before scripts/cleanup-builder-fields.mjs unset
// them.

import { defineType, defineField } from 'sanity';
import {
  FLEXIBLE_SECTION_MEMBERS,
  FLEXIBLE_SECTIONS_DESCRIPTION,
  FLEXIBLE_SECTIONS_OPTIONS,
} from './blocks';
import { SEO_GROUP, seoFields } from './seo';
import { PUBLISH_AT_GROUP, publishAtField } from './_publishAt';

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  // Marketing copy is locked and structural — edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    SEO_GROUP,
    { name: 'hero', title: 'Hero' },
    { name: 'content', title: 'Page copy' },
    { name: 'sections', title: 'Page sections' },
    // removed empty interior-designer scheduling group during church remodel
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
      initialValue: 'Contact',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      group: 'hero',
      initialValue: 'Start the Conversation.',
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

    // removed interior-designer contact form dropdown option fields (formProjectTypeOptions, formLocationOptions, formBudgetOptions, formTimelineOptions, formSourceOptions) during church remodel
    // removed orphaned whatToExpectHeadline + whatToExpectContent (designer-era
    // "what to expect" block; contact.astro never rendered them) during the
    // content-editability audit.
    // removed interior-designer postInquiryRoadmap field during church remodel
    // removed interior-designer scheduling fields (schedulingLink, schedulingLinkLabel, availabilityNote) during church remodel
    // removed formIntroNote, contactForm and whatToExpectEyebrow 2026-08-27:
    // the page's `sectionForm` block carries the form, its intro and its eyebrow.

    defineField({
      name: 'note',
      title: 'Editor note (not shown on the site)',
      type: 'text',
      rows: 3,
      description:
        'Internal-only reminder for editors. Anything you write here stays in Studio and never renders on the live page.',
    }),
    // removed whoToReachLabel, contactReasons, gettingHereLabel, gettingHereBody
    // and formSectionHeadline 2026-08-27: the `sectionContactDetails` and
    // `sectionForm` blocks in "Page sections" carry all five.
    defineField({
      name: 'finalCtaEyebrow',
      title: 'Closing CTA eyebrow',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'finalCtaHeadline',
      title: 'Closing CTA headline',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'finalCtaSubhead',
      title: 'Closing CTA subhead',
      type: 'text',
      rows: 2,
      group: 'content',
    }),
    defineField({
      name: 'finalCta',
      title: 'Closing CTA button',
      type: 'ctaBlock',
      group: 'content',
      description:
        'The button in the closing call-to-action band. Leave empty to use the built-in default button.',
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
  preview: { prepare: () => ({ title: 'Contact Page' }) },
});
