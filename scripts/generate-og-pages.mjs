// Foundation, edit with care
// Generates one OG PNG per page at public/og/<route-slug>.png, matching the
// per-route convention in BaseLayout (the pathname with slashes turned into
// dashes; falls back to og-default.png when a route has no matching file).
//
// Covers the core route singletons, plus one cover image per course (Term Issue
// PR 4, the COLLECTIONS block at the bottom). When your project adds more
// dynamic collections (blog posts, case studies, etc.) extend COLLECTIONS with
// the matching Sanity _type, prefix, and field names.
//
// Run via `npm run og:pages` after editing seoTitle in Sanity or after adding a
// page. Output PNGs are committed to git so Cloudflare does not need Sanity
// access at build time. BaseLayout picks the right PNG per pathname; anything
// without a file gracefully falls back to og-default.png.

import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';
import { renderOg, renderCourseOg } from './lib/render-og.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ---- Read env (.env or process.env) -------------------------------------

function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(resolve(root, '.env'), 'utf-8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    /* .env optional */
  }
  return env;
}

const env = loadEnv();
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
// This dataset filters anonymous reads down to the page singletons only; a read
// token is needed to see the collections (projects, journal entries, guides),
// exactly as src/lib/sanity.ts does at build time. Falls back to the write
// token, which can also read. Without any token, only the singletons render.
const readToken = env.SANITY_API_READ_TOKEN || env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error('PUBLIC_SANITY_PROJECT_ID not set. Skipping page OG generation.');
  process.exit(0);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Token reads disable the CDN (Sanity rejects token + useCdn:true).
  useCdn: !readToken,
  perspective: 'published',
  ...(readToken ? { token: readToken } : {}),
});

const outDir = resolve(root, 'public/og');

// Business name for the OG wordmark. Reads SITE_NAME from env first so CI can
// override without touching source; falls back to the value in src/data/site.ts
// (hard-coded here to avoid a TypeScript import from a plain .mjs script).
// Update this default when you replace the starter identity in src/data/site.ts.
const WORDMARK = env.SITE_NAME ?? 'The Presbyterian Academy';

let count = 0;
async function render(slug, tagline) {
  try {
    await renderOg({ wordmark: WORDMARK, tagline, outPath: resolve(outDir, `${slug}.png`) });
    count += 1;
    const t = String(tagline);
    console.log(`  ${slug}.png — ${t.slice(0, 60)}${t.length > 60 ? '…' : ''}`);
  } catch (e) {
    // Never fail the build. Sharp's text rendering needs Pango on the host; if
    // it is unavailable in CI, the committed PNG for this route ships instead.
    console.warn(`  (skipped ${slug}.png — ${e?.message ?? e})`);
  }
}

// ---- Page singletons → /og/<slug>.png -----------------------------------
// `slug` matches the route (slashes already dash-free here). `defaultTitle` is
// the fallback when Sanity's seoTitle / heroHeadline are both empty.
// These are the core routes every starter project ships with. Add rows for any
// additional page singletons you define in your Sanity schema.
const SINGLETONS = [
  {
    type: 'homePage',
    slug: 'home',
    defaultTitle: 'Theological depth, taught for ordinary believers.',
  },
  { type: 'coursesPage', slug: 'courses', defaultTitle: 'Courses' },
  { type: 'facultyPage', slug: 'faculty', defaultTitle: 'Taught by ministers and scholars' },
  { type: 'aboutPage', slug: 'about', defaultTitle: 'Reformed formation, for the whole church' },
  { type: 'pricingPage', slug: 'pricing', defaultTitle: 'Pricing and scholarships' },
  { type: 'getStartedPage', slug: 'get-started', defaultTitle: 'Tell us what you want to learn' },
  { type: 'forYouPage', slug: 'for-you', defaultTitle: 'Formation for where you are' },
  { type: 'resourcesPage', slug: 'resources', defaultTitle: 'Teaching and formation essays' },
  { type: 'eventsPage', slug: 'events', defaultTitle: 'Come and see what we do' },
  { type: 'faqPage', slug: 'faq', defaultTitle: 'Questions, answered' },
  { type: 'contactPage', slug: 'contact', defaultTitle: 'Get in touch' },
  { type: 'privacyPage', slug: 'privacy', defaultTitle: 'Privacy policy' },
];

