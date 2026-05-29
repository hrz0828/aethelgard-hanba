import { UPGRADE_DEFINITIONS, type UpgradeId } from "../data/upgrades";
import type { RunState } from "./types";
import { syncWeaponProgression } from "./weaponLoadout";

function isUpgradeId(id: string): id is UpgradeId {
  return UPGRADE_DEFINITIONS.some((definition) => definition.id === id);
}

export function chooseUpgradeOptions(state: RunState, random: () => number = Math.random): UpgradeId[] {
  const available = UPGRADE_DEFINITIONS.filter((definition) => {
    const currentLevel = state.upgrades.find((upgrade) => upgrade.id === definition.id)?.level ?? 0;
    return currentLevel < definition.maxLevel;
  }).map((definition) => definition.id);

  const choices: UpgradeId[] = [];
  while (choices.length < 3 && available.length > 0) {
    const index = Math.floor(random() * available.length);
    const [id] = available.splice(index, 1);
    choices.push(id);
  }

  return choices;
}

type SynergyId = "pierce-chain" | "damage-fire-rate" | "shield-health" | "pickup-experience";

interface SynergyDefinition {
  id: SynergyId;
  ready: (state: RunState) => boolean;
  apply: (state: RunState) => void;
}

const SYNERGIES: SynergyDefinition[] = [
  {
    id: "pierce-chain",
    ready: (state) => getUpgradeLevel(state, "pierce") >= 2 && getUpgradeLevel(state, "chain") >= 2,
    apply: (state) => {
      state.player.stats.pierce += 1;
      state.player.stats.chainChance += 0.08;
    }
  },
  {
    id: "damage-fire-rate",
    ready: (state) => getUpgradeLevel(state, "damage") >= 2 && getUpgradeLevel(state, "fire-rate") >= 3,
    apply: (state) => {
      state.player.stats.damage *= 1.12;
      state.player.stats.fireRateMs = Math.max(100, state.player.stats.fireRateMs * 0.94);
    }
  },
  {
    id: "shield-health",
    ready: (state) => getUpgradeLevel(state, "max-health") >= 2 && getUpgradeLevel(state, "shield") >= 1,
    apply: (state) => {
      state.player.maxHealth += 15;
      state.player.health = Math.min(state.player.maxHealth, state.player.health + 15);
      state.player.invulnerableMs = Math.max(state.player.invulnerableMs, 900);
    }
  },
  {
    id: "pickup-experience",
    ready: (state) => getUpgradeLevel(state, "pickup-radius") >= 2 && getUpgradeLevel(state, "experience") >= 2,
    apply: (state) => {
      state.player.pickupRadius += 24;
      state.player.experienceToNext = Math.max(10, Math.floor(state.player.experienceToNext * 0.88));
    }
  }
];

function getUpgradeLevel(state: RunState, id: UpgradeId): number {
  return state.upgrades.find((upgrade) => upgrade.id === id)?.level ?? 0;
}

function applySynergies(state: RunState): void {
  for (const synergy of SYNERGIES) {
    if (state.upgradeSynergies.includes(synergy.id)) {
      continue;
    }

    if (!synergy.ready(state)) {
      continue;
    }

    synergy.apply(state);
    state.upgradeSynergies.push(synergy.id);
  }
}

export function applyUpgrade(state: RunState, id: string): void {
  if (!isUpgradeId(id)) {
    return;
  }

  const definition = UPGRADE_DEFINITIONS.find((upgrade) => upgrade.id === id);
  const existing = state.upgrades.find((upgrade) => upgrade.id === id);

  if (existing) {
    if (definition && existing.level >= definition.maxLevel) {
      return;
    }
    existing.level += 1;
  } else {
    state.upgrades.push({ id, level: 1 });
  }

  if (id === "damage") state.player.stats.damage *= 1.18;
  if (id === "fire-rate") state.player.stats.fireRateMs = Math.max(120, state.player.stats.fireRateMs * 0.88);
  if (id === "move-speed") state.player.speed *= 1.1;
  if (id === "max-health") {
    state.player.maxHealth += 20;
    state.player.health = Math.min(state.player.maxHealth, state.player.health + 20);
  }
  if (id === "heal") state.player.health = Math.min(state.player.maxHealth, state.player.health + 35);
  if (id === "pickup-radius") state.player.pickupRadius += 36;
  if (id === "pierce") state.player.stats.pierce += 1;
  if (id === "chain") state.player.stats.chainChance += 0.12;
  if (id === "shield") state.player.invulnerableMs = Math.max(state.player.invulnerableMs, 700);
  if (id === "experience") {
    state.player.experienceToNext = Math.max(12, Math.floor(state.player.experienceToNext * 0.9));
  }

  applySynergies(state);

  if (state.status === "choosing-upgrade") {
    state.upgradeChoices = [];
    state.status = "playing";
  }
}

export function updateLevelUps(state: RunState): void {
  if (state.status !== "playing") {
    return;
  }

  if (state.player.experience < state.player.experienceToNext) {
    return;
  }

  state.player.experience -= state.player.experienceToNext;
  state.player.level += 1;
  state.player.experienceToNext = Math.floor(state.player.experienceToNext * 1.22 + 8);
  syncWeaponProgression(state);
  state.upgradeChoices = chooseUpgradeOptions(state);
  state.status = "choosing-upgrade";
}
