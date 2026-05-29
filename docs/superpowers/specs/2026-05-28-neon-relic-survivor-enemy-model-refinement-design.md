# Neon Relic Survivor Enemy Model Refinement Design

Date: 2026-05-28

## Goal

Refine enemy identity so the most important threat families read from the model itself, not from tint, aura, or glow effects. The pass should be done in this order:

1. Burster silhouette refinement.
2. Elite variant refinement.
3. Heavy enemy line refinement.

The result should make enemies easier to read at long range from the top-down camera.

## Product Direction

The current game already uses distinct enemy families and presentation scale. This pass sharpens that separation further by changing which base model each family uses and by tightening silhouette distinctions.

Rules for this pass:

- No aura rings.
- No glow-based identity.
- No combat rule changes.
- No new AI behaviors.
- The model itself should carry identity first.

Color may remain a secondary support signal, but it cannot be the primary differentiation mechanism.

## Scope

Included:

- Burster silhouette refinement first.
- Elite silhouette refinement second.
- Heavy enemy line silhouette refinement third.
- Enemy model mappings that remain readable in motion.
- Asset selection that prefers distinct CC0 sprites over tint-based reuse.

Out of scope:

- Player model changes.
- Weapon changes.
- Map changes.
- Boss logic changes.
- New combat behaviors.
- Aura rings, glow layers, or halo systems.

## Step 1: Burster Silhouette Refinement

The burster should read as unstable and visually different from the base horde.

Expected model traits:

- Slightly uneven body shape.
- More outward or stretched upper silhouette.
- A less disciplined posture than the chaser or runner.
- A distinct silhouette even when seen at medium distance.

Asset direction:

- Use an existing CC0 sprite family that already reads as improvised or irregular.
- Prefer a sprite that looks more scrappy or ragged than the baseline zombie.
- Do not solve burster identity with tint or aura.

Success condition:

- The burster is immediately distinguishable from the baseline chaser by shape, not just color.

## Step 2: Elite Variant Refinement

Elites should feel like a complete higher-tier model, not a larger copy of a normal enemy.

Expected model traits:

- More complete silhouette than the base family.
- Clear upper-body / weapon or armor structure.
- Stronger visual presence without becoming boss-sized.
- Enough difference that the player recognizes an elite before reading the label.

Asset direction:

- Use the most distinctive existing elite-appropriate CC0 sprite family.
- Keep elite presentation separate from normal-family tints.
- Preserve the idea that elites are a variant of threat, not a different AI category.

Success condition:

- Elite enemies no longer read as tinted normal enemies at a glance.

## Step 3: Heavy Enemy Line Refinement

The heavy line should communicate weight, low center of mass, and pressure.

Expected model traits:

- Broader base.
- Lower, heavier outline.
- Stronger sense of mass than the faster enemies.
- A model family that reads as “pressure unit” without needing a visual effect.

Asset direction:

- Use the most suitably heavy CC0 model family already in the repository.
- If the current asset set needs a clearer heavy silhouette, prefer a better-fitting CC0 sprite rather than forcing a tint workaround.
- Keep the model readable from top-down at the current game scale.

Success condition:

- The heavy line reads as heavier than the regular humanoid enemies, even without aura or glow cues.

## Asset Strategy

This pass should remain asset-driven.

Rules:

- Prefer distinct sprite families for burster, elite, and heavy line.
- Keep the current top-down CC0 style.
- Avoid introducing glow overlays to compensate for weak silhouettes.
- If a family is missing a suitable model, add the missing CC0 sprite mapping rather than over-tinting an existing one.

The likely implementation path is a presentation mapping layer that resolves:

- enemy family -> sprite key
- elite tier -> variant sprite key
- heavy family -> heavy sprite key

## Architecture

Enemy identity should live in the asset/presentation layer.

- `src/game/assets.ts` should choose the sprite family.
- `src/scenes/GameScene.ts` should render the chosen model and scale.
- `src/game/enemies.ts` and `src/data/enemies.ts` should continue to own behavior and stats only.

The scene should not add extra identity layers to make the enemy readable. The model selection itself should do that work.

## Testing

The implementation should be covered by:

- Unit tests for burster, elite, and heavy enemy model mapping.
- Regression tests that confirm no aura-based identity remains in enemy presentation.
- A data/presentation check that the selected sprite keys differ by family and tier.
- A build and full test pass after implementation.

The feature is complete when:

- Bursters are visually unstable and distinct.
- Elites are clearly higher-tier variants.
- Heavy enemies read as pressure units from silhouette alone.
- The game still feels coherent in motion from the top-down camera.
