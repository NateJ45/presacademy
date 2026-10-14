// Foundation, edit with care
// =============================================================================
// chrome: the small pure decisions behind the masthead, the contents menu and
// the back cover (2026-10-13, the chrome redesign)
// =============================================================================
// Kept out of Header.astro, MobileNav.tsx and Footer.astro so they can be unit
// tested (chrome.test.ts) and shared:
//
//   numberWord     8 -> "eight", for the mono notes ("Eight courses")
//   navNote        the note at the right of the desktop nav strip,
//                  "Eight courses · five teachers · in West Chester Township"
//   menuFact       the short mono fact at the end of a contents-menu row
//   buildIndex     the back cover's index: every footer link once, A to Z,
//                  with a small initial at each new letter
//   orderShelf     which courses the masthead fans out and the menu shelves
//   issueSummary   "Eight courses, first class Tue 26 Jan"
//
// Every function takes plain data and returns plain data, so the same answer
// renders at build time and in the SSR preview.
// =============================================================================

import { plain } from './nav-href.ts';
import { shortDay } from './term-issue.ts';

const WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
];

/** 0 to 12 as a word ("eight"), anything larger as digits ("14"). */
export function numberWord(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '';
  const whole = Math.floor(n);
  return WORDS[whole] ?? String(whole);
}

/** "Eight" from "eight": the first letter up, the rest as it was. */
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** "eight courses" / "one course"; empty when the count is unknown or zero. */
function counted(n: number | null | undefined, one: string, many: string): string {
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) return '';
  return `${numberWord(n)} ${n === 1 ? one : many}`;
}

export interface ChromeCounts {
  courses?: number | null;
  faculty?: number | null;
  /** The cheapest pricing tier's amount in dollars (the audit rate counts). */
  lowestPrice?: number | null;
}

/** Shown when the counts and the city are all unknown (an empty dataset). */
export const NAV_NOTE_FALLBACK = 'Reformed lay formation';

/**
 * The mono note at the right of the desktop nav strip, built from real counts:
 * "Eight courses · five teachers · in West Chester Township". A count that
 * is unknown is left out; with no count known a plain description stands in
 * for them ("Reformed lay formation · in West Chester Township"), never an
 * invented number.
 */
export function navNote(counts: ChromeCounts, locality?: string | null): string {
  const known = [
    counted(counts.courses, 'course', 'courses'),
    counted(counts.faculty, 'teacher', 'teachers'),
  ].filter(Boolean);
  // No counts yet: the plain description leads, so the town never stands alone.
  const parts = known.length > 0 ? known : [NAV_NOTE_FALLBACK];
  if (plain(locality)) parts.push(`in ${plain(locality)}`);
  return cap(parts.join(' · '));
}

/**
 * Built-in facts for the contents menu, keyed by the link's address. Used only
 * when the link has no "Menu note" in Studio and (for the three counted rows)
 * the count is unknown.
 */
export const MENU_FACT_FALLBACKS: Record<string, string> = {
  '/courses/': 'The catalog',
  '/faculty/': 'Who teaches',
  '/pricing/': 'Rates',
  '/events/': 'Info nights',
  '/resources/': 'Reading',
  '/about/': 'The school',
  '/faq/': 'Questions',
  '/contact/': 'Write to us',
  '/get-started/': 'Start here',
  '/for-you/': 'Who it is for',
};

/**
 * The short mono fact at the end of a contents-menu row.
 *   Courses, Faculty, Pricing   worked out from the data ("8 this year",
 *                               "5 teachers", "from $95")
 *   anything else               the link's own Menu note from Studio
 *   neither                     the built-in fact for that address, or nothing
 */
export function menuFact(href: string, counts: ChromeCounts, menuNote?: string | null): string {
  const path = plain(href);
  const c = counts.courses;
  const f = counts.faculty;
  const p = counts.lowestPrice;
  if (path === '/courses/' && typeof c === 'number' && c > 0) return `${c} this year`;
  if (path === '/faculty/' && typeof f === 'number' && f > 0)
    return `${f} ${f === 1 ? 'teacher' : 'teachers'}`;
  if (path === '/pricing/' && typeof p === 'number' && p > 0) return `from $${p}`;
  // The note keeps its stega markers (click-to-edit in the preview); it is
  // only tested for emptiness through plain().
  if (menuNote && plain(menuNote)) return menuNote;
  return MENU_FACT_FALLBACKS[path] ?? '';
}

export interface IndexLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface IndexEntry extends IndexLink {
  /** The letter to print beside this entry: set only on the first of a letter. */
  initial?: string;
}

const isExternal = (href: string) => /^https?:\/\//.test(plain(href));

/**
 * The back cover's index. Every footer link appears once (the first label wins
 * when two links share an address, so "Get started", "Request information" and
 * "Book a free intro", which all point at /get-started/, collapse to "Get
 * started"), sorted A to Z ignoring case, with the initial letter marked on the
 * first entry of each letter. The DOM order this returns is the reading order,
 * so screen readers hear it alphabetically however the columns flow.
 */
export function buildIndex(links: IndexLink[]): IndexEntry[] {
  const seen = new Set<string>();
  const unique: IndexLink[] = [];
  for (const l of links) {
    const href = plain(l?.href);
    const label = plain(l?.label);
    if (!href || !label) continue;
    const key = href.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({ ...l, external: l.external || isExternal(href) });
  }
  unique.sort((a, b) =>
    plain(a.label).localeCompare(plain(b.label), 'en', { sensitivity: 'base' }),
  );
  let last = '';
  return unique.map((l) => {
    const letter = plain(l.label).charAt(0).toUpperCase();
    const entry: IndexEntry = { ...l };
    if (letter && letter !== last) entry.initial = letter;
    last = letter;
    return entry;
  });
}

export interface ShelfCourse {
  slug?: string | null;
  startHere?: boolean | null;
  featured?: boolean | null;
  /** True when the course has a cohort in the next term. */
  inTerm?: boolean | null;
}

/**
 * The courses the masthead fans out (three) and the contents menu shelves
 * (six): the next term's courses first, then the "Start here" ones, then the
 * featured ones, then the rest, each group in the editor's display order (the
 * order the input arrives in). Never the same course twice.
 */
export function orderShelf<T extends ShelfCourse>(courses: T[], n: number): T[] {
  const rank = (c: T) => (c.inTerm ? 0 : 4) + (c.startHere ? 0 : 2) + (c.featured ? 0 : 1);
  const seen = new Set<string>();
  return (courses ?? [])
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => {
      const key = c?.slug ?? '';
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => rank(a.c) - rank(b.c) || a.i - b.i)
    .slice(0, n)
    .map(({ c }) => c);
}

/** "Eight courses, first class Tue 26 Jan". Either half drops when unknown. */
export function issueSummary(
  courses: number | null | undefined,
  startDate?: string | null,
): string {
  const parts = [
    cap(counted(courses, 'course', 'courses')),
    shortDay(startDate) ? `first class ${shortDay(startDate)}` : '',
  ].filter(Boolean);
  return cap(parts.join(', '));
}
