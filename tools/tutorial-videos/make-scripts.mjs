// Safe to edit by hand (this site's own file)
// =============================================================================
// Writes the Academy's six video scripts (tools/tutorial-videos/scripts/*.json)
// =============================================================================
// The scripts are plain JSON for tools/tutorial-videos/record.mjs; this file
// writes them from a few helpers so the steps stay short to read and the
// captions stay in one place. The shot-by-shot plan is docs/agent/studio-videos.md.
// Run: node tools/tutorial-videos/make-scripts.mjs
// Record (sample data, one at a time):
//   node --import ./tools/studio-media/sample-data.mjs tools/tutorial-videos/record.mjs \
//        tools/tutorial-videos/scripts/<slug>.json --serve --music <the track, outside the repo>
// =============================================================================

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'scripts');
mkdirSync(OUT, { recursive: true });

// A phone: the Studio's own narrow layout. A desk: the default size.
const PHONE = { width: 390, height: 844 };
// Sanity's "What's new" toast and the permission banner are covered on screen.
const COVER = {
  selectors: [
    'div[data-ui="Popover__wrapper"]:has([data-ui="whats-new-root"])',
    '[data-testid="permission-check-banner"]',
  ],
};

const cap = (text, ms = 2600, extra = {}) => ({ do: 'caption', text, ms, ...extra });
const go = (path, caption, ms) => ({
  do: 'goto',
  path,
  ...(caption ? { caption } : {}),
  ...(ms ? { ms } : {}),
});
const tile = (id) => `[data-quick="${id}"]`;
const ring = (target, caption, ms = 2400, hold = 2000) => ({
  do: 'ring',
  target,
  caption,
  ms,
  hold,
});
const click = (target, caption, ms) => ({
  do: 'click',
  target,
  ...(caption ? { caption } : {}),
  ...(ms ? { ms } : {}),
});
const type = (target, text, caption, ms) => ({
  do: 'type',
  target,
  text,
  ...(caption ? { caption } : {}),
  ...(ms ? { ms } : {}),
});
const waitFor = (target) => ({ do: 'waitFor', target });
const key = (k) => ({ do: 'press', key: k });
const scroll = (target) => ({ do: 'scroll', target });
// A select: open it, type the option's first letters, accept it.
const choose = (target, text, caption) => [
  click(target, caption, 700),
  { do: 'type', target, text, ms: 400 },
  key('Enter'),
  { do: 'wait', ms: 900 },
];

