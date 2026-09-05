// =============================================================================
// locations: the "Used on" panel, answered from the DATASET, not from memory
// =============================================================================
// Presentation's locations banner is what an editor trusts when they ask "where
// does this appear?" before they change or delete something. Until 2026-08-29
// every reference type here was HARDCODED to ONE page: a faculty member always
// read "Faculty", a pricing tier always read "Pricing". That is wrong in both
// directions. A teacher shown by a faculty strip on the home page and two
// landing pages still read "used on one page", and a tier on a page that no
// longer carries the block still claimed to be there. The same disease was
// measured on the WCP site, where a staff member referenced by seven documents
// showed "Used on one page" and the one link pointed at a deleted page.
//
// This resolver asks the dataset instead. Three kinds of answer:
//
//   1. FIXED: a singleton whose home is decided by code (Site Settings shows
//      in the header and footer of every page; each page singleton IS its own
//      page).
//   2. Self-locating: a custom `page` document: its location is its own
//      preview URL, read live so a slug rename is reflected at once.
//   3. Everything else: the pages that actually SHOW the document, found by
//      query. Two arms, because this content model reaches a page two ways:
//        - `references($id)`: the document is picked by name in a section
//          (a form on a Form section, a category on an FAQ section).
//        - the WILDCARD arm: most catalog content is never referenced at all.
//          A faculty strip fetches the roster itself, so `references()` sees
//          nothing while the teacher is plainly on the page. So we look for the
//          SECTION TYPE that renders this document type, in either page-builder
//          array (`flexibleSections` on the singletons, `sections` on custom
//          pages; see pageBuilderConfig.ts), plus the DEFAULT sections a page
//          with an empty array still renders (src/lib/default-sections.ts).
//      Some types also have an ALWAYS home that no query can see: the course
//      catalog and the faculty roster are PINNED CODE REGIONS, so every course
//      and every teacher is on those pages by construction.
//
// listenQuery keeps the panel live: put the teacher on another page and the
// list grows without a reload. Published perspective on purpose. The panel
// answers "where does this appear on the site?", and a draft-only placement
// appears nowhere yet.
//
// rxjs note: this repo has ONE hoisted rxjs (7.8.2, via sanity), so the plain
// operator import below is safe. The WCP repo cannot do this (it hoists rxjs 6
// at the root as well) and works around it in its own copy of this file.
// =============================================================================
import { map } from 'rxjs';
import type { DocumentLocationResolver, DocumentLocationsState } from 'sanity/presentation';

import { DEFAULT_SECTIONS } from '../lib/default-sections';
import { SECTION_HOST_TYPES } from './pageBuilderConfig';

// The 14 path-mapped singletons: preview path per type. Keep in sync with
// pathForDoc in sanity.config.ts and the SINGLETON_BY_PATH map in the site's
// src/pages/preview/[...slug].astro. It lives HERE, not in resolve.ts, because
// both files need it and only one direction of import can be safe: resolve.ts
// re-exports it for the callers that have always read it from there.
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

/** Turn a custom page's slug into its /preview href. */
export const previewHref = (slug?: string) => (slug === 'home' ? '/preview' : `/preview/${slug}`);

/** Every document type that can HOST a section, i.e. can be a location. */
const HOST_TYPES = Object.keys(SECTION_HOST_TYPES);

// Friendly names for the singleton pages, which carry no `title` field of their
// own (their headings live in the hero fields). Mirrors structure.ts naming,
// the same way WelcomePane.tsx's TYPE_LABELS does.
const PAGE_LABELS: Record<string, string> = {
  homePage: 'Home page',
  aboutPage: 'About page',
  faqPage: 'FAQ page',
  contactPage: 'Contact page',
  eventsPage: 'Events page',
  privacyPage: 'Privacy page',
  accessibilityPage: 'Accessibility page',
  coursesPage: 'Courses page',
  facultyPage: 'Faculty page',
  pricingPage: 'Pricing page',
  getStartedPage: 'Get Started page',
  forYouPage: 'For You page',
  resourcesPage: 'Resources page',
  notFoundPage: '404 page',
};

