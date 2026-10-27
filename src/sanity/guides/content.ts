// =============================================================================
// The Site Guide: plain-language walkthroughs for faculty & staff
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

import type { BrandIconKey } from '../../lib/studio-icons';
import type { FieldGuideMap } from '../../lib/studio-kit';

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
  | { kind: 'seealso'; items: string[] }
  // A real picture of the Studio (card 130), by its key in ./shots.ts. A key with
  // no capture yet draws the wireframe, captioned as a drawing.
  | { kind: 'shot'; key: string; caption?: string }
  // One of the site's recorded clips (card 137), by its key in ./videos.ts.
  | { kind: 'video'; key: string; caption?: string };

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
  /** A meaning in the icon registry (src/lib/studio-icons.ts), so a typo or an emoji is a compile error. */
  icon: BrandIconKey;
  lead: string;
  diy?: DiyLevel;
  body: GuideBlock[];
  /**
   * A short clip showing the job (PORTS.md card 115): a file in public/, a
   * YouTube or Vimeo link, or any https address. Guides with one show in
   * "Watch how it is done" on Home and in the Site Guide.
   */
  video?: string;
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
    icon: 'guide',
    lead: 'The big picture: what this Studio is, how your changes reach the live website, and how the left menu is organized.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'The Studio vs. the website' },
      {
        kind: 'p',
        text: 'This **Studio** is your control room. The **website** is what visitors see. You make changes here, and they appear on the website after you publish them. The Studio is private. The website is public. (The first time you open the Studio it greets you with a short **welcome tour**. Replay it any time from the foot of **Home**: "Take the tour again".)',
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
      { kind: 'h', text: 'The top bar, left to right' },
      {
        kind: 'bullets',
        items: [
          '**Home**: where the Studio opens. What to do this term and this week, whether your last change is on the website yet, a Fix-it list, the pages you can change and how many people visited.',
          '**Quick update**: short forms for the jobs you do from a phone: a notice, an event, a new deadline.',
          '**Content**: every page and list on the website (the left menu below).',
          '**Live preview**: the website as visitors will see it, with your unpublished changes in place. Click any words to edit them there.',
          '**Messages**: what people sent through the website forms, with a status you can set.',
          '**New term**: the start-of-term checklist, in order.',
          '**Site Guide**: these guides, searchable and printable.',
          '**Checkup**: anything that needs fixing, with a button to go straight to it.',
        ],
      },
      { kind: 'h', text: 'The left menu (Content), top to bottom' },
      {
        kind: 'bullets',
        items: [
          '**Site Settings**: the site-wide basics (name, contact details, menus).',
          '**Pages**: the fixed pages of your site (Home, About, Courses, and so on). One of each, plus **Custom pages** you build yourself.',
          '**Catalog**: the course library and what supports it (Courses, Terms, Teaching Areas, Pricing Tiers).',
          '**Faculty**: the people who teach, each with a short scholarly profile.',
          '**Content**: reusable lists you add to over time (Testimonials, FAQ, Forms, Announcements).',
          '**Events**: info sessions, open lectures, workshops, and term starts shown on the Events page.',
          '**Trash**: things you deleted wait here, and one click brings them back.',
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
    icon: 'text',
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
    icon: 'help',
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
          'Add, reorder, and remove sections on a page, and build new custom pages.',
          'Add, rename, and reorder the top menu and footer links.',
          'Pick a section\u2019s look, and set the words and photos inside it.',
          'Delete something by mistake and bring it back from the **Trash**.',
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
        text: `Use the **Ask ${SITE.contactName}** card at the foot of **Home**, or email ${SITE.contactName} at ${SITE.contactEmail}. When something is confusing or looks broken, a quick note with a screenshot is the fastest way to get help. There is no silly question.`,
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
    icon: 'page',
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
        text: 'The Courses page and the Faculty page lay out their cards automatically from the Catalog and Faculty lists. To change a course or a teacher, edit that course or that faculty member, not the page. On Courses the “Start here” rail is a section you can reword, reorder or remove in `Page sections`. The big filterable list of courses, and the roster of teachers, are not sections: they are the page’s own job, and they always sit below whatever you add. The Home page works the same way. Since the Term Issue redesign (October 2026) it reads like an issue from a small press, and its whole middle is eight sections: **Contents** (every course on one line, plus a short note from the faculty), **The courses** (every course as a book cover), the **reply card** that suggests a course (you write questions 1 and 2 and point each answer at a course; question 3 lists your pricing tiers by itself), **Contributors** (the faculty strip), **Letters** (the featured testimonials) the **Rates** box with the free-visit coupon and the group note, then the dark back page: **Next issue** (the term after next, one of its courses as a cover, and the newsletter sign-up; type {term} or {season} in its heading or text and the real term drops in) and **For pastors** (the bulletin insert to download and a link to request printed catalogs). The catalog sections fill themselves from the Catalog, the Faculty list, the Testimonials and the Pricing tiers; what you edit in `Page sections` is the wording around them. The **group rate** in the Rates section is empty on purpose: its line stays hidden until you type a rate. **For pastors** stays hidden until you upload the insert PDF or add the catalog link, and Next issue hides when no later term is in Catalog, Terms. The thin bar at the very top of every page reads the next term by itself (“Spring 2027 term · registration opens Sun 15 Nov · first class Tue 26 Jan”), so keep the term’s dates and status right and the bar stays right. The top of the page stays in the `Hero` tab: the big term name comes from the next Term (edit it in Catalog, Terms), `Hero headline` is the italic line under it, and the three covers beside it are the courses marked “Start here”, then “Featured”. The hero eyebrow and hero photos are no longer shown.',
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
    icon: 'pages',
    lead: 'Create a new page from scratch, like a reading group or a special campaign, without a designer.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Content', 'Pages', 'Custom pages (build your own)', '+'],
        link: { pane: 'pages;page' },
      },
      { kind: 'h', text: 'Build a page' },
      {
        kind: 'steps',
        items: [
          'Open **Pages**, then **Custom pages (build your own)**, then the `+` button.',
          'Pick a **template**. They are grouped: _Basics_ (a blank page, a simple text page, information with questions, a photo story), _Enrollment_ (a term announcement, an info session invitation, how to enroll), _Teaching_ (a lecture or study series, a reading list, a faculty spotlight) and _Partners_ (for congregations, scholarships and support). Each comes with sections already in place and words that start **Example:** for you to replace.',
          'Give it a **Title**.',
          'Set the **Slug**, which is the web address. A slug of "reading-group" makes the page live at yoursite.org/reading-group. Lowercase letters and dashes, no spaces.',
          'Add **Sections** to build the body (see the next guide).',
          '`Publish`. Your page is now live at its web address.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Replace every "Example:"',
        text: 'Anything that still starts **Example:** is a stand-in, not something true about the Academy. A yellow note beside the sections says so until every one is replaced. It never stops you publishing, so check before you do.',
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
    icon: 'document',
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
    icon: 'redirect',
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
    icon: 'preview',
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
        items: ['Schedule something to publish itself', 'Check a page before you publish it'],
      },
    ],
  },

  {
    slug: 'schedule-a-publish',
    category: 'Website pages & menus',
    title: 'Schedule something to publish itself',
    icon: 'times',
    lead: 'Write it now, have it go live at a time you choose, without being at your computer.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['any page', 'the Publishing tab', 'Publish automatically at'],
      },
      {
        kind: 'p',
        text: 'Every page, course, notice and event has a **Publishing** tab with one field in it: **Publish automatically at**. Set a date and time, leave it as a draft, and it publishes itself. Good for the morning enrollment opens: write the notice, the new course and the info session the week before, and schedule all three. Home lists everything scheduled under **Coming up**.',
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
    icon: 'savedSection',
    lead: 'Keep a band you got right, then add it to any page: as a copy to change, or synced so one edit changes every page.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['a page', 'the arrow beside Publish', 'Save a section as preset'],
      },
      {
        kind: 'p',
        text: 'You got a "Request information" band exactly right and want the same band on three more pages. Save it once, add it wherever you like.',
      },
      { kind: 'h', text: 'Save one' },
      {
        kind: 'steps',
        items: [
          'Open the page that has the section on it.',
          'Click the small arrow beside `Publish`, then **Save a section as preset...**',
          'Pick the section from the list. They are numbered the same way they are on the page.',
          'Give it a name you will recognize later, then **Save section**.',
        ],
      },
      {
        kind: 'p',
        text: 'A saved section can hold up to twelve sections that go together, like a notice band and the key dates. Open it under **Content, Pages, Saved sections** to add more.',
      },
      { kind: 'h', text: 'Add it to a page' },
      {
        kind: 'steps',
        items: [
          'Open the page and scroll to its **Sections**.',
          'Under the list, click **Insert a saved section** and find the one you want.',
          '**Add a copy** puts its sections on this page, yours to change. **Add synced** shows the saved section as it is, and keeps it that way.',
          'New sections go at the bottom. Drag them where they belong, then `Publish`.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Copy or synced?',
        text: 'A copy never changes again unless you change it on that page. A synced section changes on every page using it whenever you edit and publish the saved section. Use synced for things that must say the same everywhere, like "Enrollment is open" on Home, Courses and Pricing.',
      },
      { kind: 'h', text: 'The seasonal ones' },
      {
        kind: 'p',
        text: 'The list starts with sections for the moments every term brings round: enrollment is open, apply by soon, an info session, the term begins, the first week, the term has ended, between terms, a course is full, help with the cost, an Advent or Lent study, and sharing with a congregation. Their words start **Example:**. Replace them, publish the saved section, then add it synced where it belongs. When the season is over, remove it from the pages, or change its words for next time.',
      },
      {
        kind: 'callout',
        tone: 'default',
        title: 'Where they live',
        text: 'Under **Pages**, near the bottom, as **Saved sections**. Open one there to rename it, edit it, or move it to the Trash. Nothing in that list appears on the website until a page uses it.',
      },
      { kind: 'seealso', items: ['Add & arrange sections', 'Build a brand-new page'] },
    ],
  },

  {
    slug: 'check-a-page',
    category: 'Website pages & menus',
    title: 'Check a page before you publish it',
    icon: 'checkup',
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
        text: 'Nothing here blocks the `Publish` button and nothing gets changed for you. Every line is a suggestion. A page can be perfectly fine and still be listed, so read it, use your judgment, and publish when you are happy.',
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
    icon: 'sections',
    lead: 'Sections are the building blocks of a page. Mix and match them and reorder them, from the list or straight on the page picture. The page sets the backgrounds for you.',
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
          '**Words, photos & video**: text, text in columns, image + text, a quote or verse, a letter, a photo gallery, a wide photo, and cards with photos or icons.',
          '**Cards, facts & lists**: big numbers and partner logos. Cards with icons or photos are under Words, photos & video, and steps on a path under Courses and terms.',
          '**Courses and terms**, **Events and notices** and **Fold-outs and tabs**: the course rail and finder, steps on a path, event details, schedules, countdowns, notices, timelines, the calendar button, fold-out questions and tabs.',
          '**From your catalog (auto-updating)**: the dynamic list (featured courses, upcoming events, faculty, testimonials), the FAQ list, and the pricing tiers. These keep themselves up to date from your other documents.',
          '**Banners, forms & extras**: the call-to-action band, a form, downloadable resources, and embeds.',
          '**Page sections (Rule & Ledger)**: the built-in parts of the site’s own pages. They come styled to match the page they belong to, so they have no background choice: you set what appears and in what order, and the design stays put. In this band: the legal statement body (Privacy, Accessibility), numbered cards (For You, About, Get Started, Home), the warm statement band and the ruled stat band (Pricing, Home), editorial columns and the inline band (About), the grouped FAQ (FAQ), upcoming events and recurring rhythms (Events), the contact details and map (Contact), the request panel (Get Started), the course rail (Courses and Home), which pulls the courses you have marked “Start here” or “Featured” straight from the catalog, Home’s own three: the topics ticker, the faculty strip (cards or contributors) and the testimonials (quote cards or letters), and the Term Issue sections: term contents, the course finder (reply card), next issue and for pastors. The course rail can also be the cover grid of every course, and the tuition tiers can be the home page’s rates box.',
        ],
      },
      { kind: 'h', text: 'What is not a section' },
      {
        kind: 'bullets',
        items: [
          'The **big headline** at the top of a page is a field in the `Hero` tab, not a block. Same for the photo behind it. In **Preview**, clicking the headline or the line under it puts an `✎ Edit here` button on it, so you can reword them without leaving the page picture.',
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
      { kind: 'h', text: "A section's background" },
      {
        kind: 'p',
        text: 'You do not set a section\u2019s background. The page works out the rhythm of paper, warm and green bands as you add and move sections, so a section looks right wherever you drop it. A few sections have a **Look** choice, a short list of designs made for them (for example a plain or a framed notice). All of it is walked through in its own guide, "Change how a section looks".',
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
    icon: 'publishing',
    lead: 'Dragged a section to the wrong place, removed the wrong one, or picked a look you regret? Step it back.',
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
      {
        kind: 'callout',
        tone: 'caution',
        title: 'On the page picture, use the menu',
        text: 'The keyboard shortcut is not heard while you are clicking around the **Preview** picture itself, because the picture is a little window running the real website. Click into the panel beside it first, or just use **Undo last change** in the `Publish` menu, which always works.',
      },
      { kind: 'h', text: 'What it can and cannot reach' },
      {
        kind: 'bullets',
        items: [
          'It works on your **unpublished draft** only. The live website is never touched, so undo can never break what visitors see.',
          'It covers everything, not just typing: sections added, dragged, duplicated or removed, photos swapped or cleared, and options changed.',
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
    icon: 'brandKit',
    lead: 'Pick a section\u2019s look, bold a word, color one word of the heading, or change its arrangement. All of it from the page picture, all of it on-brand.',
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

      { kind: 'h', text: 'Backgrounds: the page does it for you' },
      {
        kind: 'p',
        text: 'You do not pick a section\u2019s background or its accent color. As you add and move sections, the page works out a steady rhythm of paper, warm and green bands, and keeps the text on each one readable. Drop a section anywhere and it looks right; move it and it adjusts. A section\u2019s old background panel is gone from the form, and sections made before still look exactly as they did.',
      },
      {
        kind: 'p',
        text: 'A few sections offer a **Look** instead, a short list of designs made for that section (for example a plain or a framed card, or a quiet or a loud notice). Pick one from the list on the section. There is no color picker on purpose: every look is checked against the accessibility contrast standard by an automatic test, so the words stay readable.',
      },

      { kind: 'h', text: 'Bold and italic in a subhead' },
      {
        kind: 'p',
        text: 'A few short support lines used to be plain typing with no way to emphasise anything. Those now have a second box under the first, with a bold button and an italic button and nothing else. Type in the second box and it is used instead; the plain box tidies itself away so you are not looking at two copies of the same line.',
      },
      {
        kind: 'p',
        text: 'You will find it on the **Subhead** of the call-to-action band and the **Intro** of the other sections that have one. In **Preview**, clicking one of those lines puts an `✎ Edit here` button on it, which opens a small box over the line with the same bold and italic buttons, so you can type it in place.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'A little goes a long way',
        text: 'Bold one phrase, not a sentence. If everything is emphasised, nothing is. Headlines are deliberately left out of this: they have their own device, below.',
      },

      { kind: 'h', text: 'One word of the heading in color' },
      {
        kind: 'p',
        text: 'Sections with a big heading have a box called **Accent word in the heading**. Type a word or a short phrase that already appears in the heading, and it is set in the section’s accent color on the page. Leave it blank and the heading is plain. Easier still: click the heading in **Preview**, press `Color a word`, and click the word you want, which cannot be misspelled because you are picking it out of the heading itself.',
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
        text: 'The first match is the one that gets colored, and one is the limit by design. Two colored words in one heading stop reading as emphasis and start reading as decoration.',
      },

      { kind: 'h', text: 'Layout: how the section is arranged' },
      {
        kind: 'p',
        text: 'Two more controls sit on the section itself, and they change the arrangement rather than the color. Not every section has them, because not every section has more than one arrangement that we are happy to put your name on.',
      },
      {
        kind: 'bullets',
        items: [
          '**Which side is the picture on?** on the image + text section. Two choices, left or right. Use it to alternate down a long page so two picture sections in a row do not face the same way.',
          '**How many across** on stats, the photo gallery and the dynamic list. Pick two, three or four (the dynamic list offers two or three). Two is the one to reach for when a section holds exactly two things and a three-across row is leaving an empty gap.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Phones are not part of the choice',
        text: 'Every one of these is about the widest screen. On a phone the words always come first and the picture underneath, and the grids always stack (the photo gallery always shows two across). So there is no setting here that can make the site awkward on a phone.',
      },

      {
        kind: 'callout',
        tone: 'default',
        title: 'Some sections have no choices at all',
        text: 'The **Page sections (Rule & Ledger)** blocks come styled to match the page they belong to, so they have no look to pick. That is deliberate, not a gap: those are the parts of the site that should never drift.',
      },
      { kind: 'seealso', items: ['Add & arrange sections', 'The brand: colors & fonts'] },
    ],
  },

  {
    slug: 'top-menu',
    category: 'Website pages & menus',
    title: 'Edit the top menu & footer',
    icon: 'link',
    lead: 'Add, rename, reorder, or remove the links in the website header, the phone menu and the footer index, including dropdown menus, the short notes in the phone menu, the header button and a logo.',
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
      { kind: 'h', text: 'The short notes in the phone menu' },
      {
        kind: 'p',
        text: 'On a phone, the menu opens as a "Contents" page, and each link ends in a few words in small capitals, like "Info nights" beside Events. Open a link in **Top menu links** and type them in its **Menu note**. Keep it to two or three words. Courses, Faculty and Pricing fill theirs in on their own (how many courses, how many teachers, the lowest price), so their note box can stay empty. Leave any note blank and the site uses a built-in one.',
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
        text: 'The header fits six links. Once there are six, **Add to menu** grays out and says so. Take something out first, either with **Remove from menu** on its row or in Site Settings.',
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
      { kind: 'h', text: 'The footer index' },
      {
        kind: 'steps',
        items: [
          'In the same `Navigation (menus)` tab, scroll to **Footer index links**.',
          'Add a **Link** to any column. The footer prints every link once, sorted A to Z with a small letter at each new initial, so the columns and their headings only keep the list tidy here.',
          'A page linked twice shows once, under the first label.',
          '`Publish`. The address, office hours and email beside the index come from `Identity & contact`.',
        ],
      },
      {
        kind: 'p',
        text: '**Footer index: extra links** (Privacy, Accessibility) join the same A to Z list. Leave it empty to keep the built-in Pricing, Privacy and Accessibility.',
      },
      { kind: 'h', text: 'The button at the right of the header' },
      {
        kind: 'steps',
        items: [
          'In `Navigation (menus)`, open **Header button**.',
          'Type **Button text** to change what it says, and set **Where the button goes** to change where it leads. Leave both blank for the built-in "Request information" pointing at Get Started.',
          'Turn **Show the header button** off to remove the button from the header, the phone menu and the footer.',
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
        text: 'The top menu, the footer index links and the header button all fall back to the built-in ones while they are empty, so you only change what you fill in. The same goes for the footer social switch: leave it alone and any social links you set show in the footer.',
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
    icon: 'search',
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
    icon: 'image',
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
      { kind: 'h', text: 'A photo behind the headline' },
      {
        kind: 'steps',
        items: [
          'On an inner page (not Home), open the **Hero** tab and add a **Hero background image**.',
          'Set **Hero style** to **Photo behind the words**. The photo fills the band and the headline sits over it in white, under a green shade that keeps it readable on any photo.',
          'Optional: fill the **Short-facts card** beside the words, like an open evening with its date and a link.',
          '`Publish`. Set the style back to **Standard** to return to the usual hero.',
        ],
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
    icon: 'scripture',
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
          'Write the **Course title** in plain words. A catalog code like "SCR 101" does not go in the title; it has its own field in the `Cover` tab.',
          'The **Slug** (the web address) fills in from the title. Leave it unless you have a reason to change it.',
          'Write a one or two sentence **Summary**. It shows on the catalog card and is used as the page description for search.',
          'A **Cover image** is optional and is not shown on the site at the moment: the course card draws its own cover (see the `Cover` tab below).',
          'Pick a **Level** (Intro, Foundational, or Advanced) if it applies.',
          'Set the **Teaching areas** (the subject). This drives the topic filter on the catalog, so at least one is required.',
          'Set the **Instructors** by choosing one or more faculty members. This is the only place that link is made.',
          'Choose the **Format** (In person or Hybrid) and the **Venue / campus**.',
          'Add **Who this is for**: two or three real people, like "Small-group leaders who teach the text", not adjectives.',
          'Add the week-by-week **Sessions**, one row per session, each with a title and a short focus. The first session also appears on the back of the cover as "Week one".',
        ],
      },
      { kind: 'h', text: 'Design its cover (Cover tab)' },
      {
        kind: 'steps',
        items: [
          'Every course shows on the site as a small book cover: a color, a simple shape, the title and the teacher. Open the `Cover` tab to set it.',
          'Add a **Course code** if you want one, like "SCR 101": a few capital letters, a space, three digits. It is optional; leave it empty and the cover shows just the subject.',
          'Pick a **Cover color** and a **Cover ornament**. Both are optional. Leave them empty and the site picks them for you, and courses in the same subject get the same color.',
          'Write **The question**: the one question this course asks, in plain words, like "Is the Bible one book or sixty-six?" Keep it under 90 characters. It shows on the back of the cover. Leave it empty and the summary stands in.',
          'The cover is also the course’s **share picture**: when someone texts or posts the course page, it shows the cover beside the title and the question. It is redrawn at every publish. To use a photo instead, set the course’s social share image.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Where the back of the cover shows',
        text: 'On a computer with a mouse, a cover turns over when you point at it. On a phone, or for anyone who has turned off motion, the same words sit beside or below the cover instead, so nobody misses them.',
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
      { kind: 'shot', key: 'offering-status' },
      {
        kind: 'p',
        text: 'A course that fills mid-enrollment is quicker from a phone: see **Mark a course full or waitlisted**.',
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
        items: [
          'Add a faculty member',
          'Set up a term or cohort',
          'Enrollment season, week by week',
          'Pricing & scholarships',
        ],
      },
    ],
  },

  {
    slug: 'faculty',
    category: 'Courses, faculty & terms',
    title: 'Add a faculty member',
    icon: 'person',
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
        ],
      },
      { kind: 'h', text: 'This term' },
      {
        kind: 'steps',
        items: [
          'All optional. Ask the teacher for these in their own words; do not write them on their behalf.',
          'Fill in **On my desk** with what they are reading right now, up to 100 characters. It shows in italic after "On my desk:" on their profile and in the faculty strip when it is set to Contributors.',
          'Upload a **Spoken introduction** if they have recorded one: a minute or two of them opening a class, as an MP3 or M4A. Nothing downloads for a visitor until they press play.',
          'Paste the **Transcript of the introduction**, every word, with a blank line between paragraphs. It is required whenever a recording is uploaded: the document will not publish without it, because people who cannot hear the recording need to read it.',
          'Type the **Length of the introduction** as minutes and seconds, like "1:32". It shows beside the play button.',
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
        tone: 'primary',
        title: 'The Contributors style of the faculty strip',
        text: 'A faculty strip section has a **Style** choice: Cards (the original row) or Contributors. Contributors sets each teacher as a row with their portrait, their degree and ordination, "In this issue:" (the courses they teach that run in the next term, worked out from each course\'s **Instructors** and **Offerings**), their On my desk line and the play button. Anything left empty simply does not show.',
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
    icon: 'times',
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
      { kind: 'shot', key: 'term-editor' },
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
        text: 'When a new term is coming, the `New term` tool in the top bar walks the whole rollover in order: create the term, update the courses, check pricing, and post the term-start event.',
      },
      { kind: 'seealso', items: ['Add or edit a course', 'Open a new term', 'Close a term'] },
    ],
  },

  // ==========================================================================
  // EVENTS, NOTICES & VOICES
  // ==========================================================================
  {
    slug: 'post-event',
    category: 'Events, notices & voices',
    title: 'Post or edit an event',
    icon: 'event',
    lead: 'Add an info session, open lecture, workshop, or term start. Events show on the Events page automatically.',
    diy: 'self',
    video: 'add-info-session',
    body: [
      { kind: 'path', items: ['Events', '+ New event'], link: { pane: 'event' } },
      {
        kind: 'p',
        text: 'The Events list opens on **This school year**, with one folder per past year behind it and an **Everything** list at the bottom, so this term’s events are always on top, however many years pile up.',
      },
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
      { kind: 'h', text: 'Add an info session from your phone' },
      {
        kind: 'p',
        text: 'For an info night or a lecture you only need a name, a time and a sign-up link: open `Quick update`, press **Add an info session or event**, choose the kind, and press the button. Move one later with **Change an event’s time or place**.',
      },
      { kind: 'h', text: 'Edit or take down an event' },
      {
        kind: 'steps',
        items: [
          'Click **Events**, then click the event in the list.',
          'Change whatever you need, then click `Publish` again.',
          'To take it down, open it and choose `Unpublish` (keeps a saved copy) or `Move to Trash` (you can bring it back from the **Trash** at the bottom of the left menu).',
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
    icon: 'notice',
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
    icon: 'testimonial',
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
    icon: 'question',
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
  {
    slug: 'forms',
    category: 'Events, notices & voices',
    title: 'Forms & where messages go',
    icon: 'form',
    lead: 'The contact form and the "Request information" form. Change their questions here; every message lands with the Academy by email.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Content', 'Forms'],
        link: { pane: 'content;form' },
      },
      { kind: 'h', text: 'Change a question' },
      {
        kind: 'steps',
        items: [
          'Open **Content**, then **Forms**, and pick the form.',
          'Open the `Fields` tab. Add, remove, reword or reorder the questions.',
          'Keep one **Email** field and a name box (**Name**, or **First name** and **Last name**). The site needs both to send the message and to let us reply.',
          '`Publish`. The form on the site updates at the next rebuild.',
        ],
      },
      { kind: 'h', text: 'Where a message goes' },
      {
        kind: 'p',
        text: 'Every message is saved first, in the Academy’s own database, and then emailed to the Academy. The email arrives from the website with the visitor’s name in it, and hitting **Reply** answers the visitor directly. Every answer they gave appears in the email as a "Question: answer" line, in the same order as the form.',
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Nothing to set up here any more',
        text: 'Forms used to have a **Where submissions go** tab with a service and an access key. That tab is gone because the website now handles messages itself. If an email ever seems not to arrive, the message is still saved, so ask Nathan to look it up.',
      },
      {
        kind: 'callout',
        tone: 'default',
        title: 'The small box under the form',
        text: 'Visitors may see a small Cloudflare check box above the Send button. It is a spam filter, and most people never have to click it.',
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
    icon: 'give',
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
    icon: 'brandKit',
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
        text: 'The page picks each section\u2019s background, and a few sections offer a short list of **looks**, not a color code. Each one already knows the right text color to stay readable. That is why you cannot pick a random color, and why you do not need to.',
      },
      { kind: 'h', text: 'What you can change yourself' },
      {
        kind: 'bullets',
        items: ['A section\u2019s look, where it has one.', 'All the words and photos, of course.'],
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
    title: 'How many people visit the website',
    icon: 'people',
    lead: 'The Visitors card on Home: visits this week against last week, the most read pages, and how people found the site.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Home (top bar)', 'Visitors'],
        link: { tool: 'home' },
      },
      { kind: 'h', text: 'What it shows' },
      {
        kind: 'bullets',
        items: [
          '**Visits** in the last 7 days, and whether that is up or down on the 7 days before.',
          'A small chart of the last four weeks, one bar a day.',
          'The five **most read pages**.',
          '**How people found you**: search engines, typing the address, social media, or a link on another site.',
        ],
      },
      {
        kind: 'p',
        text: 'The numbers come from Cloudflare Web Analytics, which counts page views without cookies and without following anyone around the web. They refresh about every ten minutes.',
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Good for comparing, not for quoting',
        text: 'Use it to see whether an enrollment push or a newsletter brought people to the site. Small numbers move a lot from week to week, so look at a few weeks before reading much into one.',
      },
      { kind: 'h', text: 'If it says it is not set up yet' },
      {
        kind: 'p',
        text: `That is a one-time website setup step, not something you can fix from here. Ask ${SITE.contactName}.`,
      },
    ],
  },

  {
    slug: 'trash',
    category: 'Look, brand & housekeeping',
    title: 'Deleting things & the trash',
    icon: 'trash',
    lead: 'Deleting is a soft landing here: things go to the Trash first, and one click brings them back.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Content', 'Trash (bring things back)'],
        link: { pane: 'trash' },
      },
      { kind: 'h', text: 'How deleting works' },
      {
        kind: 'p',
        text: 'On courses, terms, faculty, events, testimonials, questions, pricing tiers, custom pages, notices, teaching areas and forms, the delete action is `Move to Trash`. It does not destroy anything. A copy goes into the **Trash** and the original comes off the website and out of its list.',
      },
      {
        kind: 'steps',
        items: [
          'Open the document, then the `⋮` menu next to the Publish button.',
          'Choose `Move to Trash` and confirm.',
          'It leaves its list straight away and leaves the website a few minutes later, when the site updates.',
        ],
      },
      { kind: 'h', text: 'Bring something back' },
      {
        kind: 'steps',
        items: [
          'Open **Trash (bring things back)** at the bottom of the left menu.',
          'Click the item, then `Bring it back`.',
          'It returns to its own list under the same address, exactly as it was. Anything that pointed at it (a course pointing at a term, say) works again. If it was on the website before, it goes back on the website too.',
        ],
      },
      { kind: 'h', text: 'Delete for good' },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Delete forever is really forever',
        text: 'Inside the Trash, `Delete forever` removes the copy for good after a confirmation. Only administrators see it. Use it only for things you are sure nobody needs again.',
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'If moving to the Trash is blocked',
        text: "When another document still points at this one (a course pointing at a term, for example), the Studio says so instead of moving it, so the site never ends up with broken links. Open the document's `Used on` tab to see what links to it, remove those links, then try again.",
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'What `Used on` counts',
        text: 'The list is worked out from your real content each time you open it, so it names every page that shows the document, not just one. Two things it adds on purpose: a course always lists the course catalog and a teacher always lists the faculty roster, because those pages list everyone automatically. A document nothing shows yet says so in plain words.',
      },
      {
        kind: 'callout',
        tone: 'default',
        title: 'Older deleted items',
        text: 'Before October 2026 a deleted item was only marked as deleted. Anything deleted that way is under **Older deleted items**, below the Trash, with `Restore` and `Delete forever` as before.',
      },
      { kind: 'seealso', items: ['Do it yourself vs. ask for help'] },
    ],
  },
];

