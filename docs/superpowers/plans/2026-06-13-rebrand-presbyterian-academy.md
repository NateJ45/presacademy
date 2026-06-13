# The Presbyterian Academy Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the `ncs-church-starter` clone into The Presbyterian Academy: stamp the identity, apply the Oxblood & Stone palette and the Fraunces + Source Sans 3 type system, set the plainspoken wordmark and PA-monogram favicon, mirror it in Sanity Studio, and verify in both themes and viewports.

**Architecture:** Two independent layers. (1) The identity stamp is a mechanical find-replace via `scripts/rebrand.mjs` driven by `bootstrap.config.json`. (2) The design seam (color tokens, fonts, wordmark, favicon, OG, Studio theme) is hand-edited. The site is statically prerendered, so every change is verified with `npm run build` plus a visual pass in light and dark at mobile and desktop widths.

**Tech Stack:** Astro 6, Tailwind 4 `@theme` tokens, shadcn `:root`/`.dark` CSS variables, `@fontsource-variable` fonts, Sanity v5 Studio, `sharp` for image generation.

**Source spec:** `docs/superpowers/specs/2026-06-13-brand-identity-design.md`

**Approved values:**
- Palette: Stone Cream `#F4EEE6`, Chalk `#FCF9F4`, Walnut Ink `#2A2521`, Walnut Deep `#1E1A17`, Geneva Oxblood `#7A2A2C`, Oxblood Deep `#5E2122`, Oxblood Deepest `#4A1B1C`, Cloister Stone `#B7A99B`, Stone Deep `#9C8E7E`, Aged Brass `#A87C3E`, Warm Cream `#F1EAD9`.
- Type: Fraunces (display) + Source Sans 3 (body).
- Logo: plainspoken wordmark, "The Presbyterian" (final word in oxblood) / "Academy"; favicon = PA monogram, cream on oxblood.
- Structural bands (utility bar, footer, CTA): deep oxblood.

---

## Rebrand config facts (for Task 3)

| Field | Value |
|---|---|
| churchName | The Presbyterian Academy |
| shortName | The Presbyterian Academy |
| wordmarkLine2 | Academy |
| domain | presbyterianacademy.org |
| workerName | presacademy |
| studioHost | presbyterian-academy |
| city | West Chester Township |
| addressLine | 9463 Cincinnati Columbus Rd |
| cityStateZip | West Chester Township, OH 45069 |
| email | info@presbyterianacademy.org |
| pastorEmail | pastor@example.org |
| phone | (513) 555-0100 |

The phone is a reserved fictional placeholder (the `555-01xx` range never dials a real line). Live phone stays empty in Sanity until a real one exists; that is handled at content-seed time, out of scope for this plan.

---

### Task 1: Create the rebrand branch

**Files:** none (git only)

- [ ] **Step 1: Branch off main**

```bash
git checkout -b rebrand/presbyterian-academy
git status -sb
```
Expected: `## rebrand/presbyterian-academy`, clean tree.

---

### Task 2: Swap the fonts

**Files:**
- Modify: `package.json` (dependencies)
- Modify: `src/styles/globals.css:9-12` (font `@import`s) and `:54-55` (font tokens)

- [ ] **Step 1: Confirm the dependency install with the user, then install**

Per CLAUDE.md, pause for confirmation before installing dependencies. Once confirmed:

```bash
npm install @fontsource-variable/fraunces @fontsource-variable/source-sans-3
```
Expected: both packages added under `node_modules/@fontsource-variable/`.

- [ ] **Step 2: Replace the font `@import` lines in `src/styles/globals.css`**

Replace lines 9-12 (the instrument-serif + newsreader imports) with:

```css
@import "@fontsource-variable/fraunces";
@import "@fontsource-variable/fraunces/standard-italic.css";
@import "@fontsource-variable/source-sans-3";
```

- [ ] **Step 3: Update the font tokens in the `@theme` block (lines 54-55)**

```css
  --font-display: "Fraunces Variable", Georgia, "Times New Roman", serif;
  --font-body:    "Source Sans 3 Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
```

- [ ] **Step 4: Remove the now-unused font dependencies (only if nothing imports them)**

```bash
git grep -n "instrument-serif\|newsreader\|libre-baskerville\|fontsource-variable/inter"
```
For each package with no remaining `@import`, remove it from `package.json` dependencies: `@fontsource/instrument-serif`, `@fontsource-variable/newsreader`, `@fontsource/libre-baskerville`, `@fontsource-variable/inter`. Keep any that still have a hit. Then `npm install` to refresh the lockfile.

- [ ] **Step 5: Verify the build and the rendered fonts**

