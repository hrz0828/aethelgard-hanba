import { describe, expect, it } from "vitest";
import { createDefaultMetaSave } from "../../src/meta/progression";
import { createRosterViewModel } from "../../src/ui/roster";

describe("roster ui", () => {
  it("describes locked, unlocked, and selected characters", () => {
    const save = createDefaultMetaSave();
    save.shards = 18;
    save.unlockedCharacterIds = ["soldier", "scout"];
    save.selectedCharacterId = "scout";

    const view = createRosterViewModel("zh", save);

    expect(view.title).toBe("角色库");
    expect(view.shardsLabel).toBe("遗物碎片");
    expect(view.shards).toBe(18);
    expect(view.cards).toHaveLength(5);

    const scout = view.cards.find((card) => card.id === "scout");
    const heavy = view.cards.find((card) => card.id === "heavy");

    expect(scout).toMatchObject({
      unlocked: true,
      selected: true,
      stateLabel: "已选择",
      actionType: "selected"
    });
    expect(heavy).toMatchObject({
      unlocked: false,
      selected: false,
      stateLabel: "锁定",
      actionType: "unlock"
    });
    expect(heavy?.actionLabel).toContain("解锁");
    expect(view.cards.find((card) => card.id === "vanguard")?.name).toBe("先锋");
  });

  it("returns English copy for the same roster state", () => {
    const save = createDefaultMetaSave();
    save.shards = 30;
    save.unlockedCharacterIds = ["soldier", "scout"];

    const view = createRosterViewModel("en", save);

    expect(view.title).toBe("Roster");
    expect(view.shardsLabel).toBe("Relic Shards");
    expect(view.cards.find((card) => card.id === "soldier")?.stateLabel).toBe("Selected");
    expect(view.cards.find((card) => card.id === "heavy")?.stateLabel).toBe("Locked");
    expect(view.cards.find((card) => card.id === "heavy")?.actionLabel).toContain("Unlock");
    expect(view.cards.find((card) => card.id === "vanguard")?.name).toBe("Vanguard");
  });
});
