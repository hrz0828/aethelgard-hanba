import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pngSignature = Buffer.from("89504e470d0a1a0a", "hex");

const source = {
  scout: "assets/kenney-topdown/extracted/PNG/Woman Green/womanGreen_stand.png",
  heavy: "assets/kenney-topdown/extracted/PNG/Robot 1/robot1_stand.png",
  burster: "assets/kenney-topdown/extracted/PNG/Man Brown/manBrown_stand.png",
  elite: "assets/kenney-topdown/extracted/PNG/Hitman 1/hitman1_stand.png",
  pulse: "assets/kenney-topdown/extracted/PNG/weapon_gun.png",
  arc: "assets/kenney-topdown/extracted/PNG/weapon_silencer.png",
  beam: "assets/kenney-topdown/extracted/PNG/weapon_machine.png",
  scoutPreview:
    "assets/kenney-topdown/extracted/PNG/Woman Green/womanGreen_gun.png",
  heavyPreview:
    "assets/kenney-topdown/extracted/PNG/Robot 1/robot1_machine.png",
  phase2Sheet: "assets/generated/preview/phase2-generated-model-sheet.png",
};

const output = {
  scout: "assets/generated/runtime/characters/scout-optimized.png",
  heavy: "assets/generated/runtime/characters/heavy-optimized.png",
  burster: "assets/generated/runtime/enemies/burster-optimized.png",
  elite: "assets/generated/runtime/enemies/elite-optimized.png",
  pulse: "assets/generated/runtime/weapons/pulse-rifle.png",
  arc: "assets/generated/runtime/weapons/arc-gun.png",
  beam: "assets/generated/runtime/weapons/beam-cannon.png",
  scoutPreview: "assets/generated/preview/scout-with-pulse-rifle.png",
  heavyPreview: "assets/generated/preview/heavy-with-beam-cannon.png",
  scoutV2: "assets/generated/runtime-v2/characters/scout.png",
  heavyV2: "assets/generated/runtime-v2/characters/heavy.png",
  bursterV2: "assets/generated/runtime-v2/enemies/burster.png",
  eliteV2: "assets/generated/runtime-v2/enemies/elite.png",
  pulseV2: "assets/generated/runtime-v2/weapons/pulse-rifle.png",
  arcV2: "assets/generated/runtime-v2/weapons/arc-gun.png",
  beamV2: "assets/generated/runtime-v2/weapons/beam-cannon.png",
};

const phase2Regions = {
  scoutV2: { x: 80, y: 110, width: 300, height: 410, maxSize: 256 },
  heavyV2: { x: 430, y: 105, width: 300, height: 430, maxSize: 256 },
  bursterV2: { x: 760, y: 105, width: 310, height: 430, maxSize: 256 },
  eliteV2: { x: 1165, y: 105, width: 310, height: 430, maxSize: 256 },
  pulseV2: { x: 55, y: 680, width: 330, height: 190, maxSize: 256 },
  arcV2: { x: 470, y: 665, width: 405, height: 205, maxSize: 256 },
  beamV2: { x: 995, y: 665, width: 465, height: 205, maxSize: 256 },
};

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
  const typeBuffer = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);

  return chunk;
}

