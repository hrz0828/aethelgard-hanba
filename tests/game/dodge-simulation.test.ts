import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/game/state";
import { updateSimulation } from "../../src/game/simulation";

describe("dodge simulation", () => {
  it("starts a dodge, grants i-frames, and advances the player", () => {
    const state = createRunState();
    state.player.position = { x: 200, y: 200 };

    updateSimulation(state, { x: 1, y: 0, dodgePressed: true }, 16);

    expect(state.player.dodge.activeMs).toBeGreaterThan(0);
    expect(state.player.invulnerableMs).toBeGreaterThan(0);
    expect(state.player.position.x).toBeGreaterThan(200);
    expect(state.player.dodge.cooldownRemainingMs).toBeGreaterThan(0);

    const positionAfterFirstFrame = { ...state.player.position };
    updateSimulation(state, { x: 1, y: 0, dodgePressed: true }, 16);

    expect(state.player.position.x).toBeGreaterThanOrEqual(positionAfterFirstFrame.x);
  });
});
