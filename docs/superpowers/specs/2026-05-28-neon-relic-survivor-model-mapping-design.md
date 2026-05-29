# Neon Relic Survivor Model Mapping Design

Date: 2026-05-28

## Goal

Make character and enemy identity come from the model itself, not from extra glow layers or decorative effects. Each player role should map to a distinct base model silhouette, and each enemy class should be recognizable from body shape, gear, and posture at a glance.

## Product Direction

The game already has a readable combat loop. This pass improves visual identity by changing the actual model language:

- Different player roles should not feel like palette swaps of the same sprite.
- Different enemy roles should not feel like one enemy texture with a different tint.
- Color can still support readability, but it cannot be the primary differentiator.

The design should keep the current top-down, CC0-friendly, lightweight pipeline. If the current asset set does not have a suitable model for a role, the fix is to source a more appropriate CC0 sprite, not to force one texture to do everything.

## Scope

Included:

- Distinct model mapping for the five player roles.
- Distinct model mapping for enemy archetypes and elites.
- A clearer visual hierarchy between normal enemies, pressure enemies, and elites.
- Asset selection guidance so new CC0 sprites can fill any missing role slots.

Out of scope:

- Glow-ring or aura-based identity systems.
- Skeletal animation or complex rigging.
- Full sprite replacement for every action state.
- Combat rule changes.
- HUD redesign.

## Player Model Mapping

Each player role should read through body shape, gear, and posture first.

### Soldier

The Soldier is the neutral baseline.

Expected model traits:

- Standard humanoid proportions.
- Balanced shoulder width.
- Minimal extra gear.
- The closest thing to a "default" military or survivor model.

### Scout

The Scout should read as light and agile.

Expected model traits:

- Narrower torso.
- Smaller shoulder mass.
- Slightly longer or lighter-looking limbs.
- Less armor bulk than Soldier.

### Heavy

The Heavy should read as durable and weighted.

Expected model traits:

- Wider torso.
- Thicker legs and shoulders.
- Heavier armor mass.
- Strongest sense of physical bulk among the light combat roles.

### Scavenger

The Scavenger should read as improvised and gear-heavy.

Expected model traits:

- More uneven silhouette than Soldier.
- Visible pouches, packs, or hanging gear.
- Less formal armor structure.
- A slightly more irregular shape that suggests salvage equipment.

### Vanguard

The Vanguard should read as the most protected role.

Expected model traits:

- Strong front mass or shield-like protection.
- Heavier armor than Soldier.
- More anchored stance.
- Clear defensive presence without becoming boss-like.

## Enemy Model Mapping

Enemy identity should come from silhouette and posture before any color support is applied.

### Chaser

The Chaser is the baseline horde body.

Expected model traits:

- Simple zombie-like silhouette.
- Easy to parse in groups.
- Minimal gear complexity.

### Runner / Charger

These enemies should read as fast movers immediately.

Expected model traits:

- Leaner body.
- Forward tilt.
- Longer or more exposed legs.
- Less upper-body mass than the baseline enemy.

### Tank

The Tank should read as a heavy pressure unit.

Expected model traits:

- Larger body volume.
- Lower center of mass.
- Blockier or rounder outline.
- Strong armor or shell-like mass.

### Shooter / Suppressor

These enemies should read as ranged threats.

Expected model traits:

- More humanoid torso and upper-body structure.
- Clearer weapon-bearing posture.
- Less close-combat bulk than Tank.
- A silhouette that suggests distance pressure, not contact pressure.

### Burster

The Burster should read as unstable and explosive.

Expected model traits:

- Uneven outline.
- Slightly twisted or expanded body shape.
- Visual cues that suggest volatility rather than discipline.

### Elite

Elites should not be simple scale-ups of normal enemies.

Expected model traits:

- A more complete or refined variant model.
- Stronger silhouette complexity than the base enemy.
- Clearer visual hierarchy than the normal version.
- Enough contrast that the player recognizes "this is not just a bigger normal enemy."

## Asset Pipeline

The game should continue using CC0-friendly sprite sources, but the source choice should be made per role instead of globally.

Rules:

- Prefer distinct source sprites over tint-based reuse.
- Keep one model family per role where possible.
- If a role is missing a suitable sprite, add a better-matched CC0 asset rather than retrofitting a mismatched one.
- Preserve the current top-down visual style and scale conventions.

The likely implementation path is a small model-mapping layer that maps:

- player role -> sprite key
- enemy archetype -> sprite key
- elite/boss tier -> variant sprite key or strengthened sprite family

## Presentation Rules

- Color may support readability but should not be the primary identity system.
- Avoid additional glow-ring or aura identity cues in the model pass.
- Keep the model readable in motion from the top-down camera.
- Preserve the current world scale so model differences feel deliberate, not random.

## Architecture

The model mapping should be data-driven.

- The asset layer should define which sprite corresponds to which role or enemy family.
- The character and enemy presentation layers should consume those mappings without hardcoding model logic in the scene.
- The scene should only render the chosen model, scale, and orientation.

This feature should not change combat rules, weapon behavior, map pressure, or the HUD. It only changes how existing roles are visually represented.

## Testing

The implementation should be covered by:

- Unit tests for player role to model mapping.
- Unit tests for enemy archetype to model mapping.
- Regression tests that confirm elites are not just tinted normal enemies.
- Visual smoke verification that each role still renders correctly in the scene.
- A build and full test pass after implementation.

The feature is complete when:

- Each player role reads as a distinct model family.
- Each enemy family is recognizable without relying on glow layers.
- Elites feel like distinct variants rather than tinted copies.
- The game still looks coherent from the top-down camera.
