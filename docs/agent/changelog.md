# Change history

> Running change log, moved out of CLAUDE.md so it does not load on every task.
> Each client project starts its own history from the extraction entry below.

_2026-10-04: GA4 switched on the same day: Nathan created the property (557366198, `G-1S5Z7MGZ9J`), `PUBLIC_GA_ID` was set on the Workers build, and the privacy fallback wording for the GA case was replaced with the sentence Nathan approved (no advertising claim, no opt-out link). Search Console domain property verified by DNS TXT._

_2026-10-04: Ported the GA4 wiring (starter PORTS.md cards 54 and 58). Four PORTABLE files, byte-identical to the starter: `src/components/Analytics.astro`, `src/components/analytics/GoogleAnalytics.astro`, `src/components/analytics/CloudflareBeacon.astro`, `src/lib/analytics-config.ts`. `BaseLayout` now renders `<Analytics />` instead of its inline Cloudflare beacon (same `PUBLIC_CF_ANALYTICS_TOKEN`, same output, now trimmed). GA4 is wired but INACTIVE: no Measurement ID exists, and `PUBLIC_GA_ID` is empty so nothing renders. Set it as a BUILD variable in Cloudflare Workers Builds to switch it on. The tag fires only on the production hostname. `public/_headers` CSP gained the Google Analytics origins (script-src and connect-src), without which the tag would be blocked silently. The built-in privacy fallback in `LegalBodyBlock.astro` now derives its analytics wording from `hasGa`; the stored Sanity privacy body is unchanged and must be edited in Studio before the ID is set. No workflow change (builds happen in Workers Builds, and CI keeps the variable unset on purpose).

_2026-10-04: Updated `scripts/measure-tap-targets.mjs` (PORTABLE, starter PORTS.md card 83). The scan now skips content inside closed `<details>` elements except their `<summary>`, reducing false positives when a page hides a large block of tap targets behind a disclosure. Use `--include-closed-details` to count every target including those inside closed details.

_2026-10-04: Follow-up to the 44px pass: the breadcrumb links on course, event and faculty detail pages (Courses, Events, Faculty) get `.hit-44`. They only exist on the live content, so the first live scan found them (3 pages at 1 under 44px, then 0).

_2026-10-04: 44px touch targets everywhere at phone width (starter PORTS.md cards 82 and 83). Added `scripts/measure-tap-targets.mjs` (PORTABLE, byte-identical to the starter) and three classes in `globals.css`: `.hit-44` (invisible 44px hit area via `::after`, for standalone links and buttons: utility bar, logo, theme toggle, contact links, arrow links, filter chips, the course teacher links), `.tap-44` (a real 44px box for stacked lists; the label sits in a child `.link-underline` span so the underline hugs the text) and `.check-44` (44px checkbox input, 20px drawn box). Footer rows, CTA pills, social icons and the FAQ summaries got real 44px boxes; summaries use `-my-2 py-2` so accordion rows do not grow. Scan at 390px over the 14 prebuilt routes plus the 404: 62 to 107 targets under 44px per route before, 0 after, 0 stolen taps; the footer is about 70px taller on phones. Live content (courses, faculty, forms, filters) only exists on the deployed site, so it was checked there after the merge. Process note: `.link-underline` also draws on `::after`, so never put `.hit-44` on a `.link-underline` element.

_2026-10-03: Removed `public/llms-full.txt`. The live file was the starter's interior-design placeholder text (`# Studio Starter`, example.com links), and the site content is still seed data, so a regenerated file would be just as untrue. `llms.txt` (a link map of page names) stays. To be generated at launch, when the content is real; see `docs/agent/seo.md`._

_2026-10-03: Re-synced `scripts/generate-llms-full.mjs` and added `scripts/lib/site-identity.mjs` (starter PORTS.md card 81, byte-identical to the starter). The live `llms-full.txt` opened with `# Studio Starter` and had six `example.com` lines because the script fell back to placeholders when `SITE_NAME` / `PUBLIC_SITE_URL` were not in the environment; it now reads `brand/brand.config.json` (new here: `name` The Presbyterian Academy, `domain` presbyterianacademy.org, from `src/data/site.ts`) before falling back. `site-identity.test.mjs` not carried (no `test:scripts`). `public/llms-full.txt` is regenerated separately with the Sanity read token. `sync-check` 60 same, 1 drifted before; 62 same, 0 drifted after._

