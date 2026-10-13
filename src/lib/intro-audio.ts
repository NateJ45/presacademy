// Safe to edit by hand.
// =============================================================================
// intro-audio: the shared rules for a teacher's spoken introduction
// (2026-10-13, Term Issue PR 3)
// =============================================================================
// One place for the decisions the Studio schema and the site renderers both
// make, so they cannot drift apart:
//
//   - When is a recording "uploaded"? (`hasAudioAsset`: the file field holds an
//     asset reference. An empty file object left behind by a removed upload
//     does not count.)
//   - The transcript is required whenever there is a recording (WCAG 1.2.1:
//     prerecorded audio needs a text alternative). `transcriptRule` is the
//     Studio validation; `introAudioFor` is the renderer's gate, and it refuses
//     to show a player without a transcript even if a document slipped past.
//   - The length label format ("1:32").
//
// Pure functions with no Sanity or Astro imports, so `node --test` covers them
// (intro-audio.test.ts).

/** "1:32", "12:05". Minutes and seconds, seconds 00 to 59. */
export const INTRO_LENGTH_PATTERN = /^\d{1,2}:[0-5]\d$/;

/** True when a Sanity file field value holds an uploaded asset. */
export function hasAudioAsset(file: unknown): boolean {
  const asset = (file as { asset?: { _ref?: unknown } } | null | undefined)?.asset;
  return Boolean(asset && typeof asset === 'object');
}

/**
 * Studio validation for the transcript field: `true` when fine, otherwise the
 * message shown on the field (an error, so the document cannot be published).
 */
export function transcriptRule(transcript: unknown, audio: unknown): true | string {
  if (!hasAudioAsset(audio)) return true;
  return typeof transcript === 'string' && transcript.trim().length > 0
    ? true
    : 'Add a transcript: a recording cannot be published without one.';
}

/** What the IntroAudio island needs, or null when nothing should render. */
export interface IntroAudioProps {
  src: string;
  mimeType: string | null;
  transcript: string;
  length: string | null;
}

/**
 * The renderer's gate. Takes a projected faculty member (`introAudio` as
 * `{ url, mimeType }`, see INTRO_AUDIO in queries.ts) and returns the player
 * props only when there is BOTH a file URL and a non-empty transcript.
 */
export function introAudioFor(person: unknown): IntroAudioProps | null {
  const p = (person ?? {}) as {
    introAudio?: { url?: unknown; mimeType?: unknown } | null;
    introAudioTranscript?: unknown;
    introAudioLength?: unknown;
  };
  const src = typeof p.introAudio?.url === 'string' ? p.introAudio.url.trim() : '';
  const transcript =
    typeof p.introAudioTranscript === 'string' ? p.introAudioTranscript.trim() : '';
  if (!src || !transcript) return null;
  const mimeType = typeof p.introAudio?.mimeType === 'string' ? p.introAudio.mimeType : null;
  const length =
    typeof p.introAudioLength === 'string' && p.introAudioLength.trim()
      ? p.introAudioLength.trim()
      : null;
  return { src, mimeType, transcript, length };
}

/** Split a plain-text transcript into paragraphs on blank lines. */
export function transcriptParagraphs(transcript: string): string[] {
  return transcript
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
