import { describe, expect, it } from "vitest";
import { updateBossEncounter } from "../../src/game/boss";
import { resolveCollisions } from "../../src/game/collision";
import { getZoneCenter, updateMapState } from "../../src/game/map";
import { createRunState } from "../../src/game/state";
import { spawnEnemy } from "../../src/game/enemies";
import { updateWeapons } from "../../src/game/weapons";

describe("sfx cues", () => {
  it("queues a shot cue when the weapon fires", () => {
    const state = createRunState();
    spawnEnemy(state, "chaser", { x: 40, y: 0 });

    updateWeapons(state, 16);

    expect(state.sfxEvents.some((cue) => cue.type === "shot")).toBe(true);
  });

  it("queues hit and kill cues on impact", () => {
    const state = createRunState();
    const enemy = spawnEnemy(state, "chaser", { x: 40, y: 0 });
    enemy.health = 1;
    state.projectiles.push({
      id: 100,
      owner: "player",
      position: { ...enemy.position },
      velocity: { x: 0, y: 0 },
      radius: 5,
      damage: 10,
      lifetimeMs: 1000,
      pierceRemaining: 0,
      hitEnemyIds: []
    });

    resolveCollisions(state);

    expect(state.sfxEvents.some((cue) => cue.type === "enemy-hit")).toBe(true);
    expect(state.sfxEvents.some((cue) => cue.type === "kill")).toBe(true);
  });

  it("queues zone and boss cues when events start", () => {
    const state = createRunState();
    state.player.position = getZoneCenter("west");

    updateMapState(state, 16);
    expect(state.activeZoneEventType).toBe("test");
    expect(state.sfxEvents.some((cue) => cue.type === "zone-wave")).toBe(true);

    const armoryState = createRunState();
    armoryState.player.position = getZoneCenter("north");

    updateMapState(armoryState, 16);
    expect(armoryState.activeZoneEventType).toBe("armory");
    expect(armoryState.sfxEvents.some((cue) => cue.type === "zone-supply")).toBe(true);

    state.timeMs = 360_000;
    updateBossEncounter(state, 16);
    expect(state.sfxEvents.some((cue) => cue.type === "boss-spawn")).toBe(true);
  });
});
