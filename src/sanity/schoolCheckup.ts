// Safe to edit by hand
// =============================================================================
// The Academy's own Checkup rules (Studio kit, PORTS.md cards 106 and 115)
// =============================================================================
// The kit's Checkup (src/lib/studio-checkup.ts) runs pure rules over ONE fetch
// of every document. genericRules() already covers pictures with no
// description, pages with no Google description, links to missing pages and
// old drafts. These are the school's own, carried over from the old Checkup
// tool (components/HealthTool.tsx, retired 2026-10-18) and written as rules so
// each finding names the course, term or person and opens it with one click
// (the Fix-it list on Home shows them the same way).
//
// Documents still carrying the old soft-delete flag (archived: true) are left
// out of every rule: they are not on the website.
// =============================================================================

import { itemsOf, plural, type CheckupRule, type Doc } from '../lib/studio-checkup';

const DAY = 24 * 60 * 60 * 1000;

const live = (docs: Doc[], type: string) =>
  docs.filter((d) => d._type === type && d.archived !== true);

const isEmptyText = (v: unknown) => typeof v !== 'string' || v.trim() === '';
const isEmptyList = (v: unknown) => !Array.isArray(v) || v.length === 0;
const dateOf = (v: unknown) => (typeof v === 'string' ? Date.parse(v) : Number.NaN);

/** Courses missing the summary or the teacher the course card leans on. */
const courseBasics: CheckupRule = {
  id: 'course-basics',
  run: ({ published, nameOf }) => {
    const missing = live(published, 'course').filter(
      (d) => isEmptyText(d.summary) || isEmptyList(d.instructors),
    );
    if (!missing.length) return null;
    return {
      severity: 'Needs doing',
      label: `${plural(missing.length, 'course')} missing a summary or a teacher`,
      detail: 'The course card on the website leans on both.',
      items: itemsOf(missing, nameOf, (d) => (isEmptyText(d.summary) ? 'summary' : 'instructors')),
      itemLabel: 'Edit',
    };
  },
};

/** Courses with no offering, so they never say when they next run. */
const courseNoTerm: CheckupRule = {
  id: 'course-no-term',
  run: ({ published, nameOf }) => {
    const none = live(published, 'course').filter((d) => isEmptyList(d.offerings));
    if (!none.length) return null;
    return {
      severity: 'Worth a look',
      label: `${plural(none.length, 'course')} not offered in any term`,
      detail:
        'Without an offering in a term, a course never shows when it next runs. Fine for a course you are resting.',
      items: itemsOf(none, nameOf, () => 'offerings'),
      itemLabel: 'Add a term',
    };
  },
};

/** Faculty without a portrait or a bio. */
const facultyBasics: CheckupRule = {
  id: 'faculty-basics',
  run: ({ published, nameOf }) => {
    const missing = live(published, 'facultyMember').filter((d) => !d.photo || isEmptyList(d.bio));
    if (!missing.length) return null;
    return {
      severity: 'Worth a look',
      label: `${plural(missing.length, 'faculty profile')} missing a portrait or a bio`,
      detail: 'A profile without a face or a story undersells the courses it teaches.',
      items: itemsOf(missing, nameOf, (d) => (!d.photo ? 'photo' : 'bio')),
      itemLabel: 'Edit',
    };
  },
};

/** Terms that have begun but still say "Upcoming" or "Registration open". */
const staleTerms: CheckupRule = {
  id: 'terms-stale',
  run: ({ published, now, nameOf }) => {
    const stale = live(published, 'term').filter(
      (d) => dateOf(d.startDate) < now && (d.status === 'upcoming' || d.status === 'open'),
    );
    if (!stale.length) return null;
    return {
      severity: 'Needs doing',
      label: `${plural(stale.length, 'term')} already begun but still marked upcoming or open`,
      detail: 'Set the Status to "In session" so the dates on the website stay right.',
      items: itemsOf(stale, nameOf, () => 'status'),
      itemLabel: 'Change the status',
    };
  },
};

/** Terms that have ended but are not marked closed. */
const endedTerms: CheckupRule = {
  id: 'terms-ended',
  run: ({ published, now, nameOf }) => {
    const ended = live(published, 'term').filter(
      (d) => dateOf(d.endDate) < now && d.status !== 'closed',
    );
    if (!ended.length) return null;
    return {
      severity: 'Worth a look',
      label: `${plural(ended.length, 'term')} ended but not marked closed`,
      detail: 'Marking a finished term "Closed" keeps it out of the "next cohort" lines.',
      items: itemsOf(ended, nameOf, () => 'status'),
      itemLabel: 'Close it',
    };
  },
};

