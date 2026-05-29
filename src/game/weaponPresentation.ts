import type { RunState } from "./types";
import { getWeaponDisplayState, type WeaponDisplayState } from "./weaponLoadout";

export type WeaponTrailStyle = "streak" | "spark" | "beam";

export interface WeaponPresentationState extends WeaponDisplayState {
  projectileColor: number;
  trailColor: number;
  trailStyle: WeaponTrailStyle;
  muzzleFlashScale: number;
  weaponAccentColor: number;
  trailLengthFactor: number;
  leadGlowScale: number;
}

function getWeaponPalette(weaponId: WeaponDisplayState["weaponId"], formId: WeaponDisplayState["formId"]) {
  if (weaponId === "pulse-rifle") {
    if (formId === "pulse-rifle-spread") {
      return {
        projectileColor: 0xa4ffe9,
        trailColor: 0xf4fbff,
        trailStyle: "streak" as const,
        muzzleFlashScale: 1.16,
        weaponAccentColor: 0xa4ffe9,
        trailLengthFactor: 0.92,
        leadGlowScale: 0.94
      };
    }

    if (formId === "pulse-rifle-burst") {
      return {
        projectileColor: 0xffe66d,
        trailColor: 0xfff2a0,
        trailStyle: "spark" as const,
        muzzleFlashScale: 1.24,
        weaponAccentColor: 0xffe66d,
        trailLengthFactor: 0.88,
        leadGlowScale: 0.98
      };
    }

    return {
      projectileColor: 0x62f8d1,
      trailColor: 0xeafff8,
      trailStyle: "streak" as const,
      muzzleFlashScale: 1.08,
      weaponAccentColor: 0x62f8d1,
      trailLengthFactor: 0.84,
      leadGlowScale: 0.9
    };
  }

  if (weaponId === "arc-gun") {
    if (formId === "arc-gun-split") {
      return {
        projectileColor: 0x69a7ff,
        trailColor: 0xa4ffe9,
        trailStyle: "spark" as const,
        muzzleFlashScale: 1.18,
        weaponAccentColor: 0x69a7ff,
        trailLengthFactor: 1.04,
        leadGlowScale: 1.04
      };
    }

    if (formId === "arc-gun-chain") {
      return {
        projectileColor: 0xa4ffe9,
        trailColor: 0xeafff8,
        trailStyle: "spark" as const,
        muzzleFlashScale: 1.12,
        weaponAccentColor: 0x62f8d1,
        trailLengthFactor: 0.98,
        leadGlowScale: 1.08
      };
    }

    return {
      projectileColor: 0x62f8d1,
      trailColor: 0xa4ffe9,
      trailStyle: "spark" as const,
      muzzleFlashScale: 1.08,
      weaponAccentColor: 0x62f8d1,
      trailLengthFactor: 0.94,
      leadGlowScale: 1.02
    };
  }

  if (weaponId === "beam-cannon") {
    if (formId === "beam-cannon-prism") {
      return {
        projectileColor: 0xb36dff,
        trailColor: 0x62f8d1,
        trailStyle: "beam" as const,
        muzzleFlashScale: 1.28,
        weaponAccentColor: 0xb36dff,
        trailLengthFactor: 1.34,
        leadGlowScale: 1.22
      };
    }

    if (formId === "beam-cannon-lance") {
      return {
        projectileColor: 0xfff2a0,
        trailColor: 0xffe66d,
        trailStyle: "beam" as const,
        muzzleFlashScale: 1.22,
        weaponAccentColor: 0xfff2a0,
        trailLengthFactor: 1.2,
        leadGlowScale: 1.18
      };
    }

    return {
      projectileColor: 0xa4ffe9,
      trailColor: 0xfff2a0,
      trailStyle: "beam" as const,
      muzzleFlashScale: 1.14,
      weaponAccentColor: 0xa4ffe9,
      trailLengthFactor: 1.12,
      leadGlowScale: 1.1
    };
  }

  if (weaponId === "shard-launcher") {
    if (formId === "shard-launcher-razor") {
      return {
        projectileColor: 0xe9d5ff,
        trailColor: 0xb36dff,
        trailStyle: "spark" as const,
        muzzleFlashScale: 1.18,
        weaponAccentColor: 0x62f8d1,
        trailLengthFactor: 0.78,
        leadGlowScale: 0.82
      };
    }

    if (formId === "shard-launcher-fan") {
      return {
        projectileColor: 0xc4b5fd,
        trailColor: 0x62f8d1,
        trailStyle: "streak" as const,
        muzzleFlashScale: 1.12,
        weaponAccentColor: 0xb36dff,
        trailLengthFactor: 0.72,
        leadGlowScale: 0.78
      };
    }

    return {
      projectileColor: 0xc4b5fd,
      trailColor: 0xe9d5ff,
      trailStyle: "streak" as const,
      muzzleFlashScale: 1.08,
      weaponAccentColor: 0xb36dff,
      trailLengthFactor: 0.74,
      leadGlowScale: 0.78
    };
  }

  return {
    projectileColor: 0x62f8d1,
    trailColor: 0xeafff8,
    trailStyle: "streak" as const,
    muzzleFlashScale: 1,
    weaponAccentColor: 0x62f8d1,
    trailLengthFactor: 1,
    leadGlowScale: 1
  };
}

export function getWeaponPresentationState(state: RunState): WeaponPresentationState {
  const weapon = getWeaponDisplayState(state);
  const palette = getWeaponPalette(weapon.weaponId, weapon.formId);

  return {
    ...weapon,
    ...palette
  };
}
