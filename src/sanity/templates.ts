// Safe to edit by hand
// =============================================================================
// Starting points for "+ New" (the authoring kit, PORTS.md card 109)
// =============================================================================
// The Academy's page templates, course starters and event starters. Each one
// becomes an initial value template in sanity.config.ts, shown in the "+ New"
// menu as "<group>: <title>" (the menu has no headings). `sections()` is a
// FUNCTION so every new document gets fresh `_key`s (freshKeys in
// src/lib/authoring.ts); a shared literal would give two pages the same keys.
//
// THE EXAMPLE RULE. Every word a template puts on a page starts "Example:"
// (example() below), so nothing a template says can be mistaken for a fact
// about the school, and the page builder warns while any is left. The school
// was founded in 2026 and much of its content is still placeholder: templates
// name no course, teacher, date, price or place.
//
// Only section types the custom page accepts (PAGE_SECTION_MEMBERS in
// schemaTypes/blocks.ts). templates.test.ts checks every template against it.
// =============================================================================

import type { Template } from 'sanity';
import { example, freshKeys } from '../lib/authoring.ts';
import * as kit from './templateBlocks.ts';

type Rec = Record<string, unknown>;

export interface PageTemplate {
  /** Stable id. Changing it only changes the menu; pages already made keep their content. */
  id: string;
  /** The menu group ("Enrollment"). */
  group: string;
  /** What the menu says after the group. */
  title: string;
  /** One line under the title, in the menu. */
  description: string;
  /** The custom page's own hero, above the sections. */
  hero: { headline: string; subhead: string };
  /** The sections a new page starts with. */
  sections: () => Rec[];
}

/** "Enrollment: Term announcement", the way the menu shows it. */
export const templateMenuTitle = (t: { group: string; title: string }) => `${t.group}: ${t.title}`;

// ---------------------------------------------------------------------------
// Small builders, so each template reads like the page it makes
// ---------------------------------------------------------------------------

/** One Portable Text paragraph. */
const para = (text: string) => ({
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', marks: [], text: example(text) }],
});

const richText = (heading: string, ...paras: string[]): Rec => ({
  _type: 'sectionRichText',
  heading: example(heading),
  align: 'left',
  body: paras.map(para),
});

const imageText = (heading: string, body: string, side: 'left' | 'right' = 'left'): Rec => ({
  _type: 'sectionImageText',
  imageSide: side,
  heading: example(heading),
  body: [para(body)],
});

const cta = (headline: string, subhead: string, label: string, url: string): Rec => ({
  _type: 'sectionCtaBand',
  headline: example(headline),
  subhead: example(subhead),
  ctaLabel: label,
  ctaUrl: url,
});

const band = (headline: string, label: string, url: string): Rec => ({
  _type: 'sectionInlineBand',
  headline: example(headline),
  ctaLabel: label,
  ctaUrl: url,
});

const steps = (heading: string, items: [string, string][]): Rec => ({
  _type: 'stepsRailSection',
  heading: example(heading),
  steps: items.map(([title, body]) => ({
    _type: 'railStep',
    title: example(title),
    body: example(body),
  })),
});

const questions = (heading: string, items: [string, string][]): Rec => ({
  _type: 'accordionSection',
  heading: example(heading),
  items: items.map(([question, answer]) => ({
    _type: 'accordionItem',
    question: example(question),
    answer: [para(answer)],
  })),
});

const cards = (heading: string, items: [string, string][]): Rec => ({
  _type: 'iconCardsSection',
  heading: example(heading),
  cards: items.map(([title, body]) => ({
    _type: 'iconCard',
    title: example(title),
    body: example(body),
  })),
});

/** Key dates: the dates are left empty on purpose, so Publish asks for real ones. */
const keyDates = (heading: string, labels: string[]): Rec => ({
  _type: 'sectionKeyDates',
  heading: example(heading),
  items: labels.map((label) => ({ _type: 'keyDate', label: example(label) })),
});

const quote = (text: string, who: string): Rec => ({
  _type: 'sectionQuote',
  quote: example(text),
  attribution: example(who),
});

/** A list that fills itself from the Studio (courses, events, faculty, testimonials). */
const fromCatalog = (source: string, heading: string): Rec => ({
  _type: 'sectionDynamicList',
  source,
  heading: example(heading),
});

