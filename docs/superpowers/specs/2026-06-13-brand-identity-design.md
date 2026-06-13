# The Presbyterian Academy — Brand Identity Design Spec

- Date: 2026-06-13
- Status: Approved (visual direction). Pending user review of this spec, then an implementation plan.
- Scope: the visual brand (palette, typography, logo, imagery) and how it maps onto the `ncs-church-starter` design seam. The identity stamp (`npm run rebrand` config: name, domain, contact, etc.) is a separate input collected at planning time, not part of this spec.

## 1. Positioning

The Presbyterian Academy is a PC(USA) Reformed lay-formation school: accessible theological formation for adult lay leaders (18-65) in PC(USA) and adjacent Reformed denominations (ECO, EPC). The brand must read warm, plainspoken, invitational, pastoral, distinctly Reformed, and accessible (not stuffy or academic).

The four brand-tone targets the visual system must hit at once: warm + plainspoken, pastoral + invitational, distinctly Reformed, and credible.

## 2. Research basis

Ten Reformed-tradition institutions were studied (Princeton Theological Seminary, Reformed Theological Seminary, Westminster Seminary California, Calvin Theological Seminary, Union Presbyterian Seminary Leadership Institute, Austin Presbyterian Seminary, Davenant Hall, Ligonier Connect, BibleProject, ECO). Full captures live in the research workflow output.

