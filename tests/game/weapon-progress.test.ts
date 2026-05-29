import { describe, expect, it } from "vitest";
import { applyWeaponUpgrade, equipWeapon, getWeaponDisplayState } from "../../src/game/weaponLoadout";
import { createRunState } from "../../src/game/state";

describe("weapon progression", () => {
  it("initializes the pulse rifle as the default starter weapon", () => {
    const state = createRunState();
    const weapon = getWeaponDisplayState(state);

    expect(state.activeWeaponId).toBe("pulse-rifle");
    expect(weapon.weaponId).toBe("pulse-rifle");
    expect(weapon.formId).toBe("single");
    expect(weapon.projectileCount).toBe(1);
  });

  it("equips a weapon by updating the active weapon fields", () => {
    const state = createRunState();

    equipWeapon(state, "beam-cannon");
    const weapon = getWeaponDisplayState(state);

    expect(state.activeWeaponId).toBe("beam-cannon");
    expect(state.activeWeaponFormId).toBeUndefined();
    expect(weapon.weaponId).toBe("beam-cannon");
    expect(weapon.formId).toBe("single");
    expect(weapon.projectileStyle).toBe("beam");
  });

  it("equips and upgrades the shard launcher into a wider fragment weapon", () => {
    const state = createRunState();

    equipWeapon(state, "shard-launcher");
    applyWeaponUpgrade(state, "shard-launcher");
    const weapon = getWeaponDisplayState(state);

    expect(weapon.weaponId).toBe("shard-launcher");
    expect(weapon.projectileStyle).toBe("shard");
    expect(weapon.formId).toBe("shard-launcher-fan");
    expect(weapon.projectileCount).toBeGreaterThan(2);
  });

  it("upgrades the pulse rifle into a burst form with more projectiles", () => {
    const state = createRunState();

    applyWeaponUpgrade(state, "pulse-rifle");
    const weapon = getWeaponDisplayState(state);

    expect(weapon.formId).toBe("pulse-rifle-burst");
    expect(weapon.projectileCount).toBeGreaterThan(1);
    expect(state.weaponUpgradeHistory).toHaveLength(1);
  });
});
