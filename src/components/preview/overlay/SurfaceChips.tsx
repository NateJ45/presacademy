// =============================================================================
// SurfaceChips — the swatch row that floats on a hovered section (2026-08-28)
// =============================================================================
// "Change how a section looks" already exists as a form: open the section, open
// Section background, click a dot. This is the same six surfaces and the same
// three accents, offered in the corner of the section itself, so the gesture is
// look-at-the-band then click-the-colour instead of look-at-the-band, find its
// row in the list, open a collapsed panel, click the colour, look back.
//
// It is the SAME registry either way (src/lib/surfaces.ts), so there is no
// second list of colours to drift, and the contrast gate in surfaces.test.ts
// covers what this row can produce exactly as it covers the form.
//
// GATING. Not every section has a background: the Rule & Ledger sections come
// styled to match the page they belong to, by design. The overlay cannot ask the
// Studio which fields a type has, so the section's `_type` is read from the
// document snapshot and checked against the registry in section-fields.ts. Until
// that read lands, and for any type not in it, this renders nothing at all.
// =============================================================================
import { useEffect, useState } from 'react';
import type { OverlayComponentProps } from '@sanity/visual-editing';
import {
  SECTION_ACCENTS,
  SECTION_SURFACES,
  type AccentChoice,
  type SurfacePair,
} from '../../../lib/surfaces.ts';
import { hasBackground } from '../../../lib/section-fields.ts';
import { readSectionPath } from '../../../lib/sanity-path.ts';
import { useDraftDocument, setInside } from './useDraftDocument.ts';
import { caption, chip, divider, handleBar } from './styles.ts';

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

export default function SurfaceChips(props: OverlayComponentProps): React.ReactNode {
  const { node, PointerEvents, focused } = props;
  const section = readSectionPath(node.path);
  const key = section?.key;
  const { read, write } = useDraftDocument(node.id);
  const [chosen, setChosen] = useState<Chosen | null>(null);

  // One read on open. Every later value is the one this row just set, so the
  // ring moves the instant it is clicked rather than after a round trip.
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

  // ONLY WHEN SELECTED. In this host `activated` means "in the viewport", not
  // "hovered" (controller.ts activates on intersection), and the overlay renders
  // every activated element. Drawing the swatches unconditionally would put a
  // row of colour dots on every section on screen at once. The always-visible
  // affordance is the small palette handle Sections.astro paints in the page;
  // clicking it selects this node, and the swatches are the result.
  if (!focused || !section || !chosen || !hasBackground(chosen.type)) return null;

  const choose = (fieldName: 'tone' | 'accent', value: string) => {
    setChosen((current) => (current ? { ...current, [fieldName]: value } : current));
    void write(setInside([...section.itemPath, 'background'], fieldName, value));
  };

  return (
    <PointerEvents style={handleBar} aria-label="Section colours">
      <span style={caption}>Surface</span>
      {SECTION_SURFACES.map((surface) => (
        <button
          key={surface.value}
          type="button"
          title={`${surface.title} — ${surface.hint}`}
          aria-label={`Surface: ${surface.title}`}
          aria-pressed={chosen.tone === surface.value}
          style={chip(swatchFill(surface), chosen.tone === surface.value)}
          onClick={(event) => {
            event.stopPropagation();
            choose('tone', surface.value);
          }}
        />
      ))}
      <span style={divider} aria-hidden="true" />
      <span style={caption}>Accent</span>
      {SECTION_ACCENTS.map((accent) => (
        <button
          key={accent.value}
          type="button"
          title={`${accent.title} — ${accent.hint}`}
          aria-label={`Accent: ${accent.title}`}
          aria-pressed={chosen.accent === accent.value}
          style={chip(accentFill(accent), chosen.accent === accent.value, 16)}
          onClick={(event) => {
            event.stopPropagation();
            choose('accent', accent.value);
          }}
        />
      ))}
    </PointerEvents>
  );
}
