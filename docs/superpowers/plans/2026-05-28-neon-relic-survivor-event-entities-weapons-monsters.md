# Event Entities, Weapon, and Monster Models Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible event entity models, a shard launcher weapon class, and a warden monster model tied to map events.

**Architecture:** Use the existing Phaser asset manifest and simulation boundaries. Gameplay data remains in `src/data` and `src/game`, while `GameScene` only adapts state and map content into sprites.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, generated PNG assets.

---

### Task 1: Generate Static Runtime Assets

**Files:**
- Create: `scripts/generate-event-v1-assets.mjs`
- Create: `assets/generated/event-v1/*.png`
- Test: `tests/assets/generated-assets.test.ts`

- [ ] Write a generator that creates transparent PNGs for event entities, `shard-launcher`, `shard-launcher-pickup`, and `warden`.
- [ ] Run the generator and verify the PNGs have alpha channels and non-empty subject pixels.
- [ ] Add generated asset test paths.

### Task 2: Register Asset Keys and Presentation Helpers

**Files:**
- Modify: `src/game/assets.ts`
- Modify: `src/game/mapContent.ts`
- Test: `tests/game/map-content.test.ts`
- Test: `tests/game/presentation.test.ts`

- [ ] Add texture keys and preload calls for the new PNGs.
- [ ] Add map point texture mapping helper.
- [ ] Add enemy presentation mapping for `warden`.
- [ ] Test event entity and enemy mappings.

### Task 3: Add Shard Launcher Weapon Class

**Files:**
- Modify: `src/data/weapons.ts`
- Modify: `src/game/weaponLoadout.ts`
- Modify: `src/game/weaponPresentation.ts`
- Modify: `src/ui/locale.ts`
- Test: `tests/game/weapons-data.test.ts`
- Test: `tests/game/weapon-progress.test.ts`
- Test: `tests/ui/locale.test.ts`

- [ ] Add `shard-launcher` and its two forms to weapon data.
- [ ] Add progression, stats, projectile presentation, and bilingual UI text.
- [ ] Verify progression and UI dictionaries include the new weapon.

### Task 4: Add Warden Enemy and Event Spawns

**Files:**
- Modify: `src/data/enemies.ts`
- Modify: `src/game/enemyProfiles.ts`
- Modify: `src/game/map.ts`
- Test: `tests/game/enemy-profiles.test.ts`
- Test: `tests/game/weapon-events.test.ts`

- [ ] Add `warden` enemy definition and profile.
- [ ] Spawn wardens in armory, relay, and test events.
- [ ] Verify event spawning can create warden enemies.

### Task 5: Render Event Entity Sprites

**Files:**
- Modify: `src/scenes/GameScene.ts`
- Test: `npm test`
- Verify: `npm run build`

- [ ] Maintain a sprite map for event entities keyed by zone/kind.
- [ ] Render event sprites at point-of-interest positions with depth under gameplay actors.
- [ ] Keep existing low-intensity event rings as local hints.
