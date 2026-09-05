// =============================================================================
// section-fields — which sections carry which appearance controls (2026-08-28)
// =============================================================================
// The in-canvas overlay (the floating controls that hover over a section in the
// Presentation preview) has to answer one question before it draws anything:
// DOES THIS SECTION ACTUALLY HAVE THIS FIELD? A swatch row over a section whose
// type has no `background` object would write a field the schema does not know
// about, and the editor would click a colour and see nothing happen.
//
// The overlay cannot ask the Studio's schema for the answer. It runs inside the
// preview iframe, in the site's own bundle, and the schema lives in the parent
// window. So the answer is a REGISTRY, here, and the registry is kept honest by
// src/lib/section-fields.test.ts, which reads src/sanity/schemaTypes/blocks.ts
// and fails if a section gains or loses one of these fields without this file
// being updated. Same discipline as the contrast gate in surfaces.test.ts: the
// duplicated knowledge is allowed only because a test measures the duplicate.
//
// The types are listed in the order they appear in blocks.ts.
//
// It also holds the two PURE decisions the in-canvas controls make — which
// controls an element gets, and which field a text popover writes to — so that
// the React components in src/components/preview/overlay/ are left holding only
// what a browser has to do.
// =============================================================================

import { inlineRichRuns, hasInlineRich, type InlineRun } from './inline-rich.ts';
import { normalizeRuns } from './inline-rich-write.ts';
import { plain } from './nav-href.ts';
import { parseSanityPath, readSectionPath, type PathSegment } from './sanity-path.ts';

/**
 * The two page-builder array fields in this schema. A section is an item in one
 * of them, and they are not interchangeable — see preview-edit-attr.ts.
 *
 * `readSectionPath` is canonical and TAKES these names rather than baking any
 * repo's in, so the list lives here beside the rest of this schema's vocabulary.
 */
export const SECTION_ARRAY_FIELDS: readonly string[] = ['flexibleSections', 'sections'];

/** Section types carrying `bgField()`: a `background` object with tone + accent. */
export const BACKGROUND_SECTION_TYPES: readonly string[] = [
  'sectionRichText',
  'sectionImageText',
  'sectionCardGrid',
  'sectionQuote',
  'sectionCtaBand',
  'sectionFeatureCards',
  'sectionStats',
  'sectionAccordion',
  'sectionGallery',
  'sectionSteps',
  'sectionLogos',
  'sectionMediaFeature',
  'sectionDynamicList',
  'sectionMediaShowcase',
  'sectionFaqList',
  'sectionResources',
  'sectionKeyDates',
  'sectionPricingTiers',
];

/**
 * Section types carrying `headingAccentField()`, and THE FIELD EACH ONE'S
 * ACCENT WORD IS MATCHED AGAINST.
 *
 * The name is not always `heading`: `sectionCtaBand` calls its big line
 * `headline`. That is not a typo to fix, because the value is in the dataset,
 * and it is exactly why this is a map rather than a list — a control that
 * assumed `heading` would read an empty string on the CTA band and quietly
 * offer no words at all. The drift gate in section-fields.test.ts reads the
 * field name straight out of the schema (the field declared immediately before
 * `headingAccentField()`, which is the one its own description points at), so
 * this cannot fall out of step again.
 */
export const HEADING_ACCENT_FIELDS: Readonly<Record<string, string>> = {
  sectionRichText: 'heading',
  sectionCardGrid: 'heading',
  sectionCtaBand: 'headline',
  sectionFeatureCards: 'heading',
  sectionMediaFeature: 'heading',
  sectionMediaShowcase: 'heading',
};

/** The section types that offer an accent word. */
export const HEADING_ACCENT_SECTION_TYPES: readonly string[] = Object.keys(HEADING_ACCENT_FIELDS);

/** Every name a heading field goes by, for the synchronous path gate. */
export const HEADING_FIELD_NAMES: ReadonlySet<string> = new Set(
  Object.values(HEADING_ACCENT_FIELDS),
);

/** A curated plain-string field and the rich twin that supersedes it. */
export interface RichTwin {
  /** The plain string field, still stored and still the fallback. */
  plain: string;
  /** The portable-text twin: one paragraph, bold and italic only. */
  rich: string;
}

/**
 * The seven rich twins, by section type. `richTwin()` in blocks.ts creates the
 * twin and `hideWhenRich()` hides the plain field once the twin holds text, so
 * these two names always travel together.
 */
export const RICH_TWINS: Readonly<Record<string, RichTwin>> = {
  sectionCardGrid: { plain: 'subhead', rich: 'subheadRich' },
  sectionCtaBand: { plain: 'subhead', rich: 'subheadRich' },
  sectionFeatureCards: { plain: 'intro', rich: 'introRich' },
  sectionAccordion: { plain: 'intro', rich: 'introRich' },
  sectionSteps: { plain: 'intro', rich: 'introRich' },
  sectionMediaFeature: { plain: 'body', rich: 'bodyRich' },
  sectionMediaShowcase: { plain: 'intro', rich: 'introRich' },
};

