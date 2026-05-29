import type Phaser from "phaser";
import type { EnemyState } from "./types";

export const WORLD_WIDTH = 2048;
export const WORLD_HEIGHT = 2048;
export const TILE_SIZE = 16;

export const TEXTURE_KEYS = {
  characterAtlas: "character-models",
  characterScoutV2: "character-scout-v2",
  characterHeavyV2: "character-heavy-v2",
  characterScoutIdleV1: "character-scout-idle-v1",
  characterScoutMoveV1: "character-scout-move-v1",
  characterScoutAttackV1: "character-scout-attack-v1",
  characterScoutDodgeV1: "character-scout-dodge-v1",
  characterHeavyIdleV1: "character-heavy-idle-v1",
  characterHeavyMoveV1: "character-heavy-move-v1",
  characterHeavyAttackV1: "character-heavy-attack-v1",
  characterHeavyDodgeV1: "character-heavy-dodge-v1",
  enemyZombie: "enemy-zombie",
  enemyFast: "enemy-fast",
  enemyRobot: "enemy-robot",
  enemyHeavy: "enemy-heavy",
  enemySoldier: "enemy-soldier",
  enemyElite: "enemy-elite",
  enemyHitman: "enemy-hitman",
  enemyBurster: "enemy-burster",
  enemyBursterV2: "enemy-burster-v2",
  enemyEliteV2: "enemy-elite-v2",
  enemyBursterMoveV1: "enemy-burster-move-v1",
  enemyBursterAttackV1: "enemy-burster-attack-v1",
  enemyEliteMoveV1: "enemy-elite-move-v1",
  enemyEliteAttackV1: "enemy-elite-attack-v1",
  enemyWardenV1: "enemy-warden-v1",
  weaponPulseRifleV2: "weapon-pulse-rifle-v2",
  weaponArcGunV2: "weapon-arc-gun-v2",
  weaponBeamCannonV2: "weapon-beam-cannon-v2",
  weaponShardLauncherV1: "weapon-shard-launcher-v1",
  weaponShardLauncherPickupV1: "weapon-shard-launcher-pickup-v1",
  eventArmoryCrateV1: "event-armory-crate-v1",
  eventCalibrationKioskV1: "event-calibration-kiosk-v1",
  eventRelayTowerV1: "event-relay-tower-v1",
  eventPrototypeContainerV1: "event-prototype-container-v1",
  eventTestTerminalV1: "event-test-terminal-v1",
  worldMapV1: "world-map-v1"
} as const;

