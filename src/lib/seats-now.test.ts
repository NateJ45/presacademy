// Safe to edit by hand
// The "Seats right now" override on a course (Quick update, "Mark a course full or
// waitlisted"): when set it wins over the next offering's Status and Seats note in
// NEXT_OFFERING (src/lib/queries.ts), and when empty the offering decides. The GROQ is
// read from queries.ts itself and evaluated with groq-js (which Sanity brings), so
// this fails if the projection or its `^` ever changes.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse, evaluate } from 'groq-js';

const source = readFileSync(new URL('./queries.ts', import.meta.url), 'utf8');
const match = source.match(/const NEXT_OFFERING = `([\s\S]*?)`;/);

const term = {
  _id: 'term-spring',
  _type: 'term',
  title: 'Spring',
  slug: { current: 'spring' },
  startDate: '2027-01-11',
  endDate: '2027-04-23',
  status: 'open',
};

const course = (extra: Record<string, unknown>) => ({
  _id: 'c1',
  _type: 'course',
  title: 'A course',
  offerings: [
    {
      _key: 'o1',
      term: { _type: 'reference', _ref: 'term-spring' },
      status: 'open',
      seatsNote: 'A few seats left',
    },
  ],
  ...extra,
});

async function next(extra: Record<string, unknown>) {
  assert.ok(match, 'NEXT_OFFERING is in queries.ts');
  const params = { today: '2026-10-19' };
  const tree = parse(`*[_type == "course"][0]{ ${match[1]} }`, { params });
  const value = await evaluate(tree, { dataset: [term, course(extra)], params });
  const result = (await value.get()) as {
    nextOffering: { status: string; seatsNote: string | null };
  };
  return result.nextOffering;
}

describe('seats right now (the course overrides its offering)', () => {
  it('leaves the offering alone when nothing is set', async () => {
    const o = await next({});
    assert.equal(o.status, 'open');
    assert.equal(o.seatsNote, 'A few seats left');
  });

  it('a hand-set status wins, and takes its own note, never the offering’s', async () => {
    const o = await next({ seatsNow: 'waitlist' });
    assert.equal(o.status, 'waitlist');
    assert.equal(o.seatsNote, null);
    const full = await next({ seatsNow: 'closed', seatsNowNote: 'Full this term' });
    assert.equal(full.status, 'closed');
    assert.equal(full.seatsNote, 'Full this term');
  });
});
