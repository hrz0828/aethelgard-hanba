import { describe, expect, it } from "vitest";
import {
  calculateRelicShards,
  createDefaultMetaSave,
  loadMetaSave,
  saveMetaSave,
  unlockCharacter
} from "../../src/meta/progression";

describe("meta progression", () => {
  it("awards shards from run results", () => {
    expect(
      calculateRelicShards({
        timeMs: 360000,
        kills: 42,
        bossDefeated: true,
        result: "won"
      })
    ).toBe(26);
  });

  it("returns default meta save when storage is empty", () => {
    expect(createDefaultMetaSave()).toEqual({
      version: 1,
      shards: 0,
      unlockedCharacterIds: ["soldier"],
      selectedCharacterId: "soldier"
    });
  });

  it("round-trips meta save through storage", () => {
    const store = new Map<string, string>();
    const fakeStorage = {
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        store.set(key, value);
      },
      removeItem(key: string) {
        store.delete(key);
      }
    } as Storage;

    const save = {
      version: 1 as const,
      shards: 9,
      unlockedCharacterIds: ["soldier", "scout"],
      selectedCharacterId: "scout"
    };

    saveMetaSave(save, fakeStorage);
    expect(loadMetaSave(fakeStorage)).toEqual(save);
  });

  it("falls back to defaults for malformed storage", () => {
    const store = new Map<string, string>([
      ["neon-relic.meta.v1", "not-json"]
    ]);
    const fakeStorage = {
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        store.set(key, value);
      },
      removeItem(key: string) {
        store.delete(key);
      }
    } as Storage;

    expect(loadMetaSave(fakeStorage)).toEqual(createDefaultMetaSave());
  });

  it("falls back to defaults for outdated storage versions", () => {
    const store = new Map<string, string>([
      [
        "neon-relic.meta.v1",
        JSON.stringify({
          version: 0,
          shards: -12,
          unlockedCharacterIds: ["soldier", "scout"],
          selectedCharacterId: "scout"
        })
      ]
    ]);
    const fakeStorage = {
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        store.set(key, value);
      },
      removeItem(key: string) {
        store.delete(key);
      }
    } as Storage;

    expect(loadMetaSave(fakeStorage)).toEqual(createDefaultMetaSave());
  });

  it("clamps negative shards when saving valid data", () => {
    const store = new Map<string, string>();
    const fakeStorage = {
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        store.set(key, value);
      },
      removeItem(key: string) {
        store.delete(key);
      }
    } as Storage;

    saveMetaSave(
      {
        version: 1,
        shards: -9,
        unlockedCharacterIds: ["soldier"],
        selectedCharacterId: "soldier"
      },
      fakeStorage
    );

    expect(loadMetaSave(fakeStorage)).toEqual(createDefaultMetaSave());
  });

  it("spends shards to unlock a character", () => {
    const save = createDefaultMetaSave();
    save.shards = 12;

    expect(unlockCharacter(save, "scout", 12)).toBe(true);
    expect(save.shards).toBe(0);
    expect(save.unlockedCharacterIds).toContain("scout");
  });

  it("rejects unknown character ids", () => {
    const save = createDefaultMetaSave();
    save.shards = 99;

    expect(unlockCharacter(save, "unknown", 12)).toBe(false);
    expect(save.shards).toBe(99);
    expect(save.unlockedCharacterIds).not.toContain("unknown");
  });
});
