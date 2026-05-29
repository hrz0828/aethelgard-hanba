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
  writeFileSync(
    path,
    Buffer.concat([pngSignature, pngChunk("IHDR", ihdr), pngChunk("IDAT", deflateSync(scanlines)), pngChunk("IEND")])
  );
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
    circle(image, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness / 2, rgba);
  }
}

function frameRect(image, x, y, width, height, thickness, rgba) {
  rect(image, x, y, width, thickness, rgba);
  rect(image, x, y + height - thickness, width, thickness, rgba);
  rect(image, x, y, thickness, height, rgba);
  rect(image, x + width - thickness, y, thickness, height, rgba);
}

function hashNoise(x, y) {
  let value = x * 374761393 + y * 668265263;
  value = (value ^ (value >> 13)) * 1274126177;
  return ((value ^ (value >> 16)) >>> 0) / 0xffffffff;
}

function addNoise(image) {
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;
      const shade = Math.floor((hashNoise(x, y) - 0.5) * 14);
      image.rgba[offset] = Math.max(0, Math.min(255, image.rgba[offset] + shade));
      image.rgba[offset + 1] = Math.max(0, Math.min(255, image.rgba[offset + 1] + shade));
      image.rgba[offset + 2] = Math.max(0, Math.min(255, image.rgba[offset + 2] + shade));
      image.rgba[offset + 3] = 255;
    }
  }
}

function generateMap() {
  const image = createCanvas(1024, 1024);
  rect(image, 0, 0, 1024, 1024, color(0x11161b));
  addNoise(image);

  const asphalt = color(0x242b31);
  const roadEdge = color(0x3f4a52);
  const concrete = color(0x30383e);
  const darkConcrete = color(0x1b2228);
  const grass = color(0x22342d);
  const sand = color(0x4d4935);
  const teal = color(0x62f8d1, 180);
  const blue = color(0x69a7ff, 170);
  const yellow = color(0xffd166, 190);

  rect(image, 470, 0, 84, 1024, asphalt);
  rect(image, 0, 470, 1024, 84, asphalt);
  line(image, 180, 840, 840, 180, 42, asphalt);
  line(image, 180, 184, 840, 844, 34, asphalt);
  line(image, 512, 0, 512, 1024, 2, roadEdge);
  line(image, 0, 512, 1024, 512, 2, roadEdge);
  line(image, 180, 840, 840, 180, 2, roadEdge);
  line(image, 180, 184, 840, 844, 2, roadEdge);

  circle(image, 512, 512, 124, color(0x202830));
  circle(image, 512, 512, 92, concrete);
  circle(image, 512, 512, 54, darkConcrete);
  frameRect(image, 438, 438, 148, 148, 5, color(0x55616a));

  const blocks = [
    [80, 86, 170, 120, concrete],
    [285, 95, 138, 175, darkConcrete],
    [610, 95, 210, 128, concrete],
    [802, 246, 128, 180, darkConcrete],
    [770, 604, 156, 210, concrete],
    [560, 760, 190, 136, darkConcrete],
    [258, 760, 174, 160, concrete],
    [82, 606, 168, 190, darkConcrete],
    [96, 318, 170, 120, grass],
    [640, 322, 154, 112, sand]
  ];

  for (const [x, y, w, h, fill] of blocks) {
    rect(image, x, y, w, h, fill);
    frameRect(image, x, y, w, h, 4, color(0x46515a));
    rect(image, x + 16, y + 16, Math.max(16, w - 32), 8, color(0x59646d, 210));
  }

  const poiPads = [
    [512, 205, blue],
    [802, 512, teal],
    [512, 820, yellow],
    [225, 512, blue],
    [512, 512, teal]
  ];

  for (const [x, y, accent] of poiPads) {
    circle(image, x, y, 38, color(0x1a2228));
    circle(image, x, y, 28, color(0x303a42));
    frameRect(image, x - 28, y - 28, 56, 56, 3, accent);
  }

  for (let index = 0; index < 85; index += 1) {
    const x = 24 + Math.floor(hashNoise(index, 8) * 976);
    const y = 24 + Math.floor(hashNoise(index, 19) * 976);
    const w = 6 + Math.floor(hashNoise(index, 31) * 18);
    const h = 4 + Math.floor(hashNoise(index, 41) * 16);
    rect(image, x, y, w, h, color(index % 3 === 0 ? 0x59646d : 0x384148, 185));
  }

  frameRect(image, 12, 12, 1000, 1000, 8, color(0x2a343b));
  return image;
}

writePng(join(root, "assets/generated/map-v1/aethelgard-hanba-city.png"), generateMap());
