// castle_interior.js — castle interiors with multiple lab spaces and functions

import { calculateRepairCost } from './court_economy.js';

export class Castle {
  constructor(name = 'Sun-Castle', courtType = 'prague') {
    this.name = name;
    this.courtType = courtType; // prague, england, hesse
    this.patron = this._patronForCourt(courtType);
    this.rooms = this._initializeRooms();
    this.furnaces = this._initializeFurnaces();
    this.NPCs = this._initializeNPCs();
    this.treasury = { gold: 500, materials: {} };
    this.reputation = { with_patron: 0, with_court: 0 };

    // C2: NPC Room Assignment Tracking
    this.npc_room_assignments = {};  // { npcId: roomId }

    // C2: Initialize NPC health and reputation
    this._initializeNPCHealth();

    // C4: Material availability by court
    this.available_materials = this._initializeMaterialAvailability();

    // C4: Market refresh tracking
    this.market_ticks = 0;
    this.market_refresh_interval = 50;
  }

  _patronForCourt(courtType) {
    const patrons = {
      prague: { id: 'rudolf_ii', name: 'Emperor Rudolf II', image: 'npc_emperor', advice: 'The Work is eternal. Succeed, or perish.' },
      england: { id: 'james_i', name: 'King James I', image: 'npc_king', advice: 'Prove thy medicines work, or face exile.' },
      hesse: { id: 'moritz_hesse', name: 'Moritz of Hesse-Kassel', image: 'npc_noble', advice: 'The Rosicrucian truth calls to those who seek.' },
    };
    return patrons[courtType] || patrons.prague;
  }

  _initializeRooms() {
    return {
      // Public areas
      throne_room: { id: 'throne_room', name: 'Throne Room', icon: '👑', occupant: this.patron, actions: ['counsel', 'request_quest'] },
      library: { id: 'library', name: 'Alchemical Library', icon: '📚', actions: ['study_texts', 'gain_knowledge'], books_available: 20 },
      treasury: { id: 'treasury', name: 'Treasury', icon: '💰', actions: ['trade', 'store_materials'] },

      // Lab spaces
      furnace_chamber: {
        id: 'furnace_chamber', name: 'Grand Furnace Chamber', icon: '🔥',
        description: 'High-temperature calcination and distillation',
        equipment: ['furnace', 'retort', 'alembic'],
        supports: ['calcination', 'distillation', 'conjunction'],
        occupant: null,
        state: 'available', // available, in_use, damaged
      },
      distillery: {
        id: 'distillery', name: 'Distillery', icon: '🧪',
        description: 'Separation and purification of essences',
        equipment: ['still', 'condenser', 'flasks'],
        supports: ['distillation', 'sublimation', 'fermentation'],
        occupant: null,
        state: 'available',
      },
      brewhouse: {
        id: 'brewhouse', name: 'Brewhouse', icon: '🍶',
        description: 'Fermentation and slow cooking',
        equipment: ['vats', 'barrels', 'heating_stone'],
        supports: ['fermentation', 'maceration', 'cooking'],
        occupant: null,
        state: 'available',
      },
      glasshouse: {
        id: 'glasshouse', name: "Glassmaker's Workshop", icon: '🔮',
        description: 'Vessel creation and repair; furnace maintenance',
        equipment: ['glass_furnace', 'molds', 'annealing_oven'],
        supports: ['vessel_repair', 'equipment_maintenance'],
        occupant: null,
        state: 'available',
      },
      garden: {
        id: 'garden', name: 'Alchemical Garden', icon: '🌿',
        description: 'Gathering herbs, minerals, plants',
        equipment: ['plants', 'mineral_beds', 'tools'],
        supports: ['gathering', 'plant_processing', 'cultivation'],
        occupant: null,
        state: 'available',
      },
      storage: {
        id: 'storage', name: 'Material Storage', icon: '📦',
        description: 'Safe storage of materials and completed items',
        equipment: ['shelves', 'clay_vessels', 'sealed_boxes'],
        supports: ['storage', 'organization'],
        occupant: null,
        state: 'available',
      },

      // Private/restricted
      chamber: { id: 'chamber', name: 'Private Chamber', icon: '🛏️', actions: ['rest', 'save'], safe: true },
      underground_lab: { id: 'underground_lab', name: 'Hidden Underground Lab', icon: '⚗️', locked: true, security: 'high' },
    };
  }

