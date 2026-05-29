import type { WeaponClassId, WeaponFormId } from "../data/weapons";
import type { PlayerDodgeState } from "./dodge";

export type RunStatus = "menu" | "playing" | "paused" | "choosing-upgrade" | "won" | "lost";
export type MapEventType = "none" | "supply" | "hazard" | "wave" | "armory" | "calibration" | "relay" | "test";
export type WeaponDropKind = "module" | "cache" | "prototype";

export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Vector2;
  velocity: Vector2;
  facing: Vector2;
  radius: number;
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  experienceToNext: number;
  experienceGainMultiplier: number;
  speed: number;
  pickupRadius: number;
  invulnerableMs: number;
  hitFlashMs: number;
  dodge: PlayerDodgeState;
  stats: WeaponStats;
}

export interface WeaponStats {
  damage: number;
  fireRateMs: number;
  projectileSpeed: number;
  projectileLifetimeMs: number;
  range: number;
  pierce: number;
  chainChance: number;
  projectileCount: number;
}

export interface EnemyState {
  id: number;
  type: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  experience: number;
  behavior: "chase" | "ranged" | "burst" | "dash" | "suppress";
  shootCooldownMs: number;
  contactCooldownMs: number;
  behaviorCooldownMs: number;
  phaseTelegraphMs: number;
  elite: boolean;
  boss: boolean;
  phase?: 1 | 2 | 3;
  summonCooldownMs?: number;
  hitFlashMs: number;
}

export interface ProjectileState {
  id: number;
  owner: "player" | "enemy";
  position: Vector2;
  velocity: Vector2;
  radius: number;
  damage: number;
  lifetimeMs: number;
  pierceRemaining: number;
  hitEnemyIds: number[];
}

export interface PickupState {
  id: number;
  kind: "experience" | "weapon";
  position: Vector2;
  radius: number;
  value: number;
  weaponDropKind?: WeaponDropKind;
  weaponId?: WeaponClassId;
}

export type SfxCueType =
  | "shot"
  | "enemy-hit"
  | "player-hit"
  | "kill"
  | "boss-spawn"
  | "zone-supply"
  | "zone-hazard"
  | "zone-wave"
  | "victory"
  | "defeat";

export interface SfxCue {
  type: SfxCueType;
  intensity: number;
}

export interface UpgradeState {
  id: string;
  level: number;
}

export interface WeaponUpgradeHistoryEntry {
  weaponId: WeaponClassId;
  formId: WeaponFormId;
  level: number;
}

export interface RunState {
  status: RunStatus;
  timeMs: number;
  durationMs: number;
  nextId: number;
  kills: number;
  player: PlayerState;
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  pickups: PickupState[];
  sfxEvents: SfxCue[];
  hitEffects: import("./effects").HitEffectState[];
  upgrades: UpgradeState[];
  upgradeSynergies: string[];
  currentZone: "hub" | "north" | "east" | "south" | "west";
  activeZoneEventType: MapEventType;
  activeZoneEventZone: "hub" | "north" | "east" | "south" | "west";
  activeZoneEventMs: number;
  activeZoneEventSpawned: boolean;
  zoneEventArmed: boolean;
  mapEventCursor: number;
  collectedMapPointKeys: string[];
  bossSpawned: boolean;
  bossDefeated: boolean;
  upgradeChoices: string[];
  activeWeaponId?: WeaponClassId;
  activeWeaponFormId?: WeaponFormId;
  weaponUpgradeHistory?: WeaponUpgradeHistoryEntry[];
  weaponCooldownMs: number;
  waveCursor: number;
}
