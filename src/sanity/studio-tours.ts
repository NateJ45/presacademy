// Safe to edit by hand
// =============================================================================
// The Academy's Studio tours, welcome and "What's new" (PORTS.md card 137)
// =============================================================================
// Plain data, kept out of kit.config.ts so src/lib/studio-tour.test.ts can read
// it in bare Node and catch a typo (a welcome naming a tour that is not there,
// an em-dash, a date that is not a date). kit.config.ts passes these on as
// `tours`, `welcome` and `whatsNew`. Jobs and roles: docs/agent/studio-plan.md.
//
// How each tour is reached:
//   - 'first-run' by itself the first time, then "Show me around" on Home and
//     in the Site Guide;
//   - a tour with `tool` is that screen's "How this screen works" button
//     (Home, Quick update, the Site Guide, New term);
//   - a What's new entry may name a tour to start from the modal.
//
// Each stop's `anchor` is what gets the spotlight: a kit hook ('home-banner',
// 'quick-list'), a Quick update tile ('quick:seats', the form's id in
// kit.config.ts), a tool tab ('tool:quick-update') or `css:<selector>` for the
// site's own New term cards. No anchor, or one not on screen: the popover sits
// in the middle. Full list: docs/agent/studio-kit.md, "Spotlight tours".
//
// The words follow the Site Guide: US spelling, plain, warm, no em-dashes.
// =============================================================================

import type { TourDef, WelcomeConfig, WhatsNewEntry } from '../lib/studio-tour.ts';

export const TOURS: TourDef[] = [
  {
    id: 'first-run',
    title: 'A quick tour',
    firstRun: true,
    steps: [
      {
        anchor: 'home-banner',
        title: 'This is Home',
        short: 'Home',
        meaning: 'home',
        body: 'Home opens first every time. It shows what to do this week, whether your last change is on the website yet, and anything that needs fixing.',
      },
      {
        anchor: 'home-this-week',
        title: 'This week',
        short: 'This week',
        meaning: 'step',
        body: 'The jobs that come round every week. Most check themselves when the website shows they are done; check the others by hand.',
      },
      {
        anchor: 'tool:quick-update',
        title: 'Quick update, for your phone',
        short: 'Quick update',
        meaning: 'quickUpdate',
        body: 'Mark a course full, put up a notice, remind people enrollment closes or move a class, in a few taps. These go on the website straight away.',
      },
      {
        anchor: 'tool:structure',
        title: 'Content is where you edit',
        short: 'Content',
        meaning: 'content',
        body: 'Courses, terms, faculty, notices, events and every page. The things you change most are at the top.',
      },
      {
        anchor: 'tool:term-setup',
        title: 'A new term has its own checklist',
        short: 'New term',
        meaning: 'times',
        body: 'New term walks the start of every term in order and checks each step off as you go.',
      },
      {
        title: 'Nothing is public until you press Publish',
        short: 'Publish',
        meaning: 'publishing',
        body: 'Changes in Content stay private until you press the green Publish button. After that the website updates itself in a few minutes.',
      },
      {
        anchor: 'home-help',
        title: 'Help is always one click away',
        short: 'Help',
        meaning: 'help',
        body: 'The Site Guide has step-by-step help for every job, with pictures and short videos. "Show me around" here brings this tour back.',
      },
    ],
  },
  {
    id: 'home',
    title: 'How this screen works',
    tool: 'home',
    steps: [
      {
        anchor: 'home-this-week',
        title: 'This week',
        meaning: 'step',
        body: 'The jobs that come round every week. Each one checks itself when it is done, or you check it by hand.',
      },
      {
        anchor: 'home-is-it-live',
        title: 'Is it live?',
        meaning: 'publishing',
        body: 'After you publish, this says when the website has caught up, usually within a few minutes.',
      },
      {
        anchor: 'home-fix-it',
        title: 'Fix it',
        meaning: 'checkup',
        body: 'Things the Checkup found that need a look, each with a button that opens the right place.',
      },
      {
        anchor: 'home-recent',
        title: 'Recent edits',
        meaning: 'document',
        body: 'The last things anyone changed, newest first. Click one to open it again.',
      },
      {
        anchor: 'home-videos',
        title: 'Watch how it is done',
        meaning: 'guide',
        body: 'Short videos for the jobs people ask about most. Press play; the words are on screen.',
      },
    ],
  },
  {
    id: 'quick-update',
    title: 'How this screen works',
    tool: 'quick-update',
    steps: [
      {
        anchor: 'quick-list',
        title: 'One job per button',
        meaning: 'post',
        body: 'Pick a job, fill in a few boxes and press the button at the bottom. Each one says what it did when it is finished.',
      },
      {
        anchor: 'quick:seats',
        title: 'Mark a course full or waitlisted',
        meaning: 'people',
        body: 'Pick the course, then Open, Waitlist or Full. The course card on the website changes in a few minutes.',
      },
      {
        anchor: 'quick:enrollment-reminder',
        title: 'Remind people enrollment closes',
        meaning: 'form',
        body: 'Writes the notice for you from the next term and its Apply by date. It comes down by itself.',
      },
      {
        anchor: 'quick:class-change',
        title: 'Cancel or move a class',
        meaning: 'times',
        body: 'A red notice across every page for a day or two. Email the class as well.',
      },
      {
        anchor: 'quick:term-status',
        title: 'Open or close enrollment',
        meaning: 'times',
        body: 'Set where a term is: Upcoming, Registration open, In session or Closed. The notices and dates follow.',
      },
    ],
  },
  {
    id: 'guide',
    title: 'How this screen works',
    tool: 'guide',
    steps: [
      {
        anchor: 'guide-index',
        title: 'Help for every job',
        meaning: 'guide',
        body: 'Search or browse. Each guide is step by step, with pictures, and you can print it.',
      },
      {
        anchor: 'guide-videos',
        title: 'Videos',
        meaning: 'help',
        body: 'A few jobs have a short video with the steps written on screen. Press play, or turn the sound off: nothing depends on it.',
      },
    ],
  },
  {
    id: 'term-setup',
    title: 'How this screen works',
    tool: 'term-setup',
    steps: [
      {
        anchor: 'css:.pa-setup-card',
        title: 'The start of every term, in order',
        meaning: 'times',
        body: 'Each card is one step. Click it to go to the right place, make the change and publish.',
      },
      {
        title: 'It reads the website each time',
        meaning: 'step',
        body: 'Come back after publishing and press Check again. Steps that are done turn green, so you can stop halfway and pick up later.',
      },
    ],
  },
];

export const WELCOME: WelcomeConfig = {
  title: 'Welcome to the Academy’s website',
  body: 'This is where the website is kept up to date: notices, events, terms and courses. You cannot break anything by looking around. Nothing is public until you press Publish, and almost everything can be undone.',
  points: [
    'Home shows what needs doing this week.',
    'Quick update has the short jobs, made for a phone.',
    'The Site Guide explains every job, with pictures and videos.',
  ],
};

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    date: '2026-10-19',
    title: 'Quick update does more',
    items: [
      'Mark a course full or waitlisted from your phone.',
      'Change an event’s time or place, and open or close enrollment for a term.',
      'Answer messages is one tap away, and holiday and summer break notices appear in their season.',
      'Home’s This week also watches enrollment notices and seats.',
    ],
    tour: 'quick-update',
  },
  {
    date: '2026-10-19',
    title: 'Tours and short videos',
    items: [
      'Show me around, on Home and in the Site Guide, walks you through the editor.',
      'How this screen works explains the screen you are on.',
      'Some guides now have a short video showing the job.',
    ],
    tour: 'first-run',
  },
];