  _initializeFurnaces() {
    // Each significant room can have a furnace; main one is in furnace_chamber
    return {
      main: {
        location: 'furnace_chamber',
        fuel: 20,
        temperature: 20,
        targetTemp: 20,
        durability: 100,
        vessel: null,
      },
      auxiliary: {
        location: 'distillery',
        fuel: 10,
        temperature: 20,
        targetTemp: 20,
        durability: 80,
        vessel: null,
      },
      brewhouse_heat: {
        location: 'brewhouse',
        fuel: 15,
        temperature: 20,
        targetTemp: 20,
        durability: 90,
        vessel: null,
      },
    };
  }

  _initializeNPCs() {
    return {
      patron: { id: this.patron.id, name: this.patron.name, role: 'patron', location: 'throne_room', disposition: 'neutral' },
      master_alchemist: { id: 'master_alchemist', name: 'Master Cornelius', role: 'mentor', location: 'furnace_chamber', disposition: 'helpful' },
      court_physician: { id: 'court_physician', name: 'Doctor Paracelsus', role: 'scholar', location: 'library', disposition: 'curious' },
      material_trader: { id: 'material_trader', name: 'Merchant Tomas', role: 'trader', location: 'treasury', disposition: 'greedy' },
      apprentice: { id: 'apprentice', name: 'Young Wilhelm', role: 'student', location: 'furnace_chamber', disposition: 'eager' },
    };
  }

  // C2: Initialize NPC health and reputation
  _initializeNPCHealth() {
    for (const [key, npc] of Object.entries(this.NPCs)) {
      npc.health_state = 'healthy';  // healthy, sickened, injured, critical
      npc.hp = 100;
      npc.max_hp = 100;
      npc.conditions = [];  // array of condition IDs
      npc.reputation = 0;   // 0-100 base, can go higher
    }
  }

  // C4: Initialize material availability by court
  // Each material has a percentage chance to be in stock this market day
  _initializeMaterialAvailability() {
    const availability = {
      prague: { common: 0.80, uncommon: 0.60, rare: 0.40, very_rare: 0.20 },
      england: { common: 0.70, uncommon: 0.50, rare: 0.30, very_rare: 0.10 },
      hesse_kassel: { common: 0.90, uncommon: 0.75, rare: 0.60, very_rare: 0.35 },
    };
    return availability[this.courtType] || availability.prague;
  }

  // C4: Refresh material availability (called periodically)
  refreshMaterialAvailability() {
    this.available_materials = this._initializeMaterialAvailability();
  }

  // ---- ROOM NAVIGATION ----
  getAvailableRooms() {
    return Object.values(this.rooms).filter(r => !r.locked || this.hasAccessTo(r.id));
  }

  hasAccessTo(roomId) {
    const room = this.rooms[roomId];
    if (!room) return false;
    if (room.locked) {
      if (roomId === 'underground_lab') return this.reputation.with_patron > 50;
    }
    return true;
  }

  // ---- C2: NPC ROOM ASSIGNMENT ----
  assignNPCToRoom(npcId, roomId) {
    const npc = this.getNPC(npcId);
    if (!npc) return false;
    this.npc_room_assignments[npcId] = roomId;
    return true;
  }

  removeNPCFromRoom(npcId) {
    if (this.npc_room_assignments[npcId]) {
      delete this.npc_room_assignments[npcId];
      return true;
    }
    return false;
  }

  getNPCsInRoom(roomId) {
    return Object.entries(this.npc_room_assignments)
      .filter(([npcId, room]) => room === roomId)
      .map(([npcId]) => this.getNPC(npcId))
      .filter(npc => npc !== null);
  }

  // ---- FURNACE OPERATIONS ----
  getFurnaceAtLocation(location) {
    for (const [key, furnace] of Object.entries(this.furnaces)) {
      if (furnace.location === location) return furnace;
    }
    return null;
  }

  canStartOperation(roomId, operationId) {
    const room = this.rooms[roomId];
    if (!room) return { allowed: false, reason: 'Room not found' };
    if (!this.hasAccessTo(roomId)) return { allowed: false, reason: 'Access denied' };
    if (!room.supports || !room.supports.includes(operationId)) {
      return { allowed: false, reason: `${operationId} not supported in ${room.name}` };
    }
    const furnace = this.getFurnaceAtLocation(roomId);
    if (!furnace) return { allowed: false, reason: 'No furnace in this room' };
    if (furnace.vessel) return { allowed: false, reason: 'Furnace already in use' };
    return { allowed: true };
  }

  // ---- REPUTATION & PATRONAGE ----
  earnReputation(amount, type = 'with_patron') {
    this.reputation[type] = Math.min(100, this.reputation[type] + amount);
  }