// ── Studio kit guides (PORTS.md cards 110, 111, 115 and 117) ────────────────
// The Home page, the status line, Help for this page, Quick update, private
// preview links and Messages, in the Academy's words.
guides.push(
  {
    slug: 'home-page',
    category: 'Start here',
    title: 'What the Home page shows you',
    icon: 'home',
    lead: 'Home opens first every time. Here is what each card is for, top to bottom.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Home is a dashboard: it changes nothing by itself. Every card points somewhere, and the buttons take you straight there.',
      },
      {
        kind: 'bullets',
        items: [
          '**The big buttons**: the jobs you do most, like opening a new term, adding a course or posting a notice.',
          '**This week**: the small jobs that keep the website current. Most check themselves when the work is done; the ones the website cannot see you check by hand. The list starts fresh every Monday.',
          '**Coming up**: pages, notices and events set to publish by themselves, soonest first. To schedule one, fill in **Publish automatically at** under Publishing and leave it as a draft.',
          '**Is it live?**: whether your last published change is on the website yet.',
          '**Fix-it list**: what the Checkup found, by name, like a course with no summary or a photo with no description. `Edit` opens it at the right spot.',
          '**Visitors**: how many people visited in the last 7 days against the week before, the most read pages and how people found the site.',
          '**Your pages**: every page you can change, in groups, one click each. Pages you build yourself are added automatically.',
          '**Pick up where you left off**: drafts you have not published yet, with Publish and Discard buttons.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Visitors says "not set up yet"?',
        text: `The numbers come from Cloudflare, which counts visits without cookies. ${SITE.contactName} switches it on once, and after that it fills in by itself.`,
      },
      { kind: 'seealso', items: ['The line under the top bar', 'Start here: how it all works'] },
    ],
  },
  {
    slug: 'website-status',
    category: 'Start here',
    title: 'The line under the top bar',
    icon: 'overview',
    lead: 'A quiet answer to "is my change on the website yet?", wherever you are in the Studio.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Under the top bar there is a thin line that says how the website is doing. It reads the same thing as the **Is it live?** card on Home, so the two always agree.',
      },
      {
        kind: 'bullets',
        items: [
          '**Website up to date**: everything you have published is on the website.',
          '**Updating the website, about 3 minutes**: you published something and the website is rebuilding. You do not need to wait for it.',
          `**The website update is taking longer than usual**: nothing is lost, your change is safe and published. If it still says this an hour later, ask ${SITE.contactName}.`,
        ],
      },
      { kind: 'seealso', items: ['Start here: how it all works'] },
    ],
  },
  {
    slug: 'help-panel',
    category: 'Start here',
    title: 'Help for this page',
    icon: 'help',
    lead: 'Help beside whatever you are editing, without leaving it.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'When something is open for editing, click `Help for this page` at the top of it (it can also sit in the menu with three dots). A panel opens beside the boxes you are typing in.',
      },
      {
        kind: 'bullets',
        items: [
          '**Worth a look** lists photos with no description, empty sections and links that go nowhere, and anything the Checkup found on this page. It updates as you type. None of it stops you publishing.',
          '**How to** shows the Site Guide steps for this kind of page, so you can follow them while you work.',
        ],
      },
      { kind: 'seealso', items: ["Edit a page's words & photos"] },
    ],
  },
  {
    slug: 'quick-update',
    category: 'Start here',
    title: 'Quick updates from your phone',
    icon: 'quickUpdate',
    lead: 'Short forms for the jobs that cannot wait until you are at a desk.',
    diy: 'self',
    video: 'quick-updates',
    body: [
      {
        kind: 'p',
        text: 'Click `Quick update` in the top bar (on a phone, open the menu first). Each big button opens a short form with only the boxes that job needs, and nothing else on screen.',
      },
      {
        kind: 'bullets',
        items: [
          '**Put up a notice**: one line across the top of every page, until the day you pick.',
          '**Remind people enrollment closes**: a notice the Studio words for you from the next term, with its Apply by date and a link to Get started.',
          '**Mark a course full or waitlisted**: pick the course, then Open, Waitlist or Full. The course card changes at once.',
          '**Cancel or move a class**: a notice in red that takes itself down after the day you name.',
          '**Add an info session or event**: an info night, an open lecture or a workshop, with its date, place and a sign-up link.',
          '**Change an event\u2019s time or place**: pick an upcoming event and change when, where or the sign-up link.',
          '**Open or close enrollment for a term**: say whether a term is Upcoming, Registration open, In session or Closed.',
          '**Answer this week\u2019s messages**: a shortcut to the Messages tool.',
          'In their season, **Announce the holiday break** and **Announce the summer break** appear too.',
        ],
      },
      { kind: 'shot', key: 'quick-update-tiles' },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'These publish straight away.',
        text: 'A quick update goes on the website a few minutes after you press the button. Open it in the full editor afterwards to add a photo or more detail.',
      },
      {
        kind: 'seealso',
        items: [
          'Announcement banners',
          'Enrollment season, week by week',
          'Mark a course full or waitlisted',
          'Cancel or move a class',
        ],
      },
    ],
  },
  {
    slug: 'share-a-preview',
    category: 'Website pages & menus',
    title: 'Show someone a page before it goes live',
    icon: 'link',
    lead: 'A private link to your draft that works for a few days, no login needed.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Sometimes you want a colleague to read a page before you publish it. **Share a preview** makes a private link that shows your unpublished changes to that one page. The person opening it does not need a Studio login.',
      },
      {
        kind: 'steps',
        items: [
          'Open the page you are working on.',
          'Open the menu next to `Publish` and choose `Share a preview`.',
          'Pick how long the link should work: 1, 3, 7 or 14 days.',
          'Click `Make the link`, then `Copy`, and paste it into an email.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'The link is shown once.',
        text: 'Copy it straight away. If you lose it, make a new one. The old one keeps working until its date unless you stop it.',
      },
      { kind: 'h', text: 'Stop a link early' },
      {
        kind: 'p',
        text: 'Open `Share a preview` on the same page. Under **Links for this page that still work**, click `Stop this link`. Anyone who opens it after that sees the published page instead.',
      },
      { kind: 'seealso', items: ["Edit a page's words & photos"] },
    ],
  },
  {
    slug: 'messages',
    category: 'Events, notices & voices',
    title: 'Read messages from the website',
    icon: 'message',
    lead: 'Every inquiry and expression of interest sent through the website, in one list.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Click `Messages` in the top bar. Every form on the website lands here as well as in email, newest first. Click a name to read the message.',
      },
      {
        kind: 'bullets',
        items: [
          '**New**: nobody has dealt with it yet.',
          '**Needs a person**: someone has to answer it. A message whose email did not go out starts here, because nobody has seen it anywhere else.',
          '**Replied**: answered. Mark it so nobody answers twice.',
          '**Spam**: junk. Leave it there.',
        ],
      },
      {
        kind: 'p',
        text: `If the page says **Forms are not set up yet**, the website forms have not been switched on. Ask ${SITE.contactName}.`,
      },
      { kind: 'seealso', items: ['Forms'] },
    ],
  },
);

