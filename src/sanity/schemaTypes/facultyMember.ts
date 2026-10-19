// Faculty member — the credibility instrument that replaces the church
// staffMember card. This is a structured CV, not a "meet the team" card: degrees
// (degree + field + institution, with institution required so a degree never
// renders without its school), ordination + denomination, teaching areas (the
// shared taxonomy), selected publications, and a scholarly-but-warm bio with one
// disarming human line. "Courses taught" is derived from course.instructors by
// GROQ, so it is intentionally not a field here.
//
// "This term" group (2026-10-13, Term Issue PR 3): the contributor fields. A
// short "On my desk" reading line and an optional spoken introduction with a
// required transcript (WCAG 1.2.1: prerecorded audio needs a text alternative).
// All optional and all left EMPTY in the dataset on purpose: faculty supply
// their own lines and recordings (docs/PENDING.md). Every surface that reads
// them hides cleanly when they are empty.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { archivedField } from './archived';
import { orderRankField } from '@sanity/orderable-document-list';
import { INTRO_LENGTH_PATTERN, transcriptRule } from '../../lib/intro-audio';

export const facultyMember = defineType({
  name: 'facultyMember',
  // Studio search matches the words editors see, not just internal titles
  // (ported from the WCP site's search weights, 2026-08-31).
  __experimental_search: [{ path: 'name', weight: 5 }],
  title: 'Faculty member',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'credentials', title: 'Credentials' },
    { name: 'writing', title: 'Bio & writing' },
    { name: 'thisTerm', title: 'This term' },
  ],
  fields: [
    // Drag-to-reorder rank (managed by the orderable desk list; hidden).
    orderRankField({ type: 'facultyMember' }),
    // Soft-delete flag (see ./archived.ts). Hidden; set by the trash actions.
    archivedField(),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'honorific',
      title: 'Honorific',
      type: 'string',
      description: 'Example: "Dr.", "Rev.", "Rev. Dr.". Shown before the name.',
      group: 'identity',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Teaching role',
      type: 'string',
      description: 'Plain-English. Example: "Teacher of Scripture". Not endowed-chair language.',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      group: 'identity',
    }),
    defineField({
      name: 'teachingAreas',
      title: 'Teaching areas',
      type: 'array',
      description: 'Drives the faculty filter. Shared vocabulary with courses.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'teachingArea' }] })],
      group: 'identity',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'specializations',
      title: 'Specializations (optional)',
      type: 'array',
      description:
        'Narrow research interests, in free text, distinct from the shared areas. Example: "Bavinck studies".',
      of: [{ type: 'string' }],
      group: 'identity',
    }),
    defineField({
      name: 'ordination',
      title: 'Ordination',
      type: 'string',
      description:
        'Example: "Ordained minister of Word and Sacrament". Leave blank if not ordained.',
      group: 'credentials',
    }),
    defineField({
      name: 'denomination',
      title: 'Denomination',
      type: 'string',
      options: {
        list: [
          { title: 'PC(USA)', value: 'PC(USA)' },
          { title: 'ECO', value: 'ECO' },
          { title: 'EPC', value: 'EPC' },
          { title: 'Other', value: 'Other' },
        ],
        layout: 'dropdown',
      },
      group: 'credentials',
    }),
    defineField({
      name: 'degrees',
      title: 'Degrees',
      type: 'array',
      description:
        'Each degree, with the granting institution. Institution is required so a degree never shows without its school.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'degree',
          fields: [
            defineField({
              name: 'degree',
              title: 'Degree',
              type: 'string',
              description: 'Example: "PhD", "MDiv".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'field',
              title: 'Field (optional)',
              type: 'string',
              description: 'Example: "New Testament".',
            }),
            defineField({
              name: 'institution',
              title: 'Institution',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'year',
              title: 'Year (optional)',
              type: 'string',
              description: 'A string, so "in progress" is allowed.',
            }),
          ],
          preview: {
            select: { degree: 'degree', field: 'field', institution: 'institution' },
            prepare: ({ degree, field, institution }) => ({
              title: [degree, field].filter(Boolean).join(', '),
              subtitle: institution,
            }),
          },
        }),
      ],
      group: 'credentials',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'affiliations',
      title: 'Current positions & affiliations',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'affiliation',
          fields: [
            defineField({ name: 'role', title: 'Role', type: 'string' }),
            defineField({ name: 'organization', title: 'Organization', type: 'string' }),
          ],
          preview: { select: { title: 'role', subtitle: 'organization' } },
        }),
      ],
      group: 'credentials',
    }),
    defineField({
      name: 'yearsTeaching',
      title: 'Years serving / teaching',
      type: 'string',
      description: 'In plain words, like "Twenty years in parish ministry".',
      group: 'credentials',
    }),
    defineField({
      name: 'publications',
      title: 'Selected publications',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'publication',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'publisher', title: 'Publisher / venue', type: 'string' }),
            defineField({ name: 'year', title: 'Year', type: 'string' }),
            defineField({ name: 'url', title: 'Link (optional)', type: 'url' }),
          ],
          preview: {
            select: { title: 'title', publisher: 'publisher', year: 'year' },
            prepare: ({ title, publisher, year }) => ({
              title,
              subtitle: [publisher, year].filter(Boolean).join(', '),
            }),
          },
        }),
      ],
      group: 'writing',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      description: 'Scholarly but warm. A few short paragraphs.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading', value: 'h3' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
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
                ],
              },
            ],
          },
        }),
      ],
      group: 'writing',
    }),
    defineField({
      name: 'humanLine',
      title: 'One human line',
      type: 'string',
      description:
        'A single disarming sentence so the depth reads inviting. Shown in italic. Example: "She makes the hardest passages feel like an open door."',
      group: 'writing',
    }),
    defineField({
      name: 'currentlyReading',
      title: 'On my desk (optional)',
      type: 'string',
      description:
        'What this teacher is reading right now, in their own words. Shown after "On my desk:" in italic. Example: "The Heidelberg Catechism, one question a week." Leave empty to hide the line.',
      group: 'thisTerm',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'introAudio',
      title: 'Spoken introduction (optional)',
      type: 'file',
      description:
        'A short recording of this teacher opening a class, one or two minutes. MP3 or M4A. Visitors press play; nothing downloads until they do. Needs a transcript below.',
      options: { accept: 'audio/*' },
      group: 'thisTerm',
    }),
    defineField({
      name: 'introAudioTranscript',
      title: 'Transcript of the introduction',
      type: 'text',
      rows: 6,
      description:
        'Every word of the recording, so people who cannot hear it can read it. Required whenever a recording is uploaded. Leave a blank line between paragraphs.',
      group: 'thisTerm',
      validation: (Rule) =>
        Rule.custom((value, context) => transcriptRule(value, context.document?.introAudio)),
    }),
    defineField({
      name: 'introAudioLength',
      title: 'Length of the introduction',
      type: 'string',
      description: 'Minutes and seconds, shown beside the play button. Example: "1:32".',
      group: 'thisTerm',
      validation: (Rule) =>
        Rule.regex(INTRO_LENGTH_PATTERN, { name: 'minutes:seconds' }).warning(
          'Write it as minutes:seconds, like "1:32".',
        ),
    }),
    defineField({
      name: 'email',
      title: 'Email (optional)',
      type: 'string',
      group: 'identity',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 10,
      group: 'identity',
    }),
  ],
  preview: {
    select: { name: 'name', honorific: 'honorific', title: 'title', media: 'photo' },
    prepare: ({ name, honorific, title, media }) => ({
      title: [honorific, name].filter(Boolean).join(' '),
      subtitle: title,
      media,
    }),
  },
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrder',
      by: [
        { field: 'displayOrder', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
    },
  ],
});
