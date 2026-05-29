import Phaser from "phaser";
import {
  TEXTURE_KEYS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  getEnemyPresentation,
  type EnemyAnimationState
} from "../game/assets";
import {
  applyCharacterPreset,
  getCharacterAnimationPresentation,
  getCharacterPresentation,
  getCharacterSpritePresentation,
  SELECTED_CHARACTER_KEY,
  type CharacterAnimationState,
  type CharacterId
} from "../game/characters";
import { getImpactPresentation } from "../game/combatPresentation";
import { getMapPointVisual } from "../game/eventVisuals";
import { getMapPointModelPresentation, getVisibleZonePointsOfInterest } from "../game/mapContent";
import { getEnemyMotionFrame, getPlayerMotionFrame, getUprightPlayerSpritePose } from "../game/motion";
import type { MovementInput } from "../game/input";
import { updateSimulation } from "../game/simulation";
import { createRunState } from "../game/state";
import type { RunState } from "../game/types";
import { getWeaponPresentationState } from "../game/weaponPresentation";
import { getHeldWeaponTextureKey, getPickupWeaponTextureKey } from "../game/weaponSprites";

const UI_MODE_KEY = "ui.mode";
const UI_RESULT_KEY = "ui.result";
const RUN_UPDATE_INTERVAL_MS = 100;

export class GameScene extends Phaser.Scene {
  private state!: RunState;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<"W" | "A" | "S" | "D" | "ESC" | "SPACE" | "SHIFT", Phaser.Input.Keyboard.Key>;
  private background!: Phaser.GameObjects.Image;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerWeaponSprite!: Phaser.GameObjects.Sprite;
  private enemySprites = new Map<number, Phaser.GameObjects.Sprite>();
  private characterId: CharacterId = "soldier";
  private effectGraphics!: Phaser.GameObjects.Graphics;
  private projectileGraphics!: Phaser.GameObjects.Graphics;
  private pickupGraphics!: Phaser.GameObjects.Graphics;
  private eventGraphics!: Phaser.GameObjects.Graphics;
  private poiGraphics!: Phaser.GameObjects.Graphics;
  private mapPointSprites = new Map<string, Phaser.GameObjects.Sprite>();
  private weaponPickupSprites = new Map<number, Phaser.GameObjects.Sprite>();
  private lastRunUpdateEmitTime = Number.NEGATIVE_INFINITY;
  private lastRunUpdateStatus: RunState["status"] | undefined;
  private facingAngle = -Math.PI / 2;
  private eventPulseMs = 0;
  private playerAttackPoseMs = 0;
  private previousPlayerProjectileIds = new Set<number>();

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.state = createRunState();
    const preset = applyCharacterPreset(this.state, this.game.registry.get(SELECTED_CHARACTER_KEY) as string | undefined);
    this.characterId = preset.id;
    this.state.player.position = {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2
    };
    this.lastRunUpdateEmitTime = Number.NEGATIVE_INFINITY;
    this.lastRunUpdateStatus = undefined;
    this.playerAttackPoseMs = 0;
    this.previousPlayerProjectileIds.clear();
    this.cameras.main.setBackgroundColor("#081018");
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.game.registry.set(UI_MODE_KEY, "game");
    this.game.registry.remove(UI_RESULT_KEY);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,ESC,SPACE,SHIFT") as Record<
      "W" | "A" | "S" | "D" | "ESC" | "SPACE" | "SHIFT",
      Phaser.Input.Keyboard.Key
    >;

