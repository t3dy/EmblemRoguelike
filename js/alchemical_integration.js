// alchemical_integration.js — integrate all alchemical systems into main game

import { MATERIALS, LAB_SPACES, OPERATIONS, EQUIPMENT, DANGERS } from './alchemical_materials.js';
import { Furnace, RECIPES, getSkillBonus } from './furnace_system.js';
import { EMBLEM_QUESTS, emblemQuestToGameFormat } from './emblem_quests.js';
import { Castle, createCastleForCourt, COURTS } from './castle_interior.js';
import { getPotentialDisasters } from './disaster_cards.js';

// ---- A1: FURNACE OPERATION STATE MANAGEMENT ----

// C1: Danger Integration Constants
const DANGER_CONFIG = {
  BASE_PROBABILITY: 0.05,                    // 5% per tick
  TEMP_VARIANCE_PENALTY: 0.05,               // +5% per 50°C variance
  HAZMAT_PENALTY: 0.03,                      // +3% per hazardous material
  DURABILITY_LOW_PENALTY: 0.05,              // +5% if durability < 50
  DURABILITY_CRITICAL_PENALTY: 0.10,         // +10% more if durability < 30
  MAX_PROBABILITY: 0.50,                     // Cap at 50% per tick
  DANGER_DAMAGE: 20,                         // Damage to hero from continuing
  FURNACE_DAMAGE: 20,                        // Furnace durability damage
  DURATION_MULTIPLIER_INCREASE: 0.3,         // +30% to duration multiplier
};

/**
 * FurnaceOperation tracks the lifecycle of a single furnace operation.
 * Handles progress tracking, duration, status, and danger event queuing.
 */
export class FurnaceOperation {
  constructor(operationId, materials, targetTemp, furnaceDurability = 100, npcList = []) {
    this.operationId = operationId;           // 'calcination', 'distillation', etc.
    this.materials = materials;               // [{ id: 'vitriol', qty: 3 }, ...]
    this.targetTemp = targetTemp;             // 20-200°C
    this.progress = 0;                        // 0-100%
    this.duration = 3000;                     // game ticks (milliseconds)
    this.durationMultiplier = 1.0;            // Increases if danger continues
    this.status = 'running';                  // 'running', 'completed', 'aborted', 'failed', 'paused'
    this.dangers = [];                        // array of triggered dangers
    this.triggered_danger = null;             // C1: Current danger event (if any)
    this.startTime = Date.now();              // timestamp when operation started
    this.currentTemp = 20;                    // actual furnace temperature
    this.fuel = 20;                           // charcoal remaining (0-100)
    this.furnaceDurability = furnaceDurability;  // C1: Furnace durability (0-100)
    this.npcsPresent = npcList || [];         // C1: NPCs in room during operation
  }

  /**
   * Advance the operation by dt milliseconds.
   * Updates progress, checks for completion, and checks for danger triggers (C1).
   */
  tick(dt) {
    if (this.status !== 'running') return null;

    // Increment progress based on elapsed time (adjusted by duration multiplier)
    const adjustedDuration = this.duration * this.durationMultiplier;
    const progressDelta = (dt / adjustedDuration) * 100;
    this.progress = Math.min(100, this.progress + progressDelta);

    // Advance temperature toward target (simplified model)
    const tempDiff = this.targetTemp - this.currentTemp;
    if (tempDiff > 0 && this.fuel > 0) {
      // Heating: consume fuel
      this.currentTemp = Math.min(this.currentTemp + 0.5, this.targetTemp);
      this.fuel = Math.max(0, this.fuel - 0.01);
    } else {
      // Cooling: passive natural cooling
      this.currentTemp = Math.max(this.currentTemp - 0.2, 20);
    }

    // C1: Check for danger trigger
    const dangerTriggered = this._checkDangerTrigger();
    if (dangerTriggered) {
      return { danger_triggered: true, danger: this.triggered_danger };
    }

    // Mark as completed when progress reaches 100%
    if (this.progress >= 100) {
      this.status = 'completed';
      return { status: 'completed' };
    }

    return null;
  }

