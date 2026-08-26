// Foundation, edit with care.
//
// Custom document status badges. They render at the top of the editor next to
// the Published/Draft pill and give the editor an at-a-glance read on a document's
// state without opening it or hunting through fields:
//
//   - "Featured"      — a course / faculty member / testimonial pinned to a spot
//   - "Needs a photo" — a course / faculty member / event whose image is empty
//   - "Add SEO"       — an indexable page whose SEO title or description is blank
//
// Registered via document.badges in sanity.config.ts. Each badge returns null
// when it doesn't apply, so a doc only shows the badges that are relevant to it.
// Brand-new empty drafts are left alone (no nagging before there's anything to
// nag about).

import { StarIcon, ImageIcon, SearchIcon } from '@sanity/icons';
import type { DocumentBadgeComponent, DocumentBadgeProps } from 'sanity';

// Indexable page singletons that carry seoTitle + seoDescription and are
// expected to have them filled before launch. Excludes notFoundPage (the 404 is
// noindex). These are the live SCHOOL pages; the old church/template types that
// used to be listed here were removed in the lay-school rebuild.
const SEO_PAGE_TYPES = new Set<string>([
  'homePage',
  'aboutPage',
  'coursesPage',
  'facultyPage',
  'pricingPage',
  'getStartedPage',
  'forYouPage',
  'resourcesPage',
  'eventsPage',
  'faqPage',
  'contactPage',
  'privacyPage',
]);

// Doc types with a cover/portrait/image worth flagging when empty, and the field
// name to check on each (course cover, faculty portrait, event image).
const PHOTO_FIELD: Record<string, string> = {
  course: 'coverImage',
  facultyMember: 'photo',
  event: 'image',
};

// The live document being edited: prefer the draft, fall back to the published
// version. Returns an empty object so callers can read fields without guarding.
function currentDoc(props: DocumentBadgeProps): Record<string, any> {
  return (props.draft ?? props.published ?? {}) as Record<string, any>;
}

// Has the editor actually started this doc? Used to avoid badging a freshly
// created, still-empty draft. Anything beyond system (_-prefixed) keys counts.
function hasStarted(doc: Record<string, any>): boolean {
  return Object.keys(doc).some((key) => !key.startsWith('_'));
}

const FeaturedBadge: DocumentBadgeComponent = (props) => {
  const doc = currentDoc(props);
  if (!doc.featured) return null;
  return { label: 'Featured', title: 'Pinned to a featured spot', color: 'primary', icon: StarIcon };
};

const NeedsPhotoBadge: DocumentBadgeComponent = (props) => {
  const field = PHOTO_FIELD[props.type as string];
  if (!field) return null;
  const doc = currentDoc(props);
  // Don't nag a brand-new draft that has no name/title yet. (facultyMember uses
  // `name`; course/event use `title`.)
  if (!doc.title && !doc.name) return null;
  const hasPhoto = Boolean(doc[field]?.asset?._ref);
  if (hasPhoto) return null;
  return { label: 'Needs a photo', title: 'No cover image set yet', color: 'warning', icon: ImageIcon };
};

const SeoBadge: DocumentBadgeComponent = (props) => {
  if (!SEO_PAGE_TYPES.has(props.type as string)) return null;
  const doc = currentDoc(props);
  if (!hasStarted(doc)) return null;
  const hasTitle = Boolean(doc.seoTitle);
  const hasDescription = Boolean(doc.seoDescription);
  if (hasTitle && hasDescription) return null;
  const missing = !hasTitle && !hasDescription ? 'title and description' : !hasTitle ? 'title' : 'description';
  return { label: 'Add SEO', title: `Missing SEO ${missing}`, color: 'warning', icon: SearchIcon };
};

// Order matters — badges render left to right in this order.
export const documentBadges = [FeaturedBadge, NeedsPhotoBadge, SeoBadge];

export default documentBadges;
