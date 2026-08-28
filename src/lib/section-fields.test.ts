import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  BACKGROUND_SECTION_TYPES,
  HEADING_ACCENT_SECTION_TYPES,
  RICH_TWINS,
  adaptToneToNeighbour,
  hasBackground,
  hasHeadingAccent,
  overlayControlsForPath,
  resolveTextTarget,
  richTwinFor,
  sectionTone,
} from './section-fields.ts';

// =============================================================================
// The drift gate
// =============================================================================
// section-fields.ts duplicates knowledge that lives in the schema, because the
// preview island cannot ask the Studio which fields a section has. The
// duplication is only safe while something checks it, so this reads the schema
// source and fails the build if a section gains or loses one of these fields
// without the registry being updated. Same contract as the contrast gate in
// surfaces.test.ts.
// =============================================================================

const BLOCKS = readFileSync(
  fileURLToPath(new URL('../sanity/schemaTypes/blocks.ts', import.meta.url)),
  'utf8',
);

/** Each `export const x = defineType({...})` in blocks.ts, as name -> source. */
function schemaTypeBodies(source: string): Map<string, string> {
  const out = new Map<string, string>();
  const starts = [...source.matchAll(/^export const (\w+) = defineType\(\{$/gm)];
  starts.forEach((match, i) => {
    const from = match.index ?? 0;
    const to = i + 1 < starts.length ? (starts[i + 1].index ?? source.length) : source.length;
    const body = source.slice(from, to);
    // The type's schema NAME, not its export name (they agree today, but the
    // registry is keyed by the stored `_type`).
    const name = body.match(/\n {2}name: '([^']+)',/)?.[1];
    if (name) out.set(name, body);
  });
  return out;
}

const BODIES = schemaTypeBodies(BLOCKS);

test('the schema file was parsed at all', () => {
  assert.ok(BODIES.size > 20, `only found ${BODIES.size} section types in blocks.ts`);
  assert.ok(BODIES.has('sectionRichText'));
});

test('BACKGROUND_SECTION_TYPES matches every type calling bgField()', () => {
  const actual = [...BODIES]
    .filter(([, body]) => body.includes('bgField(),'))
    .map(([name]) => name);
  assert.deepEqual([...BACKGROUND_SECTION_TYPES].sort(), actual.sort());
});

test('HEADING_ACCENT_SECTION_TYPES matches every type calling headingAccentField()', () => {
  const actual = [...BODIES]
    .filter(([, body]) => body.includes('headingAccentField(),'))
    .map(([name]) => name);
  assert.deepEqual([...HEADING_ACCENT_SECTION_TYPES].sort(), actual.sort());
});

test('RICH_TWINS matches every richTwin() in the schema, plain half included', () => {
  const actual: Record<string, { plain: string; rich: string }> = {};
  for (const [name, body] of BODIES) {
    const twin = body.match(/richTwin\('(\w+)', '[^']+'\)/)?.[1];
    if (!twin) continue;
    assert.ok(twin.endsWith('Rich'), `${name}: twin ${twin} is not named <field>Rich`);
    const plain = twin.slice(0, -'Rich'.length);
    // The plain field must exist and must hide behind this twin, or the popover
    // would seed itself from a field the renderer is not reading.
    assert.ok(body.includes(`name: '${plain}',`), `${name}: no plain field '${plain}'`);
    assert.ok(body.includes(`hideWhenRich('${twin}')`), `${name}: '${plain}' does not hide`);
    actual[name] = { plain, rich: twin };
  }
  assert.deepEqual(RICH_TWINS, actual);
  assert.equal(Object.keys(actual).length, 7, 'the mission says seven rich twins');
});

// =============================================================================
// The lookups
// =============================================================================

test('hasBackground and hasHeadingAccent are closed over the registry', () => {
  assert.equal(hasBackground('sectionCardGrid'), true);
  assert.equal(hasBackground('sectionNumberedCards'), false, 'Rule & Ledger sections have none');
  assert.equal(hasBackground(undefined), false);
  assert.equal(hasHeadingAccent('sectionMediaShowcase'), true);
  assert.equal(hasHeadingAccent('sectionGallery'), false);
  assert.equal(hasHeadingAccent(null), false);
});

test('richTwinFor answers to either half of the pair', () => {
  assert.deepEqual(richTwinFor('sectionCtaBand', 'subhead'), {
    plain: 'subhead',
    rich: 'subheadRich',
  });
  assert.deepEqual(richTwinFor('sectionCtaBand', 'subheadRich'), {
    plain: 'subhead',
    rich: 'subheadRich',
  });
  assert.equal(richTwinFor('sectionCtaBand', 'heading'), null);
  assert.equal(richTwinFor('sectionGallery', 'intro'), null);
  assert.equal(richTwinFor(undefined, undefined), null);
});

// =============================================================================
// Insert adapts to its neighbour
// =============================================================================

test('sectionTone reads a tone, and treats blank as none', () => {
  assert.equal(sectionTone({ background: { tone: 'warm' } }), 'warm');
  assert.equal(sectionTone({ background: { tone: '' } }), undefined);
  assert.equal(sectionTone({ background: {} }), undefined);
  assert.equal(sectionTone({}), undefined);
  assert.equal(sectionTone(null), undefined);
});

test('a new section adopts the tone of the one before it', () => {
  const adapted = adaptToneToNeighbour(
    { _type: 'sectionCardGrid', heading: 'Hello' },
    { _type: 'sectionQuote', background: { tone: 'chapel' } },
  );
  assert.deepEqual(adapted, {
    _type: 'sectionCardGrid',
    heading: 'Hello',
    background: { tone: 'chapel' },
  });
});

test('adopting nothing is still adopting: a toneless neighbour clears the tone', () => {
  const adapted = adaptToneToNeighbour(
    { _type: 'sectionCardGrid', background: { tone: 'ink', padding: 'spacious' } },
    { _type: 'sectionQuote' },
  );
  assert.deepEqual(adapted, {
    _type: 'sectionCardGrid',
    background: { padding: 'spacious' },
  });
});

test('a background left holding nothing is dropped, not stored empty', () => {
  const adapted = adaptToneToNeighbour(
    { _type: 'sectionCardGrid', background: { tone: 'ink' } },
    { _type: 'sectionQuote' },
  );
  assert.deepEqual(adapted, { _type: 'sectionCardGrid' });
});

test('no neighbour at all (the first section on the page) means no tone', () => {
  assert.deepEqual(
    adaptToneToNeighbour({ _type: 'sectionCardGrid', background: { tone: 'warm' } }),
    {
      _type: 'sectionCardGrid',
    },
  );
  assert.deepEqual(adaptToneToNeighbour({ _type: 'sectionCardGrid' }, null), {
    _type: 'sectionCardGrid',
  });
});

test('only the tone travels: accent, image, overlay and padding are the preset’s own', () => {
  const adapted = adaptToneToNeighbour(
    {
      _type: 'sectionCtaBand',
      background: { tone: 'default', accent: 'brass', overlay: 40, padding: 'compact' },
    },
    {
      _type: 'sectionQuote',
      background: { tone: 'chapelDeep', accent: 'ink', padding: 'spacious' },
    },
  );
  assert.deepEqual(adapted, {
    _type: 'sectionCtaBand',
    background: { tone: 'chapelDeep', accent: 'brass', overlay: 40, padding: 'compact' },
  });
});

test('a section with no background field in its schema is left alone', () => {
  const pinned = { _type: 'sectionNumberedCards', heading: 'Steps' };
  assert.equal(adaptToneToNeighbour(pinned, { background: { tone: 'warm' } }), pinned);
});

test('the input is never mutated', () => {
  const section = { _type: 'sectionCardGrid', background: { tone: 'warm' } };
  const neighbour = { _type: 'sectionQuote', background: { tone: 'ink' } };
  adaptToneToNeighbour(section, neighbour);
  assert.deepEqual(section, { _type: 'sectionCardGrid', background: { tone: 'warm' } });
  assert.deepEqual(neighbour, { _type: 'sectionQuote', background: { tone: 'ink' } });
});

// =============================================================================
// What the in-canvas layer offers, from a path alone
// =============================================================================

test('the section wrapper gets the swatch row', () => {
  assert.deepEqual(overlayControlsForPath('flexibleSections[_key=="k"]'), ['surface']);
  assert.deepEqual(overlayControlsForPath('sections[_key=="k"]'), ['surface']);
});

test('a section heading gets the accent-word picker', () => {
  assert.deepEqual(overlayControlsForPath('flexibleSections[_key=="k"].heading'), [
    'headingAccent',
  ]);
});

test('either half of a rich twin opens the text card', () => {
  assert.deepEqual(overlayControlsForPath('sections[_key=="k"].subhead'), ['text']);
  assert.deepEqual(overlayControlsForPath('sections[_key=="k"].intro'), ['text']);
  assert.deepEqual(overlayControlsForPath('sections[_key=="k"].body'), ['text']);
  assert.deepEqual(
    overlayControlsForPath('sections[_key=="k"].introRich[_key=="b"].children[_key=="c"].text'),
    ['text'],
  );
});

test('the hero strings get the text card, and nothing else on the document does', () => {
  assert.deepEqual(overlayControlsForPath('heroHeadline'), ['text']);
  assert.deepEqual(overlayControlsForPath('heroSubhead'), ['text']);
  assert.deepEqual(overlayControlsForPath('heroEyebrow'), []);
  assert.deepEqual(overlayControlsForPath('title'), []);
});

test('everything else is left to the host overlay', () => {
  assert.deepEqual(overlayControlsForPath('sections[_key=="k"].eyebrow'), []);
  assert.deepEqual(overlayControlsForPath('sections[_key=="k"].background.tone'), []);
  assert.deepEqual(overlayControlsForPath('sections[_key=="k"].cards[_key=="c"].heading'), []);
  assert.deepEqual(overlayControlsForPath('navItems[_key=="n"].label'), []);
  assert.deepEqual(overlayControlsForPath(''), []);
  assert.deepEqual(overlayControlsForPath(undefined), []);
});

// =============================================================================
// What a text popover writes to
// =============================================================================

const DOC = {
  heroHeadline: 'A place to think',
  heroSubhead: 'Two evenings a week.',
  flexibleSections: [
    { _key: 'a', _type: 'sectionCtaBand', subhead: 'Come and see.' },
    {
      _key: 'b',
      _type: 'sectionMediaFeature',
      body: 'Ignored once the twin has text.',
      bodyRich: [
        {
          _type: 'block',
          children: [
            { _type: 'span', text: 'Sixteen weeks, ', marks: [] },
            { _type: 'span', text: 'in person', marks: ['em'] },
          ],
        },
      ],
    },
    { _key: 'c', _type: 'sectionGallery', intro: 'No twin on this type.' },
  ],
};

test('a hero string resolves to a textarea seeded with itself', () => {
  assert.deepEqual(resolveTextTarget(DOC, 'heroSubhead'), {
    kind: 'plain',
    path: ['heroSubhead'],
    text: 'Two evenings a week.',
    runs: [],
    label: 'Subhead',
    rows: 4,
  });
});

test('an empty twin is seeded from the plain string it falls back to', () => {
  const target = resolveTextTarget(DOC, 'flexibleSections[_key=="a"].subhead');
  assert.equal(target?.kind, 'rich');
  assert.deepEqual(target?.path, ['flexibleSections', { _key: 'a' }, 'subheadRich']);
  assert.deepEqual(target?.runs, [{ text: 'Come and see.', strong: false, em: false }]);
  assert.equal(target?.label, 'Subhead');
});

test('a filled twin is seeded from the twin, marks and all', () => {
  const target = resolveTextTarget(DOC, 'flexibleSections[_key=="b"].bodyRich');
  assert.deepEqual(target?.path, ['flexibleSections', { _key: 'b' }, 'bodyRich']);
  assert.deepEqual(target?.runs, [
    { text: 'Sixteen weeks, ', strong: false, em: false },
    { text: 'in person', strong: false, em: true },
  ]);
  assert.equal(target?.label, 'Body');
});

test('clicking a span inside the twin opens the same twin', () => {
  const viaSpan = resolveTextTarget(
    DOC,
    'flexibleSections[_key=="b"].bodyRich[_key=="x"].children[_key=="y"].text',
  );
  assert.deepEqual(viaSpan, resolveTextTarget(DOC, 'flexibleSections[_key=="b"].bodyRich'));
});

test('a field with no twin on that type resolves to nothing', () => {
  assert.equal(resolveTextTarget(DOC, 'flexibleSections[_key=="c"].intro'), null);
  assert.equal(resolveTextTarget(DOC, 'flexibleSections[_key=="a"].heading'), null);
  assert.equal(resolveTextTarget(DOC, 'flexibleSections[_key=="zz"].subhead'), null);
  assert.equal(resolveTextTarget(DOC, 'heroEyebrow'), null);
});

test('stega markers never reach the box', () => {
  const stega = '\u200B\u{E0041}\uFEFF';
  const doc = { heroHeadline: `A place to th${stega}ink` };
  assert.equal(resolveTextTarget(doc, 'heroHeadline')?.text, 'A place to think');
});
