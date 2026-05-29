import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5173";

async function runScenario(page, kind) {
  await page.setViewportSize(kind === "mobile" ? { width: 390, height: 844 } : { width: 1440, height: 900 });

  await page.goto(baseURL);
  await assertVisible(page, 'role=heading[name="Aethelgard-Hanba"]');
  await page.getByRole("button", { name: "Start Run" }).click();

  await assertVisible(page, ".hud");
  await assertVisible(page, "canvas");

  const initialX = await page.evaluate(() => {
    const game = window.__neonRelicGame;
    if (!game) throw new Error("Missing test game handle");
    const scene = game.scene.getScene("GameScene");
    return (scene).state.player.position.x;
  });

  await page.keyboard.down("KeyD");
  await page.waitForTimeout(400);
  await page.keyboard.up("KeyD");

  await waitFor(async () => {
    const x = await page.evaluate(() => {
      const game = window.__neonRelicGame;
      if (!game) throw new Error("Missing test game handle");
      const scene = game.scene.getScene("GameScene");
      return (scene).state.player.position.x;
    });
    return x > initialX;
  }, 5000, "player position did not advance");

  await page.evaluate(() => {
    const game = window.__neonRelicGame;
    if (!game) throw new Error("Missing test game handle");
    const scene = game.scene.getScene("GameScene");
    scene.state.status = "choosing-upgrade";
    scene.state.upgradeChoices = ["damage", "fire-rate", "move-speed"];
    game.events.emit("run-updated", scene.state);
  });

  await assertVisible(page, ".upgrade-overlay");
  await page.getByRole("button", { name: "Prism Rounds" }).click();
  await waitFor(async () => (await page.locator(".upgrade-overlay").count()) === 0, 5000, "upgrade overlay did not close");

  await page.evaluate(() => {
    const game = window.__neonRelicGame;
    if (!game) throw new Error("Missing test game handle");
    game.events.emit("show-result", {
      result: "won",
      timeMs: 125000,
      level: 7,
      kills: 32
    });
  });

  await assertVisible(page, 'role=heading[name="Survived"]');
  await page.getByRole("button", { name: "Run Again" }).click();
  await assertVisible(page, ".hud");

  if (kind === "mobile") {
    await assertVisible(page, ".joystick");
  } else {
    assert.equal(await page.locator(".joystick").isVisible(), false);
  }
}

async function assertVisible(page, selector) {
  if (selector.startsWith("role=")) {
    const match = selector.match(/^role=([^\[]+)\[name="(.+)"\]$/);
    assert(match, `invalid role selector ${selector}`);
    const [, role, name] = match;
    await page.getByRole(role, { name }).waitFor({ state: "visible" });
    return;
  }

  await page.locator(selector).waitFor({ state: "visible" });
}

async function waitFor(predicate, timeoutMs, message) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(message);
}

const browser = await chromium.launch({
  chromiumSandbox: false,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
});

try {
  for (const kind of ["desktop", "mobile"]) {
    const context = await browser.newContext(
      kind === "mobile"
        ? {
            viewport: { width: 390, height: 844 },
            hasTouch: true,
            isMobile: true,
            userAgent:
              "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
          }
        : { viewport: { width: 1440, height: 900 } }
    );

    const page = await context.newPage();
    await runScenario(page, kind);
    await context.close();
  }
} finally {
  await browser.close();
}
