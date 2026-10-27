// Foundation, edit with care
// GROQ queries per page + church collections. Each function returns the page
// singleton plus any auto-populated collections that page needs.
//
// Remodel note: the interior-designer queries (services, projects/portfolio,
// journal, press, business siteSettings fields, designer homePage/aboutPage
// groups) were removed. Church collections (staff, ministries) were added.
//
// Types: until `sanity typegen generate` runs, return types are `any`.
// Run `npm run typegen` after schema changes to regenerate src/lib/sanity.types.ts.

import { sanityFetch } from './sanity';

// Common Portable Text + image projection shorthand
export const IMAGE_PROJECTION = `{
  ...,
  asset->,
  "alt": coalesce(alt, asset->altText, "")
}`;

const CTA_PROJECTION = `{
  ...,
  internalLink->{ _type, "slug": slug.current }
}`;

// Configurable form (native fields or external embed). Dereferenced wherever a
// page references a form.
//
// Deliberately NO `provider`: since 2026-10-13 every native form posts to the
// site's own /api/contact/ endpoint (starter card 45), so the old Web3Forms
// settings are unused, and projecting them would serialize a stored access key
// into the page HTML as an island prop.
const FORM_PROJECTION = `{
  _id, title, "slug": slug.current, heading, intro, mode,
  fields[]{ label, name, type, required, placeholder, helpText, options, width },
  submitLabel, successMessage, consentNote,
  embedUrl, embedHtml
}`;

// Page-builder block members (flexibleSections[] / page.sections[]). Resolves
// image + form references; other blocks carry their fields via the spread.
// SECTION_ARMS is the body, so a synced section (the authoring kit, PORTS.md
// card 109) can run its saved sections through exactly the same arms.
const SECTION_ARMS = `
  background{ ..., image${IMAGE_PROJECTION} },
  _type == "sectionImageText" => { image${IMAGE_PROJECTION} },
  _type == "sectionFeatureCards" => { cards[]{ ..., image${IMAGE_PROJECTION} } },
  _type == "sectionGallery" => { images[]${IMAGE_PROJECTION} },
  _type == "sectionMediaShowcase" => {
    images[]${IMAGE_PROJECTION},
    video{ asset->{ url, mimeType } },
    videoPoster${IMAGE_PROJECTION}
  },
  _type == "sectionForm" => { form->${FORM_PROJECTION} },
  // Get Started's request panel carries a form reference of its own (2026-08-26).
  _type == "sectionRequestPanel" => { form->${FORM_PROJECTION} },
  _type == "sectionFaqList" => {
    // Resolve the optional categoryRef so the block component gets the title.
    "categoryFilter": coalesce(categoryRef->title, categoryString)
  },
  _type == "sectionResources" => {
    items[]{ ..., file{ asset->{ url, originalFilename, size, extension, mimeType } } }
  },
  // Ported page sections (Rule & Ledger), 2026-08-26. Each card carries its own
  // CTA, so the internal-link reference has to be resolved per card or
  // CtaLink.astro cannot map the document type to a route.
  _type == "sectionNumberedCards" => {
    cards[]{ ..., cta${CTA_PROJECTION} }
  },
  // The Term Issue's "For pastors" band (PR 4, 2026-10-13): the bulletin
  // insert PDF, resolved so the block can print its link with type and size.
  _type == "sectionForPastors" => {
    insertPdf{ asset->{ url, originalFilename, size, extension, mimeType } }
  },
  // The starter's builder kit (src/sanity/schemaTypes/builderSections.ts, PORTS.md
  // cards 173 and 193; refoundation phase B, 2026-10-27). Columns, fold-outs, tabs,
  // the schedule, the contact card and the calendar buttons carry no image or
  // button, so they need no arm.
  _type == "buttonRowSection" => { links[]{ ..., link${CTA_PROJECTION} } },
  _type == "photoSection" => { image${IMAGE_PROJECTION} },
  _type == "countdownSection" => { link${CTA_PROJECTION} },
  _type == "noticeSection" => { link${CTA_PROJECTION} },
  _type == "timelineSection" => { entries[]{ ..., image${IMAGE_PROJECTION} } },
  _type == "letterSection" => { signature${IMAGE_PROJECTION}, link${CTA_PROJECTION} },
  _type == "eventDetailsSection" => { image${IMAGE_PROJECTION}, button${CTA_PROJECTION} },
  _type == "photoCardsSection" => {
    cards[]{ ..., image${IMAGE_PROJECTION}, link${CTA_PROJECTION} }
  },
  _type == "iconCardsSection" => {
    cards[]{ ..., image${IMAGE_PROJECTION}, link${CTA_PROJECTION} }
  },
  _type == "stepsRailSection" => {
    steps[]{ ..., link${CTA_PROJECTION} },
    link${CTA_PROJECTION}
  },
  _type == "hubSection" => {
    groups[]{ ..., cards[]{ ..., image${IMAGE_PROJECTION}, link${CTA_PROJECTION} } }
  }`;

