import Phaser from "phaser";
import { consumeSfxEvents } from "../audio/dispatch";
import { SynthAudio } from "../audio/synth";
import { calculateRelicShards, loadMetaSave, saveMetaSave, unlockCharacter } from "../meta/progression";
import { SELECTED_CHARACTER_KEY } from "../game/characters";
import type { MovementInput } from "../game/input";
import type { RunState } from "../game/types";
import { createHud, renderHud } from "./hud";
import { createJoystick, renderJoystickDodgeIcon } from "./joystick";
import { getUiText, type Language } from "./locale";
import { getRosterUnlockCost } from "./roster";
import { showResult, showStartMenu, type ResultSummary } from "./menu";
import { showUpgradeOverlay } from "./upgradeOverlay";
import type { GameOverSceneData } from "../scenes/GameOverScene";

const UI_MODE_KEY = "ui.mode";
const UI_RESULT_KEY = "ui.result";

export class GameUiController {
  private languageButton: HTMLButtonElement;
  private language: Language;
  private metaSave = loadMetaSave();
  private hud: HTMLElement | undefined;
  private joystick: HTMLElement | undefined;
  private upgradeOverlay: HTMLElement | undefined;
  private upgradeOpen = false;
  private currentMode: "menu" | "game" | "result" = "menu";
  private currentRunState: RunState | undefined;
  private currentResult: ResultSummary | undefined;
  private audioUnlocked = false;
  private joystickInput: MovementInput = { x: 0, y: 0, dodgePressed: false };

  constructor(
    private readonly game: Phaser.Game,
    private readonly uiChrome: HTMLElement,
    private readonly uiContent: HTMLElement,
    private readonly audio: SynthAudio,
    language: Language
  ) {
    this.language = language;
    this.languageButton = document.createElement("button");
    this.languageButton.type = "button";
    this.languageButton.className = "language-toggle";
    this.languageButton.addEventListener("click", () => {
      this.setLanguage(this.language === "zh" ? "en" : "zh");
    });
    this.uiChrome.append(this.languageButton);
    this.languageButton.textContent = getUiText(this.language).languageToggle;

    window.addEventListener("pointerdown", this.unlockAudio, { passive: true, capture: true });
    window.addEventListener("keydown", this.unlockAudio, { passive: true, capture: true });
    window.addEventListener("touchstart", this.unlockAudio, { passive: true, capture: true });

    this.game.events.on("show-menu", this.renderMenu, this);
    this.game.events.on("run-started", this.handleRunStarted, this);
    this.game.events.on("run-updated", this.handleRunUpdated, this);
    this.game.events.on("show-result", this.handleShowResult, this);

    this.syncUiFromRegistry();
  }

  destroy(): void {
    window.removeEventListener("pointerdown", this.unlockAudio, true);
    window.removeEventListener("keydown", this.unlockAudio, true);
    window.removeEventListener("touchstart", this.unlockAudio, true);
  }

  private clearContent(): void {
    this.uiContent.replaceChildren();
  }

  private unlockAudio = (): void => {
    if (this.audioUnlocked) {
      return;
    }

    this.audioUnlocked = true;
    void this.audio.resume();
  };

  private setLanguage(nextLanguage: Language): void {
    this.language = nextLanguage;
    window.localStorage.setItem("ui.language", nextLanguage);
    this.languageButton.textContent = getUiText(this.language).languageToggle;
    this.rerenderCurrentUi();
  }

  private resetGameplayUi(): void {
    this.upgradeOpen = false;
    this.upgradeOverlay?.remove();
    this.upgradeOverlay = undefined;
    this.hud = undefined;
    this.joystick = undefined;
    this.joystickInput = { x: 0, y: 0, dodgePressed: false };
    this.game.registry.set("joystick", this.joystickInput);
  }

  private renderMenu(): void {
    this.currentMode = "menu";
    this.currentRunState = undefined;
    this.currentResult = undefined;
    this.resetGameplayUi();
    this.clearContent();
    this.game.registry.set(SELECTED_CHARACTER_KEY, this.metaSave.selectedCharacterId);
    this.game.registry.remove(UI_RESULT_KEY);
    showStartMenu(this.uiContent, this.language, this.metaSave, {
      onStart: () => {
        this.game.registry.set(SELECTED_CHARACTER_KEY, this.metaSave.selectedCharacterId);
        this.game.scene.start("GameScene");
      },
      onSelectCharacter: (characterId) => {
        this.metaSave.selectedCharacterId = characterId;
        this.game.registry.set(SELECTED_CHARACTER_KEY, characterId);
        saveMetaSave(this.metaSave);
        this.renderMenu();
      },
      onUnlockCharacter: (characterId) => {
        if (unlockCharacter(this.metaSave, characterId, getRosterUnlockCost(characterId))) {
          saveMetaSave(this.metaSave);
          this.game.registry.set(SELECTED_CHARACTER_KEY, this.metaSave.selectedCharacterId);
          this.renderMenu();
        }
      }
    });
  }

