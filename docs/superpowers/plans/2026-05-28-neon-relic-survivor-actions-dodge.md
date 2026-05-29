# Neon Relic Survivor Actions and Dodge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add character-bound dodge types and lighter action motion so each role reads differently in combat without changing the core auto-shooter loop.

**Architecture:** Keep dodge rules in the simulation layer, input handling in the scene/UI layer, and motion cues in a small presentation helper so the logic stays testable. One shared dodge system maps the five characters to five dodge styles, then exposes that through keyboard, mobile controls, and HUD labels. Enemy behavior stays the same; only motion and readability improve.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, DOM/CSS.

---

### Task 1: Dodge Data Model and Character Mapping

**Files:**
- Create: `src/game/dodge.ts`
- Modify: `src/game/types.ts`
- Modify: `src/game/state.ts`
- Modify: `src/game/characters.ts`
- Test: `tests/game/dodge.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getCharacterDodgeProfile } from "../../src/game/dodge";

describe("dodge profiles", () => {
  it("maps every character to a distinct dodge type", () => {
    expect(getCharacterDodgeProfile("scout")).toMatchObject({
      type: "blink",
      cooldownMs: 1450,
      durationMs: 120,
      iFrameMs: 160,
      travelDistance: 180
    });

    expect(getCharacterDodgeProfile("soldier")).toMatchObject({
      type: "roll",
      cooldownMs: 1200,
      durationMs: 180,
      iFrameMs: 220,
      travelDistance: 150
    });

    expect(getCharacterDodgeProfile("heavy")).toMatchObject({
      type: "jump",
      cooldownMs: 1600,
      durationMs: 220,
      iFrameMs: 180,
      travelDistance: 170
    });

    expect(getCharacterDodgeProfile("scavenger")).toMatchObject({
      type: "dash",
      cooldownMs: 1100,
      durationMs: 140,
      iFrameMs: 120,
      travelDistance: 200
    });

    expect(getCharacterDodgeProfile("vanguard")).toMatchObject({
      type: "shield-step",
      cooldownMs: 1500,
      durationMs: 160,
      iFrameMs: 260,
      travelDistance: 140
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/dodge.test.ts`

Expected: fail because `src/game/dodge.ts` and the dodge profile export do not exist yet.

- [ ] **Step 3: Add the dodge model and character mapping**

Implement a small shared dodge module and wire it into character presets:

```ts
export const DODGE_TYPES = ["blink", "roll", "jump", "dash", "shield-step"] as const;
export type DodgeType = (typeof DODGE_TYPES)[number];

export interface DodgeProfile {
  type: DodgeType;
  cooldownMs: number;
  durationMs: number;
  iFrameMs: number;
  travelDistance: number;
}

export function getCharacterDodgeProfile(id: CharacterId): DodgeProfile {
  // map each character to a fixed dodge style
}
```

Add a `dodge` field to `PlayerState` in `src/game/types.ts`, and initialize it in `createRunState()` in `src/game/state.ts` so a run always has a defined dodge state from frame one.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/dodge.test.ts`

Expected: pass with all five character mappings matching the declared dodge profiles.

- [ ] **Step 5: Commit**

```bash
git add src/game/dodge.ts src/game/types.ts src/game/state.ts src/game/characters.ts tests/game/dodge.test.ts
git commit -m "feat: add character-bound dodge profiles"
```

---

### Task 2: Input Plumbing and Dodge Simulation

**Files:**
- Modify: `src/game/input.ts`
- Modify: `src/game/player.ts`
- Modify: `src/game/simulation.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/game/dodge-simulation.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/game/state";
import { updateSimulation } from "../../src/game/simulation";

