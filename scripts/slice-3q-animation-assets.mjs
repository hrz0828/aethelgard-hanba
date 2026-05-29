import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pngSignature = Buffer.from("89504e470d0a1a0a", "hex");

const sources = {
  players: "assets/generated/animation-v1/sheets/scout-heavy-sheet.png",
  enemies: "assets/generated/animation-v1/sheets/enemy-sheet.png"
};

const playerFrames = [
  "characters/scout/idle.png",
  "characters/scout/move.png",
  "characters/scout/attack.png",
  "characters/scout/dodge.png",
  "characters/heavy/idle.png",
  "characters/heavy/move.png",
  "characters/heavy/attack.png",
  "characters/heavy/dodge.png"
];

const enemyFrames = [
  "enemies/burster/move.png",
  "enemies/burster/attack.png",
  "enemies/elite/move.png",
  "enemies/elite/attack.png"
];

const outputRoot = "assets/generated/animation-v1/runtime";

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
      rgba[targetOffset + 3] = sourceChannels === 4 ? scanline[sourceOffset + 3] : 255;
    }

    previous = scanline;
  }

  return { width, height, rgba };
}

function writePng(path, image) {
  mkdirSync(dirname(path), { recursive: true });
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
    image.rgba.copy(scanlines, rowOffset + 1, y * stride, y * stride + stride);
  }

  writeFileSync(
    path,
    Buffer.concat([pngSignature, pngChunk("IHDR", ihdr), pngChunk("IDAT", deflateSync(scanlines)), pngChunk("IEND")])
  );
}

function removeGreenBackground(image) {
  const rgba = Buffer.from(image.rgba);

  for (let offset = 0; offset < rgba.length; offset += 4) {
    const red = rgba[offset];
    const green = rgba[offset + 1];
    const blue = rgba[offset + 2];
    const looksLikeKey = green > 135 && green > red * 1.28 && green > blue * 1.28;

    if (looksLikeKey) {
      rgba[offset] = 0;
      rgba[offset + 1] = 0;
      rgba[offset + 2] = 0;
      rgba[offset + 3] = 0;
    }
  }

  return { ...image, rgba };
}

function findComponents(image) {
  const visited = new Uint8Array(image.width * image.height);
  const components = [];
  const stack = [];

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const index = y * image.width + x;
      const alpha = image.rgba[index * 4 + 3];

      if (visited[index] || alpha === 0) {
        continue;
      }

      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let count = 0;

      visited[index] = 1;
      stack.push(index);

      while (stack.length > 0) {
        const current = stack.pop();
        const cx = current % image.width;
        const cy = Math.floor(current / image.width);
        count += 1;
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);

        for (let ny = cy - 1; ny <= cy + 1; ny += 1) {
          for (let nx = cx - 1; nx <= cx + 1; nx += 1) {
            if (nx < 0 || ny < 0 || nx >= image.width || ny >= image.height) {
              continue;
            }

            const neighbor = ny * image.width + nx;
            if (visited[neighbor] || image.rgba[neighbor * 4 + 3] === 0) {
              continue;
            }

            visited[neighbor] = 1;
            stack.push(neighbor);
          }
        }
      }

      if (count > 900) {
        components.push({
          x: minX,
          y: minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
          count
        });
      }
    }
  }

  return components;
}

function cropImage(image, region, padding = 12) {
  const x = Math.max(0, region.x - padding);
  const y = Math.max(0, region.y - padding);
  const width = Math.min(image.width - x, region.width + padding * 2);
  const height = Math.min(image.height - y, region.height + padding * 2);
  const rgba = Buffer.alloc(width * height * 4);

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const sourceOffset = ((y + row) * image.width + x + column) * 4;
      const targetOffset = (row * width + column) * 4;
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

function scaleToMax(image, maxSize) {
  const largest = Math.max(image.width, image.height);
  if (largest <= maxSize) {
    return image;
  }

  const scale = maxSize / largest;
  return resizeNearest(image, Math.max(1, Math.round(image.width * scale)), Math.max(1, Math.round(image.height * scale)));
}

function sortComponentsByGrid(components, expectedCount) {
  if (components.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} components, found ${components.length}`);
  }

  const rows = expectedCount === 8 ? 2 : 2;
  const columns = expectedCount / rows;
  const sortedByY = [...components].sort((a, b) => a.y + a.height / 2 - (b.y + b.height / 2));
  const ordered = [];

  for (let row = 0; row < rows; row += 1) {
    const rowItems = sortedByY.slice(row * columns, row * columns + columns);
    rowItems.sort((a, b) => a.x + a.width / 2 - (b.x + b.width / 2));
    ordered.push(...rowItems);
  }

  return ordered;
}

function sliceSheet(sourcePath, frameNames, expectedCount) {
  const image = removeGreenBackground(readPng(join(root, sourcePath)));
  const components = sortComponentsByGrid(findComponents(image), expectedCount);

  for (let index = 0; index < frameNames.length; index += 1) {
    const frame = scaleToMax(cropImage(image, components[index], 16), 256);
    writePng(join(root, outputRoot, frameNames[index]), frame);
  }
}

function main() {
  sliceSheet(sources.players, playerFrames, 8);
  sliceSheet(sources.enemies, enemyFrames, 4);
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
