// The Academy's page templates and seasonal saved sections (the authoring kit,
// PORTS.md card 109): src/sanity/templates.ts and src/sanity/sectionPatterns.ts.
// They put words on real pages, so the mistakes that would ship silently are
// checked here: a section type the page cannot hold, a key reused between two
// new pages, words that are not marked "Example:" (and so could pass for a fact
// about the school), an em-dash, a saved section past the twelve-section cap.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAGE_TEMPLATES, startingTemplates } from '../sanity/templates.ts';
import { SECTION_PATTERNS } from '../sanity/sectionPatterns.ts';
import { EXAMPLE_PREFIX } from './authoring.ts';

type Rec = Record<string, unknown>;

// The section types a page accepts, read from the schema source (importing it
// would pull in the whole Studio).
const blocksSrc = readFileSync(new URL('../sanity/schemaTypes/blocks.ts', import.meta.url), 'utf8');
const membersBlock =
  /export const FLEXIBLE_SECTION_MEMBERS = \[([\s\S]*?)\];/.exec(blocksSrc)?.[1] ?? '';
// The builder kit's blocks are spread into the members from builderSections.ts
// (refoundation phase B, 2026-10-27), so their names are read from that file.
const kitSrc = readFileSync(
  new URL('../sanity/schemaTypes/builderSections.ts', import.meta.url),
  'utf8',
);
const KIT_TYPES = [...kitSrc.matchAll(/^ {2}name: '(\w+Section)',$/gm)].map((m) => m[1]);
const ALLOWED = new Set([
  ...[...membersBlock.matchAll(/type: '([A-Za-z]+)'/g)].map((m) => m[1]),
  ...(membersBlock.includes('...builderSectionSchemas') ? KIT_TYPES : []),
]);

// Fields that hold a setting, an address or a button word, not page copy.
const NOT_COPY = new Set([
  '_type',
  '_key',
  'style',
  'align',
  'columns',
  'imageSide',
  'source',
  'variant',
  'ctaLabel',
  'ctaUrl',
  'marks',
  // The builder kit: settings, dates, times and button addresses.
  'linkType',
  'externalUrl',
  'layout',
  'urgency',
  'date',
  'startDate',
  'endDate',
  'startTime',
  'endTime',
  'icon',
]);

/** Every copy string in a value, with its path. */
function copyStrings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => copyStrings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value as Rec).flatMap(([k, v]) =>
      NOT_COPY.has(k) ? [] : copyStrings(v, path ? `${path}.${k}` : k),
    );
  }
  return [];
}

function keys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keys);
  if (value && typeof value === 'object') {
    const r = value as Rec;
    return [...(typeof r._key === 'string' ? [r._key] : []), ...Object.values(r).flatMap(keys)];
  }
  return [];
}

const everySectionList = [
  ...PAGE_TEMPLATES.map((t) => ({ name: `template ${t.id}`, make: t.sections })),
  ...SECTION_PATTERNS.map((p) => ({ name: `pattern ${p.id}`, make: p.sections })),
];

describe('page templates and saved sections', () => {
  it('found the page section types in blocks.ts', () => {
    assert.ok(ALLOWED.size > 20, `only ${ALLOWED.size} section types parsed`);
    assert.ok(
      KIT_TYPES.length >= 17 && ALLOWED.has('eventDetailsSection'),
      'builder kit not found',
    );
  });

  for (const { name, make } of everySectionList) {
    it(`${name}: only section types a page can hold`, () => {
      for (const s of make()) assert.ok(ALLOWED.has(String(s._type)), `${name}: ${s._type}`);
    });

    it(`${name}: every word is marked as an example, with no em-dash`, () => {
      for (const [path, text] of copyStrings(make())) {
        assert.ok(text.startsWith(EXAMPLE_PREFIX), `${name} ${path}: "${text}"`);
        assert.ok(!text.includes('—'), `${name} ${path} has an em-dash`);
      }
    });

    it(`${name}: fresh, unique keys every time`, () => {
      const a = keys(make());
      const b = keys(make());
      assert.equal(new Set(a).size, a.length, `${name} repeats a key`);
      assert.ok(!a.some((k) => b.includes(k)), `${name} gives two new pages the same keys`);
      const sections = make();
      assert.ok(
        sections.every((s) => typeof s._key === 'string'),
        `${name}: a section has no key`,
      );
    });

    it(`${name}: required fields are filled`, () => {
      for (const s of make()) {
        if (s._type === 'sectionInlineBand') assert.ok(s.headline && s.ctaLabel, name);
        if (s._type === 'sectionCtaBand') assert.ok(s.headline, name);
        if (s._type === 'sectionScholarship') assert.ok(s.headline, name);
        if (s._type === 'sectionCourseRail') assert.ok(s.source && s.variant && s.heading, name);
        if (s._type === 'eventDetailsSection')
          assert.ok(s.title && s.place && (s.occurrences as Rec[]).every((o) => o.date), name);
        if (s._type === 'noticeSection') assert.ok(s.message, name);
        if (s._type === 'countdownSection') assert.ok(s.eventName && s.startDate, name);
        if (s._type === 'sectionSteps')
          assert.ok(
            (s.steps as Rec[]).every((st) => st.title),
            name,
          );
      }
    });
  }

  it('saved sections stay within the twelve-section cap and have unique ids', () => {
    const ids = SECTION_PATTERNS.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const p of SECTION_PATTERNS) {
      const n = p.sections().length;
      assert.ok(n >= 1 && n <= 12, `${p.id} has ${n} sections`);
      assert.ok(!p.title.includes('—') && !p.note.includes('—'), p.id);
    }
  });

  it('every "+ New" template has a unique id and a fresh value', () => {
    const all = startingTemplates();
    const ids = all.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const t of all) {
      assert.equal(typeof t.value, 'function', `${t.id}: value must be a function`);
      for (const [path, text] of copyStrings((t.value as () => Rec)())) {
        if (
          ['level', 'format', 'eventType', 'category', 'audience', 'registrationLabel'].some((k) =>
            path.endsWith(k),
          )
        )
          continue;
        assert.ok(text.startsWith(EXAMPLE_PREFIX), `${t.id} ${path}: "${text}"`);
      }
    }
  });
});
