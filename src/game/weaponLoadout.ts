import { getWeaponDefinition, getWeaponFormDefinition, type WeaponClassId, type WeaponFormId } from "../data/weapons";
import type { RunState } from "./types";

export type WeaponDisplayFormId = "single" | WeaponFormId;

interface WeaponFormProfile {
  formName: string;
  projectileCount: number;
  spreadAngleRadians: number;
  projectileRadius: number;
  projectileSpeedMultiplier: number;
  projectileLifetimeMultiplier: number;
  damageMultiplier: number;
  fireRateMultiplier: number;
  rangeMultiplier: number;
  pierceBonus: number;
  chainChanceBonus: number;
  beamWidth: number;
}

export interface WeaponDisplayState {
  weaponId: WeaponClassId;
  weaponName: string;
  formId: WeaponDisplayFormId;
  formName: string;
  projectileStyle: "pulse" | "arc" | "beam" | "shard";
  projectileCount: number;
  spreadAngleRadians: number;
  projectileRadius: number;
  projectileSpeed: number;
  projectileLifetimeMs: number;
  damage: number;
  fireRateMs: number;
  range: number;
  pierce: number;
  chainChance: number;
  beamWidth: number;
}

const WEAPON_PROGRESSIONS: Record<WeaponClassId, readonly WeaponDisplayFormId[]> = {
  "pulse-rifle": ["single", "pulse-rifle-burst", "pulse-rifle-spread"],
  "arc-gun": ["single", "arc-gun-chain", "arc-gun-split"],
  "beam-cannon": ["single", "beam-cannon-lance", "beam-cannon-prism"],
  "shard-launcher": ["single", "shard-launcher-fan", "shard-launcher-razor"]
};

const BASE_FORM_NAMES: Record<WeaponClassId, string> = {
  "pulse-rifle": "Single Shot",
  "arc-gun": "Single Bolt",
  "beam-cannon": "Narrow Beam",
  "shard-launcher": "Shard Shot"
};

