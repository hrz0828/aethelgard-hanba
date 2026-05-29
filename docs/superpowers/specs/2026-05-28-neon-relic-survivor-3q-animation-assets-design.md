# Neon Relic Survivor 3/4 Animation Asset Design

## Goal

Move character and enemy presentation from pure top-down static sprites toward 3/4 top-down action sprites where hands, legs, feet, and weapons are readable during movement and attack.

## Visual Direction

Use a 3/4 top-down camera angle. The viewer should see enough of the head, shoulders, torso, arms, legs, and feet to understand the character is moving and handling a weapon.

This pass must not use glow rings or tint-only differences as the main identity signal. Model posture, limb motion, weapon grip, and silhouette should carry the presentation.

## First Asset Set

Create the first pass for:

- Scout player character.
- Heavy player character.
- Burster enemy.
- Elite enemy.

Player animation states:

- `idle`: ready stance with hands positioned to hold a weapon.
- `move`: walking/running frame with visible leg and foot motion.
- `attack`: arms and weapon grip shifted to show firing recoil.
- `dodge`: lowered or lunging pose with clear foot placement.

Enemy animation states:

- `move`: forward pressure with legs, claws, or body lean visible.
- `attack`: more aggressive pose with arms, claws, or weapon posture.

## Weapon Handling

Weapons remain standalone 2D assets. Character frames may show hands and grip posture, but the weapon model should not be permanently baked into the player character runtime sprite.

Runtime rendering should remain layered:

- character sprite or animation frame
- independent weapon sprite

The weapon layer may shift slightly by animation state to align with hands.

## Output Structure

Use a new staging folder:

```text
assets/generated/animation-v1/sheets/
assets/generated/animation-v1/runtime/characters/scout/
assets/generated/animation-v1/runtime/characters/heavy/
assets/generated/animation-v1/runtime/enemies/burster/
assets/generated/animation-v1/runtime/enemies/elite/
```

Expected runtime frame files:

```text
characters/scout/idle.png
characters/scout/move.png
characters/scout/attack.png
characters/scout/dodge.png
characters/heavy/idle.png
characters/heavy/move.png
characters/heavy/attack.png
characters/heavy/dodge.png
enemies/burster/move.png
enemies/burster/attack.png
enemies/elite/move.png
enemies/elite/attack.png
```

## Generation Requirements

- 3/4 top-down perspective.
- Flat chroma-key background for removal.
- No labels, UI, text, watermark, floor plane, or shadows.
- Each frame must be separated with enough spacing for clean slicing.
- Characters must show visible hands, legs, and feet.
- Attack frames must show arm and weapon-grip motion.
- Move frames must show leg or foot motion.
- Runtime slices must be transparent PNGs.

## Runtime Integration Boundary

The first implementation may stop at generating, slicing, and validating frames. Runtime integration should follow only after visual approval.

When runtime integration happens:

- Use animation-state frame selection in `GameScene`.
- Do not change combat rules or weapon balance.
- Keep weapons as independent sprites.
- Do not remove existing static model fallback until animation frames are verified in-game.

## Validation

Technical validation:

- All expected frame files exist.
- Runtime frame PNGs are RGBA.
- Runtime frame dimensions are no larger than `256x256`.
- Frame corners are transparent.

Manual visual validation:

- Characters read as 3/4 top-down, not flat top-down.
- Hands, legs, and feet are visible.
- `move` frames differ visibly from `idle`.
- `attack` frames visibly shift arms or grip posture.
- Enemies show motion or attack posture without relying on glow rings.

