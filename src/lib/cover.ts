// Foundation, edit with care
// =============================================================================
// Course covers: the palette and ornament vocabulary, plus the fallback
// (2026-10-13, Term Issue PR 1)
// =============================================================================
// Every course is drawn as a small-press book cover (CourseCover.astro): one of
// eight fixed colour pairs and one of eight CSS-only ornaments. Editors pick
// both in the course's "Cover" tab. When either is empty, the cover still
// renders: the colour is derived from the course's first teaching area (so a
// subject's courses share a colour) and the ornament from the course slug.
// Both derivations are a pure hash, so a given course always gets the same
// cover on every build and in every environment, with no dataset write.
//
// The hex values live in src/styles/globals.css (`--color-cover-<name>` and
// `--color-cover-<name>-fg`), which is the single source of truth.
// cover.test.ts reads them from there and pins every pair at 4.5:1 or better.
// This file only names them, so the two cannot drift: a name added here
// without its tokens fails that test.
//
// Keep the value lists in step with the radio lists in
// src/sanity/schemaTypes/course.ts (the test checks that too).
// =============================================================================

export const COVER_COLORS = [
  'green',
  'ink',
  'cream',
  'oxblood',
  'brass',
  'sage',
  'slate',
  'parchment',
] as const;
export type CoverColor = (typeof COVER_COLORS)[number];

export const COVER_ORNAMENTS = [
  'circle',
  'stripes',
  'half-moon',
  'cross',
  'dots',
  'ring',
  'diagonal',
  'steps',
] as const;
export type CoverOrnament = (typeof COVER_ORNAMENTS)[number];

/** Studio labels for the radio lists, in the same order as the value lists. */
export const COVER_COLOR_TITLES: Record<CoverColor, string> = {
  green: 'Green',
  ink: 'Ink',
  cream: 'Cream',
  oxblood: 'Oxblood',
  brass: 'Brass',
  sage: 'Sage',
  slate: 'Slate',
  parchment: 'Parchment',
};
export const COVER_ORNAMENT_TITLES: Record<CoverOrnament, string> = {
  circle: 'Circle',
  stripes: 'Stripes',
  'half-moon': 'Half-moon',
  cross: 'Cross',
  dots: 'Dots',
  ring: 'Ring',
  diagonal: 'Diagonal',
  steps: 'Steps',
};

/**
 * The colour of the rule across the top of a cover's back (the paper side).
 * Usually the cover colour itself; the two pale covers use their ink instead,
 * because cream or parchment on paper would vanish, and sage uses a deeper
 * sage token for the same reason.
 */
export const COVER_RULE: Record<CoverColor, 'bg' | 'fg' | 'rule'> = {
  green: 'bg',
  ink: 'bg',
  cream: 'fg',
  oxblood: 'bg',
  brass: 'bg',
  sage: 'rule',
  slate: 'bg',
  parchment: 'fg',
};

/** FNV-1a, 32-bit. Small, stable across platforms, and good enough to spread
    a handful of slugs across eight buckets. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const isColor = (v: unknown): v is CoverColor =>
  typeof v === 'string' && (COVER_COLORS as readonly string[]).includes(v);
const isOrnament = (v: unknown): v is CoverOrnament =>
  typeof v === 'string' && (COVER_ORNAMENTS as readonly string[]).includes(v);

/** The minimum a course needs to have a cover. Every field is optional. */
export interface CoverInput {
  slug?: string | null;
  coverColor?: string | null;
  coverOrnament?: string | null;
  teachingAreas?: Array<{ slug?: string | null } | null> | null;
}

export interface ResolvedCover {
  color: CoverColor;
  ornament: CoverOrnament;
  /** True when the colour or ornament was derived rather than chosen. */
  derived: boolean;
}

/**
 * The cover a course renders with: the editor's choice when it is set (and is
 * one of the known values), otherwise the deterministic fallback.
 *   colour   = hash(first teaching area slug, else the course slug) mod 8
 *   ornament = hash(course slug) mod 8
 */
export function resolveCover(course: CoverInput | null | undefined): ResolvedCover {
  const slug = course?.slug ?? '';
  const areaSlug = course?.teachingAreas?.find((a) => a?.slug)?.slug ?? '';
  const colorSeed = areaSlug || slug;

  const chosenColor = isColor(course?.coverColor) ? course.coverColor : null;
  const chosenOrnament = isOrnament(course?.coverOrnament) ? course.coverOrnament : null;

  const color = chosenColor ?? COVER_COLORS[hashString(colorSeed) % COVER_COLORS.length];
  const ornament =
    chosenOrnament ?? COVER_ORNAMENTS[hashString(`${slug}:ornament`) % COVER_ORNAMENTS.length];

  return { color, ornament, derived: !chosenColor || !chosenOrnament };
}

/** The CSS custom properties a cover element carries for its colour. */
export function coverStyle(color: CoverColor): string {
  const rule = COVER_RULE[color];
  const ruleVar =
    rule === 'bg'
      ? `var(--color-cover-${color})`
      : rule === 'fg'
        ? `var(--color-cover-${color}-fg)`
        : `var(--color-cover-${color}-rule)`;
  return [
    `--cover-bg: var(--color-cover-${color})`,
    `--cover-fg: var(--color-cover-${color}-fg)`,
    `--cover-rule: ${ruleVar}`,
  ].join('; ');
}

/** The same three custom properties as coverStyle, as a React style object
    (the phone Contents menu's shelf draws its tiny covers in an island). */
export function coverVars(color: CoverColor): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of coverStyle(color).split('; ')) {
    const i = decl.indexOf(':');
    out[decl.slice(0, i).trim()] = decl.slice(i + 1).trim();
  }
  return out;
}

/** Course code shape the Studio nudges towards: two to four capitals, a space,
    three digits ("SCR 101"). A warning in the Studio, never an error. */
export const COURSE_CODE_PATTERN = /^[A-Z]{2,4} \d{3}$/;
