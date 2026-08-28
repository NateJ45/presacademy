// =============================================================================
// pageBuilderConfig — what this repo's pages are shaped like
// =============================================================================
// Three canonical Studio files need to know where a page keeps its sections and
// which addresses the site code owns: the "Check this page" action, the "Save a
// section as preset" action, and the Saved-sections panel in the navigator.
// Those files are byte-identical across every repo in the family (they carry
// the PORTABLE marker), so the repo-specific answers arrive from HERE, at a
// path every repo shares.
//
// NOT canonical on purpose. Editing this file is how this site adapts the
// feature; editing the canonical files is drift, and scripts/sync-check.mjs
// says so out loud.
// =============================================================================

import type { PageCheckConfig } from '../lib/page-checks';

/**
 * Every document type that carries a page-builder array, and the field a new
 * section is appended to. The "Save a section as preset" action is offered on
 * these types, and the navigator adds a saved section to whichever of them the
 * preview is showing.
 *
 * TWO FIELD NAMES, for one historical reason: the page singletons were built
 * with `flexibleSections` (see schemaTypes/schoolPages.ts and each singleton),
 * and the generic custom `page` type named its array `sections`. Both are the
 * same list of the same block types; only the field name differs.
 *
 * `notFoundPage` is absent: the 404 page has no sections array, it is a fixed
 * layout with editable copy. `eventsPage` is present, it does carry one.
 */
export const SECTION_HOST_TYPES: Readonly<Record<string, string>> = {
  page: 'sections',
  homePage: 'flexibleSections',
  aboutPage: 'flexibleSections',
  faqPage: 'flexibleSections',
  contactPage: 'flexibleSections',
  eventsPage: 'flexibleSections',
  privacyPage: 'flexibleSections',
  accessibilityPage: 'flexibleSections',
  coursesPage: 'flexibleSections',
  facultyPage: 'flexibleSections',
  pricingPage: 'flexibleSections',
  getStartedPage: 'flexibleSections',
  forYouPage: 'flexibleSections',
  resourcesPage: 'flexibleSections',
};

/** The same list as a set, for the document-actions resolver in sanity.config.ts. */
export const PAGE_BUILDER_TYPES = new Set<string>(Object.keys(SECTION_HOST_TYPES));

/**
 * Sections that fill THEMSELVES from a collection elsewhere in the Studio. A
 * faculty rail with no heading is not an empty section: its words live in the
 * Faculty list. Every one of these either fetches its own data in
 * src/components/blocks/ or renders from a referenced document.
 *
 * Keep roughly in step with src/sanity/schemaTypes/blocks.ts. A name that
 * drifts off this list only ever costs a false "worth a look", never a wrong
 * page.
 *
 * EXPORTED because src/lib/section-coach.ts needs the same answer: a section
 * that fills itself has nothing for the editor to type, so the preview must
 * never coach it. One list, two readers.
 */
export const SELF_FILLING_SECTIONS = [
  'sectionContactDetails',
  'sectionCourseRail',
  'sectionDynamicList',
  'sectionEventGrid',
  'sectionFacultyRail',
  'sectionFaqGrouped',
  'sectionFaqList',
  'sectionForm',
  'sectionPricingTiers',
  'sectionResources',
  'sectionRuledList',
  'sectionTestimonialRail',
];

export const PAGE_CHECK_CONFIG: PageCheckConfig = {
  // Both builder field names, so one config covers the singletons and the
  // custom `page` type. A document that has neither contributes no sections.
  sectionArrays: ['flexibleSections', 'sections'],
  header: {
    label: 'Hero (top banner)',
    // The singleton hero (schoolPages.ts) and the custom page hero (page.ts)
    // between them use these five field names.
    fields: ['heroImage', 'heroEyebrow', 'heroHeadline', 'heroSubhead', 'heroKeyword'],
    // NOT checked for emptiness on purpose. Every singleton hero falls back to
    // built-in copy when its fields are empty (see SingletonPage.astro's
    // heroFallbacks and the initialValues in schoolPages.ts), so a blank hero
    // is a normal, correct page here. Flagging it would be the false positive
    // that teaches an editor to click past the dialog.
    checkEmpty: false,
  },
  selfFillingSections: SELF_FILLING_SECTIONS,
  // Knob names this repo invents on top of the shared list in page-checks.ts.
  // `padding` and `tone` live inside every block's `background` object,
  // `imageSide` / `mediaSide` choose which way a two-column block faces, and
  // `surface` is the per-instance opt-out of the shared section shell.
  extraSettingKeys: ['accent', 'imageSide', 'mediaSide', 'padding', 'surface'],
  // Every address the SITE CODE owns rather than the page builder, plus the
  // folders the build writes into. A link to /courses or /events/harvest is
  // fine even though no `page` document holds that slug. Compare with
  // src/pages/ when a route is added.
  codeOwnedPaths: [
    '404',
    'about',
    'accessibility',
    'api',
    'contact',
    'courses',
    'events',
    'faculty',
    'faq',
    'for-you',
    'get-started',
    'pricing',
    'privacy',
    'resources',
    'style-guide',
    'preview',
    'studio',
    'og',
    'placeholders',
    '_astro',
    'robots.txt',
    'llms.txt',
    'llms-full.txt',
    'sitemap-index.xml',
    'sitemap-0.xml',
  ],
};
