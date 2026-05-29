# Neon Relic Survivor 2D Asset Pipeline Design

## Goal

Improve the character and monster art beyond tint swaps. The first pass must produce readable 2D sample assets that can later be wired into the Phaser runtime without baking weapons permanently into character sprites.

## Scope

This pass has two ordered phases:

1. Existing asset optimization.
2. New generated 2D models after the optimized direction is validated.

The first deliverable is a sample set, not a full animation sheet.

## Phase 1: Existing Asset Optimization

Use the current CC0/Kenney top-down sprites as source material. Create non-destructive optimized variants under a new project asset folder.

Required sample subjects:

- Scout character.
- Heavy character.
- Burster monster.
- Elite monster.
- Pulse Rifle weapon.
- Arc Gun weapon.
- Beam Cannon weapon.

Character requirements:

- Characters must remain recognizably human.
- Head, torso, two legs, and two feet must be readable at game scale.
- Identity should come from model silhouette, equipment, body proportions, and pose.
- Do not use glow rings, aura circles, or simple color-only changes as the primary difference.
- Each character should have a base model asset and a preview composition showing the character holding one weapon.

Monster requirements:

- Monsters can be mutated or stylized, but their silhouette must remain readable.
- Burster should look unstable or ruptured through shape and posture.
- Elite should look like a higher-tier enemy through model detail, not just scale or tint.
- Do not depend on aura rings for enemy identity.

Weapon requirements:

- Weapons must be standalone 2D assets.
- Weapons must not be permanently baked into the character base model.
- Each weapon should have a clear silhouette that reads as a separate item.
- The preview composition may show a character holding a weapon, but runtime-oriented assets stay separate.

## Phase 2: Generated 2D Models

After Phase 1 is accepted, generate a new set of 2D character and monster models in the same direction.

Generation requirements:

- Use top-down or near-top-down framing suitable for a top-down shooter.
- Use flat or removable background during generation so assets can become transparent PNGs.
- Preserve human readability for player characters: visible head, torso, two legs, and two feet.
- Keep weapons as separate generated assets.
- Produce preview compositions separately from runtime assets.

## Output Structure

Use a new asset staging folder:

```text
assets/generated/preview/
assets/generated/runtime/characters/
assets/generated/runtime/enemies/
assets/generated/runtime/weapons/
```

Preview files:

- `scout-with-pulse-rifle.png`
- `heavy-with-beam-cannon.png`

Runtime files:

- `characters/scout-optimized.png`
- `characters/heavy-optimized.png`
- `enemies/burster-optimized.png`
- `enemies/elite-optimized.png`
- `weapons/pulse-rifle.png`
- `weapons/arc-gun.png`
- `weapons/beam-cannon.png`

## Runtime Integration Boundary

This design does not require immediate Phaser integration. The first implementation should create and validate assets. Runtime wiring can follow in a separate plan after visual approval.

If integration is included later:

- Keep character and weapon sprites layered in the scene.
- Do not replace weapon gameplay logic.
- Do not bake one weapon permanently into a character.
- Preserve existing bilingual UI, map events, dodge, and combat systems.

## Validation

Manual visual validation:

- Character assets are recognizably human.
- Both legs and both feet are visible or clearly implied.
- Weapons are separate files.
- Preview compositions show characters holding weapons.
- Monsters are visually distinct without aura rings.

Technical validation:

- Asset files exist in the expected folders.
- Runtime assets are PNG files.
- Project build still succeeds if asset files are added without runtime wiring.