  /**
   * C1: Calculate the probability of danger for current conditions.
   * Returns a float 0-1 representing the chance of danger this tick.
   */
  _calculateDangerProbability() {
    let prob = DANGER_CONFIG.BASE_PROBABILITY;

    // Temperature stability increases risk
    const tempVariance = Math.abs(this.currentTemp - this.targetTemp);
    if (tempVariance > 20) {
      const extraVariance = tempVariance - 20;
      prob += (extraVariance / 50) * DANGER_CONFIG.TEMP_VARIANCE_PENALTY;
    }

    // Material hazards increase risk
    for (const mat of this.materials) {
      const disasters = getPotentialDisasters([mat.id], this.currentTemp, this.furnaceDurability);
      if (disasters.length > 0) {
        prob += DANGER_CONFIG.HAZMAT_PENALTY;
      }
    }

    // Furnace durability decreases safety
    if (this.furnaceDurability < 50) {
      prob += DANGER_CONFIG.DURABILITY_LOW_PENALTY;
    }
    if (this.furnaceDurability < 30) {
      prob += DANGER_CONFIG.DURABILITY_CRITICAL_PENALTY;
    }

    // Cap at maximum probability
    return Math.min(prob, DANGER_CONFIG.MAX_PROBABILITY);
  }

  /**
   * C1: Check if danger triggers this tick.
   * Returns true if a danger occurred, false otherwise.
   */
  _checkDangerTrigger() {
    const dangerProb = this._calculateDangerProbability();
    const roll = Math.random();

    if (roll < dangerProb) {
      // Danger triggered! Select from potential disasters
      const potential = getPotentialDisasters(
        this.materials.map(m => m.id),
        this.currentTemp,
        this.furnaceDurability
      );

      if (potential.length > 0) {
        // Randomly select one disaster
        this.triggered_danger = potential[Math.floor(Math.random() * potential.length)];
        this.status = 'paused';
        return true;
      }
    }

    return false;
  }

  /**
   * C1: Get the choice options when danger occurs.
   * Returns an object with available choices for the player.
   */
  getDangerChoice() {
    if (!this.triggered_danger) return null;

    return {
      title: `${this.triggered_danger.name} Occurred!`,
      description: this.triggered_danger.description,
      options: [
        {
          label: 'Continue (take damage, lose materials)',
          value: 'continue',
        },
        {
          label: 'Abort (lose all materials)',
          value: 'abort',
        },
      ],
    };
  }

  /**
   * C1: Apply consequences of player's choice when danger occurred.
   * @param {string} choice - 'continue' or 'abort'
   * @param {Object} hero - The hero object (to apply damage)
   * @returns {Object} Summary of damage/consequences
   */
  resolveDanger(choice, hero) {
    if (!this.triggered_danger) return null;

    const disaster = this.triggered_danger;
    const consequence = {
      choice: choice,
      messages: [],
    };

    if (choice === 'continue') {
      // Apply damage to hero
      const damage = disaster.effect.damage_amount;
      hero.hp = Math.max(0, hero.hp - damage);
      consequence.messages.push(`You took ${damage} damage!`);
      consequence.damage_to_hero = damage;

      // Apply material loss
      const lossPercent = disaster.effect.material_loss;
      for (const mat of this.materials) {
        const lossQty = Math.floor(mat.qty * lossPercent);
        mat.qty = Math.max(0, mat.qty - lossQty);
        if (lossQty > 0) {
          consequence.messages.push(`Lost ${lossQty} ${MATERIALS[mat.id]?.name || mat.id}`);
        }
      }
      consequence.materials_lost = lossPercent;

      // Damage furnace
      this.furnaceDurability = Math.max(0, this.furnaceDurability - DANGER_CONFIG.FURNACE_DAMAGE);
      consequence.messages.push(`Furnace durability reduced by ${DANGER_CONFIG.FURNACE_DAMAGE}`);
      consequence.furnace_damage = DANGER_CONFIG.FURNACE_DAMAGE;

      // Increase operation duration
      this.durationMultiplier += DANGER_CONFIG.DURATION_MULTIPLIER_INCREASE;
      consequence.messages.push(`Operation will take longer to complete`);

      // Damage NPCs present
      if (this.npcsPresent && this.npcsPresent.length > 0) {
        for (const npc of this.npcsPresent) {
          if (npc) {
            npc.hp = Math.max(0, (npc.hp || 50) - damage);
            npc.condition = disaster.effect.worker_state || 'injured';
            consequence.messages.push(`${npc.name || 'NPC'} was hurt!`);
          }
        }
        consequence.npcs_damaged = this.npcsPresent.length;
      }

      // Resume operation
      this.status = 'running';
      this.triggered_danger = null;
    } else if (choice === 'abort') {
      // Lose all materials
      const totalLost = this.materials.reduce((sum, m) => sum + m.qty, 0);
      consequence.messages.push(`Lost all ${totalLost} materials from the operation`);
      this.materials = [];
      consequence.all_materials_lost = true;

      // Mark operation as aborted
      this.status = 'aborted';
      this.triggered_danger = null;
    }

    return consequence;
  }