```bash
npm run build
```
Expected: build succeeds. Then `npm run dev`, open `http://localhost:4321` with the Playwright MCP, and confirm headings render in Fraunces and body in Source Sans 3 (no serif body, no FOUT crash). No console errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/styles/globals.css
git commit -m "feat(brand): swap type to Fraunces + Source Sans 3"
```

---

### Task 3: Stamp the identity

**Files:**
- Create: `bootstrap.config.json`
- Modify (via script): many files across `src/`, `studio/`, `docs/`, `scripts/`
- Modify (manual fix): `src/data/site.ts` wordmark

- [ ] **Step 1: Write `bootstrap.config.json`**

```json
{
  "churchName": "The Presbyterian Academy",
  "shortName": "The Presbyterian Academy",
  "wordmarkLine2": "Academy",
  "domain": "presbyterianacademy.org",
  "workerName": "presacademy",
  "studioHost": "presbyterian-academy",
  "city": "West Chester Township",
  "addressLine": "9463 Cincinnati Columbus Rd",
  "cityStateZip": "West Chester Township, OH 45069",
  "email": "info@presbyterianacademy.org",
  "pastorEmail": "pastor@example.org",
  "phone": "(513) 555-0100"
}
```

- [ ] **Step 2: Run rebrand in CHECK mode**

```bash
npm run rebrand
```
Expected: ends with `✓ All placeholder patterns found.` and a non-zero replacement count. If any pattern is reported missing, stop and investigate before applying.

- [ ] **Step 3: Apply the rebrand**

```bash
npm run rebrand -- --apply
```
Expected: `Done: N replacements across M files.`

- [ ] **Step 4: Regenerate Sanity types (placeholders may appear in schema strings)**

```bash
npm run typegen
```
Expected: `src/lib/sanity.types.ts` regenerates with no errors.

- [ ] **Step 5: Fix the header wordmark line 1 in `src/data/site.ts`**

The rebrand sets `wordmark.line1` to the full name. Change it to the two-line treatment. Find the wordmark block and set:

```ts
  wordmark: {
    line1: "The Presbyterian",
    line2: "Academy",
  },
```

- [ ] **Step 6: Review the diff and build**

```bash
git diff --stat
git diff src/data/site.ts astro.config.mjs wrangler.jsonc
npm run build
```
Expected: identity strings replaced everywhere (no "Springfield", "example-church", "First Church" left except inside `node_modules`); `wrangler.jsonc` name remains `presacademy`; build succeeds.

```bash
git grep -n "Springfield\|example-church\|First Church" -- ':!docs/superpowers'
```
Expected: no matches outside the spec/plan docs.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(brand): stamp The Presbyterian Academy identity (rebrand)"
```

---

### Task 4: Apply the Oxblood & Stone palette

**Files:**
- Modify: `src/styles/globals.css` `@theme` palette (lines ~22-46), `:root` (lines ~236-289), `.dark` (lines ~296-345)
- Modify: `src/data/site.ts` `brandColors`

- [ ] **Step 1: Update the `@theme` brand tokens (lines 22-46)**

```css
  --color-primary:      #7A2A2C; /* Geneva Oxblood — interactive accent */
  --color-primary-dark: #5E2122; /* Oxblood Deep — hover / anchor text */
  --color-accent:       #2A2521; /* Walnut Ink — headings + body */
  --color-accent-dark:  #1E1A17; /* Walnut Deep — dark surfaces */
  --color-secondary:    #B7A99B; /* Cloister Stone — borders, eyebrows */
  --color-tertiary:     #9C8E7E; /* Stone Deep — sparingly */
  --color-bg:           #F4EEE6; /* Stone Cream — warm page surface */
  --color-bg-soft:      #FCF9F4; /* Chalk — alternating surface */
  --color-white-pure:   #FFFFFF;
```

And the band tokens (these keep the `chapel` names for now; values become deep oxblood — the structural-band color):

```css
  --color-chapel:            #5E2122; /* Oxblood Deep — utility bar, footer, CTA band */
  --color-chapel-deep:       #4A1B1C; /* Oxblood Deepest — deepest band base */
  --color-chapel-foreground: #F1EAD9; /* warm cream text on band surfaces */
  --color-gold:              #A87C3E; /* Aged Brass — hairline rules, small accents */
```

- [ ] **Step 2: Update the light-mode `:root` block (lines 236-289)**

