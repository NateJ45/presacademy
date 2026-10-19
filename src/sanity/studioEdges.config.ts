// Safe to edit by hand
// =============================================================================
// The Studio's edges for The Presbyterian Academy: wordmark, sign-in line,
// wording (PORTS.md card 120)
// =============================================================================
// The ONE site-specific file for the branded edges of the embedded Studio. NOT
// marked PORTABLE. The machinery is PORTABLE: src/pages/studio/index.astro (the
// page and its splash), src/lib/studio-route.ts, src/sanity/studioWording.ts
// and the navbar wordmark in StudioLook.tsx. Detail: docs/agent/studio-kit.md
// ("The edges"). The splash art is src/sanity/StudioSplashMotif.astro.
// =============================================================================

import type { StudioWordingInput } from './studioWording';
import type { StudioStart } from '../lib/studio-app';

export interface StudioEdgesConfig extends StudioWordingInput {
  wordmark: {
    /** Which brand.config.json `logoPaths` entry the green top bar shows ('dark' is the reversed one). null hides it. */
    logo: 'dark' | 'light' | null;
    /** Optional crop of an SVG logo, "x,y,width,height" in the file's own viewBox units. */
    view?: string | null;
  };
  /**
   * The Studio as a phone app (card 125): what the home-screen icon is called
   * and where it opens. 'quick-update' needs the Quick update tool.
   */
  app?: {
    /** Under the icon. About 12 characters fits every phone. */
    shortName?: string;
    start?: StudioStart;
  };
}

export const studioEdges: StudioEdgesConfig = {
  // "The Presbyterian" upright and "Academy" in brass italic, the masthead's
  // nameplate (src/assets/brand/wordmark-dark.svg, made by scripts/gen-studio-art.mjs),
  // beside the green PA square.
  wordmark: { logo: 'dark' },
  // The phone app (card 125): the name under its icon, opening on Home.
  app: { shortName: 'PA Studio', start: 'home' },
  // Under "The Presbyterian Academy" on the sign-in card.
  loginSubtitle: 'Sign in to update the Academy website',
  words: {
    'login.logged-out.generic': 'Please sign in again to keep working on the Academy website.',
    'user-menu.action.manage-project': 'Manage who can edit',
    'user-menu.action.manage-project-aria-label': 'Manage who can edit',
    'user-menu.action.invite-members': 'Invite a colleague to edit',
    'user-menu.action.invite-members-aria-label': 'Invite a colleague to edit',
  },
};