  loseReputation(amount, type = 'with_patron') {
    this.reputation[type] = Math.max(-50, this.reputation[type] - amount);
  }

  getPatronAdvice(embarked_questId) {
    // Patron occasionally offers guidance or rebukes
    if (this.reputation.with_patron < 0) {
      return `${this.patron.name} glares: "Your failures displease me. Redeem yourself—or leave."`;
    }
    if (this.reputation.with_patron > 70) {
      return `${this.patron.name} nods: "You show promise. Continue your great work."`;
    }
    return `${this.patron.name} observes: "The Work proceeds. Mind your materials."`;
  }

  // ---- NPC INTERACTIONS ----
  getNPC(npcId) {
    return this.NPCs[npcId] || null;
  }

  // C2: Get dialogue based on NPC health state
  speakToNPC(npcId) {
    const npc = this.getNPC(npcId);
    if (!npc) return null;

    // Check health state first
    if (npc.health_state === 'critical') {
      return 'Someone... help me... I can barely...';
    }
    if (npc.health_state === 'injured') {
      const injuredLines = [
        'I... I can barely stand...',
        'Everything hurts. Please, I need rest.',
        'My wounds pain me greatly...',
      ];
      return injuredLines[Math.floor(Math.random() * injuredLines.length)];
    }
    if (npc.health_state === 'sickened') {
      const sickLines = [
        'I feel terribly unwell...',
        'My stomach churns. I think I need rest.',
        'A foul miasma has settled in my chest...',
      ];
      return sickLines[Math.floor(Math.random() * sickLines.length)];
    }

    // Healthy: use normal dialogue with reputation tone
    const repTone = this._getReputationTone(npc.reputation);

    const dialogues = {
      master_alchemist: [
        `${repTone} The Stone is patient. Rushing leads to explosions.`,
        `${repTone} Have you studied the emblems? Maier was not merely poetic—each word carries meaning.`,
        `${repTone} Your furnace grows dull. Have it repaired, or your yields will suffer.`,
      ],
      court_physician: [
        `${repTone} Does alchemy serve medicine? I believe it must. What cures do you seek?`,
        `${repTone} The four humors mirror the four elements. Have you considered this?`,
      ],
      material_trader: [
        `${repTone} Vitriol from the trade routes—expensive but pure. Interested?`,
        `${repTone} That mercury won't last long. Prices rise with scarcity.`,
      ],
      apprentice: [
        `${repTone} Master Cornelius is hard, but his knowledge is worth the bruises!`,
        `${repTone} I heard the White Stone glows at night. Is it true?`,
      ],
    };

    const npcDialogues = dialogues[npcId] || ['...'];
    return npcDialogues[Math.floor(Math.random() * npcDialogues.length)];
  }

  // C2: Get reputation-based tone prefix
  _getReputationTone(reputation) {
    if (reputation >= 61) return '';  // Warm, helpful (no prefix needed, normal dialogue)
    if (reputation >= 31) return '';  // Neutral, professional (normal)
    return '';                         // Cold, dismissive (could add prefix if needed)
  }

  // C2: Check if NPC can work/offer services
  canWork(npcId) {
    const npc = this.getNPC(npcId);
    if (!npc) return false;
    return npc.health_state === 'healthy';
  }

  // C2: Check if NPC can offer quests
  canOfferQuest(npcId) {
    return this.canWork(npcId);
  }

  // C2: Apply damage to NPC
  damageNPC(npcId, damage) {
    const npc = this.getNPC(npcId);
    if (!npc) return false;

    npc.hp = Math.max(0, npc.hp - damage);

    // Update health state based on HP
    if (npc.hp === 0) {
      npc.health_state = 'critical';
    } else if (npc.hp < 25) {
      npc.health_state = 'injured';
    } else if (npc.hp < 60) {
      npc.health_state = 'sickened';
    } else {
      npc.health_state = 'healthy';
    }

    return true;
  }

  // C2: Heal NPC with healing item
  heal(npcId, healingItem) {
    const npc = this.getNPC(npcId);
    if (!npc) return { success: false, message: 'NPC not found' };

    const potency = healingItem.potency || 10;
    const healing = potency + Math.floor(Math.random() * 20);  // 10-30 HP typically
    npc.hp = Math.min(npc.max_hp, npc.hp + healing);

    // Update health state
    if (npc.hp === npc.max_hp) {
      npc.health_state = 'healthy';
    } else if (npc.hp < 25) {
      npc.health_state = 'injured';
    } else if (npc.hp < 60) {
      npc.health_state = 'sickened';
    } else {
      npc.health_state = 'healthy';
    }

    // Increase reputation for healing
    npc.reputation = Math.min(150, npc.reputation + 10);

    return {
      success: true,
      message: `${npc.name} feels better! (Reputation +10)`,
      newState: npc.health_state,
      newReputation: npc.reputation,
    };
  }

