import type { SfxCue, SfxCueType } from "../game/types";

interface CueShape {
  waveform: OscillatorType;
  startFrequency: number;
  endFrequency: number;
  durationMs: number;
  gain: number;
}

function getCueShape(type: SfxCueType): CueShape {
  switch (type) {
    case "shot":
      return { waveform: "square", startFrequency: 760, endFrequency: 1040, durationMs: 55, gain: 0.032 };
    case "enemy-hit":
      return { waveform: "triangle", startFrequency: 340, endFrequency: 200, durationMs: 70, gain: 0.03 };
    case "player-hit":
      return { waveform: "sawtooth", startFrequency: 210, endFrequency: 92, durationMs: 100, gain: 0.042 };
    case "kill":
      return { waveform: "triangle", startFrequency: 520, endFrequency: 980, durationMs: 110, gain: 0.04 };
    case "boss-spawn":
      return { waveform: "sawtooth", startFrequency: 140, endFrequency: 55, durationMs: 420, gain: 0.05 };
    case "zone-supply":
      return { waveform: "sine", startFrequency: 640, endFrequency: 980, durationMs: 130, gain: 0.022 };
    case "zone-hazard":
      return { waveform: "square", startFrequency: 240, endFrequency: 150, durationMs: 170, gain: 0.028 };
    case "zone-wave":
      return { waveform: "triangle", startFrequency: 420, endFrequency: 260, durationMs: 180, gain: 0.026 };
    case "victory":
      return { waveform: "triangle", startFrequency: 520, endFrequency: 880, durationMs: 180, gain: 0.034 };
    case "defeat":
      return { waveform: "sawtooth", startFrequency: 260, endFrequency: 88, durationMs: 220, gain: 0.034 };
    default:
      return { waveform: "sine", startFrequency: 440, endFrequency: 440, durationMs: 80, gain: 0.02 };
  }
}

function createAudioContext(): AudioContext | null {
  const contextCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!contextCtor) {
    return null;
  }

  return new contextCtor();
}

function playTone(context: AudioContext, cue: SfxCue): void {
  const shape = getCueShape(cue.type);
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = shape.waveform;
  oscillator.frequency.setValueAtTime(shape.startFrequency, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(40, shape.endFrequency),
    context.currentTime + shape.durationMs / 1000
  );

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, shape.gain * cue.intensity), context.currentTime + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + shape.durationMs / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + shape.durationMs / 1000 + 0.03);
}

export class SynthAudio {
  private context: AudioContext | null = null;
  private unlocked = false;

  async resume(): Promise<void> {
    if (!this.context) {
      this.context = createAudioContext();
    }

    if (!this.context) {
      return;
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.unlocked = true;
  }

  play(cue: SfxCue): void {
    if (!this.context || !this.unlocked) {
      return;
    }

    if (cue.type === "victory" || cue.type === "defeat") {
      const now = this.context.currentTime;
      const shape = getCueShape(cue.type);
      const notes = cue.type === "victory" ? [0, 5, 9] : [0, -3, -7];

      for (let index = 0; index < notes.length; index += 1) {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        const offset = index * 0.11;
        const startFrequency = shape.startFrequency * Math.pow(2, notes[index] / 12);
        const endFrequency = shape.endFrequency * Math.pow(2, notes[index] / 12);

        oscillator.type = shape.waveform;
        oscillator.frequency.setValueAtTime(startFrequency, now + offset);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + offset + shape.durationMs / 1000);
        gainNode.gain.setValueAtTime(0.0001, now + offset);
        gainNode.gain.exponentialRampToValueAtTime(
          Math.max(0.0001, shape.gain * cue.intensity),
          now + offset + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + offset + shape.durationMs / 1000);
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        oscillator.start(now + offset);
        oscillator.stop(now + offset + shape.durationMs / 1000 + 0.03);
      }

      return;
    }

    playTone(this.context, cue);
  }
}
