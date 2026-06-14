# Track C: Full Integration Plan

**Objective**: Connect Track A (furnace operations) + Track B (disasters/healing/NPCs) into cohesive game systems

**Scope**: 4 parallel integration components  
**Estimated Time**: 6-8 hours  
**Deliverable**: Fully playable alchemy lab simulation with emergent gameplay

---

## C1: Danger Integration System (2-3 hours)

### Goals
- Furnace operations can trigger disasters
- Danger probability based on materials + temperature + durability
- Player choice dialog when danger occurs
- Consequences applied (damage, material loss)

### Implementation Tasks

**C1.1: Danger Probability Calculation**
```javascript
// In FurnaceOperation.tick()
_calculateDangerProbability(materials, currentTemp, targetTemp, furnaceDurability) {
  // Base probability: 5%
  let prob = 0.05;
  
  // Temperature stability increases risk
  const tempVariance = Math.abs(currentTemp - targetTemp);
  if (tempVariance > 20) prob += 0.05 * (tempVariance / 50);  // +5% per 50°C variance
  
  // Material hazards increase risk
  for (const mat of materials) {
    const disasters = getPotentialDisasters([mat.id], currentTemp, furnaceDurability);
    if (disasters.length > 0) {
      prob += 0.03 * disasters.length;  // +3% per potential disaster
    }
  }
  
  // Furnace durability decreases safety
  if (furnaceDurability < 50) prob += 0.05;  // +5% if damaged
  if (furnaceDurability < 30) prob += 0.10;  // +10% more if very damaged
  
  return Math.min(prob, 0.5);  // Cap at 50% per tick
}
```

**C1.2: Danger Triggering in Tick**
- Each tick, roll random number against danger probability
- If triggered, select from potential disasters
- Store danger event on operation object
- Pause operation and show choice dialog

**C1.3: Consequence Application**
When player chooses to continue:
- Apply damage to hero HP
- Reduce materials by loss percentage
- Damage furnace durability (15-30 points)
- Reduce operation efficiency (more ticks needed)

When player chooses to abort:
- Lose all materials in operation
- Return to lab menu
- Mark operation as failed

**C1.4: NPC Assignment to Lab**
Track which NPCs are in furnace chamber during operation:
- If danger occurs while NPC present, mark NPC with damage condition
- NPC becomes unavailable until healed
- Adds consequence: can't get help from injured NPCs

### Code Changes
**File**: `js/alchemical_integration.js`
- Add `_calculateDangerProbability()` to FurnaceOperation
- Add danger triggering to `tick(dt)` method
- Add `getDangerChoice()` method returning options
- Add `resolveDanger(choice)` method applying consequences

**File**: `js/main.js`
- When danger triggered, show choice dialog
- Wire choice callbacks to resolveDanger()
- Update furnace durability tracking
- Show danger consequence messages

---

## C2: NPC Health & Healing Integration (1-2 hours)

### Goals
- NPCs can be damaged by furnace dangers
- Players can heal NPCs using healing items
- NPC health affects dialogue and quest availability
- Reputation changes based on healing

### Implementation Tasks

**C2.1: NPC Assignment in Castle**
```javascript
// In castle menu, track which NPCs are in furnace chamber
_assignNPCToRoom(roomId, npc) {
  if (!this.npc_room_assignments) this.npc_room_assignments = {};
  this.npc_room_assignments[npc.id] = roomId;
}

_getNPCsInRoom(roomId) {
  return Object.entries(this.npc_room_assignments)
    .filter(([npcId, room]) => room === roomId)
    .map(([npcId]) => this.NPCs[npcId]);
}
```

**C2.2: Danger Damage to NPCs**
When danger occurs:
- Get NPCs assigned to room
- Apply damage to each NPC present
- NPCs become conditionally available
- Show messages: "[NPC Name] is hurt!"