/** A term starting within eight weeks that no course is offered in yet. */
const emptyNextTerm: CheckupRule = {
  id: 'term-no-courses',
  run: ({ published, now, nameOf }) => {
    const offered = new Set<string>();
    for (const c of live(published, 'course')) {
      for (const o of (c.offerings as { term?: { _ref?: string } }[] | undefined) ?? []) {
        if (o?.term?._ref) offered.add(o.term._ref);
      }
    }
    const soon = live(published, 'term').filter((d) => {
      const start = dateOf(d.startDate);
      return start > now && start - now < 56 * DAY && !offered.has(d._id);
    });
    if (!soon.length) return null;
    return {
      severity: 'Needs doing',
      label: `${plural(soon.length, 'term')} starting soon with no courses in it`,
      detail:
        'Open each course that runs this term and add an offering for it under "When it runs". New term on the top bar walks you through it.',
      target: { tool: 'term-setup' },
      targetLabel: 'Open New term',
      items: itemsOf(soon, nameOf),
      itemLabel: 'Open the term',
    };
  },
};

/** Notices still switched on after their end date. */
const expiredNotices: CheckupRule = {
  id: 'notices-expired',
  run: ({ published, now, nameOf }) => {
    const old = live(published, 'announcement').filter(
      (d) => d.enabled === true && dateOf(d.endDate) < now,
    );
    if (!old.length) return null;
    return {
      severity: 'Worth a look',
      label: `${plural(old.length, 'notice')} past its end date and still switched on`,
      detail:
        'The website stops showing a notice after its end date, so nothing is wrong, but switching it off keeps the list tidy.',
      items: itemsOf(old, nameOf, () => 'enabled'),
      itemLabel: 'Switch it off',
    };
  },
};

/** One-time events already past, cluttering the Events list. */
const pastEvents: CheckupRule = {
  id: 'events-past',
  run: ({ published, now }) => {
    const past = live(published, 'event').filter((d) => {
      if (d.eventType !== 'oneTime') return false;
      const end = dateOf(d.end ?? d.start);
      return end < now - 30 * DAY;
    });
    if (!past.length) return null;
    return {
      severity: 'For information',
      label: `${plural(past.length, 'one-time event')} more than a month past`,
      detail:
        'They no longer show on the website. The Events list keeps them under past school years, so there is nothing to do unless you want them gone.',
      target: { pane: 'event' },
      targetLabel: 'Open the events',
    };
  },
};

/** Questions with no group, which land in an odd spot on the FAQ page. */
const loneQuestions: CheckupRule = {
  id: 'faq-uncategorized',
  run: ({ published, nameOf }) => {
    const lone = live(published, 'faqItem').filter((d) => !d.categoryRef && !d.category);
    if (!lone.length) return null;
    return {
      severity: 'Worth a look',
      label: `${plural(lone.length, 'question')} with no group`,
      detail: 'Questions without a group can land in an odd spot on the FAQ page.',
      items: itemsOf(lone, nameOf, () => 'categoryRef'),
      itemLabel: 'Pick a group',
    };
  },
};

/** Courses marked full or waitlisted by hand (Quick update): easy to forget when a new term opens. */
const seatsByHand: CheckupRule = {
  id: 'seats-by-hand',
  run: ({ published, nameOf }) => {
    const set = live(published, 'course').filter((d) => !isEmptyText(d.seatsNow));
    if (!set.length) return null;
    return {
      severity: 'For information',
      label: `${plural(set.length, 'course')} with seats set by hand`,
      detail:
        'Marked Open, Waitlist or Full from Quick update, and it stays that way until you change it. When a new term opens, set each one back to Open, or clear it so the term decides.',
      target: { tool: 'quick-update' },
      targetLabel: 'Open Quick update',
      items: itemsOf(set, nameOf, () => 'seatsNow'),
      itemLabel: 'Change the seats',
    };
  },
};

export const schoolRules: CheckupRule[] = [
  emptyNextTerm,
  staleTerms,
  courseBasics,
  facultyBasics,
  courseNoTerm,
  endedTerms,
  expiredNotices,
  loneQuestions,
  pastEvents,
  seatsByHand,
];
