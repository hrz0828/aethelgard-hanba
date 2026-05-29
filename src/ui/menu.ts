import type { Language } from "./locale";
import { getUiText } from "./locale";
import { renderRoster } from "./roster";
import type { CharacterId } from "../game/characters";
import type { MetaSave } from "../meta/progression";

export interface ResultSummary {
  result: "won" | "lost";
  timeMs: number;
  level: number;
  kills: number;
  shardsEarned: number;
  totalShards: number;
  unlockedCharacterCount: number;
}

export interface StartMenuCallbacks {
  onStart: () => void;
  onSelectCharacter: (characterId: CharacterId) => void;
  onUnlockCharacter: (characterId: CharacterId) => void;
}

function formatTime(timeMs: number): string {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function showStartMenu(
  root: HTMLElement,
  language: Language,
  save: Pick<MetaSave, "shards" | "unlockedCharacterIds" | "selectedCharacterId">,
  callbacks: StartMenuCallbacks
): void {
  const text = getUiText(language);
  root.innerHTML = `
    <main class="menu-shell">
      <p class="eyebrow">${text.startMenuEyebrow}</p>
      <h1>${text.startMenuTitle}</h1>
      <p class="menu-copy">${text.startMenuCopy}</p>
      <div data-roster-root></div>
      <button class="primary-button" data-start type="button">${text.startButton}</button>
    </main>
  `;

  const rosterRoot = root.querySelector<HTMLElement>("[data-roster-root]")!;
  renderRoster(rosterRoot, language, save, {
    onSelectCharacter: callbacks.onSelectCharacter,
    onUnlockCharacter: callbacks.onUnlockCharacter
  });
  root.querySelector<HTMLButtonElement>("[data-start]")!.addEventListener("click", callbacks.onStart);
}

export function showResult(root: HTMLElement, language: Language, result: ResultSummary, onRestart: () => void): void {
  const text = getUiText(language);
  root.innerHTML = `
    <main class="menu-shell">
      <p class="eyebrow">${result.result === "won" ? text.resultWonEyebrow : text.resultLostEyebrow}</p>
      <h1>${result.result === "won" ? text.resultWonTitle : text.resultLostTitle}</h1>
      <p class="menu-copy">${text.resultCopy(formatTime(result.timeMs), result.level, result.kills)}</p>
      <div class="result-summary">
        <div>
          <span data-result-shards-earned-label>${text.resultShardsEarnedLabel}</span>
          <strong data-result-shards-earned>${result.shardsEarned}</strong>
        </div>
        <div>
          <span data-result-shards-total-label>${text.resultShardsTotalLabel}</span>
          <strong data-result-shards-total>${result.totalShards}</strong>
        </div>
        <div>
          <span data-result-unlocked-characters-label>${text.resultUnlockedCharactersLabel}</span>
          <strong data-result-unlocked-characters>${result.unlockedCharacterCount}</strong>
        </div>
      </div>
      <button class="primary-button" data-restart type="button">${text.restartButton}</button>
    </main>
  `;

  root.querySelector<HTMLButtonElement>("[data-restart]")!.addEventListener("click", onRestart);
}
