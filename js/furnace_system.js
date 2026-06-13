// furnace_system.js — temperature management, reactions, hazards, crafting

export class Furnace {
  constructor() {
    this.temperature = 20; // celsius (20-200 range)
    this.targetTemp = 20;
    this.fuel = 0; // units of charcoal
    this.fuelCapacity = 20;
    this.vessel = null; // { materials: [...], operation: operationId, progress: 0..100, startTime }
    this.ventilation = 'good'; // good, moderate, poor
    this.durability = 100; // 0-100; damage reduces efficiency
    this.hasRetort = false;
    this.hasAlembic = false;
    this.alchemistSkill = 1; // 1-5; affects precision
  }

  // ---- TEMPERATURE CONTROL ----
  addFuel(amount) {
    this.fuel = Math.min(this.fuel + amount, this.fuelCapacity);
  }

  setTargetTemp(temp) {
    this.targetTemp = Math.max(20, Math.min(200, temp));
  }

  // Called each game tick (minute); adjusts actual temperature toward target
  tick() {
    const diff = this.targetTemp - this.temperature;
    const heatRate = 2 * (this.durability / 100); // damage reduces heating speed
    const coolRate = 1;

    if (diff > 0 && this.fuel > 0) {
      // Heating: fuel is consumed
      this.temperature = Math.min(this.temperature + heatRate, this.targetTemp);
      this.fuel -= 0.1; // ~10 fuel for 100 degrees over 100 minutes
    } else {
      // Cooling: passive cooling
      this.temperature = Math.max(this.temperature - coolRate, 20);
    }

    // Stabilize if close to target
    if (Math.abs(this.targetTemp - this.temperature) < 2) {
      this.temperature = this.targetTemp;
    }
  }

  // ---- OPERATION EXECUTION ----
  startOperation(operationId, materials) {
    // materials: [{id: 'vitriol', qty: 3}, ...]
    // Returns: success or { error: string }

    // Check preconditions
    if (this.vessel) return { error: 'Vessel already in use' };
    if (this.temperature < 30) return { error: 'Furnace not hot enough' };

    this.vessel = {
      operationId,
      materials: [...materials],
      progress: 0,
      startTime: Date.now(),
      ticks: 0,
      stability: 100, // degrades with poor temperature management
      contaminated: false,
    };

    return { success: true };
  }

  // Tick the current operation (called each game minute)
  tickOperation() {
    if (!this.vessel) return null;

    const op = OPERATIONS[this.vessel.operationId];
    if (!op) return null;

    this.vessel.ticks++;
    this.vessel.progress = Math.min(100, (this.vessel.ticks / (op.duration || 30)) * 100);

    // Temperature variance damages stability
    const requiredTemp = op.requires?.temp || 'moderate';
    const tempRange = this._getTempRange(requiredTemp);
    const outOfRange = this.temperature < tempRange[0] || this.temperature > tempRange[1];

    if (outOfRange) {
      this.vessel.stability -= 5;
    }

    // Check for dangers
    const dangers = this._checkDangers();
    if (dangers.length > 0) {
      return { dangers, progress: this.vessel.progress };
    }

    // Operation complete?
    if (this.vessel.progress >= 100) {
      return this._completeOperation();
    }

    return { progress: this.vessel.progress };
  }

  _getTempRange(tempType) {
    const ranges = {
      low: [30, 80],
      moderate: [80, 140],
      high: [140, 200],
      warm: [60, 100],
    };
    return ranges[tempType] || [50, 150];
  }

  _checkDangers() {
    const dangers = [];
    if (!this.vessel) return dangers;

    // Explosion risk: too hot + combustible
    if (this.temperature > 180 && this._hasMaterial('sulfur')) {
      if (Math.random() < 0.1) {
        dangers.push({
          id: 'explosion',
          severity: 'catastrophic',
          description: 'The furnace overheats! Sulfur ignites!',
          consequence: 'vessel_destroyed', // all materials lost
        });
      }
    }

    // Toxic vapors: mercury + heat + poor ventilation
    if (this._hasMaterial('mercury') && this.temperature > 120 && this.ventilation !== 'good') {
      if (Math.random() < 0.15) {
        dangers.push({
          id: 'toxic_vapor',
          severity: 'major',
          description: 'Mercury vapors rise! Toxic air fills the chamber!',
          consequence: 'abort_and_damage', // player takes damage, operation paused
        });
      }
    }

    // Combustion: open flame + vitriol fumes
    if (this._hasMaterial('vitriol') && this.temperature > 100 && this.ventilation === 'poor') {
      if (Math.random() < 0.08) {
        dangers.push({
          id: 'fumes',
          severity: 'moderate',
          description: 'Acrid vitriol fumes choke the air!',
          consequence: 'partial_loss', // lose 30% of materials
        });
      }
    }

    // Volatilization: mercury at too high temp
    if (this._hasMaterial('mercury') && this.temperature > 160) {
      if (Math.random() < 0.12) {
        dangers.push({
          id: 'volatilization',
          severity: 'major',
          description: 'Mercury vaporizes! The quicksilver escapes!',
          consequence: 'material_loss', // mercury lost
        });
      }
    }

    return dangers;
  }

