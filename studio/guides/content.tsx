// Content for the in-Studio "How This Works" help guides. Plain data, no JSX, so
// the copy is easy to edit. The renderer is ../components/GuideView.tsx and the
// nav wiring is in ../structure.ts. See the design doc:
// docs/superpowers/specs/2026-06-01-studio-how-this-works-design.md
//
// This is The Presbyterian Academy, a Reformed lay-formation school. The guides
// describe the school desk: Pages, Catalog (Courses, Terms, Teaching Areas,
// Pricing Tiers), Faculty, Content (Testimonials, FAQ, Forms, Announcements),
// and Events.
//
// Editing tips:
//   - Use **double asterisks** for bold inside any text, step, or bullet.
//   - No em-dashes (house style). Define jargon in plain words.
//   - Site-specific values (contact details) live in SITE below, so a new client
//     site only edits one place.

import type { ComponentType } from 'react';
import {
  RocketIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
  HelpCircleIcon,
  TagIcon,
  CommentIcon,
  BookIcon,
  UsersIcon,
  EditIcon,
  AddDocumentIcon,
  BlockElementIcon,
  ImageIcon,
  ColorWheelIcon,
  InfoOutlineIcon,
  MenuIcon,
} from '@sanity/icons';

// The only site-specific copy. Swap these when reusing the template.
export const SITE = {
  contactName: 'Nathan',
  contactEmail: 'nathan@nixoncreativestudio.com',
};

export type GuideBlock =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'steps'; items: string[] }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'path'; items: string[] }
  | { kind: 'callout'; tone?: 'primary' | 'positive' | 'caution' | 'default'; title?: string; text: string }
  | { kind: 'seealso'; items: string[] };

export interface Guide {
  slug: string;
  title: string;
  icon: ComponentType;
  lead: string;
  diy?: 'self' | 'nathan' | 'mixed';
  body: GuideBlock[];
}

