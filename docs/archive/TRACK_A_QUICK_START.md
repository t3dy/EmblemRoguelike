# Track A: Quick Start Guide

## What's Ready

✅ **FurnaceOperation** class — tracks operation state  
✅ **renderFurnacePanel()** function — displays operation UI  
✅ **Game loop integration** — updates and renders each frame  
✅ **Lab menu system** — players can start operations  

## How to Test

1. **Start the game**: `python tools/serve_nocache.py` → `http://localhost:7431/`
2. **Go to Sun-Castle**: Overworld → navigate to castle icon
3. **Enter lab**: Talk to King → "Visit Laboratory"
4. **Start operation**: "Furnace Chamber" → Pick operation → Panel appears
5. **Watch progress**: Temperature rises, fuel depletes, progress advances
6. **Wait for completion**: ~3 seconds → "calcination complete!" message

## Files Modified

| File | What | Lines |
|------|------|-------|
| `js/alchemical_integration.js` | Added FurnaceOperation class | +87 |
| `js/ui.js` | Added renderFurnacePanel() | +75 |
| `js/main.js` | Game loop integration + menu | +109 |

## Key Classes/Functions

### FurnaceOperation
```javascript
new FurnaceOperation(operationId, materials, targetTemp)

// Properties
.operationId  : 'calcination', 'dissolution', etc.
.materials    : [{ id, qty, name }, ...]
.targetTemp   : 20-200 degrees Celsius
.progress     : 0-100%
.status       : 'running' | 'completed' | 'aborted' | 'failed'
.currentTemp  : current furnace temperature
.fuel         : charcoal remaining
.dangers      : [] (for future Track B)

// Methods
.tick(dt)           : Advance operation by dt milliseconds
.getStatusText()    : Return readable status string
.abort()            : Stop operation immediately
.fail()             : Mark as failed
```

### renderFurnacePanel
```javascript
renderFurnacePanel(ctx, x, y, operation, furnace)

// Shows:
// - Temperature gauge (color-coded blue→red)
// - Fuel bar (charcoal %)
// - Progress bar (operation completion %)
// - Estimated time remaining
// - Materials list
```

### Game.startFurnaceOperation
```javascript
game.startFurnaceOperation(operationId, targetTemp, materials)

// Creates FurnaceOperation and stores in:
// - game.activeOperation
// - game.activeFurnace
```

## Game Loop Integration

### In `update(dt)`:
```javascript
if (this.activeOperation && this.activeOperation.status === 'running') {
  this.activeOperation.tick(dt);
  if (this.activeOperation.status === 'completed') {
    this.msg.push(`${this.activeOperation.operationId} complete!`);
  }
}
```

### In `render()`:
```javascript
if (this.activeOperation && this.activeFurnace) {
  renderFurnacePanel(ctx, this.W - 340, 20, this.activeOperation, this.activeFurnace);
}
```

## What's NOT Done Yet

❌ A4: Quest integration (next phase)  
❌ B1-B6: Danger system (parallel phase)  
❌ Multiple concurrent operations (A5)  
❌ Real furnace state from Castle system  
❌ Operation-specific durations from OPERATIONS database  

## Next Phase (A4)

Will add:
1. Load duration from OPERATIONS database
2. Hook operation completion to quest system
3. Handle quest rewards on completion
4. Clear activeOperation after quest processing

## Troubleshooting

**Panel doesn't appear?**
- Check: `game.activeOperation` is not null
- Check: `game.activeFurnace` is not null
- Check: Both are set by `startFurnaceOperation()`

**Progress doesn't advance?**
- Check: `update()` is being called each frame
- Check: `tick(dt)` is being called on activeOperation
- Check: Duration is 3000ms (make sure enough time passes)

**Game loads with errors?**
- Run: `node -c js/main.js js/ui.js js/alchemical_integration.js`
- Check browser console for JS errors
- Verify imports are correct

## Code Structure

```
js/alchemical_integration.js
  └─ class FurnaceOperation
       ├─ constructor(operationId, materials, targetTemp)
       ├─ tick(dt)
       ├─ getStatusText()
       ├─ abort()
       └─ fail()

js/ui.js
  └─ function renderFurnacePanel(ctx, x, y, operation, furnace)
       └─ Draws panel with gauges

js/main.js
  └─ class Game
       ├─ activeOperation : FurnaceOperation
       ├─ activeFurnace : { temperature, fuel, ... }
       ├─ update(dt)         → calls activeOperation.tick(dt)
       ├─ render()           → calls renderFurnacePanel()
       ├─ startFurnaceOperation()
       ├─ _showLabMenu()
       └─ _showFurnaceMenu(roomId)
```

## Design Philosophy

- **Separation of Concerns**: FurnaceOperation (state) vs. renderFurnacePanel (UI)
- **Defensive Programming**: Null-checks before accessing activeOperation
- **No Breaking Changes**: Existing game functions untouched
- **Future-Proof**: Danger array pre-allocated, operationId links to database
- **Test-Friendly**: Can instantiate FurnaceOperation independently

## Time to Complete Implementation

- A1: 30 min (class design + methods)
- A2: 25 min (UI rendering + color logic)
- A3: 40 min (game loop integration + menu system)
- Documentation: 20 min

**Total: ~2 hours for Track A (A1-A3)**

---

*Ready to test? Start the game and head to the castle lab!*
