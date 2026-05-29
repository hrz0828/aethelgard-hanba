import { expect, test } from "@playwright/test";

const META_KEY = "neon-relic.meta.v1";

test("can manage roster, start a run, and see shard results", async ({ page }) => {
  await page.addInitScript(({ key, save }) => {
    window.localStorage.setItem(key, JSON.stringify(save));
  }, {
    key: META_KEY,
    save: {
      version: 1,
      shards: 30,
      unlockedCharacterIds: ["soldier", "scout"],
      selectedCharacterId: "soldier"
    }
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Aethelgard-Hanba" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "角色库" })).toBeVisible();
  await expect(page.locator("[data-character='soldier']")).toContainText("已选择");
  await expect(page.locator("[data-character='scout']")).toContainText("已解锁");
  await expect(page.locator("[data-character='heavy']")).toContainText("锁定");

  await page.locator("[data-character='scout'] [data-action='select']").click();
  await expect(page.locator("[data-character='scout']")).toContainText("已选择");

  await page.locator("[data-character='heavy'] [data-action='unlock']").click();
  await expect(page.locator("[data-character='heavy']")).toContainText("已解锁");

  const shardsAfterUnlock = await page.evaluate(() => {
    const raw = window.localStorage.getItem(META_KEY);
    if (!raw) throw new Error("Missing meta save");
    return (JSON.parse(raw) as { shards: number }).shards;
  });

  await page.getByRole("button", { name: "开始游戏" }).click();
  await expect(page.locator(".hud")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const game = window.__neonRelicGame;
      if (!game) throw new Error("Missing test game handle");
      const scene = game.scene.getScene("GameScene") as unknown as { state: { player: { speed: number } } };
      return scene.state.player.speed;
    });
  }).toBe(280);

  await page.evaluate(() => {
    const game = window.__neonRelicGame;
    if (!game) throw new Error("Missing test game handle");
    game.scene.start("GameOverScene", {
      result: "won",
      timeMs: 125000,
      level: 7,
      kills: 32,
      bossDefeated: true
    });
  });

  await expect(page.getByRole("heading", { name: "成功生还" })).toBeVisible();
  await expect(page.locator("[data-result-shards-earned]")).toHaveText("21");
  await expect(page.locator("[data-result-shards-total]")).toHaveText(String(shardsAfterUnlock + 21));
  await expect(page.locator("[data-result-unlocked-characters]")).toHaveText("3");

  const save = await page.evaluate(() => window.localStorage.getItem(META_KEY));
  expect(save).not.toBeNull();
  const parsed = JSON.parse(save as string) as { shards: number; unlockedCharacterIds: string[]; selectedCharacterId: string };
  expect(parsed.unlockedCharacterIds).toContain("heavy");
  expect(parsed.selectedCharacterId).toBe("scout");
  expect(parsed.shards).toBeGreaterThan(0);
});
