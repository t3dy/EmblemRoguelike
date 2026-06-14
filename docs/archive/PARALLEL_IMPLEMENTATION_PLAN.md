# Parallel Implementation Plan — Furnace Ops + Alchemy Lab Sim

**Status**: Ready for parallel development  
**Target**: Full alchemy lab simulation for emblem quests  
**Effort**: ~15 hours across two tracks

---

## Track A: Furnace Operation Mechanics (UI + Tracking)

### Goals
- Complete furnace operation lifecycle in game
- Show temperature/fuel/progress UI
- Handle operation completion and danger events
- Link to emblem quest completion

### Implementation Tasks

**A1: Operation State Management** (js/alchemical_integration.js hook)
```javascript
class FurnaceOperation {
  constructor(operationId, materials, targetTemp) {
    this.operationId = operationId;
    this.materials = materials;        // [{ id, qty }, ...]
    this.targetTemp = targetTemp;      // 20-200°C
    this.progress = 0;                 // 0-100%
    this.duration = 3000;              // game ticks
    this.status = 'running';           // running|completed|aborted|failed
    this.dangers = [];                 // triggered dangers
  }
  
  tick(dt) {
    this.progress = Math.min(100, this.progress + (dt / this.duration) * 100);
    // Check for dangers each tick
    // Handle completion when progress >= 100
  }
}
```

