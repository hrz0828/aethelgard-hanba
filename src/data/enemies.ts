import type { EnemyState } from "../game/types";

export interface EnemyDefinition {
  type: string;
  radius: number;
  health: number;
  speed: number;
  damage: number;
  experience: number;
  behavior: EnemyState["behavior"];
  color: number;
}

const defineEnemyTypes = <const T extends { [K in keyof T]: EnemyDefinition & { type: K & string } }>(definitions: T) => definitions;

export const ENEMY_TYPES = defineEnemyTypes({
  chaser: { type: "chaser", radius: 15, health: 34, speed: 92, damage: 10, experience: 6, behavior: "chase", color: 0xff4f8b },
  runner: { type: "runner", radius: 12, health: 22, speed: 150, damage: 8, experience: 7, behavior: "dash", color: 0xffd166 },
  charger: { type: "charger", radius: 13, health: 26, speed: 138, damage: 13, experience: 8, behavior: "dash", color: 0xffb14d },
  tank: { type: "tank", radius: 24, health: 130, speed: 58, damage: 18, experience: 18, behavior: "chase", color: 0x8f6bff },
  shooter: { type: "shooter", radius: 17, health: 48, speed: 72, damage: 9, experience: 12, behavior: "suppress", color: 0x65d9ff },
  suppressor: { type: "suppressor", radius: 18, health: 52, speed: 66, damage: 10, experience: 14, behavior: "suppress", color: 0x69a7ff },
  burster: { type: "burster", radius: 16, health: 40, speed: 128, damage: 22, experience: 13, behavior: "burst", color: 0xff6b4a },
  elite: { type: "elite", radius: 30, health: 280, speed: 78, damage: 24, experience: 42, behavior: "chase", color: 0xf7f06d },
  warden: { type: "warden", radius: 22, health: 170, speed: 62, damage: 16, experience: 26, behavior: "suppress", color: 0xffd166 }
});

export type EnemyType = keyof typeof ENEMY_TYPES;