  /**
   * Get a human-readable status text describing the current state.
   * Example: "Running: 45% complete, 127°C / 150°C target"
   */
  getStatusText() {
    const op = OPERATIONS[this.operationId];
    const opName = op ? op.name : this.operationId;

    switch (this.status) {
      case 'running':
        return `${opName}: ${Math.floor(this.progress)}% complete, ${Math.floor(this.currentTemp)}°C / ${this.targetTemp}°C`;
      case 'paused':
        return `${opName}: PAUSED - Danger occurred! Make a choice.`;
      case 'completed':
        return `${opName}: Complete!`;
      case 'aborted':
        return `${opName}: Aborted`;
      case 'failed':
        return `${opName}: Failed`;
      default:
        return `${opName}: Unknown state`;
    }
  }

  /**
   * Abort this operation immediately.
   * Sets status to 'aborted' and materials are lost.
   */
  abort() {
    this.status = 'aborted';
  }

  /**
   * Mark operation as failed (e.g., due to a catastrophic danger).
   * Sets status to 'failed'.
   */
  fail() {
    this.status = 'failed';
  }

  /**
   * C3.1: Operation-to-Quest Matching
   * Check if this furnace operation matches a quest objective.
   * Returns true if the objective is satisfied by this operation.
   */
  matchQuestObjective(questDef) {
    if (!questDef || !questDef.objective) return false;

    const obj = questDef.objective;

    // Single furnace operation match
    if (obj.kind === 'furnace_operation') {
      return obj.operation === this.operationId;
    }

    // Sequence of operations (multi-stage)
    if (obj.kind === 'furnace_sequence') {
      // This operation is one of the required sequence
      return obj.operations && obj.operations.includes(this.operationId);
    }

    // Maintain temperature within tolerance for duration
    if (obj.kind === 'furnace_maintain') {
      // Validation happens during operation ticking
      return true; // Implementation detail: tracked via quest.completed_stages
    }

    // Balance materials precisely (e.g., mercury/sulfur balance)
    if (obj.kind === 'furnace_balance') {
      // Validation happens during operation ticking
      return true; // Implementation detail: tracked via operation feedback
    }

    // Other objective types (garden, npc, scholarly, etc.) don't match furnace operations
    return false;
  }

  /**
   * C3.2: Get Completed Quests
   * Returns array of quest IDs completed by this operation completion.
   * Supports multi-stage quests via quest.completed_stages tracking.
   */
  getCompletedQuests(hero) {
    const completedQuestIds = [];
    if (!hero.quests || !hero.quests.length) return completedQuestIds;

    for (const activeQuest of hero.quests) {
      // QUEST_BY_ID provided by main.js at runtime
      if (typeof QUEST_BY_ID === 'undefined') continue;

      const questDef = QUEST_BY_ID[activeQuest.id];
      if (!questDef) continue;

      // Check objective kind
      if (questDef.objective.kind === 'furnace_operation') {
        // Single operation match
        if (this.matchQuestObjective(questDef)) {
          completedQuestIds.push(activeQuest.id);
        }
      } else if (questDef.objective.kind === 'furnace_sequence') {
        // Multi-operation sequence: track completed stages
        if (!activeQuest.completed_operations) {
          activeQuest.completed_operations = [];
        }
        if (questDef.objective.operations.includes(this.operationId)) {
          if (!activeQuest.completed_operations.includes(this.operationId)) {
            activeQuest.completed_operations.push(this.operationId);
          }
          // Complete quest when all operations are done
          if (activeQuest.completed_operations.length >= questDef.objective.operations.length) {
            completedQuestIds.push(activeQuest.id);
          }
        }
      } else if (questDef.objective.kind === 'furnace_maintain' ||
                 questDef.objective.kind === 'furnace_balance') {
        // These are validated during operation, marked as complete here
        // if operation tracks it correctly
        if (!activeQuest.validated_by_operation) {
          activeQuest.validated_by_operation = true;
          completedQuestIds.push(activeQuest.id);
        }
      } else if (questDef.objective.kind === 'furnace_multi_stage') {
        // Multi-stage quest (e.g., 6 stages for Emblem 48)
        if (!activeQuest.completed_stages) {
          activeQuest.completed_stages = [];
        }
        activeQuest.completed_stages.push(this.operationId);
        if (activeQuest.completed_stages.length >= questDef.objective.stages) {
          completedQuestIds.push(activeQuest.id);
        }
      }
    }

    return completedQuestIds;
  }

