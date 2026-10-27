# The Studio plan: who edits, what they do, and where in the Studio

The Studio is the Academy's admin. This page lists the people who use it, the jobs they do
in a week, a month and a season, and which part of the Studio serves each one. When a job
changes or a new one appears, change this page, the Quick update forms in
`src/sanity/kit.config.ts` and the Site Guide (`src/sanity/guides/content.ts`) together.

Written 2026-10-19 for the "Studio complete" work (starter card 137); Phase B (the same day) wired
the tours, the extra Quick update jobs, the pictures and the videos. Plain words, no business
details: the repo is public.

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

| Job                                               | When                        | Studio surface                                                                                                                                                           | Phone? |
| ------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Answer enquiries and expressions of interest      | Every week, all year        | `Messages` tool; Home's This week ("Answer this week's messages", by hand)                                                                                               | Yes    |
| Remind people enrollment closes                   | Each enrollment week        | Quick update, **Remind people enrollment closes** (worded from the next term)                                                                                            | Yes    |
| Keep a notice up while enrollment is open         | Enrollment weeks            | Home's This week ("While enrollment is open, a notice says so", checked for you)                                                                                         | Yes    |
| Mark a course full, waitlisted or closed          | Enrollment weeks            | Quick update, **Mark a course full or waitlisted**; the offering's **Status** in the course for a per-term setting; This week ("Seats and waitlists are right", by hand) | Yes    |
| Cancel or move a class                            | In session, when it happens | Quick update, **Cancel or move a class** (red notice, comes down by itself)                                                                                              | Yes    |
| Add an info session or open lecture, with sign-up | Most weeks before a term    | Quick update, **Add an info session or event**; Home's This week checks one is coming                                                                                    | Yes    |
| Move an event, or change its place or link        | When plans change           | Quick update, **Change an event's time or place**                                                                                                                        | Yes    |
| Open or close enrollment for a term               | Start and end of enrollment | Quick update, **Open or close enrollment for a term** (the term's Status)                                                                                                | Yes    |
| Put up a general notice                           | As needed                   | Quick update, **Put up a notice**                                                                                                                                        | Yes    |
| Close the office for a day or a term break        | Holidays and breaks         | Quick update, **Change the office hours for a day** (a dated change in Site settings, drops off after; shows once the office hours by day are filled in)                 | Yes    |
| Take down notices that have ended                 | Weekly (mostly automatic)   | Notices take themselves down; This week and Checkup flag any left on                                                                                                     | Desk   |
| Check nothing needs fixing                        | Weekly                      | Home's fix-it list and the `Checkup` tool                                                                                                                                | Desk   |

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
`src/sanity/guides/shots.ts`); "Video" means a recorded clip (`src/sanity/guides/videos.ts`,
made as `docs/agent/studio-videos.md` says). None are recorded yet, so every Video cell reads as planned.

| Job                              | Guide (slug)                                   | Shot                                       | Video   |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------ | ------- |
| Answer messages                  | Read messages from the website (`messages`)    | No (real enquiries; never captured)        | No      |
| Quick updates in general         | Quick updates from your phone (`quick-update`) | `quick-update-tiles`                       | Yes     |
| Enrollment weeks, the reminder   | Enrollment season, week by week (`enrollment`) | `quick-update-reminder`                    | Yes     |
| Mark a course full or waitlisted | Mark a course full or waitlisted (`seats`)     | `seats-form`, `offering-status`            | Yes     |
| Cancel or move a class           | Cancel or move a class (`cancel-a-class`)      | Uses `quick-update-tiles` via Quick update | Yes     |
| Info session or event            | Post or edit an event (`post-event`)           | No                                         | Yes     |
| Notices                          | Announcement banners (`announcements`)         | No                                         | No      |
| Open a new term                  | Open a new term (`new-term`)                   | `new-term-tool`                            | Yes     |
| A term's dates and status        | Set up a term or cohort (`terms`)              | `term-editor`                              | No      |
| Add or edit a course             | Add or edit a course (`courses`)               | `offering-status`                          | No      |
| Close a term                     | Close a term (`end-of-term`)                   | No                                         | No      |
| Faculty, testimonials, questions | `faculty`, `testimonials`, `faqs`              | No                                         | No      |
| Pages, sections, saved sections  | `edit-page`, `sections`, `saved-sections`      | No                                         | Not yet |

"How to" chips (card 134, `GUIDE_FOR_FIELD`) sit beside the fields staff most often get
wrong: a course's offerings, cover code and question, price tier; a term's Apply by; an
event's type; and the search title and description.

## What Quick update covers now (card 137's job types)

Phase A could only create documents. Card 137 added jobs that edit one, link to a tool, show in
a season, and take a select field, so the weekly list above is now all a few taps on a phone.

| Tile                                          | Kind of job   | Notes                                                                               |
| --------------------------------------------- | ------------- | ----------------------------------------------------------------------------------- |
| Put up a notice                               | build         | One line, until a last day                                                          |
| Remind people enrollment closes               | build         | Worded from the next term and its Apply by date                                     |
| Mark a course full or waitlisted              | edit (pick)   | Sets **Seats right now** on the course; wins over the offering's status (see below) |
| Cancel or move a class                        | build         | A red notice that comes down by itself                                              |
| Add an info session or event                  | build         | The kind is a select (Info session, Open lecture, Workshop); a sign-up link         |
| Change an event's time or place               | edit (pick)   | Upcoming one-time events, newest first; start, place and sign-up link               |
| Open or close enrollment for a term           | edit (pick)   | The term's Status as a select; the notices and Apply by lines follow it             |
| Answer this week's messages                   | link          | Opens Messages, which keeps its own Replied marks                                   |
| Announce the holiday break (15 Nov to 10 Jan) | build, season | Only on screen in its season                                                        |
| Announce the summer break (1 May to 31 Aug)   | build, season | Only on screen in its season                                                        |

**Why "Seats right now" lives on the course.** An edit job writes top-level fields by a dot path,
and an offering is an item inside the course's `offerings` list, which a path cannot address. So
the course has two small fields of its own, `seatsNow` and `seatsNowNote`. When `seatsNow` is set
it wins over the next offering's `status` and `seatsNote` (`NEXT_OFFERING` in
`src/lib/queries.ts`, tested in `src/lib/seats-now.test.ts`); empty, the offering decides, so
the desk way still works. The cost is a value that stays until someone changes it, so the
Checkup lists every course with seats set by hand ("Courses with seats set by hand") and the
guide tells the administrator to set it back when a new term opens.

Not built, because no job type fits: uploading a course syllabus (an upload job needs one fixed
document, and a syllabus belongs to a course). Posting a notice for later is possible with the
schedule job but would ask for a title and an end date by hand, so Put up a notice stays the way.

## Tours, welcome and What's new

Data in `src/sanity/studio-tours.ts`, passed through `kit.config.ts`. A first-run tour of seven
stops (Home, This week, Quick update, Content, New term, Publish, Help), then "How this screen
works" tours for Home, Quick update, the Site Guide and New term (the New term button is in
`SetupWizard.tsx`). The welcome modal greets a new person once. What's new has two entries dated
2026-10-19 (Quick update does more; Tours and short videos), each starting its tour. Reset one
person's tour by clearing their `ncs-studio-kit:*` keys in the browser.

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
