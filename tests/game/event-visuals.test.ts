import { describe, expect, it } from "vitest";
import { getMapEventCueVisual, getMapEventVisual, getMapPointVisual } from "../../src/game/eventVisuals";

describe("map event visuals", () => {
  it("distinguishes weapon-related event markers", () => {
    expect(getMapEventVisual("armory")).toMatchObject({
      shape: "square",
      color: 0xffc84d
    });

    expect(getMapEventVisual("calibration")).toMatchObject({
      shape: "ring",
      color: 0x62f8d1
    });

    expect(getMapEventVisual("relay")).toMatchObject({
      shape: "node",
      color: 0x69a7ff
    });

    expect(getMapEventVisual("test")).toMatchObject({
      shape: "hazard",
      color: 0xb36dff
    });
  });

  it("layers entry, pulse, and fade cues for the same event", () => {
    expect(getMapEventCueVisual("relay", "enter")).toMatchObject({
      stage: "enter",
      radiusScale: 0.74,
      alpha: 0.22
    });

    expect(getMapEventCueVisual("relay", "start")).toMatchObject({
      stage: "start",
      radiusScale: 0.86,
      alpha: 0.38
    });

    expect(getMapEventCueVisual("relay", "end")).toMatchObject({
      stage: "end",
      radiusScale: 0.68,
      alpha: 0.16
    });
  });

  it("keeps event cues localized instead of flashing the whole screen", () => {
    for (const stage of ["enter", "start", "end"] as const) {
      const visual = getMapEventCueVisual("wave", stage);
      expect(visual.alpha).toBeLessThanOrEqual(0.38);
      expect(visual.fillAlpha).toBeLessThanOrEqual(0.015);
      expect(visual.radiusScale).toBeLessThan(1);
    }
  });

  it("keeps map warning markers away from red flashing colors", () => {
    expect(getMapEventVisual("wave").color).not.toBe(0xff5c7a);
    expect(getMapEventVisual("hazard").accentColor).not.toBe(0xff4f8b);
    expect(getMapPointVisual("test-terminal").accentColor).not.toBe(0xff5c7a);
  });
});