// A synced section holds only a reference to a saved section; resolve it into
// `sections` here, and SectionRenderer.astro swaps the block for them in place
// (expandSyncedSections in src/lib/authoring.ts). One level only: a saved
// section cannot hold a synced section. A missing one resolves to null and
// renders nothing.
export const SECTION_MEMBERS = `{
  ...,
  ${SECTION_ARMS},
  _type == "syncedSection" => {
    "presetTitle": preset->title,
    "sections": preset->section[]{
      ...,
      ${SECTION_ARMS}
    }
  }
}`;

// One menu link (schemaTypes/navLink.ts), as every menu needs it: the label,
// the hand-typed address that older items still carry, and the picked page
// DEREFERENCED down to a type + slug. src/lib/nav-href.ts turns that into an
// href. The field list is separate from the braces so it can also be spread
// into a projection that adds children (navItems' dropdown groups).
// The `archived != true` guard: a menu link pointing at a page that was moved
// to the trash resolves to nothing, and nav-href.ts DROPS a link that resolves
// to nothing rather than rendering a dead one. Singletons carry no `archived`
// field at all, which reads the same as "not archived", so they are untouched.
const NAV_LINK_FIELDS = `_key, _type, label, linkType, href, externalUrl,
    "slug": select(internalPage->archived != true => internalPage->slug.current),
    "docType": select(internalPage->archived != true => internalPage->_type)`;
export const NAV_LINK_PROJECTION = `{ ${NAV_LINK_FIELDS} }`;

// ---- Site settings (used in BaseLayout / Header / Footer) -----------------

// Module-level memoized promise. The first call in a given build process fires
// the actual Sanity fetch; every subsequent call (BaseLayout, Header, Footer,
// JSON-LD schema, each page that needs the address) returns the same promise,
// collapsing N per-page calls into a single network request.
let _siteSettingsPromise: Promise<any> | null = null;

// Exported so the preview shell (src/layouts/PreviewLayout.astro) fetches the
// chrome through the SAME projection. It used to fetch the raw document, which
// left every dereferenced menu link null in the preview.
export const SITE_SETTINGS_PROJECTION = `{
    title,
    tagline,
    mission,
    funder,
    email,
    pastorEmail,
    phone,
    officeHours,
    // Card 196 (phase D): the office facts' confirmed flags, hours by day and closures.
    phoneConfirmed,
    emailConfirmed,
    addressConfirmed,
    findUs,
    openingHours,
    hoursChanges,
    hoursNote,
    favicon${IMAGE_PROJECTION},
    logo${IMAGE_PROJECTION},
    addressLine,
    cityStateZip,
    geoLat,
    geoLng,
    worshipService,
    watchUrl,
    giveUrl,
    appUrl,
    directoryUrl,
    registrationBaseUrl,
    prayerUrl,
    socialInstagram,
    socialFacebook,
    socialYoutube,
    seoImage${IMAGE_PROJECTION},
    footerCredit,
    footerCreditUrl,
    newsletter,
    navItems[]{
      ${NAV_LINK_FIELDS},
      menuNote,
      links[]${NAV_LINK_PROJECTION}
    },
    footerColumns[]{
      _key,
      title,
      links[]${NAV_LINK_PROJECTION}
    },
    legalNav[]${NAV_LINK_PROJECTION},
    headerCta{ show, label, link${NAV_LINK_PROJECTION} },
    showEmail,
    showSocials,
    showFooterSocials
  }`;

export async function getSiteSettings(fetcher = sanityFetch) {
  // A custom fetcher (the draft-aware preview) bypasses the build-time memo:
  // preview requests must see the CURRENT draft, not a cached publish.
  if (fetcher === sanityFetch && _siteSettingsPromise) return _siteSettingsPromise;
  const result = fetcher(`*[_type == "siteSettings"][0]${SITE_SETTINGS_PROJECTION}`, {}, null);
  if (fetcher === sanityFetch) _siteSettingsPromise = result;
  return result;
}

// ---- Announcement (site-wide banner; collection) --------------------------
// The single active announcement: enabled, started (or no start), not yet
// ended (or no end). Most urgent first, then soonest to end. "now" resolves at
// build time; a scheduled rebuild refreshes the active banner.
// Exported so PreviewLayout can run the SAME query through the draft-aware
// client. One query, two readers: a notice previews exactly as it will ship.
// `_id` is only read by the preview (it needs a document to point the edit
// attribute at); the live bar ignores it.
export const ACTIVE_ANNOUNCEMENT_QUERY = `*[_type == "announcement" && archived != true && enabled == true
      && (!defined(startDate) || startDate <= $now)
      && (!defined(endDate) || endDate >= $now)]
      | order(select(style == "urgent" => 0, style == "special" => 1, 2) asc, endDate asc)[0]{
        _id, message, style, link
      }`;

export async function getActiveAnnouncement() {
  const now = new Date().toISOString();
  return sanityFetch(ACTIVE_ANNOUNCEMENT_QUERY, { now }, null);
}