/**
 * Every field name either half of a twin can be called, as one flat set. The
 * overlay resolver runs before it knows a section's `_type` (that comes from the
 * document snapshot, which is read asynchronously), so it uses this to decide
 * whether a clicked field is even a CANDIDATE, and the control confirms against
 * RICH_TWINS once the type is known.
 */
export const RICH_TWIN_FIELD_NAMES: ReadonlySet<string> = new Set(
  Object.values(RICH_TWINS).flatMap((twin) => [twin.plain, twin.rich]),
);

/**
 * The two document-level hero strings the popover editor offers. Both live at
 * the top of a page document (every page type that has a hero names them the
 * same way), so the path alone identifies them and no type list is needed.
 * `heroSubhead` is a `text` field — several sentences — so it wants rows.
 */
export const HERO_TEXT_FIELDS: Readonly<Record<string, { label: string; rows: number }>> = {
  heroHeadline: { label: 'Headline', rows: 2 },
  heroSubhead: { label: 'Subhead', rows: 4 },
};

/** Does this section type carry a `background` object? */
export function hasBackground(type?: string | null): boolean {
  return BACKGROUND_SECTION_TYPES.includes(String(type ?? ''));
}

/**
 * Does the background control ACTUALLY APPLY to this section instance?
 * Carrying the field is not the same as honouring it: sectionPricingTiers in
 * its "Rule & Ledger" band style renders a fixed, art-directed surface and its
 * schema description promises "no background control" there (the Pricing page
 * runs in that mode - an editor's first swatch test, 2026-08-28, changed
 * nothing because of it). The handle and the swatch card must not offer a
 * knob the renderer ignores, so both gate through this, per instance.
 */
export function backgroundApplies(
  type?: string | null,
  section?: Record<string, unknown> | null,
): boolean {
  if (!hasBackground(type)) return false;
  if (type === 'sectionPricingTiers' && section && section['surface'] === 'ledger') return false;
  return true;
}

/** Does this section type carry `headingAccent`? */
export function hasHeadingAccent(type?: string | null): boolean {
  return HEADING_ACCENT_SECTION_TYPES.includes(String(type ?? ''));
}

/**
 * The heading field an accent word is matched against on this section type, or
 * null when the type has no accent word at all. Pass `field` to also require
 * that the clicked field IS that heading, so a click on some other string on a
 * card grid does not open the word picker.
 */
export function headingAccentFieldFor(type?: string | null, field?: string | null): string | null {
  const name = HEADING_ACCENT_FIELDS[String(type ?? '')];
  if (!name) return null;
  if (field === undefined) return name;
  return String(field ?? '') === name ? name : null;
}

/**
 * Resolve a field name on a section type to its rich twin, whichever half the
 * caller happens to hold. A click on the rendered text lands on the PLAIN field
 * while the twin is empty and inside the TWIN once it has content, and both
 * gestures should open the same editor.
 */
export function richTwinFor(type?: string | null, field?: string | null): RichTwin | null {
  const twin = RICH_TWINS[String(type ?? '')];
  if (!twin) return null;
  const name = String(field ?? '');
  return name === twin.plain || name === twin.rich ? twin : null;
}

// -----------------------------------------------------------------------------
// Insert adapts to its neighbour
// -----------------------------------------------------------------------------
// Squarespace's quietest good manners: a band you drop onto a page arrives
// wearing what the page is already wearing, instead of announcing itself in the
// default surface and making you fix it. A saved section added from the page
// navigator lands at the BOTTOM of the page, so its neighbour is the section
// currently last, and adopting that section's `tone` means the new band reads as
// a continuation rather than a seam.
//
// ADOPT MEANS ADOPT, including adopting nothing: a neighbour with no tone leaves
// the new section with no tone, which renders as Paper — the same as the
// neighbour. Anything else would reintroduce the seam this exists to remove.
//
// Only `tone` travels. The accent is a piece of authorship (the preset chose
// brass for a reason) and the background image, overlay and padding are the
// preset's own composition, so all of them are left exactly as saved.

