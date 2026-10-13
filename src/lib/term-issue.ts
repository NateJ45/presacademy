// Foundation, edit with care
// =============================================================================
// term-issue: the small pure decisions behind the Term Issue home (2026-10-13,
// PR 2)
// =============================================================================
// Kept out of the components so they can be unit tested (term-issue.test.ts)
// and shared between the Astro blocks and the CourseFinder island:
//
//   splitTermTitle   "Spring 2027" -> the big hero title's two lines
//   heroCourses      which three covers fan out in the hero
//   teacherSurnames  "Hale" or "Okonkwo, Reese" for a contents row
//   contentsRow      one line of the contents page: code, title, teacher, status
//   finderPick       the course finder's rule (question 2 wins, then 1, then
//                    the default)
//
// PR 4 (2026-10-13) adds the back page and the header:
//   issueLine        the header's issue line, "Spring 2027 term · enrolling
//                    now · first class Tue 26 Jan"
//   fillTermTokens   {term} / {season} in the Next issue block's editable copy
// =============================================================================

/** The hero title, split for its two lines: "Spring" over an italic "2027".
    A title with no trailing year ("Fall intensive") stays on one line. */
export function splitTermTitle(title: string | null | undefined): {
  lead: string;
  year: string;
} {
  const t = (title ?? '').trim().replace(/\s+/g, ' ');
  const m = t.match(/^(.*\S)\s+(\d{4})$/);
  if (m) return { lead: m[1], year: m[2] };
  return { lead: t, year: '' };
}

interface HasSlug {
  slug?: string | null;
}

/** Up to `n` distinct courses for the hero's fanned stack: the "Start here"
    courses first, topped up from the featured ones, never the same twice. */
export function heroCourses<T extends HasSlug>(startHere: T[], featured: T[], n = 3): T[] {
  const out: T[] = [];
  const seen = new Set<string>();
  for (const c of [...(startHere ?? []), ...(featured ?? [])]) {
    const key = c?.slug ?? '';
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= n) break;
  }
  return out;
}

/** Last word of each instructor's name, comma-joined: "Hale", "Okonkwo, Reese". */
export function teacherSurnames(
  instructors: Array<{ name?: string | null } | null> | null | undefined,
): string {
  return (instructors ?? [])
    .map((i) => (i?.name ?? '').trim().split(/\s+/).pop() ?? '')
    .filter(Boolean)
    .join(', ');
}

export type RowTone = 'open' | 'waitlist' | 'muted';

export interface ContentsRow {
  code: string;
  title: string;
  slug: string;
  /** Mono meta line after the dot leader: "Jiménez · 10 sessions · waitlist". */
  meta: string;
  tone: RowTone;
}

/** The first word of a term title, lower-cased: "Summer 2027" -> "summer". */
export const season = (title?: string | null) =>
  (title ?? '').trim().split(/\s+/)[0]?.toLowerCase() ?? '';

/**
 * One contents line. The status reads from the course's NEXT offering:
 *   in the next term      "Hale · 8 sessions · open" (or "waitlist")
 *   in a later term       "Okonkwo · summer · open"
 *   none upcoming         "Reese · new dates soon"
 */
export function contentsRow(
  course: {
    title?: string | null;
    slug?: string | null;
    courseCode?: string | null;
    instructors?: Array<{ name?: string | null } | null> | null;
    nextOffering?: {
      status?: string | null;
      sessions?: number | null;
      term?: { _id?: string | null; title?: string | null } | null;
    } | null;
  },
  nextTermId: string | null | undefined,
): ContentsRow {
  const teacher = teacherSurnames(course.instructors);
  const next = course.nextOffering;
  const status = next?.status ?? '';
  const parts: string[] = teacher ? [teacher] : [];
  let tone: RowTone = 'muted';
  if (!next) {
    parts.push('new dates soon');
  } else if (nextTermId && next.term?._id === nextTermId) {
    if (next.sessions) parts.push(`${next.sessions} sessions`);
    if (status === 'open' || status === 'waitlist' || status === 'closed') parts.push(status);
    tone = status === 'open' ? 'open' : status === 'waitlist' ? 'waitlist' : 'muted';
  } else {
    const s = season(next.term?.title);
    if (s) parts.push(s);
    if (status === 'open' || status === 'waitlist' || status === 'closed') parts.push(status);
    tone = status === 'open' ? 'open' : status === 'waitlist' ? 'waitlist' : 'muted';
  }
  return {
    code: (course.courseCode ?? '').trim(),
    title: course.title ?? '',
    slug: course.slug ?? '',
    meta: parts.join(' · '),
    tone,
  };
}

/**
 * The course finder's rule. Each argument is a course id or null (no answer,
 * or an answer that points nowhere). An answer to question 2 wins, else an
 * answer to question 1, else the default.
 */
export function finderPick(
  q1Course: string | null | undefined,
  q2Course: string | null | undefined,
  defaultCourse: string | null | undefined,
): string | null {
  return q2Course || q1Course || defaultCourse || null;
}

/** "2027-01-26" -> "Tue 26 Jan". Read as a calendar date (UTC), so the
    weekday never slips a day on a build machine west of Greenwich. */
export function shortDay(iso: string | null | undefined): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${weekday} ${d.getUTCDate()} ${month}`;
}

export interface IssueTerm {
  title?: string | null;
  startDate?: string | null;
  registrationOpens?: string | null;
  registrationDeadline?: string | null;
  status?: string | null;
}

/**
 * The header's issue line (Term Issue PR 4), from the next term's own data:
 *
 *   full    "Spring 2027 term · enrolling now · first class Tue 26 Jan"
 *   short   "Spring 2027 term" (phones)
 *   medium  "Spring 2027 term · enrolling now" (tablets)
 *
 * The middle part only says "enrolling now" when that is true: the term is
 * marked "Registration open", or registration has opened by date and the
 * apply-by date has not passed. Before registration opens it names the date
 * ("registration opens Sun 15 Nov"); a closed term says so; with none of the
 * dates set it is left out rather than guessed. `today` is "YYYY-MM-DD".
 */
export function issueLine(
  term: IssueTerm | null | undefined,
  today: string,
): { short: string; medium: string; full: string } | null {
  const title = (term?.title ?? '').trim();
  if (!title) return null;
  const name = /\bterm$/i.test(title) ? title : `${title} term`;
  const opens = term?.registrationOpens ?? '';
  const deadline = term?.registrationDeadline ?? '';
  const status = term?.status ?? '';
  let state = '';
  if (status === 'closed' || (deadline && deadline < today && status !== 'open')) {
    state = 'registration closed';
  } else if (status === 'open' || (opens && opens <= today)) {
    state = 'enrolling now';
  } else if (opens && opens > today) {
    state = `registration opens ${shortDay(opens)}`;
  }
  const first = shortDay(term?.startDate) ? `first class ${shortDay(term?.startDate)}` : '';
  const medium = [name, state].filter(Boolean).join(' · ');
  return { short: name, medium, full: [name, state, first].filter(Boolean).join(' · ') };
}

/** The Next issue block's editable copy: {term} becomes "Summer 2027" and
    {season} becomes "summer". Unknown braces are left alone. */
export function fillTermTokens(text: string, termTitle: string | null | undefined): string {
  const t = (termTitle ?? '').trim();
  return text.replace(/\{term\}/g, t).replace(/\{season\}/g, season(t) || 'next');
}
