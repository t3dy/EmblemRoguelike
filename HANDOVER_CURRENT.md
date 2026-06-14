# Handover — Current State

**Updated:** 2026-06-14 · **Branch:** main · Read `CLAUDE.md` first for run/architecture.

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

1. ~~**Material selection before an operation**~~ **DONE** (2026-06-14). Added `_showMaterialSelection`
   at main.js:587; hero starts with materials in `hero.materials`; selection UI flows through to
   `startFurnaceOperation`. Smoke test confirms dangers trigger when materials + temperature align. ✅

2. **Furnace heating speed** *(secondary issue uncovered)*. Operations complete faster than the
   furnace heats up (3000ms duration, 0.5°C/tick heating = only 30°C rise before completion). Many
   disasters require temp ≥70°C, so they never trigger in normal play. **Fix:** Either (a) double
   the heating rate (0.5 → 1.0°C/tick), (b) reduce operation duration, or (c) add low-temp disasters.
   Smoke test works by starting at 70°C; real game needs furnace boost.

3. **Unify repair-cost logic.** `main.js:558` re-implements inline, ignoring court multipliers.
   Use `calculateRepairCost` (imported at line 12, court_economy.js).

4. **Single furnace source of truth.** Reconcile the "mock Furnace" in `startFurnaceOperation`
   with `castle_interior`'s furnace so durability degrades on one object.

5. **Danger choice UI in the real loop.** `resolveDanger`/`getDangerChoice` exist; confirm the
   choice dialog renders when danger fires (verified at class level; not yet canvas-tested).

6. **NPC presence during operations.** `npcsPresent` passed as `[]` from menu path; wire
   `assignNPCToRoom` so NPCs can be hurt/healed (Track C2).

7. **Balancing pass.** Tune danger probability, rewards, repair costs, material scarcity.
   See `docs/archive/TRACK_C_INTEGRATION_PLAN.md` for test checklist.

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
