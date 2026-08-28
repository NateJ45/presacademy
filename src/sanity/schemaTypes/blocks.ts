// Shared "page builder" block library. These object types are the building
// blocks for flexibleSections[] on the generic `page` type (and, later, any page
// singleton). Each renders on-brand via a matching component in
// src/components/blocks/. Editors add/remove/reorder them with no developer.
//
// Naming: all block types are prefixed `section` so they read clearly in the
// Studio "Add item" menu and never collide with document types. The shared
// `embed` object (embed.ts) is also allowed in flexibleSections.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { hasInlineRich } from '../../lib/inline-rich';
import { ACCENT_OPTIONS, SURFACE_OPTIONS } from '../../lib/surfaces';
import { columnFallback, columnOptions, sideOptions } from '../../lib/layout-variants';
import { AccentSwatchInput, SurfaceSwatchInput } from '../components/SwatchInput';

// Reusable rich-text body (paragraphs, headings, lists, links).
const richBody = {
  type: 'array' as const,
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading', value: 'h3' },
        { title: 'Subheading', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (R: any) => R.uri({ allowRelative: true }),
              },
              { name: 'openInNewTab', type: 'boolean', title: 'Open in new tab' },
            ],
          },
        ],
      },
    }),
  ],
};

// Shared "section background" control: a design-token tone, OR an image/video
// behind the section with a darkening overlay so text stays readable. Added to
// blocks that opt into backgrounds; rendered by SectionShell.astro.
export function bgField() {
  return defineField({
    name: 'background',
    title: 'Section background',
    type: 'object',
    options: { collapsible: true, collapsed: true },
    description:
      'Optional. Set a brand color tone, or drop in a background photo/video with a dark overlay so text stays readable.',
    fields: [
      // The surface: a background and the text treatment designed to sit on it,
      // picked as one thing. The list and the swatch colours both come from
      // src/lib/surfaces.ts, and every pair in it is measured against WCAG AA by
      // src/lib/surfaces.test.ts. The four original values are unchanged; "card"
      // and "ink" are the additions.
      defineField({
        name: 'tone',
        title: 'Surface',
        type: 'string',
        description: 'Pick a background. The text colour comes with it.',
        options: { list: SURFACE_OPTIONS, layout: 'radio' },
        initialValue: 'default',
        components: { input: SurfaceSwatchInput },
      }),
      // The accent: the small colour inside the section (the rule before an
      // eyebrow, an accent word in the heading, the fill on a primary button).
      // "Green" is the house look and is what a section with no choice renders,
      // so leaving this alone changes nothing.
      defineField({
        name: 'accent',
        title: 'Accent colour',
        type: 'string',
        description: 'The small colour inside the section: eyebrow rule, accent word, button.',
        options: { list: ACCENT_OPTIONS, layout: 'radio' },
        initialValue: 'green',
        components: { input: AccentSwatchInput },
      }),
      defineField({
        name: 'image',
        title: 'Background image (optional)',
        type: 'image',
        options: { hotspot: true },
        fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        description:
          'Sits behind the section under a dark overlay. Text is shown in white over it.',
      }),
      defineField({
        name: 'videoUrl',
        title: 'Background video URL (optional)',
        type: 'url',
        description:
          'A direct .mp4 or .webm file URL. Plays muted, looped, behind the section. Overrides the image.',
      }),
      defineField({
        name: 'overlay',
        title: 'Overlay darkness (%)',
        type: 'number',
        initialValue: 55,
        validation: (R) => R.min(0).max(90),
        description:
          'Only applies when an image or video is set. Higher = darker, for better text contrast.',
      }),
      defineField({
        name: 'padding',
        title: 'Vertical spacing',
        type: 'string',
        options: {
          list: [
            { title: 'Compact', value: 'compact' },
            { title: 'Normal', value: 'normal' },
            { title: 'Spacious', value: 'spacious' },
          ],
          layout: 'radio',
        },
        initialValue: 'normal',
      }),
    ],
  });
}

// =============================================================================
// Wave 2a: inline emphasis on curated plain-string body fields (2026-08-28)
// =============================================================================
// A handful of short SUPPORT-TEXT fields (a subhead, an intro, a body line) are
// plain strings, so an editor could not italicise a course name or bold one
// promise inside them. Each of those now has a "rich twin": a sibling portable
// text field allowing exactly two marks, bold and italic, and nothing else.
//
// The rules that make this safe to ship against a live dataset:
//   - the plain field keeps its name, its type and its stored value,
//   - the twin is a NEW field, so no document has one and every page renders
//     the string exactly as before (scripts/page-parity.mjs holds that line),
//   - the plain field HIDES only once the twin holds text, so an editor never
//     sees two boxes both claiming to be the subhead,
//   - the twin is always visible, so it is discoverable without a hunt.
// Headlines and display text are deliberately NOT on the list. One emphasis
// device per heading is the site's rule, and that device is the accent word
// below.
const inlineRichBody = {
  type: 'array' as const,
  of: [
    defineArrayMember({
      type: 'block',
      // One style, two marks, no lists, no links, no annotations. The Studio
      // toolbar collapses to a bold button and an italic button.
      styles: [{ title: 'Normal', value: 'normal' }],
      lists: [],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [],
      },
    }),
  ],
};

/** The rich twin of a plain string field. Title matches the field it twins. */
function richTwin(name: string, title: string) {
  return defineField({
    name,
    title,
    ...inlineRichBody,
    description: 'You can bold or italicize here.',
  });
}

/** Hide the plain field once its twin holds text. */
function hideWhenRich(twin: string) {
  return ({ parent }: { parent?: Record<string, unknown> }) => hasInlineRich(parent?.[twin]);
}

/**
 * Wave 2b: one word of a big heading, set in the section's accent colour.
 * The sibling of the existing scriptAccent device, and held to the same rule:
 * at most one accent per heading. Matching is case-insensitive and stops at the
 * first hit; a word that is not in the heading simply does nothing.
 */
function headingAccentField() {
  return defineField({
    name: 'headingAccent',
    title: 'Accent word in the heading',
    type: 'string',
    description:
      'Optional. Type a word or short phrase from the heading above and it is set in the section accent colour. Leave it blank for a plain heading.',
  });
}

/**
 * Wave 3, 2026-08-28: the column control, one field built from one registry.
 *
 * The list an editor sees and the classes the site emits both come from
 * src/lib/layout-variants.ts, so a block cannot offer a count it has no layout
 * for. `initialValue` is that block's existing default, which is also what a
 * section stored before this control existed renders, so nothing already
 * published moves.
 *
 * A LAYOUT knob, not content: `columns` is already in SETTING_KEYS
 * (src/lib/page-checks.ts) and in NON_STEGA_FIELDS (src/lib/cms-preview.ts),
 * so setting it never makes an empty section read as filled and the preview
 * never sees a stega-encoded value where an exact match is needed.
 */
function columnsField(type: string, phoneNote = 'On a phone these always stack into one column.') {
  return defineField({
    name: 'columns',
    title: 'How many across',
    type: 'string',
    description: `This is the widest screen. ${phoneNote}`,
    options: { list: columnOptions(type), layout: 'radio' },
    initialValue: columnFallback(type),
  });
}

export const sectionRichText = defineType({
  name: 'sectionRichText',
  title: 'Text section',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    headingAccentField(),
    defineField({ name: 'body', title: 'Body', ...richBody }),
    defineField({
      name: 'align',
      title: 'Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Text section' }),
  },
});

