---
paths:
  - 'src/components/**'
  - 'src/layouts/**'
  - 'src/styles/**'
  - 'src/pages/**'
  - 'public/**'
  - 'tests/**'
---

# UI work: verification and two component gotchas

Numbering is stable: gotchas #9 and #21 from the original CLAUDE.md.

<!-- prettier-ignore-start -->
9. **`overflow-x: clip` on `html` + `body`** (in `globals.css`, `@layer base`) is the mobile horizontal-scroll guard: the scroll-reveal `.reveal-l`/`.reveal-r` `translate` would otherwise shift not-yet-revealed elements off-screen and let every page wobble sideways on phones. Don't remove it or swap it to `overflow: hidden` (which breaks the sticky course-detail aside and Lenis's smooth scroll).
21. **`src/components/ui/accordion.tsx` is customized** (removed the `h-(--radix-accordion-content-height)` lock, dropped `text-sm font-medium` from the trigger). Reinstalling via `npx shadcn add` reverts it; reapply the changes.
<!-- prettier-ignore-end -->

## Visual verification workflow

Every UI change is verified before being reported done. The automated suites (see `docs/TESTING.md`) are the regression net; the screenshot loop below is for judging the change itself.

For any change touching components, layouts, styles, or copy that affects layout:

1. **Both themes.** Light AND dark. Light is primary, but dark must read as the brand, not as broken.
2. **Both viewports.** Mobile (~375px) and desktop (~1280px). Most visitors arrive on mobile.
3. **Interactive states.** Hover, focus (keyboard Tab), active. Mouse AND keyboard.
4. **Adjacent regressions.** Look at the sections immediately before and after the change.

Use the Playwright MCP for the screenshot-and-compare loop against `npm run dev`. Don't ship a change you haven't seen rendered. For accessibility-affecting changes, the automated axe + Lighthouse gates are the floor, not the ceiling: targets stay 100/100/100/100 desktop.

For Sanity Studio changes (schema or structure), run `npm run studio:dev` and check the editor experience as a content editor would see it. Broken Studio = broken editor workflow.

Even "tiny" changes (a color tweak, a spacing nudge, a copy edit) go through the same loop. The smallest changes are where regressions hide.
