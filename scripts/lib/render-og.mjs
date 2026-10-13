// Foundation, edit with care
// Shared OG renderer. Used by generate-og-default.mjs (single PNG) and
// generate-og-pages.mjs (one PNG per page singleton, plus renderCourseOg at the
// bottom: one cover per course, Term Issue PR 4). Uses sharp's native text
// rendering (Pango) so we don't depend on opentype.js or satori.
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
  bg: '#FAF8F4', // Near-white warm paper (Direction A)
  primary: '#33503F', // Geneva Green (accent rule)
  primaryDark: '#1F1B18', // Soft near-black (wordmark)
  accent: '#1F1B18', // Soft near-black (tagline)
  taupe: '#B7A99B', // Cloister Stone (border)
  muted: '#615D5A', // "Academy" subline (foreground at ~70% over warm paper)
  fontDisplay: 'Fraunces, Georgia, Cambria, Times New Roman, serif',
};

async function renderText(text, fontSize, color, font, weight = 'normal') {
  const escaped = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const markup = `<span foreground="${color}" font_desc="${font} ${weight} ${fontSize}px">${escaped}</span>`;
  const { data, info } = await sharp({
    text: { text: markup, rgba: true, dpi: 72 },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
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
  })
    .png()
    .toBuffer({ resolveWithObject: true });
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
  let lead = '',
    key = words.join(' '),
    sub = '';
  if (words.length >= 3) {
    sub = words.pop();
    key = words.pop();
    lead = words.join(' ');
  } else if (words.length === 2) {
    key = words.pop();
    lead = words.join(' ');
  }

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

// =============================================================================
// Course covers as share images (Term Issue PR 4, 2026-10-13)
// =============================================================================
// renderCourseOg draws a course's cover the way CourseCover.astro does on the
// page (the same 2:3 front, colour pair and ornament), on a sheet of cover
// paper beside the wordmark, the course title, its catalog line and its one
// question. The shapes are SVG; the words are Pango text images, like
// renderOg above, so they wrap to a measured width.
//
// Nothing here knows the palette. The caller (generate-og-pages.mjs) resolves
// the colour and ornament through src/lib/cover.ts and reads the hex values
// from the --color-cover-* tokens in src/styles/globals.css, so the share image
// can never drift from the site's covers.
//
// FONTS. Pango uses the build machine's installed fonts, and the site's
// webfonts are WOFF/WOFF2 files it does not load (tested 2026-10-13: a
// `fontfile` pointing at them fell through to an unrelated CJK face). So each
// family lists a sane fallback chain: Fraunces, then Georgia (Windows, macOS),
// then DejaVu Serif / Liberation Serif (Linux CI and Cloudflare's builders);
// Plex Mono, then Consolas / Menlo, then DejaVu Sans Mono. A serif and a mono
// always resolve, which is all a thumbnail needs.

const OG_SERIF = 'Fraunces, Georgia, DejaVu Serif, Liberation Serif, serif';
const OG_MONO = 'IBM Plex Mono, Consolas, Menlo, DejaVu Sans Mono, Liberation Mono, monospace';

/** One block of Pango text, wrapped to `width` px when given. */
async function textImage(markup, { width, align = 'left' } = {}) {
  const { data, info } = await sharp({
    text: { text: markup, rgba: true, dpi: 72, ...(width ? { width, wrap: 'word' } : {}), align },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}

/** Pango markup for one run of text. */
function span(text, { font, size, color, weight = 'normal', italic = false }) {
  const desc = `${font} ${italic ? 'Italic ' : ''}${weight} ${size}px`;
  return `<span font_desc="${desc}" foreground="${color}">${esc(text)}</span>`;
}

/**
 * The cover ornaments, as SVG. Mirrors the `.cover__orn[data-ornament]` rules
 * in src/styles/globals.css, where one "cqi" is 1% of the cover's width (W).
 */
function ornamentSvg(kind, cx, cy, W, color) {
  const f = `fill="${color}"`;
  let s = 0.58 * W;
  let x = cx - s / 2;
  let y = cy - s / 2;
  switch (kind) {
    case 'circle':
      return `<circle cx="${cx}" cy="${cy}" r="${s / 2}" ${f}/>`;
    case 'stripes': {
      const step = 0.0395 * W;
      const bar = 0.0145 * W;
      let out = '';
      for (let bx = 0; bx < s; bx += step) {
        out += `<rect x="${x + bx}" y="${y}" width="${Math.min(bar, s - bx)}" height="${s}" ${f}/>`;
      }
      return out;
    }
    case 'half-moon': {
      const w = 0.66 * W;
      const h = w / 2;
      x = cx - w / 2;
      y = cy - h / 2;
      return `<path d="M ${x} ${y + h} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + h} Z" ${f}/>`;
    }
    case 'cross': {
      s = 0.56 * W;
      x = cx - s / 2;
      y = cy - s / 2;
      const t = 0.16 * s;
      return (
        `<rect x="${x + (s - t) / 2}" y="${y}" width="${t}" height="${s}" ${f}/>` +
        `<rect x="${x}" y="${y + (s - t) * 0.36}" width="${s}" height="${t}" ${f}/>`
      );
    }
    case 'dots': {
      const t = s / 5;
      let out = '';
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          out += `<circle cx="${x + t * (i + 0.5)}" cy="${y + t * (j + 0.5)}" r="${0.195 * t}" ${f}/>`;
        }
      }
      return out;
    }
    case 'ring': {
      const sw = 0.05 * W;
      return `<circle cx="${cx}" cy="${cy}" r="${s / 2 - sw / 2}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
    }
    case 'diagonal':
      return `<polygon points="${x},${y} ${x + s},${y} ${x},${y + s}" ${f}/>`;
    case 'steps': {
      const h = 0.22 * s;
      const free = s - h;
      return (
        `<rect x="${x}" y="${y + free}" width="${s}" height="${h}" ${f}/>` +
        `<rect x="${x}" y="${y + free * 0.61}" width="${0.74 * s}" height="${h}" ${f}/>` +
        `<rect x="${x}" y="${y + free * 0.22}" width="${0.48 * s}" height="${h}" ${f}/>`
      );
    }
    default:
      return '';
  }
}

/**
 * Render one course's share image (1200 x 630).
 *
 * @param {object} o
 * @param {string} o.outPath    absolute path of the PNG to write
 * @param {string} o.wordmark   the school's name, top of the right column
 * @param {string} o.title      the course title
 * @param {string} [o.catalog]  the mono catalog line ("SCR 101 · Scripture · Spring 2027")
 * @param {string} [o.question] the course's one question, in italics
 * @param {{bg: string, fg: string, ornament: string, code?: string, area?: string, teacher?: string}} o.cover
 * @param {{bg: string, ink: string, muted: string, accent: string}} o.paper  the sheet's colours
 */
export async function renderCourseOg({
  outPath,
  wordmark,
  title,
  catalog,
  question,
  cover,
  paper,
}) {
  const W0 = 1200;
  const H0 = 630;

  // ---- the cover, left: 2:3, 510 tall ---------------------------------------
  const CH = 510;
  const CW = 340;
  const CX = 96;
  const CY = (H0 - CH) / 2;
  const pad = 0.065 * CW;
  const inner = Math.round(CW - pad * 2);

  const codeImg = cover.code
    ? await textImage(span(cover.code.toUpperCase(), { font: OG_MONO, size: 14, color: cover.fg }))
    : null;
  const areaImg = cover.area
    ? await textImage(
        span(cover.area.toUpperCase(), { font: OG_MONO, size: 14, color: cover.fg }),
        {
          width: Math.round(inner * 0.62),
          align: 'right',
        },
      )
    : null;
  const coverTitle = await textImage(span(title, { font: OG_SERIF, size: 32, color: cover.fg }), {
    width: inner,
  });
  const teacherImg = cover.teacher
    ? await textImage(span(cover.teacher, { font: OG_SERIF, size: 16, color: cover.fg }), {
        width: inner,
      })
    : null;

  const topBottom = CY + pad + Math.max(codeImg?.height ?? 0, areaImg?.height ?? 0);
  const bottomH = coverTitle.height + (teacherImg ? 8 + teacherImg.height : 0);
  const bottomTop = CY + CH - pad - bottomH;
  const ornCy = (topBottom + bottomTop) / 2;

  // ---- the right column -------------------------------------------------------
  const RX = 512;
  const RW = W0 - RX - 88;
  const wordImg = await textImage(span(wordmark, { font: OG_SERIF, size: 30, color: paper.ink }));
  const titleAt = (size) =>
    textImage(span(title, { font: OG_SERIF, size, weight: 'Light', color: paper.ink }), {
      width: RW,
    });
  let titleImg = await titleAt(64);
  if (titleImg.height > 240) titleImg = await titleAt(50);
  const catImg = catalog
    ? await textImage(
        span(catalog.toUpperCase(), { font: OG_MONO, size: 20, color: paper.muted }),
        {
          width: RW,
        },
      )
    : null;
  // The question only when it fits in about three lines.
  let qImg = question
    ? await textImage(
        span(question, { font: OG_SERIF, size: 28, italic: true, color: paper.muted }),
        {
          width: RW,
        },
      )
    : null;
  if (qImg && qImg.height > 140) qImg = null;

  const blocks = [
    { img: wordImg, gap: 22 },
    { rule: true, h: 2, gap: 30 },
    { img: titleImg, gap: catImg || qImg ? 24 : 0 },
    ...(catImg ? [{ img: catImg, gap: qImg ? 22 : 0 }] : []),
    ...(qImg ? [{ img: qImg, gap: 0 }] : []),
  ];
  const groupH = blocks.reduce((n, b) => n + (b.img ? b.img.height : b.h) + b.gap, 0);
  let y = Math.round((H0 - groupH) / 2);
  const composites = [];
  let ruleY = 0;
  for (const b of blocks) {
    if (b.rule) ruleY = y;
    else composites.push({ input: b.img.buffer, left: RX, top: y });
    y += (b.img ? b.img.height : b.h) + b.gap;
  }

  // The cover's words, on top of its shapes.
  const top = Math.round(CY + pad);
  if (codeImg) composites.push({ input: codeImg.buffer, left: Math.round(CX + pad), top });
  if (areaImg) {
    composites.push({
      input: areaImg.buffer,
      left: Math.round(CX + CW - pad - areaImg.width),
      top,
    });
  }
  composites.push({
    input: coverTitle.buffer,
    left: Math.round(CX + pad),
    top: Math.round(bottomTop),
  });
  if (teacherImg) {
    composites.push({
      input: teacherImg.buffer,
      left: Math.round(CX + pad),
      top: Math.round(bottomTop + coverTitle.height + 8),
    });
  }

  const baseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W0}" height="${H0}" viewBox="0 0 ${W0} ${H0}">
    <defs><filter id="lift" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="14"/></filter></defs>
    <rect width="${W0}" height="${H0}" fill="${paper.bg}"/>
    <rect x="${CX + 10}" y="${CY + 22}" width="${CW - 20}" height="${CH}" fill="#000" opacity="0.28" filter="url(#lift)"/>
    <rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" fill="${cover.bg}"/>
    <rect x="${CX + 0.5}" y="${CY + 0.5}" width="${CW - 1}" height="${CH - 1}" fill="none" stroke="#000" stroke-opacity="0.12"/>
    ${ornamentSvg(cover.ornament, CX + CW / 2, ornCy, CW, cover.fg)}
    <rect x="${RX}" y="${ruleY}" width="96" height="2" fill="${paper.accent}"/>
  </svg>`;

  if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true });
  await sharp(Buffer.from(baseSvg))
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  return { width: W0, height: H0, outPath };
}
