import type { WeaponClassId, WeaponEventId } from "../data/weapons";
import type { WeaponDisplayFormId } from "../game/weaponLoadout";

export type Language = "zh" | "en";

export interface UiText {
  languageToggle: string;
  startMenuEyebrow: string;
  startMenuTitle: string;
  startMenuCopy: string;
  rosterTitle: string;
  rosterShardsLabel: string;
  rosterLockedLabel: string;
  rosterUnlockedLabel: string;
  rosterSelectedLabel: string;
  rosterSelectButton: string;
  rosterSelectedButton: string;
  rosterIntro: string;
  rosterCharacters: Record<
    "soldier" | "scout" | "heavy" | "scavenger" | "vanguard",
    { name: string; description: string }
  >;
  startButton: string;
  weaponHudTitle: string;
  weaponHudActiveLabel: string;
  weaponHudFormLabel: string;
  weaponHudHistoryLabel: string;
  weaponHudEvolutionLabel: string;
  weaponClasses: Record<WeaponClassId, { name: string; description: string }>;
  weaponForms: Record<WeaponClassId, Partial<Record<WeaponDisplayFormId, { name: string; description: string }>>>;
  weaponEvents: Record<WeaponEventId, string>;
  resultWonEyebrow: string;
  resultLostEyebrow: string;
  resultWonTitle: string;
  resultLostTitle: string;
  resultCopy: (timeLabel: string, level: number, kills: number) => string;
  resultShardsEarnedLabel: string;
  resultShardsTotalLabel: string;
  resultUnlockedCharactersLabel: string;
  restartButton: string;
  mainMenuButton: string;
  runStatusAria: string;
  timeLabel: string;
  levelLabel: string;
  killsLabel: string;
  healthLabel: string;
  experienceLabel: string;
  zoneLabel: string;
  eventLabel: string;
  eventNone: string;
  mapPoiLabel: string;
  dodgeLabel: string;
  dodgeReadyLabel: string;
  dodgeCooldownLabel: string;
  dodgeTypes: Record<"blink" | "roll" | "jump" | "dash" | "shield-step", string>;
  bossLabel: string;
  bossName: string;
  zones: Record<"hub" | "north" | "east" | "south" | "west", string>;
  events: Record<"none" | "supply" | "hazard" | "wave", string>;
  upgradeEyebrow: (level: number) => string;
  upgradeTitle: string;
  upgradeFallbackName: string;
  upgradeFallbackDescription: string;
}

export type UpgradeLocale = Record<string, { name: string; description: string }>;

