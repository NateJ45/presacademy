// Foundation, edit with care
// JSON-LD schema builders. Each function returns a JSON string ready to drop
// into a <script type="application/ld+json"> tag via BaseLayout's `schemas` prop.
//
// LocalBusiness goes on every page (BaseLayout). Per-page schemas (Service,
// FAQPage, BreadcrumbList, CreativeWork) get added by the specific page that
// needs them. Test every schema against Google Rich Results before launch:
// https://search.google.com/test/rich-results

import { site } from '@/data/site';
import { resolveSiteSettings, type RawSiteSettings } from './siteSettings';

// ---------- Types (loose — Sanity provides the actual document shapes) ----

interface Service {
  name?: string;
  slug?: { current?: string };
  shortDescription?: string;
  price?: string;
}

interface FaqItem {
  question?: string;
  answer?: any;
}

interface Breadcrumb {
  name: string;
  url: string;
}

// ---------- LocalBusiness (site-wide, BaseLayout injects on every page) ----

export function organizationSchema(settings: RawSiteSettings | null | undefined): string {
  // Resolve through the shared helper so the JSON-LD identity matches what the
  // header and footer render.
  const s = resolveSiteSettings(settings);

  // Build the address object only with fields that are actually known.
  // Omit addressLocality / addressRegion / postalCode when cityStateZip cannot
  // be parsed (rather than emitting placeholder West Chester Township values).
  const address: Record<string, string> = { '@type': 'PostalAddress' };
  if (s.addressLine) address.streetAddress = s.addressLine;
  if (s.addressLocality) address.addressLocality = s.addressLocality;
  if (s.addressRegion) address.addressRegion = s.addressRegion;
  if (s.postalCode) address.postalCode = s.postalCode;
  address.addressCountry = 'US';

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${site.url}/#organization`,
    name: s.brandName,
    url: site.url,
    image: `${site.url}${site.assets.ogDefault}`,
    email: s.email || undefined,
    telephone: s.phone || undefined,
    address: Object.keys(address).length > 2 ? address : undefined,
    // Geo block is emitted only when both lat and lng are set in Sanity
    // (Studio: right-click your building in Google Maps → copy the coordinates).
    // When absent, the field is omitted rather than emitting placeholder coords.
    ...(s.geoLat !== undefined && s.geoLng !== undefined
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: s.geoLat,
            longitude: s.geoLng,
          },
        }
      : {}),
    sameAs: [
      s.social.instagram,
      s.social.facebook,
      s.social.youtube,
    ].filter(Boolean),
  };

  // Strip top-level undefined values so the emitted JSON is clean.
  return JSON.stringify(schema, (_key, value) => (value === undefined ? undefined : value));
}

// ---------- Service list (for /services) -----------------------------------

export function serviceListSchema(services: Service[] | null | undefined): string {
  const list = (services ?? []).filter((s) => s.name);
  if (list.length === 0) return JSON.stringify({});
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: list.map((s, i) => ({
      '@type': 'Service',
      position: i + 1,
      name: s.name,
      description: s.shortDescription,
      url: s.slug?.current ? `${site.url}/services#${s.slug.current}` : `${site.url}/services`,
      provider: { '@id': `${site.url}/#business` },
      ...(s.price ? { offers: { '@type': 'Offer', price: s.price, priceCurrency: 'USD' } } : {}),
    })),
  });
}

// ---------- FAQPage (for /faq) --------------------------------------------

/**
 * Flattens Portable Text answer blocks into a plain-text string for the
 * acceptedAnswer.text field. Schema.org does not accept HTML in this field.
 */
function ptToPlainText(blocks: any): string {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .filter((b) => b._type === 'block' && Array.isArray(b.children))
    .map((b) => b.children.map((c: any) => c.text ?? '').join(''))
    .join('\n\n')
    .trim();
}

export function faqPageSchema(faqs: FaqItem[] | null | undefined): string {
  const list = (faqs ?? []).filter((f) => f.question);
  if (list.length === 0) return JSON.stringify({});
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: ptToPlainText(f.answer),
      },
    })),
  });
}

// ---------- BreadcrumbList (every internal page) --------------------------

export function breadcrumbSchema(crumbs: Breadcrumb[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  });
}

// ---------- CreativeWork (for /portfolio/[slug]) --------------------------

interface Project {
  title?: string;
  slug?: { current?: string };
  briefSummary?: string;
  heroImage?: any;
  location?: string;
  year?: number;
  publishedAt?: string;
}

export function projectSchema(project: Project, heroImageUrl: string | null): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.briefSummary,
    url: project.slug?.current ? `${site.url}/portfolio/${project.slug.current}` : undefined,
    image: heroImageUrl ?? undefined,
    creator: { '@id': `${site.url}/#business` },
    locationCreated: project.location
      ? { '@type': 'Place', name: project.location }
      : undefined,
    dateCreated: project.year ? String(project.year) : undefined,
    datePublished: project.publishedAt,
  });
}

// ---------- BlogPosting (for /journal/[slug]) -----------------------------

interface JournalEntryForSchema {
  title?: string;
  slug?: { current?: string };
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  body?: any;
  categories?: Array<{ title?: string }>;
}

export function blogPostingSchema(
  entry: JournalEntryForSchema,
  coverImageUrl: string | null,
): string {
  const url = entry.slug?.current ? `${site.url}/journal/${entry.slug.current}` : `${site.url}/journal`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: entry.title,
    description: entry.excerpt,
    url,
    image: coverImageUrl ?? undefined,
    datePublished: entry.publishedAt,
    dateModified: entry.updatedAt ?? entry.publishedAt,
    author: entry.author
      ? { '@type': 'Person', name: entry.author }
      : { '@id': `${site.url}/#business` },
    publisher: { '@id': `${site.url}/#business` },
    keywords: Array.isArray(entry.categories)
      ? entry.categories.map((c) => c?.title).filter(Boolean).join(', ')
      : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  });
}