/**
 * Which SECTION types render which DOCUMENT type. This is the wildcard arm: the
 * blocks named here fetch their own collection (see SELF_FILLING_SECTIONS in
 * pageBuilderConfig.ts), so a page showing the document holds no reference to
 * it. Keep in step with src/components/blocks/.
 */
const RENDERED_BY: Record<string, string[]> = {
  course: ['sectionCourseRail'],
  facultyMember: ['sectionFacultyRail'],
  testimonial: ['sectionTestimonialRail'],
  event: ['sectionEventGrid', 'sectionRuledList'],
  pricingTier: ['sectionPricingTiers'],
  faqItem: ['sectionFaqList', 'sectionFaqGrouped'],
  faqCategory: ['sectionFaqList', 'sectionFaqGrouped'],
};

/**
 * `sectionDynamicList` renders four different collections from ONE block type,
 * chosen by its `source` field, so it needs the value as well as the type.
 */
const DYNAMIC_SOURCE: Record<string, string> = {
  course: 'featuredCourses',
  event: 'upcomingEvents',
  facultyMember: 'faculty',
  testimonial: 'testimonials',
};

/**
 * Homes a document ALWAYS has, whatever any page holds. The course catalog and
 * the faculty roster are PINNED CODE REGIONS (src/components/pinned/), not
 * sections, so no query can see them, yet every published course is in the
 * catalog and every teacher is in the roster by construction. Without this a
 * brand-new course would read "not shown on any page", which is wrong.
 *
 * A teaching area and a term have no page of their own either: they surface as
 * the catalog's topic and term filters. A testimonial has no guaranteed home
 * (it appears only where a page carries the strip), so it is not listed here.
 */
const ALWAYS: Record<string, { title: string; href: string }[]> = {
  course: [{ title: 'Course catalog (lists every course)', href: '/preview/courses' }],
  facultyMember: [{ title: 'Faculty (the roster lists everyone)', href: '/preview/faculty' }],
  teachingArea: [{ title: 'Course catalog (the topic filter)', href: '/preview/courses' }],
  term: [{ title: 'Course catalog (the term filter)', href: '/preview/courses' }],
};

/** Singletons whose home is fixed by code, not by references. */
const FIXED: Record<string, { title: string; href: string }> = {
  siteSettings: { title: 'Every page (header, footer, contact details)', href: '/preview' },
  // The announcement bar renders above the header on EVERY page while it is
  // active. Nothing references it, so the usage query would call it "not shown
  // anywhere" on a notice the whole site is showing.
  announcement: { title: 'Every page (while it is showing)', href: '/preview' },
  // Each page singleton IS its own page.
  ...Object.fromEntries(
    Object.entries(SINGLETON_PREVIEW_PATHS).map(([type, href]) => [
      type,
      { title: PAGE_LABELS[type] ?? 'Preview', href },
    ]),
  ),
};

/**
 * Studio tools rather than website content. They are never ON a page, and
 * "not shown on any page yet" would read like something is wrong.
 */
const NOT_ON_A_PAGE: Record<string, string> = {
  redirect:
    'A redirect is not on a page. It forwards an old web address to a new one, everywhere on the site.',
  sectionPreset:
    'A saved section is not on a page. It waits in the preview navigator until you add it to one.',
  form: 'This form appears wherever a Form section or a Request panel points at it. Nothing does yet.',
};

/** The one projection every branch returns rows in. */
const ROW = `{ _type, "t": title, "slug": slug.current }`;

interface Row {
  _type: string;
  t?: string;
  slug?: string;
}

