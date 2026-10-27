import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pillClasses } from './pill-variant.ts';

const FILLED =
  'press-tactile inline-flex min-h-[44px] items-center rounded-full bg-primary px-l py-s text-primary-foreground uppercase hover:bg-primary-dark';

test('the primary variant, or none, leaves the filled pill exactly as written', () => {
  assert.equal(pillClasses(FILLED), FILLED);
  assert.equal(pillClasses(FILLED, 'primary'), FILLED);
  assert.equal(pillClasses(FILLED, null), FILLED);
});

test('the secondary variant draws an outline in the band text colour', () => {
  const out = pillClasses(FILLED, 'secondary');
  assert.equal(
    out,
    'press-tactile inline-flex min-h-[44px] items-center rounded-full border border-current px-l py-s uppercase hover:bg-current/10',
  );
  assert.ok(!out.includes('bg-primary'));
  assert.ok(!out.includes('text-primary-foreground'));
});

test('only whole classes swap: a darker or tinted primary is left alone', () => {
  const cls = 'bg-primary/10 hover:bg-primary-dark text-primary';
  assert.equal(pillClasses(cls, 'secondary'), 'bg-primary/10 hover:bg-current/10 text-primary');
});
