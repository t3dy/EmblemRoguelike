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

## What's NOT done (prioritized — start here)

1. **Material selection before an operation** *(highest impact)*. `main.js:571` starts every
   operation with `[]` materials, so the entire disaster system is dormant in normal play. Add a
   step in `_showFurnaceMenu` to pick materials (from `hero` inventory / castle stock) and pass
   them into `startFurnaceOperation`. This single change activates Tracks B+C1 in real gameplay.
2. **Unify repair-cost logic.** `main.js:558` re-implements the formula inline and ignores court
   multipliers. Use the already-imported `calculateRepairCost` (court_economy.js). Solve the
   "circular import" excuse — it's not actually circular; main.js already imports it at line 12.
3. **Single furnace source of truth.** Reconcile the "mock Furnace" built in
   `startFurnaceOperation` with `castle_interior`'s furnace so durability degrades on one object.
4. **Danger choice UI in the real loop.** `resolveDanger`/`getDangerChoice` exist and work, but
   confirm the choice dialog renders and routes when a danger fires from menu-started operations
   (verified at class level; not yet click-tested through the canvas).
5. **NPC presence during operations.** `npcsPresent` is passed as `[]` from the menu path; wire
   `assignNPCToRoom` so NPCs can actually be hurt/healed (Track C2 payoff).
6. **Balancing pass.** Once materials flow, tune danger probability, reward multipliers, repair
   costs, and material scarcity for a fair curve. See the testing checklist in
   `docs/archive/TRACK_C_INTEGRATION_PLAN.md`.

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
