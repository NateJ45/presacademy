// Safe to edit by hand
// Static identity values that don't change between deploys.
// REPLACE EVERY PLACEHOLDER below before launch (or run `node scripts/rebrand.mjs`
// with your bootstrap.config.json — see docs/bootstrap/NEW-PROJECT.md).
// Content editors update everything else through Sanity — see studio/ and src/lib/queries.ts.

export const site = {
  name: "First Church of Springfield",
  studio: "First Church of Springfield",
  domain: "example-church.org",
  url: "https://www.example-church.org",
  storageKeyPrefix: "firstchurch",
  themeStorageKey: "firstchurch-theme",

  // The text wordmark rendered in the header, footer, and mobile menu.
  // Two stacked lines (e.g. "First Presbyterian" / "Church of Springfield").
  // Set line2 to an empty string for a single-line wordmark.
  wordmark: {
    line1: "First Church",
    line2: "of Springfield",
  },

  // NOTE: contact details (email, pastoral email, phone, address, office hours)
  // and social profile URLs intentionally do NOT live here. They live ONLY in
  // Sanity siteSettings and resolve through src/lib/siteSettings.ts
  // (resolveSiteSettings). A second hardcoded copy is exactly what lets an
  // empty or changed Sanity field get silently masked on the live site.

  // Brand colors are declared in src/styles/globals.css (@theme block).
  // Mirrored here for scripts that need them outside CSS (OG generator,
  // structured data). Keep the two in sync when you reskin.
  brandColors: {
    primary: "#8A6A43",       // Bronze
    primaryDark: "#6B4F2E",   // Bronze Dark
    accent: "#36302A",        // Espresso Ink
    accentDark: "#241F1A",    // Espresso Dark
    secondary: "#B9A590",     // Clay
    tertiary: "#A89A86",      // Warm Stone
    bg: "#ECE4DA",            // Paper (warm cream)
    bgSoft: "#F6F3EC",        // Paper Soft
    border: "#DED6C8",        // Warm Border
    chapel: "#1E423B",        // Chapel green — utility bar, footer, CTA
    chapelDeep: "#16322C",    // Chapel green, deepest base
    gold: "#A07D45",          // Liturgical gold accent
  },

  // Static asset paths under public/
  assets: {
    ogDefault: "/og-default.png",
    favicon: "/favicon.png",
  },

  // Public repo URL (used in footer credit if shown)
  repo: "",
} as const;

export type Site = typeof site;
