import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

interface IconSpec {
  name: string;
  size: number;
  padding?: number;
  background?: string;
  maskable?: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');
const SOURCE_SVG = path.join(PUBLIC_DIR, 'favicon.svg');

const BRAND_BG = '#0f172a';

const ICONS: IconSpec[] = [
  { name: 'icon-48.png', size: 48 },
  { name: 'icon-72.png', size: 72 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-128.png', size: 128 },
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-152.png', size: 152 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-384.png', size: 384 },
  { name: 'icon-512.png', size: 512 },

  { name: 'maskable-192.png', size: 192, padding: 0.2, background: BRAND_BG, maskable: true },
  { name: 'maskable-512.png', size: 512, padding: 0.2, background: BRAND_BG, maskable: true },

  { name: 'apple-touch-icon.png', size: 180, background: BRAND_BG },
];

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function loadSvgBuffer(): Promise<Buffer> {
  if (!(await fileExists(SOURCE_SVG))) {
    throw new Error(
      `Source SVG not found at ${SOURCE_SVG}\n` +
        `Place a square SVG at client/public/favicon.svg before running this script.`
    );
  }
  return fs.readFile(SOURCE_SVG);
}

function sharpInstanceFromHex(hex: string) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
    alpha: 1,
  };
}

async function renderIcon(svg: Buffer, spec: IconSpec): Promise<void> {
  const { name, size, padding = 0, background } = spec;

  const innerSize = Math.max(1, Math.round(size * (1 - padding * 2)));
  const pad = Math.round((size - innerSize) / 2);

  const resized = await sharp(svg, { density: 384 })
    .resize(innerSize, innerSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const base = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background
        ? sharpInstanceFromHex(background)
        : { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const out = await base
    .composite([{ input: resized, top: pad, left: pad }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  const dest = path.join(ICONS_DIR, name);
  await fs.writeFile(dest, out);
  const kb = (out.length / 1024).toFixed(1);
  console.log(`  ✓ ${name.padEnd(28)} ${size}×${size}  ${kb} KB`);
}

async function main() {
  console.log('Generating PWA assets from', path.relative(ROOT, SOURCE_SVG));

  await ensureDir(ICONS_DIR);
  const svg = await loadSvgBuffer();

  for (const spec of ICONS) {
    await renderIcon(svg, spec);
  }

  console.log(
    `\nDone. ${ICONS.length} icons written to ${path.relative(ROOT, ICONS_DIR)}/`
  );
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});