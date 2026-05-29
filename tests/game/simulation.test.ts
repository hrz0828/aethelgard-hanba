import { describe, expect, it } from "vitest";
import { resolveCollisions } from "../../src/game/collision";
import { spawnEnemy } from "../../src/game/enemies";
import { updatePickups } from "../../src/game/pickups";
import { createRunState } from "../../src/game/state";
import { updateSimulation } from "../../src/game/simulation";
import { applyUpgrade, chooseUpgradeOptions } from "../../src/game/upgrades";
import { getWeaponDisplayState } from "../../src/game/weaponLoadout";

describe("simulation", () => {
  it("moves the player from normalized input", () => {
    const state = createRunState();

    updateSimulation(state, { x: 1, y: 0 }, 1000);

    expect(state.player.position.x).toBeGreaterThan(200);
  });

  it("starts the run with the pulse rifle equipped", () => {
    const state = createRunState();

    expect(state.activeWeaponId).toBe("pulse-rifle");
    expect(getWeaponDisplayState(state).weaponId).toBe("pulse-rifle");
    expect(state.player.dodge.type).toBe("roll");
  });

  it("spawns enemies and player projectiles over time", () => {
    const state = createRunState();

    updateSimulation(state, { x: 0, y: 0 }, 1300);

    expect(state.enemies.length).toBeGreaterThan(0);

    updateSimulation(state, { x: 0, y: 0 }, 600);

    expect(state.projectiles.some((projectile) => projectile.owner === "player")).toBe(true);
  });

  it("applies upgrade effects", () => {
    const state = createRunState();

    const choices = chooseUpgradeOptions(state, () => 0.1);
    applyUpgrade(state, "damage");

    expect(choices).toHaveLength(3);
    expect(state.player.stats.damage).toBeGreaterThan(18);
  });

  it("resumes play and advances time after applying a level-up choice", () => {
    const state = createRunState();
    state.status = "choosing-upgrade";
    state.upgradeChoices = ["damage", "fire-rate", "move-speed"];

    applyUpgrade(state, "damage");
    updateSimulation(state, { x: 0, y: 0 }, 100);

    expect(state.status).toBe("playing");
    expect(state.upgradeChoices).toEqual([]);
    expect(state.timeMs).toBe(100);
  });

  it("does not apply contact damage from enemies killed by projectiles in the same collision pass", () => {
    const state = createRunState();
    const enemy = spawnEnemy(state, "chaser", { ...state.player.position });
    enemy.health = 1;
    state.projectiles.push({
      id: 100,
      owner: "player",
      position: { ...enemy.position },
      velocity: { x: 0, y: 0 },
      radius: 5,
      damage: 10,
      lifetimeMs: 1000,
      pierceRemaining: 0,
      hitEnemyIds: []
    });

    resolveCollisions(state);

    expect(state.enemies).toHaveLength(0);
    expect(state.player.health).toBe(state.player.maxHealth);
  });

  it("lets ranged enemies fire projectiles that damage the player", () => {
    const state = createRunState();
    const shooter = spawnEnemy(state, "shooter", { x: 120, y: 0 });
    shooter.shootCooldownMs = 0;

    updateSimulation(state, { x: 0, y: 0 }, 16);

    const enemyProjectile = state.projectiles.find((projectile) => projectile.owner === "enemy");
    expect(enemyProjectile).toBeDefined();

    if (!enemyProjectile) return;
    enemyProjectile.position = { ...state.player.position };
    resolveCollisions(state);

    expect(state.player.health).toBeLessThan(state.player.maxHealth);
  });

  it("chains player projectile damage to a nearby enemy when chain chance triggers", () => {
    const state = createRunState();
    state.player.stats.chainChance = 1;
    const firstEnemy = spawnEnemy(state, "chaser", { x: 40, y: 0 });
    const secondEnemy = spawnEnemy(state, "runner", { x: 80, y: 0 });
    firstEnemy.health = 1;
    secondEnemy.health = 10;
    state.projectiles.push({
      id: 100,
      owner: "player",
      position: { ...firstEnemy.position },
      velocity: { x: 0, y: 0 },
      radius: 5,
      damage: 18,
      lifetimeMs: 1000,
      pierceRemaining: 0,
      hitEnemyIds: []
    });

    resolveCollisions(state);

    expect(state.enemies.some((enemy) => enemy.id === firstEnemy.id)).toBe(false);
    expect(state.enemies.some((enemy) => enemy.id === secondEnemy.id)).toBe(false);
  });

  it("collects magnetized pickups when large deltas would move them past the player", () => {
    const state = createRunState();
    state.pickups.push({
      id: 100,
      kind: "experience",
      position: { x: 80, y: 0 },
      radius: 8,
      value: 6
    });

    updatePickups(state, 1000);

    expect(state.pickups).toHaveLength(0);
    expect(state.player.experience).toBe(6);
  });
});
