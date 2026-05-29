import type { MapEventType, RunState } from "./types";
import { TEXTURE_KEYS, WORLD_HEIGHT, WORLD_WIDTH, type CityDistrict } from "./assets";

export interface MapPressureProfile {
  spawnIntervalMultiplier: number;
  eliteChanceBonus: number;
  rewardMultiplier: number;
  batchBonus: number;
  weaponSupportBonus: number;
}

export type MapPointOfInterestKind =
  | "supply-cache"
  | "armory-crate"
  | "relay-tower"
  | "calibration-kiosk"
  | "prototype-container"
  | "test-terminal";

export interface MapPointOfInterest {
  kind: MapPointOfInterestKind;
  x: number;
  y: number;
  radius: number;
  label: string;
  runtimeKey?: string;
}

export interface MapPointModelPresentation {
  textureKey: string;
  displayScale: number;
}

const BASE_PROFILES: Record<CityDistrict, MapPressureProfile> = {
  hub: { spawnIntervalMultiplier: 1.22, eliteChanceBonus: 0, rewardMultiplier: 1, batchBonus: -1, weaponSupportBonus: 0 },
  north: { spawnIntervalMultiplier: 0.62, eliteChanceBonus: 0.09, rewardMultiplier: 1, batchBonus: 1, weaponSupportBonus: 0 },
  east: { spawnIntervalMultiplier: 0.9, eliteChanceBonus: 0.08, rewardMultiplier: 1.14, batchBonus: 0, weaponSupportBonus: 0 },
  south: { spawnIntervalMultiplier: 1.02, eliteChanceBonus: 0.04, rewardMultiplier: 1.08, batchBonus: 0, weaponSupportBonus: 0 },
  west: { spawnIntervalMultiplier: 0.82, eliteChanceBonus: 0.12, rewardMultiplier: 1, batchBonus: 1, weaponSupportBonus: 0 }
};

const EVENT_PROFILES: Record<MapEventType, Partial<MapPressureProfile>> = {
  none: {},
  supply: { rewardMultiplier: 1.18, spawnIntervalMultiplier: 1.08, weaponSupportBonus: 0 },
  hazard: { spawnIntervalMultiplier: 0.89, eliteChanceBonus: 0.05, rewardMultiplier: 1.02, batchBonus: 1 },
  wave: { spawnIntervalMultiplier: 0.78, eliteChanceBonus: 0.1, rewardMultiplier: 1.04, batchBonus: 2 },
  armory: { rewardMultiplier: 1.14, spawnIntervalMultiplier: 1.02, weaponSupportBonus: 1 },
  calibration: { rewardMultiplier: 1.12, spawnIntervalMultiplier: 1.08, weaponSupportBonus: 1 },
  relay: { rewardMultiplier: 1.08, spawnIntervalMultiplier: 0.94, batchBonus: 1, weaponSupportBonus: 1 },
  test: { rewardMultiplier: 1.12, spawnIntervalMultiplier: 0.86, eliteChanceBonus: 0.08, batchBonus: 2, weaponSupportBonus: 1 }
};

const POI_LABELS: Record<MapPointOfInterestKind, string> = {
  "supply-cache": "Supply Cache",
  "armory-crate": "Armory Crate",
  "relay-tower": "Relay Tower",
  "calibration-kiosk": "Calibration Kiosk",
  "prototype-container": "Prototype Container",
  "test-terminal": "Test Terminal"
};

const ZONE_CENTERS: Record<CityDistrict, { x: number; y: number }> = {
  hub: { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 },
  north: { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT * 0.2 },
  east: { x: WORLD_WIDTH * 0.78, y: WORLD_HEIGHT / 2 },
  south: { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT * 0.8 },
  west: { x: WORLD_WIDTH * 0.22, y: WORLD_HEIGHT / 2 }
};

