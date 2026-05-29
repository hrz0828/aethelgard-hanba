# Neon Relic Survivor Actions and Dodge Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make player and enemy motion feel more readable and tactical by adding lightweight action cues plus character-bound dodge types.

**Architecture:** Keep dodge state in the simulation layer as a small extension of the existing run state. Let the render layer express motion through tint, alpha, scale, offset, and brief trail-like effects instead of adding a full animation system. Character presets determine the dodge type, while enemy presentation continues to be driven by enemy archetype and elite/boss status.

**Tech Stack:** TypeScript, Phaser, DOM UI, Vitest

---

### Scope

中文：
- 这次只做“动作表现”和“闪避类型”。
- 不改自动射击逻辑，不改武器系统，不改地图事件，不改局外成长。
- 闪避是玩家主动动作，每个角色绑定一种闪避类型。
- 动作表现只使用现有素材和轻量渲染层，不引入骨骼动画或新渲染管线。

English:
- This pass only covers motion presentation and dodge types.
- It does not change auto-fire, weapons, map events, or meta progression.
- Dodge is a player-initiated action, with one dodge type bound to each character.
- Motion presentation uses existing assets and lightweight render layers, not skeletal animation or a new render pipeline.

### Dodge Model

中文：
- `Scout` 绑定 `blink`：短距离闪现，冷却最短，位移最小但最灵活。
- `Soldier` 绑定 `roll`：翻滚前进，带短暂无敌帧，位移中等，读感最明确。
- `Heavy` 绑定 `jump`：跳跃式位移，起手略慢，落地更稳，强调容错。
- `Scavenger` 绑定 `dash`：快速冲刺，冷却中等，适合连续穿位。
- `Vanguard` 绑定 `shield-step`：稳步位移，拥有更强的无敌保护和更厚重的表现。

English:
- `Scout` uses `blink`: a short teleport, the fastest cooldown, and the smallest but most flexible displacement.
- `Soldier` uses `roll`: a forward roll with brief i-frames and the clearest readable movement.
- `Heavy` uses `jump`: a hop-style move with a slower start and a heavier landing feel.
- `Scavenger` uses `dash`: a quick burst with medium cooldown for repeated repositioning.
- `Vanguard` uses `shield-step`: a steadier step with stronger i-frames and a heavier presentation.

### Motion Presentation

中文：
- 玩家移动时增加轻微前倾、缩放变化和方向性偏移，让移动不只是平移。
- 玩家闪避时增加短暂拉伸、位移残影和恢复回弹，让动作更容易读。
- 玩家停止移动后快速回到稳定姿态，避免一直保持“冲刺中”的感觉。
- 怪物被击中时增强抖动和闪光，精英和 Boss 使用更明显的受击层。
- 冲刺或逼近行为的怪物增加轻微前倾和颜色提示，让玩家预判危险。
- 怪物死亡时做短促散开或碎光，而不是瞬间消失。

English:
- Player movement gets a small forward lean, scale shift, and directional offset so it feels less like pure translation.
- Dodge adds brief stretch, motion trails, and a rebound reset to make the action readable.
- When the player stops moving, the sprite quickly returns to a stable pose.
- Enemies get stronger shake and flash on hit, with elite and boss hit layers made more obvious.
- Rush or pressure enemies gain a subtle lean and color cue so the player can anticipate danger.
- Enemy death should be a short burst or shard scatter instead of an abrupt vanish.

### Rules and State

中文：
- 闪避状态需要记录：当前类型、冷却、持续时间、无敌帧、位移方向。
- 闪避输入应该和移动输入分离，避免影响现有移动逻辑。
- 闪避结束后要恢复到普通移动状态，不保留残留速度。
- 闪避类型由角色预设决定，不在局内随机切换。
- 角色切换后，闪避类型和基础参数要同步刷新。

English:
- Dodge state must track: current type, cooldown, duration, i-frames, and displacement direction.
- Dodge input should stay separate from movement input so the existing movement logic remains intact.
- After dodge ends, the player returns to normal movement with no leftover velocity.
- Dodge type is determined by the character preset and does not randomize during a run.
- When the selected character changes, dodge type and base parameters must refresh together.

### Implementation Boundary

中文：
- 规则层负责闪避、冷却、无敌帧和位移。
- 场景层负责视觉表现，包括拉伸、位移残影、闪烁和落地感。
- 角色预设模块负责将角色映射到对应闪避类型。
- 敌人表现继续由 `enemy` 类型、`elite` 和 `boss` 决定，不引入新的敌人分类。
- 先做轻量效果，不增加动画资源依赖。

English:
- The simulation layer owns dodge state, cooldowns, i-frames, and displacement.
- The scene layer owns visuals such as stretch, trails, flicker, and landing feel.
- The character preset module maps each character to its dodge type.
- Enemy presentation remains driven by enemy type, elite, and boss status, without adding a new enemy taxonomy.
- Start with lightweight effects and avoid adding animation asset dependencies.

### Acceptance Criteria

中文：
- 5 个角色都能对应到明确的闪避类型。
- 闪避动作在画面上能一眼看懂，不只是数值变化。
- 角色移动和怪物受击、死亡看起来更像“动作”而不是“滑动”。
- 现有武器、地图事件、局外成长和双语 UI 不受影响。

English:
- All 5 characters map to explicit dodge types.
- The dodge action should be visible and legible on screen, not just a hidden stat change.
- Player movement and enemy hit/death should feel more like actions than sliding sprites.
- Existing weapons, map events, meta progression, and bilingual UI must remain intact.
