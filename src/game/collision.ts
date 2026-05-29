import { distance, nextId } from "./math";
import { emitEnemyHitEffect, emitKillEffect, emitPlayerHitEffect } from "./effects";
import { queueSfxCue } from "./sfx";
import type { EnemyState, PickupState, ProjectileState, RunState } from "./types";

const CHAIN_RANGE = 140;

function applyChainDamage(
  state: RunState,
  sourceEnemy: EnemyState,
  projectile: ProjectileState,
  deadEnemyIds: Set<number>
): void {
  if (state.player.stats.chainChance <= 0 || Math.random() >= state.player.stats.chainChance) {
    return;
  }

  let chainTarget: EnemyState | undefined;
  let chainTargetDistance = Number.POSITIVE_INFINITY;

  for (const enemy of state.enemies) {
    if (enemy.id === sourceEnemy.id) continue;
    if (deadEnemyIds.has(enemy.id)) continue;
    if (projectile.hitEnemyIds.includes(enemy.id)) continue;

    const currentDistance = distance(sourceEnemy.position, enemy.position);
    if (currentDistance <= CHAIN_RANGE && currentDistance < chainTargetDistance) {
      chainTarget = enemy;
      chainTargetDistance = currentDistance;
    }
  }

  if (!chainTarget) {
    return;
  }

  chainTarget.health -= projectile.damage;
  chainTarget.hitFlashMs = 180;
  emitEnemyHitEffect(state, chainTarget.position, chainTarget.boss ? "boss" : chainTarget.elite ? "elite" : "normal");
  queueSfxCue(state, "enemy-hit", chainTarget.boss ? 1.2 : 0.8);
  projectile.hitEnemyIds.push(chainTarget.id);

  if (chainTarget.health <= 0) {
    deadEnemyIds.add(chainTarget.id);
  }
}

export function resolveCollisions(state: RunState): void {
  const deadEnemyIds = new Set<number>();

  for (const projectile of state.projectiles) {
    if (projectile.owner === "enemy") {
      if (
        projectile.lifetimeMs > 0 &&
        state.player.invulnerableMs <= 0 &&
        distance(projectile.position, state.player.position) <= projectile.radius + state.player.radius
      ) {
        state.player.health -= projectile.damage;
        state.player.invulnerableMs = 650;
        state.player.hitFlashMs = 180;
        emitPlayerHitEffect(state, state.player.position);
        queueSfxCue(state, "player-hit", 1);
        projectile.lifetimeMs = 0;
      }
      continue;
    }

    for (const enemy of state.enemies) {
      if (deadEnemyIds.has(enemy.id)) continue;
      if (projectile.hitEnemyIds.includes(enemy.id)) continue;
      if (distance(projectile.position, enemy.position) > projectile.radius + enemy.radius) continue;

      enemy.health -= projectile.damage;
      enemy.hitFlashMs = 180;
      emitEnemyHitEffect(state, enemy.position, enemy.boss ? "boss" : enemy.elite ? "elite" : "normal");
      queueSfxCue(state, "enemy-hit", enemy.boss ? 1.4 : 0.85);
      projectile.hitEnemyIds.push(enemy.id);
      applyChainDamage(state, enemy, projectile, deadEnemyIds);

      if (projectile.pierceRemaining > 0) {
        projectile.pierceRemaining -= 1;
      } else {
        projectile.lifetimeMs = 0;
      }

      if (enemy.health <= 0) {
        deadEnemyIds.add(enemy.id);
      }
      break;
    }
  }

  for (const enemy of state.enemies) {
    if (deadEnemyIds.has(enemy.id)) continue;

      if (
        distance(enemy.position, state.player.position) <= enemy.radius + state.player.radius &&
        state.player.invulnerableMs <= 0 &&
        enemy.contactCooldownMs <= 0
      ) {
        state.player.health -= enemy.damage;
        state.player.invulnerableMs = 650;
        state.player.hitFlashMs = 180;
        emitPlayerHitEffect(state, state.player.position);
        queueSfxCue(state, "player-hit", enemy.boss ? 1.2 : 1);
        enemy.contactCooldownMs = 650;

      if (enemy.behavior === "burst") {
        deadEnemyIds.add(enemy.id);
      }
    }
  }

  const defeatedEnemies = state.enemies.filter((enemy) => deadEnemyIds.has(enemy.id));
  for (const enemy of defeatedEnemies) {
    const pickup: PickupState = {
      id: nextId(state),
      kind: "experience",
      position: { ...enemy.position },
      radius: 8,
      value: enemy.boss ? Math.round(enemy.experience * 2) : enemy.experience
    };
    state.pickups.push(pickup);
    state.kills += 1;
    emitKillEffect(state, enemy.position, enemy.boss ? "boss" : enemy.elite ? "elite" : "normal");
    queueSfxCue(state, "kill", enemy.boss ? 1.6 : 1);

    if (enemy.boss) {
      state.bossDefeated = true;
      state.waveCursor = Math.max(state.waveCursor, 4_000);
    }
  }

  state.enemies = state.enemies.filter((enemy) => !deadEnemyIds.has(enemy.id));
  state.projectiles = state.projectiles.filter((projectile) => projectile.lifetimeMs > 0);

  if (state.player.health <= 0) {
    state.player.health = 0;
    state.status = "lost";
    queueSfxCue(state, "defeat", 1.3);
  }
}