export const ASSET_URLS = {
  characterAtlas: new URL("../../assets/kenney-topdown/extracted/Spritesheet/spritesheet_characters.png", import.meta.url).href,
  characterAtlasXml: new URL("../../assets/kenney-topdown/extracted/Spritesheet/spritesheet_characters.xml", import.meta.url).href,
  characterScoutV2: new URL("../../assets/generated/runtime-v2/characters/scout.png", import.meta.url).href,
  characterHeavyV2: new URL("../../assets/generated/runtime-v2/characters/heavy.png", import.meta.url).href,
  characterScoutIdleV1: new URL("../../assets/generated/animation-v1/runtime/characters/scout/idle.png", import.meta.url).href,
  characterScoutMoveV1: new URL("../../assets/generated/animation-v1/runtime/characters/scout/move.png", import.meta.url).href,
  characterScoutAttackV1: new URL("../../assets/generated/animation-v1/runtime/characters/scout/attack.png", import.meta.url).href,
  characterScoutDodgeV1: new URL("../../assets/generated/animation-v1/runtime/characters/scout/dodge.png", import.meta.url).href,
  characterHeavyIdleV1: new URL("../../assets/generated/animation-v1/runtime/characters/heavy/idle.png", import.meta.url).href,
  characterHeavyMoveV1: new URL("../../assets/generated/animation-v1/runtime/characters/heavy/move.png", import.meta.url).href,
  characterHeavyAttackV1: new URL("../../assets/generated/animation-v1/runtime/characters/heavy/attack.png", import.meta.url).href,
  characterHeavyDodgeV1: new URL("../../assets/generated/animation-v1/runtime/characters/heavy/dodge.png", import.meta.url).href,
  enemyZombie: new URL("../../assets/oga/zombie.png", import.meta.url).href,
  enemyFast: new URL("../../assets/kenney-topdown/extracted/PNG/Woman Green/womanGreen_stand.png", import.meta.url).href,
  enemyRobot: new URL("../../assets/kenney-topdown/extracted/PNG/Robot 1/robot1_stand.png", import.meta.url).href,
  enemyHeavy: new URL("../../assets/kenney-topdown/extracted/PNG/Robot 1/robot1_machine.png", import.meta.url).href,
  enemySoldier: new URL("../../assets/kenney-topdown/extracted/PNG/Soldier 1/soldier1_stand.png", import.meta.url).href,
  enemyElite: new URL("../../assets/kenney-topdown/extracted/PNG/Man Blue/manBlue_stand.png", import.meta.url).href,
  enemyHitman: new URL("../../assets/kenney-topdown/extracted/PNG/Hitman 1/hitman1_stand.png", import.meta.url).href,
  enemyBurster: new URL("../../assets/kenney-topdown/extracted/PNG/Man Old/manOld_stand.png", import.meta.url).href,
  enemyBursterV2: new URL("../../assets/generated/runtime-v2/enemies/burster.png", import.meta.url).href,
  enemyEliteV2: new URL("../../assets/generated/runtime-v2/enemies/elite.png", import.meta.url).href,
  enemyBursterMoveV1: new URL("../../assets/generated/animation-v1/runtime/enemies/burster/move.png", import.meta.url).href,
  enemyBursterAttackV1: new URL("../../assets/generated/animation-v1/runtime/enemies/burster/attack.png", import.meta.url).href,
  enemyEliteMoveV1: new URL("../../assets/generated/animation-v1/runtime/enemies/elite/move.png", import.meta.url).href,
  enemyEliteAttackV1: new URL("../../assets/generated/animation-v1/runtime/enemies/elite/attack.png", import.meta.url).href,
  enemyWardenV1: new URL("../../assets/generated/event-v1/enemies/warden.png", import.meta.url).href,
  weaponPulseRifleV2: new URL("../../assets/generated/runtime-v2/weapons/pulse-rifle.png", import.meta.url).href,
  weaponArcGunV2: new URL("../../assets/generated/runtime-v2/weapons/arc-gun.png", import.meta.url).href,
  weaponBeamCannonV2: new URL("../../assets/generated/runtime-v2/weapons/beam-cannon.png", import.meta.url).href,
  weaponShardLauncherV1: new URL("../../assets/generated/event-v1/weapons/shard-launcher.png", import.meta.url).href,
  weaponShardLauncherPickupV1: new URL("../../assets/generated/event-v1/weapons/shard-launcher-pickup.png", import.meta.url).href,
  eventArmoryCrateV1: new URL("../../assets/generated/event-v1/entities/armory-crate.png", import.meta.url).href,
  eventCalibrationKioskV1: new URL("../../assets/generated/event-v1/entities/calibration-kiosk.png", import.meta.url).href,
  eventRelayTowerV1: new URL("../../assets/generated/event-v1/entities/relay-tower.png", import.meta.url).href,
  eventPrototypeContainerV1: new URL("../../assets/generated/event-v1/entities/prototype-container.png", import.meta.url).href,
  eventTestTerminalV1: new URL("../../assets/generated/event-v1/entities/test-terminal.png", import.meta.url).href,
  worldMapV1: new URL("../../assets/generated/map-v1/aethelgard-hanba-city.png", import.meta.url).href
} as const;

const CITY_TILES = {
  rust: [0, 1, 2, 3, 4, 5, 6, 7],
  concrete: [8, 9, 10, 11, 12, 13, 14, 15],
  pale: [16, 17, 18, 19, 20, 21, 22, 23],
  sand: [24, 25, 26, 27, 28, 29, 30, 31],
  green: [32, 33, 34, 35, 36, 37, 38, 39],
  hazard: [40, 41, 42, 43, 44, 45, 46, 47],
  asphalt: [48, 49, 50, 51, 52, 53, 54, 55],
  chrome: [56, 57, 58, 59, 60, 61, 62, 63]
} as const;

const CITY_CENTER = {
  x: WORLD_WIDTH / 2,
  y: WORLD_HEIGHT / 2
} as const;

const CITY_HUB_RADIUS = 240;
const CITY_ROAD_HALF_WIDTH = 48;
const CITY_BLOCK_SPAN = 32;

export type CityDistrict = "hub" | "north" | "east" | "south" | "west";

export interface EnemyPresentation {
  textureKey: string;
  tint: number;
  displayScale: number;
}

export type EnemyAnimationState = "move" | "attack";

