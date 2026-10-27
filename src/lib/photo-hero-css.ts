// Foundation, edit with care
// =============================================================================
// photoHeroCssOnDemand(): keeps the photo hero's stylesheet off pages that do not draw it
// (starter card 189, refoundation phase D, 2026-10-27)
// =============================================================================
// PhotoHero.astro (PORTABLE, the starter's file, never edited here) imports
// `@/styles/photo-hero.css` the plain way. Astro links a component's stylesheet
// from every page whose module graph can reach the component, even when it never
// renders, and a dynamic import does not change that (measured: every page with a
// hero gained a `PhotoHero.css` link). The starter's sites purge unused CSS after
// the build; the Academy holds its live pages to byte-identical HTML instead.
//
// So this Vite plugin answers THAT ONE plain import, made from PhotoHero.astro,
// with an empty module. The real styles still reach the page:
// PhotoHeroAcademy.astro imports the sheet with `?inline` (a different module id,
// left alone here) and writes it, with the Academy's palette, as an inline
// <style> only on a page whose hero picks the style. Same idea as the builder
// kit's styles (BuilderBlock.astro). Wired in astro.config.mjs.
import type { Plugin } from 'vite';

// Not ending in .css: an empty JS module, so no stylesheet chunk is made at all.
const EMPTY_ID = '\0academy:photo-hero-empty';

export function photoHeroCssOnDemand(): Plugin {
  return {
    name: 'academy-photo-hero-css-on-demand',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source !== '@/styles/photo-hero.css') return null;
      if (!importer || !/[\\/]PhotoHero\.astro$/.test(importer.split('?')[0])) return null;
      return EMPTY_ID;
    },
    load(id) {
      return id === EMPTY_ID ? '' : null;
    },
  };
}
