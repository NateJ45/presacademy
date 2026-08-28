// =============================================================================
// section-coach — the empty-state coaching registry (PREVIEW ONLY)
// =============================================================================
// An editor adds a section from the picker and lands back on the preview.
// Before this file, most sections rendered as a band of padding with nothing in
// it: an invisible stripe that reads as "the site is broken", not as "your turn
// to type". This registry answers one question per section type, "is this
// section still empty, and what should the editor add?", so the preview can
// show a friendly dashed placeholder instead.
//
// PREVIEW ONLY, and provably so: the ONLY caller is src/components/Sections.astro,
// and it calls this file only when `editDoc` is set. `editDoc` is passed by the
// /preview routes and by nothing else, so the live static site never reaches
// this code and its markup is byte-identical to what it was before. Do NOT wire
// this into a block component: an empty section's LIVE behavior (usually
// nothing at all, occasionally a hollow band) is deliberately left as it was.
//
// Only section types whose emptiness is visible in the section's OWN data live
// here. The self-filling sections (a course rail, the faculty strip, an FAQ
// list, the events grid) fetch a collection inside their component and hide
// themselves when it is empty. This file cannot see that fetch, so it must
// never claim them: SELF_FILLING_SECTIONS in src/sanity/pageBuilderConfig.ts is
// the single list, and the test below asserts no overlap.
//
// Hint style: plain, short, imperative, one thing per sentence, and no
// em-dashes (house style).
// =============================================================================
import { SELF_FILLING_SECTIONS } from '../sanity/pageBuilderConfig.ts';

/** One page-builder section, as the page query returns it. Loose on purpose:
 *  every block type has different fields and this file reads a few of each. */
export interface SectionData {
  _type: string;
  _key?: string;
  [field: string]: unknown;
}

export interface SectionCoachInfo {
  /** The section's plain-language name, the same words the Studio picker uses. */
  name: string;
  /** One sentence: what the editor should add. */
  hint: string;
}

interface CoachEntry extends SectionCoachInfo {
  /** True when the section holds none of the content it exists to show. */
  isEmpty: (section: SectionData) => boolean;
}

/** True for undefined / not-an-array / an empty array. */
const noItems = (v: unknown): boolean => !Array.isArray(v) || v.length === 0;

/** True for undefined / a blank string. */
const noText = (v: unknown): boolean => typeof v !== 'string' || v.trim() === '';

/** True when an image / file / reference object was never picked. */
const noPick = (v: unknown): boolean => {
  if (!v || typeof v !== 'object') return true;
  const o = v as { asset?: { _ref?: string }; _ref?: string };
  return !o.asset?._ref && !o._ref;
};

