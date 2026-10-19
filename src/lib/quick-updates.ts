// Safe to edit by hand
// =============================================================================
// The Academy's Quick update documents (PORTS.md card 111)
// =============================================================================
// The Studio's Quick update tool (src/sanity/kit/QuickUpdateTool.tsx, PORTABLE)
// publishes whatever a form's `build` returns, straight away and WITHOUT the
// Studio's validation. These are the builders for the phone jobs in
// src/sanity/kit.config.ts, kept pure so src/lib/quick-updates.test.ts can
// check that each one is a complete, valid document for its type:
//
//   - a notice (`announcement`) that shows until a last day;
//   - a class change or cancellation: the same notice in red;
//   - a one-time event (`event`): an info night, open lecture or workshop,
//     with an optional sign-up link;
//   - an enrollment reminder: a notice worded from the next term's own dates.
// =============================================================================

import { slugify } from './slugify.ts';

// Type aliases, not interfaces: the Quick update tool wants a plain record.
export type NoticeDoc = {
  _type: 'announcement';
  title: string;
  message: string;
  style: 'info' | 'special' | 'urgent';
  enabled: true;
  endDate: string;
  link?: { label: string; url: string };
};

/** The end of a local day ("2026-10-18" -> 23:59 that evening, as ISO). */
export function endOfDay(date: string): string {
  return new Date(`${date}T23:59:00`).toISOString();
}

/** The Studio-only name of a notice: its first words, dated. */
export function noticeName(message: string, date: string): string {
  const words = message.trim().replace(/\s+/g, ' ');
  const short = words.length > 40 ? `${words.slice(0, 40).trimEnd()}...` : words;
  return `${short} (until ${date})`;
}

/** A notice that shows until the end of `lastDay`. */
export function buildNotice(
  v: { message: string; lastDay: string; link?: string },
  style: NoticeDoc['style'] = 'info',
): NoticeDoc {
  const doc: NoticeDoc = {
    _type: 'announcement',
    title: noticeName(v.message, v.lastDay),
    message: v.message.trim(),
    style,
    enabled: true,
    endDate: endOfDay(v.lastDay),
  };
  if (v.link) doc.link = { label: 'Find out more', url: v.link.trim() };
  return doc;
}

/** The event kinds a quick event can be (the event schema's category list). */
export const QUICK_EVENT_CATEGORIES = ['Info session', 'Open lecture', 'Workshop'] as const;

export type EventDoc = {
  _type: 'event';
  title: string;
  slug: { _type: 'slug'; current: string };
  eventType: 'oneTime';
  category: string;
  start: string;
  allDay: false;
  location?: string;
  summary?: string;
  registrationUrl?: string;
  registrationLabel?: string;
};

/**
 * A one-time event. The web address is the title plus the date, so two events
 * with the same title in different terms never collide (a clash stops the
 * website building).
 */
export function buildEvent(v: {
  title: string;
  start: string;
  category?: string;
  location?: string;
  summary?: string;
  registrationUrl?: string;
}): EventDoc {
  const title = v.title.trim();
  const day = v.start.slice(0, 10);
  const category = (QUICK_EVENT_CATEGORIES as readonly string[]).includes(v.category ?? '')
    ? (v.category as string)
    : 'Info session';
  const doc: EventDoc = {
    _type: 'event',
    title,
    slug: { _type: 'slug', current: slugify(`${title} ${day}`).slice(0, 96) },
    eventType: 'oneTime',
    category,
    start: new Date(v.start).toISOString(),
    allDay: false,
  };
  if (v.location?.trim()) doc.location = v.location.trim();
  if (v.summary?.trim()) doc.summary = v.summary.trim().slice(0, 240);
  if (v.registrationUrl?.trim()) {
    doc.registrationUrl = v.registrationUrl.trim();
    doc.registrationLabel = 'Save your seat';
  }
  return doc;
}

/** The date `days` after `now`, as "YYYY-MM-DD" in local time. */
export function daysFrom(now: Date, days: number): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "2027-03-01" -> "March 1". Read from the string, so no time zone can move the day. */
export function spokenDate(date: string): string {
  const [, m, d] = date.slice(0, 10).split('-').map(Number);
  return `${MONTHS[(m || 1) - 1]} ${d || 1}`;
}

/** The next term as the enrollment reminder reads it (the term schema's own fields). */
export type ReminderTerm = { title: string; startDate: string; registrationDeadline?: string };

/** GROQ for the next term: published, not put away, starting after $today. */
export const NEXT_TERM_QUERY = `*[_type == "term" && !(_id in path("drafts.**")) && archived != true && startDate > $today] | order(startDate asc)[0]{title, startDate, registrationDeadline}`;

/**
 * "Remind people enrollment closes": a notice worded from the next term.
 * Before the Apply by date it names that date and shows until then; once it
 * has passed (or there is none) it names the first day of term and shows until
 * then. A message the editor typed wins over the made-up one, and a last day
 * they picked wins over the term's. With no term and no message there is
 * nothing sensible to say, so it stops with a plain reason.
 */
export function buildEnrollmentReminder(
  v: { message?: string; lastDay?: string },
  term: ReminderTerm | null,
  today: string,
): NoticeDoc {
  const typed = v.message?.trim();
  if (!term && !typed) {
    throw new Error('There is no upcoming term on the website yet. Open New term first.');
  }
  let message = typed ?? '';
  let lastDay = v.lastDay?.trim() ?? '';
  if (term) {
    const deadline = term.registrationDeadline?.slice(0, 10);
    const open = deadline && deadline >= today;
    if (!message) {
      message = open
        ? `Enrollment for ${term.title} closes ${spokenDate(deadline)}. Save your seat today.`
        : `${term.title} begins ${spokenDate(term.startDate)}. There is still time to join.`;
    }
    if (!lastDay) lastDay = open ? deadline : term.startDate.slice(0, 10);
  }
  if (!lastDay) lastDay = today;
  return buildNotice({ message, lastDay, link: '/get-started/' }, 'special');
}
