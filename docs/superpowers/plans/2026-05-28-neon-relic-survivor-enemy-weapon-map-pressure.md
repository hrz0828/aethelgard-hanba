# Neon Relic Survivor Enemy, Weapon, and Map Pressure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deepen the run loop by making enemies, weapons, and map districts work together as a readable pressure system.

**Architecture:** Keep enemy pressure, weapon evolution, and map pacing in the simulation/data layers, then let Phaser scenes render the results. Enemy roles should be data-driven, weapon forms should visibly change projectile behavior, and map districts should expose risk/reward plus weapon-oriented points of interest without adding inventory or manual aiming.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, DOM/CSS.

---

### Task 1: Enemy Roles, New Enemy Types, and Boss Pacing

**Files:**
- Create: `src/game/enemyProfiles.ts`
- Modify: `src/data/enemies.ts`
- Modify: `src/game/types.ts`
- Modify: `src/game/assets.ts`
- Modify: `src/game/enemies.ts`
- Test: `tests/game/enemy-profiles.test.ts`
- Test: `tests/game/boss-pacing.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { ENEMY_TYPES } from "../../src/data/enemies";
import { getBossPhaseProfile, getEnemyProfile } from "../../src/game/enemyProfiles";

describe("enemy profiles", () => {
  it("assigns distinct pressure roles to enemy archetypes", () => {
    expect(ENEMY_TYPES.charger).toMatchObject({
      behavior: "dash",
      speed: 138,
      damage: 13
    });

    expect(ENEMY_TYPES.suppressor).toMatchObject({
      behavior: "suppress",
      speed: 66,
      damage: 10
    });

    expect(getEnemyProfile("runner")).toMatchObject({
      role: "dash-in",
      burstWindowMs: 220,
      recoveryWindowMs: 620
    });

    expect(getEnemyProfile("shooter")).toMatchObject({
      role: "area-denial",
      preferredRange: 240,
      repositionChance: 0.35
    });
  });

  it("exposes readable boss phase profiles", () => {
    expect(getBossPhaseProfile(1)).toMatchObject({
      telegraphMs: 420,
      addCount: 0,
      burstCount: 0
    });

    expect(getBossPhaseProfile(2)).toMatchObject({
      telegraphMs: 560,
      addCount: 2,
      burstCount: 0
    });

    expect(getBossPhaseProfile(3)).toMatchObject({
      telegraphMs: 680,
      addCount: 3,
      burstCount: 8
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/enemy-profiles.test.ts tests/game/boss-pacing.test.ts`

Expected: fail because `src/game/enemyProfiles.ts` does not exist yet, `charger` and `suppressor` are not defined, and the new behavior roles are not wired into enemy updates.

- [ ] **Step 3: Add enemy role profiles and wire them into combat**

Implement a small shared enemy profile module and extend the enemy data model:

```ts
export type EnemyRole = "dash-in" | "area-denial" | "bruiser" | "pressure";

export interface EnemyProfile {
  role: EnemyRole;
  preferredRange: number;
  burstWindowMs: number;
  recoveryWindowMs: number;
  speedMultiplier: number;
  repositionChance: number;
}

export interface BossPhaseProfile {
  telegraphMs: number;
  addCount: number;
  burstCount: number;
  speedMultiplier: number;
}

export function getEnemyProfile(type: EnemyType): EnemyProfile;
export function getBossPhaseProfile(phase: 1 | 2 | 3): BossPhaseProfile;
```

Add `dash` and `suppress` to `EnemyState["behavior"]` in `src/game/types.ts`.

Update `src/data/enemies.ts` so the new archetypes exist:

- `charger`: fast dash-in melee pressure.
- `suppressor`: ranged area-denial pressure.

Keep the current enemy families intact, but map them onto the new role helpers so the scene can read them consistently.

Update `src/game/enemies.ts` so:

- dash enemies burst toward the player, then recover before they burst again.
- suppressor enemies try to hold distance and fire on cooldown.
- boss phase transitions use `getBossPhaseProfile()` for telegraph, add count, burst count, and speed shifts.
- elite variants preserve the current silhouette but get stronger hit feedback and slightly higher pressure.

