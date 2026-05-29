import type { RunState } from "../game/types";
import { getWeaponDisplayState } from "../game/weaponLoadout";
import { getDodgeHudState } from "./dodge";
import { getZonePointsOfInterest } from "../game/mapContent";
import type { Language, UiText } from "./locale";
import { getUiText } from "./locale";

const MAP_EVENT_TO_WEAPON_EVENT_KEY: Partial<
  Record<RunState["activeZoneEventType"], keyof UiText["weaponEvents"]>
> = {
  armory: "armory-cache",
  calibration: "calibration-station",
  relay: "power-relay",
  test: "live-test-zone"
};

function formatTime(timeMs: number): string {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function toPercent(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function getEventHudText(state: RunState, text: UiText): string {
  if (state.activeZoneEventType === "none") {
    return text.eventNone;
  }

  const weaponEventKey = MAP_EVENT_TO_WEAPON_EVENT_KEY[state.activeZoneEventType];
  const eventText = weaponEventKey
    ? text.weaponEvents[weaponEventKey]
    : text.events[state.activeZoneEventType as keyof typeof text.events];

  if (state.activeZoneEventZone !== state.currentZone) {
    return `${text.zones[state.activeZoneEventZone]} · ${eventText}`;
  }

  return eventText;
}

export function createHud(language: Language): HTMLElement {
  const text = getUiText(language);
  const element = document.createElement("section");
  element.className = "hud";
  element.setAttribute("aria-label", text.runStatusAria);
  element.innerHTML = `
    <div class="hud-row">
      <span data-time-label>${text.timeLabel}</span>
      <strong data-time>0:00</strong>
      <span data-level-label>${text.levelLabel}</span>
      <span data-level>Lv 1</span>
      <span data-kills-label>${text.killsLabel}</span>
      <span data-kills>0</span>
    </div>
    <div class="hud-row hud-row-secondary">
      <span data-zone-label>${text.zoneLabel}</span>
      <strong data-zone>${text.zones.hub}</strong>
      <span data-event-label>${text.eventLabel}</span>
      <span data-event>${text.eventNone}</span>
    </div>
    <div class="hud-row hud-row-secondary">
      <span data-map-poi-label>${text.mapPoiLabel}</span>
      <strong data-map-poi-count>0</strong>
      <span data-map-poi-hint>${text.eventNone}</span>
      <span data-map-poi-name>${text.eventNone}</span>
    </div>
    <div class="hud-row hud-row-secondary">
      <span data-weapon-title>${text.weaponHudTitle}</span>
      <strong data-weapon>${text.weaponClasses["pulse-rifle"].name}</strong>
      <span data-weapon-active-label>${text.weaponHudActiveLabel}</span>
      <span data-weapon-form>${text.weaponForms["pulse-rifle"].single!.name}</span>
    </div>
    <div class="hud-row hud-row-secondary">
      <span data-weapon-form-label>${text.weaponHudFormLabel}</span>
      <strong data-weapon-form-name>${text.weaponForms["pulse-rifle"].single!.name}</strong>
      <span data-weapon-history-label>${text.weaponHudEvolutionLabel}</span>
      <strong data-weapon-history>T0</strong>
    </div>
    <div class="hud-row hud-row-secondary">
      <span data-dodge-label>${text.dodgeLabel}</span>
      <strong data-dodge-type>${text.dodgeTypes.roll}</strong>
      <span data-dodge-state>${text.dodgeReadyLabel}</span>
      <strong data-dodge-cooldown>0.0s</strong>
    </div>
    <div class="meter dodge" aria-label="Dodge Cooldown">
      <span class="meter-label" data-dodge-meter-label>${text.dodgeCooldownLabel}</span>
      <span data-dodge-meter></span>
    </div>
    <div class="meter health" aria-label="Health">
      <span class="meter-label" data-health-label>${text.healthLabel}</span>
      <span data-health></span>
    </div>
    <div class="meter experience" aria-label="Experience">
      <span class="meter-label" data-experience-label>${text.experienceLabel}</span>
      <span data-experience></span>
    </div>
    <div class="boss-bar" hidden>
      <span class="boss-bar-label" data-boss-label>${text.bossLabel}</span>
      <strong data-boss-name>${text.bossName}</strong>
      <div class="meter boss-meter" aria-label="Boss Health">
        <span data-boss-health></span>
      </div>
    </div>
  `;

  return element;
}

export function renderHud(root: HTMLElement, state: RunState, language: Language): void {
  const text = getUiText(language);
  root.querySelector<HTMLElement>("[data-time]")!.textContent = formatTime(state.timeMs);
  root.querySelector<HTMLElement>("[data-time-label]")!.textContent = text.timeLabel;
  root.querySelector<HTMLElement>("[data-level-label]")!.textContent = text.levelLabel;
  root.querySelector<HTMLElement>("[data-level]")!.textContent =
    language === "zh" ? `${state.player.level} 级` : `Lv ${state.player.level}`;
  root.querySelector<HTMLElement>("[data-kills-label]")!.textContent = text.killsLabel;
  root.querySelector<HTMLElement>("[data-kills]")!.textContent =
    language === "zh" ? `${state.kills}` : `${state.kills}`;
  root.querySelector<HTMLElement>("[data-zone-label]")!.textContent = text.zoneLabel;
  root.querySelector<HTMLElement>("[data-zone]")!.textContent = text.zones[state.currentZone];
  root.querySelector<HTMLElement>("[data-event-label]")!.textContent = text.eventLabel;
  root.querySelector<HTMLElement>("[data-event]")!.textContent = getEventHudText(state, text);
  const activeZoneEvent = state.activeZoneEventZone === state.currentZone ? state.activeZoneEventType : "none";
  const poiList = getZonePointsOfInterest(state.currentZone, activeZoneEvent);
  root.querySelector<HTMLElement>("[data-map-poi-label]")!.textContent = text.mapPoiLabel;
  root.querySelector<HTMLElement>("[data-map-poi-count]")!.textContent = `${poiList.length}`;
  root.querySelector<HTMLElement>("[data-map-poi-hint]")!.textContent = text.zones[state.currentZone];
  root.querySelector<HTMLElement>("[data-map-poi-name]")!.textContent =
    poiList[0]?.label ?? text.eventNone;
  const weapon = getWeaponDisplayState(state);
  root.querySelector<HTMLElement>("[data-weapon-title]")!.textContent = text.weaponHudTitle;
  root.querySelector<HTMLElement>("[data-weapon-active-label]")!.textContent = text.weaponHudActiveLabel;
  root.querySelector<HTMLElement>("[data-weapon]")!.textContent = text.weaponClasses[weapon.weaponId].name;
  root.querySelector<HTMLElement>("[data-weapon-form-label]")!.textContent = text.weaponHudFormLabel;
  root.querySelector<HTMLElement>("[data-weapon-form]")!.textContent =
    text.weaponForms[weapon.weaponId][weapon.formId]!.name;
  root.querySelector<HTMLElement>("[data-weapon-form-name]")!.textContent =
    text.weaponForms[weapon.weaponId][weapon.formId]!.name;
  root.querySelector<HTMLElement>("[data-weapon-history-label]")!.textContent = text.weaponHudEvolutionLabel;
  root.querySelector<HTMLElement>("[data-weapon-history]")!.textContent = `T${state.weaponUpgradeHistory?.length ?? 0}`;
  const dodge = getDodgeHudState(state, language);
  root.querySelector<HTMLElement>("[data-dodge-label]")!.textContent = dodge.label;
  root.querySelector<HTMLElement>("[data-dodge-type]")!.textContent = dodge.type;
  root.querySelector<HTMLElement>("[data-dodge-state]")!.textContent = dodge.state;
  root.querySelector<HTMLElement>("[data-dodge-cooldown]")!.textContent = dodge.cooldownText;
  root.querySelector<HTMLElement>("[data-dodge-meter-label]")!.textContent = text.dodgeCooldownLabel;
  root.querySelector<HTMLElement>("[data-health-label]")!.textContent = text.healthLabel;
  root.querySelector<HTMLElement>("[data-experience-label]")!.textContent = text.experienceLabel;

  const activeBoss = state.enemies.find((enemy) => enemy.boss);
  const bossBar = root.querySelector<HTMLElement>(".boss-bar")!;
  const bossHealth = root.querySelector<HTMLElement>("[data-boss-health]")!;
  const bossLabel = root.querySelector<HTMLElement>("[data-boss-label]")!;
  const bossName = root.querySelector<HTMLElement>("[data-boss-name]")!;

  bossLabel.textContent = text.bossLabel;
  bossName.textContent = text.bossName;

  if (activeBoss) {
    bossBar.hidden = false;
    bossHealth.style.width = `${toPercent(activeBoss.health, activeBoss.maxHealth)}%`;
  } else {
    bossBar.hidden = true;
    bossHealth.style.width = "0%";
  }

  root.querySelector<HTMLElement>("[data-health]")!.style.width =
    `${toPercent(state.player.health, state.player.maxHealth)}%`;
  root.querySelector<HTMLElement>("[data-experience]")!.style.width =
    `${toPercent(state.player.experience, state.player.experienceToNext)}%`;
  root.querySelector<HTMLElement>("[data-dodge-meter]")!.style.width = `${dodge.progressPercent}%`;
}
