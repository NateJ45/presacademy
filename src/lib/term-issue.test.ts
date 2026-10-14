// Unit tests for src/lib/term-issue.ts (Term Issue PR 2, 2026-10-13).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  splitTermTitle,
  heroCourses,
  teacherSurnames,
  contentsRow,
  finderPick,
  shortDay,
  issueLine,
  fillTermTokens,
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

// ---- PR 4 (2026-10-13): the header issue line and the Next issue copy -------

test('shortDay reads a calendar date as "Tue 26 Jan", whatever the time zone', () => {
  assert.equal(shortDay('2027-01-26'), 'Tue 26 Jan');
  assert.equal(shortDay('2026-11-15'), 'Sun 15 Nov');
  assert.equal(shortDay(''), '');
  assert.equal(shortDay('soon'), '');
});

test('issueLine says "enrolling now" only when registration is open', () => {
  const spring = {
    title: 'Spring 2027',
    startDate: '2027-01-26',
    registrationOpens: '2026-11-15',
    registrationDeadline: '2027-01-12',
    status: 'upcoming',
  };
  // Before registration opens: the date, not a promise.
  assert.deepEqual(issueLine(spring, '2026-10-13'), {
    short: 'Spring 2027 · first class 26 Jan',
    medium: 'Spring 2027 term · registration opens Sun 15 Nov',
    full: 'Spring 2027 term · registration opens Sun 15 Nov · first class Tue 26 Jan',
  });
  // Opened by date, or marked open: enrolling now.
  assert.equal(
    issueLine(spring, '2026-12-01')?.full,
    'Spring 2027 term · enrolling now · first class Tue 26 Jan',
  );
  assert.equal(
    issueLine({ ...spring, status: 'open' }, '2026-10-13')?.medium,
    'Spring 2027 term · enrolling now',
  );
  // Past the apply-by date, or marked closed.
  assert.equal(issueLine(spring, '2027-01-20')?.medium, 'Spring 2027 term · registration closed');
  assert.equal(
    issueLine({ ...spring, status: 'closed' }, '2026-12-01')?.medium,
    'Spring 2027 term · registration closed',
  );
  // No registration dates at all: the state is left out, not guessed.
  assert.equal(
    issueLine({ title: 'Fall 2027', startDate: '2027-09-07' }, '2027-01-01')?.full,
    'Fall 2027 term · first class Tue 7 Sep',
  );
  assert.equal(issueLine({ title: 'Summer term' }, '2027-01-01')?.short, 'Summer term');
  assert.equal(issueLine(null, '2027-01-01'), null);
});

test('fillTermTokens drops in the term and its season', () => {
  assert.equal(
    fillTermTokens('{term} is taking shape.', 'Summer 2027'),
    'Summer 2027 is taking shape.',
  );
  assert.equal(
    fillTermTokens('Get the {season} issue first.', 'Summer 2027'),
    'Get the summer issue first.',
  );
  assert.equal(fillTermTokens('Get the {season} issue.', ''), 'Get the next issue.');
  assert.equal(fillTermTokens('No {tokens} here', 'Fall 2027'), 'No {tokens} here');
});
