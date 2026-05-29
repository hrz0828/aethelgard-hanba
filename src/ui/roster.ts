import { CHARACTER_IDS, CHARACTER_UNLOCK_COSTS, getCharacterPreset, type CharacterId } from "../game/characters";
import type { MetaSave } from "../meta/progression";
import type { Language } from "./locale";
import { getUiText } from "./locale";

export const ROSTER_UNLOCK_COSTS: Record<CharacterId, number> = CHARACTER_UNLOCK_COSTS;

export interface RosterCardView {
  id: CharacterId;
  name: string;
  description: string;
  unlocked: boolean;
  selected: boolean;
  stateLabel: string;
  actionLabel: string;
  actionType: "select" | "unlock" | "selected";
  cost: number;
}

export interface RosterViewModel {
  title: string;
  shardsLabel: string;
  shards: number;
  cards: RosterCardView[];
}

export interface RosterHandlers {
  onSelectCharacter(id: CharacterId): void;
  onUnlockCharacter(id: CharacterId): void;
}

export function getRosterUnlockCost(characterId: CharacterId): number {
  return ROSTER_UNLOCK_COSTS[characterId];
}

export function createRosterViewModel(
  language: Language,
  save: Pick<MetaSave, "shards" | "unlockedCharacterIds" | "selectedCharacterId">
): RosterViewModel {
  const text = getUiText(language);

  return {
    title: text.rosterTitle,
    shardsLabel: text.rosterShardsLabel,
    shards: save.shards,
    cards: CHARACTER_IDS.map((id) => {
      const preset = getCharacterPreset(id);
      const localized = text.rosterCharacters[id];
      const unlocked = save.unlockedCharacterIds.includes(id);
      const selected = save.selectedCharacterId === id;
      const stateLabel = selected
        ? text.rosterSelectedLabel
        : unlocked
          ? text.rosterUnlockedLabel
          : text.rosterLockedLabel;
      const actionType = selected ? "selected" : unlocked ? "select" : "unlock";
      const actionLabel =
        actionType === "selected"
          ? text.rosterSelectedButton
          : actionType === "select"
            ? text.rosterSelectButton
            : language === "zh"
              ? `解锁 ${getRosterUnlockCost(id)}`
              : `Unlock ${getRosterUnlockCost(id)}`;

      return {
        id,
        name: localized?.name ?? preset.label,
        description: localized?.description ?? preset.description,
        unlocked,
        selected,
        stateLabel,
        actionLabel,
        actionType,
        cost: getRosterUnlockCost(id)
      };
    })
  };
}

export function renderRoster(
  root: HTMLElement,
  language: Language,
  save: Pick<MetaSave, "shards" | "unlockedCharacterIds" | "selectedCharacterId">,
  handlers: RosterHandlers
): HTMLElement {
  const view = createRosterViewModel(language, save);
  const text = getUiText(language);
  const section = document.createElement("section");
  section.className = "roster-shell";
  section.innerHTML = `
    <div class="roster-header">
      <div>
        <h2 class="eyebrow" data-roster-title>${view.title}</h2>
        <p class="menu-copy">${text.rosterIntro}</p>
      </div>
      <div class="roster-shards">
        <span>${view.shardsLabel}</span>
        <strong data-shards>${view.shards}</strong>
      </div>
    </div>
    <div class="roster-grid"></div>
  `;

  const grid = section.querySelector<HTMLElement>(".roster-grid")!;

  for (const card of view.cards) {
    const article = document.createElement("article");
    article.className = `roster-card roster-card-${card.actionType}`;
    article.dataset.character = card.id;
    article.dataset.state = card.actionType;
    article.innerHTML = `
      <div class="roster-card-top">
        <strong>${card.name}</strong>
        <span>${card.stateLabel}</span>
      </div>
      <p>${card.description}</p>
      <button type="button" data-action="${card.actionType}" ${card.actionType === "selected" ? "disabled" : ""}>
        ${card.actionLabel}
      </button>
    `;

    const actionButton = article.querySelector<HTMLButtonElement>("[data-action]")!;
    if (card.actionType === "select") {
      actionButton.addEventListener("click", () => handlers.onSelectCharacter(card.id));
    } else if (card.actionType === "unlock") {
      actionButton.addEventListener("click", () => handlers.onUnlockCharacter(card.id));
    }

    grid.append(article);
  }

  root.replaceChildren(section);
  return section;
}
