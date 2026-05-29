import { resolveCollisions } from "./collision";
import { updateEnemies } from "./enemies";
import type { MovementInput } from "./input";
import { updatePickups } from "./pickups";
import { updatePlayer } from "./player";
import { updateProjectiles } from "./projectiles";
import { collectMapPoints, updateMapState } from "./map";
import { updateBossEncounter } from "./boss";
import type { RunState } from "./types";
import { updateHitEffects } from "./effects";
import { queueSfxCue } from "./sfx";
import { updateLevelUps } from "./upgrades";
import { updateWaves } from "./waves";
import { updateWeapons } from "./weapons";

export function updateSimulation(state: RunState, input: MovementInput, deltaMs: number): void {
  if (state.status !== "playing") {
    return;
  }

  state.timeMs += deltaMs;
  updatePlayer(state, input, deltaMs);
  updateMapState(state, deltaMs);
  collectMapPoints(state);
  updateBossEncounter(state);
  updateWaves(state, deltaMs);
  updateEnemies(state, deltaMs);
  updateWeapons(state, deltaMs);
  updateProjectiles(state, deltaMs);
  resolveCollisions(state);
  updateHitEffects(state, deltaMs);
  updatePickups(state, deltaMs);
  updateLevelUps(state);

  if (state.status === "playing" && state.timeMs >= state.durationMs) {
    state.status = "won";
    queueSfxCue(state, "victory", 1.4);
  }
}
