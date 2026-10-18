// Course: the spine of the school. A human-readable course, taught in person,
// in cohorts. The title stays plain words; an OPTIONAL catalog code ("SCR 101")
// sits beside it on the cover. Codes were deliberately kept out until
// 2026-10-13, when the Term Issue redesign reversed that rule on purpose: the
// code is a typographic detail of the cover and the term contents, never a
// replacement for the title. Dates live on the referenced `term` (via
// offerings), never duplicated here. The course-detail "At a glance" ledger and
// the catalog card both read from the derived "next offering" (the offering
// whose term.startDate is the soonest future date).
//
// The course <-> faculty link is ONE-DIRECTIONAL: a course lists its
// `instructors`. A faculty member's "Courses taught" is derived by GROQ
// back-query, so there is deliberately no coursesTaught field on facultyMember
// and the two never desync.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { archivedField } from './archived';
import { PUBLISH_AT_GROUP, publishAtField } from './_publishAt';
import {
  COURSE_CODE_PATTERN,
  COVER_COLORS,
  COVER_COLOR_TITLES,
  COVER_ORNAMENTS,
  COVER_ORNAMENT_TITLES,
} from '../../lib/cover';

export const course = defineType({
  name: 'course',
  // Studio search matches the words editors see, not just internal titles
  // (ported from the WCP site's search weights, 2026-08-31).
  __experimental_search: [
    { path: 'title', weight: 5 },
    { path: 'summary', weight: 2 },
  ],
  title: 'Course',
  type: 'document',
  groups: [
    { name: 'details', title: 'Details', default: true },
    { name: 'cover', title: 'Cover' },
    { name: 'schedule', title: 'Schedule & cohorts' },
    { name: 'pricing', title: 'Pricing' },
    { name: 'seo', title: 'SEO' },
    // "Publish automatically at" (PORTS.md cards 111 and 114): a new course can
    // go up by itself on the morning enrollment opens.
    PUBLISH_AT_GROUP,
  ],
  fields: [
    // Soft-delete flag (see ./archived.ts). Hidden; set by the trash actions.
    archivedField(),
    defineField({
      name: 'title',
      title: 'Course title',
      type: 'string',
      description:
        'Plain and human. Keep any catalog code (SCR 101) out of the title: it has its own field in the Cover tab.',
      group: 'details',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      group: 'details',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences. Shown on the catalog card and used as the meta description.',
      group: 'details',
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      description:
        'Optional photo. Not shown on the site at the moment: course cards draw a typographic cover from the Cover tab instead. Kept for a future course-page photo.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      group: 'details',
    }),
    // ---- Cover (Term Issue, 2026-10-13) --------------------------------------
    // Every course is drawn as a small-press book cover. All four fields are
    // optional: an empty colour or ornament is derived from the teaching area
    // and the slug (src/lib/cover.ts), so a new course has a cover from day one.
    defineField({
      name: 'courseCode',
      title: 'Course code',
      type: 'string',
      description:
        'Optional catalog code shown on the cover, like "SCR 101": a few capital letters, a space, three digits.',
      group: 'cover',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true;
          return COURSE_CODE_PATTERN.test(String(value))
            ? true
            : 'Codes usually look like "SCR 101": two to four capital letters, a space, three digits.';
        }).warning(),
    }),
    defineField({
      name: 'coverColor',
      title: 'Cover colour',
      type: 'string',
      description:
        'The colour of the cover. Leave empty and one is picked from the teaching area, so courses in the same subject match.',
      options: {
        list: COVER_COLORS.map((value) => ({ title: COVER_COLOR_TITLES[value], value })),
        layout: 'radio',
        direction: 'horizontal',
      },
      group: 'cover',
    }),
    defineField({
      name: 'coverOrnament',
      title: 'Cover ornament',
      type: 'string',
      description:
        'The simple shape printed in the middle of the cover. Leave empty and one is picked for you.',
      options: {
        list: COVER_ORNAMENTS.map((value) => ({ title: COVER_ORNAMENT_TITLES[value], value })),
        layout: 'radio',
        direction: 'horizontal',
      },
      group: 'cover',
    }),
    defineField({
      name: 'centralQuestion',
      title: 'The question',
      type: 'string',
      description:
        'The one question this course asks, in plain words. Shown on the back of the cover. Example: "Is the Bible one book or sixty-six?"',
      group: 'cover',
      validation: (Rule) =>
        Rule.max(90).warning('Best kept under 90 characters so it fits the cover.'),
    }),
    defineField({
      name: 'level',
      title: 'Level',
      type: 'string',
      options: {
        list: [
          { title: 'Intro', value: 'Intro' },
          { title: 'Foundational', value: 'Foundational' },
          { title: 'Advanced', value: 'Advanced' },
        ],
        layout: 'radio',
      },
      group: 'details',
    }),
    defineField({
      name: 'teachingAreas',
      title: 'Teaching areas',
      type: 'array',
      description: 'The subject(s). Drives the catalog topic filter.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'teachingArea' }] })],
      group: 'details',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'instructors',
      title: 'Instructors',
      type: 'array',
      description: 'The teacher(s). This is the only place the course/faculty link is set.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'facultyMember' }] })],
      group: 'details',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: {
        list: [
          { title: 'In person', value: 'In person' },
          { title: 'Hybrid', value: 'Hybrid' },
        ],
        layout: 'radio',
      },
      initialValue: 'In person',
      group: 'details',
    }),
    defineField({
      name: 'location',
      title: 'Venue / campus',
      type: 'string',
      description: 'Where it meets. Example: "West Chester campus".',
      group: 'details',
    }),
    defineField({
      name: 'whoFor',
      title: 'Who this is for',
      type: 'array',
      description:
        'Two or three named human personas, not adjectives. Example: "Small-group leaders who teach the text".',
      of: [{ type: 'string' }],
      group: 'details',
    }),
    defineField({
      name: 'sessionOutline',
      title: 'Sessions',
      type: 'array',
      description:
        'The week-by-week arc. Each item is one session. The first one also appears on the back of the cover as "Week one".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'courseSession',
          fields: [
            defineField({
              name: 'title',
              title: 'Session title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'focus', title: 'Focus', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'title', subtitle: 'focus' } },
        }),
      ],
      group: 'details',
    }),
    defineField({
      name: 'syllabusFile',
      title: 'Syllabus (PDF)',
      type: 'file',
      description: 'Optional. Offered as a download / lead magnet.',
      options: { accept: '.pdf' },
      group: 'details',
    }),
    defineField({
      name: 'offerings',
      title: 'Offerings (cohorts)',
      type: 'array',
      description: 'When the course runs. Each offering points at a term, which owns the dates.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'courseOffering',
          fields: [
            defineField({
              name: 'term',
              title: 'Term',
              type: 'reference',
              to: [{ type: 'term' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'schedule',
              title: 'Schedule',
              type: 'string',
              description: 'Example: "Tuesdays, 7 to 9pm, 8 weeks".',
            }),
            defineField({ name: 'sessions', title: 'Number of sessions', type: 'number' }),
            defineField({
              name: 'seatsNote',
              title: 'Seats note',
              type: 'string',
              description: 'Example: "A few seats left".',
            }),
            defineField({
              name: 'status',
              title: 'Status',
              type: 'string',
              options: {
                list: [
                  { title: 'Open', value: 'open' },
                  { title: 'Waitlist', value: 'waitlist' },
                  { title: 'Closed', value: 'closed' },
                ],
                layout: 'radio',
              },
              initialValue: 'open',
            }),
          ],
          preview: {
            select: { term: 'term.title', schedule: 'schedule', status: 'status' },
            prepare: ({ term, schedule, status }) => ({
              title: term ?? 'Offering',
              subtitle: [schedule, status].filter(Boolean).join(' · '),
            }),
          },
        }),
      ],
      group: 'schedule',
    }),
    defineField({
      name: 'priceTier',
      title: 'Price tier',
      type: 'reference',
      to: [{ type: 'pricingTier' }],
      group: 'pricing',
    }),
    defineField({
      name: 'priceNote',
      title: 'Price note (optional override)',
      type: 'string',
      description:
        'If set, this text is shown instead of the tier amount. Example: "$195, audit $95".',
      group: 'pricing',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Pin to the catalog and the home catalog preview.',
      initialValue: false,
      group: 'details',
    }),
    defineField({
      name: 'startHere',
      title: 'Recommended starting course',
      type: 'boolean',
      description: 'Surfaces in the "Start here" rail. Use sparingly.',
      initialValue: false,
      group: 'details',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 10,
      group: 'details',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      validation: (Rule) => Rule.max(60).warning('Best kept under 60 characters.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 2,
      group: 'seo',
      validation: (Rule) => Rule.max(160).warning('Best kept under 160 characters.'),
    }),
    defineField({
      name: 'seoImage',
      title: 'Social share image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      group: 'seo',
    }),
    publishAtField(),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      area: 'teachingAreas.0.title',
      code: 'courseCode',
    },
    prepare: ({ title, media, area, code }) => ({
      title: title ?? 'Untitled course',
      subtitle: [code, area].filter(Boolean).join(' · '),
      media,
    }),
  },
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrder',
      by: [
        { field: 'displayOrder', direction: 'asc' },
        { field: 'title', direction: 'asc' },
      ],
    },
    { title: 'Title', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
});
