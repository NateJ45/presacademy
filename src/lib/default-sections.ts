// Foundation, edit with care
// =============================================================================
// DEFAULT_SECTIONS — the code-side safety net for the page builder (2026-08-26)
// =============================================================================
// Decision D3 of docs/superpowers/plans/2026-08-26-page-builder-conversion.md.
//
// Today every singleton page carries `??` fallback literals inline, so an empty
// dataset still renders a complete, correct page. Two things depend on that and
// neither is optional:
//
//   - CI builds with no Sanity credentials at all (`sanityFetch` returns its
//     fallback without a network call), and the axe + reflow sweeps run against
//     that build. A blank body would mean the accessibility gates are grading
//     an empty page.
//   - An editor who deletes every section in the Studio should get the page
//     back, not a hole between the hero and the closing CTA.
//
// When a page converts, its inline literals move here as section DATA, keyed by
// the page's Sanity type name. The seed scripts write the same content into
// Sanity so editors can see and own it; this map is what renders when the doc's
// sections array is empty. Empty-env CI then renders byte-identically to today.
//
// It is EMPTY on purpose right now. Phase 0 is render-neutral: no page reads
// this yet. Each entry lands in the same commit as the page that needs it
// (Phase 1 onward), so the fallback copy and the page it belongs to are never
// out of step. Until then every lookup returns undefined and the renderer falls
// through to an empty sections array, exactly as an unconverted page does.
// =============================================================================

/**
 * One entry per converted singleton, keyed by its Sanity document type
 * (`aboutPage`, `pricingPage`, ...) — the same keys `SINGLETON_BY_PATH` maps
 * paths onto in src/pages/preview/[...slug].astro.
 *
 * The values are plain section objects in the same shape Sanity returns for
 * `flexibleSections`: `_type` plus that block's fields, and a stable `_key` so
 * the entries match what the seed scripts write (idempotent re-runs).
 */
