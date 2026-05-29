import { describe, expect, it } from "vitest";
import { applyWeaponUpgrade } from "../../src/game/weaponLoadout";
import { createRunState } from "../../src/game/state";
import { getWeaponPresentationState } from "../../src/game/weaponPresentation";

describe("weapon evolution", () => {
  it("exposes visible changes as the weapon upgrades", () => {
    const state = createRunState();

    const base = getWeaponPresentationState(state);
    expect(base.weaponId).toBe("pulse-rifle");
    expect(base.formId).toBe("single");
    expect(base.projectileColor).toBe(0x62f8d1);
    expect(base.trailStyle).toBe("streak");

    applyWeaponUpgrade(state, "pulse-rifle");

    const burst = getWeaponPresentationState(state);
    expect(burst.formName).toBe("Burst Barrel");
    expect(burst.projectileCount).toBeGreaterThan(1);
    expect(burst.muzzleFlashScale).toBeGreaterThan(1);
    expect(burst.projectileColor).not.toBe(base.projectileColor);
  });
});