  // C2: Get all sick/injured NPCs
  getSickNPCs() {
    return Object.values(this.NPCs).filter(npc =>
      npc.health_state === 'sickened' ||
      npc.health_state === 'injured' ||
      npc.health_state === 'critical'
    );
  }

  // ---- MAINTENANCE ----
  // C4: repairFurnace() now restores to 80% and returns repair cost
  repairFurnace(roomId) {
    const furnace = this.getFurnaceAtLocation(roomId);
    if (!furnace) return { success: false, message: 'Furnace not found' };

    const cost = calculateRepairCost(furnace.durability, this.courtType);
    furnace.durability = 80;
    this.treasury.gold -= cost;

    return {
      success: true,
      cost: cost,
      message: 'The furnace hums smoothly again.',
      newDurability: furnace.durability,
    };
  }

  restockFuel(roomId, amount) {
    const furnace = this.getFurnaceAtLocation(roomId);
    if (!furnace) return false;
    furnace.fuel = Math.min(furnace.fuel + amount, 30);
    return true;
  }

  // ---- C2: REPUTATION EFFECTS ----
  // C2: Calculate NPC reputation discount on prices (0 to -20%)
  getReputationDiscount(npcReputation) {
    if (npcReputation < 30) return 0;
    if (npcReputation >= 100) return -0.20;
    // Linear scale: 30 rep = 0%, 100 rep = 20%
    return -((npcReputation - 30) / 70) * 0.20;
  }

  // C2: Get NPC quest rewards multiplier based on reputation
  getReputationRewardMultiplier(npcReputation) {
    if (npcReputation < 30) return 0.8;  // Cold NPCs give worse rewards
    if (npcReputation >= 100) return 1.3; // Warm NPCs give better rewards
    // Linear: 30 rep = 0.8x, 100 rep = 1.3x
    return 0.8 + ((npcReputation - 30) / 70) * 0.5;
  }

  // C4: Tick the market (called once per game tick)
  // Handles material availability refresh and pricing updates
  tickMarket() {
    this.market_ticks++;

    // Refresh material availability when interval expires
    if (this.market_ticks >= this.market_refresh_interval) {
      this.refreshMaterialAvailability();
      this.market_ticks = 0;
    }
  }

  // C4: Check if a material is available in the current market
  // Uses probabilistic availability based on court economy
  isMaterialAvailable(rarity) {
    const availabilityPct = this.available_materials[rarity] || 0.5;
    return Math.random() < availabilityPct;
  }
}

// ---- MULTI-CASTLE SYSTEM ----
// Different courts, different patrons, different locations
export const COURTS = {
  prague: {
    id: 'prague',
    name: 'Prague — Court of Rudolf II',
    year: 1608,
    patron: { id: 'rudolf_ii', name: 'Emperor Rudolf II', personality: 'demanding' },
    description: 'The greatest court of alchemists in Christendom. Competition is fierce.',
    difficulties: {
      material_cost: 1.0, // multiplier
      patron_expectations: 'high',
      security: 'strict',
    },
    advantages: ['access_to_rare_materials', 'famous_mentors', 'patronage_letters'],
  },
  england: {
    id: 'england',
    name: 'England — Court of James I',
    year: 1612,
    patron: { id: 'james_i', name: 'King James I', personality: 'skeptical' },
    description: 'A practical court. Medicine and transmutation matter more than philosophy.',
    difficulties: {
      material_cost: 1.2, // materials are harder to source
      patron_expectations: 'results_focused',
      security: 'moderate',
    },
    advantages: ['medicinal_research_valued', 'less_competition', 'book_access'],
  },
  hesse_kassel: {
    id: 'hesse_kassel',
    name: 'Hesse-Kassel — Court of Moritz',
    year: 1616,
    patron: { id: 'moritz_hesse', name: 'Moritz of Hesse-Kassel', personality: 'philosophical' },
    description: 'A court open to Rosicrucian ideas. Spiritual alchemy is valued.',
    difficulties: {
      material_cost: 0.9, // cheaper materials
      patron_expectations: 'philosophy_and_results',
      security: 'relaxed',
    },
    advantages: ['rosicrucian_pathway', 'cheaper_materials', 'secret_societies'],
  },
};

export function createCastleForCourt(courtId) {
  const courtData = COURTS[courtId];
  return new Castle(courtData.name, courtId);
}