/** The subset of a section value this function reads and writes. */
interface SectionValue {
  _type?: string;
  background?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/** Read `background.tone` off a section, or undefined when it has none. */
export function sectionTone(section?: SectionValue | null): string | undefined {
  const tone = section?.background?.tone;
  return typeof tone === 'string' && tone !== '' ? tone : undefined;
}

/**
 * Return a copy of `section` whose surface matches `neighbour`.
 *
 * A section whose type carries no `background` object is returned untouched —
 * the Rule & Ledger sections come styled to match the page they belong to, by
 * design, and giving one a tone would write a field its schema does not have.
 */
export function adaptToneToNeighbour<T extends SectionValue>(
  section: T,
  neighbour?: SectionValue | null,
): T {
  if (!section || !hasBackground(section._type)) return section;

  const tone = sectionTone(neighbour);
  const background: Record<string, unknown> = { ...(section.background ?? {}) };
  if (tone === undefined) delete background.tone;
  else background.tone = tone;

  // Nothing to say: no tone to adopt and no background of its own to keep.
  if (Object.keys(background).length === 0) {
    if (!section.background) return section;
    const stripped = { ...section };
    delete stripped.background;
    return stripped;
  }

  return { ...section, background };
}

// -----------------------------------------------------------------------------
// What the in-canvas layer offers on a given element
// -----------------------------------------------------------------------------
// The overlay resolver runs SYNCHRONOUSLY, the instant an element is hovered,
// and all it holds is the element's path. That is enough to decide which
// controls are even candidates; each control then confirms against the section's
// real `_type` once the document snapshot arrives, and renders nothing if the
// answer is no. Two gates, in that order, because the cheap one runs on every
// hover and the accurate one costs a read.

/** The controls this layer can put on one element. */
export type OverlayControl = 'surface' | 'headingAccent' | 'text';

/**
 * Which controls a path is a candidate for. Order is the order they are
 * rendered in, and an empty list means the element gets nothing.
 */
export function overlayControlsForPath(path?: string | null): OverlayControl[] {
  const section = readSectionPath(path, SECTION_ARRAY_FIELDS);

  if (!section) {
    // A document-level field. Only the two hero strings are offered; nothing
    // else on a page document is a single line of prose.
    const segments = parseSanityPath(path);
    const name = segments.length === 1 && typeof segments[0] === 'string' ? segments[0] : '';
    return name in HERO_TEXT_FIELDS ? ['text'] : [];
  }

  // NOTE, from the deployed Studio (2026-08-28): a BARE array-item path
  // (`flexibleSections[_key=="…"]`, nothing after it) gets no controls, and
  // cannot. ElementOverlayInner builds the resolver context through
  // `getField(node)` and bails on `!field`, and the schema hook resolves no
  // FIELD for an array item on its own — so the resolver is never called for
  // the section wrapper at all. The first version of this layer put the swatch
  // row there, and it never mounted.
  //
  // The fix is to give the swatches a real field to hang on: Sections.astro
  // renders a small handle inside each background-carrying section in preview,
  // carrying `data-sanity` for `…[_key=="…"].background`. That is an object
  // FIELD, so the context builds. The bare-item case is deliberately NOT kept
  // as a fallback: it can never fire, and a branch that can never fire is a
  // branch that will one day be trusted.
  const first = typeof section.rest[0] === 'string' ? section.rest[0] : '';
  if (first === 'background' && section.rest.length === 1) return ['surface'];
  // The heading is `heading` on five of the six accent-word types and
  // `headline` on the CTA band; the control confirms the pairing by type.
  if (HEADING_FIELD_NAMES.has(first) && section.rest.length === 1) return ['headingAccent'];
  // Either half of a rich twin, and any span inside the rich half, opens the
  // same editor on the same twin.
  if (RICH_TWIN_FIELD_NAMES.has(first)) return ['text'];
  return [];
}

// -----------------------------------------------------------------------------
// What a text popover is editing
// -----------------------------------------------------------------------------

/** The resolved subject of the text popover. */
export interface TextTarget {
  kind: 'plain' | 'rich';
  /** Where the value is written. */
  path: PathSegment[];
  /** Plain kind: the current string. */
  text: string;
  /** Rich kind: the current value, as runs. */
  runs: InlineRun[];
  /** The field's name as the form shows it. */
  label: string;
  /** Rows for the textarea. */
  rows: number;
}

/**
 * Work out what a clicked element edits, from the path it carries and the
 * document as it currently stands. Returns null for anything the popover does
 * not offer, which is what makes the pencil disappear rather than write
 * somewhere unexpected.
 *
 * A rich twin is seeded from the PLAIN string when the twin is still empty, so
 * an editor's first emphasis keeps the words that were already there.
 */
export function resolveTextTarget(
  doc: Record<string, unknown>,
  path?: string | null,
): TextTarget | null {
  const section = readSectionPath(path, SECTION_ARRAY_FIELDS);

  if (!section) {
    const segments = parseSanityPath(path);
    const name = segments.length === 1 && typeof segments[0] === 'string' ? segments[0] : '';
    const hero = HERO_TEXT_FIELDS[name];
    if (!hero) return null;
    const value = doc?.[name];
    return {
      kind: 'plain',
      path: [name],
      text: typeof value === 'string' ? plain(value) : '',
      runs: [],
      label: hero.label,
      rows: hero.rows,
    };
  }

  const list = doc?.[section.array];
  const item = Array.isArray(list)
    ? (list.find((s) => (s as { _key?: string })?._key === section.key) as
        Record<string, unknown> | undefined)
    : undefined;
  const fieldName = typeof section.rest[0] === 'string' ? section.rest[0] : '';
  const twin = richTwinFor(typeof item?._type === 'string' ? item._type : '', fieldName);
  if (!item || !twin) return null;

  const stored = item[twin.rich];
  const fallback = item[twin.plain];
  return {
    kind: 'rich',
    path: [...section.itemPath, twin.rich],
    text: '',
    runs: hasInlineRich(stored)
      ? inlineRichRuns(stored)
      : normalizeRuns([
          { text: typeof fallback === 'string' ? plain(fallback) : '', strong: false, em: false },
        ]),
    label: twin.plain.charAt(0).toUpperCase() + twin.plain.slice(1),
    rows: 3,
  };
}
