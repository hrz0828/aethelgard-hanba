import { describe, expect, it } from "vitest";
import { updateEnemies } from "../../src/game/enemies";
import { spawnBoss } from "../../src/game/boss";
import { createRunState } from "../../src/game/state";

describe("boss pacing", () => {
  it("uses a telegraph when changing phases and resumes pressure afterward", () => {
    const state = createRunState();
    const boss = spawnBoss(state);

    boss.health = Math.floor(boss.maxHealth * 0.6);
    updateEnemies(state, 16);

    expect(boss.phase).toBe(2);
    expect(boss.phaseTelegraphMs).toBeGreaterThan(0);
    expect(boss.summonCooldownMs).toBeGreaterThan(0);

    boss.phaseTelegraphMs = 0;
    boss.summonCooldownMs = 0;
    boss.shootCooldownMs = 0;
    boss.health = Math.floor(boss.maxHealth * 0.2);
    updateEnemies(state, 16);

    expect(boss.phase).toBe(3);
    expect(boss.phaseTelegraphMs).toBeGreaterThan(0);
  });
});
