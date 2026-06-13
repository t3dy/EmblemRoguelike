// castle_interior.js — castle interiors with multiple lab spaces and functions

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

  speakToNPC(npcId) {
    const npc = this.getNPC(npcId);
    if (!npc) return null;

    const dialogues = {
      master_alchemist: [
        'The Stone is patient. Rushing leads to explosions.',
        'Have you studied the emblems? Maier was not merely poetic—each word carries meaning.',
        'Your furnace grows dull. Have it repaired, or your yields will suffer.',
      ],
      court_physician: [
        'Does alchemy serve medicine? I believe it must. What cures do you seek?',
        'The four humors mirror the four elements. Have you considered this?',
      ],
      material_trader: [
        'Vitriol from the trade routes—expensive but pure. Interested?',
        'That mercury won\'t last long. Prices rise with scarcity.',
      ],
      apprentice: [
        'Master Cornelius is hard, but his knowledge is worth the bruises!',
        'I heard the White Stone glows at night. Is it true?',
      ],
    };

    const npcDialogues = dialogues[npcId] || ['...'];
    return npcDialogues[Math.floor(Math.random() * npcDialogues.length)];
  }

  // ---- MAINTENANCE ----
  repairFurnace(roomId, goldSpent) {
    const furnace = this.getFurnaceAtLocation(roomId);
    if (!furnace) return false;
    furnace.durability = Math.min(100, furnace.durability + goldSpent / 10);
    this.treasury.gold -= goldSpent;
    return true;
  }

  restockFuel(roomId, amount) {
    const furnace = this.getFurnaceAtLocation(roomId);
    if (!furnace) return false;
    furnace.fuel = Math.min(furnace.fuel + amount, 30);
    return true;
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