const WEAPON_FORM_PROFILES: Record<WeaponClassId, Partial<Record<WeaponDisplayFormId, WeaponFormProfile>>> = {
  "pulse-rifle": {
    single: {
      formName: "Single Shot",
      projectileCount: 1,
      spreadAngleRadians: 0,
      projectileRadius: 4.8,
      projectileSpeedMultiplier: 1,
      projectileLifetimeMultiplier: 1,
      damageMultiplier: 1,
      fireRateMultiplier: 1,
      rangeMultiplier: 1,
      pierceBonus: 0,
      chainChanceBonus: 0,
      beamWidth: 6
    },
    "pulse-rifle-burst": {
      formName: "Burst Barrel",
      projectileCount: 3,
      spreadAngleRadians: 0.06,
      projectileRadius: 4.4,
      projectileSpeedMultiplier: 1.02,
      projectileLifetimeMultiplier: 1,
      damageMultiplier: 0.82,
      fireRateMultiplier: 0.92,
      rangeMultiplier: 1,
      pierceBonus: 0,
      chainChanceBonus: 0,
      beamWidth: 8
    },
    "pulse-rifle-spread": {
      formName: "Scatter Lens",
      projectileCount: 5,
      spreadAngleRadians: 0.1,
      projectileRadius: 4,
      projectileSpeedMultiplier: 1,
      projectileLifetimeMultiplier: 1.02,
      damageMultiplier: 0.68,
      fireRateMultiplier: 0.96,
      rangeMultiplier: 1.05,
      pierceBonus: 1,
      chainChanceBonus: 0,
      beamWidth: 10
    }
  },
  "arc-gun": {
    single: {
      formName: "Single Bolt",
      projectileCount: 1,
      spreadAngleRadians: 0,
      projectileRadius: 5,
      projectileSpeedMultiplier: 0.98,
      projectileLifetimeMultiplier: 1,
      damageMultiplier: 1,
      fireRateMultiplier: 1,
      rangeMultiplier: 1,
      pierceBonus: 0,
      chainChanceBonus: 0.15,
      beamWidth: 7
    },
    "arc-gun-chain": {
      formName: "Chain Matrix",
      projectileCount: 2,
      spreadAngleRadians: 0.04,
      projectileRadius: 4.6,
      projectileSpeedMultiplier: 1,
      projectileLifetimeMultiplier: 1,
      damageMultiplier: 0.88,
      fireRateMultiplier: 0.98,
      rangeMultiplier: 1.05,
      pierceBonus: 0,
      chainChanceBonus: 0.3,
      beamWidth: 8
    },
    "arc-gun-split": {
      formName: "Split Relay",
      projectileCount: 4,
      spreadAngleRadians: 0.1,
      projectileRadius: 4.2,
      projectileSpeedMultiplier: 1.02,
      projectileLifetimeMultiplier: 1,
      damageMultiplier: 0.76,
      fireRateMultiplier: 1.02,
      rangeMultiplier: 1.08,
      pierceBonus: 0,
      chainChanceBonus: 0.2,
      beamWidth: 9
    }
  },
  "beam-cannon": {
    single: {
      formName: "Narrow Beam",
      projectileCount: 1,
      spreadAngleRadians: 0,
      projectileRadius: 7,
      projectileSpeedMultiplier: 0.9,
      projectileLifetimeMultiplier: 1,
      damageMultiplier: 1,
      fireRateMultiplier: 1.08,
      rangeMultiplier: 1.1,
      pierceBonus: 1,
      chainChanceBonus: 0,
      beamWidth: 12
    },
    "beam-cannon-lance": {
      formName: "Lance Focus",
      projectileCount: 1,
      spreadAngleRadians: 0,
      projectileRadius: 9,
      projectileSpeedMultiplier: 0.92,
      projectileLifetimeMultiplier: 1,
      damageMultiplier: 1.05,
      fireRateMultiplier: 1.12,
      rangeMultiplier: 1.25,
      pierceBonus: 2,
      chainChanceBonus: 0,
      beamWidth: 18
    },
    "beam-cannon-prism": {
      formName: "Prism Splitter",
      projectileCount: 3,
      spreadAngleRadians: 0.035,
      projectileRadius: 8,
      projectileSpeedMultiplier: 0.94,
      projectileLifetimeMultiplier: 1,
      damageMultiplier: 0.86,
      fireRateMultiplier: 1.1,
      rangeMultiplier: 1.2,
      pierceBonus: 1,
      chainChanceBonus: 0,
      beamWidth: 22
    }
  },
  "shard-launcher": {
    single: {
      formName: "Shard Shot",
      projectileCount: 2,
      spreadAngleRadians: 0.055,
      projectileRadius: 4.2,
      projectileSpeedMultiplier: 1.06,
      projectileLifetimeMultiplier: 0.9,
      damageMultiplier: 0.86,
      fireRateMultiplier: 0.94,
      rangeMultiplier: 0.96,
      pierceBonus: 0,
      chainChanceBonus: 0,
      beamWidth: 7
    },
    "shard-launcher-fan": {
      formName: "Fan Chamber",
      projectileCount: 6,
      spreadAngleRadians: 0.12,
      projectileRadius: 3.7,
      projectileSpeedMultiplier: 1.08,
      projectileLifetimeMultiplier: 0.92,
      damageMultiplier: 0.58,
      fireRateMultiplier: 0.98,
      rangeMultiplier: 0.98,
      pierceBonus: 0,
      chainChanceBonus: 0,
      beamWidth: 9
    },
    "shard-launcher-razor": {
      formName: "Razor Core",
      projectileCount: 4,
      spreadAngleRadians: 0.075,
      projectileRadius: 4,
      projectileSpeedMultiplier: 1.16,
      projectileLifetimeMultiplier: 0.96,
      damageMultiplier: 0.74,
      fireRateMultiplier: 0.96,
      rangeMultiplier: 1.06,
      pierceBonus: 2,
      chainChanceBonus: 0,
      beamWidth: 10
    }
  }
};

function getProgression(weaponId: WeaponClassId): readonly WeaponDisplayFormId[] {
  return WEAPON_PROGRESSIONS[weaponId] ?? WEAPON_PROGRESSIONS["pulse-rifle"];
}

function getWeaponUpgradeCount(state: RunState, weaponId: WeaponClassId): number {
  return state.weaponUpgradeHistory?.filter((entry) => entry.weaponId === weaponId).length ?? 0;
}

function getCurrentProgressionIndex(state: RunState, weaponId: WeaponClassId): number {
  const progression = getProgression(weaponId);
  return Math.min(progression.length - 1, getWeaponUpgradeCount(state, weaponId));
}

