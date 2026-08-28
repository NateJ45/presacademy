import { useCallback, useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';
import { usePresentationNavigate, usePresentationParams } from 'sanity/presentation';
import {
  Box,
  Button,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@sanity/ui';
import {
  AddIcon,
  CopyIcon,
  EllipsisVerticalIcon,
  LaunchIcon,
  LinkIcon,
  LinkRemovedIcon,
  RestoreIcon,
  ShareIcon,
  TrashIcon,
} from '@sanity/icons';
import { SINGLETON_PREVIEW_PATHS } from '../resolve';
import { sectionLabel } from '../../lib/page-checks';
import { adaptToneToNeighbour } from '../../lib/section-fields';
import { addSectionToPage, type PageOpsClient } from '../pageOps';
import { SECTION_HOST_TYPES } from '../pageBuilderConfig';
import { SHARE_LINK_TTL_PHRASE, useShareDraftLink } from './shareDraftLink';

// =============================================================================
// PreviewNavigator — the Squarespace-style page list beside the live preview
// (ported from the WCP site's makePreviewNavigator, 2026-08-25)
// =============================================================================
// Docked to the left of the Presentation tool (components.unstable_navigator).
// Click a page and the preview jumps there while the edit panel follows
// (Presentation resolves the URL through resolve.mainDocuments).
//
//  - Status dots: amber = published with unpublished edits, hollow = never
//    published. Answers "did my change go live?" at a glance.
//  - Grouping: "Main pages" (the built-in singletons, in site-nav order),
//    "Custom pages" (`page` docs an editor created), and "Archived" at the
//    bottom (custom pages in the trash, one click from coming back).
//  - A live-page link (↗) per published row.
//  - A ⋯ menu per custom-page row: Duplicate, Add to / Remove from the top
//    menu, Archive (or Restore). Main pages get no ⋯: they are one-per-site by
//    design, so there is nothing to duplicate and nothing to archive.
//  - A share (↗ in a box) button per row (PORTS.md card 19): copies a link that
//    shows that page's DRAFT to someone with no Sanity login. It lasts about an
//    hour; the toast and the tooltip both say so. See ./shareDraftLink.tsx.
//  - A collapsible "Saved sections" group under the page list (PORTS.md card
//    24): every `sectionPreset` document, each with an "add it to the page you
//    are looking at" button. It lives here because a page's own "+ Add section"
//    picker can offer schema TYPES only, never documents.
//  - A small "In menu" chip on rows whose page is in the header menu.
//  - "+ New page": creates a fresh `page` DRAFT and opens it right here.
//  - Site settings pinned at the bottom.
// The custom-page list LIVE-refreshes through client.listen, so a rename, a
// new page, or a publish shows up without reopening the tool.
//
// NOTHING HERE DELETES. Archive is the same soft-delete the desk uses (the
// hidden `archived` flag, see ../schemaTypes/archived.ts); "Delete forever"
// stays where it was, in the document's own action menu, behind a confirm.
// =============================================================================

const APIV = '2026-05-01';

// Main pages in the order a visitor meets them. Labels are static; the doc id
// equals the type (the structure's singleton convention).
const MAIN_PAGES: { type: string; label: string }[] = [
  { type: 'homePage', label: 'Home' },
  { type: 'aboutPage', label: 'About' },
  { type: 'coursesPage', label: 'Courses' },
  { type: 'facultyPage', label: 'Faculty' },
  { type: 'eventsPage', label: 'Events' },
  { type: 'pricingPage', label: 'Pricing' },
  { type: 'forYouPage', label: 'For you' },
  { type: 'getStartedPage', label: 'Get started' },
  { type: 'resourcesPage', label: 'Resources' },
  { type: 'faqPage', label: 'FAQ' },
  { type: 'contactPage', label: 'Contact' },
  { type: 'privacyPage', label: 'Privacy' },
  { type: 'accessibilityPage', label: 'Accessibility' },
  { type: 'notFoundPage', label: '404 page' },
];

// The header menu holds at most six items (siteSettings.navItems, Rule.max(6)).
const NAV_MAX = 6;

// Live path per singleton (preview path minus the /preview prefix).
const livePathFor = (type: string) => {
  const href = SINGLETON_PREVIEW_PATHS[type];
  if (!href) return undefined;
  return href === '/preview' ? '/' : href.replace(/^\/preview/, '');
};

type NavGroup = 'Main pages' | 'Custom pages' | 'Archived';
const GROUP_ORDER: NavGroup[] = ['Main pages', 'Custom pages', 'Archived'];

interface NavRow {
  id: string;
  type: string;
  label: string;
  href: string;
  liveHref?: string;
  hasDraft: boolean;
  hasPublished: boolean;
  group: NavGroup;
  /** Keys of the navItems entries pointing at this page (empty = not in menu). */
  menuKeys: string[];
}

/** One saved section (a `sectionPreset` document), ready to add to a page. */
interface PresetRow {
  id: string;
  title: string;
  sectionType: string;
  /** The captured section object, exactly as it will be appended. */
  section: Record<string, unknown> | null;
}

/** A raw sectionPreset document, as the list query returns it. */
interface PresetDoc {
  _id: string;
  title?: string;
  sectionType?: string;
  section?: unknown;
}

/** Past this many saved sections the list stops being scannable — say so. */
const PRESET_SOFT_CAP = 30;

/** Where the top menu lives, and what is in it right now. */
interface MenuState {
  /** The doc to patch: the draft twin when there is one, else the published doc. */
  targetId: string | null;
  /** How many items the menu holds (against NAV_MAX). */
  count: number;
  /** page _id → the navItems _keys that reference it. */
  byPageId: Map<string, string[]>;
}

// Collapse draft + published twins of one document into a single row's status.
function collapse<T extends { _id: string }>(
  docs: T[],
): Map<string, { doc: T; draft: boolean; published: boolean }> {
  const byId = new Map<string, { doc: T; draft: boolean; published: boolean }>();
  for (const d of docs) {
    const isDraft = d._id.startsWith('drafts.');
    const id = d._id.replace(/^drafts\./, '');
    const entry = byId.get(id) ?? { doc: d, draft: false, published: false };
    if (isDraft) {
      entry.draft = true;
      entry.doc = d; // the draft's field values are what the editor last typed
    } else {
      entry.published = true;
      if (!entry.draft) entry.doc = d;
    }
    byId.set(id, entry);
  }
  return byId;
}

interface RawSettings {
  _id: string;
  navItems?: { _key?: string; _type?: string; internalPage?: { _ref?: string } }[] | null;
}

/** Read the top menu off whichever siteSettings twin an edit would land on. */
function readMenu(settings: RawSettings[]): MenuState {
  const draft = settings.find((s) => s._id.startsWith('drafts.'));
  const published = settings.find((s) => !s._id.startsWith('drafts.'));
  // A draft, once it exists, is what the editor sees and what Publish will
  // send live, so an edit that skipped it would be silently reverted on the
  // next publish. With no draft, the published doc is the only copy there is.
  const target = draft ?? published ?? null;

  const byPageId = new Map<string, string[]>();
  const items = target?.navItems ?? [];
  for (const item of items) {
    const ref = item?.internalPage?._ref;
    const key = item?._key;
    if (!ref || !key) continue;
    byPageId.set(ref, [...(byPageId.get(ref) ?? []), key]);
  }
  return { targetId: target?._id ?? null, count: items.length, byPageId };
}

async function fetchState(
  client: ReturnType<typeof useClient>,
): Promise<{ rows: NavRow[]; menu: MenuState }> {
  // Raw perspective on purpose: we need BOTH twins for the status dots.
  const singletonTypes = MAIN_PAGES.map((p) => p.type);
  const [singletons, pages, settings] = await Promise.all([
    client.fetch<{ _id: string; _type: string }[]>('*[_type in $types]{ _id, _type }', {
      types: singletonTypes,
    }),
    client.fetch<
      {
        _id: string;
        _type: string;
        title?: string;
        slug?: { current?: string };
        archived?: boolean;
      }[]
    >('*[_type == "page"]{ _id, _type, title, slug, archived }'),
    client.fetch<RawSettings[]>(
      '*[_id in ["siteSettings", "drafts.siteSettings"]]{ _id, navItems[]{ _key, _type, internalPage } }',
    ),
  ]);

  const menu = readMenu(settings);

  const byType = new Map<string, { draft: boolean; published: boolean }>();
  for (const [, entry] of collapse(singletons)) {
    const t = entry.doc._type;
    const prev = byType.get(t) ?? { draft: false, published: false };
    byType.set(t, {
      draft: prev.draft || entry.draft,
      published: prev.published || entry.published,
    });
  }

  const rows: NavRow[] = MAIN_PAGES.map(({ type, label }) => ({
    id: type, // singleton doc id == type
    type,
    label,
    href: SINGLETON_PREVIEW_PATHS[type],
    liveHref: byType.get(type)?.published ? livePathFor(type) : undefined,
    hasDraft: byType.get(type)?.draft ?? false,
    hasPublished: byType.get(type)?.published ?? false,
    group: 'Main pages',
    menuKeys: menu.byPageId.get(type) ?? [],
  }));

  for (const [id, { doc, draft, published }] of collapse(pages)) {
    const slug = doc.slug?.current;
    if (!slug) continue;
    const archived = doc.archived === true;
    rows.push({
      id,
      type: 'page',
      label: doc.title || slug,
      href: `/preview/${slug}`,
      // An archived page is not built, so it has no live address to offer.
      liveHref: published && !archived ? `/${slug}` : undefined,
      hasDraft: draft,
      hasPublished: published,
      group: archived ? 'Archived' : 'Custom pages',
      menuKeys: menu.byPageId.get(id) ?? [],
    });
  }
  return { rows, menu };
}

/**
 * Collapse the saved-section documents into rows, newest wording first (the
 * draft twin wins, the same rule the page list uses), sorted by name.
 */
function buildPresets(docs: PresetDoc[]): PresetRow[] {
  const rows: PresetRow[] = [];
  for (const [id, { doc }] of collapse(docs)) {
    const held = Array.isArray(doc.section) ? doc.section[0] : null;
    const section =
      held && typeof held === 'object' && !Array.isArray(held)
        ? (held as Record<string, unknown>)
        : null;
    const type =
      doc.sectionType || (section && typeof section._type === 'string' ? section._type : '');
    rows.push({ id, title: doc.title || '(unnamed saved section)', sectionType: type, section });
  }
  rows.sort((a, b) => a.title.localeCompare(b.title));
  return rows;
}

/** Every saved section, whole: adding one to a page is a plain copy of it. */
async function fetchPresets(client: ReturnType<typeof useClient>): Promise<PresetRow[]> {
  const docs = await client.fetch<PresetDoc[]>(
    '*[_type == "sectionPreset"]{ _id, title, sectionType, section }',
  );
  return buildPresets(docs ?? []);
}

/** Amber = live page with unpublished edits; hollow = never published. */
function StatusDot({ row }: { row: NavRow }) {
  if (!row.hasDraft) return null;
  const unpublished = !row.hasPublished;
  return (
    <span
      title={unpublished ? 'Not published yet' : 'Has unpublished edits'}
      style={{
        flexShrink: 0,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: unpublished ? 'transparent' : '#f59e0b',
        border: unpublished ? '1.5px solid #9aa4b2' : 'none',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Duplicating a page
// ---------------------------------------------------------------------------

/** A fresh key for every nested array item, so the copy shares none with its original. */
function newKey(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

/**
 * Deep-copy a document body, dropping the fields that belong to the ORIGINAL
 * (identity, revision, timestamps) and re-keying every array item. Two array
 * items with the same _key inside one dataset is the classic duplicate bug: the
 * Studio's list editor keys its rows on it, so a shared key makes edits to one
 * row appear in the other.
 */
function cloneBody(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneBody);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === '_id' || k === '_rev' || k === '_createdAt' || k === '_updatedAt') continue;
      out[k] = k === '_key' ? newKey() : cloneBody(v);
    }
    return out;
  }
  return value;
}

/** "about" → "about-copy", then "about-copy-2", "about-copy-3"… */
function uniqueSlug(base: string, taken: Set<string>): string {
  const first = `${base}-copy`;
  if (!taken.has(first)) return first;
  for (let n = 2; n < 500; n += 1) {
    const candidate = `${first}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${first}-${newKey()}`;
}

export function PreviewNavigator() {
  const client = useClient({ apiVersion: APIV });
  const navigate = usePresentationNavigate();
  const params = usePresentationParams();
  const toast = useToast();
  const [rows, setRows] = useState<NavRow[] | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [presets, setPresets] = useState<PresetRow[] | null>(null);
  const [creating, setCreating] = useState(false);
  // Row ids with an action in flight, so a slow patch cannot be double-clicked.
  const [busy, setBusy] = useState<string | null>(null);
  const { share, sharing } = useShareDraftLink();

  const refetch = useCallback(() => {
    fetchState(client)
      .then(({ rows: r, menu: m }) => {
        setRows(r);
        setMenu(m);
      })
      .catch(() => setRows([]));
    fetchPresets(client)
      .then(setPresets)
      .catch(() => setPresets([]));
  }, [client]);

  useEffect(() => {
    refetch();
    // Live refresh: any page, settings, or saved-section mutation (rename,
    // publish, new page, a menu edit made in Site settings, a section saved
    // from a page's publish menu) → refetch after a short settle.
    // visibility:'query' waits until the change is queryable.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sub = client
      .listen(
        '*[_type == "page" || _type == "siteSettings" || _type == "sectionPreset"]',
        {},
        { visibility: 'query', events: ['mutation'] },
      )
      .subscribe(() => {
        clearTimeout(timer);
        timer = setTimeout(refetch, 800);
      });
    return () => {
      clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [client, refetch]);

  // params.preview is the iframe's current URL; compare pathnames only.
  const current = (params.preview ?? '').split('?')[0];

  // STICKY navigation (2026-08-28, editor feedback): every preview page change
  // is a full document load, and Presentation can only hand the iframe its
  // next URL once the NEW page's visual-editing script has reconnected. A
  // click that lands inside that window (an editor moving quickly through the
  // page list) is silently dropped - the editor had to wait and click again.
  // So a click records its intent and an effect re-issues navigate() every
  // 750ms until params.preview reports the requested path (or ~6s pass). When
  // the first navigate lands immediately, `current` matches at once and no
  // retry ever fires. `pending` also drives the row highlight, so the list
  // responds to the click instantly instead of after the page load.
  const [pending, setPending] = useState<{ href: string; type: string; id: string } | null>(null);
  const go = useCallback(
    (href: string, type: string, id: string) => {
      setPending({ href, type, id });
      navigate(href, { type, id });
    },
    [navigate],
  );
  useEffect(() => {
    if (!pending) return;
    if (current === pending.href) {
      setPending(null);
      return;
    }
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (tries > 8) {
        clearInterval(timer);
        setPending(null);
        return;
      }
      navigate(pending.href, { type: pending.type, id: pending.id });
    }, 750);
    return () => clearInterval(timer);
  }, [pending, current, navigate]);

  // "+ New page": create an empty DRAFT (so nothing half-made ever publishes
  // itself) and open it in the edit panel right here.
  const createPage = useCallback(async () => {
    setCreating(true);
    try {
      const id = crypto.randomUUID();
      await client.create({ _id: `drafts.${id}`, _type: 'page' });
      navigate(current || '/preview', { type: 'page', id });
      refetch();
    } finally {
      setCreating(false);
    }
  }, [client, navigate, current, refetch]);

  // ---- Duplicate ---------------------------------------------------------
  // The copy is a DRAFT, like "+ New page", so a half-edited duplicate can
  // never appear on the site. Values come from the draft twin when there is
  // one: that is what the editor is looking at.
  const duplicatePage = useCallback(
    async (row: NavRow) => {
      setBusy(row.id);
      try {
        const { draft, published, slugs } = await client.fetch<{
          draft: Record<string, unknown> | null;
          published: Record<string, unknown> | null;
          slugs: string[];
        }>(
          `{
            "draft": *[_id == $draftId][0],
            "published": *[_id == $id][0],
            "slugs": *[_type == "page" && defined(slug.current)].slug.current
          }`,
          { id: row.id, draftId: `drafts.${row.id}` },
        );

        const source = draft ?? published;
        if (!source) {
          toast.push({ status: 'warning', title: 'That page could not be read. Try again.' });
          return;
        }

        const body = cloneBody(source) as Record<string, unknown>;
        const oldSlug = (source.slug as { current?: string } | undefined)?.current ?? 'page';
        const newId = crypto.randomUUID();

        await client.create({
          ...body,
          _id: `drafts.${newId}`,
          _type: 'page',
          title: `${typeof source.title === 'string' ? source.title : 'Page'} copy`,
          slug: { _type: 'slug', current: uniqueSlug(oldSlug, new Set(slugs)) },
          // A copy starts out of the trash even if the original was in it.
          archived: false,
        });

        navigate(current || '/preview', { type: 'page', id: newId });
        toast.push({
          status: 'success',
          title: 'Copied',
          description: 'The copy is a draft. Change what you need, then Publish it.',
        });
        refetch();
      } catch (err) {
        console.error('[navigator] duplicate failed', err);
        toast.push({ status: 'error', title: 'Could not copy that page. Please try again.' });
      } finally {
        setBusy(null);
      }
    },
    [client, current, navigate, refetch, toast],
  );

  // ---- Archive / restore --------------------------------------------------
  // Same soft delete the desk uses: flip the hidden `archived` flag on BOTH
  // twins in one transaction so they can never disagree. Nothing is deleted.
  const setArchived = useCallback(
    async (row: NavRow, value: boolean) => {
      setBusy(row.id);
      try {
        const tx = client.transaction();
        if (row.hasPublished) tx.patch(row.id, (p) => p.set({ archived: value }));
        if (row.hasDraft) tx.patch(`drafts.${row.id}`, (p) => p.set({ archived: value }));

        // A menu link to an archived page would point at an address that no
        // longer builds, so archiving takes the page out of the menu too.
        if (value && row.menuKeys.length > 0 && menu?.targetId) {
          tx.patch(menu.targetId, (p) =>
            p.unset(row.menuKeys.map((k) => `navItems[_key=="${k}"]`)),
          );
        }
        await tx.commit({ visibility: 'async' });

        toast.push({
          status: 'success',
          title: value ? 'Moved to Archived' : 'Restored',
          description: value
            ? 'It is off the site but kept here. Restore it any time.'
            : 'It is back with your other pages.',
        });
        refetch();
      } catch (err) {
        console.error('[navigator] archive failed', err);
        toast.push({ status: 'error', title: 'That did not work. Please try again.' });
      } finally {
        setBusy(null);
      }
    },
    [client, menu, refetch, toast],
  );

  // ---- Add to / remove from the top menu ---------------------------------
  // Written to the siteSettings twin an editor is actually looking at: the
  // draft when one exists (publishing it would otherwise wipe the change),
  // the published doc when there is none.
  const addToMenu = useCallback(
    async (row: NavRow) => {
      if (!menu?.targetId) return;
      setBusy(row.id);
      try {
        await client
          .patch(menu.targetId)
          .setIfMissing({ navItems: [] })
          .append('navItems', [
            {
              _key: newKey(),
              _type: 'navLink',
              label: row.label,
              linkType: 'internal',
              // The picker, not a typed address: the link then follows the
              // page even if its slug changes (see schemaTypes/navLink.ts).
              internalPage: { _type: 'reference', _ref: row.id },
            },
          ])
          .commit();
        toast.push({
          status: 'success',
          title: 'Added to the top menu',
          description: 'Rename or reorder it in Site settings.',
        });
        refetch();
      } catch (err) {
        console.error('[navigator] add to menu failed', err);
        toast.push({ status: 'error', title: 'Could not add it to the menu. Please try again.' });
      } finally {
        setBusy(null);
      }
    },
    [client, menu, refetch, toast],
  );

  const removeFromMenu = useCallback(
    async (row: NavRow) => {
      if (!menu?.targetId || row.menuKeys.length === 0) return;
      setBusy(row.id);
      try {
        await client
          .patch(menu.targetId)
          .unset(row.menuKeys.map((k) => `navItems[_key=="${k}"]`))
          .commit();
        toast.push({ status: 'success', title: 'Taken out of the top menu' });
        refetch();
      } catch (err) {
        console.error('[navigator] remove from menu failed', err);
        toast.push({ status: 'error', title: 'Could not change the menu. Please try again.' });
      } finally {
        setBusy(null);
      }
    },
    [client, menu, refetch, toast],
  );

  const grouped = useMemo(() => {
    if (!rows) return null;
    return GROUP_ORDER.map((g) => ({ title: g, rows: rows.filter((r) => r.group === g) })).filter(
      (g) => g.rows.length > 0,
    );
  }, [rows]);

  const menuFull = (menu?.count ?? 0) >= NAV_MAX;

  // ---------------------------------------------------------------------------
  // Saved sections (PORTS.md card 24)
  // ---------------------------------------------------------------------------
  // The "+ Add section" picker inside a page can only offer schema TYPES, so a
  // saved section (a `sectionPreset` DOCUMENT) has no way in there. This panel
  // already knows which page the preview is on, so it is the one place that can
  // say "add this to the page you are looking at".
  const [presetsOpen, setPresetsOpen] = useState(false);

  // Which page the preview is showing, as a row. `pending` wins so a click and
  // an immediate "Add" land on the same page. Exact href match first; the
  // endsWith fallback is the same one the row highlight uses.
  const currentRow = useMemo(() => {
    if (!rows) return null;
    const href = pending?.href ?? current;
    if (!href) return null;
    return rows.find((r) => r.href === href) ?? rows.find((r) => href.endsWith(r.href)) ?? null;
  }, [rows, pending, current]);

  // The page-builder array on the page in view (`sections` on a custom page,
  // `flexibleSections` on a singleton), or undefined when that page has none.
  // Undefined disables the add buttons.
  const currentField = currentRow ? SECTION_HOST_TYPES[currentRow.type] : undefined;

  const addPreset = useCallback(
    async (preset: PresetRow) => {
      if (!currentRow || !currentField || !preset.section) return;
      setBusy(preset.id);
      try {
        // ---------------------------------------------------------------
        // Arrive dressed for the page (2026-08-28)
        // ---------------------------------------------------------------
        // A saved section lands at the BOTTOM, so the section it will sit
        // under is whichever one is last right now. Adopting that section's
        // surface means the new band reads as a continuation instead of a
        // seam an editor then has to go and fix. Only the tone travels; see
        // adaptToneToNeighbour in src/lib/section-fields.ts.
        //
        // The adaptation is HERE and not in pageOps.addSectionToPage on
        // purpose: pageOps is the portable copy shared with the starter, and
        // "adopt the previous section's tone" is this repo's schema talking,
        // not a general page operation. The read is the draft first, exactly
        // as the append will be.
        //
        // GROQ has no attribute access by parameter, so the field name is
        // interpolated. It is one of two literals from SECTION_HOST_TYPES, never
        // anything an editor can type.
        const twins = await client.fetch<{ _id: string; items?: unknown[] }[]>(
          `*[_id in $ids]{_id, "items": ${currentField}}`,
          { ids: [`drafts.${currentRow.id}`, currentRow.id] },
        );
        const source = twins.find((d) => d._id.startsWith('drafts.')) ?? twins[0];
        const items = Array.isArray(source?.items) ? source.items : [];
        const previous = (items[items.length - 1] ?? null) as Record<string, unknown> | null;

        // Always onto the DRAFT, always at the bottom: a saved section that went
        // live on click would be a publish nobody asked for.
        await addSectionToPage(
          client as unknown as PageOpsClient,
          currentRow.id,
          currentField,
          adaptToneToNeighbour(preset.section, previous),
        );
        refetch();
        toast.push({
          status: 'success',
          title: `Added "${preset.title}" to ${currentRow.label}`,
          description: 'It is at the bottom of the page. Drag it where you want it, then Publish.',
          duration: 8000,
        });
      } catch (err) {
        console.error('[navigator] add preset failed', err);
        toast.push({
          status: 'error',
          title: 'Could not add that saved section. Please try again.',
        });
      } finally {
        setBusy(null);
      }
    },
    [client, currentRow, currentField, refetch, toast],
  );

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <Box flex={1} padding={3} style={{ overflowY: 'auto' }}>
        <Stack space={4}>
          {grouped === null ? (
            <Flex align="center" gap={2} padding={2}>
              <Spinner muted />
              <Text size={1} muted>
                Loading…
              </Text>
            </Flex>
          ) : (
            grouped.map((group) => (
              <Stack key={group.title} space={2}>
                <Text size={1} weight="semibold" muted style={{ textTransform: 'uppercase' }}>
                  {group.title}
                </Text>
                {group.title === 'Archived' && (
                  <Text size={1} muted>
                    Off the site, kept here. Restore any of them from the ⋯ menu.
                  </Text>
                )}
                <Stack space={1}>
                  {group.rows.map((r) => {
                    const active = pending
                      ? pending.href === r.href
                      : current === r.href || (r.href !== '/preview' && current.endsWith(r.href));
                    const archived = r.group === 'Archived';
                    const inMenu = r.menuKeys.length > 0;
                    return (
                      <Flex key={r.id} align="center" gap={1}>
                        <Card
                          as="button"
                          flex={1}
                          padding={2}
                          radius={2}
                          tone={active ? 'primary' : 'default'}
                          pressed={active}
                          style={{ cursor: 'pointer', textAlign: 'left', minWidth: 0 }}
                          onClick={() => go(r.href, r.type, r.id)}
                        >
                          <Flex align="center" gap={2}>
                            <Text
                              size={1}
                              weight={active ? 'semibold' : 'regular'}
                              textOverflow="ellipsis"
                              muted={archived}
                              style={{ flex: 1, minWidth: 0 }}
                            >
                              {r.label}
                            </Text>
                            {inMenu && (
                              /* Answers "is this page reachable?" without a
                                 trip to Site settings. */
                              <Text
                                size={0}
                                muted
                                title="This page is in the top menu"
                                style={{ flexShrink: 0 }}
                              >
                                In menu
                              </Text>
                            )}
                            <StatusDot row={r} />
                          </Flex>
                        </Card>
                        {/* Show someone the draft (PORTS.md card 19). Mints a
                            one-hour link to this page's draft preview that
                            needs no Sanity login, and copies it. */}
                        <Button
                          mode="bleed"
                          padding={2}
                          icon={ShareIcon}
                          disabled={sharing}
                          title={`Copy a link that shows this page's draft to someone without a Sanity login. ${SHARE_LINK_TTL_PHRASE}`}
                          aria-label={`Copy a share link for ${r.label}`}
                          onClick={() => void share(r.href, r.label)}
                        />
                        {r.liveHref && (
                          /* Outside the row button — a button may not nest a
                             link. Opens the REAL page in a new tab. */
                          <Button
                            as="a"
                            href={r.liveHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            mode="bleed"
                            padding={2}
                            icon={LaunchIcon}
                            title={`Open the live page (${r.liveHref})`}
                            aria-label={`Open the live page for ${r.label}`}
                          />
                        )}
                        {r.type === 'page' && (
                          /* Main pages get no ⋯: one per site by design, so
                             there is nothing to copy and nothing to archive. */
                          <MenuButton
                            id={`page-actions-${r.id}`}
                            button={
                              <Button
                                mode="bleed"
                                padding={2}
                                icon={EllipsisVerticalIcon}
                                disabled={busy === r.id}
                                title={`More for ${r.label}`}
                                aria-label={`More actions for ${r.label}`}
                              />
                            }
                            popover={{ placement: 'bottom-end', portal: true }}
                            menu={
                              <Menu>
                                <MenuItem
                                  icon={CopyIcon}
                                  text="Duplicate"
                                  onClick={() => void duplicatePage(r)}
                                />
                                {!archived && (
                                  <>
                                    <MenuDivider />
                                    {inMenu ? (
                                      <MenuItem
                                        icon={LinkRemovedIcon}
                                        text="Remove from menu"
                                        onClick={() => void removeFromMenu(r)}
                                      />
                                    ) : (
                                      <MenuItem
                                        icon={LinkIcon}
                                        text="Add to menu"
                                        disabled={menuFull || !menu?.targetId}
                                        title={
                                          menuFull
                                            ? `Menu is full (${NAV_MAX})`
                                            : !menu?.targetId
                                              ? 'Site settings has not been created yet'
                                              : undefined
                                        }
                                        onClick={() => void addToMenu(r)}
                                      />
                                    )}
                                  </>
                                )}
                                <MenuDivider />
                                {archived ? (
                                  <MenuItem
                                    icon={RestoreIcon}
                                    text="Restore"
                                    tone="positive"
                                    onClick={() => void setArchived(r, false)}
                                  />
                                ) : (
                                  <MenuItem
                                    icon={TrashIcon}
                                    text="Archive"
                                    tone="critical"
                                    onClick={() => void setArchived(r, true)}
                                  />
                                )}
                              </Menu>
                            }
                          />
                        )}
                      </Flex>
                    );
                  })}
                </Stack>
              </Stack>
            ))
          )}
          <Button
            icon={AddIcon}
            text="New page"
            mode="ghost"
            tone="primary"
            disabled={creating}
            onClick={() => void createPage()}
          />

          {/* Saved sections — closed by default, so the page list stays the
              thing this panel is about. */}
          <Stack space={2}>
            <Button
              mode="bleed"
              padding={2}
              justify="flex-start"
              onClick={() => setPresetsOpen((v) => !v)}
              text={`${presetsOpen ? '▾' : '▸'} Saved sections${
                presets?.length ? ` (${presets.length})` : ''
              }`}
              aria-expanded={presetsOpen}
              title="Sections you kept from another page, ready to add to this one."
            />
            {presetsOpen && (
              <Stack space={2}>
                {!presets || presets.length === 0 ? (
                  <Text size={1} muted>
                    None yet. Open a page, then use "Save a section as preset..." in its publish
                    menu to keep one here.
                  </Text>
                ) : (
                  <>
                    {presets.length > PRESET_SOFT_CAP && (
                      <Text size={1} muted>
                        That is a lot of saved sections. Deleting the ones nobody uses makes this
                        list findable again.
                      </Text>
                    )}
                    {!currentField && (
                      <Text size={1} muted>
                        {currentRow
                          ? 'This page does not build itself from sections, so a saved section cannot go on it.'
                          : 'Open a page first, then add one to it.'}
                      </Text>
                    )}
                    {presets.map((p) => (
                      <Flex key={p.id} align="center" gap={1}>
                        <Card
                          as="button"
                          flex={1}
                          padding={2}
                          radius={2}
                          style={{ cursor: 'pointer', textAlign: 'left', minWidth: 0 }}
                          onClick={() =>
                            navigate(current || '/preview', { type: 'sectionPreset', id: p.id })
                          }
                          title={`Open "${p.title}" to change it`}
                        >
                          <Stack space={1}>
                            <Text size={1} textOverflow="ellipsis">
                              {p.title}
                            </Text>
                            {p.sectionType && (
                              <Text size={0} muted textOverflow="ellipsis">
                                {sectionLabel(p.sectionType)}
                              </Text>
                            )}
                          </Stack>
                        </Card>
                        <Button
                          mode="ghost"
                          padding={2}
                          icon={AddIcon}
                          disabled={!currentField || !p.section || busy === p.id}
                          title={
                            !p.section
                              ? 'This saved section is empty. Open it and put a section in it.'
                              : currentField
                                ? `Add "${p.title}" to ${currentRow?.label}`
                                : 'Open a page first, then add it.'
                          }
                          aria-label={
                            currentField
                              ? `Add ${p.title} to ${currentRow?.label}`
                              : `Add ${p.title}`
                          }
                          onClick={() => void addPreset(p)}
                        />
                      </Flex>
                    ))}
                  </>
                )}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Box>
      {/* Pinned under the page list so "edit the settings" never needs a trip
          back to the Structure tool. */}
      <Box padding={3} style={{ borderTop: '1px solid var(--card-border-color, #e2e8f0)' }}>
        <Stack space={1}>
          <Card
            as="button"
            padding={2}
            radius={2}
            style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}
            onClick={() =>
              navigate(current || '/preview', { type: 'siteSettings', id: 'siteSettings' })
            }
          >
            <Text size={1}>Site settings</Text>
          </Card>
        </Stack>
      </Box>
    </Flex>
  );
}
