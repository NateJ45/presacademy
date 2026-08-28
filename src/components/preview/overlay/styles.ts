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
 * The strip that hangs off the SURFACE HANDLE. The handle is a 28px square, so
 * a strip inside its corner would be a strip inside a 28px box: this one hangs
 * just below it and grows leftwards from the handle's right edge, which keeps
 * it on screen because the handle itself is pinned to the section's top-right.
 * The percentage max-width of `bar` would resolve against those 28px, so this
 * one is bounded by the viewport instead.
 */
export const handleBar: CSSProperties = {
  ...barBase,
  right: 0,
  top: 'calc(100% + 6px)',
  maxWidth: 'min(78vw, 480px)',
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

/** A round colour chip: a surface swatch or an accent dot. */
export function chip(background: string, selected: boolean, size = 20): CSSProperties {
  return {
    width: `${size}px`,
    height: `${size}px`,
    padding: 0,
    borderRadius: '999px',
    border: `1px solid ${TOOL.line}`,
    background,
    cursor: 'pointer',
    appearance: 'none',
    flex: '0 0 auto',
    boxShadow: selected ? `0 0 0 2px ${TOOL.paper}, 0 0 0 4px ${TOOL.ring}` : 'none',
  };
}

/** Small muted caption text inside a bar or a card. */
export const caption: CSSProperties = {
  font: `600 10px/1.2 ${TOOL.font}`,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: TOOL.muted,
};

/** A thin vertical rule between two groups of chips. */
export const divider: CSSProperties = {
  width: '1px',
  alignSelf: 'stretch',
  background: TOOL.line,
  margin: '0 2px',
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
