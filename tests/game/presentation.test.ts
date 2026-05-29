import { describe, expect, it } from "vitest";
import { getCityDistrict, getEnemyPresentation } from "../../src/game/assets";
import { getCharacterPresentation, getCharacterSpriteKey } from "../../src/game/characters";
import { getCharacterDodgeProfile } from "../../src/game/dodge";

describe("presentation helpers", () => {
  it("maps enemy archetypes to distinct visuals", () => {
    expect(getEnemyPresentation({ type: "chaser", elite: false })).toMatchObject({
      textureKey: "enemy-zombie",
      tint: 0xffffff
    });

    expect(getEnemyPresentation({ type: "runner", elite: false })).toMatchObject({
      textureKey: "enemy-fast",
      tint: 0xd8ffd4
    });

    expect(getEnemyPresentation({ type: "tank", elite: false })).toMatchObject({
      textureKey: "enemy-heavy",
      tint: 0xa7c4ff
    });

    expect(getEnemyPresentation({ type: "shooter", elite: false })).toMatchObject({
      textureKey: "enemy-soldier",
      tint: 0xb7f7ff
    });

    expect(getEnemyPresentation({ type: "elite", elite: true })).toMatchObject({
      textureKey: "enemy-elite-move-v1",
      tint: 0xffffff
    });

    expect(getEnemyPresentation({ type: "burster", elite: false })).toMatchObject({
      textureKey: "enemy-burster-move-v1",
      tint: 0xffffff
    });

    expect(getEnemyPresentation({ type: "tank", elite: false }).displayScale).toBeGreaterThan(
      getEnemyPresentation({ type: "chaser", elite: false }).displayScale
    );
    expect(Object.keys(getEnemyPresentation({ type: "chaser", elite: false })).sort()).toEqual([
      "displayScale",
      "textureKey",
      "tint"
    ]);
    expect(getEnemyPresentation({ type: "burster", elite: false }).textureKey).not.toBe(
      getEnemyPresentation({ type: "elite", elite: true }).textureKey
    );
    expect(getEnemyPresentation({ type: "warden", elite: false })).toMatchObject({
      textureKey: "enemy-warden-v1",
      tint: 0xffffff
    });
    expect(getEnemyPresentation({ type: "elite", elite: true }).textureKey).not.toBe(
      getEnemyPresentation({ type: "chaser", elite: false }).textureKey
    );

    expect(getCharacterPresentation("vanguard")).toMatchObject({
      tint: 0xffc84d,
      accentTint: 0xfff2a0
    });

    expect(Object.keys(getCharacterPresentation("soldier"))).toEqual(["tint", "accentTint"]);
    expect(getCharacterSpriteKey("soldier")).not.toBe(getCharacterSpriteKey("scout"));
    expect(getCharacterSpriteKey("heavy")).not.toBe(getCharacterSpriteKey("scavenger"));

    expect(getCharacterDodgeProfile("scout")).toMatchObject({
      type: "blink"
    });
  });

  it("switches burster and elite enemies to attack animation frames", () => {
    expect(getEnemyPresentation({ type: "burster", elite: false }, "attack")).toMatchObject({
      textureKey: "enemy-burster-attack-v1"
    });
    expect(getEnemyPresentation({ type: "elite", elite: true }, "attack")).toMatchObject({
      textureKey: "enemy-elite-attack-v1"
    });
  });

  it("places the map into readable districts", () => {
    expect(getCityDistrict(1024, 1024)).toBe("hub");
    expect(getCityDistrict(1024, 400)).toBe("north");
    expect(getCityDistrict(1600, 1024)).toBe("east");
    expect(getCityDistrict(1024, 1700)).toBe("south");
    expect(getCityDistrict(400, 1024)).toBe("west");
  });
});
