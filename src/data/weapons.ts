export interface WeaponFormDefinition {
  id: string;
  name: string;
  description: string;
  projectileStyle: "pulse" | "arc" | "beam" | "shard";
}

export interface WeaponDefinition {
  id: string;
  name: string;
  description: string;
  category: "energy";
  forms: readonly WeaponFormDefinition[];
}

export const WEAPON_DEFINITIONS = [
  {
    id: "pulse-rifle",
    name: "Pulse Rifle",
    description: "A steady starter weapon that grows into burst and spread fire.",
    category: "energy",
    forms: [
      {
        id: "pulse-rifle-burst",
        name: "Burst Barrel",
        description: "Converts single shots into short controlled bursts.",
        projectileStyle: "pulse"
      },
      {
        id: "pulse-rifle-spread",
        name: "Scatter Lens",
        description: "Opens the muzzle into a wider spread pattern.",
        projectileStyle: "pulse"
      }
    ]
  },
  {
    id: "arc-gun",
    name: "Arc Gun",
    description: "A chaining weapon that favors linked hits and split arcs.",
    category: "energy",
    forms: [
      {
        id: "arc-gun-chain",
        name: "Chain Matrix",
        description: "Strengthens post-hit chaining between nearby targets.",
        projectileStyle: "arc"
      },
      {
        id: "arc-gun-split",
        name: "Split Relay",
        description: "Lets each discharge split into secondary arcs.",
        projectileStyle: "arc"
      }
    ]
  },
  {
    id: "beam-cannon",
    name: "Beam Cannon",
    description: "A pressure weapon that evolves into wider and longer beams.",
    category: "energy",
    forms: [
      {
        id: "beam-cannon-lance",
        name: "Lance Focus",
        description: "Condenses the beam into a narrow piercing lance.",
        projectileStyle: "beam"
      },
      {
        id: "beam-cannon-prism",
        name: "Prism Splitter",
        description: "Splits the beam into a broader prismatic fan.",
        projectileStyle: "beam"
      }
    ]
  },
  {
    id: "shard-launcher",
    name: "Shard Launcher",
    description: "A prototype launcher that fires sharp relic fragments in controlled spreads.",
    category: "energy",
    forms: [
      {
        id: "shard-launcher-fan",
        name: "Fan Chamber",
        description: "Opens the chamber into a wider shard fan.",
        projectileStyle: "shard"
      },
      {
        id: "shard-launcher-razor",
        name: "Razor Core",
        description: "Hardens fragments into faster piercing blades.",
        projectileStyle: "shard"
      }
    ]
  }
] as const satisfies readonly WeaponDefinition[];

export type WeaponClassId = (typeof WEAPON_DEFINITIONS)[number]["id"];
export type WeaponFormId = (typeof WEAPON_DEFINITIONS)[number]["forms"][number]["id"];

export type WeaponEventId =
  | "armory-cache"
  | "calibration-station"
  | "power-relay"
  | "live-test-zone";

export function getWeaponDefinition(id: WeaponClassId): (typeof WEAPON_DEFINITIONS)[number] {
  return WEAPON_DEFINITIONS.find((weapon) => weapon.id === id) ?? WEAPON_DEFINITIONS[0];
}

export function getWeaponFormDefinition(
  weaponId: WeaponClassId,
  formId: WeaponFormId
): WeaponFormDefinition {
  const weapon = getWeaponDefinition(weaponId);
  return weapon.forms.find((form) => form.id === formId) ?? weapon.forms[0];
}
