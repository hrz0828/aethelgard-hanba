# Neon Relic Survivor Weapons and Weapon Events Design

Date: 2026-05-28

## Goal

Add visible weapon variety to the run loop by introducing distinct weapon classes, shape-based upgrade paths, and weapon-focused map events that can upgrade, reroll, or temporarily alter the player's loadout.

## Product Direction

The current game has a single auto-firing weapon with stat upgrades. This feature turns weapons into a more expressive build layer. Upgrades should not only change numbers; they should also change projectile shape, weapon silhouette, hit feedback, and the category identity of the weapon the player is using.

Map events should now matter to weapons directly. Instead of only adding pressure or XP, some events should grant weapon upgrades, branch changes, temporary variants, or a chance to pick up weapon modules. This makes the map feel like part of the build system instead of just scenery.

## Scope

Included:

- Three energy-weapon classes:
  - Pulse Rifle
  - Arc Gun
  - Beam Cannon
- Weapon classification and visible identity:
  - Different silhouette/icon per weapon class.
  - Distinct projectile shape, color, and trail style.
  - Distinct hit feedback and firing sound flavor.
- Form upgrades that change projectile behavior and appearance:
  - Single shot to burst.
  - Straight shot to spread.
  - Bullet to beam.
  - Bullet to arc / chain.
  - Projectile count and pattern thresholds.
- Weapon-focused upgrade selection:
  - Current weapon should appear more often in upgrade options.
  - General stat upgrades still exist.
- Weapon-related map events:
  - Armory Cache.
  - Calibration Station.
  - Power Relay.
  - Live Test Zone.
- Weapon drops and temporary weapon modifiers in the map.

Out of scope:

- Full inventory management.
- Multiple weapon slots.
- Manual aiming.
- Complex weapon crafting.
- Permanent unlock trees for weapons outside the run loop.

## Weapon Classes

### Pulse Rifle

Default starter weapon. It should remain the most readable and familiar weapon in the game.

Behavior:

- Base state: steady single-shot pulse.
- Upgrade forms:
  - Burst fire.
  - Two-shot spread.
  - Three-shot fan.
  - Piercing pulse.

Visual identity:

- Cyan / yellow pulse bolts.
- Compact muzzle flash.
- Short, clean trail.

### Arc Gun

Chain-oriented weapon that visually emphasizes electricity and target hopping.

Behavior:

- Base state: moderate-speed arc bolt.
- Upgrade forms:
  - More chain chance.
  - Longer chain range.
  - Split arc on hit.
  - Burst arc volley.

Visual identity:

- Electric cyan / blue palette.
- Jagged or segmented trail.
- Obvious target-hop hit flash.

### Beam Cannon

Continuous or near-continuous weapon that evolves into wider, longer, or branching beams.

Behavior:

- Base state: narrow beam pulse.
- Upgrade forms:
  - Wider beam.
  - Longer beam.
  - Beam pierce.
  - Forked beam or split beam.

Visual identity:

- Bright core beam with softer glow edge.
- Distinct width changes on upgrade.
- Heavier hit flash and stronger screen-read impact.

## Upgrade Model

Weapons should have two upgrade layers:

1. General stat upgrades.
   - Damage.
   - Fire rate.
   - Projectile speed.
   - Pierce.
   - Range.

2. Form upgrades.
   - Changes that visibly alter projectile shape or behavior.
   - These upgrades should unlock at thresholds and be tied to weapon class.

General stat upgrades can improve any weapon. Form upgrades are weapon-specific and should be biased toward the player's current equipped weapon.

Weapon upgrades should avoid collapsing into pure stat inflation. Each class must change in a way that is readable without reading UI text.

Recommended form upgrade rules:

- Pulse Rifle favors burst and spread evolution.
- Arc Gun favors chaining and split/volley behavior.
- Beam Cannon favors width, length, pierce, and branching.

## Weapon Selection and Drops

The run should track one active weapon class and its upgrade state.

Weapon drops in the map should be simple and immediate:

- `Weapon Module`: upgrade the current weapon.
- `Weapon Cache`: offer a choice between two or three compatible weapon forms.
- `Prototype Drop`: temporarily swap the current weapon for a different class.

The player should not manage an inventory. A drop should either upgrade the current weapon, temporarily alter it, or replace it.

## Map Events

Weapon-related map events should be visible on the HUD and should influence the current run directly.

### Armory Cache

Short-lived loot event that grants a weapon upgrade choice or a free upgrade for the current weapon.

### Calibration Station

Lets the player reroll or redirect one weapon form choice. This is a controlled way to correct a build path.

### Power Relay

Temporary zone that buffs energy weapons. It can improve arc bounce, beam width, projectile speed, or reduce weapon cooldown while the player stays in the zone.

### Live Test Zone

A high-risk, high-reward zone with focused enemy spawns and weapon drops. This event should feel like a hostile weapon-testing scenario.

## Map Content

The map should include structures and points of interest that support weapons:

- Armory crates.
- Broken relay towers.
- Calibration kiosks.
- Prototype containers.
- Weapon testing terminals.

These should be placed into the existing district-based city layout so the world still feels like a ruined neon city, not a generic arena.

## UI and Feedback

Weapon changes should be obvious from the moment they happen.

The UI should show:

- Active weapon class.
- Current form or tier.
- Key upgrade direction.

The game view should show:

- Weapon-specific muzzle or firing effect.
- Distinct projectile shape by class.
- Distinct trails or beam widths.
- Distinct hit flashes by weapon type.

Audio should also vary by weapon class so the player can tell the difference even when the screen is busy.

## Architecture

Weapon definitions should live in data files. Weapon state should live in the run state. Weapon upgrade rules should remain in the simulation layer, not in Phaser scenes.

Map events should emit weapon effects through the simulation layer. Phaser scenes should only visualize the result. This keeps the event system testable and prevents the scene from owning build logic.

The existing auto-fire loop should remain the core interaction model. The player still moves only; weapons still fire automatically. The difference is that the weapon itself becomes a visible build object with recognizable forms.

## Testing

The feature should be covered by:

- Unit tests for weapon class data and form upgrade thresholds.
- Unit tests for weapon-focused map event triggers.
- Unit tests that verify weapon event rewards modify the run state.
- Regression coverage for upgraded projectile visuals and HUD labels.

The implementation is complete when:

- The game supports three distinct weapon classes.
- Weapon upgrades visibly change projectile appearance or pattern.
- Map events can grant or redirect weapon upgrades.
- The HUD or UI can tell the player what weapon they are using.
- Existing combat, boss, meta progression, and bilingual UI tests still pass.
