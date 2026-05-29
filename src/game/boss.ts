import { getZoneCenter } from "./map";
import { nextId } from "./math";
import { queueSfxCue } from "./sfx";
import type { EnemyState, RunState } from "./types";

export const BOSS_SPAWN_AT_MS = 360_000;

export function hasActiveBoss(state: RunState): boolean {
  return state.enemies.some((enemy) => enemy.boss);
}

export function spawnBoss(state: RunState): EnemyState {
  const center = getZoneCenter(state.currentZone);
  const boss: EnemyState = {
    id: nextId(state),
    type: "elite",
    position: { ...center },
    velocity: { x: 0, y: 0 },
    radius: 42,
    health: 920,
    maxHealth: 920,
    speed: 72,
    damage: 28,
    experience: 180,
    behavior: "chase",
    shootCooldownMs: 1_050,
    contactCooldownMs: 0,
    behaviorCooldownMs: 0,
    phaseTelegraphMs: 0,
    elite: true,
    boss: true,
    phase: 1,
    summonCooldownMs: 4_200,
    hitFlashMs: 0
  };

  state.enemies.push(boss);
  state.waveCursor = Math.max(state.waveCursor, 4_000);
  queueSfxCue(state, "boss-spawn", 1.4);
  return boss;
}

export function updateBossEncounter(state: RunState, _deltaMs = 0): void {
  if (!state.bossSpawned && !state.bossDefeated && state.timeMs >= BOSS_SPAWN_AT_MS) {
    state.bossSpawned = true;
    spawnBoss(state);
  }
}
