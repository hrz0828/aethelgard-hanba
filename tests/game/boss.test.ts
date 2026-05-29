import { describe, expect, it } from "vitest";
import { updateEnemies } from "../../src/game/enemies";
import { spawnBoss, updateBossEncounter, hasActiveBoss } from "../../src/game/boss";
import { createRunState } from "../../src/game/state";
import { updateWaves } from "../../src/game/waves";

describe("boss encounter", () => {
  it("spawns a boss once the run reaches the boss timer", () => {
    const state = createRunState();
    state.timeMs = 360_000;

    updateBossEncounter(state, 16);

    expect(hasActiveBoss(state)).toBe(true);
    expect(state.enemies.some((enemy) => enemy.boss)).toBe(true);
    expect(state.bossSpawned).toBe(true);
  });

  it("advances the boss into later phases as health drops", () => {
    const state = createRunState();
    const boss = spawnBoss(state);

    boss.health = Math.floor(boss.maxHealth * 0.6);
    updateEnemies(state, 16);
    expect(boss.phase).toBe(2);

    boss.health = Math.floor(boss.maxHealth * 0.2);
    updateEnemies(state, 16);
    expect(boss.phase).toBe(3);
  });

  it("pauses normal waves while the boss is active", () => {
    const state = createRunState();
    spawnBoss(state);

    updateWaves(state, 1200);

    expect(state.enemies.filter((enemy) => !enemy.boss)).toHaveLength(0);
  });
});
