# Neon Relic Survivor 2D Asset Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a first-pass 2D asset sample set where characters, monsters, and weapons are readable as separate reusable game assets.

**Architecture:** Stage assets under `assets/generated/` without changing game rules. Use existing Kenney/CC0 assets as the Phase 1 source, create optimized runtime PNGs and preview compositions, then validate file presence and image dimensions with lightweight tests. Runtime integration is intentionally left for a later plan after visual approval.

**Tech Stack:** TypeScript, Vite, Vitest, PNG assets, Node file validation.

---

## File Structure

- `assets/generated/runtime/characters/`: optimized character PNGs.
- `assets/generated/runtime/enemies/`: optimized monster PNGs.
- `assets/generated/runtime/weapons/`: standalone weapon PNGs.
- `assets/generated/preview/`: preview compositions showing characters holding weapons.
- `tests/assets/generated-assets.test.ts`: validates asset presence and basic PNG readability.
- `scripts/compose-generated-assets.mjs`: creates Phase 1 optimized assets from existing CC0 source PNGs.

---

### Task 1: Create Phase 1 Asset Staging and Validation

**Files:**
- Create: `scripts/compose-generated-assets.mjs`
- Create: `tests/assets/generated-assets.test.ts`
- Create by script: `assets/generated/runtime/characters/scout-optimized.png`
- Create by script: `assets/generated/runtime/characters/heavy-optimized.png`
- Create by script: `assets/generated/runtime/enemies/burster-optimized.png`
- Create by script: `assets/generated/runtime/enemies/elite-optimized.png`
- Create by script: `assets/generated/runtime/weapons/pulse-rifle.png`
- Create by script: `assets/generated/runtime/weapons/arc-gun.png`
- Create by script: `assets/generated/runtime/weapons/beam-cannon.png`
- Create by script: `assets/generated/preview/scout-with-pulse-rifle.png`
- Create by script: `assets/generated/preview/heavy-with-beam-cannon.png`

- [ ] **Step 1: Write the failing asset validation test**

Create `tests/assets/generated-assets.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

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
  "assets/generated/preview/heavy-with-beam-cannon.png"
];

function readPngSize(path: string): { width: number; height: number } {
  const buffer = readFileSync(path);
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
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
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npm test -- tests/assets/generated-assets.test.ts
```

Expected: fail because the `assets/generated/` PNGs do not exist yet.

- [ ] **Step 3: Add the asset composition script**

Create `scripts/compose-generated-assets.mjs`:

```js
import { mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const source = {
  scout: "assets/kenney-topdown/extracted/PNG/Woman Green/womanGreen_stand.png",
  heavy: "assets/kenney-topdown/extracted/PNG/Robot 1/robot1_stand.png",
  burster: "assets/kenney-topdown/extracted/PNG/Man Brown/manBrown_stand.png",
  elite: "assets/kenney-topdown/extracted/PNG/Hitman 1/hitman1_stand.png",
  pulse: "assets/kenney-topdown/extracted/PNG/weapon_gun.png",
  arc: "assets/kenney-topdown/extracted/PNG/weapon_silencer.png",
  beam: "assets/kenney-topdown/extracted/PNG/weapon_machine.png",
  scoutPreview: "assets/kenney-topdown/extracted/PNG/Woman Green/womanGreen_gun.png",
  heavyPreview: "assets/kenney-topdown/extracted/PNG/Robot 1/robot1_machine.png"
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
  heavyPreview: "assets/generated/preview/heavy-with-beam-cannon.png"
};

function ensureParent(relativePath) {
  mkdirSync(dirname(join(root, relativePath)), { recursive: true });
}

function copyAsset(from, to) {
  ensureParent(to);
  copyFileSync(join(root, from), join(root, to));
}

function main() {
  copyAsset(source.scout, output.scout);
  copyAsset(source.heavy, output.heavy);
  copyAsset(source.burster, output.burster);
  copyAsset(source.elite, output.elite);
  copyAsset(source.pulse, output.pulse);
  copyAsset(source.arc, output.arc);
  copyAsset(source.beam, output.beam);
  copyAsset(source.scoutPreview, output.scoutPreview);
  copyAsset(source.heavyPreview, output.heavyPreview);
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
```

- [ ] **Step 4: Run the script**

Run:

```bash
node scripts/compose-generated-assets.mjs
```

Expected: the `assets/generated/` folder is created and all nine PNG files exist.

- [ ] **Step 5: Run the test and confirm it passes**

Run:

```bash
npm test -- tests/assets/generated-assets.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/compose-generated-assets.mjs tests/assets/generated-assets.test.ts assets/generated
git commit -m "feat: stage optimized 2d asset samples"
```

---

### Task 2: Document Asset Intent and Keep Runtime Boundary Clear

**Files:**
- Create: `assets/generated/README.md`
- Modify: `README.md`
- Test: `tests/assets/generated-assets.test.ts`

- [ ] **Step 1: Extend the validation test for asset documentation**

Append this test to `tests/assets/generated-assets.test.ts`:

```ts
it("documents that weapons are standalone runtime assets", () => {
  const readme = readFileSync(join(root, "assets/generated/README.md"), "utf8");
  expect(readme).toContain("standalone weapon assets");
  expect(readme).toContain("Preview compositions are not runtime sprites");
  expect(readme).toContain("human-readable character models");
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npm test -- tests/assets/generated-assets.test.ts
```

Expected: fail because `assets/generated/README.md` does not exist yet.

- [ ] **Step 3: Add the generated asset README**

Create `assets/generated/README.md`:

