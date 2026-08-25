import { useState } from 'react';
import { useClient, type DocumentActionComponent, type DocumentActionProps } from 'sanity';
// @sanity/ui v4 moved the toast API to a subpath export.
import { useToast } from '@sanity/ui/toast';

// =============================================================================
// Archive / Restore / Delete forever — the soft-delete ("Recently deleted")
// =============================================================================
// ArchiveAction replaces the destructive Delete on content types (see
// ARCHIVABLE_TYPES in schemaTypes/archived.ts): it flips the document's hidden
// `archived` flag to true, so nothing is truly gone. Archived docs vanish from
// the normal desk lists (structure.ts filters on `archived != true`) and land
// in the "Recently deleted" list at the bottom of the desk, where RestoreAction
// clears the flag and DeleteForeverAction really deletes (with a confirm).
//
// Wiring lives in sanity.config.ts document.actions. All feedback is a toast.
//
// Flag mechanics: the patch is applied to the draft when one exists and to the
// published doc when it exists, in one transaction, so the flag can never
// disagree between the two. The frontend must ALSO filter `archived != true`
// in its GROQ (src/lib/queries.ts) or archived docs keep rendering on the site.
// =============================================================================

const API = { apiVersion: '2025-01-01' } as const;

function isArchived(props: DocumentActionProps): boolean {
  const doc = (props.draft ?? props.published) as { archived?: boolean } | null;
  return doc?.archived === true;
}

// Patch `archived` on both the published doc and any draft, in one transaction.
function setArchivedBoth(
  client: ReturnType<typeof useClient>,
  publishedId: string,
  hasPublished: boolean,
  hasDraft: boolean,
  value: boolean,
) {
  const tx = client.transaction();
  if (hasPublished) tx.patch(publishedId, (p) => p.set({ archived: value }));
  if (hasDraft) tx.patch(`drafts.${publishedId}`, (p) => p.set({ archived: value }));
  return tx.commit({ visibility: 'async' });
}

// Remove both the published doc and any draft of it, in one transaction.
function deleteBoth(
  client: ReturnType<typeof useClient>,
  publishedId: string,
  hasPublished: boolean,
  hasDraft: boolean,
) {
  const tx = client.transaction();
  if (hasPublished) tx.delete(publishedId);
  if (hasDraft) tx.delete(`drafts.${publishedId}`);
  return tx.commit();
}

// ---------------------------------------------------------------------------
// Archive: move a content document to Recently deleted.
// ---------------------------------------------------------------------------
export const ArchiveAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient(API);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  // Hidden once the doc is already in the trash (Restore/Delete forever take over).
  if (isArchived(props)) return null;

  const publishedId = props.id.replace(/^drafts\./, '');
  const exists = !!(props.draft ?? props.published);

  return {
    label: busy ? 'Moving to trash…' : 'Delete (move to trash)',
    tone: 'critical',
    icon: () => '🗑️',
    disabled: busy || !exists,
    onHandle: async () => {
      setBusy(true);
      try {
        // Block if other documents still point at this one — hiding it would
        // leave broken links on the site. Same guard the normal Delete uses.
        const refs = await client.fetch<number>('count(*[references($id)])', { id: publishedId });
        if (refs > 0) {
          toast.push({
            status: 'warning',
            title: 'Still in use',
            description:
              'Other pages or items link to this, so it can’t be deleted yet. Remove those links first (check the "Used on" tab), then try again.',
          });
          return;
        }

        await setArchivedBoth(client, publishedId, !!props.published, !!props.draft, true);

        toast.push({
          status: 'success',
          title: 'Moved to Recently deleted',
          description: 'You can restore it from "Recently deleted" if you change your mind.',
        });
      } catch (err) {
        console.error('[archive] failed', err);
        toast.push({
          status: 'error',
          title: 'Could not delete',
          description: 'Something went wrong. Nothing was changed. Please try again.',
        });
      } finally {
        setBusy(false);
        props.onComplete();
      }
    },
  };
};

// ---------------------------------------------------------------------------
// Restore: clear the archived flag; the doc returns to its normal list.
// ---------------------------------------------------------------------------
export const RestoreAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient(API);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  // Only meaningful for docs that are in the trash.
  if (!isArchived(props)) return null;

  return {
    label: busy ? 'Restoring…' : 'Restore',
    tone: 'positive',
    icon: () => '↩️',
    disabled: busy,
    onHandle: async () => {
      setBusy(true);
      try {
        await setArchivedBoth(
          client,
          props.id.replace(/^drafts\./, ''),
          !!props.published,
          !!props.draft,
          false,
        );
        toast.push({
          status: 'success',
          title: 'Restored',
          description: 'It’s back in its normal list, exactly as it was.',
        });
      } catch (err) {
        console.error('[restore] failed', err);
        toast.push({ status: 'error', title: 'Could not restore. Please try again.' });
      } finally {
        setBusy(false);
        props.onComplete();
      }
    },
  };
};

// ---------------------------------------------------------------------------
// Delete forever: permanently remove an archived document (with a confirm).
// ---------------------------------------------------------------------------
export const DeleteForeverAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient(API);
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Only offered from the trash, so nobody hard-deletes by accident.
  if (!isArchived(props)) return null;

  const doc = (props.draft ?? props.published) as {
    title?: string;
    name?: string;
    question?: string;
    quote?: string;
  } | null;
  const title = doc?.title ?? doc?.name ?? doc?.question ?? doc?.quote ?? 'this item';

  return {
    label: 'Delete forever',
    tone: 'critical',
    icon: () => '⛔',
    disabled: busy,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: 'confirm',
      tone: 'critical',
      message: `Permanently delete “${title}”? This can’t be undone.`,
      confirmButtonText: 'Delete forever',
      cancelButtonText: 'Keep it',
      onCancel: () => {
        setOpen(false);
        props.onComplete();
      },
      onConfirm: async () => {
        setBusy(true);
        try {
          await deleteBoth(
            client,
            props.id.replace(/^drafts\./, ''),
            !!props.published,
            !!props.draft,
          );
          toast.push({ status: 'success', title: 'Deleted for good.' });
        } catch (err) {
          console.error('[delete-forever] failed', err);
          toast.push({ status: 'error', title: 'Could not delete. Please try again.' });
        } finally {
          setBusy(false);
          setOpen(false);
          props.onComplete();
        }
      },
    },
  };
};
