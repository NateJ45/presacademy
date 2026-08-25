import type { APIRequestContext, Page } from '@playwright/test';

// =============================================================================
// settle() — put a page in a stable, fully-rendered state before we measure or
// audit it. Without this, tests are flaky for two real reasons:
//
//   1. Web fonts (Fraunces / Source Sans 3) load async; text measured before
//      they arrive uses fallback metrics and can be a couple px wider — a
//      false reflow fail.
//   2. Entrance choreography hides content until it scrolls into view: the
//      [data-reveal] / [data-stagger-grid] observers (BaseLayout) start
//      elements at opacity 0, the hero runs a .hero-entry-stagger /
//      .kinetic-words load animation, and .img-curtain panels cover images.
//      axe run mid-animation sees semi-transparent text (false contrast
//      violations) — and worse, axe SKIPS opacity-0 elements entirely, so
//      below-the-fold content would never be audited at all.
//
// So: wait for fonts, then force the whole motion system to its end state.
// The injected CSS mirrors the site's own prefers-reduced-motion block in
// globals.css — that block is the definitive list of "what the resting page
// looks like with no motion", so keep the two in sync.
// =============================================================================
export async function settle(page: Page): Promise<void> {
  // Race the font wait: WebKit can leave fonts.ready pending while heavy
  // resources are still streaming.
  await page.evaluate(() =>
    Promise.race([
      document.fonts.ready.then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(true), 5000)),
    ]),
  );
  await page.addStyleTag({
    content: `
      *, *::before, *::after { transition: none !important; }
      /* Scroll-reveal + grid stagger: end state, everywhere (also neutralizes
         the .reveal-l / .reveal-r horizontal offsets). */
      [data-reveal] { opacity: 1 !important; translate: 0 0 !important; }
      [data-reveal] .reveal-rise { clip-path: none !important; transform: none !important; }
      .eyebrow::before { transform: scaleX(1) !important; }
      [data-stagger-grid] > * { opacity: 1 !important; translate: 0 0 !important; }
      /* Hero load choreography: the keyframes carry the visible end state
         (fill-mode forwards), so killing the animation alone would FREEZE the
         hidden start state — force the end values too. */
      .hero-entry-stagger > * { opacity: 1 !important; animation: none !important; transform: none !important; }
      .kinetic-words .w > span { transform: none !important; animation: none !important; }
      /* Image curtain covers the image until revealed; skip it entirely. */
      .img-curtain { display: none !important; }
      .step-connector::after { transform: scaleY(1) !important; }
      /* Continuous loops (ticker, Ken Burns, parallax): stop them so nothing
         moves between measurement and assertion. */
      .marquee__track, .hero-slide, .hero-kb-img, .parallax-slow { animation: none !important; }
    `,
  });
  // Also flip the observer-driven classes so the IntersectionObservers stop
  // having anything left to do (and any state that keys off the classes,
  // not just the CSS above, lands in its final form).
  await page.evaluate(() => {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
    document
      .querySelectorAll('[data-stagger-grid]')
      .forEach((el) => el.classList.add('is-staggered'));
    document.querySelectorAll('.img-curtain').forEach((el) => el.classList.add('is-revealed'));
    document.querySelectorAll('.step-connector').forEach((el) => el.classList.add('is-visible'));
  });
}

// =============================================================================
// discoverDetailRoutes() — find real dynamic detail pages in the built site.
// =============================================================================
// The fixed list in routes.ts excludes [slug] routes because a build without
// Sanity content has none. The LOCAL build (real .env credentials) does have
// them, so smoke uses this to pull up to one real course, faculty, and event
// detail page out of the sitemap the build emitted. Reads the sitemap over
// HTTP from the running static server (not from disk) because Playwright
// collects test files BEFORE the webServer finishes building — dist/ may not
// exist yet at collection time.
//
// Returns [] whenever the sitemap is missing or has no detail pages (the CI
// empty-env build), so callers can skip gracefully.
export async function discoverDetailRoutes(request: APIRequestContext): Promise<string[]> {
  const found: string[] = [];
  try {
    const index = await request.get('/sitemap-index.xml');
    if (!index.ok()) return [];
    // The index nests one or more sitemap-N.xml parts; walk them all.
    const parts = [...(await index.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const urls: string[] = [];
    for (const part of parts) {
      const path = new URL(part).pathname;
      const resp = await request.get(path);
      if (!resp.ok()) continue;
      for (const m of (await resp.text()).matchAll(/<loc>([^<]+)<\/loc>/g)) {
        urls.push(new URL(m[1]).pathname);
      }
    }
    // Up to one representative per dynamic template.
    for (const section of ['courses', 'faculty', 'events']) {
      const detail = urls.find((u) => new RegExp(`^/${section}/[^/]+/?$`).test(u));
      if (detail) found.push(detail);
    }
  } catch {
    // No sitemap, unparsable sitemap — same answer: nothing to add.
    return [];
  }
  return found;
}
