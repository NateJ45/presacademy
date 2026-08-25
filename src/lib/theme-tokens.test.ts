import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AA_BODY_TEXT,
  AA_NON_TEXT,
  contrastRatio,
  flatten,
  hexToRgb,
  rgbToHex,
} from './contrast.ts';

// =============================================================================
// Theme token contrast — the gate that can actually see this class of bug
// =============================================================================
// Ported from the WCP repo, where a dark-mode audit found five accessibility
// failures that all passed CI: axe has no rule for focus-indicator or
// custom-border contrast, and the dark axe sweep only audits the RESTING DOM,
// so it never measures a focused element. Lighthouse stayed at 100 throughout.
//
// This reads the real token values out of globals.css and checks the pairings
// that matter, in BOTH themes, in milliseconds. It is deliberately a small
// set of load-bearing pairs rather than an exhaustive matrix — the point is
// to fail loudly when a palette edit quietly drops a pair below AA.
//
// Token layout in this repo (Tailwind v4, CSS-first): brand tokens live in
// `@theme` blocks (--color-*), the shadcn semantic tokens in `:root` (light)
// and `.dark`, and `@theme inline` maps semantic names onto --color-* via
// var() aliases. The extractor below reads all of them.
// =============================================================================

const css = readFileSync(new URL('../styles/globals.css', import.meta.url), 'utf8');

/**
 * Pull `--name: #hex;` (and `--name: var(--other);` alias) declarations out of
 * EVERY block whose header matches. Brace-counting rather than a lazy regex,
 * so a nested rule (the @keyframes inside `@theme inline`) cannot end a block
 * early. Capturing var() aliases matters: `.dark` re-points several tokens by
 * alias, and hex-only extraction would silently fall through to the LIGHT
 * value — a test that measures the wrong colour is worse than no test.
 */
function tokensMatching(header: RegExp): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(header)) {
    let depth = 0;
    let i = css.indexOf('{', m.index);
    if (i === -1) continue;
    const open = i;
    for (; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}' && --depth === 0) break;
    }
    const decl = /(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|var\(\s*--[\w-]+\s*\))\s*;/g;
    for (const d of css.slice(open, i).matchAll(decl)) out[d[1]] = d[2];
  }
  return out;
}

