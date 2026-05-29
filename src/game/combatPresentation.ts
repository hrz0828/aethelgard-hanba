export type ImpactTier = "player" | "normal" | "elite" | "boss";
export type DeathTier = "normal" | "elite" | "boss";

export interface ImpactPresentation {
  flashTint: number;
  flashAlpha: number;
  hitScale: number;
  burstTint: number;
  burstAlpha: number;
  burstRadiusScale: number;
  burstCount: number;
  burstLineWidth: number;
}

export interface DeathFinishPresentation {
  tint: number;
  radius: number;
  burstCount: number;
  ttlMs: number;
}

const IMPACT_PRESENTATIONS: Record<ImpactTier, ImpactPresentation> = {
  player: {
    flashTint: 0xf4fbff,
    flashAlpha: 0.78,
    hitScale: 1.03,
    burstTint: 0x62f8d1,
    burstAlpha: 0.26,
    burstRadiusScale: 0.92,
    burstCount: 6,
    burstLineWidth: 1.4
  },
  normal: {
    flashTint: 0xffe66d,
    flashAlpha: 0.84,
    hitScale: 1.05,
    burstTint: 0xffe66d,
    burstAlpha: 0.34,
    burstRadiusScale: 1,
    burstCount: 6,
    burstLineWidth: 1.5
  },
  elite: {
    flashTint: 0xffe66d,
    flashAlpha: 0.9,
    hitScale: 1.08,
    burstTint: 0xfff28a,
    burstAlpha: 0.42,
    burstRadiusScale: 1.15,
    burstCount: 8,
    burstLineWidth: 1.9
  },
  boss: {
    flashTint: 0xfff28a,
    flashAlpha: 0.93,
    hitScale: 1.05,
    burstTint: 0xfff28a,
    burstAlpha: 0.5,
    burstRadiusScale: 1.32,
    burstCount: 10,
    burstLineWidth: 2.4
  }
};

const DEATH_FINISH_PRESENTATIONS: Record<DeathTier, DeathFinishPresentation> = {
  normal: {
    tint: 0x62f8d1,
    radius: 28,
    burstCount: 8,
    ttlMs: 220
  },
  elite: {
    tint: 0xfff28a,
    radius: 36,
    burstCount: 10,
    ttlMs: 240
  },
  boss: {
    tint: 0xfff28a,
    radius: 46,
    burstCount: 12,
    ttlMs: 280
  }
};

export function getImpactPresentation(tier: ImpactTier): ImpactPresentation {
  return IMPACT_PRESENTATIONS[tier];
}

export function getDeathFinishPresentation(tier: DeathTier): DeathFinishPresentation {
  return DEATH_FINISH_PRESENTATIONS[tier];
}
