// Home page singleton — the lay-school home. Holds the hero, the built-in section
// copy (wayfinding, the stat band, the topics ticker, and the eyebrow/heading
// labels around the Start-here / Courses / Faculty / Testimonials strips), and the
// closing CTA. The strips' CARDS come from the catalog collections (courses,
// faculty, testimonials); the fields here are only the surrounding copy.
//
// Every field falls back to the literal in src/pages/index.astro when left empty,
// so the live design is unchanged until an editor overrides it. The church-era
// fields (Sunday worship band, weekly rhythms, "The Record", Welcome section,
// seasonal hero, etc.) were removed in the 2026-06 editability pass — the home
// document held no data in them, so removal is clean (no "unknown field" warnings).

import { defineType, defineField, defineArrayMember } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS } from './blocks';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  // Marketing copy is structural — edit fields directly in Studio, not Canvas.
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
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero', description: 'Small label above the headline. Leave empty for the default.' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string', group: 'hero', description: 'The big opening line. Leave empty for the default.', validation: (Rule) => Rule.required() }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 3, group: 'hero', description: 'One or two sentences under the headline.' }),
    defineField({
      name: 'heroImages',
      title: 'Hero image(s)',
      type: 'array',
      group: 'hero',
      description: 'The photo beside the hero text. Add one for a static image, or two or more for a slow cross-fading slideshow. Drag to set the order.',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })] })],
    }),
    defineField({ name: 'heroPrimaryLabel', title: 'Hero primary button', type: 'string', group: 'hero', description: 'The filled button label (links to the Courses page). Leave empty for "Browse courses".' }),
    defineField({ name: 'heroSecondaryLabel', title: 'Hero secondary button', type: 'string', group: 'hero', description: 'The outlined button label (links to Get Started). Leave empty for "Book a free intro".' }),
    defineField({ name: 'nextCohortLabel', title: '"Next cohort" label', type: 'string', group: 'hero', description: 'The small label before the next-term date under the hero. The date, term, and city come from the Term and Site Settings, not here. Leave empty for "Next cohort begins".' }),

    // ---- Page copy ----
    defineField({
      name: 'wayfinding',
      title: 'Wayfinding steps',
      type: 'array',
      group: 'content',
      description: 'The "where to begin" row under the hero. Numbered automatically (01, 02, ...). Leave empty for the built-in four.',
      of: [defineArrayMember({
        type: 'object',
        name: 'wayfindingStep',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'body', title: 'One-line description', type: 'string' }),
          defineField({ name: 'href', title: 'Link', type: 'string', description: 'An internal path like /courses, or a full URL.' }),
        ],
        preview: { select: { title: 'title', subtitle: 'href' } },
      })],
    }),
    defineField({ name: 'startHereEyebrow', title: 'Start-here — eyebrow', type: 'string', group: 'content', description: 'Label over the "a few courses to begin with" rail. Leave empty for "Start here".' }),
    defineField({ name: 'startHereHeadline', title: 'Start-here — headline', type: 'string', group: 'content' }),
    defineField({
      name: 'stats',
      title: 'Stat band',
      type: 'array',
      group: 'content',
      description: 'The at-a-glance figures band. Each is a big value + a label. Leave empty for the built-in four.',
      of: [defineArrayMember({
        type: 'object',
        name: 'stat',
        fields: [
          defineField({ name: 'value', title: 'Value', type: 'string', validation: (Rule) => Rule.required(), description: 'e.g. "100%", "In person", "Need-based".' }),
          defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'count', title: 'Count up on scroll', type: 'boolean', initialValue: false, description: 'Animate the number counting up. Only works for number values like "100%".' }),
        ],
        preview: { select: { title: 'value', subtitle: 'label' } },
      })],
    }),
    defineField({
      name: 'tickerTopics',
      title: 'Topics ticker',
      type: 'array',
      group: 'content',
      description: 'The slowly-scrolling list of subjects the Academy teaches (decorative). Leave empty for the built-in list.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({ name: 'coursesEyebrow', title: 'Courses strip — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'coursesHeadline', title: 'Courses strip — headline', type: 'string', group: 'content' }),
    defineField({ name: 'coursesLinkLabel', title: 'Courses strip — link label', type: 'string', group: 'content', description: 'The "see all" link. Leave empty for "See all courses".' }),
    defineField({ name: 'facultyEyebrow', title: 'Faculty strip — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'facultyHeadline', title: 'Faculty strip — headline', type: 'string', group: 'content' }),
    defineField({ name: 'facultyLinkLabel', title: 'Faculty strip — link label', type: 'string', group: 'content', description: 'Leave empty for "Meet the faculty".' }),
    defineField({ name: 'testimonialsEyebrow', title: 'Testimonials strip — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'testimonialsHeadline', title: 'Testimonials strip — headline', type: 'string', group: 'content' }),

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
      description: 'Shown when the home page is shared on social media. Use a wide image, about 1200 by 630 pixels. Overrides the site default in Site Settings.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
  ],
  preview: { prepare: () => ({ title: 'Home Page' }) },
});