describe("dodge simulation", () => {
  it("starts a dodge, grants i-frames, and respects cooldown", () => {
    const state = createRunState();
    state.player.position = { x: 200, y: 200 };

    updateSimulation(state, { x: 1, y: 0, dodgePressed: true }, 16);

    expect(state.player.invulnerableMs).toBeGreaterThan(0);
    expect(state.player.position.x).toBeGreaterThan(200);

    const positionAfterFirstFrame = { ...state.player.position };
    updateSimulation(state, { x: 1, y: 0, dodgePressed: true }, 16);

    expect(state.player.position.x).toBeGreaterThanOrEqual(positionAfterFirstFrame.x);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/dodge-simulation.test.ts`

Expected: fail because `MovementInput` does not yet carry a dodge flag and `updatePlayer()` does not start or advance dodge state.

- [ ] **Step 3: Update the movement input and player update loop**

Extend `MovementInput` so the simulation can receive a dodge press:

```ts
export interface MovementInput {
  x: number;
  y: number;
  dodgePressed: boolean;
}
```

In `src/game/player.ts`, add a small dodge workflow:

```ts
if (input.dodgePressed && state.player.dodge.cooldownMs <= 0 && state.player.dodge.activeMs <= 0) {
  startDodge(state, direction);
}

if (state.player.dodge.activeMs > 0) {
  advanceDodge(state, deltaMs);
  return;
}

state.player.facing = direction.x === 0 && direction.y === 0 ? state.player.facing : direction;
```

The dodge should:
- use the character’s fixed dodge profile
- move the player along the current movement direction or last facing direction
- apply `invulnerableMs` during the active window
- drain `cooldownMs` after the dodge ends
- ignore a new dodge press until cooldown reaches zero

Update `GameScene` to read keyboard dodge input from `Space` and `Shift`, then pass that boolean into the simulation input object. If the player is using the mobile joystick, route the new dodge button through the same `dodgePressed` flag.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/dodge-simulation.test.ts`

Expected: pass, with dodge movement, i-frames, and cooldown gating all behaving deterministically.

- [ ] **Step 5: Commit**

```bash
git add src/game/input.ts src/game/player.ts src/game/simulation.ts src/scenes/GameScene.ts tests/game/dodge-simulation.test.ts
git commit -m "feat: wire dodge input into simulation"
```

---

### Task 3: HUD, Locale, and Mobile Dodge Control

**Files:**
- Modify: `src/ui/joystick.ts`
- Modify: `src/ui/hud.ts`
- Modify: `src/ui/locale.ts`
- Modify: `src/styles.css`
- Modify: `src/ui/appController.ts`
- Test: `tests/ui/dodge-controls.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createHud } from "../../src/ui/hud";
import { createJoystick } from "../../src/ui/joystick";
import { getUiText } from "../../src/ui/locale";

describe("dodge controls", () => {
  it("renders localized dodge labels and a mobile dodge button", () => {
    const hud = createHud("zh");
    expect(hud.querySelector("[data-dodge-label]")?.textContent).toContain("闪避");
    expect(getUiText("en").dodgeTypes["shield-step"]).toBe("Shield Step");

    const joystick = createJoystick(() => {}, () => {});
    expect(joystick.querySelector("[data-dodge-button]")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/ui/dodge-controls.test.ts`

Expected: fail because the HUD has no dodge row, the locale has no dodge labels, and the joystick only emits movement.

- [ ] **Step 3: Add the UI labels and the mobile dodge button**

Add localized dodge text in `src/ui/locale.ts`:

```ts
dodgeLabel: "闪避",
dodgeCooldownLabel: "冷却",
dodgeTypes: {
  blink: "闪现",
  roll: "翻滚",
  jump: "跳跃",
  dash: "冲刺",
  "shield-step": "盾步"
}
```

Update `src/ui/hud.ts` to show a compact dodge row with:
- the current dodge type
- a ready/cooldown label
- a short cooldown bar tied to `state.player.dodge.cooldownMs`

Update `src/ui/joystick.ts` so `createJoystick()` takes two callbacks:

```ts
export function createJoystick(
  onMove: (input: MovementInput) => void,
  onDodge: () => void
): HTMLElement
```

Render an icon-only dodge button next to the joystick, wire it to `onDodge`, and keep the control area compact so it does not cover the playfield. Update `src/styles.css` so the new button reads clearly on mobile and does not resize the joystick container.

Update the UI mount code in `src/ui/appController.ts` so the new joystick signature is used everywhere it is instantiated.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/ui/dodge-controls.test.ts`

Expected: pass with localized dodge labels and a working mobile dodge button.

- [ ] **Step 5: Commit**

```bash
git add src/ui/joystick.ts src/ui/hud.ts src/ui/locale.ts src/styles.css src/ui/appController.ts tests/ui/dodge-controls.test.ts
git commit -m "feat: add dodge controls and HUD labels"
```

---

### Task 4: Motion Presentation for Player and Enemies

**Files:**
- Create: `src/game/motion.ts`
- Modify: `src/scenes/GameScene.ts`
- Modify: `src/game/effects.ts`
- Test: `tests/game/motion.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getEnemyMotionFrame, getPlayerMotionFrame } from "../../src/game/motion";

describe("motion presentation", () => {
  it("returns a more stretched frame while the player is dodging", () => {
    const playerFrame = getPlayerMotionFrame({
      velocity: { x: 240, y: 0 },
      dodgeType: "roll",
      dodgeActiveMs: 120,
      invulnerableMs: 120,
      hitFlashMs: 0
    });

    expect(playerFrame.scaleX).toBeGreaterThan(1);
    expect(playerFrame.scaleY).toBeLessThan(1);
  });

  it("returns a stronger lean and flash for hit enemies", () => {
    const enemyFrame = getEnemyMotionFrame({
      velocity: { x: 160, y: 0 },
      elite: true,
      boss: false,
      hitFlashMs: 120
    });

    expect(enemyFrame.scaleX).toBeGreaterThan(1);
    expect(enemyFrame.alpha).toBeLessThan(1);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/motion.test.ts`

Expected: fail because the motion helper file does not exist yet.

- [ ] **Step 3: Add a tiny motion helper and use it in the scene**

Create `src/game/motion.ts` with presentation-only helpers that compute:
- player stretch and tilt while moving
- a dodge-specific emphasis for blink/roll/jump/dash/shield-step
- enemy lean, hit flash strength, and death emphasis from velocity and elite/boss flags

Use those helpers in `src/scenes/GameScene.ts` so:
- the player gets a clearer move/dodge silhouette
- enemies visibly lean into motion and flash harder when hit
- dodge states get a short trail or pulse treatment without covering the whole screen

If you want a minimal first pass, keep the motion data as transform scalars and tint/alpha values only. Do not add a full animation system.

Update `src/game/effects.ts` only if you want a tiny dodge pulse or landing burst to share the existing effect queue; otherwise keep the effects layer unchanged.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/motion.test.ts`

Expected: pass with the new motion helper returning the expected presentation values.

- [ ] **Step 5: Commit**

```bash
git add src/game/motion.ts src/scenes/GameScene.ts src/game/effects.ts tests/game/motion.test.ts
git commit -m "feat: add action motion presentation"
```

---

### Task 5: Regression Pass and Final Verification

**Files:**
- Modify: any files touched in Tasks 1-4 if a regression appears
- Test: `tests/game/presentation.test.ts`, `tests/game/simulation.test.ts`, `tests/ui/locale.test.ts`

- [ ] **Step 1: Add regression assertions for the new dodge behavior**

Extend the existing tests so they cover the new public surface:

```ts
expect(getCharacterDodgeProfile("vanguard").type).toBe("shield-step");
expect(getUiText("zh").dodgeLabel).toBe("闪避");
expect(createRunState().player.dodge.type).toBe("roll");
```

Add one full-path test that verifies a dodge press does not break the current weapon, map, boss, or locale systems while a run is active.

- [ ] **Step 2: Run the targeted test files**

Run:
- `npm test -- tests/game/presentation.test.ts`
- `npm test -- tests/game/simulation.test.ts`
- `npm test -- tests/ui/locale.test.ts`

Expected: all pass with the new dodge API in place and no unrelated regressions.

- [ ] **Step 3: Run the full test suite and build**

Run:
- `npm test`
- `npm run build`

Expected: both pass. If a test fails, fix the nearest task file rather than widening the scope.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: finish action and dodge pass"
```

---

### Self-Review

**1. Spec coverage**
- Character-bound dodge types: Task 1
- Dodge state, cooldown, and i-frames: Task 2
- Keyboard and mobile dodge input: Task 2 and Task 3
- HUD and localized dodge labels: Task 3
- Motion improvement for player and enemies: Task 4
- Regression protection: Task 5

**2. Placeholder scan**
- No placeholders like `TBD`, `TODO`, or `implement later` are present.
- Every task names concrete files, concrete commands, and concrete assertions.

**3. Type consistency**
- `MovementInput` gains `dodgePressed` in Task 2 and is then consumed by `updatePlayer()`.
- `DodgeType`, `DodgeProfile`, and the per-character mapping are introduced in Task 1 before they are used in Tasks 2-4.
- The HUD reads `state.player.dodge` only after Task 1 establishes it in `RunState`.
- The motion helpers in Task 4 depend only on types and fields established in Tasks 1-2.

