// =============================================================================
// SurfaceChips — the section-style panel that opens off the 🎨 handle
// (2026-08-28)
// =============================================================================
// "Change how a section looks" already exists as a form: open the section, open
// Section background, click a dot. This is the same six surfaces and the same
// three accents, offered in the corner of the section itself, so the gesture is
// look-at-the-band then click-the-colour instead of look-at-the-band, find its
// row in the list, open a collapsed panel, click the colour, look back.
//
// It is the SAME registry either way (src/lib/surfaces.ts), so there is no
// second list of colours to drift, and the contrast gate in surfaces.test.ts
// covers what this panel can produce exactly as it covers the form.
//
// GATING. Not every section has a background: the Rule & Ledger sections come
// styled to match the page they belong to, by design. The overlay cannot ask the
// Studio which fields a type has, so the section's `_type` is read from the
// document snapshot and checked against the registry in section-fields.ts. Until
// that read lands, and for any type not in it, this renders nothing at all.
//
// -----------------------------------------------------------------------------
// WHY THE PANEL KEEPS ITS OWN OPEN STATE (editor bug, 2026-08-28)
// -----------------------------------------------------------------------------
// The first version drew itself whenever the host said `focused`, and editors
// reported it vanishing while they moved the mouse toward the dots. `focused` is
// not ours to lean on: the host clears it on `overlay/blur` (any click that is
// not on overlay chrome, and any Escape — controller.ts handleBlur/handleKeydown)
// and RECOMPUTES it on every `presentation/focus` the Studio sends back, keeping
// it only for the element whose `sanity.path` matches the Studio's focus path
// exactly (elementsReducer.ts). So the moment the Studio's form focus settles
// anywhere other than this exact `background` path — which it does on its own, a
// beat after the click — the panel disappeared mid-gesture.
//
// What the host does NOT do is unmount us for that: Overlays.tsx renders an
// element's overlay for `activated || focused`, and `activated` means "in the
// viewport" (controller.ts activates on intersection). The handle is pinned to
// the top-right of the band the editor is looking at, so it stays activated and
// this component stays MOUNTED with its state intact.
//
// Hence: `focused` turning truthy OPENS the panel, and only our own three
// gestures close it — the ✕, Escape, or a pointer press outside it. The panel is
// also anchored flush to the handle (styles.handleAnchor) so the pointer never
// crosses unowned pixels on the way to a row.
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import type { OverlayComponentProps } from '@sanity/visual-editing';
import {
  ACCENT_BY_VALUE,
  SECTION_ACCENTS,
  SECTION_SURFACES,
  SURFACE_BY_VALUE,
  type AccentChoice,
  type SurfacePair,
} from '../../../lib/surfaces.ts';
import { hasBackground } from '../../../lib/section-fields.ts';
import { readSectionPath } from '../../../lib/sanity-path.ts';
import { useDraftDocument, setInside } from './useDraftDocument.ts';
import { usePopover } from './usePopover.ts';
import {
  closeButton,
  groupLabel,
  handleAnchor,
  optionDot,
  optionRow,
  panel,
  panelHead,
  TOOL,
} from './styles.ts';

/** The Studio swatch draws theme-aware surfaces as a split dot. So does this. */
function swatchFill(surface: SurfacePair): string {
  return surface.themeStatic
    ? surface.dot
    : `linear-gradient(135deg, ${surface.dot} 0 50%, ${surface.dotDark} 50% 100%)`;
}

/** An accent's dot is its light value over its dark one, same idea. */
function accentFill(accent: AccentChoice): string {
  return `linear-gradient(135deg, ${accent.dot} 0 50%, ${accent.dotDark} 50% 100%)`;
}

interface Chosen {
  type?: string;
  tone: string;
  accent: string;
}

/** Class tokens, deduped, from a registry entry's `className` (or nothing). */
function tokensOf(className: string | null | undefined): string[] {
  return (className ?? '').split(/\s+/).filter(Boolean);
}

/**
 * The <section> the handle belongs to. Sections.astro renders the handle as the
 * last child of a plain relative wrapper whose other child is the band itself,
 * so the band is the wrapper's first <section>. Null when the shape is anything
 * else, which simply turns the optimistic recolour off.
 */
function bandFor(handle: Element): HTMLElement | null {
  const wrapper = handle.parentElement;
  return wrapper?.querySelector('section') ?? null;
}

/**
 * Swap one appearance class list for another on the band, so it recolours on
 * click instead of on the soft refresh a second later. Returns an undo, or null
 * when the band is not wearing the classes we expected (a section with a media
 * background paints `text-white` instead of a surface, and must be left alone).
 */
function applyClasses(
  band: HTMLElement | null,
  from: string | null | undefined,
  to: string | null | undefined,
): (() => void) | null {
  if (!band) return null;
  const remove = tokensOf(from);
  const add = tokensOf(to);
  if (remove.some((cls) => !band.classList.contains(cls))) return null;
  band.classList.remove(...remove);
  band.classList.add(...add);
  return () => {
    band.classList.remove(...add);
    band.classList.add(...remove);
  };
}

