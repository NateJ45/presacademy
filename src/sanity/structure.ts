// Studio Desk structure (the "Content" tool). Site Settings on top, then all
// page singletons under "Pages", then the catalog (courses, terms, teaching
// areas, pricing), faculty, the reusable content lists, events, and the Trash.
// Every document type is placed explicitly so nothing floats loose at the desk
// root; the trailing default-list filter is a safety net for any future type
// that hasn't been placed (and hides sanity-plugin-media's media.* types).
//
// Home, the Site Guide and the Checkup are top-bar tools from the Studio kit
// (src/sanity/kit/, settings in kit.config.ts, PORTS.md card 106). They
// replaced the desk's old Welcome pane and "How This Works" list on
// 2026-10-18, so the desk is only the content.
//
// Conventions the rest of the Studio leans on:
//  - Pane IDS are load-bearing: guide "Take me there" cards, Home's buttons and
//    the Checkup navigate to `structure/<id>` paths (nested panes join with
//    ';', e.g. 'catalog;course'). Rename an id here and grep guides/content.ts
//    and kit.config.ts for it. Singletons use the document id as the item id,
//    so an intent link ("open the About page") resolves to `pages;aboutPage`.
//  - Delete is "Move to Trash" (the kit's Trash, a copy that comes back with
//    one click). The older soft-delete flag (`archived: true`, set by a page's
//    Archive in the live preview's page list, and by the pre-2026-10-18
//    delete) still keeps documents out of every list here and off the site;
//    those are under "Older deleted items" at the bottom.
//  - Icons come from the brand icon registry (brandIcons.tsx, card 119): a
//    type's icon by meaning, drawn as a tiny course cover where the brand has
//    art for it.

import type { StructureBuilder, StructureResolverContext } from 'sanity/structure';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { ARCHIVABLE_TYPES, NOT_ARCHIVED } from './schemaTypes/archived';
import { staffDesk } from './kit/shared';
import { emptyAwareList } from './kit/emptyList';
import { trashListItem } from './kit/trash';
import { brandIcon, typeIcon } from './brandIcons';
import { WEEK_TYPE } from '../lib/studio-kit';
import { TRASH_TYPE } from '../lib/studio-trash';
import { tableListItem } from './workflow';
import { TABLES } from './tables.config';
import { kitConfig } from './kit.config';

const API_VERSION = '2025-01-01';

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
  // The Studio kit's Trash, placed explicitly at the bottom (card 106).
  TRASH_TYPE,
  // The kit's weekly tick document (card 111): Home's bookkeeping, never edited here.
  WEEK_TYPE,
  // Private preview link records (card 117): managed from "Share a preview" only.
  'previewShare',
]);

/** A singleton desk item: one document. The id is the document id (see above). */
function singleton(S: StructureBuilder, schemaType: string, title: string) {
  return S.listItem()
    .title(title)
    .id(schemaType)
    .icon(typeIcon(schemaType))
    .child(S.document().schemaType(schemaType).documentId(schemaType));
}

/**
 * A collection list that keeps soft-deleted (archived) documents out of sight
 * and, while it is empty, explains what goes in it (card 111).
 */
function collection(
  S: StructureBuilder,
  context: StructureResolverContext,
  schemaType: string,
  title: string,
  explain: string,
  createLabel?: string,
) {
  return emptyAwareList(S, context, {
    id: schemaType,
    type: schemaType,
    title,
    icon: typeIcon(schemaType),
    explain,
    createLabel,
    list: (S) =>
      ARCHIVABLE_TYPES.has(schemaType)
        ? S.documentTypeList(schemaType)
            .id(schemaType)
            .title(title)
            .filter(`_type == $type && ${NOT_ARCHIVED}`)
            .params({ type: schemaType })
            .apiVersion(API_VERSION)
        : S.documentTypeList(schemaType).title(title),
  });
}

/** The "... as a table" items for one type (tables.config.ts, card 117). */
const tablesFor = (S: StructureBuilder, type: string) =>
  TABLES.filter((t) => t.type === type).map((t) => tableListItem(S, t));

