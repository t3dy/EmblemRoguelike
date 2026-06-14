# EmblemRoguelike — Agent Guide

> **Emblem Knight & the Alchemical Dragon** — a browser roguelike built on Michael Maier's
> *Atalanta Fugiens* (1617). Overworld + dungeon descent ("the Opus") layered with an
> alchemy-lab simulation: furnace operations, chemical disasters, NPC health, court economies.

## Run & Verify (do this, don't ask the user to)

- **No build step.** Plain ES modules served over HTTP. Entry: `index.html` → `js/main.js?v=3`.
- **Server:** `python tools/serve_nocache.py` (port **7431**, defined in `.claude/launch.json`).
  Prefer `preview_start` with config name `emblem-roguelike` over raw Bash.
- **Debug handle:** the live game instance is `window.__game` (NOT `window.game`).
- **Cache-busting:** module URLs carry `?v=N`. Bump N in `index.html`/imports when a change won't load.
- **Functional smoke test** (run in `preview_eval` — this is how you prove logic works without
  clicking through the canvas UI):
  ```js
  (async () => {
    const ai = await import('./js/alchemical_integration.js');
    const op = new ai.FurnaceOperation('calcination',[{id:'sulfur',qty:2}],100,35,[]);
    op.currentTemp = 70;  // C1: Start heated so disasters are available (furnace heating is slow)
    for (let i=0;i<400 && op.status==='running' && !op.triggered_danger;i++) op.tick(50);
    return { progress: op.progress, status: op.status, danger: op.triggered_danger?.name };
  })()
  ```
- **Screenshots of the canvas frequently time out** in preview — rely on `preview_eval` against
  `window.__game` and direct module imports for verification instead.

## Architecture (module map)

`main.js` is the spine: state machine (`title|charselect|overworld|dungeon|battle|quest|choice|…`),
input, game loop (`update(dt)`/`render()`), persistence (localStorage), and the castle/lab menus.

```
main.js
├─ world.js        overworld map; castle tile → game.enterCastle()
├─ dungeon.js      the Opus descent (roguelike floors)
├─ battle.js       turn-based combat
├─ town.js         town interactions
├─ data.js         hero/classes/items/monsters/QUESTS/OPUS_LINE/stages
├─ emblem_quests.js  50 Atalanta-Fugiens emblem quests
├─ ui.js           canvas draw helpers: window9(), text(), menu(), parchmentCard(), renderFurnacePanel()
├─ music.js        procedural fugue audio
├─ assets.js       sprite/manifest loader
├─ court_economy.js  3 courts: pricing, scarcity, repair cost  (Prague / England / Hesse-Kassel)
└─ alchemical_integration.js   ← FurnaceOperation class; ties the lab sim together
   ├─ alchemical_materials.js  MATERIALS / OPERATIONS / EQUIPMENT / DANGERS
   ├─ furnace_system.js        Furnace, RECIPES, durability degradation
   ├─ castle_interior.js       Castle + CastleNPC (health, reputation, room assignment)
   ├─ disaster_cards.js        20 disasters (trigger: materials × heat × durability)
   └─ healing_items.js         20 healing items (heals[], potency, rarity, value)
```

**Gameplay path into the lab:** castle tile (`world.js`) → `enterCastle()` (`main.js:424`) →
Visit Laboratory → `_showLabMenu()` → `_showFurnaceMenu()` → `startFurnaceOperation()`.

## Conventions

- Vanilla JS, ES modules, no framework, no bundler. Canvas 2D rendering at 768×576.
- UI is drawn imperatively each frame; menus are `this.choice = { title, lines, options:[{label,fn}], sel }`.
- Reuse `ui.js` helpers (`window9`, `text`, `menu`) for any new UI — don't hand-roll draw calls.
- Match the surrounding terse, comment-light style. Tag cross-system additions with the track
  marker already in use (`// C1:`, `// C4:`) so provenance stays legible.
- Persistence: `hero` is the save object (localStorage `emblem_knight_save_v1`). Anything that must
  survive a reload lives on `hero`.

## Known seams (verified 2026-06-14 — the next work, not bugs-in-flight)

1. ~~**Dangers are dormant in normal play.**~~ **FIXED** (2026-06-14). Added `_showMaterialSelection` at
   `main.js:587`; hero starts with `materials: { charcoal: 3, vitriol: 2, sulfur: 2 }`. Material selection
   flows through to `startFurnaceOperation`. **Secondary issue:** furnace heating is slow (0.5°C/tick),
   so many disasters (requiring temp ≥70°C) don't trigger in the 3000ms operation window. See HANDOVER.
2. **Repair cost computed three ways.** `main.js:558` re-implements the formula inline ("circular
   import" comment) and ignores court multipliers, while `court_economy.calculateRepairCost` (already
   imported at `main.js:12`) and `castle_interior.js` both do it court-aware. Unify on the imported fn.
3. **`activeFurnace` lifecycle.** `startFurnaceOperation` builds a "mock Furnace" — the real
   `castle_interior` furnace and the operation's furnace aren't yet the same object, so durability
   shown in the menu can diverge from the one that degrades. Wire them to one source of truth.

## Documentation policy (keep context clean)

This repo accumulated ~24 status docs. **Going forward:**
- **One** current handover at root: `HANDOVER_CURRENT.md`. Update it; don't spawn new dated ones.
- `README.md` = player/repo overview. **This file** = agent orientation.
- Historical track/summary/plan docs live in `docs/archive/`. Don't read them for current state —
  they're provenance only and may be stale. Trust code + `HANDOVER_CURRENT.md`.
- Resist creating a new `*_COMPLETE.md` / `*_SUMMARY.md` per task. Fold outcomes into the handover.

**Where things live (don't auto-load reference material):**
- `docs/research/` — our own design research (worldbuilding, materials, quests) with an INDEX.
- `docs/reference/` — external source texts (PCG textbook, design essays). Inspiration only.
- `docs/archive/` — stale historical status docs. Provenance only.

