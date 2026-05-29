import { describe, expect, it } from "vitest";
import { applyUpgrade } from "../../src/game/upgrades";
import { createRunState } from "../../src/game/state";

describe("upgrade synergies", () => {
  it("does not unlock synergy effects before thresholds are met", () => {
    const state = createRunState();

    applyUpgrade(state, "pierce");

    expect(state.player.stats.pierce).toBe(1);
    expect(state.player.stats.chainChance).toBe(0);
    expect(state.upgradeSynergies).toEqual([]);
  });

  it("unlocks direct amplification synergies once the thresholds are reached", () => {
    const state = createRunState();

    applyUpgrade(state, "pierce");
    applyUpgrade(state, "pierce");
    applyUpgrade(state, "chain");
    applyUpgrade(state, "chain");

    expect(state.player.stats.pierce).toBe(3);
    expect(state.player.stats.chainChance).toBeGreaterThan(0.12 * 2);
    expect(state.upgradeSynergies).toContain("pierce-chain");
  });

  it("does not reapply the same synergy after it has unlocked", () => {
    const state = createRunState();

    applyUpgrade(state, "damage");
    applyUpgrade(state, "damage");
    applyUpgrade(state, "fire-rate");
    applyUpgrade(state, "fire-rate");
    applyUpgrade(state, "fire-rate");

    const damageAfterUnlock = state.player.stats.damage;
    const fireRateAfterUnlock = state.player.stats.fireRateMs;
    const synergyCountAfterUnlock = state.upgradeSynergies.length;

    applyUpgrade(state, "damage");
    applyUpgrade(state, "fire-rate");

    expect(state.upgradeSynergies.length).toBe(synergyCountAfterUnlock);
    expect(state.player.stats.damage).toBeGreaterThanOrEqual(damageAfterUnlock);
    expect(state.player.stats.fireRateMs).toBeLessThanOrEqual(fireRateAfterUnlock);
  });
});
