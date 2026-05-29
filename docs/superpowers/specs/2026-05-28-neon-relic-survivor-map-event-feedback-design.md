# Neon Relic Survivor Map Event Feedback Design

Date: 2026-05-28

## Goal

Give map events a layered feedback pass so the player can clearly feel when an event is entered, started, and ended, without turning the map into a large-area VFX system.

## Product Direction

The game already has map districts, event types, weapon-related points of interest, and HUD text. This pass does not change the rules behind those systems. It only improves the event feedback so the transitions feel deliberate and readable:

- Entering an event zone should be noticeable but light.
- Event start should have a short, contained pulse.
- Event end should fade out cleanly instead of snapping off.

The visual language should stay restrained. The map is already busy with combat, so event feedback must support readability rather than compete with it.

## Scope

Included:

- Light entry cue when a zone event becomes active.
- Short pulse when the event starts.
- Fade-out cue when the event ends.
- HUD text updates that match the event state.
- Scene-side rendering changes for the event cues only.

Out of scope:

- Event rule changes.
- Spawn pressure changes.
- Drop changes.
- Weapon balance changes.
- New map event types.
- Full-screen flashes.
- Big persistent area effects.

## Feedback States

### Enter

When the player enters an area with an event, the game should signal that something is active without interrupting play.

Expected cues:

- A light ground marker change.
- A short HUD text change for the active event.
- No screen-wide pulse.

The enter cue should be the quietest part of the sequence.

### Start

When the event becomes active, it should be visible as a short pulse inside the event area.

Expected cues:

- A brief localized pulse around the event zone.
- A stronger marker read than the enter cue.
- Confined to the event area, not the whole map.

This cue should be the clearest moment in the sequence.

### End

When the event ends, the cue should taper off rather than disappear instantly.

Expected cues:

- A short fade-out or shrink-back of the event marker.
- The HUD returns to the non-event state.
- No lingering strong highlight after the event is over.

This cue should make the transition feel deliberate and clean.

## Event Type Readability

The existing event types should remain visually distinct:

- `armory` should still feel like a supply-oriented event.
- `calibration` should still feel like a tuning or reset point.
- `relay` should still feel like a power-node event.
- `test` should still feel like a dangerous prototype zone.

This pass should not add a new identity system. It should refine the existing one by making the state changes more legible.

## Architecture

The feedback should stay split by responsibility:

- `src/game/eventVisuals.ts` keeps the event visual definitions.
- `src/game/mapContent.ts` keeps points of interest and pressure logic.
- `src/scenes/GameScene.ts` renders the enter/start/end cues.
- `src/ui/hud.ts` renders the matching text state.

The scene should use the event state from the simulation. It should not invent its own event rules.

## Testing

The implementation should be covered by:

- Unit tests for event feedback state transitions.
- Regression tests for the event visual definitions.
- HUD tests that verify the event label changes with event state.
- A build and full test pass after implementation.

The feature is complete when:

- Players can feel when an event starts, not just read it.
- The end of an event feels clean and intentional.
- The feedback stays local to the event area and does not overwhelm combat.
- Existing map pressure, weapon, character, and enemy systems remain intact.
