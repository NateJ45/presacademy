// =============================================================================
// useInstantText — typed words appear on the page, not a second and a half later
// (2026-08-28)
// =============================================================================
// THE OLD LOOP, end to end: type in the Studio → Studio autosave commits →
// Sanity indexes the change → our Worker's /preview/live listen fires →
// EventSource → debounce → refetch this preview URL on the server → swap <main>.
// Every hop is small; together they were 1.5–3 seconds, and the editor spent
// them watching a page that still said the old thing.
//
// THE SHORT PATH THIS ADDS. The frame already holds a live copy of the draft
// document. `<VisualEditing>` starts an optimistic-document actor whose remote
// feed is not Sanity but the STUDIO ITSELF: the Studio runs its own listen with
// `visibility: "transaction"` and relays every mutation over the comlink
// (`presentation/snapshot-event`), where a mendoza patch is applied to the
// in-memory document. So the frame learns about an edit as soon as the
// transaction lands — before the query index has caught up, which is what the
// server refetch has to wait for.
//
// So: watch the actor, diff the document against the last one we saw, and for
// every PLAIN STRING that changed, write the new characters straight into the
// text nodes showing it. The refetch still happens; it just stops being the
// thing anyone waits for.
//
// EXACTLY THREE THINGS MAKE THIS SAFE TO POINT AT A LIVE PAGE, and all three
// live in tested pure helpers rather than here:
//
//   1. src/lib/preview-text-diff.ts reports only plain string leaves, only when
//      both sides are strings, and never inside portable text.
//   2. src/lib/preview-stega.ts decodes the invisible payload every preview
//      string carries, so a field is matched to its text node by identity rather
//      than by searching the page for the old words.
//   3. src/lib/preview-text-nodes.ts writes only into a node whose visible
//      characters are EXACTLY the old value, and re-attaches the payload it split
//      off. Nothing degrades: click-to-edit on a node this touched still resolves
//      to the same field, because the node keeps the same stega it arrived with.
//
// WHAT IT DOES NOT DO, on purpose: portable text and the rich twins, anything
// whose rendering transforms the value (an accented heading, a truncated card
// blurb, a joined list), and anything that changes the SHAPE of the page — a new
// section, a reorder, a toggled block. All of those are left to the soft
// refresh, which renders them correctly a moment later. A missed instant update
// is invisible. A wrong one would be the preview lying about the page.
//
// THE ONE ORDERING HAZARD, and how it is handled. The soft refresh replaces
// <main> with server-rendered HTML, and that HTML can be OLDER than what this
// already wrote, because the server reads the query index and the comlink does
// not wait for it. Left alone, the instant text would flicker back to the old
// words for a beat. So every swap this makes is remembered, and after each
// refresh the pending ones are re-applied to the fresh DOM — and dropped as soon
// as the server's own HTML says the same thing. (The other half of that
// reasoning lives in src/pages/preview/live.ts: the listen there must keep
// `visibility: "query"`, because a faster signal would trigger a refetch of
// data that is still stale, and stale HTML is exactly what this has to undo.)
// =============================================================================
import { useCallback, useEffect, useRef } from 'react';
import { useOptimisticActor } from '@sanity/visual-editing/react';
import { isEmptyActor } from '@sanity/visual-editing/optimistic';
import { diffStringFields } from '../../../lib/preview-text-diff.ts';
import { sourceKey } from '../../../lib/preview-stega.ts';
import { applyTextChange, indexStegaNodes, showsText } from '../../../lib/preview-text-nodes.ts';
import { useDraftDocument } from './useDraftDocument.ts';
import { startTiming } from './timing.ts';

/**
 * The event this listens for after `<main>` has been replaced. Dispatched by the
 * soft refresh in VisualEditingOverlay.tsx.
 */
export const SOFT_REFRESH_EVENT = 'preview:soft-refresh';

/** The actor's emitted events all carry the id of the document they concern. */
interface ActorEvent {
  id?: string;
}

/**
 * The four events the dataset-mutator actor emits. `mutation` is the one that
 * matters — it is a Studio edit arriving over the comlink — but a local
 * optimistic write from the in-canvas controls arrives as `rebased.local`, a
 * re-fetched snapshot as `rebased.remote`, and the first load as `sync`. All
 * four mean "the document may read differently now"; the diff decides whether
 * anything actually changed.
 */
const ACTOR_EVENTS = ['mutation', 'rebased.local', 'rebased.remote', 'sync'] as const;

/** A swap this made that the server's HTML has not caught up with yet. */
interface PendingSwap {
  key: string;
  /** The text that was on the page when this began. */
  previous: string;
  /** The text that should be on the page now. */
  next: string;
}

