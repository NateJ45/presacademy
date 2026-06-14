// Foundation, edit with care
// Sanity Studio configuration for the ncs-astro-sanity-starter template.
// Replace SANITY_STUDIO_PROJECT_ID in studio/.env with the real ID from
// manage.sanity.io after running `sanity init` (or after creating the project
// manually). Studio reads it via the cli config — see sanity.cli.ts for
// runtime overrides.

import { defineConfig, buildLegacyTheme } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { media } from 'sanity-plugin-media';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import { schemaTypes } from './schemaTypes';
import { deskStructure } from './structure';
import StudioLogo from './components/StudioLogo';
import StudioLayout from './components/StudioLayout';
import { StudioFormInput } from './components/StudioFormInput';
import { documentBadges } from './components/documentBadges';

// Brand theme for the Studio UI. Uses Sanity's legacy theme builder which
// maps a handful of CSS custom properties to the Studio's full internal design
// system (it derives the complete light + dark palette from these inputs).
//
// These values mirror the website's own design tokens (src/styles/globals.css)
// so the Studio shares the site's "Direction A" feel: deep Reformed GREEN as
// the interactive accent, near-white warm-paper surfaces, soft near-black ink,
// brass for warnings, and a deep forest-green top bar with cream text — the
// same green the site uses for its utility bar, footer, and closing CTA. The
// fonts are patched on below.
const studioThemeProps = {
  // Foundation — neutrals everything else derives from.
  '--black': '#1F1B18',   // Soft near-black — darkest text / ink
  '--white': '#FFFFFF',   // White — lightest surface
  '--gray-base': '#6E6357', // Warm taupe — tints every neutral warm, not cool

  // Brand accent — Geneva Green.
  '--brand-primary': '#33503F',
  '--brand-primary--inverted': '#ffffff',
  '--focus-color': '#33503F',

  // Near-white warm-paper component surfaces; white inputs sit crisply on top.
  '--input-bg': '#FFFFFF',
  '--component-bg': '#FAF8F4',
  '--component-text-color': '#1F1B18',

  // Buttons — green accent; brass warning; red danger.
  '--default-button-color': '#33503F',
  '--default-button-primary-color': '#33503F',
  '--default-button-success-color': '#3E7C66',
  '--default-button-warning-color': '#A87C3E',
  '--default-button-danger-color': '#C0392B',

  // Validation + status states.
  '--state-success-color': '#3E7C66',
  '--state-warning-color': '#A87C3E',
  '--state-danger-color': '#C0392B',

  // Top navigation bar — deep forest green with cream text, echoing the site's
  // utility bar, footer, and closing CTA band.
  '--main-navigation-color': '#2A4233',
  '--main-navigation-color--inverted': '#F1EAD9',
};

// Patch the brand fonts onto the legacy theme. buildLegacyTheme returns a full
// theme object whose `fonts` map (@sanity/ui) carries a `family` per role; we
// override the heading + text families with the site's faces (Fraunces for
// display, Source Sans 3 for body). The font files themselves are injected via
// the StudioLayout component (a Google Fonts <link>), so these names resolve.
// Optional chaining keeps a future @sanity/ui shape change from throwing.
const DISPLAY_STACK = "'Fraunces', Georgia, 'Times New Roman', serif";
const BODY_STACK = "'Source Sans 3', system-ui, -apple-system, sans-serif";

const baseTheme = buildLegacyTheme(studioThemeProps);
const studioTheme = {
  ...baseTheme,
  fonts: baseTheme.fonts
    ? {
        ...baseTheme.fonts,
        heading: baseTheme.fonts.heading
          ? { ...baseTheme.fonts.heading, family: DISPLAY_STACK }
          : baseTheme.fonts.heading,
        text: baseTheme.fonts.text
          ? { ...baseTheme.fonts.text, family: BODY_STACK }
          : baseTheme.fonts.text,
      }
    : baseTheme.fonts,
};

// Preview/site base used by urlForDoc (kept for a future preview pane; see
// structure.ts). Defaults to production; override with SANITY_STUDIO_PREVIEW_URL
// (e.g. a workers.dev preview, or http://localhost:4321 for local Studio + site dev).
export const SITE_URL_FOR_PREVIEW = process.env.SANITY_STUDIO_PREVIEW_URL || 'https://www.presbyterianacademy.org';

// The live (production) site base used by the "View on the live site" help
// banner. Deliberately INDEPENDENT of SITE_URL_FOR_PREVIEW (which may point at
// localhost during local Studio dev) so faculty in the deployed Studio are
// always sent to the real site. Stamp this with the project's domain at rebrand.
export const LIVE_SITE_URL = 'https://www.presbyterianacademy.org';

