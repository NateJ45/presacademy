#!/usr/bin/env node
/**
 * page-parity.mjs - rendered-HTML parity harness for the page-builder conversion.
 *
 * WHY THIS EXISTS
 * The page-builder conversion (docs/superpowers/plans/2026-08-26-page-builder-conversion.md)
 * moves markup out of 13 bespoke singleton pages and into Sanity-driven section
 * types. The whole promise is "same pixels". This script is the machine that
 * holds us to it: capture each page's rendered HTML BEFORE a page converts,
 * then diff the post-conversion render against that snapshot. Zero diff, or the
 * conversion is not done.
 *
 * NEITHER MODE RUNS THE BUILD. Both read an existing dist/client. The caller
 * builds. That keeps the script fast to re-run, keeps build noise out of the
 * diff output, and means "capture" and "compare" can be pointed at the exact
 * same build artifacts when you are debugging the normalizer itself.
 *
 *   # from PowerShell, in the repo root
 *   npm run build                       # you build
 *   node scripts/page-parity.mjs capture    # snapshot all 13 pages
 *   ...convert a page...
 *   npm run build                       # you build again
 *   node scripts/page-parity.mjs compare    # PASS/DIFF per page, exit 1 on any diff
 *   node scripts/page-parity.mjs compare privacy   # limit to one page
 *
 * If dist/client is missing, both modes fail with instructions. If its build is
 * older than an hour, they print a staleness warning and keep going (you may
 * genuinely be re-comparing an old build on purpose).
 *
 * WHAT THE NORMALIZER STRIPS, AND WHY
 * The goal is a snapshot that is stable across two identical rebuilds but still
 * catches real markup drift. Everything not listed here is left byte-faithful.
 *
 *   1. Content hashes in /_astro/ asset references.
 *      /_astro/BaseLayout.BQUbAod2.css        -> /_astro/BaseLayout.HASH.css
 *      /_astro/acad-library-room.DV6BG3W2_12pCEf.webp
 *                                             -> /_astro/acad-library-room.HASH.webp
 *      Rollup/Vite rehash a bundle whenever its content changes, and the image
 *      pipeline appends a second per-variant hash. Neither is markup drift, and
 *      both churn constantly during a conversion (a moved component changes the
 *      CSS bundle's hash without changing one rendered pixel). Only the LAST
 *      dot-segment before the extension is treated as the hash, so names that
 *      contain dots of their own survive intact
 *      (BaseLayout.astro_astro_type_script_index_0_lang.HASH.js).
 *   2. Astro's build-id / scoped-style hash ATTRIBUTE VALUES, where they carry a
 *      generated hash: data-astro-cid-xxxxxx and data-astro-transition-scope.
 *      A scoped-style id is derived from the component's file path, so moving
 *      markup from about.astro into a section component legitimately changes it
 *      while the rendered result is identical. The attribute NAME is kept (its
 *      presence or absence is real drift), the hash is replaced with CID.
 *   3. Whitespace runs BETWEEN tags (>   < becomes ><) and trailing whitespace
 *      on every line, plus CRLF -> LF. Astro's indentation shifts when markup
 *      is nested one level deeper inside a section wrapper; the browser does not
 *      care and neither should the diff. Whitespace INSIDE a text node is left
 *      alone, because that is content.
 *
 * Deliberately NOT stripped: data-sanity attributes (they never appear in the
 * static build, only in the SSR preview build, which this harness does not
 * read), inline styles, class lists, ids, aria-*, JSON-LD payloads, and every
 * scrap of text. Those are exactly what the conversion must not disturb.
 *
 * Snapshots live in scripts/.parity/*.html and ARE COMMITTED. They are the
 * pre-conversion baseline; git history is the record of when one legitimately
 * changed. Re-capture only when you intend to move the baseline, and say so in
 * the commit message.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist', 'client');
const SNAP_DIR = join(ROOT, 'scripts', '.parity');
const STALE_MS = 60 * 60 * 1000; // 1 hour

/**
 * The 13 singleton pages the conversion touches, in plan order.
 * name -> the file in dist/client that holds that route's rendered HTML.
 */
