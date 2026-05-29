# Neon Relic Survivor Weapons and Weapon Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three distinct energy weapons, visible form-based weapon upgrades, and weapon-focused map events that can upgrade, reroll, or temporarily alter the player's loadout.

**Architecture:** Keep weapon definitions in data files, weapon logic in the simulation layer, and visual changes in the Phaser scene. Map events should emit weapon effects through the rules layer only; the scene should just render the result. This keeps the build system testable and makes weapon appearance changes line up with gameplay changes.

**Tech Stack:** TypeScript, Phaser, Vite, DOM UI, Vitest

---

### Task 1: Weapon data model and upgrade metadata

**Files:**
- Create: `src/data/weapons.ts`
- Modify: `src/game/types.ts`
- Modify: `src/ui/locale.ts`
- Test: `tests/game/weapons-data.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { WEAPON_DEFINITIONS } from "../../src/data/weapons";

describe("weapon data", () => {
  it("defines three weapon classes with form upgrade metadata", () => {
    expect(WEAPON_DEFINITIONS.map((weapon) => weapon.id)).toEqual([
      "pulse-rifle",
      "arc-gun",
      "beam-cannon"
    ]);

    expect(WEAPON_DEFINITIONS[0].forms.length).toBeGreaterThan(0);
    expect(WEAPON_DEFINITIONS[1].forms.length).toBeGreaterThan(0);
    expect(WEAPON_DEFINITIONS[2].forms.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/game/weapons-data.test.ts`

Expected: FAIL because `src/data/weapons.ts` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Create a data module that defines three weapon classes:

```ts
export const WEAPON_DEFINITIONS = [
  {
    id: "pulse-rifle",
    name: "Pulse Rifle",
    category: "energy",
    baseProjectileStyle: "pulse",
    forms: [
      { id: "burst", name: "Burst Matrix", minLevel: 2 },
      { id: "spread", name: "Spread Field", minLevel: 3 },
      { id: "pierce", name: "Piercing Pulse", minLevel: 4 }
    ]
  },
  {
    id: "arc-gun",
    name: "Arc Gun",
    category: "energy",
    baseProjectileStyle: "arc",
    forms: [
      { id: "chain", name: "Long Chain", minLevel: 2 },
      { id: "split", name: "Split Arc", minLevel: 3 },
      { id: "volley", name: "Volley Arc", minLevel: 4 }
    ]
  },
  {
    id: "beam-cannon",
    name: "Beam Cannon",
    category: "energy",
    baseProjectileStyle: "beam",
    forms: [
      { id: "widen", name: "Widen Beam", minLevel: 2 },
      { id: "length", name: "Long Beam", minLevel: 3 },
      { id: "branch", name: "Branch Beam", minLevel: 4 }
    ]
  }
] as const;
```

Update `src/game/types.ts` so the run state can track the active weapon id, weapon form id, and a small weapon upgrade history object. Add locale strings for the weapon HUD labels and weapon event names in both languages.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/game/weapons-data.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/weapons.ts src/game/types.ts src/ui/locale.ts tests/game/weapons-data.test.ts
git commit -m "feat: add weapon data model"
```

### Task 2: Weapon progression, form upgrades, and auto-fire behavior

**Files:**
- Create: `src/game/weaponLoadout.ts`
- Modify: `src/game/weapons.ts`
- Modify: `src/game/state.ts`
- Modify: `src/game/upgrades.ts`
- Modify: `src/game/simulation.ts`
- Test: `tests/game/weapon-progress.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/game/state";
import { applyWeaponUpgrade, equipWeapon } from "../../src/game/weaponLoadout";

