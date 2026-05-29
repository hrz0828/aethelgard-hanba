// @ts-expect-error -- The project intentionally does not install Node types.
import { readFileSync } from "node:fs";
// @ts-expect-error -- The project intentionally does not install Node types.
import { join } from "node:path";
import { describe, expect, it } from "vitest";

declare const process: { cwd(): string };

const styles = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");
const gameScene = readFileSync(join(process.cwd(), "src/scenes/GameScene.ts"), "utf8");

function cssRule(selector: string): string {
  const match = styles.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([\\s\\S]*?)\\}`));
  return match?.[1] ?? "";
}

function cssRules(selector: string): string {
  const pattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([\\s\\S]*?)\\}`, "g");
  const rules: string[] = [];
  let match: RegExpExecArray | null = pattern.exec(styles);

  while (match) {
    rules.push(match[1]);
    match = pattern.exec(styles);
  }

  return rules.join("\n");
}

describe("fullscreen visual effects", () => {
  it("does not apply full-screen gradient or glow backgrounds to the app shell", () => {
    expect(cssRules("#app")).not.toContain("linear-gradient");
    expect(cssRules("#app")).not.toContain("radial-gradient");
    expect(cssRules("#app")).not.toContain("box-shadow");
  });

  it("does not dim or glow the whole screen during upgrade selection", () => {
    expect(cssRule(".upgrade-overlay")).not.toContain("rgba(");
    expect(cssRule(".upgrade-overlay")).not.toContain("backdrop-filter");
  });

  it("does not use camera-wide flash, fade, or shake effects in the game scene", () => {
    expect(gameScene).not.toContain(".flash(");
    expect(gameScene).not.toContain(".fade");
    expect(gameScene).not.toContain(".shake(");
  });

  it("keeps HUD text panels static instead of using blur, shadows, or animated transitions", () => {
    expect(cssRule(".hud-row")).not.toContain("backdrop-filter");
    expect(cssRule(".hud-row")).not.toContain("box-shadow");
    expect(cssRule(".boss-bar")).not.toContain("backdrop-filter");
    expect(cssRule(".meter span")).not.toContain("transition");
  });
});
