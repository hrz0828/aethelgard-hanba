import Phaser from "phaser";

const UI_MODE_KEY = "ui.mode";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.game.registry.set(UI_MODE_KEY, "menu");
    this.game.events.emit("show-menu");
  }
}
