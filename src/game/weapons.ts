import { distance, normalize, nextId } from "./math";
import { queueSfxCue } from "./sfx";
import type { EnemyState, ProjectileState, RunState } from "./types";
import { getWeaponDisplayState } from "./weaponLoadout";

export function findNearestEnemy(state: RunState, range: number): EnemyState | undefined {
  let nearest: EnemyState | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const enemy of state.enemies) {
    const currentDistance = distance(state.player.position, enemy.position);
    if (currentDistance < nearestDistance && currentDistance <= range) {
      nearest = enemy;
      nearestDistance = currentDistance;
    }
  }

  return nearest;
}

export function updateWeapons(state: RunState, deltaMs: number): void {
  state.weaponCooldownMs = Math.max(0, state.weaponCooldownMs - deltaMs);
  if (state.weaponCooldownMs > 0) {
    return;
  }

  const weapon = getWeaponDisplayState(state);
  const target = findNearestEnemy(state, weapon.range);
  if (!target) {
    return;
  }

  const direction = normalize({
    x: target.position.x - state.player.position.x,
    y: target.position.y - state.player.position.y
  });
  const baseAngle = Math.atan2(direction.y, direction.x);
  const centerOffset = (weapon.projectileCount - 1) / 2;

  for (let index = 0; index < weapon.projectileCount; index += 1) {
    const angle = baseAngle + (index - centerOffset) * weapon.spreadAngleRadians;
    const projectile: ProjectileState = {
      id: nextId(state),
      owner: "player",
      position: { ...state.player.position },
      velocity: {
        x: Math.cos(angle) * weapon.projectileSpeed,
        y: Math.sin(angle) * weapon.projectileSpeed
      },
      radius: weapon.projectileRadius,
      damage: weapon.damage,
      lifetimeMs: weapon.projectileLifetimeMs,
      pierceRemaining: weapon.pierce,
      hitEnemyIds: []
    };
    state.projectiles.push(projectile);
  }

  state.weaponCooldownMs = weapon.fireRateMs;
  queueSfxCue(state, "shot", Math.max(0.7, weapon.projectileCount * 0.35));
}
