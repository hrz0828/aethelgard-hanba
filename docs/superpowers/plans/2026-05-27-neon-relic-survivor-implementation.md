# Neon Relic Survivor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a publishable Phaser + TypeScript + Vite browser demo for a `Vampire Survivors` style top-down roguelike deployable to Cloudflare Pages.

**Architecture:** Phaser owns rendering, scenes, camera, input adapters, and effects. Pure TypeScript modules own game rules, data, deterministic updates, upgrade application, waves, collisions, and run state so the simulation can be unit tested without a browser canvas.

**Tech Stack:** Vite, TypeScript, Phaser, Vitest, Playwright, static Cloudflare Pages deployment.

---

## File Structure

- Create `package.json`: scripts and dependencies.
- Create `index.html`: Vite entry HTML.
- Create `tsconfig.json`: TypeScript compiler options.
- Create `vite.config.ts`: Vite config with Vitest test settings.
- Create `src/main.ts`: app bootstrap, Phaser config, UI root setup.
- Create `src/styles.css`: full-page game layout, HUD, menus, upgrade cards, mobile joystick.
- Create `src/data/enemies.ts`: enemy type definitions.
- Create `src/data/upgrades.ts`: upgrade definitions.
- Create `src/data/waves.ts`: time-based wave definitions.
- Create `src/game/types.ts`: shared domain types.
- Create `src/game/math.ts`: vector helpers and random helpers.
- Create `src/game/state.ts`: run creation and default state.
- Create `src/game/player.ts`: player movement and damage rules.
- Create `src/game/enemies.ts`: enemy spawn and movement rules.
- Create `src/game/weapons.ts`: target selection and projectile firing.
- Create `src/game/projectiles.ts`: projectile movement and expiration.
- Create `src/game/pickups.ts`: experience crystal collection and magnet behavior.
- Create `src/game/upgrades.ts`: upgrade selection and application.
- Create `src/game/waves.ts`: wave director.
- Create `src/game/collision.ts`: collision resolution.
- Create `src/game/simulation.ts`: one-frame simulation orchestration.
- Create `src/game/input.ts`: normalized input shape.
- Create `src/scenes/BootScene.ts`: scene registration handoff.
- Create `src/scenes/MenuScene.ts`: Phaser-level menu start handoff.
- Create `src/scenes/GameScene.ts`: gameplay scene rendering and system bridge.
- Create `src/scenes/GameOverScene.ts`: result scene handoff.
- Create `src/ui/hud.ts`: DOM HUD rendering.
- Create `src/ui/menu.ts`: DOM start, pause, and result rendering.
- Create `src/ui/upgradeOverlay.ts`: DOM upgrade cards.
- Create `src/ui/joystick.ts`: mobile touch joystick.
- Create `tests/game/*.test.ts`: unit tests for rules.
- Create `tests/e2e/smoke.spec.ts`: browser smoke test.
- Create `playwright.config.ts`: Playwright config.
- Create `README.md`: local development and Cloudflare Pages deployment instructions.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.ts`
- Create: `src/styles.css`

- [ ] **Step 1: Create package manifest**

Create `package.json`:

```json
{
  "name": "neon-relic-survivor",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "phaser": "^3.90.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.53.0",
    "typescript": "^5.8.3",
    "vite": "^6.3.5",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Create Vite HTML entry**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#070914" />
    <title>Neon Relic Survivor</title>
  </head>
  <body>
    <div id="app">
      <div id="game"></div>
      <div id="ui"></div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Create TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src", "tests", "vite.config.ts", "playwright.config.ts"]
}
```

- [ ] **Step 4: Create Vite and Vitest config**

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
```

- [ ] **Step 5: Add temporary bootstrap**

Create `src/main.ts`:

```ts
import "./styles.css";

const ui = document.querySelector<HTMLDivElement>("#ui");

if (!ui) {
  throw new Error("Missing #ui root");
}

ui.innerHTML = `
  <main class="menu-shell">
    <p class="eyebrow">Neon Ruins Survival</p>
    <h1>Neon Relic Survivor</h1>
    <button class="primary-button" type="button">Loading...</button>
  </main>
`;
```

- [ ] **Step 6: Add base styles**

Create `src/styles.css`:

```css
:root {
  color: #f4fbff;
  background: #070914;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

button {
  font: inherit;
}

#app {
  position: relative;
  background:
    linear-gradient(rgba(38, 245, 196, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(38, 245, 196, 0.08) 1px, transparent 1px),
    #070914;
  background-size: 44px 44px;
}

#game {
  position: absolute;
  inset: 0;
}

#ui {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.menu-shell {
  min-height: 100%;
  display: grid;
  place-content: center;
  gap: 18px;
  padding: 24px;
  text-align: center;
  pointer-events: auto;
}

.eyebrow {
  margin: 0;
  color: #62f8d1;
  text-transform: uppercase;
  letter-spacing: 0;
  font-size: 0.82rem;
}

h1 {
  margin: 0;
  font-size: clamp(2.4rem, 8vw, 5.4rem);
  line-height: 0.95;
}

.primary-button {
  min-width: 180px;
  min-height: 48px;
  border: 1px solid rgba(98, 248, 209, 0.7);
  border-radius: 8px;
  color: #07110f;
  background: #62f8d1;
  cursor: pointer;
}
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and dependencies install successfully.

- [ ] **Step 8: Verify scaffold builds**

Run: `npm run build`

Expected: command exits 0 and creates `dist/`.

- [ ] **Step 9: Commit scaffold**

Run:

```bash
git add package.json package-lock.json index.html tsconfig.json vite.config.ts src/main.ts src/styles.css
git commit -m "chore: scaffold neon relic survivor"
```

Expected: commit succeeds. If Git is unavailable because `.git` is invalid or read-only, record that in the final task report and continue without committing.

## Task 2: Pure Domain Types and Run State

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/math.ts`
- Create: `src/game/state.ts`
- Test: `tests/game/state.test.ts`

