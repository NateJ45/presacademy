#!/usr/bin/env node
// Safe to edit by hand
// =============================================================================
// The Studio's own art, drawn from the course covers (PORTS.md cards 118-120)
// =============================================================================
// The school's visual signature is the course cover: a small-press book cover
// in one of eight colour pairs with one of eight plain ornaments
// (src/lib/cover.ts, CourseCover.astro). The Studio borrows it, so the admin
// looks like the school and not like someone else's software:
//
//   - src/assets/brand/icon-<meaning>.svg: list-row and desk icons, each a tiny
//     cover with its ornament (wired in src/sanity/brandIconArt.tsx).
//   - public/studio-art/cover-shelf.svg (and -phone): a shelf of covers
//     along the foot of the Studio Home banner (kit.config.ts homeBanner) and
//     under the name on the /studio loading splash.
//
// Colours are READ from src/styles/globals.css (--color-cover-<name> and its
// -fg pair), the single source of truth the site uses, so a palette change
// there flows here on the next run. No dependencies: plain string SVG.
//
//   node scripts/gen-studio-art.mjs
//
// Re-run after changing a cover colour or an ornament, then commit the files.
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/styles/globals.css'), 'utf8');

/** --color-cover-<name> and --color-cover-<name>-fg, as hex. */
function pair(name) {
  const bg = new RegExp(`--color-cover-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1];
  const fg = new RegExp(`--color-cover-${name}-fg:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1];
  if (!bg || !fg) throw new Error(`globals.css has no cover pair for "${name}"`);
  return { bg, fg };
}

const COLORS = ['green', 'ink', 'cream', 'oxblood', 'brass', 'sage', 'slate', 'parchment'];
const PAIRS = Object.fromEntries(COLORS.map((c) => [c, pair(c)]));

/**
 * One ornament inside a box (x, y, w, h), in the cover's ink. The shapes follow
 * the site's CSS ornaments in globals.css (.cover__orn[data-ornament=...]).
 */
function ornament(kind, x, y, w, h, ink) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) / 2;
  const f = `fill="${ink}"`;
  switch (kind) {
    case 'circle':
      return `<circle cx="${cx}" cy="${cy}" r="${r}" ${f}/>`;
    case 'ring':
      return `<circle cx="${cx}" cy="${cy}" r="${r * 0.8}" fill="none" stroke="${ink}" stroke-width="${r * 0.36}"/>`;
    case 'half-moon': {
      const hr = w * 0.4;
      const by = cy + hr / 2;
      return `<path d="M${cx - hr} ${by}A${hr} ${hr} 0 0 1 ${cx + hr} ${by}Z" ${f}/>`;
    }
    case 'cross': {
      const t = w * 0.18;
      return `<rect x="${cx - t / 2}" y="${y}" width="${t}" height="${h}" ${f}/><rect x="${x + w * 0.18}" y="${y + h * 0.3}" width="${w * 0.64}" height="${t}" ${f}/>`;
    }
    case 'stripes': {
      const n = 3;
      const sw = w / (n * 2 - 1);
      return Array.from(
        { length: n },
        (_, i) => `<rect x="${x + i * sw * 2}" y="${y}" width="${sw}" height="${h}" ${f}/>`,
      ).join('');
    }
    case 'dots': {
      const out = [];
      const n = 3;
      const step = w / n;
      const dr = step * 0.28;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
          out.push(
            `<circle cx="${x + step * (i + 0.5)}" cy="${y + (h - w) / 2 + step * (j + 0.5)}" r="${dr}" ${f}/>`,
          );
      return out.join('');
    }
    case 'diagonal':
      return `<path d="M${x} ${y}H${x + w}L${x} ${y + h}Z" ${f}/>`;
    case 'steps': {
      const sh = h * 0.22;
      return [
        `<rect x="${x}" y="${y + h - sh}" width="${w}" height="${sh}" ${f}/>`,
        `<rect x="${x}" y="${y + h * 0.5}" width="${w * 0.74}" height="${sh}" ${f}/>`,
        `<rect x="${x}" y="${y + h * 0.11}" width="${w * 0.48}" height="${sh}" ${f}/>`,
      ].join('');
    }
    default:
      throw new Error(`unknown ornament ${kind}`);
  }
}

const round = (svg) => svg.replace(/(\d+\.\d{3})\d+/g, '$1');