describe("weapon progression", () => {
  it("equips the pulse rifle by default and upgrades into a burst form", () => {
    const state = createRunState();
    equipWeapon(state, "pulse-rifle");

    expect(state.weapon.id).toBe("pulse-rifle");
    expect(state.weapon.formId).toBe("single");

    applyWeaponUpgrade(state, "pulse-rifle");
    expect(state.weapon.formId).toBe("burst");
    expect(state.weapon.projectileCount).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/game/weapon-progress.test.ts`

Expected: FAIL because `src/game/weaponLoadout.ts` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Add a dedicated loadout module that:

```ts
export function equipWeapon(state: RunState, weaponId: WeaponId): void;
export function applyWeaponUpgrade(state: RunState, weaponId: WeaponId): void;
export function getWeaponDisplayState(state: RunState): WeaponDisplayState;
```

Keep the player on one active weapon at a time. The default starter remains Pulse Rifle. Form upgrades should visibly change `state.weapon.formId`, `state.weapon.projectileCount`, `state.weapon.pierce`, `state.weapon.chainChance`, or `state.weapon.beamWidth` depending on the weapon.

Update auto-fire in `src/game/weapons.ts` so it uses the active weapon state rather than a single fixed projectile profile. Update `src/game/simulation.ts` to wire the new weapon progression flow into level-up resolution and weapon upgrade selection.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/game/weapon-progress.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/weaponLoadout.ts src/game/weapons.ts src/game/state.ts src/game/upgrades.ts src/game/simulation.ts tests/game/weapon-progress.test.ts
git commit -m "feat: add weapon progression and forms"
```

### Task 3: Weapon visuals, HUD labels, and combat readability

**Files:**
- Modify: `src/scenes/GameScene.ts`
- Modify: `src/ui/hud.ts`
- Modify: `src/ui/locale.ts`
- Test: `tests/game/weapon-visuals.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getWeaponVisualProfile } from "../../src/game/weaponLoadout";

describe("weapon visuals", () => {
  it("maps weapon forms to different projectile styles", () => {
    expect(getWeaponVisualProfile("pulse-rifle", "single").style).toBe("pulse");
    expect(getWeaponVisualProfile("pulse-rifle", "burst").projectileCount).toBeGreaterThan(1);
    expect(getWeaponVisualProfile("beam-cannon", "branch").style).toBe("beam");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/game/weapon-visuals.test.ts`

Expected: FAIL because the weapon visual profile helper does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Add a visual-profile helper that maps weapon class + form to:

- projectile style
- color
- trail width
- muzzle flash shape
- hit flash intensity

Update `src/scenes/GameScene.ts` so player shots use the active weapon's visual profile. Update `src/ui/hud.ts` so the HUD shows the active weapon name and form name using the locale strings from `src/ui/locale.ts`.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/game/weapon-visuals.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scenes/GameScene.ts src/ui/hud.ts src/ui/locale.ts tests/game/weapon-visuals.test.ts
git commit -m "feat: add weapon visuals and HUD labels"
```

### Task 4: Weapon-related map events and weapon drops

**Files:**
- Create: `src/game/weaponEvents.ts`
- Modify: `src/game/map.ts`
- Modify: `src/game/pickups.ts`
- Modify: `src/game/types.ts`
- Test: `tests/game/weapon-events.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/game/state";
import { updateMapState } from "../../src/game/map";

describe("weapon-related map events", () => {
  it("can start an armory cache and provide a weapon upgrade", () => {
    const state = createRunState();
    state.player.position = { x: 960, y: 160 };

    updateMapState(state, 16);
    expect(state.activeZoneEventType).toBe("armory");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/game/weapon-events.test.ts`

Expected: FAIL because weapon events are not implemented yet.

- [ ] **Step 3: Write the minimal implementation**

Add weapon-focused map event types:

```ts
type MapEventType = "none" | "supply" | "hazard" | "wave" | "armory" | "calibration" | "relay" | "test";
```

Implement these events:

- `Armory Cache`: offers a weapon upgrade or free weapon form step.
- `Calibration Station`: rerolls or redirects one weapon form choice.
- `Power Relay`: buffs energy weapons while the player remains in-zone.
- `Live Test Zone`: spawns a focused enemy mix and weapon-drop rewards.

Add simple weapon drops:

```ts
type WeaponDropKind = "module" | "cache" | "prototype";
```

Update `src/game/pickups.ts` to let weapon drops grant or modify the current weapon immediately instead of using an inventory.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/game/weapon-events.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/weaponEvents.ts src/game/map.ts src/game/pickups.ts src/game/types.ts tests/game/weapon-events.test.ts
git commit -m "feat: add weapon map events"
```

### Task 5: Full regression pass

**Files:**
- Modify: `tests/game/data.test.ts`
- Modify: `tests/game/presentation.test.ts`
- Modify: `tests/game/simulation.test.ts`
- Modify: `tests/game/sfx.test.ts`

- [ ] **Step 1: Extend regression coverage**

Add assertions that:

```ts
expect(WEAPON_DEFINITIONS).toHaveLength(3);
expect(state.weapon.id).toBe("pulse-rifle");
expect(state.activeZoneEventType).toBe("armory");
```

Also add a Playwright smoke step that starts a run, opens the HUD, and confirms the weapon label and current weapon form are visible in both languages.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: all tests pass, including combat, boss, map, feedback, audio, roster, meta progression, weapon data, weapon progression, weapon visuals, and weapon events.

- [ ] **Step 3: Build the app**

Run: `npm run build`

Expected: production build succeeds with no type errors.

- [ ] **Step 4: Manual smoke check**

Open the local preview and verify:

- The HUD shows the active weapon name and form.
- The Pulse Rifle, Arc Gun, and Beam Cannon look different on screen.
- Upgrades visibly change projectile style and weapon behavior.
- Map events can grant or redirect weapon upgrades.
- Weapon-related map events appear in the HUD and feel tied to the build.

- [ ] **Step 5: Commit**

```bash
git add src tests docs
git commit -m "feat: add weapon classes and weapon map events"
```