// Map doc _type → live-site PATH (no host). Singletons get a fixed path;
// slug-based docs build it from the slug. Returns null for types with no public
// page (siteSettings). Exported so the help banner + any preview wiring share it.
export function pathForDoc(schemaType: string, doc: any): string | null {
  const slug = doc?.slug?.current;
  switch (schemaType) {
    // Core pages
    case 'homePage':      return '/';
    case 'aboutPage':     return '/about';
    case 'faqPage':       return '/faq';
    case 'contactPage':   return '/contact';
    case 'notFoundPage':  return '/404';
    case 'privacyPage':   return '/privacy';
    // School index pages + page singletons
    case 'eventsPage':       return '/events';
    case 'coursesPage':      return '/courses';
    case 'facultyPage':      return '/faculty';
    case 'pricingPage':      return '/pricing';
    case 'getStartedPage':   return '/get-started';
    case 'forYouPage':       return '/for-you';
    case 'resourcesPage':    return '/resources';
    // Collections: dated detail pages by slug; course + faculty detail; FAQ list.
    case 'event':         return slug ? `/events/${slug}` : '/events';
    case 'course':        return slug ? `/courses/${slug}` : '/courses';
    case 'facultyMember': return slug ? `/faculty/${slug}` : '/faculty';
    case 'faqItem':       return '/faq';
    // Generic custom pages live at /<slug>.
    case 'page':          return slug ? `/${slug}` : null;
    default:              return null;
  }
}

// Full URL on the preview/site base. Kept for a future preview pane (structure.ts).
export function urlForDoc(schemaType: string, doc: any): string | null {
  const path = pathForDoc(schemaType, doc);
  return path === null ? null : `${SITE_URL_FOR_PREVIEW}${path}`;
}

export default defineConfig({
  name: 'churchstarter',
  // Short title shown in the browser tab when editing. REPLACE with the
  // church's name (rebrand.mjs stamps this).
  title: 'The Presbyterian Academy',

  // Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET in studio/.env
  // (or as env vars) after creating your Sanity project at sanity.io/manage.
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  // Brand theme — Geneva Green primary + near-white paper.
  theme: studioTheme,

  // Studio chrome overrides. Logo replaces the default Sanity wordmark; the
  // layout wrapper injects the brand web fonts so the theme's serif families
  // (set above) actually load in the Studio.
  studio: {
    components: {
      logo: StudioLogo,
      layout: StudioLayout,
    },
  },

  // Global form customization. Only one input component is allowed at this slot,
  // so StudioFormInput composes two aids: a "what you're editing + view it live"
  // banner at each document's root, and the live character counter on capped
  // text fields. It falls through to the default input everywhere else.
  form: {
    components: {
      input: StudioFormInput,
    },
  },

  plugins: [
    structureTool({
      structure: deskStructure,
      // No defaultDocumentNode override: documents show the form only. This is a
      // static site with no live draft preview, so an iframe "Preview" tab would
      // load the last PUBLISHED build (not the editor's current draft) and
      // mislead editors. Changes go live after Publish + the site rebuild; see
      // the "How This Works" guide. (urlForDoc / SITE_URL_FOR_PREVIEW are kept
      // above for reference if a real preview environment is added later.)
    }),
    // Unsplash plugin — adds an "Unsplash" tab to every image picker. The
    // package's correct registration is via the plugins array (not
    // form.image.assetSources — that was my earlier bug). Picking a photo
    // uploads it to the Sanity library + attaches to the field in one shot.
    unsplashImageAsset(),
    // Media browser — adds a top-level "Media" icon in the Studio sidebar
    // for browsing every uploaded image at once with tag + filter + bulk-edit.
    // Much better than the inline image picker for "what's in our library".
    media(),
    // Vision (GROQ query runner) is a developer tool, not an editor tool.
    // Gate it to local dev so it doesn't clutter the deployed Studio.
    ...(process.env.NODE_ENV !== 'production' ? [visionTool()] : []),
  ],

  schema: {
    types: schemaTypes,
  },

  // Singleton enforcement: hide these from the global "+" create menu so editors
  // can't make duplicates. Reusable content types stay available.
  document: {
    // Custom at-a-glance status badges (Featured / Needs a photo / Add SEO)
    // rendered next to the publish status. Keep Sanity's built-in badges and
    // append ours.
    badges: (prev) => [...prev, ...documentBadges],
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter((option) => !SINGLETON_TYPES.has(option.templateId));
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      if (SINGLETON_TYPES.has(schemaType)) {
        return prev.filter(
          ({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action || ''),
        );
      }
      return prev;
    },
  },
});

// Singleton document types — one instance each, not duplicable.
const SINGLETON_TYPES = new Set<string>([
  'siteSettings',
  'homePage',
  'aboutPage',
  'faqPage',
  'contactPage',
  'notFoundPage',
  'privacyPage',
  // School index pages + page singletons
  'eventsPage',
  'coursesPage',
  'facultyPage',
  'pricingPage',
  'getStartedPage',
  'forYouPage',
  'resourcesPage',
]);
