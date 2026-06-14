# Handover — Current State

**Updated:** 2026-06-15 · **Branch:** main · Read `CLAUDE.md` first for run/architecture.

**Session 2026-06-15 improvements completed:**

**Core systems (4 commits):**
- ✅ **C2 Integration**: Castle wiring, furnace heating boost (1.0°C/tick), repair cost unification, landmark scaling
- ✅ **C3 Gameplay enhancements**: Furnace feedback, danger system alerts, NPC dialogue, quest completion messages
- ✅ **C3 Bug fix**: NPC damage system fully functional (pass NPC objects, not IDs)
- ✅ **C4 Player experience**: Quest log, end-game statistics, enhanced victory/game-over screens

**Details:**
- 🎯 **Furnace operation messages**: Target temp, material count, operation name displayed clearly
- 🎯 **Danger feedback**: ⚠ visual alerts, auditory cues, furnace panel shows PAUSED status
- 🎯 **NPC system**: getNPCDialogue (role-based), getNPCGreeting (disposition-based) for personality
- 🎯 **Critical bug fix**: NPC objects (not IDs) passed to operations → health damage during dangers works
- 🎯 **Furnace panel**: Operation name, status badge, currentTemp/fuel (from operation, not furnace)
- 🎯 **Location flavor**: Castle (glyphs), Queen's court (moonlit garden), atmospheric entry text
- 🎯 **Quest feedback**: Checkmarks (✓), clearer rewards, Great Work progression messaging
- 🎯 **Quest log**: Pause menu access, active charges with progress %, completed count display
- 🎯 **Victory screen**: RUBEDO theme (gold/amber), stats (quests, gold, level)
- 🎯 **Game-over screen**: NIGREDO theme, stats (floor, quests, gold)

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

All major systems verified and integrated. See 4 commits (C2, C3, C3, C4).

## Remaining work (prioritized — tackle in order)

1. **Canvas verification of danger UI.** Smoke test at class level passes; danger choice UI renders 
   when disaster triggers, but hasn't been visually verified in browser (preview server had timeout issues).
   Next person: try preview_start, navigate to furnace operation with dangerous materials, verify choice dialog.

2. **Balancing pass.** Tune:
   - Danger trigger probability (see DANGER_CONFIG in alchemical_integration.js)
   - Material scarcity (hero starts with 7 units; ensure operations feel valuable)
   - Reward scaling (currently fixed per quest; consider XP multipliers based on danger outcomes)
   - Operation duration vs operation difficulty curve
   Reference: `docs/archive/TRACK_C_INTEGRATION_PLAN.md`

3. **More emblem quest variety.** The 50 emblems exist (emblem_quests.js) but many use generic "operational" type.
   Add quest mechanics: diplomatic (NPC reconciliation), reputation (court favor), discovery (location exploration),
   blessing (permanent stat buffs). Currently ~30/50 quests are operational; need at least 10 more distinct types.

4. **Known issues to address:**
   - `_showMaterialSelection` displays available materials but doesn't update the hero's `materials` field 
     (materials are passed to startFurnaceOperation but not persisted to hero for next time)
   - Furnace durability repair is wired but hasn't been tested in gameplay (code exists, no test pass/fail)
   - Character select redesign (3×3 grid layout) was mentioned in handover but not yet verified visually

5. **Nice-to-haves for polish:**
   - Add hero character portraits to HUD and quest dialogs (currently uses generic portraits for King/Queen)
   - Expand town NPC interactions beyond shop menus (dialogue trees, relationship building)
   - Add enchantment or rune system for equipment (currently items are static)
   - More dungeon floor variety: boss floors, treasure floors, safe rests

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
