export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
}

export const UPGRADE_DEFINITIONS = [
  { id: "damage", name: "Prism Rounds", description: "+18% weapon damage", maxLevel: 5 },
  { id: "fire-rate", name: "Overclock Coil", description: "Fire faster", maxLevel: 5 },
  { id: "move-speed", name: "Phase Boots", description: "+10% movement speed", maxLevel: 4 },
  { id: "max-health", name: "Carbon Heart", description: "+20 max health and heal 20", maxLevel: 4 },
  { id: "heal", name: "Emergency Patch", description: "Recover 35 health", maxLevel: 99 },
  { id: "pickup-radius", name: "Magnet Field", description: "Pull crystals from farther away", maxLevel: 4 },
  { id: "pierce", name: "Piercing Beam", description: "Projectiles pierce one more enemy", maxLevel: 3 },
  { id: "chain", name: "Arc Splitter", description: "Chance to chain damage nearby", maxLevel: 4 },
  { id: "shield", name: "Pulse Shield", description: "Reduce contact pressure with invulnerability", maxLevel: 3 },
  { id: "experience", name: "Data Siphon", description: "Gain more experience", maxLevel: 4 }
] as const satisfies readonly UpgradeDefinition[];

export type UpgradeId = (typeof UPGRADE_DEFINITIONS)[number]["id"];
