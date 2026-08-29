import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// =============================================================================
// The DRIFT GATE on Presentation's URL -> document filters and "Used on" panel
// =============================================================================
// `mainDocuments` in src/sanity/resolve.ts is a set of GROQ filter STRINGS.
// Nothing type-checks a string against the schema, so a filter can name a field
// path that does not exist and fail completely silently: Presentation finds no
// document, shows "Missing a main document for <path>", and the editor panel
// simply stops following the preview. No error, no build failure.
//
// That is not a hypothetical. On the WCP site every `page` filter queried
// `slug.current` while that repo's `page.slug` is a plain STRING (it must hold
// slashes), so every page route matched nothing for months. THIS repo is the
// mirror image: `page.slug` really is Sanity's `slug` type, so `.current` is
// correct here. The two repos disagree on purpose, and each pins its own half,
// so neither can be "fixed" into the other's shape without a test saying so.
//
// The same file reads src/sanity/locations.ts, which answers "where does this
// appear?" by QUERYING the dataset. Its answers lean on facts that live in
// other files (the section types that render each collection, the two builder
// array names, the preview paths). Those are pinned here too.
//
// Everything below reads SOURCE TEXT rather than importing the modules: the
// Studio files import `sanity/presentation` and rxjs, which the plain node
// test runner has no business loading.
// =============================================================================

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const RESOLVE = read('../sanity/resolve.ts');
const LOCATIONS = read('../sanity/locations.ts');
const BLOCKS = read('../sanity/schemaTypes/blocks.ts');
const PAGE_BUILDER_CONFIG = read('../sanity/pageBuilderConfig.ts');

/** The declared `type:` of a document's `slug` field, straight from its schema. */
function slugFieldType(schemaFile: string): string {
  const source = read(`../sanity/schemaTypes/${schemaFile}`);
  const field = source.match(/name: 'slug',[\s\S]{0,200}?type: '([a-zA-Z]+)'/);
  if (!field) throw new Error(`no slug field found in ${schemaFile}`);
  return field[1];
}

/**
 * Every filter string inside the defineDocuments([...]) block. Two are written
 * out (home and the catch-all); the singleton ones are GENERATED from
 * SINGLETON_PREVIEW_PATHS, which the route test below pins separately.
 */
function mainDocumentFilters(): string[] {
  const block = RESOLVE.match(/defineDocuments\(\[([\s\S]*?)\]\),/);
  assert.ok(block, 'defineDocuments([...]) block not found in resolve.ts');
  return [...block[1].matchAll(/filter: [`']([^`']+)[`']/g)].map((m) => m[1].trim());
}

/** The literal `route: '...'` strings, in the order Presentation tries them. */
function mainDocumentRoutes(): string[] {
  const block = RESOLVE.match(/defineDocuments\(\[([\s\S]*?)\]\),/);
  return [...block![1].matchAll(/route: '([^']+)'/g)].map((m) => m[1]);
}

/** The keys of a `Record<string, ...>` object literal named `name`. */
function objectKeys(source: string, name: string): string[] {
  const body = source.match(new RegExp(`${name}[^=]*= \\{([\\s\\S]*?)\\n\\};`));
  assert.ok(body, `${name} not found`);
  return [...body[1].matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]);
}

// -----------------------------------------------------------------------------
// The schema still says what these filters assume
// -----------------------------------------------------------------------------

test('page.slug IS a slug type here, so its filters keep .current', () => {
  // The opposite of the WCP repo, deliberately: nothing on this site needs a
  // slash inside a slug, so the `slug` type (and its slugify button) is right.
  // If that ever changes, the filters must LOSE `.current` in the same commit,
  // and this assertion is what will say so.
  assert.equal(slugFieldType('page.ts'), 'slug');

  const pageFilters = mainDocumentFilters().filter((f) => f.includes('_type == "page"'));
  assert.ok(pageFilters.length > 0, 'no page filter found in defineDocuments');
  for (const filter of pageFilters) {
    assert.match(filter, /slug\.current/, `page filter must read slug.current: ${filter}`);
  }
});

test('the singleton routes are generated from the one preview-path map', () => {
  // Fourteen routes are not written out: they are derived, so a new singleton
  // page needs one map entry rather than three edits that can disagree.
  const known = objectKeys(LOCATIONS, 'SINGLETON_PREVIEW_PATHS');
  assert.equal(known.length, 14, 'expected the 14 path-mapped singletons');
  assert.match(RESOLVE, /Object\.entries\(SINGLETON_PREVIEW_PATHS\)/);
  assert.match(RESOLVE, /route: href, filter: `_type == "\$\{type\}"`/);
  assert.ok(known.includes('homePage'));
});

// -----------------------------------------------------------------------------
// Route order
// -----------------------------------------------------------------------------

