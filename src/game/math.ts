import type { Vector2 } from "./types";

export function length(vector: Vector2): number {
  return Math.hypot(vector.x, vector.y);
}

export function normalize(vector: Vector2): Vector2 {
  const magnitude = length(vector);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }
  return { x: vector.x / magnitude, y: vector.y / magnitude };
}

export function distance(a: Vector2, b: Vector2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function scale(vector: Vector2, scalar: number): Vector2 {
  return { x: vector.x * scalar, y: vector.y * scalar };
}

export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function nextId(state: { nextId: number }): number {
  const id = state.nextId;
  state.nextId += 1;
  return id;
}
