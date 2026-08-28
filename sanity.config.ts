// Foundation, edit with care
// =============================================================================
// Sanity Studio configuration — loaded by the EMBEDDED /studio
// =============================================================================
// The studio lives in the SAME package as the site (folded in from the old
// nested studio/ package on 2026-08-26): one node_modules, one copy of every
// module, which is what keeps the styled-components/@sanity/ui theme context
// intact (see CLAUDE.md gotcha #17 for the dual-tree incident this ended).
// @sanity/astro mounts this config at /studio (astro.config.mjs); the sanity
// CLI (sanity.cli.ts) uses it for typegen and dataset commands.

import { defineConfig, type Tool } from 'sanity';
import { structureTool, type DefaultDocumentNodeResolver } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { buildTheme, type RootTheme, type ThemeFont } from '@sanity/ui/theme';
import { visionTool } from '@sanity/vision';
import { media } from 'sanity-plugin-media';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import DocumentsPane from 'sanity-plugin-documents-pane';
import { schemaTypes } from './src/sanity/schemaTypes';
import { ARCHIVABLE_TYPES } from './src/sanity/schemaTypes/archived';
import { deskStructure } from './src/sanity/structure';
import { resolve } from './src/sanity/resolve';
import { envVal } from './src/sanity/urls';
import { PreviewNavigator } from './src/sanity/components/PreviewNavigator';
import { STARTING_TEMPLATES } from './src/sanity/templates';
import StudioLogo from './src/sanity/components/StudioLogo';
import StudioLayout from './src/sanity/components/StudioLayout';
import { StudioFormInput } from './src/sanity/components/StudioFormInput';
import { documentBadges } from './src/sanity/components/documentBadges';
import { SeoPreviewPane } from './src/sanity/components/SeoPreviewPane';
import { HealthTool } from './src/sanity/components/HealthTool';
import { SetupWizard } from './src/sanity/components/SetupWizard';
import { ArchiveAction, RestoreAction, DeleteForeverAction } from './src/sanity/actions/archive';
import { shareDraftLinkAction } from './src/sanity/components/shareDraftLink';
import { SaveSectionPresetAction } from './src/sanity/actions/saveSectionPreset';
import { CheckPageAction } from './src/sanity/actions/checkPage';
import { PAGE_BUILDER_TYPES } from './src/sanity/pageBuilderConfig';
import { SINGLETON_PREVIEW_PATHS } from './src/sanity/resolve';

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
// The font FILES are loaded by src/sanity/components/StudioLayout.tsx (a
// Google Fonts <link>); this only points the theme's font families at them.
// The families have to go INTO buildTheme({ font }) — it bakes the CSS at
// build time; a post-hoc `theme.fonts.family` patch is ignored.
// =============================================================================
const DISPLAY_STACK = "'Fraunces', Georgia, 'Times New Roman', serif";
const BODY_STACK = "'Source Sans 3', system-ui, -apple-system, sans-serif";

// Dev detection must FAIL CLOSED. An earlier version also treated
// `process.env.NODE_ENV !== 'production'` as dev, but the Astro/Vite client
// bundle injects `globalThis.process ??= {}`, so `process` exists with an
// empty env and NODE_ENV is undefined — which made this true in PRODUCTION
// and shipped the Vision tool to editors.
const IS_DEV =
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

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

// =============================================================================
// Extra document views (tabs), added by type via defaultDocumentNode below.
// =============================================================================
// - SEO preview: a read-only "how this looks in Google / when shared" tab on
//   every document with seoTitle/seoDescription fields. It renders straight
//   from the draft's own fields.
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
  'course', // testimonial.courseCompleted
  'facultyMember', // course.instructors
  'term', // course.offerings[].term
  'teachingArea', // course.teachingAreas, facultyMember.teachingAreas
  'pricingTier', // course.priceTier
  'form', // sectionForm.form
  'faqCategory', // faqItem.categoryRef, sectionFaqList.categoryRef
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
  title: 'The Presbyterian Academy',

  projectId:
    envVal('SANITY_STUDIO_PROJECT_ID', 'PUBLIC_SANITY_PROJECT_ID') || 'placeholder-project-id',
  dataset: envVal('SANITY_STUDIO_DATASET', 'PUBLIC_SANITY_DATASET') || 'production',

  // Brand theme — fonts only; see the theme block above.
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
    // (never the real public pages — see src/sanity/resolve.ts and the site's
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
    // Unsplash plugin — adds an "Unsplash" tab to every image picker.
    // (Briefly disabled 2026-08-26 while chasing the Studio theming crash; it
    // was innocent — the cause was the nested studio package's dual module
    // trees. Held at 7.0.15: newer versions demand @sanity/ui ^3.4/v4.)
    unsplashImageAsset(),
    // Media browser — adds a top-level "Media" icon in the Studio sidebar
    // for browsing every uploaded image at once with tag + filter + bulk-edit.
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
    //  - page-builder types: "Save a section as preset..." (PORTS.md card 24)
    //    and "Check this page..." (card 25), the two courtesy verbs a page
    //    gets. Neither blocks publish and neither edits anything on its own.
    //  - shareable types: "Copy share link" (card 19), on the documents that
    //    HAVE a /preview route to show. See SHAREABLE_TYPES below.
    actions: (prev, { schemaType }) => {
      const extras = [
        ...(PAGE_BUILDER_TYPES.has(schemaType) ? [SaveSectionPresetAction, CheckPageAction] : []),
        ...(SHAREABLE_TYPES.has(schemaType) ? [shareDraftLinkAction] : []),
      ];

      if (SINGLETON_TYPES.has(schemaType)) {
        return [
          ...prev.filter(
            ({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action || ''),
          ),
          ...extras,
        ];
      }
      if (ARCHIVABLE_TYPES.has(schemaType)) {
        return [
          ...prev.filter(({ action }) => action !== 'delete'),
          ArchiveAction,
          RestoreAction,
          DeleteForeverAction,
          ...extras,
        ];
      }
      return [...prev, ...extras];
    },
  },
});

// Documents a share link can be minted for (PORTS.md card 19).
//
// The link points at a /preview/* route, and this site has those routes for the
// page singletons and for custom `page` documents only (see
// src/pages/preview/[...slug].astro). A course, a faculty member or an event
// resolves to a LIVE address through pathForDoc, and `/preview` + that address
// is a route that does not exist, so offering the action there would hand an
// editor a link to a 404. Those documents preview through their index page
// instead, which is what src/sanity/resolve.ts already says.
const SHAREABLE_TYPES = new Set<string>([...Object.keys(SINGLETON_PREVIEW_PATHS), 'page']);

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
