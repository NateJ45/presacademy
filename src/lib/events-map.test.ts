// The Academy only (not PORTABLE). Pins this site's own events map
// (src/config/events.ts, PORTS.md card 217) link by link, and the privacy wording
// that is derived from it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyLink } from './track.ts';
import { eventKinds, eventsSentence } from './event-kinds.ts';
import { eventsConfig } from '../config/events.ts';

const OWN = 'presbyterianacademy.org';

function hit(href: string, where = 'page') {
  return classifyLink(href, new URL(href, `https://${OWN}/page/`).href, OWN, where, eventsConfig);
}

test('the Calendly booking link is booking_click, with no address in it', () => {
  assert.deepEqual(hit('https://calendly.com/some-academy/intro', 'aside'), {
    event: 'booking_click',
    params: { destination: 'calendly', location: 'aside' },
  });
  assert.equal(hit('https://www.calendly.com/some-academy/intro')?.event, 'booking_click');
});

test('the email fallback for the intro button is a contact_click, not a booking', () => {
  assert.deepEqual(hit('mailto:info@example.org', 'aside'), {
    event: 'contact_click',
    params: { method: 'email', location: 'aside' },
  });
});

test('phone, map and video links keep the built-in events', () => {
  assert.equal(hit('tel:+15135550100')?.event, 'contact_click');
  assert.equal(hit('https://maps.apple.com/?q=x')?.event, 'directions_click');
  assert.equal(hit('https://www.youtube.com/watch?v=abc')?.event, 'watch_click');
});

test('other sites and files are left to Enhanced Measurement', () => {
  assert.equal(hit('https://example.com/a'), null);
  assert.equal(hit('https://example.com/syllabus.pdf'), null);
  assert.equal(hit('/courses/'), null);
});

test('the privacy sentence names what is counted and nothing that is off', () => {
  const kinds = eventKinds(eventsConfig).join(' | ');
  assert.match(kinds, /book an intro call/);
  assert.match(kinds, /email and phone links/);
  assert.match(kinds, /whether a form is seen, used or sent/);
  assert.doesNotMatch(kinds, /links to other sites|file downloads|search|article/);
  assert.match(eventsSentence(eventsConfig), /^It also records what visitors do on the site: /);
});

test('the seed carries the same sentence the privacy page derives', () => {
  const seed = readFileSync(new URL('../../scripts/seed-editability.mjs', import.meta.url), 'utf8');
  assert.ok(seed.includes(eventsSentence(eventsConfig)), 'scripts/seed-editability.mjs is stale');
});