/** A row's preview URL: a custom page from its slug, a singleton from the map. */
function hrefFor(row: Row): string | null {
  if (row._type === 'page') return row.slug ? previewHref(row.slug) : null;
  return SINGLETON_PREVIEW_PATHS[row._type] ?? null;
}

/** A row's label: the custom page's own title, or the singleton's name. */
function titleFor(row: Row): string {
  return row.t || PAGE_LABELS[row._type] || row._type;
}

// Two arms. `direct` catches a page that picked the document by name.
// `rendered` catches the wildcard path: a page carrying a section type that
// fetches this document's collection itself, in EITHER builder array, or a
// page whose array is empty, which still renders its built-in default sections.
const USAGE_QUERY = `{
  "direct": *[_type in $hosts && !(_id in path("drafts.**")) && archived != true
    && references($id)] ${ROW},
  "rendered": *[_type in $hosts && !(_id in path("drafts.**")) && archived != true && (
      count(flexibleSections[_type in $sections]) > 0
      || count(sections[_type in $sections]) > 0
      || count(flexibleSections[_type == "sectionDynamicList" && source == $dynamic]) > 0
      || count(sections[_type == "sectionDynamicList" && source == $dynamic]) > 0
      || (count(flexibleSections) == 0 && count(sections) == 0 && _type in $defaultHosts)
    )] ${ROW}
}`;

const SELF_QUERY = `*[_id in [$id, "drafts." + $id]] | order(_updatedAt desc) [0] ${ROW}`;

/** The singleton types whose DEFAULT sections already render this doc type. */
function defaultHostsFor(sections: string[]): string[] {
  if (!sections.length) return [];
  return Object.entries(DEFAULT_SECTIONS)
    .filter(([, blocks]) => blocks.some((b) => sections.includes(b?._type)))
    .map(([type]) => type);
}

export const locations: DocumentLocationResolver = ({ id, type }, { documentStore }) => {
  const publishedId = id.replace(/^drafts\./, '');

  if (FIXED[type]) return { locations: [FIXED[type]] };

  // A custom page IS its own location. Read it live so a rename follows.
  if (type === 'page') {
    return documentStore.listenQuery(SELF_QUERY, { id: publishedId }, { perspective: 'raw' }).pipe(
      map((row: Row | null): DocumentLocationsState => {
        const href = row ? hrefFor(row) : null;
        if (!href) {
          return {
            locations: [],
            message: 'Give this page a web address (slug) to preview it.',
            tone: 'caution',
          };
        }
        return { locations: [{ title: titleFor(row as Row), href }] };
      }),
    );
  }

  const sections = RENDERED_BY[type] ?? [];
  const always = ALWAYS[type] ?? [];

  return documentStore
    .listenQuery(
      USAGE_QUERY,
      {
        id: publishedId,
        hosts: HOST_TYPES,
        sections,
        // A value no section can hold, so the dynamic-list arm matches nothing
        // for a type that block never renders.
        dynamic: DYNAMIC_SOURCE[type] ?? '__no-source__',
        defaultHosts: defaultHostsFor(sections),
      },
      { perspective: 'published' },
    )
    .pipe(
      map((result: { direct?: Row[]; rendered?: Row[] } | null): DocumentLocationsState => {
        const seen = new Set<string>();
        const rows: { title: string; href: string }[] = [];
        for (const row of [...always, ...(result?.direct ?? []), ...(result?.rendered ?? [])]) {
          // `always` rows are already {title, href}; queried rows carry a type.
          const href = 'href' in row ? row.href : hrefFor(row);
          const title = 'title' in row ? row.title : titleFor(row);
          if (!href || seen.has(href)) continue;
          seen.add(href);
          rows.push({ title, href });
        }
        if (!rows.length) {
          return {
            locations: [],
            message:
              NOT_ON_A_PAGE[type] ??
              'Not shown on any page yet. It appears here once a page uses it.',
            tone: 'caution',
          };
        }
        return { locations: rows };
      }),
    );
};
