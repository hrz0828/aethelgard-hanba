import { describe, expect, it } from "vitest";
import { collectMapPoints, getMapProfile, updateMapState } from "../../src/game/map";
import { getMapPointRuntimeKey, getZonePointsOfInterest } from "../../src/game/mapContent";
import { createRunState } from "../../src/game/state";

describe("map events", () => {
  it("gives each zone a distinct risk and reward profile", () => {
    const hub = getMapProfile("hub", "none");
    const north = getMapProfile("north", "hazard");
    const east = getMapProfile("east", "supply");
    const west = getMapProfile("west", "wave");

    expect(hub.spawnIntervalMultiplier).toBeGreaterThan(1);
    expect(hub.eliteChanceBonus).toBe(0);
    expect(hub.pickupValueMultiplier).toBe(1);

    expect(north.spawnIntervalMultiplier).toBeLessThan(0.6);
    expect(north.eliteChanceBonus).toBeGreaterThan(0.1);

    expect(east.pickupValueMultiplier).toBeGreaterThan(1.3);

    expect(west.spawnIntervalMultiplier).toBeLessThan(0.7);
    expect(west.eliteChanceBonus).toBeGreaterThan(0.2);
  });

  it("starts a zone event when the player enters an outer zone", () => {
    const state = createRunState();
    state.player.position = { x: 1600, y: 1024 };

    updateMapState(state, 16);

    expect(state.currentZone).toBe("east");
    expect(state.activeZoneEventType).toBe("calibration");
    expect(state.activeZoneEventZone).toBe("east");
    expect(state.pickups.length).toBeGreaterThan(0);
  });

  it("ends the active event when the player leaves the zone", () => {
    const state = createRunState();
    state.player.position = { x: 400, y: 1024 };

    updateMapState(state, 16);
    expect(state.activeZoneEventType).toBe("test");

    state.player.position = { x: 1024, y: 1024 };
    updateMapState(state, 16);

    expect(state.activeZoneEventType).toBe("none");
    expect(state.activeZoneEventZone).toBe("hub");
  });

  it("marks a map event model collected when the player reaches it", () => {
    const state = createRunState();
    state.currentZone = "east";
    state.activeZoneEventZone = "east";
    state.activeZoneEventType = "calibration";
    state.mapEventCursor = 7;
    const point = getZonePointsOfInterest("east", "calibration").find((candidate) => candidate.kind === "calibration-kiosk");
    expect(point).toBeDefined();
    state.player.position = { x: point!.x, y: point!.y };

    collectMapPoints(state);

    expect(state.collectedMapPointKeys).toContain(getMapPointRuntimeKey("east", "calibration", 7, "calibration-kiosk"));
  });
});
