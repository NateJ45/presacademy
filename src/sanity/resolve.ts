import { defineDocuments, type PresentationPluginOptions } from 'sanity/presentation';

import { SINGLETON_PREVIEW_PATHS, locations } from './locations';

// Re-exported here because this is where every caller has always imported it
// from (sanity.config.ts, and the site's preview route reads the same map). It
// is DEFINED in ./locations.ts so the two files import in one direction only:
// locations.ts needs the paths, and a circular import would put the map in the
// temporal dead zone at Studio start-up.
export { SINGLETON_PREVIEW_PATHS };

// =============================================================================
// Presentation Tool location resolver (ported from the WCP site, 2026-08-25)
// =============================================================================
// Two halves:
//
//  - `mainDocuments` (URL -> document): as you click through the preview iframe
//    like a normal website, Presentation opens the matching document in the
//    editor panel automatically. Routes match the iframe pathname (which lives
//    under /preview). Order matters: the singleton routes come before the
//    catch-all `page` route.
//
//  - `locations` (document -> URL): the reverse, so opening a document from the
//    desk points the preview at the right page. It lives in ./locations.ts and
//    QUERIES the dataset for the pages that really show the document. It used
//    to be a hardcoded map of one page per type, which under-reported every
//    document on more than one page (2026-08-29). Read that file's header
//    before changing it.
//
// The preview routes themselves live in the site app: src/pages/preview/.
// =============================================================================

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    { route: '/preview', filter: '_type == "homePage"' },
    // Singleton routes before the generic :slug catch-all.
    ...Object.entries(SINGLETON_PREVIEW_PATHS)
      .filter(([type]) => type !== 'homePage')
      .map(([type, href]) => ({ route: href, filter: `_type == "${type}"` })),
    { route: '/preview/:slug', filter: '_type == "page" && slug.current == $slug' },
  ]),
  locations,
};
