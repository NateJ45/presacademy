// =============================================================================
// preview-live-draft — the Studio→preview local-edit channel's rules
// =============================================================================
// Three promises are pinned down here, and all three are safety rather than
// speed:
//
//  1. A message that is not exactly ours is dropped. The island listens on a
//     public page, so every other shape must fall out silently.
//  2. A stale actor snapshot cannot type the page backwards while the local
//     channel is live.
//  3. The pending-swap memory does not care which channel made the swap.
//
// See src/lib/preview-live-draft.ts for why each rule exists.
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LIVE_DRAFT_MESSAGE,
  LOCAL_LEAD_MS,
  MAX_PENDING,
  acceptsSource,
  parseLiveDraft,
  rememberSwap,
  type PendingSwap,
} from './preview-live-draft.ts';

const doc = (extra: Record<string, unknown> = {}) => ({
  _id: 'drafts.homePage',
  _type: 'homePage',
  ...extra,
});

// ---------------------------------------------------------------------------
// parseLiveDraft — the rejection funnel
// ---------------------------------------------------------------------------

test('accepts a well-formed draft message and hands the document back', () => {
  const parsed = parseLiveDraft({ type: LIVE_DRAFT_MESSAGE, document: doc({ title: 'Hello' }) });
  assert.ok(parsed);
  assert.equal(parsed.document?._id, 'drafts.homePage');
  assert.equal(parsed.document?.title, 'Hello');
});

test('accepts an explicit null document — "this page has no draft"', () => {
  const parsed = parseLiveDraft({ type: LIVE_DRAFT_MESSAGE, document: null });
  assert.deepEqual(parsed, { type: LIVE_DRAFT_MESSAGE, document: null });
});

test('rejects anything that is not our envelope', () => {
  const notOurs: unknown[] = [
    undefined,
    null,
    'pa:live-draft',
    42,
    [],
    [{ type: LIVE_DRAFT_MESSAGE, document: doc() }],
    {},
    { type: 'other', document: doc() },
    // The shapes other tools on the same origin actually post.
    { type: 'visual-editing/navigate', url: '/preview' },
    { source: 'react-devtools-content-script' },
    // The envelope without the field, which would otherwise read as "no draft".
    { type: LIVE_DRAFT_MESSAGE },
  ];
  for (const data of notOurs) {
    assert.equal(parseLiveDraft(data), null, `should have rejected ${JSON.stringify(data)}`);
  }
});

test('rejects a document that is not a document', () => {
  const bad: unknown[] = [
    'homePage',
    7,
    [],
    {},
    { _id: 'drafts.homePage' },
    { _type: 'homePage' },
    { _id: '', _type: 'homePage' },
    { _id: 'drafts.homePage', _type: '' },
    { _id: 123, _type: 'homePage' },
    { _id: 'drafts.homePage', _type: { name: 'homePage' } },
  ];
  for (const document of bad) {
    assert.equal(
      parseLiveDraft({ type: LIVE_DRAFT_MESSAGE, document }),
      null,
      `should have rejected document ${JSON.stringify(document)}`,
    );
  }
});

test('hands back a normalised envelope, dropping anything else on it', () => {
  // Extra fields on the envelope are ignored rather than carried forward, so
  // nothing a sender invents can reach the code that applies the document.
  const parsed = parseLiveDraft({
    type: LIVE_DRAFT_MESSAGE,
    document: doc(),
    apply: 'everything',
    reload: true,
  });
  assert.ok(parsed);
  assert.deepEqual(Object.keys(parsed).sort(), ['document', 'type']);
});

// ---------------------------------------------------------------------------
// acceptsSource — the local channel leads, the actor follows
// ---------------------------------------------------------------------------

const T0 = 1_000_000;

test('the local channel may always write', () => {
  assert.equal(acceptsSource('local', null, T0), true);
  assert.equal(acceptsSource('local', T0, T0), true);
});

test('the actor writes freely when no local snapshot has ever arrived', () => {
  assert.equal(acceptsSource('actor', null, T0), true);
});

test('the actor is held back while a local snapshot is recent', () => {
  assert.equal(acceptsSource('actor', T0, T0), false);
  assert.equal(acceptsSource('actor', T0, T0 + LOCAL_LEAD_MS - 1), false);
});

test('the actor takes over again once the local channel goes quiet', () => {
  assert.equal(acceptsSource('actor', T0, T0 + LOCAL_LEAD_MS), true);
  assert.equal(acceptsSource('actor', T0, T0 + LOCAL_LEAD_MS * 10), true);
});

// ---------------------------------------------------------------------------
// rememberSwap — one memory, either channel
// ---------------------------------------------------------------------------

const memory = () => new Map<string, PendingSwap>();

test('remembers the first previous value, whichever channel keeps swapping', () => {
  const pending = memory();
  // The actor sees the save of "Hi"; the local channel is already on "Hi t".
  rememberSwap(pending, 'homePage title', 'Hello', 'Hi');
  rememberSwap(pending, 'homePage title', 'Hi', 'Hi t');
  rememberSwap(pending, 'homePage title', 'Hi t', 'Hi there');
  assert.deepEqual(pending.get('homePage title'), {
    key: 'homePage title',
    previous: 'Hello',
    next: 'Hi there',
  });
  assert.equal(pending.size, 1);
});

test('drops a field that came back to where the server left it', () => {
  const pending = memory();
  rememberSwap(pending, 'homePage title', 'Hello', 'Hellox');
  rememberSwap(pending, 'homePage title', 'Hellox', 'Hello');
  assert.equal(pending.has('homePage title'), false);
});

test('a swap straight back to the original is never remembered at all', () => {
  const pending = memory();
  rememberSwap(pending, 'homePage title', 'Hello', 'Hello');
  assert.equal(pending.size, 0);
});

test('keeps separate fields apart', () => {
  const pending = memory();
  rememberSwap(pending, 'homePage title', 'a', 'b');
  rememberSwap(pending, 'homePage tagline', 'c', 'd');
  assert.equal(pending.size, 2);
  assert.equal(pending.get('homePage tagline')?.previous, 'c');
});

test('stops growing at the cap but keeps updating what it already holds', () => {
  const pending = memory();
  for (let i = 0; i < MAX_PENDING + 50; i += 1) rememberSwap(pending, `field ${i}`, 'a', 'b');
  assert.equal(pending.size, MAX_PENDING);
  rememberSwap(pending, 'field 0', 'b', 'c');
  assert.equal(pending.get('field 0')?.next, 'c');
  assert.equal(pending.get('field 0')?.previous, 'a');
  assert.equal(pending.size, MAX_PENDING);
});

test('honours a caller-supplied cap', () => {
  const pending = memory();
  rememberSwap(pending, 'one', 'a', 'b', 1);
  rememberSwap(pending, 'two', 'a', 'b', 1);
  assert.deepEqual([...pending.keys()], ['one']);
});