// `any[]` matches the shape Sections.astro already takes (Sanity blocks are
// heterogeneous and only the renderer's per-_type branch knows their fields).
export const DEFAULT_SECTIONS: Record<string, any[]> = {
  // Populated page by page as the conversion proceeds. See the header comment.

  // ---- privacy (converted 2026-08-26) --------------------------------------
  // No `body` and no `lastUpdated` here on purpose: with no Sanity document at
  // all, the old page rendered its built-in policy and no date line. The
  // built-in copy itself lives in LegalBodyBlock.astro (it is markup, not data)
  // and is selected by `fallbackStatement`.
  privacyPage: [
    {
      _key: 'privacyBody',
      _type: 'sectionLegalBody',
      landmarkLabel: 'Privacy policy contents',
      dateLabel: 'Last updated',
      fallbackStatement: 'privacy',
    },
  ],

  // ---- accessibility (converted 2026-08-26) --------------------------------
  // Privacy's twin, with the two differences the pages actually had: the
  // landmark label and the wording of the date line ("Last reviewed").
  accessibilityPage: [
    {
      _key: 'accessibilityBody',
      _type: 'sectionLegalBody',
      landmarkLabel: 'Accessibility statement',
      dateLabel: 'Last reviewed',
      fallbackStatement: 'accessibility',
    },
  ],

  // ---- for-you (converted 2026-08-26) --------------------------------------
  // The four persona cards that for-you.astro used to carry as FALLBACK_PERSONAS.
  // Same copy, same order, same CTAs; only the field names changed (label ->
  // title, promise -> body) now that the type is a general numbered-cards block.
  forYouPage: [
    {
      _key: 'forYouPersonas',
      _type: 'sectionNumberedCards',
      variant: 'top2',
      cards: [
        {
          _key: 'persona1',
          title: 'The small-group leader',
          body: 'Lead a study with more depth and less guesswork.',
          cta: { label: 'Courses for leaders', linkType: 'external', externalUrl: '/courses' },
        },
        {
          _key: 'persona2',
          title: 'The lifelong learner',
          body: 'Finally read the whole Bible as one story.',
          cta: { label: 'Start with Scripture', linkType: 'external', externalUrl: '/courses' },
        },
        {
          _key: 'persona3',
          title: 'New to Reformed thought',
          body: 'Understand what we believe, in plain words.',
          cta: { label: 'Explore the confessions', linkType: 'external', externalUrl: '/courses' },
        },
        {
          _key: 'persona4',
          title: 'Discerning a call',
          body: 'Test the waters before seminary, in good company.',
          cta: { label: 'Book a free intro', linkType: 'external', externalUrl: '/get-started' },
        },
      ],
    },
  ],

  // ---- pricing (converted 2026-08-26) --------------------------------------
  // The three bands pricing.astro used to render inline, in the same order.
  //
  // The tier cards carry no content of their own: the block fetches the
  // pricingTier documents itself, and with no Sanity credentials there are none,
  // so it renders nothing — exactly what the old page did behind its
  // `tiers.length > 0` guard.
  //
  // `footnote` is absent from the scholarship band on purpose: the page read it
  // straight off the document with no fallback, so an empty dataset showed no
  // footnote line.
  pricingPage: [
    {
      _key: 'pricingTiers',
      _type: 'sectionPricingTiers',
      surface: 'ledger',
      headingLevel: 'h2',
    },
    {
      _key: 'pricingScholarship',
      _type: 'sectionScholarship',
      eyebrow: 'Scholarships',
      headline: 'No one is turned away for cost',
      body: 'Need-based scholarships are available every term, funded by our supporters. If tuition is a barrier, tell us on the interest form and we will work it out. Formation should be within reach of anyone called to it.',
    },
    {
      _key: 'pricingStats',
      _type: 'sectionLedgerStats',
      variant: 'trio',
      items: [
        { _key: 'stat1', value: 'Free', label: 'Sit in on a class first' },
        { _key: 'stat2', value: 'Per course', label: 'Pay as you go, no degree debt' },
        { _key: 'stat3', value: 'Need-based', label: 'Scholarships every term' },
      ],
    },
  ],

  // ---- about (converted 2026-08-26) ----------------------------------------
  // The four bands about.astro used to render inline, in the same order:
  // mission, what we believe, the teach/why pair, the faculty signpost.
  aboutPage: [
    {
      _key: 'aboutMission',
      _type: 'sectionEditorialColumns',
      variant: 'labeled',
      columns: [
        {
          _key: 'mission',
          eyebrow: 'Our mission',
          heading:
            'We make Reformed theological formation accessible to adult lay leaders across the Presbyterian and Reformed family.',
          body: 'We are a school, not a church. We exist to equip the people who already serve: ruling elders, small-group leaders, Sunday-school teachers, and lifelong learners in PC(USA), ECO, and EPC congregations. We teach in person, in cohorts, at a pace that fits a working life.',
        },
      ],
    },
    {
      _key: 'aboutBeliefs',
      _type: 'sectionNumberedCards',
      variant: 'ledger',
      eyebrow: 'What we believe',
      heading: 'Confessional, and warm about it',
      cards: [
        {
          _key: 'belief1',
          title: 'Scripture is our final authority',
          body: 'We read the Bible as the Word of God, trustworthy and sufficient, and we teach you to read it for yourself.',
        },
        {
          _key: 'belief2',
          title: 'Salvation is by grace alone',
          body: 'We are saved by what God has done, not by what we achieve. That changes how we learn and how we lead.',
        },
        {
          _key: 'belief3',
          title: 'The confessions guide us',
          body: 'We hold to the Westminster Confession and Catechisms and the PC(USA) confessional standards, taught for ordinary believers, not just scholars.',
        },
        {
          _key: 'belief4',
          title: 'Formation is for everyone',
          body: 'The depth of the tradition belongs to the whole church, not only the ordained. That conviction is why we exist.',
        },
      ],
      footnote:
        'Rooted in the Westminster Standards, taught for ordinary believers. Our full statement of faith is the PC(USA) Book of Confessions.',
    },
    {
      _key: 'aboutTeachWhy',
      _type: 'sectionEditorialColumns',
      variant: 'pair',
      columns: [
        {
          _key: 'teach',
          eyebrow: 'How we teach',
          heading: 'Formation, not just information',
          body: 'A course here is more than a lecture. You read real texts, you discuss them with a cohort that sticks together, and you leave able to teach what you have learned. The goal is not to make you a scholar. It is to make you a wiser, steadier leader of the people God has already given you.',
        },
        {
          _key: 'why',
          eyebrow: 'Why we exist',
          heading: 'A school for the whole church',
          body: 'The Presbyterian Academy is supported by the Presbytery of Cincinnati, bringing seminary-grade teaching to lay leaders who cannot leave their jobs and families for a degree. We teach the historic Reformed faith for the people who actually lead the church: elders, teachers, small-group hosts, and the lifelong curious, taught by ministers and scholars who believe ordinary believers deserve the real thing.',
        },
      ],
    },
    {
      _key: 'aboutFacultyBand',
      _type: 'sectionInlineBand',
      eyebrow: 'The people who teach',
      headline:
        'Every course is led by an ordained minister or a credentialed Reformed scholar.',
      ctaLabel: 'Meet the faculty',
      ctaUrl: '/faculty',
    },
  ],

  // ---- faq (converted 2026-08-26) ------------------------------------------
  // One auto block. It fetches the FAQ collection itself and falls back to the
  // built-in starter questions (src/lib/faq-fallback.ts) when the collection is
  // empty, which is exactly what the page did. No categoryOrder here on
  // purpose: with no Sanity document there was no editor order either, so the
  // block uses DEFAULT_CATEGORY_ORDER, same as before.
  faqPage: [
    {
      _key: 'faqGrouped',
      _type: 'sectionFaqGrouped',
      landmarkLabel: 'Frequently asked questions',
    },
  ],

  // ---- events (converted 2026-08-26) ---------------------------------------
  // Two auto blocks. Both fetch their own slice of the Events collection; the
  // recurring list falls back to its three built-in rhythms (in
  // RuledListBlock.astro) when the collection has none, exactly as the page did.
  // The headingIds are the ones the page's landmarks already used, so anchors
  // and aria-labelledby keep working.
  eventsPage: [
    {
      _key: 'eventsUpcoming',
      _type: 'sectionEventGrid',
      eyebrow: 'Mark your calendar',
      heading: 'Upcoming',
      headingId: 'upcoming-heading',
      emptyCopy:
        'Nothing dated on the calendar right now. The recurring rhythms below never stop, and the best place to start is a',
    },
    {
      _key: 'eventsRhythms',
      _type: 'sectionRuledList',
      eyebrow: 'Every month',
      heading: 'Ways to get a feel for the Academy',
      headingId: 'recurring-heading',
    },
  ],

  // ---- contact (converted 2026-08-26) --------------------------------------
  // The details band resolves the address, phone, email and office hours from
  // site settings itself, and falls back to the built-in who-to-reach rows (in
  // ContactDetailsBlock.astro) when none are set, exactly as the page did.
  //
  // The form section carries no `form` reference here: with no Sanity document
  // there is no form either, and the block then shows the email button, which
  // is what the old page rendered in that state.
  contactPage: [
    {
      _key: 'contactDetails',
      _type: 'sectionContactDetails',
      landmarkLabel: 'Contact details',
      whoToReachLabel: 'Who to reach',
      gettingHereLabel: 'Getting here',
      gettingHereBody:
        'Courses meet in person on the West Chester campus, with free on-site parking. The building is a short drive from the interstate.',
      mapTitle: 'Map to The Presbyterian Academy',
    },
    {
      _key: 'contactForm',
      _type: 'sectionForm',
      variant: 'pageBody',
      eyebrow: 'Send a Note',
      heading: 'Start the conversation',
      headingId: 'contact-form',
      fallbackLabel: 'Email the Office',
    },
  ],

  // ---- get-started (converted 2026-08-26) ----------------------------------
  // The request panel and the three "what happens next" steps.
  //
  // No `form` and no `calendlyUrl` here on purpose: with no Sanity document
  // there is neither, and the panel then renders the email button and the
  // FormBlock's own mailto fallback, which is exactly what the old page did in
  // that state. PUBLIC_CALENDLY_URL still applies if the environment sets it.
  getStartedPage: [
    {
      _key: 'getStartedRequest',
      _type: 'sectionRequestPanel',
      requestEyebrow: 'Request information',
      requestHeadline: 'Ask us anything',
      requestBody:
        'Tell us what you are hoping to learn and we will help you find the right course.',
      calendlyEyebrow: 'Or talk to us first',
      calendlyHeadline: 'Book a free intro session',
      calendlyBody: 'A short, no-pressure conversation about where you are and what fits.',
      visitClassBody:
        'You are welcome to sit in on the first session of any course, free, before you decide.',
      syllabusBody:
        'Every course page has a downloadable syllabus, so you can see exactly what a term covers.',
    },
    {
      _key: 'getStartedSteps',
      _type: 'sectionNumberedCards',
      variant: 'steps',
      eyebrow: 'What happens next',
      cards: [
        {
          _key: 'step1',
          title: 'You tell us a little',
          body: 'A short form, just enough for us to point you in the right direction.',
        },
        {
          _key: 'step2',
          title: 'We reply, person to person',
          body: 'A real teacher or staff member answers your questions within a few days.',
        },
        {
          _key: 'step3',
          title: 'You try before you decide',
          body: 'Sit in on a class or book a free intro. Enroll only when you are ready.',
        },
      ],
    },
  ],

  // ---- courses (converted 2026-08-26) --------------------------------------
  // One auto block: the "Start here" rail. It fetches the courses flagged
  // "Start here" itself, and renders NOTHING when there are none, which is
  // exactly what the old page's `startHere.length > 0` guard did (and what the
  // credential-less CI build gets).
  //
  // `adaptiveColumns` is absent on purpose: the Courses page has always used the
  // fixed three-column grid, unlike home's rail. See CourseRailBlock's header.
  //
  // The catalog itself is NOT here. It stays a pinned code region in
  // src/pages/courses/index.astro (the React filter island, the four-collection
  // facet counting, the sr-only h2 and the empty state), rendered through
  // SingletonPage's "pinned" slot AFTER this array. See SingletonPage's header
  // for what that ordering does and does not allow.
  coursesPage: [
    {
      _key: 'coursesStartHere',
      _type: 'sectionCourseRail',
      source: 'startHere',
      variant: 'rail',
      eyebrow: 'Start here',
      heading: 'New to the Academy? Begin with these.',
      headingId: 'start-here',
      limit: 3,
    },
  ],

  // ---- home (converted 2026-08-26, Phase 4) --------------------------------
  // The eight bands HomeBody.astro used to render inline, in the same order:
  // wayfinding, the Start-here rail, the stat band, the topics ticker, the
  // catalog preview, the faculty strip, the testimonials. (The split hero is NOT
  // here: heroes stay page-level fields, per decision D2, and home's renders
  // through SingletonPage's "hero" slot as src/components/home/HomeHero.astro.)
  //
  // The three rails and the faculty/testimonial strips carry no cards of their
  // own: each block fetches its slice of the catalog itself, and with no Sanity
  // credentials there is nothing to fetch, so each renders nothing. That is
  // exactly what the old page's `startHere.length > 0` / `featuredCourses.length
  // > 0` / `featuredFaculty.length > 0` / `testimonials.length > 0` guards did,
  // and what the credential-less CI build has always shown.
  //
  // The headingIds are the ones the page's landmarks already used, so anchors
  // and aria-labelledby keep working.
  homePage: [
    {
      _key: 'homeWayfinding',
      _type: 'sectionNumberedCards',
      variant: 'wayfinding',
      landmarkLabel: 'Where to begin',
      cards: [
        {
          _key: 'wayfindingStep1',
          title: 'Take a course',
          body: 'Browse the catalog by topic or teacher.',
          href: '/courses',
        },
        {
          _key: 'wayfindingStep2',
          title: 'Meet the teachers',
          body: 'Ordained ministers and Reformed scholars.',
          href: '/faculty',
        },
        {
          _key: 'wayfindingStep3',
          title: 'Find your path',
          body: 'A starting point for where you are now.',
          href: '/for-you',
        },
        {
          _key: 'wayfindingStep4',
          title: 'Start free',
          body: 'Sit in on a class, no commitment.',
          href: '/get-started',
        },
      ],
    },
    {
      _key: 'homeStartHere',
      _type: 'sectionCourseRail',
      source: 'startHere',
      variant: 'rail',
      eyebrow: 'Start here',
      heading: 'A few courses to begin with',
      headingId: 'home-start',
      limit: 3,
      // Home narrows its grid below three courses; the Courses page never does.
      // See CourseRailBlock's header for why that is a field and not a rule.
      adaptiveColumns: true,
    },
    {
      _key: 'homeStats',
      _type: 'sectionLedgerStats',
      variant: 'quad',
      landmarkLabel: 'The Academy at a glance',
      // Stats for a NEW (2026) school: structure + standards, not a track record
      // (no founding year, no alumni counts). Only number values animate.
      items: [
        { _key: 'stat1', value: '100%', label: 'Ordained or credentialed faculty', count: true },
        { _key: 'stat2', value: 'In person', label: 'Taught in cohorts' },
        { _key: 'stat3', value: 'Need-based', label: 'Scholarships every term' },
        { _key: 'stat4', value: 'Reformed', label: 'Rooted in the Westminster Standards' },
      ],
    },
    {
      _key: 'homeTicker',
      _type: 'sectionTicker',
      topics: [
        'Old Testament',
        'Systematic Theology',
        'Church History',
        'Reformed Worship',
        'Biblical Greek',
        'Christian Ethics',
        'Apologetics',
        'Pastoral Care',
        'The Confessions',
        'Spiritual Formation',
      ],
    },
    {
      _key: 'homeCourses',
      _type: 'sectionCourseRail',
      source: 'featured',
      variant: 'feature',
      eyebrow: 'Courses',
      heading: 'Learn something worth knowing',
      headingId: 'home-courses',
      limit: 6,
      linkLabel: 'See all courses',
      linkHref: '/courses',
      // Drop any Start-here course so the page never shows the same card twice.
      dedupeAgainstStartHere: true,
    },
    {
      _key: 'homeFaculty',
      _type: 'sectionFacultyRail',
      eyebrow: 'The faculty',
      heading: 'Taught by ministers and scholars',
      headingId: 'home-faculty',
      limit: 3,
      linkLabel: 'Meet the faculty',
      linkHref: '/faculty',
    },
    {
      _key: 'homeTestimonials',
      _type: 'sectionTestimonialRail',
      eyebrow: 'In their words',
      heading: 'From the people we serve',
      headingId: 'home-stories',
      limit: 3,
    },
  ],

  // ---- faculty (converted 2026-08-26) --------------------------------------
  // No entry, deliberately. The Faculty page's body is entirely the roster, and
  // the roster is a pinned code region (the FacultyFilter island, the area
  // chips, the sr-only h2 and the empty state). Its sections array is empty
  // today and there is nothing to fall back to, so `facultyPage` is absent here
  // rather than present and empty: `sectionsFor` returns [] either way, and an
  // empty array in this map would read like an oversight.
};

/** The sections a page should render: the editor's array, else the defaults. */
export function sectionsFor(pageType: string, sections?: any[] | null): any[] {
  if (Array.isArray(sections) && sections.length > 0) return sections;
  return DEFAULT_SECTIONS[pageType] ?? [];
}