export default function SurfaceChips(props: OverlayComponentProps): React.ReactNode {
  const { node, PointerEvents, focused, element } = props;
  const section = readSectionPath(node.path);
  const key = section?.key;
  const { read, write } = useDraftDocument(node.id);
  const [chosen, setChosen] = useState<Chosen | null>(null);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // The card only exists once the document read has told us this section HAS a
  // background, so the autofocus that makes Escape reachable has to wait for it.
  const showing = open && !!section && !!chosen && hasBackground(chosen.type);
  const { onKeyDown } = usePopover(showing, cardRef, () => setOpen(false));

  // One read on open. Every later value is the one this panel just set, so the
  // tick moves the instant it is clicked rather than after a round trip.
  useEffect(() => {
    if (!section) return undefined;
    let alive = true;
    void read().then((doc) => {
      if (!alive || !doc) return;
      const item = doc[section.array];
      const found = Array.isArray(item)
        ? (item.find((s) => (s as { _key?: string })?._key === section.key) as
            Record<string, unknown> | undefined)
        : undefined;
      const background = (found?.background ?? {}) as Record<string, unknown>;
      setChosen({
        type: typeof found?._type === 'string' ? found._type : undefined,
        // The stored defaults, which are what a section with no choice renders.
        tone: typeof background.tone === 'string' ? background.tone : 'default',
        accent: typeof background.accent === 'string' ? background.accent : 'green',
      });
    });
    return () => {
      alive = false;
    };
    // `key` identifies the section; `read` is stable per document.
  }, [read, key, section?.array]);

  // Clicking the handle is what selects this node, so the host telling us we
  // just became focused IS the open gesture. Only the transition opens: a later
  // `presentation/focus` for some other path drops `focused` again and must not
  // take the panel with it.
  const wasFocused = useRef(false);
  useEffect(() => {
    if (focused && !wasFocused.current) setOpen(true);
    wasFocused.current = !!focused;
  }, [focused]);

  // Our own outside-press close, so the host's blur cannot do it for us. A press
  // on the handle re-opens rather than closes: `focused` is already true by then,
  // so the effect above would never fire a second time.
  useEffect(() => {
    if (!open) return undefined;
    const doc = element.ownerDocument;
    const onPointerDown = (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (element.contains(target)) {
        setOpen(true);
        return;
      }
      if (cardRef.current?.contains(target)) return;
      setOpen(false);
    };
    doc.addEventListener('pointerdown', onPointerDown, true);
    return () => doc.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, element]);

  if (!showing || !section || !chosen) return null;

  const choose = (fieldName: 'tone' | 'accent', value: string) => {
    if (chosen[fieldName] === value) return;
    // Recolour the band now, reconcile behind. The soft refresh that follows the
    // patch re-renders the section from the draft and replaces these classes with
    // the real ones; if the patch never lands, the undo puts them back.
    const band = bandFor(element);
    const undo =
      fieldName === 'tone'
        ? applyClasses(
            band,
            SURFACE_BY_VALUE[chosen.tone]?.className,
            SURFACE_BY_VALUE[value]?.className,
          )
        : applyClasses(
            band,
            ACCENT_BY_VALUE[chosen.accent]?.className,
            ACCENT_BY_VALUE[value]?.className,
          );
    const previous = chosen[fieldName];
    setChosen((current) => (current ? { ...current, [fieldName]: value } : current));
    void write(setInside([...section.itemPath, 'background'], fieldName, value)).then((ok) => {
      if (ok) return;
      undo?.();
      setChosen((current) => (current ? { ...current, [fieldName]: previous } : current));
    });
  };

  const row = (
    group: 'tone' | 'accent',
    value: string,
    title: string,
    hint: string,
    fill: string,
    size?: number,
  ) => {
    const selected = chosen[group] === value;
    const id = `${group}:${value}`;
    return (
      <button
        key={id}
        type="button"
        title={hint}
        aria-pressed={selected}
        style={optionRow(selected, hovered === id)}
        onMouseEnter={() => setHovered(id)}
        onMouseLeave={() => setHovered((was) => (was === id ? null : was))}
        onFocus={() => setHovered(id)}
        onBlur={() => setHovered((was) => (was === id ? null : was))}
        onClick={(event) => {
          event.stopPropagation();
          choose(group, value);
        }}
      >
        <span aria-hidden="true" style={optionDot(fill, size)} />
        <span style={{ flex: 1, minWidth: 0 }}>{title}</span>
        <span aria-hidden="true" style={{ color: TOOL.ink, width: '10px' }}>
          {selected ? '✓' : ''}
        </span>
      </button>
    );
  };

  return (
    <PointerEvents style={handleAnchor}>
      <div
        ref={cardRef}
        role="dialog"
        aria-label="Section style"
        tabIndex={-1}
        style={panel}
        onKeyDown={onKeyDown}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={panelHead}>
          <span style={{ font: `600 12px/1.2 ${TOOL.font}` }}>Section style</span>
          <button
            type="button"
            style={closeButton}
            aria-label="Close"
            title="Close"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
            }}
          >
            ✕
          </button>
        </div>

        <span style={{ ...groupLabel, borderTop: 'none' }}>Background</span>
        {SECTION_SURFACES.map((surface) =>
          row('tone', surface.value, surface.title, surface.hint, swatchFill(surface)),
        )}

        <span style={groupLabel}>Accent</span>
        {SECTION_ACCENTS.map((accent) =>
          row('accent', accent.value, accent.title, accent.hint, accentFill(accent), 12),
        )}
      </div>
    </PointerEvents>
  );
}
