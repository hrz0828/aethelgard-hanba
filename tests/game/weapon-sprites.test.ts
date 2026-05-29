import { describe, expect, it } from "vitest";
import { getHeldWeaponTextureKey, getPickupWeaponTextureKey } from "../../src/game/weaponSprites";

describe("weapon sprite mapping", () => {
  it("maps equipped weapon ids to matching held weapon models", () => {
    expect(getHeldWeaponTextureKey("pulse-rifle")).toBe("weapon-pulse-rifle-v2");
    expect(getHeldWeaponTextureKey("arc-gun")).toBe("weapon-arc-gun-v2");
    expect(getHeldWeaponTextureKey("beam-cannon")).toBe("weapon-beam-cannon-v2");
    expect(getHeldWeaponTextureKey("shard-launcher")).toBe("weapon-shard-launcher-v1");
  });

  it("maps weapon pickups to matching pickup models", () => {
    expect(getPickupWeaponTextureKey("shard-launcher")).toBe("weapon-shard-launcher-pickup-v1");
    expect(getPickupWeaponTextureKey("arc-gun")).toBe("weapon-arc-gun-v2");
  });
});