**C2.3: Healing Mechanic UI**
Add option to castle menu: "Treat Wounded"
- Show list of sick/injured NPCs
- For each NPC, show conditions they have
- Player selects healing item to apply
- Healing item consumed from inventory
- NPC health improved

**C2.4: NPC Dialogue Integration**
Modify NPC speech based on health:
- Healthy NPC: Normal dialogue
- Sickened NPC: "I feel unwell..." dialogue
- Injured NPC: "I can barely stand..." dialogue
- Critical NPC: Won't work, needs immediate healing

Update quest offering:
- King/Queen only offer quests if healthy
- Sick patron can't receive workers
- Missing patron means no furnace access

**C2.5: Reputation System**
Track reputation with each NPC:
- Start at 0
- +10 if you heal them
- -5 if they get damaged and you don't heal
- +5 for completing their quests
- Reputation affects:
  - Dialogue tone (friendly vs cold)
  - Quest rewards (better rewards for high rep)
  - Material prices (friendly NPCs give discounts)

### Code Changes
**File**: `js/castle_interior.js`
- Add NPC room assignment tracking
- Add reputation dictionary per NPC
- Update NPC dialogue based on health state
- Add canOfferQuest() method checking health

**File**: `js/main.js`
- Add "Treat Wounded" menu option
- Healing item selection UI
- Apply healing to selected NPC
- Consume healing item from inventory
- Update reputation

---

## C3: Quest Completion & Rewards (1-2 hours)

### Goals
- Furnace operations complete emblem quests
- Multiple quest paths all work
- Rewards properly awarded
- Quest chain progression enabled

### Implementation Tasks

**C3.1: Operation-to-Quest Matching**
```javascript
// In FurnaceOperation.onComplete()
_checkQuestCompletion(hero) {
  const activeQuests = hero.quests || [];
  
  for (const quest of activeQuests) {
    const questDef = QUEST_BY_ID[quest.id];
    if (!questDef) continue;
    
    const obj = questDef.objective;
    
    // Match operation type to objective kind
    if (obj.kind === 'furnace_operation' && 
        obj.operation === this.operationId) {
      return quest.id;  // Quest complete!
    }
    
    if (obj.kind === 'furnace_sequence' &&
        obj.operations.includes(this.operationId)) {
      quest.completed_operations = (quest.completed_operations || []);
      quest.completed_operations.push(this.operationId);
      if (quest.completed_operations.length >= obj.operations.length) {
        return quest.id;  // Sequence complete!
      }
    }
    
    // Other objective kinds...
  }
  
  return null;  // No quest matched
}
```

**C3.2: Quest Completion Flow**
When furnace operation completes:
1. Check for matching active quests
2. If match found, mark quest complete
3. Remove from hero.quests array
4. Calculate and award rewards
5. Show completion message with rewards
6. Update quest stats

**C3.3: Reward Calculation**
Apply multipliers based on:
- Difficulty/success rate
- NPC reputation (better rep = better rewards)
- Court patronage (different courts pay different)
- Skill level (higher alchemy skill = higher rewards)

```javascript
// Base reward * multipliers
const repBonus = 1 + (npc_reputation / 100) * 0.2;  // +20% max
const courtBonus = court.reward_multiplier || 1.0;   // varies by court
const skillBonus = 1 + (hero.alchemy_skill / 5) * 0.3; // +30% at max skill

const gold = baseGold * repBonus * courtBonus * skillBonus;
```

**C3.4: Quest Progression Tracking**
Add to hero object:
- `completed_emblems`: array of emblem IDs completed
- `emblem_phase`: current phase (foundation, purification, etc.)
- `skill_unlocks`: special abilities gained

Quest chains:
- Emblem 1 unlocks Emblem 2 options
- Certain skills required for advanced quests
- Multi-quest chains (e.g., "prove yourself" then "advanced operation")

### Code Changes
**File**: `js/alchemical_integration.js`
- Add `_checkQuestCompletion(hero)` to FurnaceOperation
- Add `_calculateRewards(questDef, hero, npc)` method
- Wire completion to quest system