test('the generic :slug route comes last, after the generated singletons', () => {
  // Presentation takes the FIRST matching route. `/preview/:slug` would
  // otherwise swallow `/preview/about` and look for a `page` whose slug is
  // "about". The generated block sits between these two literals in the array,
  // so their positions are what hold the order.
  const routes = mainDocumentRoutes();
  assert.deepEqual(routes, ['/preview', '/preview/:slug']);
  const block = RESOLVE.match(/defineDocuments\(\[([\s\S]*?)\]\),/)![1];
  assert.ok(
    block.indexOf('SINGLETON_PREVIEW_PATHS') < block.indexOf("route: '/preview/:slug'"),
    'the generated singleton routes must come before the :slug catch-all',
  );
});

// -----------------------------------------------------------------------------
// What the "Used on" resolver assumes about the rest of the repo
// -----------------------------------------------------------------------------

test('resolve.ts delegates locations to the querying resolver', () => {
  // A regression here is silent and expensive: the panel would go back to
  // naming one page per type, which is wrong the moment a second page shows
  // the same document.
  assert.match(RESOLVE, /from '\.\/locations'/);
  assert.match(RESOLVE, /^ {2}locations,$/m);
  assert.ok(
    !RESOLVE.includes('defineLocations'),
    'resolve.ts still holds a hardcoded locations map',
  );
});

test('the usage query reads both builder array names', () => {
  // SECTION_HOST_TYPES maps singletons to `flexibleSections` and the custom
  // page type to `sections`. The query must look in both or half the site's
  // pages can never be found.
  const arrays = new Set(
    [...PAGE_BUILDER_CONFIG.matchAll(/^ {2}\w+: '(\w+)',$/gm)].map((m) => m[1]),
  );
  assert.deepEqual([...arrays].sort(), ['flexibleSections', 'sections']);
  for (const field of arrays) {
    assert.ok(
      LOCATIONS.includes(`count(${field}[_type in $sections])`),
      `the usage query never looks in ${field}`,
    );
  }
});

test('the usage query excludes drafts and trashed pages', () => {
  // Published perspective answers "where does this appear on the SITE?".
  // `archived != true` is this repo's soft delete (schemaTypes/archived.ts):
  // a page in the trash shows the document nowhere.
  const arms = [...LOCATIONS.matchAll(/\*\[_type in \$hosts[^\]]*\]/g)].map((m) => m[0]);
  assert.ok(arms.length >= 2, 'expected the direct and rendered arms');
  for (const arm of arms) {
    assert.ok(arm.includes('!(_id in path("drafts.**"))'), `arm does not exclude drafts: ${arm}`);
    assert.ok(arm.includes('archived != true'), `arm does not exclude trash: ${arm}`);
  }
  assert.match(LOCATIONS, /perspective: 'published'/);
});

test('every section type the resolver watches for really exists', () => {
  // RENDERED_BY duplicates knowledge that lives in blocks.ts: which section
  // fetches which collection. A renamed or deleted block would leave the panel
  // quietly under-reporting, so read the schema and check.
  const declared = new Set([...BLOCKS.matchAll(/^ {2}name: '(section\w+)',$/gm)].map((m) => m[1]));
  const watched = [...LOCATIONS.matchAll(/'(section\w+)'/g)].map((m) => m[1]);
  assert.ok(watched.length > 5, 'RENDERED_BY looks empty');
  for (const type of watched) {
    assert.ok(
      declared.has(type),
      `locations.ts watches a section type that no longer exists: ${type}`,
    );
  }
});

test('the dynamic-list sources match that block’s own option list', () => {
  const block = BLOCKS.match(/name: 'sectionDynamicList',[\s\S]*?name: 'count',/);
  assert.ok(block, 'sectionDynamicList not found');
  const options = new Set([...block[0].matchAll(/value: '(\w+)'/g)].map((m) => m[1]));
  const used = [...LOCATIONS.matchAll(/^ {2}\w+: '(\w+)',$/gm)]
    .map((m) => m[1])
    .filter((v) => options.has(v));
  assert.ok(used.length >= 4, 'DYNAMIC_SOURCE no longer covers the four sources');
  for (const source of ['featuredCourses', 'upcomingEvents', 'faculty', 'testimonials']) {
    assert.ok(options.has(source), `sectionDynamicList lost the "${source}" option`);
    assert.ok(LOCATIONS.includes(`'${source}'`), `DYNAMIC_SOURCE lost "${source}"`);
  }
});

test('a course and a teacher always list their pinned index page', () => {
  // The catalog and the roster are PINNED CODE REGIONS, not sections, so no
  // query can see them. Without the ALWAYS entry a brand-new course reads "not
  // shown on any page", while it is already in the catalog.
  const always = LOCATIONS.match(/const ALWAYS[\s\S]*?\n\};/);
  assert.ok(always, 'the ALWAYS map is gone');
  assert.match(always[0], /course: \[\{ title: '[^']*', href: '\/preview\/courses' \}\]/);
  assert.match(always[0], /facultyMember: \[\{ title: '[^']*', href: '\/preview\/faculty' \}\]/);
});
