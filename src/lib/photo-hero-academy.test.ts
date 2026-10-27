// The photo hero's contrast promise in the Academy's palette (starter card 189, phase D). The
// starter's own test (photo-hero.test.ts, PORTABLE) checks photo-hero.css's default scrim; the
// Academy overrides the scrim and its strengths in photo-hero-academy.css, so this test runs the
// same arithmetic on what the page actually draws: white words over a pure white photo under the
// Academy's shade where the words sit stay at 4.5:1 or better.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PHOTO_HERO_MIN_CONTRAST, leastShade, worstCaseContrast } from './photo-hero.ts';

const css = readFileSync(new URL('../styles/photo-hero-academy.css', import.meta.url), 'utf8');
const globals = readFileSync(new URL('../styles/globals.css', import.meta.url), 'utf8');

function token(name: string): string {
  const m = new RegExp(`${name}:\\s*([^;]+);`).exec(css);
  assert.ok(m, `photo-hero-academy.css declares ${name}`);
  return m[1].trim();
}

function scrimHex(): string {
  const v = token('--photo-scrim');
  if (v.startsWith('#')) return v;
  const ref = /^var\((--[\w-]+)\)$/.exec(v);
  assert.ok(ref, `--photo-scrim is a hex or a var(): ${v}`);
  const decl = new RegExp(`${ref[1]}:\\s*(#[0-9a-fA-F]{3,6})\\b`).exec(globals);
  assert.ok(decl, `globals.css declares ${ref[1]} as a hex colour`);
  return decl[1];
}

test('the Academy shade is its own forest green', () => {
  assert.equal(token('--photo-scrim'), 'var(--color-chapel-deep)');
  assert.equal(scrimHex().toLowerCase(), '#1f3227');
});

test('white words keep 4.5:1 over a white photo under the Academy shade', () => {
  const hex = scrimHex();
  const text = Number(token('--photo-scrim-text').replace('%', '')) / 100;
  const deep = Number(token('--photo-scrim-deep').replace('%', '')) / 100;
  const ratio = worstCaseContrast(hex, text);
  assert.ok(
    ratio >= PHOTO_HERO_MIN_CONTRAST,
    `scrim ${hex} at ${text * 100}% gives ${ratio.toFixed(2)}:1; raise --photo-scrim-text to ${leastShade(hex) * 100}%`,
  );
  assert.ok(deep >= text, '--photo-scrim-deep is at least --photo-scrim-text');
});