  /**
   * C3.3: Calculate Quest Rewards
   * Applies multipliers based on reputation, court, and skill level.
   * Returns { gold, xp, items: [] }
   */
  calculateRewards(questDef, hero, npc = null) {
    if (!questDef || !questDef.reward) {
      return { gold: 0, xp: 0, items: [] };
    }

    const baseReward = questDef.reward;
    let baseGold = baseReward.gold || 0;
    let baseXp = baseReward.xp || 0;
    const items = baseReward.item ? [{ id: baseReward.item[0], qty: baseReward.item[1] }] : [];

    // Multiplier 1: NPC Reputation (max +20%)
    let repMultiplier = 1.0;
    if (npc && npc.reputation !== undefined) {
      repMultiplier = 1 + (Math.min(npc.reputation, 100) / 100) * 0.2;
    }

    // Multiplier 2: Court Bonus (varies 0.8-1.0)
    let courtMultiplier = 1.0;
    if (hero.alchemy && hero.alchemy.current_court) {
      // Court multipliers: Prague=1.0, England=0.8, Hesse-Kassel=0.9
      const courtData = {
        prague: 1.0,
        england: 0.8,
        hesse_kassel: 0.9,
      };
      courtMultiplier = courtData[hero.alchemy.current_court] || 1.0;
    }

    // Multiplier 3: Alchemy Skill Bonus (max +30% at level 5)
    let skillMultiplier = 1.0;
    if (hero.alchemy && hero.alchemy.skill) {
      skillMultiplier = 1 + (Math.min(hero.alchemy.skill, 5) / 5) * 0.3;
    }

    // Apply all multipliers
    const finalGold = Math.floor(baseGold * repMultiplier * courtMultiplier * skillMultiplier);
    const finalXp = Math.floor(baseXp * repMultiplier * courtMultiplier * skillMultiplier);

    return {
      gold: finalGold,
      xp: finalXp,
      items: items,
    };
  }
}

// ---- HERO ALCHEMY STAT (added to hero object) ----
export function initHeroAlchemy(hero) {
  hero.alchemy = {
    skill: 1, // 1-5; affects yield, precision, danger resistance
    skillXp: 0, // skill XP accumulation
    knowledge: {}, // { operation_id: times_completed, ... }
    materials: {}, // { material_id: quantity, ... }
    equipment: [], // inventory of equipment owned
    learned_recipes: [], // recipe_ids unlocked
    castles_visited: [], // court_ids visited
    furnace: null, // current furnace in use (if any)
    // C3: Quest Progression Tracking
    completed_emblems: [], // array of emblem numbers completed (1-50)
    emblem_phase: 0, // current phase (0=foundation, 1=purification, etc.)
    skill_unlocks: [], // special skills/recipes learned
  };
  return hero;
}

// ---- GAME STATE EXPANSION ----
export class AlchemicalGameState {
  constructor(game) {
    this.game = game;
    this.active_castle = null; // currently exploring castle
    this.available_quests = [];
    this.emblem_quests_pool = [...EMBLEM_QUESTS];
    this.furnaces = {}; // { furnace_id: Furnace }
    this.castles = {}; // { court_id: Castle }
    this._initializeCastles();
    this._loadEmblemQuests();
  }

