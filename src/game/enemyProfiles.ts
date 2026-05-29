import type { EnemyType } from "../data/enemies";

export type EnemyRole = "pressure" | "dash-in" | "area-denial" | "bruiser";

export interface EnemyProfile {
  role: EnemyRole;
  preferredRange: number;
  burstWindowMs: number;
  recoveryWindowMs: number;
  speedMultiplier: number;
  repositionChance: number;
}

export interface BossPhaseProfile {
  telegraphMs: number;
  addCount: number;
  burstCount: number;
  speedMultiplier: number;
}

const ENEMY_PROFILES: Record<string, EnemyProfile> = {
  chaser: { role: "pressure", preferredRange: 0, burstWindowMs: 0, recoveryWindowMs: 0, speedMultiplier: 1, repositionChance: 0.1 },
  runner: { role: "dash-in", preferredRange: 0, burstWindowMs: 220, recoveryWindowMs: 620, speedMultiplier: 1.32, repositionChance: 0.18 },
  charger: { role: "dash-in", preferredRange: 0, burstWindowMs: 240, recoveryWindowMs: 680, speedMultiplier: 1.42, repositionChance: 0.15 },
  shooter: { role: "area-denial", preferredRange: 240, burstWindowMs: 1200, recoveryWindowMs: 260, speedMultiplier: 0.78, repositionChance: 0.35 },
  suppressor: { role: "area-denial", preferredRange: 260, burstWindowMs: 1100, recoveryWindowMs: 260, speedMultiplier: 0.74, repositionChance: 0.4 },
  tank: { role: "bruiser", preferredRange: 0, burstWindowMs: 0, recoveryWindowMs: 0, speedMultiplier: 0.92, repositionChance: 0.04 },
  burster: { role: "pressure", preferredRange: 120, burstWindowMs: 650, recoveryWindowMs: 520, speedMultiplier: 1.12, repositionChance: 0.16 },
  elite: { role: "bruiser", preferredRange: 0, burstWindowMs: 0, recoveryWindowMs: 0, speedMultiplier: 1.06, repositionChance: 0.08 },
  warden: { role: "area-denial", preferredRange: 220, burstWindowMs: 980, recoveryWindowMs: 340, speedMultiplier: 0.82, repositionChance: 0.22 }
};

const BOSS_PHASE_PROFILES: Record<1 | 2 | 3, BossPhaseProfile> = {
  1: { telegraphMs: 420, addCount: 0, burstCount: 0, speedMultiplier: 0.92 },
  2: { telegraphMs: 560, addCount: 2, burstCount: 0, speedMultiplier: 1.08 },
  3: { telegraphMs: 680, addCount: 3, burstCount: 8, speedMultiplier: 1.2 }
};

export function getEnemyProfile(type: EnemyType): EnemyProfile {
  return ENEMY_PROFILES[type];
}

export function getBossPhaseProfile(phase: 1 | 2 | 3): BossPhaseProfile {
  return BOSS_PHASE_PROFILES[phase];
}
