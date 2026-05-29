# Neon Relic Survivor 3/4 Animation Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and slice a first-pass 3/4 top-down animation sample set where player and enemy motion shows hands, legs, feet, and attack posture.

**Architecture:** Keep this as asset staging first. Store generated sheets and transparent runtime frames under `assets/generated/animation-v1/`, validate the expected frame files with tests, and do not change Phaser runtime code until the visual frames are approved.

**Tech Stack:** Image generation, PNG assets, dependency-free Node PNG slicing helpers, Vitest, TypeScript, Vite.

---

## File Structure

- `assets/generated/animation-v1/sheets/`: generated 3/4 animation concept sheets.
- `assets/generated/animation-v1/runtime/characters/scout/`: sliced Scout frames.
- `assets/generated/animation-v1/runtime/characters/heavy/`: sliced Heavy frames.
- `assets/generated/animation-v1/runtime/enemies/burster/`: sliced Burster frames.
- `assets/generated/animation-v1/runtime/enemies/elite/`: sliced Elite frames.
- `scripts/slice-3q-animation-assets.mjs`: slices generated sheets into transparent frame PNGs.
- `tests/assets/animation-assets.test.ts`: validates frame presence, PNG format, dimensions, and transparent corners.

---

### Task 1: Generate 3/4 Animation Source Sheets

**Files:**
- Create by image generation: `assets/generated/animation-v1/sheets/scout-heavy-sheet.png`
- Create by image generation: `assets/generated/animation-v1/sheets/enemy-sheet.png`
- Test: `tests/assets/animation-assets.test.ts`

- [ ] **Step 1: Write the failing source-sheet test**

Create `tests/assets/animation-assets.test.ts`:

```ts
// @ts-expect-error -- The project intentionally does not install Node types.
import { existsSync, readFileSync } from "node:fs";
// @ts-expect-error -- The project intentionally does not install Node types.
import { join } from "node:path";
import { describe, expect, it } from "vitest";

declare const process: { cwd(): string };

const root = process.cwd();

function readPngSize(path: string): { width: number; height: number } {
  const buffer = readFileSync(path);
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
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
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npm test -- tests/assets/animation-assets.test.ts
```

Expected: fail because the generated source sheets do not exist yet.

- [ ] **Step 3: Generate the Scout/Heavy sheet**

Use image generation with this prompt:

```text
Create a 3/4 top-down 2D game sprite sheet on a perfectly flat solid #00ff00 chroma-key background.

Sheet layout: 2 rows x 4 columns, generous spacing, no labels, no text.

Row 1: Scout player character frames: idle, move, attack, dodge.
Row 2: Heavy player character frames: idle, move, attack, dodge.

Style: readable stylized 2D action game sprites, near-top-down 3/4 perspective, crisp edges, compact browser-game proportions.

Scout: nimble human character, visible head, torso, hands, legs, and feet. Lightweight armor. Move frame must show leg/foot motion. Attack frame must show arms and grip posture shifted as if firing. Dodge frame must show a lowered or lunging pose.

Heavy: broad armored human character, visible head, torso, hands, legs, and feet. Move frame must show leg/foot motion. Attack frame must show arms and grip posture shifted as if firing. Dodge frame must show heavy braced movement.

Important: Weapons should not be permanently baked into the runtime character body. Hands and grip posture are allowed, but keep weapon detail minimal so a standalone weapon layer can be rendered separately.

Background: perfectly flat solid #00ff00 chroma-key background only. No shadows, no gradients, no floor plane, no watermark, no UI.
```

Save the selected generated image to:

```text
assets/generated/animation-v1/sheets/scout-heavy-sheet.png
```

- [ ] **Step 4: Generate the Burster/Elite sheet**

Use image generation with this prompt:

```text
Create a 3/4 top-down 2D game enemy sprite sheet on a perfectly flat solid #00ff00 chroma-key background.

Sheet layout: 2 rows x 2 columns, generous spacing, no labels, no text.

Row 1: Burster enemy frames: move, attack.
Row 2: Elite enemy frames: move, attack.

Style: readable stylized 2D action game sprites, near-top-down 3/4 perspective, crisp edges, compact browser-game proportions.

Burster: unstable mutated enemy, ruptured posture, visible limbs or claws, move frame leaning forward, attack frame more aggressive with arms/claws extended. Do not use a glow ring or aura.

Elite: high-tier humanoid enemy, armored or enhanced silhouette, visible legs/feet and arms, move frame shows pressure forward, attack frame shows weapon or arm posture. Do not use a glow ring or aura.

Background: perfectly flat solid #00ff00 chroma-key background only. No shadows, no gradients, no floor plane, no watermark, no UI.
```

Save the selected generated image to:

```text
assets/generated/animation-v1/sheets/enemy-sheet.png
```

- [ ] **Step 5: Run the source-sheet test again**

Run:

```bash
npm test -- tests/assets/animation-assets.test.ts
```

Expected: pass.

---

### Task 2: Slice Animation Sheets Into Transparent Runtime Frames

**Files:**
- Create: `scripts/slice-3q-animation-assets.mjs`
- Modify: `tests/assets/animation-assets.test.ts`
- Create by script: `assets/generated/animation-v1/runtime/characters/scout/idle.png`
- Create by script: `assets/generated/animation-v1/runtime/characters/scout/move.png`
- Create by script: `assets/generated/animation-v1/runtime/characters/scout/attack.png`
- Create by script: `assets/generated/animation-v1/runtime/characters/scout/dodge.png`
- Create by script: `assets/generated/animation-v1/runtime/characters/heavy/idle.png`
- Create by script: `assets/generated/animation-v1/runtime/characters/heavy/move.png`
- Create by script: `assets/generated/animation-v1/runtime/characters/heavy/attack.png`
- Create by script: `assets/generated/animation-v1/runtime/characters/heavy/dodge.png`
- Create by script: `assets/generated/animation-v1/runtime/enemies/burster/move.png`
- Create by script: `assets/generated/animation-v1/runtime/enemies/burster/attack.png`
- Create by script: `assets/generated/animation-v1/runtime/enemies/elite/move.png`
- Create by script: `assets/generated/animation-v1/runtime/enemies/elite/attack.png`

