// Site-wide singleton. Header utility bar, footer, contact info, worship times,
// giving link, mission line, and an optional announcement banner.
// One instance only; singleton enforcement happens in sanity.config.ts.
//
// Remodel note: the interior-designer fields (availability status, service
// areas, travel fees, Google Business / reviews, satisfaction guarantee, and
// the module section-visibility toggles) were removed. Church fields replace them.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { LinkIcon } from '@sanity/icons/Link';
import { ChevronDownIcon } from '@sanity/icons/ChevronDown';
import { ListIcon } from '@sanity/icons/List';

// The menu-link object (label + destination) is shared: see ./navLink.ts. Every
// menu here uses it, so a link behaves the same wherever it sits.

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Configuration, not prose — don't surface in Canvas's AI-assisted writing UI.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'identity', title: 'Identity & contact' },
    { name: 'navigation', title: 'Navigation (menus)' },
    { name: 'social', title: 'Social & footer' },
    { name: 'newsletter', title: 'Newsletter' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'School name',
      type: 'string',
      description: 'Used in the browser tab and search results.',
      initialValue: 'The Presbyterian Academy',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description:
        'Short tagline shown under the name at the top of every page, and in the top bar when no term is scheduled.',
      group: 'identity',
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: 'mission',
      title: 'Mission line',
      type: 'text',
      rows: 2,
      description:
        'One sentence shown in the footer, before the funder line. Keep it to what the Academy is for, in plain words.',
      group: 'identity',
    }),
    defineField({
      name: 'funder',
      title: 'Funder / underwriter (optional)',
      type: 'string',
      description:
        'Named in the footer on every page: "...and made possible by the [name]". Example: "Presbytery of Cincinnati". Clear this to drop that part of the sentence.',
      group: 'identity',
    }),
    defineField({
      name: 'email',
      title: 'Public email',
      type: 'string',
      description: 'Public email address shown on the Contact page and footer.',
      group: 'identity',
      validation: (Rule) => Rule.required().regex(/.+@.+\..+/, { name: 'email', invert: false }),
    }),
    defineField({
      name: 'pastorEmail',
      title: 'Second email (not used)',
      type: 'string',
      group: 'identity',
      // Starter leftover (2026-10-18): a church "pastoral care" address. The site never shows it and it holds
      // no data, so it is hidden rather than removed (never remove a field).
      hidden: true,
    }),
    defineField({
      name: 'phone',
      title: 'Phone (optional)',
      type: 'string',
      description: 'Public phone number. Leave blank to hide.',
      group: 'identity',
    }),
    defineField({
      name: 'officeHours',
      title: 'Office hours (optional)',
      type: 'string',
      description:
        'Shown on the Contact page, in the footer and at the foot of the phone menu. Like "Monday to Thursday, 9am to 4pm". Leave blank to hide.',
      group: 'identity',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon (browser tab icon)',
      type: 'image',
      group: 'identity',
      description:
        'The small icon shown in the browser tab and in bookmarks. Use a simple, roughly square logo mark, at least 128 by 128 pixels (fine detail disappears at tiny sizes). Leave blank to use the built-in PA mark.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'logo',
      title: 'Logo (optional)',
      type: 'image',
      group: 'identity',
      description:
        'A logo image for the top of every page. Leave blank and the site keeps its typed wordmark ("The Presbyterian / Academy"), which is the brand as designed. When set, the logo replaces the wordmark and is scaled to the header height, so upload it with any spare space already trimmed off.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description:
            'What the logo says, for screen readers. Example: "The Presbyterian Academy".',
          validation: (Rule) =>
            Rule.custom((value, ctx: any) =>
              ctx.parent?.asset && !value
                ? 'Add alt text so screen readers can read the logo'
                : true,
            ),
        }),
      ],
    }),
    defineField({
      name: 'addressLine',
      title: 'Street address',
      type: 'string',
      group: 'identity',
      description:
        'Street line, e.g. "9463 Cincinnati Columbus Rd". Shown in the header bar, footer, contact + give pages, and the map links.',
    }),
    defineField({
      name: 'cityStateZip',
      title: 'City, state, ZIP',
      type: 'string',
      group: 'identity',
      description: 'e.g. "West Chester Township, OH 45069".',
    }),
    defineField({
      name: 'geoLat',
      title: 'Latitude (optional)',
      type: 'number',
      group: 'identity',
      description:
        'Decimal latitude of your building. Right-click your building in Google Maps and click the coordinates at the top of the context menu to copy them. Example: 39.7817. Leave blank to omit the geo block from structured data.',
    }),
    defineField({
      name: 'geoLng',
      title: 'Longitude (optional)',
      type: 'number',
      group: 'identity',
      description:
        'Decimal longitude of your building. Right-click your building in Google Maps and click the coordinates at the top of the context menu to copy them. Example: -89.6501. Leave blank to omit the geo block from structured data.',
    }),

    // ── Navigation (top menu) ─────────────────────────────────────────────────
    // The website header menu. When this is empty the header renders its
    // built-in default menu (see src/components/Header.astro). As soon as any
    // items are added here, this list becomes the ENTIRE menu.
    defineField({
      name: 'navItems',
      title: 'Top menu links',
      type: 'array',
      group: 'navigation',
      description:
        'The links in the website header and in the phone "Contents" menu. Drag to reorder. Add a "Link" for a single page, or a "Dropdown menu" to group several links under one label. The header design fits at most six, so keep the list short. Each link can carry a short "Menu note" for its row in the phone menu. Leave this empty to use the built-in default menu. Once you add items here, they replace the whole menu, so include every link you want.',
      validation: (Rule) => Rule.max(6),
      of: [
        // The shared link object (./navLink.ts). Existing menu items already
        // carry _type "navLink", so they keep working unchanged and simply gain
        // the page picker.
        defineArrayMember({ type: 'navLink' }),
        defineArrayMember({
          type: 'object',
          name: 'navGroup',
          title: 'Dropdown menu',
          icon: ChevronDownIcon,
          fields: [
            defineField({
              name: 'label',
              title: 'Menu label',
              type: 'string',
              description: 'The dropdown heading, e.g. "About Us".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Menu links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'navSubLink',
                  title: 'Link',
                  icon: LinkIcon,
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'href',
                      title: 'Address',
                      type: 'string',
                      description: 'A page on this site like /grow, or a full web address.',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                }),
              ],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: { title: 'label', links: 'links' },
            prepare: ({ title, links }) => ({
              title: title ?? '(no label)',
              subtitle: `Dropdown · ${Array.isArray(links) ? links.length : 0} link(s)`,
            }),
          },
        }),
      ],
    }),

    // Footer link columns. When empty the footer renders its built-in columns
    // (see src/components/Footer.astro). The "Get in touch" column (email, phone,
    // social) is always shown automatically and is not configured here.
    defineField({
      name: 'footerColumns',
      title: 'Footer index links',
      type: 'array',
      group: 'navigation',
      description:
        'The links in the footer index. The footer prints every link here (and the small-print links below) once, sorted A to Z, so the column headings and the order are only for keeping the list tidy in Studio. A page linked twice shows once, under the first label. Leave empty to use the built-in links. The address, office hours and email come from Identity & contact.',
      validation: (Rule) => Rule.max(4),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerColumn',
          title: 'Column',
          icon: ListIcon,
          fields: [
            defineField({
              name: 'title',
              title: 'Column heading',
              type: 'string',
              description: 'The small heading above the links, e.g. "Visit".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                // Shared link object first, so "Add item" reaches for it.
                defineArrayMember({ type: 'navLink' }),
                // The original hand-typed link, kept so the columns seeded
                // before the picker existed stay editable in place.
                defineArrayMember({
                  type: 'object',
                  name: 'footerLink',
                  title: 'Link (typed address)',
                  icon: LinkIcon,
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'href',
                      title: 'Address',
                      type: 'string',
                      description: 'A page on this site like /give, or a full web address.',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                }),
              ],
              validation: (Rule) => Rule.required().min(1).max(8),
            }),
          ],
          preview: {
            select: { title: 'title', links: 'links' },
            prepare: ({ title, links }) => ({
              title: title ?? '(no heading)',
              subtitle: `Column · ${Array.isArray(links) ? links.length : 0} link(s)`,
            }),
          },
        }),
      ],
    }),

    // The button at the right of the header (and at the top of the phone menu).
    // Everything is optional: an empty label keeps the built-in "Request information"
    // pointing at Get Started, and turning it off removes the button everywhere.
    defineField({
      name: 'headerCta',
      title: 'Header button',
      type: 'object',
      group: 'navigation',
      description:
        'The one button at the right of the header. Leave the boxes blank to keep the built-in "Request information" button.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'show',
          title: 'Show the header button',
          type: 'boolean',
          description: 'Turn off to remove the button from the header and the phone menu.',
          initialValue: true,
        }),
        defineField({
          name: 'label',
          title: 'Button text',
          type: 'string',
          description: 'Leave blank for "Request information".',
        }),
        defineField({
          name: 'link',
          title: 'Where the button goes',
          type: 'navLink',
          description: 'Leave blank to keep pointing at the Get Started page.',
        }),
      ],
      preview: {
        select: { show: 'show', label: 'label' },
        prepare: ({ show, label }) => ({
          title: label || 'Request information',
          subtitle: show === false ? 'Hidden' : 'Header button',
        }),
      },
    }),

    // Small on/off switches for the bits of contact detail the header carries.
    // Both are ON unless explicitly turned off, so an untouched site is
    // unchanged (the site reads a blank value as "yes").
    defineField({
      name: 'showEmail',
      title: 'Show the email address in the menu',
      type: 'boolean',
      group: 'navigation',
      description:
        'The "Get in touch" email at the foot of the phone menu. On unless you turn it off.',
      initialValue: true,
      // The 2026-10-13 "Contents" menu has no email or social row (the footer
      // carries both), so this switch has nothing to switch. Hidden rather
      // than removed: the stored value stays put and nothing asks an editor
      // to "Remove field" (gotcha #1). Unhide it if the menu grows the row back.
      hidden: true,
    }),
    defineField({
      name: 'showSocials',
      title: 'Show social buttons in the menu',
      type: 'boolean',
      group: 'navigation',
      description:
        'The Instagram and Facebook buttons at the foot of the phone menu. On unless you turn it off.',
      initialValue: true,
      // Hidden for the same reason as showEmail above.
      hidden: true,
    }),
    defineField({
      name: 'showFooterSocials',
      title: 'Show social buttons in the footer',
      type: 'boolean',
      group: 'navigation',
      description:
        'The "Follow" line in the footer colophon (Instagram, Facebook, YouTube), shown when any of those addresses is set. On unless you turn it off.',
      initialValue: true,
    }),

    // The small print row along the very bottom of the footer.
    defineField({
      name: 'legalNav',
      title: 'Footer index: extra links',
      type: 'array',
      group: 'navigation',
      description:
        'Extra links for the footer index, e.g. Privacy and Accessibility. They join the footer link columns in one A to Z list. Leave empty to keep the built-in Pricing, Privacy and Accessibility.',
      validation: (Rule) => Rule.max(6),
      of: [defineArrayMember({ type: 'navLink' })],
    }),

    // ── Worship times ─────────────────────────────────────────────────────────
    // SINGLE SOURCE OF TRUTH for the service time. Every structured place that
    // shows it (header bar, footer, home service band, worship "when we gather",
    // the "This Sunday" line) and the Google/JSON-LD opening hours derive from
    // these values via src/lib/serviceTime.ts. Change the time here once and it
    // updates everywhere. Prose sentences elsewhere are kept time-agnostic on
    // purpose, so the time never has to be repeated.
    defineField({
      name: 'worshipService',
      title: 'Service time (not used)',
      type: 'object',
      group: 'identity',
      // Starter leftover (2026-10-18): a church service time. The site never shows it and it holds
      // no data, so it is hidden rather than removed (never remove a field).
      hidden: true,
      options: { collapsible: false },
      fields: [
        defineField({
          name: 'time',
          title: 'Time',
          type: 'string',
          description: 'How the time reads on the site. Example: "11am".',
        }),
        defineField({
          name: 'day',
          title: 'Day',
          type: 'string',
          description:
            'The day of the week, singular. Example: "Sunday". The site adds "s" or "every" where needed.',
        }),
        defineField({
          name: 'startTime24',
          title: 'Start time, 24-hour (for search engines)',
          type: 'string',
          description: 'Used in the data Google reads. 24-hour clock. Example: "11:00".',
        }),
        defineField({
          name: 'endTime24',
          title: 'End time, 24-hour (for search engines)',
          type: 'string',
          description: 'Used in the data Google reads. 24-hour clock. Example: "12:15".',
        }),
      ],
    }),

    // ── Connect & integrations ────────────────────────────────────────────────
    // Generic "URL or embed" hooks so any church can point at its own tools
    // (Vanco, Subsplash, Planning Center, Mailchimp) without code. Each is
    // optional and only surfaces in the UI when set.
    defineField({
      name: 'watchUrl',
      title: 'Livestream link (not used)',
      type: 'url',
      group: 'social',
      // Starter leftover (2026-10-18): a church livestream link. The site never shows it and it holds
      // no data, so it is hidden rather than removed (never remove a field).
      hidden: true,
    }),
    defineField({
      name: 'giveUrl',
      title: 'Giving link (not used)',
      type: 'url',
      group: 'social',
      // Starter leftover (2026-10-18): a church giving link. The site never shows it and it holds
      // no data, so it is hidden rather than removed (never remove a field).
      hidden: true,
    }),
    defineField({
      name: 'appUrl',
      title: 'App link (not used)',
      type: 'url',
      group: 'social',
      // Starter leftover (2026-10-18): a church app link. The site never shows it and it holds
      // no data, so it is hidden rather than removed (never remove a field).
      hidden: true,
    }),
    defineField({
      name: 'directoryUrl',
      title: 'Directory link (not used)',
      type: 'url',
      group: 'social',
      // Starter leftover (2026-10-18): a church member directory. The site never shows it and it holds
      // no data, so it is hidden rather than removed (never remove a field).
      hidden: true,
    }),
    defineField({
      name: 'registrationBaseUrl',
      title: 'Registration link (not used)',
      type: 'url',
      group: 'social',
      // Starter leftover (2026-10-18): a default event sign-up link; each event carries its own. The site never shows it and it holds
      // no data, so it is hidden rather than removed (never remove a field).
      hidden: true,
    }),
    defineField({
      name: 'prayerUrl',
      title: 'Prayer link (not used)',
      type: 'url',
      group: 'social',
      // Starter leftover (2026-10-18): a church prayer-request link. The site never shows it and it holds
      // no data, so it is hidden rather than removed (never remove a field).
      hidden: true,
    }),

    // ── Social & footer ───────────────────────────────────────────────────────
    defineField({ name: 'socialInstagram', title: 'Instagram URL', type: 'url', group: 'social' }),
    defineField({ name: 'socialFacebook', title: 'Facebook URL', type: 'url', group: 'social' }),
    defineField({ name: 'socialYoutube', title: 'YouTube URL', type: 'url', group: 'social' }),
    defineField({
      name: 'seoImage',
      title: 'Default social share image',
      type: 'image',
      description:
        'The image shown when any page is shared on social media (the Open Graph image). Use a wide image, about 1200 by 630 pixels. Individual pages can override this. Leave blank to use the auto-generated branded cards.',
      options: { hotspot: true },
      group: 'social',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'footerCredit',
      title: 'Footer credit',
      type: 'string',
      description: 'Optional credit line in the footer (e.g., "Site by Nixon Creative Studio").',
      group: 'social',
    }),
    defineField({
      name: 'footerCreditUrl',
      title: 'Footer credit URL',
      type: 'url',
      description:
        'Optional. When set, the footer credit becomes a link to this URL (opens in a new tab).',
      group: 'social',
    }),

    // ── Newsletter ──────────────────────────────────────────────────────────
    defineField({
      name: 'newsletter',
      title: 'Newsletter signup',
      type: 'object',
      group: 'newsletter',
      description:
        'Connect an email provider (MailerLite, Buttondown, Mailchimp). Paste the embedded-form action URL and list ID; the secret key goes in env as NEWSLETTER_API_KEY.',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable newsletter signup',
          type: 'boolean',
          description: 'When off, the newsletter block does not render anywhere on the site.',
          initialValue: false,
        }),
        defineField({
          name: 'providerLabel',
          title: 'Provider label',
          type: 'string',
          description: 'Internal label only. Example: "MailerLite". Not shown to visitors.',
        }),
        defineField({
          name: 'formActionUrl',
          title: 'Form action URL',
          type: 'url',
          description: "The embedded-form POST endpoint from your email provider's dashboard.",
        }),
        defineField({
          name: 'audienceId',
          title: 'Audience / list ID',
          type: 'string',
          description: 'Your provider list or audience ID.',
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          description:
            'Headline above the signup form. Example: "Get our newsletter in your inbox."',
        }),
        defineField({
          name: 'blurb',
          title: 'Blurb',
          type: 'text',
          rows: 3,
          description: 'One or two sentences under the heading explaining what subscribers get.',
        }),
        defineField({
          name: 'buttonLabel',
          title: 'Button label',
          type: 'string',
          initialValue: 'Subscribe',
        }),
        defineField({
          name: 'successMessage',
          title: 'Success message',
          type: 'text',
          rows: 2,
          description: 'Message shown after a successful signup.',
        }),
        defineField({
          name: 'consentNote',
          title: 'Consent note',
          type: 'text',
          rows: 2,
          description:
            'Small-print consent line near the submit button. Link to /privacy included automatically.',
        }),
      ],
    }),

    // Note: the announcement banner moved from a single object here to its own
    // "Announcement" collection (so the secretary can queue several by date).
    // The old siteSettings.announcement field is cleared by
    // scripts/cleanup-orphaned-fields.mjs.
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