// ---- Worship resources (bulletins, orders of worship, The Record) ---------
export async function getWorshipResources(limit = 6) {
  return sanityFetch(
    `*[_type == "worshipResource"] | order(date desc)[0...$limit]{
      _id, title, date, type, externalUrl, description,
      "fileUrl": file.asset->url
    }`,
    { limit },
    [],
  );
}

// ---- Generic per-page hero (church page singletons) -----------------------
// One helper for every per-page singleton (worshipPage, musicPage, growPage,
// etc.). Returns the hero + SEO fields, or null when Sanity is unconfigured or
// the document doesn't exist yet, so pages fall back to their inline copy +
// built-in photo. Pass the singleton's _type, e.g. getPageHero('worshipPage').
export async function getPageHero(type: string) {
  // Spread (...) so any body-copy fields added to a page singleton (via the
  // definePageSingleton factory's extra fields) flow through automatically,
  // without listing each here. Images + flexibleSections are resolved explicitly.
  return sanityFetch(
    `*[_type == $type][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    { type },
    null,
  );
}

// Dedicated spread getters for the pages that carry their own editable list
// fields (grow groups, serve ways, beliefs resources). These mirror
// getWeddingsPage: the spread (...) lets every page-copy field, including the
// new arrays, flow through without listing each one, while images +
// flexibleSections are resolved explicitly. getPageHero would also spread, but
// these named helpers keep the page-to-getter mapping obvious for maintainers.

export async function getGrowPage() {
  return sanityFetch(
    `*[_type == "growPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

export async function getServePage() {
  return sanityFetch(
    `*[_type == "servePage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

export async function getBeliefsPage() {
  return sanityFetch(
    `*[_type == "beliefsPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- Home page ------------------------------------------------------------
// The hero fields, the final CTA, and the page-builder array that is now the
// whole body (converted 2026-08-26, Phase 4). The hero literals live in
// HomeHero.astro and the body's in DEFAULT_SECTIONS; the section blocks fetch
// their own cards from the catalog collections below.
//
// The wayfinding / stats / tickerTopics / strip-copy fields left this
// projection on 2026-08-27 (Phase 5) along with the schema fields and the data:
// every one of them is a section block's field now.
//
// Takes the optional draft fetcher, as it always has.

export async function getHomePage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "homePage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    hideFromSearch,
    heroEyebrow,
    heroHeadline,
    heroSubhead,
    heroImages[]${IMAGE_PROJECTION},
    heroPrimaryLabel,
    heroSecondaryLabel,
    nextCohortLabel,
    finalCtaEyebrow, finalCtaHeadline, finalCtaSubhead,
    finalCta${CTA_PROJECTION},
    finalCtaBackgroundImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- About page -----------------------------------------------------------

// Takes the same optional draft fetcher as getPrivacyPage: About converted to
// the page builder 2026-08-26, so /preview/about renders it through
// SingletonPage with draft data.
export async function getAboutPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "aboutPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    hideFromSearch,
    heroEyebrow, heroHeadline, heroSubhead,
    finalCtaEyebrow, finalCtaHeadline, finalCtaSubhead,
    finalCtaBackgroundImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- FAQ page -------------------------------------------------------------

// Takes the same optional draft fetcher as getPrivacyPage: the FAQ page
// converted to the page builder 2026-08-26.
export async function getFaqPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "faqPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    hideFromSearch,
    heroEyebrow, heroHeadline, heroSubhead, heroKeyword,
    heroImage${IMAGE_PROJECTION},
    heroScriptAccent,
    // coalesce: prefer the new categoryRef document title; fall back to the
    // legacy hardcoded string so existing items keep grouping correctly until
    // editors migrate them to the reference field.
    "faqs": *[_type == "faqItem" && archived != true] | order(coalesce(categoryRef->title, category) asc, displayOrder asc){
      question, answer,
      "category": coalesce(categoryRef->title, category),
      displayOrder
    },
    finalCtaEyebrow, finalCtaHeadline, finalCtaScriptAccent, finalCtaSubhead,
    finalCtaBackgroundImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    secondaryCta${CTA_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// The same FAQ items the faqPage query embeds, as a standalone call for the
// `sectionFaqGrouped` block (2026-08-26): a converted page's sections fetch
// their own collection data, the way every "auto" block does. Kept beside the
// page query on purpose — the projection and the ordering must not drift, or
// the FAQ page's JSON-LD (built from the page query) would describe a different
// list from the one rendered.
export async function getGroupedFaqItems(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "faqItem" && archived != true] | order(coalesce(categoryRef->title, category) asc, displayOrder asc){
      question, answer,
      "category": coalesce(categoryRef->title, category),
      displayOrder
    }`,
    {},
    [],
  );
}

// ---- FAQ items (for sectionFaqList page-builder block) -------------------
// Optionally filtered by category string (coalesced from categoryRef or legacy
// field). The block component calls this at build time. Returns [] when Sanity
// is unconfigured so the graceful empty state renders.
export async function getFaqItems(opts: { category?: string; limit?: number } = {}) {
  const { category, limit } = opts;
  // If a category filter is requested, use a parameterised query; otherwise
  // fetch all items ordered by category then display order.
  if (category) {
    return sanityFetch(
      `*[_type == "faqItem" && archived != true && coalesce(categoryRef->title, category) == $category]
        | order(displayOrder asc)
        [0...$limit]{
          question, answer,
          "category": coalesce(categoryRef->title, category),
          displayOrder
        }`,
      { category, limit: limit ?? 50 },
      [],
    );
  }
  return sanityFetch(
    `*[_type == "faqItem" && archived != true] | order(coalesce(categoryRef->title, category) asc, displayOrder asc)
      [0...$limit]{
        question, answer,
        "category": coalesce(categoryRef->title, category),
        displayOrder
      }`,
    { limit: limit ?? 50 },
    [],
  );
}

// ---- Contact page ---------------------------------------------------------

// Takes the same optional draft fetcher as getPrivacyPage: the Contact page
// converted to the page builder 2026-08-26.
export async function getContactPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "contactPage"][0]{
    ...,
    seoImage${IMAGE_PROJECTION},
    heroImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- Weddings + Use Our Space pages (hero + dereferenced inquiry form) -----

export async function getWeddingsPage() {
  return sanityFetch(
    `*[_type == "weddingsPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    inquiryForm->${FORM_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

export async function getUseOurSpacePage() {
  return sanityFetch(
    `*[_type == "useOurSpacePage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    inquiryForm->${FORM_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// Standalone form fetch by slug (page-builder formRef block, ad-hoc embeds).
export async function getForm(slug: string) {
  return sanityFetch(
    `*[_type == "form" && archived != true && slug.current == $slug][0]${FORM_PROJECTION}`,
    { slug },
    null,
  );
}

// ---- Generic custom pages (/[slug], page-builder blocks) ------------------
export async function getPageBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "page" && archived != true && slug.current == $slug][0]{
    title, "slug": slug.current,
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    seoTitle, seoDescription, seoImage${IMAGE_PROJECTION},
    hideFromSearch,
    sections[]${SECTION_MEMBERS}
  }`,
    { slug },
    null,
  );
}

export async function getAllPageSlugs(): Promise<string[]> {
  const list: Array<{ slug: string }> = await sanityFetch(
    `*[_type == "page" && archived != true && defined(slug.current)]{ "slug": slug.current }`,
    {},
    [],
  );
  return list.map((p) => p.slug).filter(Boolean);
}

// ---- 404 page -------------------------------------------------------------

export async function getNotFoundPage() {
  return sanityFetch(
    `*[_type == "notFoundPage"][0]{
    seoTitle,
    seoDescription,
    eyebrow,
    headline,
    body,
    heroImage${IMAGE_PROJECTION},
    primaryCtaLabel, primaryCtaHref,
    secondaryCtaLabel, secondaryCtaHref,
    tertiaryCtaLabel, tertiaryCtaHref
  }`,
    {},
    null,
  );
}

// ---- Privacy page ---------------------------------------------------------

// The `fetcher` parameter is the draft-preview seam (home's shared-template
// contract, generalized 2026-08-26 when this page converted): the page
// passes nothing and reads published content at build time, while
// src/pages/preview/[...slug].astro passes its draft-aware fetcher so the
// Presentation tool renders the SAME template against unpublished edits.
export async function getPrivacyPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "privacyPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    hideFromSearch,
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    heroScriptAccent,
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- Accessibility statement ----------------------------------------------
// Route: /accessibility. Same shape as the privacy page; the page renders a
// complete static fallback statement when this singleton is null.
// Takes the same optional draft fetcher as getPrivacyPage above.
export async function getAccessibilityPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "accessibilityPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    hideFromSearch,
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    heroScriptAccent,
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- Pastors & staff collection -------------------------------------------

export async function getStaffMembers() {
  return sanityFetch(
    `*[_type == "staffMember"] | order(displayOrder asc, name asc){
    _id, name, role, email,
    photo${IMAGE_PROJECTION},
    bio,
    favorites[]{ label, value }
  }`,
    {},
    [],
  );
}

// ---- Ministries collection ------------------------------------------------

const MINISTRY_CARD = `{
  _id, title, audience, ageRange, schedule, season, summary, link,
  registrationUrl, contactName, contactEmail,
  "parentMinistry": parentMinistry->{ _id, title },
  image${IMAGE_PROJECTION}
}`;

export async function getMinistries() {
  return sanityFetch(
    `*[_type == "ministry"] | order(displayOrder asc, title asc) ${MINISTRY_CARD}`,
    {},
    [],
  );
}

// Ministries flagged to appear in the home "Get involved" next-step row.
export async function getFeaturedMinistries() {
  return sanityFetch(
    `*[_type == "ministry" && featured == true] | order(displayOrder asc, title asc) ${MINISTRY_CARD}`,
    {},
    [],
  );
}

// ---- Events module --------------------------------------------------------

// Card projection for the events list (no full description body).
const EVENT_CARD = `{
  _id, title, slug, eventType, category, audience, specialService, liturgicalSeason,
  scheduleLabel, start, end, allDay, location,
  summary, cost, registrationUrl, registrationLabel, contactName, contactEmail,
  featured, featuredOnHome,
  image${IMAGE_PROJECTION}
}`;

// Takes the same optional draft fetcher as getPrivacyPage: the Events page
// converted to the page builder 2026-08-26.
export async function getEventsPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "eventsPage"][0]{
    ...,
    seoImage${IMAGE_PROJECTION},
    heroImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// Recurring rhythms (weekly worship, Bible study) — always shown, ordered by
// representative start time then title.
export async function getRecurringEvents() {
  return sanityFetch(
    `*[_type == "event" && archived != true && eventType == "recurring"] | order(start asc, title asc) ${EVENT_CARD}`,
    {},
    [],
  );
}

// One-time events that haven't passed yet (end time if set, else start).
// "now" is resolved at build time; a rebuild refreshes the list.
export async function getUpcomingEvents() {
  const now = new Date().toISOString();
  return sanityFetch(
    `*[_type == "event" && archived != true && eventType == "oneTime" && coalesce(end, start, "9999-12-31T00:00:00Z") >= $now]
      | order(featured desc, start asc) ${EVENT_CARD}`,
    { now },
    [],
  );
}

// Upcoming special services (Christmas Eve, Ash Wednesday, Easter): one-time
// events flagged specialService that haven't passed. Powers the home + events
// "Special services" band.
export async function getSpecialServices() {
  const now = new Date().toISOString();
  return sanityFetch(
    `*[_type == "event" && archived != true && specialService == true && coalesce(end, start, "9999-12-31T00:00:00Z") >= $now]
      | order(start asc) ${EVENT_CARD}`,
    { now },
    [],
  );
}

// Events the editor pinned to the home page (upcoming only).
export async function getHomeFeaturedEvents() {
  const now = new Date().toISOString();
  return sanityFetch(
    `*[_type == "event" && archived != true && featuredOnHome == true && coalesce(end, start, "9999-12-31T00:00:00Z") >= $now]
      | order(start asc) ${EVENT_CARD}`,
    { now },
    [],
  );
}

export async function getEventBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "event" && archived != true && slug.current == $slug][0]{
      _id, title, slug, eventType, category, audience,
      scheduleLabel, start, end, allDay, location,
      summary, cost, registrationUrl, registrationLabel, contactName, contactEmail,
      featured, featuredOnHome,
      image${IMAGE_PROJECTION},
      description
    }`,
    { slug },
    null,
  );
}

export async function getAllEventSlugs(): Promise<string[]> {
  const list: Array<{ slug: { current: string } }> = await sanityFetch(
    `*[_type == "event" && archived != true && defined(slug.current)]{ slug }`,
    {},
    [],
  );
  return list.map((e) => e.slug?.current).filter(Boolean);
}

// ---- Sermons module -------------------------------------------------------

const SERMON_CARD = `{
  _id, title, slug, date, speaker, series, scripture, videoUrl, featured,
  image${IMAGE_PROJECTION}
}`;

export async function getSermonsPage() {
  return sanityFetch(
    `*[_type == "sermonsPage"][0]{
    ...,
    seoImage${IMAGE_PROJECTION},
    heroImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

export async function getRecentSermons() {
  return sanityFetch(
    `*[_type == "sermon"] | order(featured desc, date desc) ${SERMON_CARD}`,
    {},
    [],
  );
}

export async function getSermonBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "sermon" && slug.current == $slug][0]{
      _id, title, slug, date, speaker, series, scripture, videoUrl, audioUrl, featured,
      image${IMAGE_PROJECTION},
      description,
      liturgicalDay,
      "bulletinUrl": bulletin.asset->url,
      "manuscriptUrl": manuscript.asset->url,
      hymns[]{ _key, title, number },
      serviceMusic[]{ _key, role, title, composer },
      worshipLeaders[]{ _key, role, name }
    }`,
    { slug },
    null,
  );
}

export async function getAllSermonSlugs(): Promise<string[]> {
  const list: Array<{ slug: { current: string } }> = await sanityFetch(
    `*[_type == "sermon" && defined(slug.current)]{ slug }`,
    {},
    [],
  );
  return list.map((s) => s.slug?.current).filter(Boolean);
}

// ===========================================================================
// School catalog — courses, faculty, terms, pricing, testimonials.
// The course/faculty link is one-directional (course.instructors); a faculty
// member's "courses taught" is derived by GROQ back-query (references(^._id)).
// "Next offering" is the soonest cohort whose term begins today or later; the
// catalog card and the course-detail facts ledger both read from it.
// ===========================================================================

const TODAY = () => new Date().toISOString().slice(0, 10);

// One offering resolved to its term's dates. Reused by card + detail.
const OFFERING_PROJECTION = `{
  schedule, sessions, seatsNote, status,
  "term": term->{ _id, title, "slug": slug.current, startDate, endDate, registrationDeadline, status }
}`;

// The soonest cohort that begins today or later (the "next offering").
// A hand-set "Seats right now" on the course (Quick update, "Mark a course full or
// waitlisted") wins over the offering's own Status and Seats note; empty, the offering
// decides (a hand-set status takes its own note, never the offering's). `^` is the course the projection sits in.
const NEXT_OFFERING = `"nextOffering": (
  offerings[defined(term->startDate) && term->startDate >= $today]
  | order(term->startDate asc))[0]{
  schedule, sessions,
  "seatsNote": select(defined(^.seatsNow) => ^.seatsNowNote, seatsNote),
  "status": coalesce(^.seatsNow, status),
  "term": term->{ _id, title, "slug": slug.current, startDate, endDate, registrationDeadline, status }
}`;

// The cover fields (Term Issue, 2026-10-13) ride on every card: the code,
// colour, ornament and question are drawn by CourseCover.astro, and week one is
// simply the first session. An empty colour or ornament is derived in
// src/lib/cover.ts, so none of these have to be set.
const COVER_FIELDS = `courseCode, coverColor, coverOrnament, centralQuestion,
  "weekOne": sessionOutline[0]{ title, focus }`;

const COURSE_CARD = `{
  _id, title, "slug": slug.current, summary, level, format, startHere, featured, displayOrder,
  coverImage${IMAGE_PROJECTION},
  ${COVER_FIELDS},
  "teachingAreas": teachingAreas[]->{ _id, title, "slug": slug.current },
  "instructors": instructors[]->{ _id, name, honorific, title, "slug": slug.current },
  priceNote, "priceTier": priceTier->{ name, amount, unit, isAudit },
  ${NEXT_OFFERING}
}`;

// ---- Courses page singleton + course collection ---------------------------

export async function getCoursesPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "coursesPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

export async function getCourses() {
  return sanityFetch(
    `*[_type == "course" && archived != true] | order(startHere desc, featured desc, displayOrder asc, title asc) ${COURSE_CARD}`,
    { today: TODAY() },
    [],
  );
}

// Featured courses for the home catalog preview.
export async function getFeaturedCourses(limit = 6, fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "course" && archived != true && featured == true] | order(displayOrder asc, title asc)[0...$limit] ${COURSE_CARD}`,
    { today: TODAY(), limit },
    [],
  );
}

// Every course in catalog order (Term Issue PR 2, 2026-10-13): the home cover
// grid and the term contents list. Unlike getCourses(), which floats the
// Start-here and Featured flags to the top for the catalog page, this keeps the
// editor's display order, so the contents read like a printed contents page.
export async function getAllCourses(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "course" && archived != true] | order(displayOrder asc, title asc) ${COURSE_CARD}`,
    { today: TODAY() },
    [],
  );
}

// Specific courses by id, as cards (Term Issue PR 2): the course finder's
// suggestions are references, resolved here with the full card projection so
// the suggestion can draw the course's cover.
export async function getCoursesByIds(ids: string[], fetcher = sanityFetch) {
  if (ids.length === 0) return [];
  return fetcher(
    `*[_type == "course" && archived != true && _id in $ids] ${COURSE_CARD}`,
    { today: TODAY(), ids },
    [],
  );
}

// The recommended starting courses (the "Start here" rail).
export async function getStartHereCourses(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "course" && archived != true && startHere == true] | order(displayOrder asc, title asc) ${COURSE_CARD}`,
    { today: TODAY() },
    [],
  );
}

export async function getCourseBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "course" && archived != true && slug.current == $slug][0]{
      _id, title, "slug": slug.current, summary, level, format, location, whoFor,
      coverImage${IMAGE_PROJECTION},
      ${COVER_FIELDS},
      seoTitle, seoDescription, seoImage${IMAGE_PROJECTION},
      "teachingAreas": teachingAreas[]->{ _id, title, "slug": slug.current },
      "instructors": instructors[]->{
        _id, name, honorific, title, "slug": slug.current,
        photo${IMAGE_PROJECTION},
        "degrees": degrees[]{ degree, field, institution, year },
        ordination, denomination
      },
      sessionOutline[]{ _key, title, focus },
      priceNote, "priceTier": priceTier->{ name, amount, unit, isAudit, summary },
      "syllabusUrl": syllabusFile.asset->url,
      "offerings": offerings[]${OFFERING_PROJECTION},
      ${NEXT_OFFERING}
    }`,
    { slug, today: TODAY() },
    null,
  );
}

export async function getAllCourseSlugs(): Promise<string[]> {
  const list: Array<{ slug: string }> = await sanityFetch(
    `*[_type == "course" && archived != true && defined(slug.current)]{ "slug": slug.current }`,
    {},
    [],
  );
  return list.map((c) => c.slug).filter(Boolean);
}

// ---- Faculty page singleton + faculty collection --------------------------

const FACULTY_CARD = `{
  _id, name, honorific, title, "slug": slug.current, ordination, denomination, displayOrder,
  photo${IMAGE_PROJECTION},
  "topDegree": degrees[0]{ degree, field, institution },
  "teachingAreas": teachingAreas[]->{ _id, title, "slug": slug.current }
}`;

export async function getFacultyPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "facultyPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

export async function getFaculty() {
  return sanityFetch(
    `*[_type == "facultyMember" && archived != true] | order(orderRank asc, displayOrder asc, name asc) ${FACULTY_CARD}`,
    {},
    [],
  );
}

// A few faculty for the home faculty strip.
export async function getFeaturedFaculty(limit = 4, fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "facultyMember" && archived != true] | order(orderRank asc, displayOrder asc, name asc)[0...$limit] ${FACULTY_CARD}`,
    { limit },
    [],
  );
}

