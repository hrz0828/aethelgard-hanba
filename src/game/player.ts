import { add, normalize, scale } from "./math";
import type { MovementInput } from "./input";
import type { RunState } from "./types";

export function updatePlayer(state: RunState, input: MovementInput, deltaMs: number): void {
  const direction = normalize(input);
  const hasMovementInput = Math.abs(direction.x) + Math.abs(direction.y) > 0.001;
  const moveDirection = hasMovementInput ? direction : state.player.facing;
  const dodge = state.player.dodge;
  const inputWantsDodge = input.dodgePressed ?? false;

  state.player.invulnerableMs = Math.max(0, state.player.invulnerableMs - deltaMs);
  state.player.hitFlashMs = Math.max(0, state.player.hitFlashMs - deltaMs);

  if (hasMovementInput) {
    state.player.facing = direction;
  }

  if (inputWantsDodge && dodge.cooldownRemainingMs <= 0 && dodge.activeMs <= 0) {
    dodge.activeMs = dodge.durationMs;
    dodge.cooldownRemainingMs = dodge.cooldownMs;
    dodge.iFrameRemainingMs = dodge.iFrameMs;
    dodge.travelRemaining = dodge.travelDistance;
    dodge.direction = hasMovementInput ? direction : state.player.facing;
    if (Math.abs(dodge.direction.x) + Math.abs(dodge.direction.y) <= 0.001) {
      dodge.direction = { x: 0, y: -1 };
    }
  }

  if (dodge.cooldownRemainingMs > 0) {
    dodge.cooldownRemainingMs = Math.max(0, dodge.cooldownRemainingMs - deltaMs);
  }

  if (dodge.activeMs > 0) {
    const dodgeSpeed = dodge.travelDistance / Math.max(1, dodge.durationMs);
    const distance = Math.min(dodge.travelRemaining, dodgeSpeed * deltaMs);
    state.player.velocity = scale(dodge.direction, dodgeSpeed);
    state.player.position = add(state.player.position, scale(dodge.direction, distance));
    dodge.travelRemaining = Math.max(0, dodge.travelRemaining - distance);
    dodge.activeMs = Math.max(0, dodge.activeMs - deltaMs);
    dodge.iFrameRemainingMs = Math.max(0, dodge.iFrameRemainingMs - deltaMs);
    state.player.invulnerableMs = Math.max(state.player.invulnerableMs, dodge.iFrameRemainingMs);
  } else {
    const distance = state.player.speed * (deltaMs / 1000);
    state.player.velocity = {
      x: moveDirection.x * state.player.speed,
      y: moveDirection.y * state.player.speed
    };
    state.player.position = add(state.player.position, scale(moveDirection, distance));
  }

}
