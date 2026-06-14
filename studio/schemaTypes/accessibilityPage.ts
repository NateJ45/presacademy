// Accessibility statement page singleton. Route: /accessibility.
// Mirrors privacyPage: a Portable Text body + a "last reviewed" date, editable
// by the faculty. One instance only; singleton enforcement in sanity.config.ts.
//
// The site ships a complete, on-brand statement as a STATIC fallback in
// src/pages/accessibility.astro, so the page is live and accurate before this
// doc is ever created. Every field here is optional: an editor can override
// just the hero/SEO and keep the default body, or replace the whole statement.
// Safe to edit by hand.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS } from './blocks';

export const accessibilityPage = defineType({
  name: 'accessibilityPage',
  title: 'Accessibility Page',
  type: 'document',
  // Configuration, not prose the editor writes — exclude from Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'content', title: 'Content' },
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

    // Content
    defineField({
      name: 'lastUpdated',
      title: 'Last reviewed date',
      type: 'date',
      group: 'content',
      description: 'Shown at the top of the statement. Update it whenever you review or change the statement so visitors can see it is current.',
    }),
    defineField({
      name: 'body',
      title: 'Statement body',
      type: 'array',
      group: 'content',
      description: 'The full accessibility statement. Leave this empty to show the site\'s built-in default statement. Use headings (H2/H3) to organize sections.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL', validation: (R: any) => R.uri({ allowRelative: true }) },
                  { name: 'openInNewTab', type: 'boolean', title: 'Open in new tab', initialValue: false },
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'flexibleSections',
      title: 'Page sections',
      type: 'array',
      group: 'sections',
      description: 'Add on-brand sections to this page (text, image + text, cards, quote, CTA band, form, embed). They render below the statement. Drag to reorder.',
      of: FLEXIBLE_SECTION_MEMBERS,
    }),
  ],
  preview: { prepare: () => ({ title: 'Accessibility Page' }) },
});