// The spoken introduction, as the IntroAudio island needs it. The transcript
// travels with the file so a recording never renders without its text
// alternative (WCAG 1.2.1); the renderers check both before showing a player.
const INTRO_AUDIO = `"introAudio": introAudio.asset->{ url, mimeType },
  introAudioTranscript, introAudioLength`;

// Contributors: the faculty strip's "contributors" variant (2026-10-13, Term
// Issue PR 3). The roster card fields plus the reading line, the audio, and
// "inThisIssue": the courses this teacher is an instructor on that have an
// offering in the NEXT term (the same term getNextTerm picks). The label is
// `coalesce(courseCode, title)` so the optional course code a parallel PR adds
// is picked up when present; before that field exists GROQ reads it as null and
// the title shows. Two reads (the term, then the roster) keep the GROQ legible;
// with no upcoming term, $termId is "" and every inThisIssue list is empty.
export async function getContributors(limit = 4, fetcher = sanityFetch) {
  const term = await getNextTerm(fetcher).catch(() => null);
  return fetcher(
    `*[_type == "facultyMember" && archived != true] | order(orderRank asc, displayOrder asc, name asc)[0...$limit]{
      _id, name, honorific, title, "slug": slug.current, ordination, denomination,
      photo${IMAGE_PROJECTION},
      "topDegree": degrees[0]{ degree, field, institution },
      currentlyReading,
      ${INTRO_AUDIO},
      "inThisIssue": *[_type == "course" && archived != true && ^._id in instructors[]._ref
        && count(offerings[term._ref == $termId]) > 0] | order(displayOrder asc, title asc){
        _id, "slug": slug.current, "label": coalesce(courseCode, title)
      }
    }`,
    { limit, termId: term?._id ?? '' },
    [],
  );
}