function readPng(path) {
  const buffer = readFileSync(path);

  if (!buffer.subarray(0, 8).equals(pngSignature)) {
    throw new Error(`${path} is not a PNG file`);
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }

    offset += length + 12;
  }

  if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
    throw new Error(`${path} must be an 8-bit RGB or RGBA PNG`);
  }

  const sourceChannels = colorType === 6 ? 4 : 3;
  const bytesPerPixel = sourceChannels;
  const stride = width * sourceChannels;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const rgba = Buffer.alloc(width * height * 4);
  let readOffset = 0;
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated.readUInt8(readOffset);
    readOffset += 1;
    const scanline = Buffer.from(inflated.subarray(readOffset, readOffset + stride));
    readOffset += stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? scanline[x - bytesPerPixel] : 0;
      const up = previous[x] ?? 0;
      const upLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;

      if (filter === 1) {
        scanline[x] = (scanline[x] + left) & 0xff;
      } else if (filter === 2) {
        scanline[x] = (scanline[x] + up) & 0xff;
      } else if (filter === 3) {
        scanline[x] = (scanline[x] + Math.floor((left + up) / 2)) & 0xff;
      } else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        scanline[x] = (scanline[x] + predictor) & 0xff;
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter ${filter} in ${path}`);
      }
    }

    for (let x = 0; x < width; x += 1) {
      const sourceOffset = x * sourceChannels;
      const targetOffset = (y * width + x) * 4;
      rgba[targetOffset] = scanline[sourceOffset];
      rgba[targetOffset + 1] = scanline[sourceOffset + 1];
      rgba[targetOffset + 2] = scanline[sourceOffset + 2];
      rgba[targetOffset + 3] =
        sourceChannels === 4 ? scanline[sourceOffset + 3] : 255;
    }

    previous = scanline;
  }

  return { width, height, rgba };
}

function scaleNearest(image, scale) {
  const width = image.width * scale;
  const height = image.height * scale;
  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    const sourceY = Math.floor(y / scale);

    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.floor(x / scale);
      const sourceOffset = (sourceY * image.width + sourceX) * 4;
      const targetOffset = (y * width + x) * 4;
      image.rgba.copy(rgba, targetOffset, sourceOffset, sourceOffset + 4);
    }
  }

  return { width, height, rgba };
}

function resizeNearest(image, targetWidth, targetHeight) {
  const rgba = Buffer.alloc(targetWidth * targetHeight * 4);

  for (let y = 0; y < targetHeight; y += 1) {
    const sourceY = Math.min(image.height - 1, Math.floor((y / targetHeight) * image.height));

    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = Math.min(image.width - 1, Math.floor((x / targetWidth) * image.width));
      const sourceOffset = (sourceY * image.width + sourceX) * 4;
      const targetOffset = (y * targetWidth + x) * 4;
      image.rgba.copy(rgba, targetOffset, sourceOffset, sourceOffset + 4);
    }
  }

  return { width: targetWidth, height: targetHeight, rgba };
}

function cropImage(image, region) {
  const rgba = Buffer.alloc(region.width * region.height * 4);

  for (let y = 0; y < region.height; y += 1) {
    for (let x = 0; x < region.width; x += 1) {
      const sourceX = region.x + x;
      const sourceY = region.y + y;
      const sourceOffset = (sourceY * image.width + sourceX) * 4;
      const targetOffset = (y * region.width + x) * 4;
      image.rgba.copy(rgba, targetOffset, sourceOffset, sourceOffset + 4);
    }
  }

  return { width: region.width, height: region.height, rgba };
}

function removeGreenBackground(image) {
  const rgba = Buffer.from(image.rgba);

  for (let offset = 0; offset < rgba.length; offset += 4) {
    const red = rgba[offset];
    const green = rgba[offset + 1];
    const blue = rgba[offset + 2];
    const looksLikeKey = green > 150 && red < 110 && blue < 110 && green > red * 1.45 && green > blue * 1.45;

    if (looksLikeKey) {
      rgba[offset] = 0;
      rgba[offset + 1] = 0;
      rgba[offset + 2] = 0;
      rgba[offset + 3] = 0;
    }
  }

  return { ...image, rgba };
}

function trimTransparent(image, padding = 8) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const alpha = image.rgba[(y * image.width + x) * 4 + 3];

      if (alpha > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return image;
  }

  return cropImage(image, {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: Math.min(image.width - Math.max(0, minX - padding), maxX - minX + padding * 2 + 1),
    height: Math.min(image.height - Math.max(0, minY - padding), maxY - minY + padding * 2 + 1),
  });
}

function scaleToMax(image, maxSize) {
  const largestSide = Math.max(image.width, image.height);

  if (largestSide <= maxSize) {
    return image;
  }

  const scale = maxSize / largestSide;
  return resizeNearest(image, Math.max(1, Math.round(image.width * scale)), Math.max(1, Math.round(image.height * scale)));
}

function writePng(path, image) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(image.width, 0);
  ihdr.writeUInt32BE(image.height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const stride = image.width * 4;
  const scanlines = Buffer.alloc((stride + 1) * image.height);

  for (let y = 0; y < image.height; y += 1) {
    const rowOffset = y * (stride + 1);
    scanlines[rowOffset] = 0;
    image.rgba.copy(
      scanlines,
      rowOffset + 1,
      y * stride,
      y * stride + stride,
    );
  }

  writeFileSync(
    path,
    Buffer.concat([
      pngSignature,
      pngChunk("IHDR", ihdr),
      pngChunk("IDAT", deflateSync(scanlines)),
      pngChunk("IEND"),
    ]),
  );
}

function ensureParent(relativePath) {
  mkdirSync(dirname(join(root, relativePath)), { recursive: true });
}

function readPngSize(relativePath) {
  const buffer = readFileSync(join(root, relativePath));
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function copyAsset(from, to) {
  ensureParent(to);
  copyFileSync(join(root, from), join(root, to));
}

function scaleAssetToMinimum(from, to, minimumSize) {
  const sourceSize = readPngSize(from);
  const scale = Math.max(
    1,
    Math.ceil(minimumSize / sourceSize.width),
    Math.ceil(minimumSize / sourceSize.height),
  );

  ensureParent(to);

  if (scale === 1) {
    copyAsset(from, to);
    return;
  }

  const image = scaleNearest(readPng(join(root, from)), scale);
  writePng(join(root, to), image);
}

function main() {
  scaleAssetToMinimum(source.scout, output.scout, 32);
  scaleAssetToMinimum(source.heavy, output.heavy, 32);
  scaleAssetToMinimum(source.burster, output.burster, 32);
  scaleAssetToMinimum(source.elite, output.elite, 32);
  scaleAssetToMinimum(source.pulse, output.pulse, 32);
  scaleAssetToMinimum(source.arc, output.arc, 32);
  scaleAssetToMinimum(source.beam, output.beam, 32);
  scaleAssetToMinimum(source.scoutPreview, output.scoutPreview, 128);
  scaleAssetToMinimum(source.heavyPreview, output.heavyPreview, 128);

  const phase2Sheet = readPng(join(root, source.phase2Sheet));
  for (const [key, region] of Object.entries(phase2Regions)) {
    const cropped = cropImage(phase2Sheet, region);
    const transparent = trimTransparent(removeGreenBackground(cropped), 10);
    const runtime = scaleToMax(transparent, region.maxSize);
    ensureParent(output[key]);
    writePng(join(root, output[key]), runtime);
  }
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
