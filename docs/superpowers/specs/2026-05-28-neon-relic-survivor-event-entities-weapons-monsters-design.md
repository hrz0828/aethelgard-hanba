# Event Entities, Weapon, and Monster Models Design

## Goal

Add visible map-event entity models, one new weapon model/class, and one new monster model tied to map events.

## Scope

- Add static 2D PNG models for map-event entities: armory crate, calibration kiosk, relay tower, prototype container, and test terminal.
- Add a new weapon class: `shard-launcher`.
- Add a new enemy type: `warden`.
- Use the new event entities in world rendering instead of relying only on abstract geometry.
- Let event flows expose the new content through prototype drops and event-spawned enemies.

## Runtime Behavior

- Map points of interest render with dedicated model sprites at their existing positions.
- `shard-launcher` is a weapon class with two upgrade forms: `shard-launcher-fan` and `shard-launcher-razor`.
- Prototype/test weapon drops can rotate into the new weapon through the existing weapon-class progression.
- `warden` uses a distinct model and profile, and event waves can include it for weapon-related events.

## Technical Approach

- Keep generated assets under `assets/generated/event-v1/`.
- Register texture keys in `src/game/assets.ts`.
- Keep event entity mapping in `src/game/mapContent.ts`.
- Extend existing weapon data, weapon loadout, presentation, and localized UI dictionaries.
- Extend enemy definitions/profile/presentation and map event spawning.

## Testing

- Weapon data tests must include `shard-launcher`.
- Enemy profile tests must cover `warden`.
- Map content tests must verify model texture mappings for event entities.
- Presentation tests must verify the new enemy texture mapping.
