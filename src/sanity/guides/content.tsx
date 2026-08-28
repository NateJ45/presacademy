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
    lead: 'The big picture: what this Studio is, how your changes reach the live website, and how the left menu is organized.',
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
        items: [
          "Words you'll see (a little glossary)",
          "Edit a page's words & photos",
          'Do it yourself vs. ask for help',
        ],
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
      { kind: 'h', text: 'Every page is built the same way' },
      {
        kind: 'p',
        text: 'Each page has three parts. The **Hero** is the big opening headline, and it lives in the `Hero` tab. The **body** is a stack of blocks in the `Page sections` tab, which you can reword, reorder, add to and remove. The **closing call to action** is the band at the very bottom, in its own tab. So the middle of every page is yours: see **Add & arrange sections** for how to work with it.',
      },
      { kind: 'h', text: 'Make an edit' },
      {
        kind: 'steps',
        items: [
          'Open **Pages** and click the page you want, for example `About`.',
          'Fields are grouped into tabs at the top: `Hero`, `Page sections`, the closing call to action, `SEO`, and on a few pages a small `Page copy` tab for a stray line or two.',
          'For words in the middle of the page, open `Page sections` and click the block that holds them.',
          'Change the text, or swap a photo.',
          'Re-read your change here to make sure it reads right.',
          'Click `Publish`. The website rebuilds and your change appears in a few minutes.',
        ],
      },
      { kind: 'h', text: 'Or work straight on the page picture' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'The preview is editable too',
        text: 'Open **Preview** (the eye icon at the top) and you get the page as visitors see it, beside the fields. Hover a section there and it outlines. **Right-click inside the outline** for the section menu: add a section above or below it (with pictures of each kind), duplicate it, move it, or remove it. The small tag at the outline’s corner is a handle you can drag. Click any words to jump to the box that holds them. Everything you do in the picture lands in the same fields, so use whichever feels easier, and `Publish` when you are happy.',
      },
      { kind: 'h', text: 'The empty-box rule (friendly and important)' },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Empty is fine',
        text: 'Many text boxes are blank on purpose. When a box is empty, the website shows its built-in wording. Only type in a box when you want to change that wording. Leaving it blank is perfectly safe.',
      },
      { kind: 'h', text: 'A note on the Home, Courses and Faculty pages' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'These build themselves',
        text: 'The Courses page and the Faculty page lay out their cards automatically from the Catalog and Faculty lists. To change a course or a teacher, edit that course or that faculty member, not the page. On Courses the “Start here” rail is a section you can reword, reorder or remove in `Page sections`. The big filterable list of courses, and the roster of teachers, are not sections: they are the page’s own job, and they always sit below whatever you add. The Home page works the same way: its whole middle is sections (the “where to begin” row, the two course rails, the numbers band, the topics ticker, the faculty strip and the quotes), and the rails, the strip and the quotes fill themselves from the Catalog, the Faculty list and the Testimonials. The big picture headline at the top stays in the `Hero` tab, where it has always been.',
      },
      {
        kind: 'seealso',
        items: ['Add or edit a course', 'Photos & images', 'Do it yourself vs. ask for help'],
      },
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
      {
        kind: 'path',
        items: ['Pages', 'Custom Pages', '+ New page'],
        link: { pane: 'pages;page' },
      },
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
        text: 'A new page is invisible until something links to it. The quickest way is the page list in **Preview**: click the `⋯` beside your page and choose **Add to menu**. The longer way, and the place to rename or reorder afterwards, is the guide **Edit the top menu & footer**.',
      },
      {
        kind: 'seealso',
        items: [
          'Copy, archive & restore a page',
          'Edit the top menu & footer',
          'Add & arrange sections',
        ],
      },
    ],
  },

  {
    slug: 'page-housekeeping',
    category: 'Website pages & menus',
    title: 'Copy, archive & restore a page',
    icon: '🗂️',
    lead: 'Start a page from one you already have, take a page off the site without losing it, and bring it back.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Preview', 'the page list on the left', '⋯'],
        link: { tool: 'presentation' },
      },
      {
        kind: 'p',
        text: 'Open **Preview** (the eye icon at the top). The list down the left side is every page on the site. Beside each page you built yourself there is a `⋯` button, and everything below lives in it. The fixed pages (Home, About, Courses and the rest) have no `⋯`, because there is only ever one of each: nothing to copy, nothing to put away.',
      },
      { kind: 'h', text: 'Copy a page' },
      {
        kind: 'steps',
        items: [
          'Click `⋯` beside the page, then **Duplicate**.',
          'The copy opens straight away. It is named "… copy" and its web address gets "-copy" on the end, so it can never collide with the original.',
          'Change the **Title**, the **Slug** (the web address) and whatever else differs.',
          '`Publish` when it is ready.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'A copy starts as a draft',
        text: 'The copy is private until you publish it, so a half-finished duplicate can never turn up on the website. Everything comes across with it: the hero, every section, every photo.',
      },
      { kind: 'h', text: 'Archive a page' },
      {
        kind: 'steps',
        items: [
          'Click `⋯` beside the page, then **Archive**.',
          'The page drops to an **Archived** group at the bottom of the list.',
          'It comes off the website at the next rebuild and out of the sitemap. If it was in the top menu it is taken out of the menu too, so no link is left pointing at nothing.',
        ],
      },
      { kind: 'h', text: 'Bring one back' },
      {
        kind: 'steps',
        items: [
          'Find it under **Archived** at the bottom of the page list.',
          'Click `⋯`, then **Restore**. It returns to **Custom pages** exactly as it was.',
          'If it used to be in the top menu, put it back with **Add to menu**.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Archiving never deletes anything',
        text: 'An archived page is only hidden. Every word and every photo is still there, and Restore puts it back untouched. Getting rid of a page for good is a separate, deliberate step: see the guide **Deleting things & the trash**.',
      },
      {
        kind: 'seealso',
        items: [
          'Build a brand-new page',
          'Edit the top menu & footer',
          'Deleting things & the trash',
        ],
      },
    ],
  },

  {
    slug: 'rename-a-page',
    category: 'Website pages & menus',
    title: 'Renaming a page keeps old links working',
    icon: '🔗',
    lead: "Change a page's web address and the old one keeps working. The Studio files the forward for you.",
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Pages', 'Redirects (old links)'],
        link: { pane: 'pages;redirect' },
      },
      { kind: 'h', text: 'What used to go wrong' },
      {
        kind: 'p',
        text: 'A page lives at an address, like /open-house. Change the address and every bookmark, every Google result, and every link from another website points at nothing. The visitor gets a "page not found".',
      },
      { kind: 'h', text: 'What happens now' },
      {
        kind: 'p',
        text: 'When you change the web address of a page that is already published and click `Publish`, the Studio writes a **redirect** first: anyone who uses the old address is sent to the new one. You get a short message saying so. You do not have to do anything.',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'It never stops you publishing',
        text: 'If the forward cannot be written for any reason, your page still publishes and you get a note asking you to add the redirect by hand. Your work is never held up by it.',
      },
      { kind: 'h', text: 'Add one by hand' },
      {
        kind: 'p',
        text: 'Use this for an address that never existed on this site: a link from the old website, or one printed on a card.',
      },
      {
        kind: 'steps',
        items: [
          'Open **Pages**, then **Redirects (old links)**, then `+`.',
          'In **Old address**, type the address people are still using, starting with a slash, like "/open-house".',
          'In **Send them to**, type where they should land, like "/events", or a full https:// link.',
          'Leave **Permanent move?** on unless the forward is temporary.',
          'Click `Publish`.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Redirects start working at the next rebuild',
        text: 'Like everything else you publish, a redirect reaches the website when the site rebuilds, a few minutes later. Test the old address after that, not straight away.',
      },
      {
        kind: 'seealso',
        items: ['Copy, archive & restore a page', 'How a page looks in Google'],
      },
    ],
  },

  {
    slug: 'share-a-draft',
    category: 'Website pages & menus',
    title: 'Show someone a draft',
    icon: '🔗',
    lead: 'Send a page to somebody for a read before it goes live, without publishing it and without giving them a Studio login.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Preview', 'the page list on the left', 'the share button'],
        link: { tool: 'presentation' },
      },
      {
        kind: 'p',
        text: 'You have rewritten a page and you want one person to read it first. You do not want to publish it, and you do not want to set them up with an account. A **share link** is the answer: a web address that shows your current draft to anyone who opens it, with no login at all.',
      },
      { kind: 'h', text: 'Make one' },
      {
        kind: 'steps',
        items: [
          'Open **Preview** (the eye icon at the top) and find the page in the list on the left.',
          'Click the small share button beside it. The link is copied to your clipboard right away.',
          'Paste it into an email or a text message.',
        ],
      },
      {
        kind: 'p',
        text: 'The same thing lives in the arrow beside the `Publish` button when you have a page open, as **Copy share link**. Use whichever you are already looking at.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'A share link works for about an hour',
        text: 'After that it stops working and whoever has it sees an error page. That is deliberate: a link that lasted forever would be a permanent private door into your unpublished writing. If somebody comes back to you the next day, click the share button again and send them a fresh one. It takes a second.',
      },
      {
        kind: 'callout',
        tone: 'default',
        title: 'What they see',
        text: 'They see the page exactly as it stands right now, including edits you have not published. They cannot change anything, and they cannot reach any other part of the Studio. Send it to people you would have read the page over your shoulder.',
      },
      {
        kind: 'seealso',
        items: ['Schedule a page to publish itself', 'Check a page before you publish it'],
      },
    ],
  },

  {
    slug: 'schedule-a-publish',
    category: 'Website pages & menus',
    title: 'Schedule a page to publish itself',
    icon: '⏰',
    lead: 'Write it now, have it go live at a time you choose, without being at your computer.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['any page', 'the Publishing tab', 'Publish automatically at'],
      },
      {
        kind: 'p',
        text: 'Every page has a **Publishing** tab with one field in it: **Publish automatically at**. Set a date and time, leave the page as a draft, and it publishes itself.',
      },
      {
        kind: 'steps',
        items: [
          'Open the page and write it as usual. Do NOT click `Publish`.',
          'Open the **Publishing** tab and set **Publish automatically at** to the date and time you want.',
          'Leave the page. Your work is saved as a draft, as always.',
        ],
      },
      {
        kind: 'callout',
        tone: 'default',
        title: 'The time is your own local time',
        text: 'Pick 9:00 AM and you get 9:00 AM your morning. The check runs every half hour, so treat it as "some time in that half hour", not to the second.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Publishing and appearing are two steps',
        text: 'At the time you set, the page publishes here in the Studio. It appears on the website at the next site rebuild, the same as anything else you publish. So schedule it a comfortable margin ahead of when it needs to be readable, not at the exact minute.',
      },
      {
        kind: 'p',
        text: 'Changed your mind? Clear the field before the time arrives and nothing happens. Want it out now instead? Just click `Publish` as usual; the schedule is dropped on the way through, so it cannot publish itself again later.',
      },
      { kind: 'seealso', items: ['Show someone a draft', 'Check a page before you publish it'] },
    ],
  },

  {
    slug: 'saved-sections',
    category: 'Website pages & menus',
    title: 'Save a section and reuse it',
    icon: '📌',
    lead: 'Keep a band you got right, then drop a copy of it onto any other page.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['a page', 'the arrow beside Publish', 'Save a section as preset'],
      },
      {
        kind: 'p',
        text: 'You spent twenty minutes getting a "Request information" band exactly right and you want the same band on three more pages. Save it once, add it wherever you like.',
      },
      { kind: 'h', text: 'Save one' },
      {
        kind: 'steps',
        items: [
          'Open the page that has the section on it.',
          'Click the small arrow beside `Publish`, then **Save a section as preset...**',
          'Pick the section from the list. They are numbered the same way they are on the page.',
          'Give it a name you will recognise later, then **Save section**.',
        ],
      },
      { kind: 'h', text: 'Add it to another page' },
      {
        kind: 'steps',
        items: [
          'Open **Preview** (the eye icon at the top) and click the page you want it on.',
          'At the bottom of the page list, open **Saved sections**.',
          'Click the `+` beside the one you want. It lands at the bottom of that page as a draft.',
          'Drag it up to where it belongs, change whatever is different, then `Publish`.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'It is a copy, not a link',
        text: 'Changing the saved section later never changes the pages you already added it to, and changing one of those pages never changes the saved section. So you can adjust the wording page by page without breaking anything.',
      },
      {
        kind: 'callout',
        tone: 'default',
        title: 'Where they live',
        text: 'Under **Pages**, at the bottom, as **Saved Sections**. Open one there to rename it, edit it, or throw it away. They are a tool for you, not part of the website, so nothing you do to them appears to visitors.',
      },
      { kind: 'seealso', items: ['Add & arrange sections', 'Copy, archive & restore a page'] },
    ],
  },

  {
    slug: 'check-a-page',
    category: 'Website pages & menus',
    title: 'Check a page before you publish it',
    icon: '🔎',
    lead: 'A quick second pair of eyes: missing photo descriptions, sections with nothing in them, and links that go nowhere.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['a page', 'the arrow beside Publish', 'Check this page'],
      },
      {
        kind: 'p',
        text: 'Click the small arrow beside `Publish` and choose **Check this page...**. It reads the page as it stands, including edits you have not published, and tells you what it noticed.',
      },
      {
        kind: 'bullets',
        items: [
          '**Photos without a description**: alt text is the sentence a screen reader says out loud, and what shows if a photo fails to load.',
          '**Sections with nothing in them**: a section you added and never filled in, which would show up blank.',
          '**Links worth a look**: a link to an address on our own site that no page seems to live at.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'It never stops you publishing',
        text: 'Nothing here blocks the `Publish` button and nothing gets changed for you. Every line is a suggestion. A page can be perfectly fine and still be listed, so read it, use your judgement, and publish when you are happy.',
      },
      {
        kind: 'callout',
        tone: 'default',
        title: 'It can be wrong, in both directions',
        text: 'Some photos are pure decoration and genuinely need no description. Sections that fill themselves from a list (courses, faculty, events, FAQs) are skipped, because their words live in that list and not on the page. And the link check only compares the first part of an address, so a link it flags is a question, not a verdict.',
      },
      { kind: 'seealso', items: ['Photos & images', 'Show someone a draft'] },
    ],
  },

  {
    slug: 'sections',
    category: 'Website pages & menus',
    title: 'Add & arrange sections',
    icon: '🧩',
    lead: 'Sections are the building blocks of a page. Mix and match them, reorder them, and set their backgrounds, from the list or straight on the page picture.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', '(any page)', 'Page sections'], link: { pane: 'pages' } },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Every page’s body is built from sections',
        text: 'This is not only for pages you build yourself. The middle of every fixed page, Home, About, Pricing, FAQ, Events, Contact, Get Started, For You, Courses, Faculty, Privacy and Accessibility, is a stack of blocks in `Page sections`. Open a page, click a block, and you are editing the real thing visitors see. Two parts stay outside the stack on purpose: the big headline at the top (the `Hero` tab) and the closing call to action at the bottom, so neither can be deleted by accident.',
      },
      { kind: 'h', text: 'Two ways to work' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'On the page picture, or in the list',
        text: 'Open **Preview** and hover a section on the page picture. It outlines. **Right-click inside the outline** and a menu appears: **insert a section before or after it** (a picture picker of every kind), **duplicate** it, **move** it, or **remove** it. Drag the small tag at the outline’s corner to pull it to a new place. That is usually the quickest way, because you are looking at the thing you are moving. The `Page sections` list described below does all the same jobs, and is the place to go when a page has no sections yet.',
      },
      { kind: 'h', text: 'Add a section' },
      {
        kind: 'steps',
        items: [
          'Open a page and find **Page sections**.',
          'Click `Add item`. The picker is grouped into five named bands (Words, photos & video · Cards, facts & lists · From your catalog · Banners, forms & extras · Page sections) and has a search box, so type "photo" or "FAQ" to jump straight to it.',
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
          '**Page sections (Rule & Ledger)**: the built-in parts of the site’s own pages. They come styled to match the page they belong to, so they have no background choice: you set what appears and in what order, and the design stays put. In this band: the legal statement body (Privacy, Accessibility), numbered cards (For You, About, Get Started, Home), the warm statement band and the ruled stat band (Pricing, Home), editorial columns and the inline band (About), the grouped FAQ (FAQ), upcoming events and recurring rhythms (Events), the contact details and map (Contact), the request panel (Get Started), the course rail (Courses and Home), which pulls the courses you have marked “Start here” or “Featured” straight from the catalog, and Home’s own three: the topics ticker, the faculty strip and the testimonials.',
        ],
      },
      { kind: 'h', text: 'What is not a section' },
      {
        kind: 'bullets',
        items: [
          'The **big headline** at the top of a page is a field in the `Hero` tab, not a block. Same for the photo behind it. In **Preview** the headline and the line under it each carry an `✎ Edit here` button, so you can reword them without leaving the page picture.',
          'The **closing call to action** at the bottom of a page has its own fields, so it is always there.',
          'The **course catalog** with its filters, and the **faculty roster**, are drawn by the Courses and Faculty pages themselves. They always sit below the sections you add, so a section you add to Courses lands above the catalog.',
        ],
      },
      { kind: 'h', text: 'Reorder or remove' },
      {
        kind: 'steps',
        items: [
          'Drag a section by the dots on its left to move it. Top of the list is top of the page.',
          'Click the `⋮` menu on a section and choose **Remove** to delete it. (Removing a section is undoable before you publish.)',
          'In **Preview**, do the same on the page itself: right-click a section for its menu (insert, duplicate, move, remove), or drag its corner tag to a new spot.',
        ],
      },
      { kind: 'h', text: "Change a section's background" },
      {
        kind: 'p',
        text: 'Most sections have a **Section background** control so they sit nicely on the page (the Rule & Ledger ones do not, by design). It holds the surface swatches, the accent colour, a background photo or video with an **Overlay darkness** slider, and **Vertical spacing** (Compact, Normal or Spacious). In **Preview** you can skip the panel: hover a section and a small row of colour dots appears in its bottom corner, so you can change the background from the page itself. All of it is walked through in its own guide, "Change how a section looks".',
      },
      { kind: 'h', text: 'The dashed box on a new section' },
      {
        kind: 'p',
        text: 'A section you have just added has nothing in it yet, so in **Preview** it shows a dashed box with the section name and one line saying what to type. Fill the section in and the box is replaced by the real thing. The dashed box is a preview aid only, so visitors never see it.',
      },
      {
        kind: 'seealso',
        items: [
          'Undo a change',
          'Change how a section looks',
          'The brand: colors & fonts',
          'Photos & images',
        ],
      },
    ],
  },

  {
    slug: 'undo-a-change',
    category: 'Website pages & menus',
    title: 'Undo a change',
    icon: '↩️',
    lead: 'Dragged a section to the wrong place, removed the wrong one, or picked a background you regret? Step it back.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['a page', 'the arrow beside Publish', 'Undo last change'],
      },
      {
        kind: 'p',
        text: 'Click the small arrow beside `Publish` and choose **Undo last change**. The page goes back to how it was one step ago. Choose **Redo** to put it back again if you change your mind.',
      },
      { kind: 'h', text: 'Ctrl+Z works too, outside text boxes' },
      {
        kind: 'p',
        text: 'With a page open, press **Ctrl+Z** (**Cmd+Z** on a Mac) to undo and **Ctrl+Shift+Z** to redo. Press it more than once to go back more than one step.',
      },
      {
        kind: 'callout',
        tone: 'default',
        title: 'Inside a text box, the text box wins',
        text: 'If your cursor is in a heading, a paragraph or any other box you type in, Ctrl+Z undoes your typing, the way it does everywhere else. That is on purpose. Click outside the box first if you want to undo the bigger thing, like the section you just dragged.',
      },
      { kind: 'h', text: 'What it can and cannot reach' },
      {
        kind: 'bullets',
        items: [
          'It works on your **unpublished draft** only. The live website is never touched, so undo can never break what visitors see.',
          'It covers everything, not just typing: sections added, dragged, duplicated or removed, photos swapped or cleared, backgrounds and options changed.',
          'It **cannot undo a Publish**. Publishing is its own step. To take a published page back, use **Version history**.',
          'It forgets everything when you close or reload the tab. Undo is for the last few minutes, not for last week.',
        ],
      },
      { kind: 'h', text: 'When it politely refuses' },
      {
        kind: 'bullets',
        items: [
          '**"Nothing to undo yet"**: this page has no unpublished change for undo to step back to.',
          '**"Someone else edited since"**: the page changed after the last thing you did, so undo left it alone rather than writing over somebody. Reload the page and look at it before doing anything else.',
          '**"This would remove the only copy"**: stepping back that far would delete a page that has never been published, so there would be nothing left. If you really do want it gone, delete it on purpose.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Version history is still the deep one',
        text: 'Undo is the quick step back for the thing you just did. To go back hours or days, or to recover something after publishing, open the page and use **Version history** in the top right. Nothing here replaces it.',
      },
      { kind: 'seealso', items: ['Add & arrange sections', 'Change how a section looks'] },
    ],
  },

  {
    slug: 'section-looks',
    category: 'Website pages & menus',
    title: 'Change how a section looks',
    icon: '🎨',
    lead: 'Give a section a different background, a different accent colour, a bolded word, one word of the heading picked out in colour, or a different arrangement. All of it from the page picture, all of it on-brand.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Pages', '(any page)', 'Preview', '(click a section)'],
        link: { pane: 'pages' },
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Work on the page picture',
        text: 'Open **Preview**, click the section you want to change, and the edit panel opens beside it. Every control below is in there, and the page picture updates as you go, so you are never guessing.',
      },

      { kind: 'h', text: 'The surface: pick a background' },
      {
        kind: 'p',
        text: 'Open **Section background** and you will see a row of colour dots under **Surface**. Click one. The dot shows the background and the text that comes with it, because the two are designed together: you are choosing a pair, not a colour. There are six. The same six dots, and the three accent dots below them, also float in the bottom corner of a section when you hover it in **Preview**, so you can try a background without opening anything.',
      },
      {
        kind: 'bullets',
        items: [
          '**Paper**: the ordinary page surface. This is what a section uses if you never touch it.',
          '**Warm**: a quiet step away from the page. Good for a change of pace halfway down.',
          '**Bright card**: the clean raised surface. It reads well directly above or below Warm.',
          '**Forest green**: the signature green band, with cream text.',
          '**Forest deep**: the deepest green, for a closing band you want to feel heavy.',
          '**Ink**: a near-black band. Use it once on a page, not twice.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'You cannot make it unreadable',
        text: 'Every one of the six is a background and a text colour that were designed as one unit and are checked against the accessibility contrast standard by an automatic test. There is no colour picker here on purpose. Whatever you pick, the words stay readable, in light mode and in dark mode.',
      },
      {
        kind: 'p',
        text: 'Some dots are split down the diagonal. That means the surface follows the reader’s own light or dark setting, and the two halves are the two versions. A dot in one solid colour is a fixed band: it looks the same either way.',
      },

      { kind: 'h', text: 'The accent: the small colour inside' },
      {
        kind: 'p',
        text: 'Just under the surface row is **Accent colour**, three dots. This is the section’s small colour: the short rule before an eyebrow label, an accent word in the heading, and the fill on a button inside the section.',
      },
      {
        kind: 'bullets',
        items: [
          '**Green**: the house accent. This is what a section uses if you leave it alone.',
          '**Brass**: warmer and more formal. It suits a green or ink band.',
          '**Ink**: no colour at all, the quietest option.',
        ],
      },

      { kind: 'h', text: 'Bold and italic in a subhead' },
      {
        kind: 'p',
        text: 'A few short support lines used to be plain typing with no way to emphasise anything. Those now have a second box under the first, with a bold button and an italic button and nothing else. Type in the second box and it is used instead; the plain box tidies itself away so you are not looking at two copies of the same line.',
      },
      {
        kind: 'p',
        text: 'You will find it on the **Subhead** of the card grid and the call-to-action band, the **Intro** of feature cards, numbered steps, the FAQ accordion and the media showcase, and the **Body** of the media feature. In **Preview**, hovering one of those lines puts an `✎ Edit here` button on it, which opens a small box over the line with the same bold and italic buttons, so you can type it in place.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'A little goes a long way',
        text: 'Bold one phrase, not a sentence. If everything is emphasised, nothing is. Headlines are deliberately left out of this: they have their own device, below.',
      },

      { kind: 'h', text: 'One word of the heading in colour' },
      {
        kind: 'p',
        text: 'Sections with a big heading have a box called **Accent word in the heading**. Type a word or a short phrase that already appears in the heading, and it is set in the section’s accent colour on the page. Leave it blank and the heading is plain. Easier still: hover the heading in **Preview**, press `Colour a word`, and click the word you want, which cannot be misspelled because you are picking it out of the heading itself.',
      },
      {
        kind: 'steps',
        items: [
          'Write the heading first.',
          'Copy one word out of it into **Accent word in the heading**. Capitals do not matter.',
          'Watch the page picture. If nothing changes, the word is not in the heading, so check the spelling.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'One accent per heading',
        text: 'The first match is the one that gets coloured, and one is the limit by design. Two coloured words in one heading stop reading as emphasis and start reading as decoration.',
      },

      { kind: 'h', text: 'Layout: how the section is arranged' },
      {
        kind: 'p',
        text: 'Two more controls sit on the section itself rather than in the background panel, and they change the arrangement rather than the colour. Not every section has them, because not every section has more than one arrangement that we are happy to put your name on.',
      },
      {
        kind: 'bullets',
        items: [
          '**Which side is the picture on?** on the image + text section, and **Which side is the video or photo on?** on the media feature. Two choices, left or right. Use it to alternate down a long page so two picture sections in a row do not face the same way.',
          '**How many across** on the card grid, feature cards, stats, the photo gallery, numbered steps and the dynamic list. Pick two, three or four (steps and the dynamic list offer two or three, because a step is a paragraph and does not survive a quarter-width column). Two is the one to reach for when a section holds exactly two things and a three-across row is leaving an empty gap.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Phones are not part of the choice',
        text: 'Every one of these is about the widest screen. On a phone the words always come first and the picture underneath, and the grids always stack (the photo gallery always shows two across). So there is no setting here that can make the site awkward on a phone.',
      },

      { kind: 'h', text: 'The rest of the background panel' },
      {
        kind: 'bullets',
        items: [
          '**Background image or video**: put a photo or a video behind the section. The **Overlay darkness** slider dims it so the words stay readable on top.',
          '**Vertical spacing**: Compact, Normal or Spacious, to make the section shorter or taller. This is the density control: Compact when a short section is floating in too much room, Spacious for a band you want to feel like a pause.',
        ],
      },
      {
        kind: 'callout',
        tone: 'default',
        title: 'Some sections have no background control',
        text: 'The **Page sections (Rule & Ledger)** blocks come styled to match the page they belong to, so they have no surface or accent choice. That is deliberate, not a gap: those are the parts of the site that should never drift.',
      },
      { kind: 'seealso', items: ['Add & arrange sections', 'The brand: colors & fonts'] },
    ],
  },

  {
    slug: 'top-menu',
    category: 'Website pages & menus',
    title: 'Edit the top menu & footer',
    icon: '🧭',
    lead: 'Add, rename, reorder, or remove the links in the website header and footer, including dropdown menus, the header button, a logo, and the small print at the bottom.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Site Settings', 'Navigation (menus)'],
        link: { doc: 'siteSettings' },
      },
      { kind: 'h', text: 'Add or change a menu link' },
      {
        kind: 'steps',
        items: [
          'Open **Site Settings** (top of the menu), then the `Navigation (menus)` tab.',
          'Under **Top menu links**, click `Add item`.',
          'Choose **Link** for a single page, or **Dropdown menu** to group several links under one label.',
          'For a link, type the **Label** (what people see), then choose where it goes: **A page on this site** lets you pick the page from a list, and **Another website** takes a full web address.',
          'Drag items by the dots to reorder them. Use the `⋮` menu on an item to remove it.',
          'The header fits **six** links at most, so keep the list short.',
          'Click `Publish`. The header updates across the site.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Picking the page is safer than typing the address',
        text: 'When you pick a page from the list, the link follows that page. If its web address ever changes, the menu link changes with it and can never go dead. Older links here still show an **Address (typed by hand)** box, and that typed address is what the site uses. Clear it if you would rather pick the page.',
      },
      { kind: 'h', text: 'The one-click way, from the page list' },
      {
        kind: 'steps',
        items: [
          'Open **Preview** (the eye icon at the top) and find the page in the list on the left.',
          'Click the `⋯` beside it, then **Add to menu**. A link to that page is added to the end of the top menu, using the page name as its label.',
          'Rows already in the menu show a small **In menu** note, and their `⋯` offers **Remove from menu** instead.',
          'To rename it or move it up the row, open Site Settings as above. The order and the wording live there.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Six is the limit',
        text: 'The header fits six links. Once there are six, **Add to menu** greys out and says so. Take something out first, either with **Remove from menu** on its row or in Site Settings.',
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
      { kind: 'h', text: 'The small print at the very bottom' },
      {
        kind: 'p',
        text: 'The little links beside the copyright line (Pricing, Privacy, Accessibility) are **Footer small-print links**, in the same `Navigation (menus)` tab. Leave it empty to keep those three, or add your own to replace them.',
      },
      { kind: 'h', text: 'The button at the right of the header' },
      {
        kind: 'steps',
        items: [
          'In `Navigation (menus)`, open **Header button**.',
          'Type **Button text** to change what it says, and set **Where the button goes** to change where it leads. Leave both blank for the built-in "Request info" pointing at Get Started.',
          'Turn **Show the header button** off to remove the button from the header and from the phone menu.',
        ],
      },
      { kind: 'h', text: 'Use a logo instead of the typed name' },
      {
        kind: 'p',
        text: 'In `Identity & contact`, upload a **Logo** and it takes the place of the typed "The Presbyterian / Academy" wordmark at the top of every page. Add **Alt text** so screen readers can read it. Trim the spare space around the image before you upload, because the site scales the whole picture to the header height. Remove the logo and the typed wordmark comes back.',
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Empty means the built-in menus',
        text: 'The top menu, the footer columns, the small-print links and the header button all fall back to the built-in ones while they are empty, so you only change what you fill in. The same goes for the three switches here (the email and social buttons in the phone menu, the social buttons in the footer): leave them alone and everything shows as it does today.',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Easiest from the page picture',
        text: 'Open **Preview** (the eye icon at the top) and click the header or the footer on the page itself. Site Settings opens beside it, and your menu changes show up in the picture as you make them.',
      },
      {
        kind: 'seealso',
        items: [
          'Build a brand-new page',
          'Copy, archive & restore a page',
          'The brand: colors & fonts',
        ],
      },
    ],
  },

  {
    slug: 'search-sharing',
    category: 'Website pages & menus',
    title: 'How a page looks in Google',
    icon: '🔎',
    lead: 'Set the line Google shows, the sentence under it, the picture people see when they share the page, and how to keep a page out of search altogether.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', '(any page)', 'Search & sharing'], link: { pane: 'pages' } },
      {
        kind: 'p',
        text: 'Every page, the fixed ones and the ones you build, has a `Search & sharing` tab. It opens with two pictures: the page as a **Google result**, and the page as a **card in a message**. Both redraw as you type, so you can see a title get cut off instead of counting letters.',
      },
      { kind: 'h', text: 'The four boxes' },
      {
        kind: 'bullets',
        items: [
          '**SEO title**: the line Google shows and the words in the browser tab. Aim for 50 to 60 characters. Leave it empty and the page uses its own built-in title, which is usually fine.',
          '**SEO description**: the sentence under the title in a Google result. Aim for 150 to 160 characters. Write it for a person deciding whether to click.',
          '**Social share image**: the picture that appears when someone pastes the address into a text, Facebook, or Slack. Wide, about 1200 by 630 pixels. Leave it empty to use the site-wide one in Site Settings.',
          '**Hide this page from search engines**: off for every ordinary page. See below.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Empty is fine',
        text: 'Every box here is optional. Leave one blank and the page keeps doing exactly what it does today. You are only ever overriding, never filling something in that was missing.',
      },
      { kind: 'h', text: 'Keeping a page out of Google' },
      {
        kind: 'steps',
        items: [
          'Open the page, go to `Search & sharing`, and turn on **Hide this page from search engines**.',
          '`Publish`.',
          'The page stays live at its address, so you can still hand the link to anyone. It just asks search engines not to list it, and it drops out of the site map that tells Google what to look at.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Hidden is not private',
        text: 'Anyone with the address can still open the page, and a search engine can ignore the request. Use it for a page you want to hand out by link, like a form for one group. Do not use it for anything that must not be seen.',
      },
      {
        kind: 'seealso',
        items: ['Build a brand-new page', 'Photos & images', 'Copy, archive & restore a page'],
      },
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
      {
        kind: 'path',
        items: ['Catalog', 'Courses', '+ New course'],
        link: { pane: 'catalog;course' },
      },
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
      {
        kind: 'seealso',
        items: ['Add a faculty member', 'Set up a term or cohort', 'Pricing & scholarships'],
      },
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
      {
        kind: 'path',
        items: ['Content', 'Announcements', '+ New announcement'],
        link: { pane: 'content;announcement' },
      },
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
        items: [
          'Open the announcement, turn **Enabled** off (or set the **End** date to today), and `Publish`.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Only one shows at a time',
        text: 'If several are enabled, the site shows the current one based on the dates. You do not have to delete old announcements, just disable them. (The `Checkup` tool in the top bar flags any left on past their end date.)',
      },
      { kind: 'h', text: 'See it before it goes out' },
      {
        kind: 'p',
        text: 'Open any page and click the `Presentation` tab. The banner appears at the top of the preview exactly where it will sit on the real site, drafts included, so you can read it in place before you publish. Click the banner in the preview to jump back to the announcement and edit the wording.',
      },
      {
        kind: 'p',
        text: 'On the live website the banner appears at the next rebuild, a few minutes after you publish, like any other change.',
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
      {
        kind: 'path',
        items: ['Content', 'Testimonials', '+ New testimonial'],
        link: { pane: 'content;testimonial' },
      },
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
      {
        kind: 'path',
        items: ['Content', 'FAQ Items', '+ New FAQ item'],
        link: { pane: 'content;faqItem' },
      },
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
      {
        kind: 'path',
        items: ['Pages', 'FAQ', 'Page sections', 'Grouped FAQ'],
        link: { doc: 'faqPage' },
      },
      {
        kind: 'steps',
        items: [
          'Open **Pages**, then **FAQ**, then the `Page sections` tab.',
          'Click the **Grouped FAQ** block and find **Category order** inside it.',
          'Drag the categories into the order you want. `Publish`.',
        ],
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
      {
        kind: 'path',
        items: ['Catalog', 'Pricing Tiers', '+ New pricing tier'],
        link: { pane: 'catalog;pricingTier' },
      },
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
        text: "On a course, the `Pricing` tab has a **Price tier** field. Choose one of these tiers there. If a single course needs different wording, the course's **Price note** override is shown instead of the tier amount.",
      },
      { kind: 'h', text: 'The Pricing & Scholarships page' },
      { kind: 'path', items: ['Pages', 'Pricing & Scholarships'], link: { doc: 'pricingPage' } },
      {
        kind: 'p',
        text: 'The page lists your tiers automatically. The opening line under the headline is the **Pricing intro** field in the `Page copy` tab. Everything below it is blocks in the `Page sections` tab: the tier cards, the scholarship promise, and the small band of figures at the bottom. Click a block to reword it, or drag to reorder. There is no checkout. These are express-interest prices.',
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
    slug: 'site-stats',
    category: 'Look, brand & housekeeping',
    title: 'How busy the website has been',
    icon: '📈',
    lead: 'A simple traffic panel in the top bar: how many requests the site answered, day by day.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Site stats (top bar)'],
        link: { tool: 'site-stats' },
      },
      { kind: 'h', text: 'What the number is' },
      {
        kind: 'p',
        text: 'It counts every **request** the website answers. One person reading one page makes many requests: the page itself, each photo, the fonts. So the number is much larger than the number of people.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'It is not a count of people',
        text: 'Use it to compare one week with another. A rise means more interest. Do not quote it as visitors, because it is not, and the panel says so on the page.',
      },
      { kind: 'h', text: 'The first time you open it' },
      {
        kind: 'p',
        text: 'The panel asks you to open the site preview once, so it knows you work here. Open any page from the left menu, click the `Presentation` tab so the website appears beside it, then come back and click `Try again`. You only do this once on each computer.',
      },
      { kind: 'h', text: 'If it says it is not set up yet' },
      {
        kind: 'p',
        text: `That is a one-time website setup step, not something you can fix from here. Email ${SITE.contactName} at ${SITE.contactEmail}.`,
      },
      {
        kind: 'p',
        text: 'Days run in UTC, so a day in this panel starts in the late evening our time. The deeper report, including which countries people come from, lives in the Cloudflare dashboard.',
      },
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
      {
        kind: 'path',
        items: ['Recently deleted (bottom of the left menu)'],
        link: { pane: 'trash' },
      },
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
        text: "When another document still points at this one (a course pointing at a term, for example), the Studio warns you instead of deleting, so the site never ends up with broken links. Open the document's `Used on` tab to see what links to it, remove those links, then delete.",
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