- [ ] **Step 1: Extend the test for runtime frames**

Append to `tests/assets/animation-assets.test.ts`:

```ts
// @ts-expect-error -- The project intentionally does not install Node types.
import { inflateSync } from "node:zlib";

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

function expectTransparentCorners(path: string): void {
  const buffer = readFileSync(path);
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

describe("3/4 runtime animation frames", () => {
  it("slices source sheets into compact transparent runtime frames", () => {
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
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npm test -- tests/assets/animation-assets.test.ts
```

Expected: fail because runtime frame PNGs do not exist.

- [ ] **Step 3: Add dependency-free slicing script**

Create `scripts/slice-3q-animation-assets.mjs`. It should:

- read PNGs without adding dependencies,
- crop fixed regions from the two source sheets,
- remove the green chroma-key background by setting alpha to `0`,
- trim transparent padding,
- scale each frame to a maximum side of `256`,
- write RGBA PNGs to the runtime frame paths.

Reuse the PNG helper approach from `scripts/compose-generated-assets.mjs` so no dependency is needed.

Use this region mapping as the initial implementation. Adjust only if the generated sheet layout differs:

```js
const scoutHeavyRegions = {
  "characters/scout/idle.png": { x: 60, y: 70, width: 300, height: 360 },
  "characters/scout/move.png": { x: 430, y: 70, width: 300, height: 360 },
  "characters/scout/attack.png": { x: 800, y: 70, width: 300, height: 360 },
  "characters/scout/dodge.png": { x: 1170, y: 70, width: 300, height: 360 },
  "characters/heavy/idle.png": { x: 60, y: 520, width: 300, height: 390 },
  "characters/heavy/move.png": { x: 430, y: 520, width: 300, height: 390 },
  "characters/heavy/attack.png": { x: 800, y: 520, width: 300, height: 390 },
  "characters/heavy/dodge.png": { x: 1170, y: 520, width: 300, height: 390 }
};

const enemyRegions = {
  "enemies/burster/move.png": { x: 120, y: 110, width: 430, height: 360 },
  "enemies/burster/attack.png": { x: 680, y: 110, width: 430, height: 360 },
  "enemies/elite/move.png": { x: 120, y: 560, width: 430, height: 360 },
  "enemies/elite/attack.png": { x: 680, y: 560, width: 430, height: 360 }
};
```

- [ ] **Step 4: Run the slicing script**

Run:

```bash
node scripts/slice-3q-animation-assets.mjs
```

Expected: 12 runtime PNG frame files are written under `assets/generated/animation-v1/runtime/`.

- [ ] **Step 5: Run the frame test again**

Run:

```bash
npm test -- tests/assets/animation-assets.test.ts
```

Expected: pass.

---

### Task 3: Validate and Document Animation Asset Staging

**Files:**
- Create: `assets/generated/animation-v1/README.md`
- Modify: `tests/assets/animation-assets.test.ts`

- [ ] **Step 1: Extend test for animation asset documentation**

Append to `tests/assets/animation-assets.test.ts`:

```ts
it("documents the runtime boundary for animation assets", () => {
  const readme = readFileSync(join(root, "assets/generated/animation-v1/README.md"), "utf8");
  expect(readme).toContain("3/4 top-down");
  expect(readme).toContain("weapons remain independent");
  expect(readme).toContain("not wired into Phaser runtime yet");
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npm test -- tests/assets/animation-assets.test.ts
```

Expected: fail because `assets/generated/animation-v1/README.md` does not exist.

- [ ] **Step 3: Add README**

Create `assets/generated/animation-v1/README.md`:

```md
# Animation V1 Staging

This folder contains first-pass 3/4 top-down animation assets for Neon Relic Survivor.

The runtime frames are staged for visual review. They are not wired into Phaser runtime yet.

Player frames are organized by character and state:

- `idle`
- `move`
- `attack`
- `dodge`

Enemy frames are organized by enemy and state:

- `move`
- `attack`

Weapons remain independent runtime assets and should continue to render as a separate layer from the character model.
```

- [ ] **Step 4: Run validation**

Run:

```bash
npm test -- tests/assets/animation-assets.test.ts
```

Expected: pass.

---

### Task 4: Final Verification

**Files:**
- Test: `tests/assets/animation-assets.test.ts`

- [ ] **Step 1: Run asset tests**

Run:

```bash
npm test -- tests/assets/generated-assets.test.ts tests/assets/animation-assets.test.ts
```

Expected: pass.

- [ ] **Step 2: Run full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: build succeeds. The existing Vite chunk-size warning may remain.

- [ ] **Step 4: Manual visual inspection**

Inspect:

```text
assets/generated/animation-v1/sheets/scout-heavy-sheet.png
assets/generated/animation-v1/sheets/enemy-sheet.png
assets/generated/animation-v1/runtime/characters/scout/move.png
assets/generated/animation-v1/runtime/characters/scout/attack.png
assets/generated/animation-v1/runtime/characters/heavy/move.png
assets/generated/animation-v1/runtime/enemies/burster/attack.png
assets/generated/animation-v1/runtime/enemies/elite/attack.png
```

Expected: 3/4 top-down angle reads clearly, hands/legs/feet are visible in player frames, and attack frames show posture changes.

