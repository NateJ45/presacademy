// =============================================================================
// "How This Works" — plain-language walkthroughs for faculty & staff
// =============================================================================
// This is DATA, not code: each guide is a list of typed blocks. It lives in the
// repo (not editable in the Studio) so it can never be accidentally deleted,
// and so every future editor inherits it. The renderer is
// ../components/GuideView.tsx; the nav wiring is in ../structure.ts.
//
// Editing conventions:
//   - Formatting (rendered by GuideView's RichText): **double asterisks** for
//     bold emphasis on a concept; `backticks` for a THING YOU CLICK (a button,
//     a tab, the +) which renders as a small button-look chip; _underscores_
//     for a light aside. Nothing else.
//   - Do NOT use em-dashes. Use commas or "and".
//   - Define any jargon in plain words.
//   - Every guide picks a category from GUIDE_CATEGORIES (a typo is a compile
//     error) and a DiyLevel badge.
//   - A `path` block with a `link` becomes a clickable "Take me there" card.
//     Link targets: { doc } opens a document editor (singleton convention:
//     document id = schema type), { pane } opens a structure pane by its id
//     path (';'-separated for nesting, e.g. 'catalog;course' - the ids are set
//     in ../structure.ts), { tool } opens a top-bar tool (e.g. 'media').
//   - Site-specific values (contact details) live in SITE below.
// =============================================================================

export type DiyLevel = 'self' | 'ask' | 'mixed';

// Where a "Where in the Studio" breadcrumb can LINK to, so the card is a door,
// not just directions. One workspace, so no workspace switch is needed.
export type PathLink = { doc: string; type?: string } | { pane: string } | { tool: string };

export type GuideBlock =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'steps'; items: string[] }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'path'; items: string[]; link?: PathLink }
  | {
      kind: 'callout';
      tone?: 'primary' | 'positive' | 'caution' | 'critical' | 'default';
      title?: string;
      text: string;
    }
  | { kind: 'seealso'; items: string[] };

// The guide list groups guides under these headings (titled dividers in
// ../structure.ts), in THIS order. A new guide must pick one of these; the
// union type makes a typo or a missing category a compile error.
export const GUIDE_CATEGORIES = [
  'Start here',
  'Website pages & menus',
  'Courses, faculty & terms',
  'Events, notices & voices',
  'Money & pricing',
  'Look, brand & housekeeping',
] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export interface Guide {
  slug: string;
  category: GuideCategory;
  title: string;
  icon: string; // emoji, shown in the left nav
  lead: string;
  diy?: DiyLevel;
  body: GuideBlock[];
}

// The only site-specific copy. Swap these when reusing the template.
export const SITE = {
  contactName: 'Nathan',
  contactEmail: 'nathan@nixoncreativestudio.com',
};

