# The Presbyterian Academy — Design Language "Rule & Ledger" (Phase 3)

- Date: 2026-06-13
- Status: PROPOSED. Pending user approval (with mockups) before Phase 4 build.
- Source: research `docs/research/2026-06-13-lay-school-ia-patterns.md`, content model `docs/superpowers/specs/2026-06-13-lay-school-ia-content-model.md`.
- Constraint: brand tokens are LOCKED. Oxblood & Stone palette and Fraunces + Source Sans 3 are unchanged. This document is purely the structural/section language and how it diverges from the church starter while staying inside those tokens.

## 1. Concept

Where the church build evoked a sanctuary (Romanesque round arches, devotional oxblood "chapel" bands, a triple-arch ornament), the Academy evokes a beautifully printed **course bulletin / academic catalog**: the register of a long-standing teaching institution, kept warm and plainspoken for ordinary adults. The structural signature flips from the round arch to **the rule and the ledger** — thin printed lines, tabular fact blocks, index numbering, and an editorial hanging-label grid. Square replaces round. The line replaces the ornament. The catalog entry replaces the devotional band.

This reads as competent, modern, and long-standing (the brief's target), and it is the natural home for the new spine: a browsable catalog of courses + faculty CVs.

## 2. Divergence map (church move -> school move)

| Church starter move | "Rule & Ledger" school move |
|---|---|
| Romanesque `.arch-top` image crowns (big round radius) | Squared image wells with a thin brass top-rule (radius ~2px) |
| Triple-arch `ArchOrnament` reflective mark | The index numeral ("Course 03 / 12", "Session 04") + a full-width hairline rule |
| Oxblood "chapel" devotional full-bleed bands everywhere | A ruled **facts ledger** for data; oxblood reserved for one sparing **colophon** CTA band |
| 12px gold hairline stub under each eyebrow | A full-width 1px rule under the section label (a printed section divider) |
| One-word keyword color flourish in headlines | Index numerals + tabular labels carry the rhythm; oxblood stays as link/CTA/ink |
| Alternating arched image-side sections | An editorial hanging-label column grid (label left, content right) + ledger blocks |
| Ken Burns hero photo zoom | A calm, documentary photo with a structured headline block; rules draw in on load |

The church identity lives in five tight code spots (the `--arch-radius` + `.arch-top` utilities, the `chapel` band tokens + `surface-chapel`, `ArchOrnament.astro`, the keyword split, the eyebrow->gold-hairline->serif heading). Replacing those five with the moves below sheds the sanctuary read while keeping every brand token.

## 3. The five signature moves

1. **The Rule.** A 1px hairline (brass `--color-gold` on cream, or walnut ink at low opacity) is the structural connective tissue: full-width section dividers, card top-rules, table rules, the ledger grid. Squared corners throughout. This is the hard break from the arch's round crown.
2. **The Index numeral.** Courses, sessions, and catalog entries carry a small tabular index label set in Fraunces lining figures or Source Sans with wide tracking ("Course 03 / 12", "No. 07", "Session 04"). The catalog/index device that signals "a structured curriculum," replacing the keyword-color flourish as the signature small detail.
3. **The Facts Ledger.** A bordered, ruled, tabular block (a syllabus header / catalog entry) presenting course facts in labeled cells: Term, Begins, Schedule, Sessions, Format, Tuition, Apply by, Seats. The single most "school" component; it appears on every course and, compactly, on every course card. It replaces the oxblood service-times band as the page's authoritative-facts moment.
4. **The Editorial hanging-label grid.** Sections lead with a small uppercase tracked label in a left/hanging column and a Fraunces headline + content in the main column, on a visible baseline rhythm. Generous negative space, asymmetry from the label column, not from alternating photos.
5. **The Colophon band (sparing).** Keep one deep-oxblood band, reframed as a printer's colophon / institutional seal at the page close (the CTA) and the footer, squared and ruled, with the brass rule and an index/established line ("Established 20XX, West Chester, Ohio"). Oxblood is otherwise an ink, not a wash.

## 4. Type (within locked Fraunces + Source Sans 3)

- **Fraunces** display: headlines weight 400, tight tracking; used also for the large index numerals and the tabular ledger values (lining figures). Italic Fraunces is the approved "moment" device for course one-liners and faculty pull-quotes.
- **Source Sans 3** body: all functional text (catalog, ledger labels, forms). Labels/eyebrows are uppercase, tracked `0.16-0.18em`, small, muted ink. This carries the "printed catalog" voice.
- Scale unchanged (the fluid `text-h1..h6` tokens). New emphasis on a **baseline rhythm** and **tabular alignment** in the ledger.
- Keep the `font-script` calligraphic accent OFF (it stays off by default; a school is not calligraphic).

## 5. Color (within locked Oxblood & Stone)

- **Stone Cream** paper is the dominant ground; **Chalk** for alternating bands. Keep the 4% paper grain.
- **Walnut Ink** for text; **Aged Brass** for the rules and the index numerals' underlines; **Geneva Oxblood** for links, CTAs, tags, and the colophon band only.
- Retire the habit of full-bleed `bg-chapel` devotional bands mid-page. Oxblood appears as: CTA pills, link/keyword ink, small tags, and ONE colophon CTA + the footer. Brass does the structural line-work the arch/ornament used to do.
- Both themes required. Dark mode: walnut-deep paper, warm-cream text, lifted oxblood (`#C16A5A`) for CTAs/links, brass rules at low opacity. The colophon band stays oxblood in both themes (a static brand moment, as the chapel band was).

## 6. Section archetype library

The buildable kit (Phase 4 components), all squared + ruled:
- **Hero** — documentary photo well (squared, brass top-rule) beside a structured headline block: small label, Fraunces headline, one-line lede, dual CTA, and a thin "Next cohort begins ..." ledger line. No keyword color, no arch, no Ken Burns.
- **Wayfinding ledger** — a 3-4 cell ruled row (Take a course / Meet the teachers / Find your path / Start free), each cell an index numeral + label + one line + arrow link.
- **Course card** — squared cover well + brass top-rule, "Course NN" index, Fraunces title, instructor at equal weight, a compact 2-3 fact ledger chip (term, sessions, format), a status tag, hover lift + rule turns oxblood.
- **Course catalog** — left filter rail (Topic, Teacher with counts, Term, "has upcoming term" toggle) + a card grid; a pinned "Start here" entry above the grid; a ruled result-count header.
- **Course-detail facts ledger** — the full bordered ledger (Term, Begins, Schedule, Sessions, Format, Venue, Tuition, Apply by, Seats) + overview + "Who this is for" persona lines + a **numbered session list** (No. / title / focus, ruled rows) + instructor credibility block + dual CTA top and bottom + a quiet "Visit the first session free" line.
- **Faculty card** — squared uniform portrait, honorific + name (Fraunces), the **degree-with-institution line directly under the name**, ordination tag, teaching-area tags. Text-forward, ledger-like.
- **Faculty directory** — a ruled list/grid filterable by teaching area, with an aggregate trust line at the top.
- **Faculty bio** — CV layout: header (portrait, name, degree line, ordination, areas), narrative bio + one warm human line, a ruled "Degrees" ledger, "Affiliations," "Selected publications," and derived "Courses taught" tiles.
- **Testimonials** — ledger-style quote blocks: Fraunces italic quote, then a ruled attribution row (name / role / city / course). No stars, no cards floating in space.
- **Pricing table** — a ruled tariff table (tier / what's included / price), plainly stated, with a scholarship note block beneath.
- **Persona cards (For You)** — squared ruled cards, each a persona label + one-line promise + single CTA.
- **Get Started** — the express-interest form (ruled fields) beside a Calendly intro panel and a "visit a class" + syllabus-download note.
- **Colophon CTA + footer** — the sparing oxblood band: established line, Reformed/PC(USA) statement, dual CTA, ruled footer columns.

## 7. Motion (within the locked restrained, CSS-only system)

- **Rule-draw:** section-divider and card top-rules animate `transform: scaleX(0->1)` from the left on reveal. The signature motion.
- **Settle-in:** content reveals as small staggered fades/translates (`[data-reveal]`, `[data-stagger-grid]`), ledger cells settle in sequence.
- **Hover:** card lift + the brass top-rule turns oxblood; link rules underline-grow. CTAs keep `.press-tactile`.
- Remove the hero Ken Burns zoom (church-devotional). Keep durations within the existing 440ms system; honor `prefers-reduced-motion`; animate transform/opacity only (zero CLS); defend Lighthouse 100s.

## 8. Implementation notes (Phase 4)

- Add a near-zero corner token (e.g. `--radius-edge: 2px`) and brass rule utilities; retire `--arch-radius`, `.arch-top`/`.arch-top-sm`, `ArchOrnament.astro`, `ArchMedia`'s arch dependence, and `surface-chapel`'s mid-page use (keep one colophon variant). Reuse the existing `SectionHeading` (swap the gold-stub for a full rule + optional index), `card-lift`, `press-tactile`, `[data-reveal]`, the paper grain.
- New/changed components map to the §6 archetypes; most can be composed from the existing block library + shadcn primitives (Card, Separator, Accordion, the table primitives) per the component-sources cheat sheet, with the token remaps.
- Verify both themes and both viewports; keep desktop nav server-rendered; keep Lenis + reveal observers.

## 9. Mockups

Static, token-faithful mockups of the key surfaces live in `docs/superpowers/mockups/` (home, course catalog, course detail, faculty). Screenshots attached in the Phase 3 review for approval.
