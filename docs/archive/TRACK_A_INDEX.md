# Track A Documentation Index

## Overview

Track A (Furnace Operation Mechanics) is **COMPLETE**. This document indexes all related files and provides navigation.

---

## Core Implementation Files

### Code Changes
1. **js/alchemical_integration.js** (+87 lines)
   - New: `FurnaceOperation` class
   - Tracks furnace operation state and progress
   - Location: Lines 8-93 (before `initHeroAlchemy` function)

2. **js/ui.js** (+75 lines)
   - New: `renderFurnacePanel()` function
   - Renders operation status panel
   - Location: Lines 132-209 (at end of file)

3. **js/main.js** (+109 lines, -3 lines)
   - Modified: Game class constructor (add properties)
   - Modified: `update(dt)` method (add operation ticking)
   - Modified: `render()` method (add panel rendering)
   - New: `startFurnaceOperation()` method
   - New: `_showLabMenu()` and `_showFurnaceMenu()` methods
   - Location: Various (search for "A3:" comments)

---

## Documentation Files

### Quick Start
- **TRACK_A_QUICK_START.md** — 5-minute overview and testing guide
- **TRACK_A_SUMMARY.txt** — Comprehensive summary (design + decisions)

### Detailed Reference
- **TRACK_A_IMPLEMENTATION.md** — Original task spec with detailed results
- **TRACK_A_COMPLETION_REPORT.md** — Technical deep-dive with code examples

### This File
- **TRACK_A_INDEX.md** — You are here (navigation guide)

---

## How to Use This Documentation

**I just want to test it:**
→ Read **TRACK_A_QUICK_START.md** (5 min)

**I want to understand what was built:**
→ Read **TRACK_A_SUMMARY.txt** (10 min)

**I'm implementing A4 or B1-B6:**
→ Read **TRACK_A_COMPLETION_REPORT.md** (20 min)

**I need the exact spec:**
→ Read **TRACK_A_IMPLEMENTATION.md** + code comments

**I'm reviewing the code:**
→ Check `// A1:`, `// A2:`, `// A3:` comments in the modified files

---

## Component Summary

### A1: FurnaceOperation Class
```javascript
class FurnaceOperation {
  constructor(operationId, materials, targetTemp)
  tick(dt)
  getStatusText()
  abort()
  fail()
}
```
**File**: `js/alchemical_integration.js` (Lines 8-93)  
**Purpose**: Track operation state and progress  
**Status**: ✅ Complete

### A2: Furnace UI Panel
```javascript
function renderFurnacePanel(ctx, x, y, operation, furnace)
```
**File**: `js/ui.js` (Lines 132-209)  
**Purpose**: Display operation status visually  
**Status**: ✅ Complete

### A3: Game Loop Integration
```javascript
game.activeOperation           // FurnaceOperation instance
game.activeFurnace             // Furnace object
game.startFurnaceOperation()   // Create + start operation
game.update(dt)                // Call operation.tick(dt)
game.render()                  // Call renderFurnacePanel()
```
**File**: `js/main.js` (Multiple locations)  
**Purpose**: Integrate with game loop and menu system  
**Status**: ✅ Complete

---

## Testing Checklist

```
□ Game loads without errors
□ Can navigate to Sun-Castle  
□ King offers "Visit Laboratory" option
□ Lab menu shows furnace rooms
□ Can select furnace operation
□ Panel appears in top-right corner
□ Temperature gauge displays correctly
□ Progress bar advances smoothly
□ Fuel bar decreases during operation
□ Estimated time counts down
□ Operation completes after ~3 seconds
□ Completion message appears
```

See **TRACK_A_QUICK_START.md** for detailed testing steps.

---

## Integration with Other Phases

### A4: Quest Completion Hook
- Uses: `FurnaceOperation.operationId`
- Uses: Operation completion detection in `update()`
- Does: Hook to `questProgress()` system
- Status: Ready (placeholder TODO in code)

### B1-B6: Danger System
- Uses: `FurnaceOperation.dangers` array
- Uses: `Furnace._checkDangers()` method
- Does: Add danger triggering + consequences
- Status: Prepared (arrays allocated, hooks identified)

### A5: Multiple Furnaces
- Uses: Current single-operation design
- Does: Extend to multiple furnaces
- Status: Architecture supports it (can refactor to Dict)

