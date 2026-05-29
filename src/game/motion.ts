import type { DodgeType } from "./dodge";
import type { Vector2 } from "./types";

export interface PlayerMotionInput {
  velocity: Vector2;
  dodgeType: DodgeType;
  dodgeActiveMs: number;
  invulnerableMs: number;
  hitFlashMs: number;
}

export interface PlayerMotionFrame {
  scaleX: number;
  scaleY: number;
  alpha: number;
}

export interface EnemyMotionInput {
  velocity: Vector2;
  elite: boolean;
  boss: boolean;
  hitFlashMs: number;
}

export interface EnemyMotionFrame {
  scaleX: number;
  scaleY: number;
  alpha: number;
}

export interface UprightPlayerSpritePose {
  rotation: number;
  flipX: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getUprightPlayerSpritePose(facing: Vector2): UprightPlayerSpritePose {
  return {
    rotation: 0,
    flipX: facing.x < -0.001
  };
}

export function getPlayerMotionFrame(input: PlayerMotionInput): PlayerMotionFrame {
  const speed = Math.hypot(input.velocity.x, input.velocity.y);
  const moveStretch = clamp(speed / 320, 0, 0.24);
  const dodgeStretch =
    input.dodgeActiveMs > 0
      ? {
          blink: 0.18,
          roll: 0.26,
          jump: 0.15,
          dash: 0.22,
          "shield-step": 0.12
        }[input.dodgeType]
      : 0;

  return {
    scaleX: 1 + Math.max(moveStretch, dodgeStretch),
    scaleY: 1 - Math.max(moveStretch * 0.65, dodgeStretch * 0.55),
    alpha: input.invulnerableMs > 0 ? 0.88 : 1 - (input.hitFlashMs > 0 ? 0.06 : 0)
  };
}

export function getEnemyMotionFrame(input: EnemyMotionInput): EnemyMotionFrame {
  const speed = Math.hypot(input.velocity.x, input.velocity.y);
  const moveStretch = clamp(speed / 360, 0, input.boss ? 0.18 : input.elite ? 0.2 : 0.14);
  const hitStretch = input.hitFlashMs > 0 ? (input.boss ? 0.08 : input.elite ? 0.1 : 0.08) : 0;

  return {
    scaleX: 1 + Math.max(moveStretch, hitStretch),
    scaleY: 1 - Math.max(moveStretch * 0.55, hitStretch * 0.35),
    alpha: input.hitFlashMs > 0 ? (input.boss ? 0.94 : 0.84) : 1
  };
}
