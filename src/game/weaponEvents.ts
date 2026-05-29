import { WEAPON_DEFINITIONS, type WeaponClassId } from "../data/weapons";
import { nextId } from "./math";
import { applyWeaponUpgrade, equipWeapon } from "./weaponLoadout";
import type { PickupState, RunState, Vector2, WeaponDropKind } from "./types";

export type { WeaponDropKind } from "./types";

function getWeaponIndex(weaponId: WeaponClassId): number {
  return WEAPON_DEFINITIONS.findIndex((weapon) => weapon.id === weaponId);
}

export function getNextWeaponClassId(weaponId: WeaponClassId): WeaponClassId {
  const index = getWeaponIndex(weaponId);
  const nextIndex = index < 0 ? 0 : (index + 1) % WEAPON_DEFINITIONS.length;
  return WEAPON_DEFINITIONS[nextIndex].id;
}

export function spawnWeaponDrop(
  state: RunState,
  position: Vector2,
  weaponDropKind: WeaponDropKind,
  weaponId: WeaponClassId
): PickupState {
  const pickup: PickupState = {
    id: nextId(state),
    kind: "weapon",
    position: { ...position },
    radius: weaponDropKind === "prototype" ? 13 : 11,
    value: 0,
    weaponDropKind,
    weaponId
  };
  state.pickups.push(pickup);
  return pickup;
}

function getWeaponTargetId(state: RunState, pickup: PickupState): WeaponClassId {
  return pickup.weaponId ?? state.activeWeaponId ?? "pulse-rifle";
}

function applyWeaponDrop(state: RunState, pickup: PickupState, upgradeCount: number): void {
  const weaponId = getWeaponTargetId(state, pickup);
  equipWeapon(state, weaponId);

  for (let index = 0; index < upgradeCount; index += 1) {
    applyWeaponUpgrade(state, weaponId);
  }
}

export function resolveWeaponPickup(state: RunState, pickup: PickupState): void {
  if (pickup.kind !== "weapon" || !pickup.weaponDropKind) {
    return;
  }

  if (pickup.weaponDropKind === "module") {
    applyWeaponDrop(state, pickup, 1);
    return;
  }

  if (pickup.weaponDropKind === "cache") {
    applyWeaponDrop(state, pickup, 2);
    return;
  }

  if (pickup.weaponDropKind === "prototype") {
    applyWeaponDrop(state, pickup, 2);
  }
}