Update `src/game/assets.ts` so the new enemy types reuse existing CC0 textures and still read clearly in the renderer.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/enemy-profiles.test.ts tests/game/boss-pacing.test.ts`

Expected: pass with the new enemy types, roles, and boss phase profiles resolved through the shared helper.

- [ ] **Step 5: Commit**

```bash
git add src/game/enemyProfiles.ts src/data/enemies.ts src/game/types.ts src/game/assets.ts src/game/enemies.ts tests/game/enemy-profiles.test.ts tests/game/boss-pacing.test.ts
git commit -m "feat: add enemy pressure roles and boss pacing"
```

---

### Task 2: Weapon Evolution and Visible Form Changes

**Files:**
- Create: `src/game/weaponPresentation.ts`
- Modify: `src/game/weaponLoadout.ts`
- Modify: `src/scenes/GameScene.ts`
- Modify: `src/ui/hud.ts`
- Modify: `src/ui/locale.ts`
- Test: `tests/game/weapon-evolution.test.ts`
- Test: `tests/game/weapon-visuals.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/game/state";
import { applyWeaponUpgrade } from "../../src/game/weaponLoadout";
import { getWeaponPresentationState } from "../../src/game/weaponPresentation";

describe("weapon evolution", () => {
  it("exposes visible changes as the weapon upgrades", () => {
    const state = createRunState();

    const base = getWeaponPresentationState(state);
    expect(base.weaponId).toBe("pulse-rifle");
    expect(base.formId).toBe("single");
    expect(base.projectileColor).toBe(0x62f8d1);
    expect(base.trailStyle).toBe("streak");

    applyWeaponUpgrade(state, "pulse-rifle");

    const burst = getWeaponPresentationState(state);
    expect(burst.formName).toBe("Burst Barrel");
    expect(burst.projectileCount).toBeGreaterThan(1);
    expect(burst.muzzleFlashScale).toBeGreaterThan(1);
    expect(burst.projectileColor).not.toBe(base.projectileColor);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/weapon-evolution.test.ts tests/game/weapon-visuals.test.ts`

Expected: fail because `src/game/weaponPresentation.ts` does not exist yet and `weaponLoadout.ts` does not expose the visible presentation fields.

- [ ] **Step 3: Add a dedicated weapon presentation layer**

Create `src/game/weaponPresentation.ts` to derive the visible state from the active weapon and its current form.

Add presentation fields that the scene can render directly:

- `projectileColor`
- `trailStyle`
- `trailColor`
- `muzzleFlashScale`
- `weaponAccentColor`

Update `src/game/weaponLoadout.ts` so each form change can drive visible differences, not just stat changes.

Update `src/scenes/GameScene.ts` so it uses the weapon presentation state for:

- projectile fill and line color
- beam width or burst spacing
- muzzle flash intensity
- weapon accent tint in the scene

Update `src/ui/hud.ts` and `src/ui/locale.ts` so the current weapon form and evolution state remain explicit in both languages.

Keep the current auto-fire loop and the current three energy weapons; the work here is to make form upgrades visually unmistakable, not to add inventory or manual aim.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/weapon-evolution.test.ts tests/game/weapon-visuals.test.ts`

Expected: pass with visible weapon changes surfaced through the new presentation layer.

- [ ] **Step 5: Commit**

```bash
git add src/game/weaponPresentation.ts src/game/weaponLoadout.ts src/scenes/GameScene.ts src/ui/hud.ts src/ui/locale.ts tests/game/weapon-evolution.test.ts tests/game/weapon-visuals.test.ts
git commit -m "feat: make weapon evolution visibly distinct"
```

---

### Task 3: Map District Pressure and Weapon-Oriented Content

**Files:**
- Create: `src/game/mapContent.ts`
- Modify: `src/game/map.ts`
- Modify: `src/game/eventVisuals.ts`
- Modify: `src/scenes/GameScene.ts`
- Modify: `src/ui/hud.ts`
- Modify: `src/ui/locale.ts`
- Test: `tests/game/map-pressure.test.ts`
- Test: `tests/game/map-content.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getMapPressureProfile, getZonePointsOfInterest } from "../../src/game/mapContent";

describe("map pressure", () => {
  it("gives districts distinct pressure and reward profiles", () => {
    expect(getMapPressureProfile("north", "hazard")).toMatchObject({
      spawnIntervalMultiplier: 0.55,
      eliteChanceBonus: 0.14,
      rewardMultiplier: 1.02
    });

    expect(getMapPressureProfile("east", "calibration")).toMatchObject({
      rewardMultiplier: 1.28,
      weaponSupportBonus: 1
    });

    expect(getMapPressureProfile("west", "test")).toMatchObject({
      eliteChanceBonus: 0.2,
      rewardMultiplier: 1.12
    });
  });

  it("places weapon-oriented points of interest into districts", () => {
    expect(getZonePointsOfInterest("west", "test")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "prototype-container" }),
        expect.objectContaining({ kind: "test-terminal" })
      ])
    );
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/map-pressure.test.ts tests/game/map-content.test.ts`

Expected: fail because `src/game/mapContent.ts` does not exist yet and the current map system does not expose weapon-oriented points of interest as data.

- [ ] **Step 3: Add district pressure and weapon-related map content**

Create `src/game/mapContent.ts` to centralize:

- district pressure profiles
- weapon-related points of interest
- point-of-interest visuals or labels used by the scene

Update `src/game/map.ts` so district pressure is read from the shared profile helper instead of being spread across several constants.

Update `src/game/eventVisuals.ts` and `src/scenes/GameScene.ts` so weapon-related map markers read as armory crates, relay towers, calibration kiosks, prototype containers, and test terminals instead of generic circles.

Update `src/ui/hud.ts` and `src/ui/locale.ts` so the current district and event language stays clear when weapon-support events are active.

Keep the current district structure, but make the pressure clearer:

- Hub: recovery and spawn suppression.
- North: dense combat pressure.
- East: stronger reward and weapon-support frequency.
- South: better supply pacing.
- West: elite-heavy late-run pressure.

Weapon-related events should continue to be immediate and light-weight, but they now need to feed the build and route choice more directly.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/map-pressure.test.ts tests/game/map-content.test.ts`

Expected: pass with district pressure and weapon-oriented points of interest coming from the shared map content layer.

- [ ] **Step 5: Commit**

```bash
git add src/game/mapContent.ts src/game/map.ts src/game/eventVisuals.ts src/scenes/GameScene.ts src/ui/hud.ts src/ui/locale.ts tests/game/map-pressure.test.ts tests/game/map-content.test.ts
git commit -m "feat: sharpen map pressure and weapon events"
```

---

### Task 4: Regression Pass and Final Verification

**Files:**
- Modify: any files touched in Tasks 1-3 if a regression appears
- Test: `tests/game/presentation.test.ts`, `tests/game/simulation.test.ts`, `tests/ui/locale.test.ts`

- [ ] **Step 1: Add regression assertions for the new public surface**

Extend the existing tests so they cover the new enemy, weapon, and map helpers:

```ts
import { describe, expect, it } from "vitest";
import { getBossPhaseProfile, getEnemyProfile } from "../../src/game/enemyProfiles";
import { getMapPressureProfile } from "../../src/game/mapContent";
import { createRunState } from "../../src/game/state";
import { getWeaponPresentationState } from "../../src/game/weaponPresentation";

describe("enemy, weapon, and map pressure regressions", () => {
  it("keeps the shared pressure helpers visible to the rest of the game", () => {
    expect(getEnemyProfile("charger").role).toBe("dash-in");
    expect(getBossPhaseProfile(2).addCount).toBe(2);
    expect(getWeaponPresentationState(createRunState()).projectileColor).toBe(0x62f8d1);
    expect(getMapPressureProfile("east", "calibration").weaponSupportBonus).toBe(1);
  });
});
```

Add one full-path test that verifies the current run still starts, upgrades, and renders without breaking the bilingual UI or the dodge system.

- [ ] **Step 2: Run the targeted test files**

Run:
- `npm test -- tests/game/presentation.test.ts`
- `npm test -- tests/game/simulation.test.ts`
- `npm test -- tests/ui/locale.test.ts`

Expected: all pass with the new pressure layers in place.

- [ ] **Step 3: Run the full test suite and build**

Run:
- `npm test`
- `npm run build`

Expected: both pass. If a test fails, fix the nearest task file rather than widening the scope.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: finish enemy weapon map pressure pass"
```

---

### Self-Review

**1. Spec coverage**
- Enemy archetype expansion and new behaviors: Task 1
- Elite variants and boss pacing: Task 1
- Weapon evolution with visible form changes: Task 2
- District pressure and map pacing: Task 3
- Weapon-oriented map content: Task 3
- Regression and build verification: Task 4

**2. Placeholder scan**
- No placeholders like `TBD`, `TODO`, or `implement later` are present.
- Every step includes concrete files, concrete tests, and concrete commands.

**3. Type consistency**
- `EnemyRole`, `BossPhaseProfile`, and the new enemy behavior values are introduced before they are used in the enemy update loop.
- `getWeaponPresentationState()` is introduced before the scene and HUD reference it.
- `getMapPressureProfile()` and `getZonePointsOfInterest()` are introduced before the map and scene consume them.
