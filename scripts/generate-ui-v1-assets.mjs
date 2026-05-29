import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type);
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return chunk;
}

function writePng(path, image) {
  mkdirSync(dirname(path), { recursive: true });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(image.width, 0);
  ihdr.writeUInt32BE(image.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = image.width * 4;
  const scanlines = Buffer.alloc((stride + 1) * image.height);
  for (let y = 0; y < image.height; y += 1) {
    const rowOffset = y * (stride + 1);
    scanlines[rowOffset] = 0;
    image.rgba.copy(scanlines, rowOffset + 1, y * stride, y * stride + stride);
  }
  writeFileSync(path, Buffer.concat([pngSignature, pngChunk("IHDR", ihdr), pngChunk("IDAT", deflateSync(scanlines)), pngChunk("IEND")]));
}

function createCanvas(width, height) {
  return { width, height, rgba: Buffer.alloc(width * height * 4) };
}

function color(hex, alpha = 255) {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255, alpha];
}

function setPixel(image, x, y, rgba) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= image.width || py >= image.height) return;
  const offset = (py * image.width + px) * 4;
  image.rgba[offset] = rgba[0];
  image.rgba[offset + 1] = rgba[1];
  image.rgba[offset + 2] = rgba[2];
  image.rgba[offset + 3] = rgba[3];
}

function circle(image, cx, cy, radius, rgba) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) setPixel(image, x, y, rgba);
    }
  }
}

function line(image, x1, y1, x2, y2, thickness, rgba) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    circle(image, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness / 2, rgba);
  }
}

function dodgeRollIcon() {
  const image = createCanvas(96, 96);
  const bg = color(0x081018, 235);
  const teal = color(0x62f8d1);
  const yellow = color(0xffe66d);
  const dim = color(0x1d2a32, 255);

  circle(image, 48, 48, 45, bg);
  circle(image, 48, 48, 39, dim);
  circle(image, 48, 48, 34, color(0x0e2024, 255));

  for (let index = 0; index < 34; index += 1) {
    const angle = -0.9 + index * 0.09;
    const radius = 23;
    circle(image, 48 + Math.cos(angle) * radius, 48 + Math.sin(angle) * radius, 3.4, teal);
  }

  line(image, 62, 21, 76, 20, 5, yellow);
  line(image, 76, 20, 72, 34, 5, yellow);
  line(image, 72, 34, 62, 21, 5, yellow);
  line(image, 31, 67, 20, 77, 5, yellow);
  line(image, 20, 77, 34, 80, 5, yellow);
  line(image, 34, 80, 31, 67, 5, yellow);

  circle(image, 48, 48, 10, color(0xf4fbff));
  line(image, 38, 48, 58, 48, 4, color(0x081018));
  line(image, 48, 38, 48, 58, 4, color(0x081018));
  return image;
}

writePng(join(root, "assets/generated/ui/dodge-roll-icon.png"), dodgeRollIcon());