export function preloadGameAssets(loader: Phaser.Scene["load"]): void {
  loader.atlasXML(TEXTURE_KEYS.characterAtlas, ASSET_URLS.characterAtlas, ASSET_URLS.characterAtlasXml);
  loader.image(TEXTURE_KEYS.characterScoutV2, ASSET_URLS.characterScoutV2);
  loader.image(TEXTURE_KEYS.characterHeavyV2, ASSET_URLS.characterHeavyV2);
  loader.image(TEXTURE_KEYS.characterScoutIdleV1, ASSET_URLS.characterScoutIdleV1);
  loader.image(TEXTURE_KEYS.characterScoutMoveV1, ASSET_URLS.characterScoutMoveV1);
  loader.image(TEXTURE_KEYS.characterScoutAttackV1, ASSET_URLS.characterScoutAttackV1);
  loader.image(TEXTURE_KEYS.characterScoutDodgeV1, ASSET_URLS.characterScoutDodgeV1);
  loader.image(TEXTURE_KEYS.characterHeavyIdleV1, ASSET_URLS.characterHeavyIdleV1);
  loader.image(TEXTURE_KEYS.characterHeavyMoveV1, ASSET_URLS.characterHeavyMoveV1);
  loader.image(TEXTURE_KEYS.characterHeavyAttackV1, ASSET_URLS.characterHeavyAttackV1);
  loader.image(TEXTURE_KEYS.characterHeavyDodgeV1, ASSET_URLS.characterHeavyDodgeV1);
  loader.image(TEXTURE_KEYS.enemyZombie, ASSET_URLS.enemyZombie);
  loader.image(TEXTURE_KEYS.enemyFast, ASSET_URLS.enemyFast);
  loader.image(TEXTURE_KEYS.enemyRobot, ASSET_URLS.enemyRobot);
  loader.image(TEXTURE_KEYS.enemyHeavy, ASSET_URLS.enemyHeavy);
  loader.image(TEXTURE_KEYS.enemySoldier, ASSET_URLS.enemySoldier);
  loader.image(TEXTURE_KEYS.enemyElite, ASSET_URLS.enemyElite);
  loader.image(TEXTURE_KEYS.enemyHitman, ASSET_URLS.enemyHitman);
  loader.image(TEXTURE_KEYS.enemyBurster, ASSET_URLS.enemyBurster);
  loader.image(TEXTURE_KEYS.enemyBursterV2, ASSET_URLS.enemyBursterV2);
  loader.image(TEXTURE_KEYS.enemyEliteV2, ASSET_URLS.enemyEliteV2);
  loader.image(TEXTURE_KEYS.enemyBursterMoveV1, ASSET_URLS.enemyBursterMoveV1);
  loader.image(TEXTURE_KEYS.enemyBursterAttackV1, ASSET_URLS.enemyBursterAttackV1);
  loader.image(TEXTURE_KEYS.enemyEliteMoveV1, ASSET_URLS.enemyEliteMoveV1);
  loader.image(TEXTURE_KEYS.enemyEliteAttackV1, ASSET_URLS.enemyEliteAttackV1);
  loader.image(TEXTURE_KEYS.enemyWardenV1, ASSET_URLS.enemyWardenV1);
  loader.image(TEXTURE_KEYS.weaponPulseRifleV2, ASSET_URLS.weaponPulseRifleV2);
  loader.image(TEXTURE_KEYS.weaponArcGunV2, ASSET_URLS.weaponArcGunV2);
  loader.image(TEXTURE_KEYS.weaponBeamCannonV2, ASSET_URLS.weaponBeamCannonV2);
  loader.image(TEXTURE_KEYS.weaponShardLauncherV1, ASSET_URLS.weaponShardLauncherV1);
  loader.image(TEXTURE_KEYS.weaponShardLauncherPickupV1, ASSET_URLS.weaponShardLauncherPickupV1);
  loader.image(TEXTURE_KEYS.eventArmoryCrateV1, ASSET_URLS.eventArmoryCrateV1);
  loader.image(TEXTURE_KEYS.eventCalibrationKioskV1, ASSET_URLS.eventCalibrationKioskV1);
  loader.image(TEXTURE_KEYS.eventRelayTowerV1, ASSET_URLS.eventRelayTowerV1);
  loader.image(TEXTURE_KEYS.eventPrototypeContainerV1, ASSET_URLS.eventPrototypeContainerV1);
  loader.image(TEXTURE_KEYS.eventTestTerminalV1, ASSET_URLS.eventTestTerminalV1);
  loader.image(TEXTURE_KEYS.worldMapV1, ASSET_URLS.worldMapV1);
}