**File**: `js/main.js`
- When operation completes, check for quest match
- Award rewards and show message
- Update hero quest tracking
- Enable progression checking

---

## C4: Economic Systems & Scarcity (2-3 hours)

### Goals
- Material scarcity creates meaningful choices
- Furnace durability degrades with use
- Reputation affects prices and access
- Court differences matter economically

### Implementation Tasks

**C4.1: Furnace Durability System**
```javascript
// In Furnace class
tick(dt, operationRunning) {
  // Normal temperature changes
  this._adjustTemperature(dt);
  
  // Durability degrades during operation
  if (operationRunning) {
    const degradationRate = 0.1 * (this.temperature / 100);  // Hotter = faster wear
    this.durability -= degradationRate * dt;
    
    // Extra wear from dangers
    if (recent_danger) {
      this.durability -= 5;  // Danger causes 5-point hit
    }
  }
  
  // Passive cooling improves durability slightly (maintenance)
  if (!operationRunning && this.temperature < 50) {
    this.durability = Math.min(this.durability + 0.05 * dt, 100);
  }
  
  this.durability = Math.max(this.durability, 0);
}
```

**C4.2: Furnace Maintenance**
Add castle option: "Repair Furnace"
- Cost: 50-100 gold depending on damage level
- Increases durability by 30-50 points
- Essential to keep using furnace effectively

Efficiency penalty for damaged furnace:
- Below 50% durability: operations take 1.2x longer
- Below 30% durability: operations take 1.5x longer + more dangerous
- Below 10% durability: furnace breaks, can't use

**C4.3: Material Scarcity**
Implement material availability:
```javascript
// Per-court material pricing
const COURT_MATERIALS = {
  prague: {
    common: { price: 10, availability: 0.8 },  // 80% chance available
    rare: { price: 50, availability: 0.4 },
  },
  england: {
    common: { price: 12, availability: 0.7 },
    rare: { price: 40, availability: 0.5 },  // James I harder to get rare materials
  },
  hesse_kassel: {
    common: { price: 8, availability: 0.9 },
    rare: { price: 60, availability: 0.6 },  // Moritz charges premium
  }
}
```

Materials not in stock:
- "Out of stock" at trading post
- Must wait until next market day (game turn)
- Or travel to different court (with reputation cost)

**C4.4: Dynamic Pricing**
Material prices affected by:
- Supply (if many players buying, price rises)
- Reputation (good rep = better prices, up to -20%)
- Court preference (courts prefer certain materials, pay more)
- Rarity (rare materials cost more)

```javascript
function getMaterialPrice(material, court, heroReputation) {
  const basePrice = MATERIALS[material].value;
  const courtMultiplier = court.material_price_mult || 1.0;
  const repDiscount = heroReputation > 50 ? (1 - (heroReputation - 50) / 250) : 1.0;
  
  return Math.ceil(basePrice * courtMultiplier * repDiscount);
}
```

**C4.5: Healing Item Economy**
Healing items:
- Can be purchased at higher cost (2-3x crafting cost)
- Or crafted if you have knowledge
- Rarer items more expensive
- Healing sick NPCs improves reputation, unlocks better prices

Trading economy:
- Sell excess materials for gold
- Buy healing items for NPC health
- Furnace maintenance required for continued use
- Material scarcity forces strategic choices

**C4.6: Court Differences**
Each court has different economic profile:
```javascript
const COURT_ECONOMY = {
  prague: {
    reward_multiplier: 1.0,        // Standard rewards
    material_scarcity: 'high',     // Rare materials hard to find
    maintenance_cost: 1.0,          // Standard repairs
    reputation_favor: 0.7,          // Harder to get good reputation
    unlock_rare_materials: false,   // Some materials locked until high rep
  },
  england: {
    reward_multiplier: 0.8,        // Lower rewards
    material_scarcity: 'extreme',  // Very hard to get materials
    maintenance_cost: 1.2,         // Expensive repairs
    reputation_favor: 0.9,         // Easier to gain rep
    unlock_rare_materials: true,   // Some materials available if you prove skill
  },
  hesse_kassel: {
    reward_multiplier: 0.9,        // Lower rewards
    material_scarcity: 'low',      // Easy to get materials
    maintenance_cost: 0.8,         // Cheap repairs
    reputation_favor: 1.0,         // Very easy to gain rep
    unlock_rare_materials: true,   // More materials available early
  }
}
```

