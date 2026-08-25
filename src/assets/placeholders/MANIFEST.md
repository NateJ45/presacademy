# Placeholder media manifest

Open-license stand-in photography and video for The Presbyterian Academy. These are
**placeholders**: representative, license-clean, and safe to commit, but they should be
swapped for real Academy photography before any marketing push.

The church-era placeholder set that shipped with the original starter (the `teach-*`,
`study-*`, `place-*`, and `community-*` photos) was removed 2026-08-25 when the repo was
cut loose from the church starter. What remains is the academic `acad-*` set curated
2026-06 for the lay-school look.

## License

Every photo below is from **Pexels** under the [Pexels License](https://www.pexels.com/license/):
free for commercial and personal use, **no attribution required**, modification allowed.

Two standing restrictions of the Pexels License still apply even to placeholders, and both
matter here because many shots contain identifiable people:

1. Don't imply the depicted people endorse the Academy (fine for generic hero/section use,
   not for, say, a fake testimonial with a face attached).
2. Don't present the unaltered photo as your own stock to redistribute.

## Photos (14) — `src/assets/placeholders/`

Curated 2026-06 by `scripts/seed-academic-images.mjs` (see its `IMAGES` map for the
canonical alt text per photo). Per-photo Pexels source URLs were recorded in the
gitignored curation scratch (`scripts/_stock*`); re-recording them here is an open item
in `docs/PENDING.md`.

- `acad-campus-building.jpg` — a university building
- `acad-campus-quad.jpg` — a green campus quad
- `acad-campus-walk.jpg` — students walking across a university campus
- `acad-friends-talking.jpg` — three students talking together
- `acad-lecture-hall.jpg` — students in a lecture hall
- `acad-library-room.jpg` — a university library reading room
- `acad-markers-notebooks.jpg` — notebooks and markers laid out for study
- `acad-reading-together.jpg` — reading together at a table
- `acad-students-canal.jpg` — students walking along a canal
- `acad-study-overhead.jpg` — students working together over books and notes
- `acad-table-group.jpg` — a small group studying around a table
- `acad-woman-reading.jpg` — a student reading
- `acad-write-desk.jpg` — a desk set up for writing and study
- `acad-writing-notes.jpg` — taking notes by hand during study

Several static hero fallbacks import these directly (`404`, `contact`, `faq`,
`privacy`, `accessibility`, and the `[slug]` page-builder fallback).

## Video clips (2) — `public/placeholders/video/`

Served from `public/` so they can be referenced directly (e.g. a `<video>` hero
background). Nothing references them yet. The two church-themed clips were removed
2026-08-25.

| File | Size | Creator | Source |
|---|---|---|---|
| `teach-study-classmates.mp4` | 11 MB | Andy Barbour | https://www.pexels.com/video/classmates-studying-together-6672525/ |
| `study-group-discussion.mp4` | 24 MB | Monstera Production | https://www.pexels.com/video/group-of-students-having-a-discussion-6219675/ |

**Before shipping either as a hero background:** compress further. Even at these sizes
they're heavier than the Lighthouse budget wants for an autoplay background. With `ffmpeg`
installed, something like
`ffmpeg -i in.mp4 -vf scale=1280:-2 -c:v libx264 -crf 28 -an out.mp4` will cut them to a
few MB and strip the audio track (which a background loop doesn't need).

## Notes for wiring these in

- **Images** import through Astro's `<Image />` / `getImage()`. Astro converts them to
  WebP/AVIF at build, so the committed JPEGs are just the source.
- On the live site, the image for each section comes from **Sanity**, not these files.
  Use these as the inline `.astro` fallback art and/or seed them into the Sanity dataset,
  rather than treating them as the final live content.
