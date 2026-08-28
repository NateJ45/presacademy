// Per-page singletons for the school's pages (courses, faculty, pricing, get
// started, for you, resources). Built with the same small factory the church
// build used, so every page singleton stays identical in shape: a hero (image +
// eyebrow/headline/subhead/keyword), SEO, a flexibleSections page-builder array,
// and a closing-CTA button, plus per-page extras.
//
// To add another page: call definePageSingleton(...), then register the export
// in index.ts (schemaTypes), structure.ts (SINGLETON_TYPES + a Pages item) and
// sanity.config.ts (SINGLETON_TYPES set + urlForDoc case).
//
// 2026-08-27 (Phase 5 of the page-builder conversion): the per-page "extras"
// slimmed right down. Every band of body copy these singletons used to carry
// (pricing's scholarship promise and stat band, get-started's request panel and
// steps, for-you's personas, courses' start-here rail) is a section block in
// `flexibleSections` now, seeded from the old fields by the seed-builder-*.mjs
// scripts and then unset from the dataset by scripts/cleanup-builder-fields.mjs.
// Get Started's whole "Form & scheduling" group went with them: the form
// reference and the Calendly URL are fields on its `sectionRequestPanel` block.
//
// What deliberately stayed: the hero fields, the closing-CTA fields, SEO, and
// the handful of extras a RENDERER still reads — `pricingIntro`,
// `personasIntro` and `listIntro` (the hero map's intro paragraph),
// `aggregateTrustLine` (the faculty hero's trust line), both `emptyState`
// fields and `emptyStateBody` (the pinned code regions), and the three
// `detail*` fields the course DETAIL route renders.

