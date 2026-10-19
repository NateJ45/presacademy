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

import { defineConfig, type DocumentActionComponent, type Tool } from 'sanity';
import { structureTool, type DefaultDocumentNodeResolver } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
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
import { startingTemplates } from './src/sanity/templates';
import { StudioFormInput } from './src/sanity/components/StudioFormInput';
import { documentBadges } from './src/sanity/components/documentBadges';
import { SeoPreviewPane } from './src/sanity/components/SeoPreviewPane';
import { SetupWizard } from './src/sanity/components/SetupWizard';
import { RestoreAction, DeleteForeverAction } from './src/sanity/actions/archive';
import { shareDraftLinkAction } from './src/sanity/components/shareDraftLink';
import { withSlugRedirect } from './src/sanity/components/slugRedirect';
import { SaveSectionPresetAction } from './src/sanity/actions/saveSectionPreset';
import { CheckPageAction } from './src/sanity/actions/checkPage';
import { UndoAction, RedoAction, undoRedoShortcuts } from './src/sanity/components/UndoRedo';
import { PAGE_BUILDER_TYPES } from './src/sanity/pageBuilderConfig';
import { SINGLETON_PREVIEW_PATHS } from './src/sanity/resolve';
import { StudioIcon } from './src/sanity/components/StudioIdentity';
import { buildStudioTheme, seedLightScheme } from './src/sanity/studioTheme';
import {
  studioLook,
  StudioWordmarkNavbar,
  withEditorTypography,
} from './src/sanity/components/StudioLook';
// The Studio's edges: sign-in line, wording, navbar wordmark (card 120).
import { studioWording } from './src/sanity/studioWording';
import { studioEdges } from './src/sanity/studioEdges.config';
// The site's own font files for the Studio (card 116).
import './src/sanity/studioFonts.css';
import brand from './brand/brand.config.json';
import { ncsStudioKit } from './src/sanity/kit';
import { kitConfig } from './src/sanity/kit.config';
import { ncsWorkflowTools } from './src/sanity/workflow';
import { brandIcon, brandIcons, typeIcon, withBrandPreviews } from './src/sanity/brandIcons';

// =============================================================================
// Studio theme
// =============================================================================
// Built in src/sanity/studioTheme.ts from brand/brand.config.json (PORTS.md
// cards 110 and 116): a warm paper, Geneva Green as the accent, re-hued greys,
// Fraunces and Source Sans 3, in BOTH schemes so the Appearance menu (System /
// Light / Dark) works. Light is the default for a new editor (seedLightScheme).
// The deep green top bar and the rich-text typography are StudioLook.tsx.
//
// The families have to go INTO buildTheme({ font }): it bakes the CSS at build
// time. The font files load from src/sanity/studioFonts.css, imported above
// (they replaced the Google Fonts <link> StudioLayout.tsx used to inject).
// Keep these two stacks in step with brand.config.json studio.fonts.
// =============================================================================
const DISPLAY_STACK = '"Fraunces Variable", Georgia, "Times New Roman", serif';
const BODY_STACK = '"Source Sans 3 Variable", system-ui, -apple-system, sans-serif';
const STUDIO_FONTS = { display: DISPLAY_STACK, body: BODY_STACK };

const studioTheme = buildStudioTheme(STUDIO_FONTS);
seedLightScheme();

// The tab's title and icons come from the site's own /studio page
// (src/pages/studio/index.astro, card 120).
const wording = studioWording(brand.name, studioEdges);

// Dev detection must FAIL CLOSED. An earlier version also treated
// `process.env.NODE_ENV !== 'production'` as dev, but the Astro/Vite client
// bundle injects `globalThis.process ??= {}`, so `process` exists with an
// empty env and NODE_ENV is undefined, which made this true in PRODUCTION
// and shipped the Vision tool to editors.
const IS_DEV =
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

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
    .icon(brandIcon('related'));
}

const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  return S.document().views([
    S.view.form(),
    ...(SEO_PREVIEW_TYPES.includes(schemaType)
      ? [S.view.component(SeoPreviewPane).title('Google preview').icon(brandIcon('search'))]
      : []),
    ...(USED_ON_TYPES.includes(schemaType) ? [usedOnView(S)] : []),
  ]);
};

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

