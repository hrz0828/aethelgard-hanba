import { describe, expect, it } from "vitest";
import { WEAPON_DEFINITIONS, getWeaponDefinition } from "../../src/data/weapons";
import { getUiText } from "../../src/ui/locale";
import type { RunState } from "../../src/game/types";

describe("weapon data model", () => {
  it("defines four weapon classes with at least one form each", () => {
    expect(WEAPON_DEFINITIONS).toHaveLength(4);
    expect(WEAPON_DEFINITIONS.map((weapon) => weapon.id)).toEqual([
      "pulse-rifle",
      "arc-gun",
      "beam-cannon",
      "shard-launcher"
    ]);

    for (const weapon of WEAPON_DEFINITIONS) {
      expect(weapon.forms.length).toBeGreaterThanOrEqual(1);
      expect(getWeaponDefinition(weapon.id)).toEqual(weapon);
    }
  });

  it("exposes bilingual weapon HUD labels and weapon event names", () => {
    expect(getUiText("zh").weaponHudTitle).toBe("武器");
    expect(getUiText("en").weaponHudTitle).toBe("Weapons");
    expect(getUiText("zh").weaponHudActiveLabel).toBe("当前武器");
    expect(getUiText("en").weaponHudActiveLabel).toBe("Active weapon");
    expect(getUiText("zh").weaponEvents["armory-cache"]).toBe("军械箱");
    expect(getUiText("en").weaponEvents["armory-cache"]).toBe("Armory Cache");
    expect(getUiText("zh").weaponEvents["live-test-zone"]).toBe("实战测试区");
    expect(getUiText("en").weaponEvents["live-test-zone"]).toBe("Live Test Zone");
    expect(getUiText("zh").weaponClasses["shard-launcher"].name).toBe("裂片发射器");
    expect(getUiText("en").weaponClasses["shard-launcher"].name).toBe("Shard Launcher");
  });

  it("extends run state with active weapon tracking fields", () => {
    type ActiveWeaponId = RunState["activeWeaponId"];
    type ActiveWeaponFormId = RunState["activeWeaponFormId"];
    type WeaponUpgradeHistoryEntry = NonNullable<RunState["weaponUpgradeHistory"]>[number];

    const snapshot: Pick<
      RunState,
      "activeWeaponId" | "activeWeaponFormId" | "weaponUpgradeHistory"
    > = {
      activeWeaponId: "pulse-rifle" as ActiveWeaponId,
      activeWeaponFormId: "pulse-rifle-burst" as ActiveWeaponFormId,
      weaponUpgradeHistory: [
        {
          weaponId: "pulse-rifle",
          formId: "pulse-rifle-burst",
          level: 1
        } satisfies WeaponUpgradeHistoryEntry
      ]
    };

    expect(snapshot.weaponUpgradeHistory).toHaveLength(1);
  });
});
