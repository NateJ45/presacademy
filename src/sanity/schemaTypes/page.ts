// Generic page. Lets the secretary build a brand-new page (a stewardship
// campaign, a new ministry, an info page) with the shared block library and
// publish it at /<slug> with no developer. Existing fixed pages keep their own
// singletons; this is for one-off additions.

import { defineType, defineField } from 'sanity';
import { archivedField } from './archived';
import { FLEXIBLE_SECTION_MEMBERS, FLEXIBLE_SECTIONS_OPTIONS } from './blocks';
import { PUBLISH_AT_GROUP, publishAtField } from './_publishAt';
import { SEO_GROUP, seoFields } from './seo';

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  groups: [
    // No `default: true` → the form opens on the implicit "All fields" tab.
    { name: 'hero', title: 'Hero' },
    { name: 'content', title: 'Sections' },
    SEO_GROUP,
    PUBLISH_AT_GROUP,
  ],
  fields: [
    // Soft-delete flag (see ./archived.ts). Hidden; set by the trash actions.
    archivedField(),
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'hero',
      description: 'The page address, e.g. "stewardship" makes /stewardship.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string', group: 'hero' }),
    defineField({
      name: 'heroSubhead',
      title: 'Hero subhead',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero background image',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      description: 'Build the page from blocks. Add, remove, and drag to reorder.',
      of: FLEXIBLE_SECTION_MEMBERS,

      options: FLEXIBLE_SECTIONS_OPTIONS,
    }),
    ...seoFields({ group: 'seo' }),
    publishAtField(),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare: ({ title, slug }) => ({
      title: title || 'Page',
      subtitle: slug ? `/${slug}` : 'no slug yet',
    }),
  },
});