// The Academy's own top-bar tool. Home, Site Guide, Checkup and Quick update
// come from the Studio kit (ncsStudioKit below), Messages from the workflow
// tools; the kit puts them all in order (kit.config.ts toolOrder).
// New term: a read-only guided checklist for the start of every term, each
// card jumping straight to the thing to update.
const termTool: Tool = {
  name: 'term-setup',
  title: 'New term',
  component: SetupWizard,
  icon: brandIcon('times'),
};

export default defineConfig({
  name: 'presacademy',
  // The school's own name and mark (PORTS.md card 110), both from the brand:
  // `title` is brand.config.json `name`, the icon is public/favicon.svg.
  title: brand.name,
  icon: StudioIcon,
  // The line under the name on the sign-in card (card 120).
  subtitle: wording.subtitle,
  // The site's words on Sanity's screens: signed-out notice, user menu.
  i18n: { bundles: wording.bundles },
  // The wordmark beside the icon. At the ROOT on purpose: the root's middleware
  // sits innermost, right around Sanity's bar (see StudioLook.tsx).
  studio: { components: { navbar: StudioWordmarkNavbar } },

  // Content Releases and Scheduled Drafts are paid Sanity features: on the free
  // plan they only show an "Upgrade to unlock" screen. Scheduling is the site's
  // own "Publish automatically at" field and publish-due.yml instead.
  releases: { enabled: false },
  scheduledDrafts: { enabled: false },

  projectId:
    envVal('SANITY_STUDIO_PROJECT_ID', 'PUBLIC_SANITY_PROJECT_ID') || 'placeholder-project-id',
  dataset: envVal('SANITY_STUDIO_DATASET', 'PUBLIC_SANITY_DATASET') || 'production',

  // Sign in with a session TOKEN, not Sanity's default (a cookie where the
  // browser allows one). The kit's Worker routes (/api/studio/*) check a Bearer
  // token; a cookie session sends none and every route answers 401 (card 129).
  // Each editor signs in once more after the site takes this line.
  auth: { loginMethod: 'token' },

  // The brand theme; see the theme block above.
  theme: studioTheme,

  // Global form customization. Only one input component is allowed at this slot,
  // so StudioFormInput composes two aids: a "what you're editing + view it live"
  // banner at each document's root, and the live character counter on capped
  // text fields. It falls through to the default input everywhere else.
  form: {
    components: {
      input: StudioFormInput,
    },
  },

  // The Academy's own tool; the kit orders it with the rest.
  tools: (prev) => [...prev, termTool],

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
        previewMode: { enable: '/api/draft-mode/enable/' },
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
    // Ctrl+Z / Ctrl+Shift+Z (Cmd on a Mac) for everything that is not typing:
    // sections added, dragged or removed, photos cleared, backgrounds changed
    // (PORTS.md card 27). The buttons are the two document actions in
    // pageActions() below; this plugin adds only the keyboard layer, and it
    // stays out of text boxes so their own undo keeps working. It contributes a
    // second studio.components.layout, which composes with the kit's layout
    // rather than replacing it. See src/sanity/components/UndoRedo.tsx.
    undoRedoShortcuts(),
    // Deep green chrome for the top bar (StudioLook.tsx, PORTS.md card 116).
    studioLook(STUDIO_FONTS),
    // Share a preview, Messages, the previewShare type (PORTS.md card 117).
    // Before the kit, so the kit's tool order and staff view place "messages".
    // shareTypes: the types whose own page /preview renders.
    ncsWorkflowTools({ shareTypes: [...SHAREABLE_TYPES] }),
    // The Studio kit (src/sanity/kit/, settings in src/sanity/kit.config.ts):
    // Home, Site Guide, Checkup and Quick update, plain tool names, the staff
    // view, Move to Trash, the note after Publish and the first-run tour.
    // Its tools reducer has to see every other tool, so only brandIcons follows.
    ncsStudioKit(kitConfig),
    // Icons by meaning on every tool and plugin type (card 119). After the kit
    // so its tools get icons too; it only swaps icons.
    brandIcons(),
  ],

  schema: {
    // Portable Text styles drawn in the site's fonts (StudioLook.tsx, card 116).
    // Every document type gets its icon and a picture in list rows (card 119).
    types: withBrandPreviews(withEditorTypography(schemaTypes, STUDIO_FONTS)),
    // The "+ New" starting points: page templates, course and event starters
    // (src/sanity/templates.ts, the authoring kit, PORTS.md card 109).
    templates: (prev) => [
      ...prev,
      ...startingTemplates().map((t) => ({ ...t, icon: typeIcon(t.schemaType) })),
    ],
  },

  // Singleton enforcement: hide these from the global "+" create menu so editors
  // can't make duplicates. Reusable content types stay available.
  document: {
    // Custom at-a-glance status badges (Featured / Needs a photo / Add SEO)
    // rendered next to the publish status. Keep Sanity's built-in badges and
    // append ours.
    badges: (prev) => [...prev, ...documentBadges],
    newDocumentOptions: (prev, { creationContext }) => {
      // A custom page is made from a page template (templates.ts, card 109);
      // the bare stock one is hidden because Basics: Blank page is the same
      // thing with a clearer name. It stays registered, so links that name it
      // keep working.
      const options = prev.filter((option) => option.templateId !== 'page');
      if (creationContext.type === 'global') {
        return options.filter((option) => !SINGLETON_TYPES.has(option.templateId));
      }
      return options;
    },
    // Action wiring, in priority order:
    //  - singletons: keep only editing actions (no unpublish/delete/duplicate).
    //  - archivable content: no permanent Delete. The Studio kit adds "Move to
    //    Trash" (kit.config.ts trashTypes); Restore + Delete forever stay for
    //    documents still carrying the older soft-delete flag (each renders only
    //    when the document has archived: true). Everything else stays.
    //  - page-builder types: "Save a section as preset..." (PORTS.md card 24)
    //    and "Check this page..." (card 25), the two courtesy verbs a page
    //    gets. Neither blocks publish and neither edits anything on its own.
    //  - shareable types: "Copy share link" (card 19), on the documents that
    //    HAVE a /preview route to show. See SHAREABLE_TYPES above.
    //  - safe rename (PORTS.md card 22): whatever list the branches below
    //    produce, the stock Publish is wrapped so a changed web address files
    //    an old -> new redirect FIRST. The wrapper asks pathForDoc for the old
    //    and the new path, so it is a no-op on every fixed-path singleton and
    //    does its work on `page`, `event`, `course` and `facultyMember` (the
    //    four types whose address is built from a slug). It never blocks
    //    publish. See src/sanity/components/slugRedirect.tsx.
    actions: (prev, context) => {
      const list = pageActions(prev, context);
      return list.map((action) =>
        action.action === 'publish' ? withSlugRedirect(action) : action,
      );
    },
  },
});