- [ ] **Step 1: Write failing state tests**

Create `tests/game/state.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/game/state";

describe("createRunState", () => {
  it("creates a fresh playable run state", () => {
    const state = createRunState();

    expect(state.status).toBe("playing");
    expect(state.timeMs).toBe(0);
    expect(state.player.health).toBe(state.player.maxHealth);
    expect(state.player.level).toBe(1);
    expect(state.enemies).toEqual([]);
    expect(state.projectiles).toEqual([]);
    expect(state.pickups).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/game/state.test.ts`

Expected: FAIL because `src/game/state.ts` does not exist.

- [ ] **Step 3: Add shared types**

Create `src/game/types.ts`:

```ts
export type RunStatus = "menu" | "playing" | "paused" | "choosing-upgrade" | "won" | "lost";

export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  experienceToNext: number;
  speed: number;
  pickupRadius: number;
  invulnerableMs: number;
  stats: WeaponStats;
}

export interface WeaponStats {
  damage: number;
  fireRateMs: number;
  projectileSpeed: number;
  projectileLifetimeMs: number;
  range: number;
  pierce: number;
  chainChance: number;
  projectileCount: number;
}

export interface EnemyState {
  id: number;
  type: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  experience: number;
  behavior: "chase" | "ranged" | "burst";
  shootCooldownMs: number;
  contactCooldownMs: number;
  elite: boolean;
}

export interface ProjectileState {
  id: number;
  owner: "player" | "enemy";
  position: Vector2;
  velocity: Vector2;
  radius: number;
  damage: number;
  lifetimeMs: number;
  pierceRemaining: number;
  hitEnemyIds: number[];
}

export interface PickupState {
  id: number;
  kind: "experience";
  position: Vector2;
  radius: number;
  value: number;
}

export interface UpgradeState {
  id: string;
  level: number;
}

export interface RunState {
  status: RunStatus;
  timeMs: number;
  durationMs: number;
  nextId: number;
  kills: number;
  player: PlayerState;
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  pickups: PickupState[];
  upgrades: UpgradeState[];
  upgradeChoices: string[];
  weaponCooldownMs: number;
  waveCursor: number;
}
```

- [ ] **Step 4: Add math helpers**

Create `src/game/math.ts`:

```ts
import type { Vector2 } from "./types";

export function length(vector: Vector2): number {
  return Math.hypot(vector.x, vector.y);
}

export function normalize(vector: Vector2): Vector2 {
  const magnitude = length(vector);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }
  return { x: vector.x / magnitude, y: vector.y / magnitude };
}

export function distance(a: Vector2, b: Vector2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function scale(vector: Vector2, scalar: number): Vector2 {
  return { x: vector.x * scalar, y: vector.y * scalar };
}

export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function nextId(state: { nextId: number }): number {
  const id = state.nextId;
  state.nextId += 1;
  return id;
}
```

- [ ] **Step 5: Add run state factory**

Create `src/game/state.ts`:

```ts
import type { RunState } from "./types";

export function createRunState(): RunState {
  return {
    status: "playing",
    timeMs: 0,
    durationMs: 9 * 60 * 1000,
    nextId: 1,
    kills: 0,
    player: {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      radius: 18,
      health: 100,
      maxHealth: 100,
      level: 1,
      experience: 0,
      experienceToNext: 20,
      speed: 245,
      pickupRadius: 86,
      invulnerableMs: 0,
      stats: {
        damage: 18,
        fireRateMs: 520,
        projectileSpeed: 620,
        projectileLifetimeMs: 900,
        range: 620,
        pierce: 0,
        chainChance: 0,
        projectileCount: 1
      }
    },
    enemies: [],
    projectiles: [],
    pickups: [],
    upgrades: [],
    upgradeChoices: [],
    weaponCooldownMs: 0,
    waveCursor: 0
  };
}
```

- [ ] **Step 6: Run state tests**

Run: `npm test -- tests/game/state.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit domain state**

Run:

```bash
git add src/game/types.ts src/game/math.ts src/game/state.ts tests/game/state.test.ts
git commit -m "feat: add run state model"
```

Expected: commit succeeds, or Git limitation is recorded.

## Task 3: Data Definitions

**Files:**
- Create: `src/data/enemies.ts`
- Create: `src/data/upgrades.ts`
- Create: `src/data/waves.ts`
- Test: `tests/game/data.test.ts`

- [ ] **Step 1: Write failing data tests**

Create `tests/game/data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ENEMY_TYPES } from "../../src/data/enemies";
import { UPGRADE_DEFINITIONS } from "../../src/data/upgrades";
import { WAVE_DEFINITIONS } from "../../src/data/waves";