```css
    --background: #F4EEE6;
    --foreground: #2A2521;
    --card: #FCF9F4;
    --card-foreground: #2A2521;
    --popover: #FCF9F4;
    --popover-foreground: #2A2521;

    --primary: #7A2A2C;
    --primary-foreground: #FFFFFF;
    --secondary: #B7A99B;
    --secondary-foreground: #2A2521;

    --muted: #EDE5D9;
    --muted-foreground: #5C5046;

    --accent: #E7DDCF;
    --accent-foreground: #2A2521;

    --destructive: oklch(0.577 0.245 27.325);
    --border: #E0D6C7;
    --input: #E0D6C7;
    --ring: #7A2A2C;
    --link: #5E2122;
    --chapel-ink: #7A2A2C;
    --gold-ink: #6E5128;
    --border-soft: #E0D6C7;
```

Also update the sidebar tokens in the same block for consistency:

```css
    --sidebar: #F4EEE6;
    --sidebar-foreground: #2A2521;
    --sidebar-primary: #7A2A2C;
    --sidebar-primary-foreground: #FFFFFF;
    --sidebar-accent: #EDE5D9;
    --sidebar-accent-foreground: #2A2521;
    --sidebar-border: #E0D6C7;
    --sidebar-ring: #7A2A2C;

    --tint-rgb: 168, 124, 62;
```

- [ ] **Step 3: Update the dark-mode `.dark` block (lines 296-345)**

```css
    --background: #1E1A17;
    --foreground: #F1EAD9;
    --card: #2A2420;
    --card-foreground: #F1EAD9;
    --popover: #2A2420;
    --popover-foreground: #F1EAD9;

    --primary: #C16A5A;
    --primary-foreground: #FFFFFF;
    --secondary: #8C7E70;
    --secondary-foreground: #F1EAD9;

    --muted: #262019;
    --muted-foreground: #B7AC9A;

    --accent: #2E2820;
    --accent-foreground: #F1EAD9;

    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 12%);
    --input: oklch(1 0 0 / 15%);
    --ring: #C16A5A;
    --link: #E0998C;
    --chapel-ink: #E0998C;
    --gold-ink: #C9A06A;
    --border-soft: oklch(1 0 0 / 14%);
```

And the dark sidebar + tint:

```css
    --sidebar: #2A2420;
    --sidebar-foreground: #F1EAD9;
    --sidebar-primary: #C16A5A;
    --sidebar-primary-foreground: #1E1A17;
    --sidebar-accent: #2E2820;
    --sidebar-accent-foreground: #F1EAD9;
    --sidebar-border: oklch(1 0 0 / 12%);
    --sidebar-ring: #C16A5A;

    --tint-rgb: 198, 160, 106;
```

- [ ] **Step 4: Update `brandColors` in `src/data/site.ts`**

```ts
  brandColors: {
    primary: "#7A2A2C",       // Geneva Oxblood
    primaryDark: "#5E2122",   // Oxblood Deep
    accent: "#2A2521",        // Walnut Ink
    accentDark: "#1E1A17",    // Walnut Deep
    secondary: "#B7A99B",     // Cloister Stone
    tertiary: "#9C8E7E",      // Stone Deep
    bg: "#F4EEE6",            // Stone Cream
    bgSoft: "#FCF9F4",        // Chalk
    border: "#E0D6C7",        // Warm Stone border
    chapel: "#5E2122",        // Oxblood Deep — band
    chapelDeep: "#4A1B1C",    // Oxblood Deepest — band base
    gold: "#A87C3E",          // Aged Brass
  },
```

- [ ] **Step 5: Build and verify in both themes**

```bash
npm run build
```
Expected: success. Then `npm run dev` and, with the Playwright MCP, screenshot the home page and one content page at 375px and 1280px in BOTH light and dark. Confirm: cream page, oxblood CTAs, deep-oxblood utility bar and footer, brass hairlines, readable ink. No oxblood-on-oxblood or invisible text.

- [ ] **Step 6: Commit**

```bash
git add src/styles/globals.css src/data/site.ts
git commit -m "feat(brand): apply Oxblood & Stone palette tokens"
```

---

### Task 5: Wordmark keyword emphasis

**Files:**
- Modify: `src/components/Header.astro` (frontmatter + the wordmark `<a>` near line 273-282)

The footer wordmark sits on the dark oxblood band and stays all-cream (no change). Only the header (on the cream page) gets the oxblood emphasis on the final word of line 1.

- [ ] **Step 1: Add the line-1 split in the Header frontmatter**

After `const brandName = settings.brandName;`, add:

```ts
// Split the wordmark's first line so its final word carries the brand
// keyword-emphasis color (text-chapel-ink), e.g. "The [Presbyterian]".
const line1Words = site.wordmark.line1.trim().split(/\s+/);
const line1Key = line1Words.pop() ?? site.wordmark.line1;
const line1Lead = line1Words.join(' ');
```

