import { nextId } from "./math";
import { getDeathFinishPresentation, getImpactPresentation, type DeathTier, type ImpactTier } from "./combatPresentation";
import type { RunState, Vector2 } from "./types";

export interface HitEffectState {
  id: number;
  position: Vector2;
  tint: number;
  radius: number;
  ttlMs: number;
  burstCount: number;
}

function createHitEffect(
  state: RunState,
  position: Vector2,
  tint: number,
  radius: number,
  burstCount: number,
  ttlMs = 220
): HitEffectState {
  return {
    id: nextId(state),
    position: { ...position },
    tint,
    radius,
    ttlMs,
    burstCount
  };
}

export function emitPlayerHitEffect(state: RunState, position: Vector2): void {
  const impact = getImpactPresentation("player");
  state.hitEffects.push(createHitEffect(state, position, impact.burstTint, 22, impact.burstCount));
}

export function emitEnemyHitEffect(state: RunState, position: Vector2, tier: Exclude<ImpactTier, "player"> = "normal"): void {
  const impact = getImpactPresentation(tier);
  const radius = tier === "boss" ? 36 : tier === "elite" ? 24 : 20;
  const ttlMs = tier === "boss" ? 240 : tier === "elite" ? 230 : 220;
  state.hitEffects.push(createHitEffect(state, position, impact.burstTint, radius, impact.burstCount, ttlMs));
}

export function emitKillEffect(state: RunState, position: Vector2, tier: DeathTier = "normal"): void {
  const finish = getDeathFinishPresentation(tier);
  state.hitEffects.push(createHitEffect(state, position, finish.tint, finish.radius, finish.burstCount, finish.ttlMs));
}

export function updateHitEffects(state: RunState, deltaMs: number): void {
  for (const effect of state.hitEffects) {
    effect.ttlMs -= deltaMs;
  }

  state.hitEffects = state.hitEffects.filter((effect) => effect.ttlMs > 0);
}