const PAGES = [
  ['home', 'index.html'],
  ['about', 'about/index.html'],
  ['courses', 'courses/index.html'],
  ['faculty', 'faculty/index.html'],
  ['events', 'events/index.html'],
  ['pricing', 'pricing/index.html'],
  ['get-started', 'get-started/index.html'],
  ['for-you', 'for-you/index.html'],
  ['resources', 'resources/index.html'],
  ['faq', 'faq/index.html'],
  ['contact', 'contact/index.html'],
  ['privacy', 'privacy/index.html'],
  ['accessibility', 'accessibility/index.html'],
];

// --------------------------------------------------------------------------
// Normalizer
// --------------------------------------------------------------------------

/** Rule 1: hashed asset references under /_astro/. */
function stripAssetHashes(html) {
  // Match a full /_astro/ path, then rewrite only its final hash segment.
  return html.replace(/\/_astro\/([A-Za-z0-9._@-]+)\.([A-Za-z0-9_-]{6,})\.([a-z0-9]+)\b/g, '/_astro/$1.HASH.$3');
}

/** Rule 2: generated hashes inside astro's own attribute names/values. */
function stripAstroCids(html) {
  return html
    // class="... astro-cid-ge4ks5ma ..." and the matching data-astro-cid-* marker
    .replace(/data-astro-cid-[a-z0-9]+/g, 'data-astro-cid-CID')
    .replace(/astro-cid-[a-z0-9]{6,}/g, 'astro-cid-CID')
    // View-transition scopes are generated per build from component identity.
    .replace(/data-astro-transition-scope="[^"]*"/g, 'data-astro-transition-scope="SCOPE"');
}

/** Rule 3: whitespace that only reflects source indentation. */
function collapseWhitespace(html) {
  return html
    .replace(/\r\n/g, '\n')
    .replace(/>[ \t\r\n]+</g, '><')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export function normalize(html) {
  return collapseWhitespace(stripAstroCids(stripAssetHashes(html)));
}

// --------------------------------------------------------------------------
// dist/client access
// --------------------------------------------------------------------------

function requireDist() {
  if (!existsSync(DIST)) {
    fail(
      'dist/client not found.\n' +
        'This script never builds. Run the build first, then re-run:\n' +
        '  npm run build\n' +
        '  node scripts/page-parity.mjs ' + (process.argv[2] ?? 'capture'),
    );
  }
  const marker = join(DIST, 'index.html');
  if (!existsSync(marker)) {
    fail('dist/client exists but has no index.html. The build did not finish. Re-run npm run build.');
  }
  const age = Date.now() - statSync(marker).mtimeMs;
  if (age > STALE_MS) {
    const hours = (age / 3600000).toFixed(1);
    console.warn(`WARNING: dist/client was built ${hours}h ago. It may not reflect your working tree.`);
  }
}

function readPage(file) {
  const path = join(DIST, file);
  if (!existsSync(path)) return null;
  return normalize(readFileSync(path, 'utf8'));
}

// --------------------------------------------------------------------------
// Diffing
// --------------------------------------------------------------------------

/**
 * Split normalized HTML into pseudo-lines at tag boundaries.
 * The snapshot on disk stays one long stream per source line (byte-faithful);
 * this split exists only so a diff points at a tag rather than at "line 12".
 */
function toDiffLines(text) {
  return text
    .split('\n')
    .flatMap((line) => line.split(/(?<=>)(?=<)/))
    .filter((l) => l !== '');
}

/** Minimal LCS-backed unified diff, trimmed to the changed region. */
function unifiedDiff(oldText, newText, maxLines) {
  const a = toDiffLines(oldText);
  const b = toDiffLines(newText);

  // Trim common prefix/suffix so the DP table only covers the changed middle.
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);

  const CAP = 3000;
  if (midA.length > CAP || midB.length > CAP) {
    // Too big to LCS cheaply. Report the raw changed window instead.
    const out = [`@@ changed region is large (${midA.length} old / ${midB.length} new lines), showing head @@`];
    for (const line of midA.slice(0, Math.floor(maxLines / 2))) out.push('- ' + line);
    for (const line of midB.slice(0, Math.floor(maxLines / 2))) out.push('+ ' + line);
    return out;
  }

  // Classic LCS length table.
  const n = midA.length;
  const m = midB.length;
  const lcs = new Int32Array((n + 1) * (m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i * (m + 1) + j] =
        midA[i] === midB[j]
          ? lcs[(i + 1) * (m + 1) + (j + 1)] + 1
          : Math.max(lcs[(i + 1) * (m + 1) + j], lcs[i * (m + 1) + (j + 1)]);
    }
  }

  const out = [`@@ first change at tag #${start + 1} @@`];
  let i = 0;
  let j = 0;
  while (i < n && j < m && out.length <= maxLines) {
    if (midA[i] === midB[j]) {
      out.push('  ' + midA[i]);
      i++;
      j++;
    } else if (lcs[(i + 1) * (m + 1) + j] >= lcs[i * (m + 1) + (j + 1)]) {
      out.push('- ' + midA[i]);
      i++;
    } else {
      out.push('+ ' + midB[j]);
      j++;
    }
  }
  while (i < n && out.length <= maxLines) out.push('- ' + midA[i++]);
  while (j < m && out.length <= maxLines) out.push('+ ' + midB[j++]);
  if (i < n || j < m) out.push(`... ${n - i + (m - j)} more changed lines suppressed ...`);
  return out;
}

