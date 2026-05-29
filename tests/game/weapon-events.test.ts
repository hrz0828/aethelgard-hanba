import { describe, expect, it } from "vitest";
import { getZoneCenter, updateMapState } from "../../src/game/map";
import { updatePickups } from "../../src/game/pickups";
import { createRunState } from "../../src/game/state";
import { getWeaponDisplayState } from "../../src/game/weaponLoadout";

describe("weapon-related map events", () => {
  it("spawns an armory cache with a module drop in the north district", () => {
    const state = createRunState();
    state.player.position = getZoneCenter("north");

    updateMapState(state, 16);

    expect(state.activeZoneEventType).toBe("armory");
    expect(state.pickups.some((pickup) => pickup.kind === "weapon" && pickup.weaponDropKind === "module")).toBe(true);
    expect(state.enemies.some((enemy) => enemy.type === "warden")).toBe(true);
  });

  it("spawns a live test zone with a prototype drop and combat pressure in the west district", () => {
    const state = createRunState();
    state.player.position = getZoneCenter("west");

    updateMapState(state, 16);

    expect(state.activeZoneEventType).toBe("test");
    expect(state.pickups.some((pickup) => pickup.kind === "weapon" && pickup.weaponDropKind === "prototype")).toBe(true);
    expect(state.pickups.some((pickup) => pickup.kind === "weapon" && pickup.weaponId === "arc-gun")).toBe(true);
    expect(state.enemies.some((enemy) => enemy.type === "warden")).toBe(true);
    expect(state.enemies.length).toBeGreaterThan(0);
  });

  it("upgrades the active weapon immediately when a module drop is collected", () => {
    const state = createRunState();
    state.pickups.push({
      id: 100,
      kind: "weapon",
      position: { ...state.player.position },
      radius: 10,
      value: 0,
      weaponDropKind: "module",
      weaponId: "pulse-rifle"
    });

    updatePickups(state, 16);

    const weapon = getWeaponDisplayState(state);
    expect(state.pickups).toHaveLength(0);
    expect(weapon.formId).toBe("pulse-rifle-burst");
  });
});
