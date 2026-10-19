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

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import opentype from 'opentype.js';
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
// Lettering: IBM Plex Mono (the covers' catalog codes) turned into outlines
// ---------------------------------------------------------------------------
// The site sets every code and small detail in Plex Mono 500 uppercase with a
// little tracking (.cover__code, .mono-detail). An SVG drawn as an image cannot
// load a web font, so the numbers on the shelf are drawn as paths from the
// font file itself (opentype.js reads the .woff; the output carries no font).
const monoFile = readFileSync(
  join(root, 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff'),
);
const mono = opentype.parse(
  monoFile.buffer.slice(monoFile.byteOffset, monoFile.byteOffset + monoFile.byteLength),
);
const TRACK = 0.08; // em, as .cover__code

/** `text` in Plex Mono as one path, its baseline at y. */
function monoPath(text, x, y, size, fill, extra = '') {
  const d = mono.getPath(text, x, y, size, { letterSpacing: TRACK }).toPathData(2);
  return `<path d="${d}" fill="${fill}"${extra}/>`;
}

// ---------------------------------------------------------------------------
// The spine strip: the eight cover colours in a row, as across the top of
// every page and the foot of the footer (Header.astro / Footer.astro .spine)
// ---------------------------------------------------------------------------
function spineStrip(x, y, w, h) {
  const seg = w / COLORS.length;
  return COLORS.map(
    (c, i) =>
      `<rect x="${x + i * seg}" y="${y}" width="${seg + 0.3}" height="${h}" fill="${PAIRS[c].bg}"/>`,
  ).join('');
}

// ---------------------------------------------------------------------------
// The Term Issue's covers, drawn properly: code, rule, ornament, title lines
// ---------------------------------------------------------------------------
const CREAM = '#F1EAD9'; // the cream the site sets on dark grounds
const EDGE = 'rgba(241,234,217,0.4)'; // a hairline so green and ink covers read on green

/**
 * A cover front as on CourseCover.astro: the catalog code top left in Plex Mono,
 * a hairline, the ornament, then the title and the teacher. The title is set as
 * plain bars (no words: the art never states a course), the way a printer's
 * dummy shows where type will go.
 */
function issueFront({ x, y, w, h, color, orn, no, rot = 0, shadow = true }) {
  const { bg, fg } = PAIRS[color];
  const pad = w * 0.11;
  const codeSize = w * 0.13;
  const parts = [];
  const cx = x + w / 2;
  const by = y + h;
  const g = rot ? ` transform="rotate(${rot} ${rot < 0 ? x : x + w} ${by})"` : '';
  if (shadow)
    parts.push(
      `<rect x="${x + w * 0.05}" y="${y + w * 0.06}" width="${w}" height="${h}" rx="${w * 0.03}" fill="#0E1611" opacity="0.35"/>`,
    );
  parts.push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.03}" fill="${bg}" stroke="${EDGE}" stroke-width="0.6"/>`,
  );
  parts.push(
    monoPath(`N°${String(no).padStart(2, '0')}`, x + pad, y + pad + codeSize * 0.8, codeSize, fg),
  );
  parts.push(
    `<rect x="${x + pad}" y="${y + pad + codeSize * 1.25}" width="${w - pad * 2}" height="0.5" fill="${fg}" opacity="0.5"/>`,
  );
  const box = w * 0.46;
  parts.push(ornament(orn, cx - box / 2, y + h * 0.32, box, box, fg));
  const t1 = y + h - pad - w * 0.3;
  parts.push(
    `<rect x="${x + pad}" y="${t1}" width="${w * 0.7}" height="${w * 0.075}" fill="${fg}"/>`,
  );
  parts.push(
    `<rect x="${x + pad}" y="${t1 + w * 0.11}" width="${w * 0.48}" height="${w * 0.075}" fill="${fg}"/>`,
  );
  parts.push(
    `<rect x="${x + pad}" y="${t1 + w * 0.24}" width="${w * 0.34}" height="${w * 0.04}" fill="${fg}" opacity="0.7"/>`,
  );
  return `<g${g}>${parts.join('')}</g>`;
}