### Code Changes
**File**: `js/furnace_system.js`
- Add durability property to Furnace class
- Add durability degradation in tick()
- Add maintenance repair method

**File**: `js/alchemical_materials.js`
- Add pricing information to materials
- Add rarity tiers
- Add court-specific availability

**File**: `js/castle_interior.js`
- Add repair option to castle menu
- Track material inventory per castle
- Implement dynamic pricing
- Add market day refresh logic

**File**: `js/main.js`
- Show material costs in trading menu
- Show furnace durability status
- Add repair option UI
- Apply reputation-based discounts

---

## Integration Testing Checklist

### C1 Tests (Danger System)
- [ ] Furnace operation ticks properly
- [ ] Danger triggers based on temperature/materials
- [ ] Choice dialog appears on danger
- [ ] Abort loses materials
- [ ] Continue takes damage and damages furnace
- [ ] Nearby NPCs take damage from danger

### C2 Tests (NPC Health)
- [ ] NPCs in room take damage from dangers
- [ ] NPC dialogue changes based on health
- [ ] Healing item cures NPC condition
- [ ] Healing increases reputation
- [ ] Sick NPC won't offer quests

### C3 Tests (Quest Completion)
- [ ] Furnace operation completes matching quest
- [ ] Quest rewards awarded correctly
- [ ] Multiple quest variants all work
- [ ] Quest progression unlocks new quests
- [ ] Reputation affects quest rewards

### C4 Tests (Economics)
- [ ] Furnace durability degrades during operation
- [ ] Furnace durability below 50% makes operations slower
- [ ] Repair option increases durability
- [ ] Material prices vary by court
- [ ] Material scarcity forces choices
- [ ] Reputation affects prices (discount shown)
- [ ] Court differences create different gameplay

### End-to-End Tests
- [ ] Full game loop: castle → furnace → operation → danger → consequence → healing → quest complete → rewards
- [ ] Multiple operations in sequence
- [ ] Furnace degradation over time
- [ ] Different courts have different feel
- [ ] Emergent strategies (skip expensive materials, heal NPCs for rep, etc.)

---

## Success Criteria

✅ **All 4 components implemented and integrated**
- Danger triggers appropriately
- NPCs can be damaged and healed
- Quests complete on operation finish
- Economic systems create scarcity

✅ **Emergent gameplay**
- Player choices matter (abort vs. continue)
- Resource management required (repairs, healing)
- Multiple strategies possible (cheap materials vs. rare, farm rep, etc.)
- Consequences stack (one bad furnace = spiral of problems)

✅ **No game-breaking bugs**
- No quest locks (always escape path)
- No infinite loops (materials eventually required)
- No impossible states (can always earn enough gold)
- Graceful degradation (can continue even if furnace broken)

---

## Parallel Agent Assignments

**Agent C1**: C1 (Danger Integration)
- Implement danger probability and triggering
- Hook into FurnaceOperation
- Consequence application

**Agent C2**: C2 (NPC Integration)  
- Track NPC assignments to rooms
- Damage NPCs from dangers
- Healing mechanic UI

**Agent C3**: C3 (Quest Completion)
- Operation-to-quest matching
- Reward calculation
- Quest progression

**Agent C4**: C4 (Economic Systems)
- Furnace durability system
- Material scarcity simulation
- Dynamic pricing
- Court economic differences

All can work in parallel with minimal conflicts via clear data structures.

