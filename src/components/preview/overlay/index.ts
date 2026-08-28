// =============================================================================
// The in-canvas control layer — one resolver, three controls (2026-08-28)
// =============================================================================
// @sanity/visual-editing lets the previewed page put its OWN React components
// inside the overlay, anchored to whatever element is hovered or selected, by
// handing `<VisualEditing>` a `components` resolver. That is the whole hook this
// layer hangs on. Everything the resolver returns renders INSIDE the preview
// iframe, in the site's bundle, positioned over the element's outline.
//
// THREE FACTS ABOUT THE HOST, all verified against the pinned 5.4.5 source
// before any of this was written:
//
//   1. The resolver only runs while the optimistic actor is ready, and the
//      overlay only draws for hovered or focused elements. So "these controls
//      exist only in Edit mode, only on the thing you are pointing at" needs no
//      gate of our own; it is how the host already behaves.
//   2. The overlay layer is `pointer-events: none`. Anything clickable must be
//      wrapped in the `PointerEvents` component the host passes in as a prop —
//      it is the opt-in, and it also marks the node as overlay chrome rather
//      than page content.
//   3. Each control renders as a child of the element's outline box, which is
//      absolutely positioned at the element's rect. So `position: absolute` in a
//      control is relative to the outline, which is what makes "bottom-right of
//      the outline" a two-line style rather than a measuring exercise.
//
// The decision about WHICH controls an element gets is pure and lives in
// src/lib/section-fields.ts (`overlayControlsForPath`), where it is unit-tested;
// this file is only the wiring.
// =============================================================================
import type { OverlayComponent, OverlayComponentResolver } from '@sanity/visual-editing';
import { overlayControlsForPath, type OverlayControl } from '../../../lib/section-fields.ts';
import SurfaceChips from './SurfaceChips.tsx';
import HeadingAccentPicker from './HeadingAccentPicker.tsx';
import TextPopover from './TextPopover.tsx';

const BY_CONTROL: Record<OverlayControl, OverlayComponent> = {
  surface: SurfaceChips as OverlayComponent,
  headingAccent: HeadingAccentPicker as OverlayComponent,
  text: TextPopover as OverlayComponent,
};

/**
 * Hand every hovered element the controls its path makes it a candidate for.
 * Returning undefined — the common case, for every element that is not a
 * section, a heading or a curated line — leaves the host's own overlay exactly
 * as it was.
 */
export const inCanvasControls: OverlayComponentResolver = (context) => {
  const path = (context.node as { path?: string } | undefined)?.path;
  const controls = overlayControlsForPath(path);
  if (controls.length === 0) return undefined;
  return controls.map((name) => BY_CONTROL[name]);
};