/** A spine: the issue standing side-on, its number running up it in Plex Mono. */
function issueSpine({ x, y, w, h, color, no }) {
  const { bg, fg } = PAIRS[color];
  const size = w * 0.5;
  const label = `N°${String(no).padStart(2, '0')}`;
  const lx = x + w / 2 + size * 0.36;
  const ly = y + h - w * 0.7;
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.08}" fill="${bg}" stroke="${EDGE}" stroke-width="0.6"/>`,
    `<rect x="${x + w * 0.18}" y="${y + w * 0.7}" width="${w * 0.64}" height="0.6" fill="${fg}" opacity="0.7"/>`,
    `<circle cx="${x + w / 2}" cy="${y + w * 1.25}" r="${w * 0.2}" fill="${fg}"/>`,
    `<rect x="${x + w * 0.18}" y="${y + w * 1.8}" width="${w * 0.64}" height="0.6" fill="${fg}" opacity="0.7"/>`,
    monoPath(label, 0, 0, size, fg, ` transform="translate(${lx} ${ly}) rotate(-90)"`),
  ].join('');
}

// A tiny deterministic shuffle, so the shelf is the same on every run.
function rng(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const ORNAMENTS = ['circle', 'stripes', 'half-moon', 'cross', 'dots', 'ring', 'diagonal', 'steps'];

/**
 * The shelf: runs of issues, fronts and spines, a cover leaning at the end of
 * each run, standing on a cream shelf line over the spine strip.
 */
function shelf(width, height, { runs, seed }) {
  const rand = rng(seed);
  const floor = height - 8;
  const parts = [];
  let x = 6;
  let no = 1;
  let c = 0;
  const runGap = width / runs.length;
  runs.forEach((run, r) => {
    x = Math.max(x, r * runGap + 6);
    for (const [i, kind] of [...run].entries()) {
      const color = COLORS[c++ % COLORS.length];
      if (kind === 'f' || kind === 'l') {
        const h = floor * (0.66 + rand() * 0.2);
        const w = h / 1.5;
        const rot = kind === 'l' ? (i === 0 ? 7 : -7) : 0;
        const orn = ORNAMENTS[(c * 3 + 1) % ORNAMENTS.length];
        parts.push(
          issueFront({
            x: x + (rot < 0 ? h * 0.06 : 0),
            y: floor - h,
            w,
            h,
            color,
            orn,
            no: no++,
            rot,
          }),
        );
        x += w + 2.5 + (rot ? h * 0.12 : 0);
      } else {
        const h = floor * (0.6 + rand() * 0.34);
        const w = floor * (0.13 + rand() * 0.04);
        parts.push(issueSpine({ x, y: floor - h, w, h, color, no: no++ }));
        x += w + 1.2;
      }
    }
  });
  parts.push(
    `<rect x="0" y="${floor}" width="${width}" height="1.2" fill="${CREAM}" opacity="0.6"/>`,
  );
  parts.push(spineStrip(0, height - 4, width, 4));
  return round(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMax meet">${parts.join('')}</svg>\n`,
  );
}

const outBanner = join(root, 'public/studio-art');
mkdirSync(outBanner, { recursive: true });
// Wide: five runs across the banner. Phone: two. f = front, s = spine, l = leaning.
writeFileSync(
  join(outBanner, 'cover-shelf.svg'),
  shelf(1000, 104, { runs: ['fssfsl', 'lsfssf', 'fsssfl', 'sfsfss', 'lfssfs'], seed: 7 }),
);
writeFileSync(
  join(outBanner, 'cover-shelf-phone.svg'),
  shelf(390, 92, { runs: ['fssfsl', 'lsfsfs'], seed: 11 }),
);

// ---------------------------------------------------------------------------
// The mark: the three fanned covers beside "Spring 2027 issue" in the masthead
// (Header.astro .issue-fan: oxblood left, brass right, green in front with its
// cream dot), drawn bare for the dark banner (kit homeBanner.markOnDark).
// ---------------------------------------------------------------------------
function board(x, y, w, h, color, rot, cx, cy) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.04}" fill="${PAIRS[color].bg}" stroke="${CREAM}" stroke-opacity="0.55" stroke-width="1.4" transform="rotate(${rot} ${cx} ${cy})"/>`;
}
{
  const parts = [
    `<g opacity="0.35" fill="#0E1611"><rect x="20" y="30" width="44" height="66" rx="2" transform="rotate(-9 42 63)"/><rect x="58" y="28" width="44" height="66" rx="2" transform="rotate(8 80 61)"/></g>`,
    board(16, 26, 44, 66, 'oxblood', -9, 38, 59),
    board(60, 24, 44, 66, 'brass', 8, 82, 57),
    `<rect x="40" y="22" width="46" height="70" rx="2" fill="#0E1611" opacity="0.35" transform="translate(3 4)"/>`,
    board(37, 18, 46, 70, 'green', -1, 60, 53),
    `<circle cx="60" cy="49" r="10.5" fill="${PAIRS.green.fg}"/>`,
    monoPath('N°01', 43, 30, 6.4, PAIRS.green.fg),
    `<rect x="43" y="74" width="26" height="3" fill="${PAIRS.green.fg}"/><rect x="43" y="79.5" width="18" height="3" fill="${PAIRS.green.fg}"/>`,
  ];
  writeFileSync(
    join(outBanner, 'mark-issue.svg'),
    round(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 112">${parts.join('')}</svg>\n`,
    ),
  );
}

