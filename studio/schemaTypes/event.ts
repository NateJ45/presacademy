// Events collection. Supports both recurring rhythms (info sessions, open
// lectures) and one-time dated events (a workshop, a term start, a deadline).
// Recurring events always show on /events; one-time events drop off the
// "upcoming" list once their date passes (on the next build).

import { defineType, defineField, defineArrayMember } from 'sanity';

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Event title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version (auto-generated from the title).',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eventType',
      title: 'Type',
      type: 'string',
      description: 'Recurring events (weekly worship, Bible study) always show. One-time events show until their date passes.',
      options: {
        list: [
          { title: 'Recurring', value: 'recurring' },
          { title: 'One-time', value: 'oneTime' },
        ],
        layout: 'radio',
      },
      initialValue: 'oneTime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Info session', value: 'Info session' },
          { title: 'Open lecture', value: 'Open lecture' },
          { title: 'Workshop', value: 'Workshop' },
          { title: 'Webinar / Online', value: 'Webinar' },
          { title: 'Term start', value: 'Term start' },
          { title: 'Application deadline', value: 'Application deadline' },
          { title: 'Community', value: 'Community' },
          { title: 'Other', value: 'Other' },
        ],
      },
    }),
    defineField({
      name: 'audience',
      title: 'Who it is for',
      type: 'string',
      description: 'Helps visitors find events meant for them. Optional.',
      options: {
        list: [
          { title: 'Everyone', value: 'Everyone' },
          { title: 'Lay leaders', value: 'Lay leaders' },
          { title: 'Newcomers', value: 'Newcomers' },
          { title: 'Prospective students', value: 'Prospective students' },
          { title: 'Clergy', value: 'Clergy' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'scheduleLabel',
      title: 'Schedule (display text)',
      type: 'string',
      description: 'How the time reads on the page. Examples: "Sundays, 11am" or "Saturday, June 27, 11am to 3pm". For recurring events this is the main time shown.',
    }),
    defineField({
      name: 'start',
      title: 'Start date & time',
      type: 'datetime',
      description: 'For one-time events, set the actual date so it sorts and drops off after it passes. Optional for recurring events.',
    }),
    defineField({
      name: 'end',
      title: 'End date & time',
      type: 'datetime',
      description: 'Optional. Used to keep an event on the upcoming list through its end time.',
    }),
    defineField({
      name: 'allDay',
      title: 'All-day event',
      type: 'boolean',
      description: 'Hides the time and shows just the date.',
      initialValue: false,
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Leave blank to use the campus address.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 2,
      description: 'One or two sentences shown on the events list.',
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: 'description',
      title: 'Full description',
      type: 'array',
      description: 'Optional longer details shown on the event page.',
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
                fields: [{ name: 'href', type: 'url', title: 'URL', validation: (R: any) => R.uri({ allowRelative: true }) }],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'registrationUrl',
      title: 'Registration / RSVP link',
      type: 'url',
      description: 'Optional. Adds a button to register or RSVP.',
    }),
    defineField({
      name: 'registrationLabel',
      title: 'Registration button label',
      type: 'string',
      description: 'Optional. Defaults to "Register". Example: "RSVP", "Save your seat", "Sign up".',
    }),
    defineField({
      name: 'cost',
      title: 'Cost (optional)',
      type: 'string',
      description: 'Example: "Free", "$10 per person", "Suggested donation $5".',
    }),
    defineField({
      name: 'contactName',
      title: 'Contact name (optional)',
      type: 'string',
      description: 'Who to ask about this event.',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email (optional)',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Pin to the top of the upcoming list.',
      initialValue: false,
    }),
    defineField({
      name: 'featuredOnHome',
      title: 'Feature on the home page',
      type: 'boolean',
      description: 'Show this event in the home page events teaser.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', eventType: 'eventType', schedule: 'scheduleLabel', start: 'start', media: 'image' },
    prepare: ({ title, eventType, schedule, start, media }) => ({
      title: title ?? 'Untitled event',
      subtitle: `${eventType === 'recurring' ? '↻ ' : ''}${schedule ?? (start ? new Date(start).toLocaleDateString() : '')}`,
      media,
    }),
  },
  orderings: [
    { title: 'Start date (soonest first)', name: 'startAsc', by: [{ field: 'start', direction: 'asc' }] },
    { title: 'Title', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
});
