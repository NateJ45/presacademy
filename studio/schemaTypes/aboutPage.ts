// About page singleton — the school's identity page. Hero + the editorial body
// (mission, the "what we believe" distinctives, how we teach, why we exist, and
// the faculty band) + closing CTA. Every field falls back to the literal in
// src/pages/about.astro when empty, so the live design is unchanged until edited.
//
// The church / template-era fields (the building, who-we-are, mural + feature
// photos, hero image, hero/CTA script accents) were removed in the 2026-06
// editability pass; the about document held no data in them, so removal is clean
// (no "unknown field" warnings).

import { defineType, defineField, defineArrayMember } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS } from './blocks';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'content', title: 'Page copy' },
    { name: 'sections', title: 'Page sections' },
    { name: 'final', title: 'Final CTA' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ---- Hero ----
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero', description: 'Small label above the headline.' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string', group: 'hero', description: 'The big opening line.', validation: (Rule) => Rule.required() }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 3, group: 'hero' }),

    // ---- Page copy ----
    // Mission
    defineField({ name: 'missionEyebrow', title: 'Mission — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'missionStatement', title: 'Mission — statement', type: 'text', rows: 3, group: 'content', description: 'The big mission line.' }),
    defineField({ name: 'missionBody', title: 'Mission — body', type: 'text', rows: 4, group: 'content' }),
    // What we believe
    defineField({ name: 'believeEyebrow', title: 'What we believe — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'believeHeadline', title: 'What we believe — headline', type: 'string', group: 'content' }),
    defineField({
      name: 'beliefs',
      title: 'What we believe — points',
      type: 'array',
      group: 'content',
      description: 'The distinctives, numbered automatically (01, 02, ...). Leave empty for the built-in four.',
      of: [defineArrayMember({
        type: 'object',
        name: 'belief',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'body', title: 'Body', type: 'text', rows: 2 }),
        ],
        preview: { select: { title: 'title', subtitle: 'body' } },
      })],
    }),
    defineField({ name: 'believeFootnote', title: 'What we believe — footnote', type: 'text', rows: 2, group: 'content', description: 'The standards line under the points.' }),
    // How we teach
    defineField({ name: 'teachEyebrow', title: 'How we teach — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'teachHeadline', title: 'How we teach — headline', type: 'string', group: 'content' }),
    defineField({ name: 'teachBody', title: 'How we teach — body', type: 'text', rows: 4, group: 'content' }),
    // Why we exist
    defineField({ name: 'whyEyebrow', title: 'Why we exist — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'whyHeadline', title: 'Why we exist — headline', type: 'string', group: 'content' }),
    defineField({ name: 'whyBody', title: 'Why we exist — body', type: 'text', rows: 4, group: 'content', description: 'Names the funder (the Presbytery of Cincinnati). Update if the funding arrangement changes.' }),
    // Faculty band
    defineField({ name: 'facultyBandEyebrow', title: 'Faculty band — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'facultyBandHeadline', title: 'Faculty band — headline', type: 'string', group: 'content' }),
    defineField({ name: 'facultyBandCtaLabel', title: 'Faculty band — button label', type: 'string', group: 'content', description: 'The button links to the Faculty page. Leave empty for "Meet the faculty".' }),

    // ---- Page sections ----
    defineField({ name: 'flexibleSections', title: 'Page sections', type: 'array', group: 'sections', description: 'Add on-brand sections below the built-in content. Drag to reorder.', of: FLEXIBLE_SECTION_MEMBERS }),

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
