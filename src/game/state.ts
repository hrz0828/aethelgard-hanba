import type { RunState } from "./types";
import { createPlayerDodgeState, getCharacterDodgeProfile } from "./dodge";

export function createRunState(): RunState {
  return {
    status: "playing",
    timeMs: 0,
    durationMs: 9 * 60 * 1000,
    nextId: 1,
    kills: 0,
    player: {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      facing: { x: 0, y: -1 },
      radius: 18,
      health: 100,
      maxHealth: 100,
      level: 1,
      experience: 0,
      experienceToNext: 20,
      experienceGainMultiplier: 1,
      speed: 245,
      pickupRadius: 86,
      invulnerableMs: 0,
      hitFlashMs: 0,
      dodge: createPlayerDodgeState(getCharacterDodgeProfile("soldier")),
      stats: {
        damage: 18,
        fireRateMs: 520,
        projectileSpeed: 620,
        projectileLifetimeMs: 900,
        range: 620,
        pierce: 0,
        chainChance: 0,
        projectileCount: 1
      }
    },
    enemies: [],
    projectiles: [],
    pickups: [],
    sfxEvents: [],
    hitEffects: [],
    upgrades: [],
    upgradeSynergies: [],
    currentZone: "hub",
    activeZoneEventType: "none",
    activeZoneEventZone: "hub",
    activeZoneEventMs: 0,
    activeZoneEventSpawned: false,
    zoneEventArmed: true,
    mapEventCursor: 0,
    collectedMapPointKeys: [],
    bossSpawned: false,
    bossDefeated: false,
    upgradeChoices: [],
    activeWeaponId: "pulse-rifle",
    activeWeaponFormId: undefined,
    weaponUpgradeHistory: [],
    weaponCooldownMs: 0,
    waveCursor: 0
  };
}
