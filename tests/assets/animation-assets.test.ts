// @ts-expect-error -- The project intentionally does not install Node types.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
// @ts-expect-error -- The project intentionally does not install Node types.
import { join } from "node:path";
// @ts-expect-error -- The project intentionally does not install Node types.
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";

declare const process: { cwd(): string };
declare const Buffer: {
  concat(chunks: Uint8Array[]): Uint8Array;
};

const root = process.cwd();
const runtimeRoot = "assets/generated/animation-v1/runtime";

function readPngSize(path: string): { width: number; height: number } {
  const buffer = readFileSync(path);
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

const runtimeFrames = [
  "assets/generated/animation-v1/runtime/characters/scout/idle.png",
  "assets/generated/animation-v1/runtime/characters/scout/move.png",
  "assets/generated/animation-v1/runtime/characters/scout/attack.png",
  "assets/generated/animation-v1/runtime/characters/scout/dodge.png",
  "assets/generated/animation-v1/runtime/characters/heavy/idle.png",
  "assets/generated/animation-v1/runtime/characters/heavy/move.png",
  "assets/generated/animation-v1/runtime/characters/heavy/attack.png",
  "assets/generated/animation-v1/runtime/characters/heavy/dodge.png",
  "assets/generated/animation-v1/runtime/enemies/burster/move.png",
  "assets/generated/animation-v1/runtime/enemies/burster/attack.png",
  "assets/generated/animation-v1/runtime/enemies/elite/move.png",
  "assets/generated/animation-v1/runtime/enemies/elite/attack.png"
];

function readPngColorType(path: string): number {
  const buffer = readFileSync(path);
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return buffer.readUInt8(25);
}

function readPngRgba(path: string): { width: number; height: number; rgba: Uint8Array } {
  const buffer = readFileSync(path);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer.readUInt8(25);
  expect(colorType).toBe(6);

  const idatChunks: Uint8Array[] = [];
  let offset = 8;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IDAT") {
      idatChunks.push(data);
    }

    if (type === "IEND") {
      break;
    }

    offset += length + 12;
  }

  const inflated = inflateSync(Buffer.concat(idatChunks));
  const stride = width * 4;
  const rgba = new Uint8Array(width * height * 4);
  let readOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated.readUInt8(readOffset);
    expect(filter).toBe(0);
    readOffset += 1;
    rgba.set(
      inflated.subarray(readOffset, readOffset + stride),
      y * stride
    );
    readOffset += stride;
  }

  return { width, height, rgba };
}

function expectTransparentCorners(path: string): void {
  const image = readPngRgba(path);
  const corners = [
    0,
    (image.width - 1) * 4,
    ((image.height - 1) * image.width) * 4,
    ((image.height - 1) * image.width + image.width - 1) * 4
  ];

  for (const offset of corners) {
    expect(image.rgba[offset]).toBe(0);
    expect(image.rgba[offset + 1]).toBe(0);
    expect(image.rgba[offset + 2]).toBe(0);
    expect(image.rgba[offset + 3]).toBe(0);
  }
}

function listRuntimePngs(directory: string): string[] {
  const entries = readdirSync(join(root, directory));
  const pngs: string[] = [];

  for (const entry of entries) {
    const relativePath = join(directory, entry);
    const absolutePath = join(root, relativePath);

    if (statSync(absolutePath).isDirectory()) {
      pngs.push(...listRuntimePngs(relativePath));
    } else if (entry.endsWith(".png")) {
      pngs.push(relativePath);
    }
  }

  return pngs;
}

describe("3/4 animation source sheets", () => {
  it("stores generated source sheets for player and enemy animation frames", () => {
    const sheets = [
      "assets/generated/animation-v1/sheets/scout-heavy-sheet.png",
      "assets/generated/animation-v1/sheets/enemy-sheet.png"
    ];

    for (const sheet of sheets) {
      const path = join(root, sheet);
      expect(existsSync(path), sheet).toBe(true);
      const size = readPngSize(path);
      expect(size.width).toBeGreaterThanOrEqual(512);
      expect(size.height).toBeGreaterThanOrEqual(512);
    }
  });
});

describe("3/4 runtime animation frames", () => {
  it("slices source sheets into compact transparent runtime frames", () => {
    expect(listRuntimePngs(runtimeRoot).sort()).toEqual([...runtimeFrames].sort());

    for (const frame of runtimeFrames) {
      const path = join(root, frame);
      expect(existsSync(path), frame).toBe(true);
      const size = readPngSize(path);
      expect(size.width).toBeGreaterThanOrEqual(64);
      expect(size.height).toBeGreaterThanOrEqual(64);
      expect(size.width).toBeLessThanOrEqual(256);
      expect(size.height).toBeLessThanOrEqual(256);
      expect(readPngColorType(path)).toBe(6);
      expectTransparentCorners(path);
    }
  });
});

describe("3/4 animation asset documentation", () => {
  it("documents the runtime boundary for animation assets", () => {
    const readme = readFileSync(join(root, "assets/generated/animation-v1/README.md"), "utf8");
    expect(readme).toContain("3/4 top-down");
    expect(readme).toContain("weapons remain independent");
    expect(readme).toContain("not wired into Phaser runtime yet");
  });
});