const ZH_TEXT: UiText = {
  languageToggle: "中文 / EN",
  startMenuEyebrow: "霓虹废墟生存",
  startMenuTitle: "Aethelgard-Hanba",
  startMenuCopy: "移动求生，武器会自动射击。收集晶体，逐步构筑这一局。",
  rosterTitle: "角色库",
  rosterShardsLabel: "遗物碎片",
  rosterLockedLabel: "锁定",
  rosterUnlockedLabel: "已解锁",
  rosterSelectedLabel: "已选择",
  rosterSelectButton: "选择",
  rosterSelectedButton: "当前角色",
  rosterIntro: "解锁角色，决定这局的起手风格。",
  rosterCharacters: {
    soldier: { name: "兵员", description: "均衡型起点，适合熟悉基础节奏" },
    scout: { name: "侦察兵", description: "更快移动，容错更低" },
    heavy: { name: "重装兵", description: "更高生命，更慢速度" },
    scavenger: { name: "拾荒者", description: "更远拾取范围，更快成长" },
    vanguard: { name: "先锋", description: "更厚护甲，开局更稳" }
  },
  startButton: "开始游戏",
  weaponHudTitle: "武器",
  weaponHudActiveLabel: "当前武器",
  weaponHudFormLabel: "形态",
  weaponHudHistoryLabel: "升级记录",
  weaponHudEvolutionLabel: "进化层级",
  weaponClasses: {
    "pulse-rifle": { name: "脉冲枪", description: "稳定起手，升级后转向三连发和散射" },
    "arc-gun": { name: "电弧枪", description: "偏连锁和跳伤，适合清理成群敌人" },
    "beam-cannon": { name: "光束炮", description: "持续压制，升级后改变束流宽度与穿透" },
    "shard-launcher": { name: "裂片发射器", description: "发射遗物碎片，升级后形成扇形或穿透刀片" }
  },
  weaponForms: {
    "pulse-rifle": {
      single: { name: "单发", description: "基础脉冲弹" },
      "pulse-rifle-burst": { name: "连发模组", description: "短促三连射" },
      "pulse-rifle-spread": { name: "散射镜组", description: "更宽的扇形扩散" }
    },
    "arc-gun": {
      single: { name: "单电弧", description: "基础放电" },
      "arc-gun-chain": { name: "连锁矩阵", description: "更强的跳跃联锁" },
      "arc-gun-split": { name: "分裂继电", description: "一次释放更多电弧" }
    },
    "beam-cannon": {
      single: { name: "细束", description: "稳定的窄束" },
      "beam-cannon-lance": { name: "枪刺聚焦", description: "更长更集中的束流" },
      "beam-cannon-prism": { name: "棱镜分束", description: "更宽的分叉束流" }
    },
    "shard-launcher": {
      single: { name: "裂片单发", description: "基础双裂片射击" },
      "shard-launcher-fan": { name: "扇形弹仓", description: "展开更宽的裂片扇面" },
      "shard-launcher-razor": { name: "刀锋核心", description: "更快且可穿透的锋利碎片" }
    }
  },
  weaponEvents: {
    "armory-cache": "军械箱",
    "calibration-station": "校准站",
    "power-relay": "供能节点",
    "live-test-zone": "实战测试区"
  },
  resultWonEyebrow: "信号已稳定",
  resultLostEyebrow: "本局结束",
  resultWonTitle: "成功生还",
  resultLostTitle: "战败",
  resultCopy: (timeLabel, level, kills) => `${timeLabel} · ${level} 级 · ${kills} 次击杀`,
  resultShardsEarnedLabel: "本局碎片",
  resultShardsTotalLabel: "总计",
  resultUnlockedCharactersLabel: "已解锁角色",
  restartButton: "再来一局",
  mainMenuButton: "返回首页",
  runStatusAria: "对局状态",
  timeLabel: "时间",
  levelLabel: "等级",
  killsLabel: "击杀",
  healthLabel: "生命",
  experienceLabel: "经验",
  zoneLabel: "区域",
  eventLabel: "事件",
  eventNone: "无",
  mapPoiLabel: "武器据点",
  dodgeLabel: "闪避",
  dodgeReadyLabel: "可用",
  dodgeCooldownLabel: "冷却",
  dodgeTypes: {
    blink: "闪现",
    roll: "翻滚",
    jump: "跳跃",
    dash: "冲刺",
    "shield-step": "盾步"
  },
  bossLabel: "首领",
  bossName: "遗物巨像",
  zones: {
    hub: "中心区",
    north: "北区",
    east: "东区",
    south: "南区",
    west: "西区"
  },
  events: {
    none: "无",
    supply: "补给点",
    hazard: "危险区",
    wave: "波次事件"
  },
  upgradeEyebrow: (level) => `等级 ${level}`,
  upgradeTitle: "选择一个强化",
  upgradeFallbackName: "未命名强化",
  upgradeFallbackDescription: "暂无说明"
};

