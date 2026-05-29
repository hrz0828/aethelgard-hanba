import type { RunState, SfxCue } from "../game/types";

export interface SfxPlayer {
  play(cue: SfxCue): void;
}

export function consumeSfxEvents(state: RunState, player: SfxPlayer): void {
  if (state.sfxEvents.length === 0) {
    return;
  }

  const cues = state.sfxEvents.splice(0, state.sfxEvents.length);

  for (const cue of cues) {
    player.play(cue);
  }
}
