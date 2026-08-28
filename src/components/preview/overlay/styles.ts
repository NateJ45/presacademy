// =============================================================================
// styles — the look of the in-canvas controls (2026-08-28)
// =============================================================================
// These controls float OVER the page inside the Presentation preview, so they
// have to read as tools rather than as content. That means a fixed light chrome
// in both themes (a white card on a dark band still reads as a control, a dark
// card on a dark band reads as part of the design), the site's own type, and
// nothing that could be mistaken for something a visitor will see.
//
// PLAIN OBJECTS, NOT @sanity/ui. The Studio's component kit would drag
// styled-components and its theme into the PREVIEW ISLAND, which is bundled with
// the site. The whole layer is a few dozen inline styles instead; that is the
// entire cost of keeping the public bundle where it was.
// =============================================================================
import type { CSSProperties } from 'react';

/** Fixed, theme-independent chrome: the same tool on a paper band or an ink one. */
export const TOOL = {
  paper: '#FFFFFF',
  ink: '#1F1B18',
  muted: '#6B625B',
  line: 'rgba(31, 27, 24, 0.14)',
  ring: '#1F1B18',
  shadow: '0 6px 20px rgba(31, 27, 24, 0.22), 0 1px 2px rgba(31, 27, 24, 0.16)',
  font: '"Source Sans 3 Variable", ui-sans-serif, system-ui, -apple-system, sans-serif',
} as const;

/** Everything a floating strip looks like, minus where it sits. */
const barBase: CSSProperties = {
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 8px',
  borderRadius: '999px',
  background: TOOL.paper,
  border: `1px solid ${TOOL.line}`,
  boxShadow: TOOL.shadow,
  font: `500 12px/1.2 ${TOOL.font}`,
  color: TOOL.ink,
  flexWrap: 'wrap',
};

/**
 * The strip inside a TEXT element's outline (a heading, a subhead). Those
 * elements are comfortably bigger than the strip, so it sits in their corner.
 */
export const bar: CSSProperties = {
  ...barBase,
  right: '8px',
  bottom: '8px',
  maxWidth: 'calc(100% - 16px)',
};

/**
 * The ANCHOR the surface panel hangs from. The handle is a 28px square pinned to
 * the section's top-right, so the panel drops from its bottom edge and grows
 * leftwards, which keeps it on screen.
 *
 * FLUSH, WITH NO DEAD GAP (2026-08-28). The visible card is offset from the
 * handle by `paddingTop` on THIS box rather than by `top: calc(100% + 6px)`, so
 * the six pixels between handle and card belong to the overlay too. Pointer
 * events on this element are `all` (it is rendered through the host's
 * `PointerEvents`), which is what makes the host treat a pointer crossing that
 * strip as "still on overlay chrome" — see the deferred-leave branch of
 * `mouseleave` in the host's controller.ts, which only defers when
 * `findOverlayElement(relatedTarget)` finds an overlay ancestor.
 */
export const handleAnchor: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: '100%',
  paddingTop: '6px',
  zIndex: 3,
};

/** The surface panel itself: a small labelled card, not a bare row of dots. */
export const panel: CSSProperties = {
  width: '208px',
  maxWidth: 'calc(100vw - 24px)',
  borderRadius: '10px',
  background: TOOL.paper,
  border: `1px solid ${TOOL.line}`,
  boxShadow: TOOL.shadow,
  font: `400 13px/1.4 ${TOOL.font}`,
  color: TOOL.ink,
  textAlign: 'left',
  overflow: 'hidden',
};

/** The panel's title bar: what this is, and the way out of it. */
export const panelHead: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  padding: '8px 8px 8px 10px',
  borderBottom: `1px solid ${TOOL.line}`,
};

/** The ✕. Square, quiet, and big enough to hit. */
export const closeButton: CSSProperties = {
  appearance: 'none',
  border: '1px solid transparent',
  background: 'transparent',
  color: TOOL.muted,
  borderRadius: '6px',
  width: '22px',
  height: '22px',
  lineHeight: 1,
  padding: 0,
  cursor: 'pointer',
  font: `600 13px/1 ${TOOL.font}`,
  flex: '0 0 auto',
};

/** One choice: a colour dot, its name, and a tick when it is the current one. */
export function optionRow(selected: boolean, hovered: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    boxSizing: 'border-box',
    padding: '5px 10px',
    appearance: 'none',
    border: 'none',
    borderLeft: `2px solid ${selected ? TOOL.ink : 'transparent'}`,
    background: hovered ? 'rgba(31, 27, 24, 0.06)' : 'transparent',
    color: TOOL.ink,
    font: `${selected ? 600 : 400} 13px/1.3 ${TOOL.font}`,
    textAlign: 'left',
    cursor: 'pointer',
  };
}

/** The dot inside an option row. Same split-fill idea as the Studio swatch. */
export function optionDot(background: string, size = 16): CSSProperties {
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '999px',
    border: `1px solid ${TOOL.line}`,
    background,
    flex: '0 0 auto',
  };
}

/** The little uppercase heading over a group of rows inside the panel. */
export const groupLabel: CSSProperties = {
  display: 'block',
  padding: '8px 10px 4px',
  borderTop: `1px solid ${TOOL.line}`,
  font: `600 10px/1.2 ${TOOL.font}`,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: TOOL.muted,
};

/** A card that opens from a control: the word picker, the text editor. */
export const card: CSSProperties = {
  position: 'absolute',
  minWidth: '240px',
  maxWidth: 'min(420px, calc(100vw - 32px))',
  padding: '12px',
  borderRadius: '10px',
  background: TOOL.paper,
  border: `1px solid ${TOOL.line}`,
  boxShadow: TOOL.shadow,
  font: `400 13px/1.45 ${TOOL.font}`,
  color: TOOL.ink,
  textAlign: 'left',
};

/** A plain text button, used for every label in the layer. */
export const button: CSSProperties = {
  appearance: 'none',
  border: `1px solid ${TOOL.line}`,
  background: TOOL.paper,
  color: TOOL.ink,
  borderRadius: '999px',
  padding: '4px 10px',
  font: `600 12px/1.2 ${TOOL.font}`,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

/** The same button, filled, for the one primary action on a card. */
export const primaryButton: CSSProperties = {
  ...button,
  background: TOOL.ink,
  color: TOOL.paper,
  borderColor: TOOL.ink,
};

/** Small muted caption text inside a bar or a card. */
export const caption: CSSProperties = {
  font: `600 10px/1.2 ${TOOL.font}`,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: TOOL.muted,
};

/** The editing surface in the text popover: textarea and contenteditable alike. */
export const field: CSSProperties = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  minHeight: '64px',
  maxHeight: '40vh',
  overflowY: 'auto',
  padding: '8px 10px',
  borderRadius: '6px',
  border: `1px solid ${TOOL.line}`,
  background: TOOL.paper,
  color: TOOL.ink,
  font: `400 14px/1.5 ${TOOL.font}`,
  resize: 'none',
  outline: 'none',
};
