// =============================================================================
// Studio URL helpers — shared by sanity.config.ts (repo root) and the Studio
// components (PageHelpBanner, SeoPreviewPane).
// =============================================================================
// Extracted out of sanity.config.ts when the studio folded into the root
// package (2026-08-26), so components import a small sibling module instead of
// reaching up to the repo-root config file.

// -----------------------------------------------------------------------------
// Env access that works in BOTH bundlers. The sanity CLI defines
// process.env.SANITY_STUDIO_*; the EMBEDDED /studio (bundled by Astro/Vite)
// has no `process` global at all in the browser and exposes PUBLIC_* vars on
// import.meta.env instead. A bare `process.env.X` read would throw a
// ReferenceError the moment the embedded studio chunk evaluates.
// -----------------------------------------------------------------------------
export const envVal = (...names: string[]): string | undefined => {
  for (const n of names) {
    const fromProcess = typeof process !== 'undefined' ? process.env?.[n] : undefined;
    if (fromProcess) return fromProcess;
    const fromVite = (import.meta as { env?: Record<string, string | undefined> }).env?.[n];
    if (fromVite) return fromVite;
  }
  return undefined;
};

// Preview/site base used by urlForDoc. Defaults to production; override with
// SANITY_STUDIO_PREVIEW_URL (e.g. http://localhost:4321 for local dev).
export const SITE_URL_FOR_PREVIEW =
  envVal('SANITY_STUDIO_PREVIEW_URL') || 'https://www.presbyterianacademy.org';

// The live (production) site base used by the "View on the live site" help
// banner. Deliberately INDEPENDENT of SITE_URL_FOR_PREVIEW (which may point at
// localhost during local dev) so faculty in the deployed Studio are always
// sent to the real site.
export const LIVE_SITE_URL = 'https://www.presbyterianacademy.org';

// Map doc _type → live-site PATH (no host). Singletons get a fixed path;
// slug-based docs build it from the slug. Returns null for types with no
// public page (siteSettings).
export function pathForDoc(schemaType: string, doc: any): string | null {
  const slug = doc?.slug?.current;
  switch (schemaType) {
    // Core pages
    case 'homePage':      return '/';
    case 'aboutPage':     return '/about';
    case 'faqPage':       return '/faq';
    case 'contactPage':   return '/contact';
    case 'notFoundPage':  return '/404';
    case 'privacyPage':   return '/privacy';
    case 'accessibilityPage': return '/accessibility';
    // School index pages + page singletons
    case 'eventsPage':       return '/events';
    case 'coursesPage':      return '/courses';
    case 'facultyPage':      return '/faculty';
    case 'pricingPage':      return '/pricing';
    case 'getStartedPage':   return '/get-started';
    case 'forYouPage':       return '/for-you';
    case 'resourcesPage':    return '/resources';
    // Collections: dated detail pages by slug; course + faculty detail; FAQ list.
    case 'event':         return slug ? `/events/${slug}` : '/events';
    case 'course':        return slug ? `/courses/${slug}` : '/courses';
    case 'facultyMember': return slug ? `/faculty/${slug}` : '/faculty';
    case 'faqItem':       return '/faq';
    // Generic custom pages live at /<slug>.
    case 'page':          return slug ? `/${slug}` : null;
    default:              return null;
  }
}

/** Full URL on the preview/site base. */
export function urlForDoc(schemaType: string, doc: any): string | null {
  const path = pathForDoc(schemaType, doc);
  return path === null ? null : `${SITE_URL_FOR_PREVIEW}${path}`;
}
