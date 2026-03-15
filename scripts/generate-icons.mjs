import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, '../public/icons');
mkdirSync(iconsDir, { recursive: true });

// Icon design: two overlapping speech bubbles forming a cloud, gradient heart inside
// Aurora gradient background: deep violet → vivid purple → magenta
const svg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient: deep space violet → magenta -->
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#1E0A3C"/>
      <stop offset="45%"  stop-color="#6D28D9"/>
      <stop offset="100%" stop-color="#BE185D"/>
    </linearGradient>

    <!-- Aurora blob top-left -->
    <radialGradient id="a1" cx="60" cy="60" r="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#A78BFA" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#A78BFA" stop-opacity="0"/>
    </radialGradient>

    <!-- Aurora blob bottom-right -->
    <radialGradient id="a2" cx="460" cy="460" r="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#F472B6" stop-opacity="0.40"/>
      <stop offset="100%" stop-color="#F472B6" stop-opacity="0"/>
    </radialGradient>

    <!-- Cloud drop shadow -->
    <filter id="shadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="22" flood-color="#000" flood-opacity="0.28"/>
    </filter>

    <!-- Heart gradient: coral → rose -->
    <linearGradient id="heart" x1="218" y1="215" x2="294" y2="285" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#FCA5A5"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>

    <!-- White cloud inner highlight -->
    <linearGradient id="cloudShine" x1="140" y1="130" x2="372" y2="320" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="100%" stop-color="#F0F0FF" stop-opacity="0.92"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" fill="url(#bg)"/>
  <rect width="512" height="512" fill="url(#a1)"/>
  <rect width="512" height="512" fill="url(#a2)"/>

  <!-- Subtle background ring (premium feel) -->
  <circle cx="256" cy="256" r="230" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <circle cx="256" cy="256" r="210" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>

  <!-- Speech bubble cloud (two circles + fill + tail) -->
  <g filter="url(#shadow)">
    <!-- Left circle -->
    <circle cx="196" cy="216" r="108" fill="url(#cloudShine)"/>
    <!-- Right circle -->
    <circle cx="316" cy="216" r="108" fill="url(#cloudShine)"/>
    <!-- Bridge fill between circles -->
    <rect x="196" y="114" width="120" height="204" fill="url(#cloudShine)"/>
    <!-- Tail: small downward pointer -->
    <polygon points="216,308 192,356 258,308" fill="url(#cloudShine)"/>
  </g>

  <!-- Heart -->
  <path fill="url(#heart)" d="
    M 256 248
    C 249 232, 218 234, 218 252
    C 218 264, 256 286, 256 286
    C 256 286, 294 264, 294 252
    C 294 234, 263 232, 256 248 Z
  "/>

  <!-- Heart inner highlight -->
  <path fill="rgba(255,255,255,0.25)" d="
    M 248 254
    C 244 246, 232 247, 232 255
    C 232 260, 242 266, 248 270
    C 249 268, 248 262, 248 254 Z
  "/>
</svg>`;

async function run() {
  const input = Buffer.from(svg);
  await sharp(input).resize(512, 512).png({ compressionLevel: 9 }).toFile(path.join(iconsDir, 'icon-512.png'));
  await sharp(input).resize(192, 192).png({ compressionLevel: 9 }).toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(input).resize(180, 180).png({ compressionLevel: 9 }).toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Icons generated: 512x512, 192x192, 180x180');
}

run().catch(console.error);
