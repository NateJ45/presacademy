// Studio Desk structure. Pins the Welcome landing pane and the "How This Works"
// help center on top, then Site Settings, all page singletons under "Pages",
// then the catalog, people, and reusable content collections. Every document
// type is placed explicitly so nothing floats loose at the desk root; the
// trailing default-list filter is a safety net for any future type that hasn't
// been placed (and hides media.tag).
//
// Two conventions the rest of the Studio leans on:
//  - Pane IDS are load-bearing: guide "Take me there" cards and Welcome task
//    cards navigate to `structure/<id>` paths (nested panes join with ';', e.g.
//    'catalog;course'). Rename an id here and grep guides/content.tsx +
//    components/WelcomePane.tsx for it.
//  - Every collection list filters `archived != true` (the soft-delete flag,
//    schemaTypes/archived.ts); trashed docs surface only in "Recently deleted"
//    at the bottom, where the Restore / Delete forever actions live.

import type { StructureBuilder, StructureResolverContext } from 'sanity/structure';
import type { ComponentType } from 'react';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { makeGuideView } from './components/GuideView';
import { WelcomePane } from './components/WelcomePane';
import { guides, GUIDE_CATEGORIES } from './guides/content';
import { ARCHIVABLE_TYPES, NOT_ARCHIVED } from './schemaTypes/archived';
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
  TrashIcon,
  CommentIcon,
  BlockElementIcon,
  ArrowRightIcon,
} from '@sanity/icons';

const API_VERSION = '2025-01-01';

// Guide icons are emoji strings (friendly, and they match the guide data).
const emoji =
  (glyph: string): ComponentType =>
  () =>
    glyph;

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
  // Saved sections + redirects (both placed under Pages below).
  'sectionPreset',
  'redirect',
  // sanity-plugin-media registers this tag type; keep it out of the desk root
  // (the "Media" tool in the top sidebar is where tags belong).
  'media.tag',
]);

/**
 * A singleton desk item: one document, form view only. The static site has no
 * live draft preview, so we do NOT attach an iframe "Preview" view.
 */
function singleton(S: StructureBuilder, schemaType: string, title: string, icon: any) {
  return S.listItem()
    .title(title)
    .id(schemaType)
    .icon(icon)
    .child(S.document().schemaType(schemaType).documentId(schemaType));
}

/**
 * A collection list that keeps soft-deleted documents out of sight. Falls back
 * to the plain documentTypeList for types without the archived flag.
 */
function collection(S: StructureBuilder, schemaType: string, title: string, icon: any) {
  if (!ARCHIVABLE_TYPES.has(schemaType)) {
    return S.documentTypeListItem(schemaType).title(title).icon(icon);
  }
  return S.listItem()
    .id(schemaType)
    .title(title)
    .icon(icon)
    .child(
      S.documentTypeList(schemaType)
        .id(schemaType)
        .title(title)
        .filter(`_type == $type && ${NOT_ARCHIVED}`)
        .params({ type: schemaType })
        .apiVersion(API_VERSION),
    );
}

// =============================================================================
// Year-scoped Events (ported from the WCP site's yearScopedList, 2026-08-31)
// =============================================================================
// Events accumulate forever. A flat list means a year-three editor scrolls
// past dozens of dead rows to find this term's — so Events opens as "This
// school year" (the default view) plus one pane per past year, with an
// Everything list at the bottom. Nothing moves or archives; this is
// presentation only, and every pane keeps soft-deleted events out of sight
// (NOT_ARCHIVED, same as collection()). School years run Aug 1 – Jul 31 and
// are named by their fall ("2026–27").
const FIRST_CONTENT_YEAR = 2026; // the site's first events

const currentFallYear = (): number => {
  const d = new Date();
  return d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1; // Aug+ = this fall
};
const yearLabel = (y: number): string => `${y}–${String((y + 1) % 100).padStart(2, '0')}`;

function yearScopedEvents(S: StructureBuilder, icon: any) {
  const fall = currentFallYear();
  // Undated events fall back to _createdAt so nothing ever hides.
  const filter = `_type == "event" && ${NOT_ARCHIVED} && coalesce(start, _createdAt) >= $from && coalesce(start, _createdAt) < $to`;

  const yearPane = (y: number, paneTitle: string) =>
    S.listItem()
      .id(`year-${y}`)
      .title(paneTitle)
      .icon(icon)
      .child(
        S.documentList()
          .id(`year-${y}`)
          .title(paneTitle)
          .schemaType('event')
          .filter(filter)
          .params({ from: `${y}-08-01`, to: `${y + 1}-08-01` })
          .apiVersion(API_VERSION)
          .defaultOrdering([{ field: 'start', direction: 'asc' }]),
      );

  const past: ReturnType<typeof yearPane>[] = [];
  for (let y = fall - 1; y >= FIRST_CONTENT_YEAR; y--) past.push(yearPane(y, yearLabel(y)));

  // .id('event') keeps the pane's address identical to the old flat list, so
  // guide links and bookmarks still land here.
  return S.listItem()
    .id('event')
    .title('Events')
    .icon(icon)
    .child(
      S.list()
        .id('event')
        .title('Events')
        .items([
          yearPane(fall, `This school year (${yearLabel(fall)})`),
          ...(past.length > 0 ? [S.divider().title('Past years'), ...past] : []),
          S.divider(),
          S.listItem()
            .id('everything')
            .title('Everything (all years)')
            .icon(icon)
            .child(
              S.documentTypeList('event')
                .id('everything')
                .title('Events')
                .filter(`_type == "event" && ${NOT_ARCHIVED}`)
                .apiVersion(API_VERSION),
            ),
        ]),
    );
}

