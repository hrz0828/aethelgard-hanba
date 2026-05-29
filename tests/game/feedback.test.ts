import { describe, expect, it } from "vitest";
import { getImpactPresentation } from "../../src/game/combatPresentation";
import { shouldTriggerDamageFlash, shouldTriggerKillPulse, shouldTriggerBossShake } from "../../src/game/feedback";
import { emitKillEffect } from "../../src/game/effects";
import { resolveCollisions } from "../../src/game/collision";
import { spawnEnemy } from "../../src/game/enemies";
import { createRunState } from "../../src/game/state";

describe("feedback helpers", () => {
  it("triggers damage feedback only when health drops", () => {
    expect(shouldTriggerDamageFlash(100, 100)).toBe(false);
    expect(shouldTriggerDamageFlash(100, 92)).toBe(true);
    expect(shouldTriggerDamageFlash(20, 0)).toBe(true);
  });

  it("triggers kill feedback only when kills increase", () => {
    expect(shouldTriggerKillPulse(3, 3)).toBe(false);
    expect(shouldTriggerKillPulse(3, 4)).toBe(true);
  });

  it("does not trigger full-screen boss shake when the boss first appears", () => {
    expect(shouldTriggerBossShake(false, false)).toBe(false);
    expect(shouldTriggerBossShake(false, true)).toBe(false);
    expect(shouldTriggerBossShake(true, true)).toBe(false);
  });

  it("layers impact presentation by target tier", () => {
    const player = getImpactPresentation("player");
    const normal = getImpactPresentation("normal");
    const elite = getImpactPresentation("elite");
    const boss = getImpactPresentation("boss");

    expect(player.flashTint).toBe(0xf4fbff);
    expect(player.burstTint).toBe(0x62f8d1);
    expect(normal.hitScale).toBeGreaterThan(player.hitScale);
    expect(elite.burstCount).toBeGreaterThan(normal.burstCount);
    expect(boss.burstCount).toBeGreaterThan(elite.burstCount);
    expect(boss.flashAlpha).toBeGreaterThan(normal.flashAlpha);
  });

  it("marks enemies as hit when they take projectile damage", () => {
    const state = createRunState();
    const enemy = spawnEnemy(state, "chaser", { x: 40, y: 0 });
    enemy.health = 1;
    state.projectiles.push({
      id: 100,
      owner: "player",
      position: { ...enemy.position },
      velocity: { x: 0, y: 0 },
      radius: 5,
      damage: 10,
      lifetimeMs: 1000,
      pierceRemaining: 0,
      hitEnemyIds: []
    });

    resolveCollisions(state);

    expect(enemy.hitFlashMs).toBeGreaterThan(0);
    expect(state.hitEffects.some((effect) => effect.tint === 0xffe66d)).toBe(true);
  });

  it("marks the player as hit when contact damage lands", () => {
    const state = createRunState();
    const enemy = spawnEnemy(state, "chaser", { ...state.player.position });

    resolveCollisions(state);

    expect(enemy.contactCooldownMs).toBeGreaterThan(0);
    expect(state.player.hitFlashMs).toBeGreaterThan(0);
    expect(state.hitEffects.some((effect) => effect.tint === 0x62f8d1)).toBe(true);
  });

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
