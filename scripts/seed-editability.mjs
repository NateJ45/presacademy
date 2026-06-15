// Seed the PRODUCTION Sanity dataset so Studio mirrors the live site exactly.
//
//   node scripts/seed-editability.mjs            (dry run: shows what would change)
//   node scripts/seed-editability.mjs --apply    (write to the live dataset)
//
// This is the render-neutral editability pass. It writes the EXACT inline-fallback
// copy the pages already show into Sanity, so an editor opening a doc in Studio
// sees the live wording instead of a blank field (or a missing doc). Because the
// seeded values are byte-for-byte the page fallbacks, the rendered site does NOT
// change when this runs.
//
// It does three things:
//   (A) EXISTING singletons (home, about, courses, faculty, for-you, pricing,
//       resources, get-started, faq, siteSettings) — fills ONLY EMPTY fields, via
//       the same only-empty seedDoc pattern as scripts/seed-page-copy.mjs. Never
//       clobbers copy an editor has already changed; idempotent.
//   (B) MISSING singletons (contact, events, 404, privacy, accessibility) —
//       createIfNotExists with _id = the type name, seeded from the page fallback.
//       privacy + accessibility bodies are converted to Portable Text.
//   (C) Collections (faqCategory x5, faqItem x11, recurring event x3) —
//       createIfNotExists with stable _ids so a re-run is safe.
//
// SAFETY: dry-run by default. --apply gates ALL writes (patches AND creates).
// Every array object carries _key + _type; references use {_type:'reference',_ref}.
// No em-dashes in any seeded string.
//
// After running with --apply, run `npm run studio:deploy` and trigger a rebuild.

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

// --- env: parse studio/.env + root .env (root wins), then process.env ---------
function parseEnv(p) {
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}
const env = { ...parseEnv(resolve(root, 'studio/.env')), ...parseEnv(resolve(root, '.env')), ...process.env };
const projectId = env.PUBLIC_SANITY_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || env.SANITY_STUDIO_DATASET || 'production';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_AUTH_TOKEN;
if (!projectId || !token) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env');
  process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: '2024-08-01', useCdn: false });

// Add a stable _key (+ _type) to each object in an array, as Sanity requires.
const keyed = (type, items) => items.map((o, i) => ({ _type: type, _key: `${type}${i + 1}`, ...o }));

const isEmpty = (v) =>
  v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

