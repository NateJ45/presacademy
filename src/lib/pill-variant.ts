// Foundation, edit with care
// =============================================================================
// The Academy's filled pill, made quiet (refoundation phase A2, 2026-10-27)
// =============================================================================
// The starter's accent budget (src/lib/cta-budget.ts, card 158; the header
// rule, card 187) decides which page-builder button may stay the filled
// accent: the first one on the page that does not repeat the header's button.
// Every other one draws the secondary variant. The Academy's blocks write
// their filled pill as a literal class string (bg-primary, text on primary,
// a darker hover), so this turns that string into the outlined pill: a thin
// border in the text colour of the band it sits on, the same size and type.
//
// It takes the colour from the band (border-current, no text colour of its
// own), so the outlined pill reads on the light bands and on the chapel band
// alike. 'primary' (or no variant) returns the string untouched, which is
// what keeps a page with one button byte-identical.
// =============================================================================

export type PillVariant = 'primary' | 'secondary';

const SWAP: Record<string, string | null> = {
  'bg-primary': 'border border-current',
  'text-primary-foreground': null,
  'hover:bg-primary-dark': 'hover:bg-current/10',
};

/** The block's filled pill classes, or the outlined pill when the budget says secondary. */
export function pillClasses(filled: string, variant?: PillVariant | null): string {
  if (variant !== 'secondary') return filled;
  return filled
    .split(/\s+/)
    .filter(Boolean)
    .map((cls) => (cls in SWAP ? SWAP[cls] : cls))
    .filter((cls): cls is string => !!cls)
    .join(' ');
}