export const sectionImageText = defineType({
  name: 'sectionImageText',
  title: 'Image + text',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'imageSide',
      title: 'Which side is the picture on?',
      type: 'string',
      description: 'On a phone the picture is always under the words.',
      options: { list: sideOptions('Picture'), layout: 'radio' },
      initialValue: 'right',
    }),
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body', ...richBody }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string' }),
    defineField({
      name: 'ctaUrl',
      title: 'Button link',
      type: 'string',
      description: 'Internal path like "/get-started" or a full URL.',
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading', media: 'image' },
    prepare: ({ title, media }) => ({ title: title || 'Image + text', media }),
  },
});

export const sectionCardGrid = defineType({
  name: 'sectionCardGrid',
  title: 'Card grid',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    headingAccentField(),
    defineField({
      name: 'subhead',
      title: 'Subhead',
      type: 'text',
      rows: 2,
      hidden: hideWhenRich('subheadRich'),
    }),
    richTwin('subheadRich', 'Subhead'),
    columnsField('sectionCardGrid'),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'card',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string',
              description: 'Optional. Makes the card clickable.',
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Card grid' }),
  },
});

export const sectionQuote = defineType({
  name: 'sectionQuote',
  title: 'Quote / scripture',
  type: 'object',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
      description: 'e.g. a person or a scripture reference.',
    }),
    bgField(),
  ],
  preview: { select: { title: 'quote', subtitle: 'attribution' } },
});

export const sectionCtaBand = defineType({
  name: 'sectionCtaBand',
  title: 'Call-to-action band',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (R) => R.required(),
    }),
    headingAccentField(),
    defineField({
      name: 'subhead',
      title: 'Subhead',
      type: 'text',
      rows: 2,
      hidden: hideWhenRich('subheadRich'),
    }),
    richTwin('subheadRich', 'Subhead'),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string' }),
    defineField({
      name: 'ctaUrl',
      title: 'Button link',
      type: 'string',
      description: 'Internal path like "/get-started" or a full URL.',
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'headline' },
    prepare: ({ title }) => ({ title: title || 'CTA band' }),
  },
});

export const sectionForm = defineType({
  name: 'sectionForm',
  title: 'Form',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'form',
      title: 'Form',
      type: 'reference',
      to: [{ type: 'form' }],
      validation: (R) => R.required(),
    }),
    // -------------------------------------------------------------------------
    // The four fields the Contact page needed (2026-08-26, Phase 2).
    // -------------------------------------------------------------------------
    // All OPTIONAL, all defaulting to exactly what this block rendered before
    // they existed, so every page already using it is untouched (proven by a
    // 13-page parity run in the same commit). The form renderer itself, and its
    // hCaptcha wiring, are not forked: both variants render the same FormBlock.
    defineField({
      name: 'variant',
      title: 'Section style',
      type: 'string',
      description:
        'Leave as "Embedded" on ordinary pages. "Page body" is the Contact page\'s own, roomier form section, with an eyebrow above the heading.',
      options: {
        list: [
          { title: 'Embedded in a page', value: 'embedded' },
          { title: 'The page body (Contact)', value: 'pageBody' },
        ],
        layout: 'radio',
      },
      initialValue: 'embedded',
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Small line above the heading. Shown in the "Page body" style.',
    }),
    defineField({
      name: 'headingId',
      title: 'Anchor id (optional)',
      type: 'string',
      description:
        'Only needed to link straight to this section, e.g. /contact#contact-form. Setting it also gives the section an accessible name from its heading.',
    }),
    defineField({
      name: 'fallbackLabel',
      title: 'Button label when no form is chosen',
      type: 'string',
      description:
        'Safety net. If the form above is ever missing, the section shows an email button instead of a broken form. Example: "Email the Office".',
    }),
  ],
  preview: {
    select: { title: 'heading', form: 'form.title' },
    prepare: ({ title, form }) => ({ title: title || form || 'Form' }),
  },
});

export const sectionFeatureCards = defineType({
  name: 'sectionFeatureCards',
  title: 'Feature cards (detailed)',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    headingAccentField(),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      hidden: hideWhenRich('introRich'),
    }),
    richTwin('introRich', 'Intro'),
    columnsField('sectionFeatureCards'),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'featureCard',
          fields: [
            defineField({
              name: 'image',
              title: 'Image (optional)',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
            defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
            defineField({
              name: 'badge',
              title: 'Badge (optional)',
              type: 'string',
              description: 'Small tag, e.g. "New" or "Weekly".',
            }),
            defineField({ name: 'ctaLabel', title: 'Link label', type: 'string' }),
            defineField({ name: 'ctaUrl', title: 'Link URL', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'eyebrow', media: 'image' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Feature cards' }),
  },
});

export const sectionStats = defineType({
  name: 'sectionStats',
  title: 'Stats / numbers',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    columnsField('sectionStats'),
    defineField({
      name: 'items',
      title: 'Stats',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              description: 'e.g. "9", "100%", "6 weeks". Free text so you can write "200+".',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({ name: 'note', title: 'Note (optional)', type: 'string' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Stats' }) },
});

export const sectionAccordion = defineType({
  name: 'sectionAccordion',
  title: 'FAQ / accordion',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      hidden: hideWhenRich('introRich'),
    }),
    richTwin('introRich', 'Intro'),
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'qa',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4,
              validation: (R) => R.required(),
            }),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'FAQ / accordion' }),
  },
});

export const sectionGallery = defineType({
  name: 'sectionGallery',
  title: 'Photo gallery',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    columnsField('sectionGallery', 'On a phone photos show two across.'),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption (optional)', type: 'string' }),
          ],
        }),
      ],
      options: { layout: 'grid' },
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Photo gallery' }),
  },
});

export const sectionSteps = defineType({
  name: 'sectionSteps',
  title: 'Steps (numbered)',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      hidden: hideWhenRich('introRich'),
    }),
    richTwin('introRich', 'Intro'),
    columnsField('sectionSteps'),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Steps' }) },
});

export const sectionLogos = defineType({
  name: 'sectionLogos',
  title: 'Logos / partners',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'grayscale',
      title: 'Grayscale logos',
      type: 'boolean',
      initialValue: true,
      description: 'Show logos in grayscale, full color on hover.',
    }),
    defineField({
      name: 'items',
      title: 'Logos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Name / alt text',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({ name: 'url', title: 'Link (optional)', type: 'url' }),
          ],
        }),
      ],
      options: { layout: 'grid' },
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Logos / partners' }),
  },
});

export const sectionMediaFeature = defineType({
  name: 'sectionMediaFeature',
  title: 'Media feature (video / image + text)',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    headingAccentField(),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
      hidden: hideWhenRich('bodyRich'),
    }),
    richTwin('bodyRich', 'Body'),
    defineField({
      name: 'mediaSide',
      title: 'Which side is the video or photo on?',
      type: 'string',
      description: 'On a phone the video or photo is always under the words.',
      options: { list: sideOptions('Video or photo'), layout: 'radio' },
      initialValue: 'left',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL (YouTube/Vimeo)',
      type: 'url',
      description: 'Shows an embedded player. Takes priority over the image.',
    }),
    defineField({
      name: 'image',
      title: 'Image (used if no video)',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string' }),
    defineField({ name: 'ctaUrl', title: 'Button link', type: 'string' }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading', media: 'image' },
    prepare: ({ title, media }) => ({ title: title || 'Media feature', media }),
  },
});

export const sectionDynamicList = defineType({
  name: 'sectionDynamicList',
  title: 'Dynamic list (latest content)',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'source',
      title: 'Show',
      type: 'string',
      options: {
        list: [
          { title: 'Featured courses', value: 'featuredCourses' },
          { title: 'Upcoming events', value: 'upcomingEvents' },
          { title: 'Faculty', value: 'faculty' },
          { title: 'Testimonials', value: 'testimonials' },
        ],
      },
      initialValue: 'featuredCourses',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'count',
      title: 'How many',
      type: 'number',
      initialValue: 3,
      validation: (R) => R.min(1).max(12),
    }),
    columnsField('sectionDynamicList'),
    bgField(),
  ],
  preview: {
    select: { title: 'heading', source: 'source' },
    prepare: ({ title, source }) => ({ title: title || 'Dynamic list', subtitle: source }),
  },
});

