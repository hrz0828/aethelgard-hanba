import type { WeaponClassId } from "../data/weapons";
import { TEXTURE_KEYS } from "./assets";

export function getHeldWeaponTextureKey(weaponId?: WeaponClassId): string {
  if (weaponId === "arc-gun") {
    return TEXTURE_KEYS.weaponArcGunV2;
  }

  if (weaponId === "beam-cannon") {
    return TEXTURE_KEYS.weaponBeamCannonV2;
  }

  if (weaponId === "shard-launcher") {
    return TEXTURE_KEYS.weaponShardLauncherV1;
  }

  return TEXTURE_KEYS.weaponPulseRifleV2;
}

export function getPickupWeaponTextureKey(weaponId?: WeaponClassId): string {
  if (weaponId === "shard-launcher") {
    return TEXTURE_KEYS.weaponShardLauncherPickupV1;
  }

  return getHeldWeaponTextureKey(weaponId);
}