// =============================================================================
// Year-scoped Events (ported from the WCP site's yearScopedList, 2026-08-31)
// =============================================================================
// Events accumulate forever. A flat list means a year-three editor scrolls
// past dozens of dead rows to find this term's, so Events opens as "This
// school year" (the default view) plus one pane per past year, with an
// Everything list at the bottom. Nothing moves or archives; this is
// presentation only, and every pane keeps soft-deleted events out of sight
// (NOT_ARCHIVED, same as collection()). School years run Aug 1 to Jul 31 and
// are named by their fall ("2026-27").
const FIRST_CONTENT_YEAR = 2026; // the site's first events

const currentFallYear = (): number => {
  const d = new Date();
  return d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1; // Aug+ = this fall
};
const yearLabel = (y: number): string => `${y}–${String((y + 1) % 100).padStart(2, '0')}`;

function yearScopedEvents(S: StructureBuilder) {
  const icon = typeIcon('event');
  const fall = currentFallYear();
  // An UNDATED event is an ongoing one ("Monthly info session", "Visit a
  // class"): it belongs in EVERY year pane, not in the year it happened to
  // be created. Dated events bucket by their start.
  const filter = `_type == "event" && ${NOT_ARCHIVED} && (!defined(start) || (start >= $from && start < $to))`;

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
          ...tablesFor(S, 'event'),
        ]),
    );
}

// The Studio kit's staff view hides kitConfig.staffHiddenPanes from this desk
// (src/sanity/kit/shared.tsx, staffDesk); everyone else sees all of it.
export const deskStructure = (S: StructureBuilder, context: StructureResolverContext) =>
  staffDesk(fullDesk(S, context), context, kitConfig);

