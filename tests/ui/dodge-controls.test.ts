import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/game/state";
import { getDodgeHudState, getDodgeSkillButtonState } from "../../src/ui/dodge";
import { getUiText } from "../../src/ui/locale";

describe("dodge controls", () => {
  it("describes dodge labels and cooldown state in both locales", () => {
    const state = createRunState();
    const zh = getDodgeHudState(state, "zh");
    const en = getDodgeHudState(state, "en");

    expect(zh.label).toBe("闪避");
    expect(zh.type).toBe("翻滚");
    expect(zh.state).toBe("可用");
    expect(en.label).toBe("Dodge");
    expect(en.type).toBe("Roll");
    expect(en.state).toBe("Ready");
    expect(getUiText("en").dodgeTypes["shield-step"]).toBe("Shield Step");

    state.player.dodge.cooldownRemainingMs = 900;
    const cooling = getDodgeHudState(state, "zh");

    expect(cooling.state).toBe("冷却");
    expect(cooling.cooldownText).toBe("0.9s");
    expect(cooling.progressPercent).toBeGreaterThan(0);

    const button = getDodgeSkillButtonState(state);
    expect(button.iconLabel).toBe("roll");
    expect(button.cooldownText).toBe("0.9s");
    expect(button.ready).toBe(false);
  });
});
