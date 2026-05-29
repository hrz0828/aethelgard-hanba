import { describe, expect, it } from "vitest";
import { applyWeaponUpgrade, equipWeapon, getWeaponDisplayState } from "../../src/game/weaponLoadout";
import { createRunState } from "../../src/game/state";
import { getWeaponPresentationState } from "../../src/game/weaponPresentation";

describe("weapon visuals", () => {
  it("renders the pulse rifle burst form as a wider multi-shot profile", () => {
    const state = createRunState();

    applyWeaponUpgrade(state, "pulse-rifle");
    const weapon = getWeaponDisplayState(state);

    expect(weapon.projectileStyle).toBe("pulse");
    expect(weapon.projectileCount).toBeGreaterThan(1);
    expect(weapon.spreadAngleRadians).toBeGreaterThan(0);
  });

  it("renders the beam cannon with a beam-specific visual profile", () => {
    const state = createRunState();

    equipWeapon(state, "beam-cannon");
    applyWeaponUpgrade(state, "beam-cannon");
    const weapon = getWeaponDisplayState(state);
    const presentation = getWeaponPresentationState(state);

    expect(weapon.projectileStyle).toBe("beam");
    expect(weapon.beamWidth).toBeGreaterThan(10);
    expect(weapon.projectileRadius).toBeGreaterThan(6);
    expect(presentation.trailStyle).toBe("beam");
    expect(presentation.trailLengthFactor).toBeGreaterThan(1);
    expect(presentation.leadGlowScale).toBeGreaterThan(1);
  });

  it("keeps pulse rifle launches tight and fast", () => {
    const state = createRunState();
    const presentation = getWeaponPresentationState(state);

    expect(presentation.trailStyle).toBe("streak");
    expect(presentation.trailLengthFactor).toBeLessThan(1);
    expect(presentation.leadGlowScale).toBeLessThan(1);
  });
});
