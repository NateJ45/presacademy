// Foundation, edit with care
// Sanity Studio configuration for the ncs-astro-sanity-starter template.
// Replace SANITY_STUDIO_PROJECT_ID in studio/.env with the real ID from
// manage.sanity.io after running `sanity init` (or after creating the project
// manually). Studio reads it via the cli config — see sanity.cli.ts for
// runtime overrides.

import { defineConfig, type Tool } from 'sanity';
import { structureTool, type DefaultDocumentNodeResolver } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { buildTheme, type RootTheme, type ThemeFont } from '@sanity/ui/theme';
import { visionTool } from '@sanity/vision';
import { media } from 'sanity-plugin-media';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import DocumentsPane from 'sanity-plugin-documents-pane';
import { schemaTypes } from './schemaTypes';
import { ARCHIVABLE_TYPES } from './schemaTypes/archived';
import { deskStructure } from './structure';
import { resolve } from './resolve';
import { PreviewNavigator } from './components/PreviewNavigator';
import { STARTING_TEMPLATES } from './templates';
import StudioLogo from './components/StudioLogo';
import StudioLayout from './components/StudioLayout';
import { StudioFormInput } from './components/StudioFormInput';
import { documentBadges } from './components/documentBadges';
import { SeoPreviewPane } from './components/SeoPreviewPane';
import { HealthTool } from './components/HealthTool';
import { SetupWizard } from './components/SetupWizard';
import { ArchiveAction, RestoreAction, DeleteForeverAction } from './actions/archive';

// =============================================================================
// Studio theme — brand fonts + a real light AND dark mode
// =============================================================================
// @sanity/ui's buildTheme() ships BOTH a light and a dark color scheme (tested
// and accessible), so the Studio's Appearance toggle in the avatar menu
// (System / Light / Dark) works properly. We keep only the brand FONTS on top:
// Fraunces for headings, Source Sans 3 for text and labels.
//
// This replaced the old `buildLegacyTheme` approach, which was light-ONLY: it
// hard-codes white component backgrounds and dark text, so flipping the Studio
// to Dark leaves every panel white (effectively no dark mode). The Geneva
// Green surface tinting that legacy theme carried is gone with it; the brand
// now lives in the logo, the Welcome/guide card accents, and the fonts.
//
// The font FILES are loaded by components/StudioLayout.tsx (a Google Fonts
// <link>); this only points the theme's font families at them. The families
// have to go INTO buildTheme({ font }) — it bakes the CSS at build time; a
// post-hoc `theme.fonts.family` patch is ignored.
// =============================================================================
const DISPLAY_STACK = "'Fraunces', Georgia, 'Times New Roman', serif";
const BODY_STACK = "'Source Sans 3', system-ui, -apple-system, sans-serif";

// -----------------------------------------------------------------------------
// Env access that works in BOTH bundlers. The sanity CLI defines
// process.env.SANITY_STUDIO_*; the EMBEDDED /studio (bundled by Astro/Vite)
// has no `process` global at all in the browser and exposes PUBLIC_* vars on
// import.meta.env instead. A bare `process.env.X` read would throw a
// ReferenceError the moment the embedded studio chunk evaluates.
// -----------------------------------------------------------------------------
const envVal = (...names: string[]): string | undefined => {
  for (const n of names) {
    const fromProcess = typeof process !== 'undefined' ? process.env?.[n] : undefined;
    if (fromProcess) return fromProcess;
    const fromVite = (import.meta as { env?: Record<string, string | undefined> }).env?.[n];
    if (fromVite) return fromVite;
  }
  return undefined;
};
const IS_DEV =
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production');

function withFamily(font: ThemeFont, family: string): ThemeFont {
  return { ...font, family };
}

// Build the default theme once to inherit its font SIZES, then rebuild with
// the brand families fed back through `buildTheme({ font })`.
const themeDefaults = buildTheme();
const studioTheme: RootTheme = buildTheme({
  font: {
    ...themeDefaults.fonts,
    text: withFamily(themeDefaults.fonts.text, BODY_STACK),
    label: withFamily(themeDefaults.fonts.label, BODY_STACK),
    heading: withFamily(themeDefaults.fonts.heading, DISPLAY_STACK),
  },
});

// Preview/site base used by urlForDoc (kept for a future preview pane; see
// structure.ts). Defaults to production; override with SANITY_STUDIO_PREVIEW_URL
// (e.g. a workers.dev preview, or http://localhost:4321 for local Studio + site dev).
export const SITE_URL_FOR_PREVIEW =
  envVal('SANITY_STUDIO_PREVIEW_URL') || 'https://www.presbyterianacademy.org';

// The live (production) site base used by the "View on the live site" help
// banner. Deliberately INDEPENDENT of SITE_URL_FOR_PREVIEW (which may point at
// localhost during local Studio dev) so faculty in the deployed Studio are
// always sent to the real site.
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
    case 'accessibilityPage': return '/accessibility';
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

// =============================================================================
// Extra document views (tabs), added by type via defaultDocumentNode below.
// =============================================================================
// - SEO preview: a read-only "how this looks in Google / when shared" tab on
//   every document with seoTitle/seoDescription fields. NOT an iframe preview
//   (this is a static site with no live draft preview), so it can't mislead —
//   it renders straight from the draft's own fields.
// - "Used on": a reverse-reference panel listing the documents that point at
//   this one (answers "is it safe to change or delete?"). Kept on the types
//   other documents genuinely reference.

