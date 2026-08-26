import type { Template } from 'sanity';

// =============================================================================
// "+ New" starting points (initial-value templates)
// =============================================================================
// Clicking + on Custom Pages, Courses, or Events offers these pre-filled
// layouts next to the blank option — the "pick a layout" moment, so an editor
// edits real content instead of composing from a blank canvas. Placeholder copy
// is [bracketed] so nothing reads as finished. Registered in sanity.config.ts
// via schema.templates.
//
// Array items carry explicit _key values (stable strings are fine here — each
// new document gets its own copy, so the keys never collide across docs).
// =============================================================================

// One placeholder paragraph of portable text (matches blocks.ts richBody).
const para = (key: string, text: string) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}s`, marks: [], text }],
});

export const STARTING_TEMPLATES: Template[] = [
  // --------------------------------------------------------------- pages ----
  {
    id: 'page-simple-text',
    title: 'Page: simple text page',
    description: 'A headline, one story section, and a closing invitation.',
    schemaType: 'page',
    icon: () => '📄',
    value: {
      title: '[New page]',
      heroHeadline: '[Page headline goes here]',
      heroSubhead: '[One warm sentence about what this page covers.]',
      sections: [
        {
          _type: 'sectionRichText',
          _key: 'tpl-story',
          heading: '[Section heading]',
          align: 'left',
          body: [
            para(
              'tpl-story-p1',
              '[Write the main story of this page here. Two or three short paragraphs is plenty.]',
            ),
          ],
        },
        {
          _type: 'sectionCtaBand',
          _key: 'tpl-cta',
          headline: '[Ready to take the next step?]',
          subhead: '[One closing line.]',
          ctaLabel: 'Get started',
          ctaUrl: '/get-started',
        },
      ],
    },
  },
  {
    id: 'page-info-faq',
    title: 'Page: info page with questions',
    description: 'A story section, common questions, and a call-to-action band.',
    schemaType: 'page',
    icon: () => '❓',
    value: {
      title: '[New info page]',
      heroHeadline: '[Page headline goes here]',
      heroSubhead: '[One sentence on who this page is for.]',
      sections: [
        {
          _type: 'sectionRichText',
          _key: 'tpl-story',
          heading: '[Section heading]',
          align: 'left',
          body: [para('tpl-story-p1', '[Write the details visitors need here.]')],
        },
        {
          _type: 'sectionAccordion',
          _key: 'tpl-faq',
          heading: 'Common questions',
          items: [
            {
              _type: 'qa',
              _key: 'tpl-qa1',
              question: '[A question people often ask about this topic?]',
              answer: '[The friendly answer.]',
            },
            {
              _type: 'qa',
              _key: 'tpl-qa2',
              question: '[Another common question?]',
              answer: '[The friendly answer.]',
            },
          ],
        },
        {
          _type: 'sectionCtaBand',
          _key: 'tpl-cta',
          headline: 'Come sit in on a class',
          subhead: 'The best way to know if the Academy fits is to visit an evening session.',
          ctaLabel: 'Get started',
          ctaUrl: '/get-started',
        },
      ],
    },
  },
  {
    id: 'page-photo-story',
    title: 'Page: photo story page',
    description: 'A photo gallery with a pulled quote, for pages the pictures should carry.',
    schemaType: 'page',
    icon: () => '📸',
    value: {
      title: '[New photo page]',
      heroHeadline: '[Page headline goes here]',
      heroSubhead: '[One line inviting people to look around.]',
      sections: [
        {
          _type: 'sectionGallery',
          _key: 'tpl-gallery',
          heading: '[A look inside]',
          columns: '3',
          // Left empty on purpose: the editor adds the photos this page needs.
          images: [],
        },
        {
          _type: 'sectionQuote',
          _key: 'tpl-quote',
          quote: '[A favorite line from a student or teacher about this.]',
          attribution: '[Who said it]',
        },
        {
          _type: 'sectionCtaBand',
          _key: 'tpl-cta',
          headline: 'Want to see it for yourself?',
          subhead: '[One closing line.]',
          ctaLabel: 'Get started',
          ctaUrl: '/get-started',
        },
      ],
    },
  },

  // --------------------------------------------------------------- course ---
  {
    id: 'course-starter',
    title: 'Course: standard course',
    description: 'The common defaults filled in: format, level, a session outline to complete.',
    schemaType: 'course',
    icon: () => '📚',
    value: {
      title: '[New course]',
      summary: '[One or two sentences on what this course covers and why it matters.]',
      level: 'Foundational',
      format: 'In person',
      featured: false,
      startHere: false,
      whoFor: ['[A named human persona, like "Small-group leaders who teach the text"]'],
      sessionOutline: [
        {
          _type: 'courseSession',
          _key: 'tpl-s1',
          title: '[Session 1 title]',
          focus: '[One line on what this session covers.]',
        },
        {
          _type: 'courseSession',
          _key: 'tpl-s2',
          title: '[Session 2 title]',
          focus: '[One line on what this session covers.]',
        },
      ],
    },
  },

  // ---------------------------------------------------------------- event ---
  {
    id: 'event-starter',
    title: 'Event: one-time event',
    description: 'A dated event with the usual boxes ready: schedule text, summary, RSVP.',
    schemaType: 'event',
    icon: () => '📅',
    value: {
      title: '[New event]',
      eventType: 'oneTime',
      category: 'Info session',
      audience: 'Everyone',
      scheduleLabel: '[Saturday, June 27, 11am to 1pm]',
      summary: '[One or two sentences on what happens and who should come.]',
      registrationLabel: 'Save your seat',
      featured: false,
      featuredOnHome: false,
      allDay: false,
    },
  },
];
