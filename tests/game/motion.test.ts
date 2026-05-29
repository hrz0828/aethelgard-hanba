import { describe, expect, it } from "vitest";
import { getEnemyMotionFrame, getPlayerMotionFrame, getUprightPlayerSpritePose } from "../../src/game/motion";

describe("motion presentation", () => {
  it("stretches the player while dodging", () => {
    const frame = getPlayerMotionFrame({
      velocity: { x: 240, y: 0 },
      dodgeType: "roll",
      dodgeActiveMs: 120,
      invulnerableMs: 120,
      hitFlashMs: 0
    });

    expect(frame.scaleX).toBeGreaterThan(1);
    expect(frame.scaleY).toBeLessThan(1);
    expect(frame.alpha).toBeLessThan(1);
  });

  it("leans and flashes enemies by threat tier", () => {
    const frame = getEnemyMotionFrame({
      velocity: { x: 160, y: 0 },
      elite: true,
      boss: false,
      hitFlashMs: 120
    });

    expect(frame.scaleX).toBeGreaterThan(1);
    expect(frame.scaleY).toBeLessThan(1);
    expect(frame.alpha).toBeLessThan(1);
  });

  it("keeps boss hit motion heavier but more restrained than elite hit motion", () => {
    const eliteFrame = getEnemyMotionFrame({
      velocity: { x: 160, y: 0 },
      elite: true,
      boss: false,
      hitFlashMs: 120
    });

    const bossFrame = getEnemyMotionFrame({
      velocity: { x: 160, y: 0 },
      elite: false,
      boss: true,
      hitFlashMs: 120
    });

    expect(bossFrame.scaleX).toBeGreaterThan(1);
    expect(bossFrame.scaleX).toBeLessThan(eliteFrame.scaleX);
    expect(bossFrame.scaleY).toBeGreaterThan(eliteFrame.scaleY);
    expect(bossFrame.alpha).toBeGreaterThan(eliteFrame.alpha);
  });

  it("keeps 3q player sprites upright while moving instead of rotating them sideways", () => {
    expect(getUprightPlayerSpritePose({ x: 260, y: 0 })).toEqual({
      rotation: 0,
      flipX: false
    });
    expect(getUprightPlayerSpritePose({ x: -260, y: 0 })).toEqual({
      rotation: 0,
      flipX: true
    });
  });
});
