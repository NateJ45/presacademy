// Safe to edit by hand. The starter writes this file with `npm run apply-brand`
// from the `layout` block of brand/brand.config.json; the Academy has no
// apply-brand (it was cut loose from the rebrand machinery on 2026-08-25), so
// keep the two in step by hand. src/lib/site-layout.test.ts fails when they differ.
// Defaults (inline, bleed, standard, standard, reveal) emit no attributes, so
// the site renders exactly as before (refoundation phase A, 2026-10-27).
import { resolveLayout } from '@/lib/site-layout';

export const layout = resolveLayout({
  header: 'inline',
  hero: 'bleed',
  density: 'standard',
  cards: 'standard',
  motion: 'reveal',
});
