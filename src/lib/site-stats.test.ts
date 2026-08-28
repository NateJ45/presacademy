// =============================================================================
// site-stats — day bucketing and response shaping
// =============================================================================
// Ported from the WCP site with the tests intact (2026-08-28), rewritten from
// Vitest onto this repo's runner (node:test). The endpoint and the Studio tool
// both read this module, so a bucketing bug here would show two different
// stories in one panel. Hence the tests.
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STATS_DAYS,
  barFractions,
  bucketDay,
  dayWindow,
  shapeStats,
  utcDay,
  type StatsRow,
} from './site-stats.ts';

const NOW = new Date('2026-08-28T15:20:00Z');
const SCRIPT = 'presacademy';

test('utcDay takes the UTC calendar day, not the local one', () => {
  // 00:30 UTC is still the previous evening in US time; the bucket is
  // deliberately UTC so the endpoint and the tool never disagree.
  assert.equal(utcDay(new Date('2026-08-28T00:30:00Z')), '2026-08-28');
  assert.equal(utcDay(new Date('2026-08-28T23:59:59Z')), '2026-08-28');
});

test('dayWindow ends on today and runs oldest first', () => {
  const w = dayWindow(NOW, 28);
  assert.equal(w.length, 28);
  assert.equal(w[27], '2026-08-28');
  assert.equal(w[0], '2026-08-01');
});

test('dayWindow crosses a month boundary correctly', () => {
  assert.deepEqual(dayWindow(new Date('2026-03-02T09:00:00Z'), 4), [
    '2026-02-27',
    '2026-02-28',
    '2026-03-01',
    '2026-03-02',
  ]);
});

test('dayWindow defaults to the panel window', () => {
  assert.equal(dayWindow(NOW).length, STATS_DAYS);
});

test('bucketDay reads the date dimension', () => {
  assert.equal(bucketDay({ dimensions: { date: '2026-08-20' } }), '2026-08-20');
});

test('bucketDay reads the hourly fallback dimension down to its day', () => {
  assert.equal(bucketDay({ dimensions: { datetimeHour: '2026-08-20T13:00:00Z' } }), '2026-08-20');
});

test('bucketDay returns null for a row with no usable time', () => {
  assert.equal(bucketDay({}), null);
  assert.equal(bucketDay({ dimensions: null }), null);
  assert.equal(bucketDay({ dimensions: { date: 'yesterday' } }), null);
});

const shape = (rows: StatsRow[], days = 5) =>
  shapeStats(rows, { now: NOW, scriptName: SCRIPT, days });

test('shapeStats fills every day, so a quiet day reads as zero not a gap', () => {
  const out = shape([{ dimensions: { date: '2026-08-26' }, sum: { requests: 40, errors: 1 } }]);
  assert.deepEqual(
    out.days.map((d) => d.date),
    ['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28'],
  );
  assert.deepEqual(
    out.days.map((d) => d.requests),
    [0, 0, 40, 0, 0],
  );
  assert.equal(out.since, '2026-08-24');
  assert.equal(out.until, '2026-08-28');
});

test('shapeStats adds several rows landing on the same day (the hourly path)', () => {
  const out = shape([
    { dimensions: { datetimeHour: '2026-08-27T01:00:00Z' }, sum: { requests: 10, errors: 1 } },
    { dimensions: { datetimeHour: '2026-08-27T02:00:00Z' }, sum: { requests: 5, errors: 0 } },
    { dimensions: { datetimeHour: '2026-08-28T00:00:00Z' }, sum: { requests: 7, errors: 2 } },
  ]);
  assert.deepEqual(
    out.days.find((d) => d.date === '2026-08-27'),
    { date: '2026-08-27', requests: 15, errors: 1 },
  );
  assert.equal(out.days.find((d) => d.date === '2026-08-28')?.requests, 7);
});

test('shapeStats drops rows outside the window instead of skewing the totals', () => {
  const out = shape([
    { dimensions: { date: '2026-08-01' }, sum: { requests: 9999, errors: 0 } },
    { dimensions: { date: '2026-08-25' }, sum: { requests: 3, errors: 0 } },
  ]);
  assert.equal(out.last28.requests, 3);
});

test('shapeStats coerces junk counts to zero rather than rendering NaN', () => {
  const out = shape([
    { dimensions: { date: '2026-08-25' }, sum: { requests: null, errors: undefined } },
    { dimensions: { date: '2026-08-26' }, sum: { requests: -4, errors: 2.6 } },
  ]);
  assert.deepEqual(
    out.days.find((d) => d.date === '2026-08-25'),
    { date: '2026-08-25', requests: 0, errors: 0 },
  );
  assert.deepEqual(
    out.days.find((d) => d.date === '2026-08-26'),
    { date: '2026-08-26', requests: 0, errors: 3 },
  );
});

test('shapeStats totals the last 7 days separately from the last 28', () => {
  const rows: StatsRow[] = dayWindow(NOW, 28).map((date) => ({
    dimensions: { date },
    sum: { requests: 10, errors: 1 },
  }));
  const out = shapeStats(rows, { now: NOW, scriptName: SCRIPT });
  assert.deepEqual(out.last7, { days: 7, requests: 70, errors: 7 });
  assert.deepEqual(out.last28, { days: 28, requests: 280, errors: 28 });
});

test('shapeStats survives an empty answer from a brand-new site', () => {
  const out = shapeStats([], { now: NOW, scriptName: SCRIPT });
  assert.equal(out.days.length, 28);
  assert.equal(out.last7.requests, 0);
  assert.equal(out.last28.requests, 0);
  assert.equal(out.ok, true);
});

test('shapeStats records when the numbers were read', () => {
  const out = shapeStats([], {
    now: NOW,
    scriptName: SCRIPT,
    fetchedAt: new Date('2026-08-28T15:00:00Z'),
  });
  assert.equal(out.fetchedAt, '2026-08-28T15:00:00.000Z');
});

test('barFractions scales every bar against the busiest day', () => {
  assert.deepEqual(
    barFractions([
      { date: 'a', requests: 50, errors: 0 },
      { date: 'b', requests: 100, errors: 0 },
      { date: 'c', requests: 0, errors: 0 },
    ]),
    [0.5, 1, 0],
  );
});

test('barFractions draws a flat baseline instead of dividing by zero', () => {
  assert.deepEqual(
    barFractions([
      { date: 'a', requests: 0, errors: 0 },
      { date: 'b', requests: 0, errors: 0 },
    ]),
    [0, 0],
  );
});