export const sectionMediaShowcase = defineType({
  name: 'sectionMediaShowcase',
  title: 'Media showcase (slideshow / video)',
  type: 'object',
  description:
    'One framed photo or video. It either cross-fades through several photos (a slow slideshow with a gentle zoom) or loops a short, silent video. Choose which below.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    headingAccentField(),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      hidden: hideWhenRich('introRich'),
    }),
    richTwin('introRich', 'Intro'),
    defineField({
      name: 'mediaType',
      title: 'What goes in the arched frame?',
      type: 'string',
      options: {
        list: [
          { title: 'Photo slideshow', value: 'slideshow' },
          { title: 'Looping video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'slideshow',
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      hidden: ({ parent }) => parent?.mediaType === 'video',
      description:
        'Add one photo for a single image, or two or more for a slow cross-fading slideshow with a gentle zoom. Drag to set the order.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        }),
      ],
      options: { layout: 'grid' },
    }),
    defineField({
      name: 'video',
      title: 'Video (upload)',
      type: 'file',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      options: { accept: 'video/mp4,video/webm' },
      description:
        'Upload a short, silent MP4 or WebM. It loops quietly inside the arch. Keep it small (a few seconds, under ~10 MB) so the page stays fast.',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video link (alternative to uploading)',
      type: 'url',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      description:
        'Optional. A direct link to an MP4 or WebM file, used only when nothing is uploaded above. This is not a YouTube or Vimeo link.',
    }),
    defineField({
      name: 'videoPoster',
      title: 'Video still image (optional)',
      type: 'image',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      options: { hotspot: true },
      description: 'Optional. A still image shown while the video loads.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading', media: 'images.0' },
    prepare: ({ title, media }) => ({ title: title || 'Media showcase', media }),
  },
});

export const sectionFaqList = defineType({
  name: 'sectionFaqList',
  title: 'FAQ list (from collection)',
  type: 'object',
  description:
    'Pulls FAQ items from the faqItem collection into the page. Optionally filtered to one category. Use this when you want to embed a subset of the FAQ collection (e.g. Admissions questions on the Admissions page) rather than authoring inline Q+As.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'headline', title: 'Headline', type: 'string' }),
    defineField({ name: 'subhead', title: 'Subhead', type: 'text', rows: 2 }),
    // Category filter. A reference to an faqCategory document takes priority;
    // if only a string is provided (legacy or convenience), it is matched
    // against the coalesced category value (categoryRef->title or legacy string).
    defineField({
      name: 'categoryRef',
      title: 'Filter by category (reference)',
      type: 'reference',
      to: [{ type: 'faqCategory' }],
      description:
        'Optional. Show only FAQ items in this category. Takes priority over the plain text filter below.',
    }),
    defineField({
      name: 'categoryString',
      title: 'Filter by category (plain text)',
      type: 'string',
      description:
        'Optional. Used only when the reference above is not set. Match the exact category name, e.g. "Tuition".',
    }),
    defineField({
      name: 'limit',
      title: 'How many to show',
      type: 'number',
      description:
        'Maximum number of FAQ items to display. Leave empty to show all in the category.',
      validation: (R) => R.min(1).max(50),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Link label (optional)',
      type: 'string',
      description: 'Shows a text link at the bottom, e.g. "See all FAQ".',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'Link URL (optional)',
      type: 'string',
      description: 'Internal path like "/faq" or a full URL.',
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'headline', cat: 'categoryRef.title', catStr: 'categoryString' },
    prepare: ({ title, cat, catStr }) => ({
      title: title || 'FAQ list',
      subtitle: cat ?? catStr ?? 'All categories',
    }),
  },
});

export const sectionResources = defineType({
  name: 'sectionResources',
  title: 'Resources / downloads',
  type: 'object',
  description:
    'A list of downloadable documents: syllabi, reading lists, forms. Each row links to an uploaded file or an external URL.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'items',
      title: 'Files',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'resource',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
              description: 'Optional. One line on what this document is.',
            }),
            defineField({
              name: 'file',
              title: 'File (upload)',
              type: 'file',
              description: 'The document to download. Takes priority over the link below.',
            }),
            defineField({
              name: 'url',
              title: 'External link (alternative)',
              type: 'url',
              description:
                'Used only when no file is uploaded. A link to a document hosted elsewhere.',
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Resources / downloads' }),
  },
});

