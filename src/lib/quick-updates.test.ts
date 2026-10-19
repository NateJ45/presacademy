// The Academy's Quick update builders (src/lib/quick-updates.ts): each one must
// be a complete, valid document, because the Quick update tool publishes it
// without the Studio's validation.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildEnrollmentReminder,
  buildEvent,
  buildNotice,
  daysFrom,
  endOfDay,
  noticeName,
  spokenDate,
} from './quick-updates.ts';

describe('notices', () => {
  it('has every required field and ends at the end of the last day', () => {
    const n = buildNotice({ message: '  Enrollment for spring is open. ', lastDay: '2026-11-30' });
    assert.equal(n._type, 'announcement');
    assert.equal(n.message, 'Enrollment for spring is open.');
    assert.ok(n.title.length > 0, 'the required Internal name is filled');
    assert.equal(n.enabled, true);
    assert.equal(n.style, 'info');
    assert.equal(n.endDate, endOfDay('2026-11-30'));
    const end = new Date(n.endDate);
    assert.equal(end.getHours(), 23);
    assert.equal(end.getMinutes(), 59);
    assert.equal(n.link, undefined);
  });

  it('a link becomes the notice link; the style can be urgent', () => {
    const n = buildNotice(
      { message: 'Tonight’s class is cancelled', lastDay: '2026-12-06', link: ' /courses/ ' },
      'urgent',
    );
    assert.deepEqual(n.link, { label: 'Find out more', url: '/courses/' });
    assert.equal(n.style, 'urgent');
  });

  it('only uses styles the announcement schema offers', () => {
    const schema = readFileSync(
      new URL('../sanity/schemaTypes/announcement.ts', import.meta.url),
      'utf8',
    );
    for (const style of ['info', 'urgent']) {
      assert.ok(schema.includes(`value: '${style}'`), `announcement has no "${style}" style`);
    }
  });

  it('the Studio name is short and dated', () => {
    assert.equal(noticeName('Snow', '2026-12-06'), 'Snow (until 2026-12-06)');
    assert.ok(noticeName('x'.repeat(100), '2026-12-06').length < 70);
  });
});

describe('events', () => {
  it('is a whole one-time event with a dated web address', () => {
    const e = buildEvent({ title: ' Spring info night ', start: '2027-01-12T19:00' });
    assert.equal(e._type, 'event');
    assert.equal(e.title, 'Spring info night');
    assert.equal(e.eventType, 'oneTime');
    assert.equal(e.slug.current, 'spring-info-night-2027-01-12');
    assert.equal(e.category, 'Info session');
    assert.equal(e.allDay, false);
    assert.ok(!Number.isNaN(Date.parse(e.start)));
    assert.equal(e.location, undefined);
  });

  it('keeps a known kind, trims the place and caps the summary', () => {
    const e = buildEvent({
      title: 'Calvin and the city',
      start: '2027-02-02T18:30',
      category: 'Open lecture',
      location: '  Fellowship hall ',
      summary: 'y'.repeat(300),
    });
    assert.equal(e.category, 'Open lecture');
    assert.equal(e.location, 'Fellowship hall');
    assert.equal(e.summary?.length, 240);
  });

  it('an unknown kind falls back to an info session', () => {
    assert.equal(
      buildEvent({ title: 'X', start: '2027-01-01T10:00', category: 'Party' }).category,
      'Info session',
    );
  });

  it('a sign-up link becomes the registration button', () => {
    const e = buildEvent({
      title: 'Info night',
      start: '2027-01-12T19:00',
      registrationUrl: ' https://example.org/rsvp ',
    });
    assert.equal(e.registrationUrl, 'https://example.org/rsvp');
    assert.equal(e.registrationLabel, 'Save your seat');
    const none = buildEvent({ title: 'Info night', start: '2027-01-12T19:00' });
    assert.equal(none.registrationUrl, undefined);
    assert.equal(none.registrationLabel, undefined);
  });

  it('the event fields it fills exist on the event schema', () => {
    const schema = readFileSync(new URL('../sanity/schemaTypes/event.ts', import.meta.url), 'utf8');
    for (const name of ['registrationUrl', 'registrationLabel', 'summary', 'location']) {
      assert.ok(schema.includes(`name: '${name}'`), `event has no "${name}" field`);
    }
  });

  it('only uses event kinds the event schema offers', () => {
    const schema = readFileSync(new URL('../sanity/schemaTypes/event.ts', import.meta.url), 'utf8');
    for (const kind of ['Info session', 'Open lecture', 'Workshop', 'oneTime']) {
      assert.ok(schema.includes(`value: '${kind}'`), `event has no "${kind}" value`);
    }
  });
});

describe('dates', () => {
  it('counts days in local time', () => {
    assert.equal(daysFrom(new Date(2026, 9, 18, 12), 7), '2026-10-25');
    assert.equal(daysFrom(new Date(2026, 11, 30, 12), 3), '2027-01-02');
  });
});

describe('enrollment reminder', () => {
  const term = {
    title: 'Spring 2027',
    startDate: '2027-01-11',
    registrationDeadline: '2026-12-15',
  };

  it('names the Apply by date and shows until then', () => {
    const n = buildEnrollmentReminder({}, term, '2026-11-20');
    assert.equal(n._type, 'announcement');
    assert.equal(n.message, 'Enrollment for Spring 2027 closes December 15. Save your seat today.');
    assert.equal(n.style, 'special');
    assert.equal(n.endDate, endOfDay('2026-12-15'));
    assert.deepEqual(n.link, { label: 'Find out more', url: '/get-started/' });
    assert.equal(n.enabled, true);
  });

  it('after the Apply by date, names the first day of term instead', () => {
    const n = buildEnrollmentReminder({}, term, '2026-12-20');
    assert.equal(n.message, 'Spring 2027 begins January 11. There is still time to join.');
    assert.equal(n.endDate, endOfDay('2027-01-11'));
    const noDeadline = buildEnrollmentReminder(
      {},
      { title: 'Fall 2027', startDate: '2027-09-07' },
      '2027-08-01',
    );
    assert.equal(noDeadline.endDate, endOfDay('2027-09-07'));
  });

  it('what the editor typed wins', () => {
    const n = buildEnrollmentReminder(
      { message: ' Two seats left in Romans. ', lastDay: '2026-12-01' },
      term,
      '2026-11-20',
    );
    assert.equal(n.message, 'Two seats left in Romans.');
    assert.equal(n.endDate, endOfDay('2026-12-01'));
  });

  it('with no term it needs words, and says why in plain English', () => {
    assert.throws(() => buildEnrollmentReminder({}, null, '2026-11-20'), /no upcoming term/);
    const n = buildEnrollmentReminder({ message: 'Enrollment is open.' }, null, '2026-11-20');
    assert.equal(n.endDate, endOfDay('2026-11-20'));
  });

  it('says dates the way people do, whatever the time zone', () => {
    assert.equal(spokenDate('2027-03-01'), 'March 1');
    assert.equal(spokenDate('2026-12-31T23:00:00Z'), 'December 31');
  });
});
