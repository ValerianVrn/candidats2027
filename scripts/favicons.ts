/**
 * Renders public/favicon.ico (32 px) and public/apple-touch-icon.png (180 px) from public/favicon.svg.
 * Run after changing the SVG: node scripts/favicons.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const svg = readFileSync('public/favicon.svg');
const png32 = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
// ICO container holding one PNG image.
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14);
header.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([header, png32]));
await sharp(svg, { density: 600 })
  .resize(180, 180)
  .flatten({ background: '#0b1020' })
  .png()
  .toFile('public/apple-touch-icon.png');
