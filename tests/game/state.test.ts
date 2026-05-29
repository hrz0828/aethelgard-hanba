import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/game/state";

describe("createRunState", () => {
  it("creates a fresh playable run state", () => {
    const state = createRunState();

    expect(state.status).toBe("playing");
    expect(state.timeMs).toBe(0);
    expect(state.player.health).toBe(state.player.maxHealth);
    expect(state.player.level).toBe(1);
    expect(state.enemies).toEqual([]);
    expect(state.projectiles).toEqual([]);
    expect(state.pickups).toEqual([]);
  });
});
