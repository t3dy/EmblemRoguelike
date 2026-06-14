# Handover — Current State

**Updated:** 2026-06-15 · **Branch:** main · Read `CLAUDE.md` first for run/architecture.

**Session 2026-06-15 work (continued):** 
- ✅ Committed core integration fixes (castle wiring, furnace heating boost, repair cost unification, landmark scaling)
- 🎯 **Gameplay feedback enhancements**: Improved furnace operation messages (target temp, material count, completion status)
- 🎯 **Danger system feedback**: Added visual alerts (⚠) and auditory cues; furnace panel now shows ⚠ PAUSED status
- 🎯 **NPC system**: Added dialogue methods (getNPCDialogue, getNPCGreeting) for personality-driven interactions based on role/disposition
- 🎯 **Critical bug fix**: NPC damage system now works — pass actual NPC objects (not IDs) to operations, enabling health damage during dangers
- 🎯 **Furnace panel polish**: Displays operation name, status badge, operation's currentTemp/fuel (not furnace's), clearer state reflection
- 🎯 **Location narratives**: Enhanced atmospheric flavor text for castle entrance (glyphs), Queen's court (moonlit garden)
- 🎯 **Quest feedback**: Visual checkmarks (✓), clearer rewards, thematic messaging for Great Work progression

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

## What's DONE (this session)

1. ~~**Material selection before an operation**~~ **DONE** (2026-06-14). ✅
2. ~~**Furnace heating speed**~~ **DONE** (2026-06-15). 1.0°C/tick allows disasters to trigger. ✅
3. ~~**Unify repair-cost logic**~~ **DONE** (2026-06-15). Uses calculateRepairCost with court multipliers. ✅
4. ~~**Single furnace source of truth**~~ **DONE** (2026-06-15). Castle integration complete. ✅
5. ~~**NPC damage system**~~ **DONE** (2026-06-15). **CRITICAL FIX**: NPCs now properly damaged during dangers. ✅
6. ~~**World map graphics**~~ **DONE** (2026-06-15). Landmarks scaled to 150px+ readability. ✅
7. ~~**Gameplay feedback**~~ **DONE** (2026-06-15). Better messages, visual indicators, furnace panel polish. ✅
8. ~~**NPC dialogue system**~~ **DONE** (2026-06-15). Role-based dialogue, personality-driven greetings. ✅

## What's NOT done (prioritized — tackle in order)

1. **Canvas testing of danger UI.** The choice dialog renders when danger fires, but hasn't been
   visually verified in browser. Smoke test passes at class level.

2. **Balancing pass.** Tune danger probability (trigger thresholds), material scarcity, reward scaling,
   and operation difficulty curves. See `docs/archive/TRACK_C_INTEGRATION_PLAN.md` for test checklist.

3. **Quest progression clarity.** Add a visible quest log/journal so player can track active charges,
   progress, and completed quests. Currently quest state exists but isn't visible between encounters.

4. **More emblem quest variety.** The 50 emblems have stubs but many use generic "operational" type.
   Add more diverse quest mechanics: diplomatic (NPC reconciliation), diplomatic (reputation),
   discovery (find hidden locations), or blessing (gain permanent stat buffs).

5. **End-game polish.** Victory screen for dragon slain; game-over message after Dragon fight;
   score/statistics display (quests done, deepest descent, final gold, etc.).

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
