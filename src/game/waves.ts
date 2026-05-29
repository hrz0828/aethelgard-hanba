import { WAVE_DEFINITIONS } from "../data/waves";
import { getMapProfile } from "./map";
import { hasActiveBoss } from "./boss";
import { spawnEnemy } from "./enemies";
import type { RunState, Vector2 } from "./types";

function activeWave(timeMs: number) {
  return [...WAVE_DEFINITIONS].reverse().find((wave) => timeMs >= wave.atMs) ?? WAVE_DEFINITIONS[0];
}

function spawnPositionAroundPlayer(state: RunState, index: number, count: number): Vector2 {
  const anchor = state.player.position;
  const angle = (Math.PI * 2 * index) / count + state.timeMs * 0.0003;
  const distanceFromPlayer = state.currentZone === "hub" ? 420 : 300;

  return {
    x: anchor.x + Math.cos(angle) * distanceFromPlayer,
    y: anchor.y + Math.sin(angle) * distanceFromPlayer
  };
}

export function updateWaves(state: RunState, deltaMs: number): void {
  if ((state.bossSpawned && !state.bossDefeated) || hasActiveBoss(state)) {
    return;
  }

  state.waveCursor -= deltaMs;
  if (state.waveCursor > 0) {
    return;
  }

  const wave = activeWave(state.timeMs);
  const profile = getMapProfile(state.currentZone, state.activeZoneEventType);
  const batchSize = Math.max(1, wave.batchSize + profile.batchBonus);
  const spawnEveryMs = Math.max(280, Math.floor(wave.spawnEveryMs * profile.spawnIntervalMultiplier));

  for (let index = 0; index < batchSize; index += 1) {
    const type = profile.eliteChanceBonus > 0.1 && index === batchSize - 1 ? "elite" : wave.enemyTypes[index % wave.enemyTypes.length];
    spawnEnemy(state, type, spawnPositionAroundPlayer(state, index, batchSize));
  }

  state.waveCursor = spawnEveryMs;
}