const scripts = [
  {
    slug: 'quick-updates',
    title: 'Quick updates from your phone',
    start: '/quick-update',
    ready: tile('notice'),
    viewport: PHONE,
    steps: [
      cap('Quick update is for the jobs that cannot wait.', 2800, { poster: true }),
      cap('On a phone, open the menu and choose Quick update.', 2800),
      waitFor(tile('notice')),
      ring('[data-tour="quick-list"]', 'Each big button is one job, a few taps each.', 3200, 2800),
      click(tile('notice'), 'Try the first one: put up a notice.', 900),
      waitFor('#quick-message'),
      type(
        '#quick-message',
        'The office is closed on Monday.',
        'Type the notice in one or two sentences.',
        1800,
      ),
      scroll('text:Put it on the website'),
      ring(
        'text:Put it on the website',
        'The notice is on the website in a few minutes.',
        3200,
        2800,
      ),
      cap('It takes itself down on the last day you pick.', 3200),
    ],
  },
  {
    slug: 'mark-course-full',
    title: 'Mark a course full or waitlisted',
    start: '/quick-update',
    ready: tile('seats'),
    viewport: PHONE,
    steps: [
      cap('A course has filled. Tell the website in a few taps.', 2800, { poster: true }),
      cap('Open Quick update.', 2200),
      waitFor(tile('seats')),
      click(tile('seats'), 'Press Mark a course full or waitlisted.', 900),
      waitFor('[data-tour="quick-pick"]'),
      ring('text:Romans: The Gospel Unfolded', 'Pick the course from the list.', 2600, 2200),
      click('text:Romans: The Gospel Unfolded', undefined, 1200),
      waitFor('#quick-seatsNow'),
      ...choose('#quick-seatsNow', 'Waitlist', 'Choose Waitlist, or Full if there is no room.'),
      type('#quick-seatsNowNote', 'Waitlist only', 'Add a short note if you like.', 1800),
      scroll('text:Save the seats'),
      ring(
        'text:Save the seats',
        'Press Save. The course card changes in a few minutes.',
        3200,
        2800,
      ),
      cap('To set it back later, choose Open here again.', 3200),
    ],
  },
  {
    slug: 'enrollment-reminder',
    title: 'Remind people enrollment closes',
    start: '/quick-update',
    ready: tile('enrollment-reminder'),
    viewport: PHONE,
    steps: [
      cap('While enrollment is open, a reminder helps.', 2800, { poster: true }),
      cap('Open Quick update.', 2200),
      waitFor(tile('enrollment-reminder')),
      click(tile('enrollment-reminder'), 'Press Remind people enrollment closes.', 900),
      waitFor('#quick-message'),
      cap('This one words the notice for you from the next term.', 3200),
      ring('#quick-message', 'Leave both boxes empty to use the term’s own dates.', 3200, 2800),
      scroll('text:Put the reminder up'),
      ring(
        'text:Put the reminder up',
        'It links to Get started and comes down after Apply by.',
        3400,
        3000,
      ),
    ],
  },
  {
    slug: 'cancel-a-class',
    title: 'Cancel or move a class',
    start: '/quick-update',
    ready: tile('class-change'),
    viewport: PHONE,
    steps: [
      cap('A class moved? Tell people in under a minute.', 2800, { poster: true }),
      cap('Open Quick update.', 2200),
      waitFor(tile('class-change')),
      click(tile('class-change'), 'Press Cancel or move a class.', 900),
      waitFor('#quick-message'),
      type(
        '#quick-message',
        'Tonight’s Romans class meets online instead.',
        'Say which class and what to do.',
        1800,
      ),
      ring('#quick-lastDay', 'It comes down by itself after the day you pick.', 3000, 2600),
      scroll('text:Put it on the website'),
      ring(
        'text:Put it on the website',
        'It shows in red across every page in a few minutes.',
        3200,
        2800,
      ),
      cap('Then email the class: not everyone checks the website.', 3400),
    ],
  },
  {
    slug: 'add-info-session',
    title: 'Add an info session with a sign-up link',
    start: '/quick-update',
    ready: tile('event'),
    viewport: PHONE,
    steps: [
      cap('An info night, an open lecture or a workshop.', 2800, { poster: true }),
      cap('Open Quick update.', 2200),
      waitFor(tile('event')),
      click(tile('event'), 'Press Add an info session or event.', 900),
      waitFor('#quick-title'),
      type('#quick-title', 'Spring info night', 'What it is called, and when it starts.', 1400),
      type('#quick-start', '01052027', undefined, 600),
      key('ArrowRight'),
      ...[...'0700PM'].map(key),
      { do: 'wait', ms: 900 },
      ring('#quick-category', 'Leave the kind on Choose one for an info session.', 3000, 2600),
      type(
        '#quick-summary',
        'Meet the faculty and ask your questions.',
        'One or two sentences about it.',
        1600,
      ),
      type(
        '#quick-registrationUrl',
        'https://example.org/rsvp',
        'A sign-up link becomes a Save your seat button.',
        2400,
      ),
      scroll('text:Put it on the website'),
      ring('text:Put it on the website', 'It is on the Events page in a few minutes.', 3200, 2800),
    ],
  },
  {
    slug: 'new-term',
    title: 'Open a new term',
    start: '/term-setup',
    ready: '.pa-setup-card',
    steps: [
      cap('A new term has its own checklist.', 2600, { poster: true }),
      cap('Open New term in the top bar.', 2800),
      waitFor('.pa-setup-card'),
      ring('.pa-setup-card', 'It lays out the start of every term, in order.', 3400, 3000),
      cap('Each card opens the right place to make the change.', 3400),
      cap('Create the term, then set when enrollment opens and closes.', 3600),
      cap('Then point each course at the new term, and post the term-start event.', 3800),
      cap('It reads the website each time, so you can stop halfway.', 3400),
      cap('Come back and press Check again. Done steps turn green.', 3400),
    ],
  },
];

for (const s of scripts) {
  writeFileSync(
    join(OUT, `${s.slug}.json`),
    JSON.stringify({ ...s, cover: COVER }, null, 2) + '\n',
  );
}
console.log(`Wrote ${scripts.length} scripts to ${OUT}`);
