// Foundation, edit with care
// =============================================================================
// The Contents menu (the 2026-10-13 chrome redesign): the phone and tablet nav,
// drawn as the contents page of the term's issue. A full-screen sheet:
//
//   ▓▓▓▓▓▓▓▓  spine strip
//   The Presbyterian Academy                       [x CLOSE]
//   ══════════════════════════════════════════════
//   Contents                                    SPRING 2027
//   ──────────────────────────────────────────────
//   Courses ........................... 8 THIS YEAR
//   Faculty ............................ 5 TEACHERS
//   ...
//   ON THE SHELF THIS TERM
//   [] [] [] [] [] []   tiny covers, each a link to its course
//
//   (           REQUEST INFORMATION            )
//   OFFICE MONDAY TO THURSDAY ...       [LIGHT|DARK]
//
// Each row ends in a short mono fact: Courses, Faculty and Pricing are worked
// out from the data and every other row reads its Studio "Menu note" (both
// resolved in Header.astro through src/lib/chrome.ts menuFact).
//
// Accessibility comes from Radix Dialog (via the shadcn Sheet parts): dialog
// semantics named by the "Contents" heading, a focus trap, Escape to close,
// focus back on the button that opened it, and a native body scroll lock
// (react-remove-scroll; no smooth-scroll library is involved).
//
// Two buttons open it: the bordered "Contents" button in the masthead (the
// Radix trigger, rendered here) and the one in the condensed bar, which lives
// in Header.astro's markup and carries `data-open-contents`. A click on that
// one is caught by a document listener below; focus returns to it on close.
//
// Radix's portal does not SSR cleanly inside Astro, so the component
// server-renders ONLY the trigger and mounts the Sheet after hydration
// (`mounted`). The trigger is the same element before and after, so it never
// jumps.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ThemeToggle from './ThemeToggle';
import { site } from '@/data/site';
import { COVER_COLORS, coverVars, type CoverColor, type CoverOrnament } from '@/lib/cover';

// ---- Types ------------------------------------------------------------------

interface FlatItem {
  kind: 'flat';
  label: string;
  href: string;
  /** The mono fact at the end of the row ("8 this year"). */
  note?: string;
}

interface DropdownItem {
  kind: 'dropdown';
  label: string;
  items: { label: string; href: string }[];
}

interface ShelfCover {
  title: string;
  href: string;
  color: CoverColor;
  ornament: CoverOrnament;
}

interface Props {
  items: (FlatItem | DropdownItem)[];
  shelf?: ShelfCover[];
  /** The next term's name ("Spring 2027"), or empty. */
  termTag?: string;
  cta?: { show: boolean; label: string; href: string };
  officeHours?: string;
}

const DEFAULT_CTA = { show: true, label: 'Request information', href: '/get-started/' };

// ---- Pieces -----------------------------------------------------------------

function Spine() {
  return (
    <div className="spine" aria-hidden="true">
      {COVER_COLORS.map((c) => (
        <span key={c} style={{ background: `var(--color-cover-${c})` }} />
      ))}
    </div>
  );
}

function ContentsGlyph() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
      <path d="M1 3h12M1 7h12M1 11h8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// ---- Component --------------------------------------------------------------

export default function MobileNav({
  items,
  shelf = [],
  termTag = '',
  cta = DEFAULT_CTA,
  officeHours = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // The condensed bar's button, when it was the one that opened the menu.
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  // Any [data-open-contents] button (the condensed bar's) opens the menu.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as Element | null)?.closest?.('[data-open-contents]');
      if (!btn) return;
      opener.current = btn as HTMLElement;
      setOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const close = () => setOpen(false);

  const trigger = (
    <button type="button" className="contents-btn" aria-haspopup="dialog">
      <ContentsGlyph />
      Contents
    </button>
  );

  if (!mounted) return trigger;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="contents-sheet inset-0 h-full gap-0 overflow-y-auto border-0 bg-background p-0 text-foreground shadow-none data-[side=right]:w-full data-[side=right]:border-l-0 data-[side=right]:sm:max-w-none"
        onCloseAutoFocus={(e) => {
          // Opened from the condensed bar: give focus back to that button.
          if (opener.current && document.contains(opener.current)) {
            e.preventDefault();
            opener.current.focus();
          }
          opener.current = null;
        }}
      >
        <Spine />

        {/* The masthead row, repeated, with the Close button in place of
            Contents. */}
        <div className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-b-2 border-foreground px-4 sm:px-6">
          <a href="/" onClick={close} className="contents-sheet__plate hit-44 relative">
            {site.wordmark.line1} {site.wordmark.line2 ? <i>{site.wordmark.line2}</i> : null}
            <span className="sr-only"> home</span>
          </a>
          <SheetClose asChild>
            <button type="button" className="contents-btn contents-btn--close">
              <X size={12} strokeWidth={2} aria-hidden="true" />
              Close
            </button>
          </SheetClose>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-[22px] sm:px-6">
          <div className="flex items-baseline justify-between gap-4">
            <SheetTitle className="contents-sheet__title">Contents</SheetTitle>
            {termTag ? (
              <span className="mast-mono text-[10.5px] text-muted-foreground">{termTag}</span>
            ) : null}
          </div>
          <SheetDescription className="sr-only">
            The site&apos;s main pages{termTag ? ` and the ${termTag} courses` : ''}.
          </SheetDescription>

          <nav aria-label="Primary" className="mt-4 border-t border-foreground">
            {items.map((item) =>
              item.kind === 'flat' ? (
                <a key={item.href} href={item.href} onClick={close} className="contents-row">
                  <span className="contents-row__label">{item.label}</span>
                  <span className="contents-row__leader" aria-hidden="true" />
                  {item.note ? (
                    <span
                      className={[
                        'contents-row__fact mast-mono',
                        item.href === '/courses/' && 'contents-row__fact--key',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {item.note}
                    </span>
                  ) : null}
                </a>
              ) : (
                <div key={item.label} className="border-b border-border-soft py-2">
                  <p className="mast-mono pt-2 text-[10.5px] text-muted-foreground">{item.label}</p>
                  {item.items.map((sub) => (
                    <a
                      key={sub.href}
                      href={sub.href}
                      onClick={close}
                      className="contents-row contents-row--sub"
                    >
                      <span className="contents-row__label">{sub.label}</span>
                    </a>
                  ))}
                </div>
              ),
            )}
          </nav>

          {shelf.length > 0 ? (
            <div className="mt-[18px]">
              <p className="mast-mono text-[10.5px] text-muted-foreground" id="contents-shelf">
                On the shelf this term
              </p>
              <ul
                className="mt-2.5 flex [scrollbar-width:none] list-none gap-2 overflow-x-auto p-0 [&::-webkit-scrollbar]:hidden"
                aria-labelledby="contents-shelf"
              >
                {shelf.map((c) => (
                  <li key={c.href} className="shrink-0">
                    <a
                      href={c.href}
                      onClick={close}
                      className="mini-cover mini-cover--shelf"
                      style={coverVars(c.color)}
                      aria-label={c.title}
                    >
                      <span className="cover__orn" data-ornament={c.ornament} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-auto flex flex-col gap-2.5 pt-6 pb-[18px]">
            {cta.show ? (
              <a href={cta.href} onClick={close} className="mast-btn mast-btn--block press-tactile">
                {cta.label}
              </a>
            ) : null}
            <div className="mast-mono flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[10.5px] tracking-[0.06em] text-muted-foreground">
              {officeHours ? <span>Office {officeHours}</span> : <span />}
              <ThemeToggle variant="sheet" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
