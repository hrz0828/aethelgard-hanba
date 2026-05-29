import { describe, expect, it } from "vitest";
import { ENEMY_TYPES } from "../../src/data/enemies";
import { WEAPON_DEFINITIONS } from "../../src/data/weapons";
import { UPGRADE_DEFINITIONS } from "../../src/data/upgrades";
import { WAVE_DEFINITIONS } from "../../src/data/waves";

describe("game data", () => {
  it("defines the planned enemy and upgrade content", () => {
    expect(Object.keys(ENEMY_TYPES)).toHaveLength(9);
    expect(UPGRADE_DEFINITIONS).toHaveLength(10);
    expect(WAVE_DEFINITIONS.length).toBeGreaterThanOrEqual(8);
    expect(WEAPON_DEFINITIONS).toHaveLength(4);
  });

  it("keeps enemy keys and types aligned", () => {
    for (const [key, definition] of Object.entries(ENEMY_TYPES)) {
      expect(definition.type).toBe(key);
    }
  });

  it("keeps enemy numeric stats positive", () => {
    const numericStatKeys = ["radius", "health", "speed", "damage", "experience"] as const;

    for (const definition of Object.values(ENEMY_TYPES)) {
      for (const statKey of numericStatKeys) {
        expect(definition[statKey]).toBeGreaterThan(0);
      }
    }
  });

  it("keeps upgrade IDs unique", () => {
    const upgradeIds = UPGRADE_DEFINITIONS.map((definition) => definition.id);

    expect(new Set(upgradeIds).size).toBe(upgradeIds.length);
  });

  it("keeps waves ordered and spawnable", () => {
    for (const [index, wave] of WAVE_DEFINITIONS.entries()) {
      expect(wave.enemyTypes.length).toBeGreaterThan(0);

      for (const enemyType of wave.enemyTypes) {
        expect(ENEMY_TYPES).toHaveProperty(enemyType);
      }

      if (index > 0) {
        expect(wave.atMs).toBeGreaterThanOrEqual(WAVE_DEFINITIONS[index - 1].atMs);
      }
    }
  });
});