export const sectionKeyDates = defineType({
  name: 'sectionKeyDates',
  title: 'Key dates / deadlines',
  type: 'object',
  description:
    'A ruled list of dated items: application deadlines, term starts, orientation. Shown in the order you set.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'items',
      title: 'Dates',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'keyDate',
          fields: [
            defineField({
              name: 'date',
              title: 'Date',
              type: 'date',
              options: { dateFormat: 'MMM D, YYYY' },
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'endDate',
              title: 'End date (optional)',
              type: 'date',
              options: { dateFormat: 'MMM D, YYYY' },
              description: 'For a range, such as a term that runs several weeks.',
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (R) => R.required(),
              description: 'What happens on this date. Example: "Fall term begins".',
            }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
            defineField({ name: 'ctaLabel', title: 'Link label (optional)', type: 'string' }),
            defineField({
              name: 'ctaUrl',
              title: 'Link URL (optional)',
              type: 'string',
              description: 'Internal path like "/get-started" or a full URL.',
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'date' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Key dates' }),
  },
});

export const sectionPricingTiers = defineType({
  name: 'sectionPricingTiers',
  title: 'Tuition tiers',
  type: 'object',
  description:
    'Shows the pricing tiers (from your Pricing tier documents) as cards, the same look as the Pricing page. Use it on a program or landing page.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'ctaLabel',
      title: 'Card button label',
      type: 'string',
      description: 'The button on each tier card. Leave empty for "Express interest".',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'Card button link',
      type: 'string',
      description: 'Where each tier button goes. Leave empty for "/get-started".',
    }),
    // -------------------------------------------------------------------------
    // The two fields the Pricing page needed (2026-08-26, Phase 2).
    // -------------------------------------------------------------------------
    // Both are OPTIONAL and both default to exactly what this block rendered
    // before they existed, so every page already using it is untouched (proven
    // by a 13-page parity run in the same commit).
    defineField({
      name: 'headingLevel',
      title: 'Tier name heading level',
      type: 'string',
      description:
        'Leave as "Heading 3" unless this section is the page body itself. The Pricing page uses Heading 2 because the tier names are that page\'s top-level headings.',
      options: {
        list: [
          { title: 'Heading 3 (inside a page)', value: 'h3' },
          { title: 'Heading 2 (the page body)', value: 'h2' },
        ],
        layout: 'radio',
      },
      initialValue: 'h3',
    }),
    defineField({
      name: 'surface',
      title: 'Surface',
      type: 'string',
      description:
        'Leave as "Standard section" on ordinary pages. "Rule & Ledger" is the fixed, art-directed surface the Pricing page uses: no background control, tighter spacing.',
      options: {
        list: [
          { title: 'Standard section (background above applies)', value: 'shell' },
          { title: 'Rule & Ledger (fixed surface)', value: 'ledger' },
        ],
        layout: 'radio',
      },
      initialValue: 'shell',
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Tuition tiers' }),
  },
});

// =============================================================================
// Ported page sections (Rule & Ledger) — the page-builder conversion, 2026-08-26
// =============================================================================
// These types carry the art-directed markup lifted off the bespoke singleton
// pages (docs/superpowers/plans/2026-08-26-page-builder-conversion.md). Two
// things make them different from every block above, both on purpose (D1):
//
//   1. They have NO background/tone field. Their surfaces are fixed in code, so
//      the pixels cannot drift from what the page looked like before it
//      converted. Editors control WHICH sections appear IN WHAT ORDER, never
//      how a section is painted.
//   2. They render OUTSIDE SectionShell (Sections.astro keeps them out of the
//      SHELL_AWARE set), because the shell's tone-adaptive colors and these
//      pages' fixed Rule & Ledger surfaces are mutually exclusive.
//
// They live in their own insert-menu band ("Page sections (Rule & Ledger)").
// =============================================================================

/**
 * The legal statement body: privacy #2 and accessibility #2, which are twins.
 * A date line over a Portable Text body in a narrow measure.
 *
 * The two guards this type inherits from the pages are both test-guarded, so do
 * not "simplify" them away:
 *   - `landmarkLabel` must differ from the page's h1 text. Two region landmarks
 *     with the same accessible name is an axe landmark-unique violation
 *     (tests/a11y.spec.ts).
 *   - the built-in statements link to the contact page when no email address is
 *     set, because an <a> with empty text is an axe link-name violation, and
 *     the credential-less CI build renders exactly that state.
 */
export const sectionLegalBody = defineType({
  name: 'sectionLegalBody',
  title: 'Legal statement body',
  type: 'object',
  description:
    'The body of a policy or statement page: an optional "last updated" line over your text, in a narrow, readable measure. Used by the Privacy and Accessibility pages.',
  fields: [
    defineField({
      name: 'landmarkLabel',
      title: 'Screen-reader label for this section',
      type: 'string',
      description:
        'Read aloud to describe this part of the page. It must NOT repeat the page headline word for word (say "Privacy policy contents", not "Privacy policy").',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'dateLabel',
      title: 'Date label',
      type: 'string',
      description: 'The words before the date. Example: "Last updated" or "Last reviewed".',
      initialValue: 'Last updated',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Date',
      type: 'date',
      description: 'Shown at the top of the statement. Leave empty to show no date line.',
    }),
    defineField({
      name: 'body',
      title: 'Statement body',
      type: 'array',
      description: 'The full text. Use headings (H2/H3) to organize it.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (R: any) => R.uri({ allowRelative: true }),
                  },
                  {
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'fallbackStatement',
      title: 'Built-in statement to show when the body is empty',
      type: 'string',
      description:
        'A safety net, not a choice you normally make. If the body above is empty, the site renders this built-in statement so a legal page is never blank.',
      options: {
        list: [
          { title: 'None (show nothing)', value: 'none' },
          { title: 'Built-in privacy policy', value: 'privacy' },
          { title: 'Built-in accessibility statement', value: 'accessibility' },
        ],
        layout: 'radio',
      },
      initialValue: 'none',
    }),
  ],
  preview: {
    select: { label: 'landmarkLabel', date: 'lastUpdated' },
    prepare: ({ label, date }) => ({
      title: label || 'Legal statement body',
      subtitle: date ? `Dated ${date}` : 'No date shown',
    }),
  },
});

/**
 * Numbered cards: the 01/02/03 ledger cards that appear on four pages
 * (for-you personas, about beliefs, get-started steps, home wayfinding).
 *
 * `variant` picks the whole TREATMENT, not only a border. That was not obvious
 * when the type was written (Phase 1 assumed the four pages differed by border
 * alone); converting about and get-started on 2026-08-26 showed the three bands
 * differ in surface, spacing, grid, heading size and header shape too. Rather
 * than average them into one "close enough" band, each variant renders its
 * source markup verbatim:
 *
 *   top2    boxed cards, hairline all round with a heavier gold top rule, on
 *           paper. PROVEN against for-you (2026-08-26).
 *   full    the same boxed band, gold on all four sides. Declared for a page
 *           that wants it; not yet held against one.
 *   ledger  the warm band: eyebrow + h2 over a gold rule, two columns of
 *           unboxed cards under a gold top rule, footnote below. PROVEN
 *           against about's "What we believe" (2026-08-26).
 *   steps   the warm band's quieter cousin: eyebrow only, three columns,
 *           smaller type throughout. PROVEN against get-started's "What happens
 *           next" (2026-08-26).
 *   wayfind the home page's "where to begin" row: four full-width LINK cells
 *           divided by hairlines, no heading of its own, an aria-label instead.
 *           PROVEN against home (2026-08-26, Phase 4).
 *
 * The wayfinding band is the reason two extra fields exist below: `landmarkLabel`
 * (it has no visible heading to be named by) and the per-card `href` (the whole
 * cell is one link, not a card with a button). Both are ignored by the other
 * variants, which is why they carry the band's name in their descriptions.
 */
export const sectionNumberedCards = defineType({
  name: 'sectionNumberedCards',
  title: 'Numbered cards',
  type: 'object',
  description:
    'A grid of numbered cards (01, 02, 03...), each with a title, a line of copy, and an optional button. Good for "who this is for", beliefs, or steps.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description:
        'Optional. Leave empty when the cards speak for themselves, as on the For You page.',
    }),
    defineField({
      name: 'headingId',
      title: 'Anchor id (optional)',
      type: 'string',
      description:
        'Only needed if you want to link straight to this section, e.g. /about#our-beliefs. Leave empty and one is made from the heading.',
    }),
    defineField({
      name: 'landmarkLabel',
      title: 'Screen-reader label (the "where to begin" style only)',
      type: 'string',
      description:
        'Read aloud to describe this part of the page, e.g. "Where to begin". Used by the "where to begin" style, which has no visible heading of its own. It must NOT repeat the page headline word for word.',
    }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      description: 'Numbered in the order you set here. Drag to reorder.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'numberedCard',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (R) => R.required(),
              description: 'Example: "The small-group leader".',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 2,
              description: 'One line on what this card promises.',
            }),
            defineField({ name: 'cta', title: 'Button (optional)', type: 'ctaBlock' }),
            defineField({
              name: 'href',
              title: 'Link (the "where to begin" style only)',
              type: 'string',
              description:
                'An internal path like /courses, or a full URL. In the "where to begin" style the whole cell is this link; the other styles use the button above instead.',
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        }),
      ],
      validation: (R) => R.min(1),
    }),
    defineField({
      name: 'variant',
      title: 'Card style',
      type: 'string',
      description:
        'The whole treatment: surface, spacing and type, not only the border. All four are brand-locked; pick the one that matches the page.',
      options: {
        list: [
          { title: 'Boxed, gold top rule (For You)', value: 'top2' },
          { title: 'Boxed, gold all round', value: 'full' },
          { title: 'Warm band, gold top rule (About: what we believe)', value: 'ledger' },
          { title: 'Warm band, three small steps (Get Started)', value: 'steps' },
          { title: 'Where to begin: a row of linked cells (Home)', value: 'wayfinding' },
        ],
        layout: 'radio',
      },
      initialValue: 'top2',
    }),
    defineField({
      name: 'footnote',
      title: 'Footnote (optional)',
      type: 'text',
      rows: 2,
      description: 'A quiet line under the cards.',
    }),
  ],
  preview: {
    select: { title: 'heading', cards: 'cards' },
    prepare: ({ title, cards }) => ({
      title: title || 'Numbered cards',
      subtitle: `${cards?.length ?? 0} card(s)`,
    }),
  },
});

