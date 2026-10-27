// Safe to edit by hand
// =============================================================================
// The inner pages' hero style (starter card 189, refoundation phase D, 2026-10-27)
// =============================================================================
// "Photo behind the words": the page's hero photo fills the band and the small
// line, the headline and the line under it sit over it in white, under the
// Academy's forest-green shade (src/styles/photo-hero-academy.css, its contrast
// held by src/lib/photo-hero-academy.test.ts). An optional short-facts card sits
// beside the words: an open evening, the next term's dates, a deadline.
//
// Opt-in: `heroStyle` starts as Standard and nothing changes until an editor
// picks the photo style AND the page has a hero photo. Spread into every inner
// page that has a hero photo field (the singletons in schoolPages.ts, Contact,
// FAQ, Privacy, Accessibility, Events and custom pages); never Home, which keeps
// the Term Issue cover. `heroStyle` is in NON_STEGA_FIELDS (src/lib/cms-preview.ts).
import { defineArrayMember, defineField } from 'sanity';

export function heroStyleFields(group?: string) {
  return [
    defineField({
      name: 'heroStyle',
      title: 'Hero style',
      type: 'string',
      ...(group ? { group } : {}),
      description:
        'Standard keeps the page as it is. "Photo behind the words" puts the hero photo across the whole band with the headline over it in white, under a green shade that keeps the words readable on any photo. It needs a hero photo above; without one the page keeps its standard hero.',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Photo behind the words', value: 'photo' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'standard',
    }),
    defineField({
      name: 'heroGlance',
      title: 'Short-facts card (optional)',
      type: 'object',
      ...(group ? { group } : {}),
      description:
        'A small card beside the words, shown only with "Photo behind the words": a title, up to four short lines and a link. Like an open evening, or the next term\'s dates. Leave empty for no card.',
      hidden: ({ document }) =>
        (document as { heroStyle?: string } | undefined)?.heroStyle !== 'photo',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'title',
          title: 'Card title',
          type: 'string',
          description: 'Like "Open evening".',
          validation: (Rule) => Rule.max(40),
        }),
        defineField({
          name: 'lines',
          title: 'Lines',
          type: 'array',
          description:
            'Up to four short lines, like "Tuesday, January 12" and "7 pm, in the library".',
          of: [defineArrayMember({ type: 'string', validation: (Rule) => Rule.max(60) })],
          validation: (Rule) => Rule.max(4),
        }),
        defineField({
          name: 'link',
          title: 'Link (optional)',
          type: 'ctaBlock',
        }),
      ],
    }),
  ];
}
