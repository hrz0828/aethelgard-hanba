# Neon Relic Survivor Map Event Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give map events layered feedback for enter, start, and end states without changing event rules or turning the map into a large VFX system.

**Architecture:** Keep event timing and pressure in the simulation layer, and add a small scene-side presentation layer for entry cues, short localized pulses, and fade-out cleanup. The HUD should remain the source of truth for readable text, while the scene renders only the transient visual feedback.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, DOM/CSS.

---

### Task 1: Layered Event Entry and Start Cues

**Files:**
- Modify: `src/game/eventVisuals.ts`
- Modify: `src/scenes/GameScene.ts`
- Modify: `src/ui/hud.ts`
- Test: `tests/game/event-visuals.test.ts`
- Test: `tests/game/map-content.test.ts`
- Test: `tests/ui/locale.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getMapEventVisual } from "../../src/game/eventVisuals";

describe("map event visuals", () => {
  it("keeps weapon-related event markers readable and distinct", () => {
    expect(getMapEventVisual("armory")).toMatchObject({
      shape: "square",
      color: 0xffc84d
    });

    expect(getMapEventVisual("calibration")).toMatchObject({
      shape: "ring",
      color: 0x62f8d1
    });

    expect(getMapEventVisual("relay")).toMatchObject({
      shape: "node",
      color: 0x69a7ff
    });

    expect(getMapEventVisual("test")).toMatchObject({
      shape: "hazard",
      color: 0xb36dff
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/event-visuals.test.ts tests/game/map-content.test.ts tests/ui/locale.test.ts`

Expected: fail only where the new layered feedback state plumbing is missing, not because of map content or localization regressions.

- [ ] **Step 3: Add a small event feedback state layer and render enter/start cues**

Add a minimal event-feedback state in the scene, driven by the simulation fields that already exist:

```ts
type MapEventFeedbackState = {
  activeType: MapEventType;
  activeZone: CityDistrict;
  pulseMs: number;
  fadeMs: number;
  entryMs: number;
};
```

Update `src/scenes/GameScene.ts` so it detects transitions in `activeZoneEventType` / `activeZoneEventZone` and drives three cue stages:

- `enter`: a subtle marker and HUD text update.
- `start`: a short localized pulse in the event area.
- `end`: a fade-down / shrink-back cue when the event stops.

Keep the pulse confined to the event zone. Do not add screen-wide flashes or long-running effect layers.

Update `src/ui/hud.ts` only if it needs an event-state label or a clearer distinction between active and inactive event text. Keep the HUD as text-first, not effect-first.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/event-visuals.test.ts tests/game/map-content.test.ts tests/ui/locale.test.ts`

Expected: pass with the new event-feedback state integrated into the scene and HUD without changing event rules.

- [ ] **Step 5: Commit**

```bash
git add src/game/eventVisuals.ts src/scenes/GameScene.ts src/ui/hud.ts tests/game/event-visuals.test.ts tests/game/map-content.test.ts tests/ui/locale.test.ts
git commit -m "feat: add layered map event cues"
```

---

### Task 2: Event End Fade and Marker Cleanup

**Files:**
- Modify: `src/scenes/GameScene.ts`
- Modify: `src/game/eventVisuals.ts`
- Test: `tests/game/map.test.ts`
- Test: `tests/game/weapon-events.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/game/state";
import { updateMapState } from "../../src/game/map";
import { getZoneCenter } from "../../src/game/map";

describe("map event transitions", () => {
  it("ends weapon-related events cleanly without changing event rules", () => {
    const state = createRunState();
    state.player.position = getZoneCenter("east");

    updateMapState(state, 16);
    expect(state.activeZoneEventType).toBe("calibration");

    state.activeZoneEventMs = 0;
    state.zoneEventArmed = false;
    updateMapState(state, 16);

    expect(state.activeZoneEventType).toBe("none");
    expect(state.activeZoneEventZone).toBe("hub");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/map.test.ts tests/game/weapon-events.test.ts`

Expected: if the rule layer is already correct, these tests should stay green; the new work should only touch the scene-side fade cleanup.

- [ ] **Step 3: Add end-state fade cleanup in the scene**

Update `src/scenes/GameScene.ts` so event markers do not snap off when the event ends. Instead:

- the marker shrinks or fades out briefly,
- the event pulse resets smoothly,
- the HUD returns to the neutral event state cleanly.

Keep the effect local to the event zone. Do not change `src/game/map.ts`, `src/game/mapContent.ts`, or the event timing rules.

If `src/game/eventVisuals.ts` needs a tiny helper to support fade-out state, add it there as a pure presentation helper only.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `npm test -- tests/game/map.test.ts tests/game/weapon-events.test.ts`

Expected: pass with no change to the underlying event rules, only improved end-state cleanup.

- [ ] **Step 5: Commit**

```bash
git add src/scenes/GameScene.ts src/game/eventVisuals.ts tests/game/map.test.ts tests/game/weapon-events.test.ts
git commit -m "feat: fade map event cues cleanly"
```

---

### Task 3: Full Verification and Regression Sweep

**Files:**
- Modify: `src/scenes/GameScene.ts`
- Modify: `src/ui/hud.ts`
- Test: `tests/game/event-visuals.test.ts`
- Test: `tests/game/map-content.test.ts`
- Test: `tests/ui/locale.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getUiText } from "../../src/ui/locale";

describe("map event feedback labels", () => {
  it("keeps the event label and POI label readable while events are active", () => {
    expect(getUiText("zh").eventLabel).toBeTruthy();
    expect(getUiText("en").eventLabel).toBeTruthy();
    expect(getUiText("zh").mapPoiLabel).toBe("武器据点");
    expect(getUiText("en").mapPoiLabel).toBe("Weapon POIs");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- tests/game/event-visuals.test.ts tests/game/map-content.test.ts tests/ui/locale.test.ts`

Expected: if any event feedback strings or marker assumptions drifted, the regression should catch it.

- [ ] **Step 3: Tighten the presentation and keep the event cues localized**

Make any final adjustments so that:

- event markers pulse only inside the active event area,
- entry feedback stays light,
- start feedback is the clearest cue,
- end feedback fades out cleanly,
- HUD text remains the primary source of event meaning.

Do not add persistent VFX layers or event-rule changes.

- [ ] **Step 4: Run the full suite and build**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass, the build succeeds, and the existing map pressure / weapon / character / enemy systems remain intact.

- [ ] **Step 5: Commit**

```bash
git add src/scenes/GameScene.ts src/ui/hud.ts src/game/eventVisuals.ts tests/game/event-visuals.test.ts tests/game/map-content.test.ts tests/ui/locale.test.ts
git commit -m "feat: polish layered map event feedback"
```
