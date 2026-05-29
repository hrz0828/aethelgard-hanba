# Neon Relic Survivor Feel Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make hits, shots, and kills feel sharper by adding layered impact feedback, weapon-specific firing cues, and tiered death finishes.

**Architecture:** Keep combat rules unchanged and add a thin presentation layer for combat feel. Impact and death finish profiles live in a small shared presentation module, weapon firing stays in the existing weapon presentation path, and Phaser only renders the cues that the simulation already emits.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, DOM/CSS.

---

### Task 1: Layered Impact Moment

**Files:**
- Create: `src/game/combatPresentation.ts`
- Modify: `src/game/motion.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/game/feedback.test.ts`
- Test: `tests/game/motion.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getImpactPresentation } from "../../src/game/combatPresentation";
import { getEnemyMotionFrame } from "../../src/game/motion";

describe("combat impact presentation", () => {
  it("renders layered impact strength by tier", () => {
    const normal = getImpactPresentation("normal");
    const elite = getImpactPresentation("elite");
    const boss = getImpactPresentation("boss");
    const player = getImpactPresentation("player");

    expect(normal.flashTint).toBe(0xffe66d);
    expect(elite.shakeMs).toBeGreaterThan(normal.shakeMs);
    expect(boss.burstCount).toBeGreaterThan(elite.burstCount);
    expect(player.flashTint).toBe(0xff6578);
  });

  it("keeps boss hit motion heavy but restrained", () => {
    const eliteFrame = getEnemyMotionFrame({
      velocity: { x: 160, y: 0 },
      elite: true,
      boss: false,
      hitFlashMs: 120
    });

    const bossFrame = getEnemyMotionFrame({
      velocity: { x: 160, y: 0 },
      elite: false,
      boss: true,
      hitFlashMs: 120
    });

    expect(bossFrame.alpha).toBeGreaterThan(eliteFrame.alpha);
    expect(bossFrame.scaleX).toBeLessThan(eliteFrame.scaleX);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/feedback.test.ts tests/game/motion.test.ts`

Expected: fail because `src/game/combatPresentation.ts` does not exist yet, and the motion layer does not yet have the tiered impact profile the test expects.

- [ ] **Step 3: Add the shared impact profile and wire it into motion rendering**

Create a thin shared presentation module for combat feel:

```ts
export type ImpactTier = "player" | "normal" | "elite" | "boss";

export interface ImpactPresentation {
  flashTint: number;
  flashAlpha: number;
  shakeMs: number;
  scaleKick: number;
  burstCount: number;
}

export function getImpactPresentation(tier: ImpactTier): ImpactPresentation;
```

Implementation notes:

- `player` keeps the existing red local flash.
- `normal` stays light and readable.
- `elite` gets the strongest non-boss punch.
- `boss` stays heavy but a little more restrained than elites in scale, with more bursts and a clearer body hit.

Update `src/game/motion.ts` so `getEnemyMotionFrame()` uses the tiered impact feel to keep boss hits looking durable instead of exaggerated.

Update `src/scenes/GameScene.ts` so the sprite-local flash, alpha change, and hit burst rendering consume the new impact profile rather than relying on one flat hit feel.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/feedback.test.ts tests/game/motion.test.ts`

Expected: pass with the tiered impact profile resolved through `src/game/combatPresentation.ts` and the boss hit motion tuned to stay heavy but controlled.

- [ ] **Step 5: Commit**

```bash
git add src/game/combatPresentation.ts src/game/motion.ts src/scenes/GameScene.ts tests/game/feedback.test.ts tests/game/motion.test.ts
git commit -m "feat: add layered combat impact feel"
```

---

### Task 2: Weapon Firing Feel

**Files:**
- Modify: `src/game/weaponPresentation.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/game/weapon-visuals.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { applyWeaponUpgrade, equipWeapon } from "../../src/game/weaponLoadout";
import { createRunState } from "../../src/game/state";
import { getWeaponPresentationState } from "../../src/game/weaponPresentation";