import { defineType, defineField } from 'sanity';
import {
  FLEXIBLE_SECTION_MEMBERS,
  FLEXIBLE_SECTIONS_DESCRIPTION,
  FLEXIBLE_SECTIONS_OPTIONS,
} from './blocks';
import { SEO_GROUP, seoFields } from './seo';

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
      SEO_GROUP,
      ...(extra.groups ?? []),
    ],
    fields: [
      defineField({
        name: 'heroImage',
        title: 'Hero background image',
        type: 'image',
        group: 'hero',
        description: 'Photo behind or beside the hero text. Leave empty to use the page default.',
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
      ...seoFields({ group: 'seo', imageTitle: 'Social share image (this page)' }),
      defineField({
        name: 'flexibleSections',
        title: 'Page sections',
        type: 'array',
        group: 'sections',
        description: FLEXIBLE_SECTIONS_DESCRIPTION,
        of: FLEXIBLE_SECTION_MEMBERS,

        options: FLEXIBLE_SECTIONS_OPTIONS,
      }),
      defineField({
        name: 'finalCta',
        title: 'Closing CTA button',
        type: 'ctaBlock',
        group: 'sections',
        description:
          'The button in the closing call-to-action band at the bottom of the page. Leave empty to use the built-in default.',
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
  defineField({
    name: 'finalCtaSubhead',
    title: 'Closing CTA subhead',
    type: 'text',
    rows: 2,
    group,
  }),
];

export const coursesPage = definePageSingleton(
  'coursesPage',
  'Courses',
  {
    heroEyebrow: 'Catalog',
    heroHeadline: 'Courses',
    heroSubhead: 'Reformed formation taught in person, in cohorts. Browse by topic or teacher.',
  },
  {
    groups: [{ name: 'content', title: 'Page copy' }],
    fields: [
      defineField({
        name: 'catalogIntro',
        title: 'Catalog intro',
        type: 'text',
        rows: 2,
        group: 'content',
      }),
      defineField({
        name: 'emptyState',
        title: 'Empty-state line',
        type: 'string',
        description: 'Shown when no courses match the filters.',
        group: 'content',
      }),
      defineField({
        name: 'detailTrustLine',
        title: 'Course page: trust line',
        type: 'string',
        description:
          'The reassurance line under the buttons on a single course page. Example: "You can visit the first session free before you decide."',
        group: 'content',
      }),
      defineField({
        name: 'detailExpressLabel',
        title: 'Course page: primary button',
        type: 'string',
        description: 'The main aside button on a course page. Leave empty for "Express interest".',
        group: 'content',
      }),
      defineField({
        name: 'detailRequestLabel',
        title: 'Course page: secondary button',
        type: 'string',
        description:
          'The secondary aside button on a course page. Leave empty for "Request information".',
        group: 'content',
      }),
      ...finalCtaText(),
    ],
  },
);

export const facultyPage = definePageSingleton(
  'facultyPage',
  'Faculty',
  {
    heroEyebrow: 'The faculty',
    heroHeadline: 'Taught by ministers and scholars',
    heroSubhead: 'Every course is led by an ordained minister or a credentialed Reformed scholar.',
  },
  {
    groups: [{ name: 'content', title: 'Page copy' }],
    fields: [
      defineField({
        name: 'directoryIntro',
        title: 'Directory intro',
        type: 'text',
        rows: 2,
        group: 'content',
      }),
      defineField({
        name: 'aggregateTrustLine',
        title: 'Aggregate trust line',
        type: 'string',
        description:
          'Example: "Every teacher is an ordained PC(USA) minister or a credentialed Reformed scholar."',
        group: 'content',
      }),
      defineField({
        name: 'emptyState',
        title: 'Empty-state line',
        type: 'text',
        rows: 2,
        description: 'Shown when no faculty have been added yet.',
        group: 'content',
      }),
      ...finalCtaText(),
    ],
  },
);

export const pricingPage = definePageSingleton(
  'pricingPage',
  'Pricing & Scholarships',
  {
    heroEyebrow: 'Tuition',
    heroHeadline: 'Pricing and scholarships',
    heroSubhead: 'What a course costs, said plainly, and how we keep formation within reach.',
  },
  {
    groups: [{ name: 'content', title: 'Page copy' }],
    fields: [
      defineField({
        name: 'pricingIntro',
        title: 'Pricing intro',
        type: 'text',
        rows: 2,
        group: 'content',
      }),
      ...finalCtaText(),
    ],
  },
);

export const getStartedPage = definePageSingleton(
  'getStartedPage',
  'Get Started',
  {
    heroEyebrow: 'Get started',
    heroHeadline: 'Tell us what you want to learn',
    heroSubhead:
      'Request information, book a free intro, or download a course syllabus. No application fee, no pressure.',
  },
  {
    groups: [{ name: 'content', title: 'Page copy' }],
    fields: [
      // The request panel (form reference, Calendly URL, all its copy) and the
      // "what happens next" steps are Page sections blocks now (2026-08-27).
      ...finalCtaText(),
    ],
  },
);

export const forYouPage = definePageSingleton(
  'forYouPage',
  'For You',
  {
    heroEyebrow: 'Find your path',
    heroHeadline: 'Formation for where you are',
    heroSubhead: 'However you lead or learn, there is a starting point here for you.',
  },
  {
    groups: [{ name: 'content', title: 'Page copy' }],
    fields: [
      defineField({
        name: 'personasIntro',
        title: 'Personas intro',
        type: 'text',
        rows: 2,
        group: 'content',
      }),
      // The persona cards themselves are a Page sections block now (2026-08-27).
      ...finalCtaText(),
    ],
  },
);

export const resourcesPage = definePageSingleton(
  'resourcesPage',
  'Resources',
  {
    heroEyebrow: 'Resources',
    heroHeadline: 'Teaching and formation essays',
    heroSubhead: 'Short reads from our faculty, free to everyone.',
  },
  {
    groups: [{ name: 'content', title: 'Page copy' }],
    fields: [
      defineField({
        name: 'listIntro',
        title: 'List intro',
        type: 'text',
        rows: 2,
        group: 'content',
      }),
      defineField({
        name: 'emptyStateBody',
        title: 'Empty-state body',
        type: 'text',
        rows: 2,
        description: 'Shown when there are no resources or sections added yet.',
        group: 'content',
      }),
      ...finalCtaText(),
    ],
  },
);

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
