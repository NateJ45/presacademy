// Registers every schema type with the Studio.
// Order doesn't affect runtime; grouped here for readability.
//
// History: the interior-designer types (service, testimonial, journal*) were
// removed in the church remodel; the church types (staffMember, ministry,
// sermon, worshipResource, and the per-page church singletons) were retired in
// the lay-school revamp and replaced by the catalog types below.

import { aboutPage } from './aboutPage';
import { accessibilityPage } from './accessibilityPage';
import { announcement } from './announcement';
import { sectionBlocks } from './blocks';
import { contactPage } from './contactPage';
import { course } from './course';
import { ctaBlock } from './ctaBlock';
import { embed } from './embed';
import { event } from './event';
import { eventsPage } from './eventsPage';
import { facultyMember } from './facultyMember';
import { faqCategory } from './faqCategory';
import { faqItem } from './faqItem';
import { faqPage } from './faqPage';
import { form } from './form';
import { homePage } from './homePage';
import { notFoundPage } from './notFoundPage';
import { page } from './page';
import { pricingTier } from './pricingTier';
import { privacyPage } from './privacyPage';
import { schoolPageSingletons } from './schoolPages';
import { siteSettings } from './siteSettings';
import { teachingArea } from './teachingArea';
import { term } from './term';
import { testimonial } from './testimonial';

export const schemaTypes = [
  // Object types (embedded) first so they're defined before docs that reference them
  ctaBlock,
  embed,
  // Page-builder block library (flexibleSections members)
  ...sectionBlocks,

  // Reusable documents referenced by pages (define before the singletons that point at them)
  form,

  // Singletons
  siteSettings,
  homePage,
  aboutPage,
  faqPage,
  contactPage,
  eventsPage,
  notFoundPage,
  privacyPage,
  accessibilityPage,
  // School page singletons (courses, faculty, pricing, get-started, for-you, resources).
  ...schoolPageSingletons,

  // Reusable content collections
  faqCategory,
  faqItem,
  event,
  announcement,

  // School catalog (courses, faculty, terms, pricing, testimonials)
  teachingArea,
  term,
  course,
  facultyMember,
  pricingTier,
  testimonial,

  // Generic page (build new pages at /<slug> with the block library)
  page,
];
