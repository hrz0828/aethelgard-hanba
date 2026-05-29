import { ENEMY_TYPES, type EnemyType } from "../data/enemies";
import { getBossPhaseProfile, getEnemyProfile } from "./enemyProfiles";
import { normalize, nextId } from "./math";
import type { EnemyState, ProjectileState, RunState, Vector2 } from "./types";

function isEnemyType(type: string): type is EnemyType {
  return type in ENEMY_TYPES;
}

export function spawnEnemy(state: RunState, type: string, position: Vector2): EnemyState {
  const definition = ENEMY_TYPES[isEnemyType(type) ? type : "chaser"];
  const enemy: EnemyState = {
    id: nextId(state),
    type: definition.type,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    radius: definition.radius,
    health: definition.health,
    maxHealth: definition.health,
    speed: definition.speed,
    damage: definition.damage,
    experience: definition.experience,
    behavior: definition.behavior,
    shootCooldownMs: 900,
    contactCooldownMs: 0,
    behaviorCooldownMs: 0,
    phaseTelegraphMs: 0,
    elite: definition.type === "elite",
    boss: false,
    phase: undefined,
    summonCooldownMs: undefined,
    hitFlashMs: 0
  };

  state.enemies.push(enemy);
  return enemy;
}

export function updateEnemies(state: RunState, deltaMs: number): void {
  for (const enemy of state.enemies) {
    const toPlayer = normalize({
      x: state.player.position.x - enemy.position.x,
      y: state.player.position.y - enemy.position.y
    });
    const distanceToPlayer = Math.hypot(state.player.position.x - enemy.position.x, state.player.position.y - enemy.position.y);
    const profile = getEnemyProfile(enemy.type as EnemyType);
    let speed = enemy.speed * profile.speedMultiplier;

    if (enemy.boss) {
      const phase = enemy.phase ?? 1;
      const bossProfile = getBossPhaseProfile(phase);
      speed *= bossProfile.speedMultiplier;

      if (enemy.phaseTelegraphMs > 0) {
        enemy.phaseTelegraphMs = Math.max(0, enemy.phaseTelegraphMs - deltaMs);
        speed *= 0.55;
      }
    }

    if (!enemy.boss && enemy.behavior === "dash") {
      if (enemy.behaviorCooldownMs <= 0 && enemy.behaviorCooldownMs > -1) {
        enemy.behaviorCooldownMs = profile.recoveryWindowMs;
        enemy.phaseTelegraphMs = profile.burstWindowMs;
      }

      if (enemy.phaseTelegraphMs > 0) {
        enemy.velocity = { x: toPlayer.x * speed * 1.45, y: toPlayer.y * speed * 1.45 };
        enemy.position.x += enemy.velocity.x * (deltaMs / 1000);
        enemy.position.y += enemy.velocity.y * (deltaMs / 1000);
        enemy.phaseTelegraphMs = Math.max(0, enemy.phaseTelegraphMs - deltaMs);
        if (enemy.phaseTelegraphMs <= 0) {
          enemy.behaviorCooldownMs = profile.recoveryWindowMs;
        }
      } else {
        enemy.behaviorCooldownMs = Math.max(0, enemy.behaviorCooldownMs - deltaMs);
        enemy.velocity = { x: toPlayer.x * speed * 0.72, y: toPlayer.y * speed * 0.72 };
        enemy.position.x += enemy.velocity.x * (deltaMs / 1000);
        enemy.position.y += enemy.velocity.y * (deltaMs / 1000);
      }

      enemy.shootCooldownMs = Math.max(0, enemy.shootCooldownMs - deltaMs);
      enemy.contactCooldownMs = Math.max(0, enemy.contactCooldownMs - deltaMs);
      enemy.hitFlashMs = Math.max(0, enemy.hitFlashMs - deltaMs);
      continue;
    }

    if (!enemy.boss && enemy.behavior === "suppress") {
      enemy.behaviorCooldownMs = Math.max(0, enemy.behaviorCooldownMs - deltaMs);
      const desiredRange = profile.preferredRange;
      const tooClose = distanceToPlayer < desiredRange * 0.8;
      const tooFar = distanceToPlayer > desiredRange * 1.15;
      const lateral = { x: -toPlayer.y, y: toPlayer.x };
      const lateralDirection = enemy.id % 2 === 0 ? 1 : -1;
      const strafe = profile.repositionChance * 0.45;
      const moveVector = tooClose
        ? { x: -toPlayer.x + lateral.x * lateralDirection * strafe, y: -toPlayer.y + lateral.y * lateralDirection * strafe }
        : tooFar
          ? { x: toPlayer.x + lateral.x * lateralDirection * strafe, y: toPlayer.y + lateral.y * lateralDirection * strafe }
          : { x: lateral.x * lateralDirection * strafe, y: lateral.y * lateralDirection * strafe };
      const move = normalize(moveVector);
      enemy.velocity = { x: move.x * speed * 0.88, y: move.y * speed * 0.88 };
      enemy.position.x += enemy.velocity.x * (deltaMs / 1000);
      enemy.position.y += enemy.velocity.y * (deltaMs / 1000);

      if (enemy.behaviorCooldownMs <= 0) {
        const projectileDirection = normalize({
          x: state.player.position.x - enemy.position.x,
          y: state.player.position.y - enemy.position.y
        });
        state.projectiles.push({
          id: nextId(state),
          owner: "enemy",
          position: { ...enemy.position },
          velocity: {
            x: projectileDirection.x * 330,
            y: projectileDirection.y * 330
          },
          radius: 5,
          damage: enemy.damage,
          lifetimeMs: 1700,
          pierceRemaining: 0,
          hitEnemyIds: []
        });
        enemy.behaviorCooldownMs = profile.burstWindowMs;
      }

      enemy.shootCooldownMs = Math.max(0, enemy.shootCooldownMs - deltaMs);
      enemy.contactCooldownMs = Math.max(0, enemy.contactCooldownMs - deltaMs);
      enemy.hitFlashMs = Math.max(0, enemy.hitFlashMs - deltaMs);
      continue;
    }

    enemy.velocity = { x: toPlayer.x * speed, y: toPlayer.y * speed };
    enemy.position.x += enemy.velocity.x * (deltaMs / 1000);
    enemy.position.y += enemy.velocity.y * (deltaMs / 1000);
    enemy.shootCooldownMs = Math.max(0, enemy.shootCooldownMs - deltaMs);
    enemy.contactCooldownMs = Math.max(0, enemy.contactCooldownMs - deltaMs);
    enemy.hitFlashMs = Math.max(0, enemy.hitFlashMs - deltaMs);

    if (enemy.boss) {
      const healthRatio = enemy.health / enemy.maxHealth;
      const phase = healthRatio <= 0.3 ? 3 : healthRatio <= 0.65 ? 2 : 1;
      if (enemy.phase !== phase) {
        enemy.phase = phase;
        const bossProfile = getBossPhaseProfile(phase);
        enemy.phaseTelegraphMs = bossProfile.telegraphMs;
        enemy.summonCooldownMs = Math.max(enemy.summonCooldownMs ?? 0, bossProfile.telegraphMs);
        enemy.shootCooldownMs = Math.max(enemy.shootCooldownMs, bossProfile.telegraphMs);
      }
      enemy.speed = (phase === 1 ? 72 : phase === 2 ? 84 : 96) * getBossPhaseProfile(phase).speedMultiplier;
      enemy.summonCooldownMs = Math.max(0, (enemy.summonCooldownMs ?? 0) - deltaMs);

      if (enemy.phaseTelegraphMs > 0) {
        continue;
      }

      if (phase >= 3 && enemy.shootCooldownMs <= 0) {
        const burstShots = getBossPhaseProfile(phase).burstCount || 8;

        for (let index = 0; index < burstShots; index += 1) {
          const angle = (Math.PI * 2 * index) / burstShots;
          state.projectiles.push({
            id: nextId(state),
            owner: "enemy",
            position: { ...enemy.position },
            velocity: {
              x: Math.cos(angle) * 320,
              y: Math.sin(angle) * 320
            },
            radius: 6,
            damage: Math.round(enemy.damage * 0.65),
            lifetimeMs: 2_000,
            pierceRemaining: 0,
            hitEnemyIds: []
          });
        }

        enemy.shootCooldownMs = 850;
      }

      if (phase >= 2 && enemy.summonCooldownMs <= 0) {
        const addCount = getBossPhaseProfile(phase).addCount || (phase === 2 ? 2 : 3);

        for (let index = 0; index < addCount; index += 1) {
          const angle = (Math.PI * 2 * index) / addCount;
          const addType = index % 2 === 0 ? "runner" : "chaser";
          const addRadius = 150;
          spawnEnemy(state, addType, {
            x: enemy.position.x + Math.cos(angle) * addRadius,
            y: enemy.position.y + Math.sin(angle) * addRadius
          });
        }

        enemy.summonCooldownMs = phase === 2 ? 4_200 : 3_200;
      }

      continue;
    }

    if (enemy.behavior === "ranged" && enemy.shootCooldownMs <= 0) {
      const projectileDirection = normalize({
        x: state.player.position.x - enemy.position.x,
        y: state.player.position.y - enemy.position.y
      });
      const projectile: ProjectileState = {
        id: nextId(state),
        owner: "enemy",
        position: { ...enemy.position },
        velocity: {
          x: projectileDirection.x * 360,
          y: projectileDirection.y * 360
        },
        radius: 5,
        damage: enemy.damage,
        lifetimeMs: 1800,
        pierceRemaining: 0,
        hitEnemyIds: []
      };
      state.projectiles.push(projectile);
      enemy.shootCooldownMs = 1400;
    }
  }
}
