# Neon Relic Survivor Meta Progression Design

Date: 2026-05-28

## Goal

Add a small, persistent meta-progression layer that unlocks playable characters between runs without changing the core combat loop.

## Product Direction

The game keeps its current run-based structure. A run still starts from the menu, plays as a top-down survival roguelike, and ends in victory or defeat. The new layer sits outside combat and gives the player a long-term reason to keep playing: collect relic shards, unlock characters, and return to the run with a different starting profile.

The feature should feel simple and readable. It is not a talent tree, inventory system, or currency economy. It is a roster unlock screen and a small amount of persistent progress.

## Scope

Included:

- Relic shard rewards at the end of a run.
- Persistent unlock storage in `localStorage`.
- A menu roster with locked and unlocked character cards.
- Character selection before starting a run.
- Four playable character presets:
  - Soldier: default balanced baseline.
  - Scout: faster movement, lower health.
  - Heavy: higher health, slower movement.
  - Scavenger: better pickup radius and experience gain.
- Result screen text that shows shards earned this run.

Recommended unlock costs:

- Scout: 12 shards.
- Heavy: 14 shards.
- Scavenger: 16 shards.

Out of scope:

- Permanent stat upgrades.
- Character skill trees.
- Separate currencies.
- In-run character switching.
- Save syncing to a backend.

## Progression Rules

Relic shards are awarded after each run from three inputs:

- Survival time.
- Kill count.
- Boss defeat bonus.

The reward should be deterministic, transparent, and easy to test. The exact formula must be implemented in a shared helper so the menu and result screen can reference the same logic.

Recommended reward formula:

`3 + floor(timeMs / 60000) + floor(kills / 10) + (bossDefeated ? 8 : 0) + (result === "won" ? 5 : 0)`

Unlocking a character spends relic shards. Unlocks persist across refreshes and browser restarts through `localStorage`.

## Data Model

Persistent meta state should be stored separately from run state.

Recommended shape:

```ts
interface MetaSave {
  version: 1;
  shards: number;
  unlockedCharacterIds: string[];
  selectedCharacterId: string;
}
```

The save layer should:

- Load defaults when no save exists.
- Ignore malformed or outdated data.
- Clamp negative shard totals to zero.
- Treat the default Soldier as always available.

## UI

The main menu should show a compact roster panel with:

- Character name.
- Short description.
- Unlock cost.
- Locked or unlocked state.
- Selected state.

The result screen should show:

- Shards earned this run.
- Current shard total.
- Number of unlocked characters.

The bilingual UI must remain intact. New text strings should be added through the existing locale system rather than hard-coded in scene files.

## Architecture

Meta progression lives outside Phaser scene state. The run state remains focused on the current run. The save layer handles persistence and reward math, the character roster layer defines unlockable presets, and the UI layer renders the menu and result summary.

This separation keeps the combat simulation testable and prevents the menu from mutating run logic directly.

## Testing

The feature should be covered by:

- Unit tests for save load and reward calculation.
- Unit tests for character unlock gating and selection rules.
- Regression coverage for menu rendering and result summaries.

The implementation is complete when:

- A player can earn shards from a run.
- A player can unlock a character in the menu.
- The unlock persists after reload.
- The selected character is used when starting the next run.
- Existing combat, map, boss, audio, and bilingual UI tests still pass.