function buildPoint(zone: CityDistrict, kind: MapPointOfInterestKind, index: number, total: number): MapPointOfInterest {
  const center = ZONE_CENTERS[zone];
  const spread = zone === "hub" ? 56 : 88;
  const angle = (Math.PI * 2 * index) / total + (zone === "west" ? Math.PI / 8 : 0);

  return {
    kind,
    x: center.x + Math.cos(angle) * spread,
    y: center.y + Math.sin(angle) * spread,
    radius: kind === "prototype-container" ? 15 : kind === "test-terminal" ? 13 : 11,
    label: POI_LABELS[kind]
  };
}

export function getMapPressureProfile(zone: CityDistrict, eventType: MapEventType): MapPressureProfile {
  const base = BASE_PROFILES[zone];
  const event = EVENT_PROFILES[eventType];

  return {
    spawnIntervalMultiplier: base.spawnIntervalMultiplier * (event.spawnIntervalMultiplier ?? 1),
    eliteChanceBonus: base.eliteChanceBonus + (event.eliteChanceBonus ?? 0),
    rewardMultiplier: base.rewardMultiplier * (event.rewardMultiplier ?? 1),
    batchBonus: base.batchBonus + (event.batchBonus ?? 0),
    weaponSupportBonus: base.weaponSupportBonus + (event.weaponSupportBonus ?? 0)
  };
}

export function getZonePointsOfInterest(zone: CityDistrict, eventType: MapEventType): MapPointOfInterest[] {
  const baseKinds: Record<CityDistrict, MapPointOfInterestKind[]> = {
    hub: ["supply-cache"],
    north: ["armory-crate", "relay-tower"],
    east: ["calibration-kiosk", "armory-crate"],
    south: ["supply-cache", "relay-tower"],
    west: ["prototype-container", "test-terminal"]
  };

  const eventKinds: Record<Exclude<MapEventType, "none">, MapPointOfInterestKind[]> = {
    supply: ["supply-cache"],
    hazard: ["relay-tower"],
    wave: ["relay-tower"],
    armory: ["armory-crate"],
    calibration: ["calibration-kiosk"],
    relay: ["relay-tower"],
    test: ["prototype-container", "test-terminal"]
  };

  const kinds = [...baseKinds[zone], ...(eventType === "none" ? [] : eventKinds[eventType])];
  const uniqueKinds = kinds.filter((kind, index) => kinds.indexOf(kind) === index);

  return uniqueKinds.map((kind, index) => buildPoint(zone, kind, index, uniqueKinds.length));
}

export function getMapPointRuntimeKey(
  zone: CityDistrict,
  eventType: MapEventType,
  mapEventCursor: number,
  kind: MapPointOfInterestKind
): string {
  return `${zone}:${eventType}:${mapEventCursor}:${kind}`;
}

export function getVisibleZonePointsOfInterest(state: RunState, zone: CityDistrict): MapPointOfInterest[] {
  const eventType = zone === state.activeZoneEventZone ? state.activeZoneEventType : "none";

  return getZonePointsOfInterest(zone, eventType)
    .map((point) => ({
      ...point,
      runtimeKey: getMapPointRuntimeKey(zone, eventType, state.mapEventCursor, point.kind)
    }))
    .filter((point) => !state.collectedMapPointKeys.includes(point.runtimeKey!));
}

export function getMapPointModelPresentation(kind: MapPointOfInterestKind): MapPointModelPresentation {
  const textureByKind: Record<MapPointOfInterestKind, string> = {
    "supply-cache": TEXTURE_KEYS.eventArmoryCrateV1,
    "armory-crate": TEXTURE_KEYS.eventArmoryCrateV1,
    "relay-tower": TEXTURE_KEYS.eventRelayTowerV1,
    "calibration-kiosk": TEXTURE_KEYS.eventCalibrationKioskV1,
    "prototype-container": TEXTURE_KEYS.eventPrototypeContainerV1,
    "test-terminal": TEXTURE_KEYS.eventTestTerminalV1
  };

  const displayScaleByKind: Record<MapPointOfInterestKind, number> = {
    "supply-cache": 3.2,
    "armory-crate": 3.35,
    "relay-tower": 3.8,
    "calibration-kiosk": 3.65,
    "prototype-container": 3.6,
    "test-terminal": 3.35
  };

  return {
    textureKey: textureByKind[kind],
    displayScale: displayScaleByKind[kind]
  };
}
