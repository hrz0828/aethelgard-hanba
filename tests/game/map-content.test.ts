import { describe, expect, it } from "vitest";
import {
  getMapPointModelPresentation,
  getMapPointRuntimeKey,
  getVisibleZonePointsOfInterest,
  getZonePointsOfInterest
} from "../../src/game/mapContent";
import { createRunState } from "../../src/game/state";

describe("map content", () => {
  it("places weapon-oriented points of interest into districts", () => {
    expect(getZonePointsOfInterest("west", "test")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "prototype-container" }),
        expect.objectContaining({ kind: "test-terminal" })
      ])
    );
  });

  it("keeps other districts readable and weapon-related", () => {
    expect(getZonePointsOfInterest("east", "calibration")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "calibration-kiosk" }),
        expect.objectContaining({ kind: "armory-crate" })
      ])
    );
  });

  it("maps weapon-oriented points of interest to dedicated event entity models", () => {
    expect(getMapPointModelPresentation("armory-crate")).toMatchObject({
      textureKey: "event-armory-crate-v1"
    });
    expect(getMapPointModelPresentation("calibration-kiosk")).toMatchObject({
      textureKey: "event-calibration-kiosk-v1"
    });
    expect(getMapPointModelPresentation("relay-tower")).toMatchObject({
      textureKey: "event-relay-tower-v1"
    });
    expect(getMapPointModelPresentation("prototype-container")).toMatchObject({
      textureKey: "event-prototype-container-v1"
    });
    expect(getMapPointModelPresentation("test-terminal")).toMatchObject({
      textureKey: "event-test-terminal-v1"
    });
  });

  it("hides collected map event models until the event refreshes", () => {
    const state = createRunState();
    state.activeZoneEventZone = "east";
    state.activeZoneEventType = "calibration";
    state.mapEventCursor = 3;
    const collectedKey = getMapPointRuntimeKey("east", "calibration", 3, "calibration-kiosk");
    state.collectedMapPointKeys.push(collectedKey);

    expect(getVisibleZonePointsOfInterest(state, "east").map((point) => point.kind)).not.toContain("calibration-kiosk");

    state.mapEventCursor = 4;

    expect(getVisibleZonePointsOfInterest(state, "east").map((point) => point.kind)).toContain("calibration-kiosk");
  });
});
