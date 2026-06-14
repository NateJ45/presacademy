// Per-page singletons for the school's pages (courses, faculty, pricing, get
// started, for you, resources). Built with the same small factory the church
// build used, so every page singleton stays identical in shape: a hero (image +
// eyebrow/headline/subhead/keyword), SEO, a flexibleSections page-builder array,
// and a closing-CTA button, plus per-page extras.
//
// To add another page: call definePageSingleton(...), then register the export
// in index.ts (schemaTypes), structure.ts (SINGLETON_TYPES + a Pages item) and
// sanity.config.ts (SINGLETON_TYPES set + urlForDoc case).

import { defineType, defineField, defineArrayMember } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS } from './blocks';

interface PageDefaults {
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSubhead?: string;
}

export function definePageSingleton(
  name: string,
  title: string,
  defaults: PageDefaults = {},
  extra: { groups?: { name: string; title: string }[]; fields?: any[] } = {},
) {
  return defineType({
    name,
    title,
    type: 'document',
    options: { canvasApp: { exclude: true } },
    groups: [
      { name: 'hero', title: 'Hero' },
      { name: 'sections', title: 'Page sections' },
      { name: 'seo', title: 'SEO' },
      ...(extra.groups ?? []),
    ],
    fields: [
      defineField({
        name: 'heroImage',
        title: 'Hero background image',
        type: 'image',
        group: 'hero',
        description:
          'Photo behind or beside the hero text. Leave empty to use the page default.',
        options: { hotspot: true },
        fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      }),
      defineField({
        name: 'heroEyebrow',
        title: 'Hero eyebrow',
        type: 'string',
        group: 'hero',
        description: 'Small label above the headline. Leave empty to use the default.',
        initialValue: defaults.heroEyebrow,
      }),
      defineField({
        name: 'heroHeadline',
        title: 'Hero headline',
        type: 'string',
        group: 'hero',
        description: 'The big line. Leave empty to use the default.',
        initialValue: defaults.heroHeadline,
      }),
      defineField({
        name: 'heroSubhead',
        title: 'Hero subhead',
        type: 'text',
        rows: 3,
        group: 'hero',
        description: 'One or two sentences under the headline. Leave empty to use the default.',
        initialValue: defaults.heroSubhead,
      }),
      defineField({
        name: 'heroKeyword',
        title: 'Hero keyword (accent)',
        type: 'string',
        group: 'hero',
        description:
          'One word or short phrase from the headline to set in the brand accent color. It must match the headline exactly, including capitals. Leave empty for a single-color headline.',
      }),
      defineField({
        name: 'seoTitle',
        title: 'SEO title',
        type: 'string',
        group: 'seo',
        description: 'Browser tab + Google result title. Aim for 50 to 60 characters.',
        validation: (Rule) => Rule.max(60).warning('Titles longer than ~60 characters get cut off in Google.'),
      }),
      defineField({
        name: 'seoDescription',
        title: 'SEO description',
        type: 'text',
        rows: 3,
        group: 'seo',
        description: 'The sentence under the title in Google results. Aim for 150 to 160 characters.',
        validation: (Rule) => Rule.max(160).warning('Descriptions longer than ~160 characters get cut off in Google.'),
      }),
      defineField({
        name: 'seoImage',
        title: 'Social share image (this page)',
        type: 'image',
        group: 'seo',
        description: 'Optional. Shown when this page is shared. ~1200x630. Overrides the site default.',
        options: { hotspot: true },
        fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      }),
      defineField({
        name: 'flexibleSections',
        title: 'Page sections',
        type: 'array',
        group: 'sections',
        description: 'Add on-brand sections to this page. They render below the built-in page content. Drag to reorder.',
        of: FLEXIBLE_SECTION_MEMBERS,
      }),
      defineField({
        name: 'finalCta',
        title: 'Closing CTA button',
        type: 'ctaBlock',
        group: 'sections',
        description: 'The button in the closing call-to-action band at the bottom of the page. Leave empty to use the built-in default.',
      }),
      ...(extra.fields ?? []),
    ],
    preview: { prepare: () => ({ title }) },
  });
}

// Shared closing-CTA text fields (the band copy above the finalCta button).
const finalCtaText = (group = 'content') => [
  defineField({ name: 'finalCtaEyebrow', title: 'Closing CTA eyebrow', type: 'string', group }),
  defineField({ name: 'finalCtaHeadline', title: 'Closing CTA headline', type: 'string', group }),
  defineField({ name: 'finalCtaSubhead', title: 'Closing CTA subhead', type: 'text', rows: 2, group }),
];