const SEO_PREVIEW_TYPES = [
  'homePage',
  'aboutPage',
  'faqPage',
  'contactPage',
  'eventsPage',
  'notFoundPage',
  'privacyPage',
  'accessibilityPage',
  'coursesPage',
  'facultyPage',
  'pricingPage',
  'getStartedPage',
  'forYouPage',
  'resourcesPage',
  'page',
  'course',
];

const USED_ON_TYPES = [
  'course',        // testimonial.courseCompleted
  'facultyMember', // course.instructors
  'term',          // course.offerings[].term
  'teachingArea',  // course.teachingAreas, facultyMember.teachingAreas
  'pricingTier',   // course.priceTier
  'form',          // sectionForm.form
  'faqCategory',   // faqItem.categoryRef, sectionFaqList.categoryRef
];

function usedOnView(S: Parameters<DefaultDocumentNodeResolver>[0]) {
  return S.view
    .component(DocumentsPane)
    .options({
      query: `*[references($id)]{ _id, _type, title, name }`,
      params: { id: `_id` },
      options: { perspective: 'previewDrafts' },
    })
    .title('Used on')
    .icon(() => '🔗');
}

const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  return S.document().views([
    S.view.form(),
    ...(SEO_PREVIEW_TYPES.includes(schemaType)
      ? [
          S.view
            .component(SeoPreviewPane)
            .title('SEO preview')
            .icon(() => '🔎'),
        ]
      : []),
    ...(USED_ON_TYPES.includes(schemaType) ? [usedOnView(S)] : []),
  ]);
};

// Custom Studio tools (navbar entries).
// Checkup — read-only "what needs attention?" report.
const checkupTool: Tool = {
  name: 'checkup',
  title: 'Checkup',
  component: HealthTool,
  icon: () => '🩺',
};
// New term setup — a read-only guided checklist for the term rollover, each
// card jumping straight to the thing to update.
const setupTool: Tool = {
  name: 'term-setup',
  title: 'New term setup',
  component: SetupWizard,
  icon: () => '🍂',
};

export default defineConfig({
  name: 'presacademy',
  // Short title shown in the browser tab when editing.
  // school's name.
  title: 'The Presbyterian Academy',

  // Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET in studio/.env
  // (or as env vars) after creating your Sanity project at sanity.io/manage.
  projectId:
    envVal('SANITY_STUDIO_PROJECT_ID', 'PUBLIC_SANITY_PROJECT_ID') || 'placeholder-project-id',
  dataset: envVal('SANITY_STUDIO_DATASET', 'PUBLIC_SANITY_DATASET') || 'production',

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

  // Navbar tools: the built-ins plus Checkup and New term setup.
  tools: (prev) => [...prev, checkupTool, setupTool],

  plugins: [
    structureTool({
      structure: deskStructure,
      // Extra per-type tabs (SEO preview, "Used on"). Still no iframe tab on
      // documents: the live draft preview is the Presentation tool below,
      // which renders the SSR /preview/* routes with click-to-edit.
      defaultDocumentNode,
    }),
    // Click-to-edit live preview against the Studio-only /preview/* routes
    // (never the real public pages — see studio/resolve.ts and the site's
    // src/pages/preview/). previewMode only sets `enable`: `disable` is a
    // documented no-op in this Sanity version, so exiting preview is a plain
    // link to /api/draft-mode/disable (see PreviewLayout.astro). The relative
    // URLs assume the EMBEDDED /studio (same origin as the site); the old
    // hosted *.sanity.studio is retired.
    presentationTool({
      resolve,
      previewUrl: {
        initial: '/preview',
        previewMode: { enable: '/api/draft-mode/enable' },
      },
      // The Squarespace-style page list beside the preview: click a page,
      // the preview jumps there and the edit panel follows.
      components: {
        unstable_navigator: {
          component: PreviewNavigator,
          minWidth: 160,
          maxWidth: 280,
        },
      },
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
    ...(IS_DEV ? [visionTool()] : []),
  ],

  schema: {
    types: schemaTypes,
    // Pre-filled "+ New" starting points for pages, courses, and events (the
    // blank options stay available too).
    templates: (prev) => [...prev, ...STARTING_TEMPLATES],
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
    // Action wiring, in priority order:
    //  - singletons: keep only editing actions (no unpublish/delete/duplicate).
    //  - archivable content: swap the destructive Delete for the soft-delete
    //    Archive ("move to trash"), and append Restore + Delete forever (each
    //    renders only when the document is actually in the trash). Everything
    //    else (publish, duplicate, ...) stays.
    actions: (prev, { schemaType }) => {
      if (SINGLETON_TYPES.has(schemaType)) {
        return prev.filter(
          ({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action || ''),
        );
      }
      if (ARCHIVABLE_TYPES.has(schemaType)) {
        return [
          ...prev.filter(({ action }) => action !== 'delete'),
          ArchiveAction,
          RestoreAction,
          DeleteForeverAction,
        ];
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
  'accessibilityPage',
  // School index pages + page singletons
  'eventsPage',
  'coursesPage',
  'facultyPage',
  'pricingPage',
  'getStartedPage',
  'forYouPage',
  'resourcesPage',
]);
