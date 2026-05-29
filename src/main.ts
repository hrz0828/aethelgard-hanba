import Phaser from "phaser";
import "./styles.css";
import { SynthAudio } from "./audio/synth";
import { BootScene } from "./scenes/BootScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { GameScene } from "./scenes/GameScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameUiController } from "./ui/appController";
import { normalizeLanguage } from "./ui/locale";

interface HotImportMeta {
  hot?: {
    dispose(callback: () => void): void;
  };
}

declare global {
  interface Window {
    __neonRelicGame?: Phaser.Game;
  }
}

const ui = document.querySelector<HTMLElement>("#ui");

if (!ui) {
  throw new Error("Missing #ui root");
}

const uiChrome = document.createElement("div");
uiChrome.className = "ui-chrome";
const uiContent = document.createElement("div");
uiContent.className = "ui-content";
ui.append(uiChrome, uiContent);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#070914",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
});

window.__neonRelicGame = game;

const controller = new GameUiController(
  game,
  uiChrome,
  uiContent,
  new SynthAudio(),
  normalizeLanguage(window.localStorage.getItem("ui.language"))
);

function destroyGame(): void {
  controller.destroy();
  game.destroy(true);
}

window.addEventListener("beforeunload", destroyGame);

const hot = (import.meta as ImportMeta & HotImportMeta).hot;

if (hot) {
  hot.dispose(() => {
    window.removeEventListener("beforeunload", destroyGame);
    if (window.__neonRelicGame === game) {
      delete window.__neonRelicGame;
    }
    destroyGame();
  });
}
