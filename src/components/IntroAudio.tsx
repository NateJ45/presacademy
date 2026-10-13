// Safe to edit by hand
// =============================================================================
// IntroAudio: a teacher's spoken introduction (2026-10-13, Term Issue PR 3)
// =============================================================================
// A native <audio> element driven by one play/pause button, with the length
// beside it and the full transcript in a <details> underneath. Used by the
// faculty strip's "contributors" rows and the faculty detail page.
//
// Lazy on purpose: `preload="none"` means the browser fetches nothing until the
// visitor presses play, so a page with four teachers costs four empty <audio>
// tags, not four recordings. Mount it `client:visible` so even this script waits
// until the row scrolls into view.
//
// Accessibility:
//   - The button's aria-label names the teacher and flips between "Play" and
//     "Pause"; its visible text ("Listen" / "Pause" + length) is contained in
//     that label, so speech-input users can say what they see (WCAG 2.5.3).
//   - The transcript is ALWAYS rendered when there is audio (WCAG 1.2.1). The
//     callers only mount this when both the file URL and a transcript exist.
//   - Only one introduction plays at a time: starting one pauses any other on
//     the page, so two teachers never talk over each other.
//   - No animation: the icon swaps between play and pause glyphs, nothing moves,
//     so there is nothing to add to the reduced-motion block or settle().

import { useEffect, useRef, useState } from 'react';
import { transcriptParagraphs } from '@/lib/intro-audio';

interface Props {
  /** Public URL of the audio file (Sanity CDN). */
  src: string;
  /** The file's MIME type, when Sanity knows it. Helps the browser pick a decoder. */
  mimeType?: string | null;
  /** The teacher's display name, used in the button and transcript labels. */
  name: string;
  /** Plain-text transcript. Blank lines separate paragraphs. */
  transcript: string;
  /** Length as typed by the editor, e.g. "1:32". Optional. */
  length?: string | null;
}

/** Fired on window so every IntroAudio on the page can pause the others. */
const PLAY_EVENT = 'introaudio:play';

export default function IntroAudio({ src, mimeType, name, transcript, length }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  // Pause this player when another one starts.
  useEffect(() => {
    function onOtherPlay(e: Event) {
      const audio = audioRef.current;
      if (audio && (e as CustomEvent<HTMLAudioElement>).detail !== audio && !audio.paused) {
        audio.pause();
      }
    }
    window.addEventListener(PLAY_EVENT, onOtherPlay);
    return () => window.removeEventListener(PLAY_EVENT, onOtherPlay);
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: audio }));
      audio.play().catch(() => setFailed(true));
    } else {
      audio.pause();
    }
  }

  const lengthLabel = length?.trim() || '';
  const verb = playing ? 'Pause' : 'Listen';
  const ariaLabel = playing
    ? `Pause the introduction from ${name}`
    : `Listen to the introduction from ${name}${lengthLabel ? `, ${lengthLabel}` : ''}`;
  const paragraphs = transcriptParagraphs(transcript);

  return (
    <div data-intro-audio>
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setFailed(true);
        }}
      >
        <source src={src} {...(mimeType ? { type: mimeType } : {})} />
      </audio>

      <button
        type="button"
        onClick={toggle}
        aria-label={ariaLabel}
        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-link"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" className="text-link">
          <circle cx="10" cy="10" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {playing ? (
            <path d="M7.5 6.5h1.75v7H7.5zM10.75 6.5h1.75v7h-1.75z" fill="currentColor" />
          ) : (
            <path d="M8 6.4v7.2L13.8 10z" fill="currentColor" />
          )}
        </svg>
        <span>
          {verb}
          {lengthLabel && (
            <span className="font-normal text-foreground/70">
              {' '}
              · <span className="font-mono text-xs">{lengthLabel}</span>
            </span>
          )}
        </span>
      </button>
      {failed && (
        <p className="text-sm text-foreground/70" role="status">
          The recording would not play. The transcript below has every word.
        </p>
      )}

      <details className="text-sm">
        <summary className="inline-flex min-h-[44px] cursor-pointer items-center text-link underline underline-offset-4 hover:text-primary-dark">
          Read the transcript
        </summary>
        <div className="mt-1 mb-2 max-w-prose space-y-2 border-l-2 border-gold/50 pl-3 text-foreground/80">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </details>
    </div>
  );
}
