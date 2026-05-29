// @ts-expect-error -- The project intentionally does not install Node types.
import { readFileSync } from "node:fs";
// @ts-expect-error -- The project intentionally does not install Node types.
import { join } from "node:path";
import { describe, expect, it } from "vitest";

declare const process: { cwd(): string };

describe("game scene performance budget", () => {
  it("does not build the world background with thousands of RenderTexture drawFrame calls", () => {
    const sceneSource = readFileSync(join(process.cwd(), "src/scenes/GameScene.ts"), "utf8");

    expect(sceneSource).not.toContain("RenderTexture");
    expect(sceneSource).not.toContain("drawFrame(");
    expect(sceneSource).toContain("TEXTURE_KEYS.worldMapV1");
  });
});