export async function getFacultyBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "facultyMember" && archived != true && slug.current == $slug][0]{
      _id, name, honorific, title, "slug": slug.current,
      ordination, denomination, yearsTeaching, humanLine, bio, email, specializations,
      currentlyReading,
      ${INTRO_AUDIO},
      photo${IMAGE_PROJECTION},
      seoTitle, seoDescription, seoImage${IMAGE_PROJECTION},
      "teachingAreas": teachingAreas[]->{ _id, title, "slug": slug.current },
      degrees[]{ _key, degree, field, institution, year },
      affiliations[]{ _key, role, organization },
      publications[]{ _key, title, publisher, year, url },
      "coursesTaught": *[_type == "course" && archived != true && references(^._id)] | order(displayOrder asc, title asc){
        _id, title, "slug": slug.current,
        "teachingArea": teachingAreas[0]->title
      }
    }`,
    { slug },
    null,
  );
}

export async function getAllFacultySlugs(): Promise<string[]> {
  const list: Array<{ slug: string }> = await sanityFetch(
    `*[_type == "facultyMember" && archived != true && defined(slug.current)]{ "slug": slug.current }`,
    {},
    [],
  );
  return list.map((f) => f.slug).filter(Boolean);
}

// ---- Teaching areas (shared taxonomy; filter chips) -----------------------

export async function getTeachingAreas() {
  return sanityFetch(
    `*[_type == "teachingArea" && archived != true] | order(displayOrder asc, title asc){ _id, title, "slug": slug.current, description }`,
    {},
    [],
  );
}

// ---- Terms (cohort calendar) ----------------------------------------------

// The soonest term that begins today or later — the global "next cohort begins"
// cue (derived, not stored on siteSettings).
// `status` and `registrationOpens` (added for the Term Issue PR 4 issue line in
// the header, 2026-10-13) say whether the bar can honestly read "enrolling now".
export async function getNextTerm(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "term" && archived != true && startDate >= $today] | order(startDate asc)[0]{
      _id, title, startDate, registrationOpens, registrationDeadline, status, note
    }`,
    { today: TODAY() },
    null,
  );
}

