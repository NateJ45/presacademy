// =============================================================================
// migrate-nav-contents.mjs: the top menu for the masthead and the Contents
// menu (2026-10-13, the chrome redesign)
// =============================================================================
//   node scripts/migrate-nav-contents.mjs            (dry run: prints the plan)
//   NCS_PRODUCTION_WRITE=yes node scripts/migrate-nav-contents.mjs --apply
//   (PowerShell: $env:NCS_PRODUCTION_WRITE='yes'; node scripts/migrate-nav-contents.mjs --apply;
//    Remove-Item Env:NCS_PRODUCTION_WRITE)
//
// Rewrites `siteSettings.navItems` (and the draft's, when a draft exists):
//
//   1. adds a Pricing link (/pricing) when no menu item points at /pricing
//      (approved by Nathan with the masthead mockups, 2026-10-13)
//   2. orders the menu Courses, Faculty, Pricing, Events, Resources, About;
//      any other item keeps its place after those, in its old order
//   3. sets the new `menuNote` on Events ("Info nights"), Resources
//      ("Reading") and About ("The school"), but ONLY where the note is
//      empty, so an editor's wording is never overwritten. Courses, Faculty
//      and Pricing need none: the site works theirs out from the data.
//
// SAFE BY CONSTRUCTION
//   - Dry run by default; --apply writes (and on production needs the second
//     factor, see scripts/lib/sanity-lib.mjs). Every change is logged.
//   - Idempotent: a menu already in the target shape is left alone, so a
//     second run reports "nothing to do".
//   - Refuses (writes nothing) if the result would exceed the six-link limit
//     the Studio enforces on navItems.
//   - Without a write token a dry run still works: it reads the PUBLISHED
//     settings anonymously (siteSettings is readable without a token) and says
//     that it could not see a draft. --apply always needs the token.
//
// The site renders correctly BEFORE this runs (the menu notes and the order
// have inline fallbacks), so run it after the chrome PR has merged and
// deployed: backup, dry run, --apply, re-run (nothing to do), /rebuild.
// =============================================================================
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { loadEnv } from './lib/loadEnv.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = loadEnv(ROOT);
const APPLY = process.argv.includes('--apply');
const hasToken = Boolean(env.SANITY_API_WRITE_TOKEN || env.SANITY_AUTH_TOKEN);

// The target order, by address. Labels are only used for a brand-new item.
const ORDER = ['/courses', '/faculty', '/pricing', '/events', '/resources', '/about'];
const NOTES = { '/events': 'Info nights', '/resources': 'Reading', '/about': 'The school' };
const PRICING = { _key: 'navLinkPricing', _type: 'navLink', label: 'Pricing', href: '/pricing' };
const MAX_ITEMS = 6;

/** "/pricing/" and "/pricing" are the same address; a picked page maps too. */
const PAGE_PATHS = {
  coursesPage: '/courses',
  facultyPage: '/faculty',
  pricingPage: '/pricing',
  eventsPage: '/events',
  resourcesPage: '/resources',
  aboutPage: '/about',
};
function pathOf(item) {
  const typed = typeof item?.href === 'string' ? item.href.trim() : '';
  if (typed) return typed.replace(/\/+$/, '') || '/';
  return PAGE_PATHS[item?.docType] ?? null;
}

/** The planned menu for one document, plus a list of what changed. */
function plan(items) {
  const list = Array.isArray(items) ? items.map((i) => ({ ...i })) : [];
  const changes = [];
  if (!list.some((i) => pathOf(i) === '/pricing')) {
    list.push({ ...PRICING });
    changes.push('add "Pricing" (/pricing)');
  }
  const rank = (i) => {
    const at = ORDER.indexOf(pathOf(i));
    return at === -1 ? ORDER.length : at;
  };
  const sorted = list
    .map((item, i) => ({ item, i }))
    .sort((a, b) => rank(a.item) - rank(b.item) || a.i - b.i)
    .map(({ item }) => item);
  const before = list.map((i) => i.label).join(', ');
  const after = sorted.map((i) => i.label).join(', ');
  if (before !== after && changes.length === 0) changes.push(`reorder: ${after}`);
  else if (changes.length > 0) changes.push(`order: ${after}`);
  for (const item of sorted) {
    const note = NOTES[pathOf(item)];
    if (note && item._type === 'navLink' && !(item.menuNote ?? '').trim()) {
      item.menuNote = note;
      changes.push(`menuNote on "${item.label}": "${note}"`);
    }
  }
  return { next: sorted, changes };
}

// The projection: the raw items plus the picked page's type, so a link made
// with the page picker (no typed address) still sorts into place.
const QUERY = `*[_id in $ids]{ _id, "navItems": navItems[]{ ..., "docType": internalPage->_type } }`;
const stripDocType = (items) => items.map(({ docType: _docType, ...rest }) => rest);

let docs;
let apply;
let done;
if (hasToken || APPLY) {
  const lib = await import('./lib/sanity-lib.mjs');
  apply = lib.apply;
  done = lib.done;
  docs = await lib.client
    .withConfig({ perspective: 'raw' })
    .fetch(QUERY, { ids: ['siteSettings', 'drafts.siteSettings'] });
} else {
  const projectId = env.PUBLIC_SANITY_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID;
  if (!projectId) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID in .env');
    process.exit(1);
  }
  console.log('No write token: reading the PUBLISHED settings anonymously (drafts not visible).\n');
  const anon = createClient({
    projectId,
    dataset: env.PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-05-01',
    useCdn: false,
    perspective: 'published',
  });
  docs = await anon.fetch(QUERY, { ids: ['siteSettings'] });
  apply = async (label) => console.log(`DRY ${label}`);
  done = (n) =>
    console.log(`\nDRY RUN: ${n} change(s). Re-run with --apply (and a write token) to write.`);
}

let count = 0;
if (docs.length === 0) console.log('No siteSettings document found. Nothing to do.');
for (const doc of docs) {
  console.log(
    `${doc._id}: ${(doc.navItems ?? []).map((i) => i.label).join(', ') || '(empty menu)'}`,
  );
  if (!Array.isArray(doc.navItems) || doc.navItems.length === 0) {
    console.log(
      '  empty menu: the site shows its built-in menu, which is already in the new shape. Skipped.',
    );
    continue;
  }
  const { next, changes } = plan(doc.navItems);
  if (changes.length === 0) {
    console.log('  nothing to do');
    continue;
  }
  if (next.length > MAX_ITEMS) {
    console.log(
      `  REFUSED: the menu would hold ${next.length} links (the limit is ${MAX_ITEMS}). Take one out first.`,
    );
    continue;
  }
  for (const c of changes) console.log(`  - ${c}`);
  const value = stripDocType(next);
  await apply(`${doc._id}: set navItems (${next.length} links)`, () =>
    import('./lib/sanity-lib.mjs').then(({ client }) =>
      client.patch(doc._id).set({ navItems: value }).commit(),
    ),
  );
  count += 1;
}
done(count);
