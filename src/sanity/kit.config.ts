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
import type { PageRules } from '../lib/page-guardrails';
import { genericRules } from '../lib/studio-checkup';
import { guides, GUIDE_CATEGORIES, GUIDE_FOR_FIELD, GUIDES_FOR_TYPE, SITE } from './guides/content';
import { makeGuideView } from './components/GuideView';
import { envVal } from './urls';
import { AddDocumentIcon } from '@sanity/icons/AddDocument';
import { BellIcon } from '@sanity/icons/Bell';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { EditIcon } from '@sanity/icons/Edit';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { UsersIcon } from '@sanity/icons/Users';
import { BookIcon } from '@sanity/icons/Book';
import { WarningOutlineIcon } from '@sanity/icons/WarningOutline';
import {
  buildEnrollmentReminder,
  buildEvent,
  buildNotice,
  daysFrom,
  NEXT_TERM_QUERY,
  type ReminderTerm,
} from '../lib/quick-updates';
import { runPageCheck } from './actions/checkPage';
import { TOURS, WELCOME, WHATS_NEW } from './studio-tours';
import { PAGE_BUILDER_TYPES } from './pageBuilderConfig';
import { schoolRules } from './schoolCheckup';
import { exampleTextRule } from '../lib/studio-prepublish';
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
        'Inquiries and expressions of interest from the website. Mark each one Replied when it is answered.',
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
      // Enrollment weeks: while a term is open for enrollment, a notice says so.
      id: 'enrollment-notice',
      title: 'While enrollment is open, a notice says so',
      detail:
        'When a term is set to Registration open, keep a notice up with the Apply by date. Quick update writes it for you.',
      query: `count(*[_type == "term" && ${LIVE} && status == "open"]) == 0 || count(*[_type == "announcement" && ${LIVE} && enabled == true && (!defined(endDate) || endDate > $now)]) > 0`,
      target: { tool: 'quick-update' },
      targetLabel: 'Open Quick update',
    },
    {
      id: 'seats',
      title: 'Seats and waitlists are right',
      detail:
        'During enrollment, when a course fills, mark it Waitlist; when it can take nobody else, mark it Full. Quick update does it from a phone. Check this when the website matches.',
      manual: true,
      target: { tool: 'quick-update' },
      targetLabel: 'Open Quick update',
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
      // The oxblood cover with its pennant, the notice's art everywhere in the Studio.
      meaning: 'notice',
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
      // Enrollment weeks (docs/agent/studio-plan.md): the reminder people need
      // most, worded from the next term's own dates so nobody retypes them.
      id: 'enrollment-reminder',
      title: 'Remind people enrollment closes',
      detail:
        'A notice worded for you from the next term: when to apply by, with a link to sign up.',
      icon: BookIcon,
      // The sign-up form's cover: enrollment is a form people fill in.
      meaning: 'form',
      fields: [
        {
          name: 'message',
          title: 'Your own words',
          kind: 'text',
          max: 160,
          description:
            'Leave it empty and the notice says, for example, "Enrollment for Spring 2027 closes December 15. Save your seat today."',
        },
        {
          name: 'lastDay',
          title: 'Last day to show it',
          kind: 'date',
          description: 'Leave it empty to show it until the Apply by date on the term.',
        },
      ],
      build: async (v, { now, client }) => {
        const today = daysFrom(now, 0);
        const term = await client.fetch<ReminderTerm | null>(NEXT_TERM_QUERY, { today });
        return buildEnrollmentReminder({ message: v.message, lastDay: v.lastDay }, term, today);
      },
      submitLabel: 'Put the reminder up',
      doneMessage:
        'The reminder will be across the top of every page in a few minutes, linking to Get started, and it takes itself down on the last day.',
    },
    {
      // Enrollment weeks: the job the administrator does most often at the desk, now
      // a few taps. An edit job changes top-level fields, so the course keeps its
      // own "Seats right now" (course.ts) that wins over the offering's status.
      id: 'seats',
      title: 'Mark a course full or waitlisted',
      detail: 'Pick the course, then Open, Waitlist or Full. The course card changes at once.',
      icon: UsersIcon,
      meaning: 'people',
      job: {
        kind: 'edit',
        pick: {
          type: 'course',
          filter: 'archived != true',
          order: 'title asc',
          titleField: 'title',
          label: 'Which course?',
        },
      },
      fields: [
        {
          name: 'seatsNow',
          title: 'Seats right now',
          kind: 'select',
          options: [
            { title: 'Open', value: 'open' },
            { title: 'Waitlist', value: 'waitlist' },
            { title: 'Full', value: 'closed' },
          ],
          description:
            'Leave it on Choose one to let the term decide again, for example when a new term opens.',
        },
        {
          name: 'seatsNowNote',
          title: 'A note for the course page',
          kind: 'string',
          max: 60,
          description: 'Like "Waitlist only" or "Two seats left". Optional.',
        },
      ],
      submitLabel: 'Save the seats',
      doneTitle: 'The seats are saved.',
      doneMessage:
        'The course card and page will say so in a few minutes. Check "Seats and waitlists are right" on Home.',
    },
    {
      id: 'class-change',
      title: 'Cancel or move a class',
      detail: 'A notice in red that takes itself down after the day you name.',
      icon: WarningOutlineIcon,
      // The brass cover with its steps for the weeks: a session that moved.
      meaning: 'times',
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
      detail:
        'An info night, an open lecture or a workshop, with its date, place and a sign-up link.',
      icon: CalendarIcon,
      // The parchment cover with its rising half-moon.
      meaning: 'event',
      fields: [
        { name: 'title', title: 'What it is called', kind: 'string', required: true, max: 90 },
        { name: 'start', title: 'When it starts', kind: 'datetime', required: true },
        {
          name: 'category',
          title: 'Kind of event',
          kind: 'select',
          options: [
            { title: 'Info session', value: 'Info session' },
            { title: 'Open lecture', value: 'Open lecture' },
            { title: 'Workshop', value: 'Workshop' },
          ],
          description: 'Leave it on Choose one for an info session.',
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
        {
          name: 'registrationUrl',
          title: 'Sign-up link',
          kind: 'url',
          description:
            'Where people save a seat, starting https://. It shows as a "Save your seat" button.',
        },
      ],
      build: (v) =>
        buildEvent({
          title: v.title,
          start: v.start,
          category: v.category,
          location: v.location,
          summary: v.summary,
          registrationUrl: v.registrationUrl,
        }),
      doneMessage:
        'The event will be on the Events page in a few minutes. Open it in the full editor to add a picture, a cost or more detail.',
    },
    {
      id: 'change-event',
      title: 'Change an event’s time or place',
      detail: 'Pick an upcoming event, then change when, where or the sign-up link.',
      icon: EditIcon,
      meaning: 'event',
      job: {
        kind: 'edit',
        pick: {
          type: 'event',
          filter: 'archived != true && eventType == "oneTime" && start > now()',
          order: 'start asc',
          titleField: 'title',
          label: 'Which event?',
        },
      },
      fields: [
        { name: 'start', title: 'When it starts', kind: 'datetime', required: true },
        {
          name: 'location',
          title: 'Where',
          kind: 'string',
          description: 'Leave it empty to use the campus address.',
        },
        {
          name: 'registrationUrl',
          title: 'Sign-up link',
          kind: 'url',
          description: 'Starting https://. Empty takes the Save your seat button away.',
        },
      ],
      submitLabel: 'Save the changes',
      doneTitle: 'The event is changed.',
      doneMessage:
        'The Events page will show the new time or place in a few minutes. If it moved a long way, a notice helps too.',
    },
    {
      id: 'term-status',
      title: 'Open or close enrollment for a term',
      detail:
        'Pick the term and say where it is: Upcoming, Registration open, In session or Closed.',
      icon: BookIcon,
      meaning: 'times',
      job: {
        kind: 'edit',
        pick: {
          type: 'term',
          filter: 'archived != true && status != "closed"',
          order: 'startDate asc',
          titleField: 'title',
          label: 'Which term?',
        },
      },
      fields: [
        {
          name: 'status',
          title: 'Where the term is',
          kind: 'select',
          required: true,
          options: [
            { title: 'Upcoming', value: 'upcoming' },
            { title: 'Registration open', value: 'open' },
            { title: 'In session', value: 'inSession' },
            { title: 'Closed', value: 'closed' },
          ],
          description: 'Registration open turns on the enrollment notices and the Apply by lines.',
        },
      ],
      submitLabel: 'Save the status',
      doneTitle: 'The term is updated.',
      doneMessage:
        'The website will say so in a few minutes. Quick update can word a reminder for you next.',
    },
    {
      // A shortcut: Messages has its own tool, with Replied marks and filters.
      id: 'messages',
      title: 'Answer this week’s messages',
      detail: 'Inquiries and expressions of interest from the website.',
      icon: EnvelopeIcon,
      meaning: 'question',
      job: { kind: 'link', target: { tool: 'messages' } },
    },
    {
      // Seasonal: the school's two long breaks. Shown only in their season.
      id: 'holiday-break',
      title: 'Announce the holiday break',
      detail: 'A notice for the weeks around the holidays, down by the day you pick.',
      icon: BellIcon,
      meaning: 'notice',
      when: { from: '11-15', to: '01-10' },
      fields: [
        {
          name: 'message',
          title: 'The notice',
          kind: 'text',
          required: true,
          max: 160,
          description: 'Say when classes pause and when they come back.',
        },
        {
          name: 'lastDay',
          title: 'Last day to show it',
          kind: 'date',
          required: true,
          initial: (now) => daysFrom(now, 21),
        },
      ],
      build: (v) => buildNotice({ message: v.message, lastDay: v.lastDay }, 'special'),
      doneMessage:
        'The notice will be on the website in a few minutes and comes down by itself after the day you picked.',
    },
    {
      id: 'summer-break',
      title: 'Announce the summer break',
      detail: 'A notice for the summer, with when the office and the next term return.',
      icon: BellIcon,
      meaning: 'notice',
      when: { from: '05-01', to: '08-31' },
      fields: [
        {
          name: 'message',
          title: 'The notice',
          kind: 'text',
          required: true,
          max: 160,
          description: 'Say when the next term begins and how to reach the office meanwhile.',
        },
        {
          name: 'lastDay',
          title: 'Last day to show it',
          kind: 'date',
          required: true,
          initial: (now) => daysFrom(now, 30),
        },
      ],
      build: (v) => buildNotice({ message: v.message, lastDay: v.lastDay }, 'special'),
      doneMessage:
        'The notice will be on the website in a few minutes and comes down by itself after the day you picked.',
    },
  ],

  checkup: {
    rules: [
      ...genericRules({
        seoTypes: SEO_TYPES,
        altExemptFields: ['logo', 'favicon', 'icon', 'logoImage', 'seoImage'],
      }),
      ...schoolRules,
      // Card 123: words still starting "Example:" from a template or a seasonal saved section.
      // (Not llmsRules: this site keeps /llms-full.txt off until launch, on purpose.)
      exampleTextRule(),
    ],
    ignoreTypes: ['sectionPreset', 'redirect', 'form'],
  },

  guide: {
    guides,
    categories: GUIDE_CATEGORIES,
    view: makeGuideView,
    // "Help for this page" (card 110): which guides each document type shows.
    forType: GUIDES_FOR_TYPE,
    // Card 134: a "How to" chip beside the fields staff most often get wrong.
    forField: GUIDE_FOR_FIELD,
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

  // Home's banner (card 118), drawn from the public site's Term Issue: the deep
  // green of the masthead's chrome; the masthead's own mark, the three fanned
  // covers beside "Spring 2027 issue" (Header.astro .issue-fan), drawn bare for the
  // dark ground; a shelf of the issues along the foot, fronts and spines with their
  // numbers in Plex Mono, standing over the spine strip of the eight cover colours
  // that runs across the top of every page (scripts/gen-studio-art.mjs); and
  // "Academy" in Fraunces italic and brass, as the nameplate sets it and as the site
  // colours the accent word of a heading on a dark band (.heading-accent, #C7A875).
  // The editor's name takes the same brass.
  homeBanner: {
    mark: '/favicon.svg',
    markOnDark: '/studio-art/mark-issue.svg',
    motif: '/studio-art/cover-shelf.svg',
    motifNarrow: '/studio-art/cover-shelf-phone.svg',
    accent: '#C7A875',
    lettering: {
      text: 'Academy',
      family: 'PA Fraunces Italic',
      src: '/studio-art/fraunces-italic-wght.woff2',
      colors: ['#C7A875'],
    },
    // Card 135: the "View the website" button as the site's own pill, brass on the green band.
    style: {
      chip: {
        shape: 'pill',
        bg: '#c7a875',
        fg: '#222a25',
        hoverBg: '#d9c79f',
        size: '13px',
        weight: 700,
        tracking: '0.1em',
        case: 'upper',
      },
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

  // Card 137: spotlight tours, the welcome and "What's new" (src/sanity/studio-tours.ts).
  tours: TOURS,
  welcome: WELCOME,
  whatsNew: WHATS_NEW,

  // Card 106's one stepped dialog; card 137's `tours` replaces it.
  tourSteps: [],

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
    // Card 125's "Earlier versions" reads the nightly backups through
    // /api/studio/earlier-versions/, which this site has not set up (no backup
    // workflow or GITHUB_DEPLOY_TOKEN yet). Off, so no editor sees a button that
    // cannot work; docs/PENDING.md has the steps to switch it on.
    earlierVersions: false,
  },
};

/**
 * The Academy's page-builder rules (the authoring kit, PORTS.md card 109).
 * Each one shows as a yellow WARNING beside a page's sections, never an error,
 * so nothing here can stop Publish or break a page that is already live. The
 * built-in warnings (an empty section, leftover "Example:" text, a synced
 * section with nothing picked) apply everywhere whatever this says. Logic and
 * tests: src/lib/page-guardrails.ts.
 *
 * A custom page here has its own hero above the sections (page.ts), so there
 * is no "must start with" rule. One course finder and one "next issue" band
 * per page is plenty, and past fifteen sections a page is usually two pages.
 */
export const pageRules: PageRules = {
  appliesTo: ['page'],
  atMostOnce: ['sectionCourseFinder', 'sectionNextIssue', 'sectionForm'],
  maxSections: 15,
};