const COACH: Record<string, CoachEntry> = {
  sectionRichText: {
    name: 'Text section',
    hint: 'Write your paragraphs in the Body box.',
    isEmpty: (s) => noItems(s.body),
  },
  sectionImageText: {
    name: 'Image + text',
    hint: 'Add a photo on one side and a heading with a paragraph on the other.',
    isEmpty: (s) => noPick(s.image) && noItems(s.body) && noText(s.heading),
  },
  sectionCardGrid: {
    name: 'Card grid',
    hint: 'Add one card for each point. Give each card a title and a short line.',
    isEmpty: (s) => noItems(s.cards),
  },
  sectionQuote: {
    name: 'Quote or scripture',
    hint: 'Type the sentence you want to show in large letters.',
    isEmpty: (s) => noText(s.quote),
  },
  sectionCtaBand: {
    name: 'Call-to-action band',
    hint: 'Add a headline and a button that tells people what to do next.',
    isEmpty: (s) => noText(s.headline) && noText(s.ctaLabel),
  },
  sectionFeatureCards: {
    name: 'Feature cards',
    hint: 'Add one card for each feature. Give each card a title and a paragraph.',
    isEmpty: (s) => noItems(s.cards),
  },
  sectionStats: {
    name: 'Stats and numbers',
    hint: 'Add one number for each fact. Give each number a label.',
    isEmpty: (s) => noItems(s.items),
  },
  sectionAccordion: {
    name: 'FAQ or accordion',
    hint: 'Add one row for each question. Give each row a question and its answer.',
    isEmpty: (s) => noItems(s.items),
  },
  sectionGallery: {
    name: 'Photo gallery',
    hint: 'Add your photos. Give each photo a short description of what it shows.',
    isEmpty: (s) => noItems(s.images),
  },
  sectionSteps: {
    name: 'Numbered steps',
    hint: 'Add one step for each thing a person does, in the order they do it.',
    isEmpty: (s) => noItems(s.steps),
  },
  sectionLogos: {
    name: 'Logos and partners',
    hint: 'Add one logo for each partner. Give each logo the partner name.',
    isEmpty: (s) => noItems(s.items),
  },
  sectionMediaFeature: {
    name: 'Media feature',
    hint: 'Paste a video link or pick a photo, then add a heading beside it.',
    isEmpty: (s) => noText(s.videoUrl) && noPick(s.image) && noText(s.heading) && noText(s.body),
  },
  sectionMediaShowcase: {
    name: 'Media showcase',
    hint: 'Add the slideshow photos, or paste a video link.',
    isEmpty: (s) => noItems(s.images) && noPick(s.video) && noText(s.videoUrl),
  },
  sectionKeyDates: {
    name: 'Key dates',
    hint: 'Add one row for each date. Give each row a date and what happens.',
    isEmpty: (s) => noItems(s.items),
  },
  embed: {
    name: 'Embed',
    hint: 'Paste the link, or the embed code the other website gave you.',
    isEmpty: (s) => noText(s.url) && noText(s.html),
  },
  sectionLegalBody: {
    name: 'Legal statement body',
    hint: 'Write the policy text, or choose one of the built-in statements.',
    isEmpty: (s) => noItems(s.body) && noText(s.fallbackStatement),
  },
  sectionNumberedCards: {
    name: 'Numbered cards',
    hint: 'Add one card for each step. Give each card a title and a short line.',
    isEmpty: (s) => noItems(s.cards),
  },
  sectionScholarship: {
    name: 'Warm statement band',
    hint: 'Type the headline, then the short paragraph under it.',
    isEmpty: (s) => noText(s.headline) && noText(s.body),
  },
  sectionLedgerStats: {
    name: 'Stat band',
    hint: 'Add one number for each fact. Give each number a label.',
    isEmpty: (s) => noItems(s.items),
  },
  sectionEditorialColumns: {
    name: 'Editorial columns',
    hint: 'Add one column for each idea. Give each column a heading and its text.',
    isEmpty: (s) => noItems(s.columns),
  },
  sectionInlineBand: {
    name: 'Inline band',
    hint: 'Type the one line of copy, then the button label beside it.',
    isEmpty: (s) => noText(s.headline) && noText(s.ctaLabel),
  },
  sectionRequestPanel: {
    name: 'Request panel',
    hint: 'Choose the form to show, or paste the link people book a call with.',
    isEmpty: (s) => noPick(s.form) && noText(s.calendlyUrl) && noText(s.requestHeadline),
  },
  sectionTicker: {
    name: 'Topics ticker',
    hint: 'Add the short topic words that scroll across the band.',
    isEmpty: (s) => noItems(s.topics),
  },
};

/**
 * The coaching note for a section that has no content yet, or `null` when the
 * section has something to show (or has no coaching entry at all).
 *
 * PREVIEW ONLY. Call this only behind the preview signal, see the header note.
 */
export function sectionCoach(section: SectionData): SectionCoachInfo | null {
  const entry = COACH[section?._type];
  if (!entry || !entry.isEmpty(section)) return null;
  return { name: entry.name, hint: entry.hint };
}

/** The section types that can show a coaching note. Exported for the tests. */
export const COACHED_SECTION_TYPES = Object.keys(COACH);

/** The self-filling types, re-exported so the tests have one import. */
export { SELF_FILLING_SECTIONS };
