// alchemical_integration.js — integrate all alchemical systems into main game

import { MATERIALS, LAB_SPACES, OPERATIONS, EQUIPMENT, DANGERS } from './alchemical_materials.js';
import { Furnace, RECIPES, getSkillBonus } from './furnace_system.js';
import { EMBLEM_QUESTS, emblemQuestToGameFormat } from './emblem_quests.js';
import { Castle, createCastleForCourt, COURTS } from './castle_interior.js';

// ---- HERO ALCHEMY STAT (added to hero object) ----
export function initHeroAlchemy(hero) {
  hero.alchemy = {
    skill: 1, // 1-5; affects yield, precision, danger resistance
    knowledge: {}, // { operation_id: times_completed, ... }
    materials: {}, // { material_id: quantity, ... }
    equipment: [], // inventory of equipment owned
    learned_recipes: [], // recipe_ids unlocked
    castles_visited: [], // court_ids visited
    furnace: null, // current furnace in use (if any)
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
