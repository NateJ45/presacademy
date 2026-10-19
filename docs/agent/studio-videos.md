# Studio tutorial videos: scripts

Shot-by-shot scripts for the Academy's guide videos, ready for the tutorial-video pipeline
(starter card 137, ported from Theology Matters: Playwright against the LOCAL Studio with
sample data, captions burned in, mp4 and webm, each caption frame checked). Each finished clip
goes in `public/guides/<slug>.mp4` and is named in that guide's `video` field in
`src/sanity/guides/content.ts`; Home's "Watch how it is done" row then shows it.

Rules for every recording:

- **Sample data only**, never the live dataset and never a real person. Use the names below.
  Sample people: "Jordan Example" (a student), "Dr. Sample Teacher" (faculty). Sample courses:
  "Romans: The Gospel Unfolded" (code SCR 201), "Reading the Psalms" (SCR 110). Sample terms:
  "Spring 2027" (begins January 11, Apply by December 15), "Fall 2027".
- Phone clips at 390 x 844, desk clips at 1440 x 900, light appearance.
- Cover the account avatar and the greeting's name (the pipeline's mask step).
- Captions: one line, under 70 characters, US spelling, no em-dashes, on screen at least
  2.5 seconds. Pause on the result for 2 seconds before the clip ends.
- 30 to 75 seconds each. No music under captions that carry the instructions.

## 1. Quick updates from your phone (`quick-update`), phone, about 40 s

| #   | Shot                                                       | Caption                                        |
| --- | ---------------------------------------------------------- | ---------------------------------------------- |
| 1   | Home on a phone; tap the menu, then Quick update           | Quick update is for the jobs that cannot wait. |
| 2   | The four tiles, held still                                 | Four short forms, a few taps each.             |
| 3   | Tap "Put up a notice"; type "The office is closed Monday." | Type the notice in one or two sentences.       |
| 4   | The last-day picker opens; pick a date a week out          | Pick the last day. It comes down by itself.    |
| 5   | Tap the button; the Done card with Saved, then Building    | It is on the website in a few minutes.         |

## 2. Remind people enrollment closes (`enrollment`), phone, about 35 s

Sample data first: term "Spring 2027", Status Registration open, Apply by December 15.

| #   | Shot                                                                      | Caption                                                      |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | Home's This week, "While enrollment is open, a notice says so" not ticked | Home notices enrollment is open with no reminder up.         |
| 2   | Tap Open Quick update, then "Remind people enrollment closes"             | This one writes the words for you.                           |
| 3   | Both boxes left empty; scroll to the button                               | Leave both boxes empty to use the term's own dates.          |
| 4   | Tap "Put the reminder up"; Done card                                      | Done. It links to Get started and comes down after Apply by. |
| 5   | The site's header in a second tab, the notice in place                    | "Enrollment for Spring 2027 closes December 15."             |
| 6   | Back on Home, the line now ticked                                         | This week ticks itself.                                      |

## 3. Cancel or move a class (`cancel-a-class`), phone, about 35 s

| #   | Shot                                                | Caption                                                |
| --- | --------------------------------------------------- | ------------------------------------------------------ |
| 1   | Quick update, tap "Cancel or move a class"          | A class moved? Tell people in under a minute.          |
| 2   | Type "Tonight's Romans class meets online instead." | Say which class and what to do.                        |
| 3   | The date shows tomorrow; leave it                   | It comes down by itself after the day you pick.        |
| 4   | Tap the button; the Done card                       | It is on every page in a few minutes, in red.          |
| 5   | Hold on the Done card's line about email            | Then email the class: not everyone checks the website. |

## 4. Add an info session with a sign-up link (`post-event`), phone, about 45 s

| #   | Shot                                                              | Caption                                           |
| --- | ----------------------------------------------------------------- | ------------------------------------------------- |
| 1   | Quick update, tap "Add an info session or event"                  | An info night, an open lecture or a workshop.     |
| 2   | Type "Spring info night"; pick January 5, 7:00 pm                 | What it is called, and when it starts.            |
| 3   | Leave "Kind of event" and "Where" empty                           | Leave these empty for an info session on campus.  |
| 4   | Type a one-line summary                                           | One or two sentences about it.                    |
| 5   | Paste https://example.org/rsvp in "Sign-up link"                  | A sign-up link becomes a "Save your seat" button. |
| 6   | Tap the button; Done card; then the Events page with the new card | It is on the Events page in a few minutes.        |

## 5. Open a new term (`new-term`), desk, about 75 s

Sample data: "Fall 2026" Closed; no "Spring 2027" yet; two sample courses.

| #   | Shot                                                                     | Caption                                                      |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| 1   | Click New term in the top bar; the checklist, most steps "To do"         | New term lays out the start of every term, in order.         |
| 2   | Click "Create the new term"; type Spring 2027, January 11                | First the term: its name and the day it begins.              |
| 3   | Set Registration opens and Apply by (December 15); Status Upcoming       | Then when enrollment opens and closes.                       |
| 4   | Publish; back on New term, the first steps now green                     | Publish, and the checklist ticks itself.                     |
| 5   | Click "Point courses at the new term"; open "Romans"; Schedule & cohorts | Each course that runs gets an offering for the new term.     |
| 6   | Add item, choose Spring 2027, type "Tuesdays, 7 to 9pm, 8 weeks"         | Pick the term. The term holds the dates.                     |
| 7   | Publish; back on New term                                                | Do the same for each course, then post the term-start event. |
| 8   | Hold on the remaining steps                                              | You can stop halfway. It picks up where you left off.        |

## 6. Mark a course full (`courses`, section Schedule & cohorts), desk, about 40 s

| #   | Shot                                                                        | Caption                                                   |
| --- | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | Content, Catalog, Courses; click "Romans: The Gospel Unfolded"              | A course has filled. Open it.                             |
| 2   | Click the Schedule & cohorts tab                                            | Each term it runs in is an offering here.                 |
| 3   | Open the Spring 2027 offering; Status: Waitlist; Seats note "Waitlist only" | Set it to Waitlist, or Closed if it can take nobody else. |
| 4   | Publish; the course card on the site after the rebuild                      | The course card changes in a few minutes.                 |

## 7. Swap a seasonal section on Home (`saved-sections`), desk, about 60 s

| #   | Shot                                                           | Caption                                              |
| --- | -------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | Pages, Home; scroll to the sections                            | Home is built from sections, like blocks.            |
| 2   | Click "Insert a saved section"; pick the spring enrollment one | Saved sections are ready-made for each season.       |
| 3   | Choose "A copy"; drag it above the old one                     | A copy is yours to change. Drag it where it belongs. |
| 4   | Remove last season's section; Live preview                     | Take last season's out and look before you publish.  |
| 5   | Publish                                                        | Publish when it reads right.                         |