_2026-10-03: Re-synced `scripts/sync-check.mjs` with starter PORTS.md card 80 (byte-identical to starter PR #75): the walker now skips `_worktrees/` folders as well as `.claude/worktrees`, so a local `sync-check` in a checkout with live worktrees no longer counts every worktree copy as MISSING-IN-STARTER (here the main checkout read 120 marked files, 61 missing, before; it reads 61 after). No change to CI, which starts from a fresh checkout. `sync-check` 61 same, 0 drifted._

_2026-10-03: Re-synced the five marked files behind starter PORTS.md cards 77, 78 and 79 (all byte-identical to starter PR #70): `src/lib/preview-morph.ts` and `.test.ts` (card 77: the live-preview morph keeps the client-state classes `is-visible`, `is-drawn`, `is-revealed` and `is-staggered`, so a draft edit no longer re-hides revealed content), `src/lib/preview-stega.ts` (card 78: `RUN_SOURCE` is now exported), and `src/lib/redirects.ts` and `.test.ts` (card 79: redirect destinations keep their `?query` and `#fragment`, and the self-redirect guard compares paths). No site-side change: nothing here imports `RUN_SOURCE`, and the Studio `redirect` schema already accepts a `to` with a query or fragment. `npm run test:unit` 517 of 517 pass; `sync-check` 61 same, 0 drifted._

_2026-10-03 — CI: weighted Playwright shards. The equal-count `--shard` split put the cheap chromium tests alone in shard 2 (test steps 44s / 7s / 42s and 46s / 11s / 50s on the first two sharded runs on `main`). `PWTEST_SHARD_WEIGHTS: '37:67:35'` (internal Playwright variable) resizes the blocks, all 139 tests still run once; weights derived from a local `--reporter=json` run, recipe in `docs/agent/ci-cd-and-ops.md`. Ported from the fbcm experiment. The link-check move (separate `links` job) was measured and NOT ported: the link check takes 1s here._

_2026-10-03: Adopted starter PORTS.md card 71. Added the PORTABLE `.claude/settings.json` (deny rules: `git reset --hard`, force pushes) and `docs/claude/family-conventions.md`, byte-identical to the starter. CLAUDE.md now imports the shared file with `@docs/claude/family-conventions.md` instead of carrying its own copies of "Code conventions" and "Working with Claude" (126 to 117 lines); no repo-specific text was lost. `portable-files.md` lists both files._

_2026-10-03 — CI: parallel and built once (PORTS.md card 70 in `ncs-astro-sanity-starter`). `ci.yml` is now `static` + `site` in parallel, 3 sharded `e2e` jobs that reuse the uploaded `dist/client` (`PLAYWRIGHT_SKIP_BUILD=1`, a one-line webServer change in `playwright.config.ts` and `playwright.visual.config.ts`), and aggregator jobs named `build` and `test` (the required checks). Playwright browsers are cached by version. `lighthouse.yml` is path-filtered, runs a one-URL-per-template sample on PRs, and the full 15-URL list on main pushes, weekly cron and dispatch; `lighthouserc.json` untouched._

_2026-10-03: Closed four vault "Ported to" gaps. (1) `.claude/rules/build-and-deps.md` #22: never delete or regenerate `package-lock.json`, `npm ci` for any run you reason from. (2) `globals.css` base `h1`-`h6` now `color: inherit` (was `var(--color-accent)`, the pale hover token); verified by computed colour on 15 routes in light and dark and full-page screenshots of home, about and courses, which are pixel-identical; the only computed-colour changes are the two `sr-only` list headings. (3) `globals.css` `@source not` for `scripts/.parity`, `docs`, `*.md` (shipped `BaseLayout.*.css` 110,641 to 107,344 bytes, 67 dead declarations, none used under `src/`), baselines recaptured. (4) `FormRenderer.tsx` `<select>` uses `selectCls` (no focus utilities) so the global `:focus-visible` outline paints in WebKit._

_2026-09-30 — Fix: the reduced-motion reset in `globals.css` now sets
`transition-duration: 0s` and `transition-delay: 0s` (was `0.01ms`). `0.01ms`
gives every element a transition (`transition-property` defaults to `all`) and
WebKit never finishes it, leaving stuck transitions holding old values. Added
the PORTABLE `tests/reduced-motion.spec.ts` (no animation still running 2.5s
after load, every route) and put it on the `webkit-iphone` project in
`playwright.config.ts`. Nothing here listens for `transitionend`. Ported from
starter PORTS.md card 61. `@playwright/test` bumped ^1.62.1 to ^1.63.0 in the
same change: the spec's `test.use({ reducedMotion })` only type-checks on 1.63+._

_2026-09-29 — Fix: `npm run dev` no longer crashes on Windows. `@sanity/astro`'s
dev-only `sanity:module-dedupe` alias pointed `sanity` at its package.json file
(`[MISSING_EXPORT] ... is not exported by "node_modules/sanity/package.json"`).
Ported the canonical `src/lib/sanity-dedupe-alias.ts` + `.test.ts` from the
starter (PORTS.md card 60) and added `fixSanityDedupeAlias()` to `vite.plugins`
in `astro.config.mjs`. `astro build` output is byte-identical (dev-only plugin)._

_2026-09-23 — Fix: `src/lib/sanity.ts`'s build client now always reads through
the Sanity API CDN (`useCdn: true`), ported from fbcm commit 897cec9 / starter
PORTS.md card 55. It used to be `useCdn: !readToken`, on the belief that the
CDN rejects a token; the API CDN has accepted authenticated requests since API
version 2021-03-25. With `SANITY_API_READ_TOKEN` set in `.env`, every local
build was reading the uncached API instead of the CDN, and a full build is
several hundred queries, so a day of agent-heavy local builds (rebuilds,
Playwright webServer builds) could burn a monthly quota fast, while CI (no
token locally) stayed on the CDN the whole time. Also: `sanityFetch`'s catch
block now throws instead of silently returning the fallback when
`import.meta.env.PROD` is true, so a production build fails loudly on a
Sanity outage or quota block rather than shipping placeholder/empty content;
the dev warn-and-fallback path and the no-project-configured early return are
unchanged. The separate draft/preview client in `src/lib/cms-preview.ts`
(`useCdn: false`, drafts perspective) is intentional and was left alone._

_2026-06-15 (later) — Fix: hCaptcha was blocked by the site CSP on the live build,
so the widget never appeared even though the form asked for it. The
Content-Security-Policy in `public/_headers` allowed YouTube/Vimeo/Maps for
frame-src and only Cloudflare for script-src, so hCaptcha's `api.js` and challenge
iframe (newassets.hcaptcha.com) were silently blocked. Added
`https://hcaptcha.com https://*.hcaptcha.com` to script-src, frame-src, connect-src,
and style-src. This gap predated hCaptcha (Turnstile would have been blocked the
same way). Root cause of the miss: the earlier theme verification used a plain
static file server, which sends no CSP; re-verified here by serving the build under
the EXACT production CSP (a throwaway node server) and confirming the widget renders
with no CSP violations. Added a maintainer note to `_headers` to check captchas
against `wrangler dev` / live, not a static server._

*2026-06-15 (later) — hCaptcha now matches and follows the site theme.
`FormRenderer.tsx` switched from auto-render to explicit render (`render=explicit`

- an `onHcaptchaLoad` ready flag): a MutationObserver watches the `dark` class on

<html> and re-renders the widget with `theme: 'light' | 'dark'` whenever the
visitor toggles, since hCaptcha only reads its theme at render time. The submit
gate now reads the token via `hcaptcha.getResponse(widgetId)` and only blocks when
the widget actually rendered (graceful if the script fails to load: the honeypot
still runs and Web3Forms rejects a tokenless post server-side). Verified on the
production build in both themes with Playwright (light page -> light widget;
toggling to dark live re-renders the iframe with `theme=dark`). Also removed the
now-dead `PUBLIC_TURNSTILE_SITEKEY` / `CLOUDFLARE_TURNSTILE_SECRET_KEY` lines from
local `.env`.*

_2026-06-15 (later) — Swapped form spam protection from Cloudflare Turnstile to
hCaptcha, because Web3Forms gates Turnstile behind a paid plan but verifies
hCaptcha for free. `FormRenderer.tsx` now loads the hCaptcha script
(`js.hcaptcha.com/1/api.js`), renders the `h-captcha` widget with Web3Forms'
shared sitekey (`50b2fe65-b00b-4b9e-ad62-3ba471098be2`, overridable via
`PUBLIC_HCAPTCHA_SITEKEY`), reads the `h-captcha-response` textarea token, and
sends it to Web3Forms; the gate is scoped to the Web3Forms submit path so
mailto / Formspree fallbacks skip it. Zero-config: no hCaptcha account, no secret
stored by us, and no Cloudflare build var needed (Web3Forms verifies the token
with its own secret). The one manual step is switching the form's spam protection
to hCaptcha in the Web3Forms dashboard so the token is enforced. The now-dead
`PUBLIC_TURNSTILE_SITEKEY` / `CLOUDFLARE_TURNSTILE_SECRET_KEY` vars can be removed
from `.env` + the Cloudflare build env. Supersedes the Turnstile note in the entry
below. Docs updated (ci-cd-and-ops.md, CLAUDE.md topic index)._

_2026-06-15 (later) — Web3Forms wired into the live forms (`scripts/seed-forms.mjs`,
idempotent). The Express-interest form (on /get-started) had `provider.service =
web3forms` but no access key, so it was silently falling back to a mailto; set its
`provider.accessKey` so it now posts to Web3Forms. Added a simple Contact form
(name / email / message, `form.contact`) with the same key and linked it to
`contactPage.contactForm`, so /contact now renders a real form instead of the
"Email the Office" mailto pill. Both deliver to the one Web3Forms inbox tied to the
key (a PUBLIC form id, so it lives in the Sanity form doc). Turnstile still gates
both when `PUBLIC_TURNSTILE_SITEKEY` is set._

_2026-06-15 (later) — OG / social-card restyle to match the header logo.
`scripts/lib/render-og.mjs` now renders the wordmark in the site's two-line logo
style: ink "The" + green "Presbyterian" (the keyword-emphasis device) with a
smaller, muted "Academy" tucked beneath, instead of one flat near-black line. The
whole group (wordmark + brass rule + tagline) is vertically centered so cards with
1 to 3 tagline lines stay balanced. The flat `wordmark` string is parsed into the
header's lead/keyword/sub structure (mirrors Header.astro), so both OG generators
pick it up. Also de-churched the DEFAULT card's tagline in
`scripts/generate-og-default.mjs` ("Equipping tomorrow's church" ->
"Reformed theological formation for everyday leaders"). All 13 OG PNGs
regenerated and visually verified._

*2026-06-15 — Page-builder blocks overhaul + editability seeding remediation
(commits c800211, 2fe3ce2, 296750f).

**Page builder:** stripped the retired Romanesque arch from the block library.
Removed the `arched` toggle from Image+text and Feature cards (images are now
always soft-rounded), renamed `sectionArchShowcase` -> `sectionMediaShowcase`
(zero dataset usage made the type rename data-safe) and its components
(`ArchMedia` -> `ShowcaseMedia`, `ArchShowcaseBlock` -> `MediaShowcaseBlock`),
and swapped the `arch-top` frame for `rounded-lg`. De-churched the editor-facing
copy (Stats/CTA-band/Image+text/FAQ-list examples, and the "Chapel green/deep"
background tones -> "Forest green/deep"). Added four school blocks:
**Resources/downloads** (`sectionResources`, with a file-asset deref in the
SECTION_MEMBERS GROQ fragment), **Key dates / deadlines** (`sectionKeyDates`),
**Tuition tiers** (`sectionPricingTiers`, reusing a new shared
`PricingTierCards.astro` extracted from pricing.astro), and **Testimonials** as a
Dynamic-list source (quote-shaped card).

**Editability seeding:** the schemas were mostly complete but the live dataset
was under-seeded — many pages rendered code fallbacks while Studio looked blank,
and five live routes had no document at all. Added the last fields
(pricingPage.stats, coursesPage.detail{TrustLine,ExpressLabel,RequestLabel},
resourcesPage.emptyStateBody), aligned the FAQ categories to the school set,
fixed the /contact blank-phone `tel:` bug, and reworded the church-era /privacy
fallback. Then `scripts/seed-editability.mjs` (render-neutral, only-empty +
createIfNotExists, dry-run by default) patched 40 empty fields across the 10
existing singletons (closing-CTA bands, the new fields, nav/footer menus +
designer credit) and created 24 docs: the 5 missing singletons (contact, events,
404, privacy, accessibility — the legal bodies seeded as Portable Text sized via
the `h3` style to match the static fallback), 5 faqCategory, 11 faqItem, 3
recurring event docs. Dataset went 39 -> 63 published docs; /faq and /events now
render from real editable content (the FAQ JSON-LD stops shipping invented prices
baked into page code). NOT seeded: phone + socials (need real values). A same-day follow-on seeded the
SEO text fields (`seoTitle`/`seoDescription`) on the 11 page singletons + 8
courses (render-neutral, mirroring each page's `.astro` fallback; `seoImage` left
as the intentional optional since per-page OG images are generated at build
time), unset the legacy `heroImage` orphan on the two re-schema'd pages,
`homePage` and `aboutPage` (both tripped a Studio "unknown field" warning -- those
pages no longer define the field, so seed-academic-images.mjs had left a stale
value; the other singletons keep their valid `heroImage`), and fixed
`generate-og-pages.mjs`
to use the clean `heroHeadline` for the OG-card tagline instead of the
brand-suffixed `seoTitle` (no more doubled wordmark; the home + about cards
refreshed). Verified render-neutral against the built HTML (privacy PT headings, FAQ 5-category
grouping, events cards, pricing extraction) and the green production build (incl.
3 new /events/[slug] detail pages from the recurring events). Note: a pre-
existing dev-only React SSR "Invalid hook call" issue (two React copies in Vite's
deps_ssr) hangs the preview screenshot tool; the build is unaffected.*

_2026-06-14 — Home hero pixelation fix (commit 1d942b7). The slideshow looked
pixelated because (a) three of the six placeholder images were only ~960px
(rawpixel/stocksnap cap their hotlink downloads) and (b) `HeroSlideshow.astro`
requested landscape-width variants that object-cover then upscaled ~1.85x to fill
the tall 4:5 portrait crop. Two fixes: re-sourced the hero from high-res CC0 only
(2000-5327px, Wikimedia full-res), and made `HeroSlideshow` request 4:5-CROPPED
variants (`height = width * 1.25`) so Sanity serves tall portrait images rather
than short landscapes (upscale dropped to 1.06x); also bumped width 1200->1400,
quality 65->72, the declared desktop size 520->600px. Several otherwise-high-res
CC0 people shots were rejected for incongruous content (a Wikipedia globe logo,
Japanese festival banners, a clinical PT lab) — high-res CC0 has no warm
"happy faces" academic stock, so the hero is campus + study + places (a warmer set
needs a Pexels/Unsplash key or real photography). `seed-academic-images.mjs` gained
a `--force-hero` flag to overwrite an already-populated hero. **Lesson:** hero
images need high-res sources because the 4:5 portrait crop magnifies any shortfall.
Turnstile aside: the sitekey env var must be `PUBLIC_TURNSTILE_SITEKEY` — the
`PUBLIC_` prefix is what exposes it to the browser, so a `CLOUDFLARE_*`-named var
stays server-side and the widget never renders._

*2026-06-14 — CI/CD + operational hardening to pair with the staging workflow
(full reference: docs/agent/ci-cd-and-ops.md). All committed and ready; the pieces
that need an external account stay inert (warn + skip) until their secret/variable
is added.

- **CI gates** (`.github/workflows/ci.yml`): added a Sanity-types FRESHNESS check
  (fails if `npm run typegen` would change the committed `sanity.types.ts`, the
  bug that shipped earlier today), `npm run lint`, and a Lighthouse-CI job
  (`lighthouserc.json`, desktop budgets; a11y/SEO/best-practices hard, performance
  a warning; `continue-on-error` until consistently green). Now also runs on pushes
  to `staging`.
- **Staging preview** (`deploy-staging.yml`): pushes to `staging` deploy a separate
  `presacademy-staging` Worker, leaving production untouched (needs
  `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`).
- **Nightly Sanity backup** (`sanity-backup.yml`): `sanity dataset export` to an
  artifact (needs `SANITY_AUTH_TOKEN`); restore runbook in the ops doc.
- **Uptime check** (`uptime.yml`): hourly 200-check of the key pages (needs the
  `SITE_URL` variable).
- **Form spam protection**: `FormRenderer.tsx` renders + enforces a Cloudflare
  Turnstile token, gated behind `PUBLIC_TURNSTILE_SITEKEY` (inert with no key, so no
  regression; the honeypot still runs).
- **PR template** (`.github/pull_request_template.md`) codifies the definition of
  done (CI green, types regenerated + studio:deploy on schema changes, both
  themes/viewports, Lighthouse held, docs updated, no em-dashes/AI-tells).
  Deliberately skipped for now as overkill at this scale: Sentry, Renovate/Dependabot,
  a full alerting stack.*

*2026-06-14 — Accessibility page, AA contrast fix, Ken Burns hero slideshow, and
an academic-photo placeholder sweep (commits c803da6 -> 491215e, merged to main).
Adopted a **staging-first git workflow**: work lands on `staging`, gets verified
in-browser, then fast-forwards to `main` (which triggers the production rebuild).

- **Accessibility statement page** (`/accessibility`, commits 54f565d + 736b3f2).
  A faculty-editable `accessibilityPage` Sanity singleton mirroring `privacyPage`
  (hero, SEO, Portable Text body, last-reviewed date, page-builder sections), every
  field optional so a complete, on-brand STATIC fallback statement ships until the
  doc is created. The barrier-report contact resolves through `siteSettings`
  (email/phone + a /contact link). Wired end to end: schema + registration, desk
  singleton (Pages -> Accessibility Page), `pathForDoc` + singleton enforcement,
  `getAccessibilityPage`, footer colophon link beside Privacy. Copy targets WCAG
  2.1 AA, plain voice, no em-dashes. `src/lib/sanity.types.ts` was regenerated by
  hand (the build does NOT run typegen). Requires `npm run studio:deploy`.
- **AA contrast fix** (commit c803da6). The home topics-ticker text was
  `text-foreground/55` on `bg-card` (~3:1, fails); bumped to `/70` (8.52:1). Same
  bump on the copy-email icon button. The 10 Lighthouse manual-check items were
  verified against the accessibility tree + a mobile-nav focus test (landmarks,
  one h1 + clean order, accessible names, decorative ticker aria-hidden, DOM ==
  visual order, trapped/closeable mobile dialog).
- **Ken Burns hero slideshow** (commit 9eabd7e). New `HeroSlideshow.astro` renders
  the existing `homePage.heroImages` ARRAY as a CSS-only cross-fade with a slow
  zoom that pans from a different focal point per slide. The multi-stop keyframe +
  per-slide timing are generated from the image count, the first slide is
  eager/high-priority (LCP) and the rest lazy, and the whole effect sits behind
  `prefers-reduced-motion` (reduced motion -> a still first frame). The home hero
  previously rendered only `heroImages[0]`; it now renders the whole array
  (0 -> empty well, 1 -> static, 2+ -> slideshow). See `docs/agent/animation.md`.
- **Academic-photo placeholder sweep** (commits 9eabd7e + 491215e). The dataset's
  covers + page heroes were still the pre-rebrand CHURCH placeholders (`teach-*`,
  `study-*`, `community-*`). New `scripts/seed-academic-images.mjs` sets the
  6-image home hero slideshow and REPLACES every empty-or-church-era course cover
  (8) and page hero (8) with academic CC0 / public-domain photos (people learning,
  campus, library, study). 13 curated images bundled into
  `src/assets/placeholders/acad-*.jpg`; faculty headshots (pravatar) left as-is.
  The script protects real editor images and already-seeded `acad-*` (idempotent).
  Sourced via Openverse (rawpixel/Wikimedia/StockSnap), all public-domain so no
  attribution. NOTE: CC0 is thin on smiling-students / teacher-at-work stock (that
  lives on Pexels/Unsplash, key-gated); supply an API key or real photography for
  warmer faces. Placeholders for real Academy photography.*

*2026-06-14 — Mobile audit + horizontal-scroll fix + footer/CTA tidy (commit
54d6f2f). Four fixes, all verified in-browser (no sideways scroll, vertical
scroll intact, images sized well):

- **Mobile image audit.** The large single images that went full-width and huge
  when their two-column sections collapse to one column on mobile are now
  constrained. HOME split-hero image: `aspect-[3/2] lg:aspect-[4/5]` (landscape
  on mobile, portrait from lg). FACULTY-DETAIL portrait: capped to
  `mx-auto w-full max-w-[240px] lg:max-w-none` (centered 240px on mobile, full in
  its 300px rail from lg). 404 photo: `aspect-[3/2] md:aspect-[5/6]`, and now
  text-first on mobile (the figure dropped `order-first`, so a lost visitor lands
  on the message + links). **CourseCard is now a compact row on mobile** — a
  square cover thumbnail beside the text (`grid grid-cols-[7rem_1fr] ... sm:block`,
  cover `aspect-square sm:aspect-[3/2]`, smaller `text-h5 sm:text-h4` title) so
  the catalog and the home course strips stay quick to scroll; the full
  cover-on-top card returns from `sm` up. (FacultyCard was already a compact
  96px-thumbnail card; event + resources cards are text-only.)
- **Site-wide horizontal-scroll fix.** The scroll-reveal classes use
  `translate: ±1.5rem` (`.reveal-l` / `.reveal-r`), which shifts not-yet-revealed
  elements off-screen and created an ~8-24px sideways scroll on mobile across
  EVERY page. Fixed with `overflow-x: clip` on `html` AND `body` (globals.css,
  `@layer base`). `clip` (NOT `hidden`) is deliberate: it preserves
  `position: sticky` (the course-detail aside) and does not break Lenis's
  vertical smooth scroll.
- **Footer.** Removed the "Set in Fraunces & Source Sans 3" typeface credit from
  the colophon (a printed-book touch that read as out of place). The colophon's
  bottom row is now just the copyright, Pricing / Privacy, and the designer credit.
- **FinalCta.** The centered eyebrow no longer uses the `.eyebrow` /
  `.eyebrow-inverse` classes (which draw a left-aligned LEADING rule via
  `::before`); it is now a plain centered label with just the single centered
  brass "close mark" rule below it (the leading rule doubled up with the centered
  one and looked off).*

_2026-06-14 — Theme default flipped to LIGHT for new visitors (commit eb1ce88).
A first-time visitor with no saved choice now gets light mode instead of
following the OS. The OS preference is honored ONLY when the visitor explicitly
picks "system" in the toggle; any explicit choice persists in localStorage. The
mobile browser-chrome color now tracks the APP theme: a single `theme-color` meta
that the anti-FOUC bootstrap in BaseLayout.astro rewrites on theme change,
replacing the previous pair of `prefers-color-scheme` media metas. Changed in
BaseLayout.astro + ThemeToggle.tsx._

_2026-06-14 — 404 rebranded to "Rule & Ledger" (commit eb1ce88). The custom 404
was reframed onto the current brand: a brass top rule + rectangular crop in place
of the retired Romanesque arch frame, a bookish headline ("This page isn't in the
index."), and school CTAs (Browse courses / Meet the faculty / Get in touch)._

*2026-06-14 — Content-editability pass: "Sanity is the single source of truth"
made true for the school pages (Phases 0-4). A 6-agent audit found the claim was
substantially FALSE after the lay-school rebuild: large parts of the school pages
were hardcoded literals and the docs still carried orphaned / mismatched
church-era schema fields. Full page-by-page map + fix plan in
docs/agent/content-editability-audit.md, which SUPERSEDES the "everything
editable" claim in editor-vs-hardcoded.md. What landed:

- **Editor-UX** (commit 7c046b3) — a per-document "View this page on the live
  site" help banner at the top of every Studio form (src/sanity/components/PageHelpBanner.tsx
  - StudioFormInput.tsx, composed with CharacterCountInput into the single
    form.components.input slot; deep-links via a dedicated LIVE_SITE_URL in
    sanity.config.ts; urlForDoc split into pathForDoc + base). Fixed
    documentBadges.tsx, whose SEO/photo type lists still named deleted church types
    (so the "Add SEO / Needs a photo" badges did nothing on course/facultyMember).
- **Home + About re-schema** (commits 91c1e4d, bf88d1d) — homePage.ts +
  aboutPage.ts rewritten to clean SCHOOL fields (wayfinding, stats, ticker,
  strip eyebrow/heading pairs, hero button labels, next-cohort label; mission /
  beliefs / teach / why / faculty-band). The ~30 church orphans were REMOVED
  (the docs held no data in them); pages read each field with the current literal
  as the inline fallback, so the live site is unchanged. Queries rewritten.
- **Detail data-loss** — course detail now renders the syllabus download +
  a Seats row + the price unit; faculty detail renders specializations /
  yearsTeaching / email; event detail honors the all-day toggle. Removed the dead
  specialService / liturgicalSeason GROQ selections.
- **Get Started + odds and ends** — fielded the "Request information" panel and
  facultyPage.emptyState; passed seoImage to BaseLayout on contact + faq (it was
  ignored); notFoundPage secondary CTA default fixed (/worship -> /courses); the
  Header bar now uses settings.tagline.
- **Seed** — scripts/seed-page-copy.mjs patches the current inline copy into any
  EMPTY home / about / get-started / faculty / siteSettings(funder) field, so
  Studio MIRRORS the live site (idempotent, only-empty; ran with --apply;
  studio:deploy run twice).
- **Intentionally left hardcoded (documented):** structural scaffolding labels
  (At a glance, Degrees, the catalog/faculty filter legends in the React islands)
  and brand constants (the "PA" monogram, the "PC(USA)" tag). Fielding these would
  bloat Studio with never-touched fields.*

_2026-06-14 — Founding-year scrub + Presbytery funder (commits f2b71fa, 82bb126).
The school was FOUNDED IN 2026: do NOT highlight the founding year or imply a long
history. Removed "Est. 1998", the home + pricing "Established / Learners formed /
Denominations served" stat bands, and the about-page "founded in 1998 / a thousand
learners / long view" block; replaced with honest new-school stats (100%
credentialed faculty, in-person cohorts, need-based scholarships, Westminster
grounding). The Presbytery of Cincinnati funds the school THIS YEAR: a
"Made possible by the Presbytery of Cincinnati" footer band driven by a new
editable siteSettings.funder field (made editable in 82bb126), plus an about-page
line._

_2026-06-14 — Header utility bar + colophon footer (commit de4723e). The header
utility bar now shows LIVE enrollment status: the soonest upcoming term via
getNextTerm() ("Now enrolling · Fall 2026 begins September 8", with a pulsing
.enroll-dot), tap-to-call, and a Request-info link; it falls back to
settings.tagline when no term is scheduled, and shows a short form on mobile.
The footer was rebuilt as a printed-book COLOPHON: an oversized Fraunces wordmark
masthead + mission + two CTAs; an imprint row (where-we-meet / nav index /
follow-along, each under a brass eyebrow rule); and a colophon bar (a "PA"
monogram seal, locality + denomination, a typeface credit "Set in Fraunces &
Source Sans 3", legal links, and the designer credit), over a faint graph-paper
dot texture on the green band._

_2026-06-14 — Per-page OG images folded into the build chain (commit 7e8c8c5).
`npm run build` is now `node scripts/generate-og-pages.mjs && astro build`
(build:full chains `npm run build`), so per-page OG cards regenerate on every
build. generate-og-pages.mjs is fail-safe: on a Pango-less host it ships the
committed PNG instead of crashing the build._

*2026-06-14 — Lighthouse re-run after the kinetic motion pass (home page, on the
workers.dev preview). Performance ~100 (LCP 205ms, CLS 0.01 — the animation pass
did NOT regress performance), Accessibility 100, Best Practices 100. SEO showed
66 ON THE PREVIEW ONLY: Cloudflare auto-injects an X-Robots-Tag: noindex header
on every _.workers.dev URL, which fails Lighthouse's is-crawlable audit. The page
itself has no noindex meta and carries a valid description + canonical, so on the
production custom domain SEO is 100. Documented in performance.md so a future
SEO-66 on a preview is not mistaken for a regression._

_2026-06-14 — Placeholder images seeded into the dataset so the site renders
fully for styling while real photography is pending. New script
scripts/seed-placeholder-images.mjs (commit 8a644e5) uploads placeholders and
patches ONLY empty image fields (idempotent; never clobbers an editor's real
images). Course coverImages and page heroImages use the in-repo Pexels library
(src/assets/placeholders/teach-_, study-_, community-_); faculty photos come from
pravatar.cc. Run `node scripts/seed-placeholder-images.mjs` (dry run) /
`--apply`; the apply run patched 22 docs (8 course covers, 5 faculty portraits, 9
page heroes incl. home). The editor swaps in real photography later. Static
deploys show the placeholders only after a rebuild; the dev server shows them
immediately. Docs: images.md, sanity.md.*

_2026-06-14 — Animation / effects pass: a CSS-first "refined kinetic editorial"
motion system, shipped on PR #9 (commit 864d173). All transform / opacity /
clip-path only (zero CLS), and the whole system is neutralized by a dedicated
prefers-reduced-motion reset block at the end of the motion section in
globals.css. New globals.css idioms: the academic graph-paper / dotted-grid
texture + soft green hero glow (.hero-atmos / .surface-grid / .surface-dots,
theme-aware via a new --grid-rgb token); choreographed reveals extending
[data-reveal] (directional .reveal-l / .reveal-r, a headline clip-wipe
.reveal-rise, and the eyebrow rubric drawing itself in via .eyebrow::before scaleX
keyed to .is-visible); a per-word hero-headline rise (.kinetic-words,
transform-only so it stays LCP-safe); micro-interactions (.link-arrow arrow
nudge, .card-link green hover border, .img-tint-evergreen green duotone image
hover); a seamless edge-faded hover-pausing topics ticker (.marquee /
.marquee__group, two groups, -50% loop); and an @supports-guarded CSS
scroll-driven parallax on hero media (.parallax-slow, animation-timeline: view()).
BaseLayout's initPolish gained a stat count-up for
[data-countup-grid] / [data-countup] (easeOutCubic, snaps to the exact final
text; year-style stats opt out by carrying no data-countup) — guarded with a
per-element dataset.counted flag because initPolish runs on load AND
astro:page-load. SectionHeading's wrapper is now [data-reveal] so the reveal +
eyebrow-draw cascade to nearly every section; Course/Faculty cards gained the
green duotone hover; FinalCta reveals its content. The home page is the showcase
(kinetic hero, graph-paper atmosphere + image parallax, topics ticker, stat
count-up). Docs: design.md, animation.md, polish-layer.md, performance.md._

*2026-06-14 — Brand evolution (Direction A): "green-anchored bookish
minimalism," shipped on PR #9 (branch feat/brand-evolution-direction-a).
Prompted by stakeholder feedback that the "Oxblood & Stone" brand "feels too
old." A structured multi-agent debate (four research agents grounded in real
seminaries, divinity schools, prestige-academic, and modern Christian-formation
brands; three PRO/CON rounds; one judge) concluded EVOLVE, DON'T PIVOT: the
"old" read came from the sanctuary layer (the Romanesque arches, the paper
grain, the oxblood structural bands), not from the serif or the warmth, which
are credibility assets. Verdict and full method: docs/research/2026-06-14-brand-direction-debate.md.

What changed (src/styles/globals.css is the source of truth):

- Palette: page surface Stone Cream #F4EEE6 -> near-white warm paper #FAF8F4;
  cards #FCF9F4 -> white #FFFFFF; muted band #EDE5D9 -> warm grey #F1F0EB; ink
  Walnut #2A2521 -> soft near-black #1F1B18.
- Anchor: Geneva Oxblood #7A2A2C -> Geneva Green #33503F (buttons, links, nav
  underline, focus ring, keyword emphasis, wordmark accent; deeper anchor
  #2A4233). Dark mode primary lifts to #74A98A, link/keyword to #9CC6AC.
- De-churched structural bands: the `chapel` token (NAME kept for reversibility)
  flips from oxblood #5E2122/#4A1B1C to forest green #2A4233/#1F3227; cream text
  retained. Footer and closing CTA now read green.
- Oxblood demoted to a sparing secondary accent (new --color-oxblood); Aged
  Brass #A87C3E kept as the hairline accent (green + gold pairing).
- Signature moves: RETIRED the Romanesque arch (--arch-radius neutralized to a
  quiet modern rounding; .arch-top/.arch-top-sm now near-rectangular) and the 4%
  paper-grain body::before (opacity 0). ADDED the eyebrow rubric (.eyebrow /
  .eyebrow-inverse) — a short brand-green leading rule before every section/hero
  eyebrow (brass on dark/green/photo) — as the new unifying mark. Italic display
  quieted to true epigraphs; script accent stays OFF.
- Photography: church placeholders (place-church-_, place-sanctuary-_) swapped
  for lay-school images (teach-seminar-discussion, teach-class-discussion,
  study-bible-notebook, study-bibles-closeup) on contact/faq/privacy/404.
- Docs updated: design.md, theme-and-color.md, polish-layer.md, design-tokens.md,
  components.md, and a new research writeup. Maintainer caveat: the CSS token
  names `chapel` / `chapel-ink` now carry GREEN, not oxblood — kept for
  reversibility, may be renamed in a later pass.*

_2026-06-13 — Rebranded to The Presbyterian Academy, a PC(USA) Reformed
lay-formation school (presbyterianacademy.org). Identity stamped via
scripts/rebrand.mjs from bootstrap.config.json. New brand: the "Oxblood &
Stone" palette (Geneva Oxblood #7A2A2C, Walnut Ink #2A2521, Stone Cream
#F4EEE6, Aged Brass #A87C3E; deep-oxblood structural bands replacing the old
chapel green) and a Fraunces (display) + Source Sans 3 (body) type system,
replacing Instrument Serif + Newsreader. Plainspoken wordmark ("The
Presbyterian" / "Academy", final word in oxblood) and a PA-monogram favicon;
OG image and the Sanity Studio theme rebranded to match. Brand spec +
implementation plan in docs/superpowers/. Shipped via PR #2; Studio deployed to
presbyterian-academy.sanity.studio. Still pending before launch: content seed
(starter-content.ndjson still carries placeholder copy), real photography, and
a Lighthouse pass on the live site._

_2026-06-12 — ncs-church-starter extracted from the Second Presbyterian Church
of Chicago build. Everything that made that site good ships here: the full
page set, the Sanity content model (singletons + collections + page builder +
configurable forms), the worship-time single-sourcing, the sermons module with
per-service records, the events module, the design system (documented in
design.md) with its Lighthouse 100/100/100/100 baseline, the themed Studio
with its editor help center, and the agent tooling (.claude/commands,
scripts/sanity-audit.mjs, OPERATIONS runbook). New for the template: identity
placeholders throughout ("First Church of Springfield"), scripts/rebrand.mjs
(config-driven identity stamp), studio/starter-content.ndjson +
scripts/seed-starter-content.mjs (a pre-stamped starter dataset including
connect-card and prayer-request forms), site.ts-driven wordmark (no hardcoded
church name in components), docs/bootstrap/NEW-PROJECT.md + setup-checklist.md
(the spin-up runbook), and a blanked docs/brand/voice.md template. Client
secrets, Sanity project IDs, deploy hosts, and one-off content seed scripts
were removed. Reference-build photography remains in src/assets/ as
placeholder-only imagery: replace before any client launch._
