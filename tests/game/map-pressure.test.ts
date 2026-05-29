import { describe, expect, it } from "vitest";
import { getMapPressureProfile } from "../../src/game/mapContent";

describe("map pressure", () => {
  it("gives districts distinct pressure and reward profiles", () => {
    expect(getMapPressureProfile("north", "hazard")).toMatchObject({
      eliteChanceBonus: 0.14,
      rewardMultiplier: 1.02
    });

    expect(getMapPressureProfile("north", "hazard").spawnIntervalMultiplier).toBeCloseTo(0.55, 2);

    expect(getMapPressureProfile("east", "calibration").rewardMultiplier).toBeCloseTo(1.28, 2);
    expect(getMapPressureProfile("east", "calibration").weaponSupportBonus).toBe(1);

    expect(getMapPressureProfile("west", "test")).toMatchObject({
      eliteChanceBonus: 0.2,
      rewardMultiplier: 1.12
    });
  });
});
