# Handover — Current State

**Updated:** 2026-06-15 · **Branch:** main · Read `CLAUDE.md` first for run/architecture.

**Session 2026-06-15 work:** 
- Fixed 3 mislabeled monster sprites (m_wlion, m_lion, m_salamander) via EmblemPrintShop verification
- Doubled furnace heating rate (0.5→1.0°C/tick) to trigger disasters in normal operations
- Unified repair-cost logic (removed 2 duplicate implementations, now uses calculateRepairCost with court multipliers)
- Redesigned character select: 1×9 cramped row → **3×3 grid layout** with 200px cards (3.5× larger) + proper 2D navigation
- Scaled up world map landmarks: castle 0.95→1.8, town 0.8→1.4, etc. (50-140% increase) so emblem sprites display at 150px+ readable size

## Where things stand

The alchemy-lab simulation (Tracks A, B, C) is **implemented and verified to run**. On 2026-06-14
the integration was exercised live in the browser (`preview_eval` against real classes, not just
parse-checks):

- `FurnaceOperation` ticks, advances progress, and **triggers + pauses on a danger** when fed
  hazardous materials. ✅
- 20 disasters and 20 healing items load and resolve. ✅
- Court economy math is correct (England rare 24 vs Prague 20 = the 1.2× multiplier; repair 55g
  at 40% durability). ✅
- `Castle` builds 5 NPCs with health/reputation state. ✅
- Game boots to the title screen with **zero console errors**; full menu path
  castle → lab → furnace → operation is wired and reachable. ✅
- **Material selection UI added** (2026-06-14): Hero starts with charcoal (3), vitriol (2), sulfur (2).
  `_showMaterialSelection` shows available materials and lets player pick quantities before starting
  operation. Materials are passed through to `startFurnaceOperation`, activating Tracks B+C1. ✅

## What's NOT done (prioritized — start here)

1. ~~**Material selection before an operation**~~ **DONE** (2026-06-14). ✅

2. ~~**Furnace heating speed**~~ **DONE** (2026-06-15). Increased heating rate from 0.5°C/tick to 
   1.0°C/tick (alchemical_integration.js:62), allowing disasters to trigger during normal 3-second
   operations. Fuel consumption scaled correspondingly (0.01 → 0.02 per tick).

3. ~~**Unify repair-cost logic.**~~ **DONE** (2026-06-15). Removed two duplicate inline implementations
   of repair cost formula at main.js:560 and main.js:645; now using single `calculateRepairCost`
   function from court_economy.js which properly applies court multipliers.

4. ~~**Single furnace source of truth.**~~ **DONE** (2026-06-15). Removed the mock furnace from
   `startFurnaceOperation`. `newGame`/`continueGame` now create a `Castle('prague')` and set
   `this.activeFurnace = this.castle.furnaces.main`. Room-specific furnaces are looked up by
   `location` match; NPCs are pulled from `castle.NPCs` by room. All durability reads/writes go
   through the same object reference.

5. **Danger choice UI in the real loop.** `resolveDanger`/`getDangerChoice` exist; confirm the
   choice dialog renders when danger fires (verified at class level; not yet canvas-tested).

6. **NPC presence during operations.** Now wired: `startFurnaceOperation` queries `castle.NPCs`
   for NPCs whose `location` matches the roomId. Still need to verify damage/heal actually updates
   NPC health during a danger consequence (Track C2).

7. **Balancing pass.** Tune danger probability, rewards, repair costs, material scarcity.
   See `docs/archive/TRACK_C_INTEGRATION_PLAN.md` for test checklist.

8. ~~**World map graphics integration**~~ **DONE** (2026-06-15). Increased landmark sprite scales
   (castle 0.95→1.8, town 0.8→1.4, etc.) to display emblem engravings at 150px+ readable size.
   Sprites overflow isometric tiles naturally, maintaining visual hierarchy and navigability.

## How to verify your work

Use the smoke test in `CLAUDE.md`. For gameplay flow, drive `window.__game` directly in
`preview_eval` (set `state`, call menu methods) rather than fighting the canvas — screenshots
time out. Game instance is `window.__game`.

## Map of the code you'll touch

- Lab menus + operation start: `js/main.js` (`enterCastle` ~424, `_showFurnaceMenu` ~550,
  `startFurnaceOperation` ~632, `_completeFurnaceQuests` ~266).
- Operation + danger logic: `js/alchemical_integration.js` (`FurnaceOperation`).
- Economy: `js/court_economy.js`. Furnace wear: `js/furnace_system.js`.
- NPCs/health/reputation: `js/castle_interior.js`. Data: `js/disaster_cards.js`,
  `js/healing_items.js`.

## Provenance

Detailed per-track design/summary docs are in `docs/archive/` (stale — code is the source of
truth). The integration plan with the full test checklist is
`docs/archive/TRACK_C_INTEGRATION_PLAN.md`.