// "Next issue" (Term Issue PR 4, 2026-10-13): the term AFTER the next one (the
// same filter as getNextTerm, one place further along), plus one course with a
// cohort in it, as a full card so the block can draw its cover. `term` is null
// when the calendar holds no later term, and the block then hides; `course` is
// null when the later term has no courses on it yet, and the block shows
// without a cover.
export async function getNextIssue(fetcher = sanityFetch) {
  const term = await fetcher(
    `*[_type == "term" && archived != true && startDate >= $today] | order(startDate asc)[1]{
      _id, title, startDate
    }`,
    { today: TODAY() },
    null,
  );
  if (!term?._id) return { term: null, course: null };
  const course = await fetcher(
    `*[_type == "course" && archived != true && count(offerings[term._ref == $termId]) > 0]
      | order(displayOrder asc, title asc)[0] ${COURSE_CARD}`,
    { today: TODAY(), termId: term._id },
    null,
  );
  return { term, course: course ?? null };
}

// ---- Site chrome: the masthead, the contents menu, the back cover ----------
// (2026-10-13, the chrome redesign.) One request for everything the header and
// footer show beyond siteSettings: the next term, the course and faculty counts
// for the nav note and the menu facts, the cheapest pricing tier ("from $95"),
// and every course's cover fields for the fanned covers, the menu shelf and the
// footer's "In this issue". `inTerm` marks the courses with a cohort in the
// next term; src/lib/chrome.ts (orderShelf) puts those first.
//
// Memoized like getSiteSettings, because Header and Footer both call it on
// every page. The memo expires after a minute so the SSR preview worker, which
// lives longer than a build, never shows a count more than a minute stale.
let _chromePromise: Promise<ChromeData> | null = null;
let _chromeAt = 0;

