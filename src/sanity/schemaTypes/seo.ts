// The one definition of the "Search & sharing" panel, shared by every page-like
// type: the generic `page` document, the school page singletons (schoolPages.ts)
// and the fixed page singletons (homePage, aboutPage, contactPage, faqPage,
// eventsPage, privacyPage, accessibilityPage, notFoundPage).
//
// Every one of those types used to spell the same three fields out for itself,
// which is how they drifted apart (different descriptions, different warning
// wording, eventsPage with no group at all). The FIELD NAMES are unchanged and
// the fields sit exactly where they always sat in each type's list, so nothing
// in the dataset moves and no query changes meaning. What is new is
// `hideFromSearch`, and the live preview the panel opens with.
//
// Field-by-field, and what reads it on the site:
//   seoTitle        -> the <title> and the Google result line, when set;
//                      otherwise the page's own computed title. Every route
//                      already does `page?.seoTitle ?? <default>`.
//   seoDescription  -> <meta name="description"> and the sentence under the
//                      Google result, when set.
//   seoImage        -> the Open Graph image, when set. BaseLayout ranks it
//                      under an explicit ogImage prop and over the site-wide
//                      default in siteSettings.seoImage.
//   hideFromSearch  -> <meta name="robots" content="noindex, nofollow"> plus
//                      removal from sitemap.xml. NEW (Pages as first-class
//                      objects, Phase B).
//
// The soft maximums stay at 60 / 160 characters, which is what the singletons
// have warned at since they were written; moving them would start warning about
// descriptions that were written to the old advice.
//
// GROUP NOTE: the group NAME is still `seo` (renaming it would orphan every
// field that points at it); only its title now reads "Search & sharing".

import { defineField } from 'sanity';
import { SeoPanelInput } from '../components/SeoPanelInput';

/** The tab these fields live on. Spread into a type's `groups` array. */
export const SEO_GROUP = { name: 'seo', title: 'Search & sharing' } as const;

interface SeoFieldsOptions {
  /** Group name to file the fields under. Omit on types that have no groups. */
  group?: string;
  /** Set false on types with no social card of their own (the 404 page). */
  image?: boolean;
  /** Override the share-image field title where a type said it differently. */
  imageTitle?: string;
}

/**
 * The Search & sharing fields, in panel order. Splice with `...seoFields(...)`
 * exactly where a type already listed its SEO fields.
 */
export function seoFields(options: SeoFieldsOptions = {}) {
  const { group, image = true, imageTitle = 'Social share image' } = options;

  return [
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group,
      description: 'Browser tab + Google result title. Aim for 50 to 60 characters.',
      // The live Google + social pictures ride on the first field of the group,
      // so they open the panel without a fake field to hang them on.
      components: { input: SeoPanelInput },
      validation: (Rule) =>
        Rule.max(60).warning('Titles longer than about 60 characters get cut off in Google.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group,
      description: 'The sentence under the title in Google results. Aim for 150 to 160 characters.',
      validation: (Rule) =>
        Rule.max(160).warning(
          'Descriptions longer than about 160 characters get cut off in Google.',
        ),
    }),
    ...(image
      ? [
          defineField({
            name: 'seoImage',
            title: imageTitle,
            type: 'image',
            group,
            description:
              'Optional. Shown when this page is shared. About 1200 by 630 pixels. Overrides the site default.',
            options: { hotspot: true },
            fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
          }),
        ]
      : []),
    defineField({
      name: 'hideFromSearch',
      title: 'Hide this page from search engines',
      type: 'boolean',
      group,
      // No initialValue on purpose: an untouched document has no value at all,
      // which every check below reads as "show it", so nothing changes for the
      // pages that already exist.
      description:
        'Turn on for a page you want to hand out by link but keep out of Google. The page stays live at its address; it is asked not to be indexed and it drops out of the sitemap.',
    }),
  ];
}
