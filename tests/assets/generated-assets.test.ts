// @ts-expect-error -- The project intentionally does not install Node types.
import { existsSync, readFileSync } from "node:fs";
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

const expectedAssets = [
  "assets/generated/runtime/characters/scout-optimized.png",
  "assets/generated/runtime/characters/heavy-optimized.png",
  "assets/generated/runtime/enemies/burster-optimized.png",
  "assets/generated/runtime/enemies/elite-optimized.png",
  "assets/generated/runtime/weapons/pulse-rifle.png",
  "assets/generated/runtime/weapons/arc-gun.png",
  "assets/generated/runtime/weapons/beam-cannon.png",
  "assets/generated/preview/scout-with-pulse-rifle.png",
  "assets/generated/preview/heavy-with-beam-cannon.png",
  "assets/generated/preview/phase2-generated-model-sheet.png",
];

const expectedRuntimeV2Assets = [
  "assets/generated/runtime-v2/characters/scout.png",
  "assets/generated/runtime-v2/characters/heavy.png",
  "assets/generated/runtime-v2/enemies/burster.png",
  "assets/generated/runtime-v2/enemies/elite.png",
  "assets/generated/runtime-v2/weapons/pulse-rifle.png",
  "assets/generated/runtime-v2/weapons/arc-gun.png",
  "assets/generated/runtime-v2/weapons/beam-cannon.png",
];

const expectedEventV1Assets = [
  "assets/generated/event-v1/entities/armory-crate.png",
  "assets/generated/event-v1/entities/calibration-kiosk.png",
  "assets/generated/event-v1/entities/relay-tower.png",
  "assets/generated/event-v1/entities/prototype-container.png",
  "assets/generated/event-v1/entities/test-terminal.png",
  "assets/generated/event-v1/weapons/shard-launcher.png",
  "assets/generated/event-v1/weapons/shard-launcher-pickup.png",
  "assets/generated/event-v1/enemies/warden.png",
];

const expectedMapV1Assets = ["assets/generated/map-v1/aethelgard-hanba-city.png"];
const expectedUiAssets = ["assets/generated/ui/dodge-roll-icon.png"];

function readPngSize(path: string): { width: number; height: number } {
  const buffer = readFileSync(path);
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readPngColorType(path: string): number {
  const buffer = readFileSync(path);
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return buffer.readUInt8(25);
}

function expectTransparentPngCorners(path: string): void {
  const buffer = readFileSync(path);
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
  expect(inflated[4]).toBe(0);
}

describe("generated 2D asset samples", () => {
  it("creates every runtime and preview asset required by the sample spec", () => {
    for (const asset of expectedAssets) {
      expect(existsSync(join(root, asset)), asset).toBe(true);
    }
  });

  it("keeps runtime assets compact and previews large enough to inspect", () => {
    for (const asset of expectedAssets) {
      const size = readPngSize(join(root, asset));

      if (asset.includes("/preview/")) {
        expect(size.width).toBeGreaterThanOrEqual(128);
        expect(size.height).toBeGreaterThanOrEqual(128);
      } else {
        expect(size.width).toBeGreaterThanOrEqual(32);
        expect(size.height).toBeGreaterThanOrEqual(32);
        expect(size.width).toBeLessThanOrEqual(256);
        expect(size.height).toBeLessThanOrEqual(256);
      }
    }
  });

  it("slices generated model sheet into transparent runtime-v2 assets", () => {
    for (const asset of expectedRuntimeV2Assets) {
      const path = join(root, asset);
      expect(existsSync(path), asset).toBe(true);
      const size = readPngSize(path);
      expect(size.width).toBeGreaterThanOrEqual(32);
      expect(size.height).toBeGreaterThanOrEqual(32);
      expect(size.width).toBeLessThanOrEqual(256);
      expect(size.height).toBeLessThanOrEqual(256);
      expect(readPngColorType(path)).toBe(6);
      expectTransparentPngCorners(path);
    }
  });

  it("creates transparent event-v1 entity, weapon, and monster assets", () => {
    for (const asset of expectedEventV1Assets) {
      const path = join(root, asset);
      expect(existsSync(path), asset).toBe(true);
      const size = readPngSize(path);
      expect(size.width).toBeGreaterThanOrEqual(64);
      expect(size.height).toBeGreaterThanOrEqual(64);
      expect(size.width).toBeLessThanOrEqual(128);
      expect(size.height).toBeLessThanOrEqual(128);
      expect(readPngColorType(path)).toBe(6);
      expectTransparentPngCorners(path);
    }
  });

  it("creates a compact static map background for runtime loading", () => {
    for (const asset of expectedMapV1Assets) {
      const path = join(root, asset);
      expect(existsSync(path), asset).toBe(true);
      const size = readPngSize(path);
      expect(size.width).toBeLessThanOrEqual(1536);
      expect(size.height).toBeLessThanOrEqual(1536);
      expect(readPngColorType(path)).toBe(6);
    }
  });

  it("creates standalone UI skill icons", () => {
    for (const asset of expectedUiAssets) {
      const path = join(root, asset);
      expect(existsSync(path), asset).toBe(true);
      const size = readPngSize(path);
      expect(size.width).toBe(96);
      expect(size.height).toBe(96);
      expect(readPngColorType(path)).toBe(6);
    }
  });

  it("documents that weapons are standalone runtime assets", () => {
    const readme = readFileSync(join(root, "assets/generated/README.md"), "utf8");
    expect(readme).toContain("standalone weapon assets");
    expect(readme).toContain("Preview compositions are not runtime sprites");
    expect(readme).toContain("human-readable character models");
  });

  it("keeps generation prompts aligned with the approved asset constraints", () => {
    const prompts = readFileSync(
      join(root, "docs/superpowers/specs/2026-05-28-neon-relic-survivor-2d-generation-prompts.md"),
      "utf8",
    );
    expect(prompts).toContain("visible head, torso, two legs, and two feet");
    expect(prompts).toContain("standalone weapon PNG");
    expect(prompts).toContain("flat chroma-key background");
  });
});
