# Component organization

> Build order, the core component catalog, long-read layout, and component conventions.

## Component organization

When building UI, reach for components in this order:

1. Existing components in `src/components/` that already match this site's design
2. shadcn/ui primitives in `src/components/ui/`
3. Aceternity UI for motion-rich blocks (hero, bento, parallax) where the design calls for them
4. Magic UI for smaller flourishes (marquee, animated text)
5. Custom build only if nothing above fits

File naming:

- PascalCase for top-level components (`Hero.astro`, `ServiceCard.astro`, `JournalCard.astro`)
- kebab-case for shadcn primitives in `src/components/ui/` (matches shadcn CLI convention)

### Radix-based primitives need `client:only="react"`

shadcn primitives that wrap Radix's Dialog (Sheet, Dialog, DropdownMenu with portal positioning) don't SSR cleanly inside Astro. The portal hook calls during server render throw "Invalid hook call" and blank the page. When a new component leans on those, hydrate it with `client:only="react"` instead of `client:load`. The mobile nav is the existing reference.

### Button variants

The primary CTA button extends `src/components/ui/button.tsx` with `variant="brand"` + `size="cta"`. In Direction A the brand fill is Geneva Green (`bg-primary`) with white text; secondary is an outline (green border + green label on light, cream-on-dark via the `onDark` prop). Don't override the shadcn defaults inline. Leave other shadcn variants unmodified so future `npx shadcn add` commands don't fight with extensions.

### Core components

The core component set, by role. All in `src/components/` unless noted.

