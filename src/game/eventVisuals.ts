import type { MapEventType } from "./types";
import type { MapPointOfInterestKind } from "./mapContent";

export type EventVisualShape = "ring" | "square" | "node" | "hazard";
export type MapEventCueStage = "enter" | "start" | "end";

export type MapPointVisualShape = "square" | "ring" | "node" | "hazard";

export interface MapEventVisual {
  color: number;
  accentColor: number;
  shape: EventVisualShape;
  pulseScale: number;
  lineWidth: number;
}

export interface MapEventCueVisual extends MapEventVisual {
  stage: MapEventCueStage;
  radiusScale: number;
  alpha: number;
  fillAlpha: number;
  accentAlpha: number;
}

export interface MapPointVisual {
  color: number;
  accentColor: number;
  shape: MapPointVisualShape;
  labelColor: number;
}

const MAP_EVENT_VISUALS: Record<MapEventType, MapEventVisual> = {
  none: {
    color: 0x62f8d1,
    accentColor: 0xeafff8,
    shape: "node",
    pulseScale: 1,
    lineWidth: 1
  },
  supply: {
    color: 0xffe66d,
    accentColor: 0xfff5be,
    shape: "square",
    pulseScale: 1.06,
    lineWidth: 2
  },
  hazard: {
    color: 0xffc84d,
    accentColor: 0xfff2a0,
    shape: "hazard",
    pulseScale: 1.12,
    lineWidth: 2
  },
  wave: {
    color: 0x69a7ff,
    accentColor: 0xa4ffe9,
    shape: "hazard",
    pulseScale: 1.14,
    lineWidth: 2
  },
  armory: {
    color: 0xffc84d,
    accentColor: 0xfff2a0,
    shape: "square",
    pulseScale: 1.08,
    lineWidth: 3
  },
  calibration: {
    color: 0x62f8d1,
    accentColor: 0xa4ffe9,
    shape: "ring",
    pulseScale: 1.1,
    lineWidth: 3
  },
  relay: {
    color: 0x69a7ff,
    accentColor: 0xa4ffe9,
    shape: "node",
    pulseScale: 1.16,
    lineWidth: 3
  },
  test: {
    color: 0xb36dff,
    accentColor: 0x62f8d1,
    shape: "hazard",
    pulseScale: 1.2,
    lineWidth: 3
  }
};

const MAP_POINT_VISUALS: Record<MapPointOfInterestKind, MapPointVisual> = {
  "supply-cache": { color: 0xffe66d, accentColor: 0xfff2a0, shape: "square", labelColor: 0xfff2a0 },
  "armory-crate": { color: 0xffc84d, accentColor: 0xfff2a0, shape: "square", labelColor: 0xfff2a0 },
  "relay-tower": { color: 0x69a7ff, accentColor: 0xa4ffe9, shape: "node", labelColor: 0xa4ffe9 },
  "calibration-kiosk": { color: 0x62f8d1, accentColor: 0xeafff8, shape: "ring", labelColor: 0xeafff8 },
  "prototype-container": { color: 0xb36dff, accentColor: 0xfff2a0, shape: "hazard", labelColor: 0xfff2a0 },
  "test-terminal": { color: 0xffc84d, accentColor: 0xa4ffe9, shape: "square", labelColor: 0xfff2a0 }
};

export function getMapEventVisual(eventType: MapEventType): MapEventVisual {
  return MAP_EVENT_VISUALS[eventType];
}

export function getMapEventCueVisual(eventType: MapEventType, stage: MapEventCueStage): MapEventCueVisual {
  const visual = getMapEventVisual(eventType);

  const cueVisuals: Record<
    MapEventCueStage,
    Pick<MapEventCueVisual, "radiusScale" | "alpha" | "fillAlpha" | "accentAlpha">
  > = {
    enter: {
      radiusScale: 0.74,
      alpha: 0.22,
      fillAlpha: 0.01,
      accentAlpha: 0.18
    },
    start: {
      radiusScale: 0.86,
      alpha: 0.38,
      fillAlpha: 0.015,
      accentAlpha: 0.24
    },
    end: {
      radiusScale: 0.68,
      alpha: 0.16,
      fillAlpha: 0,
      accentAlpha: 0.1
    }
  };

  return {
    ...visual,
    stage,
    ...cueVisuals[stage]
  };
}

export function getMapPointVisual(kind: MapPointOfInterestKind): MapPointVisual {
  return MAP_POINT_VISUALS[kind];
}
