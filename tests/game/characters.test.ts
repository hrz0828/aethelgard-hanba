import { describe, expect, it } from "vitest";
import {
  applyCharacterPreset,
  getCharacterAnimationPresentation,
  getCharacterPreset,
  getCharacterSpriteKey,
  getCharacterSpritePresentation
} from "../../src/game/characters";
import { createRunState } from "../../src/game/state";

describe("characters", () => {
  it("returns the soldier preset by default", () => {
    expect(getCharacterPreset("soldier").id).toBe("soldier");
    expect(getCharacterPreset("unknown").id).toBe("soldier");
  });

  it("exposes five roster presets", () => {
    expect(getCharacterPreset("soldier").label).toBeTruthy();
    expect(getCharacterPreset("scout").label).toBeTruthy();
    expect(getCharacterPreset("heavy").label).toBeTruthy();
    expect(getCharacterPreset("scavenger").label).toBeTruthy();
    expect(getCharacterPreset("vanguard").label).toBeTruthy();
  });

  it("applies each preset with only a small visible stat shift", () => {
    const soldier = createRunState();
    applyCharacterPreset(soldier, "soldier");
    expect(soldier.player.speed).toBe(245);
    expect(soldier.player.maxHealth).toBe(100);
    expect(soldier.player.pickupRadius).toBe(86);
    expect(soldier.player.experienceGainMultiplier).toBe(1);

    const scout = createRunState();
    applyCharacterPreset(scout, "scout");
    expect(scout.player.speed).toBeGreaterThan(245);
    expect(scout.player.maxHealth).toBeLessThan(100);

    const heavy = createRunState();
    applyCharacterPreset(heavy, "heavy");
    expect(heavy.player.speed).toBeLessThan(245);
    expect(heavy.player.maxHealth).toBeGreaterThan(100);

    const scavenger = createRunState();
    applyCharacterPreset(scavenger, "scavenger");
    expect(scavenger.player.pickupRadius).toBeGreaterThan(86);
    expect(scavenger.player.speed).toBe(245);
    expect(scavenger.player.experienceGainMultiplier).toBeGreaterThan(1);

    const vanguard = createRunState();
    applyCharacterPreset(vanguard, "vanguard");
    expect(vanguard.player.maxHealth).toBeGreaterThan(100);
    expect(vanguard.player.speed).toBeLessThan(245);
    expect(vanguard.player.invulnerableMs).toBeGreaterThan(0);
  });

  it("maps each role to a distinct base sprite silhouette", () => {
    expect(getCharacterSpriteKey("soldier")).toBe("soldier1_stand.png");
    expect(getCharacterSpriteKey("scout")).toBe("womanGreen_stand.png");
    expect(getCharacterSpriteKey("heavy")).toBe("robot1_stand.png");
    expect(getCharacterSpriteKey("scavenger")).toBe("survivor1_stand.png");
    expect(getCharacterSpriteKey("vanguard")).toBe("hitman1_stand.png");

    const spriteKeys = new Set([
      getCharacterSpriteKey("soldier"),
      getCharacterSpriteKey("scout"),
      getCharacterSpriteKey("heavy"),
      getCharacterSpriteKey("scavenger"),
      getCharacterSpriteKey("vanguard")
    ]);

    expect(spriteKeys.size).toBe(5);
  });

  it("uses generated runtime-v2 models for scout and heavy", () => {
    expect(getCharacterSpritePresentation("scout")).toMatchObject({
      textureKey: "character-scout-v2",
      displayScale: 3.2
    });
    expect(getCharacterSpritePresentation("heavy")).toMatchObject({
      textureKey: "character-heavy-v2",
      displayScale: 3.35
    });
    expect(getCharacterSpritePresentation("soldier")).toMatchObject({
      textureKey: "character-models",
      frame: "soldier1_stand.png"
    });
  });

  it("uses generated 3q animation frames for scout and heavy states", () => {
    expect(getCharacterAnimationPresentation("scout", "idle")).toMatchObject({
      textureKey: "character-scout-idle-v1"
    });
    expect(getCharacterAnimationPresentation("scout", "move")).toMatchObject({
      textureKey: "character-scout-move-v1"
    });
    expect(getCharacterAnimationPresentation("scout", "attack")).toMatchObject({
      textureKey: "character-scout-attack-v1"
    });
    expect(getCharacterAnimationPresentation("scout", "dodge")).toMatchObject({
      textureKey: "character-scout-dodge-v1"
    });
    expect(getCharacterAnimationPresentation("heavy", "attack")).toMatchObject({
      textureKey: "character-heavy-attack-v1"
    });
    expect(getCharacterAnimationPresentation("soldier", "move")).toMatchObject({
      textureKey: "character-models",
      frame: "soldier1_stand.png"
    });
  });
});
