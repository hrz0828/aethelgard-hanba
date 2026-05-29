import { getCityDistrict, WORLD_HEIGHT, WORLD_WIDTH, type CityDistrict } from "./assets";
import { distance } from "./math";
import { nextId } from "./math";
import { spawnEnemy } from "./enemies";
import { getVisibleZonePointsOfInterest, getMapPressureProfile } from "./mapContent";
import { queueSfxCue } from "./sfx";
import { getNextWeaponClassId, spawnWeaponDrop } from "./weaponEvents";
import type { MapEventType, RunState, Vector2 } from "./types";

export interface MapProfile {
  spawnIntervalMultiplier: number;
  batchBonus: number;
  eliteChanceBonus: number;
  pickupValueMultiplier: number;
}

const ZONE_CENTERS: Record<CityDistrict, Vector2> = {
  hub: { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 },
  north: { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT * 0.2 },
  east: { x: WORLD_WIDTH * 0.78, y: WORLD_HEIGHT / 2 },
  south: { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT * 0.8 },
  west: { x: WORLD_WIDTH * 0.22, y: WORLD_HEIGHT / 2 }
};

const EVENT_DURATIONS: Record<Exclude<MapEventType, "none">, number> = {
  supply: 20_000,
  hazard: 24_000,
  wave: 18_000,
  armory: 18_000,
  calibration: 18_000,
  relay: 20_000,
  test: 22_000
};

const EVENT_ROTATION: Record<CityDistrict, Exclude<MapEventType, "none">[]> = {
  hub: ["supply"],
  north: ["armory", "hazard"],
  east: ["calibration", "supply"],
  south: ["relay", "supply"],
  west: ["test", "wave"]
};

export function getZoneCenter(zone: CityDistrict): Vector2 {
  return { ...ZONE_CENTERS[zone] };
}

export function getMapProfile(zone: CityDistrict, eventType: MapEventType): MapProfile {
  const profile = getMapPressureProfile(zone, eventType);

  return {
    spawnIntervalMultiplier: profile.spawnIntervalMultiplier,
    batchBonus: profile.batchBonus,
    eliteChanceBonus: profile.eliteChanceBonus,
    pickupValueMultiplier: profile.rewardMultiplier
  };
}

function createZonePickupPosition(zone: CityDistrict, index: number, count: number): Vector2 {
  const center = getZoneCenter(zone);
  const angle = (Math.PI * 2 * index) / count;
  const radius = zone === "hub" ? 64 : 96;

  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
}

function spawnSupplyDrops(state: RunState, zone: CityDistrict): void {
  for (let index = 0; index < 4; index += 1) {
    const position = createZonePickupPosition(zone, index, 4);
    state.pickups.push({
      id: nextId(state),
      kind: "experience",
      position,
      radius: 10,
      value: 10
    });
  }
}

function spawnWaveBurst(state: RunState, zone: CityDistrict): void {
  const center = getZoneCenter(zone);
  const enemyTypes = ["chaser", "runner", "shooter", "chaser", "runner", "tank"];

  for (let index = 0; index < enemyTypes.length; index += 1) {
    const angle = (Math.PI * 2 * index) / enemyTypes.length;
    spawnEnemy(state, enemyTypes[index], {
      x: center.x + Math.cos(angle) * 180,
      y: center.y + Math.sin(angle) * 180
    });
  }
}

function spawnEventWardens(state: RunState, zone: CityDistrict, count: number): void {
  const center = getZoneCenter(zone);

  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + Math.PI / 4;
    spawnEnemy(state, "warden", {
      x: center.x + Math.cos(angle) * 132,
      y: center.y + Math.sin(angle) * 132
    });
  }
}

function spawnWeaponSupportDrops(state: RunState, zone: CityDistrict, kind: "module" | "cache"): void {
  const center = getZoneCenter(zone);
  const weaponId = state.activeWeaponId ?? "pulse-rifle";
  spawnWeaponDrop(
    state,
    {
      x: center.x - 28,
      y: center.y
    },
    kind,
    weaponId
  );
}

