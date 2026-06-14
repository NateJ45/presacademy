# Content data and Sanity integration

> Static identity in site.ts, everything editable in Sanity, Studio config, queries, and the typed-client flow.

## Content data and Sanity integration

The starter has two parallel content sources:

### `src/data/site.ts` — static identity (rare edits)

Hardcoded constants that don't change between deploys: domain name, GitHub repo URL, Web3Forms access key reference, Calendly URL template, brand asset paths, the `localStorage` key prefix for the theme system. A developer edits these in code when something structural shifts.

```ts
// rebrand.mjs stamps `_name` and `_domain`; derived fields auto-update.
const _name   = "The Presbyterian Academy";
const _domain = "presbyterianacademy.org";
const _slug   = slugifyName(_name); // "the-presbyterian-academy"

export const site = {
  name: _name,
  domain: _domain,
  url: `https://www.${_domain}`,
  storageKeyPrefix: _slug,        // derived — never needs manual editing
  themeStorageKey: _slug + '-theme',
  // ... etc
} as const;
```

`rebrand.mjs` only needs to stamp the two quoted `_name` and `_domain` literals.
`storageKeyPrefix` and `themeStorageKey` are derived from `_name` at module load
time, so they are always in sync and do not appear in `bootstrap.config.json`.
The domain feeds the canonical URL, OG tags, and the sitemap reference in `robots.txt`.

### Sanity — the single source of truth for all content

**All publicly-visible content lives in Sanity, and every content field is populated, so the Studio mirrors the live site exactly.** Page copy, headings, buttons/links, images, the nav menus, SEO, and contact details are all Sanity fields. Editors change content in Studio (the static site rebuilds and the change goes live); they never touch code for routine copy updates.

The inline strings in `src/pages/*.astro` are **safety-net fallbacks** (the inline-fallback pattern) that render only if a field is ever left empty, so a section can never go blank. They are not the live content — a populated Sanity field always overrides them. Repeated values are single-sourced (address/phone/email via `siteSettings`), so a change is one edit.

> **Content-editability pass (2026-06-14).** A six-agent audit found "Sanity is the single source of truth" was substantially FALSE for the school pages: large swaths of the home, about, get-started, faculty, and detail pages were hardcoded with no matching field. That pass re-schematized the singletons (see below), added the missing fields, and shipped `scripts/seed-page-copy.mjs` to mirror the live wording into Studio. The authoritative page-by-page map is now **`docs/agent/content-editability-audit.md`**; it supersedes the older "everything editable" claim in `editor-vs-hardcoded.md`.

> School re-schema note (2026-06-14): the schema set below is the lay-SCHOOL schema, not the church-starter's. The church singletons (`homePage`, `aboutPage`) were rewritten to clean school fields and the church orphan fields were removed (a GROQ check confirmed the docs held no data in them, so removal is clean — no "unknown field" warnings). The church collections (sermon, ministry, staffMember, worshipResource, etc.) and the interior-designer schemas (service, philosophyPoint, journal*) are gone; the opt-in module schemas under `docs/modules/` are not active for this project.

> **Placeholder images in the dataset (2026-06-14).** `scripts/seed-placeholder-images.mjs`
> (commit 8a644e5) seeds the dataset with placeholder imagery so the site renders fully
> while real photography is pending. It uploads placeholders and patches ONLY empty image
> fields (idempotent — it never clobbers an editor's real images): course `coverImage`s and
> page `heroImage`s come from the in-repo Pexels library (`src/assets/placeholders/teach-*`,
> `study-*`, `community-*`); faculty `photo`s come from `pravatar.cc`. Run
> `node scripts/seed-placeholder-images.mjs` for a dry run, add `--apply` to write; the
> initial apply patched 22 docs (8 course covers, 5 faculty portraits, 9 page heroes incl.
> home). The editor replaces these with real photography later. Full detail in `images.md`.
> (Static deploys show them only after a rebuild; the dev server shows them immediately.)

> **Seed page copy into Studio (2026-06-14).** `scripts/seed-page-copy.mjs` mirrors the
> live wording into Studio so the Studio matches the live site after the re-schema. It
> writes the current inline-fallback copy from `index.astro` / `about.astro` (and a few
> get-started / faculty / siteSettings fields) into any EMPTY field on the `homePage`,
> `aboutPage`, `getStartedPage`, `facultyPage`, and `siteSettings` (`funder`) docs. It is
> only-empty (never clobbers copy an editor changed) and idempotent. Run
> `node scripts/seed-page-copy.mjs` for a dry run, add `--apply` to write, then
> `npm run studio:deploy`. Run it once after deploying the new home/about schema. This is
> the companion to the editability pass: the new fields are empty until this runs, so
> Studio would otherwise show blanks where the live site shows real copy.

**Settings and globals:**
- `siteSettings` (singleton) — school name, tagline, mission, public email + phone, **street address** (`addressLine` + `cityStateZip`), social links; a **`funder`** string (renders the footer line "Made possible by the [name]" on every page; clear it to hide the line); a **Navigation (menus)** group (`navItems` header menu + `footerColumns` footer columns); a **`favicon`** image; a **Connect & integrations** group (watch / give / app / directory / registration / prayer URLs); and a newsletter config. Phone + address surface site-wide (tap-to-call, header bar, footer, map links) and feed the LocalBusiness JSON-LD. Every field falls back to `src/data/site.ts` when blank.

**School catalog collections:**
- `course` — the catalog (title, syllabus copy, `coverImage`, sessions, `schedule`, `seatsNote`, pricing `tier` reference, instructor references, `teachingArea`, `term`, `featured`, `syllabusUrl` from an uploaded file). Drives `/courses` + `/courses/[slug]`.
- `facultyMember` — instructors (name, `photo`, degrees, `denomination`/`ordination`, `yearsTeaching`, `specializations`, `email`, bio, publications). Drives `/faculty` + `/faculty/[slug]`.
- `term` — academic terms (the date/term/city the home "next cohort" line and course schedules derive from).
- `pricingTier` — named price tiers referenced by courses and shown on `/pricing`.
- `teachingArea` — the subject taxonomy courses are tagged with.
- `testimonial` — student quotes (with `featured`) shown in the home testimonials strip.
- `event` — info sessions, lectures, term starts (audience, cost, registration, contact, `allDay`, `featuredOnHome`). Drives `/events` + `/events/[slug]`.
- `faqItem` + `faqCategory` — FAQ questions (question, Portable Text answer, category, displayOrder); drive the FAQ page, grouped by `faqPage.categoryOrder`.
- `form` — configurable contact/inquiry forms (native field builder OR external embed); referenced from contact / get-started and droppable as a page block.
- `announcement` — scheduled site banner (enabled + date window, info/special/urgent style).
- `ctaBlock` — reusable object type (label + linkType + target) embedded in other schemas.

**Page singletons:**
- Core: `homePage`, `aboutPage`, `faqPage`, `contactPage`, `eventsPage`, `privacyPage`, `notFoundPage`. `homePage` and `aboutPage` were rewritten to school fields in the 2026-06-14 editability pass — see the field groups below.
- Per-page school singletons (via the `definePageSingleton` factory, in `schoolPages.ts`): `coursesPage`, `facultyPage`, `pricingPage`, `getStartedPage`, `forYouPage`, `resourcesPage`.
- `page` — generic type for brand-new pages at `/<slug>`, built entirely from the block library.

`homePage` field groups (school): hero (eyebrow / headline / subhead / `heroImages[]` / button labels / `nextCohortLabel`); page copy (`wayfinding[]`, `stats[]` with per-stat count-up, `tickerTopics[]`, plus eyebrow + headline + link-label fields for the Start-here / Courses / Faculty / Testimonials strips — the strips' CARDS still come from the catalog collections); `flexibleSections[]`; closing `finalCta*`; SEO. `aboutPage` field groups: hero; page copy (`mission*`, `believe*` + a `beliefs[]` array + `believeFootnote`, `teach*`, `why*`, `facultyBand*`); `flexibleSections[]`; closing `finalCta*`; SEO. The factory-built school singletons share `seoTitle`/`seoDescription`, a `heroImage` (with alt), a `heroKeyword` accent, a `flexibleSections[]` page-builder array, and `finalCta*` closing copy, plus per-page extras (e.g. `getStartedPage` adds `requestEyebrow`/`requestHeadline`/`requestBody` and the Calendly fields; `facultyPage` adds an `emptyState`). Every field falls back to the literal in its `.astro` page when empty, so the live design is unchanged until edited. The block library (`studio/schemaTypes/blocks.ts`) and the background/media system are shared across every page; see `page-architecture.md`.

**Previously-orphaned detail fields now rendered** (closed in the editability pass): course `syllabusUrl` / `seatsNote` / pricing-`tier` unit; faculty `specializations` / `yearsTeaching` / `email`; event `allDay`. These existed in the schema but had no template output before.

**In-Studio help** ("How This Works") is NOT a Sanity singleton — it's repo-based, locked code (`studio/guides/content.tsx` + `studio/components/GuideView.tsx`), which replaces the old `studioGuide`/`studioNotes`/`studioPlaybook` singletons.

### The deploy rule (read this first)

**Run `npm run studio:deploy` after ANY schema change.** Skip it and the hosted Studio shows "unknown fields" next to a "Remove field" prompt. **Never click "Remove field":** it deletes that field's data across every document and cannot be undone without a dataset restore. Correct sequence: edit schema, `npm run typegen`, `npm run studio:deploy`, commit.

### Env-driven config and the graceful-empty build

The Sanity client is configured entirely from environment variables:

```
PUBLIC_SANITY_PROJECT_ID=your-project-id
PUBLIC_SANITY_DATASET=production
```

`src/lib/sanity.ts` exports `sanityFetch(query, params, fallback)`. When `PUBLIC_SANITY_PROJECT_ID` is absent or set to the placeholder value `"your-project-id"`, `sanityFetch` returns the fallback without any network call. This means `npm run build` succeeds on a fresh clone with no Sanity project configured -- pages render empty-state content. Configure the env vars when you have a real Sanity project; until then the build is safe to run.

```ts
// src/lib/sanity.ts (abbreviated)
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  fallback: T
): Promise<T> {
  if (isSanityUnconfigured()) return fallback;
  return client.fetch<T>(query, params);
}
```

The `isSanityUnconfigured` guard and the fallback pattern are load-bearing. Do not remove them.

### Typed client and committed types

The Sanity client is at `src/lib/sanity.ts`. It exports both `client` (the typed CDN client for queries) and `urlFor()` (for building image URLs from asset references).

`npm run typegen` runs `sanity typegen generate` against the schemas in `studio/schemaTypes/` and writes `src/lib/sanity.types.ts`. That file is committed to the repo so collaborators get full type safety without needing to run typegen themselves. Run `npm run typegen` locally after any schema change before testing.

All GROQ queries live in `src/lib/queries.ts`. Each page has a typed query function that pulls the singleton plus any auto-populated collections it needs.

### Section visibility rule

`siteSettings` has a `sectionVisibility` object field. `src/lib/sectionVisibility.ts` exports `getSectionVisibility(raw)`, which converts the raw Sanity object into a flat boolean map. The critical rule: `value !== false`. Undefined, null, or true all produce true (visible). Only an explicit false produces false (hidden). This rule is what makes a freshly-configured project safe to deploy before all optional sections have content.

### Studio configuration notes

**All-fields default.** The `default: true` property is removed from every schema field group definition. Without it, Studio opens documents on the "All fields" tab instead of a single group, so editors see everything without needing to know which group a field lives in.

**Studio branding.** `studio/sanity.config.ts` sets the Studio title, the brand theme (the green Direction A palette: Geneva Green accent / near-white paper surfaces / soft near-black ink + a deep forest-green top bar, with the site's serif display Fraunces over a humanist sans body Source Sans 3), a logo (`studio.components.logo` = the church mark + wordmark), and a layout wrapper (`studio.components.layout` = `StudioLayout`, which injects the brand web fonts). Replace the title / theme / logo for each project.

**No document preview.** This is a static site (`output: 'static'`) with no draft-preview environment, so documents show the **form only** — there is no iframe "Preview" tab. The old one loaded the last PUBLISHED build (not the editor's draft) and only changed after a rebuild, which misled editors. `urlForDoc` / `SITE_URL_FOR_PREVIEW` stay in `sanity.config.ts` as hooks if a real preview (SSR deploy + Sanity's Presentation tool + draft-mode `sanityFetch`) is added later.

**"View on the live site" help banner (2026-06-14).** Standing in for the missing preview tab, a per-document banner sits at the top of every form: "You are editing: [title]", the publish-to-live reminder, and a button that opens that document's page on the live site. It is `studio/components/PageHelpBanner.tsx`, wired through `studio/components/StudioFormInput.tsx` — Sanity allows only ONE component at `form.components.input`, so `StudioFormInput` composes two aids in that single slot: at the document root (`props.id === 'root'`) it prepends the banner; for every other field it delegates to the existing `CharacterCountInput`. The banner links via `LIVE_SITE_URL` in `sanity.config.ts`, a constant kept deliberately independent of `SITE_URL_FOR_PREVIEW` (which may point at localhost in dev) so the deployed Studio always sends editors to the real site. `urlForDoc` was split into `pathForDoc(type, doc)` (path only, shared with the banner) + the base URL. `PageHelpBanner` returns null for docs with no public page (e.g. Site Settings). Stamp `LIVE_SITE_URL` with the project domain at rebrand.

**Document badges fix.** `studio/components/documentBadges.tsx` (the "Featured" / "Needs a photo" / "Add SEO" status pills, registered via `document.badges`) had its `SEO_PAGE_TYPES` and `PHOTO_FIELD` lists pointing at deleted church types. They now list the live SCHOOL types (`homePage`, `aboutPage`, `coursesPage`, `facultyPage`, `pricingPage`, `getStartedPage`, `forYouPage`, `resourcesPage`, `eventsPage`, `faqPage`, `contactPage`, `privacyPage` for SEO; `course.coverImage` / `facultyMember.photo` / `event.image` for the photo check).

**SEO length warnings.** `.warning()` validations on `seoTitle` (warns around 60 characters) and `seoDescription` (warns around 160 characters) across all page singletons (the core ones plus the factory-built school singletons). Editors see an amber warning if the text is getting too long for Google to show in full. A warning, not an error, so it does not block publishing.

**Vision/GROQ plugin gating.** The `visionTool()` plugin (the in-Studio GROQ query runner) is conditionally registered only when `process.env.NODE_ENV !== 'production'`. The Vision tab appears in local dev Studio but does not clutter the hosted editor.

### Auto-populated lists

Several pages pull their content from collections automatically:
- Courses on `/courses`: `course` documents, filterable by `teachingArea` / instructor / `term`; `featured` ones surface in the home Start-here rail.
- Faculty on `/faculty`: `facultyMember` documents; each course links to the instructor(s) who teach it.
- Events on `/events`: upcoming `event` documents by date; `featuredOnHome` ones appear on the home page.
- Testimonials in the home testimonials strip: `testimonial` documents (`featured` first).
- FAQs on the FAQ page: `faqItem` documents grouped by `category`, in the order defined in `faqPage.categoryOrder`.
- The site banner: the single enabled `announcement` within its date window (resolved at build).

This means adding an `event` with `featuredOnHome: true` makes it appear on both `/events` and the home page without touching any other document.

### Canvas (AI-assisted writing)

[Sanity Canvas](https://www.sanity.io/docs/canvas) is a separate workspace from Studio -- an AI-assisted free-form drafting tool that creates drafts in the production dataset. Editors use it for longer content; drafts flow into Studio for review and publish.

Two schema-level controls govern what Canvas sees:

**Excluded from Canvas entirely** (`options.canvasApp.exclude: true`):
- All page singletons + the generic `page` -- marketing copy is structural; edit fields directly in Studio.
- `siteSettings` -- configuration, not prose.

**Available in Canvas with per-field voice hints** (`options.canvasApp.purpose`):
- `faqItem` -- question, answer (the `purpose` strings carry the warm, plain-English church voice).

The `purpose` strings carry compressed voice guidance for each field. These are NOT a hard guardrail -- editors should still apply the project voice in review.

**Deploying Canvas annotation changes:** run `npm run studio:deploy`. Canvas reads the deployed Studio schema, so new `canvasApp.purpose` or `exclude` changes need a Studio redeploy to take effect.

**Activating Canvas** for the project (one-time): the toggle lives in [manage.sanity.io](https://manage.sanity.io) under the project's Canvas section.
