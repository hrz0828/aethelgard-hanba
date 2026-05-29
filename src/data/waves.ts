import type { EnemyType } from "./enemies";

export interface WaveDefinition {
  atMs: number;
  spawnEveryMs: number;
  batchSize: number;
  enemyTypes: EnemyType[];
}

export const WAVE_DEFINITIONS: WaveDefinition[] = [
  { atMs: 0, spawnEveryMs: 1200, batchSize: 3, enemyTypes: ["chaser"] },
  { atMs: 60_000, spawnEveryMs: 1050, batchSize: 4, enemyTypes: ["chaser", "runner"] },
  { atMs: 120_000, spawnEveryMs: 950, batchSize: 5, enemyTypes: ["chaser", "runner", "tank"] },
  { atMs: 180_000, spawnEveryMs: 850, batchSize: 5, enemyTypes: ["runner", "tank", "shooter"] },
  { atMs: 240_000, spawnEveryMs: 760, batchSize: 6, enemyTypes: ["chaser", "shooter", "burster"] },
  { atMs: 330_000, spawnEveryMs: 680, batchSize: 7, enemyTypes: ["runner", "tank", "burster"] },
  { atMs: 420_000, spawnEveryMs: 600, batchSize: 8, enemyTypes: ["shooter", "burster", "elite"] },
  { atMs: 510_000, spawnEveryMs: 520, batchSize: 10, enemyTypes: ["runner", "tank", "shooter", "burster", "elite"] }
];