// ── The Academy's term-time and enrollment jobs (docs/agent/studio-plan.md) ──
// One guide per job in the plan that had none: the turn of a term, enrollment
// weeks, a class that moves, and the end of a term.
guides.push(
  {
    slug: 'new-term',
    category: 'Courses, faculty & terms',
    title: 'Open a new term',
    icon: 'times',
    lead: 'A new term is the biggest job of the season. The New term tool lays it out in order and checks each step off as you go.',
    diy: 'self',
    video: 'new-term',
    body: [
      { kind: 'path', items: ['New term (top bar)'], link: { tool: 'term-setup' } },
      {
        kind: 'p',
        text: 'Do this six to eight weeks before the term begins, so people have time to enroll. The tool never changes anything by itself: each step has a button that opens the right place, and the step turns green once it is done and published.',
      },
      { kind: 'shot', key: 'new-term-tool' },
      { kind: 'h', text: 'The steps, in order' },
      {
        kind: 'steps',
        items: [
          '**Create the new term.** Its name, like "Spring 2027", and the day it begins. The site works out "Next cohort begins" from that date.',
          '**Set the enrollment status.** Upcoming while you get ready, then Registration open on the day people can sign up.',
          '**Set when enrollment opens and closes.** Registration opens and Apply by. The enrollment reminder notice reads Apply by, so get it right.',
          '**Point courses at the new term.** Open each course that runs this term, go to the `Schedule & cohorts` tab and add an offering for the new term.',
          '**Check the pricing tiers.** If the cost has changed, change it on the tier, once, and every course on that tier follows.',
          '**Post the term-start event,** so the first night shows on the Events page.',
          '**Announce registration** with a notice. Quick update has a ready-made one: **Remind people enrollment closes**.',
          '**Clear out old notices** and **re-read the home page** with the new term in mind.',
        ],
      },
      {
        kind: 'video',
        key: 'enrollment-reminder',
        caption: 'Remind people enrollment closes, from your phone.',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'You can stop halfway',
        text: 'The tool reads what is already on the website each time you open it, so you can do two steps today and the rest next week. Nothing is lost.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'One course, one offering per term',
        text: 'Add a new offering for the new term; do not change the term on last term’s offering. Keeping the old one is how the site knows the course has run before.',
      },
      {
        kind: 'seealso',
        items: [
          'Set up a term or cohort',
          'Add or edit a course',
          'Enrollment season, week by week',
        ],
      },
    ],
  },
  {
    slug: 'enrollment',
    category: 'Courses, faculty & terms',
    title: 'Enrollment season, week by week',
    icon: 'form',
    lead: 'The weeks between Registration open and Apply by have a rhythm: a reminder up, messages answered, seats kept honest.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Home’s **This week** card watches most of this for you. When a term is set to Registration open, it asks for a notice, and it keeps a line for seats and waitlists until you check it.',
      },
      { kind: 'h', text: 'Every week while enrollment is open' },
      {
        kind: 'steps',
        items: [
          'Open `Messages`. Answer each inquiry and expression of interest, then mark it **Replied** so nobody answers twice.',
          'Check a notice is up. If not, open `Quick update` and press **Remind people enrollment closes**. Leave the words empty and it writes them from the term: "Enrollment for Spring 2027 closes December 15. Save your seat today."',
          'Keep seats honest. When a course fills, open `Quick update`, press **Mark a course full or waitlisted**, pick the course and choose **Waitlist**. When it can take nobody else, choose **Full**. Add a note like "Two seats left" if you like.',
          'If an info night is coming, make sure it is on the Events page with a sign-up link (Quick update, **Add an info session or event**).',
        ],
      },
      { kind: 'shot', key: 'quick-update-reminder' },
      { kind: 'h', text: 'Seats and waitlists' },
      {
        kind: 'bullets',
        items: [
          '**Open**: people can enroll. The course card shows the term and the schedule.',
          '**Waitlist**: the course is full, but people can still ask for a place.',
          '**Full** (Closed in the full editor): no more places this term.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Two places, one rule',
        text: 'Quick update sets **Seats right now** on the course, and it wins over the status on the term’s offering. Choose nothing and the offering decides again. Checkup lists any course whose seats you set by hand, so you remember to set them back when a new term opens.',
      },
      { kind: 'seealso', items: ['Mark a course full or waitlisted'] },
      { kind: 'h', text: 'When enrollment closes' },
      {
        kind: 'steps',
        items: [
          'Open the term and set its **Status** to **In session** on the first day of term.',
          'The reminder notice takes itself down on its last day. If you put one up by hand, check it has an end date.',
        ],
      },
      {
        kind: 'seealso',
        items: [
          'Read messages from the website',
          'Quick updates from your phone',
          'Open a new term',
        ],
      },
    ],
  },
  {
    slug: 'seats',
    category: 'Courses, faculty & terms',
    title: 'Mark a course full or waitlisted',
    icon: 'people',
    lead: 'When a course fills, tell the website in a few taps from your phone. When a seat opens up, set it back.',
    diy: 'self',
    video: 'mark-course-full',
    body: [
      {
        kind: 'path',
        items: ['Quick update (top bar)', 'Mark a course full or waitlisted'],
        link: { tool: 'quick-update' },
      },
      {
        kind: 'p',
        text: 'People deciding on a course look at its card. **Waitlist** tells them it is full but they can still ask for a place. **Full** tells them there is no room this term. Open says people can enroll.',
      },
      { kind: 'h', text: 'From your phone' },
      {
        kind: 'steps',
        items: [
          'Click `Quick update` in the top bar (on a phone, open the menu first).',
          'Press **Mark a course full or waitlisted**, then pick the course from the list.',
          'Under **Seats right now**, choose **Open**, **Waitlist** or **Full**.',
          'Add a short note if you like, such as "Waitlist only" or "Two seats left". It shows on the course page.',
          'Press `Save the seats`. The course card and page say so in a few minutes.',
        ],
      },
      { kind: 'shot', key: 'seats-form' },
      { kind: 'h', text: 'When a new term opens' },
      {
        kind: 'p',
        text: 'Seats right now stays until you change it, and it applies to whatever term the course runs in next. When a new term opens, open the same form, pick the course and set it back to **Open**, or leave **Seats right now** on Choose one so the term decides again. Checkup lists every course you set by hand.',
      },
      { kind: 'h', text: 'At a desk' },
      {
        kind: 'p',
        text: 'The full editor does the same thing a different way: open the course, go to the `Schedule & cohorts` tab, and set that term’s offering to Waitlist or Closed. Use it when you want a different status for each term a course runs in.',
      },
      { kind: 'shot', key: 'offering-status' },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'This goes on the website straight away',
        text: 'It does not wait for Publish. If you marked the wrong course, open the form again and set it right.',
      },
      {
        kind: 'seealso',
        items: [
          'Enrollment season, week by week',
          'Add or edit a course',
          'Quick updates from your phone',
        ],
      },
    ],
  },
  {
    slug: 'cancel-a-class',
    category: 'Events, notices & voices',
    title: 'Cancel or move a class',
    icon: 'times',
    lead: 'Snow, illness or a room change: tell people in under a minute, from your phone.',
    diy: 'self',
    video: 'cancel-a-class',
    body: [
      {
        kind: 'path',
        items: ['Quick update', 'Cancel or move a class'],
        link: { tool: 'quick-update' },
      },
      {
        kind: 'steps',
        items: [
          'Open `Quick update` (on a phone, open the menu first).',
          'Press **Cancel or move a class**.',
          'Say which class and what to do, like "Tonight’s Romans class meets online instead. The link is in your email."',
          'Pick the day to take it down. It starts as tomorrow; for a class moved to next week, pick the day after the new date.',
          'Press the button. The red notice is on every page in a few minutes and comes down by itself.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Email the class too',
        text: 'Not everyone checks the website before a class. The notice is for anyone who does; the people enrolled need an email.',
      },
      { kind: 'h', text: 'If it was on the Events page' },
      {
        kind: 'p',
        text: 'An open lecture or info night that moves needs its event changed too. Open **Events**, open the event, change the **Start date & time** and the **Schedule** text, and `Publish`. If it is canceled for good, open it and choose `Move to Trash`.',
      },
      { kind: 'seealso', items: ['Quick updates from your phone', 'Post or edit an event'] },
    ],
  },
  {
    slug: 'office-hours',
    category: 'Events, notices & voices',
    title: 'Office hours, closures and the address',
    icon: 'times',
    lead: 'Typed once in Site settings, shown in the footer, on Contact and in the contact card.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Site Settings', 'Identity & contact'],
      },
      {
        kind: 'p',
        text: 'The address, phone, email and office hours live in one place, `Identity & contact` in Site Settings. The footer, the Contact page, the contact card block and what search engines read all come from there, so a change is one edit.',
      },
      { kind: 'h', text: 'Office hours by day' },
      {
        kind: 'steps',
        items: [
          'Open **Office hours by day** (under the one-line office hours).',
          'Add a row for each set of days with the same hours, like Monday to Thursday, 9 am to 4 pm. A day with no row shows as closed.',
          '`Publish`. From then on the footer and the Contact page show the week with "Open now" or when the office next opens, instead of the one-line office hours.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Only the real hours',
        text: 'Leave the rows empty until the hours are settled. While a row is a guess, untick **These hours are confirmed**: it shows with a small "To confirm" tag and stays out of search results. The address, phone and email have the same box.',
      },
      { kind: 'h', text: 'A holiday or a term break' },
      {
        kind: 'steps',
        items: [
          'Open `Quick update` and press **Change the office hours for a day**.',
          'Pick the day (and the last day, for a break of several days), and choose Closed all day or Different hours.',
          'Add why, like "Winter break", if you like. The website shows it on those days and goes back to the usual hours by itself.',
        ],
      },
      { kind: 'seealso', items: ['Quick updates from your phone'] },
    ],
  },
  {
    slug: 'end-of-term',
    category: 'Courses, faculty & terms',
    title: 'Close a term',
    icon: 'times',
    lead: 'Twenty minutes at the end of a term keeps the website from saying something that is no longer true.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Catalog', 'Terms'], link: { pane: 'catalog;term' } },
      {
        kind: 'steps',
        items: [
          'Open the term that just ended and set its **Status** to **Closed**. `Publish`.',
          'You do not need to change the courses. Their offerings for that term stay as a record, and the site only shows terms that are still to come.',
          'Open **Notices** and check nothing from the term is still switched on. Checkup lists any notice left past its end date.',
          'Past events drop off the Events page on their own. They stay in the Studio under their school year, so there is nothing to delete.',
          'Ask two or three people from the term for a sentence about it, and add the ones who say yes as **Testimonials**.',
          'Then start the next one: see **Open a new term**.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Never delete an old term',
        text: 'Courses point at their terms. A term that is Closed is simply not shown; a deleted one leaves those courses pointing at nothing.',
      },
      { kind: 'seealso', items: ['Open a new term', 'Add a testimonial', 'Announcement banners'] },
    ],
  },
);

