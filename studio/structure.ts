// Studio Desk structure. Pins Site Settings at the top, then ALL page singletons
// (one document each) under "Pages", then the catalog, people, and reusable
// content collections. Every document type is placed explicitly so nothing
// floats loose at the desk root. The trailing default-list filter is a safety
// net for any future type that hasn't been placed (and hides media.tag).
//
// Revamp note: the church singletons + collections (staffMember, ministry,
// sermon, worshipResource and the per-page church pages) were retired and
// replaced by the school catalog (course, facultyMember, term, pricingTier,
// teachingArea, testimonial) and the new page singletons.

import type { StructureBuilder, StructureResolverContext } from 'sanity/structure';
import GuideView from './components/GuideView';
import { guides } from './guides/content';
import {
  CogIcon,
  HomeIcon,
  UserIcon,
  UsersIcon,
  HelpCircleIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CalendarIcon,
  StarIcon,
  HeartIcon,
  ThListIcon,
  BookIcon,
  LockIcon,
  BellIcon,
  DocumentsIcon,
  TagIcon,
} from '@sanity/icons';

const SINGLETON_TYPES = [
  'siteSettings',
  // Core pages
  'homePage',
  'aboutPage',
  'faqPage',
  'contactPage',
  'eventsPage',
  'notFoundPage',
  'privacyPage',
  'accessibilityPage',
  // School page singletons
  'coursesPage',
  'facultyPage',
  'pricingPage',
  'getStartedPage',
  'forYouPage',
  'resourcesPage',
] as const;

const HIDDEN_FROM_DEFAULT = new Set<string>([
  ...SINGLETON_TYPES,
  // Collections placed explicitly below (so they don't double-show at the root).
  'faqCategory',
  'faqItem',
  'event',
  'form',
  'announcement',
  'page',
  // School catalog
  'course',
  'facultyMember',
  'term',
  'teachingArea',
  'pricingTier',
  'testimonial',
  // sanity-plugin-media registers this tag type; keep it out of the desk root
  // (the "Media" tool in the top sidebar is where tags belong).
  'media.tag',
]);

/**
 * A singleton desk item: one document, form view only. The static site has no
 * live draft preview, so we do NOT attach an iframe "Preview" view.
 */
function singleton(
  S: StructureBuilder,
  schemaType: string,
  title: string,
  icon: any,
) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(schemaType).documentId(schemaType));
}

/**
 * "How This Works" — a pinned, read-only help center built from repo data
 * (studio/guides/content.tsx), rendered by GuideView.
 */
function howThisWorks(S: StructureBuilder) {
  return S.listItem()
    .id('how-this-works')
    .title('How This Works')
    .icon(BookIcon)
    .child(
      S.list()
        .id('how-this-works-list')
        .title('How This Works')
        .items(
          guides.map((g) =>
            S.listItem()
              .id(`guide-${g.slug}`)
              .title(g.title)
              .icon(g.icon)
              .child(
                S.component(GuideView)
                  .id(`guide-view-${g.slug}`)
                  .title(g.title)
                  .options({ guideSlug: g.slug }),
              ),
          ),
        ),
    );
}

export const deskStructure = (S: StructureBuilder, _context: StructureResolverContext) =>
  S.list()
    .title('The Presbyterian Academy')
    .items([
      // How This Works — pinned help center (first thing editors see).
      howThisWorks(S),

      S.divider(),

      // Site Settings — pinned singleton (no preview; not a page)
      singleton(S, 'siteSettings', 'Site Settings', CogIcon),

      S.divider(),

      // Pages — every page singleton lives here.
      S.listItem()
        .title('Pages')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              singleton(S, 'homePage', 'Home', HomeIcon),
              singleton(S, 'coursesPage', 'Courses', BookIcon),
              singleton(S, 'facultyPage', 'Faculty', UsersIcon),
              singleton(S, 'aboutPage', 'About', UserIcon),

              S.divider(),

              singleton(S, 'eventsPage', 'Events (index page)', CalendarIcon),
              singleton(S, 'resourcesPage', 'Resources', DocumentsIcon),

              S.divider(),

              singleton(S, 'pricingPage', 'Pricing & Scholarships', StarIcon),
              singleton(S, 'getStartedPage', 'Get Started', EnvelopeIcon),
              singleton(S, 'forYouPage', 'For You', HeartIcon),

              S.divider(),

              singleton(S, 'faqPage', 'FAQ', HelpCircleIcon),
              singleton(S, 'contactPage', 'Contact', EnvelopeIcon),
              singleton(S, 'notFoundPage', '404 Page', DocumentTextIcon),
              singleton(S, 'privacyPage', 'Privacy Policy Page', LockIcon),
              singleton(S, 'accessibilityPage', 'Accessibility Page', HeartIcon),

              S.divider(),

              // Custom pages (collection): build new pages at /<slug> with blocks.
              S.documentTypeListItem('page').title('Custom Pages').icon(DocumentTextIcon),
            ]),
        ),

      S.divider(),

      // Catalog — the course library and its supporting types.
      S.listItem()
        .title('Catalog')
        .icon(BookIcon)
        .child(
          S.list()
            .title('Catalog')
            .items([
              S.documentTypeListItem('course').title('Courses').icon(BookIcon),
              S.documentTypeListItem('term').title('Terms').icon(CalendarIcon),
              S.documentTypeListItem('teachingArea').title('Teaching Areas').icon(ThListIcon),
              S.documentTypeListItem('pricingTier').title('Pricing Tiers').icon(TagIcon),
            ]),
        ),

      // People — faculty.
      S.documentTypeListItem('facultyMember').title('Faculty').icon(UsersIcon),

      S.divider(),

      // Content — reusable collections.
      S.listItem()
        .title('Content')
        .icon(ThListIcon)
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('testimonial').title('Testimonials').icon(StarIcon),
              S.documentTypeListItem('faqCategory').title('FAQ Categories').icon(HelpCircleIcon),
              S.documentTypeListItem('faqItem').title('FAQ Items').icon(HelpCircleIcon),
              S.documentTypeListItem('form').title('Forms').icon(EnvelopeIcon),
              S.documentTypeListItem('announcement').title('Announcements').icon(BellIcon),
            ]),
        ),

      S.divider(),

      // Events — info sessions, lectures, workshops, term starts shown on /events
      S.documentTypeListItem('event').title('Events').icon(CalendarIcon),

      // Safety net: surface any document type we have NOT explicitly placed above
      // (and keep the hidden set, including media.tag, out of the desk root).
      ...S.documentTypeListItems().filter((item) => !HIDDEN_FROM_DEFAULT.has(item.getId() as string)),
    ]);
