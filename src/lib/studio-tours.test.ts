// Safe to edit by hand
// The Academy's tour steps (src/sanity/guides/tours.ts), written as data for
// starter card 137: every tour has steps with words, names a real guide, and
// reads like the Site Guide (no em-dashes, nothing too long for a popover).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TOURS, WELCOME, WHATS_NEW } from '../sanity/guides/tours.ts';
import { guides } from '../sanity/guides/content.ts';

const words = (): string[] => [
  WELCOME.title,
  WELCOME.body,
  WHATS_NEW.title,
  ...WHATS_NEW.items,
  ...TOURS.flatMap((t) => [t.title, ...t.steps.flatMap((s) => [s.title, s.body])]),
];

describe('tour data (card 137)', () => {
  it('has unique ids and at least one first-run tour', () => {
    const ids = TOURS.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(TOURS.some((t) => t.when === 'first-run'));
  });

  it('every step points somewhere and says something', () => {
    for (const t of TOURS) {
      assert.ok(t.steps.length >= 2, `${t.id}: a tour of one step is a tooltip`);
      for (const s of t.steps) {
        assert.ok(s.anchor.includes(':'), `${t.id}: "${s.anchor}" is not kind:name`);
        assert.ok(s.title.trim() && s.body.trim(), `${t.id}: a step has no words`);
        assert.ok(s.body.length <= 200, `${t.id}: "${s.title}" is long for a popover`);
      }
    }
  });

  it('names guides that exist', () => {
    const slugs = new Set(guides.map((g) => g.slug));
    for (const t of TOURS) {
      if (t.guide) assert.ok(slugs.has(t.guide), `${t.id}: no guide "${t.guide}"`);
    }
  });

  it('has no em-dashes', () => {
    for (const w of words()) assert.ok(!w.includes('—'), `em-dash in "${w}"`);
  });
});
