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
//   - a one-time event (`event`): an info night, open lecture or workshop.
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
  return doc;
}

/** The date `days` after `now`, as "YYYY-MM-DD" in local time. */
export function daysFrom(now: Date, days: number): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
