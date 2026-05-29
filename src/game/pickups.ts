import { distance, normalize } from "./math";
import { getMapProfile } from "./map";
import type { PickupState, RunState } from "./types";
import { resolveWeaponPickup } from "./weaponEvents";

export function updatePickups(state: RunState, deltaMs: number): void {
  const remainingPickups: PickupState[] = [];

  for (const pickup of state.pickups) {
    const toPlayer = {
      x: state.player.position.x - pickup.position.x,
      y: state.player.position.y - pickup.position.y
    };
    const currentDistance = distance(state.player.position, pickup.position);
    const pickupCollectionDistance = state.player.radius + pickup.radius;

    if (currentDistance <= pickupCollectionDistance) {
      if (pickup.kind === "weapon") {
        resolveWeaponPickup(state, pickup);
        continue;
      }

      const profile = getMapProfile(state.currentZone, state.activeZoneEventType);
      state.player.experience += Math.max(
        1,
        Math.round(pickup.value * profile.pickupValueMultiplier * state.player.experienceGainMultiplier)
      );
      continue;
    }

    if (currentDistance <= state.player.pickupRadius) {
      const movementDistance = 420 * (deltaMs / 1000);
      if (movementDistance >= currentDistance - pickupCollectionDistance) {
        if (pickup.kind === "weapon") {
          resolveWeaponPickup(state, pickup);
          continue;
        }

        const profile = getMapProfile(state.currentZone, state.activeZoneEventType);
        state.player.experience += Math.max(
          1,
          Math.round(pickup.value * profile.pickupValueMultiplier * state.player.experienceGainMultiplier)
        );
        continue;
      }

      const direction = normalize(toPlayer);
      pickup.position.x += direction.x * movementDistance;
      pickup.position.y += direction.y * movementDistance;
    }

    remainingPickups.push(pickup);
  }

  state.pickups = remainingPickups;
}
