# Neon Relic Survivor Feel Polish Design

Date: 2026-05-28

## Goal

Improve the moment-to-moment feel of combat by making three layers read distinctly:

1. Impact moment.
2. Weapon firing.
3. Death finish.

The game already has a working survival loop, weapon evolution, dodge, boss pacing, and map pressure. This pass should make hits, shots, and kills feel clearer without changing combat rules.

## Product Direction

The current game is already readable enough to play. This feature is about tightening perception:

- A hit should feel like a hit.
- A weapon should feel different the moment it fires.
- A kill should resolve with a clear finish, not just disappear.

The pass should stay light. No new combat systems, no new weapon classes, and no new AI behavior. Presentation only.

## Scope

Included:

- Layered impact feedback for normal enemies, elites, bosses, and the player.
- Weapon-specific firing feedback for the existing energy weapons.
- Layered death finishes for normal enemies, elites, and bosses.
- Minor presentation updates to keep hit, fire, and death cues distinct.

Out of scope:

- Balance changes.
- New enemy types.
- New weapon classes.
- Manual aiming.
- Complex animation systems or skeletal animation.
- Full-screen damage flash.

## A. Impact Moment

### Normal Enemies

Normal enemies should respond quickly and lightly when hit.

Expected cues:

- Short flash on the sprite itself.
- Small scale bump or recoil.
- Brief hit pause or shake.
- Small burst effect at the impact point.

The cue should confirm contact without slowing the fight down.

### Elites

Elite enemies should feel sturdier and more dangerous than normal enemies.

Expected cues:

- Brighter hit flash than normal enemies.
- Slightly longer hit shake.
- Stronger impact burst.
- Clearer tint or glow change so the hit is visible at a glance.

### Bosses

Boss hit feedback should be restrained but heavy.

Expected cues:

- Clear hit confirmation on the body.
- Slightly stronger flash than normal enemies, but less chaotic than elites.
- Visible resistance feel through scale and alpha changes.

Boss hits should read as forceful impacts on a durable target, not as small enemy flinches.

### Player Damage

Player damage stays local to the character sprite.

Expected cues:

- Sprite-local flash only.
- No full-screen red flash.
- No global damage overlay.
- Damage should remain readable even while dodging.

## B. Weapon Firing

### Pulse Rifle

Pulse Rifle should feel crisp and direct.

Expected cues:

- Short muzzle flash.
- Tight projectile trail.
- Fast, compact firing rhythm.
- Upgraded forms should widen or intensify the muzzle and trail slightly, but stay precise.

### Arc Gun

Arc Gun should feel electrical rather than ballistic.

Expected cues:

- More spark-like muzzle flash.
- Trail style that reads as discharge or hopping energy.
- Stronger visual separation between single bolt, chain, and split forms.
- Fired shots should look like they are connecting or propagating, not simply traveling.

### Beam Cannon

Beam Cannon should feel like it is building pressure before releasing it.

Expected cues:

- A small charge-up or ignition feel before the beam becomes visible.
- Wider, brighter beam presentation than the other weapons.
- Form upgrades should clearly change beam width, length, or branching.
- The weapon should look heavier and more sustained than the other two.

### Shared Rules

- Each weapon family should keep its own color language.
- Form changes should alter at least one visible aspect of the shot: width, trail, flash, or brightness.
- Weapon presentation should support the existing upgrade history shown in the HUD.

## C. Death Finish

### Normal Enemies

Normal enemy deaths should be quick and clean.

Expected cues:

- Small dissolve or scatter.
- Low-intensity shard burst.
- Brief end-state cue that confirms the kill.

### Elites

Elite deaths should feel more expensive than normal enemy deaths.

Expected cues:

- More fragments or spark scatter.
- Slightly longer finish than normal enemies.
- Stronger color cue to separate them from baseline enemies.

### Bosses

Boss deaths should have the clearest end cue in the game, but remain short.

Expected cues:

- Stronger burst finish.
- Clear visual confirmation of defeat.
- Short, controlled resolution that does not turn into a long cutscene.

## Architecture

The implementation should stay split by responsibility:

- Simulation layer: decides when hit, fire, and death events happen.
- Presentation layer: turns those events into sprite-local flashes, bursts, trails, and finishes.
- UI layer: keeps showing the current weapon, form, and state labels.

No combat rule should depend on the presentation work. The presentation should consume existing state, not own it.

The likely areas of change are:

- Enemy hit and death presentation helpers.
- Weapon firing presentation helpers.
- Scene rendering code that draws the impact and death effects.
- HUD labels only if text needs a clearer distinction between form, weapon, and history.

## Testing

The implementation should be covered by:

- Unit tests for layered hit feedback states.
- Unit tests for weapon-specific firing presentation state.
- Unit tests for death finish state by enemy tier.
- Regression coverage to ensure player damage remains sprite-local and does not trigger a full-screen flash.
- A build and test pass after implementation.

The feature is complete when:

- Impact feedback is clearly different for normal enemies, elites, bosses, and the player.
- Weapon firing looks and feels different for Pulse Rifle, Arc Gun, and Beam Cannon.
- Enemy death finishes are tiered and readable.
- The existing combat loop, dodge system, boss pacing, weapon evolution, map pressure, and bilingual UI still work.