// ───────────────────────────────────────────────────────────────────────────
// Portable Text helpers. Every block + span gets a deterministic _key so the
// same doc keys never collide across runs (createIfNotExists makes re-runs safe).
// ───────────────────────────────────────────────────────────────────────────
let _blockSeq = 0;
function ptKeys() {
  _blockSeq += 1;
  return { blockKey: `b${_blockSeq}`, spanKey: `s${_blockSeq}` };
}
// A single-span block of the given style ('normal', 'h2', 'h3', ...).
function block(style, text) {
  const { blockKey, spanKey } = ptKeys();
  return {
    _type: 'block',
    _key: blockKey,
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: spanKey, text, marks: [] }],
  };
}
const para = (text) => block('normal', text);
// The privacy + accessibility static fallbacks render section headings as
// <h2 class="text-h3"> (text-h3 size). PortableTextStatic maps the 'h3' style to
// text-h3, so seed headings as 'h3' to keep the rendered size pixel-identical to
// the fallback (a plain 'h2' style would render the larger text-h2).
const heading = (text) => block('h3', text);
// A bullet list item (level 1) — a normal-style block flagged as a bullet.
function bullet(text) {
  const { blockKey, spanKey } = ptKeys();
  return {
    _type: 'block',
    _key: blockKey,
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [{ _type: 'span', _key: spanKey, text, marks: [] }],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// ctaBlock factory — mirrors each page's inline fallback exactly, including the
// href. Shape: { _type:'ctaBlock', label, linkType:'external', externalUrl }.
// (Not an array member, so no _key is needed.)
// ───────────────────────────────────────────────────────────────────────────
const cta = (label, externalUrl) => ({ _type: 'ctaBlock', label, linkType: 'external', externalUrl });

// ════════════════════════════════════════════════════════════════════════════
// (A) EXISTING singletons — only-empty field fills, exact .astro fallback copy.
// ════════════════════════════════════════════════════════════════════════════

// homePage / aboutPage: text fields are already populated by seed-page-copy.mjs.
// Here we only add the closing-CTA *button* (still only-empty-safe).
const HOME = {
  finalCta: cta('Request information', '/get-started'),
};
const ABOUT = {
  finalCta: cta('Browse courses', '/courses'),
};

// coursesPage: closing CTA (index.astro FinalCta fallbacks) + the course-detail
// data-loss fields (courses/[slug].astro).
const COURSES = {
  finalCtaEyebrow: 'Not sure where to start?',
  finalCtaHeadline: 'Tell us what you want to learn',
  finalCtaSubhead: 'We will help you find the right course and point you to a free intro session.',
  finalCta: cta('Request information', '/get-started'),
  detailTrustLine: 'You can visit the first session free before you decide.',
  detailExpressLabel: 'Express interest',
  detailRequestLabel: 'Request information',
};

// facultyPage: closing CTA (faculty/index.astro).
const FACULTY = {
  finalCtaEyebrow: 'Learn from them',
  finalCtaHeadline: 'Find a course to take',
  finalCtaSubhead: 'Every course is taught by the people you just met.',
  finalCta: cta('Browse courses', '/courses'),
};

// forYouPage: closing CTA (for-you.astro).
const FOR_YOU = {
  finalCtaEyebrow: 'Still deciding?',
  finalCtaHeadline: 'Talk to a real person',
  finalCtaSubhead: 'Tell us where you are and we will help you find the right place to begin.',
  finalCta: cta('Request information', '/get-started'),
};

// pricingPage: closing CTA + the heritage-band stats trio (pricing.astro).
const PRICING = {
  finalCtaEyebrow: 'Questions about cost?',
  finalCtaHeadline: 'Ask us, plainly',
  finalCtaSubhead: 'Tell us your situation on the interest form and we will be straight with you.',
  finalCta: cta('Request information', '/get-started'),
  stats: keyed('pricingStat', [
    { value: 'Free', label: 'Sit in on a class first' },
    { value: 'Per course', label: 'Pay as you go, no degree debt' },
    { value: 'Need-based', label: 'Scholarships every term' },
  ]),
};

// resourcesPage: closing CTA + the plain-text empty-state body (resources.astro).
// Note: the live fallback links the word "in a course" to /courses; the editable
// emptyStateBody field is plain text, so the link is dropped here (the trailing
// "in a course." is kept as plain words).
const RESOURCES = {
  finalCtaEyebrow: 'Go deeper',
  finalCtaHeadline: 'Learn with the faculty',
  finalCtaSubhead: 'Every essay starts as something the faculty teach. Take the course.',
  finalCta: cta('Browse courses', '/courses'),
  emptyStateBody: 'New essays are on the way. In the meantime, the best way to learn from our faculty is in a course.',
};

// getStartedPage: closing CTA (get-started.astro).
const GET_STARTED = {
  finalCtaEyebrow: 'Prefer to browse first?',
  finalCtaHeadline: 'See what we teach',
  finalCtaSubhead: 'The catalog is open. Find a course, meet the teacher, and start when you are ready.',
  finalCta: cta('Browse courses', '/courses'),
};

// faqPage: hero subhead + closing CTA + the category order list (faq.astro).
const FAQ_PAGE = {
  heroSubhead: 'If your question is not here, just ask. We are happy to help you figure out whether the Academy is a fit.',
  finalCtaEyebrow: 'Still wondering?',
  finalCtaHeadline: 'Ask us anything',
  finalCtaSubhead: 'If your question is not here, send it our way and we will answer plainly.',
  finalCta: cta('Get in touch', '/get-started'),
  categoryOrder: ['Courses & Format', 'Cost & Scholarships', "Who It's For", 'Reformed Identity', 'Getting Started'],
};

// siteSettings: the editor-managed nav + footer menus and the footer credit, from
// the Header/Footer fallbacks. Matches the navItems / footerColumns shapes in
// siteSettings.ts. DELIBERATELY does NOT seed phone or socials (left blank so an
// empty field hides rather than showing a stand-in).
const SETTINGS = {
  // FALLBACK_NAV_ITEMS in Header.astro — all flat navLinks.
  navItems: keyed('navLink', [
    { label: 'Courses', href: '/courses' },
    { label: 'Faculty', href: '/faculty' },
    { label: 'About', href: '/about' },
    { label: 'Events', href: '/events' },
    { label: 'Resources', href: '/resources' },
  ]),
  // FALLBACK_FOOTER_COLUMNS in Footer.astro (Explore / About / Get started).
  // Each column's links is itself a keyed array of footerLink objects.
  footerColumns: keyed('footerColumn', [
    {
      title: 'Explore',
      links: keyed('footerLink', [
        { label: 'Courses', href: '/courses' },
        { label: 'Faculty', href: '/faculty' },
        { label: 'Events', href: '/events' },
        { label: 'Resources', href: '/resources' },
      ]),
    },
    {
      title: 'About',
      links: keyed('footerLink', [
        { label: 'About', href: '/about' },
        { label: 'For You', href: '/for-you' },
        { label: 'Pricing & Scholarships', href: '/pricing' },
        { label: 'FAQ', href: '/faq' },
      ]),
    },
    {
      title: 'Get started',
      links: keyed('footerLink', [
        { label: 'Get started', href: '/get-started' },
        { label: 'Request information', href: '/get-started' },
        { label: 'Book a free intro', href: '/get-started' },
        { label: 'Contact', href: '/contact' },
      ]),
    },
  ]),
  // Designer credit fallbacks from Footer.astro (creditLabel / creditUrl).
  footerCredit: 'Designed by Nixon Creative Studio',
  footerCreditUrl: 'https://www.nixoncreativestudio.com',
};

// ════════════════════════════════════════════════════════════════════════════
// (D) SEO — seoTitle / seoDescription for the page singletons, mirroring each
// page's `.astro` fallback exactly (render-neutral). seoImage stays unset (the
// per-page OG image is generated at build time; it is an intentional optional).
// faculty / event DETAIL pages have no per-doc SEO fields, so they are not here.
// ════════════════════════════════════════════════════════════════════════════
const SEO_DOCS = {
  coursesPage: { seoTitle: 'Courses · The Presbyterian Academy', seoDescription: 'Reformed formation taught in person, in cohorts. Browse the catalog by topic or teacher.' },
  facultyPage: { seoTitle: 'Faculty · The Presbyterian Academy', seoDescription: 'Every course is led by an ordained minister or a credentialed Reformed scholar. Meet the faculty of The Presbyterian Academy.' },
  forYouPage: { seoTitle: 'For You · The Presbyterian Academy', seoDescription: 'However you lead or learn, there is a starting point here for you.' },
  pricingPage: { seoTitle: 'Pricing & Scholarships · The Presbyterian Academy', seoDescription: 'What a course costs, said plainly, and how we keep Reformed formation within reach.' },
  resourcesPage: { seoTitle: 'Resources · The Presbyterian Academy', seoDescription: 'Short reads on Scripture, theology, and formation, from the faculty of The Presbyterian Academy.' },
  getStartedPage: { seoTitle: 'Get Started · The Presbyterian Academy', seoDescription: 'Request information, book a free intro, or download a course syllabus. No application fee, no pressure.' },
  faqPage: { seoTitle: 'Frequently Asked Questions · The Presbyterian Academy', seoDescription: 'Common questions about courses, format, cost, scholarships, who it is for, and our Reformed identity.' },
  contactPage: { seoTitle: 'Contact · The Presbyterian Academy', seoDescription: 'Reach The Presbyterian Academy. Address, phone, email, office hours, and how to find the West Chester campus.' },
  eventsPage: { seoTitle: 'Events · The Presbyterian Academy', seoDescription: 'Info sessions, open lectures, workshops, and term start dates at The Presbyterian Academy. See what is coming up.' },
  privacyPage: { seoTitle: 'Privacy Policy · The Presbyterian Academy', seoDescription: 'How we handle the information you share when you reach out or subscribe.' },
  accessibilityPage: { seoTitle: 'Accessibility · The Presbyterian Academy', seoDescription: 'How we make this site usable for everyone, and how to tell us if something gets in your way.' },
};

const EXISTING = [
  ['homePage', HOME],
  ['aboutPage', ABOUT],
  ['coursesPage', COURSES],
  ['facultyPage', FACULTY],
  ['forYouPage', FOR_YOU],
  ['pricingPage', PRICING],
  ['resourcesPage', RESOURCES],
  ['getStartedPage', GET_STARTED],
  ['faqPage', FAQ_PAGE],
  ['siteSettings', SETTINGS],
];

// Only-empty patch of an existing singleton. Mirrors seed-page-copy.mjs.
async function seedDoc(type, fields) {
  const existing = await client.fetch(`*[_type == $type][0]`, { type });
  if (!existing) {
    console.warn(`  (no ${type} document found — skipping)`);
    return 0;
  }
  const toSet = {};
  for (const [k, v] of Object.entries(fields)) {
    if (isEmpty(existing[k])) toSet[k] = v;
  }
  const keys = Object.keys(toSet);
  console.log(`  ${type} (${existing._id}): ${keys.length} empty field(s)${keys.length ? ` -> ${keys.join(', ')}` : ''}`);
  if (APPLY && keys.length) await client.patch(existing._id).set(toSet).commit();
  return keys.length;
}

// ════════════════════════════════════════════════════════════════════════════
// (B) MISSING singletons — createIfNotExists, _id = the type name. Seeded from
//     the page fallback copy. privacy + accessibility bodies become Portable Text.
// ════════════════════════════════════════════════════════════════════════════

const SITE_NAME = 'The Presbyterian Academy';

// contactPage (contact.astro fallbacks). whoToReach rows are left to the page's
// own FALLBACK_REASONS (they derive from siteSettings email), so contactReasons
// stays unset and the live page is unchanged.
const CONTACT_DOC = {
  _type: 'contactPage',
  _id: 'contactPage',
  heroEyebrow: 'Contact',
  heroHeadline: 'Get in touch',
  heroSubhead: 'Questions about a course, scholarships, or getting started? Here is how to reach us.',
  whoToReachLabel: 'Who to reach',
  gettingHereLabel: 'Getting here',
  gettingHereBody:
    'Courses meet in person on the West Chester campus, with free on-site parking. The building is a short drive from the interstate.',
  whatToExpectEyebrow: 'Send a Note',
  formSectionHeadline: 'Start the conversation',
  finalCtaEyebrow: 'Ready to begin?',
  finalCtaHeadline: 'Tell us what you want to learn',
  finalCtaSubhead: 'Request information or book a free intro. No application fee, no pressure.',
  finalCta: cta('Request information', '/get-started'),
};

// eventsPage (events/index.astro fallbacks). upcomingEmpty + rhythms* mirror the
// page; the upcomingEmpty fallback links the word "course" to /courses, dropped
// here to plain text since the field is a plain string.
const EVENTS_DOC = {
  _type: 'eventsPage',
  _id: 'eventsPage',
  heroEyebrow: 'Events',
  heroHeadline: 'Come and see what we do',
  heroSubhead:
    'Free info sessions, open lectures, and workshops, plus the term dates and deadlines you need to plan ahead.',
  upcomingEyebrow: 'Mark your calendar',
  upcomingHeadline: 'Upcoming',
  upcomingEmpty:
    'Nothing dated on the calendar right now. The recurring rhythms below never stop, and the best place to start is a course.',
  rhythmsEyebrow: 'Every month',
  rhythmsHeadline: 'Ways to get a feel for the Academy',
  finalCtaEyebrow: 'Want a closer look?',
  finalCtaHeadline: 'Book a free intro',
  finalCtaSubhead: 'A short, no-pressure conversation about where you are and what fits.',
  finalCta: cta('Get started', '/get-started'),
};

// notFoundPage (404.astro fallbacks — the school CTAs).
const NOT_FOUND_DOC = {
  _type: 'notFoundPage',
  _id: 'notFoundPage',
  seoTitle: 'Page not found',
  seoDescription: 'That page wandered off. Head back to the homepage or get in touch.',
  eyebrow: 'Error 404',
  headline: "This page isn't in the index.",
  body:
    'A link may be out of date, or the address mistyped. The catalog, the faculty, and a way to reach us are all a click away.',
  primaryCtaLabel: 'Browse courses',
  primaryCtaHref: '/courses',
  secondaryCtaLabel: 'Meet the faculty',
  secondaryCtaHref: '/faculty',
  tertiaryCtaLabel: 'Get in touch',
  tertiaryCtaHref: '/contact',
};

// privacyPage + accessibilityPage are built from a factory below, because their
// body copy embeds the live siteSettings.email (so the seeded Portable Text reads
// EXACTLY what the page renders today). The email is fetched at runtime in main()
// and passed in. The inline mailto links in the source become plain email text to
// keep the Portable Text simple. lastUpdated: privacy requires it (schema), and
// both static fallbacks say "last reviewed in June 2026", so seed the 1st.

// privacyPage (privacy.astro static fallback body), parameterized by email.
function privacyDoc(email) {
  return {
    _type: 'privacyPage',
    _id: 'privacyPage',
    heroEyebrow: 'Transparency first.',
    heroHeadline: 'Privacy Policy',
    lastUpdated: '2026-06-01',
    body: [
      para(`This is the privacy policy for ${SITE_NAME}. The goal here is to be straightforward about what information we collect and why.`),
      heading('What gets collected'),
      para('When you email us or send a message through this site, you share your name, email address, and whatever details you include. We use that information only to respond to you. Nothing else.'),
      para('If you subscribe to our newsletter, your email address goes to our email provider so occasional news from the Academy can reach you. It is not shared with anyone else.'),
      heading("What doesn't happen"),
      bullet('Your information is never sold.'),
      bullet('There is no ad targeting or tracking pixels on this site.'),
      bullet('Traffic is measured with Cloudflare Web Analytics, which counts page visits without setting cookies or identifying individual visitors.'),
      heading('Unsubscribing from the newsletter'),
      para("Every email includes an unsubscribe link at the bottom. Click it and you're off the list right away. If you run into any trouble, email directly and it'll be handled promptly."),
      heading('Questions or data requests'),
      para(`If you have questions about how your information is handled, or want your data removed, reach out at ${email}. You'll hear back within a few business days.`),
      para('This policy was last reviewed in June 2026 and will be updated if anything meaningful changes about how this site handles your data.'),
    ],
  };
}

// accessibilityPage (accessibility.astro static fallback body), parameterized by
// email. The barrier-report email is rendered as plain text. lastUpdated is
// optional here; the static copy says "last reviewed in June 2026".
function accessibilityDoc(email) {
  return {
    _type: 'accessibilityPage',
    _id: 'accessibilityPage',
    heroEyebrow: 'Built for everyone.',
    heroHeadline: 'Accessibility',
    lastUpdated: '2026-06-01',
    body: [
      para(`${SITE_NAME} wants this website to work for everyone, including people who use a screen reader, move through pages with a keyboard, or rely on other assistive technology. We treat accessibility as part of building and maintaining the site, not an afterthought.`),
      heading('The standard we hold ourselves to'),
      para('We aim to meet the Web Content Accessibility Guidelines, known as WCAG, version 2.1 at Level AA. That is the benchmark most widely used for the web, and we check our work against it as the site grows.'),
      heading('What that looks like here'),
      bullet('Clear, semantic headings and page landmarks, so assistive technology can move through each page in a logical order.'),
      bullet('Full keyboard support, with a visible focus outline and a skip-to-content link at the top of every page.'),
      bullet('Text and background colors chosen for sufficient contrast, checked in both light and dark modes.'),
      bullet('Written descriptions for images that carry meaning, with decorative images hidden from screen readers.'),
      bullet('Text that resizes cleanly and a layout that adapts down to small phone screens.'),
      heading('Where we are still working'),
      para('A few parts of the site use tools from other companies, such as the scheduling widget and the embedded map. We choose accessible options where we can, but we do not control everything about how those tools behave. If one of them gets in your way, tell us and we will get you the same information another way.'),
      heading('Found a barrier? Tell us.'),
      para('If anything on this site is hard to use, or you need a page in a different format, please reach out and we will make it right.'),
      para(`Email us at ${email}. Or send a note through our contact page.`),
      para('Please include the address of the page and a short note about what went wrong. We read every message, reply within a few business days, and will get you the information you need.'),
      para('This statement was last reviewed in June 2026. We update it as the site changes.'),
    ],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// (C) Collections — createIfNotExists with stable _ids.
// ════════════════════════════════════════════════════════════════════════════

// 5 FAQ categories. Stable _ids; titles + order from faq.astro DEFAULT_CATEGORY_ORDER.
const FAQ_CATEGORIES = [
  { _id: 'faqCategory.courses-format', title: 'Courses & Format', displayOrder: 1 },
  { _id: 'faqCategory.cost-scholarships', title: 'Cost & Scholarships', displayOrder: 2 },
  { _id: 'faqCategory.who-its-for', title: "Who It's For", displayOrder: 3 },
  { _id: 'faqCategory.reformed-identity', title: 'Reformed Identity', displayOrder: 4 },
  { _id: 'faqCategory.getting-started', title: 'Getting Started', displayOrder: 5 },
];
// Map a category title to its faqCategory _id for the reference.
const CAT_ID_BY_TITLE = Object.fromEntries(FAQ_CATEGORIES.map((c) => [c.title, c._id]));

const FAQ_CATEGORY_DOCS = FAQ_CATEGORIES.map((c) => ({ _type: 'faqCategory', ...c }));

// 11 FAQ items, verbatim from faq.astro `fallbackFaqs`. The answer string becomes
// a single normal-style Portable Text block. categoryRef points at the matching
// faqCategory; displayOrder is sequential within each category.
const FALLBACK_FAQS = [
  { category: 'Courses & Format', question: 'How do courses work?', answer: 'Each course meets in person, in a cohort, over six to ten evenings. You read real texts, discuss them together, and leave able to teach what you have learned.' },
  { category: 'Courses & Format', question: 'Do I need a degree or prior training?', answer: 'No. Our courses are built for adult lay leaders and curious believers. We meet you where you are.' },
  { category: 'Courses & Format', question: 'Where do classes meet?', answer: 'On our West Chester campus, with free on-site parking. Most courses meet on weekday evenings.' },
  { category: 'Cost & Scholarships', question: 'What does a course cost?', answer: 'Most courses are $195, or $95 to audit. A full certificate track is $1,400. See the Pricing page for the details.' },
  { category: 'Cost & Scholarships', question: 'What if I cannot afford it?', answer: 'Need-based scholarships are available every term, funded by our supporters. No one is turned away for cost. Just tell us on the interest form.' },
  { category: "Who It's For", question: 'Who takes courses here?', answer: 'Ruling and teaching elders, small-group and Sunday-school leaders, lifelong learners from PC(USA), ECO, and EPC churches, and anyone discerning a call.' },
  { category: "Who It's For", question: 'Can I take a course if I am not Presbyterian?', answer: 'Yes. Reformed Christians of every stripe, and the simply curious, are welcome.' },
  { category: 'Reformed Identity', question: 'What do you believe?', answer: 'We are a confessional Reformed school in the PC(USA), holding to the Westminster Standards and the Book of Confessions, taught for ordinary believers.' },
  { category: 'Reformed Identity', question: 'Is this a seminary?', answer: 'No. We are a lay-formation school. The teaching is seminary-grade, but it is built for people who are not leaving their jobs and families for a degree.' },
  { category: 'Getting Started', question: 'How do I try before I enroll?', answer: 'Sit in on the first session of any course, free, or book a free intro session. Request information and we will help you find a fit.' },
  { category: 'Getting Started', question: 'When do courses start?', answer: 'We run cohorts each term. The next term and its dates are on the home page and the Events page.' },
];

// Build faqItem docs with per-category sequential displayOrder.
const _faqOrderByCat = {};
const FAQ_ITEM_DOCS = FALLBACK_FAQS.map((f, i) => {
  _faqOrderByCat[f.category] = (_faqOrderByCat[f.category] ?? 0) + 1;
  return {
    _type: 'faqItem',
    _id: `faqItem.seed-${i + 1}`,
    question: f.question,
    answer: [para(f.answer)],
    categoryRef: { _type: 'reference', _ref: CAT_ID_BY_TITLE[f.category] },
    displayOrder: _faqOrderByCat[f.category],
  };
});

// 3 recurring events, verbatim from events/index.astro `RECURRING_FALLBACK`.
// category maps each to an event.ts category option value.
const RECURRING_FALLBACK = [
  { slug: 'monthly-info-session', title: 'Monthly info session', scheduleLabel: 'First Tuesday, 7pm', summary: 'A relaxed evening to ask questions, meet a teacher, and see if the Academy is a fit. Free and open to all.', category: 'Info session' },
  { slug: 'open-lecture-series', title: 'Open lecture series', scheduleLabel: 'Third Thursday, 7pm', summary: 'A single public lecture from one of our faculty, no registration required.', category: 'Open lecture' },
  { slug: 'visit-a-class', title: 'Visit a class', scheduleLabel: 'During each term', summary: 'Sit in on the first session of any course, free, before you enroll.', category: 'Other' },
];
const RECURRING_EVENT_DOCS = RECURRING_FALLBACK.map((ev, i) => ({
  _type: 'event',
  _id: `event.recurring-${i + 1}`,
  title: ev.title,
  slug: { _type: 'slug', current: ev.slug },
  eventType: 'recurring',
  scheduleLabel: ev.scheduleLabel,
  summary: ev.summary,
  category: ev.category,
}));

// One-line preview of a doc's headline value for the dry-run log.
function previewOf(doc) {
  return (
    doc.heroHeadline ?? doc.headline ?? doc.title ?? doc.question ??
    (Array.isArray(doc.body) ? doc.body[0]?.children?.[0]?.text : undefined) ??
    '(no headline)'
  );
}

// createIfNotExists a list of docs; logs each one. Returns the count it created
// (dry-run: the count it WOULD create — every doc, since we don't pre-check).
async function seedCreate(label, docs) {
  console.log(`\n${label}:`);
  let n = 0;
  for (const doc of docs) {
    const exists = await client.fetch(`defined(*[_id == $id][0]._id)`, { id: doc._id });
    if (exists) {
      console.log(`  exists, skip:   ${doc._id}`);
      continue;
    }
    n += 1;
    const preview = String(previewOf(doc)).slice(0, 72);
    console.log(`  ${APPLY ? 'create' : 'would create'}: ${doc._id}  ·  "${preview}"`);
    if (APPLY) await client.createIfNotExists(doc);
  }
  return n;
}

// Per-course SEO: seoTitle = "<title> · The Presbyterian Academy", seoDescription
// = the course summary -- exactly what courses/[slug].astro renders as the
// fallback. Only-empty per field.
async function seedCourseSeo() {
  console.log('\n(D) Course SEO (only-empty):');
  const courses = await client.fetch(`*[_type == "course"]{ _id, title, summary, seoTitle, seoDescription }`);
  let n = 0;
  for (const c of courses) {
    const toSet = {};
    if (isEmpty(c.seoTitle)) toSet.seoTitle = `${c.title} · ${SITE_NAME}`;
    if (isEmpty(c.seoDescription) && !isEmpty(c.summary)) toSet.seoDescription = c.summary;
    const keys = Object.keys(toSet);
    console.log(`  ${c.title}: ${keys.length ? keys.join(', ') : 'already set'}`);
    if (APPLY && keys.length) await client.patch(c._id).set(toSet).commit();
    n += keys.length;
  }
  return n;
}

// Orphan cleanup: homePage and aboutPage were both re-schema'd and no longer
// define a `heroImage` field (homePage uses heroImages[]; aboutPage has a
// text-only hero). seed-academic-images.mjs had set heroImage on them anyway,
// leaving a stale value that Studio flags as an "unknown field". Unset it on any
// document of a type that no longer defines heroImage (the image ASSET is
// preserved). Idempotent (no-op once gone). The other page singletons keep their
// heroImage -- it is a valid field in their schema.
const HERO_IMAGE_ORPHAN_TYPES = ['homePage', 'aboutPage'];
async function cleanupOrphans() {
  console.log('\n(E) Orphan cleanup (heroImage on re-schema\'d pages):');
  let n = 0;
  for (const type of HERO_IMAGE_ORPHAN_TYPES) {
    const doc = await client.fetch(`*[_type == $type][0]{ _id, "has": defined(heroImage) }`, { type });
    if (doc?.has) {
      console.log(`  ${APPLY ? 'unset' : 'would unset'}: ${doc._id}.heroImage (legacy orphan field)`);
      if (APPLY) await client.patch(doc._id).unset(['heroImage']).commit();
      n += 1;
    } else {
      console.log(`  ${type}.heroImage: already clean`);
    }
  }
  return n;
}

// ════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log(`Seeding editability -> ${projectId}/${dataset}  (${APPLY ? 'APPLY' : 'DRY RUN'})`);

  // Resolve the public email exactly as resolveSiteSettings would (clean -> ''),
  // so the privacy/accessibility Portable Text bodies embed the SAME address the
  // live pages render. Blank stays blank (the live fallback would also render
  // blank there), which keeps the seed render-neutral.
  const ss = await client.fetch(`*[_type == "siteSettings"][0]{email}`);
  const email = (typeof ss?.email === 'string' ? ss.email.trim() : '') || '';
  console.log(`  (privacy/accessibility body email -> ${email || '(blank)'})`);

  const MISSING = [CONTACT_DOC, EVENTS_DOC, NOT_FOUND_DOC, privacyDoc(email), accessibilityDoc(email)];

  // (A) Existing singletons — only-empty patches.
  console.log('\n(A) Existing singletons (fill only empty fields):');
  let patched = 0;
  for (const [type, fields] of EXISTING) {
    patched += await seedDoc(type, fields);
  }

  // (B) Missing singletons — createIfNotExists.
  const createdSingletons = await seedCreate('(B) Missing singletons (create if absent)', MISSING);

  // (C) Collections — createIfNotExists.
  const createdCategories = await seedCreate('(C) FAQ categories', FAQ_CATEGORY_DOCS);
  const createdFaqs = await seedCreate('(C) FAQ items', FAQ_ITEM_DOCS);
  const createdEvents = await seedCreate('(C) Recurring events', RECURRING_EVENT_DOCS);

  // (D) SEO -- only-empty patches on the page singletons + per-course SEO.
  console.log('\n(D) SEO (only-empty):');
  for (const [type, seo] of Object.entries(SEO_DOCS)) {
    patched += await seedDoc(type, seo);
  }
  patched += await seedCourseSeo();

  // (E) Orphan cleanup (homePage.heroImage legacy field).
  patched += await cleanupOrphans();

  const created = createdSingletons + createdCategories + createdFaqs + createdEvents;
  console.log(`\n${APPLY ? 'Done' : 'Dry run complete'}.`);
  console.log(`  ${APPLY ? 'Patched' : 'Would patch'} ${patched} empty field(s) on existing singletons.`);
  console.log(`  ${APPLY ? 'Created' : 'Would create'} ${created} new doc(s).`);
  if (!APPLY) console.log('\n  Re-run with --apply to write. Then: npm run studio:deploy + rebuild.');
}
main().catch((e) => { console.error(e); process.exit(1); });
