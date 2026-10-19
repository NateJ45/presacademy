// Safe to edit by hand
// =============================================================================
// The Studio kit's settings for The Presbyterian Academy
// =============================================================================
// The ONE site-specific file for the kit in src/sanity/kit/ (which names no
// site and comes from the starter unchanged). Everything the Academy's staff
// read in Home, the Checkup, Quick update and the tour lives here, in the
// school's own words: terms, courses, faculty, enrollment (US spelling, as on
// the site). Detail: docs/agent/studio-kit.md.
//
// The repo is public: no private contacts here. The help address comes from
// PUBLIC_STUDIO_HELP_EMAIL at build time, else the studio address the guides
// already name (guides/content.ts SITE).
//
// The school was founded in 2026 and much of its live content is still
// placeholder seed: nothing here states a fact about the school.
// =============================================================================

import type { KitConfig } from './kit/types';
import { genericRules } from '../lib/studio-checkup';
import { guides, GUIDE_CATEGORIES, GUIDES_FOR_TYPE, SITE } from './guides/content';
import { makeGuideView } from './components/GuideView';
import { envVal } from './urls';
import { AddDocumentIcon } from '@sanity/icons/AddDocument';
import { BellIcon } from '@sanity/icons/Bell';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { BookIcon } from '@sanity/icons/Book';
import { WarningOutlineIcon } from '@sanity/icons/WarningOutline';
import { buildEvent, buildNotice, daysFrom } from '../lib/quick-updates';
import { runPageCheck } from './actions/checkPage';
import { PAGE_BUILDER_TYPES } from './pageBuilderConfig';
import { schoolRules } from './schoolCheckup';
import { ARCHIVABLE_TYPES } from './schemaTypes/archived';

const PUBLISHED = '!(_id in path("drafts.**"))';
const LIVE = `${PUBLISHED} && archived != true`;

/** Page types with a Google description (seoDescription). Not the 404 page. */
const SEO_TYPES = [
  'homePage',
  'aboutPage',
  'faqPage',
  'contactPage',
  'eventsPage',
  'privacyPage',
  'accessibilityPage',
  'coursesPage',
  'facultyPage',
  'pricingPage',
  'getStartedPage',
  'forYouPage',
  'resourcesPage',
  'page',
  'course',
];

/** The plain name of each thing Delete moves to the Trash (one name per thing, as on the desk). */
const TRASH_NAMES: Record<string, string> = {
  course: 'Course',
  term: 'Term',
  teachingArea: 'Teaching area',
  pricingTier: 'Pricing tier',
  facultyMember: 'Faculty member',
  testimonial: 'Testimonial',
  faqItem: 'Question',
  faqCategory: 'Question group',
  form: 'Form',
  announcement: 'Notice',
  event: 'Event',
  page: 'Custom page',
  sectionPreset: 'Saved section',
};
// Every type that had the old soft delete gets the Trash instead (2026-10-18).
for (const type of ARCHIVABLE_TYPES) {
  if (!TRASH_NAMES[type]) TRASH_NAMES[type] = type;
}

