# Neon Relic Survivor Enemy, Weapon, and Map Pressure Design

Date: 2026-05-28

## Goal

Deepen the run loop by making enemies, weapons, and map districts work together as a pressure system. Enemies should read as distinct threat roles, weapons should evolve visibly during a run, and map events should push the player toward weapon-related choices and late-run pacing.

## Product Direction

The current game already has a functioning survival loop, a boss encounter, weapon forms, map districts, and dodge-based action. This feature does not replace that structure. It sharpens it.

The player should feel three things clearly:

1. Different enemies ask for different answers.
2. Weapons do not just gain numbers; they change shape, range, and firing pattern in ways you can see.
3. Districts and events are not decoration. They pressure the build and the route through the run.

This is still a compact arcade roguelike. The design should stay readable from the first second of combat.

## Scope

Included:

- Enemy archetype expansion.
- Elite variants with stronger visual treatment.
- Boss pacing improvements.
- Weapon evolution that changes visible projectile behavior and presentation.
- Map pressure changes by district.
- Map events that directly support weapon growth and late-run pacing.

Out of scope:

- Manual aiming.
- Inventory management.
- Multi-weapon loadouts.
- Permanent weapon unlock trees.
- Quest chains or objective journals.

## Enemy and Boss Behavior

### Enemy Archetypes

The game should keep its current enemy families, but add clearer combat roles and a few new behaviors.

Recommended threat roles:

- Chaser: keeps the current baseline pursuit behavior.
- Runner: short burst dash-in enemy that forces repositioning.
- Shooter: ranged suppressor that punishes static movement.
- Tank: slow, durable pressure unit.
- Elite variant: a stronger version of an existing archetype with a clearer visual read.

Behavior rules:

- Runners should close distance in bursts instead of walking at full speed.
- Shooters should maintain range and fire on a cooldown so they feel like area denial.
- Tanks should stay simple and readable, but absorb more punishment.
- Elite variants should not introduce a new AI system. They should extend the base archetype with more health, stronger hit feedback, and a visible threat layer.

### Boss Pacing

The current boss should remain the run climax, but its phases should be easier to read.

Recommended pacing:

- Phase 1: pursuit and close pressure.
- Phase 2: summon or add-pressure phase with a visible telegraph.
- Phase 3: denser pressure, stronger cueing, and a clear finish window.

Behavior rules:

- The boss should telegraph phase transitions more clearly than normal enemy actions.
- Adds should support the boss, not replace the boss fight.
- The boss must remain a separate entity from the normal wave system.

## Weapon Evolution

### Weapon Identity

The three energy weapons should keep their current identities, but each form upgrade needs to read visibly in combat.

Recommended weapon roles:

- Pulse Rifle: steady opener that evolves into burst and spread patterns.
- Arc Gun: chaining weapon that emphasizes target hopping and split discharges.
- Beam Cannon: sustained pressure weapon that evolves into wider, longer, or branching beams.

### Visible Evolution Rules

Weapon evolution should change at least one of the following when a form upgrade happens:

- Projectile count.
- Projectile spacing or spread.
- Beam width.
- Trail style or glow.
- Hit feedback intensity.
- HUD form label and upgrade history.

The player should not need to inspect text to know the weapon changed.

### Upgrade Direction

Recommended direction by weapon:

- Pulse Rifle: burst and scatter evolution.
- Arc Gun: chain and split evolution.
- Beam Cannon: width, length, pierce, and branching evolution.

General stat upgrades can still apply, but they should sit behind or alongside form changes rather than replacing them.

## Map Pressure and District Events

### District Pressure

The existing city districts should feel different in risk and reward.

Recommended district profile:

- Hub: lowest pressure, recovery space, spawn suppression.
- North: densest combat pressure.
- East: stronger rewards and weapon event frequency.
- South: better supply and recovery pacing.
- West: more elite pressure and stronger late-run risk.

### Map Event Rhythm

District events should continue to rotate, but their purpose should be sharper.

Recommended event roles:

- Supply point: grants experience or a small immediate reward.
- Hazard zone: increases pressure for a short time, usually with better gains.
- Wave event: temporarily spikes enemy density.
- Armory / calibration / relay / test events: directly interact with weapon growth or weapon behavior.

### Weapon-Related Map Content

The map should contain visible points of interest that support weapon progression:

- Armory crates.
- Calibration terminals.
- Broken relay towers.
- Prototype containers.
- Test terminals.

These should fit the ruined neon city aesthetic and appear as part of the district language, not as generic quest markers.

### Late-Run Pressure

The map should push the run toward the boss and prevent the midgame from feeling endless.

Recommended late-run behavior:

- More frequent elite pressure in outer districts.
- Weapon-support events becoming more valuable as the run progresses.
- Districts feeding into a clear boss-facing endgame rhythm rather than indefinite wandering.

## UI and Feedback

Enemy and weapon changes should be visible without reading tooltips.

The UI should show:

- Active weapon class.
- Current weapon form.
- Weapon upgrade history or tier progression.
- Current zone and current event.
- Dodge type and dodge cooldown.

The world view should show:

- Stronger enemy silhouette differences.
- Clearer elite and boss threat layers.
- Weapon-specific projectile patterns and beam widths.
- More obvious motion cues on movement, dodge, hit, and death.

Audio should continue to reinforce the distinction between weapon classes, enemy hits, boss phases, and map events.

## Architecture

Enemy behavior should stay in the simulation layer. Scene code should only render movement, telegraphs, and hit state. New enemy roles should be data-driven where possible, with behavior flags or archetype profiles rather than one-off special cases.

Weapon evolution should remain rule-driven in the run state. Form changes should flow from weapon progression data into the simulation and then into the renderer. Scenes should not decide what a weapon form means.

Map districts and events should remain a simulation concern. The scene can draw event markers and district cues, but the rules for spawning, timing, and reward should remain outside Phaser presentation code.

The result should preserve the current run structure: move, survive, upgrade, adapt, defeat the boss. This feature adds texture and pressure, not a new game mode.

## Testing

The implementation should be covered by:

- Unit tests for enemy archetype behavior flags and boss phase pacing.
- Unit tests for weapon form transitions and visible weapon state.
- Unit tests for map district pressure and event rotation.
- Regression coverage for HUD labels, weapon form display, and district/event text.
- A build and full test pass after implementation.

The feature is complete when:

- Enemy roles are easier to read in combat.
- Weapon upgrades visibly change how the weapon looks and fires.
- Districts and events alter run pressure in a meaningful way.
- Weapon-related map content matters to the build, not just the map.
- Existing dodge, meta progression, boss, and bilingual UI systems still work.

