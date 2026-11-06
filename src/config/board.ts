// Safe to edit by hand
// =============================================================================
// board.ts - this site's Report (the Studio tool, PORTS.md card 218)
// =============================================================================
// NOT PORTABLE: each site edits this file. The shared half (the arithmetic in
// src/lib/studio-board.ts, the screen in src/sanity/kit/board/, the route
// /api/studio/board/) reads this and nothing else, so a site's report is its
// own: its parts, its words, its measures.
//
// The tool appears in the Studio when PUBLIC_BOARD_REPORT is "true" at build
// time (deploy.yml passes the repository variable). The numbers come from
// Google Analytics and Search Console through studio-status (card 136's
// SITE_DATA binding); without that the tool explains what is needed.
//
// MEASURES
//   Numbers, for tiles and by-month charts:
//     visitors, visits, pageViews, newVisitors, searchClicks, searchAppearances,
//     event:<name>   a GA4 event the site sends (docs/agent/analytics.md) AND
//                    studio-status counts for this site (its site-series-config).
//   Lists, for charts only:
//     topContent (prefix: ['/journal/'] keeps those paths), channels, places,
//     countries, searchQueries, searchPages.
//
// WORDS: write what an editor would say. "Visitors" and "pages viewed", never
// "sessions" or "engagement rate". No em-dashes. Put how a number is counted in
// `explain`: it sits behind the "i" button, out of the way.
//
// DATES
//   firstMonth  the first month the picker offers.
//   since       the day a measure was first counted; before it the report says
//               "Not tracked yet", never 0. `all` covers every measure.
//   gaps        months when counting was down, with a sentence: left out of
//               charts, and no year-on-year change on a period that touches one.
// =============================================================================

import type { BoardConfig } from '../lib/studio-board';
import { site } from '../data/site';

/**
 * The day the shared event layer (card 217) went live: every event below was first
 * counted then, so earlier days read "Not tracked yet", never 0. The main session
 * sets the real deploy day if it is not this one.
 */
const EVENTS_SINCE = '2026-11-06';

const ENQUIRY =
  'Each time someone sent one of the website forms and it went through, such as the Ask us anything form on Contact or the request for information on Get started. It counts that a form was sent, never what it said or who sent it. A newsletter sign-up counts here too, once the newsletter is switched on.';
const BOOKING =
  'Each time someone clicked the button that opens the online page for booking a free intro call. It is a click, not a booked call: the website cannot see whether the person then picked a time. While that button is an email link instead, its clicks show under Email and phone clicks and not here.';
const CONTACT =
  'Clicks on an email address or phone number on the website. The website cannot see whether the email was written or the call made.';
const GOOGLE =
  'Times someone chose the website in a Google search. From Google Search Console, which runs about three days behind and shows this site from October 4, 2026.';
const VISITORS =
  'People who came to the website. Someone who comes back in the same period is counted once. Counting began on October 4, 2026.';
const ENQUIRY_PAGES = ['/get-started', '/for-you', '/pricing', '/contact'];

export const boardConfig: BoardConfig = {
  siteName: site.name,
  firstMonth: '2026-10',
  timeZone: 'America/New_York',
  // Visits, pages and Google's numbers begin on October 4, 2026, the first day either has data.
  // Every event is new with the shared event layer.
  since: {
    all: EVENTS_SINCE,
    visitors: '2026-10-04',
    visits: '2026-10-04',
    pageViews: '2026-10-04',
    newVisitors: '2026-10-04',
    searchClicks: '2026-10-04',
    searchAppearances: '2026-10-04',
  },
  gaps: [],

  overview: {
    tiles: [
      { measure: 'visitors', label: 'Visitors', explain: VISITORS },
      { measure: 'event:generate_lead', label: 'Enquiries sent', explain: ENQUIRY },
      { measure: 'event:booking_click', label: 'Intro call clicks', explain: BOOKING },
      { measure: 'searchClicks', label: 'Clicks from Google', explain: GOOGLE },
    ],
    charts: [
      { measure: 'visitors', title: 'Visitors by month' },
      {
        measure: 'topContent',
        title: 'Course pages viewed',
        prefix: ['/courses'],
        note: 'The course list and each course page, by pages opened.',
      },
      { measure: 'channels', title: 'How people found the Academy' },
    ],
  },

  parts: [
    {
      id: 'enquiry',
      title: 'The path to an enquiry',
      nav: 'Enquiries',
      explain:
        'What people did to ask a question or start a conversation. The list shows how often the pages that lead there were opened, so it shows what people read, not how many people read it. A form counts when it went through; a click on an email, a phone number or the intro call button counts when pressed.',
      tiles: [
        { measure: 'event:generate_lead', label: 'Enquiries sent', explain: ENQUIRY },
        { measure: 'event:booking_click', label: 'Intro call clicks', explain: BOOKING },
        { measure: 'event:contact_click', label: 'Email and phone clicks', explain: CONTACT },
      ],
      charts: [
        {
          measure: 'topContent',
          title: 'Pages opened on the way to an enquiry',
          prefix: ENQUIRY_PAGES,
          note: 'Get started, For you, Pricing and Contact.',
        },
        { measure: 'event:generate_lead', title: 'Enquiries sent by month' },
      ],
      more: [
        {
          measure: 'event:form_view',
          title: 'Times a form was seen, by month',
        },
        { measure: 'event:contact_click', title: 'Email and phone clicks by month' },
        { measure: 'event:booking_click', title: 'Intro call clicks by month' },
      ],
    },
    {
      id: 'courses',
      title: 'Courses',
      explain:
        'The course list and the page for each course. The list counts pages opened, so it shows which courses people looked at, not how many people looked.',
      charts: [
        {
          measure: 'topContent',
          title: 'Course pages viewed',
          prefix: ['/courses'],
          limit: 10,
        },
      ],
    },
    {
      id: 'faculty',
      title: 'Faculty',
      explain: 'The faculty list and each teacher’s page, by pages opened.',
      charts: [
        {
          measure: 'topContent',
          title: 'Faculty pages viewed',
          prefix: ['/faculty'],
          limit: 10,
        },
      ],
    },
    {
      id: 'found',
      title: 'How people found the Academy',
      nav: 'How found',
      explain:
        'Where visitors came from. A click from Google is someone choosing the Academy in a search; an appearance is the Academy being listed, chosen or not. Google keeps about sixteen months, so older periods are not compared.',
      tiles: [
        { measure: 'searchClicks', label: 'Clicks from Google', explain: GOOGLE },
        { measure: 'searchAppearances', label: 'Times it appeared on Google', up: 'flat' },
        { measure: 'newVisitors', label: 'First-time visitors' },
      ],
      charts: [
        { measure: 'channels', title: 'How people found the Academy' },
        { measure: 'searchQueries', title: 'Searches that found the Academy' },
      ],
      more: [
        { measure: 'searchPages', title: 'Pages Google sent people to' },
        { measure: 'places', title: 'Where visitors were' },
        { measure: 'pageViews', title: 'Pages viewed by month', type: 'line' },
      ],
    },
  ],
};
