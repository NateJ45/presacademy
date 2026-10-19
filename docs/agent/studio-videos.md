# Studio tutorial videos

**Status (2026-10-19): all six clips are recorded** (sample data, with the music track kept outside the repo), registered in `src/sanity/guides/videos.ts`, and named by the guides in the table (the enrollment reminder clip sits in the New term guide as a clip block). Re-record one with the commands below. If port 4321 is taken by another site's server, pass `--base http://localhost:<port>/kit-harness/studio` (the sample data module answers Sanity's other calls itself, so any port loads).

Six short clips show the jobs people ask about most. Each one is a "Watch how it is done" button
on its guide and a card in Home's row. They are recorded by script, not by hand, so they can be
made again when the Studio changes.

| Key                   | Guide (slug)                                   | Screen | What it shows                                             |
| --------------------- | ---------------------------------------------- | ------ | --------------------------------------------------------- |
| `quick-updates`       | Quick updates from your phone (`quick-update`) | Phone  | The tiles, then a notice from the first tap to the button |
| `mark-course-full`    | Mark a course full or waitlisted (`seats`)     | Phone  | Pick the course, choose Waitlist, add a note              |
| `enrollment-reminder` | Enrollment season (`enrollment`)               | Phone  | The reminder that words itself from the next term         |
| `cancel-a-class`      | Cancel or move a class (`cancel-a-class`)      | Phone  | A red notice that comes down by itself                    |
| `add-info-session`    | Post or edit an event (`post-event`)           | Phone  | An info night with a sign-up link                         |
| `new-term`            | Open a new term (`new-term`)                   | Desk   | The New term checklist                                    |

Still to script, if they are asked for: Swap a seasonal section on Home (`saved-sections`) and
Mark a course full at a desk (the offering inside the course). Both need the editors, which the
sample data below can open but which have more to get wrong on screen.

## How a clip is made

The scripts are `tools/tutorial-videos/scripts/<key>.json`, written by
`tools/tutorial-videos/make-scripts.mjs` (edit that, not the JSON). A script is a list of steps
(go to a screen, ring a control, type, press a key) with a caption on most of them. The recorder
(`tools/tutorial-videos/record.mjs`, from the starter) plays it in a browser against the LOCAL
Studio, records the screen, trims the Studio's boot, writes an mp4 and a webm, the captions as a
`.vtt` file and a poster.

Every write to Sanity is refused while recording, so a script ends with a ring on the last
button and never presses it.

**Sample data.** The Academy's real dataset holds only its pages, so there is nothing to show in
Quick update or the editors, and a clip must never carry a real person. Run the scripts with the
sample-data module preloaded: `tools/studio-media/sample-data.mjs` answers the Studio's reads
from `tools/studio-media/sample-data.json` (an invented teacher, three courses, two terms, two
events and a notice) and nothing is sent to Sanity for them. Edit that JSON to change what a
clip shows.

```
node --import ./tools/studio-media/sample-data.mjs tools/tutorial-videos/record.mjs \
     tools/tutorial-videos/scripts/<key>.json --serve --music <the track, outside the repo>
node tools/tutorial-videos/checkframes.mjs <key>
```

On Nathan's PC wrap the recorder in the machine build lock, one recording at a time. The music
is `C:\Users\natha\Documents\Claude\Projects\_assets\video-music\playerzero-flow.mp3`: a quiet bed
under the captions, never committed (the repo is public; `*.mp3` under `tools/` is git-ignored).

`checkframes.mjs` tiles one frame per caption into `tools/tutorial-videos/chk/`: look at every
one. The caption must match the screen, and no name or avatar may show. Then paste the entry the
recorder printed into `src/sanity/guides/videos.ts`, and name the key in the guide's `video`.

## Rules for every clip

- Sample data only, never the live dataset and never a real person.
- Captions: plain, second person, US spelling, no em-dashes, at most two short lines.
- 30 to 75 seconds. Phone clips are 390 by 844, the desk clip 1280 by 800, light appearance.
- Re-record a clip when its screen changes: a new tile, a renamed button, a new field.

## Pictures

`tools/guide-shots/capture.mjs` makes the Site Guide's screenshots the same way, from
`tools/guide-shots/shots.json` (desk) and `phone.json` (a narrow screen), with the same sample
data. It prints the entry for `src/sanity/guides/shots.ts`; write the alt text yourself.

```
node --import ./tools/studio-media/sample-data.mjs tools/guide-shots/capture.mjs --serve
node --import ./tools/studio-media/sample-data.mjs tools/guide-shots/capture.mjs --config tools/guide-shots/phone.json --serve
```
