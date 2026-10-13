import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AA_BODY_TEXT, contrastRatio } from './contrast.ts';
import {
  COURSE_CODE_PATTERN,
  COVER_COLORS,
  COVER_ORNAMENTS,
  COVER_RULE,
  coverStyle,
  hashString,
  resolveCover,
} from './cover.ts';

// =============================================================================
// Course covers (Term Issue, 2026-10-13)
// =============================================================================
// Pins the three things a cover depends on: the fallback is deterministic (a
// course gets the same cover on every build), the names in cover.ts all have
// tokens in globals.css, and every cover's text clears AA on its own colour.
// The palette is static in both themes, so one check per pair covers light and
// dark alike.
// =============================================================================

const css = readFileSync(new URL('../styles/globals.css', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../sanity/schemaTypes/course.ts', import.meta.url), 'utf8');

/** `--color-cover-*: #hex;` declarations, wherever they sit in globals.css. */
const tokens: Record<string, string> = {};
for (const m of css.matchAll(/(--color-cover-[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
  tokens[m[1]] = m[2];
}
const token = (name: string) => {
  const v = tokens[name];
  assert.ok(v, `${name} is missing from globals.css`);
  return v;
};

describe('resolveCover: the fallback', () => {
  it('keeps the editor’s choice when both fields are set', () => {
    const r = resolveCover({ slug: 'x', coverColor: 'slate', coverOrnament: 'steps' });
    assert.deepEqual(r, { color: 'slate', ornament: 'steps', derived: false });
  });

  it('is deterministic for the same course', () => {
    const course = { slug: 'bible-one-story', teachingAreas: [{ slug: 'scripture' }] };
    assert.deepEqual(resolveCover(course), resolveCover({ ...course }));
    assert.equal(resolveCover(course).derived, true);
  });

  it('gives courses in one teaching area the same colour', () => {
    const a = resolveCover({ slug: 'one', teachingAreas: [{ slug: 'church-history' }] });
    const b = resolveCover({ slug: 'two', teachingAreas: [{ slug: 'church-history' }] });
    assert.equal(a.color, b.color);
  });

  it('falls back to the slug when there is no teaching area', () => {
    const r = resolveCover({ slug: 'lonely-course' });
    assert.ok((COVER_COLORS as readonly string[]).includes(r.color));
    assert.ok((COVER_ORNAMENTS as readonly string[]).includes(r.ornament));
  });

  it('ignores unknown stored values instead of rendering a broken cover', () => {
    const r = resolveCover({ slug: 'x', coverColor: 'teal', coverOrnament: 'star' });
    assert.ok((COVER_COLORS as readonly string[]).includes(r.color));
    assert.ok((COVER_ORNAMENTS as readonly string[]).includes(r.ornament));
    assert.equal(r.derived, true);
  });

  it('survives an empty course', () => {
    assert.doesNotThrow(() => resolveCover(null));
    assert.doesNotThrow(() => resolveCover({}));
  });

  it('spreads the hash across every bucket', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) seen.add(hashString(`course-${i}`) % 8);
    assert.equal(seen.size, 8);
  });
});

describe('cover tokens in globals.css', () => {
  for (const color of COVER_COLORS) {
    it(`${color}: text is at least 4.5:1 on the cover`, () => {
      const bg = token(`--color-cover-${color}`);
      const fg = token(`--color-cover-${color}-fg`);
      const ratio = contrastRatio(bg, fg);
      assert.ok(ratio >= AA_BODY_TEXT, `${color} ${fg} on ${bg} is ${ratio}:1`);
    });

    it(`${color}: the style string names only tokens that exist`, () => {
      for (const ref of coverStyle(color).matchAll(/var\((--color-cover-[\w-]+)\)/g)) {
        token(ref[1]);
      }
    });
  }

  it('sage has its own rule token, since it is the only one that asks for it', () => {
    const asks = COVER_COLORS.filter((c) => COVER_RULE[c] === 'rule');
    for (const c of asks) token(`--color-cover-${c}-rule`);
  });

  it('the paper back clears AA for its ink, muted text and the green link', () => {
    const paper = token('--color-cover-paper');
    assert.ok(contrastRatio(paper, token('--color-cover-paper-ink')) >= AA_BODY_TEXT);
    assert.ok(contrastRatio(paper, token('--color-cover-paper-muted')) >= AA_BODY_TEXT);
    // --back-link on the flipped back is the static primary green.
    const primary = css.match(/--color-primary:\s*(#[0-9a-fA-F]{6})/)?.[1];
    assert.ok(primary, '--color-primary is missing');
    assert.ok(contrastRatio(paper, primary) >= AA_BODY_TEXT);
  });
});

describe('the Studio and the code agree', () => {
  it('every colour and ornament is offered in the course schema', () => {
    // The schema builds its radio lists from these arrays; make sure it still
    // imports them rather than carrying a hand-typed copy that can drift.
    assert.match(schema, /COVER_COLORS\.map/);
    assert.match(schema, /COVER_ORNAMENTS\.map/);
  });

  it('the code pattern takes the mockup’s codes and refuses a title', () => {
    for (const ok of ['SCR 101', 'LDR 110', 'THE 120', 'SPF 130', 'HIS 170', 'PRE 160']) {
      assert.match(ok, COURSE_CODE_PATTERN);
    }
    for (const bad of ['scr 101', 'SCR101', 'Reading the Bible', 'SCRIPT 1010']) {
      assert.doesNotMatch(bad, COURSE_CODE_PATTERN);
    }
  });
});