// Light scope: the @theme blocks (brand + inline alias map) plus :root.
// Dark scope: exactly the `.dark {` override blocks (the regex requires `{`
// right after `.dark`, so `.dark .image-well {` and friends are not swept in).
const light = tokensMatching(/(?:^|\n)\s*(?:@theme[^{]*|:root)\s*\{/g);
const dark = tokensMatching(/(?:^|\n)\s*\.dark\s*\{/g);

/** Follow `var(--x)` aliases to a concrete hex, within one theme's scope. */
function resolve(value: string | undefined, scope: Record<string, string>, seen = 0): string {
  if (!value) throw new Error('Token has no value');
  if (seen > 5) throw new Error(`Alias loop resolving "${value}"`);
  const alias = value.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (!alias) return value;
  return resolve(scope[alias[1]] ?? light[alias[1]], scope, seen + 1);
}

/** Dark overrides only some tokens; the rest inherit from the light scope. */
const darkValue = (name: string) => resolve(dark[name] ?? light[name], dark);
const lightValue = (name: string) => resolve(light[name], light);

const themes = [
  ['light', lightValue],
  ['dark', darkValue],
] as const;

describe('token extraction', () => {
  it('found a meaningful number of tokens in both themes', () => {
    assert.ok(Object.keys(light).length > 10, `light scope only has ${Object.keys(light).length}`);
    assert.ok(Object.keys(dark).length > 5, `dark scope only has ${Object.keys(dark).length}`);
  });

  it('resolves the tokens this suite depends on', () => {
    for (const t of ['--background', '--foreground', '--ring', '--link', '--gold-ink']) {
      assert.ok(light[t], `${t} missing from :root`);
      assert.ok(dark[t], `${t} missing from .dark`);
    }
    assert.ok(light['--color-chapel'], '--color-chapel missing from @theme');
  });
});

describe('body and muted text', () => {
  for (const [theme, v] of themes) {
    it(`body text clears AA on the ${theme} page`, () => {
      const ratio = contrastRatio(v('--foreground'), v('--background'));
      assert.ok(ratio >= AA_BODY_TEXT, `--foreground on --background is ${ratio}:1`);
    });

    it(`muted text clears AA on the ${theme} page`, () => {
      const ratio = contrastRatio(v('--muted-foreground'), v('--background'));
      assert.ok(ratio >= AA_BODY_TEXT, `--muted-foreground on --background is ${ratio}:1`);
    });

    it(`muted text clears AA on the ${theme} muted band`, () => {
      const ratio = contrastRatio(v('--muted-foreground'), v('--muted'));
      assert.ok(ratio >= AA_BODY_TEXT, `--muted-foreground on --muted is ${ratio}:1`);
    });

    it(`card text clears AA on the ${theme} card`, () => {
      const ratio = contrastRatio(v('--card-foreground'), v('--card'));
      assert.ok(ratio >= AA_BODY_TEXT, `--card-foreground on --card is ${ratio}:1`);
    });
  }
});

describe('brand text colours', () => {
  for (const [theme, v] of themes) {
    it(`links clear AA on the ${theme} page`, () => {
      const ratio = contrastRatio(v('--link'), v('--background'));
      assert.ok(ratio >= AA_BODY_TEXT, `--link on --background is ${ratio}:1`);
    });

    // gold-ink is the brass-as-TEXT token (card badges, step numerals). Small
    // text, so the full 4.5:1 — on the page AND on the white/dark card.
    it(`gold-ink text clears AA on the ${theme} page`, () => {
      const ratio = contrastRatio(v('--gold-ink'), v('--background'));
      assert.ok(ratio >= AA_BODY_TEXT, `--gold-ink on --background is ${ratio}:1`);
    });

    it(`gold-ink text clears AA on the ${theme} card`, () => {
      const ratio = contrastRatio(v('--gold-ink'), v('--card'));
      assert.ok(ratio >= AA_BODY_TEXT, `--gold-ink on --card is ${ratio}:1`);
    });

    it(`the status-success pill text clears AA on the ${theme} page`, () => {
      const ratio = contrastRatio(v('--status-success'), v('--background'));
      assert.ok(ratio >= AA_BODY_TEXT, `--status-success on --background is ${ratio}:1`);
    });
  }
});

describe('buttons and structural bands', () => {
  // The primary CTA pill keeps the STATIC @theme green (#33503F) in both
  // themes with --primary-foreground text on it — the .dark --primary
  // (lifted green) is decoration-only by design. So the load-bearing button
  // pair is foreground-vs-static-brand-green, per theme.
  for (const [theme, v] of themes) {
    it(`button text clears AA on the static primary fill (${theme})`, () => {
      const ratio = contrastRatio(v('--primary-foreground'), lightValue('--color-primary'));
      assert.ok(ratio >= AA_BODY_TEXT, `--primary-foreground on --color-primary is ${ratio}:1`);
    });
  }

  // The chapel band (footer + closing CTA) is deliberately theme-stable, so
  // one measurement covers both themes; the deep variant is the band's base.
  it('chapel band text clears AA on the band', () => {
    const ratio = contrastRatio(lightValue('--color-chapel-foreground'), lightValue('--color-chapel'));
    assert.ok(ratio >= AA_BODY_TEXT, `chapel-foreground on chapel is ${ratio}:1`);
  });

  it('chapel band text clears AA on the deep band base', () => {
    const ratio = contrastRatio(
      lightValue('--color-chapel-foreground'),
      lightValue('--color-chapel-deep'),
    );
    assert.ok(ratio >= AA_BODY_TEXT, `chapel-foreground on chapel-deep is ${ratio}:1`);
  });
});

describe('the focus indicator', () => {
  // THE regression guard this suite exists for. The global :focus-visible
  // rule draws a 2px --ring outline; SC 1.4.11 wants 3:1 against the surface
  // the focused element sits on. Checked against the page and the card in
  // both themes, because the ring token flips with the theme.
  for (const [theme, v] of themes) {
    it(`the focus ring clears 3:1 against the ${theme} page`, () => {
      const ratio = contrastRatio(v('--ring'), v('--background'));
      assert.ok(ratio >= AA_NON_TEXT, `--ring on --background is ${ratio}:1`);
    });

    it(`the focus ring clears 3:1 against the ${theme} card`, () => {
      const ratio = contrastRatio(v('--ring'), v('--card'));
      assert.ok(ratio >= AA_NON_TEXT, `--ring on --card is ${ratio}:1`);
    });
  }

  // The chapel band pins its focus ring to the cream band foreground
  // (globals.css `.bg-chapel :focus-visible` override), because the green
  // ring would vanish on the green band. Pin that pairing too.
  it('the chapel-band focus ring clears 3:1 against the band', () => {
    const ratio = contrastRatio(
      lightValue('--color-chapel-foreground'),
      lightValue('--color-chapel'),
    );
    assert.ok(ratio >= AA_NON_TEXT, `chapel-foreground ring on chapel is ${ratio}:1`);
  });
});

describe('form-field borders (documented shortfall)', () => {
  // In both themes the input border is the shadcn-typical quiet hairline, and
  // it does NOT clear the SC 1.4.11 3:1 UI-component threshold against the
  // page: light --input #E6E3DB on #FAF8F4 measures ~1.2:1, and dark --input
  // (white at 15% alpha, composited over the page) measures ~1.6:1. Fields
  // remain identifiable through their labels and the field fill, and the
  // FOCUSED state gets the fully-passing --ring outline (pinned above), so
  // this is a shortfall worth knowing about rather than a hard failure —
  // WCAG 1.4.11 does not unambiguously require the resting border itself to
  // hit 3:1 when other identifying cues exist.
  //
  // TODO: if the design ever wants resting borders to carry the affordance
  // alone, raise these floors to AA_NON_TEXT (3) and darken --input in both
  // themes. Until then these pin the TRUE measured floors so a regression
  // below today's values still fails loudly.
  it('light input border stays at or above its measured ~1.2:1 floor', () => {
    const ratio = contrastRatio(lightValue('--input'), lightValue('--background'));
    assert.ok(ratio >= 1.15, `--input on --background is ${ratio}:1 (was ~1.21:1)`);
  });

  it('dark input border composite stays at or above its measured ~1.6:1 floor', () => {
    const m = css.slice(css.indexOf('.dark {')).match(/--input:\s*oklch\(1 0 0 \/ (\d+)%\)/);
    if (!m) return; // not a white-alpha border any more; the hex path above covers it
    const alpha = Number(m[1]) / 100;
    const bg = darkValue('--background');
    const composite = rgbToHex(flatten(hexToRgb('#ffffff'), alpha, hexToRgb(bg)));
    const ratio = contrastRatio(composite, bg);
    assert.ok(
      ratio >= 1.5,
      `dark --input at alpha ${alpha} composites to ${composite}: ${ratio}:1 (was ~1.6:1)`,
    );
  });
});
