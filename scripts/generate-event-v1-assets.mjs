import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { deflateSync } from "node:zlib";

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
  writeFileSync(
    path,
    Buffer.concat([pngSignature, pngChunk("IHDR", ihdr), pngChunk("IDAT", deflateSync(scanlines)), pngChunk("IEND")])
  );
}

function createCanvas(width = 128, height = 128) {
  return { width, height, rgba: Buffer.alloc(width * height * 4) };
}

function color(hex, alpha = 255) {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255, alpha];
}

function setPixel(image, x, y, rgba) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= image.width || py >= image.height) {
    return;
  }
  const offset = (py * image.width + px) * 4;
  image.rgba[offset] = rgba[0];
  image.rgba[offset + 1] = rgba[1];
  image.rgba[offset + 2] = rgba[2];
  image.rgba[offset + 3] = rgba[3];
}

function rect(image, x, y, width, height, rgba) {
  for (let py = Math.round(y); py < Math.round(y + height); py += 1) {
    for (let px = Math.round(x); px < Math.round(x + width); px += 1) {
      setPixel(image, px, py, rgba);
    }
  }
}

function circle(image, cx, cy, radius, rgba) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(image, x, y, rgba);
      }
    }
  }
}

function line(image, x1, y1, x2, y2, thickness, rgba) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    circle(image, x, y, thickness / 2, rgba);
  }
}

function diamond(image, cx, cy, radius, rgba) {
  for (let y = -radius; y <= radius; y += 1) {
    const width = radius - Math.abs(y);
    rect(image, cx - width, cy + y, width * 2 + 1, 1, rgba);
  }
}

function frameRect(image, x, y, width, height, thickness, rgba) {
  rect(image, x, y, width, thickness, rgba);
  rect(image, x, y + height - thickness, width, thickness, rgba);
  rect(image, x, y, thickness, height, rgba);
  rect(image, x + width - thickness, y, thickness, height, rgba);
}

const dark = color(0x111827);
const steel = color(0x9aa7b4);
const pale = color(0xe9f7ff);
const yellow = color(0xffd166);
const teal = color(0x62f8d1);
const blue = color(0x69a7ff);
const magenta = color(0xb36dff);
const red = color(0xff5c7a);
const orange = color(0xff8c6d);

function armoryCrate() {
  const image = createCanvas();
  rect(image, 25, 54, 78, 43, color(0x4b5b68));
  frameRect(image, 25, 54, 78, 43, 4, yellow);
  rect(image, 34, 42, 60, 18, color(0x2c3640));
  frameRect(image, 34, 42, 60, 18, 3, color(0xfff2a0));
  rect(image, 57, 56, 14, 41, color(0x26313a));
  rect(image, 32, 70, 18, 6, color(0xfff2a0));
  rect(image, 78, 70, 18, 6, color(0xfff2a0));
  return image;
}

function calibrationKiosk() {
  const image = createCanvas();
  rect(image, 48, 36, 32, 68, color(0x1f2937));
  frameRect(image, 48, 36, 32, 68, 3, teal);
  rect(image, 53, 43, 22, 17, color(0x0f172a));
  rect(image, 57, 47, 14, 9, color(0xa4ffe9));
  circle(image, 64, 75, 9, color(0x0f172a));
  circle(image, 64, 75, 5, teal);
  rect(image, 40, 101, 48, 9, color(0x475569));
  return image;
}

function relayTower() {
  const image = createCanvas();
  rect(image, 58, 38, 12, 66, color(0x334155));
  line(image, 64, 39, 37, 101, 5, color(0x475569));
  line(image, 64, 39, 91, 101, 5, color(0x475569));
  line(image, 44, 72, 84, 72, 4, blue);
  circle(image, 64, 32, 12, color(0x0f172a));
  circle(image, 64, 32, 7, color(0xa4ffe9));
  rect(image, 43, 102, 42, 8, color(0x64748b));
  return image;
}

function prototypeContainer() {
  const image = createCanvas();
  rect(image, 32, 49, 64, 40, color(0x312e81));
  frameRect(image, 32, 49, 64, 40, 4, magenta);
  diamond(image, 64, 69, 15, color(0x62f8d1));
  rect(image, 40, 39, 48, 12, color(0x4c1d95));
  rect(image, 39, 90, 50, 9, color(0x6d28d9));
  return image;
}

function testTerminal() {
  const image = createCanvas();
  rect(image, 39, 44, 50, 43, color(0x172033));
  frameRect(image, 39, 44, 50, 43, 3, orange);
  rect(image, 46, 51, 36, 17, color(0x0b1120));
  line(image, 50, 60, 60, 55, 2, teal);
  line(image, 60, 55, 77, 62, 2, red);
  rect(image, 48, 73, 8, 6, pale);
  rect(image, 61, 73, 8, 6, yellow);
  rect(image, 74, 73, 8, 6, teal);
  rect(image, 48, 88, 32, 16, color(0x334155));
  return image;
}

function shardLauncher() {
  const image = createCanvas();
  line(image, 27, 78, 96, 54, 12, color(0x334155));
  line(image, 33, 82, 99, 59, 6, color(0xc4b5fd));
  rect(image, 33, 74, 25, 13, color(0x111827));
  rect(image, 54, 66, 18, 8, magenta);
  diamond(image, 99, 58, 9, color(0x62f8d1));
  line(image, 75, 54, 101, 45, 4, color(0xe9d5ff));
  line(image, 78, 64, 106, 67, 4, color(0xe9d5ff));
  return image;
}

function shardLauncherPickup() {
  const image = createCanvas(96, 96);
  circle(image, 48, 48, 30, color(0x1f2937, 220));
  diamond(image, 48, 48, 22, magenta);
  diamond(image, 48, 48, 13, color(0x62f8d1));
  line(image, 30, 61, 68, 35, 5, color(0xe9d5ff));
  return image;
}

function warden() {
  const image = createCanvas();
  circle(image, 64, 34, 15, color(0x151f2e));
  circle(image, 57, 32, 3, red);
  circle(image, 71, 32, 3, red);
  rect(image, 45, 48, 38, 38, color(0x334155));
  frameRect(image, 45, 48, 38, 38, 4, color(0xffd166));
  rect(image, 35, 53, 13, 34, color(0x172033));
  rect(image, 80, 53, 13, 34, color(0x172033));
  line(image, 41, 87, 34, 109, 7, color(0x111827));
  line(image, 80, 87, 91, 109, 7, color(0x111827));
  rect(image, 26, 107, 18, 6, color(0x64748b));
  rect(image, 85, 107, 18, 6, color(0x64748b));
  diamond(image, 64, 67, 9, color(0xff5c7a));
  return image;
}

const assets = [
  ["assets/generated/event-v1/entities/armory-crate.png", armoryCrate()],
  ["assets/generated/event-v1/entities/calibration-kiosk.png", calibrationKiosk()],
  ["assets/generated/event-v1/entities/relay-tower.png", relayTower()],
  ["assets/generated/event-v1/entities/prototype-container.png", prototypeContainer()],
  ["assets/generated/event-v1/entities/test-terminal.png", testTerminal()],
  ["assets/generated/event-v1/weapons/shard-launcher.png", shardLauncher()],
  ["assets/generated/event-v1/weapons/shard-launcher-pickup.png", shardLauncherPickup()],
  ["assets/generated/event-v1/enemies/warden.png", warden()]
];

for (const [path, image] of assets) {
  writePng(path, image);
}

console.log(`generated ${assets.length} event-v1 assets`);
