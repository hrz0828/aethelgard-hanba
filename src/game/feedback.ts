export function shouldTriggerDamageFlash(previousHealth: number, currentHealth: number): boolean {
  return currentHealth < previousHealth;
}

export function shouldTriggerKillPulse(previousKills: number, currentKills: number): boolean {
  return currentKills > previousKills;
}

export function shouldTriggerBossShake(previousBossSpawned: boolean, currentBossSpawned: boolean): boolean {
  void previousBossSpawned;
  void currentBossSpawned;
  return false;
}
