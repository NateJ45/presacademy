// Safe to edit by hand
// =============================================================================
// The Academy's seasonal saved sections (the authoring kit, PORTS.md card 109)
// =============================================================================
// The moments every term brings round again: enrollment opens, the deadline
// nears, the term starts, the term ends, summer, the seasons of the church year.
// Each one is a saved section (a `sectionPreset` document, id `pattern-<id>`)
// staff add to any page with "Insert a saved section": as a COPY to change on
// that page, or SYNCED, so one edit to the saved section changes every page
// showing it ("Enrollment is open" on Home, Courses and Pricing at once).
//
// scripts/content/seed-section-patterns.mjs copies these into the dataset as
// DRAFTS (never overwriting one that exists); templates.test.ts checks them.
//
// Every word starts "Example:" (the page builder warns while any is left) and
// no pattern states a date, a price, a teacher or a fact about the school.
// =============================================================================

import { example, freshKeys } from '../lib/authoring.ts';
import * as kit from './templateBlocks.ts';

type Rec = Record<string, unknown>;

export interface SectionPattern {
  /** Stable id. The saved section is stored as `pattern-<id>`. */
  id: string;
  /** The saved section's name, as the "Insert a saved section" list shows it. */
  title: string;
  /** One line under the name: where it fits and what to change. */
  note: string;
  /** The sections, with fresh keys every call. */
  sections: () => Rec[];
}

const para = (text: string) => ({
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', marks: [], text: example(text) }],
});

const band = (headline: string, label: string, url: string): Rec => ({
  _type: 'sectionInlineBand',
  headline: example(headline),
  ctaLabel: label,
  ctaUrl: url,
});

const cta = (headline: string, subhead: string, label: string, url: string): Rec => ({
  _type: 'sectionCtaBand',
  headline: example(headline),
  subhead: example(subhead),
  ctaLabel: label,
  ctaUrl: url,
});

const richText = (heading: string, ...paras: string[]): Rec => ({
  _type: 'sectionRichText',
  heading: example(heading),
  align: 'left',
  body: paras.map(para),
});

const pattern = (...sections: Rec[]) => freshKeys(sections);

/** A button to a page on this site (the builder kit's buttons are ctaBlocks). */
const go = (label: string, path: string): Rec => ({
  _type: 'ctaBlock',
  label: example(label),
  linkType: 'external',
  externalUrl: path,
});