const courseCovers = (heading: string): Rec => ({
  _type: 'sectionCourseRail',
  source: 'all',
  variant: 'covers',
  heading: example(heading),
});

const page = (...sections: Rec[]) => freshKeys(sections);

// ---------------------------------------------------------------------------
// The builder kit (starter cards 173 and 193; refoundation phase B, 2026-10-27)
// ---------------------------------------------------------------------------
// Builders for the starter's smaller blocks are in templateBlocks.ts. These
// wrap them in the Academy's example rule: every word goes through example(),
// and anything only the Academy can say (a room, a date, a time) is a
// "[Placeholder: ...]" inside it, so Publish-time warnings point straight at it.

/** A button to a page on this site, by its address. */
const go = (label: string, path: string): Rec => ({
  _type: 'ctaBlock',
  label: example(label),
  linkType: 'external',
  externalUrl: path,
});

const ask = (q: string, a: string): Rec => kit.qa(example(q), example(a));

const fold = (heading: string, items: [string, string][]): Rec =>
  kit.accordion(
    example(heading),
    items.map(([q, a]) => ask(q, a)),
  );

// ---------------------------------------------------------------------------
// The page templates
// ---------------------------------------------------------------------------

export const PAGE_TEMPLATES: PageTemplate[] = [
  // --- Basics
  {
    id: 'page-blank',
    group: 'Basics',
    title: 'Blank page',
    description: 'An empty page with a heading. Add sections yourself.',
    hero: { headline: 'Page headline', subhead: 'One sentence on what this page covers.' },
    sections: () => [],
  },
  {
    id: 'page-simple-text',
    group: 'Basics',
    title: 'Simple text page',
    description: 'A story section and a closing invitation. Good for most pages.',
    hero: { headline: 'Page headline', subhead: 'One sentence on what this page covers.' },
    sections: () =>
      page(
        richText(
          'A section heading',
          'Two or three short paragraphs is plenty. Say who this is for and what happens next.',
        ),
        cta('Ready to take the next step?', 'One closing line.', 'Get started', '/get-started/'),
      ),
  },
  {
    id: 'page-info-faq',
    group: 'Basics',
    title: 'Information with questions',
    description: 'The details, the questions people ask, and a button.',
    hero: { headline: 'Page headline', subhead: 'One sentence on who this page is for.' },
    sections: () =>
      page(
        richText('What you need to know', 'The details visitors come to this page for.'),
        questions('Common questions', [
          ['A question people often ask?', 'The plain answer.'],
          ['Another common question?', 'The plain answer.'],
        ]),
        cta('Still have a question?', 'We are glad to help.', 'Contact us', '/contact/'),
      ),
  },
  {
    id: 'page-simple',
    group: 'Basics',
    title: 'Simple page',
    description: 'Text in two columns and a row of buttons. Built from the newer blocks.',
    hero: { headline: 'Page headline', subhead: 'One sentence on what this page covers.' },
    sections: () =>
      page(
        kit.columns(example('A section heading'), [
          kit.column(
            example('The first part'),
            example('Two or three sentences. Say who this is for.'),
          ),
          kit.column(
            example('The second part'),
            example('Two or three sentences. Say what happens next.'),
          ),
        ]),
        kit.buttonRow(
          example('Where to next'),
          [
            kit.link(go('See the courses', '/courses/'), example('What is on this term.')),
            kit.link(go('Ask a question', '/contact/'), example('We answer every message.')),
          ],
          { layout: 'cards' },
        ),
      ),
  },
  {
    id: 'page-questions',
    group: 'Basics',
    title: 'Questions page',
    description: 'Questions people ask, in tabs by topic, each one folding open.',
    hero: { headline: 'Your questions', subhead: 'One sentence inviting people to ask more.' },
    sections: () =>
      page(
        kit.tabs(example('Questions by topic'), [
          kit.tab(
            example('Courses'),
            example('A short answer, or a word on what this topic covers.'),
          ),
          kit.tab(example('Cost'), example('A short answer, or a word on what this topic covers.')),
          kit.tab(
            example('Getting here'),
            example('A short answer, or a word on what this topic covers.'),
          ),
        ]),
        fold('Questions people ask', [
          ['A question people ask', 'A short, friendly answer.'],
          ['Another question', 'A short, friendly answer.'],
          ['A third question', 'A short, friendly answer.'],
        ]),
        kit.buttonRow(example('Still wondering?'), [kit.link(go('Ask us', '/contact/'))]),
      ),
  },
  {
    id: 'page-photo-story',
    group: 'Basics',
    title: 'Photo story',
    description: 'Pictures with a pulled quote, for a page the photos should carry.',
    hero: { headline: 'Page headline', subhead: 'One line inviting people to look around.' },
    sections: () =>
      page(
        { _type: 'sectionGallery', heading: example('A look inside'), columns: '3', images: [] },
        quote('A favorite line from a student or teacher.', 'Who said it'),
        cta('Want to see it for yourself?', 'One closing line.', 'Get started', '/get-started/'),
      ),
  },

  // --- Enrollment
  {
    id: 'page-term-announcement',
    group: 'Enrollment',
    title: 'Term announcement',
    description: 'A new term: what is new, the key dates, the courses, how to enroll.',
    hero: {
      headline: 'The new term',
      subhead: 'One sentence on what this term offers and who it is for.',
    },
    sections: () =>
      page(
        richText(
          'What is new this term',
          'A short paragraph on the term: the theme, a new course, a change to how classes meet.',
        ),
        keyDates('Key dates', ['Enrollment opens', 'Apply by', 'First class', 'Last class']),
        courseCovers('Courses this term'),
        cta(
          'Enrollment is open',
          'One line on how to enroll and who to ask.',
          'Get started',
          '/get-started/',
        ),
      ),
  },
  {
    id: 'page-info-session',
    group: 'Enrollment',
    title: 'Info session invitation',
    description: 'An evening to meet the faculty and ask questions, with the dates coming up.',
    hero: {
      headline: 'Come to an info session',
      subhead: 'One sentence on what happens at an info session and who should come.',
    },
    sections: () =>
      page(
        richText(
          'What to expect',
          'What happens, how long it takes, and whether to bring anything.',
        ),
        fromCatalog('upcomingEvents', 'Info sessions coming up'),
        questions('Before you come', [
          ['Do I need to sign up?', 'The plain answer.'],
          ['Can I bring a friend from church?', 'The plain answer.'],
        ]),
        cta('Cannot make it?', 'One line on another way to talk to us.', 'Contact us', '/contact/'),
      ),
  },
  {
    id: 'page-course-info-night',
    group: 'Enrollment',
    title: 'Course info night',
    description:
      'One evening to meet the teachers: the date, time and place, the evening hour by hour, questions.',
    hero: {
      headline: 'Come to a course information night',
      subhead: 'One sentence on what happens and who should come.',
    },
    sections: () =>
      page(
        kit.eventDetails({
          eyebrow: example('Save the date'),
          title: example('Course information night'),
          // Three weeks out, so a new page opens with a date still to come.
          dates: [kit.eventDate(kit.daysFromNow(21), { startTime: '19:00', endTime: '20:30' })],
          place: example('[Placeholder: the room, the building and the town]'),
          note: example('Meet the teachers, hear about the courses this term and ask anything.'),
          button: go('Save a seat', '/get-started/'),
        }),
        kit.schedule(example('The evening'), [
          kit.scheduleDay('', [
            kit.slot('19:00', example('Welcome'), example('[Placeholder: coffee, or not]')),
            kit.slot('19:15', example('The courses this term')),
            kit.slot('20:00', example('Your questions')),
          ]),
        ]),
        fold('Before you come', [
          ['Do I need to sign up?', 'A short answer.'],
          ['Is there a cost?', 'A short answer.'],
          ['Can I bring someone?', 'A short answer.'],
        ]),
      ),
  },
  {
    id: 'page-term-notice',
    group: 'Enrollment',
    title: 'Term notice',
    description:
      'A notice for the term (a change of room, a class online), what it means, and the days left to enroll.',
    hero: {
      headline: 'A note about this term',
      subhead: 'One sentence on what has changed.',
    },
    sections: () =>
      page(
        kit.notice(example('[Placeholder: what has changed, in one sentence]'), {
          urgency: 'info',
        }),
        kit.columns(example('What it means for you'), [
          kit.column(example('If you are enrolled'), example('Two or three sentences.')),
          kit.column(example('If you are thinking of joining'), example('Two or three sentences.')),
        ]),
        kit.countdown({
          eventName: example('Enrollment for this term closes'),
          // Two weeks out; change it to the real last day.
          startDate: kit.daysFromNow(14),
          duringText: example('Enrollment closes today.'),
          afterText: example('Enrollment for this term has closed.'),
          link: go('See the courses', '/courses/'),
        }),
      ),
  },
  {
    id: 'page-how-to-enroll',
    group: 'Enrollment',
    title: 'How to enroll',
    description: 'The steps from interest to the first class, with the questions people ask.',
    hero: { headline: 'How to enroll', subhead: 'One sentence that makes it sound simple.' },
    sections: () =>
      page(
        steps('Four steps', [
          ['Choose a course', 'Where to find the courses and how to pick.'],
          ['Tell us you are interested', 'The form, and what happens after you send it.'],
          ['Confirm your place', 'How a place is confirmed and how to pay.'],
          ['Come to the first class', 'What to bring and where to go.'],
        ]),
        questions('Questions about enrolling', [
          ['Is there help with the cost?', 'Where to read about scholarships.'],
          ['Can I sit in before I enroll?', 'The plain answer.'],
        ]),
        cta('Ready?', 'One line inviting people to begin.', 'Get started', '/get-started/'),
      ),
  },

  // --- Teaching
  {
    id: 'page-lecture-series',
    group: 'Teaching',
    title: 'Lecture or study series',
    description: 'A run of evenings on one theme: the idea, the sessions, who teaches.',
    hero: {
      headline: 'The series title',
      subhead: 'One sentence on the question this series takes up.',
    },
    sections: () =>
      page(
        richText('Why this series', 'A short paragraph on the theme and why it matters now.'),
        steps('The sessions', [
          ['Session one', 'One line on what this session covers.'],
          ['Session two', 'One line on what this session covers.'],
          ['Session three', 'One line on what this session covers.'],
        ]),
        fromCatalog('faculty', 'Who teaches'),
        cta('Join the series', 'One line on how to come.', 'Get started', '/get-started/'),
      ),
  },
  {
    id: 'page-reading-list',
    group: 'Teaching',
    title: 'Reading list',
    description: 'Books and readings on a theme, grouped, with a word on each.',
    hero: {
      headline: 'A reading list',
      subhead: 'One sentence on who this list is for and where to start.',
    },
    sections: () =>
      page(
        richText('Where to start', 'Two or three books for a first step, and why each one.'),
        cards('Going further', [
          ['A book title', 'One or two lines on why to read it.'],
          ['A book title', 'One or two lines on why to read it.'],
          ['A book title', 'One or two lines on why to read it.'],
        ]),
        band('Want to read it with others?', 'See the courses', '/courses/'),
      ),
  },
  {
    id: 'page-faculty-spotlight',
    group: 'Teaching',
    title: 'Faculty spotlight',
    description: 'One teacher: a photo, their story, a line in their own words.',
    hero: { headline: 'A name and a role', subhead: 'One sentence on what they teach.' },
    sections: () =>
      page(
        imageText(
          'Their story',
          'Where they studied, where they serve, and what they love to teach.',
        ),
        quote('A line about teaching, in their own words.', 'Their name'),
        courseCovers('Courses they teach'),
      ),
  },

  // --- Partners
  {
    id: 'page-for-congregations',
    group: 'Partners',
    title: 'For congregations',
    description: 'How a congregation can send people, host a class or share the news.',
    hero: {
      headline: 'For congregations',
      subhead: 'One sentence on what the Academy offers a congregation.',
    },
    sections: () =>
      page(
        cards('Ways to take part', [
          ['Send people', 'One or two lines on recommending the Academy.'],
          ['Host a class', 'One or two lines on hosting.'],
          ['Share the news', 'One or two lines on bulletins and announcements.'],
        ]),
        steps('How hosting works', [
          ['Get in touch', 'Who to contact and when.'],
          ['Pick a course and dates', 'How the course and dates are chosen.'],
          ['We do the rest', 'What the Academy looks after.'],
        ]),
        cta('Talk to us', 'One line on who to contact.', 'Contact us', '/contact/'),
      ),
  },
  {
    id: 'page-scholarships',
    group: 'Partners',
    title: 'Scholarships and support',
    description: 'Help with the cost: who it is for, how to ask, how to give.',
    hero: {
      headline: 'Help with the cost',
      subhead: 'One sentence saying cost should not keep anyone from learning.',
    },
    sections: () =>
      page(
        {
          _type: 'sectionScholarship',
          headline: example('Scholarships'),
          body: example('Who can ask, how to ask, and how quickly you will hear back.'),
        },
        richText('Support a student', 'A short paragraph on how a gift helps and how to give.'),
        cta('Ask about a scholarship', 'One line on who to write to.', 'Contact us', '/contact/'),
      ),
  },
];