/**
 * "How This Works" — a pinned, read-only help center built from repo data
 * (studio/guides/content.tsx), rendered by GuideView. Guides are grouped under
 * titled dividers by category (GUIDE_CATEGORIES order).
 */
function howThisWorks(S: StructureBuilder) {
  const guideItem = (g: (typeof guides)[number]) =>
    S.listItem()
      .id(`guide-${g.slug}`)
      .title(g.title)
      .icon(emoji(g.icon))
      .child(
        // Cast: our pane ignores props, but S.component wants the pane type.
        S.component(makeGuideView(g.slug) as never)
          .id(`guide-view-${g.slug}`)
          .title(g.title),
      );
  return S.listItem()
    .id('how-this-works')
    .title('How This Works')
    .icon(BookIcon)
    .child(
      S.list()
        .id('how-this-works-list')
        .title('How This Works')
        .items(
          GUIDE_CATEGORIES.flatMap((category) => [
            S.divider().title(category),
            ...guides.filter((g) => g.category === category).map(guideItem),
          ]),
        ),
    );
}

// The Welcome landing pane — the first thing an editor sees.
function welcomeItem(S: StructureBuilder) {
  return S.listItem()
    .id('welcome')
    .title('Welcome')
    .icon(HomeIcon)
    .child(
      S.component(WelcomePane as never)
        .id('welcome-pane')
        .title('Welcome'),
    );
}

export const deskStructure = (S: StructureBuilder, context: StructureResolverContext) =>
  S.list()
    .title('The Presbyterian Academy')
    .items([
      // Welcome + How This Works — pinned on top.
      welcomeItem(S),
      howThisWorks(S),

      S.divider(),

      // Site Settings — pinned singleton (no preview; not a page)
      singleton(S, 'siteSettings', 'Site Settings', CogIcon),

      S.divider(),

      // Pages — every page singleton lives here.
      S.listItem()
        .title('Pages')
        .id('pages')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .id('pages')
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
              collection(S, 'page', 'Custom Pages', DocumentTextIcon),

              S.divider(),

              // Saved sections: bands kept from one page, ready to drop on
              // another. They sit under Pages because that is the only place
              // they are ever used. Made with "Save a section as preset..." in a
              // page's publish menu; added from the Saved sections group beside
              // the live preview.
              collection(S, 'sectionPreset', 'Saved Sections', BlockElementIcon),

              S.divider(),

              // Redirects: old address -> new address. Most entries are filed
              // automatically when a page's web address changes on publish
              // (components/slugRedirect.tsx); the editor adds one by hand for
              // an address that never existed on this site (a link from an old
              // site, or a printed card).
              S.documentTypeListItem('redirect')
                .title('Redirects (old links)')
                .icon(ArrowRightIcon),
            ]),
        ),

      S.divider(),

      // Catalog — the course library and its supporting types.
      S.listItem()
        .title('Catalog')
        .id('catalog')
        .icon(BookIcon)
        .child(
          S.list()
            .id('catalog')
            .title('Catalog')
            .items([
              collection(S, 'course', 'Courses', BookIcon),
              collection(S, 'term', 'Terms', CalendarIcon),
              collection(S, 'teachingArea', 'Teaching Areas', ThListIcon),
              // Drag-to-reorder: the order set here is the order the site
              // shows tiers in. The list itself hides archived tiers.
              orderableDocumentListDeskItem({
                type: 'pricingTier',
                id: 'pricingTier',
                title: 'Pricing Tiers',
                icon: TagIcon,
                filter: NOT_ARCHIVED,
                S,
                context,
              }),
            ]),
        ),

      // People — faculty. Drag-to-reorder; the order is the site's order.
      orderableDocumentListDeskItem({
        type: 'facultyMember',
        id: 'facultyMember',
        title: 'Faculty',
        icon: UsersIcon,
        filter: NOT_ARCHIVED,
        S,
        context,
      }),

      S.divider(),

      // Content — reusable collections.
      S.listItem()
        .title('Content')
        .id('content')
        .icon(ThListIcon)
        .child(
          S.list()
            .id('content')
            .title('Content')
            .items([
              orderableDocumentListDeskItem({
                type: 'testimonial',
                id: 'testimonial',
                title: 'Testimonials',
                icon: CommentIcon,
                filter: NOT_ARCHIVED,
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: 'faqCategory',
                id: 'faqCategory',
                title: 'FAQ Categories',
                icon: ThListIcon,
                S,
                context,
              }),
              collection(S, 'faqItem', 'FAQ Items', HelpCircleIcon),
              collection(S, 'form', 'Forms', EnvelopeIcon),
              collection(S, 'announcement', 'Announcements', BellIcon),
            ]),
        ),

      S.divider(),

      // Events — info sessions, lectures, workshops, term starts shown on /events
      yearScopedEvents(S, CalendarIcon),

      // ── Recently deleted ── soft-deleted content; restore or empty for good.
      S.divider().title('Trash'),
      S.listItem()
        .id('trash')
        .title('Recently deleted')
        .icon(TrashIcon)
        .child(
          S.documentList()
            .id('trash')
            .title('Recently deleted')
            .filter('archived == true')
            .apiVersion(API_VERSION)
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }]),
        ),

      // Safety net: surface any document type we have NOT explicitly placed above
      // (and keep the hidden set, including media.tag, out of the desk root).
      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_FROM_DEFAULT.has(item.getId() as string),
      ),
    ]);