// A category with zero guides would render as a dangling divider and usually
// means a category was renamed without moving its guides — fail at load.
for (const category of GUIDE_CATEGORIES) {
  if (!guides.some((g) => g.category === category)) {
    throw new Error(`Guide category "${category}" has no guides.`);
  }
}

/** Card 134: the field-to-guide map (empty until a site maps its fields to guide sections). */
export const GUIDE_FOR_FIELD: FieldGuideMap = {
  fields: {
    // A course's terms: the offering is where dates, seats and waitlists live.
    offerings: { guide: 'courses', section: 'Set when it runs (Schedule & cohorts tab)' },
    // The hand-set seats that win over the offering (Quick update's seats job).
    seatsNow: { guide: 'seats', section: 'When a new term opens' },
    // The enrollment reminder reads this date; a wrong one shows a wrong deadline.
    registrationDeadline: { guide: 'terms', section: 'Add a term' },
    // The cover's code and question are easy to over-fill.
    courseCode: { guide: 'courses', section: 'Design its cover (Cover tab)' },
    centralQuestion: { guide: 'courses', section: 'Design its cover (Cover tab)' },
    priceTier: { guide: 'courses', section: 'Set the cost (Pricing tab)' },
    // Recurring or one-time decides whether an event drops off after it passes.
    eventType: { guide: 'post-event', section: 'Add an event' },
    seoTitle: { guide: 'search-sharing', section: 'The four boxes' },
    seoDescription: { guide: 'search-sharing', section: 'The four boxes' },
  },
};

/**
 * Which guides "Help for this page" shows for each document type (kit.config.ts
 * guide.forType, PORTS.md card 110). '*' is the fallback for anything unlisted.
 */
export const GUIDES_FOR_TYPE: Record<string, string[]> = {
  '*': ['edit-page', 'help-panel'],
  page: ['edit-page', 'new-page', 'share-a-preview', 'rename-a-page', 'search-sharing'],
  homePage: ['edit-page', 'sections', 'photos', 'search-sharing'],
  course: ['courses', 'seats', 'enrollment', 'terms', 'photos'],
  term: ['terms', 'new-term', 'enrollment', 'end-of-term'],
  facultyMember: ['faculty', 'photos'],
  teachingArea: ['courses'],
  pricingTier: ['pricing'],
  pricingPage: ['pricing', 'edit-page'],
  event: ['post-event'],
  eventsPage: ['post-event', 'edit-page'],
  announcement: ['announcements', 'quick-update', 'cancel-a-class'],
  testimonial: ['testimonials'],
  faqItem: ['faqs'],
  faqCategory: ['faqs'],
  form: ['forms', 'messages'],
  siteSettings: ['top-menu', 'website-status'],
  redirect: ['rename-a-page'],
  sectionPreset: ['saved-sections'],
};