function getProfile(weaponId: WeaponClassId, formId: WeaponDisplayFormId): WeaponFormProfile {
  return WEAPON_FORM_PROFILES[weaponId][formId] ?? WEAPON_FORM_PROFILES[weaponId].single!;
}

function setWeaponForm(state: RunState, weaponId: WeaponClassId, nextFormId: WeaponDisplayFormId): void {
  state.activeWeaponId = weaponId;
  state.activeWeaponFormId = nextFormId === "single" ? undefined : nextFormId;
  state.weaponUpgradeHistory ??= [];

  if (nextFormId === "single") {
    return;
  }

  state.weaponUpgradeHistory.push({
    weaponId,
    formId: nextFormId,
    level: state.player.level
  });
}

function advanceOneWeaponForm(state: RunState, weaponId: WeaponClassId): boolean {
  const progression = getProgression(weaponId);
  const currentIndex = getCurrentProgressionIndex(state, weaponId);
  const nextIndex = Math.min(progression.length - 1, currentIndex + 1);

  if (nextIndex === currentIndex) {
    return false;
  }

  setWeaponForm(state, weaponId, progression[nextIndex]);
  return true;
}

export function equipWeapon(state: RunState, weaponId: WeaponClassId): void {
  state.activeWeaponId = weaponId;
  const currentIndex = getCurrentProgressionIndex(state, weaponId);
  const progression = getProgression(weaponId);
  state.activeWeaponFormId = currentIndex > 0 ? (progression[currentIndex] as WeaponFormId) : undefined;
  state.weaponUpgradeHistory ??= [];
  state.weaponCooldownMs = 0;
}

export function applyWeaponUpgrade(state: RunState, weaponId: WeaponClassId): void {
  if (state.activeWeaponId !== weaponId) {
    equipWeapon(state, weaponId);
  }

  advanceOneWeaponForm(state, weaponId);
}

export function syncWeaponProgression(state: RunState): void {
  const weaponId = state.activeWeaponId ?? "pulse-rifle";
  const progression = getProgression(weaponId);
  const targetIndex = Math.min(progression.length - 1, Math.max(0, state.player.level - 1));

  while (getCurrentProgressionIndex(state, weaponId) < targetIndex) {
    if (!advanceOneWeaponForm(state, weaponId)) {
      break;
    }
  }

  state.activeWeaponId = weaponId;
  const currentIndex = getCurrentProgressionIndex(state, weaponId);
  state.activeWeaponFormId = currentIndex > 0 ? (progression[currentIndex] as WeaponFormId) : undefined;
}

export function getWeaponDisplayState(state: RunState): WeaponDisplayState {
  const weaponId = state.activeWeaponId ?? "pulse-rifle";
  const progression = getProgression(weaponId);
  const currentIndex = getCurrentProgressionIndex(state, weaponId);
  const formId: WeaponDisplayFormId = currentIndex > 0 ? progression[currentIndex] : "single";
  const profile = getProfile(weaponId, formId);
  const weapon = getWeaponDefinition(weaponId);
  const stats = state.player.stats;
  const relayBoost = state.activeZoneEventType === "relay" ? 1 : 0;
  const formName = formId === "single" ? BASE_FORM_NAMES[weaponId] : getWeaponFormDefinition(weaponId, formId).name;

  return {
    weaponId,
    weaponName: weapon.name,
    formId,
    formName,
    projectileStyle: weapon.forms[0]?.projectileStyle ?? "pulse",
    projectileCount: profile.projectileCount,
    spreadAngleRadians: profile.spreadAngleRadians,
    projectileRadius: profile.projectileRadius,
    projectileSpeed: stats.projectileSpeed * profile.projectileSpeedMultiplier * (relayBoost ? 1.06 : 1),
    projectileLifetimeMs: Math.max(1, Math.round(stats.projectileLifetimeMs * profile.projectileLifetimeMultiplier)),
    damage: stats.damage * profile.damageMultiplier * (relayBoost ? 1.12 : 1),
    fireRateMs: Math.max(80, Math.round(stats.fireRateMs * profile.fireRateMultiplier * (relayBoost ? 0.88 : 1))),
    range: stats.range * profile.rangeMultiplier * (relayBoost ? 1.08 : 1),
    pierce: stats.pierce + profile.pierceBonus,
    chainChance: Math.min(1, stats.chainChance + profile.chainChanceBonus + (relayBoost ? 0.04 : 0)),
    beamWidth: profile.beamWidth + (relayBoost ? 2 : 0)
  };
}