**Page chrome:**
- `Header.astro` -- two-row desktop (utility bar + main nav), single-row mobile. Sticky-with-hide-on-scroll-down behavior wired via `.site-header`. The utility bar carries **live enrollment status** -- it queries the soonest upcoming term via `getNextTerm()` and shows "Now enrolling · {term} begins {date}" with a pulsing `.enroll-dot` (links to `/courses`), falling back to `settings.tagline` when no term is scheduled -- plus tap-to-call, a "Request info" link, and the theme toggle. On mobile the enrollment line collapses to a short form (just the term title) and the phone number / city hide. The bar runs on all viewports (cream on deep green).
- `Footer.astro` -- a printed-book **colophon** (the bookish brand idiom): an oversized Fraunces wordmark masthead + mission + two CTAs; an editorial imprint row (where-we-meet/contact, the editor-managed nav index, follow-along, each column under a brass eyebrow rule); a funding-acknowledgment line ("Made possible by the {funder}", driven by `siteSettings.funder`); and a colophon bar (a "PA" monogram seal, locality + denomination, auto-year copyright, legal links, and the always-shown designer credit). The "Set in Fraunces & Source Sans 3" typeface credit was removed (a printed-book touch that read as out of place). Faint graph-paper dot texture sits on the green band. Optional newsletter signup mounts above the masthead when `siteSettings.newsletter.enabled`.
- `MobileNav.tsx` -- shadcn Sheet drawer (`client:only="react"` -- Radix portal can't SSR). Primary CTA, tagline, nav links, email + phone + socials + theme toggle, logo at bottom.
- `BaseLayout.astro` -- anti-FOUC theme bootstrap, View Transitions, Lenis init, scroll-reveal observer, sticky-header scroll listener.

**Hero + page-top:**
- `Hero.astro` -- image variant (full-bleed photo + gradient overlay) OR text variant (delegates to SectionHeading). Accepts `backgroundImage` for a single Sanity image or `backgroundImages` array for a cross-fading slideshow (falls back to single image for non-home pages). Image variant passes `onDark` to CTAs automatically. On the home page (`size="tall"`) it fills the viewport below the sticky header and shows a soft pulsing scroll cue.
- `HeroBackground.astro` -- the FULL-BLEED hero background layer. Renders a single static `SanityImage` for 0-1 images, or a JS-driven cross-fading Ken Burns slideshow for 2+. Used only by `Hero.astro` (interior-page heroes).
- `HeroSlideshow.astro` -- the HOME split-hero's framed image slideshow (the `aspect-[3/2] lg:aspect-[4/5]` box beside the headline, in `index.astro`). CSS-ONLY Ken Burns cross-fade + slow pan-zoom, with the `@keyframes` stops and each slide's `animation-delay` GENERATED from the image count (no interval timer). Reads `homePage.heroImages`: 0 -> empty well, 1 -> static, 2+ -> slideshow. First slide eager/LCP, the rest lazy + decorative; reduced-motion shows a still first frame. Serves 4:5-CROPPED variants (`height=width*1.25`) so the tall portrait crop stays crisp, which means **hero source images must be high-res** (~2000px+; low-res sources pixelate in the crop). Distinct from `HeroBackground.astro` (full-bleed, JS-driven). Added 2026-06-14 (4:5 crop-serve + high-res sourcing added the same day).
- `ShowcaseMedia.astro` -- the inner content of a framed media slot: a looping muted video, OR a cross-fading Ken Burns slideshow (2+ images), OR a single static image, in that priority order. Does NOT draw the frame itself; the caller supplies the `position:relative` framed container. Reuses the global `.hero-slideshow` / `.hero-slide` CSS; its advance script is multi-instance safe (drives every `[data-arch-slideshow]` on the page with its own timer, plays/pauses `[data-arch-video]` by `prefers-reduced-motion`, re-wires on `astro:page-load`). Requests images at width 1600 so the constant Ken Burns zoom stays crisp on retina. Used by the `sectionMediaShowcase` block (`MediaShowcaseBlock.astro`). **Renamed 2026-06-15 from `ArchMedia.astro`**; the retired arch frame is now a plain `rounded-lg` frame. (Supersedes the old `HeroArchSlideshow.astro`.) The home hero is the separate `HeroSlideshow.astro`.
- `SectionHeading.astro` -- rubric eyebrow (the `.eyebrow` green leading rule, Direction A signature) + headline + subhead. Used by text-variant Hero and every interior section heading. Supports `tone="inverse"` for dark panels (switches the rubric to `.eyebrow-inverse` brass). Accepts `scriptAccent?` for the optional calligraphic accent word (see `docs/agent/polish-layer.md`).
- `FinalCta.astro` -- the closing call-to-action band (now a green `chapel` band; passes `onDark` to its CTAs automatically). Its eyebrow is **centered**, so it deliberately does NOT use the `.eyebrow` / `.eyebrow-inverse` classes: those draw a left-aligned LEADING rule via `::before`, which doubled up with the centered brass "close mark" rule right below it. The eyebrow is a plain centered label, and the single centered brass hairline (`h-px w-12`) is the only rule. Reveals its content via `[data-reveal]`.
- `ReadingProgress.astro` -- fixed 3px accent track at the top of `<article>`-wrapped pages. Used on journal posts.

**Marketing cards (all share the brand-stripe + resting-shadow rhythm):**
- `CourseCard.astro` -- catalog + home-strip course card. **Responsive shape:** on mobile it is a compact row -- a square cover thumbnail beside the text (`grid grid-cols-[7rem_1fr] items-start gap-4`, cover `aspect-square`, smaller `text-h5` title) so the catalog and the home course strips stay quick to scroll; from `sm` up it switches to `sm:block` and becomes the full Rule & Ledger card with the `aspect-[3/2]` cover banner on top and the `text-h4` title. Cover uses the `.img-zoom` + `.img-tint-evergreen` green-duotone hover. The `sizes` attr tracks both shapes (`7rem` on mobile, up to `360px` on desktop). Carries the brass `bg-gold` top stripe (hover -> `bg-primary`), the teaching-area eyebrow, and a status pill.
- `FacultyCard.astro` -- faculty index card; a compact 96px-thumbnail row (already compact, not changed in the mobile audit).
- `ServiceCard.astro` -- service tier (price + features + best-for + CTA).
- `JournalCard.astro` -- journal index card (featured variant spans 2 cols). Hero image uses `.img-zoom` + `.img-tint-light` hover treatment.
- `TestimonialCard.astro` -- quote card with monogram fallback when no photo. Renders a project link when `relatedProject` reference is set.
- `FeaturedTestimonial.astro` -- large editorial pull-quote variant of TestimonialCard.

**Home page featured sections:**

The home and about pages' built-in sections are now **editor-driven**: their schemas were rewritten from church to school fields (home: wayfinding / stats / ticker / strip eyebrow-heading pairs / hero button labels / next-cohort label; about: mission / beliefs / how-we-teach / why / faculty-band), and each `.astro` section reads its Sanity field with the current literal as an inline fallback. A seed script (`scripts/seed-page-copy.mjs`) populated the fields so Studio mirrors the live site. Full map: `content-editability-audit.md`.

- `FeaturedJournal.astro` -- hero journal entry + companion panel layout. Feeds off `featured: boolean` on `journalEntry`. Queries order `featured desc, publishedAt desc` capped at 4. Suppresses entirely when the collection is empty; degrades to a centered single-hero spread when there is only one item. (Journal is a church-era module, not active in this school build.)

**Gotcha -- bottom-anchored overlay vs. image height.** Hero cards that pin title blocks to `absolute bottom-0` of an image will clip the top of the overlay if the overlay content is taller than the image. Two levers: a portrait mobile aspect (`4/5`, never wide) and capping the desktop case at `16/10`. If eyebrow chips vanish above a hero image, this is why.

**Gotcha -- big single images go full-width-huge when a two-column section collapses on mobile.** A tall portrait image (e.g. `aspect-[4/5]` or `5/6`) that sits in one column of a desktop two-up grid becomes a screen-filling slab once the grid stacks to one column on mobile. The fix (commit 54d6f2f) is a per-breakpoint aspect: the HOME split-hero image is `aspect-[3/2] lg:aspect-[4/5]` (landscape on mobile, portrait from lg), the 404 photo is `aspect-[3/2] md:aspect-[5/6]` (and goes text-first on mobile -- the figure drops `order-first`), and the FACULTY-DETAIL portrait is capped to `mx-auto w-full max-w-[240px] lg:max-w-none` (centered 240px on mobile, full in its 300px rail from lg). CourseCard takes the more aggressive route above (compact thumbnail row on mobile). Keep the `sizes` attr in step with whichever shape wins at each breakpoint.

### Long-read layout (journal detail)

`/journal/[slug]` uses a long-read structure suitable for editorial content:

1. **Article header** -- eyebrow line, h1, excerpt/subtitle, meta (date, reading time, categories). Lives in a `max-w-3xl mx-auto` block.
2. **Cover image** -- `max-w-4xl mx-auto px-m` (~896 px), `<SanityImage width={1800} loading="eager" sizes="(min-width: 920px) 896px, 100vw">`. Reads as an editorial feature, not a billboard.
3. **Body grid with optional TOC** -- extract h2/h3/h4 headings via `extractHeadings(body)`, set `hasToc = headings.length > 0`, then use this grid template:
   ```astro
   <div class:list={[
     'mx-auto max-w-content px-m py-section-lg grid grid-cols-1 gap-section-md lg:justify-center',
     hasToc
       ? 'lg:grid-cols-[260px_minmax(0,48rem)]'
       : 'lg:grid-cols-[minmax(0,48rem)]',
   ]}>
     {hasToc && <CaseStudyTOC client:idle headings={headings} />}
     <article>...</article>
   </div>
   ```
   `lg:justify-center` is critical -- without it the grid left-aligns within the section and leaves all empty space on the right (was a real visual bug).
4. **Related** -- related-posts grid, related project link if the entry has a `relatedProject` reference.
5. **Prev/next nav** -- wraps the rest in a `border-t` strip.
6. **Sticky CTA chip** -- per-surface label from `journalPage.stickyCtaLabel` in Sanity.

The Portable Text renderer (`JournalPortableText.tsx`) detects image orientation from the Sanity asset `_ref` and applies different figure widths -- portrait shots cap at `max-w-[600px] mx-auto`, landscape shots fill or extend the column per the editor's chosen size variant. See [Portrait orientation caps](images.md#portrait-orientation-caps).

**Module-specific detail layouts** (portfolio/case study, before/after, shop, etc.) live under `modules/` and are documented in `docs/modules/`. The long-read grid pattern above is shared between the journal and any module that adds a long-form detail page.

**Contact page pieces:**
- `ContactForm.tsx` -- Name / Email / Phone / Message, plus any project-specific fields. See form section in `docs/agent/sanity.md`.
- `CopyEmailButton.tsx` -- mailto link + clipboard fallback.
- `CalendlyInline.tsx` -- click-to-load Calendly iframe placeholder. Heavy widget stays off the budget until the visitor opts in.

**Site-wide affordances:**
- `StickyCTAChip.tsx` -- bottom-floating brand pill that appears past 50% scroll on long pages. Simple threshold-based visibility with a 2% hysteresis band. Positioning: always `bottom-[5.5rem]` (above the BackToTop button at `bottom-6`). Labels are Sanity-editable via the page singleton's `stickyCtaLabel` field; empty string hides the chip.
- `SectionDivider.astro` -- brand ornament between sections that share a background color (variants: `ornament` (default) / `line` / `dots`).
- `JournalPortableText.tsx` -- journal body renderer with custom block types (pullQuote, beforeAfter, sourceCard, tipCallout, imageGallery, divider, videoEmbed) + a `sourcedFrom` annotation mark for inline vendor mentions. Adds the `.prose-drop-cap` float cap to the first paragraph and renders blockquotes as `.prose-blockquote`.
- `FaqAccordion.tsx` -- shadcn Accordion wrapper. **Note:** `src/components/ui/accordion.tsx` is customized -- the original `h-(--radix-accordion-content-height)` lock on the inner content div was removed (caused a big empty-space bug after expand), and the trigger no longer carries `text-sm font-medium` so consumer typography wins the cascade. If you reinstall via `npx shadcn add` it will revert; reapply both changes.
- `ThemeToggle.tsx`, `BackToTop.tsx`, `SanityImage.astro`, `CtaLink.astro`.

**Sanity Studio components (in `studio/components/`):**
- `GuideView.tsx` -- renders one "How This Works" help guide as a read-only desk pane. Content is repo-based data in `studio/guides/content.tsx` (12 plain-English guides for church staff); the guide to show is chosen per desk item via `.options({ guideSlug })`. Replaces the interior-designer "Start Here" handbook (the old `StudioGuide` / `BusinessOverview` / `BrandKit` / `StudioPlaybook` panels and their `studioGuide` / `studioNotes` / `studioPlaybook` singletons were removed in the remodel).
- `StudioLogo.tsx` -- the Studio header logo: the church building mark (same image as the favicon, `church-mark.png`) on a paper chip next to the church wordmark in the display serif, wired via `studio.components.logo`.
- `StudioLayout.tsx` -- wraps the Studio (`studio.components.layout`) to inject the brand web fonts so the themed serif families resolve.
- `StudioFormInput.tsx` -- the single global form input registered at `form.components.input` (Sanity allows only one). It composes two editor aids: at the document root (`props.id === 'root'`) it prepends `PageHelpBanner`; for every other field it delegates to `CharacterCountInput`.
- `PageHelpBanner.tsx` -- the per-document "View on the live site" help banner shown at the top of every page form. Names what the editor is editing, deep-links to that page on the production site (`pathForDoc(type, doc)` + `LIVE_SITE_URL` from `sanity.config.ts`), and carries the publish-to-live reminder. Returns null for documents with no public page (e.g. Site Settings). This is the static-site stand-in for Sanity's Presentation click-to-edit overlay, which needs SSR and can't run on this `output: 'static'` build (see `content-editability-audit.md`).
- `CharacterCountInput.tsx` -- live character counter under any capped text field (SEO title / description); a transparent pass-through for everything else. No longer registered directly -- it is now reached through `StudioFormInput` (the single `form.components.input` slot).
- `documentBadges.tsx` -- at-a-glance status badges (Featured / Needs a photo / Add SEO) shown next to the publish status. Its `SEO_PAGE_TYPES` and `PHOTO_FIELD` lists were fixed to the live school types (`course` / `facultyMember` / `event` + the school page singletons); they previously referenced deleted church types, so the photo/SEO badges did nothing.

The "How This Works" section is pinned at the top of `studio/structure.ts`, one navigable pane per guide. Because the guides are code (not singletons), staff cannot edit or delete them and every template clone inherits them. The Studio theme + fonts are configured in `studio/sanity.config.ts`.

The desktop nav dropdowns live directly in `Header.astro` as SSR'd `<details>` (see `docs/agent/page-architecture.md`), not as a React island.

### CtaLink `onDark` prop

`src/components/CtaLink.astro` accepts an `onDark?: boolean` prop. When true:
- **Secondary variant** swaps from `border-primary text-link` (brand accent on light) to `border-white/70 text-white hover:bg-white/10` (cream on dark).
- **Focus ring** offsets against `transparent` instead of `--background` so the ring still reads on photographic surfaces.

Use it on any CTA over a hero image, a green chapel band, or any dark panel. `Hero.astro` (image variant) and `FinalCta.astro` (now a green band) set it automatically. Do NOT try to override secondary-variant colors via `class="text-bg ..."` -- Tailwind v4 generates utilities alphabetically and `text-link` beats `text-bg` in the cascade. Use the prop instead.

### Mobile-only alignment pattern

Sections that center on mobile but stay left-aligned on desktop use `class="text-center md:text-left"` on the text container, plus `class="justify-center md:justify-start"` on any CTA `<div>` underneath. Apply this where content reads as "floating" on mobile without visual neighbors to anchor it -- heroes, card grids, and form blocks generally stay left-aligned.
