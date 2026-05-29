# Neon Relic Survivor Enemy Model Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the burster, elite, and heavy enemy lines so each threat family reads from its model silhouette instead of aura or tint.

**Architecture:** Keep enemy behavior and stats where they already live, and confine this pass to sprite-family choice and scene rendering. The asset layer selects the family, `GameScene` renders it, and the tests pin the silhouette-first mapping so the identity does not drift back into glow effects.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, CC0 sprite assets.

---

### Task 1: Burster Silhouette Refinement

**Files:**
- Modify: `src/game/assets.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/game/presentation.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getEnemyPresentation } from "../../src/game/assets";

describe("enemy model refinement", () => {
  it("gives the burster a distinct silhouette-first sprite family", () => {
    const burster = getEnemyPresentation({ type: "burster", elite: false });
    const chaser = getEnemyPresentation({ type: "chaser", elite: false });

    expect(burster.textureKey).not.toBe(chaser.textureKey);
    expect(burster.displayScale).toBeGreaterThanOrEqual(chaser.displayScale);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/presentation.test.ts`

Expected: fail because the burster still shares a model family with the elite line, and the mapping is not yet silhouette-specific enough.

- [ ] **Step 3: Switch the burster to its own silhouette-first family**

Update `src/game/assets.ts` so `burster` maps to a distinct sprite family if the repository has one that better matches an irregular, unstable shape. If no better CC0 asset is available, keep the current family but make the mapping explicit and reserve a separate scale profile for bursters instead of treating them like elites.

Update `src/scenes/GameScene.ts` only if the chosen sprite family needs a different frame or scale path. Do not add aura rings or glow layers.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/presentation.test.ts`

Expected: pass with a burster sprite mapping that is distinct from the baseline chaser and not dependent on aura or tint.

- [ ] **Step 5: Commit**

```bash
git add src/game/assets.ts src/scenes/GameScene.ts tests/game/presentation.test.ts
git commit -m "feat: refine burster silhouette mapping"
```

---

### Task 2: Elite Variant Refinement

**Files:**
- Modify: `src/game/assets.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/game/presentation.test.ts`
- Test: `tests/game/data.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getEnemyPresentation } from "../../src/game/assets";

describe("elite model refinement", () => {
  it("keeps elite enemies as a distinct higher-tier model family", () => {
    const elite = getEnemyPresentation({ type: "elite", elite: true });
    const chaser = getEnemyPresentation({ type: "chaser", elite: false });

    expect(elite.textureKey).toBe("enemy-hitman");
    expect(elite.displayScale).toBeGreaterThan(chaser.displayScale);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/presentation.test.ts tests/game/data.test.ts`

Expected: fail if elite is still too close to a normal enemy family or if the mapping is not yet clearly separate.

- [ ] **Step 3: Tighten elite as a complete variant model**

Keep `elite` on its own distinct family in `src/game/assets.ts`, but refine the mapping so it is clearly a higher-tier model rather than a normal enemy with an inflated scale.

If the asset set supports a better elite-specific sprite, wire it in. If not, keep `enemy-hitman` but adjust only the model-family mapping and scale profile; do not add aura or glow to compensate.

Update `src/scenes/GameScene.ts` so elites still render with the correct model path and scale hierarchy, but without introducing any extra identity layers.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/presentation.test.ts tests/game/data.test.ts`

Expected: pass with elite still clearly above the base family in model hierarchy and scale, without aura-based identity.

- [ ] **Step 5: Commit**

```bash
git add src/game/assets.ts src/scenes/GameScene.ts tests/game/presentation.test.ts tests/game/data.test.ts
git commit -m "feat: refine elite model mapping"
```

---

### Task 3: Heavy Line Refinement and Full Verification

**Files:**
- Modify: `src/game/assets.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/game/presentation.test.ts`
- Test: `tests/game/data.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getEnemyPresentation } from "../../src/game/assets";

describe("heavy enemy model refinement", () => {
  it("makes the heavy line read as a pressure unit from silhouette alone", () => {
    const tank = getEnemyPresentation({ type: "tank", elite: false });
    const chaser = getEnemyPresentation({ type: "chaser", elite: false });

    expect(tank.textureKey).toBe("enemy-robot");
    expect(tank.displayScale).toBeGreaterThan(chaser.displayScale);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/presentation.test.ts tests/game/data.test.ts`

Expected: fail if the heavy line mapping is still too generic or not visually distinct enough from the fast/light families.

- [ ] **Step 3: Finalize the heavy pressure-unit mapping**

Update `src/game/assets.ts` so the heavy enemy line keeps the strongest pressure-unit silhouette in the current asset set. Prefer a sprite family with broader body mass and lower apparent center of gravity. Do not solve the heavy line with aura or glow.

Update `src/scenes/GameScene.ts` only if the heavy line needs a slightly different scale or frame path to keep its silhouette readable.

- [ ] **Step 4: Run the test again, then run the full suite**

Run:

```bash
npm test -- tests/game/presentation.test.ts tests/game/data.test.ts
npm test
npm run build
```

Expected: the targeted tests pass, the full suite remains green, and the build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/game/assets.ts src/scenes/GameScene.ts tests/game/presentation.test.ts tests/game/data.test.ts
git commit -m "feat: refine heavy enemy silhouette mapping"
```
