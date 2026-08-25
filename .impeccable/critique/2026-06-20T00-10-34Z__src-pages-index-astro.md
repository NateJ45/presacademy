---
target: home page
total_score: 32
p0_count: 0
p1_count: 2
timestamp: 2026-06-20T00-10-34Z
slug: src-pages-index-astro
---
# Critique — Home page (`src/pages/index.astro`), The Presbyterian Academy

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Live "now enrolling" status + active nav states are good; little async to report |
| 2 | Match System / Real World | 4 | Plain, jargon-free language ("Browse courses", "Book a free intro"); on-voice |
| 3 | User Control and Freedom | 3 | Clear nav and exits; nothing traps the user |
| 4 | Consistency and Standards | 3 | Visual system is tight, but CTA wording drifts ("Request info" vs "Request information", "Free intro" vs "Book a free intro") |
| 5 | Error Prevention | 3 | No-form landing page; little to mis-enter |
| 6 | Recognition Rather Than Recall | 4 | Everything visible and labeled; no memory load |
| 7 | Flexibility and Efficiency | 3 | Multiple clear paths to convert; flat nav |
| 8 | Aesthetic and Minimalist Design | 3 | Strong system, but empty image wells + thin faculty strip read unfinished |
| 9 | Error Recovery | 3 | No error states on this page |
| 10 | Help and Documentation | 3 | FAQ + contact + free intro in footer; no contextual help needed |
| **Total** | | **32/40** | **Good** |

## Anti-Patterns Verdict

**LLM assessment:** Does NOT read as AI-generated. Committed, specific point of view (green-anchored bookish editorial: Fraunces over Source Sans 3, brass hairlines, a green eyebrow rubric, alternating near-white / white / deep-green bands). Passes the brand slop test: a visitor asks "how was this made," not "which AI made this." No gradient text, no glassmorphism, no hero-metric template, no identical icon-card grid.

**Deterministic scan:** `detect.mjs` on the home page + components (CourseCard, FacultyCard, FinalCta, Header) returned clean, zero findings (exit 0). The eyebrow-on-every-section pattern was not flagged because it carries the deliberate `.eyebrow` rubric (a named brand system), the sanctioned exception.

**Contrast:** the gold small-text "NEXT COHORT BEGINS" measures 6.9:1 (passes) because it uses a darkened `gold-ink` (#6E5128), not the hairline gold. No contrast failures found. Dark mode reads as the brand (warm near-black surfaces, cream text, green bands intentionally static). No browser overlay was injected; CLI detector was clean and all three renders (desktop light/dark + mobile) were reviewed directly.

## Overall Impression

A good, confident page that already looks designed, not generated. The single biggest opportunity is finishing the imagery: the system is doing its job, but several course cards and the entire faculty strip render empty or text-only, which makes a polished page look half-loaded. Fix the imagery and tighten the CTAs and this moves from "good" to "excellent."

## What's Working

1. A committed, coherent system. The green + brass + Fraunces/Source Sans language holds across every band, and the alternating near-white / white / deep-green rhythm structures the long page instead of leaving a uniform stack.
2. A hero that does its job. On-voice headline, and the inline "Next cohort begins September 8, 2026 · Fall 2026 · West Chester Township" gives a prospective learner the one decision-relevant fact most school sites bury.
3. Mobile is genuinely handled. Course cards compact to a thumbnail-and-text row, the hero image is constrained, stats fall to a 2x2. Reads as designed-for-mobile, not shrunk.

## Priority Issues

**[P1] Empty course-cover wells.** In "Learn something worth knowing," 3 of 4 cards render as flat gray rectangles (only "Reading the Bible as One Story" has a photo, reused from the Start-here rail). On an image-supported brand surface this reads as unfinished and undercuts the credibility the page is building.
- Fix: ship covers for every featured course, OR design a real empty-state for cover-less courses (a typographic cover using teaching-area + title on a brass-ruled panel) so a missing photo still looks intentional. De-duplicate: don't feature the same course in both Start-here and the catalog preview.
- Suggested command: /impeccable harden (cover empty-state) plus a Sanity content pass.

**[P1] The faculty strip underdelivers.** Faculty is a primary trust and conversion driver for this audience (prospective learners judge the faculty), but the strip renders as three thin text blocks with no portraits and a lot of empty space.
- Fix: add faculty portraits and give each card more presence (portrait + name + one credibility line). If portraits are missing in Sanity, that content gap is the first fix.
- Suggested command: /impeccable layout (rebalance) plus content.

**[P2] CTA proliferation dilutes the primary action.** "Request info" appears in the utility bar and again in the header row (twice in the header), the hero offers "Browse courses" + "Book a free intro," and labels drift ("Request info" vs "Request information," "Free intro" vs "Book a free intro"). Too many near-identical asks compete with each other.
- Fix: pick one primary verb and one secondary, use them consistently; drop the duplicate "Request info" from either the utility bar or the header row.
- Suggested command: /impeccable clarify (CTA wording + hierarchy).

**[P2] "Start here" leaves an empty third column.** The rail is a 3-column grid but only has 2 courses, so desktop shows an awkward gap.
- Fix: guarantee 3 start-here courses, or make the rail a 2-up layout when only two exist.
- Suggested command: /impeccable layout.

## Persona Red Flags

**Jordan (first-timer, no theology background):** Welcomed well (plain language, "for ordinary believers," clear wayfinding). But empty course covers and portrait-less faculty make the offer feel thin right where a newcomer is deciding whether these people are credible. The duplicated course also makes the catalog look smaller than it is.

**Casey (distracted mobile user):** Primary CTAs are reachable and the stack is clean, but "Request info / Free intro / Book a free intro / Browse courses" is four asks before the first scroll. One clear primary action would convert better on a phone.

## Minor Observations

- Wayfinding is numbered 01-04, but the four items are parallel entry points, not an ordered sequence; the numbers imply a path that isn't there.
- The eyebrow rubric appears on every section. It is the documented signature and the detector passed it, but six in a row is a lot; consider dropping it on one or two sections for rhythm.
- The hero photo (a tree on a lawn) is pleasant but generic; people learning, or the actual meeting space, would carry more of the "in person, in cohorts" promise.

## Questions to Consider

- What would the faculty strip look like if it were the most convincing section on the page, not the thinnest?
- If you could keep only one call to action above the fold, which is it, and does the layout make that one obviously primary?
- Do the course cards need photos, or a cover system so good a missing photo never shows?