  _hasMaterial(matId) {
    return this.vessel?.materials?.some(m => m.id === matId);
  }

  _completeOperation() {
    if (!this.vessel) return null;

    const op = OPERATIONS[this.vessel.operationId];
    if (!op) return null;

    // Success or partial success based on stability
    let outcome = 'success';
    let yields = op.produces || [];

    if (this.vessel.stability < 50) {
      outcome = 'partial'; // only 50% yield
      yields = yields.map(y => ({ ...y, qty: Math.max(1, Math.floor(y.qty / 2)) }));
    }

    if (this.vessel.contaminated) {
      outcome = 'failure'; // complete loss
      yields = [];
    }

    const result = {
      outcome,
      operation: op.id,
      yields,
      stability: this.vessel.stability,
    };

    // Furnace durability decreases with use
    this.durability = Math.max(0, this.durability - 5);

    // Reset vessel
    this.vessel = null;

    return result;
  }

  abortOperation() {
    if (!this.vessel) return null;
    const lost = this.vessel.materials;
    this.vessel = null;
    return { aborted: true, materials_lost: lost };
  }

  // ---- MAINTENANCE ----
  repair(amount = 30) {
    // amount: gold spent on repairs
    this.durability = Math.min(100, this.durability + amount / 10);
  }

  setVentilation(level) {
    // 'good', 'moderate', 'poor' — affects danger rates
    this.ventilation = level;
  }

  installEquipment(equipmentId) {
    if (equipmentId === 'retort') this.hasRetort = true;
    if (equipmentId === 'alembic') this.hasAlembic = true;
  }
}

// Import operations from alchemical_materials
import { OPERATIONS } from './alchemical_materials.js';

// ---- CRAFT SYSTEM (using furnaces to combine materials) ----
export const RECIPES = {
  // Raw → Intermediate recipes
  white_stone_from_vitriol: {
    id: 'white_stone_from_vitriol',
    name: 'Whiten with Vitriol',
    inputs: [
      { id: 'vitriol', qty: 3 },
      { id: 'charcoal', qty: 2 },
    ],
    output: { id: 'white_stone', qty: 1 },
    operation: 'dissolution',
    temp: 'moderate',
    duration: 40,
    skill_required: 1,
  },

  philosophical_water_distillation: {
    id: 'philosophical_water_distillation',
    name: 'Distill Philosophical Water',
    inputs: [
      { id: 'white_stone', qty: 1 },
    ],
    output: { id: 'philosophical_water', qty: 2 },
    operation: 'distillation',
    temp: 'moderate',
    duration: 50,
    skill_required: 2,
  },

  red_tincture_from_fermentation: {
    id: 'red_tincture_fermentation',
    name: 'Ferment Red Tincture',
    inputs: [
      { id: 'white_stone', qty: 1 },
      { id: 'sulfur', qty: 2 },
    ],
    output: { id: 'red_tincture', qty: 1 },
    operation: 'fermentation',
    temp: 'warm',
    duration: 120,
    skill_required: 3,
  },

  // Intermediate → Final recipes
  philosophers_stone_conjunction: {
    id: 'philosophers_stone_conjunction',
    name: 'Conjoin the Stone',
    inputs: [
      { id: 'white_stone', qty: 1 },
      { id: 'red_tincture', qty: 1 },
      { id: 'philosophical_water', qty: 1 },
    ],
    output: { id: 'philosophers_stone', qty: 1 },
    operation: 'conjunction',
    temp: 'moderate',
    duration: 60,
    skill_required: 5,
  },
};

// ---- SKILL PROGRESSION ----
// Alchemist skill affects precision, material yield, danger resistance
export function getSkillBonus(skill_level, aspect) {
  // skill_level: 1-5
  // aspect: 'yield', 'precision', 'danger_resistance', 'speed'
  const bonuses = {
    yield: [0.8, 0.9, 1.0, 1.1, 1.2], // 20% loss at level 1, 20% gain at level 5
    precision: [50, 60, 75, 85, 95],   // failure chance % (lower = better)
    danger_resistance: [0, 0.1, 0.2, 0.3, 0.5], // reduce danger triggering by %
    speed: [1.0, 0.95, 0.9, 0.8, 0.7], // time multiplier (lower = faster)
  };
  return bonuses[aspect]?.[skill_level - 1] || 1.0;
}
