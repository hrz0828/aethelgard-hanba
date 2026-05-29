import { CHARACTER_IDS, type CharacterId } from "../game/characters";

export type RunOutcome = "won" | "lost";

export interface RelicShardRewardInput {
  timeMs: number;
  kills: number;
  bossDefeated: boolean;
  result: RunOutcome;
}

export interface MetaSave {
  version: 1;
  shards: number;
  unlockedCharacterIds: string[];
  selectedCharacterId: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const META_SAVE_KEY = "neon-relic.meta.v1";
const DEFAULT_CHARACTER_ID = "soldier";
const META_VERSION = 1 as const;
const VALID_CHARACTER_IDS = new Set<CharacterId>(CHARACTER_IDS);

function resolveStorage(storage?: StorageLike): StorageLike | undefined {
  if (storage) {
    return storage;
  }

  if (typeof localStorage !== "undefined") {
    return localStorage;
  }

  return undefined;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
}

function sanitizeMetaSave(value: unknown): MetaSave | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<MetaSave> & { version?: unknown };
  if (candidate.version !== META_VERSION) {
    return null;
  }

  const shards = typeof candidate.shards === "number" && Number.isFinite(candidate.shards)
    ? Math.max(0, Math.floor(candidate.shards))
    : 0;

  const unlockedCharacterIds = Array.isArray(candidate.unlockedCharacterIds)
    ? uniqueStrings(
        candidate.unlockedCharacterIds.filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    : [];

  if (!unlockedCharacterIds.includes(DEFAULT_CHARACTER_ID)) {
    unlockedCharacterIds.unshift(DEFAULT_CHARACTER_ID);
  }

  const selectedCharacterId =
    typeof candidate.selectedCharacterId === "string" &&
    candidate.selectedCharacterId.length > 0 &&
    VALID_CHARACTER_IDS.has(candidate.selectedCharacterId as CharacterId) &&
    unlockedCharacterIds.includes(candidate.selectedCharacterId)
      ? candidate.selectedCharacterId
      : DEFAULT_CHARACTER_ID;

  return {
    version: META_VERSION,
    shards,
    unlockedCharacterIds,
    selectedCharacterId
  };
}

export function calculateRelicShards(input: RelicShardRewardInput): number {
  return (
    3 +
    Math.floor(input.timeMs / 60000) +
    Math.floor(input.kills / 10) +
    (input.bossDefeated ? 8 : 0) +
    (input.result === "won" ? 5 : 0)
  );
}

export function createDefaultMetaSave(): MetaSave {
  return {
    version: META_VERSION,
    shards: 0,
    unlockedCharacterIds: [DEFAULT_CHARACTER_ID],
    selectedCharacterId: DEFAULT_CHARACTER_ID
  };
}

export function loadMetaSave(storage?: StorageLike): MetaSave {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) {
    return createDefaultMetaSave();
  }

  const raw = resolvedStorage.getItem(META_SAVE_KEY);
  if (!raw) {
    return createDefaultMetaSave();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeMetaSave(parsed) ?? createDefaultMetaSave();
  } catch {
    return createDefaultMetaSave();
  }
}

export function saveMetaSave(save: MetaSave, storage?: StorageLike): void {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) {
    return;
  }

  resolvedStorage.setItem(META_SAVE_KEY, JSON.stringify(sanitizeMetaSave(save) ?? createDefaultMetaSave()));
}

export function unlockCharacter(save: MetaSave, characterId: string, cost: number): boolean {
  if (!VALID_CHARACTER_IDS.has(characterId as CharacterId)) {
    return false;
  }

  if (save.unlockedCharacterIds.includes(characterId)) {
    if (!save.selectedCharacterId || !save.unlockedCharacterIds.includes(save.selectedCharacterId)) {
      save.selectedCharacterId = characterId;
    }

    return true;
  }

  if (!Number.isFinite(cost) || cost < 0 || save.shards < cost) {
    return false;
  }

  save.shards = Math.max(0, Math.floor(save.shards - cost));
  save.unlockedCharacterIds = uniqueStrings([...save.unlockedCharacterIds, characterId]);
  if (!save.selectedCharacterId || !save.unlockedCharacterIds.includes(save.selectedCharacterId)) {
    save.selectedCharacterId = characterId;
  }

  return true;
}
