// Safe to edit by hand
// =============================================================================
// This site's pictures of the Studio for the Site Guide (PORTS.md card 130)
// =============================================================================
// A guide asks for a picture by KEY, so the guide text stays the same on every
// site while each site draws its own screenshots:
//
//     { kind: 'shot', key: 'publish-button' }          // in guides/content.ts
//
// and this file says what that key shows on THIS site: the image in
// public/guide-shots/ and the marks laid over it. A key with no entry here
// falls back to the wireframe drawing (public/guide-shots/example-editor.svg),
// so a guide never shows a hole. Adding a capture is: save a WebP under
// public/guide-shots/ (crop to the useful part, cover any avatar or personal
// name, under about 150 KB), add its entry below, and the guide picks it up.
//
// Positions are PERCENT of the picture, so a recapture at another size keeps
// its marks. To place one from a capture, divide the pixel position inside the
// cropped image by its width or height and multiply by 100. See
// docs/agent/studio-kit.md ("Real captures in the guides") for the recipe, and
// src/lib/guide-shots.test.ts for what is checked (the file exists, the alt text
// is there, the marks sit inside the picture).
//
// Shape of an entry: GuideShotData in src/lib/studio-look.ts.
// =============================================================================

import type { GuideShotData } from '../../lib/studio-look.ts';

// Captured 2026-10-19 from the kit harness (/kit-harness/studio/) against the local dev
// server, with every Sanity request answered by sample data, so no real document or person
// is in any picture; the navbar (and its account avatar) is cropped off. Still to capture,
// so they draw the wireframe for now: 'term-editor' and 'offering-status' (a term and a
// course in the editor), with the tutorial-video pipeline's sample data (card 137).
export const GUIDE_SHOTS: Record<string, GuideShotData> = {
  'quick-update-tiles': {
    src: '/guide-shots/quick-update-tiles.webp',
    alt: 'Quick update on a phone: four big buttons, Put up a notice, Remind people enrollment closes, Cancel or move a class, and Add an info session or event.',
    width: 1620,
    height: 1740,
    marks: [
      { kind: 'ring', x: 28.1, y: 41.8, w: 43.7, h: 20 },
      {
        kind: 'stone',
        x: 70.7,
        y: 44,
        label: 'In enrollment weeks, this one writes the reminder for you.',
      },
      {
        kind: 'stone',
        x: 70.7,
        y: 74,
        label: 'A class that moved: a red notice that comes down by itself.',
      },
    ],
  },
  'quick-update-reminder': {
    src: '/guide-shots/quick-update-reminder.webp',
    alt: 'The Remind people enrollment closes form on a phone: an optional box for your own words, an optional last day, and the Put the reminder up button.',
    width: 1620,
    height: 1244,
    marks: [
      {
        kind: 'stone',
        x: 70.7,
        y: 42,
        label: 'Leave it empty and the words come from the next term.',
      },
      {
        kind: 'stone',
        x: 59.6,
        y: 78,
        label: 'Leave it empty and it shows until the Apply by date.',
      },
      { kind: 'ring', x: 28.1, y: 87, w: 43.7, h: 9 },
      {
        kind: 'stone',
        x: 70.7,
        y: 91,
        label: 'Puts it across every page, linking to Get started.',
      },
    ],
  },
  'new-term-tool': {
    src: '/guide-shots/new-term-tool.webp',
    alt: 'The New term tool: a checklist in groups, The term itself, The catalog and Tell people, each card marked To do, Check or Set, with a link to the place to change it.',
    width: 740,
    height: 850,
    marks: [
      { kind: 'ring', x: 3.5, y: 39.6, w: 45.4, h: 11.4 },
      {
        kind: 'stone',
        x: 49,
        y: 39,
        label: 'Start here: the term itself, its dates and its Apply by.',
      },
      {
        kind: 'stone',
        x: 21,
        y: 31.8,
        label: 'Check again reads the website afresh after you publish.',
      },
      {
        kind: 'stone',
        x: 29,
        y: 82.5,
        label: 'Each card opens the right place to make the change.',
      },
    ],
  },
};
