import type { RunState } from "../game/types";
import { getUiText, type Language } from "./locale";

export interface DodgeHudState {
  label: string;
  type: string;
  state: string;
  cooldownText: string;
  progressPercent: number;
}

export interface DodgeSkillButtonState {
  iconLabel: RunState["player"]["dodge"]["type"];
  cooldownText: string;
  ready: boolean;
}

function toPercent(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function getDodgeHudState(state: RunState, language: Language): DodgeHudState {
  const text = getUiText(language);
  const dodge = state.player.dodge;
  const cooldownText =
    dodge.cooldownRemainingMs <= 0 ? text.dodgeReadyLabel : `${(dodge.cooldownRemainingMs / 1000).toFixed(1)}s`;

  return {
    label: text.dodgeLabel,
    type: text.dodgeTypes[dodge.type],
    state: dodge.cooldownRemainingMs <= 0 ? text.dodgeReadyLabel : text.dodgeCooldownLabel,
    cooldownText,
    progressPercent: toPercent(dodge.cooldownRemainingMs, dodge.cooldownMs)
  };
}

export function getDodgeSkillButtonState(state: RunState): DodgeSkillButtonState {
  const dodge = state.player.dodge;
  const ready = dodge.cooldownRemainingMs <= 0;

  return {
    iconLabel: dodge.type,
    cooldownText: ready ? "" : `${(dodge.cooldownRemainingMs / 1000).toFixed(1)}s`,
    ready
  };
}
