# Neon Relic Survivor Meta Progression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent relic-shard progression and unlockable character presets without changing the core survival loop.

**Architecture:** Keep progression outside the Phaser run state. Add a small meta save layer for `localStorage`, a focused character roster module for preset definitions, and thin UI wiring in the menu and result screens. Runs should receive a selected character preset at start time and never know about unlock storage.

**Tech Stack:** TypeScript, Phaser, Vite, DOM UI, Vitest, browser `localStorage`

---

### Task 1: Meta save and shard reward rules

**Files:**
- Create: `src/meta/progression.ts`
- Test: `tests/meta/progression.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  calculateRelicShards,
  createDefaultMetaSave,
  loadMetaSave,
  saveMetaSave,
  unlockCharacter
} from "../../src/meta/progression";

describe("meta progression", () => {
  it("awards shards from run results", () => {
    expect(
      calculateRelicShards({
        timeMs: 360000,
        kills: 42,
        bossDefeated: true,
        result: "won"
      })
    ).toBe(26);
  });

  it("returns default meta save when storage is empty", () => {
    expect(createDefaultMetaSave()).toEqual({
      version: 1,
      shards: 0,
      unlockedCharacterIds: ["soldier"],
      selectedCharacterId: "soldier"
    });
  });

  it("round-trips meta save through storage", () => {
    const store = new Map<string, string>();
    const fakeStorage = {
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        store.set(key, value);
      },
      removeItem(key: string) {
        store.delete(key);
      }
    } as Storage;

    const save = {
      version: 1 as const,
      shards: 9,
      unlockedCharacterIds: ["soldier", "scout"],
      selectedCharacterId: "scout"
    };

    saveMetaSave(save, fakeStorage);
    expect(loadMetaSave(fakeStorage)).toEqual(save);
  });

  it("spends shards to unlock a character", () => {
    const save = createDefaultMetaSave();
    save.shards = 12;

    expect(unlockCharacter(save, "scout", 12)).toBe(true);
    expect(save.shards).toBe(0);
    expect(save.unlockedCharacterIds).toContain("scout");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/meta/progression.test.ts`

Expected: FAIL because `src/meta/progression.ts` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Implement `calculateRelicShards`, `createDefaultMetaSave`, `loadMetaSave`, `saveMetaSave`, and `unlockCharacter` in `src/meta/progression.ts`. Keep the reward formula deterministic and shared by the menu/result flow. Use `localStorage` key `neon-relic.meta.v1`.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/meta/progression.test.ts`

Expected: PASS with the default meta save and reward calculation.

- [ ] **Step 5: Commit**

```bash
git add src/meta/progression.ts tests/meta/progression.test.ts
git commit -m "feat: add relic shard progression core"
```

### Task 2: Character roster and run preset application

**Files:**
- Create: `src/game/characters.ts`
- Modify: `src/scenes/GameScene.ts:1-140`
- Test: `tests/game/characters.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { applyCharacterPreset, getCharacterPreset } from "../../src/game/characters";
import { createRunState } from "../../src/game/state";

describe("characters", () => {
  it("applies the scout preset to a new run", () => {
    const state = createRunState();
    applyCharacterPreset(state, "scout");

    expect(state.player.speed).toBeGreaterThan(245);
    expect(state.player.maxHealth).toBeLessThan(100);
  });

  it("returns the soldier preset by default", () => {
    expect(getCharacterPreset("soldier").id).toBe("soldier");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/game/characters.test.ts`

Expected: FAIL because the roster module is missing.

- [ ] **Step 3: Write the minimal implementation**

Add a focused roster definition module that exports the preset list and a helper that mutates a new `RunState` before the run starts. Keep each preset limited to one or two visible stat changes.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/game/characters.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/characters.ts src/scenes/GameScene.ts tests/game/characters.test.ts
git commit -m "feat: add playable character presets"
```

### Task 3: Menu roster, selection, and result summary wiring

**Files:**
- Create: `src/ui/roster.ts`
- Modify: `src/ui/menu.ts:1-60`
- Modify: `src/ui/locale.ts:1-180`
- Modify: `src/main.ts:1-280`
- Test: `tests/ui/roster.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { formatRosterCardText } from "../../src/ui/roster";

describe("roster ui", () => {
  it("formats roster card text with state labels", () => {
    expect(
      formatRosterCardText("zh", {
        name: "侦察兵",
        description: "更快移动，较低生命",
        costLabel: "12 碎片",
        lockedLabel: "未解锁",
        selectedLabel: "已选择"
      })
    ).toContain("已选择");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/ui/roster.test.ts`

Expected: FAIL because `src/ui/roster.ts` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Add a roster panel to the menu, let the player choose an unlocked character, persist the selected id through the meta save layer, and include shard totals in the result screen summary.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/ui/roster.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/roster.ts src/ui/menu.ts src/ui/locale.ts src/main.ts tests/ui/roster.test.ts
git commit -m "feat: add roster menu and selection flow"
```

### Task 4: Full regression pass

**Files:**
- Modify: `tests/e2e/smoke.spec.ts:1-80`

- [ ] **Step 1: Expand the smoke test**

Add assertions that the menu exposes the roster, a locked character stays locked until purchased, and a chosen character is used when a run starts.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: all tests pass, including combat, boss, map, feedback, audio, locale, roster, and progression coverage.

- [ ] **Step 3: Build the app**

Run: `npm run build`

Expected: production build succeeds with no type errors.

- [ ] **Step 4: Manual smoke check**

Open the local preview and verify:

- The main menu shows the roster.
- A locked character cannot be started.
- Unlocking persists after refresh.
- The result screen shows shards earned and total shards.
- Starting a run uses the selected character preset.

- [ ] **Step 5: Commit**

```bash
git add src tests docs
git commit -m "feat: add relic shard meta progression"
```
