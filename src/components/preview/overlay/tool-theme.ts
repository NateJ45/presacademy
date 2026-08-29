// Safe to edit by hand
// =============================================================================
// tool-theme - the ONE per-repo thing about the in-canvas controls (card 28)
// =============================================================================
// `styles.ts` beside this file is canonical: every repo in the family draws the
// same tool chrome, and the shapes, radii, shadows and spacing are shared. The
// only thing that is genuinely this project's own is the six values below, so
// they live here, alone, and a fork edits this file and nothing else.
//
// FIXED, AND THEME-INDEPENDENT ON PURPOSE. These controls float over the page,
// so they have to read as TOOLS rather than as content: a white card on a dark
// band still reads as a control, a dark card on a dark band reads as part of the
// design. The values are written as LITERALS rather than `var(--color-...)` for
// the same reason - the site's tokens flip in dark mode, and a tool that flipped
// with them would disappear against the band it sits on.
//
// The hexes here are this site's light-mode brand tokens (Ink on Paper, and the
// body face). They came out of the copy of `styles.ts` this file replaced, so
// the chrome looks the same as it did before the split.
// =============================================================================

/** The palette and type the canonical `styles.ts` draws every control with. */
export interface ToolTheme {
  /** Card and button background. */
  paper: string;
  /** Text, and the filled state of a pressed control. */
  ink: string;
  /** Captions and secondary text. */
  muted: string;
  /** Hairline borders. */
  line: string;
  /** The drop shadow that lifts a floating card off the page. */
  shadow: string;
  /** The font stack, matching the site's body face. */
  font: string;
}

export const TOOL: ToolTheme = {
  paper: '#FFFFFF',
  ink: '#1F1B18',
  muted: '#6B625B',
  line: 'rgba(31, 27, 24, 0.14)',
  shadow: '0 6px 20px rgba(31, 27, 24, 0.22), 0 1px 2px rgba(31, 27, 24, 0.16)',
  font: '"Source Sans 3 Variable", ui-sans-serif, system-ui, -apple-system, sans-serif',
};
