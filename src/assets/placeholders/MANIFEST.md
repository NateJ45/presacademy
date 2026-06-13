# Placeholder media manifest

Open-license stand-in photography and video for The Presbyterian Academy, sourced to
replace the Second Presbyterian Church of Chicago imagery the starter shipped with.
These are **placeholders**: representative, license-clean, and safe to commit, but they
should be swapped for real Academy photography before a public launch.

**Staged, not wired in.** Images live in `src/assets/placeholders/`, video clips in
`public/placeholders/video/`. Nothing here is referenced by a page yet. The existing
`src/assets/hero-*.webp` and named-staff portraits are untouched, so the live site looks
exactly as it did until you point components at these files.

## License

Every asset below is from **Pexels** under the [Pexels License](https://www.pexels.com/license/):
free for commercial and personal use, **no attribution required**, modification allowed.
Creator names are recorded anyway as a courtesy and so you can credit if you choose.

Two standing restrictions of the Pexels License still apply even to placeholders, and both
matter here because many shots contain identifiable people:

1. Don't imply the depicted people endorse the Academy (fine for generic hero/section use,
   not for, say, a fake testimonial with a face attached).
2. Don't present the unaltered photo as your own stock to redistribute.

## Photos (20) — `src/assets/placeholders/`

Resized to web widths on download (1600px for people/detail shots, 1920px for architecture).
Total payload ~7 MB.

### Study and books (4)

| File | Creator | Source |
|---|---|---|
| `study-bible-open-outdoor.jpg` | Abdiel Hernandez | https://www.pexels.com/photo/an-open-bible-on-a-stump-6186376/ |
| `study-bibles-closeup.jpg` | Tara Winstead | https://www.pexels.com/photo/close-up-shot-of-two-bibles-on-white-textile-8383472/ |
| `study-bible-notebook.jpg` | Tara Winstead | https://www.pexels.com/photo/bibles-and-a-notebook-8383420/ |
| `study-bible-pencil-notes.jpg` | J. Mark | https://www.pexels.com/photo/pink-pencil-on-open-bible-page-and-pink-272337/ |

### Teaching and study groups (8) — the core "lay formation" imagery

| File | Creator | Source |
|---|---|---|
| `teach-bible-study-group.jpg` | israwmx | https://www.pexels.com/photo/people-holding-bibles-sitting-at-a-meeting-24023591/ |
| `teach-womens-bible-study.jpg` | Caleb Oquendo | https://www.pexels.com/photo/group-of-women-engaged-in-bible-study-session-34623525/ |
| `teach-group-reading-bibles.jpg` | RDNE Stock project | https://www.pexels.com/photo/people-sitting-together-inside-the-church-reading-bibles-8674206/ |
| `teach-intergenerational-study.jpg` | Prolific People | https://www.pexels.com/photo/intergenerational-women-s-bible-study-gathering-31968490/ |
| `teach-lecture-hall.jpg` | Yan Krukau | https://www.pexels.com/photo/professor-standing-in-a-lecture-hall-on-the-background-of-students-sitting-at-the-desks-8197557/ |
| `teach-seminar-discussion.jpg` | Kampus Production | https://www.pexels.com/photo/group-of-multiracial-students-having-seminar-with-teacher-5940832/ |
| `teach-class-discussion.jpg` | Yan Krukau | https://www.pexels.com/photo/a-class-having-a-discussion-8199134/ |
| `teach-adult-education-retirees.jpg` | Kampus Production | https://www.pexels.com/photo/retirees-enjoying-adult-education-7983565/ |

### Place / Reformed markers (5)

| File | Creator | Source |
|---|---|---|
| `place-church-exterior-stone.jpg` | Damilola Idowu | https://www.pexels.com/photo/historic-gothic-church-architecture-in-stafford-31888374/ |
| `place-church-tower.jpg` | Scientyj | https://www.pexels.com/photo/gothic-church-tower-against-cloudy-sky-33459296/ |
| `place-sanctuary-wooden-pews.jpg` | Dana Davis | https://www.pexels.com/photo/empty-church-with-wooden-pews-13980225/ |
| `place-church-aisle.jpg` | Iriser | https://www.pexels.com/photo/church-aisle-photo-750792/ |
| `place-sanctuary-interior-light.jpg` | Introspectivedsgn | https://www.pexels.com/photo/illuminated-interior-of-an-empty-church-17492042/ |

### Community and welcome (3)

| File | Creator | Source |
|---|---|---|
| `community-shared-meal.jpg` | fauxels | https://www.pexels.com/photo/group-of-people-eating-together-3184195/ |
| `community-outdoor-gathering.jpg` | Newmanphotographs | https://www.pexels.com/photo/people-during-an-outdoor-social-gathering-16934870/ |
| `community-welcome-pair.jpg` | cottonbro studio | https://www.pexels.com/photo/man-and-woman-smiling-at-the-camera-6568957/ |

## Video clips (4) — `public/placeholders/video/`

Served from `public/` so they can be referenced directly (e.g. a `<video>` hero background).
Total payload ~62 MB. The 4K originals of two other candidates were rejected as too heavy;
these four are the web-reasonable ones.

| File | Size | Creator | Source |
|---|---|---|---|
| `bible-candle.mp4` | 5 MB | Denis Gvozdov | https://www.pexels.com/video/candle-next-to-open-bible-10490303/ |
| `teach-study-classmates.mp4` | 11 MB | Andy Barbour | https://www.pexels.com/video/classmates-studying-together-6672525/ |
| `place-church-exterior-drone.mp4` | 22 MB | Michael Bradley | https://www.pexels.com/video/drone-footage-of-a-church-8787205/ |
| `study-group-discussion.mp4` | 24 MB | Monstera Production | https://www.pexels.com/video/group-of-students-having-a-discussion-6219675/ |

**Before shipping any of these as a hero background:** compress further. Even at these sizes
they're heavier than the Lighthouse budget wants for an autoplay background. With `ffmpeg`
installed, something like
`ffmpeg -i in.mp4 -vf scale=1280:-2 -c:v libx264 -crf 28 -an out.mp4` will cut them to a
few MB and strip the audio track (which a background loop doesn't need).

## Notes for wiring these in

- **Images** import through Astro's `<Image />` / `getImage()` like the existing
  `src/assets/hero-*.webp` files. Astro will convert them to WebP/AVIF at build, so the
  committed JPEGs are just the source.
- On a launched site, the live image for each section comes from **Sanity**, not these
  files. Use these as the inline `.astro` fallback art and/or seed them into the Sanity
  dataset, rather than treating them as the final live content.
- Subject mix is weighted toward adult study and teaching (12 of 20 photos, 2 of 4 clips),
  since the Academy is a lay-formation school rather than a worshiping congregation.
