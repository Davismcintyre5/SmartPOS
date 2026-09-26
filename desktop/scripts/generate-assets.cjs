#!/usr/bin/env node

/**
 * Generates all desktop app assets from desktop/assets/favicon.svg
 *
 * Input:   desktop/assets/favicon.svg
 * Output:  desktop/assets/
 *            ├── icon.ico
 *            ├── icon.icns
 *            ├── icon.png
 *            ├── tray.png
 *            ├── trayTemplate.png
 *            ├── trayTemplate@2x.png
 *            ├── installer-icon.png
 *            └── sizes/
 *                ├── 16.png
 *                ├── 24.png
 *                ├── 32.png
 *                ├── 48.png
 *                ├── 64.png
 *                ├── 96.png
 *                ├── 128.png
 *                ├── 192.png
 *                ├── 256.png
 *                ├── 384.png
 *                ├── 512.png
 *                └── 1024.png
 *
 * Usage:
 *   node scripts/generate-assets.js
 *   node scripts/generate-assets.js --source path/to/logo.svg
 *   node scripts/generate-assets.js --bg "#1e293b"
 *   node scripts/generate-assets.js --padding 0.1
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ─────────────────────────────────────────────────────────────
// CLI args
// ─────────────────────────────────────────────────────────────

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  if (!next || next.startsWith('--')) return true;
  return next;
}

// ─────────────────────────────────────────────────────────────
// Paths
// ─────────────────────────────────────────────────────────────

const DESKTOP_ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(DESKTOP_ROOT, 'assets');
const SIZES_DIR = path.join(ASSETS_DIR, 'sizes');

const DEFAULT_SOURCE = path.join(ASSETS_DIR, 'favicon.svg');
const SOURCE_SVG = path.resolve(arg('source', DEFAULT_SOURCE));

const BG_COLOR = arg('bg', '');
const PADDING = Number(arg('padding', 0));

// ─────────────────────────────────────────────────────────────
// Output specs
// ─────────────────────────────────────────────────────────────

const PNG_SIZES = [16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 1024];
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];
const ICNS_SIZES = [16, 32, 64, 128, 256, 512, 1024];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`  ${msg}`);
}

function logStep(msg) {
  console.log(`\n▶ ${msg}`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function parseHex(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
    alpha: 1,
  };
}

async function renderPng(size, svgBuffer) {
  const innerSize = Math.max(1, Math.round(size * (1 - PADDING * 2)));
  const pad = Math.round((size - innerSize) / 2);
  const bg = parseHex(BG_COLOR);

  const resized = await sharp(svgBuffer, { density: 1024 })
    .resize(innerSize, innerSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg || { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, top: pad, left: pad }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// ─────────────────────────────────────────────────────────────
// ICO builder
// ─────────────────────────────────────────────────────────────

async function buildIco(sizes, svgBuffer, outPath) {
  const images = [];
  for (const size of sizes) {
    const png = await renderPng(size, svgBuffer);
    images.push({ size, png });
  }

  const count = images.length;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + count * 16;

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += img.png.length;
  }

  const body = Buffer.concat(images.map((i) => i.png));
  const ico = Buffer.concat([header, ...entries, body]);

  fs.writeFileSync(outPath, ico);
  return ico.length;
}

// ─────────────────────────────────────────────────────────────
// ICNS builder
// ─────────────────────────────────────────────────────────────

function icnsTypeFor(size) {
  const map = {
    16: 'icp4',
    32: 'icp5',
    64: 'icp6',
    128: 'ic07',
    256: 'ic08',
    512: 'ic09',
    1024: 'ic10',
  };
  return map[size] || null;
}

async function buildIcns(sizes, svgBuffer, outPath) {
  const chunks = [];

  for (const size of sizes) {
    const type = icnsTypeFor(size);
    if (!type) continue;

    const png = await renderPng(size, svgBuffer);

    const chunkHeader = Buffer.alloc(8);
    chunkHeader.write(type, 0, 4, 'ascii');
    chunkHeader.writeUInt32BE(png.length + 8, 4);

    chunks.push(chunkHeader);
    chunks.push(png);
  }

  const body = Buffer.concat(chunks);

  const header = Buffer.alloc(8);
  header.write('icns', 0, 4, 'ascii');
  header.writeUInt32BE(body.length + 8, 4);

  const icns = Buffer.concat([header, body]);
  fs.writeFileSync(outPath, icns);
  return icns.length;
}

// ─────────────────────────────────────────────────────────────
// Tray icons
// ─────────────────────────────────────────────────────────────

async function buildTrayIcons(svgBuffer) {
  const tray = await renderPng(32, svgBuffer);
  fs.writeFileSync(path.join(ASSETS_DIR, 'tray.png'), tray);

  const template16 = await renderMonochrome(svgBuffer, 16);
  const template32 = await renderMonochrome(svgBuffer, 32);

  fs.writeFileSync(path.join(ASSETS_DIR, 'trayTemplate.png'), template16);
  fs.writeFileSync(path.join(ASSETS_DIR, 'trayTemplate@2x.png'), template32);
}

async function renderMonochrome(svgBuffer, size) {
  const big = size * 4;
  const rendered = await sharp(svgBuffer, { density: 512 })
    .resize(big, big, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = rendered;
  const out = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    const a = alpha > 40 ? 255 : 0;
    out[i] = 0;
    out[i + 1] = 0;
    out[i + 2] = 0;
    out[i + 3] = a;
  }

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╭──────────────────────────────────────────╮');
  console.log('│  SmartPOS Desktop — Asset Generator      │');
  console.log('╰──────────────────────────────────────────╯');

  logStep(`Source: ${path.relative(DESKTOP_ROOT, SOURCE_SVG)}`);

  if (!fs.existsSync(SOURCE_SVG)) {
    console.error(`\n✖ Source SVG not found:\n  ${SOURCE_SVG}\n`);
    console.error('  Place a square SVG at desktop/assets/favicon.svg');
    console.error('  Or pass --source path/to/your.svg\n');
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SOURCE_SVG);
  ensureDir(ASSETS_DIR);
  ensureDir(SIZES_DIR);

  logStep('PNG sizes');
  for (const size of PNG_SIZES) {
    const png = await renderPng(size, svgBuffer);
    const outPath = path.join(SIZES_DIR, `${size}.png`);
    fs.writeFileSync(outPath, png);
    log(
      `sizes/${size}.png${' '.repeat(Math.max(1, 20 - String(size).length))}${(png.length / 1024).toFixed(1)} KB`
    );
  }

  logStep('App icon (PNG)');
  const icon512 = fs.readFileSync(path.join(SIZES_DIR, '512.png'));
  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), icon512);
  log(`icon.png                 512×512    ${(icon512.length / 1024).toFixed(1)} KB`);

  logStep('Windows icon');
  const icoBytes = await buildIco(
    ICO_SIZES,
    svgBuffer,
    path.join(ASSETS_DIR, 'icon.ico')
  );
  log(
    `icon.ico                 ${ICO_SIZES.join('+')}   ${(icoBytes / 1024).toFixed(1)} KB`
  );

  logStep('Installer icon (NSIS)');
  const installerIcon = await renderPng(256, svgBuffer);
  fs.writeFileSync(path.join(ASSETS_DIR, 'installer-icon.png'), installerIcon);
  log(
    `installer-icon.png       256×256    ${(installerIcon.length / 1024).toFixed(1)} KB`
  );

  logStep('macOS icon');
  try {
    const icnsBytes = await buildIcns(
      ICNS_SIZES,
      svgBuffer,
      path.join(ASSETS_DIR, 'icon.icns')
    );
    log(
      `icon.icns                ${ICNS_SIZES.join('+')}   ${(icnsBytes / 1024).toFixed(1)} KB`
    );
  } catch (err) {
    log(`icon.icns                ✖ skipped: ${err.message}`);
  }

  logStep('Tray icons');
  await buildTrayIcons(svgBuffer);
  log('tray.png                 32×32');
  log('trayTemplate.png         16×16    (macOS)');
  log('trayTemplate@2x.png      32×32    (macOS)');

  console.log('\n✔ All assets generated.\n');
  console.log(`  Output directory: ${path.relative(process.cwd(), ASSETS_DIR)}/`);
  console.log('');

  if (BG_COLOR) {
    console.log(`  Background: ${BG_COLOR}`);
  } else {
    console.log('  Background: transparent');
  }
  if (PADDING > 0) {
    console.log(`  Padding: ${(PADDING * 100).toFixed(0)}%`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('\n✖ Failed:', err.message);
  process.exit(1);
});