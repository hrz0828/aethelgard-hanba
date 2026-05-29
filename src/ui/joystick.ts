import type { MovementInput } from "../game/input";
import type { RunState } from "../game/types";
import { getDodgeSkillButtonState } from "./dodge";

const MAX_DISTANCE = 54;
const DODGE_ICONS: Record<RunState["player"]["dodge"]["type"], string> = {
  blink: "✦",
  roll: "↻",
  jump: "⇧",
  dash: "➜",
  "shield-step": "◆"
};

export function createJoystick(onMove: (input: MovementInput) => void, onDodge: () => void): HTMLElement {
  const element = document.createElement("div");
  element.className = "joystick";
  element.innerHTML = `
    <div class="joystick-track">
      <div class="joystick-thumb"></div>
    </div>
    <button type="button" class="joystick-dodge" aria-label="Dodge">
      <span class="joystick-dodge-icon" data-dodge-icon>${DODGE_ICONS.roll}</span>
      <span class="joystick-dodge-cooldown" data-dodge-cooldown></span>
    </button>
  `;

  const thumb = element.querySelector<HTMLElement>(".joystick-thumb")!;
  const dodgeButton = element.querySelector<HTMLButtonElement>(".joystick-dodge")!;
  let activePointer: number | undefined;
  let origin = { x: 0, y: 0 };

  element.addEventListener("pointerdown", (event) => {
    activePointer = event.pointerId;
    origin = { x: event.clientX, y: event.clientY };
    element.setPointerCapture(event.pointerId);
  });

  element.addEventListener("pointermove", (event) => {
    if (activePointer !== event.pointerId) {
      return;
    }

    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    const distance = Math.min(MAX_DISTANCE, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    thumb.style.transform = `translate(${x}px, ${y}px)`;
    onMove({ x: x / MAX_DISTANCE, y: y / MAX_DISTANCE });
  });

  function reset(event: PointerEvent): void {
    if (activePointer !== undefined && activePointer !== event.pointerId) {
      return;
    }

    activePointer = undefined;
    thumb.style.transform = "translate(0, 0)";
    onMove({ x: 0, y: 0 });
  }

  element.addEventListener("pointerup", reset);
  element.addEventListener("pointercancel", reset);

  dodgeButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onDodge();
  });

  return element;
}

export function renderJoystickDodgeIcon(root: HTMLElement, state: RunState): void {
  const icon = root.querySelector<HTMLElement>("[data-dodge-icon]");
  const cooldown = root.querySelector<HTMLElement>("[data-dodge-cooldown]");

  if (!icon) {
    return;
  }

  const button = getDodgeSkillButtonState(state);
  icon.textContent = DODGE_ICONS[button.iconLabel];
  root.querySelector<HTMLElement>(".joystick-dodge")?.classList.toggle("joystick-dodge-cooling", !button.ready);

  if (cooldown) {
    cooldown.textContent = button.cooldownText;
  }
}