for (const page of SINGLETONS) {
  const doc = await client
    .fetch(`*[_type == $type][0]{ seoTitle, heroHeadline }`, { type: page.type })
    .catch(() => null);
  // The OG card renders the WORDMARK separately, so the tagline must be the clean
  // page headline -- NOT seoTitle, which is the <title>-tag value and carries the
  // " · {brand}" suffix (using it would print the brand name twice on the card).
  const tagline = doc?.heroHeadline || doc?.seoTitle || page.defaultTitle;
  await render(page.slug, tagline);
}

// ---- Dynamic collections → /og/<prefix>-<slug>.png ----------------------
// Mirrors BaseLayout: /journal/my-post → journal-my-post.png, etc. Add an entry
// here for each dynamic collection your project defines, with `pick` returning
// the card's tagline. A collection can instead supply its own `render(d)`.
//
// COURSES (Term Issue PR 4, 2026-10-13) are the first, and they draw their own
// card: the course's cover (renderCourseOg), at /og/course-<slug>.png, which
// src/pages/courses/[slug].astro passes as the page's share image unless the
// course has its own social image (seoImage).
//
// The cover's colour and ornament come from src/lib/cover.ts (the editor's
// choice, else the same fallback the site uses) and the hex values from the
// --color-cover-* tokens in src/styles/globals.css, so the share image is the
// site's cover, not a copy of it. cover.ts is TypeScript: Node 22.18+ and 24
// import it directly. An older Node cannot, and then the course images are
// skipped with a warning (the committed PNGs ship), never a failed build.

const css = readFileSync(resolve(root, 'src/styles/globals.css'), 'utf-8');
const coverTokens = {};
for (const m of css.matchAll(/--color-cover-([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
  coverTokens[m[1]] = m[2];
}
let coverLib = null;
try {
  coverLib = await import(pathToFileURL(resolve(root, 'src/lib/cover.ts')).href);
} catch (e) {
  console.warn(`  (course covers skipped: cannot load src/lib/cover.ts here: ${e?.message ?? e})`);
}

async function renderCourse(d) {
  if (!coverLib) return;
  const { color, ornament } = coverLib.resolveCover(d);
  const bg = coverTokens[color];
  const fg = coverTokens[`${color}-fg`];
  if (!bg || !fg) {
    console.warn(`  (skipped course-${d.slug}.png: no --color-cover-${color} tokens)`);
    return;
  }
  const teacher = d.instructors?.[0];
  const area = d.teachingAreas?.[0]?.title ?? '';
  const code = (d.courseCode ?? '').trim();
  const name = `course-${d.slug}`;
  try {
    await renderCourseOg({
      outPath: resolve(outDir, `${name}.png`),
      wordmark: WORDMARK,
      title: d.title,
      catalog: [code, area, d.nextTerm].filter(Boolean).join(' · '),
      question: (d.centralQuestion ?? '').trim(),
      cover: {
        bg,
        fg,
        ornament,
        code,
        area,
        teacher: teacher
          ? `${teacher.honorific ? `${teacher.honorific} ` : ''}${teacher.name}`
          : '',
      },
      paper: {
        bg: coverTokens['paper'] ?? '#f8f6ef',
        ink: coverTokens['paper-ink'] ?? '#1f231f',
        muted: coverTokens['paper-muted'] ?? '#51564f',
        accent: coverTokens['green'] ?? '#33503f',
      },
    });
    count += 1;
    console.log(`  ${name}.png — cover: ${color} / ${ornament}`);
  } catch (e) {
    console.warn(`  (skipped ${name}.png — ${e?.message ?? e})`);
  }
}

const COLLECTIONS = [
  {
    prefix: 'course',
    // The fields resolveCover and the card need, plus the next cohort's term
    // (the soonest offering whose term starts today or later, as on the site).
    query: `*[_type == "course" && archived != true && defined(slug.current)]{
      "slug": slug.current, title, courseCode, coverColor, coverOrnament, centralQuestion,
      "teachingAreas": teachingAreas[]->{ title, "slug": slug.current },
      "instructors": instructors[]->{ name, honorific },
      "nextTerm": (offerings[defined(term->startDate) && term->startDate >= $today]
        | order(term->startDate asc))[0].term->title
    }`,
    params: { today: new Date().toISOString().slice(0, 10) },
    render: renderCourse,
  },
];

for (const col of COLLECTIONS) {
  const docs = await client.fetch(col.query, col.params ?? {}).catch(() => []);
  for (const d of docs) {
    if (!d.slug) continue;
    if (col.render) {
      if (d.title) await col.render(d);
      continue;
    }
    const tagline = col.pick?.(d);
    if (tagline) await render(`${col.prefix}-${d.slug}`, tagline);
  }
}

console.log(`\nDone. ${count} OG images written to ${outDir}`);