/** Shorten a diff line so one runaway tag cannot flood the terminal. */
function clip(line, width = 200) {
  return line.length > width ? line.slice(0, width) + ' ...' : line;
}

// --------------------------------------------------------------------------
// Modes
// --------------------------------------------------------------------------

function capture(only) {
  requireDist();
  mkdirSync(SNAP_DIR, { recursive: true });
  let written = 0;
  let missing = 0;
  for (const [name, file] of PAGES) {
    if (only && only !== name) continue;
    const html = readPage(file);
    if (html === null) {
      console.log(`  MISS  ${name.padEnd(13)} dist/client/${file} not found`);
      missing++;
      continue;
    }
    const out = join(SNAP_DIR, `${name}.html`);
    writeFileSync(out, html + '\n', 'utf8');
    const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
    console.log(`  SAVE  ${name.padEnd(13)} ${kb.padStart(7)} KB  -> scripts/.parity/${name}.html`);
    written++;
  }
  console.log(`\n${written} snapshot(s) written${missing ? `, ${missing} page(s) missing from dist` : ''}.`);
  console.log('Commit scripts/.parity/*.html: they are the pre-conversion baseline.');
  if (missing) process.exit(1);
}

function compare(only) {
  requireDist();
  if (!existsSync(SNAP_DIR) || readdirSync(SNAP_DIR).length === 0) {
    fail('No snapshots in scripts/.parity/. Run: node scripts/page-parity.mjs capture');
  }
  let pass = 0;
  let diff = 0;
  const diffs = [];
  for (const [name, file] of PAGES) {
    if (only && only !== name) continue;
    const snapPath = join(SNAP_DIR, `${name}.html`);
    if (!existsSync(snapPath)) {
      console.log(`  SKIP  ${name.padEnd(13)} no baseline snapshot`);
      continue;
    }
    const baseline = readFileSync(snapPath, 'utf8').replace(/\n$/, '');
    const current = readPage(file);
    if (current === null) {
      console.log(`  DIFF  ${name.padEnd(13)} dist/client/${file} not found (page gone?)`);
      diff++;
      continue;
    }
    if (current === baseline) {
      console.log(`  PASS  ${name}`);
      pass++;
    } else {
      console.log(`  DIFF  ${name}`);
      diff++;
      diffs.push([name, unifiedDiff(baseline, current, 40)]);
    }
  }

  for (const [name, lines] of diffs) {
    console.log(`\n--- baseline/${name}\n+++ current/${name}`);
    for (const line of lines) console.log(clip(line));
  }

  console.log(`\n${pass}/${pass + diff} PASS`);
  if (diff) {
    console.log('Parity broken. Either the conversion changed rendered markup, or the');
    console.log('normalizer needs a new rule for a genuinely build-varying value.');
    process.exit(1);
  }
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

const mode = process.argv[2];
const only = process.argv[3];
if (only && !PAGES.some(([n]) => n === only)) {
  fail(`Unknown page "${only}". Known: ${PAGES.map(([n]) => n).join(', ')}`);
}
if (mode === 'capture') capture(only);
else if (mode === 'compare') compare(only);
else {
  console.log('Usage (build first, this script never builds):');
  console.log('  npm run build');
  console.log('  node scripts/page-parity.mjs capture [page]');
  console.log('  node scripts/page-parity.mjs compare [page]');
  console.log(`\nPages: ${PAGES.map(([n]) => n).join(', ')}`);
  process.exit(mode ? 1 : 0);
}
