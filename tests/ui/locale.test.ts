import { describe, expect, it } from "vitest";
import { getUiText, getUpgradeText, normalizeLanguage } from "../../src/ui/locale";
import { createRunState } from "../../src/game/state";
import { getEventHudText } from "../../src/ui/hud";

describe("ui locale", () => {
  it("returns Chinese and English copy from the same source", () => {
    expect(getUiText("zh").startButton).toBe("开始游戏");
    expect(getUiText("en").startButton).toBe("Start Run");
    expect(getUiText("zh").upgradeTitle).toBe("选择一个强化");
    expect(getUiText("en").upgradeTitle).toBe("Choose an Upgrade");
    expect(getUiText("zh").mainMenuButton).toBe("返回首页");
    expect(getUiText("en").mainMenuButton).toBe("Main Menu");
  });

  it("returns localized upgrade text", () => {
    expect(getUpgradeText("zh", "damage")).toEqual({
      name: "棱镜弹头",
      description: "武器伤害 +18%"
    });
    expect(getUpgradeText("en", "damage")).toEqual({
      name: "Prism Rounds",
      description: "+18% weapon damage"
    });
  });

  it("returns localized weapon form labels", () => {
    expect(getUiText("zh").weaponForms["pulse-rifle"]["pulse-rifle-burst"]!.name).toBe("连发模组");
    expect(getUiText("en").weaponForms["beam-cannon"]["beam-cannon-prism"]!.name).toBe("Prism Splitter");
    expect(getUiText("zh").weaponForms["shard-launcher"]["shard-launcher-fan"]!.name).toBe("扇形弹仓");
    expect(getUiText("en").weaponForms["shard-launcher"]["shard-launcher-razor"]!.name).toBe("Razor Core");
    expect(getUiText("zh").weaponHudEvolutionLabel).toBe("进化层级");
    expect(getUiText("en").weaponHudEvolutionLabel).toBe("Evolution tier");
    expect(getUiText("zh").mapPoiLabel).toBe("武器据点");
    expect(getUiText("en").mapPoiLabel).toBe("Weapon POIs");
  });

  it("returns localized dodge labels", () => {
    expect(getUiText("zh").dodgeLabel).toBe("闪避");
    expect(getUiText("en").dodgeTypes["shield-step"]).toBe("Shield Step");
  });

  it("defaults to English when language is unknown", () => {
    expect(normalizeLanguage("zh")).toBe("zh");
    expect(normalizeLanguage("en")).toBe("en");
    expect(normalizeLanguage("fr")).toBe("zh");
    expect(normalizeLanguage(null)).toBe("zh");
  });

  it("shows the active event zone in HUD text when the event is elsewhere", () => {
    const state = createRunState();
    const text = getUiText("en");

    state.currentZone = "east";
    state.activeZoneEventZone = "west";
    state.activeZoneEventType = "relay";

    expect(getEventHudText(state, text)).toBe("West District · Power Relay");

    state.activeZoneEventZone = "east";
    expect(getEventHudText(state, text)).toBe("Power Relay");

    state.activeZoneEventType = "none";
    expect(getEventHudText(state, text)).toBe("None");
  });
});
