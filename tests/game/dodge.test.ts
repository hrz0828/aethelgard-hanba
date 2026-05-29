import { describe, expect, it } from "vitest";
import { getCharacterDodgeProfile } from "../../src/game/dodge";

describe("dodge profiles", () => {
  it("maps every character to a fixed dodge style", () => {
    expect(getCharacterDodgeProfile("scout")).toMatchObject({
      type: "blink",
      cooldownMs: 1450,
      durationMs: 120,
      iFrameMs: 160,
      travelDistance: 180
    });

    expect(getCharacterDodgeProfile("soldier")).toMatchObject({
      type: "roll",
      cooldownMs: 1200,
      durationMs: 180,
      iFrameMs: 220,
      travelDistance: 150
    });

    expect(getCharacterDodgeProfile("heavy")).toMatchObject({
      type: "jump",
      cooldownMs: 1600,
      durationMs: 220,
      iFrameMs: 180,
      travelDistance: 170
    });

    expect(getCharacterDodgeProfile("scavenger")).toMatchObject({
      type: "dash",
      cooldownMs: 1100,
      durationMs: 140,
      iFrameMs: 120,
      travelDistance: 200
    });

    expect(getCharacterDodgeProfile("vanguard")).toMatchObject({
      type: "shield-step",
      cooldownMs: 1500,
      durationMs: 160,
      iFrameMs: 260,
      travelDistance: 140
    });
  });
});