function spawnTestZoneDrops(state: RunState, zone: CityDistrict): void {
  const center = getZoneCenter(zone);
  const activeWeaponId = state.activeWeaponId ?? "pulse-rifle";
  const prototypeWeaponId = getNextWeaponClassId(activeWeaponId);

  spawnWeaponDrop(
    state,
    {
      x: center.x - 34,
      y: center.y - 10
    },
    "prototype",
    prototypeWeaponId
  );

  spawnWeaponDrop(
    state,
    {
      x: center.x + 32,
      y: center.y + 8
    },
    "module",
    activeWeaponId
  );
}

function setEvent(state: RunState, zone: CityDistrict, type: Exclude<MapEventType, "none">): void {
  state.activeZoneEventZone = zone;
  state.activeZoneEventType = type;
  state.activeZoneEventMs = EVENT_DURATIONS[type];
  state.activeZoneEventSpawned = false;
  state.mapEventCursor += 1;

  if (type === "supply") {
    spawnSupplyDrops(state, zone);
    state.activeZoneEventSpawned = true;
    queueSfxCue(state, "zone-supply", 0.8);
  }

  if (type === "wave") {
    spawnWaveBurst(state, zone);
    queueSfxCue(state, "zone-wave", 1.1);
  }

  if (type === "armory") {
    spawnWeaponSupportDrops(state, zone, "module");
    spawnEventWardens(state, zone, 1);
    state.activeZoneEventSpawned = true;
    queueSfxCue(state, "zone-supply", 0.95);
  }

  if (type === "calibration") {
    spawnWeaponSupportDrops(state, zone, "cache");
    state.activeZoneEventSpawned = true;
    queueSfxCue(state, "zone-supply", 0.85);
  }

  if (type === "relay") {
    spawnEventWardens(state, zone, 2);
    state.activeZoneEventSpawned = true;
    queueSfxCue(state, "zone-hazard", 0.9);
  }

  if (type === "test") {
    spawnTestZoneDrops(state, zone);
    spawnWaveBurst(state, zone);
    spawnEventWardens(state, zone, 2);
    state.activeZoneEventSpawned = true;
    queueSfxCue(state, "zone-wave", 1.15);
  }

  if (type === "hazard") {
    queueSfxCue(state, "zone-hazard", 1);
  }
}

function clearEvent(state: RunState): void {
  state.activeZoneEventZone = "hub";
  state.activeZoneEventType = "none";
  state.activeZoneEventMs = 0;
  state.activeZoneEventSpawned = false;
  state.zoneEventArmed = false;
}

export function updateMapState(state: RunState, deltaMs: number): void {
  const zone = getCityDistrict(state.player.position.x, state.player.position.y);
  const changedZone = zone !== state.currentZone;

  state.currentZone = zone;

  if (changedZone && state.activeZoneEventType !== "none" && zone !== state.activeZoneEventZone) {
    clearEvent(state);
  }

  if (changedZone) {
    state.zoneEventArmed = zone !== "hub";
  }

  if (state.activeZoneEventType === "none" && state.zoneEventArmed && zone !== "hub") {
    const rotation = EVENT_ROTATION[zone];
    const type = rotation[state.mapEventCursor % rotation.length];
    setEvent(state, zone, type);
    state.zoneEventArmed = false;
  }

  if (state.activeZoneEventType !== "none") {
    state.activeZoneEventMs = Math.max(0, state.activeZoneEventMs - deltaMs);

    if (state.activeZoneEventMs <= 0 || state.currentZone !== state.activeZoneEventZone) {
      clearEvent(state);
    }
  }
}

export function collectMapPoints(state: RunState): void {
  const points = getVisibleZonePointsOfInterest(state, state.currentZone);

  for (const point of points) {
    if (distance(state.player.position, point) > state.player.radius + point.radius) {
      continue;
    }

    if (point.runtimeKey && !state.collectedMapPointKeys.includes(point.runtimeKey)) {
      state.collectedMapPointKeys.push(point.runtimeKey);
    }
  }
}

export function getZoneEnemyBias(zone: CityDistrict, eventType: MapEventType): number {
  const profile = getMapPressureProfile(zone, eventType);
  return profile.eliteChanceBonus;
}