  _initializeCastles() {
    for (const courtId in COURTS) {
      this.castles[courtId] = createCastleForCourt(courtId);
    }
  }

  _loadEmblemQuests() {
    // Convert emblem quests to game format and add to available pool
    this.available_quests = this.emblem_quests_pool.map(eq => emblemQuestToGameFormat(eq));
  }

  // ---- CASTLE EXPLORATION ----
  enterCastle(courtId, hero) {
    if (!this.castles[courtId]) return null;
    this.active_castle = this.castles[courtId];
    hero.alchemy.castles_visited.push(courtId);
    return this.active_castle;
  }

  exitCastle() {
    this.active_castle = null;
  }

  getCurrentCastle() {
    return this.active_castle;
  }

  // ---- FURNACE OPERATIONS ----
  canStartFurnaceOperation(hero, roomId, operationId, materials) {
    if (!this.active_castle) return { allowed: false, reason: 'Not in a castle' };

    const canStart = this.active_castle.canStartOperation(roomId, operationId);
    if (!canStart.allowed) return canStart;

    // Check materials
    for (const mat of materials) {
      const available = hero.alchemy.materials[mat.id] || 0;
      if (available < mat.qty) {
        return { allowed: false, reason: `Insufficient ${MATERIALS[mat.id]?.name || 'material'}` };
      }
    }

    return { allowed: true };
  }

  startFurnaceOperation(hero, roomId, operationId, materials) {
    const furnace = this.active_castle.getFurnaceAtLocation(roomId);
    if (!furnace) return { error: 'No furnace found' };

    // Deduct materials from hero inventory
    for (const mat of materials) {
      hero.alchemy.materials[mat.id] = (hero.alchemy.materials[mat.id] || 0) - mat.qty;
    }

    // Start the operation
    const result = furnace.startOperation(operationId, materials);
    if (result.error) {
      // Refund materials on error
      for (const mat of materials) {
        hero.alchemy.materials[mat.id] = (hero.alchemy.materials[mat.id] || 0) + mat.qty;
      }
      return result;
    }

    // Store furnace reference on hero
    hero.alchemy.furnace = { room: roomId, furnace: furnace, operation: operationId };
    return { success: true, operation: operationId };
  }

  // ---- QUEST SYSTEM EXPANSION ----
  getEmblemQuests(phase) {
    // Get quests for a specific phase (foundation, purification, etc.)
    return this.available_quests.filter(q => q.emblem && q.emblem >= 1 && q.emblem <= 50);
  }

  offerEmblemQuest(questId, hero) {
    const quest = this.available_quests.find(q => q.id === questId);
    if (!quest) return null;
    if (!hero.quests) hero.quests = [];
    hero.quests.push({ ...quest, progress: 0, started_at: Date.now() });
    return quest;
  }

  // ---- MATERIAL MANAGEMENT ----
  addMaterial(hero, materialId, quantity = 1) {
    hero.alchemy.materials[materialId] = (hero.alchemy.materials[materialId] || 0) + quantity;
  }

  removeMaterial(hero, materialId, quantity = 1) {
    hero.alchemy.materials[materialId] = Math.max(0, (hero.alchemy.materials[materialId] || 0) - quantity);
  }

  getMaterialInventory(hero) {
    return hero.alchemy.materials;
  }

  // ---- SKILL PROGRESSION ----
  gainSkillXP(hero, amount = 10) {
    if (!hero.alchemy.skillXp) hero.alchemy.skillXp = 0;
    hero.alchemy.skillXp += amount;

    // Level up skill every 100 XP
    const newLevel = Math.floor(hero.alchemy.skillXp / 100) + 1;
    if (newLevel > hero.alchemy.skill && newLevel <= 5) {
      hero.alchemy.skill = newLevel;
      return { leveledUp: true, newLevel: newLevel };
    }
    return { leveledUp: false };
  }

