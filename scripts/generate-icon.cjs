const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const WIDTH = 1024;
const HEIGHT = 1024;

const PURPLE = [109, 40, 217];
const PURPLE_DARK = [76, 29, 149];
const PURPLE_DEEP = [46, 16, 101];
const WHITE = [255, 255, 255];
const GOLD = [213, 166, 75];

const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);

function setPixel(x, y, rgb) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const i = (y * WIDTH + x) * 3;
  pixels[i] = rgb[0];
  pixels[i + 1] = rgb[1];
  pixels[i + 2] = rgb[2];
}

function fill(rgb) {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) setPixel(x, y, rgb);
  }
}

function circle(cx, cy, r, rgb) {
  const r2 = r * r;
  for (let y = Math.max(0, cy - r); y <= Math.min(HEIGHT - 1, cy + r); y++) {
    const dy = y - cy;
    for (let x = Math.max(0, cx - r); x <= Math.min(WIDTH - 1, cx + r); x++) {
      const dx = x - cx;
      if (dx * dx + dy * dy <= r2) setPixel(x, y, rgb);
    }
  }
}

function rect(x0, y0, x1, y1, rgb) {
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) setPixel(x, y, rgb);
  }
}

fill(PURPLE);

// Subtle brand depth without transparency, so the iOS icon remains fully opaque.
circle(790, 185, 320, PURPLE_DARK);
circle(90, 930, 390, PURPLE_DEEP);

// Geometric BLACKSPOT YOU “B”. The App Store applies the final corner mask.
rect(255, 190, 390, 834, WHITE);
circle(465, 370, 180, WHITE);
circle(465, 655, 205, WHITE);
rect(340, 190, 475, 834, WHITE);

// Cut the two counters of the B using the background color.
circle(475, 370, 82, PURPLE_DARK);
circle(480, 655, 96, PURPLE_DEEP);
rect(350, 288, 485, 452, PURPLE_DARK);
rect(350, 543, 495, 751, PURPLE_DEEP);

// Small gold point as a premium/community accent.
circle(790, 770, 48, GOLD);

const raw = Buffer.alloc((WIDTH * 3 + 1) * HEIGHT);
for (let y = 0; y < HEIGHT; y++) {
  const row = y * (WIDTH * 3 + 1);
  raw[row] = 0; // PNG filter: None
  pixels.copy(raw, row + 1, y * WIDTH * 3, (y + 1) * WIDTH * 3);
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let c = 0xFFFFFFFF;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuffer, data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
hdrColorType = 2;
ihdr[9] = hdrColorType; // truecolor RGB
// compression/filter/interlace remain 0

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND'),
]);

const output = path.join(__dirname, '..', 'assets', 'icon.png');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, png);
console.log(`Generated ${output}: ${WIDTH}x${HEIGHT}, ${png.length} bytes`);