- [ ] **Step 2: Replace the line-1 `<span>` (currently line 278)**

```astro
      <span class="font-display text-xl sm:text-2xl text-foreground leading-none">
        {line1Lead && <>{line1Lead}{' '}</>}<span class="text-chapel-ink">{line1Key}</span>
      </span>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```
Expected: success. With the dev server, confirm the header reads "The" in ink and "Presbyterian" in oxblood (light) / lifted oxblood (dark), with "Academy" below. Footer wordmark is all cream on the band.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(brand): oxblood keyword emphasis on the header wordmark"
```

---

### Task 6: Sanity Studio theme

**Files:**
- Modify: `studio/sanity.config.ts` (`studioThemeProps`, `DISPLAY_STACK`, `BODY_STACK`)
- Modify: `studio/components/StudioLayout.tsx` (the Google Fonts `<link>`)

- [ ] **Step 1: Update `studioThemeProps` colors in `studio/sanity.config.ts`**

Map the Studio theme to the new palette (these mirror the site so the editor UI matches):

```ts
const studioThemeProps = {
  '--black': '#2A2521',
  '--white': '#FCF9F4',
  '--gray-base': '#6E6357',

  '--brand-primary': '#7A2A2C',
  '--brand-primary--inverted': '#ffffff',
  '--focus-color': '#7A2A2C',

  '--input-bg': '#F1E9DD',
  '--component-bg': '#FCF9F4',
  '--component-text-color': '#2A2521',

  '--default-button-color': '#7A2A2C',
  '--default-button-primary-color': '#7A2A2C',
  '--default-button-success-color': '#3E7C66',
  '--default-button-warning-color': '#A87C3E',
  '--default-button-danger-color': '#C0392B',

  '--state-success-color': '#3E7C66',
  '--state-warning-color': '#A87C3E',
  '--state-danger-color': '#C0392B',

  '--main-navigation-color': '#4A1B1C',
  '--main-navigation-color--inverted': '#F1EAD9',
};
```

- [ ] **Step 2: Update the font stacks in `studio/sanity.config.ts`**

```ts
const DISPLAY_STACK = "'Fraunces', Georgia, 'Times New Roman', serif";
const BODY_STACK = "'Source Sans 3', system-ui, -apple-system, sans-serif";
```

- [ ] **Step 3: Update the web-font `<link>` in `studio/components/StudioLayout.tsx`**

Read the file, find the Google Fonts `<link href="https://fonts.googleapis.com/...">` (currently loads Instrument Serif + Newsreader), and replace its href with:

```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Source+Sans+3:wght@400;500;600&display=swap
```

- [ ] **Step 4: Verify the Studio renders**

```bash
npm run studio:dev
```
Expected: Studio loads at its local URL with the oxblood accent, deep-oxblood top bar, and Fraunces/Source Sans 3 fonts. No console errors.

- [ ] **Step 5: Commit**

```bash
git add studio/sanity.config.ts studio/components/StudioLayout.tsx
git commit -m "feat(brand): match Sanity Studio theme to Oxblood & Stone"
```

---

### Task 7: Favicon (PA monogram) and OG image

**Files:**
- Create: `scripts/generate-favicon.mjs`
- Modify: `public/favicon.png`, `public/apple-touch-icon.png` (generated)
- Modify: `scripts/generate-og-default.mjs` (wordmark + tagline), then regenerate `public/og-default.png`

- [ ] **Step 1: Write a favicon generator using sharp**

Create `scripts/generate-favicon.mjs`:

```js
// Generates public/favicon.png and public/apple-touch-icon.png — a "PA"
// monogram in Fraunces, warm cream on a Geneva Oxblood rounded square.
// Run via: node scripts/generate-favicon.mjs
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#7A2A2C"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-weight="500"
    font-size="270" fill="#F1EAD9">PA</text>
</svg>`;

const buf = Buffer.from(svg);
await sharp(buf).png().resize(512, 512).toFile(resolve(root, 'public/favicon.png'));
await sharp(buf).png().resize(180, 180).toFile(resolve(root, 'public/apple-touch-icon.png'));
console.log('favicon.png (512) and apple-touch-icon.png (180) written');
```

Note: Fraunces is not installed as a system font for `sharp`/librsvg, so the SVG uses a Georgia serif fallback for the monogram. If exact Fraunces letterforms are wanted, embed the font via a data-URI `@font-face` in the SVG using the installed `@fontsource-variable/fraunces` file; otherwise the Georgia fallback is an acceptable, close serif for a 2-letter mark.

