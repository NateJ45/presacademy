# Change history

_2026-10-30: CI reads Node from `.nvmrc` (starter card 209)._ Every `actions/setup-node` step asked for `node-version: 22` and took whatever 22.x the runner image had cached, and Astro 7.4.4 refuses anything below 22.23.4. A repo-root `.nvmrc` now pins 22.23.4, every workflow reads it with `node-version-file: .nvmrc`, and `engines.node` rises to match. `docs/agent/studio-kit.md` is resynced with the starter in the same change (card 210's Inbox section), so `sync-check` reads SAME.

_2026-10-28: the photo hero keeps the script accent word (starter card 203, no live page changes)._ `Hero.astro` passes the opener's script accent to `PhotoHeroAcademy`, which draws it in the script face, white over the same shade, under the same contrast unit test (it now reads every `.ph-accent` rule). No live page uses the photo style.

_2026-10-27: Re-founding on the starter, phase E (cleanup, no visible change)._ The unread `FaqAccordion.tsx` island was deleted; `Sections.astro` was already gone (phase A), and `SectionShell.astro` / `surfaces.ts` stay because the kept blocks read them. Hidden block types stay registered. `sync-check` reports 0 drift against the live starter, and the `scripts/.parity` baseline was re-captured from a current `main` build. `CLAUDE.md` gained rules 23 (no colour field on a block) and 24 (layout is a config axis).

_2026-10-27: Re-founding on the starter, phase D, card 188 (no live page changes)._ The one scale is a `:root` block in `globals.css`: text, leading, figures, corners, space, shadows, the button measure and the focus ring, each set to the value the Academy already drew (Tailwind's `text-xs` to `text-lg`, the base heading line height and the `.card-lift` shadow now read it). It replaces the stand-in block in `builder-blocks-academy.css`. The shape contract's tokens take Rule & Ledger's forms (square photo wells, quiet `--arch-radius` on a standalone picture, the hatched brass well for a photo-less tile and the slab). Stats and numbered lists use the new `figures-numeral` utility (lining, tabular). `hero: board` stays off. The fallback faces already named Liberation and Tinos/Arimo, so nothing to add. Every route compared at 375 and 1280, full page: identical apart from the hub fixture's photo-less tiles on `/style-guide/sections/`. Docs: `docs/agent/design-tokens.md`, "The one scale".

_2026-10-27: Re-founding on the starter, phase D, card 192 (the one visible change is a fade)._ The starter's flow layer is in as `layout.motion: "fade"`: below the first screen, each block fades up 8px over 200ms as it arrives, and the older reveals (the rise, the directional slides, the mask-rise, the self-drawing rubric, the image curtain) rest instead, so nothing plays twice. The first screen is never held; reduced motion and JavaScript off show everything at once. `flow.ts`, `flow.css`, `flow-split.ts` (+ test), `FlowMotion.astro` and `tests/flow-motion.spec.ts` are byte-identical starter copies; the motion tokens sit in a "Motion" `:root` block in `globals.css`; the motion wall is `/styleguide/motion/full/` and `/fade/` (noindex, out of the sitemap, `styleguide` reserved). Docs: `docs/agent/animation.md`, "The flow layer".

_2026-10-27: Re-founding on the starter, phase D, card 189 (no live page changes)._ "Photo behind the words" can be picked on any inner page that has a hero photo (Hero style in the page's Hero tab, `src/sanity/schemaTypes/heroStyle.ts`), with an optional short-facts card beside the words; Home keeps the Term Issue cover. The starter's `PhotoHero.astro`, `HeroVideo.astro`, `photo-hero.css`, `hero-video.ts`, `photo-hero.ts` and their tests are byte-identical copies; `PhotoHeroAcademy.astro` draws it in the Academy's forest green (`src/styles/photo-hero-academy.css`, contrast held at 4.5:1 or better by `photo-hero-academy.test.ts`) and writes its styles inline only where it is drawn (a Vite plugin, `src/lib/photo-hero-css.ts`, keeps the plain stylesheet off every other page). Fixture `/style-guide/photo-hero/`, `tests/photo-hero-academy.spec.ts`, editor steps in the Photos guide. No page picks it yet: every live route compared before and after, identical.

_2026-10-27: Re-founding on the starter, phase D, card 196 (no live page changes)._ The office facts are typed once in Site settings and read through the starter's resolver: new fields for the address, phone and email "confirmed" boxes, "How to find us", office hours by day, a line under them and dated office closures and term breaks (`src/lib/business-data.ts` maps Site settings onto the starter's shape; `business-hours.ts`, `business-facts.ts`, `place-line.ts` and their tests are byte-identical starter copies). The footer, the Contact page and the contact card show "To confirm" tags and, once rows exist, the week with "Open now"; until then they show the one-line office hours as before. New blocks Office hours and Map and directions (group "Office hours and location"), fixtures on `/style-guide/sections/`, pictures in the insert menu, `tests/business-facts.spec.ts`. JSON-LD: confirmed hours only, and a street, phone or email whose box is unticked is left out. Quick update: "Change the office hours for a day"; editor guide "Office hours, closures and the address". `scripts/studio-thumbs.mjs` reads `ALL_FLEXIBLE_SECTION_MEMBERS` again (phase C had renamed it). No office hours by day are filled in, so every live route compared before and after: identical. Docs: `docs/agent/business-facts.md`.

_2026-10-27: Re-founding on the starter, phase D, card 195 (no live page changes)._ The starter's client review layer is in and switched OFF: the notes pill (`ClientNotes.astro`, rendered by `BaseLayout`), the yellow `[Client: ...]` / `[Placeholder: ...]` / `[Photo: ...]` highlight and the "Photo needed" boxes (`ShotRequest.astro`, wired into the Image and text block). `src/lib/client-notes.ts`, `page-path.ts`, both components and `client-notes.css` are byte-identical starter copies; `src/data/client-notes.ts` (switch off, `CLIENT_NAME` "the Academy") and `src/data/shot-list.ts` (no shots) are the site's own. The site is live on its real domain, so the host guard would keep the layer quiet even with the switch on, and `client-notes.test.ts` fails if the switch is ever left on here. Every live route compared before and after: identical. Docs: `docs/agent/client-notes.md`.

_2026-10-27: Re-founding on the starter, phase C (no live page changes)._ Six Academy blocks the builder kit replaces (Accordion, Steps, Feature cards, Card grid, Media feature, Media showcase) left the "+ Add item" menu: they are out of every page's allowed list (`HIDDEN_FROM_INSERT`, `FLEXIBLE_SECTION_MEMBERS` in `blocks.ts`), the types stay registered. Counted in production (raw, drafts included) before: 0 of the seventeen shell-aware blocks, 0 non-default `background` or `accent`. The `background` panel (surface, accent, photo or video, spacing) is hidden on every block, and the in-canvas surface chips are no longer offered. Templates and saved sections that used the hidden blocks now use fold-out questions, steps on a path and cards with icons. Guides rewritten where they described backgrounds or the hidden blocks. Two saved sections seeded as drafts. All thirteen routes compared before and after: identical.

_2026-10-27: Re-founding on the starter, phase B (no live page changes)._ The starter's builder kit (cards 173 and 193): seventeen blocks in `src/sanity/schemaTypes/builderSections.ts`, drawn by `src/components/builder-blocks/`, dressed in Rule & Ledger by `src/styles/builder-blocks-academy.css` and styled only on pages that hold one (inline, once). Insert groups "Courses and terms", "Events and notices" and "Fold-outs and tabs"; templates Simple page, Questions page, Course info night and Term notice; saved sections "Enrollment closes soon" and "Info session, with the evening" (not seeded). `site.timeZone` is America/New_York. Card 178 rides along: an optional button left empty no longer blocks Publish and draws nothing (`ctaBlock.ts`, `CtaLink.astro` through the new `src/lib/cta-href.ts`). PORTABLE copies: `src/lib/ics.ts` (+ test), `src/styles/shapes.css`. Left out: hours, map, progress, newsletter, latest video, documents. Every live route compared before and after: identical.

_2026-10-27: Re-founding on the starter, phase A2 (visible on purpose)._ Named anchors and the accent budget are on in `SectionRenderer.astro`. Anchors: every id a block already draws stays; a section heading that had none gets one (`/about/#confessional-and-warm-about-it`, `/pricing/#no-one-is-turned-away-for-cost`), and those two sections are now labelled regions. No link in the repo, the site or the Sanity content pointed at a section id that changed (none changed). Budget: one filled pill per page body, and a body button that repeats the header's "Request information" is outlined (`src/lib/pill-variant.ts`); on the live content that is Home's rates box.

_2026-10-27: Re-founding on the starter, phase A (no visible change)._ `Sections.astro` is now `SectionRenderer.astro` and runs the starter's foundation layer before it draws: the cadence (`src/lib/sectionCadence.ts`, the Academy's blocks all self-contained), named anchors behind an `anchors` prop (off), and the layout slots (`brand/brand.config.json` `layout`, `src/data/layout.ts`, `layoutAttrs` on `<html>`, all at defaults). `section-anchors.ts`, `cta-budget.ts`, `site-layout.ts` and their tests are copied byte-identical from the starter; `sectionCadence.ts` and `section-looks.ts` are adapted copies. `src/lib/section-fields.test.ts` gains the starter's rule-9 gate with the Academy's frozen allowlist. Every built page is byte-identical to the build before (parity 13/13).

_2026-10-27: The Auburn port run (starter cards 186 to 198), the parts that fit the Academy._ Byte-identical copies: `scripts/sync-check.mjs` (186: finds the starter from an ancestor folder and refuses a silent self-check) with its skip-dirs test, the Studio kit doc, `studio-icons.ts`, `studio-messages.ts` and `MessagesTool.tsx` (194: a form builder "private" form reads like a prayer request, no name or words shown), `scripts/lib/regex-backslash.mjs` and its test (198), and `tests/page-weight.spec.ts` with `tests/fixtures.ts` (197; budgets in `tests/page-weight.config.json`). Card 187: the Sonner toast island is gone from every page (nothing called a toast) and `CopyEmailButton` is an Astro component with a live region. Card 191, adapted: `ActionBar.astro`, a phone bar with the next term's issue line and the header button ("Request information" today), shown once the page heading scrolls away and hidden over the footer and on the button's own page. With no term scheduled it is the button alone. The rest of the run (layout slots, the board, photo hero, flow motion, builder blocks, business facts, client notes, the main pages as builders) rests on starter foundations this site does not carry; see the PR for each card's reason.

_2026-10-26: Starter cards 170, 171, 174 to 176 and 179 files taken (no behaviour change)._ `src/pages/api/contact.ts`, `src/lib/form-recipients.ts` and its test, and migration `0004_form_recipients.sql` copied byte-identical. With no row in the `form_recipient_addresses` table the contact form sends to the same address as before; the Studio panel and schema are not part of this site yet. The Studio kit files from cards 170, 171, 175 and 176 (plus card 179's `src/lib/studio-stale-chunk.ts`, which the Studio page now imports) are copied byte-identical, with `kit/staffType.ts` registering the `studioStaff` bookkeeping type, hidden from the desk in `structure.ts`. The People tool is not mounted and `kit.config.ts` is unchanged, so the staff view works as before.

_2026-10-26: Playwright installs time out instead of hanging (starter card 70)._ Three docs-only PRs across the family sat 40 to 60 minutes in "Install Playwright system libraries" on 2026-10-26: the runner's Azure Ubuntu mirror fed a normal 30-second `install-deps` at 29 kB/s, and the workflows had no timeout, so a stuck apt could hold a required check for GitHub's 6-hour default. Each install attempt now runs under `timeout` (180s for `install-deps`, 360s for a full browser download), so a crawling first try is killed and the retry resumes the partial download; the step has `timeout-minutes` (8 and 15) and the Playwright job 30.

_2026-10-26: American spelling everywhere (starter cards 163 and 164)._ Nathan's call: every family site is American English. Starter cards 163 and 164 copied byte-identical (164 moves the shared Studio and site text to American spelling, including "check" for a checkbox and "Website inquiry" as the contact email subject, and makes `build-csp.mjs` fail when the CSP line passes 2,000 characters). This site's own strings had the same pass: text only, no field name, option value, key, slug or CSS class renamed. The live Sanity content was checked the same day and fixed where needed.

_2026-10-20: Starter card 150 adopted._ Quick update tiles keep their colour edge flush at the top. `kit/ui/css.ts` and `studio-kit.md` copied byte-identical from the starter.

_2026-10-20: Starter card 149 adopted (the parts this site has)._ The kit harness's Surfaces gallery and `studio-kit.md` are copied byte-identical. The harness imports the writing helper card, so its files (`src/sanity/ai/`, `src/lib/studio-ai.ts` and its test) are copied too, unwired: this site does not turn the writing helper on. The private-page password callout is not in this site. `docs/claude/communication-style.md` (the family wording rules, which the helper's test reads) is added too.

_2026-10-20: Starter card 148 adopted._ Quick update uses a wide pane: the tile grid, and a "How this goes" rail beside an open form from 860px; phones are unchanged. Marked kit files copied byte-identical from the starter.

_2026-10-20: Starter card 147 adopted._ The Checkup uses the whole pane (a count strip, the levels as columns). Marked kit files copied byte-identical from the starter.

_2026-10-20: Starter cards 144 to 146 adopted._ Home is a full-width dashboard with a status rail (145), and an empty Trash has a page of its own (144/146: `structure.ts` now uses `trashListItem`). Marked kit files copied byte-identical from the starter.

_2026-10-20: The Studio's connector is brass dot leaders._ The last neutral device in `brand.config.json` `studio.look` (`connector`) is now `dots` in the brass `#C9A46A`, like the leaders in a table of contents, so `npm run check:look` is quiet. The school's look is the cover marker, square stone, shelf strip, endpaper texture, italic lettering, `lay` motion and these leaders. Checked at 1280, 375 and 320; at 320 only Sanity's own cards run 12px wide, the kit does not.

_2026-10-20: Starter cards 141 to 143 adopted._ Quick update's yes/no is a drawn switch (141), date and datetime fields get the How-to chip (142), and the photo post can add to a room story's own list (143, unused here). Marked kit files copied byte-identical from the starter.

_2026-10-20: Starter cards 139 and 140 adopted._ Success toasts carry the Is-it-live stones, and `npm run check:look` warns when `studio.look` still has a neutral device (today: the connector). The marked kit files, `scripts/check-studio-look.mjs` and `docs/agent/studio-kit.md` are copied from the starter byte-identical.

_2026-10-20: Starter card 138 adopted (CI snapshot wrapper)._ `scripts/snapshot.mjs`, `scripts/live-watch.mjs`, the snapshot-aware Sanity client in `src/lib/sanity.ts` and the OG script, the build wrapper in `ci.yml` and `lighthouse.yml`, `live-watch.yml` (idle until `SITE_URL` is set), and `groq-js` as a dev dependency. No snapshot file is committed because CI already builds with no project id.

_2026-10-19: Studio tutorial clips._ Six phone and desk clips are recorded from sample data (`public/guide-videos/`, registered in `src/sanity/guides/videos.ts`) and named by their guides, the `offering-status` picture is captured, and the sample-data module now loads on any dev port. Recording steps: `docs/agent/studio-videos.md`.

_2026-10-19: Live-page redirect guard adopted (starter PORTS.md card 22 addendum; `fix/redirect-live-page-guard`)._ A redirect whose old address is where a published page lives now (a rename and a rename back, or a hand-filed redirect over a real page) made a loop on another family site on 2026-10-19, because Cloudflare applies redirects before it serves files. `src/lib/redirect-guard.ts` (+ test, byte-identical to the starter) now drops such entries at build time and logs them; the `redirect` document stays in the Studio. `astro.config.mjs` wires it with `LIVE_PATH_BY_TYPE` for `page`, `event`, `course` and `facultyMember`, read through `fetchLiveDocs()` in `scripts/lib/redirects.mjs`.

_2026-10-19: Visitors card now reads GA4 and Search Console through studio-status (card 136)._

_2026-10-19: Studio complete, part two (starter PORTS.md card 137)._ The PORTABLE kit files are re-copied from the starter (tours, welcome and What's new, Quick update jobs as data, guide videos, the capture and recording scripts), sync-check all SAME. Tours moved onto the card 137 shape (`src/sanity/studio-tours.ts`; the Phase A data file `guides/tours.ts` and its test are gone). Quick update gained **Mark a course full or waitlisted**, **Change an event's time or place**, **Open or close enrollment for a term**, **Answer this week's messages** and the seasonal holiday and summer break notices; the event form's kind is a select. The course has two new fields, `seatsNow` and `seatsNowNote`, that win over the next offering's status and note (`NEXT_OFFERING` in `queries.ts`, `seats-now.test.ts`), and the Checkup lists courses whose seats are set by hand. New guide "Mark a course full or waitlisted"; three pictures (`public/guide-shots/`) captured, and six clip scripts written (not yet recorded), from invented sample data (`tools/studio-media/sample-data.json`, loaded by `tools/studio-media/sample-data.mjs`). `npm run typegen` was re-run for the two fields.

_2026-10-18: Visitor fixes from the Studio pass._ Pages now name the SVG mark (`/favicon.svg`, unless an editor set a favicon in Site Settings) and a web manifest (`public/site.webmanifest`, new). The starter-era `src/assets/logo-{light,dark}.{png,svg}` (one pair was another client's logo, the other the starter's) and `scripts/generate-logo-variants.mjs` / `optimize-logo-files.mjs` are gone; nothing rendered them. The CSP drops Google Fonts (the Studio now loads the site's own font files).

_2026-10-18: The authoring kit (starter PORTS.md card 109) and the editor wording pass._ Twelve custom-page templates in four groups plus course and event starters (`src/sanity/templates.ts`, every word `Example:`), eleven seasonal saved sections (`src/sanity/sectionPatterns.ts`, `scripts/seed-section-patterns.mjs`), saved sections of up to twelve sections, "Insert a saved section" as a copy or synced (`syncedSection`, `PAGE_SECTION_MEMBERS`, `PAGE_SECTIONS_OPTIONS`, `SECTION_ARMS` in queries, `expandSyncedSections` in `Sections.astro`), the preview navigator adding a whole pattern, and page warnings (`pageRules`). Wording: Site Settings says School name, the church-era fields (pastoral email, service time, livestream, giving, app, directory, registration and prayer links; all empty, none rendered) are hidden and the Worship times and Connect groups are gone; church examples in notices, events, questions and faculty descriptions are school ones; "Final CTA" field titles read "Closing band" with no em-dashes.

_2026-10-18: The Studio becomes the Academy's admin (starter PORTS.md cards 106, 110, 111, 114 to 120)._ The Studio kit and the workflow tools come from the starter byte-identical (`src/sanity/kit/`, `src/sanity/workflow/`, `src/lib/studio-*.ts`, `/api/studio/*`, `/build-info.json`, `src/pages/studio/index.astro`, `scripts/change-note.mjs`, `scripts/restore-doc.mjs`). They replace the site's own Welcome pane, How This Works desk list, Checkup tool (`HealthTool.tsx`, its rules now `src/sanity/schoolCheckup.ts`), Site stats tool and `/api/stats` (now Home's Visitors card on Cloudflare Web Analytics), first-visit tour, StudioLogo (never drawn in Sanity 6) and StudioLayout (Google Fonts link; fonts now `src/sanity/studioFonts.css`). Delete is Move to Trash on every collection; the older `archived` flag (page Archive, pre-kit deletes) still hides documents and is listed under Archived and older deleted items. Kept and moved onto the kit: New term (`SetupWizard.tsx`, now with enrollment dates), the guides (`guides/content.ts`, renamed from .tsx, plus the kit's guides), the live-site banner, badges, SEO and Used on tabs, year-scoped Events. New: Quick update (notice, class change, event; `src/lib/quick-updates.ts`), This week jobs, table views, the Messages inbox (`migrations/0002_message_status.sql`), private preview links, "Publish automatically at" on courses, notices and events, the brand look (green chrome, paper, Fraunces, course-cover icons and banner shelf from `npm run gen:studio-art`, a Fraunces wordmark), the owned `/studio/` page and its splash, and `tests/studio-boot.spec.ts`.

_2026-10-15: GA4 skips automated browsers (starter PORTS card 96)._ `GoogleAnalytics.astro` is re-synced from the starter (rule 4): the tag does nothing when `navigator.webdriver` is true or the user agent matches `HeadlessChrome|Lighthouse|PTST|GTmetrix|Speed Insights`. Our own Playwright and Lighthouse runs against production were being counted as visitors (194 in one day on another site). Real browsers are unaffected. Starter PORTS card 96.

_2026-10-13: The masthead, the Contents menu and the back cover (the chrome redesign, built from Nathan's approved mockups)._ `Header.astro` is now a masthead: a spine strip of the eight cover colours, the green top bar (issue line, "Visit a class, free", a Light / Dark segmented control that replaced the three-state icon toggle, same storage key and values), a one-line Fraunces nameplate with a mono subline, "Spring 2027 issue" with three fanned covers beside the button, and a ruled nav strip (new `MastheadNav.astro`, server-rendered, drawn twice) with a mono note from the real course and faculty counts. It is no longer sticky (the hide-on-scroll script left `BaseLayout.astro`); a separate fixed condensed bar slides in with `transform` once an IntersectionObserver sees the masthead scrolled away, `aria-hidden` + `inert` while hidden, CLS 0 measured while scrolling. `MobileNav.tsx` became the full-screen Contents menu (dotted-leader rows ending in mono facts, a shelf of tiny covers, one button, office hours, the theme control; Radix Dialog for the focus trap, Escape, focus return and scroll lock). `Footer.astro` became the back cover: Colophon (with the funder), an A to Z Index of every footer link in CSS columns, In this issue, and a mono bottom line; the old wordmark, CTA pair, link columns, PA seal and dot pattern are gone, the newsletter band stays. New: `src/lib/chrome.ts` (+ `chrome.test.ts`), `getChromeData()` in `queries.ts` (one memoized request), `coverVars` in `cover.ts`, the optional `menuNote` on `navLink` (shown only on top-menu links), the phone form of `issueLine`, `scripts/migrate-nav-contents.mjs` (adds Pricing, sets the notes; dry run only, see PENDING). The built-in menu gained Pricing and the approved order; the built-in header button reads "Request information". `.nav-underline` retired.

_2026-10-13: Lenis smooth scroll removed (Nathan's call)._ The idle-loaded Lenis init in `BaseLayout.astro`, the `window.lenis` branch in the home hero scroll cue (`Hero.astro`, now native `scrollTo` with smooth behaviour that reduced motion turns instant) and the `lenis` package are gone. Gotcha #6 is rewritten: the forward-to-top, back-restores behaviour is Astro's `<ClientRouter />` on its own, which is what the old after-swap reset was protecting from Lenis momentum. Docs updated across animation, polish-layer, performance, accessibility, stack, ownership and the topic index.

_2026-10-13: Production second factor on every write script, `audit:data`, and a truthful privacy seed (starter PORTS.md cards 86 and 95)._ The seven scripts that build their own Sanity client (`fix-missing-keys`, `seed-academic-images`, `seed-editability`, `seed-live-singletons`, `seed-page-copy`, `seed-school-content`, `sanity-apply-asset-patches`) now call `guardProductionWrite` from the new `scripts/lib/production-guard.mjs` before any request, so `--apply` on `production` also needs `NCS_PRODUCTION_WRITE=yes` in the process environment, the same rule `sanity-lib.mjs` already enforces. `sanity-apply-asset-patches` used to commit on a bare run and is now a dry run unless given `-- --apply`. `seed-live-singletons` and `seed-school-content` read only `.env` and now use the shared `loadEnv`. New `scripts/lib/production-guard.test.mjs` proves the refusal against `https://example.invalid` with a fake project, and runs each script with `--apply` to check it exits 2; `npm run test:scripts` (all `scripts/lib/*.test.mjs`, including the existing `sanity-lib.test.mjs`) now runs inside `npm run test:unit`, so CI covers it. Ported `npm run audit:data` (`scripts/audit-data-vs-schema.mjs`, `scripts/backfill-array-types.mjs`, `scripts/lib/array-types.mjs`, `scripts/lib/load-schema.mjs` and their two tests, all PORTABLE and byte-identical to the starter). `scripts/seed-editability.mjs` no longer seeds "no tracking pixels" or "Cloudflare Web Analytics ... without setting cookies" in the privacy body; it seeds the GA4 wording Nathan approved on 2026-10-04, matching the stored `privacyBody`. The write-gate and backtick rules are in `.claude/rules/sanity-and-scripts.md`. CLAUDE.md's stale "GA4 is wired but inactive" sentence is gone (GA4 has been live since 2026-10-04).

_2026-10-13: Next issue band, honest without a newsletter._ Live check after Term Issue PR 4 found the band promising "get the summer issue first, plus One Question a week" above an empty space: no newsletter provider is configured, so `NewsletterSignup` renders nothing. `NextIssueBlock.astro` now computes `canSignUp` with the same two checks the sign-up uses, and without it shows "The {season} courses are being planned now..." plus a link to `/get-started/`. The migration and `default-sections.ts` no longer store the sign-up sentence as `body`, and the stored `body` on the live home block (published and draft) was unset so the fallback decides.

_2026-10-13: The forms moved from Web3Forms + hCaptcha to the site's own endpoint (starter PORTS.md card 45). New PORTABLE files, byte-identical to the starter: `src/pages/api/contact.ts`, `src/lib/contact-submission.ts` (+ `.test.ts`), `src/lib/contact-transport.ts`, `scripts/gen-contact-migration.mjs`, plus the generated `migrations/0001_contact_submissions.sql` and `npm run contact:migration`. `wrangler.jsonc` binds D1 `presacademy-contact` (`CONTACT_DB`) and `send_email` (`EMAIL`); the domain uses Email Routing to a verified destination (free) because it had no mail provider. `FormRenderer.tsx` now posts every Sanity-built form through `sendContactSubmission`, mapping its fields onto name, email, subject and message with the new `src/lib/form-to-contact.ts` (+ test); renders Cloudflare Turnstile (explicit render, theme-following, compact under 300px) instead of hCaptcha; and has per-field errors (`aria-invalid`, `aria-describedby`), a sending state and the endpoint's failure messages. No Web3Forms key ships in the form bundle, and `provider` is out of the form projection so a stored key is no longer serialized into the HTML. Schema: the form's `provider` object is hidden (not removed, gotcha #1) and its "Where submissions go" tab is gone; no type change. CSP: `challenges.cloudflare.com` in script-src and frame-src, hCaptcha origins removed; `api.web3forms.com` stays only for the newsletter fallback. Privacy: the fallback and `seed-editability.mjs` gain a paragraph on where form messages go and Turnstile; `scripts/migrate-privacy-forms.mjs` adds it to the stored copy (dry run only). Removed the obsolete `scripts/seed-forms.mjs` (Web3Forms key wiring). New Studio guide "Forms & where messages go"._

_2026-10-13: Term Issue PR 4, the back page and the running head. Two new home blocks on the static dark ink band (`.issue-band`), appended after the rates box: `sectionNextIssue` (`NextIssueBlock.astro`: the term after next from the new `getNextIssue`, one of its courses as a tilted cover, `{term}` / `{season}` copy tokens, and the newsletter sign-up via a new `variant="band"` + `inputId` on `NewsletterSignup.tsx`; hides with no later term) and `sectionForPastors` (`ForPastorsBlock.astro`: bulletin-insert PDF `insertPdf`, `catalogHref`, a CSS insert drawing; hides with neither). Registered like PR 2's blocks (blocks.ts members and insert band, Sections MAP, `default-sections.ts`, SELF_FILLING, coach, "Used on", NON_STEGA audit note) and `typegen`. `scripts/migrate-home-term-issue.mjs` now writes eight sections; dry run against the migrated dataset: 2 changes (`homePage`, `drafts.homePage`), each only appending the two blocks. Header utility bar: the "Now enrolling" label and pulsing `.enroll-dot` are replaced by the issue line in Plex Mono (`issueLine` in `src/lib/term-issue.ts`, from `getNextTerm`, which now also reads `registrationOpens` and `status`); the server-rendered nav is untouched. Footer colophon: "Set in Fraunces, Source Sans and IBM Plex Mono." Per-course share images: `renderCourseOg` in `scripts/lib/render-og.mjs` draws the cover (palette from the `--color-cover-*` tokens, colour and ornament via `src/lib/cover.ts`) and `generate-og-pages.mjs` enables its collections hook, writing `public/og/course-<slug>.png`; course pages use it unless the course has a `seoImage` (which they now pass through too)._

_2026-10-13: SanityImage srcset ladder starts at 160w (starter PORTS card 93)._

The srcset ladder in `SanityImage.astro` now comes from `src/lib/imageLadder.ts` (new, with `imageLadder.test.ts`) and runs `[160, 240, 320, 400, 600, 700, 800, 900, 1200, 1600, 2400]`. It started at 400w, so small slots downloaded 1.4 to 2x the bytes they painted. A slot that needs 400px or more picks the same candidate as before (asserted in the test). When `sizes` is passed and readable, steps below 75% of its smallest slot are dropped. `SanityImage.astro` is not `PORTABLE` (this site's copy has its own props), so this is a hand-applied three-line change from starter PORTS.md card 93. Live image bytes before and after are in the PR.

_2026-10-13: Live-site audit fixes on the home page. (1) `HeroSlideshow.astro` is now art-directed: a `<picture>` with a 4:5 `<source>` from lg up and a 3:2 `<img>` below, so phones stop downloading the portrait crop (hero bytes about 379 KB to 184 KB, LCP image 66 KB to 36 KB; desktop requests unchanged). The first slide was already eager with `fetchpriority="high"`. (2) Header: removed the `aria-label` from the "Now enrolling" strip link and from the text wordmark link (the link is now named by its visible text, plus a screen-reader-only " home"), clearing Lighthouse's label-content-name-mismatch. The logo-image case keeps its label.

> Running change log, moved out of CLAUDE.md so it does not load on every task.
> Each client project starts its own history from the extraction entry below.

_2026-10-13: Term Issue PR 2, the homepage issue. The hero (`HomeHero.astro`) is now the issue's cover: the next term's title split over two lines ("Spring" over an italic green "2027", `src/lib/term-issue.ts` `splitTermTitle`), `heroHeadline` as the italic deck, the subhead, both CTAs, a mono next-cohort line and a fanned stack of three non-flipping covers (Start here, then Featured). No photo, no slideshow, no eyebrow, no graph paper: `.hero-atmos`, `.surface-grid`, `.surface-dots` and `--grid-rgb` were deleted (nothing else used them); `heroEyebrow` and `heroImages` stay in the schema, unused. New blocks `sectionTermContents` (the contents page with dot leaders and a faculty note) and `sectionCourseFinder` (the reply card: `CourseFinder.tsx`, aria-pressed answers in labelled groups, an aria-live suggestion; question 2 wins, then 1, then the default; question 3 is the pricing tiers). New values: `sectionCourseRail` `covers` + `source: 'all'`, `sectionTestimonialRail` `letters` (salutation, drop initial), `sectionPricingTiers` surface `rates` (dot-leader rows, scholarship row, coupon, "Bring your session", group rate hidden while empty). The contributors heading uses the same light display size. New token `--issue-accent` (oxblood, lifted in dark), pinned by `theme-tokens.test.ts`; new `term-issue.test.ts`. `default-sections.ts` home is the new six-section order; `scripts/migrate-home-term-issue.mjs` rewrites `homePage.flexibleSections` (and its draft) to match (dry run by default, NOT yet applied). New queries `getAllCourses`, `getCoursesByIds`; `getPricingTiers` takes an optional fetcher. Registries: "Used on" (`locations.ts`), self-filling list, section coach, NON_STEGA (`scope`), `backgroundApplies` (rates)._

_2026-10-13: Term Issue PR 3, contributors. `facultyMember` gains a "This term" group: `currentlyReading` (max 100), `introAudio` (file, `audio/*`), `introAudioTranscript` (required whenever a recording is uploaded, WCAG 1.2.1) and `introAudioLength` ("1:32", warning only). `sectionFacultyRail` gains `variant` (`cards`, the default, so existing sections render as before; or `contributors`) and an optional `intro`. Contributors rows are `src/components/ContributorRow.astro`, fed by the new `getContributors` query, whose "In this issue" list is the teacher's courses with an offering in the `getNextTerm` term, labelled `coalesce(courseCode, title)` so the optional course code from PR 1 is picked up when it lands. New `IntroAudio.tsx` island (`client:visible`, native `<audio preload="none">`, one play/pause button with a named aria-label, transcript in `<details>`, starting one pauses the others, no animation) used by the rows and the faculty detail page. Shared rules in `src/lib/intro-audio.ts` with `intro-audio.test.ts`. Nothing seeded: the new fields stay empty until faculty supply them (PENDING). No CSP change (`media-src https:` already allowed)._

_2026-10-13: Term Issue PR 1, the cover system. Every course is now drawn as a small-press book cover (`src/components/CourseCover.astro`, the "Course covers" block in `globals.css`, `src/lib/cover.ts`): eight fixed colour pairs (`--color-cover-*`, in an `@theme static` block because they are only read through `var()`), eight CSS-only ornaments, a paper back with the course's question, week one and facts. The flip runs only under `(hover: hover)`, no reduced-motion preference and `sm` up; on touch or with reduced motion the back renders beside or below the cover. `CourseCard.astro` is now the cover (the `data-*` filter attributes are unchanged); the course page shows a large front-only cover at the head of the aside and a "Course code" ledger row; `/style-guide` gained a cover section and a mono card, so its visual baselines move. Schema: a new `Cover` group on `course` with optional `courseCode` (a warning-only pattern check), `coverColor`, `coverOrnament` and `centralQuestion` (max 90). This deliberately REVERSES the old "No course codes" rule: the code is a cover detail, never part of the title. An empty colour or ornament is derived from the teaching area and slug, so no course needs a photo. IBM Plex Mono 400 added (`@fontsource/ibm-plex-mono`, Nathan approved the dependency) with a measured "IBM Plex Mono Fallback" face, and `--font-mono` points at it. The Studio health check and the "no photo" badge stop asking for course cover photos, which no longer render anywhere. New `src/lib/cover.test.ts`; new `scripts/seed-course-covers.mjs` (fill-empty only, run after merge)._

_2026-10-04: Correction to the entry below: the live privacy text is NOT the code fallback. It is stored in Sanity under `privacyPage.flexibleSections[privacyBody].body`, so after GA4 went live the page still said "no tracking pixels" and "without setting cookies" until that section was edited and published (backup of the old blocks kept outside the repo). Lesson: when checking stored copy, read the whole document, not one guessed field._

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