**A2: Furnace UI Panel** (js/ui.js)
- Temperature gauge (current vs. target, visual feedback)
- Fuel bar (how much charcoal remains)
- Operation progress bar (% complete)
- Danger alert indicator (red warning when danger triggered)
- Material list (what's in the crucible)
- Timer (estimated completion time)

**A3: Danger Event System** (integrate with A1)
- Probabilistic danger triggers based on:
  - Temperature stability (variance from target)
  - Material interactions (some combinations more risky)
  - Furnace durability (damaged furnaces more dangerous)
- Consequences when triggered:
  - Pause operation + show choice dialog
  - Player chooses: abort (lose materials) or continue (take damage)

**A4: Quest Completion Hook** (js/main.js)
- When furnace operation completes, check for matching emblem quest
- If quest requires `furnace_operation: dissolution` and dissolution completed → mark quest complete
- Show quest completion message and rewards

**A5: Multiple Furnaces** (js/main.js)
- Track which furnace is active (furnace_chamber, distillery, etc.)
- Each room has different furnaces with different capabilities
- Different equipment → different success rates

---

## Track B: Disasters & Healing System

### Goals
- Implement 20 disaster card mechanics
- NPC health state tracking
- Healing potion mechanics
- Economic integration

### Implementation Tasks

**B1: Disaster Card Database** (new file: js/disaster_cards.js)
```javascript
export const DISASTERS = {
  hydrochloric_acid_spill: {
    id: 'hydrochloric_acid_spill',
    name: 'Hydrochloric Acid Spill',
    description: 'A worker gets burned by acid fumes.',
    trigger: { hazardous_materials: ['vitriol'], heat_range: [60, 200] },
    effect: { worker_state: 'injured', damage: 15 },
    healing: { item: 'sodium_bicarbonate', potency: 10 }
  },
  // ... 19 more
}
```

**B2: NPC Health State System** (extend castle_interior.js)
```javascript
class CastleNPC {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.health_state = 'healthy'; // healthy|sickened|injured|critical
    this.hp = 100;
    this.conditions = [];           // ['mercury_poisoning', 'acid_burn', ...]
  }
  
  takeDamage(type, amount) {
    // Determine health state based on damage
    // Track specific conditions
  }
  
  heal(healingItem, potency) {
    // Reduce conditions, restore health
  }
}
```

**B3: Healing Potion Crafting** (extend alchemical_materials.js)
```javascript
export const HEALING_ITEMS = {
  sodium_bicarbonate: {
    id: 'sodium_bicarbonate',
    name: 'Sodium Bicarbonate',
    heals: ['acid_burn', 'hydrochloric_exposure'],
    potency: 10
  },
  activated_charcoal: {
    id: 'activated_charcoal',
    name: 'Activated Charcoal',
    heals: ['mercury_poisoning', 'mercury_fumes', 'chloroform'],
    potency: 15
  },
  // ... extend to 20 healing items
}
```

**B4: Danger Triggering During Operations** (js/furnace_system.js)
- When operation running, roll for dangers each tick
- Probability increases with:
  - High temperature variance (instability)
  - Hazardous material combinations
  - Low furnace durability
- When triggered, show consequence dialog to player

**B5: NPC Dialogue Integration** (extend castle_interior.js)
```javascript
// When player interacts with sick NPC
if (npc.health_state !== 'healthy') {
  // Show dialogue about their condition
  // Offer healing option if player has healing potion
  // Reputation increases if healed
}
```

**B6: Healing Mechanic UI** (js/main.js)
- When NPC is sick, show "Treat" option in castle menu
- Choose healing potion from inventory
- Show outcome (success/partial/failure)
- NPC returns to healthy state or improves

---

## Track C: Integration & Feedback Loop

### Goals
- Ensure A and B systems communicate
- Create emergent gameplay from both systems

### Integration Points

**C1: Danger Consequences Flow**
```
Furnace Operation (A) 
  → Danger Event Triggered (B1)
    → Player Chooses Action (A3)
      → Operation Continues/Aborts (A1)
        → If NPC in lab, mark health state (B2)
          → Quest updated if needed (A4)
```

**C2: Economic Loop**
```
Furnace Produces Yields (A4)
  → Player Gets Materials (A4)
    → Can Craft Healing Potions (B3)
      → Can Heal Sick NPCs (B5)
        → Increased Reputation (B5)
          → Better Quest Rewards / Material Access (A4)
```

**C3: Multi-Operation Scenarios**
- Running furnace in one room while NPC gets sick in another
- Manage lab priorities (continue operation vs. heal worker)
- Equipment damage from danger affects future operations

---

## File Structure

### New Files to Create
- `js/disaster_cards.js` — 20 disaster definitions
- `js/healing_items.js` — 20 healing potion/item definitions

### Files to Modify
- `js/main.js` — Furnace UI rendering, operation loop, danger dialog
- `js/furnace_system.js` — Danger probability, operation state
- `js/alchemical_integration.js` — Operation lifecycle, quest hookup
- `js/castle_interior.js` — NPC health states, healing mechanics
- `js/alchemical_materials.js` — Add healing items to materials

### Reference Files
- `js/emblem_quests.js` — Quest objectives (unchanged, just used)
- `js/ui.js` — Add furnace panel rendering function

---

## Implementation Order (Parallel)

### Parallel Round 1 (Agent A + B simultaneously)
- **Agent A**: A1, A2 — Operation state management + basic UI
- **Agent B**: B1, B3 — Disaster definitions + healing items

### Parallel Round 2
- **Agent A**: A3, A4 — Danger system + quest hookup
- **Agent B**: B2, B5 — NPC health states + dialogue integration

### Sequential (after both ready)
- **Agent C**: C1, C2, C3 — Integration testing and feedback loops

---

## Testing Checkpoints

### After Round 1
- [ ] Furnace UI appears when entering lab
- [ ] Temperature gauge responds to player input
- [ ] Disaster cards database loads without errors
- [ ] Healing items display in inventory

### After Round 2
- [ ] Operation progresses and completes
- [ ] Danger event triggers during operation
- [ ] NPC health state changes after danger
- [ ] Player can heal NPC using potion

### After Round 3
- [ ] Quest completes when furnace operation finishes
- [ ] Multiple furnaces work independently
- [ ] Reputation changes from healing NPCs
- [ ] Material scarcity affects operation choices

---

## Deliverables

**Code Quality**
- [ ] No syntax errors
- [ ] Proper module exports/imports
- [ ] Consistent naming conventions
- [ ] Comments on complex logic

**Documentation**
- [ ] Function signatures documented
- [ ] Game flow documented
- [ ] Edge cases noted
- [ ] Integration points clear

**Testing**
- [ ] Manual play-through works
- [ ] No breaking changes to existing systems
- [ ] Edge cases handled (no materials, furnace broken, etc.)

---

## Success Criteria

✅ **Track A Complete When**:
- Player can enter lab, see furnace UI
- Can start operation with materials
- Operation progresses and completes
- Emblem quest updates on completion

✅ **Track B Complete When**:
- Danger events trigger during operations
- NPCs show health state
- Player can heal NPCs
- Healing items consumed from inventory

✅ **Integrated When**:
- Both systems work together without conflicts
- Emergent gameplay (dangers matter, healing necessary)
- All 20 disaster cards functional
- Multiple quests can be run through lab system

