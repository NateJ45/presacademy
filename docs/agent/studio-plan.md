# The Studio plan: who edits, what they do, and where in the Studio

The Studio is the Academy's admin. This page lists the people who use it, the jobs they do
in a week, a month and a season, and which part of the Studio serves each one. When a job
changes or a new one appears, change this page, the Quick update forms in
`src/sanity/kit.config.ts` and the Site Guide (`src/sanity/guides/content.ts`) together.

Written 2026-10-19 for the "Studio complete" work (starter card 137). Plain words, no
business details: the repo is public.

## Who edits

| Role                                  | Skill level                                           | Device                                        | What they touch                                                                        |
| ------------------------------------- | ----------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| School administrator (the main owner) | Confident with email and forms, not with web tools    | A desk most days; a phone for anything urgent | Everything below: messages, notices, events, terms, courses, seats                     |
| The director or dean                  | Occasional editor, reads more than writes             | Desk                                          | Course copy, faculty, About and the Home page, before a new term                       |
| Faculty                               | Rarely, if ever; they send words to the administrator | Phone                                         | Nothing directly. A class change reaches the website through the administrator's phone |
| The studio (web help)                 | Developer                                             | Desk                                          | Schema, look, menus that need structure, anything the guides mark "Ask for help"       |

Everyone but the studio gets the plain staff view (`staff` in `kit.config.ts` is empty, so any
non-administrator gets it).

## The school year

The Academy runs in terms (fall and spring cohorts). A term has four phases, set by the
term's **Status**, and the jobs change with them:

1. **Getting ready** (Upcoming): six to eight weeks before a term, the New term tool.
2. **Enrollment** (Registration open, until Apply by): the busiest weeks for the website.
3. **In session**: class changes, the next info night.
4. **Between terms** (Closed): close the old term, collect testimonials, plan the next.

## Weekly jobs

| Job                                               | When                        | Studio surface                                                                                                 | Phone? |
| ------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| Answer enquiries and expressions of interest      | Every week, all year        | `Messages` tool; Home's This week ("Answer this week's messages", by hand)                                     | Yes    |
| Remind people enrollment closes                   | Each enrollment week        | Quick update, **Remind people enrollment closes** (worded from the next term)                                  | Yes    |
| Keep a notice up while enrollment is open         | Enrollment weeks            | Home's This week ("While enrollment is open, a notice says so", checked for you)                               | Yes    |
| Mark a course full, waitlisted or closed          | Enrollment weeks            | Course editor, `Schedule & cohorts`, offering **Status**; This week ("Seats and waitlists are right", by hand) | Desk   |
| Cancel or move a class                            | In session, when it happens | Quick update, **Cancel or move a class** (red notice, comes down by itself)                                    | Yes    |
| Add an info session or open lecture, with sign-up | Most weeks before a term    | Quick update, **Add an info session or event**; Home's This week checks one is coming                          | Yes    |
| Put up a general notice                           | As needed                   | Quick update, **Put up a notice**                                                                              | Yes    |
| Take down notices that have ended                 | Weekly (mostly automatic)   | Notices take themselves down; This week and Checkup flag any left on                                           | Desk   |
| Check nothing needs fixing                        | Weekly                      | Home's fix-it list and the `Checkup` tool                                                                      | Desk   |

## Monthly jobs

| Job                                   | Studio surface                                       |
| ------------------------------------- | ---------------------------------------------------- |
| Add a testimonial from a past student | Notices, voices and questions, Testimonials          |
| Add or answer a common question       | Notices, voices and questions, Questions and answers |
| Add reading or a resource             | Pages, Resources (page builder)                      |
| Look at visitor numbers               | Home's Visitors card (once Cloudflare is connected)  |
| Tidy a page (Home, About, For you)    | Live preview, or the page in Pages                   |

## Seasonal jobs (each term)

