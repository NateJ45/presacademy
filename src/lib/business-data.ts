// Safe to edit by hand
// The one way a component reads the Academy's office facts (starter card 196).
//
// THE ACADEMY'S COPY. The starter keeps business facts in a Business info
// document; the Academy has always kept its address, phone, email and office
// hours in Site settings (Identity & contact), so this file maps those fields
// onto the starter's RawBusinessFacts shape and hands them to the PORTABLE
// resolver (src/lib/business-facts.ts):
//
//   street            <- addressLine
//   city, state, zip  <- cityStateZip, parsed by resolveSiteSettings()
//   openingHours[], hoursChanges[], hoursNote, findUs and the confirmed flags
//                     <- the fields of the same name (card 196, all optional)
//
// The one-line `officeHours` string stays the Academy's own: callers show it
// when there are no office hours by day (facts.hasHours is false), so the live
// site reads exactly as before until someone fills in the rows.
import { getSiteSettings } from '@/lib/queries';
import { resolveSiteSettings, type RawSiteSettings } from '@/lib/siteSettings';
import {
  resolveBusinessFacts,
  type BusinessFacts,
  type RawBusinessFacts,
} from '@/lib/business-facts';

/** The Site settings fields card 196 added, on top of the Academy's own. */
export type RawOfficeFacts = RawSiteSettings &
  Pick<
    RawBusinessFacts,
    | 'phoneConfirmed'
    | 'emailConfirmed'
    | 'addressConfirmed'
    | 'findUs'
    | 'openingHours'
    | 'hoursChanges'
    | 'hoursNote'
  >;

/** Site settings in the starter's RawBusinessFacts shape (pure). */
export function officeFactsFrom(raw?: RawOfficeFacts | null): RawBusinessFacts {
  const s = raw ?? {};
  const r = resolveSiteSettings(s);
  return {
    title: r.brandName,
    phone: r.phone,
    phoneConfirmed: s.phoneConfirmed,
    email: r.email,
    emailConfirmed: s.emailConfirmed,
    street: r.addressLine,
    city: r.addressLocality ?? '',
    state: r.addressRegion ?? '',
    zip: r.postalCode ?? '',
    addressConfirmed: s.addressConfirmed,
    findUs: s.findUs,
    geoLat: r.geoLat ?? null,
    geoLng: r.geoLng ?? null,
    openingHours: s.openingHours,
    hoursChanges: s.hoursChanges,
    hoursNote: s.hoursNote,
  };
}

/** The office facts from Site settings, resolved (pure). */
export function resolveOfficeFacts(raw?: RawOfficeFacts | null): BusinessFacts {
  return resolveBusinessFacts(officeFactsFrom(raw));
}

let _facts: Promise<BusinessFacts> | null = null;

/** The site's facts, resolved once per build. */
export function getBusinessFacts(): Promise<BusinessFacts> {
  _facts ??= getSiteSettings()
    .catch(() => null)
    .then((s: RawOfficeFacts | null) => resolveOfficeFacts(s));
  return _facts;
}

/**
 * The facts a block draws: its own fixture facts when the example sections page
 * passes some (so the thumbnail and the tests have hours to show), else the
 * site's. A block in a real page never carries facts.
 */
export async function factsFor(fixture?: RawBusinessFacts | null): Promise<BusinessFacts> {
  return fixture ? resolveBusinessFacts(fixture) : getBusinessFacts();
}