```md
# Generated Asset Staging

This folder contains staged 2D asset samples for Neon Relic Survivor.

Runtime assets are separated by role:

- `runtime/characters/`: human-readable character models with clear head, torso, legs, and feet.
- `runtime/enemies/`: monster models with readable silhouettes and no aura-based identity.
- `runtime/weapons/`: standalone weapon assets that can be layered on top of character models.

Preview compositions are not runtime sprites. They show how a character can hold a weapon, but the game should keep character and weapon assets separate.
```

- [ ] **Step 4: Add a short note to the project README**

Add this section to `README.md`:

```md
## 2D Asset Staging

Generated and optimized 2D sample assets live in `assets/generated/`. Runtime character, enemy, and weapon PNGs are separated so weapons can be rendered independently from character models. Preview compositions are only for visual review.
```

- [ ] **Step 5: Run validation and build**

Run:

```bash
npm test -- tests/assets/generated-assets.test.ts
npm run build
```

Expected: both pass. The build should not require runtime integration of these staged assets.

- [ ] **Step 6: Commit**

```bash
git add assets/generated/README.md README.md tests/assets/generated-assets.test.ts
git commit -m "docs: document staged 2d assets"
```

---

### Task 3: Prepare Phase 2 Generation Prompts

**Files:**
- Create: `docs/superpowers/specs/2026-05-28-neon-relic-survivor-2d-generation-prompts.md`
- Test: `tests/assets/generated-assets.test.ts`

- [ ] **Step 1: Extend the validation test for prompt documentation**

Append this test to `tests/assets/generated-assets.test.ts`:

```ts
it("keeps generation prompts aligned with the approved asset constraints", () => {
  const prompts = readFileSync(
    join(root, "docs/superpowers/specs/2026-05-28-neon-relic-survivor-2d-generation-prompts.md"),
    "utf8"
  );
  expect(prompts).toContain("visible head, torso, two legs, and two feet");
  expect(prompts).toContain("standalone weapon PNG");
  expect(prompts).toContain("flat chroma-key background");
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npm test -- tests/assets/generated-assets.test.ts
```

Expected: fail because the prompt document does not exist yet.

- [ ] **Step 3: Add prompt document for new generated models**

Create `docs/superpowers/specs/2026-05-28-neon-relic-survivor-2d-generation-prompts.md`:

```md
# Neon Relic Survivor 2D Generation Prompts

Use these prompts only after the optimized sample direction is visually accepted.

## Shared Requirements

- Top-down or near-top-down 2D game sprite.
- Clear readable silhouette at small game scale.
- Flat chroma-key background for background removal.
- No shadows, floor plane, watermark, text, or UI.
- Player characters must have visible head, torso, two legs, and two feet.
- Weapons must be generated as standalone weapon PNG assets, not permanently baked into character sprites.

## Scout

Create a nimble human scout for a top-down roguelike shooter. The sprite must show a visible head, torso, two legs, and two feet. Lightweight armor, compact proportions, agile stance, readable human silhouette. Flat chroma-key background.

## Heavy

Create a heavy human combat unit for a top-down roguelike shooter. The sprite must show a visible head, torso, two legs, and two feet. Broad armored body, reinforced boots, clear human silhouette, no glow ring. Flat chroma-key background.

## Burster

Create an unstable mutant enemy for a top-down roguelike shooter. The sprite should look ruptured and dangerous through its body shape and posture, not through an aura. It must have a readable body silhouette at small scale. Flat chroma-key background.

## Elite

Create a high-tier humanoid enemy for a top-down roguelike shooter. The sprite should look more complete and threatening than a basic enemy through armor, stance, and model detail, not simple tint. Flat chroma-key background.

## Pulse Rifle

Create a standalone weapon PNG for a compact energy pulse rifle. Side/top readable silhouette, no hands attached, no character attached. Flat chroma-key background.

## Arc Gun

Create a standalone weapon PNG for an electrical arc gun. Distinct emitter shape, compact sci-fi body, no hands attached, no character attached. Flat chroma-key background.

## Beam Cannon

Create a standalone weapon PNG for a heavier beam cannon. Long barrel, clear weight, no hands attached, no character attached. Flat chroma-key background.
```

- [ ] **Step 4: Run validation**

Run:

```bash
npm test -- tests/assets/generated-assets.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-05-28-neon-relic-survivor-2d-generation-prompts.md tests/assets/generated-assets.test.ts
git commit -m "docs: add 2d generation prompts"
```

---

### Task 4: Final Verification

**Files:**
- Test: `tests/assets/generated-assets.test.ts`

- [ ] **Step 1: Run the complete test suite**

Run:

```bash
npm test
```

Expected: all tests pass, including the new asset validation tests.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: build succeeds. Existing Vite chunk-size warning may remain, but it is not a failure.

- [ ] **Step 3: Inspect generated assets manually**

Open or inspect these files:

```text
assets/generated/preview/scout-with-pulse-rifle.png
assets/generated/preview/heavy-with-beam-cannon.png
assets/generated/runtime/weapons/pulse-rifle.png
assets/generated/runtime/weapons/arc-gun.png
assets/generated/runtime/weapons/beam-cannon.png
```

Expected: previews show characters holding weapons, while runtime weapon files remain standalone.

- [ ] **Step 4: Commit final verification corrections only when files changed**

If no files changed during verification, do not create a commit. If docs or tests were corrected during verification, commit only those corrections:

```bash
git add docs tests assets/generated README.md scripts
git commit -m "chore: verify 2d asset staging"
```
