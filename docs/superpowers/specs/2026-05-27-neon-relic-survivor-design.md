# Neon Relic Survivor Design

Date: 2026-05-27

## Goal

Build a publishable browser demo for a top-down shooter / roguelike survival game deployable to Cloudflare Pages.

The first version is a `Vampire Survivors` style game: the player controls movement only, weapons auto-fire at nearby enemies, enemies arrive in escalating waves, and level-ups offer three upgrade choices. The target session length is 8-10 minutes.

## Product Direction

Working title: `Neon Relic Survivor`

Theme: neon ruins. The world uses a dark, readable arena with high-contrast combat elements. Player attacks lean cyan and yellow. Enemies use distinct bright colors and silhouettes so the player can read threats quickly while moving.

Primary player verbs:

- Move to survive.
- Kite enemy waves.
- Collect experience crystals.
- Choose upgrades that change the build.
- Survive until the timer ends.

## Target Platform

The game ships as a static web app on Cloudflare Pages.

Build settings:

- Framework: Vite
- Language: TypeScript
- Game runtime: Phaser
- Build command: `npm run build`
- Output directory: `dist`

The first release does not require a backend, database, authentication, or Cloudflare Workers.

## Scope

The demo includes:

- 1 open neon-ruins arena.
- 1 player character.
- 5-6 enemy types.
- 8-10 level-up upgrades.
- 8-10 minute run length.
- Start menu, pause state, HUD, upgrade choice overlay, and result screen.
- Desktop keyboard controls and mobile virtual joystick controls.

Out of scope for the first release:

- Multiple maps.
- Multiple playable characters.
- Permanent meta-progression.
- Online leaderboard.
- Account system.
- Asset-heavy sprite pipeline.

## Gameplay Loop

1. The player starts from the menu.
2. The run begins in a neon ruins arena.
3. Enemies spawn in timed waves and move toward the player.
4. The player's weapon automatically targets the nearest valid enemy and fires.
5. Killed enemies can drop experience crystals.
6. Collecting enough experience levels up the player.
7. On level-up, combat pauses and the player chooses 1 of 3 upgrade cards.
8. Waves intensify over time through spawn rate, enemy mix, and elite appearances.
9. The run ends when player health reaches zero or the survival timer completes.
10. The result screen shows survival time, level, kills, and selected upgrades.

## Controls

Desktop:

- `WASD` and arrow keys move.
- `Esc` pauses.
- Mouse or keyboard can select upgrade cards and menu buttons.

Mobile:

- A virtual joystick controls movement.
- Touch selects menu buttons and upgrade cards.

There is no manual aiming or fire button in the first release.

## Core Systems

### Game State

Game state lives outside Phaser scene objects where practical. Phaser adapts state into sprites, camera movement, effects, and input. This keeps gameplay rules testable and prevents all behavior from accumulating in a scene `update` loop.

Important state:

- Run timer.
- Player stats and position.
- Enemy list.
- Projectile list.
- Experience crystals.
- Current level and experience.
- Available upgrades.
- Active upgrade history.
- Run status: menu, playing, paused, choosing upgrade, won, lost.

### Player

The player has:

- Position and velocity.
- Health and max health.
- Movement speed.
- Pickup radius.
- Weapon stat modifiers.
- Defensive modifiers such as shield or damage reduction.

Movement should feel responsive and readable before adding extra effects.

### Weapons

The initial weapon is an auto-firing energy gun.

Behavior:

- Finds the nearest enemy inside target range.
- Fires at a configured rate.
- Creates projectiles with damage, speed, lifetime, pierce count, and optional chain behavior.

Weapon upgrades can modify:

- Damage.
- Fire rate.
- Projectile speed.
- Pierce.
- Chain lightning.
- Projectile count.

### Enemies

Enemy types for the first demo:

- Basic chaser: low health, direct pursuit.
- Runner: fast and fragile.
- Tank: slow, high health.
- Shooter: stops at range and fires simple projectiles.
- Burster: rushes and explodes on death or contact.
- Elite: larger variant with higher health and a visible aura.

