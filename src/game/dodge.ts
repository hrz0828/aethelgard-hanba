import type { CharacterId } from "./characters";
import type { Vector2 } from "./types";

export type DodgeType = "blink" | "roll" | "jump" | "dash" | "shield-step";

export interface DodgeProfile {
  type: DodgeType;
  cooldownMs: number;
  durationMs: number;
  iFrameMs: number;
  travelDistance: number;
}

export interface PlayerDodgeState extends DodgeProfile {
  activeMs: number;
  cooldownRemainingMs: number;
  iFrameRemainingMs: number;
  travelRemaining: number;
  direction: Vector2;
  didTrigger: boolean;
}

const DODGE_PROFILES: Record<CharacterId, DodgeProfile> = {
  soldier: { type: "roll", cooldownMs: 1200, durationMs: 180, iFrameMs: 220, travelDistance: 150 },
  scout: { type: "blink", cooldownMs: 1450, durationMs: 120, iFrameMs: 160, travelDistance: 180 },
  heavy: { type: "jump", cooldownMs: 1600, durationMs: 220, iFrameMs: 180, travelDistance: 170 },
  scavenger: { type: "dash", cooldownMs: 1100, durationMs: 140, iFrameMs: 120, travelDistance: 200 },
  vanguard: { type: "shield-step", cooldownMs: 1500, durationMs: 160, iFrameMs: 260, travelDistance: 140 }
};

export function getCharacterDodgeProfile(characterId: CharacterId): DodgeProfile {
  return DODGE_PROFILES[characterId];
}

export function createPlayerDodgeState(profile: DodgeProfile): PlayerDodgeState {
  return {
    ...profile,
    activeMs: 0,
    cooldownRemainingMs: 0,
    iFrameRemainingMs: 0,
    travelRemaining: 0,
    direction: { x: 0, y: -1 },
    didTrigger: false
  };
}

export function cloneDodgeDirection(direction: Vector2): Vector2 {
  return { x: direction.x, y: direction.y };
}