---

## Code Quality Metrics

| Metric | Result |
|--------|--------|
| Syntax Validation | ✅ Pass (node -c) |
| Breaking Changes | ✅ None |
| Code Style | ✅ Consistent |
| Comments | ✅ JSDoc on public methods |
| Null Checks | ✅ Present |
| Separation of Concerns | ✅ State vs. Rendering |

---

## File Structure

```
js/
├── alchemical_integration.js  (MODIFIED +87 lines)
│   ├── FurnaceOperation class (NEW)
│   │   ├── constructor
│   │   ├── tick()
│   │   ├── getStatusText()
│   │   ├── abort()
│   │   └── fail()
│   └── [existing content unchanged]
│
├── ui.js                      (MODIFIED +75 lines)
│   ├── [existing content unchanged]
│   └── renderFurnacePanel()   (NEW)
│       ├── Panel background & border
│       ├── Temperature gauge
│       ├── Fuel bar
│       ├── Progress bar
│       ├── Time remaining
│       └── Materials list
│
└── main.js                    (MODIFIED +109 -3 lines)
    ├── Imports (MODIFIED)
    │   ├── + FurnaceOperation
    │   └── + renderFurnacePanel
    ├── Game.constructor (MODIFIED)
    │   ├── + activeOperation = null
    │   └── + activeFurnace = null
    ├── Game.update()  (MODIFIED)
    │   └── + operation.tick(dt) call
    ├── Game.render()  (MODIFIED)
    │   └── + renderFurnacePanel() call
    ├── Game.startFurnaceOperation() (NEW)
    ├── Game._showLabMenu()          (NEW)
    ├── Game._showFurnaceMenu()      (MODIFIED)
    └── [existing content largely unchanged]
```

---

## Key Properties & Methods

### FurnaceOperation
```javascript
// Create
const op = new FurnaceOperation('calcination', [{id: 'charcoal', qty: 2}], 150);

// Properties
op.operationId          // 'calcination'
op.materials            // [{ id, qty, name }, ...]
op.targetTemp           // 150
op.progress             // 0-100
op.duration             // 3000 ms
op.status               // 'running'|'completed'|'aborted'|'failed'
op.currentTemp          // actual furnace temperature
op.fuel                 // charcoal remaining
op.startTime            // Date.now()
op.dangers              // [] (for B1-B6)

// Methods
op.tick(dt)             // Advance operation
op.getStatusText()      // "Calcination: 45% complete, 127°C / 150°C"
op.abort()              // Stop operation
op.fail()               // Mark failed
```

### Game Integration
```javascript
// Start operation
game.startFurnaceOperation('calcination', 80, []);

// Check status
if (game.activeOperation) {
  console.log(game.activeOperation.progress); // 0-100
  console.log(game.activeOperation.status);    // 'running' | 'completed' | ...
}

// Clear operation (typically in A4)
game.activeOperation = null;
game.activeFurnace = null;
```

---

## Performance

- **Time Complexity**: O(1) per frame
- **Space Complexity**: O(n) where n = materials.length (typically ≤5)
- **Rendering**: Single function call per frame when active
- **No GC Pressure**: No arrays created each frame

---

## Known Issues & TODOs

| Item | Status | Target |
|------|--------|--------|
| Duration hardcoded to 3000ms | TODO | A4 |
| No quest system hook | TODO | A4 |
| No danger triggering | TODO | B1-B4 |
| Single operation only | TODO | A5 |
| Mock furnace object | TODO | A4 (use Castle system) |

---

## Quick Links

- **Play the game**: `python tools/serve_nocache.py` → `http://localhost:7431/`
- **GitHub repo**: https://github.com/t3dy/EmblemRoguelike
- **Live site**: https://t3dy.github.io/EmblemRoguelike/
- **Original plan**: PARALLEL_IMPLEMENTATION_PLAN.md

---

## Questions?

**See:**
- Code comments (search for "A1:", "A2:", "A3:")
- JSDoc on public methods
- TRACK_A_COMPLETION_REPORT.md (detailed rationale)
- TRACK_A_QUICK_START.md (testing guide)

---

**Status**: ✅ Track A Complete and Ready for Testing  
**Last Updated**: 2026-06-13