/** Never remember more pending swaps than an editing burst can plausibly make. */
const MAX_PENDING = 200;

export function useInstantText(pageId: string): void {
  const { readNow } = useDraftDocument(pageId);
  const actor = useOptimisticActor();

  /** The document as it read at the last swap — the diff's left-hand side. */
  const lastSeen = useRef<Record<string, unknown> | null>(null);
  /** Text nodes by source key, rebuilt after each refresh. */
  const index = useRef<Map<string, Text[]> | null>(null);
  /** Swaps the server has not confirmed yet, newest value per field. */
  const pending = useRef<Map<string, PendingSwap>>(new Map());
  /** Re-entrancy guard: one pass at a time, with a re-run if events arrived. */
  const running = useRef(false);
  const queued = useRef(false);

  const nodeIndex = useCallback((): Map<string, Text[]> => {
    if (index.current) return index.current;
    const main = document.getElementById('main');
    const nodes: Text[] = [];
    if (main) {
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        nodes.push(node as Text);
      }
    }
    const found = indexStegaNodes(nodes);
    index.current = found;
    return found;
  }, []);

  /** Read the draft, diff it against the last one, and swap what matches. */
  const sweep = useCallback(async () => {
    if (running.current) {
      queued.current = true;
      return;
    }
    running.current = true;
    try {
      do {
        queued.current = false;
        const stop = startTiming('instant-text');
        const next = await readNow();
        if (!next) continue;
        const previous = lastSeen.current;
        lastSeen.current = next;
        // Nothing to compare against on the first read: the page was just
        // server-rendered from this very document.
        if (!previous) continue;

        const changes = diffStringFields(previous, next);
        if (changes.length === 0) continue;

        const nodes = nodeIndex();
        let swapped = 0;
        for (const change of changes) {
          const key = sourceKey(pageId, change.path);
          for (const node of nodes.get(key) ?? []) {
            if (applyTextChange(node, change.previous, change.next)) swapped += 1;
          }
          // Remembered whether or not a node matched: a field that is not on
          // this page costs one map entry and is dropped at the next refresh.
          const already = pending.current.get(key);
          if (pending.current.size < MAX_PENDING || already) {
            pending.current.set(key, {
              key,
              previous: already?.previous ?? change.previous,
              next: change.next,
            });
          }
        }
        if (swapped > 0) stop(`${swapped} node${swapped === 1 ? '' : 's'}`);
      } while (queued.current);
    } finally {
      running.current = false;
    }
  }, [nodeIndex, pageId, readNow]);

  // Watch the optimistic actor. Every one of its emitted events means the
  // in-memory document may read differently; `sweep` decides if it does.
  useEffect(() => {
    if (isEmptyActor(actor)) return;
    const draftId = `drafts.${pageId}`;
    const subscriptions = ACTOR_EVENTS.map((type) =>
      actor.on(type, (event: ActorEvent) => {
        // The actor carries every document the page mentions — settings,
        // courses, faculty. Only this page's own document is diffed; a change to
        // a shared document reaches the page through the soft refresh, because
        // its stega names ITS id, not this one.
        if (event.id && event.id !== pageId && event.id !== draftId) return;
        void sweep();
      }),
    );
    // One pass now to take the baseline snapshot, so the first edit after mount
    // has something to diff against.
    void sweep();
    return () => subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, [actor, pageId, sweep]);

  // After the soft refresh has swapped in fresh HTML: the old text nodes are
  // detached, so the index is rebuilt, and any swap the server has not caught up
  // with is re-applied so the page does not flicker back a version.
  useEffect(() => {
    const onRefresh = () => {
      index.current = null;
      if (pending.current.size === 0) return;
      const nodes = nodeIndex();
      for (const swap of [...pending.current.values()]) {
        const bucket = nodes.get(swap.key) ?? [];
        // The server's own HTML says the same thing: this swap is landed.
        if (bucket.length > 0 && bucket.every((node) => showsText(node, swap.next))) {
          pending.current.delete(swap.key);
          continue;
        }
        let reapplied = false;
        for (const node of bucket) {
          if (applyTextChange(node, swap.previous, swap.next)) reapplied = true;
        }
        // Nothing on the page matches either value any more — the field is gone,
        // moved, or rendered differently. Stop carrying it.
        if (!reapplied && bucket.length === 0) pending.current.delete(swap.key);
      }
    };
    window.addEventListener(SOFT_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(SOFT_REFRESH_EVENT, onRefresh);
  }, [nodeIndex]);
}
