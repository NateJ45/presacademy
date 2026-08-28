// =============================================================================
// section-coach — registry hygiene + emptiness tests
// =============================================================================
// These pin the three things that can silently break the rule:
//   1. A freshly inserted section of every coached type MUST report a coach,
//      and a section holding its content must NOT.
//   2. Hints stay in house style: short, one sentence, no em-dash.
//   3. The registry stays in step with what the site actually renders. The
//      renderer (src/components/Sections.astro) is the single source of the
//      section list, so the test reads it and asserts that every rendered type
//      is either coached or on the self-filling list, and never both.
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  COACHED_SECTION_TYPES,
  SELF_FILLING_SECTIONS,
  sectionCoach,
  type SectionData,
} from './section-coach.ts';

/** A section exactly as the Studio inserts it: a type, a key, nothing else. */
const fresh = (type: string): SectionData => ({ _type: type, _key: 'k1' });

/** The `_type` keys of the renderer's MAP, read straight out of the component. */
function renderedSectionTypes(): string[] {
  const source = readFileSync(new URL('../components/Sections.astro', import.meta.url), 'utf-8');
  const map = source.slice(
    source.indexOf('const MAP: Record<string, any> = {'),
    source.indexOf('// Blocks that render inner content only'),
  );
  return [...map.matchAll(/^ {2}(\w+):\s/gm)].map((m) => m[1]);
}

test('every coached type coaches right after insert', () => {
  for (const type of COACHED_SECTION_TYPES) {
    const coach = sectionCoach(fresh(type));
    assert.notEqual(coach, null, `${type} must coach when empty`);
    assert.ok((coach?.name.length ?? 0) > 0, `${type} needs a name`);
    assert.ok((coach?.hint.length ?? 0) > 0, `${type} needs a hint`);
  }
});

test('hints stay in house style: one short sentence, no em-dash', () => {
  for (const type of COACHED_SECTION_TYPES) {
    const hint = sectionCoach(fresh(type))?.hint ?? '';
    assert.ok(!hint.includes('—'), `${type} hint must not use an em-dash`);
    assert.ok(hint.endsWith('.'), `${type} hint must end in a period`);
    assert.ok(hint.split(/\s+/).length <= 20, `${type} hint must stay short`);
  }
});

test('the registry covers exactly what the renderer renders', () => {
  const rendered = renderedSectionTypes();
  assert.ok(rendered.length > 30, 'the renderer MAP was not parsed');
  const coached = new Set(COACHED_SECTION_TYPES);
  const selfFilling = new Set(SELF_FILLING_SECTIONS);

  for (const type of rendered) {
    assert.ok(
      coached.has(type) || selfFilling.has(type),
      `${type} is rendered but is neither coached nor listed as self-filling`,
    );
    assert.ok(
      !(coached.has(type) && selfFilling.has(type)),
      `${type} cannot be both coached and self-filling`,
    );
  }
  for (const type of COACHED_SECTION_TYPES) {
    assert.ok(rendered.includes(type), `${type} is coached but never rendered`);
  }
});

test('the self-filling sections are never coached', () => {
  for (const type of SELF_FILLING_SECTIONS) {
    assert.equal(sectionCoach(fresh(type)), null, `${type} fills itself and must stay quiet`);
  }
});

test('stays quiet for an unknown type', () => {
  assert.equal(sectionCoach(fresh('somethingElseSection')), null);
});

test('stays quiet once a section holds its content', () => {
  assert.equal(sectionCoach({ ...fresh('sectionCardGrid'), cards: [{ title: 'A' }] }), null);
  assert.equal(sectionCoach({ ...fresh('sectionQuote'), quote: 'We love it here.' }), null);
  assert.equal(sectionCoach({ ...fresh('embed'), url: 'https://example.org/x' }), null);
  assert.equal(
    sectionCoach({ ...fresh('sectionRichText'), body: [{ _type: 'block', children: [] }] }),
    null,
  );
  assert.equal(
    sectionCoach({ ...fresh('sectionImageText'), image: { asset: { _ref: 'image-abc' } } }),
    null,
  );
  assert.equal(sectionCoach({ ...fresh('sectionRequestPanel'), form: { _ref: 'form-abc' } }), null);
  assert.equal(
    sectionCoach({ ...fresh('sectionLegalBody'), fallbackStatement: 'accessibility' }),
    null,
  );
});

test('treats blank text as empty', () => {
  assert.notEqual(sectionCoach({ ...fresh('sectionQuote'), quote: '   ' }), null);
  assert.notEqual(sectionCoach({ ...fresh('sectionInlineBand'), headline: '' }), null);
});
