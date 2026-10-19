// Safe to edit by hand
// =============================================================================
// The Academy's spotlight tours, as DATA for starter card 137
// =============================================================================
// Card 137 brings spotlight tours (a popover pinned to a real control in the
// Studio) and welcome / what's-new modals to every family site. Until it lands
// nothing reads this file: the steps are written here so wiring them is a
// mapping job, not a writing job. When 137 merges, map each step onto its tour
// config (its own field names may differ: `anchor` is what to point at, `role`
// who sees it, `when` whether it runs by itself the first time or only from
// "Show me how" in the Site Guide / Home).
//
// Anchors name the thing on screen in plain terms ("tool:quick-update" is the
// Quick update button in the top bar; "field:offerings" is that field in the
// editor; "home:this-week" is Home's This week card). Turn them into whatever
// selector 137 uses (a data attribute, a tool name, a field path).
//
// The words follow the Site Guide: US spelling, plain, warm, no em-dashes.
// Jobs and roles: docs/agent/studio-plan.md.
// =============================================================================

export type TourRole = 'staff' | 'everyone';
export type TourWhen = 'first-run' | 'on-demand';

export interface TourStepData {
  /** What the popover points at (see the header for the vocabulary). */
  anchor: string;
  title: string;
  body: string;
}

export interface TourData {
  id: string;
  /** What the tour is called where it is offered ("Show me how"). */
  title: string;
  role: TourRole;
  when: TourWhen;
  /** The guide that offers it, if any (a slug in ./content.ts). */
  guide?: string;
  steps: TourStepData[];
}

/** The welcome modal the first time anyone opens the Studio, before the first tour. */
export const WELCOME = {
  title: 'Welcome to the Academy’s website',
  body: 'This is where the website is kept up to date: notices, events, terms and courses. Nothing you change is public until you press Publish, and almost everything can be undone. Take the two-minute tour, or skip it and find it again on Home.',
  primary: 'Take the tour',
  secondary: 'Not now',
};

/** What's-new modal for this round (card 137 decides how it is versioned). */
export const WHATS_NEW = {
  title: 'New in the Studio',
  items: [
    'Quick update can now write an enrollment reminder for you, from the next term’s Apply by date.',
    'An info session from Quick update can carry a sign-up link.',
    'Home’s This week watches enrollment: a notice while it is open, and seats and waitlists.',
    'New guides: Open a new term, Enrollment season, Cancel or move a class, and Close a term.',
  ],
};