/** One cover: the board, a hairline so pale covers read on pale paper, the ornament. */
function cover({ x, y, w, h, color, orn, hairline }) {
  const { bg, fg } = PAIRS[color];
  const pad = w * 0.22;
  const box = w - pad * 2;
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.08}" fill="${bg}" stroke="${hairline}" stroke-width="${w * 0.04}"/>`,
    ornament(orn, x + pad, y + h * 0.18, box, box, fg),
  ].join('');
}

// ---------------------------------------------------------------------------
// Icons: one 24x24 cover per meaning (see brandIconArt.tsx for the mapping)
// ---------------------------------------------------------------------------
const ICONS = {
  course: { color: 'green', orn: 'circle' },
  term: { color: 'brass', orn: 'steps' },
  faculty: { color: 'oxblood', orn: 'ring' },
  people: { color: 'slate', orn: 'dots' },
  event: { color: 'parchment', orn: 'half-moon' },
  notice: { color: 'oxblood', orn: 'diagonal' },
  pricing: { color: 'sage', orn: 'stripes' },
  pages: { color: 'cream', orn: 'stripes' },
  question: { color: 'ink', orn: 'half-moon' },
  form: { color: 'cream', orn: 'diagonal' },
  area: { color: 'sage', orn: 'dots' },
  reading: { color: 'slate', orn: 'stripes' },
};

const outIcons = join(root, 'src/assets/brand');
mkdirSync(outIcons, { recursive: true });
for (const [name, spec] of Object.entries(ICONS)) {
  const svg = round(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${cover({
      x: 4.5,
      y: 1.5,
      w: 15,
      h: 21,
      ...spec,
      hairline: 'rgba(31,27,24,0.45)',
    })}</svg>\n`,
  );
  writeFileSync(join(outIcons, `icon-${name}.svg`), svg);
}

// ---------------------------------------------------------------------------
// The shelf: covers standing along the banner's foot, every pair and ornament
// ---------------------------------------------------------------------------
const ORNAMENTS = ['circle', 'stripes', 'half-moon', 'cross', 'dots', 'ring', 'diagonal', 'steps'];

function shelf(width, height, count) {
  const gap = width / count;
  const w = gap * 0.62;
  const parts = [];
  for (let i = 0; i < count; i++) {
    // Colours walk one way and ornaments another, so neighbours never match.
    const color = COLORS[i % COLORS.length];
    const orn = ORNAMENTS[(i * 3 + 1) % ORNAMENTS.length];
    // Books on a shelf are not all one height.
    const h = Math.min(height - 6, w * (1.25 + ((i * 7) % 5) * 0.07));
    const x = i * gap + (gap - w) / 2;
    parts.push(
      cover({ x, y: height - 3 - h, w, h, color, orn, hairline: 'rgba(150,140,120,0.6)' }),
    );
  }
  // The shelf itself, in the cream the site uses on dark grounds.
  parts.push(
    `<rect x="0" y="${height - 3}" width="${width}" height="1.5" fill="#F1EAD9" opacity="0.55"/>`,
  );
  return round(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMax meet">${parts.join('')}</svg>\n`,
  );
}

const outBanner = join(root, 'public/studio-art');
mkdirSync(outBanner, { recursive: true });
writeFileSync(join(outBanner, 'cover-shelf.svg'), shelf(1000, 64, 24));
writeFileSync(join(outBanner, 'cover-shelf-phone.svg'), shelf(390, 56, 10));

// One cover per colour pair, and each ornament alone in currentColor: the
// motif kit for the Studio's art slots (and starter card 128's art layer).
ORNAMENTS.forEach((orn, i) => {
  const color = COLORS[i];
  const board = cover({ x: 1, y: 1, w: 58, h: 82, color, orn, hairline: 'rgba(31,27,24,0.3)' });
  writeFileSync(
    join(outBanner, `cover-${color}.svg`),
    round(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 84">${board}</svg>\n`),
  );
  writeFileSync(
    join(outBanner, `ornament-${orn}.svg`),
    round(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${ornament(orn, 4, 4, 32, 32, 'currentColor')}</svg>\n`,
    ),
  );
});

console.log(
  `gen-studio-art: ${Object.keys(ICONS).length} icons in src/assets/brand, 2 shelves, 8 covers and 8 ornaments in public/studio-art`,
);
