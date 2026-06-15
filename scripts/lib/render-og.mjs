// Foundation, edit with care
// Shared OG renderer. Used by generate-og-default.mjs (single PNG) and
// generate-og-pages.mjs (one PNG per page singleton). Uses sharp's native
// text rendering (Pango) so we don't depend on opentype.js or satori.
//
// Pango falls back to a system serif if Fraunces isn't installed on the build
// machine. Close enough for a social-preview thumbnail; the brand wordmark +
// colors carry the recognition.

import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import sharp from 'sharp';

const DEFAULTS = {
  width: 1200,
  height: 630,
  bg: '#FAF8F4',          // Near-white warm paper (Direction A)
  primary: '#33503F',     // Geneva Green (accent rule)
  primaryDark: '#1F1B18', // Soft near-black (wordmark)
  accent: '#1F1B18',      // Soft near-black (tagline)
  taupe: '#B7A99B',       // Cloister Stone (border)
  muted: '#615D5A',       // "Academy" subline (foreground at ~70% over warm paper)
  fontDisplay: 'Fraunces, Georgia, Cambria, Times New Roman, serif',
};

async function renderText(text, fontSize, color, font, weight = 'normal') {
  const escaped = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const markup = `<span foreground="${color}" font_desc="${font} ${weight} ${fontSize}px">${escaped}</span>`;
  const { data, info } = await sharp({
    text: { text: markup, rgba: true, dpi: 72 },
  }).png().toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}

// Escape text for use inside Pango markup.
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Like renderText, but `innerMarkup` is RAW Pango markup (already escaped, and may
// carry per-span foreground colors) so one line can mix colors -- used for the
// wordmark's "The [Presbyterian]" green keyword emphasis.
async function renderRich(innerMarkup, fontSize, font, weight = '500') {
  const markup = `<span font_desc="${font} ${weight} ${fontSize}px">${innerMarkup}</span>`;
  const { data, info } = await sharp({
    text: { text: markup, rgba: true, dpi: 72 },
  }).png().toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}

// Wraps a string to roughly N characters per line by splitting on word boundaries.
// Used to break long page headlines into two lines without measuring widths.
function wrapToLines(text, maxCharsPerLine = 28) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';
  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (next.length <= maxCharsPerLine) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Render an OG image PNG.
 *
 * @param {object} opts
 * @param {string} opts.wordmark - top-line brand text (e.g., "Studio Starter")
 * @param {string|string[]} opts.tagline - subtitle. String gets wrapped to ~28 chars/line.
 * @param {string} opts.outPath - absolute path to write the PNG to
 * @param {Partial<typeof DEFAULTS>} [opts.theme] - color overrides
 */
export async function renderOg({ wordmark, tagline, outPath, theme = {} }) {
  const t = { ...DEFAULTS, ...theme };
  const lines = Array.isArray(tagline) ? tagline : wrapToLines(tagline, 28);
  const taglineLines = lines.slice(0, 3); // never more than 3 lines

  // Parse the flat wordmark into the header's logo structure: the last word drops
  // to a smaller, muted second line ("Academy"), and the last word of the first
  // line carries the green keyword emphasis ("Presbyterian"). Mirrors Header.astro.
  const words = String(wordmark).trim().split(/\s+/);
  let lead = '', key = words.join(' '), sub = '';
  if (words.length >= 3) { sub = words.pop(); key = words.pop(); lead = words.join(' '); }
  else if (words.length === 2) { key = words.pop(); lead = words.join(' '); }

  // Line 1: lead in ink + the keyword in green (the wordmark's signature device).
  const line1Markup =
    `${lead ? `<span foreground="${t.primaryDark}">${esc(lead)} </span>` : ''}` +
    `<span foreground="${t.primary}">${esc(key)}</span>`;
  const line1Img = await renderRich(line1Markup, 92, t.fontDisplay, '500');
  // Line 2: "Academy" -- smaller and muted, tucked left-aligned under line 1.
  const line2Img = sub ? await renderText(sub, 50, t.muted, t.fontDisplay, '500') : null;
  const taglineImgs = await Promise.all(
    taglineLines.map((line) => renderText(line, 32, t.accent, t.fontDisplay)),
  );

  // Vertically center the whole group (wordmark + green rule + tagline) so cards
  // with 1, 2, or 3 tagline lines stay balanced. Pango images carry ascent/descent
  // padding, so stacking uses fractions of the measured heights tuned for Fraunces.
  const line1Left = Math.round((t.width - line1Img.width) / 2);
  const line2Overlap = line2Img ? Math.round(line1Img.height * 0.14) : 0; // tuck Academy up
  const wordmarkH = line1Img.height + (line2Img ? line2Img.height - line2Overlap : 0);
  const gapWordToRule = 30;
  const gapRuleToTagline = 36;
  const taglineLineHeight = 44;
  const taglineH = taglineImgs.length * taglineLineHeight;
  const groupH = wordmarkH + gapWordToRule + 2 + gapRuleToTagline + taglineH;
  const top = Math.round((t.height - groupH) / 2);

  const composites = [{ input: line1Img.buffer, left: line1Left, top }];
  if (line2Img) {
    composites.push({
      input: line2Img.buffer,
      left: line1Left,
      top: top + line1Img.height - line2Overlap,
    });
  }
  const ruleTop = top + wordmarkH + gapWordToRule;
  const taglineTop = ruleTop + 2 + gapRuleToTagline;
  taglineImgs.forEach((img, i) => {
    composites.push({
      input: img.buffer,
      left: Math.round((t.width - img.width) / 2),
      top: taglineTop + i * taglineLineHeight,
    });
  });

  const baseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${t.width}" height="${t.height}" viewBox="0 0 ${t.width} ${t.height}">
    <rect width="${t.width}" height="${t.height}" fill="${t.bg}"/>
    <rect x="40" y="40" width="${t.width - 80}" height="${t.height - 80}" fill="none" stroke="${t.taupe}" stroke-width="2" opacity="0.5"/>
    <rect x="${(t.width - 120) / 2}" y="${ruleTop}" width="120" height="2" fill="${t.primary}"/>
  </svg>`;

  if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true });

  await sharp(Buffer.from(baseSvg))
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  return { width: t.width, height: t.height, outPath };
}