/**
 * The warm statement band: pricing #3, the scholarship promise (2026-08-26).
 *
 * One quiet, wide-measure statement on the warm paper surface, with a gold
 * eyebrow over an h2 and a lead paragraph, plus an optional footnote a step
 * quieter still. The Pricing page is its first user; the type is general
 * because the band is (any page can say one important thing this way).
 *
 * The surface (`surface-warm bg-muted`) is fixed in code, per D1. There is no
 * tone field and there must not be one: this band's whole job is to be the one
 * warm interruption on an otherwise white page.
 */
export const sectionScholarship = defineType({
  name: 'sectionScholarship',
  title: 'Warm statement band',
  type: 'object',
  description:
    'One important thing said plainly, on the warm paper surface. Used by the Pricing page for the scholarship promise.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'headingId',
      title: 'Anchor id (optional)',
      type: 'string',
      description:
        'Only needed if you want to link straight to this section, e.g. /pricing#scholarships.',
    }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
    defineField({
      name: 'footnote',
      title: 'Footnote (optional)',
      type: 'text',
      rows: 2,
      description: 'A quieter line under the statement, for a caveat or a date.',
    }),
  ],
  preview: {
    select: { title: 'headline', subtitle: 'eyebrow' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Warm statement band', subtitle }),
  },
});

/**
 * The ruled stat band: pricing #4 and (in Phase 4) home #4.
 *
 * A single row of value/label cells divided by hairlines, closing on a bottom
 * rule. Two layouts, because the two pages genuinely differ:
 *
 *   trio  three cells, stacking to one column on phones (Pricing). PROVEN by
 *         the parity harness 2026-08-26.
 *   quad  four cells in a 2x2 that opens out to a row on large screens, with
 *         the count-up animation wired (home). PROVEN by the parity harness
 *         against home, 2026-08-26 (Phase 4). It needed no change: the markup
 *         copied ahead of time in Phase 2 matched the page byte for byte.
 *
 * A stat opts into the count-up animation per item (`count`). Year-style values
 * leave it off on purpose, so "2026" does not spin up from zero.
 */
export const sectionLedgerStats = defineType({
  name: 'sectionLedgerStats',
  title: 'Stat band (ruled)',
  type: 'object',
  description:
    'A row of numbers divided by hairlines, the way the Pricing and Home pages show them. Each cell is a value over a small label.',
  fields: [
    defineField({
      name: 'landmarkLabel',
      title: 'Screen-reader label for this band (optional)',
      type: 'string',
      description:
        'Read aloud to describe this part of the page, e.g. "The Academy at a glance". Leave empty on a page where the band needs no name of its own. If you set one, it must NOT repeat the page headline word for word.',
    }),
    defineField({
      name: 'items',
      title: 'Stats',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'ledgerStat',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (R) => R.required(),
              description: 'Free text, so "Free", "Per course" and "9" all work.',
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'count',
              title: 'Count up to this number',
              type: 'boolean',
              initialValue: false,
              description:
                'Animates from zero when the band scrolls into view. Only for plain numbers, never for a year.',
            }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
      validation: (R) => R.min(1),
    }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      description:
        'How the cells are divided. Both are brand-locked; pick the one that matches the page.',
      options: {
        list: [
          { title: 'Three across (Pricing)', value: 'trio' },
          { title: 'Four across (Home)', value: 'quad' },
        ],
        layout: 'radio',
      },
      initialValue: 'trio',
    }),
  ],
  preview: {
    select: { items: 'items', label: 'landmarkLabel' },
    prepare: ({ items, label }) => ({
      title: label || 'Stat band',
      subtitle: `${items?.length ?? 0} stat(s)`,
    }),
  },
});

/**
 * Editorial columns: about #2 (mission) and about #4 (how we teach / why we
 * exist), 2026-08-26.
 *
 * Two layouts, because the About page uses the same ingredients twice in two
 * shapes, and both are cut verbatim:
 *
 *   labeled  a narrow gold label in a 200px column, with the statement and its
 *            body in the wide one. Uses the FIRST column only.
 *   pair     two equal columns that slide in from opposite sides.
 *
 * The `heading` field is deliberately dual-purpose, and the descriptions say so:
 * in `pair` it is a real h2, in `labeled` it is the large display sentence that
 * carries the mission (a paragraph, because the page has no heading there and
 * inventing one would change the page's heading outline).
 */
export const sectionEditorialColumns = defineType({
  name: 'sectionEditorialColumns',
  title: 'Editorial columns',
  type: 'object',
  description:
    'One or two columns of quiet, well-set prose. The About page uses it for the mission statement and for the "how we teach / why we exist" pair.',
  fields: [
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      description: 'Both are brand-locked; pick the one that matches the page.',
      options: {
        list: [
          { title: 'Labeled (small label, one wide column)', value: 'labeled' },
          { title: 'Pair (two equal columns)', value: 'pair' },
        ],
        layout: 'radio',
      },
      initialValue: 'labeled',
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'array',
      description: 'The "Labeled" layout uses the first column only. The "Pair" layout uses two.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'editorialColumn',
          fields: [
            defineField({
              name: 'eyebrow',
              title: 'Label',
              type: 'string',
              description: 'The small gold line above, e.g. "Our mission".',
            }),
            defineField({
              name: 'heading',
              title: 'Heading / statement',
              type: 'text',
              rows: 2,
              description:
                'In the "Pair" layout this is a heading. In the "Labeled" layout it is the large opening sentence, set as a statement rather than a heading.',
            }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 5 }),
          ],
          preview: { select: { title: 'eyebrow', subtitle: 'heading' } },
        }),
      ],
      validation: (R) => R.min(1).max(2),
    }),
  ],
  preview: {
    select: { columns: 'columns', variant: 'variant' },
    prepare: ({ columns, variant }) => ({
      title: columns?.[0]?.eyebrow || 'Editorial columns',
      subtitle: variant === 'pair' ? 'Two columns' : 'Labeled',
    }),
  },
});

/**
 * The inline band: about #5, the strip that points at the faculty page
 * (2026-08-26). Copy on the left, one pill button on the right, hairlines top
 * and bottom. Deliberately small: it is a signpost between two big sections.
 *
 * The button is a plain label + URL rather than the shared ctaBlock, because
 * this band's pill is hand-written markup on the page it came from and
 * CtaLink.astro would render a different element.
 */
export const sectionInlineBand = defineType({
  name: 'sectionInlineBand',
  title: 'Inline band (copy + button)',
  type: 'object',
  description:
    'A thin ruled strip: a line of copy on the left, one button on the right. Used on the About page to point at the faculty.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button label',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'ctaUrl',
      title: 'Button link',
      type: 'string',
      description: 'Internal path like "/faculty" or a full URL. Leave empty for "/faculty".',
    }),
  ],
  preview: {
    select: { title: 'headline', subtitle: 'eyebrow' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Inline band', subtitle }),
  },
});

/**
 * The FAQ page's grouped accordion: faq #2 (2026-08-26).
 *
 * Auto-updating: it pulls every question from the FAQ collection itself, so
 * editors add and edit questions where the questions live. What this section
 * owns is the ORDER of the category headings and the section's screen-reader
 * label.
 *
 * Distinct from `sectionFaqList`, which embeds a flat slice of the same
 * collection on any other page.
 */
export const sectionFaqGrouped = defineType({
  name: 'sectionFaqGrouped',
  title: 'FAQ, grouped by category (from collection)',
  type: 'object',
  description:
    'Every question from the FAQ collection, grouped under its category heading, as an open-and-close list. This is the FAQ page itself.',
  fields: [
    defineField({
      name: 'landmarkLabel',
      title: 'Screen-reader label for this section',
      type: 'string',
      description:
        'Read aloud to describe this part of the page. It must NOT repeat the page headline word for word.',
      initialValue: 'Frequently asked questions',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'categoryOrder',
      title: 'Category order',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description:
        'The category headings, in the order you want them. A category with no questions is skipped. A category used by a question but missing from this list is added at the end, so nothing can hide.',
    }),
  ],
  preview: {
    select: { order: 'categoryOrder' },
    prepare: ({ order }) => ({
      title: 'FAQ, grouped by category',
      subtitle: order?.length ? `${order.length} categories in order` : 'Default category order',
    }),
  },
});

