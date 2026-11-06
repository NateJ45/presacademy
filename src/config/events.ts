// Safe to edit by hand
// =============================================================================
// events.ts - this site's map for the GA4 event layer (PORTS.md card 217)
// =============================================================================
// The shared half is src/lib/track.ts and src/components/analytics/SiteEvents.astro
// (PORTABLE); they read this map and nothing else.
//
// What the Academy sends (all new; the site sent no custom events before):
//   booking_click      the "Book a free intro" link, when it goes to Calendly (the rule below)
//   contact_click      an email or phone link (built in; the kind only, never the address)
//   directions_click   a Google or Apple Maps link (built in)
//   watch_click        a YouTube or Vimeo link (built in)
//   form_view          a form came 40% into view (built in)
//   embed_interact     a visitor first used an embedded frame (built in)
//   generate_lead      a form went through (FormRenderer and NewsletterSignup call track())
//   page_not_found     the 404 page (built in)
//   js_error           an error in the site's own scripts (built in)
//
// WHY THE INTRO BUTTON IS COUNTED ONLY WHEN IT GOES TO CALENDLY. The same button
// falls back to an email link ("Email to set up an intro") when no booking link is
// set, and that is the state the live site was in on 2026-11-06. An email link is
// classified before any rule runs (it is a contact_click), and it is a request to
// talk, not a booking, so it is not renamed here. Setting a Calendly link in the
// Studio (Get started page) or PUBLIC_CALENDLY_URL starts booking_click counting
// with no further change. A click is a click: the site cannot see whether a call
// was then booked.
//
// OFF, AND WHY.
//   outbound_click, download_click  Google's Enhanced Measurement (on for this
//     property: scroll, a measurement it only sends from that setting, is in the
//     data) counts clicks to other sites and file downloads, so ours would double
//     them. Not checked in the GA4 admin screen, which nothing here can read.
//   site_search, search_no_results  there is no site search.
//   article_progress, article_read  the site has no article pages; /resources/ is
//     a list of links and each course and faculty page is short.
//
// The privacy page is derived from this map (src/lib/event-kinds.ts), so it
// names exactly what is above and nothing else. Docs: docs/agent/analytics.md.
// =============================================================================

import type { EventsConfig } from '@/lib/track';

export const eventsConfig: EventsConfig = {
  links: [
    // The free intro call. Calendly serves the booking page on calendly.com.
    {
      host: 'calendly.com',
      event: 'booking_click',
      params: { destination: 'calendly' },
      describe: 'the link to book an intro call',
    },
  ],

  off: [
    'outbound_click',
    'download_click',
    'site_search',
    'search_no_results',
    'article_progress',
    'article_read',
  ],
};