// ---------------------------------------------------------------------------
// Course and event starters
// ---------------------------------------------------------------------------

const COURSE_AND_EVENT_TEMPLATES: (Omit<Template, 'value'> & { value: () => Rec })[] = [
  {
    id: 'course-starter',
    title: 'Course: course with sessions',
    description: 'The usual defaults filled in: format, level, a session outline to complete.',
    schemaType: 'course',
    value: () => ({
      summary: example('One or two sentences on what this course covers and why it matters.'),
      level: 'Foundational',
      format: 'In person',
      featured: false,
      startHere: false,
      whoFor: [
        example('A person this course is for, like "Small-group leaders who teach the text"'),
      ],
      sessionOutline: freshKeys([
        { _type: 'courseSession', title: example('Session 1'), focus: example('One line.') },
        { _type: 'courseSession', title: example('Session 2'), focus: example('One line.') },
        { _type: 'courseSession', title: example('Session 3'), focus: example('One line.') },
      ]),
    }),
  },
  {
    id: 'event-info-session',
    title: 'Event: info session',
    description: 'An evening to meet the Academy: a time, a place, an RSVP.',
    schemaType: 'event',
    value: () => ({
      eventType: 'oneTime',
      category: 'Info session',
      audience: 'Prospective students',
      summary: example('One or two sentences on what happens and who should come.'),
      registrationLabel: 'Save your seat',
      featured: false,
      featuredOnHome: true,
      allDay: false,
    }),
  },
  {
    id: 'event-open-lecture',
    title: 'Event: open lecture',
    description: 'A lecture anyone can come to.',
    schemaType: 'event',
    value: () => ({
      eventType: 'oneTime',
      category: 'Open lecture',
      audience: 'Everyone',
      summary: example('One or two sentences on the subject and the speaker.'),
      featured: false,
      featuredOnHome: false,
      allDay: false,
    }),
  },
  {
    id: 'event-term-start',
    title: 'Event: term starts',
    description: 'The first day of a term, on the Events page.',
    schemaType: 'event',
    value: () => ({
      eventType: 'oneTime',
      category: 'Term start',
      audience: 'Everyone',
      summary: example('One sentence welcoming students to the new term.'),
      featured: false,
      featuredOnHome: true,
      allDay: true,
    }),
  },
  {
    id: 'event-apply-by',
    title: 'Event: application deadline',
    description: 'The last day to apply for a term.',
    schemaType: 'event',
    value: () => ({
      eventType: 'oneTime',
      category: 'Application deadline',
      audience: 'Prospective students',
      summary: example('One sentence on what to send by this day, and where.'),
      featured: false,
      featuredOnHome: true,
      allDay: true,
    }),
  },
];

/** Every "+ New" template, ready for sanity.config.ts (the icon is added there). */
export function startingTemplates(): Template[] {
  return [
    ...PAGE_TEMPLATES.map((t) => ({
      id: t.id,
      title: templateMenuTitle(t),
      description: t.description,
      schemaType: 'page',
      value: () => ({
        heroHeadline: example(t.hero.headline),
        heroSubhead: example(t.hero.subhead),
        sections: t.sections(),
      }),
    })),
    ...COURSE_AND_EVENT_TEMPLATES,
  ];
}