/**
 * The document-action list before the safe-rename wrapper is applied. Split out
 * of the resolver above only so the wrapping happens in ONE place, whichever
 * branch produced the list.
 */
function pageActions(
  prev: DocumentActionComponent[],
  { schemaType }: { schemaType: string },
): DocumentActionComponent[] {
  const extras = [
    // Undo / Redo (PORTS.md card 27) ride with the other page-builder verbs:
    // a page is where a mis-drag or a wrong background actually costs
    // something, and where "which change do you mean?" has an obvious answer.
    // The keyboard shortcut is registered separately, by the plugin above.
    ...(PAGE_BUILDER_TYPES.has(schemaType)
      ? [SaveSectionPresetAction, CheckPageAction, UndoAction, RedoAction]
      : []),
    ...(SHAREABLE_TYPES.has(schemaType) ? [shareDraftLinkAction] : []),
  ];

  if (SINGLETON_TYPES.has(schemaType)) {
    return [
      ...prev.filter(({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action || '')),
      ...extras,
    ];
  }
  if (ARCHIVABLE_TYPES.has(schemaType)) {
    return [
      ...prev.filter(({ action }) => action !== 'delete'),
      RestoreAction,
      DeleteForeverAction,
      ...extras,
    ];
  }
  return [...prev, ...extras];
}

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