export const kitConfig: KitConfig = {
  siteName: 'the Academy website',

  helper: {
    name: SITE.contactName,
    email: envVal('PUBLIC_STUDIO_HELP_EMAIL') || SITE.contactEmail,
  },

  // Sanity user ids of the staff who get the plain staff view. Empty means
  // anyone who is not a Sanity administrator gets it. Add a member's id from
  // sanity.io/manage (Members) when they should see the staff view while
  // being an administrator.
  staff: [],

  staffTools: [
    'home',
    'quick-update',
    'structure',
    'presentation',
    'messages',
    'term-setup',
    'site-guide',
    'checkup',
  ],
  toolOrder: [
    'home',
    'quick-update',
    'structure',
    'presentation',
    'messages',
    'term-setup',
    'site-guide',
    'checkup',
    'media',
  ],
  toolTitles: { structure: 'Content', presentation: 'Live preview' },

  // Desk items only a developer needs (ids from src/sanity/structure.ts).
  staffHiddenPanes: [],

  trashTypes: TRASH_NAMES,

  // A school week starts on Monday.
  weekStartsOn: 1,
  thisWeekTitle: 'This week',
  thisWeek: [
    {
      id: 'messages',
      title: 'Answer this week’s messages',
      detail:
        'Enquiries and expressions of interest from the website. Mark each one Replied when it is answered.',
      manual: true,
      target: { tool: 'messages' },
      targetLabel: 'Open Messages',
    },
    {
      id: 'next-term',
      title: 'The next term is on the website',
      detail:
        'A term that has not started yet, with its dates, so the site can say when the next cohort begins.',
      query: `count(*[_type == "term" && ${LIVE} && startDate > $now])`,
      target: { tool: 'term-setup' },
      targetLabel: 'Open New term',
    },
    {
      id: 'upcoming-event',
      title: 'An info session or event is coming up',
      detail:
        'People deciding whether to enroll look for the next chance to meet the Academy. Keep one on the Events page.',
      query: `count(*[_type == "event" && ${LIVE} && eventType == "oneTime" && start > $now])`,
      target: { create: 'event' },
      targetLabel: 'Add an event',
    },
    {
      id: 'notices',
      title: 'Take down notices that have ended',
      detail: 'Switch off any notice whose end date has passed.',
      query: `count(*[_type == "announcement" && ${LIVE} && enabled == true && defined(endDate) && endDate < $now]) == 0`,
      target: { pane: 'content;announcement' },
      targetLabel: 'Open the notices',
    },
    {
      id: 'checkup',
      title: 'Checkup is clear',
      detail: 'Nothing in the Checkup marked "Needs doing".',
      check: 'checkup',
      target: { tool: 'checkup' },
      targetLabel: 'Open the Checkup',
    },
  ],

  // Quick update (card 111): the jobs staff do from a phone. Each form
  // publishes straight away, so the builders in src/lib/quick-updates.ts
  // return whole, valid documents (tested in quick-updates.test.ts).
  quickUpdate: [
    {
      id: 'notice',
      title: 'Put up a notice',
      detail: 'A short line across the top of every page, until the day you pick.',
      icon: BellIcon,
      fields: [
        {
          name: 'message',
          title: 'The notice',
          kind: 'text',
          required: true,
          max: 160,
          description: 'One or two short sentences, like "Enrollment for the spring term is open."',
        },
        {
          name: 'lastDay',
          title: 'Last day to show it',
          kind: 'date',
          required: true,
          initial: (now) => daysFrom(now, 14),
        },
        {
          name: 'link',
          title: 'A link for more',
          kind: 'string',
          description: 'A page on this site like /courses/, or a full address starting https://',
        },
      ],
      build: (v) =>
        buildNotice({ message: v.message, lastDay: v.lastDay, link: v.link || undefined }),
      doneMessage:
        'The notice will be on the website in a few minutes, and it takes itself down after the day you picked.',
    },
    {
      id: 'class-change',
      title: 'Cancel or move a class',
      detail: 'A notice in red that takes itself down after the day you name.',
      icon: WarningOutlineIcon,
      fields: [
        {
          name: 'message',
          title: 'What is changing',
          kind: 'text',
          required: true,
          max: 160,
          description:
            'Say which class and what to do, like "Tonight’s class meets online instead."',
        },
        {
          name: 'lastDay',
          title: 'Take it down after',
          kind: 'date',
          required: true,
          initial: (now) => daysFrom(now, 1),
        },
      ],
      build: (v) => buildNotice({ message: v.message, lastDay: v.lastDay }, 'urgent'),
      doneMessage:
        'The notice will be on the website in a few minutes and comes down by itself after the day you named. Email the class too: not everyone checks the website.',
    },
    {
      id: 'event',
      title: 'Add an info session or event',
      detail: 'An info night, an open lecture or a workshop, with its date and place.',
      icon: CalendarIcon,
      fields: [
        { name: 'title', title: 'What it is called', kind: 'string', required: true, max: 90 },
        { name: 'start', title: 'When it starts', kind: 'datetime', required: true },
        {
          name: 'category',
          title: 'Kind of event',
          kind: 'string',
          description:
            'Info session, Open lecture or Workshop. Leave it empty for an info session.',
        },
        {
          name: 'location',
          title: 'Where',
          kind: 'string',
          description: 'Leave it empty to use the campus address.',
        },
        {
          name: 'summary',
          title: 'One or two sentences about it',
          kind: 'text',
          max: 240,
        },
      ],
      build: (v) =>
        buildEvent({
          title: v.title,
          start: v.start,
          category: v.category,
          location: v.location,
          summary: v.summary,
        }),
      doneMessage:
        'The event will be on the Events page in a few minutes. Open it in the full editor to add a picture, a registration link or more detail.',
    },
  ],

  checkup: {
    rules: [
      ...genericRules({
        seoTypes: SEO_TYPES,
        altExemptFields: ['logo', 'favicon', 'icon', 'logoImage', 'seoImage'],
      }),
      ...schoolRules,
    ],
    ignoreTypes: ['sectionPreset', 'redirect', 'form'],
  },

  guide: {
    guides,
    categories: GUIDE_CATEGORIES,
    view: makeGuideView,
    // "Help for this page" (card 110): which guides each document type shows.
    forType: GUIDES_FOR_TYPE,
  },

  // Home's "Your pages" card (card 115): every page staff can change, in the
  // menu's own words, one click each. Desk ids are load-bearing (structure.ts).
  pages: [
    {
      title: 'Main pages',
      links: [
        { title: 'Home', target: { doc: 'homePage' } },
        { title: 'Courses', target: { doc: 'coursesPage' } },
        { title: 'Faculty', target: { doc: 'facultyPage' } },
        { title: 'Pricing and scholarships', target: { doc: 'pricingPage' } },
        { title: 'Events', target: { doc: 'eventsPage' } },
        { title: 'Resources', target: { doc: 'resourcesPage' } },
        { title: 'About', target: { doc: 'aboutPage' } },
        { title: 'Get started', target: { doc: 'getStartedPage' } },
        { title: 'For you', target: { doc: 'forYouPage' } },
        { title: 'Questions (FAQ)', target: { doc: 'faqPage' } },
        { title: 'Contact', target: { doc: 'contactPage' } },
        { title: 'Privacy policy', target: { doc: 'privacyPage' } },
        { title: 'Accessibility', target: { doc: 'accessibilityPage' } },
        { title: 'Page not found', target: { doc: 'notFoundPage' } },
      ],
    },
    { title: 'Pages you built', listType: 'page' },
    {
      title: 'The school',
      links: [
        { title: 'Courses', target: { pane: 'catalog;course' } },
        { title: 'Terms', target: { pane: 'catalog;term' } },
        { title: 'Teaching areas', target: { pane: 'catalog;teachingArea' } },
        { title: 'Pricing tiers', target: { pane: 'catalog;pricingTier' } },
        { title: 'Faculty', target: { pane: 'facultyMember' } },
        { title: 'Events', target: { pane: 'event' } },
      ],
    },
    {
      title: 'Notices, voices and questions',
      links: [
        { title: 'Notices', target: { pane: 'content;announcement' } },
        { title: 'Testimonials', target: { pane: 'content;testimonial' } },
        { title: 'Questions and answers', target: { pane: 'content;faqItem' } },
        { title: 'Forms', target: { pane: 'content;form' } },
      ],
    },
    {
      title: 'Site-wide',
      links: [
        {
          title: 'Contact details',
          detail: 'Email, phone, address',
          target: { doc: 'siteSettings', field: 'email' },
        },
        { title: 'Menus', target: { doc: 'siteSettings', field: 'navItems' } },
        { title: 'Footer', target: { doc: 'siteSettings', field: 'footerColumns' } },
        { title: 'Site settings', target: { doc: 'siteSettings' } },
      ],
    },
  ],

  // Home's banner (card 118), drawn from the public site: the deep green of the
  // masthead's chrome, the PA mark on a light disc, a shelf of the course covers
  // along the foot (the Term Issue's covers, in their own colour pairs and
  // ornaments: scripts/gen-studio-art.mjs), and "Academy" in brass, the way the
  // site colours the accent word of a heading on a dark band (.heading-accent,
  // --section-accent #C7A875). The editor's name takes the same brass.
  homeBanner: {
    mark: '/favicon.svg',
    motif: '/studio-art/cover-shelf.svg',
    motifNarrow: '/studio-art/cover-shelf-phone.svg',
    accent: '#C7A875',
    lettering: {
      text: 'Academy',
      family: 'PA Fraunces',
      src: '/studio-art/fraunces-wght.woff2',
      colors: ['#C7A875'],
    },
  },

  // Home's big buttons (card 110): the jobs staff do most. Keep it to four.
  quickActions: [
    {
      title: 'Open a new term',
      detail: 'The start-of-term checklist: dates, courses, rates and the term-start event.',
      target: { tool: 'term-setup' },
      icon: CalendarIcon,
    },
    {
      title: 'Add a course',
      detail: 'Its title, summary, teacher and cover, then the term it runs in.',
      target: { create: 'course' },
      icon: BookIcon,
    },
    {
      title: 'Post a notice',
      detail: 'A line across the top of every page, like "Enrollment is open".',
      target: { create: 'announcement' },
      icon: BellIcon,
    },
    {
      title: 'Add a page',
      detail: 'A new page with its own address, built from sections.',
      target: { pane: 'pages;page' },
      icon: AddDocumentIcon,
    },
  ],

  // The page check inside "Help for this page" (card 110): the same checks as
  // the "Check this page..." action, on the page-builder types.
  pageCheck: { types: [...PAGE_BUILDER_TYPES], run: (doc, client) => runPageCheck(client, doc) },

  tourSteps: [
    {
      title: 'This is Home',
      body: 'Home opens first every time. It shows what to do this week, whether your last change is on the website yet, and anything that needs fixing.',
    },
    {
      title: 'Content is where you edit',
      body: 'Click Content in the top bar to change any page, or to add a course, a term, a faculty member, an event or a notice.',
    },
    {
      title: 'Live preview shows the real page',
      body: 'Live preview shows the website as visitors will see it, with your unpublished changes in place. Click any words on it to edit them right there.',
    },
    {
      title: 'Nothing is public until you press Publish',
      body: 'Your changes are private until you press Publish. After that the website updates itself in a few minutes. Changed your mind? Use Undo, or move a thing to the Trash and bring it back later.',
    },
    {
      title: 'A new term has its own checklist',
      body: 'New term in the top bar walks the start of every term in order: the dates, the courses that run, the rates and the term-start event.',
    },
    {
      title: 'Help is always one click away',
      body: `Site Guide in the top bar has step-by-step help for every job, and you can print any of it. Stuck? Home has a card for asking ${SITE.contactName}.`,
    },
  ],

  liveSlowAfterMinutes: 15,

  features: {
    home: true,
    guide: true,
    checkup: true,
    tour: true,
    trash: true,
    publishNote: true,
    // Card 115: Cloudflare Web Analytics through /api/studio/visitors/. Says
    // "not set up yet" until the Worker has CF_ANALYTICS_TOKEN and the two
    // vars (OPERATIONS.md, "Visitor numbers").
    visitors: true,
    navbarStatus: true,
    helpPanel: true,
  },
};
