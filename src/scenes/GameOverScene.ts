import Phaser from "phaser";

const UI_MODE_KEY = "ui.mode";
const UI_RESULT_KEY = "ui.result";

export interface GameOverSceneData {
  result: "won" | "lost";
  timeMs: number;
  level: number;
  kills: number;
  bossDefeated: boolean;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  create(data: GameOverSceneData): void {
    this.game.registry.set(UI_MODE_KEY, "result");
    this.game.registry.set(UI_RESULT_KEY, data);
    this.game.events.emit("show-result", data);
  }
}
