import type { RunState } from "./types";

export function updateProjectiles(state: RunState, deltaMs: number): void {
  for (const projectile of state.projectiles) {
    projectile.position.x += projectile.velocity.x * (deltaMs / 1000);
    projectile.position.y += projectile.velocity.y * (deltaMs / 1000);
    projectile.lifetimeMs -= deltaMs;
  }

  state.projectiles = state.projectiles.filter((projectile) => projectile.lifetimeMs > 0);
}
