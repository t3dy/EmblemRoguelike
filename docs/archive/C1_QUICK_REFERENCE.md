# C1 Danger Integration — Quick Reference

## What Was Implemented

Track C1 (Danger Integration) adds real consequences to furnace operations. When materials are heated, disasters can occur—causing damage, material loss, and furnace degradation.

## Key Methods

### FurnaceOperation (alchemical_integration.js)

| Method | Purpose | Returns |
|--------|---------|---------|
| `tick(dt)` | Advance operation, check for danger | `{ danger_triggered: true, danger }` or `null` |
| `_calculateDangerProbability()` | Compute risk from conditions | `0.0-0.5` (probability) |
| `_checkDangerTrigger()` | Roll for danger | `true` if triggered |
| `getDangerChoice()` | Show player options | `{ title, description, options }` |
| `resolveDanger(choice, hero)` | Apply consequences | `{ choice, messages, ... }` |

### Game (main.js)

| Method | Purpose |
|--------|---------|
| `startFurnaceOperation(...)` | Create operation with NPCs and durability |
| `_showDangerChoice()` | Display danger dialog |
| `_resolveDangerChoice(choice)` | Handle player decision |

## Danger Probability Formula

```
Base: 5%
+ Temperature variance: 5% per 50°C over target
+ Hazardous materials: 3% each
+ Low durability (<50): 5%
+ Critical durability (<30): +10% extra
Cap: 50% maximum
```

## If Danger Continues

- **Hero**: Takes damage (10-25 HP depending on disaster)
- **Materials**: Lose 20-80% depending on disaster
- **Furnace**: Loses 20 durability points
- **Duration**: Operation takes 30% longer
- **NPCs**: In room take same damage as hero, get condition state

## If Danger Aborted

- **All materials**: Lost
- **Operation**: Marked as 'aborted'
- **NPCs**: Unharmed
- **Furnace**: Undamaged

## Integration with Other Systems

### With Disasters (disaster_cards.js)
- Uses `getPotentialDisasters(materials, temp, durability)`
- Reads disaster properties: name, description, effect (damage_amount, material_loss, worker_state)

### With Game Loop
- Operation ticked each frame in `update(dt)`
- Danger check happens automatically
- Choice dialog uses existing overlay system
- Messages displayed via `msg.push()`

### With NPCs
- NPCs in room track via `activeNPCs` map
- Damage applied to `npc.hp`
- Condition state: `npc.condition = 'sickened'|'injured'|'critical'`

## Tuning

All danger probabilities are configurable via `DANGER_CONFIG` in alchemical_integration.js:

```javascript
const DANGER_CONFIG = {
  BASE_PROBABILITY: 0.05,              // Edit to change base risk
  TEMP_VARIANCE_PENALTY: 0.05,         // Temperature sensitivity
  HAZMAT_PENALTY: 0.03,                // Material hazard level
  DURABILITY_LOW_PENALTY: 0.05,        // Worn furnace risk
  DURABILITY_CRITICAL_PENALTY: 0.10,   // Broken furnace risk
  MAX_PROBABILITY: 0.50,               // Luck can't exceed this
  DANGER_DAMAGE: 20,                   // Hero damage per incident
  FURNACE_DAMAGE: 20,                  // Furnace durability hit
  DURATION_MULTIPLIER_INCREASE: 0.3,   // Extra time needed
};
```

## Example Flow

1. **Start operation**: `game.startFurnaceOperation('calcination', 150, [vitriol: 3])`
   - Operation created with current furnace durability (100)
   - Any NPCs in room stored for tracking

2. **Game loop ticks**: `operation.tick(dt)` each frame
   - Progress advances: 45%, 46%, 47%...
   - Temperature adjusts: 20°C → 80°C → 150°C
   - Each tick: random chance to trigger danger

3. **Danger triggers!**
   - Roll: 0.23 < calculated probability of 0.35? YES
   - Select from `getPotentialDisasters()`: "Mercury Spill"
   - Operation pauses, status = 'paused'
   - `tick()` returns `{ danger_triggered: true, danger: {...} }`

4. **Dialog shown**: Game displays:
   - "Mercury Spill Occurred!"
   - "Quicksilver escapes vessel, pooling on the floor in toxic droplets"
   - Two choices presented

5. **Player chooses "Continue"**:
   - `_resolveDangerChoice('continue')`
   - Apply 20 damage to hero
   - Lose 60% of materials (vitriol: 3 → 1)
   - Furnace durability: 100 → 80
   - Duration multiplier: 1.0 → 1.3 (operation takes longer)
   - Any NPCs present take 20 damage too
   - Operation resumes

6. **Continue operation**: Status back to 'running', keep heating

## Status States

| State | Meaning | Ticks? |
|-------|---------|--------|
| `'running'` | Normal operation | Yes |
| `'paused'` | Waiting for danger choice | No |
| `'completed'` | 100% progress reached | No |
| `'aborted'` | Player chose abort | No |
| `'failed'` | Danger destroyed vessel | No |

## Data Persistence

Game saves automatically on:
- Danger occurrence (before showing dialog)
- Danger choice made (consequences applied)
- Operation completion

## Next Steps: C2, C3, C4

This system prepares for:
- **C2**: NPC health tracking (uses `npc.condition` set by danger)
- **C3**: Quest completion (hooks into operation status changes)
- **C4**: Furnace economics (tracks `furnace.durability` degradation)

## Common Questions

**Q: How do I make dangers more common?**  
A: Lower `DANGER_CONFIG.BASE_PROBABILITY` from 0.05 to 0.10

**Q: How do I make low-durability furnaces less dangerous?**  
A: Lower `DURABILITY_LOW_PENALTY` from 0.05 to 0.02

**Q: Can operations complete even with dangers?**  
A: Yes! Choosing "continue" lets the operation finish, just with added difficulty

**Q: What if a player's HP goes to 0?**  
A: They die (hp capped at 0). This triggers game over.

**Q: Can NPCs die from danger?**  
A: Only if you set their max HP low. The system respects NPC HP limits.

---

See `C1_IMPLEMENTATION_SUMMARY.md` for full technical details.
