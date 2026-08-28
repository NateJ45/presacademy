// =============================================================================
// studio-thumbs.mjs — the picture for each section in the Studio "+ Add" menu
// =============================================================================
// The page builder's insert menu has a GRID view (see FLEXIBLE_SECTIONS_OPTIONS
// in src/sanity/schemaTypes/blocks.ts). The grid asks for one image per section
// type at /studio-thumbs/<sectionType>.jpg. This script makes those images from
// the REAL built site, so an editor picks a section by look.
//
// Adapted from the WCP site's script of the same name. ONE THING IS DIFFERENT,
// and it is the whole difference: WCP's renderer stamps `data-stype="<type>"`
// on every section, so its script finds a section by CSS selector. This repo's
// renderer stamps nothing (src/components/Sections.astro adds a `data-sanity`
// wrapper in PREVIEW only, and scripts/page-parity.mjs holds the live HTML to
// byte-identical, so adding an attribute for a screenshotting script is not on
// the table). So this script locates sections by POSITION instead:
//
//   1. It asks Sanity, over plain HTTP, for each page's section array in order
//      (`flexibleSections` on the singletons, `sections` on custom pages) —
//      the same published content the build read.
//   2. It reads the built page from dist/client. Every top-level child of
//      <main> is a <section>, laid out as: the hero, then the section array in
//      order, then any pinned code region, then the closing CTA. So section i
//      of the array is the (offset + i)th <section>, with offset = 1 for a page
//      that renders a hero.
//   3. That offset is VERIFIED rather than assumed. Each section carries some
//      text of its own; the script tries offsets 0, 1 and 2 and keeps the one
//      whose elements actually contain that text. A page it cannot anchor is
//      skipped with a warning rather than screenshotted wrongly.
//   4. dist/client is served from a small static server IN THIS PROCESS (no
//      child process, so nothing can stay alive and lock dist/ afterwards),
//      Playwright measures the element and captures it, and sharp scales the
//      shot to a 600px-wide JPEG at quality 80.
//   5. A section type with no instance anywhere on the site gets a plain
//      branded placeholder, so the grid never shows a broken image.
//
// Run it after you add a section type, or when the site design changes:
//   npm run build && npm run studio-thumbs
//
// It needs the Sanity project id (and, for a private dataset, a read token) in
// .env — the same values the build uses. With no project id it still runs and
// writes a placeholder for every type, which is a usable grid, just a dull one.
// =============================================================================
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rm, stat } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { loadEnv } from './lib/loadEnv.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist', 'client');
const BLOCKS = join(ROOT, 'src', 'sanity', 'schemaTypes', 'blocks.ts');
const OUT_DIR = join(ROOT, 'public', 'studio-thumbs');

const env = loadEnv(ROOT);
const API_VERSION = '2025-02-19';
const PORT = 4398;
const VIEWPORT = { width: 1280, height: 900 };
const THUMB_WIDTH = 600;
const JPEG_QUALITY = 80;
// A section band can be very tall (a long FAQ, a photo wall). The top of the
// band is what identifies it, so the capture stops after this height.
const MAX_CAPTURE_HEIGHT = 760;

// Brand colors for the placeholder card (design tokens: chapel + cream).
const CHAPEL = '#1f3d2b';
const CREAM = '#f7f3ea';

// Singleton document type -> the live path its page is built at. The same table
// pathForDoc() holds in src/sanity/urls.ts; kept here as data because this file
// is .mjs and that one is TypeScript. Add a row when a page singleton is added.
const SINGLETON_PATHS = {
  homePage: '/',
  aboutPage: '/about',
  faqPage: '/faq',
  contactPage: '/contact',
  privacyPage: '/privacy',
  accessibilityPage: '/accessibility',
  eventsPage: '/events',
  coursesPage: '/courses',
  facultyPage: '/faculty',
  pricingPage: '/pricing',
  getStartedPage: '/get-started',
  forYouPage: '/for-you',
  resourcesPage: '/resources',
};

// ── The section palette, read out of the schema source ──────────────────────
// blocks.ts is TypeScript, so this reads the names out of it rather than
// importing it. FLEXIBLE_SECTION_MEMBERS is the authoritative palette (it is
// what every page-builder array offers); the titles come from each type's own
// defineType block, and a type with no title found falls back to its name.
async function sectionTypes() {
  const src = await readFile(BLOCKS, 'utf8');

  const members = src.match(/export const FLEXIBLE_SECTION_MEMBERS = \[([\s\S]*?)\n\];/);
  if (!members) throw new Error('Could not find FLEXIBLE_SECTION_MEMBERS in blocks.ts');
  const names = [...members[1].matchAll(/type:\s*'([A-Za-z]+)'/g)].map((m) => m[1]);

  const titles = new Map();
  for (const m of src.matchAll(/name:\s*'([A-Za-z]+)',\s*\r?\n\s*title:\s*'([^']+)'/g)) {
    if (!titles.has(m[1])) titles.set(m[1], m[2]);
  }

  return names.map((name) => ({ name, title: titles.get(name) ?? name }));
}

