# Neon Relic Survivor Model Mapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each player role and enemy family a distinct base model silhouette so identity comes from the sprite itself, not glow layers or tint swaps.

**Architecture:** Keep the model choice in the asset/presentation layer and leave combat rules alone. The asset module should map roles and enemy families to specific sprite keys, while character and enemy presentation code consumes those mappings without hardcoding scene logic.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, DOM/CSS, CC0 sprite assets.

---

### Task 1: Player Role Model Mapping

**Files:**
- Modify: `src/game/assets.ts`
- Modify: `src/game/characters.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/game/characters.test.ts`
- Test: `tests/game/presentation.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getCharacterPresentation, getCharacterSpriteKey } from "../../src/game/characters";

describe("character model mapping", () => {
  it("maps each role to a distinct base sprite key", () => {
    expect(getCharacterSpriteKey("soldier")).toBe("player-soldier");
    expect(getCharacterSpriteKey("scout")).toBe("player-scout");
    expect(getCharacterSpriteKey("heavy")).toBe("player-heavy");
    expect(getCharacterSpriteKey("scavenger")).toBe("player-scavenger");
    expect(getCharacterSpriteKey("vanguard")).toBe("player-vanguard");
  });

  it("keeps character presentation separate from model identity", () => {
    expect(getCharacterPresentation("vanguard")).toMatchObject({
      tint: 0xffc84d,
      accentTint: 0xfff2a0
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/characters.test.ts tests/game/presentation.test.ts`

Expected: fail because `getCharacterSpriteKey()` does not exist yet and the scene still uses a single player sprite key.

- [ ] **Step 3: Add role-specific sprite keys and use them in the scene**

Extend `src/game/assets.ts` with role-specific player texture keys and URLs, using distinct CC0 sprites where possible:

```ts
export const TEXTURE_KEYS = {
  playerSoldier: "player-soldier",
  playerScout: "player-scout",
  playerHeavy: "player-heavy",
  playerScavenger: "player-scavenger",
  playerVanguard: "player-vanguard",
  ...
} as const;
```

Add a `getCharacterSpriteKey(id: CharacterId): string` helper in `src/game/characters.ts` that returns the correct texture key for each role.

Update `src/scenes/GameScene.ts` so it picks the player sprite texture from the active character instead of always using the soldier texture key.

Keep `getCharacterPresentation()` focused on tint/accent only. Do not turn it into a model selector.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/characters.test.ts tests/game/presentation.test.ts`

Expected: pass with each character mapped to a distinct base sprite key and the scene using the active role’s model.

- [ ] **Step 5: Commit**

```bash
git add src/game/assets.ts src/game/characters.ts src/scenes/GameScene.ts tests/game/characters.test.ts tests/game/presentation.test.ts
git commit -m "feat: map player roles to distinct models"
```

---

### Task 2: Enemy Family Model Mapping

**Files:**
- Modify: `src/game/assets.ts`
- Modify: `src/data/enemies.ts`
- Modify: `src/game/enemies.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/game/presentation.test.ts`
- Test: `tests/game/data.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getEnemyPresentation } from "../../src/game/assets";