Key findings:
- The genre formula is consistent: one deep, characterful color (navy or oxblood) on a warm cream/parchment ground, with a serif display over a humanist/geometric sans body.
- The warm-neutral base is what keeps the formula from reading cold (RTS's warm taupe over parchment, Westminster's cream panels).
- Logos split into defensive heraldry (RTS shield, Princeton crest) that reads "gated old institution," versus single warm symbols that double as meaning (Calvin's hand-and-heart, Union's flame, Ligonier's tree).
- White space: nobody fully occupies "as warm and plainspoken as ECO, as scholarly-credible as Calvin/Westminster." That is the lane for a lay school.

## 3. Brand decisions

### 3.1 Color palette — "Oxblood & Stone"

A warm-stone/cream foundation anchored by a deep confessional oxblood, with an aged-brass detail accent. The most historically Reformed of the directions considered, kept warm through stone-over-cream rather than authority-and-crest.

| Role | Name | Hex | Maps to `@theme` token |
|---|---|---|---|
| Primary accent / CTA / links | Geneva Oxblood | `#7A2A2C` | `--color-primary` |
| Link text / hover / deep accent | Oxblood Deep | `#5E2122` | `--color-primary-dark` |
| Body + heading ink | Walnut Ink | `#2A2521` | `--color-accent` |
| Dark surface ink | Walnut Deep | `#1E1A17` | `--color-accent-dark` |
| Borders, eyebrows | Cloister Stone | `#B7A99B` | `--color-secondary` |
| Warm neutral (sparingly) | Stone Deep | `#9C8E7E` | `--color-tertiary` |
| Page background | Stone Cream | `#F4EEE6` | `--color-bg` |
| Raised surface / alt section | Chalk | `#FCF9F4` | `--color-bg-soft` |
| Detail / hairline rules / small accents | Aged Brass | `#A87C3E` | `--color-gold` |
| Text on dark bands | Warm Cream | `#F1EAD9` | `--color-chapel-foreground` (kept) |
| Pure white | White | `#FFFFFF` | `--color-white-pure` (kept) |

Structural band color (the deep tone used for the utility bar, footer, and closing CTA, currently `--color-chapel` green): recommendation is to use a deep oxblood so the brand's signature color carries the big structural moments, the way RTS and Calvin do.

| Role | Name | Hex | Maps to token |
|---|---|---|---|
| Structural band (utility bar, footer, CTA) | Oxblood Deep | `#5E2122` | `--color-chapel` |
| Band base (deepest) | Oxblood Deepest | `#4A1B1C` | `--color-chapel-deep` |

The `--color-chapel*` token names are kept as-is (internal, referenced across components as `bg-chapel` etc.); only their values change. Optional rename to `--color-band*` is deferred to the implementation plan and is not required.

Alternative for the band, flagged for review: keep Walnut Ink (`#2A2521`) as the band so oxblood stays purely an accent. This is the more neutral, less brand-saturated option. See the open decision in section 8.

### 3.2 Typography — "Scholar's Desk"

Serif display over a humanist sans body: the genre's proven "serious but readable" signal, with warmer faces than the cool academic defaults. The humanist sans body is chosen deliberately for legibility across the functional text a learning platform carries (course catalogs, syllabi, forms, dashboards).

- Display: Fraunces (variable, optical sizing) via `@fontsource-variable/fraunces`
- Body: Source Sans 3 via `@fontsource-variable/source-sans-3`

Token changes in `src/styles/globals.css`:
- `--font-display: "Fraunces Variable", Georgia, "Times New Roman", serif;`
- `--font-body: "Source Sans 3 Variable", system-ui, -apple-system, "Segoe UI", sans-serif;` (note the fallback stack changes from serif to sans, since body is now a sans face)
- `@fontsource` `@import` lines at the top of the file swap from instrument-serif + newsreader to the two packages above.
- `--font-script` (Snell Roundhand) stays off by default; unchanged.

The fluid heading scale, tracking, and spacing tokens are unchanged.

Dependencies: `@fontsource-variable/fraunces` and `@fontsource-variable/source-sans-3` must be installed. Per CLAUDE.md, dependency installs are confirmed with the user before running. The current `@fontsource/instrument-serif` and `@fontsource-variable/newsreader` packages can be removed once nothing imports them.

### 3.3 Logo and favicon — "Plainspoken Wordmark"

Type-only mark; the name is the asset. The wordmark is set in Fraunces (weight 500), with the word "Presbyterian" carried in Geneva Oxblood (the system's existing one-word keyword-color device) and a thin Aged Brass hairline rule beneath. Cross-free and crest-free by deliberate choice.

- Header / footer wordmark: two stacked lines, "The Presbyterian" (with "Presbyterian" in oxblood) over "Academy", in `--font-display`. Single-line variant allowed where horizontal space permits.
- Favicon + apple-touch-icon: a "PA" monogram in Fraunces, Warm Cream (`#F1EAD9`) on Geneva Oxblood (`#7A2A2C`), rounded square. Regenerated as `public/favicon.png` and `public/apple-touch-icon.png`.
- OG default image (`public/og-default.png`): regenerated via `npm run og` after updating brand inputs in `scripts/generate-og-default.mjs`.

### 3.4 Imagery direction

Lead with warm, documentary photography of real adult learners and faculty: small groups around tables and open Bibles, a teacher mid-sentence, hands and books and coffee, candid not staged, soft natural daylight with a warm grade that sits on the stone-cream ground. Faculty shown as approachable, eye-level people. Ordinary 18-65 learners visible above the fold. Avoid the empty Gothic-stone-architecture and old-master-painting registers (read elite/intimidating). Illustration only sparingly. Real licensed photography is a pre-launch requirement; the starter's `src/assets/` images are placeholders not licensed for reuse.

## 4. Codebase surfaces to update (design seam)

1. `src/styles/globals.css` — `@theme` palette tokens (section 3.1), `--font-display` / `--font-body`, and the `@fontsource` `@import` lines. Also the shadcn `:root` / `.dark` semantic token values lower in the file, so shadcn primitives (buttons, cards, borders) inherit the new palette.
2. `src/data/site.ts` — every value in the `brandColors` mirror (primary, primaryDark, accent, accentDark, secondary, tertiary, bg, bgSoft, `border`, chapel, chapelDeep, gold), plus `wordmark.line1` / `wordmark.line2`. The `border` value (currently `#DED6C8`) becomes a warm stone border tint that matches the new palette. `name` and `domain` are stamped by `rebrand.mjs`.
3. `studio/sanity.config.ts` — `studioThemeProps` brand colors, `DISPLAY_STACK` / `BODY_STACK` font stacks, and the `StudioLayout` web-font link, so the Studio mirrors the site. Also `title` and `studioHost` (rebrand).
4. `scripts/generate-og-default.mjs` — brand color + font + wordmark inputs, then `npm run og`.
5. `public/favicon.png`, `public/apple-touch-icon.png` — regenerate as the PA monogram.
6. `Header.astro` / `Footer.astro` — confirm the wordmark renders as text with the oxblood keyword emphasis (not an image logo); adjust if needed.
7. `package.json` — add the two `@fontsource-variable` packages; remove the unused instrument-serif / newsreader packages.

## 5. Accessibility

- Walnut Ink `#2A2521` on Stone Cream `#F4EEE6`: about 13:1 (passes AAA).
- White on Geneva Oxblood `#7A2A2C`: about 7:1 (passes AA, near AAA for large text). Safe for button labels and small CTA text.
- Warm Cream `#F1EAD9` on Oxblood Deep `#5E2122`: high contrast, safe for band text.
- Aged Brass `#A87C3E` and Cloister Stone `#B7A99B` are mid-tones: use for hairline rules, borders, and large decorative elements only, never for body or small text on cream (they fail AA at text sizes).
- Build and verify in both light and dark mode (CLAUDE.md rule #3) and keep Lighthouse accessibility at 100.

## 6. Voice note

No em-dashes in any public-facing site copy produced under this brand (CLAUDE.md rule). The brand's specific voice and banned words live in `docs/brand/voice.md`; read it before writing site copy.

## 7. Out of scope here (collected at planning)

The rebrand identity stamp needs these facts before `npm run rebrand` can run. They are not brand-design decisions and will be gathered when we build the implementation plan:
- Full name (The Presbyterian Academy), short name, wordmark line break
- Domain
- City / mailing address
- General contact email, and any second (e.g. admissions) email
- Phone (if any)
- Worker name (already set: `presacademy`)
- Studio host (a globally unique `*.sanity.studio` subdomain, e.g. `presbyterian-academy`)

## 8. Resolved decisions

Structural band color (footer, utility bar, closing CTA): **deep oxblood** (`#5E2122`), confirmed at spec review. The brand's signature color carries the big structural moments, the way RTS and Calvin do. Walnut Ink was the considered alternative.