// ── What each built page shows, in order, straight from Sanity ──────────────
async function fetchPageSections() {
  const projectId =
    env.PUBLIC_SANITY_PROJECT_ID || env.SANITY_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID;
  const dataset = env.PUBLIC_SANITY_DATASET || env.SANITY_DATASET || 'production';
  if (!projectId) {
    console.warn('studio-thumbs: no Sanity project id in .env — every type gets a placeholder.');
    return [];
  }

  const token = env.SANITY_API_READ_TOKEN || env.SANITY_AUTH_TOKEN;
  const query = `{
    "singletons": *[_type in $types]{ _type, flexibleSections },
    "pages": *[_type == "page" && archived != true && defined(slug.current)]{
      "slug": slug.current, sections
    }
  }`;
  const url = `https://${projectId}.api.sanity.io/v${API_VERSION}/data/query/${dataset}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, params: { types: Object.keys(SINGLETON_PATHS) } }),
  });
  if (!res.ok) {
    console.warn(`studio-thumbs: Sanity read failed (${res.status}). Placeholders only.`);
    return [];
  }
  const { result } = await res.json();

  const entries = [];
  for (const doc of result?.singletons ?? []) {
    const path = SINGLETON_PATHS[doc._type];
    const sections = Array.isArray(doc.flexibleSections) ? doc.flexibleSections : [];
    if (path && sections.length > 0) entries.push({ path, sections });
  }
  for (const doc of result?.pages ?? []) {
    const sections = Array.isArray(doc.sections) ? doc.sections : [];
    if (sections.length > 0) entries.push({ path: `/${doc.slug}`, sections });
  }
  // Deterministic: the same page wins on every run.
  entries.sort((a, b) => a.path.localeCompare(b.path));
  return entries;
}

/**
 * A short run of real words from a section, used to prove that the element at a
 * given DOM position really is that section. Two kinds of field are skipped:
 * settings (knob values, for the same reason src/lib/page-checks.ts skips them)
 * and INVISIBLE copy. `landmarkLabel` and friends are written into an
 * aria-label attribute, so they are real words that never appear in the
 * element's text, and a probe made of them would never match anything.
 */
function probeText(value) {
  const skip = new Set([
    '_type',
    '_key',
    '_ref',
    '_id',
    'tone',
    'variant',
    'layout',
    'padding',
    'surface',
    'align',
    'imageSide',
    'mediaSide',
    'source',
    'columns',
    'mediaType',
    // Written to attributes, not to the page.
    'landmarkLabel',
    'headingId',
    'ariaLabel',
    'alt',
  ]);
  const usable = (raw) => {
    const text = String(raw).trim().replace(/\s+/g, ' ');
    // Long enough to be a phrase, short enough to survive line wrapping.
    if (text.length < 8) return null;
    if (text.startsWith('/') || text.startsWith('http')) return null;
    return text.slice(0, 40);
  };

  const queue = [value];
  while (queue.length > 0) {
    const node = queue.shift();
    // A bare string reached through an array of strings (a category order, a
    // list of bullet lines) is as good a probe as a named field.
    if (typeof node === 'string') {
      const text = usable(node);
      if (text) return text;
      continue;
    }
    if (Array.isArray(node)) {
      queue.push(...node);
      continue;
    }
    if (!node || typeof node !== 'object') continue;
    for (const [key, child] of Object.entries(node)) {
      if (skip.has(key) || typeof child !== 'string') continue;
      const text = usable(child);
      if (text) return text;
    }
    for (const [key, child] of Object.entries(node)) {
      if (!skip.has(key) && (Array.isArray(child) || (child && typeof child === 'object'))) {
        queue.push(child);
      }
    }
  }
  return '';
}

// ── A small static server for dist/client ───────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
};

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let file = join(DIST, path);
      if (path.endsWith('/')) file = join(file, 'index.html');
      else {
        const info = await stat(file).catch(() => null);
        if (info?.isDirectory()) file = join(file, 'index.html');
      }
      const body = await readFile(file);
      res.writeHead(200, {
        'content-type': MIME[extname(file)] ?? 'application/octet-stream',
        'cache-control': 'no-store',
      });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    }
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

// ── Page preparation (mirrors settle() in tests/helpers.ts) ─────────────────
async function settle(page) {
  await page.evaluate(() =>
    Promise.race([
      document.fonts.ready.then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(true), 5000)),
    ]),
  );
  await page.addStyleTag({
    content: '*,*::before,*::after{transition:none!important;animation:none!important}',
  });
  await page.evaluate(() =>
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')),
  );
}

/** The visible text of every top-level <section> under <main>, in order. */
function sectionTexts(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    return [...main.children].map((el) =>
      (el.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase(),
    );
  });
}

/**
 * How many elements sit above the section array on this page (the hero, in
 * practice). Chosen by evidence, not assumption: the offset whose elements
 * contain the most section probe strings wins, and a tie goes to the smaller
 * offset. Returns null when nothing matches, which means the page layout has
 * moved and the caller should skip it rather than capture the wrong band.
 */
function resolveOffset(texts, sections) {
  const probes = sections.map((s) => probeText(s).toLowerCase());
  const scored = [0, 1, 2].map((offset) => {
    let hits = 0;
    let checked = 0;
    probes.forEach((probe, i) => {
      if (!probe) return;
      const text = texts[offset + i];
      if (text === undefined) return;
      checked += 1;
      if (text.includes(probe)) hits += 1;
    });
    return { offset, hits, checked };
  });
  const best = scored.reduce((a, b) => (b.hits > a.hits ? b : a));
  // Nothing anchored at all: either every section is wordless (an auto list, a
  // gallery) or the layout changed. Fall back to 1 only when there is room for
  // the whole array, which is the layout this site has had since the builder
  // conversion.
  if (best.hits === 0) {
    return scored.every((s) => s.checked === 0) && texts.length > sections.length ? 1 : null;
  }
  return best.offset;
}

/** The page box of one top-level section element under <main>. */
function sectionBox(page, index) {
  return page.evaluate((i) => {
    const main = document.querySelector('main');
    const el = main?.children[i];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: r.left + window.scrollX,
      y: r.top + window.scrollY,
      width: r.width,
      height: r.height,
    };
  }, index);
}

async function toThumb(buffer, file) {
  const out = await sharp(buffer)
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  await writeFile(file, out);
  return out.length;
}

/** The fallback picture for a section type the live site does not use yet. */
async function placeholder(page, type, file) {
  const safe = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<!doctype html><html><body style="margin:0">
    <div style="width:1200px;height:630px;background:${CREAM};display:flex;
                align-items:center;justify-content:center;text-align:center;
                font-family:Georgia,'Times New Roman',serif;box-sizing:border-box;padding:64px">
      <div>
        <div style="font-size:64px;font-weight:700;color:${CHAPEL};line-height:1.15">
          ${safe(type.title)}
        </div>
        <div style="margin-top:24px;font-size:30px;color:${CHAPEL};opacity:.7">
          No example on the site yet
        </div>
      </div>
    </div>
  </body></html>`);
  const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await page.setViewportSize(VIEWPORT);
  return toThumb(shot, file);
}

