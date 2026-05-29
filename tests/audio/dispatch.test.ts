import { describe, expect, it } from "vitest";
import { consumeSfxEvents } from "../../src/audio/dispatch";
import { createRunState } from "../../src/game/state";

describe("sfx dispatch", () => {
  it("plays queued cues in order and clears the queue", () => {
    const state = createRunState();
    state.sfxEvents.push(
      { type: "shot", intensity: 0.8 },
      { type: "kill", intensity: 1.2 },
      { type: "victory", intensity: 1.4 }
    );

    const played: Array<string> = [];

    consumeSfxEvents(state, {
      play(cue) {
        played.push(`${cue.type}:${cue.intensity}`);
      }
    });

    expect(played).toEqual(["shot:0.8", "kill:1.2", "victory:1.4"]);
    expect(state.sfxEvents).toEqual([]);
  });
});
