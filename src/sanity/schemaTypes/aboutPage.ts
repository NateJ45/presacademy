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
import { FLEXIBLE_SECTION_MEMBERS, FLEXIBLE_SECTIONS_DESCRIPTION, FLEXIBLE_SECTIONS_OPTIONS } from './blocks';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'sections', title: 'Page sections' },
    { name: 'final', title: 'Final CTA' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ---- Hero ----
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero', description: 'Small label above the headline.' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string', group: 'hero', description: 'The big opening line.', validation: (Rule) => Rule.required() }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 3, group: 'hero' }),

    // ---- Page sections ----
    // The whole body of the About page lives here now (2026-08-27, Phase 5).
    // The "why we exist" copy names the funder (the Presbytery of Cincinnati);
    // it is a section block's field today, so update it there.
    defineField({ name: 'flexibleSections', title: 'Page sections', type: 'array', group: 'sections', description: FLEXIBLE_SECTIONS_DESCRIPTION, of: FLEXIBLE_SECTION_MEMBERS, options: FLEXIBLE_SECTIONS_OPTIONS }),

    // ---- Final CTA ----
    defineField({ name: 'finalCtaEyebrow', title: 'Final CTA — eyebrow', type: 'string', group: 'final' }),
    defineField({ name: 'finalCtaHeadline', title: 'Final CTA — headline', type: 'string', group: 'final' }),
    defineField({ name: 'finalCtaSubhead', title: 'Final CTA — subhead', type: 'text', rows: 2, group: 'final' }),
    defineField({ name: 'finalCta', title: 'Final CTA — button', type: 'ctaBlock', group: 'final' }),
    defineField({
      name: 'finalCtaBackgroundImage',
      title: 'Final CTA — background image (optional)',
      type: 'image',
      group: 'final',
      options: { hotspot: true },
      description: 'Optional photo behind the closing call-to-action. Auto-darkened so the text stays readable. Leave empty for the solid panel.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    // ---- SEO ----
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo', description: 'Browser tab + Google result title. Aim for 50 to 60 characters.', validation: (Rule) => Rule.max(60).warning('Titles longer than about 60 characters get cut off in Google search results.') }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo', description: 'The sentence under the title in Google results. Aim for 150 to 160 characters.', validation: (Rule) => Rule.max(160).warning('Descriptions longer than about 160 characters get cut off in Google search results.') }),
    defineField({
      name: 'seoImage',
      title: 'Social share image',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      description: 'Shown when the About page is shared. Use a wide image, about 1200 by 630 pixels. Overrides the site default in Site Settings.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
  ],
  preview: { prepare: () => ({ title: 'About Page' }) },
});
