<!-- The project's definition of done. Delete a line only if it genuinely does not apply. -->

## What & why

<!-- One or two sentences: what this changes and why. -->

## Definition of done

- [ ] CI is green (build, Sanity-types freshness, lint, tests)
- [ ] If a Sanity **schema** changed: ran `npm run typegen`, committed `src/lib/sanity.types.ts`, and ran `npm run studio:deploy`
- [ ] Verified in the browser in **both themes** (light + dark) and **both viewports** (mobile ~375px + desktop ~1280px)
- [ ] Lighthouse on the changed pages still holds the 100s (no regression)
- [ ] No em-dashes in public-facing site copy; none of the banned AI-tell phrases
- [ ] Content stays editable in Sanity where it should be (no new hardcoded live copy)
- [ ] Docs updated (`CLAUDE.md` / `docs/agent/*` / `OPERATIONS.md`) if architecture or workflow changed

## Screenshots

<!-- Both themes + both viewports for any visual change. -->