export interface ChromeCourse {
  title?: string | null;
  slug?: string | null;
  courseCode?: string | null;
  coverColor?: string | null;
  coverOrnament?: string | null;
  startHere?: boolean | null;
  featured?: boolean | null;
  inTerm?: boolean | null;
  teachingAreas?: Array<{ slug?: string | null } | null> | null;
}

export interface ChromeData {
  term: {
    _id?: string;
    title?: string | null;
    startDate?: string | null;
    registrationOpens?: string | null;
    registrationDeadline?: string | null;
    status?: string | null;
  } | null;
  courseCount: number;
  facultyCount: number;
  lowestPrice: number | null;
  courses: ChromeCourse[];
}

export async function getChromeData(): Promise<ChromeData> {
  if (_chromePromise && Date.now() - _chromeAt < 60_000) return _chromePromise;
  _chromeAt = Date.now();
  _chromePromise = (async () => {
    const term = await getNextTerm().catch(() => null);
    const data = await sanityFetch<any>(
      `{
        "courseCount": count(*[_type == "course" && archived != true]),
        "facultyCount": count(*[_type == "facultyMember" && archived != true]),
        "lowestPrice": *[_type == "pricingTier" && archived != true && amount > 0] | order(amount asc)[0].amount,
        "courses": *[_type == "course" && archived != true] | order(displayOrder asc, title asc){
          title, "slug": slug.current, courseCode, coverColor, coverOrnament, startHere, featured,
          "teachingAreas": teachingAreas[]->{ "slug": slug.current },
          "inTerm": count(offerings[term._ref == $termId]) > 0
        }
      }`,
      { termId: term?._id ?? '' },
      null,
    ).catch(() => null);
    return {
      term: term ?? null,
      courseCount: typeof data?.courseCount === 'number' ? data.courseCount : 0,
      facultyCount: typeof data?.facultyCount === 'number' ? data.facultyCount : 0,
      lowestPrice: typeof data?.lowestPrice === 'number' ? data.lowestPrice : null,
      courses: Array.isArray(data?.courses) ? data.courses : [],
    };
  })();
  return _chromePromise;
}