// ── Main ────────────────────────────────────────────────────────────────────
const distExists = await stat(join(DIST, 'index.html')).catch(() => null);
if (!distExists) {
  console.error('dist/client is missing. Run `npm run build` first.');
  process.exit(1);
}

const types = await sectionTypes();
const entries = await fetchPageSections();

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const server = await startServer();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });

const captured = [];
const placeheld = [];
const skippedPages = [];
let bytes = 0;

try {
  // Pass one: walk each page once and capture the first instance of every type
  // it can anchor.
  const done = new Set();
  for (const entry of entries) {
    const wanted = entry.sections.some((s) => s?._type && !done.has(s._type));
    if (!wanted) continue;

    await page.goto(`http://127.0.0.1:${PORT}${entry.path}`, { waitUntil: 'load' });
    await settle(page);

    const texts = await sectionTexts(page);
    const offset = resolveOffset(texts, entry.sections);
    if (offset === null) {
      skippedPages.push(entry.path);
      console.log(`  (skipped ${entry.path}: could not line its sections up with the page)`);
      continue;
    }

    for (let i = 0; i < entry.sections.length; i += 1) {
      const type = entry.sections[i]?._type;
      if (!type || done.has(type)) continue;
      const box = await sectionBox(page, offset + i);
      if (!box || box.width <= 0 || box.height <= 0) continue;
      const shot = await page.screenshot({
        fullPage: true,
        clip: { ...box, height: Math.min(box.height, MAX_CAPTURE_HEIGHT) },
      });
      bytes += await toThumb(shot, join(OUT_DIR, `${type}.jpg`));
      done.add(type);
      captured.push(type);
      console.log(`  ${type} <- ${entry.path}`);
    }
  }

  // Pass two: a branded card for every type the site has no example of.
  for (const type of types) {
    if (done.has(type.name)) continue;
    bytes += await placeholder(page, type, join(OUT_DIR, `${type.name}.jpg`));
    placeheld.push(type.name);
    console.log(`  ${type.name} <- placeholder`);
  }
} finally {
  await browser.close();
  server.close();
}

console.log(
  `\nstudio-thumbs: ${captured.length} from the site, ${placeheld.length} placeholders, ` +
    `${(bytes / 1024).toFixed(0)} KB total -> public/studio-thumbs/`,
);
if (placeheld.length > 0) console.log(`placeholders: ${placeheld.sort().join(', ')}`);
if (skippedPages.length > 0) console.log(`pages skipped: ${skippedPages.join(', ')}`);