// ---------------------------------------------------------------------------
// The splash: the hero's fan of three covers (index.astro hero: ink left,
// green in front, cream right) over the spine strip, for /studio's loading page
// ---------------------------------------------------------------------------
{
  const W = 280;
  const H = 176;
  const fw = 78;
  const fh = 117;
  const parts = [
    issueFront({ x: 46, y: 34, w: fw, h: fh, color: 'ink', orn: 'dots', no: 2, rot: -8 }),
    issueFront({ x: 156, y: 38, w: fw, h: fh, color: 'cream', orn: 'stripes', no: 3, rot: 7 }),
    issueFront({ x: 101, y: 22, w: fw + 6, h: fh + 9, color: 'green', orn: 'circle', no: 1 }),
    spineStrip(0, H - 4, W, 4),
  ];
  writeFileSync(
    join(outBanner, 'issue-fan.svg'),
    round(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>\n`,
    ),
  );
}

// One cover per colour pair, and each ornament alone in currentColor: the
// motif kit for the Studio's art slots (and starter card 128's art layer).
ORNAMENTS.forEach((orn, i) => {
  const color = COLORS[i];
  writeFileSync(
    join(outBanner, `cover-${color}.svg`),
    round(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 92">${issueFront({ x: 2, y: 2, w: 58, h: 87, color, orn, no: i + 1, shadow: false })}</svg>\n`,
    ),
  );
  writeFileSync(
    join(outBanner, `ornament-${orn}.svg`),
    round(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${ornament(orn, 4, 4, 32, 32, 'currentColor')}</svg>\n`,
    ),
  );
});
writeFileSync(
  join(outBanner, 'spine-strip.svg'),
  round(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 6" preserveAspectRatio="none">${spineStrip(0, 0, 400, 6)}</svg>\n`,
  ),
);

// ---------------------------------------------------------------------------
// Icons: one 24x24 cover per meaning, the meaning drawn ONLY with the covers'
// own ornament shapes (circle, half-moon, stripes, dots, ring, diagonal, steps)
// plus a "?" in Plex Mono, so a list row reads at a glance and still looks
// like the school's covers. Mapping in brandIconArt.tsx.
// ---------------------------------------------------------------------------
// The board sits at x 4.5..19.5, y 1.5..22.5; glyphs draw in its middle.
const B = { x: 4.5, y: 1.5, w: 15, h: 21 };
const GLYPHS = {
  // A course: the cover itself, its ornament the hero cover's big disc.
  course: (ink) => `<circle cx="12" cy="11" r="4.4" fill="${ink}"/>`,
  // A term: the steps, one rise per week.
  term: (ink) => ornament('steps', 7.5, 6.5, 9, 10, ink),
  // A teacher: a disc for the head over a half-moon for the shoulders.
  faculty: (ink) =>
    `<circle cx="12" cy="8.6" r="2.6" fill="${ink}"/><path d="M7.4 17.4A4.6 4.6 0 0 1 16.6 17.4Z" fill="${ink}"/>`,
  // People: two of them.
  people: (ink) =>
    `<circle cx="9.6" cy="9.2" r="1.9" fill="${ink}"/><path d="M6.4 15.6A3.2 3.2 0 0 1 12.8 15.6Z" fill="${ink}"/><circle cx="14.4" cy="9.2" r="1.9" fill="${ink}"/><path d="M11.2 15.6A3.2 3.2 0 0 1 17.6 15.6Z" fill="${ink}"/>`,
  // An event: the half-moon rising over a rule, a day.
  event: (ink) =>
    `<path d="M7.6 13.4A4.4 4.4 0 0 1 16.4 13.4Z" fill="${ink}"/><rect x="7" y="14.6" width="10" height="1.3" fill="${ink}"/><rect x="7" y="17" width="6" height="1.3" fill="${ink}"/>`,
  // A notice: the diagonal as a pennant on its pole.
  notice: (ink) =>
    `<rect x="7.6" y="5.6" width="1.4" height="13" fill="${ink}"/><path d="M9 5.6H16.6L9 12.2Z" fill="${ink}"/>`,
  // Rates: the ring, a coin.
  pricing: (ink) =>
    `<circle cx="12" cy="11.6" r="3.8" fill="none" stroke="${ink}" stroke-width="1.6"/><rect x="11.3" y="9.6" width="1.4" height="4" fill="${ink}"/>`,
  // A page: stripes laid flat, lines of type.
  pages: (ink) =>
    `<rect x="7.4" y="6.4" width="9.2" height="1.6" fill="${ink}"/><rect x="7.4" y="9.8" width="9.2" height="1.1" fill="${ink}"/><rect x="7.4" y="12.4" width="9.2" height="1.1" fill="${ink}"/><rect x="7.4" y="15" width="6" height="1.1" fill="${ink}"/>`,
  // A question: a question mark in the covers' Plex Mono.
  question: (ink) => monoPath('?', 8.4, 16.6, 12.5, ink),
  // A form: two fields and a button.
  form: (ink) =>
    `<rect x="7.6" y="6" width="8.8" height="3" fill="none" stroke="${ink}" stroke-width="1"/><rect x="7.6" y="10.6" width="8.8" height="3" fill="none" stroke="${ink}" stroke-width="1"/><rect x="7.6" y="15.4" width="4.6" height="2.4" fill="${ink}"/>`,
  // A teaching area: the dots, a set of things.
  area: (ink) => ornament('dots', 7.2, 7.4, 9.6, 9.6, ink),
  // Reading and downloads: spines on a shelf.
  reading: (ink) =>
    `<rect x="7.4" y="6.4" width="2" height="11" fill="${ink}"/><rect x="10.4" y="8" width="2" height="9.4" fill="${ink}"/><rect x="13.2" y="6.9" width="2" height="10.6" fill="${ink}" transform="rotate(-12 14.2 17.5)"/><rect x="7" y="18" width="10" height="1" fill="${ink}"/>`,
};
const ICONS = {
  course: 'green',
  term: 'brass',
  faculty: 'oxblood',
  people: 'slate',
  event: 'parchment',
  notice: 'oxblood',
  pricing: 'sage',
  pages: 'cream',
  question: 'ink',
  form: 'cream',
  area: 'sage',
  reading: 'slate',
};

const outIcons = join(root, 'src/assets/brand');
mkdirSync(outIcons, { recursive: true });
for (const [name, color] of Object.entries(ICONS)) {
  const { bg, fg } = PAIRS[color];
  const svg = round(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="1.2" fill="${bg}" stroke="rgba(31,27,24,0.45)" stroke-width="0.6"/>${GLYPHS[name](fg)}</svg>\n`,
  );
  writeFileSync(join(outIcons, `icon-${name}.svg`), svg);
}

// ---------------------------------------------------------------------------
// The wordmark for the Studio's green top bar: the masthead's nameplate, "The
// Presbyterian" upright and "Academy" in italic, as Header.astro sets it, in
// cream with the italic in brass (the accent word on a dark band). Both
// Fraunces files are embedded (SIL OFL 1.1): an SVG image cannot load fonts.
// ---------------------------------------------------------------------------
{
  const f = (p) =>
    readFileSync(join(root, 'node_modules/@fontsource-variable/fraunces/files', p)).toString(
      'base64',
    );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 5 500 42" width="500" height="42" role="img" aria-label="The Presbyterian Academy">
<!-- The Studio top bar's wordmark (PORTS.md card 120), made by scripts/gen-studio-art.mjs:
     the masthead nameplate, "Academy" in Fraunces italic and brass. Fonts embedded
     (latin weight-axis files from @fontsource-variable/fraunces, SIL OFL 1.1). -->
<style>@font-face{font-family:'PA Fraunces';src:url(data:font/woff2;base64,${f('fraunces-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}@font-face{font-family:'PA Fraunces';font-style:italic;src:url(data:font/woff2;base64,${f('fraunces-latin-wght-italic.woff2')}) format('woff2');font-weight:100 900}text{font-family:'PA Fraunces',Georgia,serif;font-weight:420;font-size:40px;fill:${CREAM}}.i{font-style:italic;fill:#C7A875}</style>
<text x="0" y="36">The Presbyterian <tspan class="i">Academy</tspan></text>
</svg>
`;
  writeFileSync(join(outIcons, 'wordmark-dark.svg'), svg);
}

// The italic, for the Home banner's "Academy" (kit homeBanner.lettering).
copyFileSync(
  join(root, 'node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2'),
  join(outBanner, 'fraunces-italic-wght.woff2'),
);

console.log(
  `gen-studio-art: ${Object.keys(ICONS).length} icons and the wordmark in src/assets/brand; shelves, mark, fan, strip, 8 covers and 8 ornaments in public/studio-art`,
);
