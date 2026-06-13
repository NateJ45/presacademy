# Component sources

The sourcing guide for adding UI components to this church-website starter. Every source listed here is compatible with the repo's semantic token system. The church starter uses `rebrand.mjs` (not `apply-brand`) to stamp a new church's identity into `globals.css`; any component that uses the semantic token set below propagates the new brand automatically once `rebrand.mjs` runs.

---

## Wired-in sources (add commands)

These sources are pre-configured. The CLI resolves them without extra setup.

| Source | What it is | Add command | Landing location |
|---|---|---|---|
| shadcn/ui official primitives | 400+ React UI primitives (accordion, button, dialog, etc.) | `npx shadcn add <name>` | `src/components/ui/` |
| Fulldev UI blocks | Astro section blocks (hero, features, FAQ, CTA, reviews, pricing) | `npx shadcn add @fulldev/<name>` | `src/components/<name>.astro` |

**Fulldev registry** is wired in `components.json` under `registries`. Block names: `hero-1` through `hero-13`, `features-1`, `faq-1`, `cta-1`, `reviews-1`, `pricing-1`, `services-1`, etc. Browse https://ui.full.dev for the catalog. **Not pre-vendored** -- add on demand.

---

## Approved copy-paste sources (available to add, not pre-vendored)

Browse, copy, token-remap (see cheat sheet below), and paste into `src/components/blocks/` (if it is a page-builder block) or `src/components/` (if it is a shared component).

| Source | Best for | Notes |
|---|---|---|
| Starwind UI v2 (starwind.dev) | Astro-native components -- 60+ `.astro` primitives, no React needed. Accordion, tabs, dialog, dropdown. | `npx starwind@latest add <name>`. Not pre-installed; add on demand. |
| Magic UI (magicui.design) | Animated React components -- bento grid, marquee, beam, shimmer. Good for the home page hero or an about-page feature moment. | `npx shadcn add @magicui/<name>`. Namespace auto-resolved by the shadcn CLI. |
| HyperUI (hyperui.dev/components/marketing) | Static sections with zero JS -- pure Tailwind HTML, no framework dep. Largest free library. Requires full color token remap. | MIT, no attribution required. |
| Tailark (tailark.com) | Marketing section layouts: heroes, features, testimonials, CTAs. Tailwind 4 native. | MIT free tier; paid $249 one-time for full catalog. |
| motion-primitives (motion-primitives.com) | Scroll choreography, editorial text/image reveals, restrained transitions. `motion` is already installed. | MIT. Zero marginal bundle cost. |
| react-bits (react-bits.dev) | CSS-first special effects: aurora backgrounds, text scramble, blur-in. Pick the Tailwind variant. | MIT + Commons Clause: OK for client work, cannot resell the library. |

---

## Token-remap cheat sheet

When pasting from HyperUI, Tailark, react-bits, or any palette-first source, replace hardcoded Tailwind colors with the semantic tokens this repo uses. `rebrand.mjs` and the design-system `:root` / `.dark` blocks in `globals.css` rewrite the values behind these tokens on every brand application.

**Church-specific brand tokens** (static, never theme-flip):

| Static utility | Hex (starter values) | Role |
|---|---|---|
| `bg-chapel` | `#5E2122` | Structural bands: utility bar, footer, closing CTA (deep oxblood) |
| `bg-chapel-deep` | `#4A1B1C` | Footer deep base |
| `text-chapel-foreground` | `#F1EAD9` | Text on chapel surfaces |
| `bg-primary` | `#7A2A2C` | Oxblood CTA pills |
| `bg-gold` / `text-gold` | `#A87C3E` | Hairline rules, step numerals, small accents |

**Theme-aware shadcn semantic tokens** (flip between light and dark):

