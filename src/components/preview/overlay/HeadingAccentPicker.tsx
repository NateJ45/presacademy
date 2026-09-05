// =============================================================================
// HeadingAccentPicker — pick the accent word by clicking it (2026-08-28)
// =============================================================================
// The guide's own steps for the accent word are: write the heading, copy one
// word out of it into a box, and "if nothing changes, the word is not in the
// heading, so check the spelling". Three steps, one of which is a warning about
// a typo. Clicking the word removes all three: the stored value is a slice of the
// heading by construction, so it cannot miss.
//
// THE PAGE DOM IS NEVER TOUCHED. The words are redrawn INSIDE the card as
// buttons, from the heading as the document stores it. Splitting the real
// heading element into spans would mean editing the rendered page from an
// overlay, and the rendered page is the thing being previewed.
//
// Clicking the word that is already accented clears it, which is the same
// gesture as un-bolding: press the thing that is on to turn it off.
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import type { OverlayComponentProps } from '@sanity/visual-editing';
import { splitHeadingWords, isAccentedWord } from '../../../lib/heading-accent.ts';
import { headingAccentFieldFor, SECTION_ARRAY_FIELDS } from '../../../lib/section-fields.ts';
import { readSectionPath } from '../../../lib/sanity-path.ts';
import { setAt, unsetAt, useDraftDocument } from './useDraftDocument.ts';
import { usePopover } from './usePopover.ts';
import { bar, button, card, caption, TOOL } from './styles.ts';

interface Loaded {
  type?: string;
  /** True once the clicked field IS this type's heading field. */
  matches: boolean;
  heading: string;
  accent: string;
}

export default function HeadingAccentPicker(props: OverlayComponentProps): React.ReactNode {
  const { node, PointerEvents, element, focused } = props;
  const section = readSectionPath(node.path, SECTION_ARRAY_FIELDS);
  const key = section?.key;
  const { read, write } = useDraftDocument(node.id);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { onKeyDown } = usePopover(open, cardRef, () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  });

  useEffect(() => {
    if (!section) return undefined;
    let alive = true;
    void read().then((doc) => {
      if (!alive || !doc) return;
      const list = doc[section.array];
      const found = Array.isArray(list)
        ? (list.find((s) => (s as { _key?: string })?._key === section.key) as
            Record<string, unknown> | undefined)
        : undefined;
      const type = typeof found?._type === 'string' ? found._type : undefined;
      // WHICH field is the heading depends on the type: five of the six call it
      // `heading`, the CTA band calls it `headline`. Reading the wrong one
      // would leave the picker with no words to offer and no way to say why.
      const clicked = typeof section.rest[0] === 'string' ? section.rest[0] : '';
      const headingField = headingAccentFieldFor(type, clicked);
      const stored = headingField ? found?.[headingField] : undefined;
      setLoaded({
        type,
        matches: headingField !== null,
        // The stored heading, not the rendered one: no stega, and no accent
        // markup already applied. The element's own text is the fallback for a
        // heading that is rendering its schema default.
        heading: typeof stored === 'string' && stored !== '' ? stored : (element.textContent ?? ''),
        accent: typeof found?.headingAccent === 'string' ? found.headingAccent : '',
      });
    });
    return () => {
      alive = false;
    };
  }, [read, key, section?.array, element]);

  // Selected, not merely on screen: `activated` in this host means "in the
  // viewport", so an ungated control would appear on every matching element at
  // once. Clicking the words is already the gesture for choosing them.
  if (!focused || !section || !loaded || !loaded.matches) return null;

  const tokens = splitHeadingWords(loaded.heading);
  if (!tokens.some((t) => t.word)) return null;

  const accentPath = [...section.itemPath, 'headingAccent'];

  const choose = (value: string, clearing: boolean) => {
    setLoaded((current) => (current ? { ...current, accent: clearing ? '' : value } : current));
    void write(clearing ? unsetAt(accentPath) : setAt(accentPath, value));
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <PointerEvents style={bar}>
        <button
          ref={triggerRef}
          type="button"
          style={button}
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((was) => !was);
          }}
        >
          {loaded.accent ? 'Change the coloured word' : 'Colour a word'}
        </button>
      </PointerEvents>

      {open && (
        <PointerEvents style={{ position: 'absolute', right: '8px', top: '100%', zIndex: 2 }}>
          <div
            ref={cardRef}
            role="dialog"
            aria-label="Choose a word to colour"
            tabIndex={-1}
            style={{ ...card, position: 'static' }}
            onKeyDown={onKeyDown}
            onClick={(event) => event.stopPropagation()}
          >
            <p style={{ ...caption, margin: '0 0 8px' }}>Click a word</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', alignItems: 'baseline' }}>
              {tokens.map((token, i) =>
                token.word ? (
                  <button
                    key={i}
                    type="button"
                    style={{
                      ...button,
                      padding: '2px 6px',
                      font: `600 14px/1.4 ${TOOL.font}`,
                      background: isAccentedWord(token, loaded.accent) ? TOOL.ink : TOOL.paper,
                      color: isAccentedWord(token, loaded.accent) ? TOOL.paper : TOOL.ink,
                      borderColor: isAccentedWord(token, loaded.accent) ? TOOL.ink : TOOL.line,
                    }}
                    aria-pressed={isAccentedWord(token, loaded.accent)}
                    onClick={(event) => {
                      event.stopPropagation();
                      choose(token.value, isAccentedWord(token, loaded.accent));
                    }}
                  >
                    {token.text}
                  </button>
                ) : (
                  <span key={i} aria-hidden="true" style={{ width: '2px' }} />
                ),
              )}
            </div>
            <p style={{ margin: '10px 0 0', color: TOOL.muted, fontSize: '12px' }}>
              {loaded.accent
                ? 'Click the coloured word again to make the heading plain.'
                : 'One word per heading. It takes the section’s accent colour.'}
            </p>
          </div>
        </PointerEvents>
      )}
    </>
  );
}