export function getEnemyPresentation(
  enemy: Pick<EnemyState, "type" | "elite"> & { boss?: boolean },
  animationState: EnemyAnimationState = "move"
): EnemyPresentation {
  if (enemy.boss) {
    return {
      textureKey: TEXTURE_KEYS.enemyHitman,
      tint: 0xfff28a,
      displayScale: 4.2
    };
  }

  if (enemy.elite) {
    return {
      textureKey: animationState === "attack" ? TEXTURE_KEYS.enemyEliteAttackV1 : TEXTURE_KEYS.enemyEliteMoveV1,
      tint: 0xffffff,
      displayScale: 2.8
    };
  }

  switch (enemy.type) {
    case "runner":
    case "charger":
      return {
        textureKey: TEXTURE_KEYS.enemyFast,
        tint: 0xd8ffd4,
        displayScale: 2.55
      };
    case "tank":
      return {
        textureKey: TEXTURE_KEYS.enemyHeavy,
        tint: 0xa7c4ff,
        displayScale: 3.25
      };
    case "shooter":
    case "suppressor":
      return {
        textureKey: TEXTURE_KEYS.enemySoldier,
        tint: 0xb7f7ff,
        displayScale: 2.7
      };
    case "burster":
      return {
        textureKey: animationState === "attack" ? TEXTURE_KEYS.enemyBursterAttackV1 : TEXTURE_KEYS.enemyBursterMoveV1,
        tint: 0xffffff,
        displayScale: 3.2
      };
    case "warden":
      return {
        textureKey: TEXTURE_KEYS.enemyWardenV1,
        tint: 0xffffff,
        displayScale: 3.05
      };
    case "chaser":
    default:
      return {
        textureKey: TEXTURE_KEYS.enemyZombie,
        tint: 0xffffff,
        displayScale: 2.7
      };
  }
}

export function getCityDistrict(x: number, y: number): CityDistrict {
  const offsetX = x - CITY_CENTER.x;
  const offsetY = y - CITY_CENTER.y;

  if (Math.abs(offsetX) <= CITY_HUB_RADIUS && Math.abs(offsetY) <= CITY_HUB_RADIUS) {
    return "hub";
  }

  if (Math.abs(offsetX) > Math.abs(offsetY)) {
    return offsetX > 0 ? "east" : "west";
  }

  return offsetY > 0 ? "south" : "north";
}

function hash2(x: number, y: number): number {
  const value = ((x * 73856093) ^ (y * 19349663)) >>> 0;
  return value % 9973;
}

function pick<T>(values: readonly T[], x: number, y: number, salt = 0): T {
  const index = (hash2(x + salt, y - salt) + salt) % values.length;
  return values[index];
}

export function pickCityTileFrame(x: number, y: number): number {
  const pixelX = x * TILE_SIZE + TILE_SIZE / 2;
  const pixelY = y * TILE_SIZE + TILE_SIZE / 2;
  const district = getCityDistrict(pixelX, pixelY);
  const noise = hash2(x, y);
  const roadBand =
    Math.abs(pixelX - CITY_CENTER.x) <= CITY_ROAD_HALF_WIDTH ||
    Math.abs(pixelY - CITY_CENTER.y) <= CITY_ROAD_HALF_WIDTH ||
    x % CITY_BLOCK_SPAN === 0 ||
    y % CITY_BLOCK_SPAN === 0;

  if (roadBand) {
    return pick(CITY_TILES.chrome, x, y, 3);
  }

  switch (district) {
    case "hub":
      return noise % 5 === 0 ? pick(CITY_TILES.hazard, x, y, 1) : pick(CITY_TILES.chrome, x, y, 2);
    case "north":
      return noise % 3 === 0 ? pick(CITY_TILES.hazard, x, y, 1) : pick(CITY_TILES.concrete, x, y, 2);
    case "east":
      return noise % 4 === 0 ? pick(CITY_TILES.asphalt, x, y, 6) : pick(CITY_TILES.chrome, x, y, 3);
    case "south":
      return noise % 4 === 0 ? pick(CITY_TILES.sand, x, y, 3) : pick(CITY_TILES.pale, x, y, 5);
    case "west":
      return noise % 4 === 0 ? pick(CITY_TILES.rust, x, y, 4) : pick(CITY_TILES.concrete, x, y, 7);
    default:
      break;
  }

  if (noise % 17 === 0) {
    return pick(CITY_TILES.pale, x, y, 5);
  }

  if (noise % 19 === 0) {
    return pick(CITY_TILES.asphalt, x, y, 6);
  }

  return pick(CITY_TILES.concrete, x, y, 7);
}