const fullDesk = (S: StructureBuilder, context: StructureResolverContext) =>
  S.list()
    .title('Content')
    .items([
      // Site Settings: pinned singleton (not a page).
      singleton(S, 'siteSettings', 'Site Settings'),

      S.divider(),

      // Weekly and term-time work first (docs/agent/studio-plan.md): the
      // catalog, faculty, notices and events; the pages, which change less, after.
      // Catalog: the course library and what supports it.
      S.listItem()
        .title('Catalog')
        .id('catalog')
        .icon(typeIcon('course'))
        .child(
          S.list()
            .id('catalog')
            .title('Catalog')
            .items([
              collection(
                S,
                context,
                'course',
                'Courses',
                'Every course the Academy teaches, with its cover, its teacher and the terms it runs in.',
                'Add the first course',
              ),
              ...tablesFor(S, 'course'),
              collection(
                S,
                context,
                'term',
                'Terms',
                'Each term or cohort, with its dates and the day applications close. Courses point at the terms they run in.',
                'Add the first term',
              ),
              ...tablesFor(S, 'term'),
              collection(
                S,
                context,
                'teachingArea',
                'Teaching areas',
                'The subjects courses and faculty are filed under, like Scripture or Church history.',
              ),
              // Drag-to-reorder: the order set here is the order the site
              // shows tiers in. The list itself hides archived tiers.
              orderableDocumentListDeskItem({
                type: 'pricingTier',
                id: 'pricingTier',
                title: 'Pricing tiers',
                icon: typeIcon('pricingTier'),
                filter: NOT_ARCHIVED,
                S,
                context,
              }),
            ]),
        ),

      // People: faculty. Drag-to-reorder; the order is the site's order.
      orderableDocumentListDeskItem({
        type: 'facultyMember',
        id: 'facultyMember',
        title: 'Faculty',
        icon: typeIcon('facultyMember'),
        filter: NOT_ARCHIVED,
        S,
        context,
      }),
      ...tablesFor(S, 'facultyMember'),

      S.divider(),

      // Content: reusable collections.
      S.listItem()
        .title('Notices, voices and questions')
        .id('content')
        .icon(brandIcon('content'))
        .child(
          S.list()
            .id('content')
            .title('Notices, voices and questions')
            .items([
              collection(
                S,
                context,
                'announcement',
                'Notices',
                'A short line across the top of every page, like "Enrollment is open" or a class change. Each one can take itself down on a date you pick.',
                'Put up the first notice',
              ),
              S.divider(),
              orderableDocumentListDeskItem({
                type: 'testimonial',
                id: 'testimonial',
                title: 'Testimonials',
                icon: typeIcon('testimonial'),
                filter: NOT_ARCHIVED,
                S,
                context,
              }),
              S.divider(),
              orderableDocumentListDeskItem({
                type: 'faqCategory',
                id: 'faqCategory',
                title: 'Question groups',
                icon: typeIcon('faqCategory'),
                S,
                context,
              }),
              collection(
                S,
                context,
                'faqItem',
                'Questions and answers',
                'The questions people ask before they enroll, with your answers. They show on the FAQ page, in their groups.',
              ),
              S.divider(),
              collection(
                S,
                context,
                'form',
                'Forms',
                'Forms people fill in on the website, like an inquiry or an expression of interest. What they send arrives in Messages.',
              ),
            ]),
        ),

      S.divider(),

      // Events: info sessions, lectures, workshops, term starts shown on /events.
      yearScopedEvents(S),

      S.divider(),

      // Pages: every page singleton lives here.
      S.listItem()
        .title('Pages')
        .id('pages')
        .icon(brandIcon('pages'))
        .child(
          S.list()
            .id('pages')
            .title('Pages')
            .items([
              singleton(S, 'homePage', 'Home'),
              singleton(S, 'coursesPage', 'Courses'),
              singleton(S, 'facultyPage', 'Faculty'),
              singleton(S, 'aboutPage', 'About'),

              S.divider(),

              singleton(S, 'eventsPage', 'Events (the list page)'),
              singleton(S, 'resourcesPage', 'Resources'),

              S.divider(),

              singleton(S, 'pricingPage', 'Pricing and scholarships'),
              singleton(S, 'getStartedPage', 'Get started'),
              singleton(S, 'forYouPage', 'For you'),

              S.divider(),

              singleton(S, 'faqPage', 'Questions (FAQ)'),
              singleton(S, 'contactPage', 'Contact'),
              singleton(S, 'notFoundPage', 'Page not found'),
              singleton(S, 'privacyPage', 'Privacy policy'),
              singleton(S, 'accessibilityPage', 'Accessibility'),

              S.divider(),

              // Custom pages (collection): build new pages at /<slug> with blocks.
              collection(
                S,
                context,
                'page',
                'Custom pages (build your own)',
                'Pages you build yourself, each with its own web address: an open lecture series, a page for a partner congregation, a reading list.',
                'Build the first page',
              ),

              S.divider(),

              // Saved sections: bands kept from one page, ready to drop on
              // another. Made with "Save a section as preset..." in a page's
              // publish menu; added from the Saved sections group beside the
              // live preview.
              collection(
                S,
                context,
                'sectionPreset',
                'Saved sections',
                'Sections kept for reuse. Open a page, use "Save a section as preset..." in its publish menu, and it appears here.',
              ),

              S.divider(),

              // Redirects: old address -> new address. Most entries are filed
              // automatically when a page's web address changes on publish
              // (components/slugRedirect.tsx); add one by hand for an address
              // that never existed on this site (a printed card, an old link).
              S.documentTypeListItem('redirect')
                .title('Redirects (old links)')
                .icon(typeIcon('redirect')),
            ]),
        ),

      S.divider(),

      // The Studio kit's Trash (card 106): copies of deleted things, one click
      // to bring each back. Id 'trash' is load-bearing (the Checkup links here).
      // Card 146: an empty Trash shows a page of its own instead of a bare list.
      trashListItem(S, context, brandIcon('trash')),
      // Documents soft-deleted before the kit's Trash (archived == true), and
      // pages put away with Archive. Restore and Delete forever live here.
      S.listItem()
        .id('trash-older')
        .title('Archived and older deleted items')
        .icon(brandIcon('trash'))
        .child(
          S.documentList()
            .id('trash-older')
            .title('Archived and older deleted items')
            .filter('archived == true')
            .apiVersion(API_VERSION)
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }]),
        ),

      // Safety net: surface any document type not explicitly placed above.
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() as string;
        return !HIDDEN_FROM_DEFAULT.has(id) && !id.startsWith('media.');
      }),
    ]);
