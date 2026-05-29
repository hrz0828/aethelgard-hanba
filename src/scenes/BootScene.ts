import Phaser from "phaser";
import { preloadGameAssets } from "../game/assets";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    preloadGameAssets(this.load);
  }

  create(): void {
    this.scene.start("MenuScene");
  }
}