export const guides: Guide[] = [
  // ==========================================================================
  // START HERE
  // ==========================================================================
  {
    slug: 'start-here',
    category: 'Start here',
    title: 'Start here: how it all works',
    icon: '👋',
    lead: "The big picture: what this Studio is, how your changes reach the live website, and how the left menu is organized.",
    diy: 'self',
    body: [
      { kind: 'h', text: 'The Studio vs. the website' },
      {
        kind: 'p',
        text: 'This **Studio** is your control room. The **website** is what visitors see. You make changes here, and they appear on the website after you publish them. The Studio is private. The website is public.',
      },
      { kind: 'h', text: 'The one rule: nothing is live until you Publish' },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'You cannot break the live site just by editing.',
        text: 'While you type, your changes save automatically as a private **draft** that only Studio users can see. The website does not change until you click the `Publish` button at the bottom right. So click around, try things, and only publish when it looks right.',
      },
      { kind: 'h', text: 'When your change shows up on the website' },
      {
        kind: 'p',
        text: 'When you click `Publish`, the website rebuilds itself and your change appears a few minutes later, not the instant you publish. Re-read your text here before you publish, then open the website in another browser tab after the rebuild to see it live.',
      },
      { kind: 'h', text: 'The left menu, top to bottom' },
      {
        kind: 'bullets',
        items: [
          '**Welcome**: the landing screen, with shortcut cards for the common jobs and a list of what was edited recently.',
          '**How This Works**: these guides.',
          '**Site Settings**: the site-wide basics (name, contact details, menus).',
          '**Pages**: the fixed pages of your site (Home, About, Courses, and so on). One of each, plus **Custom Pages** you build yourself.',
          '**Catalog**: the course library and what supports it (Courses, Terms, Teaching Areas, Pricing Tiers).',
          '**Faculty**: the people who teach, each with a short scholarly profile.',
          '**Content**: reusable lists you add to over time (Testimonials, FAQ, Forms, Announcements).',
          '**Events**: info sessions, open lectures, workshops, and term starts shown on the Events page.',
          '**Recently deleted**: the trash. Deleted items wait here and can be restored.',
          '**Media** (in the top bar): every photo you have uploaded, in one searchable place.',
        ],
      },
      {
        kind: 'seealso',
        items: ["Words you'll see (a little glossary)", "Edit a page's words & photos", 'Do it yourself vs. ask for help'],
      },
    ],
  },

  {
    slug: 'glossary',
    category: 'Start here',
    title: "Words you'll see (a little glossary)",
    icon: '📖',
    lead: 'The handful of Studio words worth knowing, each defined in plain English.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'Publishing words' },
      {
        kind: 'bullets',
        items: [
          '**Publish**: make your change live on the website. The green `Publish` button sits at the bottom right of every document.',
          '**Draft**: a saved change that is not live yet. While you type, the Studio saves a draft automatically. A colored dot next to a document means it has unpublished edits.',
          '**Unpublish**: take a document off the live site without losing it. It stays in the Studio as a draft, ready to publish again.',
        ],
      },
      { kind: 'h', text: 'Building words' },
      {
        kind: 'bullets',
        items: [
          '**Section** (or block): one stackable chunk of a page, like a photo row, a quote, or a list of cards. You add, reorder, and remove sections; the design of each is set for you.',
          '**Singleton**: a document that exists exactly once, like the Home page or Site Settings. You cannot make a second copy, and that is on purpose.',
          '**Slug**: the end of a web address. The slug "about" makes the page live at yoursite.org/about. Lowercase letters and dashes, no spaces.',
          '**Reference**: a link from one document to another. A course points at its instructors and its term by referencing them, so you set a fact once and reuse it everywhere.',
        ],
      },
      { kind: 'h', text: 'Search words' },
      {
        kind: 'bullets',
        items: [
          '**SEO** (search engine optimization): how a page presents itself to Google and to social media. The **SEO title** is the headline in a Google result; the **SEO description** is the sentence under it. Most documents have an `SEO` tab for these.',
          '**Alt text**: a short sentence describing a photo, read aloud to blind visitors and read by Google. Every image field asks for it.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'See it, not just read it',
        text: 'Pages and courses have an `SEO preview` tab that shows exactly how the page will look in a Google result and in a social share card, updating as you type.',
      },
      { kind: 'seealso', items: ['Start here: how it all works'] },
    ],
  },

  {
    slug: 'diy-vs-nathan',
    category: 'Start here',
    title: 'Do it yourself vs. ask for help',
    icon: '🧭',
    lead: 'A quick map of what is safe to do on your own, what to bring to Nathan, and the one button never to click.',
    diy: 'mixed',
    body: [
      { kind: 'h', text: 'Do these yourself, anytime' },
      {
        kind: 'bullets',
        items: [
          "Edit any page's words and photos.",
          'Add and edit courses, and set when they run.',
          'Add and edit faculty profiles.',
          'Set up terms and pricing tiers.',
          'Add testimonials, events, FAQs, and announcement banners.',
          'Add, reorder, and remove sections on a page, and build new Custom Pages.',
          'Add, rename, and reorder the top menu and footer links.',
          'Change section background tones and images.',
          'Delete something by mistake and bring it back from **Recently deleted**.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'You cannot break the live site by editing.',
        text: 'Nothing is public until you publish. Explore freely.',
      },
      { kind: 'h', text: 'Bring these to Nathan' },
      {
        kind: 'bullets',
        items: [
          'Needing a new kind of field, or a new kind of section that does not exist yet.',
          'Web address changes, redirects, the domain, or email and DNS settings.',
          'Adding a new outside tool (a new registration, payment, or video service).',
          'Changing the fonts or the exact brand colors.',
          'Anything that shows an error, or any screen that looks like code.',
        ],
      },
      { kind: 'h', text: 'The one hard rule' },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Never click "Remove field"',
        text: 'If you ever see a button called **Remove field**, do not click it. It does not just clear one box, it erases that field on every document, and it cannot be undone easily. Clearing the text inside a box is fine. Removing the field is not.',
      },
      { kind: 'h', text: 'Reaching Nathan' },
      {
        kind: 'p',
        text: `Email ${SITE.contactName} at ${SITE.contactEmail}. When something is confusing or looks broken, a quick note with a screenshot is the fastest way to get help. There is no silly question.`,
      },
    ],
  },

  // ==========================================================================
  // WEBSITE PAGES & MENUS
  // ==========================================================================
  {
    slug: 'edit-page',
    category: 'Website pages & menus',
    title: "Edit a page's words & photos",
    icon: '✏️',
    lead: 'Change the words and photos on any existing page, like Home, About, or Courses.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', '(choose a page)'], link: { pane: 'pages' } },
      { kind: 'h', text: 'Make an edit' },
      {
        kind: 'steps',
        items: [
          'Open **Pages** and click the page you want, for example `About`.',
          'Fields are grouped into tabs at the top (Hero, the page copy, `SEO`, `Page sections`). Click a tab to find what you want.',
          'Change the text, or swap a photo.',
          'Re-read your change here to make sure it reads right.',
          'Click `Publish`. The website rebuilds and your change appears in a few minutes.',
        ],
      },
      { kind: 'h', text: 'The empty-box rule (friendly and important)' },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Empty is fine',
        text: 'Many text boxes are blank on purpose. When a box is empty, the website shows its built-in wording. Only type in a box when you want to change that wording. Leaving it blank is perfectly safe.',
      },
      { kind: 'h', text: 'A note on the Courses and Faculty pages' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'These build themselves',
        text: 'The Courses page and the Faculty page lay out their cards automatically from the Catalog and Faculty lists. To change a course or a teacher, edit that course or that faculty member, not the page. The page fields only control the intro wording around the cards.',
      },
      { kind: 'seealso', items: ['Add or edit a course', 'Photos & images', 'Do it yourself vs. ask for help'] },
    ],
  },

  {
    slug: 'new-page',
    category: 'Website pages & menus',
    title: 'Build a brand-new page',
    icon: '🧱',
    lead: 'Create a new page from scratch, like a reading group or a special campaign, without a designer.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', 'Custom Pages', '+ New page'], link: { pane: 'pages;page' } },
      { kind: 'h', text: 'Build a page' },
      {
        kind: 'steps',
        items: [
          'Open **Pages**, then **Custom Pages**, then the `+` button.',
          'Pick a **starting layout** if one fits: _Simple text page_ or _Info page with questions_. Each comes pre-filled with sections and [bracketed] placeholder text to replace. The plain **Page** option starts blank.',
          'Give it a **Title**.',
          'Set the **Slug**, which is the web address. A slug of "reading-group" makes the page live at yoursite.org/reading-group. Lowercase letters and dashes, no spaces.',
          'Add **Sections** to build the body (see the next guide).',
          '`Publish`. Your page is now live at its web address.',
        ],
      },
      { kind: 'h', text: 'Linking to your new page' },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'You can add it to the menu yourself',
        text: 'A new page is invisible until something links to it. To put it in the top menu or the footer, see the guide **Edit the top menu & footer**.',
      },
      { kind: 'seealso', items: ['Edit the top menu & footer', 'Add & arrange sections'] },
    ],
  },

  {
    slug: 'sections',
    category: 'Website pages & menus',
    title: 'Add & arrange sections',
    icon: '🧩',
    lead: 'Sections are the building blocks of a page. Mix and match them, reorder them, and set their backgrounds.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', '(any page)', 'Page sections'], link: { pane: 'pages' } },
      { kind: 'h', text: 'Add a section' },
      {
        kind: 'steps',
        items: [
          'Open a page and find **Page sections**.',
          'Click `Add item`. The picker is grouped into four named bands (Words, photos & video · Cards, facts & lists · From your catalog · Banners, forms & extras) and has a search box, so type "photo" or "FAQ" to jump straight to it.',
          'Pick a section and fill in its boxes.',
          '`Publish`. The new section appears on the site after it rebuilds (a few minutes).',
        ],
      },
      { kind: 'h', text: 'The bands, in plain words' },
      {
        kind: 'bullets',
        items: [
          '**Words, photos & video**: text, image + text, a quote or verse, a photo gallery, a media feature, and the arched showcase.',
          '**Cards, facts & lists**: card grids, feature cards, big numbers, numbered steps, an inline FAQ accordion, key dates, and partner logos.',
          '**From your catalog (auto-updating)**: the dynamic list (featured courses, upcoming events, faculty, testimonials), the FAQ list, and the pricing tiers. These keep themselves up to date from your other documents.',
          '**Banners, forms & extras**: the call-to-action band, a form, downloadable resources, and embeds.',
        ],
      },
      { kind: 'h', text: 'Reorder or remove' },
      {
        kind: 'steps',
        items: [
          'Drag a section by the dots on its left to move it. Top of the list is top of the page.',
          'Click the `⋮` menu on a section and choose **Remove** to delete it. (Removing a section is undoable before you publish.)',
        ],
      },
      { kind: 'h', text: "Change a section's background" },
      { kind: 'p', text: 'Each section has a **Section background** control so it sits nicely on the page. Open it to find:' },
      {
        kind: 'bullets',
        items: [
          '**Color tone**: pick a brand mood. The choices are **Default (paper)**, **Warm**, **Forest green**, and **Forest deep**. The text color adjusts on its own to stay readable.',
          '**Background image or video**: put a photo or video behind the section. An **Overlay darkness** slider keeps the words readable on top.',
          '**Vertical spacing**: Compact, Normal, or Spacious, to make the section shorter or taller.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'It stays on-brand',
        text: 'You are choosing from set brand tones, not raw colors, so whatever you pick looks like it belongs. More on that in the brand guide.',
      },
      { kind: 'seealso', items: ['The brand: colors & fonts', 'Photos & images'] },
    ],
  },

  {
    slug: 'top-menu',
    category: 'Website pages & menus',
    title: 'Edit the top menu & footer',
    icon: '🧭',
    lead: 'Add, rename, reorder, or remove the links in the website header and footer, including dropdown menus.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Site Settings', 'Navigation (menus)'], link: { doc: 'siteSettings' } },
      { kind: 'h', text: 'Add or change a menu link' },
      {
        kind: 'steps',
        items: [
          'Open **Site Settings** (top of the menu), then the `Navigation (menus)` tab.',
          'Under **Top menu links**, click `Add item`.',
          'Choose **Link** for a single page, or **Dropdown menu** to group several links under one label.',
          'For a link, type the **Label** (what people see) and the **Address** (a page on this site like /courses or /for-you, or a full web address).',
          'Drag items by the dots to reorder them. Use the `⋮` menu on an item to remove it.',
          'Click `Publish`. The header updates across the site.',
        ],
      },
      { kind: 'h', text: 'Build a dropdown menu' },
      {
        kind: 'steps',
        items: [
          'Add a **Dropdown menu** item and give it a **Menu label**, for example "About".',
          'Inside it, add a **Link** for each page in the dropdown.',
          '`Publish`.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Your list becomes the whole menu',
        text: 'While Top menu links is empty, the site shows the built-in menu. As soon as you add any items, they become the entire menu, so include every link you want in the header, not just the new one.',
      },
      { kind: 'h', text: 'Footer link columns' },
      {
        kind: 'steps',
        items: [
          'In the same `Navigation (menus)` tab, scroll to **Footer link columns**.',
          'Click `Add item`, choose **Column**, and give it a **Column heading**, for example "Study".',
          'Add a **Link** for each item in that column. Aim for three columns so the footer stays balanced.',
          '`Publish`. The "Get in touch" column (email, phone, social) is added for you automatically.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Empty means the built-in menus',
        text: 'Both the top menu and the footer columns fall back to the built-in menus while they are empty, so you only change what you fill in.',
      },
      { kind: 'seealso', items: ['Build a brand-new page'] },
    ],
  },

  {
    slug: 'photos',
    category: 'Website pages & menus',
    title: 'Photos & images',
    icon: '📷',
    lead: 'How to upload, crop, and describe photos so they look sharp and work for everyone.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Media (top bar)'], link: { tool: 'media' } },
      { kind: 'h', text: 'Add a photo' },
      {
        kind: 'steps',
        items: [
          'Click an image field and either drag a photo in, `Upload` one, or pick from the **Media** library. (There is an `Unsplash` tab too, for free stock photos.)',
          'Set the **focal point** (the hotspot): click the spot that matters, like a face. The site keeps that spot in view when it crops the photo for phones and wide screens.',
          'Add **Alt text**: one short sentence describing the photo. `Publish`.',
        ],
      },
      { kind: 'h', text: 'Alt text, briefly' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Why it matters',
        text: 'Alt text is read aloud to blind visitors and read by Google. Describe what is in the photo, for example "Adult students discussing a text around a seminar table." Skip phrases like "photo of".',
      },
      { kind: 'h', text: 'Good photos to use' },
      {
        kind: 'bullets',
        items: [
          'Use large, sharp images. A wide hero photo looks best around 2000 pixels wide.',
          'A social share image (the picture shown when a page is texted or posted) works best at 1200 by 630 pixels.',
          'Avoid tiny, blurry, or screenshot images in big spots.',
        ],
      },
      { kind: 'h', text: 'The Media library' },
      {
        kind: 'p',
        text: 'The **Media** icon in the top bar holds every photo you have uploaded. Search, tag, and reuse photos there instead of uploading the same picture twice.',
      },
    ],
  },

  // ==========================================================================
  // COURSES, FACULTY & TERMS
  // ==========================================================================
  {
    slug: 'courses',
    category: 'Courses, faculty & terms',
    title: 'Add or edit a course',
    icon: '📚',
    lead: 'A course is the heart of the school. Here is how to add one, set when it runs, and put it on the home page.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Catalog', 'Courses', '+ New course'], link: { pane: 'catalog;course' } },
      { kind: 'h', text: 'Before you start' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'A course points at three things',
        text: 'A course links to its **teaching area** (its subject), its **instructors** (the faculty who teach it), and its **term** (when it runs). If a teacher or a term does not exist yet, add it first: see **Add a faculty member** and **Set up a term or cohort**.',
      },
      { kind: 'h', text: 'Add a course (Details tab)' },
      {
        kind: 'steps',
        items: [
          'Open **Catalog**, then **Courses**, then `+`.',
          'Write the **Course title** in plain words. No course codes.',
          'The **Slug** (the web address) fills in from the title. Leave it unless you have a reason to change it.',
          'Write a one or two sentence **Summary**. It shows on the catalog card and is used as the page description for search.',
          'Add a **Cover image** with alt text.',
          'Pick a **Level** (Intro, Foundational, or Advanced) if it applies.',
          'Set the **Teaching areas** (the subject). This drives the topic filter on the catalog, so at least one is required.',
          'Set the **Instructors** by choosing one or more faculty members. This is the only place that link is made.',
          'Choose the **Format** (In person or Hybrid) and the **Venue / campus**.',
          'Add **Who this is for**: two or three real people, like "Small-group leaders who teach the text", not adjectives.',
          'Add the week-by-week **Sessions**, one row per session, each with a title and a short focus.',
        ],
      },
      { kind: 'h', text: 'Set when it runs (Schedule & cohorts tab)' },
      {
        kind: 'steps',
        items: [
          'Open the `Schedule & cohorts` tab and click `Add item` under **Offerings**.',
          'Choose the **Term** the cohort runs in. The term owns the actual dates, so you set them once there, not here.',
          'Add the **Schedule** text, like "Tuesdays, 7 to 9pm, 8 weeks", the **Number of sessions**, and a **Seats note** like "A few seats left".',
          'Set the offering **Status** (Open, Waitlist, or Closed).',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Where "next cohort" comes from',
        text: 'The site works out the next cohort on its own: it is the offering whose term starts on the soonest future date. You never type that anywhere, so it cannot fall out of date.',
      },
      { kind: 'h', text: 'Set the cost (Pricing tab)' },
      {
        kind: 'steps',
        items: [
          'Open the `Pricing` tab and choose a **Price tier** (see **Pricing & scholarships**).',
          'If one course needs different wording, fill in the **Price note** override, like "$195, audit $95". When set, it shows instead of the tier amount.',
        ],
      },
      { kind: 'h', text: 'Feature it' },
      {
        kind: 'steps',
        items: [
          'Turn on **Featured** to pin the course to the top of the catalog and into the home page catalog preview.',
          'Turn on **Recommended starting course** to surface it in the "Start here" rail. Use this sparingly.',
          '`Publish`. The course now appears on the Courses page at its own web address.',
        ],
      },
      { kind: 'seealso', items: ['Add a faculty member', 'Set up a term or cohort', 'Pricing & scholarships'] },
    ],
  },

  {
    slug: 'faculty',
    category: 'Courses, faculty & terms',
    title: 'Add a faculty member',
    icon: '👩‍🏫',
    lead: 'A faculty profile is a short, warm CV that gives a course its weight. Here is what each field is for.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Faculty', '+ New faculty member'], link: { pane: 'facultyMember' } },
      { kind: 'h', text: 'Identity' },
      {
        kind: 'steps',
        items: [
          'Open **Faculty** in the left menu, then `+`.',
          'Enter the **Name**, and an **Honorific** if there is one, like "Dr.", "The Rev.", or "The Rev. Dr.". It shows before the name.',
          'Write the **Teaching role** in plain English, like "Teacher of Scripture". Not endowed-chair language.',
          'Add a **Portrait** with alt text.',
          'Set the **Teaching areas**. These are shared with courses and drive the faculty filter, so at least one is required.',
          'Add **Specializations** if you like: narrow research interests in free text, like "Bavinck studies".',
        ],
      },
      { kind: 'h', text: 'Credentials' },
      {
        kind: 'steps',
        items: [
          'Fill in **Ordination** if it applies, like "Ordained minister of Word and Sacrament", and pick a **Denomination**.',
          'Add each **Degree**: the degree (like "PhD" or "MDiv"), the field, the **Institution** (required, so a degree never shows without its school), and the year. The year is free text, so "in progress" is allowed.',
          'Add any **Current positions & affiliations** (a role plus an organization).',
          'Note **Years serving / teaching** in free text, like "18 years in pastoral ministry".',
        ],
      },
      { kind: 'h', text: 'Bio & writing' },
      {
        kind: 'steps',
        items: [
          'List **Selected publications**: title, publisher or venue, year, and an optional link.',
          'Write the **Bio** as a few short, scholarly but warm paragraphs.',
          'Add **One human line**: a single disarming sentence, shown in italic, like "She makes the hardest passages feel like an open door."',
          '`Publish`.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Courses taught fills itself',
        text: 'You do not list courses on a faculty profile. The site reads that from each course\'s **Instructors** field, so "Courses taught" stays correct on its own. To link a teacher to a course, open the course and add them there.',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Drag to set the order',
        text: 'The Faculty list is drag-to-reorder: the order you set in the list is the order the site shows. Drag a person by the handle to move them.',
      },
      { kind: 'seealso', items: ['Add or edit a course'] },
    ],
  },

  {
    slug: 'terms',
    category: 'Courses, faculty & terms',
    title: 'Set up a term or cohort',
    icon: '🗓️',
    lead: 'A term holds the real dates for a season, like Fall 2026. Every course that runs then points at it, so dates live in one place.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Catalog', 'Terms', '+ New term'], link: { pane: 'catalog;term' } },
      { kind: 'h', text: 'Add a term' },
      {
        kind: 'steps',
        items: [
          'Open **Catalog**, then **Terms**, then `+`.',
          'Write the **Term name**, like "Fall 2026" or "Spring 2027". The **Slug** fills in from it.',
          'Set **Term begins** (required). This is the date the site uses to work out which cohort is next.',
          'Set **Term ends**, **Registration opens**, and **Apply by** as you know them.',
          'Pick a **Status**: Upcoming, Registration open, In session, or Closed.',
          'Add a **Note** if helpful, like "Evening cohort, West Chester campus".',
          '`Publish`.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Why dates live here, not on the course',
        text: 'A course points at a term through its **Offerings**, and the term holds the dates. Set a date once on the term and every course in that season shows the same dates. The "Next cohort begins" line across the site is the soonest term with a future start date, worked out for you.',
      },
      { kind: 'h', text: 'Connecting a course to a term' },
      {
        kind: 'p',
        text: 'After the term exists, open the course, go to the `Schedule & cohorts` tab, add an **Offering**, and choose this term. See **Add or edit a course**.',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'There is a checklist for the season change',
        text: 'When a new term is coming, the `New term setup` tool in the top bar walks the whole rollover in order: create the term, update the courses, check pricing, and post the term-start event.',
      },
      { kind: 'seealso', items: ['Add or edit a course'] },
    ],
  },

  // ==========================================================================
  // EVENTS, NOTICES & VOICES
  // ==========================================================================
  {
    slug: 'post-event',
    category: 'Events, notices & voices',
    title: 'Post or edit an event',
    icon: '📅',
    lead: 'Add an info session, open lecture, workshop, or term start. Events show on the Events page automatically.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Events', '+ New event'], link: { pane: 'event' } },
      { kind: 'h', text: 'Add an event' },
      {
        kind: 'steps',
        items: [
          'In the left menu, click **Events**, then the `+` button to start a new one.',
          'Fill in the **Event title**.',
          'Choose a **Type**: **Recurring** for something that repeats (a monthly info session) so it always shows, or **One-time** for a single date, which drops off the upcoming list once it passes.',
          'Pick a **Category** (Info session, Open lecture, Workshop, Webinar / Online, Term start, Application deadline, Community, or Other), and a **Who it is for** audience if you like.',
          'Set the **Schedule (display text)**, like "Saturday, June 27, 11am to 3pm" or "Third Tuesdays, 7pm". For a one-time event, also set the **Start date & time** so it sorts and drops off on its own.',
          'Add a short **Summary** for the list, and a longer **Full description** if there is more to say.',
          'If there is a sign-up, add the **Registration / RSVP link** and a button label. Add a **Cost** and a **Contact name and email** if people may have questions.',
          'Want it on the home page too? Turn on **Feature on the home page**.',
          'Click `Publish`. It now appears on the Events page (yoursite.org/events).',
        ],
      },
      { kind: 'h', text: 'Edit or take down an event' },
      {
        kind: 'steps',
        items: [
          'Click **Events**, then click the event in the list.',
          'Change whatever you need, then click `Publish` again.',
          'To take it down, open it and choose `Unpublish` (keeps a saved copy) or `Delete (move to trash)` (moves it to **Recently deleted**, where you can still restore it).',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Recurring vs. one-time',
        text: 'A recurring event has no end date and stays on the page until you take it down. A one-time event needs its **Start date & time** set so the site can sort it and retire it after it passes.',
      },
    ],
  },

  {
    slug: 'announcements',
    category: 'Events, notices & voices',
    title: 'Announcement banners',
    icon: '📢',
    lead: 'The slim banner at the very top of every page. Use it for short, timely notices.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Content', 'Announcements', '+ New announcement'], link: { pane: 'content;announcement' } },
      { kind: 'h', text: 'Put up an announcement' },
      {
        kind: 'steps',
        items: [
          'Open **Content**, then **Announcements**, then `+`.',
          'Type your **Message**. Keep it to one short line.',
          'Add a **Link** if people should click through (optional). A good use: "Fall registration is open" pointing at /courses.',
          'Pick a **Style**: Info for normal notices, Special for good news, Urgent for closings or weather.',
          'Set a **Start** and **End** date so it appears and disappears on its own.',
          'Turn on **Enabled** and click `Publish`.',
        ],
      },
      { kind: 'h', text: 'Take it down' },
      {
        kind: 'steps',
        items: ['Open the announcement, turn **Enabled** off (or set the **End** date to today), and `Publish`.'],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Only one shows at a time',
        text: 'If several are enabled, the site shows the current one based on the dates. You do not have to delete old announcements, just disable them. (The `Checkup` tool in the top bar flags any left on past their end date.)',
      },
    ],
  },

  {
    slug: 'testimonials',
    category: 'Events, notices & voices',
    title: 'Add a testimonial',
    icon: '💬',
    lead: 'A short quote from a student. Quote the kind of person you want to reach so a visitor sees themselves.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Content', 'Testimonials', '+ New testimonial'], link: { pane: 'content;testimonial' } },
      { kind: 'h', text: 'Add a quote' },
      {
        kind: 'steps',
        items: [
          'Open **Content**, then **Testimonials**, then `+`.',
          'Paste the **Quote**. Keep it short and about what changed for them.',
          'Add the **Name**.',
          'Add the **Role / occupation**, like "Ruling elder", "Sunday-school teacher", or "Small-group leader".',
          'Add the **City**.',
          'Optionally link the **Course completed** and add a **Photo** with alt text.',
          'Turn on **Featured** to pin it to the home page proof band.',
          '`Publish`.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Who you quote matters',
        text: 'Name a real role and city. A ruling elder in Lancaster reads very differently from a generic "happy student", and a visitor who shares that role is more likely to picture themselves here.',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Drag to set the order',
        text: 'The Testimonials list is drag-to-reorder: the order you set is the order the site shows them in.',
      },
    ],
  },

  {
    slug: 'faqs',
    category: 'Events, notices & voices',
    title: 'Add or edit an FAQ',
    icon: '❓',
    lead: 'The questions and answers on the FAQ page. Add new ones, edit answers, and control the order.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Content', 'FAQ Items', '+ New FAQ item'], link: { pane: 'content;faqItem' } },
      { kind: 'h', text: 'Add a question' },
      {
        kind: 'steps',
        items: [
          'Open **Content**, then **FAQ Items**, then `+`.',
          'Write the **Question** the way a visitor would actually ask it.',
          'Write the **Answer**. You can use **bold**, links, and lists.',
          'Choose a **Category** (for example Admissions, Courses, Cost & scholarships, Schedule).',
          'Set a **Display order** number. Lower numbers show first within the category.',
          '`Publish`. It appears on the FAQ page, grouped under its category.',
        ],
      },
      { kind: 'h', text: 'Change the order of the categories' },
      { kind: 'path', items: ['Pages', 'FAQ', 'Category order'], link: { doc: 'faqPage' } },
      {
        kind: 'steps',
        items: ['Open **Pages**, then **FAQ**, and find **Category order**.', 'Drag the categories into the order you want. `Publish`.'],
      },
      {
        kind: 'callout',
        tone: 'primary',
        text: 'A category only appears on the page when at least one question uses it. Empty categories never show.',
      },
    ],
  },

  // ==========================================================================
  // MONEY & PRICING
  // ==========================================================================
  {
    slug: 'pricing',
    category: 'Money & pricing',
    title: 'Pricing & scholarships',
    icon: '💵',
    lead: 'Set up the named price levels every course can use, and edit the wording on the Pricing & Scholarships page.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Catalog', 'Pricing Tiers', '+ New pricing tier'], link: { pane: 'catalog;pricingTier' } },
      { kind: 'h', text: 'Add or edit a price level' },
      {
        kind: 'steps',
        items: [
          'Open **Catalog**, then **Pricing Tiers**, then `+`.',
          'Write the **Tier name**, like "Per course", "Audit", or "Full certificate track".',
          'Set the **Amount (USD)**. Leave it blank to read as "Free".',
          'Pick the **Unit**: per course, per track, or per term.',
          'Write a one-line **Summary** of who the tier is for, and list **What it includes**.',
          'Turn on **Audit / listen-only tier** for the low-commitment option.',
          '`Publish`. Every tier shows on the Pricing & Scholarships page. Drag tiers in the list to set the order they appear in.',
        ],
      },
      { kind: 'h', text: 'How a tier connects to a course' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Set it on the course',
        text: 'On a course, the `Pricing` tab has a **Price tier** field. Choose one of these tiers there. If a single course needs different wording, the course\'s **Price note** override is shown instead of the tier amount.',
      },
      { kind: 'h', text: 'The Pricing & Scholarships page' },
      { kind: 'path', items: ['Pages', 'Pricing & Scholarships'], link: { doc: 'pricingPage' } },
      {
        kind: 'p',
        text: 'The page lists your tiers automatically. To change the intro, the scholarship wording, or anything around the tiers, open **Pages**, then **Pricing & Scholarships**, and edit the text there. There is no checkout. These are express-interest prices.',
      },
      { kind: 'seealso', items: ['Add or edit a course'] },
    ],
  },

  // ==========================================================================
  // LOOK, BRAND & HOUSEKEEPING
  // ==========================================================================
  {
    slug: 'brand',
    category: 'Look, brand & housekeeping',
    title: 'The brand: colors & fonts',
    icon: '🎨',
    lead: 'Why the site always looks consistent, what you can change, and what is locked on purpose.',
    diy: 'mixed',
    body: [
      { kind: 'h', text: 'Colors and fonts are set for you' },
      {
        kind: 'p',
        text: 'The site is built on a small, fixed palette and two fonts. The anchor color is a deep Reformed **forest green**, used for buttons, links, the navigation, and the wordmark accent. A warm near-white paper surface and a soft near-black ink carry the text, with **oxblood** as a small accent and aged brass hairlines for fine detail. This fixed set is what makes every page look settled and professional without hiring a designer for each change.',
      },
      { kind: 'h', text: 'The two fonts' },
      {
        kind: 'p',
        text: 'Headings use a serif called **Fraunces**, the kind of letterforms you see on a well-set book cover. Body text uses a clean humanist sans called **Source Sans 3**. The pairing is the look of the school, so it stays consistent across every page.',
      },
      { kind: 'h', text: 'The one signature touch' },
      {
        kind: 'p',
        text: 'Before many section eyebrows you will see a short green **rubric** rule, a small horizontal mark in the brand green. It is the quiet signature of the design and it is added for you. You do not set it by hand.',
      },
      { kind: 'h', text: 'You choose tones, not raw colors' },
      {
        kind: 'p',
        text: 'When you set a section background, you pick a **tone** (Default (paper), Warm, Forest green, or Forest deep), not a color code. Each tone already knows the right text color to stay readable. That is why you cannot pick a random color, and why you do not need to.',
      },
      { kind: 'h', text: 'What you can change yourself' },
      {
        kind: 'bullets',
        items: [
          'Section background tones, and background photos or videos.',
          'All the words and photos, of course.',
        ],
      },
      { kind: 'h', text: 'What is locked (and why)' },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Fonts and exact colors',
        text: `Changing the fonts or the actual color values would affect the whole site and is easy to get wrong, so it stays a code change on purpose. If a campaign needs a special color or font, email ${SITE.contactName} at ${SITE.contactEmail} and they will set it up properly.`,
      },
      { kind: 'seealso', items: ['Add & arrange sections'] },
    ],
  },

  {
    slug: 'trash',
    category: 'Look, brand & housekeeping',
    title: 'Deleting things & the trash',
    icon: '🗑️',
    lead: 'Deleting is a soft landing here: things go to Recently deleted first, and you can bring them back.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Recently deleted (bottom of the left menu)'], link: { pane: 'trash' } },
      { kind: 'h', text: 'How deleting works' },
      {
        kind: 'p',
        text: 'On courses, faculty, events, testimonials, FAQs, pricing tiers, custom pages, announcements, terms, teaching areas, and forms, the delete action is `Delete (move to trash)`. It does not destroy the document. It moves it to **Recently deleted**, off the website and out of the normal lists, but fully intact.',
      },
      {
        kind: 'steps',
        items: [
          'Open the document, then the `⋮` menu next to the Publish button.',
          'Choose `Delete (move to trash)`.',
          'The document disappears from its list and from the website on the next rebuild, and appears in **Recently deleted**.',
        ],
      },
      { kind: 'h', text: 'Bring something back' },
      {
        kind: 'steps',
        items: [
          'Open **Recently deleted** at the bottom of the left menu.',
          'Click the item, then choose `Restore` from the actions.',
          'It returns to its normal list, exactly as it was. Publish it again if it was live before.',
        ],
      },
      { kind: 'h', text: 'Delete for good' },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Delete forever is really forever',
        text: 'In Recently deleted, the `Delete forever` action permanently removes the document after a confirmation. Use it only for things you are sure nobody needs again. There is no undo after this one.',
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'If deleting is blocked',
        text: 'When another document still points at this one (a course pointing at a term, for example), the Studio warns you instead of deleting, so the site never ends up with broken links. Open the document\'s `Used on` tab to see what links to it, remove those links, then delete.',
      },
      { kind: 'seealso', items: ['Do it yourself vs. ask for help'] },
    ],
  },
];

// A category with zero guides would render as a dangling divider and usually
// means a category was renamed without moving its guides — fail at load.
for (const category of GUIDE_CATEGORIES) {
  if (!guides.some((g) => g.category === category)) {
    throw new Error(`Guide category "${category}" has no guides.`);
  }
}