    this.background = this.add.image(0, 0, TEXTURE_KEYS.worldMapV1).setOrigin(0).setDepth(-100);
    this.background.setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT);

    this.pickupGraphics = this.add.graphics().setDepth(10);
    this.poiGraphics = this.add.graphics().setDepth(12);
    this.eventGraphics = this.add.graphics().setDepth(11);
    this.effectGraphics = this.add.graphics().setDepth(36);
    this.projectileGraphics = this.add.graphics().setDepth(30);
    const playerSprite = getCharacterSpritePresentation(this.characterId);
    this.playerSprite = this.add.sprite(this.state.player.position.x, this.state.player.position.y, playerSprite.textureKey, playerSprite.frame);
    this.playerSprite.setDepth(40);
    this.playerWeaponSprite = this.add.sprite(
      this.state.player.position.x,
      this.state.player.position.y,
      this.getActiveWeaponTextureKey()
    );
    this.playerWeaponSprite.setDepth(41);
    this.playerWeaponSprite.setOrigin(0.32, 0.5);
    this.applyPlayerSize();
    this.cameras.main.startFollow(this.playerSprite, true, 0.09, 0.09);
    this.cameras.main.setDeadzone(80, 80);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    this.renderState();
    this.game.events.emit("run-started", this.state);
    this.emitRunUpdate(0, true);
  }

  update(time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      this.state.status = this.state.status === "paused" ? "playing" : "paused";
    }

    const input = this.readMovementInput();
    if (Math.abs(input.x) + Math.abs(input.y) > 0.001) {
      this.facingAngle = Math.atan2(input.y, input.x) + Math.PI / 2;
    }
    updateSimulation(this.state, input, Math.min(delta, 34));
    this.updateFeedback(delta);
    this.constrainState();
    this.renderState();
    this.emitRunUpdate(time);

    if (this.state.status === "won" || this.state.status === "lost") {
      this.scene.start("GameOverScene", {
        result: this.state.status,
        timeMs: this.state.timeMs,
        level: this.state.player.level,
        kills: this.state.kills,
        bossDefeated: this.state.bossDefeated
      });
    }
  }

  private cleanup(): void {
    this.background.destroy();
    this.playerSprite.destroy();
    this.playerWeaponSprite.destroy();
    this.pickupGraphics.destroy();
    this.poiGraphics.destroy();
    this.eventGraphics.destroy();
    this.effectGraphics.destroy();
    this.projectileGraphics.destroy();

    for (const sprite of this.mapPointSprites.values()) {
      sprite.destroy();
    }

    for (const sprite of this.weaponPickupSprites.values()) {
      sprite.destroy();
    }

    for (const sprite of this.enemySprites.values()) {
      sprite.destroy();
    }

    this.enemySprites.clear();
    this.mapPointSprites.clear();
    this.weaponPickupSprites.clear();
  }

  private constrainState(): void {
    const player = this.state.player;
    player.position.x = Phaser.Math.Clamp(player.position.x, player.radius, WORLD_WIDTH - player.radius);
    player.position.y = Phaser.Math.Clamp(player.position.y, player.radius, WORLD_HEIGHT - player.radius);

    for (const enemy of this.state.enemies) {
      enemy.position.x = Phaser.Math.Clamp(enemy.position.x, enemy.radius, WORLD_WIDTH - enemy.radius);
      enemy.position.y = Phaser.Math.Clamp(enemy.position.y, enemy.radius, WORLD_HEIGHT - enemy.radius);
    }
  }

  private readMovementInput(): MovementInput {
    const joystick = this.game.registry.get("joystick") as MovementInput | undefined;
    const dodgePressed =
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keys.SHIFT) ||
      (joystick?.dodgePressed ?? false);

    this.game.registry.set("joystick", {
      x: joystick?.x ?? 0,
      y: joystick?.y ?? 0,
      dodgePressed: false
    } satisfies MovementInput);

    return {
      x:
        (this.cursors.right.isDown || this.keys.D.isDown ? 1 : 0) -
        (this.cursors.left.isDown || this.keys.A.isDown ? 1 : 0) +
        (joystick?.x ?? 0),
      y:
        (this.cursors.down.isDown || this.keys.S.isDown ? 1 : 0) -
        (this.cursors.up.isDown || this.keys.W.isDown ? 1 : 0) +
        (joystick?.y ?? 0),
      dodgePressed
    };
  }

  private applyPlayerSize(): void {
    const playerSprite = getCharacterAnimationPresentation(this.characterId, "idle");
    this.setSpriteTargetHeight(this.playerSprite, this.state.player.radius * playerSprite.displayScale);
    this.applyWeaponSpriteSize();
  }

  private getActiveWeaponTextureKey(): string {
    return getHeldWeaponTextureKey(this.state.activeWeaponId);
  }

  private getWeaponPickupTextureKey(weaponId?: RunState["activeWeaponId"]): string {
    return getPickupWeaponTextureKey(weaponId);
  }

  private applyWeaponSpriteSize(): void {
    const weaponWidth =
      this.state.activeWeaponId === "beam-cannon" ? 48 : this.state.activeWeaponId === "arc-gun" ? 44 : this.state.activeWeaponId === "shard-launcher" ? 46 : 40;
    const weaponHeight =
      this.state.activeWeaponId === "beam-cannon" ? 21 : this.state.activeWeaponId === "arc-gun" ? 22 : this.state.activeWeaponId === "shard-launcher" ? 24 : 23;
    this.playerWeaponSprite.setDisplaySize(weaponWidth, weaponHeight);
  }

  private updateFeedback(delta: number): void {
    const playerProjectileIds = new Set<number>();
    let hasNewPlayerProjectile = false;

    for (const projectile of this.state.projectiles) {
      if (projectile.owner !== "player") {
        continue;
      }

      playerProjectileIds.add(projectile.id);

      if (!this.previousPlayerProjectileIds.has(projectile.id)) {
        hasNewPlayerProjectile = true;
      }
    }

    this.previousPlayerProjectileIds = playerProjectileIds;
    this.playerAttackPoseMs = hasNewPlayerProjectile ? 150 : Math.max(0, this.playerAttackPoseMs - delta);

    this.eventPulseMs = (this.eventPulseMs + delta) % 2400;
  }

  private getPlayerAnimationState(): CharacterAnimationState {
    if (this.state.player.dodge.activeMs > 0) {
      return "dodge";
    }

    if (this.playerAttackPoseMs > 0) {
      return "attack";
    }

    if (Math.hypot(this.state.player.velocity.x, this.state.player.velocity.y) > 8) {
      return "move";
    }

    return "idle";
  }

  private getEnemyAnimationState(enemy: RunState["enemies"][number]): EnemyAnimationState {
    const distanceToPlayer = Phaser.Math.Distance.Between(
      enemy.position.x,
      enemy.position.y,
      this.state.player.position.x,
      this.state.player.position.y
    );
    const attackRange = enemy.behavior === "ranged" || enemy.behavior === "suppress" ? 260 : 92;

    return distanceToPlayer <= attackRange || enemy.contactCooldownMs > 0 ? "attack" : "move";
  }

  private setSpriteTargetHeight(sprite: Phaser.GameObjects.Sprite, targetHeight: number, scaleX = 1, scaleY = 1): void {
    const sourceHeight = sprite.height || targetHeight;
    const scale = targetHeight / sourceHeight;
    sprite.setScale(scale * scaleX, scale * scaleY);
  }

  private renderState(): void {
    const weapon = getWeaponPresentationState(this.state);
    const playerVisual = getCharacterPresentation(this.characterId);
    const playerAnimationState = this.getPlayerAnimationState();
    const playerSpriteVisual = getCharacterAnimationPresentation(this.characterId, playerAnimationState);
    const playerImpact = getImpactPresentation("player");
    const playerMotion = getPlayerMotionFrame({
      velocity: this.state.player.velocity,
      dodgeType: this.state.player.dodge.type,
      dodgeActiveMs: this.state.player.dodge.activeMs,
      invulnerableMs: this.state.player.invulnerableMs,
      hitFlashMs: this.state.player.hitFlashMs
    });
    this.playerSprite.setTexture(playerSpriteVisual.textureKey, playerSpriteVisual.frame);
    this.playerSprite.setPosition(this.state.player.position.x, this.state.player.position.y);
    const weaponAngle = this.facingAngle - Math.PI / 2;
    const playerPose = getUprightPlayerSpritePose({
      x: Math.abs(this.state.player.velocity.x) > 0.001 ? this.state.player.velocity.x : Math.cos(weaponAngle),
      y: Math.abs(this.state.player.velocity.y) > 0.001 ? this.state.player.velocity.y : Math.sin(weaponAngle)
    });
    this.playerSprite.setRotation(playerPose.rotation);
    this.playerSprite.setFlipX(playerPose.flipX);
    this.setSpriteTargetHeight(
      this.playerSprite,
      this.state.player.radius * playerSpriteVisual.displayScale,
      playerMotion.scaleX,
      playerMotion.scaleY
    );
    this.playerSprite.setTint(this.state.player.hitFlashMs > 0 ? playerImpact.flashTint : playerVisual.tint);
    this.playerSprite.setAlpha(this.state.player.hitFlashMs > 0 ? Math.min(playerMotion.alpha, playerImpact.flashAlpha) : playerMotion.alpha);
    const weaponReach = playerAnimationState === "attack" ? 13 : playerAnimationState === "move" ? 10 : 8;
    this.playerWeaponSprite.setTexture(this.getActiveWeaponTextureKey());
    this.playerWeaponSprite.setPosition(
      this.state.player.position.x + Math.cos(weaponAngle) * weaponReach,
      this.state.player.position.y + Math.sin(weaponAngle) * weaponReach
    );
    this.playerWeaponSprite.setRotation(weaponAngle);
    this.playerWeaponSprite.setTint(this.state.player.hitFlashMs > 0 ? playerImpact.flashTint : 0xffffff);
    this.playerWeaponSprite.setAlpha(this.playerSprite.alpha);
    this.applyWeaponSpriteSize();

    const visibleEnemies = new Set<number>();

    this.effectGraphics.clear();
    for (const enemy of this.state.enemies) {
      visibleEnemies.add(enemy.id);
      const enemyAnimationState = this.getEnemyAnimationState(enemy);

      let sprite = this.enemySprites.get(enemy.id);

      if (!sprite) {
        sprite = this.add.sprite(enemy.position.x, enemy.position.y, getEnemyPresentation(enemy, enemyAnimationState).textureKey);
        sprite.setDepth(enemy.boss ? 50 : enemy.elite ? 35 : 25);
        this.enemySprites.set(enemy.id, sprite);
      }

      const presentation = getEnemyPresentation(enemy, enemyAnimationState);
      const impact = getImpactPresentation(enemy.boss ? "boss" : enemy.elite ? "elite" : "normal");
      const enemyMotion = getEnemyMotionFrame({
        velocity: enemy.velocity,
        elite: enemy.elite,
        boss: enemy.boss,
        hitFlashMs: enemy.hitFlashMs
      });
      const displaySize = enemy.radius * presentation.displayScale;
      const hitScale = enemy.hitFlashMs > 0 ? impact.hitScale : 1;

      sprite.setTexture(presentation.textureKey);
      sprite.setTint(enemy.hitFlashMs > 0 ? impact.flashTint : presentation.tint);
      this.setSpriteTargetHeight(sprite, displaySize * hitScale, enemyMotion.scaleX, enemyMotion.scaleY);
      sprite.setPosition(enemy.position.x, enemy.position.y);
      sprite.setRotation(
        Math.atan2(this.state.player.position.y - enemy.position.y, this.state.player.position.x - enemy.position.x) +
          Math.PI / 2
      );
      sprite.setAlpha(enemy.hitFlashMs > 0 ? impact.flashAlpha : enemyMotion.alpha);
      sprite.setVisible(true);

      this.drawImpactBurst(enemy.position.x, enemy.position.y, enemy.radius, impact, enemy.hitFlashMs);
    }

    for (const [id, sprite] of this.enemySprites) {
      if (!visibleEnemies.has(id)) {
        sprite.destroy();
        this.enemySprites.delete(id);
      }
    }

    this.pickupGraphics.clear();
    this.poiGraphics.clear();
    this.eventGraphics.clear();

    const zones: Array<"hub" | "north" | "east" | "south" | "west"> = ["hub", "north", "east", "south", "west"];
    const visibleMapPoints = new Set<string>();
    for (const zone of zones) {
      const eventType = zone === this.state.activeZoneEventZone ? this.state.activeZoneEventType : "none";
      const points = getVisibleZonePointsOfInterest(this.state, zone);

      for (const point of points) {
        const model = getMapPointModelPresentation(point.kind);
        const spriteKey = point.runtimeKey!;
        let sprite = this.mapPointSprites.get(spriteKey);

        if (!sprite) {
          sprite = this.add.sprite(point.x, point.y, model.textureKey);
          sprite.setDepth(13);
          this.mapPointSprites.set(spriteKey, sprite);
        }

        visibleMapPoints.add(spriteKey);
        sprite.setTexture(model.textureKey);
        sprite.setPosition(point.x, point.y);
        sprite.setRotation(0);
        this.setSpriteTargetHeight(sprite, point.radius * model.displayScale);
        sprite.setAlpha(eventType !== "none" ? 1 : 0.82);
        sprite.setVisible(true);

        const visual = getMapPointVisual(point.kind);
        const pulse = 0.9 + Math.sin((this.eventPulseMs + point.x + point.y) / 260) * 0.08;
        const radius = point.radius * pulse;

        this.poiGraphics.lineStyle(2, visual.accentColor, 0.72);
        this.poiGraphics.fillStyle(visual.color, 0);

        if (visual.shape === "square") {
          this.poiGraphics.strokeRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
        } else if (visual.shape === "ring") {
          this.poiGraphics.strokeCircle(point.x, point.y, radius);
          this.poiGraphics.strokeCircle(point.x, point.y, radius + 6);
        } else if (visual.shape === "node") {
          this.poiGraphics.strokeCircle(point.x, point.y, radius);
          this.poiGraphics.lineStyle(2, visual.accentColor, 0.5);
          this.poiGraphics.strokeLineShape(new Phaser.Geom.Line(point.x, point.y - radius, point.x, point.y + radius));
        } else {
          const pointsShape: Phaser.Geom.Point[] = [];
          const spikes = 8;
          for (let index = 0; index < spikes; index += 1) {
            const angle = (Math.PI * 2 * index) / spikes;
            const spikeRadius = index % 2 === 0 ? radius : radius * 0.58;
            pointsShape.push(
              new Phaser.Geom.Point(point.x + Math.cos(angle) * spikeRadius, point.y + Math.sin(angle) * spikeRadius)
            );
          }
          this.poiGraphics.strokePoints(pointsShape, true, false);
          this.poiGraphics.fillCircle(point.x, point.y, radius * 0.24);
        }
      }
    }

    for (const [spriteKey, sprite] of this.mapPointSprites) {
      if (!visibleMapPoints.has(spriteKey)) {
        sprite.destroy();
        this.mapPointSprites.delete(spriteKey);
      }
    }

    const visibleWeaponPickups = new Set<number>();
    for (const pickup of this.state.pickups) {
      if (pickup.kind === "weapon") {
        visibleWeaponPickups.add(pickup.id);
        let sprite = this.weaponPickupSprites.get(pickup.id);

        if (!sprite) {
          sprite = this.add.sprite(pickup.position.x, pickup.position.y, this.getWeaponPickupTextureKey(pickup.weaponId));
          sprite.setDepth(16);
          this.weaponPickupSprites.set(pickup.id, sprite);
        }

        sprite.setTexture(this.getWeaponPickupTextureKey(pickup.weaponId));
        sprite.setPosition(pickup.position.x, pickup.position.y);
        sprite.setRotation(Math.sin((this.eventPulseMs + pickup.id * 33) / 420) * 0.06);
        this.setSpriteTargetHeight(sprite, pickup.radius * 3.1);
        sprite.setAlpha(0.96);
        sprite.setVisible(true);

        const pickupColors = {
          module: 0xffe66d,
          cache: 0x62f8d1,
          prototype: 0xa4ffe9
        } as const;
        const color = pickupColors[pickup.weaponDropKind ?? "module"];
        this.pickupGraphics.fillStyle(color, 0.92);
        this.pickupGraphics.fillRect(
          pickup.position.x - pickup.radius,
          pickup.position.y - pickup.radius,
          pickup.radius * 2,
          pickup.radius * 2
        );
        this.pickupGraphics.lineStyle(2, 0xf4fbff, 0.75);
        this.pickupGraphics.strokeRect(
          pickup.position.x - pickup.radius,
          pickup.position.y - pickup.radius,
          pickup.radius * 2,
          pickup.radius * 2
        );
        continue;
      }

      this.pickupGraphics.fillStyle(0x62f8d1, 0.95);
      this.pickupGraphics.fillCircle(pickup.position.x, pickup.position.y, pickup.radius);
      this.pickupGraphics.lineStyle(1, 0xeafff8, 0.55);
      this.pickupGraphics.strokeCircle(pickup.position.x, pickup.position.y, pickup.radius + 2);
    }

    for (const [pickupId, sprite] of this.weaponPickupSprites) {
      if (!visibleWeaponPickups.has(pickupId)) {
        sprite.destroy();
        this.weaponPickupSprites.delete(pickupId);
      }
    }

    // Event entities and local POI outlines carry event readability; no screen-level cue is drawn.

    for (const effect of this.state.hitEffects) {
      const age = 1 - effect.ttlMs / 220;
      const sparks = effect.burstCount;
      const alpha = 1 - age;
      const size = effect.radius * (0.4 + age * 0.8);

      this.effectGraphics.fillStyle(effect.tint, alpha);
      this.effectGraphics.lineStyle(1, effect.tint, alpha * 0.6);

      for (let index = 0; index < sparks; index += 1) {
        const angle = (Math.PI * 2 * index) / sparks + age * 4;
        const distance = size * (0.45 + age * 0.9);
        const x = effect.position.x + Math.cos(angle) * distance;
        const y = effect.position.y + Math.sin(angle) * distance;
        this.effectGraphics.fillCircle(x, y, 2 + age * 2);
        this.effectGraphics.strokeCircle(x, y, 3 + age * 2);
      }

      this.effectGraphics.strokeCircle(effect.position.x, effect.position.y, size);
    }

    this.projectileGraphics.clear();

    for (const projectile of this.state.projectiles) {
      if (projectile.owner === "enemy") {
        this.projectileGraphics.fillStyle(0xffc84d, 1);
        this.projectileGraphics.fillCircle(projectile.position.x, projectile.position.y, projectile.radius);
        continue;
      }

      const color = weapon.projectileColor;
      const angle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
      const trailLength = Math.max(14, weapon.beamWidth * 1.8 * weapon.muzzleFlashScale * weapon.trailLengthFactor);
      const trailEndX = projectile.position.x + Math.cos(angle) * trailLength;
      const trailEndY = projectile.position.y + Math.sin(angle) * trailLength;
      const leadGlowRadius = projectile.radius * weapon.muzzleFlashScale * weapon.leadGlowScale;

      if (weapon.trailStyle === "beam") {
        this.projectileGraphics.lineStyle(Math.max(2, weapon.beamWidth / 3), weapon.weaponAccentColor, 0.92);
        this.projectileGraphics.strokeLineShape(
          new Phaser.Geom.Line(projectile.position.x, projectile.position.y, trailEndX, trailEndY)
        );
        this.projectileGraphics.fillStyle(color, 0.9);
        this.projectileGraphics.fillCircle(projectile.position.x, projectile.position.y, leadGlowRadius);
        this.projectileGraphics.fillStyle(weapon.leadGlowScale > 1.1 ? weapon.weaponAccentColor : weapon.trailColor, 0.6);
        this.projectileGraphics.fillCircle(projectile.position.x, projectile.position.y, Math.max(2, leadGlowRadius * 0.56));
        this.projectileGraphics.fillCircle(trailEndX, trailEndY, Math.max(2, projectile.radius * 0.45));
        continue;
      }

      if (weapon.trailStyle === "spark") {
        this.projectileGraphics.lineStyle(2, weapon.weaponAccentColor, 0.85);
        this.projectileGraphics.strokeLineShape(
          new Phaser.Geom.Line(projectile.position.x, projectile.position.y, trailEndX, trailEndY)
        );
        this.projectileGraphics.fillStyle(color, 1);
        this.projectileGraphics.fillCircle(projectile.position.x, projectile.position.y, leadGlowRadius);
        this.projectileGraphics.fillStyle(weapon.trailColor, 0.8);
        this.projectileGraphics.fillCircle(
          projectile.position.x,
          projectile.position.y,
          Math.max(1.5, projectile.radius * 0.45 * weapon.leadGlowScale)
        );
        continue;
      }

      this.projectileGraphics.fillStyle(color, 1);
      this.projectileGraphics.fillCircle(projectile.position.x, projectile.position.y, projectile.radius);
      this.projectileGraphics.lineStyle(1, weapon.weaponAccentColor, 0.7);
      this.projectileGraphics.strokeCircle(projectile.position.x, projectile.position.y, projectile.radius + 1.6);
      this.projectileGraphics.fillStyle(weapon.trailColor, 0.42);
      this.projectileGraphics.fillCircle(projectile.position.x, projectile.position.y, Math.max(1.5, leadGlowRadius * 0.42));
    }
  }

  private drawImpactBurst(
    x: number,
    y: number,
    radius: number,
    impact: ReturnType<typeof getImpactPresentation>,
    hitFlashMs: number
  ): void {
    if (hitFlashMs <= 0) {
      return;
    }

    const remaining = Phaser.Math.Clamp(hitFlashMs / 180, 0, 1);
    const progress = 1 - remaining;
    const pulse = 0.86 + progress * 0.56;
    const burstRadius = radius * impact.burstRadiusScale * pulse;
    const alpha = impact.burstAlpha * (0.72 + progress * 0.28);
    const sparkRadius = Math.max(1.8, radius * 0.11);

    this.effectGraphics.lineStyle(impact.burstLineWidth, impact.burstTint, alpha * 0.84);
    this.effectGraphics.fillStyle(impact.burstTint, alpha);

    for (let index = 0; index < impact.burstCount; index += 1) {
      const angle = (Math.PI * 2 * index) / impact.burstCount + progress * 3.5;
      const distance = burstRadius * (0.58 + progress * 0.62);
      const sparkX = x + Math.cos(angle) * distance;
      const sparkY = y + Math.sin(angle) * distance;
      this.effectGraphics.fillCircle(sparkX, sparkY, sparkRadius + progress * 1.2);
      this.effectGraphics.strokeCircle(sparkX, sparkY, sparkRadius + 1.4 + progress);
    }

    this.effectGraphics.strokeCircle(x, y, burstRadius);
    this.effectGraphics.strokeCircle(x, y, burstRadius * 0.64);
  }

  private emitRunUpdate(time: number, force = false): void {
    const statusChanged = this.lastRunUpdateStatus !== this.state.status;
    const intervalElapsed = time - this.lastRunUpdateEmitTime >= RUN_UPDATE_INTERVAL_MS;

    if (!force && !statusChanged && !intervalElapsed) {
      return;
    }

    this.lastRunUpdateEmitTime = time;
    this.lastRunUpdateStatus = this.state.status;
    this.game.events.emit("run-updated", this.state);
  }
}