| Hardcoded class | Semantic replacement | Notes |
|---|---|---|
| `bg-white` | `bg-card` or `bg-background` | card for elevated surface, background for page |
| `bg-gray-50`, `bg-gray-100` | `bg-muted` | quiet alternating surface |
| `text-gray-900`, `text-black` | `text-foreground` | body / heading text |
| `text-gray-600`, `text-gray-500` | `text-muted-foreground` | secondary / caption text |
| `text-indigo-600`, `text-blue-600` | `text-link` | inline links, oxblood in light / lifted oxblood in dark |
| `bg-indigo-600`, `bg-blue-600` | `bg-primary` | brand action background (oxblood) |
| `text-white` (on primary bg) | `text-primary-foreground` | text on oxblood pill |
| `border-gray-200`, `border-gray-300` | `border-border-soft` | warm faint dividers |
| `border-gray-400` | `border-border` | stronger borders, input outlines |
| `ring-indigo-500` | `ring-ring` | focus rings |
| Hex or oklch literals | `var(--primary)`, `var(--foreground)`, etc. | use CSS `var()` for SVG fill/stroke |

**Keyword-emphasis and ink tokens** (theme-aware, for text only):

| Utility | Role |
|---|---|
| `text-chapel-ink` | Keyword emphasis in display headlines (deep oxblood on cream, lifted on dark) |
| `text-gold-ink` | Gold text on theme-flipping surfaces (card badges, step numerals) |

---

## Copy-in checklist

For every new component pasted or CLI-installed:

1. Pick the source from the approved list above and note its URL.
2. Remap hardcoded color classes to semantic tokens using the cheat sheet.
3. Decide: static `.astro` vs React island. Static unless the component has state, event handlers, or needs `useEffect`. When in doubt: static.
4. If it is a React island, use `client:visible` (not `client:load`) so it hydrates only when scrolled into view.
5. Verify in both light and dark mode before committing.
6. Add a comment at the top of the file noting the source URL and any non-obvious token substitutions.

Example header comment:
```
// Source: https://shadcnblocks.com/block/hero-125 (free copy-paste)
// Token remaps: bg-slate-900 -> bg-background, text-indigo-500 -> text-link
// Church remaps: "deep oxblood band" handled by bg-chapel not bg-primary
```

---

## Bundle-cost flags

Know these before adding a component with heavy dependencies:

- **react-bits Three.js components** (~250 kB gzipped): Aurora/WebGL backgrounds and physics effects pull Three.js. Use only on hero-only pages where that budget is justified. Check each react-bits component individually -- most are CSS-only and free.
- **framer-motion imports**: some older Aceternity UI and Animata components use `framer-motion` instead of `motion/react`. With React 19 this causes peer dep warnings. The `motion` package is already installed; prefer `motion/react` imports.
- **motion-primitives**: zero marginal cost -- dep is already in the bundle.
- **Starwind UI**: near-zero -- Astro renders components as static HTML; JS only ships for interactive Starwind components (dropdown, dialog, accordion) and only when they are used.
- **PrimeReact**: 30-60 kB gzipped for a realistic widget set (behavioral components only, no styled CSS in unstyled mode). Worth it for complex widgets like DataTable or TreeSelect; overkill for buttons or forms that shadcn/Radix already covers.

---

## Heavyweight library verdicts

**Do not use as general component sources:** Mantine, Chakra UI, Ant Design.

All three require a mandatory React Context Provider per island, impose a parallel CSS variable namespace (`--mantine-*`, `--chakra-*`, etc.) that `rebrand.mjs` does not touch, and add 80-140 kB gzipped even with tree-shaking. Using any of them alongside the shadcn semantic token system requires maintaining two parallel theme configurations that must be manually synchronized on every brand application. This breaks the one-pass rebrand guarantee.

**Sanctioned escape hatch:** PrimeReact v10 in unstyled/passthrough mode. In unstyled mode, PrimeReact is styled entirely with Tailwind classes referencing the repo's semantic tokens, so `rebrand.mjs` propagates automatically. Reserve it for complex behavior-heavy widgets (DataTable, TreeSelect, FileUpload, complex calendar) that have no Radix/shadcn equivalent.
