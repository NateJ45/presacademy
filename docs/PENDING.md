# PENDING — the open-loops registry

The live registry of open patches, known gaps, and waiting-on-a-human items.
Read it early in a session; update it in the same commit that closes,
opens, or discovers an item. Pattern borrowed from the WCP site repo.

Format: each item says what it is, why it's open, and what unblocks it.
Move finished items to the "Recently closed" section with a date; prune
that section when it gets long.

## Open — needs a human (Nathan)

- **Run the nav migration for the masthead** (2026-10-13, the chrome redesign PR).
  `scripts/migrate-nav-contents.mjs` adds Pricing (/pricing) to `siteSettings.navItems`,
  orders it Courses, Faculty, Pricing, Events, Resources, About, and sets the new
  `menuNote` on Events ("Info nights"), Resources ("Reading") and About ("The school")
  only where empty. Dry run on 2026-10-13 (published settings, no draft exists): one
  change, 6 links. Routine after the PR deploys: backup, dry run, `--apply` with the
  second factor, re-run (expect "nothing to do"), `/rebuild`. The site renders
  correctly before it runs (Pricing is simply absent from the live menu until then).
- **Check the Contents menu facts read true** (2026-10-13). "Info nights" (Events) and
  "8 this year" (Courses, the count of every non-archived course) came from the approved
  mockup; edit the Events / Resources / About notes in Studio (Site Settings, Navigation,
  each top-menu link's "Menu note") if the wording should change.

- **Two orphan fields on `siteSettings`, checked 2026-10-13: not restored, data left.**
  Stored data with no schema field, so the Studio shows an "Unknown fields" banner
  with a "Remove field" button on Site settings (never click it, gotcha #1).
  Published `siteSettings` only (no draft), last updated 2026-06-15:
  - `admissionsEmail`: `"info@presbyterianacademy.org"`
  - `denominationStatement`: `"A PC(USA) school of theological formation, holding to
the Westminster Standards and the Book of Confessions."`

  What history says: neither field was ever in the schema, so nothing removed them.
  The 2026-06-13 IA spec (`docs/superpowers/specs/2026-06-13-lay-school-ia-content-model.md`)
  planned both (the statement as a footer line), and `scripts/seed-live-singletons.mjs`
  (commit 7e59fd3, same day) writes them, but the schema step never landed. No file in
  `src/` reads either field. `admissionsEmail` holds the same address as `email`, which
  is the one the site uses. The confessional wording (Westminster Standards, Book of
  Confessions) is shown, but from About and the FAQ, not this field; the back-cover
  footer (#99) names the funder and place, with no denomination line. Restoring the
  fields would give editors two boxes that change nothing on the site, so they were
  left out.

  Nathan decides: (a) wire `denominationStatement` into the back-cover colophon (a
  design change) and only then add it to `siteSettings.ts`; or (b) unset both after a backup,
  dry run first (mas-monograms `scripts/fix-orphan-data.mjs` is the model), and drop
  the two lines from `seed-live-singletons.mjs` so a reseed does not bring them back.
  Then re-run `npm run audit:data` and expect 0.

- **Finish the form cutover to `/api/contact/`** (2026-10-13, starter card 45).
  The code, D1 database, Email Routing, Turnstile widget and Worker secrets are
  in place. In order:
  1. **Sarajane clicks the Cloudflare verification email** for the notification
     address. Until she does, sends to it fail and rows land with `notified = 0`
     (nothing is lost: every submission is stored first).
  2. **Check the Cloudflare build variables for a stale `PUBLIC_TURNSTILE_SITEKEY`**
     from the pre-hCaptcha Turnstile setup. A leftover value overrides the new
     widget's key and the live widget fails. Remove it or set it to the new key.
  3. Main session adds the **`info@presbyterianacademy.org` forwarding rule** in
     Email Routing (the domain now has Cloudflare MX, so mail to info@ goes
     nowhere until a rule exists).
  4. **Apply the privacy migration** after the code PR merges:
     `node scripts/migrate-privacy-forms.mjs` (dry run 2026-10-13: 1 change,
     insert the `privacyForms` paragraph after `b14` in the published
     `privacyPage`; no draft exists), then `--apply`, re-run (nothing to do),
     `/rebuild`, fetch the live `/privacy/`.
  5. **Live step 6**: one labelled submission on each form (contact, express
     interest), then read the rows back (`OPERATIONS.md`, "Form submissions")
     and confirm `notified = 1` and the email arrived with a working Reply-To.
     A 200 is not proof. Also check the widget renders on the live domain with
     no CSP errors in both themes.
     Side note: `scripts/measure-tap-targets.mjs` timed out waiting for
     `networkidle` on `/get-started/` under local `wrangler dev` with the
     Turnstile test key. If it does the same against the live site, scan that page
     by hand or with a shorter wait.

- **Check the GA4 property settings** (2026-10-04). GA4 is live. In the Presbyterian
  Academy property, confirm Google signals and ads personalisation are off (Admin,
  Data collection). The privacy text makes no advertising claim either way, so this
  is about keeping a school site free of ad profiling, not about fixing copy.

- **Sign in to the Studio after the Sanity phase-2 bump** (2026-10-17,
  `sanity` 6.19.0 / `@sanity/ui` 4.4.9; see gotcha #18). The paragraph below
  is the phase-1 original (2026-09-06) and the same check applies.
- **Sign in to the Studio after the Sanity phase-1 bump**
  (2026-09-06). The stack moved to `sanity` 6.9.1 / `@sanity/ui` 3.5.4 /
  `@sanity/client` 7.26.2 / `@sanity/visual-editing` 5.7.3 /
  `@sanity/preview-url-secret` 4.1.5. Every automated gate is green and the
  single-instance invariant holds on disk and in the bundle (one
  `@sanity/ui`, one `styled-components`, one `errors.md#` chunk). But the
  failure mode this whole pinning regime exists for, gotcha #18, shows up
  ONLY after sign-in: the login screen is core code and renders fine even
  when the theme context is broken. So the last check is a human one. Open
  `/studio` (on the production site or a local build), sign in, open any document (a custom component
  pane, not just the list), then open the **Presentation** tool and click a
  section handle. If the desk throws styled-components error #18 or
  `Cannot read properties of undefined (reading 'v2')`, the bump is bad and
  the revert is the two-file diff on package.json + package-lock.json.
  Bonus while you are in there: 6.6.0 added **tables in Portable Text**, so
  a table should now be insertable in body copy.
- **Click-through the two Presentation fixes in the DEPLOYED Studio**
  (2026-08-28). Both were reported live and neither can be reproduced
  locally, so both need your eyes once the change is live. (1) The section
  **🎨 handle** now opens a labelled "Section style" card instead of a bare
  column of dots: open it, move the mouse down onto the rows, and it should
  stay put until you press ✕, Escape, or click the page. Picking a colour
  should recolour the band immediately and keep the card open so you can
  set the accent too. (2) Clicking a page in the left-hand page list should
  move the preview on the FIRST click. If it still bounces, the retry now
  fires automatically, so what you should see is a brief flicker back and
  then the right page, never a second click. If either is still wrong, say
  which of the two and what you saw.
- **Wire a deploy webhook so publishing rebuilds the site** (2026-08-28,
  opened with PORTS.md card 20). Nothing in this repo rebuilds the public
  site when a document is published: `.github/workflows/` has CI,
  backup and uptime (the staging deploy was removed 2026-10-03), and now
  `publish-due.yml`. Production is `npm run deploy`, by hand. That was
  survivable while every publish had a human beside it, but scheduled
  publishing makes the gap visible: a page can publish itself at 6am and
  still not be on the website. The Studio guide "Schedule a page to
  publish itself" says so out loud rather than promising something the
  repo cannot keep. The fix is a Sanity webhook (Project → API → Webhooks)
  pointed at a `repository_dispatch` workflow that runs the production build and deploy steps. Worth debouncing so
  a burst of edits does not queue a dozen builds. Note the existing
  "Start here" guide already tells editors the site "rebuilds itself",
  so today that sentence is aspirational too.
- **Set the `SANITY_AUTH_TOKEN` repo secret, or comment the
  `publish-due.yml` schedule back out** (2026-08-28). The new workflow
  runs at `*/30` with the house two-job gate, so with the secret missing
  it warns and skips 48 times a day, which is the same small waste that
  got `sanity-backup.yml` and `uptime.yml` disabled in 2026-07. Scheduled
  publishing is inert either way until the secret exists, and it must be
  a WRITE token here (Editor permission), not the read token the backup
  workflow wants. Pick one: set the secret, or comment out the two
  `schedule:` lines until you do.

- **Rerun the block thumbnails with a read token** (2026-10-19). Run `npm run thumbnails` with `SANITY_API_READ_TOKEN` in `.env`: an anonymous build drops the Home and Courses sections, so TermContents, CourseFinder, NextIssue and ForPastors still show placeholder pictures and FacultyRail and TestimonialRail keep older ones. Commit the regenerated pictures.

- **Switch on the Studio kit's server half** (2026-10-18, starter cards 106 to 120).
  The kit is live without these; each piece says "not set up yet" in plain words
  until its setting exists. In order of value:
  1. **Visitors on Home** (card 115). In Cloudflare, add a Web Analytics site for
     presbyterianacademy.org (the site has no beacon today), then: a token with ONE
     permission, **Account · Account Analytics · Read**
     (`npx wrangler secret put CF_ANALYTICS_TOKEN`, never in a file), and the site
     tag as a `CF_WEB_ANALYTICS_SITE_TAG` var in `wrangler.jsonc` (`CF_ACCOUNT_ID`
     is already there). Detail: `OPERATIONS.md`, "Visitor numbers". This replaced
     the old Site stats tool (Workers requests), retired the same day.
  2. **Messages** (card 117): apply `migrations/0002_message_status.sql` to the D1
     `presacademy-contact`
     (`npx wrangler d1 migrations apply presacademy-contact --remote`); it only
     creates the status table.
  3. **Private preview links** (card 117): `SHARE_PREVIEW_SECRET` Worker secret
     (48 random characters). Add `"previewShare"` and `"studioWeek"` to the Sanity
     publish webhook's deny-list filter (OPERATIONS.md), or a new link or a ticked
     job rebuilds the site.
  4. **Morning change note** (card 117): `.github/workflows/change-note.yml` needs
     only the `SANITY_AUTH_TOKEN` repo secret (the backup's READ token); uncomment
     its `schedule:` and watch the repo for issues.
  5. **The help address** on Home's Ask card: `PUBLIC_STUDIO_HELP_EMAIL` as a
     Cloudflare BUILD variable (else the guides' studio address is used).
     Not used here: `GITHUB_DEPLOY_TOKEN` (card 111's failed-deploy line reads a
     GitHub deploy workflow; this site deploys through Cloudflare Workers Builds).
- **Seed the seasonal saved sections** (2026-10-18, card 109). Needs a write token
  in `.env` (`SANITY_API_WRITE_TOKEN`): dry run
  `node --experimental-strip-types scripts/seed-section-patterns.mjs`, then
  `$env:NCS_PRODUCTION_WRITE='yes'; node --experimental-strip-types scripts/seed-section-patterns.mjs --apply; Remove-Item Env:NCS_PRODUCTION_WRITE`,
  re-run (expect eleven SKIPs). It only creates new DRAFT `pattern-*` saved sections. Until
  then "Insert a saved section" lists only the ones staff saved themselves.
- **Card 122 (private and hidden pages) to adopt next round** (2026-10-18). The kit's
  Checkup and Your pages now honour `hideFromSearch` (synced byte-identical). This site's
  own `seo.ts` titles it "Hide this page from search engines" and the hidden pages drop
  out of the sitemap (`scripts/lib/hidden-pages.mjs`), but the menus and the link
  picker do not check it yet. Private pages were not adopted.
- **Signed-in Studio walkthrough after the kit PR deploys** (2026-10-18). Checked
  signed out only (the /studio boot page, splash, sign-in card). Sign in and look at:
  Home (banner with the cover shelf, This week, Coming up, Fix-it list, Your pages),
  the status line under the top bar, Quick update (each form; they publish
  straight away), Messages, New term, Site Guide, Checkup, Help for this page on a
  course, Move to Trash then Bring it back on a test notice, Share a preview on a
  custom page, the table views beside Courses / Terms / Faculty / Events, the
  course-cover icons in list rows (light and dark), and the console. After the authoring PR: make a page from each template group, "+ Add" in grid view, Insert a saved section as a copy and as synced (then edit the saved section and check both pages), and the yellow warnings on a page with Example: text left.

- **Set the `SANITY_TOKEN` Worker secret before the next deploy.** The new
  SSR preview routes read it at request time. Locally it lives in
  `.dev.vars` (gitignored, already written). In production:
  `npx wrangler secret put SANITY_TOKEN` (a Viewer token with draft read
  access is enough). Without it the preview routes fail closed: the live
  public site is unaffected.
- **Add the site origin to Sanity CORS.** The embedded Studio at
  `/studio` talks to the Sanity API from the site's own origin, so
  `https://www.presbyterianacademy.org` (and any workers.dev preview
  origin you use) must be listed under Project → API → CORS origins with
  credentials allowed. sanity.io/manage.
- **Confirm the Home page's live EDIT loop in the deployed Studio**
  (2026-08-26, Phase 4). The home preview was verified end to end under
  `wrangler dev`: the whole body renders, the slideshow runs, the console
  is clean. What cannot be checked without a signed-in editor is the last
  link in the chain: open Presentation, edit a Home **Page sections** block
  (say the "where to begin" row's second cell) without publishing, and
  confirm the change appears in the iframe and that click-to-edit opens the
  right field. Everything the check exercises is shared code that already
  works on twelve other pages, so this is confirmation, not suspicion.
- **Real Academy photography.** The whole dataset still runs on Pexels
  CC0 placeholders (`acad-*`). Editors can swap photos in Studio any time;
  until then the site is presentable but generic. Unblocks: a photo shoot
  or a curated real-photo set.
- **`siteSettings.phone` and social links are unseeded.** Deliberately
  left empty by `seed-editability.mjs` because they need real values.
  Empty fields hide rather than show stand-ins, so nothing is broken,
  just absent.
- **GitHub Actions secrets/variables may be unset.** `sanity-backup.yml` (needs
  `SANITY_AUTH_TOKEN` AND `BACKUP_PASSPHRASE` — the artifact is encrypted
  because the repo is public; keep an off-GitHub copy of the passphrase,
  see docs/agent/ci-cd-and-ops.md), and `uptime.yml` (needs the `SITE_URL` repo
  variable) all warn-and-skip when their secret is missing, so nightly
  dataset backups, and uptime checks may be silently
  inert. Check the repo settings on GitHub and set whichever are missing.

## Open — code/content work queued

- **Wire the Studio tours and videos once starter card 137 lands** (2026-10-19, studio-complete
  Phase A). The jobs and surfaces are in `docs/agent/studio-plan.md`. Waiting on 137: merge
  `origin/main`, resync the PORTABLE files, map `src/sanity/guides/tours.ts` onto 137's tour
  config, record the seven clips scripted in `docs/agent/studio-videos.md` with the tutorial-video
  pipeline (sample data only), set each guide's `video`, and check every caption frame. Capture
  the two shots still drawn as the wireframe (`term-editor`, `offering-status` in
  `src/sanity/guides/shots.ts`): the harness cannot open an editor without a read token. Two job
  types are noted for 137 in the plan (a form that changes an existing document, so "Mark a
  course full" can move to Quick update; a `select` field kind for the event form).

- **Earlier versions (card 125) is switched off** (2026-10-19). The Studio phone app came
  with the card 125 sync (`/studio/manifest.webmanifest`, `public/studio/sw.js`, the
  `icon-192/512/maskable-512.png` icons), but "Earlier versions" needs the nightly backup
  with `SANITY_API_WRITE_TOKEN` and the Worker's `GITHUB_DEPLOY_TOKEN` (Actions: Read and
  write). Once those are set, delete `earlierVersions: false` in `kit.config.ts`. "Post a
  photo" (`kitConfig.postPhoto`) is not set up either.
- **Signed-in check of the Studio art** (2026-10-19): Home banner (mark, shelf, italic
  "Academy"), the top-bar wordmark, list-row icons on their cream tiles, at 1280 and 375.

- **Two hidden menu switches** (2026-10-13). The Contents menu has no email or social
  row, so `siteSettings.showEmail` and `showSocials` are now `hidden: true` in the
  schema (data kept, still resolved in `src/lib/siteSettings.ts`, read by nothing).
  Delete both fields with a data cleanup, or unhide them if the menu grows that row back.
- **"Visit a class, free" is a code-owned label** (2026-10-13). The masthead's top-bar
  link and the back cover's kickers are literals in `Header.astro` / `Footer.astro`,
  like the type credit. Wire a Site Settings field if editors need to change them.

- **Re-test undo/redo in the deployed Studio, then discard the
  `drafts.pricingPage` fixture** (2026-08-28, opened with the card 27 bug
  fix). The fix is unit-tested but nothing in this repo can exercise a real
  Studio, so these four need a human with the deployed Studio open:
  1. **The original repro.** Open a page in Presentation, change a section
     background with an in-canvas chip (card 28), then `Undo last change`
     from the `Publish` menu. On a page whose draft did not exist before the
     chip, the correct behaviour is now that the DRAFT IS REMOVED and the
     page falls back to its published state. Confirm the toast says
     "Draft change undone" and the value actually moves.
  2. **Multi-step undo.** Make three separate changes, then undo three
     times, and confirm it walks back three states rather than
     oscillating between two. This is what the server-assigned transaction
     id fix buys, and it is the part with no live evidence yet.
  3. **`drafts.pricingPage` is a leftover test fixture** with
     `flexibleSections[0].background.tone = 'chapel'` and three no-op
     transactions on it from the broken build. It has a published twin, so
     one undo should now remove it cleanly. DO NOT PUBLISH IT. If undo
     does not take it, discard the draft in the Studio.
  4. **Whole-document write vs. the optimistic actor.** Undo writes the
     whole document with `createOrReplace` while Presentation may be
     holding in-flight local patches for the same draft. The transaction
     log shows no sign of this having happened during the incident, but it
     is not proven safe: try an undo immediately after a chip click, with
     the preview open, and watch whether the preview and the form agree.
     If they diverge, the fix is to send a narrower patch rather than a
     whole-document replace.
- **Ctrl+Z is not heard while focus is inside the Presentation preview
  iframe** (2026-08-28, known limit, deliberately not fixed). A key pressed
  over the page picture goes to the iframe's window, not the Studio's, so
  the shortcut does nothing right after using an in-canvas chip. The two
  document actions are unaffected and the guide now says to use them or to
  click into the Studio panel first. Fixing it means a postMessage protocol
  between the public preview island
  (`src/components/preview/overlay/`) and the Studio layout wrapper: key
  handling shipped in a public bundle plus an origin check, for a shortcut
  with a working button two inches away. Reconsider only if editors
  actually ask.
- **The Events page's empty-state line reads oddly.** The copy ends in a full
  sentence ("...is a course.") while the block appends a link reading "course."
  to it. Carried across faithfully by the conversion, so nothing changed, but an
  editor should fix the wording. It now lives on the Events page's
  `sectionEventGrid` block, as **Empty-state copy**, in `Page sections`.
- **The Checkup tool's `page-heading-ids` rule is still to write.** Phase 2 of
  the conversion added the section types with a mandatory heading or landmark
  label (`sectionEventGrid`, `sectionRuledList`, `sectionFaqGrouped`,
  `sectionContactDetails`), so `PORTED_SECTION_TYPES` can now list them without
  warning about correct content. The rule itself was never written.
- **Four pre-conversion orphan fields were deliberately left alone** in Phase 5
  (2026-08-27). They are unread by any renderer, but they predate the
  page-builder work and nothing superseded them, so removing them is a separate
  decision: `coursesPage.catalogIntro`, `facultyPage.directoryIntro`,
  `eventsPage.specialEyebrow` / `.specialHeadline`, plus `faqPage`'s
  `finalCtaScriptAccent` / `secondaryCta` / `note` and `contactPage.note`. None
  hold data except the two `note` fields (editor scratchpads, which is what they
  are for). Decide per field: delete with a dry-run unset, or wire one up.

- **Home page P1s from the 2026-06-20 Impeccable critique**
  (`.impeccable/critique/`): the faculty strip is text-only, which makes a
  polished page look half-loaded (Term Issue PR 3 added the `contributors` faculty-rail style; PR 2's migration, below, switches the home faculty section to it; this half closes once that is applied and checked live).
  The empty course-card image wells half closed 2026-10-13 (see Recently
  closed). Second finding: CTA wording drift ("Request info" vs "Request
  information", "Free intro" vs "Book a free intro"); pick one form of each
  and sweep.
- **Run the home migration after the Term Issue PR 2 merge** (2026-10-13).
  `scripts/migrate-home-term-issue.mjs` rewrites `homePage.flexibleSections`
  into the issue's six sections (contents, cover grid, course finder,
  contributors, letters, rates), removes the wayfinding row, stat band,
  ticker and the two old course rails, and clears the eyebrows. Dry run on
  2026-10-13: 2 changes, `homePage` and an EXISTING `drafts.homePage` (same
  plan for both: 5 removed, 4 added, faculty and testimonials kept and
  restyled). Ask whose draft that is before applying, because the script
  rewrites the draft's sections too. Routine: backup
  (`backups/pre-term-issue-2-<date>.tar.gz`), dry run, `--apply`, re-run
  (nothing to do), `scripts/sanity-audit.mjs`, `/rebuild`, check the live
  home in both themes at 375 and 1280. Run the course-cover seed first so the
  contents list and finder show codes.
- **Run the home migration again after the Term Issue PR 4 merge**
  (2026-10-13). The PR 2 run is applied (homePage and drafts.homePage have
  the six sections). `scripts/migrate-home-term-issue.mjs` now writes eight:
  the dry run against that dataset appends `sectionNextIssue` and
  `sectionForPastors` after the rates box, on both documents, and changes
  nothing else. Routine: backup (`backups/pre-term-issue-4-<date>.tar.gz`),
  dry run, `--apply`, re-run (nothing to do), `scripts/sanity-audit.mjs`,
  `/rebuild`, then check the live home in both themes at 375 and 1280. The
  Next issue band shows straight away (Summer 2027 is in the calendar); For
  pastors stays hidden until the next item.
- **Bulletin insert PDF wanted** (2026-10-13, Term Issue PR 4). The home
  page's "For pastors" band hides until it has the insert PDF or the
  printed-catalog request link. The insert's design is a separate print job.
  When it exists: Studio, Home page, the For pastors section, upload the PDF.
  Also decide whether printed catalogs exist and where a request should go
  (a page such as /contact/ or a mailto: address) before filling
  `catalogHref`; nothing was invented for either.
- **No newsletter is switched on, so "Next issue" has no sign-up** (2026-10-13,
  updated the same evening). Live, the newsletter has no provider (no
  `formActionUrl`, no `PUBLIC_WEB3FORMS_KEY` build variable), so
  NewsletterSignup renders nothing. The Next issue band now notices that and
  says "The summer courses are being planned now..." with a link to the
  interest form, instead of promising "get the summer issue first, plus One
  Question a week" above an empty space. The stored `body` on the home block
  was unset so the code picks the copy. Once a newsletter provider exists (and
  only if the weekly One Question email is real), the band switches back to
  the sign-up by itself; an editor can also set the Text field, which always
  wins.
- **Group rate for "Bring your session"** (2026-10-13, Term Issue PR 2). The
  rates box has a `groupRate` field, left EMPTY on purpose: the row hides
  until Nathan has a number. Set it in Studio, Home page, the Rates section.
- **The finder's answers and the faculty note are draft copy** (2026-10-13).
  The two finder questions, their answer-to-course mapping and the contents
  note ("Every course in this issue meets in person...") come from the
  approved mockup, not from the faculty. Worth a read by the director before
  or after the migration; all of it is editable in Studio.
- **CourseFinder has no CI coverage** (2026-10-13). The credential-less CI
  build has no courses, so the finder (like the other catalog rails) renders
  nothing there and the axe / reflow suites never see it. It was checked by
  hand (every answer path, both themes, 320 to 1280). If it grows, add a
  fixture to `/style-guide` (which moves the visual baselines).
- **Run the course-cover seed after the Term Issue PR 1 merge** (2026-10-13).
  `scripts/seed-course-covers.mjs` fills `courseCode`, `coverColor`,
  `coverOrnament` and `centralQuestion` on the eight seed courses (fill-empty
  only). Dry run on 2026-10-13: 9 changes, the 8 published courses plus the
  existing draft `drafts.course.calvin-everyday`. Routine: backup, dry run,
  `--apply`, re-run (0 changes), `scripts/sanity-audit.mjs`, `/rebuild`, check
  the live covers. Until then the covers use the derived fallback, which
  repeats colours (five of the eight courses came out parchment).
- **The cover questions are placeholders** (2026-10-13). The eight
  `centralQuestion` values in `seed-course-covers.mjs` were written for the
  Term Issue mockup, not by the faculty. Each teacher should supply (or
  approve) the one question their course asks, in Studio, Cover tab.
- **Course photography still wanted for course pages** (2026-10-13). The
  course card no longer shows `coverImage` (the typographic cover replaced
  it), and the course page never did, so course photos currently render
  nowhere. The field stays (never "Remove field"). Decide whether the course
  page gets a photo band once real photography exists.
- **Faculty "On my desk" lines and spoken introductions** (opened 2026-10-13,
  Term Issue PR 3). The fields exist on `facultyMember` ("This term" tab:
  `currentlyReading`, `introAudio`, `introAudioTranscript`,
  `introAudioLength`) and every surface hides them when empty, so nothing
  shows yet. Waiting on the faculty: each teacher supplies their own reading
  line (up to 100 characters) and, optionally, a one-to-two-minute recording
  WITH a full transcript (the Studio will not publish audio without one). Do
  not invent lines or quotes for them. Once a few are in, check the player on
  the live site (CSP already allows `media-src https:`).
- **Re-record `acad-*` photo credits.** The per-photo Pexels source URLs
  for the academic placeholder set live only in gitignored curation
  scratch (`scripts/_stock*`). `MANIFEST.md` currently records the set
  without per-photo links. Low stakes (Pexels needs no attribution) but
  worth restoring if the scratch still exists.
- **CSP is hand-maintained** in `public/_headers` (see CLAUDE.md gotcha
  #10). Standing risk, not a task: any new embed origin needs a manual
  edit there.

### Email backbone (starter card 127) is carried but OFF

The shared mail code, `ncsMailTools` files and `migrations/0003_mail.sql` are synced byte-identical so `sync-check` stays clean. Nothing is switched on: no `ncsMailTools()` in `sanity.config.ts`, `features.mail` unset in `kit.config.ts`, no `/api/subscribe/`, `/api/rsvp/` or newsletter routes, no `newsletter` or `rsvpSection` schema, and no MAIL_SECRET, MAIL_FROM or RESEND_API_KEY. The one live change is the contact form's email step, which now goes through `src/lib/mail-send.ts` (same message, same Cloudflare binding; Resend becomes possible later). To adopt newsletter or RSVPs, follow the starter's card 127 "Adopting it in a site".

### Editors sign in once more (starter card 129)

`sanity.config.ts` now signs the Studio in by token (`auth: { loginMethod: 'token' }`), so the kit's `/api/studio/*` routes always get the Bearer token they check. After this deploys, each editor signs out from the Studio's user menu and signs in again, once. Until they do, a kit card that cannot load says so in those words.

### The Studio look leans on four class names (card 128)

`src/sanity/studioLook.css` sets Plex Mono on the kit's eyebrows, tags and stone numbers and draws the Site Guide's lists as a numbered contents page (Home's brass pill "View the website" moved to `homeBanner.style.chip` in `kit.config.ts`, card 135). It targets the kit's class names (`.ui-eyebrow`, `.ui-tag`, `.ui-stone`, `.ui-card`). If a starter sync renames them the rules stop applying and the kit's own drawing shows; check `/kit-harness/guide/` after each sync. A `studio.look` key for numerals and a contents layout is proposed to the starter.

## Recently closed

- 2026-10-19: **The Studio drawn in the Term Issue's language** (card 128): `studio.look` in `brand/brand.config.json` (cover marker, square stones, brass rule, the shelf, the endpaper texture, the eight-colour strip, "Site Guide" in brass Fraunces italic), guide icons are meaning names (no emoji anywhere in the Studio), and the four blank block pictures (ledger stats, numbered cards, course rail, ticker) are real captures.

- 2026-10-13: **63 array items with no `_type`** (starter card 95). `npm run audit:data`
  found them on 13 documents: `sessionOutline` (courseSession) and `offerings`
  (courseOffering) on all 8 courses, `degrees`, `affiliations` and `publications` on 5
  faculty members. Backed up with `npx sanity dataset export production --raw` to
  `_backups/presacademy-2026-10-13/production-before-backfill.tar.gz` at the Projects
  root (outside the repo), dry run 63 changes / 0 unplaced, applied with
  `scripts/backfill-array-types.mjs --apply` and the production second factor, re-audit
  0 missing `_type` (2 orphan fields remain, open item above), second dry run 0. Run
  through `npx sanity exec <script> --with-user-token` with
  `PUBLIC_SANITY_PROJECT_ID=uz2sl3zp`, because the local `.env` has no write token
  for `sanity-lib`.

- 2026-10-13: **The home stats row, topics ticker and step strip** are off the
  home page in code (Term Issue PR 2: `default-sections.ts` and the migration);
  the dataset follows when the migration is applied (open item above). The
  block types stay registered.

- 2026-10-13: **Empty course-card image wells** (half of the Home P1 above).
  Term Issue PR 1: every course card is now a typographic cover
  (`CourseCover.astro`) with a derived colour and ornament when the Cover tab
  is empty, so no course renders an empty well any more, with or without a
  photo.

- 2026-08-27 — **MARKER SYNC SESSION: this repo joined the shared-file sync system.**
  `ncs-astro-sanity-starter` is the library of record (`PORTS.md` there is the registry).
  Presacademy was the source of most of these files, but the starter improved them on the
  way in, so this session pulled the canonical versions back: `scripts/free-dist.mjs`
  (bracket-safe ordinal command-line match instead of PowerShell `-like`),
  `scripts/with-workerd.mjs` (genericized header), `src/lib/contrast.ts` (comment-only;
  export surface unchanged), and `scripts/lib/sanity-lib.mjs` reconciled onto the stricter
  `scripts/lib/loadEnv.mjs`, which is new here and must travel with sanity-lib. Added
  `scripts/sync-check.mjs`. `scripts/page-parity.mjs` was left alone and given a
  PORTED-pattern note instead of a marker: it is the origin of the starter's harness and
  both copies carry site-specific normalizer rules.
  Verified: `node scripts/seed-builder-privacy.mjs` dry-run clean, `npm test` 79/79,
  `npm run build` then parity compare 13/13 PASS, `sync-check` 5/5 SAME exit 0.

- 2026-08-27 — **PAGE-BUILDER CONVERSION COMPLETE (Phase 5, cleanup + docs).**
  All thirteen singleton pages had converted on 2026-08-26 (Phases 0 through 4:
  the shared `src/components/SingletonPage.astro` renderer, ~17 ported section
  types, `src/lib/default-sections.ts` as the empty-dataset fallback,
  `scripts/page-parity.mjs` as the pixel guard, and full-fidelity `/preview` for
  every page). Phase 5 removed the scaffolding:
  - **A full dataset export was taken first**:
    `backups/pre-phase5-2026-08-26.tar.gz` (28.8 MB, 65 documents, 35 assets;
    `backups/` is gitignored). That is the restore point if a field turns out to
    have been read after all.
  - **63 superseded fields were unset across 11 documents** by the new
    `scripts/cleanup-builder-fields.mjs` (dry-run by default, `--apply` to
    write, idempotent, and it refuses to touch a document whose
    `flexibleSections` array is empty). Never the Studio's "Remove field"
    button. Per document: homePage 13, aboutPage 16, pricingPage 4,
    getStartedPage 11, forYouPage 1, coursesPage 2, eventsPage 5, faqPage 1,
    contactPage 6, privacyPage 2, accessibilityPage 2.
  - **The same fields were removed from the schemas** in the same commit, with
    five now-empty field groups (homePage and aboutPage "Page copy",
    getStartedPage "Form & scheduling", contactPage "Form intro + expectations",
    faqPage "Category order", and the two legal pages' "Content"), and the
    matching GROQ projections dropped from `src/lib/queries.ts`. Typegen re-run.
  - **What stayed, and why**: every hero, closing-CTA and SEO field (decision
    D2), plus the extras a renderer still reads: `pricingIntro` /
    `personasIntro` / `listIntro` (the hero map's intro paragraph),
    `aggregateTrustLine` (the faculty hero), `coursesPage.emptyState` +
    `facultyPage.emptyState` + `resourcesPage.emptyStateBody` (the pinned code
    regions), and the course and event DETAIL-page fields.
  - **Code retired**: `SingletonPage`'s `autoData` prop (no page ever passed
    one) and the preview route's stale "the code-owned middle renders on the
    live site only" note, now reworded for the only branch that reaches it
    (`404`).
  - **The twelve `scripts/seed-builder-*.mjs` are historical now** and carry a
    header saying so; `scripts/seed-page-copy.mjs` gained a DO NOT RUN warning,
    because applying it would write the removed fields back as unknown fields.
  - **Docs**: the plan doc is marked COMPLETE, CLAUDE.md's routes and preview
    sections say so, OPERATIONS.md's seed section is corrected, and the Studio
    guides now teach "every page's body is built from sections".

- 2026-08-26 — **Hosted Studio deleted** (Nathan, via sanity.io/manage).
  The embedded /studio is now the only Studio.
- 2026-08-26 — **Unsplash plugin re-enabled** after the Studio crash root
  cause proved it innocent (held at 7.0.15 for @sanity/ui v3 compat).
- 2026-08-26 — **Studio folded into the root package** (the WCP shape):
  `studio/` is gone; sources live in `src/sanity/`, config at the root
  `sanity.config.ts` + `sanity.cli.ts`, one node_modules. This
  permanently ends the dual-module-tree class of bug behind the day's
  Studio crashes. CI/backup/staging workflows updated; typegen runs
  from the root.

- 2026-08-25 — **Live draft preview shipped.** Studio embedded at
  `/studio`; Presentation tool with a page navigator; SSR `/preview/**`
  routes rendering drafts with click-to-edit stega; SSE auto-refresh
  proxy; fingerprint-gated draft-mode cookie. Deploy now uses the
  adapter-generated `dist/server/wrangler.json`.
- 2026-08-25 — **Automated test safety net ported from WCP**: 109
  Playwright tests (smoke, axe light+dark, focus indicators, 320-1440
  reflow), theme-token contrast unit tests, Lighthouse accessibility
  hard-gated at 1.0, CI wired. Fixed 4 real a11y bugs it caught.
- 2026-08-25 — **Studio editor-experience port**: 18 guides with
  clickable breadcrumbs, Welcome launcher, soft-delete Trash, grouped
  section insert menu, SEO + "Used on" tabs, "+ New" templates,
  drag-to-reorder lists, Checkup + New term setup tools, real dark mode.
- 2026-08-25 — **Upgraded to Astro 7 + Sanity Studio v6.**
- 2026-08-25 — **Cut loose from the church starter**: removed `modules/`
  - `docs/modules/`, `rebrand.mjs` + bootstrap configs,
    `seed-starter-content.mjs`, `seed-placeholder-images.mjs`,
    `docs/bootstrap/NEW-PROJECT.md`, the church-era placeholder photos and
    videos, the `upstream` git remote, and the dead deps (`@astrojs/mdx`,
    `@astrojs/rss`, `react-photo-album`, `yet-another-react-lightbox`,
    studio `sanity-plugin-iframe-pane`). Renamed the Studio workspace
    `churchstarter` → `presacademy`. Rewrote `README.md` and `CLAUDE.md`
    for the academy (fixing the typegen-in-build contradiction and the
    ghost component lists). Swapped the six church-era hero fallbacks to
    `acad-*` images.
- 2026-10-19: **Starter cards 130 and 133 adopted**: guide pictures are asked for by key from `src/sanity/guides/shots.ts` (empty registry, so guides show the wireframe; real captures need a signed-in Studio, still to do), and Home's ways-in tiles are 260px wide. PreviewLayout already imports the same stylesheet as BaseLayout (globals.css), so no change.
