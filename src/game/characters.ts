import type { RunState } from "./types";
import { createPlayerDodgeState, getCharacterDodgeProfile } from "./dodge";
import { TEXTURE_KEYS } from "./assets";

export type CharacterId = "soldier" | "scout" | "heavy" | "scavenger" | "vanguard";

export interface CharacterPreset {
  id: CharacterId;
  label: string;
  description: string;
}

export interface CharacterPresentation {
  tint: number;
  accentTint: number;
}

export interface CharacterSpritePresentation {
  textureKey: string;
  frame?: string;
  displayScale: number;
}

export type CharacterAnimationState = "idle" | "move" | "attack" | "dodge";

const BASE_PRESET: CharacterPreset = {
  id: "soldier",
  label: "Soldier",
  description: "Balanced baseline"
};

const CHARACTER_PRESETS: Record<CharacterId, CharacterPreset> = {
  soldier: BASE_PRESET,
  scout: {
    id: "scout",
    label: "Scout",
    description: "Faster movement, lower health"
  },
  heavy: {
    id: "heavy",
    label: "Heavy",
    description: "Higher health, slower movement"
  },
  scavenger: {
    id: "scavenger",
    label: "Scavenger",
    description: "Larger pickup radius, stronger XP gain"
  },
  vanguard: {
    id: "vanguard",
    label: "Vanguard",
    description: "Heavier armor, slower pace"
  }
};

const CHARACTER_PRESENTATIONS: Record<CharacterId, CharacterPresentation> = {
  soldier: { tint: 0xffffff, accentTint: 0x62f8d1 },
  scout: { tint: 0xd8ffd4, accentTint: 0xa4ffe9 },
  heavy: { tint: 0xa7c4ff, accentTint: 0x69a7ff },
  scavenger: { tint: 0xffe66d, accentTint: 0xf4fbff },
  vanguard: { tint: 0xffc84d, accentTint: 0xfff2a0 }
};

const CHARACTER_SPRITE_KEYS: Record<CharacterId, string> = {
  soldier: "soldier1_stand.png",
  scout: "womanGreen_stand.png",
  heavy: "robot1_stand.png",
  scavenger: "survivor1_stand.png",
  vanguard: "hitman1_stand.png"
};

export const CHARACTER_IDS: CharacterId[] = ["soldier", "scout", "heavy", "scavenger", "vanguard"];
export const SELECTED_CHARACTER_KEY = "selectedCharacterId";
export const CHARACTER_UNLOCK_COSTS: Record<CharacterId, number> = {
  soldier: 0,
  scout: 12,
  heavy: 14,
  scavenger: 16,
  vanguard: 20
};

export function getCharacterPreset(id?: string | null): CharacterPreset {
  if (id && id in CHARACTER_PRESETS) {
    return CHARACTER_PRESETS[id as CharacterId];
  }

  return BASE_PRESET;
}

export function applyCharacterPreset(state: RunState, id?: string | null): CharacterPreset {
  const preset = getCharacterPreset(id);

  state.player.speed = 245;
  state.player.maxHealth = 100;
  state.player.health = 100;
  state.player.pickupRadius = 86;
  state.player.experienceGainMultiplier = 1;

  if (preset.id === "scout") {
    state.player.speed = 280;
    state.player.maxHealth = 90;
    state.player.health = Math.min(state.player.health, state.player.maxHealth);
  } else if (preset.id === "heavy") {
    state.player.speed = 215;
    state.player.maxHealth = 125;
    state.player.health = state.player.maxHealth;
  } else if (preset.id === "scavenger") {
    state.player.pickupRadius = 118;
    state.player.experienceGainMultiplier = 1.2;
  } else if (preset.id === "vanguard") {
    state.player.speed = 230;
    state.player.maxHealth = 115;
    state.player.health = state.player.maxHealth;
    state.player.invulnerableMs = 450;
  }

  state.player.health = Math.min(state.player.health, state.player.maxHealth);
  state.player.dodge = createPlayerDodgeState(getCharacterDodgeProfile(preset.id));

  return preset;
}

export function getCharacterPresentation(id: CharacterId): CharacterPresentation {
  return CHARACTER_PRESENTATIONS[id];
}

export function getCharacterSpriteKey(id: CharacterId): string {
  return CHARACTER_SPRITE_KEYS[id];
}

export function getCharacterSpritePresentation(id: CharacterId): CharacterSpritePresentation {
  if (id === "scout") {
    return {
      textureKey: TEXTURE_KEYS.characterScoutV2,
      displayScale: 3.2
    };
  }

  if (id === "heavy") {
    return {
      textureKey: TEXTURE_KEYS.characterHeavyV2,
      displayScale: 3.35
    };
  }

  return {
    textureKey: TEXTURE_KEYS.characterAtlas,
    frame: getCharacterSpriteKey(id),
    displayScale: 2.8
  };
}

export function getCharacterAnimationPresentation(
  id: CharacterId,
  state: CharacterAnimationState
): CharacterSpritePresentation {
  if (id === "scout") {
    const textureByState: Record<CharacterAnimationState, string> = {
      idle: TEXTURE_KEYS.characterScoutIdleV1,
      move: TEXTURE_KEYS.characterScoutMoveV1,
      attack: TEXTURE_KEYS.characterScoutAttackV1,
      dodge: TEXTURE_KEYS.characterScoutDodgeV1
    };

    return {
      textureKey: textureByState[state],
      displayScale: 3.45
    };
  }

  if (id === "heavy") {
    const textureByState: Record<CharacterAnimationState, string> = {
      idle: TEXTURE_KEYS.characterHeavyIdleV1,
      move: TEXTURE_KEYS.characterHeavyMoveV1,
      attack: TEXTURE_KEYS.characterHeavyAttackV1,
      dodge: TEXTURE_KEYS.characterHeavyDodgeV1
    };

    return {
      textureKey: textureByState[state],
      displayScale: 3.65
    };
  }

  return getCharacterSpritePresentation(id);
}