export const SECTION_PATTERNS: SectionPattern[] = [
  {
    id: 'enrollment-open',
    title: 'Season: Enrollment is open',
    note: 'A band and the key dates. Add it SYNCED to Home, Courses and Pricing, then fill in the dates once.',
    sections: () =>
      pattern(band('Enrollment for the new term is open.', 'See the courses', '/courses/'), {
        _type: 'sectionKeyDates',
        heading: example('Key dates'),
        items: [
          { _type: 'keyDate', label: example('Enrollment opens') },
          { _type: 'keyDate', label: example('Apply by') },
          { _type: 'keyDate', label: example('First class') },
        ],
      }),
  },
  {
    id: 'deadline-near',
    title: 'Season: Apply by soon',
    note: 'A short reminder band for the last two weeks before the deadline.',
    sections: () =>
      pattern(band('There is still time to apply for this term.', 'Get started', '/get-started/')),
  },
  {
    id: 'info-session',
    title: 'Season: Come to an info session',
    note: 'An invitation and the events coming up. The list fills itself from Events.',
    sections: () =>
      pattern(
        cta(
          'Meet the faculty and ask your questions',
          'One line on what happens at an info session.',
          'See the events',
          '/events/',
        ),
        { _type: 'sectionDynamicList', source: 'upcomingEvents', heading: example('Coming up') },
      ),
  },
  // The builder kit (starter cards 173 and 193; refoundation phase B, 2026-10-27).
  {
    id: 'enrollment-closing',
    title: 'Season: Enrollment closes soon',
    note: 'A dated notice and a countdown to the last day. Set the dates once; both hide themselves after the day.',
    sections: () =>
      pattern(
        kit.notice(example('Enrollment for this term closes soon. [Placeholder: the last day]'), {
          urgency: 'urgent',
        }),
        kit.countdown({
          eventName: example('Enrollment for this term closes'),
          startDate: kit.daysFromNow(14),
          duringText: example('Enrollment closes today.'),
          afterText: example('Enrollment for this term has closed.'),
          link: go('See the courses', '/courses/'),
        }),
      ),
  },
  {
    id: 'info-session-evening',
    title: 'Season: Info session, with the evening',
    note: 'Event details with "Add to my calendar" and the evening hour by hour. Change the date, time and place.',
    sections: () =>
      pattern(
        kit.eventDetails({
          eyebrow: example('Save the date'),
          title: example('An information session'),
          dates: [kit.eventDate(kit.daysFromNow(21), { startTime: '19:00', endTime: '20:30' })],
          place: example('[Placeholder: the room, the building and the town]'),
          note: example('Meet the teachers, hear about the courses and ask anything.'),
          button: go('Save a seat', '/get-started/'),
        }),
        kit.schedule(example('The evening'), [
          kit.scheduleDay('', [
            kit.slot('19:00', example('Welcome')),
            kit.slot('19:15', example('The courses this term')),
            kit.slot('20:00', example('Your questions')),
          ]),
        ]),
      ),
  },
  {
    id: 'term-begins',
    title: 'Season: The term begins',
    note: 'A welcome for the first weeks of term, for new and returning students.',
    sections: () =>
      pattern(
        richText(
          'Welcome to the new term',
          'A few warm lines for the first week: where to go, who to ask, what to bring.',
        ),
      ),
  },
  {
    id: 'welcome-students',
    title: 'Season: First week, step by step',
    note: 'The steps for a new student. Change the steps to match how this term runs.',
    sections: () =>
      pattern({
        _type: 'stepsRailSection',
        heading: example('Your first week'),
        steps: [
          {
            _type: 'railStep',
            title: example('Before the first class'),
            body: example('One line.'),
          },
          { _type: 'railStep', title: example('The first evening'), body: example('One line.') },
          { _type: 'railStep', title: example('After class'), body: example('One line.') },
        ],
      }),
  },
  {
    id: 'term-ends',
    title: 'Season: The term has ended',
    note: 'A thank you, and the next term to look forward to.',
    sections: () =>
      pattern(
        richText(
          'Thank you for a good term',
          'A few lines of thanks to students and faculty, and a word on what comes next.',
        ),
        cta(
          'The next term',
          'One line on when enrollment opens again.',
          'See the courses',
          '/courses/',
        ),
      ),
  },
  {
    id: 'summer-break',
    title: 'Season: Between terms',
    note: 'For the summer or a winter break: when classes return and how to reach us meanwhile.',
    sections: () =>
      pattern(
        richText(
          'Between terms',
          'One or two lines on when classes return and how quickly messages are answered meanwhile.',
        ),
      ),
  },
  {
    id: 'course-full',
    title: 'Season: A course is full',
    note: 'A band for a course with no places left, pointing to the other courses.',
    sections: () =>
      pattern(band('This course is full for this term.', 'See other courses', '/courses/')),
  },
  {
    id: 'scholarships',
    title: 'Season: Help with the cost',
    note: 'A scholarship band for any page where cost might stop someone.',
    sections: () =>
      pattern({
        _type: 'sectionScholarship',
        headline: example('Cost should not keep anyone from learning'),
        body: example('One or two lines on who can ask for help and how.'),
      }),
  },
  {
    id: 'advent-lent',
    title: 'Season: Advent or Lent study',
    note: 'A seasonal study for Advent or Lent: the idea, and how to join.',
    sections: () =>
      pattern(
        richText(
          'A study for the season',
          'A short paragraph on the study, who it is for and how it fits the season.',
        ),
        cta('Join the study', 'One line on how to join.', 'Get started', '/get-started/'),
      ),
  },
  {
    id: 'for-congregations',
    title: 'Season: Share with your congregation',
    note: 'A band asking pastors and elders to pass the word on, for bulletins and newsletters.',
    sections: () =>
      pattern(
        band(
          'Know someone who would love this? Share it with your congregation.',
          'Contact us',
          '/contact/',
        ),
      ),
  },
];