describe("game data", () => {
  it("defines the planned enemy and upgrade content", () => {
    expect(Object.keys(ENEMY_TYPES)).toHaveLength(6);
    expect(UPGRADE_DEFINITIONS).toHaveLength(10);
    expect(WAVE_DEFINITIONS.length).toBeGreaterThanOrEqual(8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/game/data.test.ts`

Expected: FAIL because data modules do not exist.

- [ ] **Step 3: Add enemy data**

Create `src/data/enemies.ts`:

```ts
import type { EnemyState } from "../game/types";

export interface EnemyDefinition {
  type: string;
  radius: number;
  health: number;
  speed: number;
  damage: number;
  experience: number;
  behavior: EnemyState["behavior"];
  color: number;
}

export const ENEMY_TYPES: Record<string, EnemyDefinition> = {
  chaser: { type: "chaser", radius: 15, health: 34, speed: 92, damage: 10, experience: 6, behavior: "chase", color: 0xff4f8b },
  runner: { type: "runner", radius: 12, health: 22, speed: 150, damage: 8, experience: 7, behavior: "chase", color: 0xffd166 },
  tank: { type: "tank", radius: 24, health: 130, speed: 58, damage: 18, experience: 18, behavior: "chase", color: 0x8f6bff },
  shooter: { type: "shooter", radius: 17, health: 48, speed: 72, damage: 9, experience: 12, behavior: "ranged", color: 0x65d9ff },
  burster: { type: "burster", radius: 16, health: 40, speed: 128, damage: 22, experience: 13, behavior: "burst", color: 0xff6b4a },
  elite: { type: "elite", radius: 30, health: 280, speed: 78, damage: 24, experience: 42, behavior: "chase", color: 0xf7f06d }
};
```

- [ ] **Step 4: Add upgrade data**

Create `src/data/upgrades.ts`:

```ts
export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
}

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  { id: "damage", name: "Prism Rounds", description: "+18% weapon damage", maxLevel: 5 },
  { id: "fire-rate", name: "Overclock Coil", description: "Fire faster", maxLevel: 5 },
  { id: "move-speed", name: "Phase Boots", description: "+10% movement speed", maxLevel: 4 },
  { id: "max-health", name: "Carbon Heart", description: "+20 max health and heal 20", maxLevel: 4 },
  { id: "heal", name: "Emergency Patch", description: "Recover 35 health", maxLevel: 99 },
  { id: "pickup-radius", name: "Magnet Field", description: "Pull crystals from farther away", maxLevel: 4 },
  { id: "pierce", name: "Piercing Beam", description: "Projectiles pierce one more enemy", maxLevel: 3 },
  { id: "chain", name: "Arc Splitter", description: "Chance to chain damage nearby", maxLevel: 4 },
  { id: "shield", name: "Pulse Shield", description: "Reduce contact pressure with invulnerability", maxLevel: 3 },
  { id: "experience", name: "Data Siphon", description: "Gain more experience", maxLevel: 4 }
];
```

- [ ] **Step 5: Add wave data**

Create `src/data/waves.ts`:

```ts
export interface WaveDefinition {
  atMs: number;
  spawnEveryMs: number;
  batchSize: number;
  enemyTypes: string[];
}

export const WAVE_DEFINITIONS: WaveDefinition[] = [
  { atMs: 0, spawnEveryMs: 1200, batchSize: 3, enemyTypes: ["chaser"] },
  { atMs: 60_000, spawnEveryMs: 1050, batchSize: 4, enemyTypes: ["chaser", "runner"] },
  { atMs: 120_000, spawnEveryMs: 950, batchSize: 5, enemyTypes: ["chaser", "runner", "tank"] },
  { atMs: 180_000, spawnEveryMs: 850, batchSize: 5, enemyTypes: ["runner", "tank", "shooter"] },
  { atMs: 240_000, spawnEveryMs: 760, batchSize: 6, enemyTypes: ["chaser", "shooter", "burster"] },
  { atMs: 330_000, spawnEveryMs: 680, batchSize: 7, enemyTypes: ["runner", "tank", "burster"] },
  { atMs: 420_000, spawnEveryMs: 600, batchSize: 8, enemyTypes: ["shooter", "burster", "elite"] },
  { atMs: 510_000, spawnEveryMs: 520, batchSize: 10, enemyTypes: ["runner", "tank", "shooter", "burster", "elite"] }
];
```

- [ ] **Step 6: Run data tests**

Run: `npm test -- tests/game/data.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit data**

Run:

```bash
git add src/data/enemies.ts src/data/upgrades.ts src/data/waves.ts tests/game/data.test.ts
git commit -m "feat: add enemy upgrade and wave data"
```

Expected: commit succeeds, or Git limitation is recorded.

## Task 4: Simulation Systems

**Files:**
- Create: `src/game/input.ts`
- Create: `src/game/player.ts`
- Create: `src/game/enemies.ts`
- Create: `src/game/weapons.ts`
- Create: `src/game/projectiles.ts`
- Create: `src/game/pickups.ts`
- Create: `src/game/upgrades.ts`
- Create: `src/game/waves.ts`
- Create: `src/game/collision.ts`
- Create: `src/game/simulation.ts`
- Test: `tests/game/simulation.test.ts`

- [ ] **Step 1: Write failing simulation tests**

Create `tests/game/simulation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/game/state";
import { updateSimulation } from "../../src/game/simulation";
import { applyUpgrade, chooseUpgradeOptions } from "../../src/game/upgrades";

describe("simulation", () => {
  it("moves the player from normalized input", () => {
    const state = createRunState();
    updateSimulation(state, { x: 1, y: 0 }, 1000);
    expect(state.player.position.x).toBeGreaterThan(200);
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
    expect(choices).toHaveLength(3);
    applyUpgrade(state, "damage");
    expect(state.player.stats.damage).toBeGreaterThan(18);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/game/simulation.test.ts`

Expected: FAIL because simulation modules do not exist.

- [ ] **Step 3: Add input type**

Create `src/game/input.ts`:

```ts
export interface MovementInput {
  x: number;
  y: number;
}
```

- [ ] **Step 4: Implement player movement**

Create `src/game/player.ts`:

```ts
import { normalize } from "./math";
import type { MovementInput } from "./input";
import type { RunState } from "./types";

export function updatePlayer(state: RunState, input: MovementInput, deltaMs: number): void {
  const direction = normalize(input);
  const distance = state.player.speed * (deltaMs / 1000);
  state.player.velocity = { x: direction.x * state.player.speed, y: direction.y * state.player.speed };
  state.player.position.x += direction.x * distance;
  state.player.position.y += direction.y * distance;
  state.player.invulnerableMs = Math.max(0, state.player.invulnerableMs - deltaMs);
}
```

- [ ] **Step 5: Implement enemy spawning and movement**

Create `src/game/enemies.ts`:

```ts
import { ENEMY_TYPES } from "../data/enemies";
import { normalize, nextId } from "./math";
import type { EnemyState, RunState, Vector2 } from "./types";

export function spawnEnemy(state: RunState, type: string, position: Vector2): EnemyState {
  const definition = ENEMY_TYPES[type] ?? ENEMY_TYPES.chaser;
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
    elite: definition.type === "elite"
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
    const speed = enemy.behavior === "ranged" ? enemy.speed * 0.55 : enemy.speed;
    enemy.velocity = { x: toPlayer.x * speed, y: toPlayer.y * speed };
    enemy.position.x += enemy.velocity.x * (deltaMs / 1000);
    enemy.position.y += enemy.velocity.y * (deltaMs / 1000);
    enemy.shootCooldownMs = Math.max(0, enemy.shootCooldownMs - deltaMs);
    enemy.contactCooldownMs = Math.max(0, enemy.contactCooldownMs - deltaMs);
  }
}
```

- [ ] **Step 6: Implement player weapon firing**

Create `src/game/weapons.ts`:

```ts
import { distance, normalize, nextId } from "./math";
import type { EnemyState, ProjectileState, RunState } from "./types";

export function findNearestEnemy(state: RunState): EnemyState | undefined {
  let nearest: EnemyState | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const enemy of state.enemies) {
    const current = distance(state.player.position, enemy.position);
    if (current < nearestDistance && current <= state.player.stats.range) {
      nearest = enemy;
      nearestDistance = current;
    }
  }
  return nearest;
}

export function updateWeapons(state: RunState, deltaMs: number): void {
  state.weaponCooldownMs = Math.max(0, state.weaponCooldownMs - deltaMs);
  if (state.weaponCooldownMs > 0) {
    return;
  }

  const target = findNearestEnemy(state);
  if (!target) {
    return;
  }

  const direction = normalize({
    x: target.position.x - state.player.position.x,
    y: target.position.y - state.player.position.y
  });

  for (let index = 0; index < state.player.stats.projectileCount; index += 1) {
    const projectile: ProjectileState = {
      id: nextId(state),
      owner: "player",
      position: { ...state.player.position },
      velocity: {
        x: direction.x * state.player.stats.projectileSpeed,
        y: direction.y * state.player.stats.projectileSpeed
      },
      radius: 5,
      damage: state.player.stats.damage,
      lifetimeMs: state.player.stats.projectileLifetimeMs,
      pierceRemaining: state.player.stats.pierce,
      hitEnemyIds: []
    };
    state.projectiles.push(projectile);
  }

  state.weaponCooldownMs = state.player.stats.fireRateMs;
}
```

- [ ] **Step 7: Implement projectiles**

Create `src/game/projectiles.ts`:

```ts
import type { RunState } from "./types";

export function updateProjectiles(state: RunState, deltaMs: number): void {
  for (const projectile of state.projectiles) {
    projectile.position.x += projectile.velocity.x * (deltaMs / 1000);
    projectile.position.y += projectile.velocity.y * (deltaMs / 1000);
    projectile.lifetimeMs -= deltaMs;
  }
  state.projectiles = state.projectiles.filter((projectile) => projectile.lifetimeMs > 0);
}
```

- [ ] **Step 8: Implement pickups and experience**

Create `src/game/pickups.ts`:

```ts
import { distance, normalize } from "./math";
import type { RunState } from "./types";

export function updatePickups(state: RunState, deltaMs: number): void {
  const remaining = [];
  for (const pickup of state.pickups) {
    const toPlayer = {
      x: state.player.position.x - pickup.position.x,
      y: state.player.position.y - pickup.position.y
    };
    const currentDistance = distance(state.player.position, pickup.position);
    if (currentDistance <= state.player.radius + pickup.radius) {
      state.player.experience += pickup.value;
      continue;
    }
    if (currentDistance <= state.player.pickupRadius) {
      const direction = normalize(toPlayer);
      pickup.position.x += direction.x * 420 * (deltaMs / 1000);
      pickup.position.y += direction.y * 420 * (deltaMs / 1000);
    }
    remaining.push(pickup);
  }
  state.pickups = remaining;
}
```

- [ ] **Step 9: Implement upgrades**

Create `src/game/upgrades.ts`:

```ts
import { UPGRADE_DEFINITIONS } from "../data/upgrades";
import type { RunState } from "./types";

export function chooseUpgradeOptions(state: RunState, random: () => number = Math.random): string[] {
  const available = UPGRADE_DEFINITIONS.filter((definition) => {
    const current = state.upgrades.find((upgrade) => upgrade.id === definition.id)?.level ?? 0;
    return current < definition.maxLevel;
  }).map((definition) => definition.id);

  const choices: string[] = [];
  while (choices.length < 3 && available.length > 0) {
    const index = Math.floor(random() * available.length);
    const [id] = available.splice(index, 1);
    choices.push(id);
  }
  return choices;
}

export function applyUpgrade(state: RunState, id: string): void {
  const existing = state.upgrades.find((upgrade) => upgrade.id === id);
  if (existing) {
    existing.level += 1;
  } else {
    state.upgrades.push({ id, level: 1 });
  }

  if (id === "damage") state.player.stats.damage *= 1.18;
  if (id === "fire-rate") state.player.stats.fireRateMs = Math.max(120, state.player.stats.fireRateMs * 0.88);
  if (id === "move-speed") state.player.speed *= 1.1;
  if (id === "max-health") {
    state.player.maxHealth += 20;
    state.player.health = Math.min(state.player.maxHealth, state.player.health + 20);
  }
  if (id === "heal") state.player.health = Math.min(state.player.maxHealth, state.player.health + 35);
  if (id === "pickup-radius") state.player.pickupRadius += 36;
  if (id === "pierce") state.player.stats.pierce += 1;
  if (id === "chain") state.player.stats.chainChance += 0.12;
  if (id === "shield") state.player.invulnerableMs = Math.max(state.player.invulnerableMs, 700);
  if (id === "experience") state.player.experienceToNext = Math.max(12, Math.floor(state.player.experienceToNext * 0.9));
}

export function updateLevelUps(state: RunState): void {
  if (state.status !== "playing") {
    return;
  }
  if (state.player.experience < state.player.experienceToNext) {
    return;
  }
  state.player.experience -= state.player.experienceToNext;
  state.player.level += 1;
  state.player.experienceToNext = Math.floor(state.player.experienceToNext * 1.22 + 8);
  state.upgradeChoices = chooseUpgradeOptions(state);
  state.status = "choosing-upgrade";
}
```

- [ ] **Step 10: Implement wave director**

Create `src/game/waves.ts`:

```ts
import { WAVE_DEFINITIONS } from "../data/waves";
import { spawnEnemy } from "./enemies";
import type { RunState, Vector2 } from "./types";

function activeWave(timeMs: number) {
  return [...WAVE_DEFINITIONS].reverse().find((wave) => timeMs >= wave.atMs) ?? WAVE_DEFINITIONS[0];
}

function spawnPositionAroundPlayer(state: RunState, index: number, count: number): Vector2 {
  const angle = (Math.PI * 2 * index) / count + state.timeMs * 0.0003;
  const distance = 520;
  return {
    x: state.player.position.x + Math.cos(angle) * distance,
    y: state.player.position.y + Math.sin(angle) * distance
  };
}

export function updateWaves(state: RunState, deltaMs: number): void {
  state.waveCursor -= deltaMs;
  if (state.waveCursor > 0) {
    return;
  }

  const wave = activeWave(state.timeMs);
  for (let index = 0; index < wave.batchSize; index += 1) {
    const type = wave.enemyTypes[index % wave.enemyTypes.length];
    spawnEnemy(state, type, spawnPositionAroundPlayer(state, index, wave.batchSize));
  }
  state.waveCursor = wave.spawnEveryMs;
}
```

- [ ] **Step 11: Implement collisions**

Create `src/game/collision.ts`:

```ts
import { distance, nextId } from "./math";
import type { PickupState, RunState } from "./types";

export function resolveCollisions(state: RunState): void {
  const deadEnemyIds = new Set<number>();

  for (const projectile of state.projectiles) {
    if (projectile.owner !== "player") continue;
    for (const enemy of state.enemies) {
      if (projectile.hitEnemyIds.includes(enemy.id)) continue;
      if (distance(projectile.position, enemy.position) > projectile.radius + enemy.radius) continue;
      enemy.health -= projectile.damage;
      projectile.hitEnemyIds.push(enemy.id);
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
    if (distance(enemy.position, state.player.position) <= enemy.radius + state.player.radius && state.player.invulnerableMs <= 0) {
      state.player.health -= enemy.damage;
      state.player.invulnerableMs = 650;
      enemy.contactCooldownMs = 650;
      if (enemy.behavior === "burst") {
        deadEnemyIds.add(enemy.id);
      }
    }
  }

  const defeated = state.enemies.filter((enemy) => deadEnemyIds.has(enemy.id));
  for (const enemy of defeated) {
    const pickup: PickupState = {
      id: nextId(state),
      kind: "experience",
      position: { ...enemy.position },
      radius: 8,
      value: enemy.experience
    };
    state.pickups.push(pickup);
    state.kills += 1;
  }

  state.enemies = state.enemies.filter((enemy) => !deadEnemyIds.has(enemy.id));
  state.projectiles = state.projectiles.filter((projectile) => projectile.lifetimeMs > 0);

  if (state.player.health <= 0) {
    state.player.health = 0;
    state.status = "lost";
  }
}
```

- [ ] **Step 12: Implement simulation orchestration**

Create `src/game/simulation.ts`:

```ts
import type { MovementInput } from "./input";
import { resolveCollisions } from "./collision";
import { updateEnemies } from "./enemies";
import { updateLevelUps } from "./upgrades";
import { updatePickups } from "./pickups";
import { updatePlayer } from "./player";
import { updateProjectiles } from "./projectiles";
import type { RunState } from "./types";
import { updateWaves } from "./waves";
import { updateWeapons } from "./weapons";

export function updateSimulation(state: RunState, input: MovementInput, deltaMs: number): void {
  if (state.status !== "playing") {
    return;
  }

  state.timeMs += deltaMs;
  updatePlayer(state, input, deltaMs);
  updateWaves(state, deltaMs);
  updateEnemies(state, deltaMs);
  updateWeapons(state, deltaMs);
  updateProjectiles(state, deltaMs);
  resolveCollisions(state);
  updatePickups(state, deltaMs);
  updateLevelUps(state);

  if (state.status === "playing" && state.timeMs >= state.durationMs) {
    state.status = "won";
  }
}
```

- [ ] **Step 13: Run simulation tests**

Run: `npm test -- tests/game/simulation.test.ts`

Expected: PASS.

- [ ] **Step 14: Commit simulation systems**

Run:

```bash
git add src/game tests/game
git commit -m "feat: add survival simulation systems"
```

Expected: commit succeeds, or Git limitation is recorded.

## Task 5: Phaser Scenes and Rendering

**Files:**
- Modify: `src/main.ts`
- Create: `src/scenes/BootScene.ts`
- Create: `src/scenes/MenuScene.ts`
- Create: `src/scenes/GameScene.ts`
- Create: `src/scenes/GameOverScene.ts`

- [ ] **Step 1: Add BootScene**

Create `src/scenes/BootScene.ts`:

```ts
import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    this.scene.start("MenuScene");
  }
}
```

- [ ] **Step 2: Add MenuScene**

Create `src/scenes/MenuScene.ts`:

```ts
import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.game.events.emit("show-menu");
  }
}
```

- [ ] **Step 3: Add GameOverScene**

Create `src/scenes/GameOverScene.ts`:

```ts
import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  create(data: { result: "won" | "lost"; timeMs: number; level: number; kills: number }): void {
    this.game.events.emit("show-result", data);
  }
}
```

- [ ] **Step 4: Add GameScene renderer bridge**

Create `src/scenes/GameScene.ts`:

```ts
import Phaser from "phaser";
import { createRunState } from "../game/state";
import { updateSimulation } from "../game/simulation";
import type { MovementInput } from "../game/input";
import type { RunState } from "../game/types";

export class GameScene extends Phaser.Scene {
  private state!: RunState;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private player!: Phaser.GameObjects.Arc;
  private enemyLayer!: Phaser.GameObjects.Container;
  private projectileLayer!: Phaser.GameObjects.Container;
  private pickupLayer!: Phaser.GameObjects.Container;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.state = createRunState();
    this.cameras.main.setBackgroundColor("#070914");
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,ESC") as Record<string, Phaser.Input.Keyboard.Key>;
    this.enemyLayer = this.add.container(0, 0);
    this.projectileLayer = this.add.container(0, 0);
    this.pickupLayer = this.add.container(0, 0);
    this.player = this.add.circle(0, 0, this.state.player.radius, 0xeafff8, 1);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.game.events.emit("run-started", this.state);
  }

  update(_time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      this.state.status = this.state.status === "paused" ? "playing" : "paused";
    }

    const input = this.readMovementInput();
    updateSimulation(this.state, input, Math.min(delta, 34));
    this.renderState();
    this.game.events.emit("run-updated", this.state);

    if (this.state.status === "won" || this.state.status === "lost") {
      this.scene.start("GameOverScene", {
        result: this.state.status,
        timeMs: this.state.timeMs,
        level: this.state.player.level,
        kills: this.state.kills
      });
    }
  }

  private readMovementInput(): MovementInput {
    const joystick = this.game.registry.get("joystick") as MovementInput | undefined;
    return {
      x: (this.cursors.right.isDown || this.keys.D.isDown ? 1 : 0) - (this.cursors.left.isDown || this.keys.A.isDown ? 1 : 0) + (joystick?.x ?? 0),
      y: (this.cursors.down.isDown || this.keys.S.isDown ? 1 : 0) - (this.cursors.up.isDown || this.keys.W.isDown ? 1 : 0) + (joystick?.y ?? 0)
    };
  }

  private renderState(): void {
    this.player.setPosition(this.state.player.position.x, this.state.player.position.y);
    this.enemyLayer.removeAll(true);
    this.projectileLayer.removeAll(true);
    this.pickupLayer.removeAll(true);

    for (const pickup of this.state.pickups) {
      this.pickupLayer.add(this.add.circle(pickup.position.x, pickup.position.y, pickup.radius, 0x62f8d1, 0.9));
    }
    for (const projectile of this.state.projectiles) {
      this.projectileLayer.add(this.add.circle(projectile.position.x, projectile.position.y, projectile.radius, 0xffe66d, 1));
    }
    for (const enemy of this.state.enemies) {
      const color = enemy.elite ? 0xf7f06d : enemy.type === "runner" ? 0xffd166 : enemy.type === "tank" ? 0x8f6bff : enemy.type === "shooter" ? 0x65d9ff : enemy.type === "burster" ? 0xff6b4a : 0xff4f8b;
      this.enemyLayer.add(this.add.circle(enemy.position.x, enemy.position.y, enemy.radius, color, 0.95));
    }
  }
}
```

- [ ] **Step 5: Replace bootstrap with Phaser game**

Modify `src/main.ts`:

```ts
import Phaser from "phaser";
import "./styles.css";
import { BootScene } from "./scenes/BootScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { GameScene } from "./scenes/GameScene";
import { MenuScene } from "./scenes/MenuScene";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#070914",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
});

window.addEventListener("beforeunload", () => {
  game.destroy(true);
});
```

- [ ] **Step 6: Verify build catches scene typing issues**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: Commit scenes**

Run:

```bash
git add src/main.ts src/scenes
git commit -m "feat: render survival arena with phaser"
```

Expected: commit succeeds, or Git limitation is recorded.

## Task 6: DOM HUD, Menus, Upgrade Overlay, and Joystick

**Files:**
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Create: `src/ui/hud.ts`
- Create: `src/ui/menu.ts`
- Create: `src/ui/upgradeOverlay.ts`
- Create: `src/ui/joystick.ts`

- [ ] **Step 1: Add HUD renderer**

Create `src/ui/hud.ts`:

```ts
import type { RunState } from "../game/types";

export function renderHud(root: HTMLElement, state: RunState): void {
  const minutes = Math.floor(state.timeMs / 60000);
  const seconds = Math.floor((state.timeMs % 60000) / 1000).toString().padStart(2, "0");
  const healthPercent = Math.max(0, (state.player.health / state.player.maxHealth) * 100);
  const experiencePercent = Math.min(100, (state.player.experience / state.player.experienceToNext) * 100);

  root.querySelector<HTMLElement>("[data-time]")!.textContent = `${minutes}:${seconds}`;
  root.querySelector<HTMLElement>("[data-level]")!.textContent = `Lv ${state.player.level}`;
  root.querySelector<HTMLElement>("[data-kills]")!.textContent = `${state.kills} K`;
  root.querySelector<HTMLElement>("[data-health]")!.style.width = `${healthPercent}%`;
  root.querySelector<HTMLElement>("[data-experience]")!.style.width = `${experiencePercent}%`;
}

export function createHud(): HTMLElement {
  const element = document.createElement("section");
  element.className = "hud";
  element.innerHTML = `
    <div class="hud-row">
      <strong data-time>0:00</strong>
      <span data-level>Lv 1</span>
      <span data-kills>0 K</span>
    </div>
    <div class="bar health"><span data-health></span></div>
    <div class="bar experience"><span data-experience></span></div>
  `;
  return element;
}
```

- [ ] **Step 2: Add menus**

Create `src/ui/menu.ts`:

```ts
export function showStartMenu(root: HTMLElement, onStart: () => void): void {
  root.innerHTML = `
    <main class="menu-shell">
      <p class="eyebrow">Neon Ruins Survival</p>
      <h1>Neon Relic Survivor</h1>
      <p class="menu-copy">Move to survive. Weapons fire automatically. Collect crystals and build a run.</p>
      <button class="primary-button" data-start type="button">Start Run</button>
    </main>
  `;
  root.querySelector<HTMLButtonElement>("[data-start]")!.addEventListener("click", onStart);
}

export function showResult(root: HTMLElement, result: { result: "won" | "lost"; timeMs: number; level: number; kills: number }, onRestart: () => void): void {
  const minutes = Math.floor(result.timeMs / 60000);
  const seconds = Math.floor((result.timeMs % 60000) / 1000).toString().padStart(2, "0");
  root.innerHTML = `
    <main class="menu-shell">
      <p class="eyebrow">${result.result === "won" ? "Signal secured" : "Run terminated"}</p>
      <h1>${result.result === "won" ? "Survived" : "Defeated"}</h1>
      <p class="menu-copy">${minutes}:${seconds} survived · Level ${result.level} · ${result.kills} kills</p>
      <button class="primary-button" data-restart type="button">Run Again</button>
    </main>
  `;
  root.querySelector<HTMLButtonElement>("[data-restart]")!.addEventListener("click", onRestart);
}
```

- [ ] **Step 3: Add upgrade overlay**

Create `src/ui/upgradeOverlay.ts`:

```ts
import { UPGRADE_DEFINITIONS } from "../data/upgrades";
import { applyUpgrade } from "../game/upgrades";
import type { RunState } from "../game/types";

export function showUpgradeOverlay(root: HTMLElement, state: RunState, onSelected: () => void): void {
  const overlay = document.createElement("section");
  overlay.className = "upgrade-overlay";
  overlay.innerHTML = `
    <div class="upgrade-panel">
      <p class="eyebrow">Level ${state.player.level}</p>
      <h2>Choose an Upgrade</h2>
      <div class="upgrade-grid"></div>
    </div>
  `;

  const grid = overlay.querySelector<HTMLElement>(".upgrade-grid")!;
  for (const id of state.upgradeChoices) {
    const definition = UPGRADE_DEFINITIONS.find((upgrade) => upgrade.id === id)!;
    const button = document.createElement("button");
    button.className = "upgrade-card";
    button.type = "button";
    button.innerHTML = `<strong>${definition.name}</strong><span>${definition.description}</span>`;
    button.addEventListener("click", () => {
      applyUpgrade(state, id);
      state.status = "playing";
      state.upgradeChoices = [];
      overlay.remove();
      onSelected();
    });
    grid.append(button);
  }
  root.append(overlay);
}
```

- [ ] **Step 4: Add mobile joystick**

Create `src/ui/joystick.ts`:

```ts
import type { MovementInput } from "../game/input";

export function createJoystick(onMove: (input: MovementInput) => void): HTMLElement {
  const element = document.createElement("div");
  element.className = "joystick";
  element.innerHTML = `<div class="joystick-thumb"></div>`;
  const thumb = element.querySelector<HTMLElement>(".joystick-thumb")!;
  let activePointer: number | undefined;
  let origin = { x: 0, y: 0 };

  element.addEventListener("pointerdown", (event) => {
    activePointer = event.pointerId;
    origin = { x: event.clientX, y: event.clientY };
    element.setPointerCapture(event.pointerId);
  });

  element.addEventListener("pointermove", (event) => {
    if (activePointer !== event.pointerId) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    const distance = Math.min(54, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    thumb.style.transform = `translate(${x}px, ${y}px)`;
    onMove({ x: x / 54, y: y / 54 });
  });

  function reset(): void {
    activePointer = undefined;
    thumb.style.transform = "translate(0, 0)";
    onMove({ x: 0, y: 0 });
  }

  element.addEventListener("pointerup", reset);
  element.addEventListener("pointercancel", reset);
  return element;
}
```

- [ ] **Step 5: Wire UI to Phaser game events**

Modify `src/main.ts`:

```ts
import Phaser from "phaser";
import "./styles.css";
import { BootScene } from "./scenes/BootScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { GameScene } from "./scenes/GameScene";
import { MenuScene } from "./scenes/MenuScene";
import type { MovementInput } from "./game/input";
import type { RunState } from "./game/types";
import { createHud, renderHud } from "./ui/hud";
import { createJoystick } from "./ui/joystick";
import { showResult, showStartMenu } from "./ui/menu";
import { showUpgradeOverlay } from "./ui/upgradeOverlay";

const ui = document.querySelector<HTMLElement>("#ui");
if (!ui) throw new Error("Missing #ui root");

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#070914",
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
});

let hud: HTMLElement | undefined;
let upgradeOpen = false;

game.events.on("show-menu", () => {
  showStartMenu(ui, () => game.scene.start("GameScene"));
});

game.events.on("run-started", () => {
  ui.innerHTML = "";
  hud = createHud();
  ui.append(hud);
  const joystick = createJoystick((input: MovementInput) => game.registry.set("joystick", input));
  ui.append(joystick);
});

game.events.on("run-updated", (state: RunState) => {
  if (hud) renderHud(hud, state);
  if (state.status === "choosing-upgrade" && !upgradeOpen) {
    upgradeOpen = true;
    showUpgradeOverlay(ui, state, () => {
      upgradeOpen = false;
    });
  }
});

game.events.on("show-result", (result) => {
  upgradeOpen = false;
  showResult(ui, result, () => game.scene.start("GameScene"));
});

window.addEventListener("beforeunload", () => {
  game.destroy(true);
});
```

- [ ] **Step 6: Extend styles for HUD and overlays**

Append to `src/styles.css`:

```css
.menu-copy {
  max-width: 520px;
  margin: 0 auto;
  color: rgba(244, 251, 255, 0.78);
}

.hud {
  position: absolute;
  top: max(14px, env(safe-area-inset-top));
  left: max(14px, env(safe-area-inset-left));
  width: min(360px, calc(100vw - 28px));
  display: grid;
  gap: 8px;
  pointer-events: none;
}

.hud-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(98, 248, 209, 0.28);
  background: rgba(7, 9, 20, 0.72);
  backdrop-filter: blur(10px);
}

.bar {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(244, 251, 255, 0.12);
}

.bar span {
  display: block;
  height: 100%;
  width: 0;
}

.health span {
  background: #ff4f8b;
}

.experience span {
  background: #62f8d1;
}

.upgrade-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(7, 9, 20, 0.58);
  pointer-events: auto;
}

.upgrade-panel {
  width: min(860px, 100%);
}

.upgrade-panel h2 {
  margin: 6px 0 18px;
  font-size: clamp(1.6rem, 5vw, 3rem);
}

.upgrade-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.upgrade-card {
  min-height: 142px;
  padding: 16px;
  border: 1px solid rgba(98, 248, 209, 0.36);
  border-radius: 8px;
  color: #f4fbff;
  background: rgba(10, 18, 32, 0.92);
  text-align: left;
  cursor: pointer;
}

.upgrade-card strong,
.upgrade-card span {
  display: block;
}

.upgrade-card span {
  margin-top: 8px;
  color: rgba(244, 251, 255, 0.74);
}

.joystick {
  position: absolute;
  left: max(22px, env(safe-area-inset-left));
  bottom: max(22px, env(safe-area-inset-bottom));
  width: 132px;
  height: 132px;
  display: none;
  place-items: center;
  border: 1px solid rgba(98, 248, 209, 0.32);
  border-radius: 50%;
  background: rgba(7, 9, 20, 0.42);
  pointer-events: auto;
  touch-action: none;
}

.joystick-thumb {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(98, 248, 209, 0.86);
}

@media (pointer: coarse) {
  .joystick {
    display: grid;
  }
}

@media (max-width: 680px) {
  .upgrade-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 7: Verify UI build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 8: Commit UI**

Run:

```bash
git add src/main.ts src/styles.css src/ui
git commit -m "feat: add game hud menus and mobile controls"
```

Expected: commit succeeds, or Git limitation is recorded.

## Task 7: Browser Smoke Test and Cloudflare Docs

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/smoke.spec.ts`
- Create: `README.md`

- [ ] **Step 1: Add Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  webServer: {
    command: "npm run dev -- --port 4175",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: true
  },
  use: {
    baseURL: "http://127.0.0.1:4175",
    trace: "on-first-retry"
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ]
});
```

- [ ] **Step 2: Add smoke test**

Create `tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("starts a run and renders the game HUD", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Neon Relic Survivor" })).toBeVisible();
  await page.getByRole("button", { name: "Start Run" }).click();
  await expect(page.locator(".hud")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await page.keyboard.down("KeyD");
  await page.waitForTimeout(600);
  await page.keyboard.up("KeyD");
  await expect(page.locator("[data-time]")).not.toHaveText("0:00");
});
```

- [ ] **Step 3: Add README**

Create `README.md`:

```md
# Neon Relic Survivor

A Phaser + TypeScript + Vite top-down survival roguelike demo built for Cloudflare Pages.

## Local Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
npm run test:e2e
```

## Cloudflare Pages

Use these build settings:

- Build command: `npm run build`
- Output directory: `dist`
- Node.js version: current LTS

No backend, Worker, database, or environment variables are required for the first release.
```

- [ ] **Step 4: Run all unit tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 5: Run production build**

Run: `npm run build`

Expected: PASS and `dist/` exists.

- [ ] **Step 6: Install browser if needed**

Run: `npx playwright install chromium`

Expected: Chromium is available for Playwright.

- [ ] **Step 7: Run browser smoke test**

Run: `npm run test:e2e`

Expected: PASS in desktop and mobile projects.

- [ ] **Step 8: Commit tests and docs**

Run:

```bash
git add playwright.config.ts tests/e2e/smoke.spec.ts README.md
git commit -m "test: add browser smoke test and deployment docs"
```

Expected: commit succeeds, or Git limitation is recorded.

## Task 8: Final Verification and Release Readiness

**Files:**
- Modify if needed: files touched by failed verification only

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: all commands pass.

- [ ] **Step 2: Inspect mobile and desktop screenshots**

Run Playwright with screenshots if any visual issue is suspected:

```bash
npm run test:e2e -- --update-snapshots
```

Expected: screenshots show a nonblank canvas, readable HUD, no clipped upgrade card text, and usable mobile joystick.

- [ ] **Step 3: Check Cloudflare deploy output**

Run:

```bash
ls dist
```

Expected: includes `index.html` and built asset files.

- [ ] **Step 4: Record Git limitation if still present**

Run:

```bash
git status --short
```

Expected: normal Git status. If it fails with `not a git repository` or `read-only file system`, include that exact limitation in the final response.

- [ ] **Step 5: Final commit**

Run:

```bash
git add .
git commit -m "feat: build neon relic survivor demo"
```

Expected: commit succeeds, or Git limitation is recorded.

## Self-Review

Spec coverage:

- Phaser + TypeScript + Vite static deployment is covered by Tasks 1, 5, 7, and 8.
- Pure game rules outside Phaser are covered by Tasks 2, 3, and 4.
- Automatic shooting, waves, experience, level-up choices, enemies, and win/loss state are covered by Tasks 3 and 4.
- DOM HUD, start menu, result screen, upgrade overlay, and mobile joystick are covered by Task 6.
- Build, smoke testing, and Cloudflare Pages instructions are covered by Tasks 7 and 8.

Known execution note:

- The current workspace has an invalid read-only `.git` directory. Commit steps should be attempted, but implementation can proceed without commits if Git remains unavailable.
