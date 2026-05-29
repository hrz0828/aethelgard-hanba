import type { RunState, SfxCueType } from "./types";

export function queueSfxCue(state: RunState, type: SfxCueType, intensity = 1): void {
  state.sfxEvents.push({ type, intensity });
}