  private renderGameHud(): void {
    if (!this.currentRunState) {
      return;
    }

    if (!this.hud) {
      this.hud = createHud(this.language);
    }

    renderHud(this.hud, this.currentRunState, this.language);
    if (this.joystick) {
      renderJoystickDodgeIcon(this.joystick, this.currentRunState);
    }
  }

  private renderCurrentUpgradeOverlay(): void {
    if (!this.currentRunState || this.currentRunState.status !== "choosing-upgrade") {
      return;
    }

    if (this.upgradeOverlay) {
      this.upgradeOverlay.remove();
    }

    this.upgradeOpen = true;
    this.upgradeOverlay = showUpgradeOverlay(this.uiContent, this.currentRunState, this.language, () => {
      this.upgradeOpen = false;
      this.upgradeOverlay = undefined;
    });
  }

  private renderResult(result: ResultSummary): void {
    this.currentMode = "result";
    this.currentResult = result;
    this.resetGameplayUi();
    this.clearContent();
    showResult(this.uiContent, this.language, result, {
      onRestart: () => {
        this.game.registry.set(SELECTED_CHARACTER_KEY, this.metaSave.selectedCharacterId);
        this.game.scene.start("GameScene");
      },
      onMainMenu: () => {
        this.game.scene.start("MenuScene");
      }
    });
  }

  private rerenderCurrentUi(): void {
    this.languageButton.textContent = getUiText(this.language).languageToggle;

    if (this.currentMode === "menu") {
      this.renderMenu();
      return;
    }

    if (this.currentMode === "result" && this.currentResult) {
      this.renderResult(this.currentResult);
      return;
    }

    if (this.currentMode === "game") {
      this.renderGameHud();

      if (this.currentRunState?.status === "choosing-upgrade") {
        this.renderCurrentUpgradeOverlay();
      } else if (this.upgradeOverlay) {
        this.upgradeOverlay.remove();
        this.upgradeOverlay = undefined;
        this.upgradeOpen = false;
      }
    }
  }

  private syncUiFromRegistry(): void {
    const mode = this.game.registry.get(UI_MODE_KEY) as "menu" | "game" | "result" | undefined;

    if (mode === "result") {
      const result = this.game.registry.get(UI_RESULT_KEY) as ResultSummary | undefined;
      if (result) {
        this.renderResult(result);
        return;
      }
    }

    this.renderMenu();
  }

  private handleRunStarted(): void {
    this.currentMode = "game";
    this.currentRunState = undefined;
    this.currentResult = undefined;
    this.clearContent();
    this.upgradeOpen = false;
    this.upgradeOverlay?.remove();
    this.upgradeOverlay = undefined;
    this.hud = createHud(this.language);
    this.uiContent.append(this.hud);
    this.joystick = createJoystick(
      (input: MovementInput) => {
        this.joystickInput = { x: input.x, y: input.y, dodgePressed: false };
        this.game.registry.set("joystick", this.joystickInput);
      },
      () => {
        this.joystickInput = { ...this.joystickInput, dodgePressed: true };
        this.game.registry.set("joystick", this.joystickInput);
      }
    );
    this.uiContent.append(this.joystick);
    this.joystickInput = { x: 0, y: 0, dodgePressed: false };
    this.game.registry.set("joystick", this.joystickInput);
  }

  private handleRunUpdated(state: RunState): void {
    this.currentRunState = state;
    this.renderGameHud();
    consumeSfxEvents(state, this.audio);

    if (state.status === "choosing-upgrade" && !this.upgradeOpen) {
      this.renderCurrentUpgradeOverlay();
    } else if (state.status !== "choosing-upgrade" && this.upgradeOverlay) {
      this.upgradeOverlay.remove();
      this.upgradeOverlay = undefined;
      this.upgradeOpen = false;
    }
  }

  private handleShowResult(result: GameOverSceneData): void {
    const shardsEarned = calculateRelicShards(result);
    this.metaSave.shards = Math.max(0, Math.floor(this.metaSave.shards + shardsEarned));
    saveMetaSave(this.metaSave);

    const summary: ResultSummary = {
      result: result.result,
      timeMs: result.timeMs,
      level: result.level,
      kills: result.kills,
      shardsEarned,
      totalShards: this.metaSave.shards,
      unlockedCharacterCount: this.metaSave.unlockedCharacterIds.length
    };

    this.game.registry.set(UI_RESULT_KEY, summary);
    this.renderResult(summary);
  }
}
