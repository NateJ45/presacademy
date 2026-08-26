import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHeadingIds, HEADING_ID_FALLBACK } from './heading-id.ts';

// The rules that matter: ids are derived from the heading text, unique within
// one render pass, and an explicit id always wins untouched.

test('a heading is slugified into its id', () => {
  const id = createHeadingIds();
  assert.equal(id('Our mission'), 'our-mission');
  assert.equal(id('What We Believe'), 'what-we-believe');
});

test('a repeated heading gets a numeric suffix, first come first served', () => {
  const id = createHeadingIds();
  assert.equal(id('Our mission'), 'our-mission');
  assert.equal(id('Our mission'), 'our-mission-2');
  assert.equal(id('Our mission'), 'our-mission-3');
});

test('the suffix search skips ids that are already taken', () => {
  const id = createHeadingIds();
  assert.equal(id('Steps'), 'steps');
  assert.equal(id('Steps 2'), 'steps-2'); // slugifies straight onto the suffix
  assert.equal(id('Steps'), 'steps-3'); // so the collision hops over it
});

test('an explicit id passes through verbatim', () => {
  const id = createHeadingIds();
  assert.equal(id('Our mission', 'privacy-hero-heading'), 'privacy-hero-heading');
  assert.equal(id(undefined, 'faculty-list'), 'faculty-list');
});

test('an explicit id is trimmed', () => {
  const id = createHeadingIds();
  assert.equal(id('Anything', '  contact-form  '), 'contact-form');
});

test('a blank explicit id falls back to the heading', () => {
  const id = createHeadingIds();
  assert.equal(id('Our mission', ''), 'our-mission');
  assert.equal(id('How we teach', '   '), 'how-we-teach');
  assert.equal(id('Why we exist', null), 'why-we-exist');
});

test('an explicit id is NOT deduplicated (an authoring mistake stays visible)', () => {
  const id = createHeadingIds();
  assert.equal(id('One', 'shared'), 'shared');
  assert.equal(id('Two', 'shared'), 'shared');
});

test('an explicit id still blocks a later derived id from colliding with it', () => {
  const id = createHeadingIds();
  assert.equal(id('Something else', 'our-mission'), 'our-mission');
  assert.equal(id('Our mission'), 'our-mission-2');
});

test('a heading with no sluggable characters uses the fallback stem', () => {
  const id = createHeadingIds();
  assert.equal(id(''), HEADING_ID_FALLBACK);
  assert.equal(id(undefined), `${HEADING_ID_FALLBACK}-2`);
  assert.equal(id('!!!'), `${HEADING_ID_FALLBACK}-3`);
});

test('each allocator is independent (one per render pass)', () => {
  const a = createHeadingIds();
  const b = createHeadingIds();
  assert.equal(a('Our mission'), 'our-mission');
  assert.equal(b('Our mission'), 'our-mission');
});

test('issued lists the ids in the order they were handed out', () => {
  const id = createHeadingIds();
  id('Our mission');
  id('Our mission');
  id('Anything', 'legacy');
  assert.deepEqual([...id.issued], ['our-mission', 'our-mission-2', 'legacy']);
});
