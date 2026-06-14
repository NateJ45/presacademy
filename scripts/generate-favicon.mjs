// Foundation, edit with care
// Generates public/favicon.png (512) and public/apple-touch-icon.png (180):
// a "PA" monogram (warm cream) on a Geneva Green rounded square. The "PA" is
// rendered with sharp's Pango text engine (same as the OG renderer) so it does
// not depend on an SVG <text> font being installed on the build machine.
// Run: node scripts/generate-favicon.mjs

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SIZE = 512;
const GREEN = '#33503F'; // Geneva Green — the brand primary (Direction A)
const CREAM = '#F1EAD9';

// Geneva Green rounded-square background.
const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" rx="104" fill="${GREEN}"/></svg>`;

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

// Legacy favicon.ico — a 256x256 PNG wrapped in a minimal ICO container (ICO has
// accepted PNG payloads since Windows Vista). Modern browsers use the <link>
// PNG/SVG icon; this just keeps /favicon.ico (which crawlers guess) on-brand too.
const icoPng = await sharp(composed).resize(256, 256).png({ compressionLevel: 9 }).toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4); // header: reserved, type=icon, count=1
ico.writeUInt8(0, 6); ico.writeUInt8(0, 7); // width/height 0 => 256
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12); // planes, bpp
ico.writeUInt32LE(icoPng.length, 14); ico.writeUInt32LE(22, 18); // size, offset
await writeFile(resolve(root, 'public/favicon.ico'), Buffer.concat([ico, icoPng]));

console.log('Wrote public/favicon.png (512), apple-touch-icon.png (180), favicon.ico (256)');
