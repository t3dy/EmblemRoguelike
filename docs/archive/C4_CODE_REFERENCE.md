# C4 Economic Systems Code Reference

## Quick Integration Guide

### Using Material Pricing
```javascript
import { calculateMaterialPrice } from './court_economy.js';

// In merchant or trading code:
const basePrice = MATERIALS['vitriol'].value;  // 15
const courtId = castle.courtType;              // 'prague', 'england', 'hesse_kassel'
const heroReputation = hero.reputation;        // 0-100
const rarity = MATERIALS['vitriol'].rareness;  // 'common', 'uncommon', etc.

const finalPrice = calculateMaterialPrice(basePrice, courtId, heroReputation, rarity);
// Prague, 50 rep, common: 15 * 1.0 * 0.9 * 1.0 = 13.5 gold
```

### Checking Material Availability
```javascript
import { isMaterialAvailable } from './court_economy.js';

const rarity = 'rare';
const courtId = 'prague';

if (isMaterialAvailable(courtId, rarity)) {
  // Material is in stock - can purchase
} else {
  // Material is out of stock this market day
  // Show "Out of stock" message
  // Player must wait for next market day
}
```

### Calculating Furnace Repair Cost
```javascript
import { calculateRepairCost } from './court_economy.js';

const currentDurability = furnace.durability;  // 0-100
const courtId = 'prague';

const cost = calculateRepairCost(currentDurability, courtId);
// At 50% durability at Prague: 25 + (100-50)*0.5*1.0 = 50 gold
// At 50% durability at England: 25 + (100-50)*0.5*1.2 = 55 gold
// At 50% durability at Hesse-Kassel: 25 + (100-50)*0.5*0.8 = 45 gold
```

### Seasonal Pricing Adjustments
```javascript
import { getSeasonalAdjustment } from './court_economy.js';

const gameTime = game.worldTime || 0;  // some time counter
const courtId = 'england';

const { priceAdjustment, availabilityAdjustment } = 
  getSeasonalAdjustment(gameTime, courtId);

// England in winter: priceAdjustment = 1.3, availabilityAdjustment = 0.7
// Apply multipliers to final price and availability checks
const adjustedPrice = finalPrice * priceAdjustment;
```

## Furnace System Integration

### Durability Degradation During Operations
Happens automatically - no manual integration needed.
```javascript
// In Furnace.tick(dt):
const tempNormalized = Math.min(this.temperature / 100, 1);
const degradation = 0.1 * tempNormalized * dt;
```

### Efficiency Penalties Applied Automatically
```javascript
// In Furnace.tickOperation():
let durationMultiplier = 1.0;
if (this.durability < 50) durationMultiplier = 1.2;  // 20% slower
if (this.durability < 30) durationMultiplier = 1.5;  // 50% slower
```

### Danger Penalty (Immediate)
```javascript
// In Furnace.tickOperation(), when dangers array is non-empty:
this.durability = Math.max(0, this.durability - 5);
```

## Castle Integration

### Initialize Material Availability
```javascript
const castle = new Castle('Sun-Castle', 'prague');
// Constructor auto-initializes available_materials
```

### Check If Material Is Available
```javascript
const rarity = MATERIALS['philosophical_water'].rareness;
const available = castle.isMaterialAvailable(rarity);

if (!available) {
  showMessage("Out of stock");
} else {
  // Show material for purchase
}
```

### Refresh Market Stock
```javascript
// Call once per game tick:
castle.tickMarket();
```

### Repair Furnace
```javascript
const result = castle.repairFurnace('furnace_chamber');
if (result.success) {
  hero.gold -= result.cost;
  // Show result.message
}
```

## Court Economic Profiles

### Prague (Balanced)
- Reward multiplier: 1.0
- Material multiplier: 1.0
- Material availability: Common 80%, Rare 40%
- Maintenance cost: 1.0
- Market refresh: 50 ticks

### England (Harsh)
- Reward multiplier: 0.8
- Material multiplier: 1.2
- Material availability: Common 70%, Rare 30%
- Maintenance cost: 1.2
- Market refresh: 60 ticks
- Seasonal: Severe winter effects

### Hesse-Kassel (Prosperous)
- Reward multiplier: 0.9
- Material multiplier: 0.9
- Material availability: Common 90%, Rare 60%
- Maintenance cost: 0.8
- Market refresh: 40 ticks
- Seasonal: Mild winter effects

## Pricing Formula

```
finalPrice = basePrice * court_multiplier * (1 - reputation_discount) * rarity_multiplier
```

Example:
- Vitriol base: 15 gold
- At Prague, 50 reputation, common rarity
- 15 * 1.0 * (1 - 0.1) * 1.0 = 13.5 gold

## Files and Functions Summary

### court_economy.js
- COURT_ECONOMY - Court definitions
- MATERIAL_RARITY_TIERS - Rarity multipliers
- calculateMaterialPrice() - Final price calculation
- isMaterialAvailable() - Availability check
- calculateRepairCost() - Repair cost calculation
- getSeasonalAdjustment() - Seasonal modifiers
- getEconomicDescription() - Flavor text

### furnace_system.js
- Furnace.tick(dt) - Durability degradation + recovery
- Furnace.tickOperation() - Efficiency penalties + danger penalty
- Furnace.startOperation() - Broken furnace check
- Furnace.repair() - Restore to 80%

### castle_interior.js
- Castle._initializeMaterialAvailability() - Court-specific availability
- Castle.refreshMaterialAvailability() - Refresh stock
- Castle.tickMarket() - Periodic market updates
- Castle.isMaterialAvailable(rarity) - Check material stock
- Castle.repairFurnace(roomId) - Furnace maintenance

### main.js
- _showFurnaceMenu(roomId) - Display furnace menu with durability
- _showRepairConfirm() - Repair confirmation dialog