/**
 * The Events page's "Upcoming" grid: events #2 (2026-08-26).
 *
 * Auto-updating: it pulls the upcoming one-time events from the Events
 * collection, so nobody has to remember to remove an event after it happens.
 * What this section owns is the heading above the grid and the sentence shown
 * when there is nothing dated on the calendar.
 */
export const sectionEventGrid = defineType({
  name: 'sectionEventGrid',
  title: 'Upcoming events (from collection)',
  type: 'object',
  description:
    'Cards for every upcoming one-time event: info sessions, lectures, term starts. Past events drop off by themselves.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'headingId',
      title: 'Anchor id (optional)',
      type: 'string',
      description:
        'Only needed to link straight to this section. Leave empty for "upcoming-heading".',
    }),
    defineField({
      name: 'emptyCopy',
      title: 'What to say when nothing is scheduled',
      type: 'text',
      rows: 3,
      description:
        'Shown in place of the cards when there are no upcoming events. The sentence ends with a link to the course catalog, which is added for you, so finish on a phrase like "the best place to start is a".',
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Upcoming events', subtitle }),
  },
});

/**
 * The Events page's recurring rhythms: events #3 (2026-08-26).
 *
 * Auto-updating: it pulls the RECURRING events from the Events collection, and
 * shows three built-in rhythms while there are none, so the page is never a
 * heading over a blank space.
 */
export const sectionRuledList = defineType({
  name: 'sectionRuledList',
  title: 'Recurring rhythms (from collection)',
  type: 'object',
  description:
    'A ruled list of the things that happen on a repeating schedule: the monthly info session, the lecture series, visiting a class.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'headingId',
      title: 'Anchor id (optional)',
      type: 'string',
      description:
        'Only needed to link straight to this section. Leave empty for "recurring-heading".',
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Recurring rhythms', subtitle }),
  },
});

/**
 * The Contact page's details + map: contact #2 (2026-08-26).
 *
 * The address, phone, email and office hours are NOT fields here: they are site
 * settings, so they stay in one place and the footer, the map and the JSON-LD
 * cannot disagree with this section. What the section owns is the labels, the
 * who-to-reach rows, and the getting-here note.
 */
