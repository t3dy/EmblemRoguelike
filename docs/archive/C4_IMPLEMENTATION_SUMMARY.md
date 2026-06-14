# C4 Economic Systems Implementation Summary

## Overview
Track C4 (Economic Systems) has been fully implemented, adding furnace durability mechanics, material scarcity, dynamic pricing, and court-specific economies to the game.

## Files Created

### 1. `js/court_economy.js` (NEW)
Complete economic system for managing court-specific pricing, material availability, and market mechanics.

**Exports:**
- `COURT_ECONOMY` object defining 3 courts:
  - **Prague**: Balanced (1.0 multiplier, 80% common availability)
  - **England**: Harsh (1.2 cost multiplier, 70% common availability)
  - **Hesse-Kassel**: Prosperous (0.9 cost multiplier, 90% common availability)

- `MATERIAL_RARITY_TIERS`: Rarity multipliers (1.0 to 5.0)

**Key Functions:**
- `calculateMaterialPrice(basePrice, courtId, heroReputation, rarity)` — Computes final price with court + reputation + rarity multipliers
- `isMaterialAvailable(courtId, rarity)` — Probabilistic availability check
- `calculateRepairCost(durability, courtId)` — Furnace repair cost formula
- `getSeasonalAdjustment(gameTime, courtId)` — Seasonal price/availability effects
- `getEconomicDescription(courtId, heroReputation)` — Human-readable economic flavor text

## Files Modified

### 2. `js/furnace_system.js`
Enhanced with durability degradation, efficiency penalties, and maintenance mechanics.

**Changes:**
- **`tick(dt)`**: 
  - Added durability degradation: `0.1 * (currentTemp / 100) * dt`
  - Added passive recovery when idle and cool: `+0.05 * dt` durability
  - Durability clamped to [0, 100]

- **`startOperation(operationId, materials)`**:
  - Added check: furnace broken if `durability < 10` (returns error)
  - Stores `durabilityAtStart` on vessel for tracking

- **`tickOperation()`**:
  - Applied efficiency penalties based on durability:
    - Below 50%: 20% slower (1.2x duration multiplier)
    - Below 30%: 50% slower (1.5x duration multiplier)
  - Immediate `-5 durability` penalty when danger occurs

- **`repair()`**:
  - Simplified: restores durability to exactly 80%

### 3. `js/castle_interior.js`
Added material availability tracking, market refresh mechanics, and updated repair system.

**Changes:**
- **Constructor**: 
  - Added `available_materials` initialization
  - Added `market_ticks` and `market_refresh_interval` tracking

- **New methods**:
  - `_initializeMaterialAvailability()` — Court-specific material availability map
  - `refreshMaterialAvailability()` — Reroll availability percentages
  - `tickMarket()` — Periodic refresh of material stock
  - `isMaterialAvailable(rarity)` — Check if material is in stock this market day

- **`repairFurnace(roomId)`**:
  - Changed signature: no gold parameter (calculated internally)
  - Uses `calculateRepairCost()` from court_economy
  - Returns result object with success flag, cost, message, and new durability

- **Import**: Added `import { calculateRepairCost } from './court_economy.js'`

### 4. `js/main.js`
Integrated repair UI, furnace durability display, and economic calculations.

**Changes:**
- **Imports**: Added court_economy functions
  
- **`_showFurnaceMenu(roomId)`**:
  - Displays current furnace durability percentage
  - Shows repair cost in menu header
  - Added conditional repair button if durability < 100%
  - Filters out null options properly

- **New method `_showRepairConfirm(roomId, currentDurability)`**:
  - Calculates and displays repair cost
  - Checks hero has sufficient gold
  - Confirms action with two-option dialog
  - Applies gold cost and restores durability to 80%
  - Shows success message

## Implementation Details

### Furnace Durability System
**Degradation Formula**: `degradation = 0.1 * (currentTemp / 100) * dt`
- Example: At 100°C, `0.1` durability/tick
- At 200°C (max), `0.2` durability/tick
- Encourages shorter operations and temperature management

