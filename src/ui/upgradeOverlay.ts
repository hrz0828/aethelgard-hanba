import { UPGRADE_DEFINITIONS } from "../data/upgrades";
import { applyUpgrade } from "../game/upgrades";
import type { RunState } from "../game/types";
import type { Language } from "./locale";
import { getUiText, getUpgradeText } from "./locale";

export function showUpgradeOverlay(
  root: HTMLElement,
  state: RunState,
  language: Language,
  onSelected: () => void
): HTMLElement {
  const text = getUiText(language);
  const overlay = document.createElement("section");
  overlay.className = "upgrade-overlay";
  overlay.innerHTML = `
    <div class="upgrade-panel">
      <p class="eyebrow">${text.upgradeEyebrow(state.player.level)}</p>
      <h2>${text.upgradeTitle}</h2>
      <div class="upgrade-grid"></div>
    </div>
  `;

  const grid = overlay.querySelector<HTMLElement>(".upgrade-grid")!;

  for (const id of state.upgradeChoices) {
    if (!UPGRADE_DEFINITIONS.some((upgrade) => upgrade.id === id)) {
      continue;
    }

    const localized = getUpgradeText(language, id);

    const button = document.createElement("button");
    button.className = "upgrade-card";
    button.type = "button";
    button.innerHTML = `<strong>${localized.name}</strong><span>${localized.description}</span>`;
    button.addEventListener("click", () => {
      applyUpgrade(state, id);
      overlay.remove();
      onSelected();
    });
    grid.append(button);
  }

  root.append(overlay);

  return overlay;
}
