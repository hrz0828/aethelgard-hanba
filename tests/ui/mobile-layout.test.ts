// @ts-expect-error -- The project intentionally does not install Node types.
import { readFileSync } from "node:fs";
// @ts-expect-error -- The project intentionally does not install Node types.
import { join } from "node:path";
import { describe, expect, it } from "vitest";

declare const process: { cwd(): string };

const styles = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");
const hud = readFileSync(join(process.cwd(), "src/ui/hud.ts"), "utf8");
const joystick = readFileSync(join(process.cwd(), "src/ui/joystick.ts"), "utf8");

describe("mobile layout", () => {
  it("defines a default collapsed HUD state for coarse pointer devices", () => {
    expect(hud).toContain("hud-toggle");
    expect(hud).toContain("hud-collapsible");
    expect(styles).toContain("@media (pointer: coarse)");
    expect(styles).toContain(".hud:not(.hud-expanded) .hud-collapsible");
  });

  it("centers the mobile joystick at the bottom of the screen", () => {
    expect(styles).toContain("left: 50%");
    expect(styles).toContain("transform: translateX(-50%)");
    expect(styles).toContain("grid-template-columns: 132px");
  });

  it("uses a standalone dodge skill icon button outside the movement pad", () => {
    expect(joystick).toContain("joystick-dodge-icon");
    expect(joystick).toContain("data-dodge-icon");
    expect(joystick).toContain("data-dodge-cooldown");
    expect(joystick).toContain("renderJoystickDodgeIcon");
    expect(styles).toContain("dodge-roll-icon.png");
    expect(styles).toContain(".joystick-dodge-cooldown");
  });

  it("keeps the mobile home screen compact and scrollable", () => {
    expect(styles).toContain("overflow-y: auto");
    expect(styles).toContain("max-height: min(48vh, 420px)");
    expect(styles).toContain("min-height: 108px");
  });
});
