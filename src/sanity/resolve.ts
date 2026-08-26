import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from 'sanity/presentation';

// =============================================================================
// Presentation Tool location resolver (ported from the WCP site, 2026-08-25)
// =============================================================================
// Two halves:
//
//  - `mainDocuments` (URL -> document): as you click through the preview iframe
//    like a normal website, Presentation opens the matching document in the
//    editor panel automatically. Routes match the iframe pathname (which lives
//    under /preview). Order matters: the singleton routes come before the
//    catch-all `page` route.
//
//  - `locations` (document -> URL): the reverse, so opening a document from the
//    desk points the preview at the right page. Singletons map to their fixed
//    preview path; `page` docs resolve from the slug. Collection docs (course,
//    faculty, event) have no dedicated draft-preview route yet, so they land on
//    their index page's preview with a message.
//
// The preview routes themselves live in the site app: src/pages/preview/.
// =============================================================================

// The 14 path-mapped singletons: preview path per type. Keep in sync with
// pathForDoc in sanity.config.ts and the SINGLETON_PREVIEW map in the site's
// src/pages/preview/[...slug].astro.
export const SINGLETON_PREVIEW_PATHS: Record<string, string> = {
  homePage: '/preview',
  aboutPage: '/preview/about',
  faqPage: '/preview/faq',
  contactPage: '/preview/contact',
  privacyPage: '/preview/privacy',
  accessibilityPage: '/preview/accessibility',
  eventsPage: '/preview/events',
  coursesPage: '/preview/courses',
  facultyPage: '/preview/faculty',
  pricingPage: '/preview/pricing',
  getStartedPage: '/preview/get-started',
  forYouPage: '/preview/for-you',
  resourcesPage: '/preview/resources',
  notFoundPage: '/preview/404',
};

const previewHref = (slug?: string) => (slug === 'home' ? '/preview' : `/preview/${slug}`);

// One static location entry per singleton.
const singletonLocations = Object.fromEntries(
  Object.entries(SINGLETON_PREVIEW_PATHS).map(([type, href]) => [
    type,
    { locations: [{ title: 'Preview', href }] },
  ]),
);

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    { route: '/preview', filter: '_type == "homePage"' },
    // Singleton routes before the generic :slug catch-all.
    ...Object.entries(SINGLETON_PREVIEW_PATHS)
      .filter(([type]) => type !== 'homePage')
      .map(([type, href]) => ({ route: href, filter: `_type == "${type}"` })),
    { route: '/preview/:slug', filter: '_type == "page" && slug.current == $slug' },
  ]),
  locations: {
    ...singletonLocations,
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => {
        const slug = doc?.slug;
        if (!slug) return { locations: [], message: 'Give this page a slug to preview it.' };
        return { locations: [{ title: doc?.title ?? slug, href: previewHref(slug) }] };
      },
    }),
    // Collection docs: no dedicated draft preview yet — land on the index
    // page's preview, where the auto-updating catalog sections show them.
    course: {
      locations: [{ title: 'Course catalog', href: '/preview/courses' }],
      message: 'Course detail pages preview on the live site after publish.',
    },
    facultyMember: {
      locations: [{ title: 'Faculty', href: '/preview/faculty' }],
      message: 'Faculty profiles preview on the live site after publish.',
    },
    event: {
      locations: [{ title: 'Events', href: '/preview/events' }],
      message: 'Event detail pages preview on the live site after publish.',
    },
    faqItem: { locations: [{ title: 'FAQ', href: '/preview/faq' }] },
    faqCategory: { locations: [{ title: 'FAQ', href: '/preview/faq' }] },
    pricingTier: { locations: [{ title: 'Pricing', href: '/preview/pricing' }] },
    testimonial: { locations: [{ title: 'Home', href: '/preview' }] },
    term: { locations: [{ title: 'Home', href: '/preview' }] },
    siteSettings: { locations: [{ title: 'Home', href: '/preview' }] },
  },
};