describe("weapon visuals", () => {
  it("keeps pulse fire crisp while giving beam weapons a heavier launch feel", () => {
    const state = createRunState();

    const pulse = getWeaponPresentationState(state);
    expect(pulse.trailStyle).toBe("streak");
    expect(pulse.trailLengthFactor).toBeLessThan(1);

    equipWeapon(state, "beam-cannon");
    applyWeaponUpgrade(state, "beam-cannon");

    const beam = getWeaponPresentationState(state);
    expect(beam.trailStyle).toBe("beam");
    expect(beam.trailLengthFactor).toBeGreaterThan(pulse.trailLengthFactor);
    expect(beam.leadGlowScale).toBeGreaterThan(pulse.leadGlowScale);
    expect(beam.weaponAccentColor).not.toBe(pulse.weaponAccentColor);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/weapon-visuals.test.ts`

Expected: fail because `src/game/weaponPresentation.ts` does not expose the new firing-feel fields yet.

- [ ] **Step 3: Extend weapon presentation with visible firing cues**

Add a few presentation-only fields to the existing weapon presentation state:

```ts
export interface WeaponPresentationState extends WeaponDisplayState {
  projectileColor: number;
  trailColor: number;
  trailStyle: WeaponTrailStyle;
  muzzleFlashScale: number;
  weaponAccentColor: number;
  trailLengthFactor: number;
  leadGlowScale: number;
}
```

Implementation notes:

- `Pulse Rifle` stays crisp with short trails and a compact muzzle flash.
- `Arc Gun` stays spark-like, with sharper trail accents and no beam-style lead glow.
- `Beam Cannon` gets the heaviest launch feel, with a longer trail factor and a stronger lead glow.
- Keep the current three weapon classes; this task only changes how the fire reads on screen.

Update `src/scenes/GameScene.ts` so projectile rendering uses `trailLengthFactor` and `leadGlowScale` to make the three weapon families look and feel different the instant they fire.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/weapon-visuals.test.ts`

Expected: pass with the new firing-feel fields visible in the weapon presentation state and reflected in the scene renderer.

- [ ] **Step 5: Commit**

```bash
git add src/game/weaponPresentation.ts src/scenes/GameScene.ts tests/game/weapon-visuals.test.ts
git commit -m "feat: sharpen weapon firing feel"
```

---

### Task 3: Tiered Death Finish and Final Verification

**Files:**
- Modify: `src/game/combatPresentation.ts`
- Modify: `src/game/effects.ts`
- Modify: `src/game/collision.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/game/feedback.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { emitKillEffect } from "../../src/game/effects";
import { createRunState } from "../../src/game/state";

describe("death finish presentation", () => {
  it("tiers kill finish effects by enemy importance", () => {
    const state = createRunState();

    emitKillEffect(state, { x: 100, y: 120 }, "normal");
    const normal = state.hitEffects.at(-1)!;

    emitKillEffect(state, { x: 100, y: 120 }, "elite");
    const elite = state.hitEffects.at(-1)!;

    emitKillEffect(state, { x: 100, y: 120 }, "boss");
    const boss = state.hitEffects.at(-1)!;

    expect(elite.burstCount).toBeGreaterThan(normal.burstCount);
    expect(boss.radius).toBeGreaterThan(elite.radius);
    expect(boss.ttlMs).toBeGreaterThan(normal.ttlMs);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/feedback.test.ts`

Expected: fail because `emitKillEffect()` still only distinguishes boss/non-boss and does not expose tiered death-finish profiles yet.

- [ ] **Step 3: Add tiered death-finish profiles and thread them through collision resolution**

Extend the shared combat presentation module with death profiles:

```ts
export type DeathTier = "normal" | "elite" | "boss";

export interface DeathFinishPresentation {
  tint: number;
  radius: number;
  burstCount: number;
  ttlMs: number;
}

export function getDeathFinishPresentation(tier: DeathTier): DeathFinishPresentation;
```

Implementation notes:

- `normal` deaths stay quick and clean.
- `elite` deaths get more fragments and a slightly longer finish.
- `boss` deaths get the clearest finish, with the largest burst and the longest local cue, but still stay short enough to keep the run moving.

Update `src/game/effects.ts` so `emitKillEffect()` accepts a `DeathTier` and uses the shared profile rather than a single boss/non-boss branch.

Update `src/game/collision.ts` so defeated enemies are mapped to the right tier before calling `emitKillEffect()`:

- `boss` for bosses.
- `elite` for elite enemies.
- `normal` for all other enemy deaths.

Update `src/scenes/GameScene.ts` only if the tiered finish needs a different draw scale or alpha interpretation. Keep the rendering logic local to the existing effect pass; do not add a new animation system.

- [ ] **Step 4: Run the test again, then run the full suite**

Run:

```bash
npm test -- tests/game/feedback.test.ts
npm test
npm run build
```

Expected: the tiered kill finish test passes, the full test suite stays green, and the build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/game/combatPresentation.ts src/game/effects.ts src/game/collision.ts src/scenes/GameScene.ts tests/game/feedback.test.ts
git commit -m "feat: add tiered combat death finishes"
```