export const guides: Guide[] = [
  // 1 ----------------------------------------------------------------------
  {
    slug: 'start-here',
    title: 'Start here: how it all works',
    icon: RocketIcon,
    lead: "The big picture: what this Studio is, how your changes reach the live website, and the words you'll see along the way.",
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'This **Studio** is your control room. The **website** is what visitors see. You make changes here, and they appear on the website after you publish them. The Studio is private. The website is public.',
      },
      { kind: 'h', text: 'The one rule: nothing is live until you Publish' },
      {
        kind: 'p',
        text: 'While you type, your changes are saved as a **draft** that only you can see. The website does not change yet. When you are happy, click the **Publish** button at the bottom right. That is the moment your change goes live.',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Take your time',
        text: 'Because nothing is public until you publish, you cannot break the live site just by editing. Click around, try things, and only publish when it looks right.',
      },
      { kind: 'h', text: 'When your change shows up on the website' },
      {
        kind: 'p',
        text: 'When you click **Publish**, the website rebuilds itself and your change appears a few minutes later, not the instant you publish. There is no live preview of a draft inside Sanity, so re-read your text here before you publish. To see it on the real site, open the website in another browser tab after the rebuild.',
      },
      { kind: 'h', text: 'How the Studio is organized' },
      {
        kind: 'bullets',
        items: [
          '**Pages**: the fixed pages of your site (Home, About, Courses, and so on). One of each.',
          '**Catalog**: the course library and what supports it (Courses, Terms, Teaching Areas, Pricing Tiers).',
          '**Faculty**: the people who teach, each with a short scholarly profile.',
          '**Content**: reusable lists you add to over time (Testimonials, FAQ Items, Forms, Announcements).',
          '**Events**: info sessions, open lectures, workshops, and term starts shown on the Events page.',
          '**Media**: every photo you have uploaded, in one place (the icon in the top bar).',
        ],
      },
      { kind: 'h', text: "Words you'll see" },
      {
        kind: 'bullets',
        items: [
          '**Publish**: make your change live. **Unpublish**: take it off the live site (it stays saved as a draft).',
          '**Draft**: a saved change that is not live yet. A colored dot means there are unpublished edits.',
          '**Slug**: the end of a web address. The slug "about" makes the page live at yoursite.org/about.',
          '**Section** (or block): a stackable chunk of a page, like a photo row or a list of cards. You add, reorder, and remove them.',
          '**Reference**: a link from one document to another. A course points at its instructors and its term by referencing them, so you set a fact once and reuse it.',
          '**Alt text**: a short sentence describing a photo, read aloud to blind visitors and read by Google.',
        ],
      },
      { kind: 'seealso', items: ["Edit a page's words & photos", 'Add or edit a course', 'Do it yourself vs. call Nathan'] },
    ],
  },

  // 2 ----------------------------------------------------------------------
  {
    slug: 'edit-page',
    title: "Edit a page's words & photos",
    icon: EditIcon,
    lead: 'Change the words and photos on any existing page, like Home, About, or Courses.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', '(choose a page)'] },
      { kind: 'h', text: 'Make an edit' },
      {
        kind: 'steps',
        items: [
          'Open **Pages** and click the page you want, for example **About**.',
          'Fields are grouped into tabs at the top (Hero, the page copy, SEO, Page sections). Click a tab to find what you want.',
          'Change the text, or swap a photo.',
          'Re-read your change here to make sure it reads right.',
          'Click **Publish**. The website rebuilds and your change appears in a few minutes.',
        ],
      },
      { kind: 'h', text: 'The empty-box rule (friendly and important)' },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Empty is fine',
        text: 'Many text boxes are blank on purpose. When a box is empty, the website shows its built-in wording. Only type in a box when you want to change that wording. Leaving it blank is perfectly safe.',
      },
      { kind: 'h', text: 'A note on the course and faculty pages' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'These build themselves',
        text: 'The Courses page and the Faculty page lay out their cards automatically from the Catalog and Faculty lists. To change a course or a teacher, edit that course or that faculty member, not the page. The page fields only control the intro wording around the cards.',
      },
      { kind: 'seealso', items: ['Add or edit a course', 'Photos & images', 'Do it yourself vs. call Nathan'] },
    ],
  },

  // 3 ----------------------------------------------------------------------
  {
    slug: 'new-page',
    title: 'Build a brand-new page',
    icon: AddDocumentIcon,
    lead: 'Create a new page from scratch, like a reading group or a special campaign, without a designer.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', 'Custom Pages', 'New page'] },
      { kind: 'h', text: 'Build a page' },
      {
        kind: 'steps',
        items: [
          'Open **Pages**, then **Custom Pages**, then **+**.',
          'Give it a **Title**.',
          'Set the **Slug**, which is the web address. A slug of "reading-group" makes the page live at yoursite.org/reading-group.',
          'Add **Sections** to build the body (see the next guide).',
          'Publish. Your page is now live at its web address.',
        ],
      },
      { kind: 'h', text: 'Linking to your new page' },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'You can add it to the menu yourself',
        text: 'To put your new page in the top menu or the footer, see the guide Edit the top menu & footer.',
      },
      { kind: 'seealso', items: ['Edit the top menu & footer', 'Add & arrange sections'] },
    ],
  },

  // 4 ----------------------------------------------------------------------
  {
    slug: 'sections',
    title: 'Add & arrange sections',
    icon: BlockElementIcon,
    lead: 'Sections are the building blocks of a page. Mix and match them, reorder them, and set their backgrounds.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['(any page)', 'Page sections'] },
      { kind: 'h', text: 'Add a section' },
      {
        kind: 'steps',
        items: [
          'Open a page and find **Page sections**.',
          'Click **Add item** and choose a section type.',
          'Fill in its fields.',
          'Publish. The new section appears on the site after it rebuilds (a few minutes).',
        ],
      },
      { kind: 'h', text: 'The sections you can choose from' },
      {
        kind: 'bullets',
        items: [
          '**Text section**: headings and paragraphs.',
          '**Image + text**: a photo beside words.',
          '**Card grid** and **Feature cards**: a row of linked or highlighted boxes.',
          '**Quote / scripture**: a pulled quote or a verse.',
          '**Stats / numbers**: big numbers (years, courses taught, graduates).',
          '**Steps (numbered)**: a numbered how-it-works list.',
          '**FAQ / accordion**: expandable questions you write inline.',
          '**FAQ list (from collection)**: pulls questions from your FAQ Items, optionally for one category.',
          '**Photo gallery**: a grid of images.',
          '**Logos / partners**: partner or affiliation logos.',
          '**Media feature**: a large video or image beside text.',
          '**Arched showcase**: a single framed photo slideshow or a quiet looping video.',
          '**Call-to-action band**: a strip with a button (a call to action).',
          '**Form**: a contact or sign-up form.',
          '**Dynamic list**: automatically shows your **Featured courses**, **Upcoming events**, or **Faculty**. It keeps itself up to date.',
        ],
      },
      { kind: 'h', text: 'Reorder or remove' },
      {
        kind: 'steps',
        items: [
          'Drag a section by the dots on its left to move it.',
          'Click the three dots on a section and choose **Remove** to delete it.',
        ],
      },
      { kind: 'h', text: "Change a section's background" },
      { kind: 'p', text: 'Each section has a **Section background** control so it sits nicely on the page. Open it to find:' },
      {
        kind: 'bullets',
        items: [
          '**Color tone**: pick a brand mood. The choices are **Default (paper)**, **Warm**, **Chapel green**, and **Chapel deep**. The text color adjusts on its own to stay readable.',
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

  // 5 ---------------------------------------------------------------------- (editable nav)
  {
    slug: 'top-menu',
    title: 'Edit the top menu & footer',
    icon: MenuIcon,
    lead: 'Add, rename, reorder, or remove the links in the website header and footer, including dropdown menus.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Site Settings', 'Navigation (menus)'] },
      { kind: 'h', text: 'Add or change a menu link' },
      {
        kind: 'steps',
        items: [
          'Open **Site Settings** (top of the menu), then the **Navigation (menus)** tab.',
          'Under **Top menu links**, click **Add item**.',
          'Choose **Link** for a single page, or **Dropdown menu** to group several links under one label.',
          'For a link, type the **Label** (what people see) and the **Address** (a page on this site like /courses or /for-you, or a full web address).',
          'Drag items by the dots to reorder them. Use the three dots on an item to remove it.',
          'Click **Publish**. The header updates across the site.',
        ],
      },
      { kind: 'h', text: 'Build a dropdown menu' },
      {
        kind: 'steps',
        items: [
          'Add a **Dropdown menu** item and give it a **Menu label**, for example "About".',
          'Inside it, add a **Link** for each page in the dropdown.',
          'Publish.',
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
          'In the same **Navigation (menus)** tab, scroll to **Footer link columns**.',
          'Click **Add item**, choose **Column**, and give it a **Column heading**, for example "Study".',
          'Add a **Link** for each item in that column. Aim for three columns so the footer stays balanced.',
          'Publish. The "Get in touch" column (email, phone, social) is added for you automatically.',
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

  // 6 ---------------------------------------------------------------------
  {
    slug: 'photos',
    title: 'Photos & images',
    icon: ImageIcon,
    lead: 'How to upload, crop, and describe photos so they look sharp and work for everyone.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'Add a photo' },
      {
        kind: 'steps',
        items: [
          'Click an image field and either drag a photo in, upload one, or pick from the **Media** library.',
          'Set the **focal point** (the hotspot): click the spot that matters, like a face. The site keeps that spot in view when it crops the photo for phones and wide screens.',
          'Add **Alt text**: one short sentence describing the photo. Publish.',
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

  // 7 ---------------------------------------------------------------------
  {
    slug: 'courses',
    title: 'Add or edit a course',
    icon: BookIcon,
    lead: 'A course is the heart of the school. Here is how to add one, set when it runs, and put it on the home page.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Catalog', 'Courses', 'New course (the + button)'] },
      { kind: 'h', text: 'Before you start' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'A course points at three things',
        text: 'A course links to its **teaching area** (its subject), its **instructors** (the faculty who teach it), and its **term** (when it runs). If a teacher or a term does not exist yet, add it first: see Add a faculty member and Set up a term or cohort.',
      },
      { kind: 'h', text: 'Add a course (Details tab)' },
      {
        kind: 'steps',
        items: [
          'Open **Catalog**, then **Courses**, then **+**.',
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
          'Open the **Schedule & cohorts** tab and add an **Offering**.',
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
          'Open the **Pricing** tab and choose a **Price tier** (see Pricing & scholarships).',
          'If one course needs different wording, fill in the **Price note** override, like "$195, audit $95". When set, it shows instead of the tier amount.',
        ],
      },
      { kind: 'h', text: 'Feature it' },
      {
        kind: 'steps',
        items: [
          'Turn on **Featured** to pin the course to the top of the catalog and into the home page catalog preview.',
          'Turn on **Recommended starting course** to surface it in the "Start here" rail. Use this sparingly.',
          'Publish. The course now appears on the Courses page at its own web address.',
        ],
      },
      { kind: 'seealso', items: ['Add a faculty member', 'Set up a term or cohort', 'Pricing & scholarships'] },
    ],
  },

  // 8 ---------------------------------------------------------------------
  {
    slug: 'faculty',
    title: 'Add a faculty member',
    icon: UsersIcon,
    lead: 'A faculty profile is a short, warm CV that gives a course its weight. Here is what each field is for.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Faculty', 'New faculty member (the + button)'] },
      { kind: 'h', text: 'Identity' },
      {
        kind: 'steps',
        items: [
          'Open **Faculty** in the left menu, then **+**.',
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
          'Publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Courses taught fills itself',
        text: 'You do not list courses on a faculty profile. The site reads that from each course\'s **Instructors** field, so "Courses taught" stays correct on its own. To link a teacher to a course, open the course and add them there.',
      },
      { kind: 'seealso', items: ['Add or edit a course'] },
    ],
  },

  // 9 ---------------------------------------------------------------------
  {
    slug: 'terms',
    title: 'Set up a term or cohort',
    icon: ClockIcon,
    lead: 'A term holds the real dates for a season, like Fall 2026. Every course that runs then points at it, so dates live in one place.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Catalog', 'Terms', 'New term (the + button)'] },
      { kind: 'h', text: 'Add a term' },
      {
        kind: 'steps',
        items: [
          'Open **Catalog**, then **Terms**, then **+**.',
          'Write the **Term name**, like "Fall 2026" or "Spring 2027". The **Slug** fills in from it.',
          'Set **Term begins** (required). This is the date the site uses to work out which cohort is next.',
          'Set **Term ends**, **Registration opens**, and **Apply by** as you know them.',
          'Pick a **Status**: Upcoming, Registration open, In session, or Closed.',
          'Add a **Note** if helpful, like "Evening cohort, West Chester campus".',
          'Publish.',
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
        text: 'After the term exists, open the course, go to the **Schedule & cohorts** tab, add an **Offering**, and choose this term. See Add or edit a course.',
      },
      { kind: 'seealso', items: ['Add or edit a course'] },
    ],
  },

  // 10 --------------------------------------------------------------------
  {
    slug: 'pricing',
    title: 'Pricing & scholarships',
    icon: TagIcon,
    lead: 'Set up the named price levels every course can use, and edit the wording on the Pricing & Scholarships page.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Catalog', 'Pricing Tiers', 'New pricing tier (the + button)'] },
      { kind: 'h', text: 'Add or edit a price level' },
      {
        kind: 'steps',
        items: [
          'Open **Catalog**, then **Pricing Tiers**, then **+**.',
          'Write the **Tier name**, like "Per course", "Audit", or "Full certificate track".',
          'Set the **Amount (USD)**. Leave it blank to read as "Free".',
          'Pick the **Unit**: per course, per track, or per term.',
          'Write a one-line **Summary** of who the tier is for, and list **What it includes**.',
          'Turn on **Audit / listen-only tier** for the low-commitment option.',
          'Publish. Every tier shows on the Pricing & Scholarships page.',
        ],
      },
      { kind: 'h', text: 'How a tier connects to a course' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Set it on the course',
        text: 'On a course, the **Pricing** tab has a **Price tier** field. Choose one of these tiers there. If a single course needs different wording, the course\'s **Price note** override is shown instead of the tier amount.',
      },
      { kind: 'h', text: 'The Pricing & Scholarships page' },
      { kind: 'path', items: ['Pages', 'Pricing & Scholarships'] },
      {
        kind: 'p',
        text: 'The page lists your tiers automatically. To change the intro, the scholarship wording, or anything around the tiers, open **Pages**, then **Pricing & Scholarships**, and edit the text there. There is no checkout. These are express-interest prices.',
      },
      { kind: 'seealso', items: ['Add or edit a course'] },
    ],
  },

  // 11 --------------------------------------------------------------------
  {
    slug: 'testimonials',
    title: 'Add a testimonial',
    icon: CommentIcon,
    lead: 'A short quote from a student. Quote the kind of person you want to reach so a visitor sees themselves.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Content', 'Testimonials', 'New testimonial (the + button)'] },
      { kind: 'h', text: 'Add a quote' },
      {
        kind: 'steps',
        items: [
          'Open **Content**, then **Testimonials**, then **+**.',
          'Paste the **Quote**. Keep it short and about what changed for them.',
          'Add the **Name**.',
          'Add the **Role / occupation**, like "Ruling elder", "Sunday-school teacher", or "Small-group leader".',
          'Add the **City**.',
          'Optionally link the **Course completed** and add a **Photo** with alt text.',
          'Turn on **Featured** to pin it to the home page proof band.',
          'Publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Who you quote matters',
        text: 'Name a real role and city. A ruling elder in Lancaster reads very differently from a generic "happy student", and a visitor who shares that role is more likely to picture themselves here.',
      },
    ],
  },

  // 12 --------------------------------------------------------------------
  {
    slug: 'post-event',
    title: 'Post or edit an event',
    icon: CalendarIcon,
    lead: 'Add an info session, open lecture, workshop, or term start. Events show on the Events page automatically.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Events', 'New event (the + button)'] },
      { kind: 'h', text: 'Add an event' },
      {
        kind: 'steps',
        items: [
          'In the left menu, click **Events**, then the **+** button to start a new one.',
          'Fill in the **Event title**.',
          'Choose a **Type**: **Recurring** for something that repeats (a monthly info session) so it always shows, or **One-time** for a single date, which drops off the upcoming list once it passes.',
          'Pick a **Category** (Info session, Open lecture, Workshop, Webinar / Online, Term start, Application deadline, Community, or Other), and a **Who it is for** audience if you like.',
          'Set the **Schedule (display text)**, like "Saturday, June 27, 11am to 3pm" or "Third Tuesdays, 7pm". For a one-time event, also set the **Start date & time** so it sorts and drops off on its own.',
          'Add a short **Summary** for the list, and a longer **Full description** if there is more to say.',
          'If there is a sign-up, add the **Registration / RSVP link** and a button label. Add a **Cost** and a **Contact name and email** if people may have questions.',
          'Want it on the home page too? Turn on **Feature on the home page**.',
          'Click **Publish**. It now appears on the Events page (yoursite.org/events).',
        ],
      },
      { kind: 'h', text: 'Edit or cancel an event' },
      {
        kind: 'steps',
        items: [
          'Click **Events**, then click the event in the list.',
          'Change whatever you need, then click **Publish** again.',
          'To take it down, open it and choose **Unpublish** (keeps a saved copy) or **Delete** (removes it).',
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

  // 13 --------------------------------------------------------------------
  {
    slug: 'announcements',
    title: 'Announcement banners',
    icon: BellIcon,
    lead: 'The slim banner at the very top of every page. Use it for short, timely notices.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Content', 'Announcements', 'New announcement'] },
      { kind: 'h', text: 'Put up an announcement' },
      {
        kind: 'steps',
        items: [
          'Open **Content**, then **Announcements**, then **+**.',
          'Type your **Message**. Keep it to one short line.',
          'Add a **Link** if people should click through (optional). A good use: "Fall registration is open" pointing at /courses.',
          'Pick a **Style**: Info for normal notices, Special for good news, Urgent for closings or weather.',
          'Set a **Start** and **End** date so it appears and disappears on its own.',
          'Turn on **Enabled** and click **Publish**.',
        ],
      },
      { kind: 'h', text: 'Take it down' },
      {
        kind: 'steps',
        items: ['Open the announcement, turn **Enabled** off (or set the **End** date to today), and Publish.'],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Only one shows at a time',
        text: 'If several are enabled, the site shows the current one based on the dates. You do not have to delete old announcements, just disable them.',
      },
    ],
  },

  // 14 --------------------------------------------------------------------
  {
    slug: 'faqs',
    title: 'Add or edit an FAQ',
    icon: HelpCircleIcon,
    lead: 'The questions and answers on the FAQ page. Add new ones, edit answers, and control the order.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Content', 'FAQ Items', 'New FAQ item'] },
      { kind: 'h', text: 'Add a question' },
      {
        kind: 'steps',
        items: [
          'Open **Content**, then **FAQ Items**, then **+**.',
          'Write the **Question** the way a visitor would actually ask it.',
          'Write the **Answer**. You can use **bold**, links, and lists.',
          'Choose a **Category** (for example Admissions, Courses, Cost & scholarships, Schedule).',
          'Set a **Display order** number. Lower numbers show first within the category.',
          'Publish. It appears on the FAQ page, grouped under its category.',
        ],
      },
      { kind: 'h', text: 'Change the order of the categories' },
      { kind: 'path', items: ['Pages', 'FAQ', 'Category order'] },
      {
        kind: 'steps',
        items: ['Open **Pages**, then **FAQ**, and find **Category order**.', 'Drag the categories into the order you want. Publish.'],
      },
      {
        kind: 'callout',
        tone: 'primary',
        text: 'A category only appears on the page when at least one question uses it. Empty categories never show.',
      },
    ],
  },

  // 15 --------------------------------------------------------------------
  {
    slug: 'brand',
    title: 'The brand: colors & fonts',
    icon: ColorWheelIcon,
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
        text: 'When you set a section background, you pick a **tone** (Default (paper), Warm, Chapel green, or Chapel deep), not a color code. Each tone already knows the right text color to stay readable. That is why you cannot pick a random color, and why you do not need to.',
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

  // 16 --------------------------------------------------------------------
  {
    slug: 'diy-vs-nathan',
    title: 'Do it yourself vs. call Nathan',
    icon: InfoOutlineIcon,
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
          'Add testimonials.',
          'Post and edit events.',
          'Add and edit FAQs.',
          'Put up and take down announcement banners.',
          'Add, reorder, and remove sections on a page.',
          'Build new Custom Pages.',
          'Add, rename, and reorder the top menu and footer links.',
          'Change section background tones and images.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'You cannot break the live site by editing',
        text: 'Remember, nothing is public until you publish. Explore freely.',
      },
      { kind: 'h', text: 'Bring these to Nathan' },
      {
        kind: 'bullets',
        items: [
          'Needing a new kind of field, or a new kind of section that does not exist yet.',
          'Web address changes, redirects, the domain, or email and DNS settings.',
          'Adding a new outside tool (a new registration, payment, or video embed).',
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
];
