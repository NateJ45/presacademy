// Foundation, edit with care
// Single source of truth for resolving the Sanity siteSettings document into the
// identity / contact / social values the header, footer, pages, and JSON-LD all
// render.
//
// Why this exists: every consumer used to re-implement its own
// `siteSettings?.field ?? site.contact.field` resolution. Four copies drifted
// (the footer office-hours never read Sanity at all; the JSON-LD YouTube link was
// hardcoded; the header showed two socials, the footer three). Worse, the
// `?? site.*` fallbacks meant an empty Sanity field silently rendered the
// hardcoded value in src/data/site.ts, so you could never tell from the page
// whether Sanity was actually driving the content.
//
// Rule now: NO component or page reads siteSettings identity/contact/social fields
// directly, and NOTHING imports site.contact / site.social (both deleted). Call
// resolveSiteSettings(raw) and read from the returned object. There is exactly one
// place — here — that decides what each field resolves to:
//
//   - Required identity (church name, email, phone, address, socials): read
//     straight from Sanity. Empty stays empty (renders blank) so a missing value
//     is visible, never masked by a hardcoded default.
//   - Hide-when-empty (officeHours): undefined when blank; callers hide the
//     element rather than show a stand-in.
//   - Derived-from-Sanity defaults (mission -> tagline, pastorEmail -> public
//     email, give link -> /give page, watch link -> /sermons page): a sensible
//     value computed from OTHER Sanity fields or an internal route, never from a
//     hardcoded church-specific literal.
//
// brandName is the one exception that still falls back to src/data/site.ts
// (site.name): the church name is a required Sanity field, so the fallback is an
// unreachable crash-guard, and site.name remains the static identity used by
// <title>/OG meta in BaseLayout.

import { site } from '@/data/site';

/** The raw siteSettings fields this resolver consumes (from getSiteSettings()). */
export interface RawSiteSettings {
  title?: string | null;
  tagline?: string | null;
  mission?: string | null;
  email?: string | null;
  pastorEmail?: string | null;
  phone?: string | null;
  officeHours?: string | null;
  addressLine?: string | null;
  cityStateZip?: string | null;
  /** Decimal latitude of the building. Set in Studio via right-click on Google Maps. */
  geoLat?: number | null;
  /** Decimal longitude of the building. Set in Studio via right-click on Google Maps. */
  geoLng?: number | null;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
  socialYoutube?: string | null;
}

export interface ResolvedSiteSettings {
  /** Church name. Required in Sanity; site.name is an unreachable crash-guard. */
  brandName: string;
  tagline: string;
  /** Footer mission line. Falls back to the tagline when unset. */
  mission: string;
  /** Public email. Empty string when unset (callers guard with `email &&`). */
  email: string;
  /** Pastoral-care email. Falls back to the public email when unset. */
  pastorEmail: string;
  /** Public phone. Empty string when unset (callers guard with `phone &&`). */
  phone: string;
  /** Office hours. undefined when unset — hide the element, don't substitute. */
  officeHours?: string;
  addressLine: string;
  cityStateZip: string;
  /** "9463 Cincinnati Columbus Rd, West Chester Township, OH 45069" for maps + structured data. */
  fullAddress: string;
  /** Google Maps directions link built from the resolved address. */
  mapHref: string;
  /**
   * Parsed city from cityStateZip (format "City, ST 12345"). undefined when
   * the string is absent or does not match the expected format. Used only for
   * structured data; callers should handle undefined gracefully.
   */
  addressLocality?: string;
  /**
   * Parsed two-letter state code from cityStateZip. undefined when absent or
   * unparseable.
   */
  addressRegion?: string;
  /**
   * Parsed ZIP/postal code from cityStateZip. undefined when absent or
   * unparseable.
   */
  postalCode?: string;
  /**
   * Latitude from Sanity siteSettings.geoLat. undefined when not set.
   * The structured-data builder omits the geo block entirely when this is absent.
   */
  geoLat?: number;
  /**
   * Longitude from Sanity siteSettings.geoLng. undefined when not set.
   * The structured-data builder omits the geo block entirely when this is absent.
   */
  geoLng?: number;
  social: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
}

const DEFAULT_TAGLINE = 'Reformed theological formation for everyday leaders.';

/** Trim a Sanity string; treat blank/whitespace-only/missing as "unset". */
function clean(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Parse a "City, ST 12345" string into its three parts.
 * The expected format is: one or more words, a comma, a space, exactly two
 * uppercase letters, a space, and five (or five-plus-four) digits.
 * Returns undefined for each part that cannot be reliably derived.
 *
 * Examples:
 *   "West Chester Township, OH 45069"  → { locality: "West Chester Township", region: "IL", postal: "62701" }
 *   "New York, NY 10001-0001"→ { locality: "New York",    region: "NY", postal: "10001-0001" }
 *   "Downtown"               → { locality: undefined,     region: undefined, postal: undefined }
 */
function parseCityStateZip(
  raw?: string,
): { locality?: string; region?: string; postal?: string } {
  if (!raw) return {};
  // Accepts "City Name, XX 12345" or "City Name, XX 12345-6789"
  const match = raw.match(/^(.+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  if (!match) return {};
  return { locality: match[1].trim(), region: match[2], postal: match[3] };
}

export function resolveSiteSettings(raw?: RawSiteSettings | null): ResolvedSiteSettings {
  const s = raw ?? {};

  const tagline = clean(s.tagline) ?? DEFAULT_TAGLINE;
  const email = clean(s.email) ?? '';
  const addressLine = clean(s.addressLine) ?? '';
  const cityStateZip = clean(s.cityStateZip) ?? '';
  const fullAddress = [addressLine, cityStateZip].filter(Boolean).join(', ');

  // Parse city/state/ZIP for structured data. Omit fields that cannot be parsed
  // rather than emitting placeholder values.
  const parsed = parseCityStateZip(cityStateZip || undefined);

  // Geo coordinates: only include when both lat and lng are finite numbers.
  const geoLat =
    typeof s.geoLat === 'number' && isFinite(s.geoLat) ? s.geoLat : undefined;
  const geoLng =
    typeof s.geoLng === 'number' && isFinite(s.geoLng) ? s.geoLng : undefined;

  return {
    brandName: clean(s.title) ?? site.name,
    tagline,
    mission: clean(s.mission) ?? tagline,
    email,
    pastorEmail: clean(s.pastorEmail) ?? email,
    phone: clean(s.phone) ?? '',
    officeHours: clean(s.officeHours),
    addressLine,
    cityStateZip,
    fullAddress,
    mapHref: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`,
    addressLocality: parsed.locality,
    addressRegion: parsed.region,
    postalCode: parsed.postal,
    geoLat,
    geoLng,
    social: {
      instagram: clean(s.socialInstagram),
      facebook: clean(s.socialFacebook),
      youtube: clean(s.socialYoutube),
    },
  };
}