**Passive Recovery**: `recovery = 0.05 * dt`
- Only when: `temperature < 50°C` and `!vessel`
- Very slow (20 ticks to recover 1%)
- Rewards letting furnace cool down between operations

**Efficiency Penalties**:
| Durability | Multiplier | Effect |
|----------|----------|--------|
| > 50% | 1.0x | Normal speed |
| 30-50% | 1.2x | 20% slower |
| < 30% | 1.5x | 50% slower |
| < 10% | Broken | Can't start operations |

**Danger Penalty**: `-5 durability` immediately when danger occurs

### Material Pricing Formula
```
finalPrice = basePrice * court_multiplier * (1 - reputation_discount) * rarity_multiplier
```

**Components**:
- **Court multiplier**: Prague 1.0, England 1.2, Hesse-Kassel 0.9
- **Reputation discount**: 0% at 0 rep, up to -20% at 100 rep
- **Rarity multiplier**: Common 1.0, Uncommon 1.5, Rare 2.0, Very Rare 3.0, Legendary 5.0

**Examples**:
- Vitriol (15 base, common) at Prague with 50 rep: 15 * 1.0 * 0.9 * 1.0 = 13.5 gold
- Mercury (40 base, uncommon) at England with 0 rep: 40 * 1.2 * 1.0 * 1.5 = 72 gold

### Material Availability System
Each court has different availability percentages by rarity:
- Prague: Common 80%, Uncommon 60%, Rare 40%, Very Rare 20%
- England: Common 70%, Uncommon 50%, Rare 30%, Very Rare 10%
- Hesse-Kassel: Common 90%, Uncommon 75%, Rare 60%, Very Rare 35%

**Market Refresh**:
- Prague: Every 50 ticks
- England: Every 60 ticks (slower)
- Hesse-Kassel: Every 40 ticks (faster)

When materials are unavailable, merchant shows "Out of stock" message and player must wait for next market day.

### Repair System
**UI Flow**:
1. Player views furnace chamber menu
2. Durability percentage displayed in header
3. "Repair the Furnace" option shown if durability < 100%
4. Click to show confirmation dialog with cost
5. Gold deducted, durability restored to 80%

**Cost Formula**: `25 + (100 - durability) * 0.5 * court_multiplier`
- At 100% durability: ~25 gold (minimal wear)
- At 50% durability: ~50 gold (moderate)
- At 0% durability: ~75 gold (critical)
- England multiplies by 1.2, Hesse-Kassel by 0.8

## Testing Notes

### Syntax Verification
All files pass Node.js syntax check:
- ✓ court_economy.js
- ✓ furnace_system.js
- ✓ castle_interior.js
- ✓ main.js

### Key Features to Test
1. **Furnace degradation**: Run a high-temp operation and watch durability decrease
2. **Efficiency penalties**: Complete same operation at 40% durability vs 90% durability
3. **Danger impacts**: Trigger a danger and verify `-5 durability` applied
4. **Repair UI**: Check furnace menu shows durability and repair cost correctly
5. **Material availability**: Switch courts and verify different materials are available
6. **Pricing**: Check material prices vary by court and reputation

## Strategic Implications

### For Players
- Must balance operation length against furnace wear
- Longer operations at high heat are expensive to maintain
- Can mitigate wear with passive cooling between operations
- Different courts offer different economic opportunities:
  - Prague: Middle ground, good for balanced approach
  - England: Expensive but challenging (rewards skilled play)
  - Hesse-Kassel: Resource-rich but lower quest rewards

### For Game Design
- Creates long-term resource management layer
- Encourages meaningful choices about which operations to perform
- Courts become distinct not just narratively but mechanically
- Material scarcity adds dynamic strategic element

## Future Expansions (Not Implemented)
- NPC assignment to rooms during operations (affects danger risk)
- Seasonal material price fluctuations
- One-time shortage events
- Equipment upgrades for furnace efficiency
- Guild/trader reputation system

