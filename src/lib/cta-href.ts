// Safe to edit by hand
// =============================================================================
// cta-href - the finished href for a ctaBlock
// =============================================================================
// Moved out of CtaLink.astro (refoundation phase B, 2026-10-27) so a builder
// block that makes a whole card its link (the hub, starter card 193) resolves
// a button exactly the way CtaLink does. The Academy's own rules, unchanged:
// internal singletons go to a fixed path, `page` documents to /<slug>/, an
// external path gets its trailing slash (rule 19), mailto: and tel: stay bare.
//
// Keep TYPE_TO_PATH in step with ctaBlock.ts `internalLink.to[]`: every type
// listed there needs an entry here (or a slug case below), or the link falls
// back silently.
// =============================================================================

import { withTrailingSlash } from './href.ts';

export interface CtaTarget {
  linkType?: 'internal' | 'external' | 'email' | 'phone';
  internalLink?: { _type?: string; slug?: string } | null;
  externalUrl?: string;
  emailAddress?: string;
  phoneNumber?: string;
  /** A plain path. Only fixtures name their path this way. */
  href?: string;
}

const TYPE_TO_PATH: Record<string, string> = {
  // Core singletons
  homePage: '/',
  aboutPage: '/about/',
  faqPage: '/faq/',
  contactPage: '/contact/',
  eventsPage: '/events/',
  resourcesPage: '/resources/',
  // School page singletons
  coursesPage: '/courses/',
  facultyPage: '/faculty/',
  pricingPage: '/pricing/',
  getStartedPage: '/get-started/',
  forYouPage: '/for-you/',
};

/** The href for a ctaBlock, or `fallbackHref` when it cannot be resolved. */
export function ctaHref(c: CtaTarget | null | undefined, fallbackHref = '/contact/'): string {
  // No linkType: a fixture's button names its path directly.
  if (!c?.linkType) return c?.href ?? fallbackHref;
  switch (c.linkType) {
    case 'internal': {
      const t = c.internalLink?._type;
      if (!t) return fallbackHref;
      if (t === 'journalEntry' && c.internalLink?.slug) {
        return `/journal/${c.internalLink.slug}/`;
      }
      if (t === 'page' && c.internalLink?.slug) {
        return `/${c.internalLink.slug}/`;
      }
      return TYPE_TO_PATH[t] ?? fallbackHref;
    }
    case 'external':
      return withTrailingSlash(c.externalUrl ?? fallbackHref);
    case 'email':
      return c.emailAddress ? `mailto:${c.emailAddress}` : fallbackHref;
    case 'phone':
      return c.phoneNumber ? `tel:${c.phoneNumber.replace(/[^\d+]/g, '')}` : fallbackHref;
    default:
      return fallbackHref;
  }
}
