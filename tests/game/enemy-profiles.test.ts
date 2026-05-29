import { describe, expect, it } from "vitest";
import { ENEMY_TYPES } from "../../src/data/enemies";
import { getBossPhaseProfile, getEnemyProfile } from "../../src/game/enemyProfiles";

describe("enemy profiles", () => {
  it("assigns distinct pressure roles to enemy archetypes", () => {
    expect(ENEMY_TYPES.charger).toMatchObject({
      behavior: "dash",
      speed: 138,
      damage: 13
    });

    expect(ENEMY_TYPES.suppressor).toMatchObject({
      behavior: "suppress",
      speed: 66,
      damage: 10
    });

    expect(getEnemyProfile("runner")).toMatchObject({
      role: "dash-in",
      burstWindowMs: 220,
      recoveryWindowMs: 620
    });

    expect(getEnemyProfile("charger")).toMatchObject({
      role: "dash-in",
      burstWindowMs: 240,
      recoveryWindowMs: 680
    });

    expect(getEnemyProfile("shooter")).toMatchObject({
      role: "area-denial",
      preferredRange: 240,
      repositionChance: 0.35
    });

    expect(getEnemyProfile("suppressor")).toMatchObject({
      role: "area-denial",
      preferredRange: 260,
      repositionChance: 0.4
    });

    expect(ENEMY_TYPES.warden).toMatchObject({
      behavior: "suppress",
      radius: 22,
      damage: 16
    });

    expect(getEnemyProfile("warden")).toMatchObject({
      role: "area-denial",
      preferredRange: 220
    });
  });

  it("exposes readable boss phase profiles", () => {
    expect(getBossPhaseProfile(1)).toMatchObject({
      telegraphMs: 420,
      addCount: 0,
      burstCount: 0
    });

    expect(getBossPhaseProfile(2)).toMatchObject({
      telegraphMs: 560,
      addCount: 2,
      burstCount: 0
    });

    expect(getBossPhaseProfile(3)).toMatchObject({
      telegraphMs: 680,
      addCount: 3,
      burstCount: 8
    });
  });
});