- [ ] **Step 2: Generate the favicons**

```bash
node scripts/generate-favicon.mjs
```
Expected: both PNGs written. Open them and confirm a cream "PA" on an oxblood rounded square.

- [ ] **Step 3: Update the OG default inputs in `scripts/generate-og-default.mjs`**

The rebrand will have changed the wordmark/tagline strings. Set them explicitly to the brand:

```js
const result = await renderOg({
  wordmark: 'The Presbyterian Academy',
  tagline: ['Equipping tomorrow’s church'],
  outPath: resolve(root, 'public/og-default.png'),
});
```

Then read `scripts/lib/render-og.mjs` and confirm it picks up brand colors from `src/data/site.ts` `brandColors` (now oxblood). If it hardcodes colors, update them to the oxblood palette so the OG card is on-brand.

- [ ] **Step 4: Regenerate the OG image**

```bash
npm run og
```
Expected: `public/og-default.png` rewritten on the oxblood palette. Open and confirm.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-favicon.mjs scripts/generate-og-default.mjs public/favicon.png public/apple-touch-icon.png public/og-default.png
git commit -m "feat(brand): PA-monogram favicon and rebranded OG image"
```

---

### Task 8: Full verification (both themes, both viewports, accessibility)

**Files:** none (verification only)

- [ ] **Step 1: Clean build**

```bash
npm run build
```
Expected: success, no warnings about missing Sanity (the env is configured), no font import errors.

- [ ] **Step 2: Visual pass with the Playwright MCP**

Run `npm run dev`. For the home page and one content page (e.g. `/about`), capture screenshots at 375px and 1280px in BOTH light and dark mode. Acceptance: cream page surfaces, oxblood CTAs and links, deep-oxblood utility bar + footer, brass hairlines, Fraunces headings, Source Sans 3 body, the wordmark emphasis correct, no invisible or low-contrast text, no layout regressions adjacent to changed areas.

- [ ] **Step 3: Lighthouse on the home page**

Run a Lighthouse audit (chrome-devtools MCP) on the home page, desktop. Acceptance: accessibility 100; performance/best-practices/SEO unregressed. If contrast fails, adjust the offending token (most likely a `muted-foreground`, `link`, or a dark-mode value) and re-verify from Step 1.

- [ ] **Step 4: Studio check**

`npm run studio:dev` and confirm the editor UI reads as the brand with no console errors.

---

### Task 9: Ship

**Files:** none (git + deploy)

- [ ] **Step 1: Push the branch and open a PR**

```bash
git push -u origin rebrand/presbyterian-academy
gh pr create --title "Rebrand to The Presbyterian Academy" --body "Applies the approved Oxblood & Stone brand: identity stamp, palette + type tokens, plainspoken wordmark, PA-monogram favicon, OG image, and Studio theme. Spec: docs/superpowers/specs/2026-06-13-brand-identity-design.md"
```
(Confirm with the user before pushing, per the push guardrail. Merging to `main` triggers the Cloudflare production build.)

- [ ] **Step 2: After merge, deploy the Studio**

Because `studio/sanity.config.ts` (schema/theme) changed, deploy the hosted Studio so editors see the rebranded UI:

```bash
npm run studio:deploy
```
Pick the host `presbyterian-academy` when prompted (fallback `presacademy-studio` if taken); pin the printed appId in `studio/sanity.cli.ts` and commit it.

- [ ] **Step 3: Confirm production**

After the Cloudflare build completes, load the deployed URL and confirm the rebrand is live in both themes. Check the build log for no `[sanity]` warnings.

---

## Out of scope (separate follow-ups)

- **Content seed / load.** `npm run seed` imports the starter dataset (now stamped with the academy identity). When seeding, set `siteSettings.phone` empty so the live footer hides phone until a real number exists, and replace the placeholder copy with real Academy copy in Studio.
- **Real photography.** `src/assets/` images are placeholders not licensed for reuse; replace before launch (imagery direction in the spec).
- **Publish webhook.** Already set up by the user (Cloudflare deploy hook + Sanity webhook).
- **Token rename.** The `--color-chapel*` tokens hold oxblood values; an optional rename to `--color-band*` is deferred.

## Self-review notes

- Spec coverage: palette (Task 4), type (Task 2), wordmark + favicon (Tasks 5, 7), Studio mirror (Task 6), OG (Task 7), imagery + seed flagged out of scope. Covered.
- Phone wrinkle handled (Task 3 + out-of-scope seed note). Wordmark mismatch handled (Task 3 Step 5).
- Dark-mode hex values are starting points; Task 8 Step 3 is the contrast gate that validates and corrects them.