Enemy stats are data-driven so wave tuning does not require changing scene code.

### Waves

Waves are time-based. The wave director reads the run timer and spawns enemy groups based on configuration.

Escalation levers:

- Spawn interval.
- Enemy count.
- Enemy type mix.
- Spawn distance from player.
- Elite frequency.

The final minute should feel noticeably more intense without making the screen unreadable.

### Experience and Upgrades

Killed enemies drop experience crystals. Crystals can be collected by overlap or pulled toward the player when inside pickup radius.

On level-up:

- The game pauses.
- Three random upgrade cards appear.
- The player picks one.
- The chosen upgrade applies immediately.
- Combat resumes.

Initial upgrade pool:

- Damage up.
- Fire rate up.
- Movement speed up.
- Max health up.
- Heal now.
- Pickup radius up.
- Projectile pierce up.
- Chain lightning chance.
- Shield cooldown.
- Experience gain up.

Upgrade selection should avoid offering options that cannot apply.

## UI

HUD is DOM-based and layered above the Phaser canvas.

HUD displays:

- Run timer.
- Player health.
- Level.
- Experience bar.
- Kill count.
- Compact active upgrade indicators.

Menus:

- Start screen: title, play button, short control hint.
- Pause overlay: resume and restart.
- Upgrade overlay: three cards with icon, name, and short effect text.
- Result screen: win/loss, time survived, level reached, kills, and restart button.

The UI should stay compact and readable on desktop and mobile. It must not cover critical combat space more than necessary.

## Visual and Audio Direction

The arena uses dark neon ruins with subtle grid or structure hints. Combat readability takes priority over decorative detail.

Visual effects:

- Projectile trails.
- Hit flashes.
- Short hit-stop on major impacts if it does not harm responsiveness.
- Light screen shake for heavy hits and level-up.
- Clear experience crystal glow.

Audio is lightweight for the first release:

- Shoot sound.
- Enemy hit or death sound.
- Pickup sound.
- Level-up sound.
- Button interaction sound.

Generated or simple synthesized audio is acceptable initially.

## Architecture

Planned source layout:

```text
src/
  main.ts
  styles.css
  scenes/
    BootScene.ts
    MenuScene.ts
    GameScene.ts
    GameOverScene.ts
  game/
    state.ts
    player.ts
    enemies.ts
    weapons.ts
    projectiles.ts
    pickups.ts
    upgrades.ts
    waves.ts
    collision.ts
    input.ts
  data/
    enemies.ts
    upgrades.ts
    waves.ts
  ui/
    hud.ts
    upgradeOverlay.ts
    menu.ts
  assets/
```

Phaser scenes should remain thin:

- Create and dispose renderer-facing objects.
- Capture input and pass actions into game systems.
- Render game state.
- Trigger visual and audio effects.

Game systems own rules and should avoid direct dependency on Phaser scene internals.

## Error Handling

The game should handle:

- Missing optional audio by continuing silently.
- Resize events by recalculating canvas and HUD layout.
- Mobile pointer interruptions by resetting joystick state.
- Restart after win/loss without requiring page reload.

During development, failures should be visible in the console rather than swallowed.

## Testing and Acceptance

Verification commands:

- `npm run build`

Browser smoke tests:

- Desktop viewport loads the start screen.
- Starting a run shows player, enemies, HUD, and timer.
- Keyboard movement changes player position.
- Enemy kills can create experience pickups.
- Level-up opens a three-card upgrade choice and resumes after selection.
- Player death shows result screen.
- Restart starts a clean run.
- Mobile viewport shows usable touch controls and no HUD overlap.

Visual acceptance:

- Canvas is nonblank.
- Player, enemies, projectiles, and pickups are distinguishable.
- HUD text fits on mobile and desktop.
- Upgrade cards fit without clipping.
- Combat remains readable during dense waves.

## Deployment

Cloudflare Pages configuration:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: current LTS compatible with Vite

The deployed app should work with direct navigation to the root path. No server routing is needed for the first release.