export async function getTerms() {
  return sanityFetch(
    `*[_type == "term" && archived != true] | order(startDate asc){ _id, title, startDate, endDate, registrationDeadline, status, note }`,
    {},
    [],
  );
}

// ---- Pricing page + tiers -------------------------------------------------

// Takes the same optional draft fetcher as getPrivacyPage: the Pricing page
// converted to the page builder 2026-08-26, so /preview/pricing renders it
// through SingletonPage with draft data.
export async function getPricingPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "pricingPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// The optional fetcher (Term Issue PR 2) lets the home preview read draft tiers
// for the rates box and the course finder; every older caller passes nothing.
export async function getPricingTiers(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "pricingTier" && archived != true] | order(orderRank asc, displayOrder asc){ _id, name, amount, unit, summary, includes, isAudit, featured }`,
    {},
    [],
  );
}

// ---- Testimonials ---------------------------------------------------------

const TESTIMONIAL_CARD = `{
  _id, quote, name, role, city, featured, displayOrder,
  photo${IMAGE_PROJECTION},
  "course": courseCompleted->{ title, "slug": slug.current }
}`;

export async function getTestimonials() {
  return sanityFetch(
    `*[_type == "testimonial" && archived != true] | order(orderRank asc, displayOrder asc) ${TESTIMONIAL_CARD}`,
    {},
    [],
  );
}

export async function getFeaturedTestimonials(limit = 3, fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "testimonial" && archived != true && featured == true] | order(displayOrder asc)[0...$limit] ${TESTIMONIAL_CARD}`,
    { limit },
    [],
  );
}

// ---- Get Started + For You + Resources page singletons --------------------

// Takes the same optional draft fetcher as getPrivacyPage: Get Started
// converted to the page builder 2026-08-26.
export async function getGetStartedPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "getStartedPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// Takes the same optional draft fetcher as getPrivacyPage above.
export async function getForYouPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "forYouPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// Takes the same optional draft fetcher as getPrivacyPage above.
export async function getResourcesPage(fetcher = sanityFetch) {
  return fetcher(
    `*[_type == "resourcesPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}