export const TOURS: TourData[] = [
  {
    id: 'first-look',
    title: 'A first look around',
    role: 'everyone',
    when: 'first-run',
    steps: [
      {
        anchor: 'home:banner',
        title: 'This is Home',
        body: 'Home opens first every time. It shows what to do this week, whether your last change is on the website yet, and anything that needs fixing.',
      },
      {
        anchor: 'home:this-week',
        title: 'This week',
        body: 'The jobs that come round every week. Most tick themselves when the website shows they are done; tick the others by hand.',
      },
      {
        anchor: 'tool:quick-update',
        title: 'Quick update, for your phone',
        body: 'A notice, an enrollment reminder, a class that moved or an info night, in a few taps. These go on the website straight away.',
      },
      {
        anchor: 'tool:structure',
        title: 'Content is where you edit',
        body: 'Courses, terms, faculty, notices, events and every page. The things you change most are at the top.',
      },
      {
        anchor: 'tool:term-setup',
        title: 'A new term has its own checklist',
        body: 'New term walks the start of every term in order and ticks each step off as you go.',
      },
      {
        anchor: 'tool:site-guide',
        title: 'Help is one click away',
        body: 'Step-by-step help for every job, with pictures. Stuck? Home has a card for asking for help.',
      },
    ],
  },
  {
    id: 'enrollment-reminder',
    title: 'Show me: an enrollment reminder',
    role: 'staff',
    when: 'on-demand',
    guide: 'enrollment',
    steps: [
      {
        anchor: 'tool:quick-update',
        title: 'Open Quick update',
        body: 'On a phone, open the menu first. Quick update is near the top.',
      },
      {
        anchor: 'quick-update:enrollment-reminder',
        title: 'Remind people enrollment closes',
        body: 'This one writes the words for you from the next term: its name and its Apply by date.',
      },
      {
        anchor: 'quick-update:field:message',
        title: 'Your own words, if you like',
        body: 'Leave this empty and the reminder is written for you. Type here only if you want to say something else, like "Two seats left in Romans."',
      },
      {
        anchor: 'quick-update:submit',
        title: 'Put it up',
        body: 'It is on every page in a few minutes, links to Get started, and takes itself down after Apply by.',
      },
    ],
  },
  {
    id: 'class-change',
    title: 'Show me: cancel or move a class',
    role: 'staff',
    when: 'on-demand',
    guide: 'cancel-a-class',
    steps: [
      {
        anchor: 'quick-update:class-change',
        title: 'Cancel or move a class',
        body: 'A red notice across the top of every page, for one or two days.',
      },
      {
        anchor: 'quick-update:field:message',
        title: 'Say which class and what to do',
        body: 'Like "Tonight’s Romans class meets online instead." Keep it to one or two sentences.',
      },
      {
        anchor: 'quick-update:field:lastDay',
        title: 'When it comes down',
        body: 'It starts as tomorrow. For a class moved to next week, pick the day after the new date.',
      },
      {
        anchor: 'quick-update:submit',
        title: 'Then email the class',
        body: 'The notice is for anyone who checks the website. The people enrolled need an email too.',
      },
    ],
  },
  {
    id: 'seats',
    title: 'Show me: mark a course full',
    role: 'staff',
    when: 'on-demand',
    guide: 'enrollment',
    steps: [
      {
        anchor: 'desk:catalog;course',
        title: 'Open the course',
        body: 'Content, then Catalog, then Courses. Click the course that has filled.',
      },
      {
        anchor: 'tab:schedule',
        title: 'Schedule & cohorts',
        body: 'Each term the course runs in is an offering here.',
      },
      {
        anchor: 'field:offerings',
        title: 'Open this term’s offering',
        body: 'Set its Status to Waitlist when the course is full, or Closed when it can take nobody else. Change the Seats note too.',
      },
      {
        anchor: 'action:publish',
        title: 'Publish',
        body: 'The course card on the website changes in a few minutes.',
      },
    ],
  },
  {
    id: 'new-term',
    title: 'Show me: open a new term',
    role: 'staff',
    when: 'on-demand',
    guide: 'new-term',
    steps: [
      {
        anchor: 'tool:term-setup',
        title: 'New term',
        body: 'The start of every term, in order. It reads the website each time, so you can stop halfway.',
      },
      {
        anchor: 'term-setup:create-term',
        title: 'Create the term first',
        body: 'Its name and the day it begins. Everything else hangs on that date.',
      },
      {
        anchor: 'term-setup:point-courses',
        title: 'Then the courses that run',
        body: 'Each course gets a new offering for this term, in its Schedule & cohorts tab.',
      },
      {
        anchor: 'term-setup:announce',
        title: 'Then tell people',
        body: 'The term-start event and an enrollment notice. Quick update writes the notice for you.',
      },
    ],
  },
  {
    id: 'publish',
    title: 'Show me: publish a change',
    role: 'everyone',
    when: 'on-demand',
    guide: 'edit-page',
    steps: [
      {
        anchor: 'action:publish',
        title: 'Nothing is public until Publish',
        body: 'Your changes are saved as you type, privately. Publish puts them on the website.',
      },
      {
        anchor: 'navbar:status',
        title: 'Watch it go live',
        body: 'The line in the top bar says when the website has caught up, usually a few minutes.',
      },
      {
        anchor: 'action:undo',
        title: 'Changed your mind?',
        body: 'Undo steps back. A thing you delete goes to the Trash, and you can bring it back.',
      },
    ],
  },
];
