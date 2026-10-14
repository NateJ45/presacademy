// Unit tests for src/lib/chrome.ts (the masthead, contents menu and back cover).
// Run with `npm run test:unit`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  numberWord,
  navNote,
  NAV_NOTE_FALLBACK,
  menuFact,
  buildIndex,
  orderShelf,
  issueSummary,
} from './chrome.ts';

test('numberWord spells 0 to 12 and prints digits above', () => {
  assert.equal(numberWord(8), 'eight');
  assert.equal(numberWord(1), 'one');
  assert.equal(numberWord(12), 'twelve');
  assert.equal(numberWord(14), '14');
  assert.equal(numberWord(-1), '');
});

test('navNote builds the strip note from real counts and drops unknowns', () => {
  assert.equal(
    navNote({ courses: 8, faculty: 5 }, 'West Chester Township'),
    'Eight courses · five teachers · in West Chester Township',
  );
  assert.equal(navNote({ courses: 1, faculty: 0 }, ''), 'One course');
  assert.equal(navNote({ courses: 0, faculty: null }, null), NAV_NOTE_FALLBACK);
  assert.equal(
    navNote({}, 'West Chester Township'),
    `${NAV_NOTE_FALLBACK} · in West Chester Township`,
  );
});

test('menuFact derives Courses, Faculty and Pricing, then the menu note, then a fallback', () => {
  const counts = { courses: 8, faculty: 5, lowestPrice: 95 };
  assert.equal(menuFact('/courses/', counts), '8 this year');
  assert.equal(menuFact('/faculty/', counts), '5 teachers');
  assert.equal(menuFact('/pricing/', counts), 'from $95');
  // The counted rows ignore a note while the count is known...
  assert.equal(menuFact('/courses/', counts, 'Ignored'), '8 this year');
  // ...and use it (or the fallback) when the dataset is empty.
  assert.equal(menuFact('/courses/', {}, 'All of them'), 'All of them');
  assert.equal(menuFact('/courses/', {}), 'The catalog');
  assert.equal(menuFact('/events/', counts, 'Info nights'), 'Info nights');
  assert.equal(menuFact('/events/', counts, '   '), 'Info nights');
  assert.equal(menuFact('/somewhere-new/', counts), '');
});

test('buildIndex de-duplicates by address, sorts A to Z and marks initials', () => {
  const index = buildIndex([
    { label: 'Courses', href: '/courses/' },
    { label: 'Get started', href: '/get-started/' },
    { label: 'Request information', href: '/get-started/' },
    { label: 'FAQ', href: '/faq/' },
    { label: 'about', href: '/about/' },
    { label: 'Faculty', href: '/faculty/' },
    { label: 'Accessibility', href: '/accessibility/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Blog', href: 'https://example.com' },
    { label: '', href: '/nowhere/' },
  ]);
  assert.deepEqual(
    index.map((e) => [e.label, e.initial ?? '']),
    [
      ['about', 'A'],
      ['Accessibility', ''],
      ['Blog', 'B'],
      ['Contact', 'C'],
      ['Courses', ''],
      ['Faculty', 'F'],
      ['FAQ', ''],
      ['Get started', 'G'],
    ],
  );
  assert.equal(index.find((e) => e.label === 'Blog')?.external, true);
});

test('orderShelf puts the next term first, then Start here, then featured', () => {
  const courses = [
    { slug: 'a' },
    { slug: 'b', featured: true },
    { slug: 'c', startHere: true },
    { slug: 'd', inTerm: true },
    { slug: 'e', inTerm: true, startHere: true },
    { slug: 'b', featured: true },
    { slug: '' },
  ];
  assert.deepEqual(
    orderShelf(courses, 6).map((c) => c.slug),
    ['e', 'd', 'c', 'b', 'a'],
  );
  assert.deepEqual(
    orderShelf(courses, 3).map((c) => c.slug),
    ['e', 'd', 'c'],
  );
});

test('issueSummary reads like the catalog line', () => {
  assert.equal(issueSummary(8, '2027-01-26'), 'Eight courses, first class Tue 26 Jan');
  assert.equal(issueSummary(0, '2027-01-26'), 'First class Tue 26 Jan');
  assert.equal(issueSummary(8, null), 'Eight courses');
  assert.equal(issueSummary(null, null), '');
});
