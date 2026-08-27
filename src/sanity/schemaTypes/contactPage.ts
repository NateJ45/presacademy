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
import { FLEXIBLE_SECTION_MEMBERS, FLEXIBLE_SECTIONS_DESCRIPTION, FLEXIBLE_SECTIONS_OPTIONS } from './blocks';

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  // Marketing copy is locked and structural — edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'content', title: 'Page copy' },
    { name: 'sections', title: 'Page sections' },
    // removed empty interior-designer scheduling group during church remodel
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'Browser tab and Google result title. Aim for 50 to 60 characters. Front-load the location or service.',
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

    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero', initialValue: 'Contact' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string', group: 'hero', initialValue: 'Start the Conversation.' }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 2, group: 'hero' }),
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
      description: 'Full-bleed photo behind the hero text. Pick a landscape shot; the page applies a dark gradient over the bottom for readability.',
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
      description: 'Internal-only reminder for editors. Anything you write here stays in Studio and never renders on the live page.',
    }),
    // removed whoToReachLabel, contactReasons, gettingHereLabel, gettingHereBody
    // and formSectionHeadline 2026-08-27: the `sectionContactDetails` and
    // `sectionForm` blocks in "Page sections" carry all five.
    defineField({ name: 'finalCtaEyebrow', title: 'Closing CTA eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'finalCtaHeadline', title: 'Closing CTA headline', type: 'string', group: 'content' }),
    defineField({ name: 'finalCtaSubhead', title: 'Closing CTA subhead', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'finalCta', title: 'Closing CTA button', type: 'ctaBlock', group: 'content', description: 'The button in the closing call-to-action band. Leave empty to use the built-in default button.' }),
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
  preview: { prepare: () => ({ title: 'Contact Page' }) },
});