export const coursesPage = definePageSingleton('coursesPage', 'Courses', {
  heroEyebrow: 'Catalog',
  heroHeadline: 'Courses',
  heroSubhead: 'Reformed formation taught in person, in cohorts. Browse by topic or teacher.',
}, {
  groups: [{ name: 'content', title: 'Page copy' }],
  fields: [
    defineField({ name: 'catalogIntro', title: 'Catalog intro', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'startHereEyebrow', title: '"Start here" eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'startHereHeadline', title: '"Start here" headline', type: 'string', group: 'content' }),
    defineField({ name: 'emptyState', title: 'Empty-state line', type: 'string', description: 'Shown when no courses match the filters.', group: 'content' }),
    ...finalCtaText(),
  ],
});

export const facultyPage = definePageSingleton('facultyPage', 'Faculty', {
  heroEyebrow: 'The faculty',
  heroHeadline: 'Taught by ministers and scholars',
  heroSubhead: 'Every course is led by an ordained minister or a credentialed Reformed scholar.',
}, {
  groups: [{ name: 'content', title: 'Page copy' }],
  fields: [
    defineField({ name: 'directoryIntro', title: 'Directory intro', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'aggregateTrustLine', title: 'Aggregate trust line', type: 'string', description: 'Example: "Every teacher is an ordained PC(USA) minister or a credentialed Reformed scholar."', group: 'content' }),
    defineField({ name: 'emptyState', title: 'Empty-state line', type: 'text', rows: 2, description: 'Shown when no faculty have been added yet.', group: 'content' }),
    ...finalCtaText(),
  ],
});

export const pricingPage = definePageSingleton('pricingPage', 'Pricing & Scholarships', {
  heroEyebrow: 'Tuition',
  heroHeadline: 'Pricing and scholarships',
  heroSubhead: 'What a course costs, said plainly, and how we keep formation within reach.',
}, {
  groups: [{ name: 'content', title: 'Page copy' }],
  fields: [
    defineField({ name: 'pricingIntro', title: 'Pricing intro', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'scholarshipEyebrow', title: 'Scholarships eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'scholarshipHeadline', title: 'Scholarships headline', type: 'string', group: 'content' }),
    defineField({ name: 'scholarshipBody', title: 'Scholarships body', type: 'text', rows: 4, group: 'content' }),
    defineField({ name: 'footnote', title: 'Footnote', type: 'text', rows: 2, group: 'content' }),
    ...finalCtaText(),
  ],
});

export const getStartedPage = definePageSingleton('getStartedPage', 'Get Started', {
  heroEyebrow: 'Get started',
  heroHeadline: 'Tell us what you want to learn',
  heroSubhead: 'Request information, book a free intro, or download a course syllabus. No application fee, no pressure.',
}, {
  groups: [{ name: 'form', title: 'Form & scheduling' }, { name: 'content', title: 'Page copy' }],
  fields: [
    defineField({ name: 'requestForm', title: 'Express-interest form', type: 'reference', to: [{ type: 'form' }], group: 'form', description: 'The request-info form. Leave empty to show a direct email link.' }),
    defineField({ name: 'calendlyUrl', title: 'Calendly URL', type: 'url', group: 'form', description: 'The free-intro booking link. Leave empty to use the site default (PUBLIC_CALENDLY_URL).' }),
    defineField({ name: 'requestEyebrow', title: 'Request-info panel eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'requestHeadline', title: 'Request-info panel headline', type: 'string', group: 'content' }),
    defineField({ name: 'requestBody', title: 'Request-info panel body', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'calendlyEyebrow', title: 'Free-intro eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'calendlyHeadline', title: 'Free-intro headline', type: 'string', group: 'content' }),
    defineField({ name: 'calendlyBody', title: 'Free-intro body', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'visitClassBody', title: '"Visit a class" body', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'syllabusBody', title: 'Syllabus-download body', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'stepsHeadline', title: 'What happens next headline', type: 'string', group: 'content' }),
    defineField({
      name: 'steps',
      title: 'What happens next',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'getStartedStep',
          fields: [
            defineField({ name: 'title', title: 'Step title', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'body', title: 'Step body', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        }),
      ],
    }),
    ...finalCtaText(),
  ],
});

export const forYouPage = definePageSingleton('forYouPage', 'For You', {
  heroEyebrow: 'Find your path',
  heroHeadline: 'Formation for where you are',
  heroSubhead: 'However you lead or learn, there is a starting point here for you.',
}, {
  groups: [{ name: 'content', title: 'Page copy' }],
  fields: [
    defineField({ name: 'personasIntro', title: 'Personas intro', type: 'text', rows: 2, group: 'content' }),
    defineField({
      name: 'personas',
      title: 'Personas',
      type: 'array',
      group: 'content',
      description: 'Each persona card: who it is for, a one-line promise, and a single CTA.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'persona',
          fields: [
            defineField({ name: 'label', title: 'Who it is for', type: 'string', validation: (R) => R.required(), description: 'Example: "The small-group leader".' }),
            defineField({ name: 'promise', title: 'One-line promise', type: 'text', rows: 2 }),
            defineField({ name: 'cta', title: 'CTA', type: 'ctaBlock' }),
          ],
          preview: { select: { title: 'label', subtitle: 'promise' } },
        }),
      ],
    }),
    ...finalCtaText(),
  ],
});

export const resourcesPage = definePageSingleton('resourcesPage', 'Resources', {
  heroEyebrow: 'Resources',
  heroHeadline: 'Teaching and formation essays',
  heroSubhead: 'Short reads from our faculty, free to everyone.',
}, {
  groups: [{ name: 'content', title: 'Page copy' }],
  fields: [
    defineField({ name: 'listIntro', title: 'List intro', type: 'text', rows: 2, group: 'content' }),
    ...finalCtaText(),
  ],
});

// Collected for easy registration in index.ts.
export const schoolPageSingletons = [
  coursesPage,
  facultyPage,
  pricingPage,
  getStartedPage,
  forYouPage,
  resourcesPage,
];

// Names, in desk order, for structure.ts + sanity.config.ts wiring.
export const SCHOOL_PAGE_TYPES = schoolPageSingletons.map((s) => s.name);