  // ---- OPERATION COMPLETION ----
  completeOperation(hero, roomId) {
    if (!hero.alchemy.furnace) return null;
    const furnaceRef = hero.alchemy.furnace;
    const furnace = furnaceRef.furnace;

    const result = furnace.tickOperation(); // force completion
    if (!result || result.progress < 100) {
      // Operation still ongoing
      return null;
    }

    // Get outcome
    const outcome = furnace._completeOperation();
    if (!outcome) return null;

    // Apply skill bonus to yields
    const skillBonus = getSkillBonus(hero.alchemy.skill, 'yield');
    if (outcome.yields) {
      for (const yieldItem of outcome.yields) {
        const adjQty = Math.floor((yieldItem.qty || 1) * skillBonus);
        this.addMaterial(hero, yieldItem.id, adjQty);
      }
    }

    // Gain XP
    this.gainSkillXP(hero, 15 + (hero.alchemy.skill * 5));

    // Clear furnace reference
    hero.alchemy.furnace = null;

    return outcome;
  }

  // ---- DANGER HANDLING ----
  processDanger(hero, danger, roomId) {
    const consequence = danger.consequence;

    if (consequence === 'vessel_destroyed') {
      // All materials lost
      const furnaceRef = hero.alchemy.furnace;
      if (furnaceRef) {
        furnaceRef.furnace.abortOperation();
      }
      hero.alchemy.furnace = null;
      hero.hp -= 20;
      return { damage: 20, materials_lost: true };
    }

    if (consequence === 'abort_and_damage') {
      // Take damage, operation paused
      hero.hp -= 15;
      return { damage: 15, operation_paused: true };
    }

    if (consequence === 'partial_loss') {
      // Lose 30% of materials
      if (hero.alchemy.furnace?.furnace.vessel) {
        hero.alchemy.furnace.furnace.vessel.materials = hero.alchemy.furnace.furnace.vessel.materials.map(m => ({
          ...m,
          qty: Math.floor(m.qty * 0.7),
        }));
      }
      return { materials_lost_partial: true };
    }

    if (consequence === 'material_loss') {
      // Specific material (usually mercury) is lost
      if (hero.alchemy.materials.mercury) {
        hero.alchemy.materials.mercury = Math.floor(hero.alchemy.materials.mercury * 0.5);
      }
      return { mercury_lost: true };
    }

    return null;
  }
}

// ---- INTEGRATION WITH EXISTING GAME ----
export function hookAlchemyIntoGame(game) {
  // Attach alchemy state to game
  game.alchemy = new AlchemicalGameState(game);

  // Add alchemy skill to hero when created
  const originalNewHero = game.newHero;
  game.newHero = function(classId) {
    const hero = originalNewHero.call(this, classId);
    return initHeroAlchemy(hero);
  };

  // Add alchemy quests to quest pool
  game.getAvailableQuests = function() {
    return game.alchemy.getEmblemQuests('all');
  };

  return game;
}

// ---- EXAMPLE: HOW TO USE THIS IN MAIN.JS ----
/*
import { hookAlchemyIntoGame } from './alchemical_integration.js';

class Game {
  constructor(canvas) {
    // ... existing init code ...
    hookAlchemyIntoGame(this);
  }

  // In a quest dialogue:
  acceptEmblemQuest(questId) {
    const quest = this.alchemy.offerEmblemQuest(questId, this.hero);
    if (quest) {
      this.msg.push(`Accepted: ${quest.title}`);
      this.msg.push(quest.call);
    }
  }

  // In castle exploration:
  enterAlchemicalLab(roomId) {
    const castle = this.alchemy.getCurrentCastle();
    if (!castle) {
      this.msg.push('You are not in a castle.');
      return;
    }
    const room = castle.rooms[roomId];
    this.msg.push(`Entered ${room.name}`);
    this.msg.push(room.description);
    // Show furnace/crafting UI
  }

  // Furnace operation start:
  startOperation(operationId, materials) {
    const hero = this.hero;
    const activeRoom = 'furnace_chamber'; // from UI context

    const check = this.alchemy.canStartFurnaceOperation(hero, activeRoom, operationId, materials);
    if (!check.allowed) {
      this.msg.push(`Cannot start: ${check.reason}`);
      return;
    }

    const result = this.alchemy.startFurnaceOperation(hero, activeRoom, operationId, materials);
    if (result.success) {
      this.msg.push(`Operation started: ${operationId}`);
      this.msg.push(`Duration: ~${OPERATIONS[operationId]?.duration || 30} minutes`);
    }
  }
}
*/