export const sectionContactDetails = defineType({
  name: 'sectionContactDetails',
  title: 'Contact details + map',
  type: 'object',
  description:
    'The address, phone, email and office hours from your site settings, a "who to reach" list, a getting-here note, and an embedded map.',
  fields: [
    defineField({
      name: 'landmarkLabel',
      title: 'Screen-reader label for this section',
      type: 'string',
      description:
        'Read aloud to describe this part of the page. It must NOT repeat the page headline word for word.',
      initialValue: 'Contact details',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'whoToReachLabel',
      title: '"Who to reach" label',
      type: 'string',
      initialValue: 'Who to reach',
    }),
    defineField({
      name: 'reasons',
      title: 'Who to reach, row by row',
      type: 'array',
      description:
        'Leave empty to use the built-in rows (general questions, courses and enrollment, pricing).',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'contactReason',
          fields: [
            defineField({
              name: 'label',
              title: 'Reason',
              type: 'string',
              validation: (R) => R.required(),
              description: 'Example: "Courses and enrollment".',
            }),
            defineField({
              name: 'value',
              title: 'Link text',
              type: 'string',
              validation: (R) => R.required(),
              description:
                'What the link says: an email address, or a phrase like "Request information".',
            }),
            defineField({
              name: 'href',
              title: 'Link',
              type: 'string',
              validation: (R) => R.required(),
              description: 'An internal path like "/pricing", or "mailto:someone@example.org".',
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    defineField({
      name: 'gettingHereLabel',
      title: '"Getting here" label',
      type: 'string',
      initialValue: 'Getting here',
    }),
    defineField({ name: 'gettingHereBody', title: 'Getting here', type: 'text', rows: 3 }),
    defineField({
      name: 'mapTitle',
      title: 'Map description (for screen readers)',
      type: 'string',
      initialValue: 'Map to The Presbyterian Academy',
      description: 'Names the embedded map for anyone using a screen reader.',
    }),
  ],
  preview: {
    select: { title: 'landmarkLabel' },
    prepare: ({ title }) => ({ title: title || 'Contact details + map' }),
  },
});

/**
 * Get Started's request panel: get-started #2 (2026-08-26).
 *
 * The express-interest form on the left, and on the right a ruled panel holding
 * the free intro call, the "visit a class" note and the syllabus note. Narrow
 * and bespoke on purpose: this is the page's whole job, not a general layout.
 *
 * The booking link falls back to the PUBLIC_CALENDLY_URL build variable, then
 * to a mailto. All three states are live; see the component's header.
 */
export const sectionRequestPanel = defineType({
  name: 'sectionRequestPanel',
  title: 'Request panel (form + intro call)',
  type: 'object',
  description:
    'The express-interest form beside a panel offering a free intro call, a class visit, and a syllabus. Used by the Get Started page.',
  fields: [
    defineField({ name: 'requestEyebrow', title: 'Form eyebrow', type: 'string' }),
    defineField({
      name: 'requestHeadline',
      title: 'Form heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'requestBody', title: 'Form intro', type: 'text', rows: 2 }),
    defineField({
      name: 'form',
      title: 'Form',
      type: 'reference',
      to: [{ type: 'form' }],
      description: 'The form to show. If none is chosen, an email button takes its place.',
    }),
    defineField({ name: 'calendlyEyebrow', title: 'Panel eyebrow', type: 'string' }),
    defineField({ name: 'calendlyHeadline', title: 'Panel heading', type: 'string' }),
    defineField({ name: 'calendlyBody', title: 'Panel text', type: 'text', rows: 2 }),
    defineField({
      name: 'calendlyUrl',
      title: 'Booking link',
      type: 'url',
      description:
        'Where "Book a free intro" goes, usually a Calendly link. Leave empty to use the link set up for the whole site; with neither, the button becomes an email link instead.',
    }),
    defineField({ name: 'visitClassBody', title: '"Visit a class" text', type: 'text', rows: 2 }),
    defineField({ name: 'syllabusBody', title: '"Take a syllabus" text', type: 'text', rows: 2 }),
  ],
  preview: {
    select: { title: 'requestHeadline', subtitle: 'requestEyebrow' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Request panel', subtitle }),
  },
});

/**
 * The course rail: courses #2 (Start here), home #3 (Start here), home #6 (the
 * catalog preview), 2026-08-26.
 *
 * Auto-updating: it pulls the courses itself, so a course marked "Start here"
 * or "Featured" in the catalog appears here without anyone editing the page.
 *
 * WHY THIS TYPE CARRIES TWO WHOLE TREATMENTS AND NOT ONE
 * The three rails on the live site are not one band with different copy. The
 * two "Start here" rails sit on the card surface at the medium rhythm with a
 * small h3-sized heading; the home catalog preview sits on paper at the large
 * rhythm with a flex header, a "see all" link and a gold rule under it. Merging
 * them would have been a visual change on two live pages, which this conversion
 * promises never to do (same reasoning as sectionNumberedCards' variants).
 *
 *   rail     the card-surface band. PROVEN by the parity harness against the
 *            Courses page, 2026-08-26.
 *   feature  the paper band with the rule and the "see all" link. PROVEN by the
 *            parity harness against home #6, 2026-08-26 (Phase 4).
 *
 * `source`, `adaptiveColumns` and `dedupeAgainstStartHere` were built in Phase 3
 * and proven in Phase 4: `startHere` is what the Courses page runs on; home #3
 * is the same rail with `adaptiveColumns` on, and home #6 is the featured band
 * that drops any course already shown in the rail above it. All four now hold
 * against a captured baseline.
 *
 * WHY "adaptiveColumns" IS A FIELD AND NOT THE RULE EVERYWHERE
 * Home's Start-here rail narrows its grid when it holds fewer than three
 * courses (two courses get two columns, not three with a gap); the Courses page
 * has always used the fixed three-column class regardless. With the dataset's
 * current two Start-here courses the two pages really do render different class
 * attributes, so one behavior could not cover both. Off is the Courses form.
 */
export const sectionCourseRail = defineType({
  name: 'sectionCourseRail',
  title: 'Course rail (from catalog)',
  type: 'object',
  description:
    'A row of course cards pulled straight from the catalog: either the courses marked "Start here" or the ones marked "Featured". Nothing to keep in sync by hand.',
  fields: [
    defineField({
      name: 'source',
      title: 'Which courses',
      type: 'string',
      description:
        'Where the cards come from. Set the flags on the courses themselves in the catalog.',
      options: {
        list: [
          { title: 'Courses marked "Start here"', value: 'startHere' },
          { title: 'Courses marked "Featured"', value: 'featured' },
        ],
        layout: 'radio',
      },
      initialValue: 'startHere',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Band style',
      type: 'string',
      description: 'Both are brand-locked; pick the one that matches the page.',
      options: {
        list: [
          { title: 'Quiet rail on the card surface (Courses, Home "Start here")', value: 'rail' },
          { title: 'Catalog preview with a rule and a "see all" link (Home)', value: 'feature' },
        ],
        layout: 'radio',
      },
      initialValue: 'rail',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'headingId',
      title: 'Anchor id (optional)',
      type: 'string',
      description: 'Only needed to link straight to this section. Leave empty for "course-rail".',
    }),
    defineField({
      name: 'limit',
      title: 'How many cards at most',
      type: 'number',
      description: 'Leave empty to show every course the catalog returns.',
      validation: (R) => R.min(1).integer(),
    }),
    defineField({
      name: 'linkLabel',
      title: '"See all" link text',
      type: 'string',
      description:
        'Shown in the header of the catalog-preview style only. Leave empty for no link.',
      hidden: ({ parent }) => parent?.variant !== 'feature',
    }),
    defineField({
      name: 'linkHref',
      title: '"See all" link',
      type: 'string',
      description: 'Where that link goes, usually "/courses".',
      hidden: ({ parent }) => parent?.variant !== 'feature',
    }),
    defineField({
      name: 'adaptiveColumns',
      title: 'Narrow the grid when there are only one or two courses',
      type: 'boolean',
      initialValue: false,
      description:
        'On, two courses fill two columns instead of leaving a gap in a three-column row. Off, the grid is always three columns wide on a large screen.',
    }),
    defineField({
      name: 'dedupeAgainstStartHere',
      title: 'Skip courses already shown in a "Start here" rail',
      type: 'boolean',
      initialValue: false,
      description:
        'For a second rail on the same page, so the same course card never appears twice.',
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow', source: 'source' },
    prepare: ({ title, subtitle, source }) => ({
      title: title || 'Course rail',
      subtitle: [subtitle, source === 'featured' ? 'Featured courses' : 'Start here']
        .filter(Boolean)
        .join(' - '),
    }),
  },
});

/**
 * The topics ticker: home #5 (2026-08-26, Phase 4).
 *
 * A slow marquee of subject names. It is DECORATIVE and rendered `aria-hidden`,
 * exactly as the home page rendered it: it says nothing a screen-reader user
 * cannot read in the catalog, and a moving list of words read aloud is noise.
 * That is why there is no heading field and no landmark label here.
 */
export const sectionTicker = defineType({
  name: 'sectionTicker',
  title: 'Topics ticker (decorative)',
  type: 'object',
  description:
    'A thin band of subject names that drifts slowly sideways. Decoration: it is skipped by screen readers and stops moving for anyone who asks for reduced motion.',
  fields: [
    defineField({
      name: 'topics',
      title: 'Topics',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Short words or phrases, in the order they should scroll past.',
      validation: (R) => R.min(1),
    }),
  ],
  preview: {
    select: { topics: 'topics' },
    prepare: ({ topics }) => ({
      title: 'Topics ticker',
      subtitle: topics?.length ? topics.slice(0, 4).join(', ') : 'No topics yet',
    }),
  },
});

/**
 * The faculty strip: home #7 (2026-08-26, Phase 4).
 *
 * Auto-updating: it pulls the faculty roster itself, in the roster's own order,
 * so adding a teacher to the catalog puts them on the home page. What this
 * section owns is the copy around the cards and the link out to the full roster.
 */
export const sectionFacultyRail = defineType({
  name: 'sectionFacultyRail',
  title: 'Faculty strip (from the roster)',
  type: 'object',
  description:
    'A row of teacher cards pulled straight from the faculty roster, on the warm surface, with a link out to the full roster.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'headingId',
      title: 'Anchor id (optional)',
      type: 'string',
      description: 'Only needed to link straight to this section. Leave empty for "faculty-rail".',
    }),
    defineField({
      name: 'limit',
      title: 'How many teachers',
      type: 'number',
      initialValue: 3,
      description: 'Leave empty for three, which fills the row.',
      validation: (R) => R.min(1).integer(),
    }),
    defineField({
      name: 'linkLabel',
      title: '"See all" link text',
      type: 'string',
      description: 'Leave empty for no link.',
    }),
    defineField({
      name: 'linkHref',
      title: '"See all" link',
      type: 'string',
      description: 'Where that link goes, usually "/faculty".',
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Faculty strip', subtitle }),
  },
});

/**
 * The testimonial strip: home #8 (2026-08-26, Phase 4).
 *
 * Auto-updating: it pulls the testimonials marked "Featured", so a new quote
 * reaches the home page by being flagged where the quotes live. Each quote is a
 * figure with its attribution under a hairline, three across.
 */
export const sectionTestimonialRail = defineType({
  name: 'sectionTestimonialRail',
  title: 'Testimonials (from the collection)',
  type: 'object',
  description:
    'The quotes marked "Featured", set three across under a gold rule. Edit the quotes themselves in the Testimonials collection.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'headingId',
      title: 'Anchor id (optional)',
      type: 'string',
      description:
        'Only needed to link straight to this section. Leave empty for "testimonial-rail".',
    }),
    defineField({
      name: 'limit',
      title: 'How many quotes',
      type: 'number',
      initialValue: 3,
      description: 'Leave empty for three, which fills the row.',
      validation: (R) => R.min(1).integer(),
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Testimonials', subtitle }),
  },
});

// All block types collected for registration in index.ts.
export const sectionBlocks = [
  sectionRichText,
  sectionImageText,
  sectionCardGrid,
  sectionQuote,
  sectionCtaBand,
  sectionForm,
  sectionFeatureCards,
  sectionStats,
  sectionAccordion,
  sectionGallery,
  sectionSteps,
  sectionLogos,
  sectionMediaFeature,
  sectionDynamicList,
  sectionMediaShowcase,
  sectionFaqList,
  sectionResources,
  sectionKeyDates,
  sectionPricingTiers,
  // Ported page sections (Rule & Ledger), 2026-08-26.
  sectionLegalBody,
  sectionNumberedCards,
  // Phase 2, 2026-08-26 (pricing).
  sectionScholarship,
  sectionLedgerStats,
  // Phase 2, 2026-08-26 (about).
  sectionEditorialColumns,
  sectionInlineBand,
  // Phase 2, 2026-08-26 (faq).
  sectionFaqGrouped,
  // Phase 2, 2026-08-26 (events).
  sectionEventGrid,
  sectionRuledList,
  // Phase 2, 2026-08-26 (contact).
  sectionContactDetails,
  // Phase 2, 2026-08-26 (get-started).
  sectionRequestPanel,
  // Phase 3, 2026-08-26 (courses; home reuses it in Phase 4).
  sectionCourseRail,
  // Phase 4, 2026-08-26 (home).
  sectionTicker,
  sectionFacultyRail,
  sectionTestimonialRail,
];

// The array members allowed in a flexibleSections[] field (includes the shared
// embed object). Used by the generic `page` type and any page that opts in.
export const FLEXIBLE_SECTION_MEMBERS = [
  { type: 'sectionRichText' },
  { type: 'sectionImageText' },
  { type: 'sectionFeatureCards' },
  { type: 'sectionCardGrid' },
  { type: 'sectionStats' },
  { type: 'sectionMediaShowcase' },
  { type: 'sectionGallery' },
  { type: 'sectionAccordion' },
  { type: 'sectionMediaFeature' },
  { type: 'sectionSteps' },
  { type: 'sectionDynamicList' },
  { type: 'sectionLogos' },
  { type: 'sectionQuote' },
  { type: 'sectionCtaBand' },
  { type: 'sectionForm' },
  { type: 'sectionFaqList' },
  { type: 'sectionResources' },
  { type: 'sectionKeyDates' },
  { type: 'sectionPricingTiers' },
  { type: 'embed' },
  // Ported page sections (Rule & Ledger), 2026-08-26.
  { type: 'sectionLegalBody' },
  { type: 'sectionNumberedCards' },
  // Phase 2, 2026-08-26 (pricing).
  { type: 'sectionScholarship' },
  { type: 'sectionLedgerStats' },
  // Phase 2, 2026-08-26 (about).
  { type: 'sectionEditorialColumns' },
  { type: 'sectionInlineBand' },
  // Phase 2, 2026-08-26 (faq).
  { type: 'sectionFaqGrouped' },
  // Phase 2, 2026-08-26 (events).
  { type: 'sectionEventGrid' },
  { type: 'sectionRuledList' },
  // Phase 2, 2026-08-26 (contact).
  { type: 'sectionContactDetails' },
  // Phase 2, 2026-08-26 (get-started).
  { type: 'sectionRequestPanel' },
  // Phase 3, 2026-08-26 (courses; home reuses it in Phase 4).
  { type: 'sectionCourseRail' },
  // Phase 4, 2026-08-26 (home).
  { type: 'sectionTicker' },
  { type: 'sectionFacultyRail' },
  { type: 'sectionTestimonialRail' },
];

// =============================================================================
// The grouped "+ Add section" picker
// =============================================================================
// The raw picker is a 20-item alphabet soup; these groups let an editor scan
// four named bands in plain school language instead. Every member of
// FLEXIBLE_SECTION_MEMBERS must appear in exactly one group — the dev-time
// check below throws at Studio load if a new section is added without a group,
// so the picker can never silently hide a section.
const INSERT_MENU_GROUPS: { name: string; title: string; of: string[] }[] = [
  {
    name: 'words',
    title: 'Words, photos & video',
    of: [
      'sectionRichText',
      'sectionImageText',
      'sectionQuote',
      'sectionGallery',
      'sectionMediaFeature',
      'sectionMediaShowcase',
    ],
  },
  {
    name: 'facts',
    title: 'Cards, facts & lists',
    of: [
      'sectionCardGrid',
      'sectionFeatureCards',
      'sectionStats',
      'sectionSteps',
      'sectionAccordion',
      'sectionKeyDates',
      'sectionLogos',
    ],
  },
  {
    name: 'catalog',
    title: 'From your catalog (auto-updating)',
    of: ['sectionDynamicList', 'sectionFaqList', 'sectionPricingTiers'],
  },
  {
    name: 'extras',
    title: 'Banners, forms & extras',
    of: ['sectionCtaBand', 'sectionForm', 'sectionResources', 'embed'],
  },
  // ---------------------------------------------------------------------------
  // The fifth band, LIVE since 2026-08-26 (Phase 1 landed its first member).
  // ---------------------------------------------------------------------------
  // The art-directed section types ported off the bespoke pages (see
  // docs/superpowers/plans/2026-08-26-page-builder-conversion.md). They are
  // brand-locked on purpose (decision D1: fixed surfaces, no tone field), so
  // they get their own band rather than mixing into the tone-adaptive four
  // above.
  //
  // It was shipped commented out through Phase 0 because @sanity/insert-menu
  // renders one tab per group unconditionally, with no emptiness filter: a
  // group with `of: []` would have shown editors a tab with nothing in it. Add
  // each new ported type here in the same commit that defines it.
  {
    name: 'ruleAndLedger',
    title: 'Page sections (Rule & Ledger)',
    of: [
      'sectionLegalBody',
      'sectionNumberedCards',
      'sectionScholarship',
      'sectionLedgerStats',
      'sectionEditorialColumns',
      'sectionInlineBand',
      'sectionFaqGrouped',
      'sectionEventGrid',
      'sectionRuledList',
      'sectionContactDetails',
      'sectionRequestPanel',
      'sectionCourseRail',
      'sectionTicker',
      'sectionFacultyRail',
      'sectionTestimonialRail',
    ],
  },
];

// Fail loudly at Studio load when the groups and the palette drift apart.
{
  const grouped = INSERT_MENU_GROUPS.flatMap((g) => g.of);
  const groupedSet = new Set(grouped);
  if (grouped.length !== groupedSet.size) {
    throw new Error('A section appears in more than one insert-menu group.');
  }
  const missing = FLEXIBLE_SECTION_MEMBERS.map((m) => m.type).filter((n) => !groupedSet.has(n));
  if (missing.length > 0) {
    throw new Error(`Section(s) missing from the insert-menu groups: ${missing.join(', ')}`);
  }
}

/**
 * The one description shown under every "Page sections" field (2026-08-26).
 *
 * Each page used to word this differently ("below the hero", "below the
 * statement", "below the built-in content"), which made the list read like an
 * optional extra bolted onto the bottom of a page. It is not: the page-builder
 * conversion is moving each page's whole body into this array, so the wording
 * now says what the field IS. Kept in one place so the eight singletons plus
 * the custom `page` type cannot drift apart again.
 */
export const FLEXIBLE_SECTIONS_DESCRIPTION =
  'The page body is built here. Add a section, drag to reorder, remove what you do not need. Sections render in this order, below the page content that is built in above.';

/**
 * Ready-made array `options` for every flexibleSections field: the grouped,
 * searchable "+ Add" menu. Spread or assign as the array field's `options`.
 *
 * THE GRID VIEW (2026-08-28). `views` adds a picture mode beside the list, so
 * an editor chooses a section by LOOK rather than by name. Each tile asks for
 * /studio-thumbs/<sectionType>.jpg, which are real screenshots of this site's
 * own sections, generated from the built pages by scripts/studio-thumbs.mjs
 * (`npm run build && npm run studio-thumbs`). A type with no example on the
 * site gets a branded placeholder, so a tile is never a broken image. The list
 * view stays available and stays the default fallback for anyone who prefers
 * names.
 */
export const FLEXIBLE_SECTIONS_OPTIONS = {
  insertMenu: {
    filter: true,
    views: [
      { name: 'grid' as const, previewImageUrl: (name: string) => `/studio-thumbs/${name}.jpg` },
      { name: 'list' as const },
    ],
    groups: INSERT_MENU_GROUPS,
  },
};
