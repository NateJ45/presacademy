// Unit tests for src/lib/term-issue.ts (Term Issue PR 2, 2026-10-13).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  splitTermTitle,
  heroCourses,
  teacherSurnames,
  contentsRow,
  finderPick,
} from './term-issue.ts';

test('splitTermTitle puts a trailing year on its own line', () => {
  assert.deepEqual(splitTermTitle('Spring 2027'), { lead: 'Spring', year: '2027' });
  assert.deepEqual(splitTermTitle('  Late  Summer 2027 '), { lead: 'Late Summer', year: '2027' });
  assert.deepEqual(splitTermTitle('Fall intensive'), { lead: 'Fall intensive', year: '' });
  assert.deepEqual(splitTermTitle(null), { lead: '', year: '' });
});

test('heroCourses takes Start here first, tops up from featured, no repeats', () => {
  const a = { slug: 'a' };
  const b = { slug: 'b' };
  const c = { slug: 'c' };
  const d = { slug: 'd' };
  assert.deepEqual(heroCourses([a, b], [b, c, d]), [a, b, c]);
  assert.deepEqual(heroCourses([], [c]), [c]);
  assert.deepEqual(heroCourses([], []), []);
  assert.deepEqual(heroCourses([a, { slug: '' }], [a]), [a]);
});

test('teacherSurnames keeps the last word of each name', () => {
  assert.equal(teacherSurnames([{ name: 'Miriam Hale' }]), 'Hale');
  assert.equal(
    teacherSurnames([{ name: 'Samuel Okonkwo' }, { name: 'Thomas Reese' }]),
    'Okonkwo, Reese',
  );
  assert.equal(teacherSurnames(null), '');
});

const base = {
  title: 'T',
  slug: 't',
  courseCode: ' SCR 101 ',
  instructors: [{ name: 'Miriam Hale' }],
};

test('contentsRow: a cohort in the next term shows sessions and status', () => {
  const row = contentsRow(
    {
      ...base,
      nextOffering: {
        status: 'waitlist',
        sessions: 10,
        term: { _id: 'spring', title: 'Spring 2027' },
      },
    },
    'spring',
  );
  assert.equal(row.code, 'SCR 101');
  assert.equal(row.meta, 'Hale · 10 sessions · waitlist');
  assert.equal(row.tone, 'waitlist');
});

test('contentsRow: a later term shows its season', () => {
  const row = contentsRow(
    {
      ...base,
      nextOffering: { status: 'open', sessions: 6, term: { _id: 'summer', title: 'Summer 2027' } },
    },
    'spring',
  );
  assert.equal(row.meta, 'Hale · summer · open');
  assert.equal(row.tone, 'open');
});

test('contentsRow: no upcoming cohort reads "new dates soon"', () => {
  const row = contentsRow({ ...base, nextOffering: null }, 'spring');
  assert.equal(row.meta, 'Hale · new dates soon');
  assert.equal(row.tone, 'muted');
});

test('finderPick: question 2 wins, then question 1, then the default', () => {
  assert.equal(finderPick('q1', 'q2', 'd'), 'q2');
  assert.equal(finderPick('q1', null, 'd'), 'q1');
  assert.equal(finderPick(null, null, 'd'), 'd');
  assert.equal(finderPick(null, undefined, null), null);
});