const EN_TEXT: UiText = {
  languageToggle: "EN / 中文",
  startMenuEyebrow: "Neon Ruins Survival",
  startMenuTitle: "Aethelgard-Hanba",
  startMenuCopy: "Move to survive. Weapons fire automatically. Collect crystals and build a run.",
  rosterTitle: "Roster",
  rosterShardsLabel: "Relic Shards",
  rosterLockedLabel: "Locked",
  rosterUnlockedLabel: "Unlocked",
  rosterSelectedLabel: "Selected",
  rosterSelectButton: "Select",
  rosterSelectedButton: "Current",
  rosterIntro: "Unlock characters to shape the next run.",
  rosterCharacters: {
    soldier: { name: "Soldier", description: "Balanced baseline for learning the loop" },
    scout: { name: "Scout", description: "Faster movement, lower margin for error" },
    heavy: { name: "Heavy", description: "More health, slower movement" },
    scavenger: { name: "Scavenger", description: "Farther pickup range, faster growth" },
    vanguard: { name: "Vanguard", description: "Tougher armor, steadier opening" }
  },
  startButton: "Start Run",
  weaponHudTitle: "Weapons",
  weaponHudActiveLabel: "Active weapon",
  weaponHudFormLabel: "Form",
  weaponHudHistoryLabel: "Upgrade history",
  weaponHudEvolutionLabel: "Evolution tier",
  weaponClasses: {
    "pulse-rifle": { name: "Pulse Rifle", description: "Steady opener that evolves into burst and spread fire" },
    "arc-gun": { name: "Arc Gun", description: "Chain-focused weapon that jumps through grouped enemies" },
    "beam-cannon": { name: "Beam Cannon", description: "Sustained pressure that can widen or pierce" },
    "shard-launcher": { name: "Shard Launcher", description: "Fires relic fragments that evolve into fans or piercing razors" }
  },
  weaponForms: {
    "pulse-rifle": {
      single: { name: "Single Shot", description: "Baseline pulse round" },
      "pulse-rifle-burst": { name: "Burst Barrel", description: "Short controlled three-shot burst" },
      "pulse-rifle-spread": { name: "Scatter Lens", description: "Wider fan-shaped spread" }
    },
    "arc-gun": {
      single: { name: "Single Bolt", description: "Baseline discharge" },
      "arc-gun-chain": { name: "Chain Matrix", description: "Stronger post-hit chaining" },
      "arc-gun-split": { name: "Split Relay", description: "More arcs per trigger" }
    },
    "beam-cannon": {
      single: { name: "Narrow Beam", description: "A thin stabilized beam" },
      "beam-cannon-lance": { name: "Lance Focus", description: "A longer, tighter beam" },
      "beam-cannon-prism": { name: "Prism Splitter", description: "A broader branching beam" }
    },
    "shard-launcher": {
      single: { name: "Shard Shot", description: "Baseline paired shard fire" },
      "shard-launcher-fan": { name: "Fan Chamber", description: "A wider fan of fragments" },
      "shard-launcher-razor": { name: "Razor Core", description: "Faster piercing shard blades" }
    }
  },
  weaponEvents: {
    "armory-cache": "Armory Cache",
    "calibration-station": "Calibration Station",
    "power-relay": "Power Relay",
    "live-test-zone": "Live Test Zone"
  },
  resultWonEyebrow: "Signal secured",
  resultLostEyebrow: "Run terminated",
  resultWonTitle: "Survived",
  resultLostTitle: "Defeated",
  resultCopy: (timeLabel, level, kills) => `${timeLabel} · Lv ${level} · ${kills} kills`,
  resultShardsEarnedLabel: "Shards earned",
  resultShardsTotalLabel: "Total shards",
  resultUnlockedCharactersLabel: "Unlocked characters",
  restartButton: "Run Again",
  mainMenuButton: "Main Menu",
  runStatusAria: "Run status",
  timeLabel: "Time",
  levelLabel: "Level",
  killsLabel: "Kills",
  healthLabel: "Health",
  experienceLabel: "Experience",
  zoneLabel: "Zone",
  eventLabel: "Event",
  eventNone: "None",
  mapPoiLabel: "Weapon POIs",
  dodgeLabel: "Dodge",
  dodgeReadyLabel: "Ready",
  dodgeCooldownLabel: "Cooldown",
  dodgeTypes: {
    blink: "Blink",
    roll: "Roll",
    jump: "Jump",
    dash: "Dash",
    "shield-step": "Shield Step"
  },
  bossLabel: "Boss",
  bossName: "Relic Colossus",
  zones: {
    hub: "Hub",
    north: "North District",
    east: "East District",
    south: "South District",
    west: "West District"
  },
  events: {
    none: "None",
    supply: "Supply Point",
    hazard: "Hazard Zone",
    wave: "Wave Event"
  },
  upgradeEyebrow: (level) => `Level ${level}`,
  upgradeTitle: "Choose an Upgrade",
  upgradeFallbackName: "Unnamed Upgrade",
  upgradeFallbackDescription: "No description"
};

const ZH_UPGRADES: UpgradeLocale = {
  damage: { name: "棱镜弹头", description: "武器伤害 +18%" },
  "fire-rate": { name: "超频线圈", description: "射击速度更快" },
  "move-speed": { name: "相位靴", description: "移动速度 +10%" },
  "max-health": { name: "碳素核心", description: "最大生命 +20，并恢复 20 点" },
  heal: { name: "应急修补", description: "恢复 35 点生命" },
  "pickup-radius": { name: "磁场模块", description: "更远距离吸收晶体" },
  pierce: { name: "穿透光束", description: "子弹可多穿透一个敌人" },
  chain: { name: "电弧分裂器", description: "有几率连锁伤害附近敌人" },
  shield: { name: "脉冲护盾", description: "降低接触伤害压力" },
  experience: { name: "数据虹吸", description: "获得更多经验" }
};

const EN_UPGRADES: UpgradeLocale = {
  damage: { name: "Prism Rounds", description: "+18% weapon damage" },
  "fire-rate": { name: "Overclock Coil", description: "Fire faster" },
  "move-speed": { name: "Phase Boots", description: "+10% movement speed" },
  "max-health": { name: "Carbon Heart", description: "+20 max health and heal 20" },
  heal: { name: "Emergency Patch", description: "Recover 35 health" },
  "pickup-radius": { name: "Magnet Field", description: "Pull crystals from farther away" },
  pierce: { name: "Piercing Beam", description: "Projectiles pierce one more enemy" },
  chain: { name: "Arc Splitter", description: "Chance to chain damage nearby" },
  shield: { name: "Pulse Shield", description: "Reduce contact pressure with invulnerability" },
  experience: { name: "Data Siphon", description: "Gain more experience" }
};

export function getUiText(language: Language): UiText {
  return language === "zh" ? ZH_TEXT : EN_TEXT;
}

export function getUpgradeText(language: Language, id: string): { name: string; description: string } {
  const upgrades = language === "zh" ? ZH_UPGRADES : EN_UPGRADES;
  return upgrades[id] ?? {
    name: getUiText(language).upgradeFallbackName,
    description: getUiText(language).upgradeFallbackDescription
  };
}

export function normalizeLanguage(value: string | null | undefined): Language {
  return value === "en" ? "en" : "zh";
}
