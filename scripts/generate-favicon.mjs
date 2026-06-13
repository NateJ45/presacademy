// Foundation, edit with care
// Generates public/favicon.png (512) and public/apple-touch-icon.png (180):
// a "PA" monogram (warm cream) on a Geneva Oxblood rounded square. The "PA" is
// rendered with sharp's Pango text engine (same as the OG renderer) so it does
// not depend on an SVG <text> font being installed on the build machine.
// Run: node scripts/generate-favicon.mjs

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SIZE = 512;
const OXBLOOD = '#7A2A2C';
const CREAM = '#F1EAD9';

// Oxblood rounded-square background.
const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" rx="104" fill="${OXBLOOD}"/></svg>`;

// "PA" monogram via Pango (reliable text rendering with a system serif).
const { data: paBuf, info: paInfo } = await sharp({
  text: {
    text: `<span foreground="${CREAM}" font_desc="Georgia, serif 600 300px">PA</span>`,
    rgba: true,
    dpi: 72,
  },
})
  .png()
  .toBuffer({ resolveWithObject: true });

const composed = await sharp(Buffer.from(bgSvg))
  .composite([
    {
      input: paBuf,
      left: Math.round((SIZE - paInfo.width) / 2),
      top: Math.round((SIZE - paInfo.height) / 2),
    },
  ])
  .png()
  .toBuffer();

await sharp(composed).resize(512, 512).png({ compressionLevel: 9 }).toFile(resolve(root, 'public/favicon.png'));
await sharp(composed).resize(180, 180).png({ compressionLevel: 9 }).toFile(resolve(root, 'public/apple-touch-icon.png'));

console.log('Wrote public/favicon.png (512x512) and public/apple-touch-icon.png (180x180)');