describe("enemy model mapping", () => {
  it("uses distinct sprite families for each enemy role", () => {
    expect(getEnemyPresentation({ type: "chaser", elite: false })).toMatchObject({
      textureKey: "enemy-zombie"
    });

    expect(getEnemyPresentation({ type: "runner", elite: false })).toMatchObject({
      textureKey: "enemy-fast"
    });

    expect(getEnemyPresentation({ type: "charger", elite: false })).toMatchObject({
      textureKey: "enemy-fast"
    });

    expect(getEnemyPresentation({ type: "tank", elite: false })).toMatchObject({
      textureKey: "enemy-robot"
    });

    expect(getEnemyPresentation({ type: "shooter", elite: false })).toMatchObject({
      textureKey: "enemy-soldier"
    });

    expect(getEnemyPresentation({ type: "elite", elite: true })).toMatchObject({
      textureKey: "enemy-hitman"
    });
  });

  it("keeps elites as distinct variants rather than tinted copies", () => {
    const normal = getEnemyPresentation({ type: "chaser", elite: false });
    const elite = getEnemyPresentation({ type: "elite", elite: true });

    expect(elite.displayScale).toBeGreaterThan(normal.displayScale);
    expect(elite.auraScale).toBeGreaterThan(normal.auraScale);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/presentation.test.ts tests/game/data.test.ts`

Expected: fail if the model mapping is still implicit or if any enemy family still resolves through generic tint-only presentation.

- [ ] **Step 3: Refine enemy-to-model mapping and keep elite variants distinct**

Update `src/game/assets.ts` so each enemy family resolves to a specific source sprite key by silhouette:

- `chaser` -> baseline zombie model
- `runner` / `charger` -> fast/lean model
- `tank` -> heavy robot-like model
- `shooter` / `suppressor` -> soldier-like ranged model
- `burster` -> distinct unstable model, if available
- `elite` -> variant enemy model, not just a larger version of a normal enemy

If the current source sprites do not support this mapping cleanly, add the correct CC0 sprite assets and wire them into the loader instead of reusing a mismatched model.

Keep `src/data/enemies.ts` focused on stats and behaviors. Do not move model identity into the data file.

Update `src/game/enemies.ts` only where necessary so enemy spawning still references the correct family and the scene receives the right presentation key.

Update `src/scenes/GameScene.ts` to use the new enemy model mapping and keep tint as secondary, not primary, identity.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/presentation.test.ts tests/game/data.test.ts`

Expected: pass with enemy families mapped by silhouette-first sprite families and elites remaining visually distinct.

- [ ] **Step 5: Commit**

```bash
git add src/game/assets.ts src/data/enemies.ts src/game/enemies.ts src/scenes/GameScene.ts tests/game/presentation.test.ts tests/game/data.test.ts
git commit -m "feat: map enemy families to distinct models"
```

---

### Task 3: Asset Pipeline Cleanup and Full Verification

**Files:**
- Modify: `src/game/assets.ts`
- Modify: `src/game/characters.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/game/presentation.test.ts`
- Test: `tests/game/characters.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getCharacterSpriteKey } from "../../src/game/characters";
import { getEnemyPresentation } from "../../src/game/assets";

describe("model mapping consistency", () => {
  it("keeps player and enemy mappings separate from tint-based presentation", () => {
    expect(getCharacterSpriteKey("scout")).not.toBe(getCharacterSpriteKey("soldier"));
    expect(getEnemyPresentation({ type: "shooter", elite: false }).textureKey).toBe("enemy-soldier");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/presentation.test.ts tests/game/characters.test.ts`

Expected: fail if any character is still sharing the same sprite key or if enemy model selection still depends on tint instead of model family.

- [ ] **Step 3: Clean up any shared asset assumptions**

Make any final asset-layer adjustments needed so:

- Each player role resolves to a unique sprite key.
- Each enemy family resolves to a unique or family-appropriate sprite key.
- Elite and boss variants remain clearly different from the base models.
- No glow-ring or aura logic is added to solve model identity.

If the current asset set is missing a role-specific sprite, add the missing CC0 sprite to the loader and map it explicitly.

Update any scene code that still assumes one player base sprite or one enemy family sprite.

- [ ] **Step 4: Run the test again, then run the full suite**

Run:

```bash
npm test -- tests/game/presentation.test.ts tests/game/characters.test.ts
npm test
npm run build
```

Expected: targeted tests pass, the full suite stays green, and the build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/game/assets.ts src/game/characters.ts src/scenes/GameScene.ts tests/game/presentation.test.ts tests/game/characters.test.ts
git commit -m "feat: finalize model-based character and enemy mapping"
```
