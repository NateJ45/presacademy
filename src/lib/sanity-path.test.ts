import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSanityPath,
  lastProperty,
  parentOf,
  readSectionPath,
  type PathSegment,
} from './sanity-path.ts';

test('parses a plain document field', () => {
  assert.deepEqual(parseSanityPath('heroHeadline'), ['heroHeadline']);
});

test('parses a keyed array member', () => {
  assert.deepEqual(parseSanityPath('flexibleSections[_key=="a1b2"]'), [
    'flexibleSections',
    { _key: 'a1b2' },
  ]);
});

test('parses a field inside a keyed array member', () => {
  assert.deepEqual(parseSanityPath('sections[_key=="x9"].heading'), [
    'sections',
    { _key: 'x9' },
    'heading',
  ]);
});

test('parses a portable-text span, the deepest shape the overlay hands us', () => {
  assert.deepEqual(
    parseSanityPath('flexibleSections[_key=="s1"].introRich[_key=="b1"].children[_key=="c1"].text'),
    [
      'flexibleSections',
      { _key: 's1' },
      'introRich',
      { _key: 'b1' },
      'children',
      { _key: 'c1' },
      'text',
    ],
  );
});

test('parses numeric indices', () => {
  assert.deepEqual(parseSanityPath('heroImages[0].alt'), ['heroImages', 0, 'alt']);
});

test('tolerates whitespace inside the key expression', () => {
  assert.deepEqual(parseSanityPath('sections[ _key == "k" ]'), ['sections', { _key: 'k' }]);
});

test('refuses a shape it does not understand rather than guessing', () => {
  assert.deepEqual(parseSanityPath('sections[title=="x"]'), []);
  assert.deepEqual(parseSanityPath('sections[_key=="x"'), []);
  assert.deepEqual(parseSanityPath('9lives'), []);
  assert.deepEqual(parseSanityPath(''), []);
  assert.deepEqual(parseSanityPath(undefined), []);
  assert.deepEqual(parseSanityPath(null), []);
});

test('lastProperty and parentOf', () => {
  const path: PathSegment[] = ['sections', { _key: 'k' }, 'heading'];
  assert.equal(lastProperty(path), 'heading');
  assert.deepEqual(parentOf(path), ['sections', { _key: 'k' }]);
  assert.equal(lastProperty(['sections', { _key: 'k' }]), '');
});

test('readSectionPath finds the section a path points into', () => {
  assert.deepEqual(readSectionPath('flexibleSections[_key=="k1"]'), {
    array: 'flexibleSections',
    key: 'k1',
    itemPath: ['flexibleSections', { _key: 'k1' }],
    rest: [],
  });
  assert.deepEqual(readSectionPath('sections[_key=="k2"].background.tone'), {
    array: 'sections',
    key: 'k2',
    itemPath: ['sections', { _key: 'k2' }],
    rest: ['background', 'tone'],
  });
});

test('readSectionPath ignores paths outside the page-builder arrays', () => {
  assert.equal(readSectionPath('heroHeadline'), null);
  assert.equal(readSectionPath('navItems[_key=="n1"].label'), null);
  assert.equal(readSectionPath('flexibleSections'), null);
  assert.equal(readSectionPath(''), null);
});