| Job                                                     | Studio surface                                           |
| ------------------------------------------------------- | -------------------------------------------------------- |
| Open a new term: dates, status, Apply by                | `New term` tool, then Catalog, Terms                     |
| Point each running course at the new term (an offering) | `New term` step, then each course's `Schedule & cohorts` |
| Add a new course, with its cover and question           | Home's "Add a course" button; Catalog, Courses           |
| Add or update a faculty member                          | Faculty                                                  |
| Check pricing tiers and scholarships                    | Catalog, Pricing tiers; the Pricing page                 |
| Post the term-start event                               | `New term` step; Events                                  |
| Close the old term, keep its record                     | Catalog, Terms (Status: Closed)                          |
| Swap the Home page's seasonal sections                  | "Insert a saved section" (11 seasonal saved sections)    |

## Guides for each job

Every job above has a Site Guide. "Shot" means the guide carries a real capture (key in
`src/sanity/guides/shots.ts`); "Video" means a clip is scripted in `docs/agent/studio-videos.md`.

| Job                               | Guide (slug)                                   | Shot                                       | Video   |
| --------------------------------- | ---------------------------------------------- | ------------------------------------------ | ------- |
| Answer messages                   | Read messages from the website (`messages`)    | No (real enquiries; never captured)        | No      |
| Quick updates in general          | Quick updates from your phone (`quick-update`) | `quick-update-tiles`                       | Yes (1) |
| Enrollment weeks, seats, reminder | Enrollment season, week by week (`enrollment`) | `quick-update-reminder`                    | Yes (2) |
| Cancel or move a class            | Cancel or move a class (`cancel-a-class`)      | Uses `quick-update-tiles` via Quick update | Yes (3) |
| Info session or event             | Post or edit an event (`post-event`)           | No                                         | Yes (4) |
| Notices                           | Announcement banners (`announcements`)         | No                                         | No      |
| Open a new term                   | Open a new term (`new-term`)                   | `new-term-tool`                            | Yes (5) |
| A term's dates and status         | Set up a term or cohort (`terms`)              | `term-editor` (to capture)                 | No      |
| Add or edit a course; seats       | Add or edit a course (`courses`)               | `offering-status` (to capture)             | Yes (6) |
| Close a term                      | Close a term (`end-of-term`)                   | No                                         | No      |
| Faculty, testimonials, questions  | `faculty`, `testimonials`, `faqs`              | No                                         | No      |
| Pages, sections, saved sections   | `edit-page`, `sections`, `saved-sections`      | No                                         | Yes (7) |

"How to" chips (card 134, `GUIDE_FOR_FIELD`) sit beside the fields staff most often get
wrong: a course's offerings, cover code and question, price tier; a term's Apply by; an
event's type; and the search title and description.

## For card 137 (the shared tours, videos and job types)

- **A job type that changes an existing document.** Quick update can only CREATE a document
  (`QuickUpdateTool` calls `client.create`). "Mark a course full" needs a form that picks a
  course (a document-picker field kind), picks one of its offerings for the next term and sets
  its status (a `select` field kind with the schema's list), then patches it. Until then the
  job is a This week line plus the `enrollment` guide, and it is done at a desk.
- **A `select` field kind.** The event form's "Kind of event" is free text today; the builder
  falls back to Info session for anything else. A select with Info session, Open lecture and
  Workshop would remove the guesswork.
- **Tour steps and video scripts** are written as data in `src/sanity/guides/tours.ts` and
  `docs/agent/studio-videos.md`, ready to wire when 137 lands.

## Ideas, not built

- **Seat counts from enrollments.** If enrollments ever come through the site's own forms, the
  offering status could follow the count instead of being set by hand.
- **A term-phase Home.** Home's This week could change with the next term's Status: enrollment
  jobs only while Registration open, wrap-up jobs once it is Closed. Today the enrollment line
  ticks itself outside enrollment, and the seats line is by hand all year.
- **The email tools** (`src/sanity/mail/`, starter card 127) are in the repo but not wired. A
  term newsletter and info-night RSVPs would fit this owner well once mail is set up.
- **Faculty's own class-change link.** A private, one-purpose link a teacher could use to post
  "class moved" without a Studio account.
