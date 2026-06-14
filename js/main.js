// main.js — entry point, state machine, input, game loop, persistence, audio.
import { Assets } from './assets.js';
import { World, tileType } from './world.js';
import { Battle } from './battle.js';
import { Dungeon } from './dungeon.js';
import { Town } from './town.js';
import { Music } from './music.js?v=3';
import { newHero, CLASSES, STAGES, stageForFloor, floorInfo, FINAL_FLOOR, QUESTS, OPUS_LINE, questsByGiver, ITEMS, MONSTERS, recomputeStats, ATTRIBS, ATTRIB_POINTS, ATTRIB_GAIN } from './data.js';
import { EMBLEM_QUESTS } from './emblem_quests.js';
import { MessageBox, window9, parchmentCard, text, menu, COLORS, renderFurnacePanel } from './ui.js';
import { FurnaceOperation } from './alchemical_integration.js';
import { COURT_ECONOMY, calculateMaterialPrice, isMaterialAvailable, calculateRepairCost, getEconomicDescription } from './court_economy.js';
import { MATERIALS } from './alchemical_materials.js';
import { createCastleForCourt } from './castle_interior.js';

const ALL_QUESTS = [...QUESTS, ...EMBLEM_QUESTS];
const QUEST_BY_ID = Object.fromEntries(ALL_QUESTS.map(q => [q.id, q]));

function allQuestsByGiver(who) {
  return ALL_QUESTS.filter(q => q.giver === who && q.line !== 'opus');
}

const SAVE_KEY = 'emblem_knight_save_v1';
const SCORE_KEY = 'emblem_knight_score_v1';

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width; this.H = canvas.height;
    this.state = 'title';        // title|charselect|overworld|dungeon|battle|dialog|gameover|victory
    this.msg = new MessageBox();
    this.hero = null;
    this.world = null;
    this.dungeon = null;
    this.town = null;
    this.battle = null;
    this._dungeonEnemy = null;   // enemy ref when a battle was started from the dungeon
    this.titleSel = 0;
    this.classSel = 0;
    this.charPhase = 'class';     // 'class' | 'attrib'
    this.attribs = { might: 0, ward: 0, vigor: 0, spirit: 0 };
    this.attribSel = 0;
    this.pause = null;            // { sel } when the pause menu overlay is open
    this.choice = null;           // { title, lines, options:[{label,fn}], sel } overlay
    this.titleT = 0;
    this.deathDepth = 0;
    this.questOffer = null;      // { who, quest } when a King/Queen is consulted
    this.returnState = 'dungeon';
    this.input = { up: false, down: false, left: false, right: false };
    this.afterDialog = null;
    this.audio = makeAudio();
    this.music = new Music(() => this.audio.ctx());
    this.activeOperation = null;       // A3: Current furnace operation (FurnaceOperation)
    this.activeFurnace = null;         // A3: Reference to the furnace running the operation
    this.castle = null;                // A3: Castle instance — single source of truth for furnaces/NPCs
    this.activeNPCs = {};              // C1: Track NPCs in active room (npcId -> room)
    this.dangerChoice = null;          // C1: Player choice when danger occurred
    this._bindKeys();
  }

  // map current state -> music area key
  _musicArea() {
    switch (this.state) {
      case 'title': case 'charselect': return 'title';
      case 'gameover': return 'gameover';
      case 'victory': return 'victory';
      case 'battle': return 'battle';
      case 'dungeon': return this.dungeon ? this.dungeon.stage.key : 'nigredo';
      case 'quest':
        return this.returnState === 'overworld' ? 'overworld'
             : (this.dungeon ? this.dungeon.stage.key : 'overworld');
      default: return 'overworld';   // overworld, dialog
    }
  }

  // ---- persistence ----
  save() {
    if (!this.hero) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.hero)); } catch (e) {}
  }
  hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
  load() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; }
  }
  wipeSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
  bestDepth() { try { return parseInt(localStorage.getItem(SCORE_KEY) || '0', 10) || 0; } catch (e) { return 0; } }
  recordDepth(d) { try { if (d > this.bestDepth()) localStorage.setItem(SCORE_KEY, String(d)); } catch (e) {} }

  sfx(name) { this.audio.play(name); }

  // ---- flow ----
  goCharSelect() {
    this.classSel = 0;
    this.charPhase = 'class';
    this.attribs = { might: 0, ward: 0, vigor: 0, spirit: 0 };
    this.attribSel = 0;
    this.state = 'charselect';
    this.audio.unlock();
  }
  attribSpent() { return this.attribs.might + this.attribs.ward + this.attribs.vigor + this.attribs.spirit; }
  attribLeft() { return ATTRIB_POINTS - this.attribSpent(); }

  newGame(classId, attribs) {
    this.hero = newHero(classId, attribs);
    this.world = new World(this);
    this.castle = createCastleForCourt('prague');
    this.activeFurnace = this.castle.furnaces.main;
    this.state = 'overworld';
    this.msg.queue = []; this.msg.done = true;
    this.audio.unlock();
    this.msg.push('Above lies the world of Atalanta; below, the Opus awaits. Seek the King, then descend the eastern stair.');
  }
  continueGame() {
    const s = this.load();
    if (!s) { this.goCharSelect(); return; }
    this.hero = s;
    if (this.hero.depth == null) { this.hero.depth = 0; this.hero.maxDepth = 0; }
    this.world = new World(this);
    this.castle = createCastleForCourt('prague');
    this.activeFurnace = this.castle.furnaces.main;
    this.state = 'overworld';
    this.audio.unlock();
  }

  // ---- the Opus (roguelike descent) ----
  startDungeon(depth, stageChanged = true) {
    this.hero.depth = depth;
    if (depth > (this.hero.maxDepth || 0)) this.hero.maxDepth = depth;
    this.dungeon = new Dungeon(this, depth);
    this.state = 'dungeon';
    this.msg.queue = []; this.msg.done = true;
    const st = stageForFloor(depth);
    const fl = floorInfo(depth);
    if (stageChanged) this.msg.push(`${st.name} — ${st.sub}.`, `${st.latin ? st.latin + '.  ' : ''}${st.motto}`);
    this.msg.push(`Floor ${depth}: ${fl.name}.`, `The work here is ${fl.op}.`);
    if (depth === FINAL_FLOOR) this.msg.push('At the foot of the Work, the Dragon stirs...');
    this.questProgress('reach', { depth });
    this.save();
  }
  descend() {
    const prev = stageForFloor(this.hero.depth);
    const next = this.hero.depth + 1;
    const changed = stageForFloor(next).key !== prev.key;
    this.startDungeon(next, changed);
  }

  startBattle(monsterId, scale = 1) {       // overworld wild encounter
    this._dungeonEnemy = null;
    this.battle = new Battle(this, monsterId, scale);
    this.state = 'battle';
    this.audio.play('encounter');
  }
  startDungeonBattle(monsterId, enemyRef, scale) {
    this._dungeonEnemy = enemyRef;
    this.battle = new Battle(this, monsterId, scale);
    this.state = 'battle';
    this.audio.play('encounter');
  }
  endBattle(result) {
    const fromDungeon = !!this._dungeonEnemy;
    const enemy = this._dungeonEnemy;
    const slainId = this.battle ? this.battle.mon.id : null;
    this.battle = null; this._dungeonEnemy = null;

    if (result === 'lose') { this._die(); return; }

    if (fromDungeon) {
      if (result === 'win') {
        if (enemy.boss) { this._win(); return; }
        this.dungeon.removeEnemy(enemy);
        this.questProgress('slay', { monId: slainId });
      }
      // win or flee -> back to the dungeon floor
      this.state = 'dungeon';
      this.save();
      return;
    }
    // overworld encounter
    if (result === 'win') this.questProgress('slay', { monId: slainId });
    if (this.hero.flags.dragonSlain) { this._win(); return; }
    this.state = 'overworld';
    this.save();
  }

  // ---- quests (random calls-to-action from King/Queen) ----
  offerQuest(who) {
    this.returnState = (this.state === 'overworld' || this.state === 'dialog') ? 'overworld' : 'dungeon';
    const held = new Set((this.hero.quests || []).map(q => q.id));
    // priority: offer the next step of the Great Work (either royal may give it)
    const nextOpus = OPUS_LINE[this.hero.opusStep || 0];
    let quest = null;
    if (nextOpus && !held.has(nextOpus.id) && (this.hero.opusStep < OPUS_LINE.length) &&
        (Math.random() < 0.6 || this.returnState === 'overworld')) {
      quest = nextOpus;
    } else {
      const done = new Set(this.hero._questsSeen || []);
      let pool = allQuestsByGiver(who).filter(q => !held.has(q.id) && !done.has(q.id));
      if (pool.length === 0) pool = allQuestsByGiver(who).filter(q => !held.has(q.id));
      if (pool.length) quest = pool[Math.floor(Math.random() * pool.length)];
      else if (nextOpus && !held.has(nextOpus.id)) quest = nextOpus;   // fall back to the Work
    }
    if (!quest) { this.msg.push(`${who === 'king' ? 'The King' : 'The Queen'} has no charge for thee now.`); this.state = this.returnState; return; }
    this.questOffer = { who, quest };
    this.state = 'quest';
    this.audio.play('magic');
  }
  acceptQuest() {
    const q = this.questOffer.quest;
    if (!this.hero.quests) this.hero.quests = [];
    this.hero.quests.push({ id: q.id, count: 0, baseGold: this.hero.gold, acceptDepth: this.hero.depth || 0 });
    (this.hero._questsSeen = this.hero._questsSeen || []).push(q.id);
    this.questOffer = null;
    this.state = this.returnState;
    this.msg.push(`Charge taken: “${q.title}.”`);
    // Special handling for emblem quests
    if (q.emblem && (q.objective.kind === 'furnace_operation' || q.objective.kind === 'furnace_maintain' || q.objective.kind === 'furnace_cycle')) {
      this.msg.push('This alchemical work requires a furnace in a castle. Seek out the castles and their lab spaces.');
    }
    this.save();
  }
  declineQuest() { this.questOffer = null; this.state = this.returnState; }

  questProgress(event, payload = {}) {
    const h = this.hero;
    if (!h.quests || !h.quests.length) return;
    for (const active of [...h.quests]) {
      const def = QUEST_BY_ID[active.id]; if (!def) continue;
      const o = def.objective;
      let done = false;
      if (event === 'slay' && (o.kind === 'slay' || o.kind === 'slayType')) {
        const hit = o.kind === 'slay' || payload.monId === o.monId || payload.monId === o.alt;
        if (hit) { active.count++; if (active.count >= o.target) done = true; }
      } else if (event === 'collect' && o.kind === 'collect') {
        active.count++; if (active.count >= o.target) done = true;
      } else if (event === 'reach' && o.kind === 'reach') {
        if (o.stage) { if (stageForFloor(payload.depth).key === o.stage) done = true; }
        else if (o.deeper) { if (payload.depth - active.acceptDepth >= o.deeper) done = true; }
      } else if (event === 'gold' && o.kind === 'gold') {
        if (h.gold - active.baseGold >= o.target) done = true;
      }
      if (done) this._completeQuest(active, def);
    }
  }

  _completeQuest(active, def) {
    const h = this.hero;
    h.quests = h.quests.filter(a => a !== active);
    h.questsDone = (h.questsDone || 0) + 1;
    const r = def.reward, gains = [];
    if (r.gold) { h.gold += r.gold; gains.push(`${r.gold} gold`); }
    if (r.xp) { h.xp += r.xp; gains.push(`${r.xp} EXP`); }
    if (r.maxhp) { h.maxHp += r.maxhp; h.hp += r.maxhp; gains.push(`+${r.maxhp} max HP`); }
    if (r.item) { const [k, n] = r.item; h.items[k] = (h.items[k] || 0) + n; gains.push(`${n}× ${ITEMS[k].name}`); }
    if (r.boon === 'crowned' && !h.flags.crowned) {
      h.flags.crowned = true; h.atk += 5; h.def += 4; gains.push('the Crown (+5 atk, +4 def)');
    }
    this.audio.play('level');
    const giver = def.giver === 'king' ? 'The King' : 'The Queen';
    this.msg.push(`✓ Charge fulfilled — “${def.title}”!`);
    this.msg.push(`Reward: ${gains.join(', ')}.`);
    // advance the Great Work
    if (def.line === 'opus') {
      h.opusStep = Math.max(h.opusStep || 0, def.step);
      if (def.step >= OPUS_LINE.length) this.msg.push('▸ The Great Work is all but accomplished — descend, and face the Dragon!');
      else this.msg.push('▸ The Great Work advances. Seek the next royal charge.');
    }
    this.save();
  }

  /**
   * C3: Complete quests triggered by furnace operation completion
   * Called when a furnace operation finishes (status === 'completed')
   */
  _completeFurnaceQuests(operation) {
    if (!this.hero) return;
    if (!this.hero.quests || !this.hero.quests.length) return;

    // Get completed quest IDs from operation
    const completedQuestIds = operation.getCompletedQuests(this.hero);

    for (const questId of completedQuestIds) {
      const activeQuest = this.hero.quests.find(q => q.id === questId);
      const questDef = QUEST_BY_ID[questId];

      if (!activeQuest || !questDef) continue;

      // Calculate rewards with multipliers
      const rewards = operation.calculateRewards(questDef, this.hero, null);

      // Apply rewards
      const gains = [];
      if (rewards.gold > 0) {
        this.hero.gold += rewards.gold;
        gains.push(`${rewards.gold} gold`);
      }
      if (rewards.xp > 0) {
        this.hero.xp += rewards.xp;
        gains.push(`${rewards.xp} EXP`);
      }
      if (rewards.items && rewards.items.length > 0) {
        for (const item of rewards.items) {
          const itemData = ITEMS[item.id];
          if (itemData) {
            this.hero.items[item.id] = (this.hero.items[item.id] || 0) + item.qty;
            gains.push(`${item.qty}× ${itemData.name}`);
          }
        }
      }

      // Remove from active quests and track completion
      this.hero.quests = this.hero.quests.filter(q => q.id !== questId);
      this.hero.questsDone = (this.hero.questsDone || 0) + 1;

      // Track emblem completion and phase progression
      if (questDef.emblem !== undefined) {
        this._trackEmblemCompletion(questDef.emblem, questId);
      }

      // Check for quest chain unlocks
      if (questDef.unlock_next) {
        this._unlockNextQuest(questDef.unlock_next);
      }

      // Play completion sound and show message
      this.audio.play('level');
      this.msg.push(`Charge fulfilled — “${questDef.title}”!`, `Reward: ${gains.join(', ')}.`);
    }

    this.save();
  }

  /**
   * C3: Track emblem quest completion and phase progression
   */
  _trackEmblemCompletion(emblemNum, questId) {
    const h = this.hero;
    if (!h.alchemy) return;

    // Add to completed emblems if not already there
    if (!h.alchemy.completed_emblems.includes(emblemNum)) {
      h.alchemy.completed_emblems.push(emblemNum);
    }

    // Check if we should unlock the next phase
    this._checkEmblemPhaseUnlock(h);
  }

  /**
   * C3: Check if phase progression criteria are met
   * Foundation (1-2): 2 completed → unlock purification
   * Purification (3-5): 3 completed → unlock union
   * Union (6-9): 4 completed → unlock mastery
   * etc.
   */
  _checkEmblemPhaseUnlock(hero) {
    if (!hero.alchemy) return;

    const completed = hero.alchemy.completed_emblems;
    const currentPhase = hero.alchemy.emblem_phase || 0;

    // Phase gates based on completed count
    const phaseGates = [
      { name: 'Foundation', required: 2, emblems: [1, 2] },
      { name: 'Purification', required: 3, emblems: [3, 4, 5] },
      { name: 'Union', required: 4, emblems: [6, 7, 8, 9] },
      { name: 'Mastery', required: 5, emblems: [10, 11, 12, 16, 17] },
      { name: 'Turning Point', required: 1, emblems: [26] },
      { name: 'Advanced', required: 4, emblems: [13, 14, 15] },
      { name: 'Celestial', required: 3, emblems: [23, 24, 28] },
      { name: 'Mythological', required: 5, emblems: [29, 30, 47] },
      { name: 'Final', required: 1, emblems: [48] },
      { name: 'Ultimate', required: 2, emblems: [49, 50] },
    ];

    // Check each gate to see if we've unlocked a new phase
    for (let i = currentPhase + 1; i < phaseGates.length; i++) {
      const gate = phaseGates[i];
      const gateCompleted = gate.emblems.filter(e => completed.includes(e)).length;

      if (gateCompleted >= gate.required) {
        hero.alchemy.emblem_phase = i;
        this.msg.push(`🔮 New phase unlocked: ${gate.name}!`);

        // Award skill unlocks for certain phases
        if (!hero.alchemy.skill_unlocks.includes(gate.name.toLowerCase())) {
          hero.alchemy.skill_unlocks.push(gate.name.toLowerCase());
        }
      }
    }
  }

  /**
   * C3: Unlock next quest in a chain
   */
  _unlockNextQuest(nextQuestId) {
    if (!this.hero.quests) this.hero.quests = [];

    // Check if already unlocked
    if (this.hero.quests.some(q => q.id === nextQuestId)) return;

    // Find quest definition
    const nextQuestDef = QUEST_BY_ID[nextQuestId];
    if (!nextQuestDef) return;

    this.msg.push(`You've proven yourself. New tasks await: ${nextQuestDef.title}`);
  }

  _die() {
    this.deathDepth = this.hero.depth || 0;
    this.recordDepth(this.deathDepth);
    this.wipeSave();                        // permadeath
    this.state = 'gameover';
  }
  _win() {
    this.hero.flags.dragonSlain = true;
    this.recordDepth(this.hero.depth || FINAL_FLOOR);
    this.wipeSave();                        // a finished run is spent
    this.state = 'victory';
  }

  // landmark events
  dialog(lines, after = null) {
    this.afterDialog = after;
    this.state = 'dialog';
    this.msg.push(...lines);
    this.msg.onEmpty = () => {
      this.state = 'overworld';
      const f = this.afterDialog; this.afterDialog = null;
      if (f) f();
    };
  }
  enterCastle() {
    if (!this.hero.flags.metKing) {
      this.hero.flags.metKing = true;
      this.dialog([
        'You enter the Sun-Castle, its walls inscribed with secret glyphs.',
        'The KING sits upon a throne of alchemical symbols.',
        'KING: Adept, the Work descends through four stages — Nigredo, Albedo, Citrinitas, Rubedo.',
        'KING: At the foot of the Opus coils the Alchemical Dragon. Slay it to win the Stone.',
        'KING: Take these Golden Apples — cast one down to flee any foe, as Atalanta did.',
        'KING: Return to my throne, or my Queen at her bower, for charges of the Work.',
        'KING: My laboratories await those ready to perform the Work.',
        'Received 30 gold and 2 Golden Apples.'
      ], () => { this.hero.gold += 30; this.hero.items.apple = (this.hero.items.apple || 0) + 2; this.save(); });
    } else {
      this.choice = {
        title: 'Sun-Castle',
        lines: ['Consult the King or visit the Laboratory?'],
        options: [
          { label: 'Consult the King', fn: () => { this.choice = null; this.offerQuest('king'); } },
          { label: 'Visit Laboratory', fn: () => { this.choice = null; this._showLabMenu(); } },
          { label: 'Leave Castle', fn: () => { this.choice = null; this.state = 'overworld'; } }
        ],
        sel: 0
      };
      this.state = 'choice';
    }
  }

  _showLabMenu() {
    this.choice = {
      title: 'Alchemical Laboratory',
      lines: ['Select a lab space:'],
      options: [
        { label: 'Furnace Chamber (Calcination/Distillation)', fn: () => { this.choice = null; this._showFurnaceMenu('furnace_chamber'); } },
        { label: 'Distillery (Purification)', fn: () => { this.choice = null; this._showFurnaceMenu('distillery'); } },
        { label: 'Library (Study)', fn: () => { this.choice = null; this.msg.push('You study alchemical texts... Gained 5 XP.'); this.hero.xp += 5; this.state = 'overworld'; } },
        { label: 'Garden (Gather)', fn: () => { this.choice = null; this.msg.push('You gather materials... Found 2 vitriol.'); this.hero.items.vitriol = (this.hero.items.vitriol || 0) + 2; this.state = 'overworld'; } },
        { label: 'Tend to the Wounded', fn: () => { this.choice = null; this._showHealingMenu(); } },
        { label: 'Back', fn: () => { this.choice = null; this.state = 'overworld'; } }
      ],
      sel: 0
    };
    this.state = 'choice';
  }

  // C2: Show healing menu to select an NPC to heal
  _showHealingMenu() {
    // Mock data for C2 (in full game, would query castle.getSickNPCs())
    const sickNPCs = [
      { id: 'master_alchemist', name: 'Master Cornelius', health_state: 'sickened' },
      { id: 'apprentice', name: 'Young Wilhelm', health_state: 'injured' },
    ];

    if (sickNPCs.length === 0) {
      this.msg.push('All the NPCs in the castle appear healthy.');
      this.state = 'overworld';
      return;
    }

    this.choice = {
      title: 'Tend to the Wounded',
      lines: ['Select an NPC to heal:'],
      options: [
        ...sickNPCs.map(npc => ({
          label: `${npc.name} (${npc.health_state})`,
          fn: () => { this.choice = null; this._showHealingItemMenu(npc); }
        })),
        { label: 'Back to Lab', fn: () => { this.choice = null; this._showLabMenu(); } }
      ],
      sel: 0
    };
    this.state = 'choice';
  }

  // C2: Show available healing items for applying to selected NPC
  _showHealingItemMenu(npc) {
    // Mock inventory of healing items (in full game, check hero.items)
    const mockItems = [
      { id: 'healing_ointment', name: 'Healing Ointment', potency: 9 },
      { id: 'herbal_antidote', name: 'Herbal Antidote', potency: 8 },
      { id: 'aloe_vera_gel', name: 'Aloe Vera Gel', potency: 9 },
    ];

    if (mockItems.length === 0) {
      this.msg.push(`You have no healing items to treat ${npc.name}.`);
      this.state = 'overworld';
      return;
    }

    this.choice = {
      title: `Treat ${npc.name}`,
      lines: [`${npc.name} is ${npc.health_state}. Select a healing item:`],
      options: [
        ...mockItems.map(item => ({
          label: item.name,
          fn: () => { this.choice = null; this._applyHealing(npc, item); }
        })),
        { label: 'Cancel', fn: () => { this.choice = null; this._showHealingMenu(); } }
      ],
      sel: 0
    };
    this.state = 'choice';
  }

  // C2: Apply healing item to NPC
  _applyHealing(npc, healingItem) {
    const potency = healingItem.potency || 10;
    const healing = potency + Math.floor(Math.random() * 20);

    // Determine new health state (mock progression)
    let newState = 'healthy';
    if (npc.health_state === 'critical') newState = 'injured';
    else if (npc.health_state === 'injured') newState = 'sickened';
    else newState = 'healthy';

    this.msg.push(
      `You administer ${healingItem.name} to ${npc.name}.`,
      `${npc.name} feels the treatment taking effect...`,
      `${npc.name} is now ${newState}. (Reputation +10)`
    );

    // In full game, would call: castle.heal(npc.id, healingItem)
    // and remove item from hero.items

    this.state = 'overworld';
    this.save();
  }

  _showFurnaceMenu(roomId) {
    const OPERATIONS = ['calcination', 'dissolution', 'distillation', 'conjunction', 'fermentation'];

    // C4: Get current furnace durability for display
    let furnaceDurability = 100;
    let repairCostMsg = '';
    if (this.activeFurnace) {
      furnaceDurability = Math.round(this.activeFurnace.durability || 100);
      const repairCost = calculateRepairCost(furnaceDurability, 'prague');
      repairCostMsg = ` (Durability: ${furnaceDurability}%, Repair cost: ${repairCost} gold)`;
    }

    this.choice = {
      title: 'Furnace Operation',
      lines: ['Select an operation:' + repairCostMsg],
      options: [
        ...OPERATIONS.map(op => ({
          label: op.charAt(0).toUpperCase() + op.slice(1),
          fn: () => {
            this.choice = null;
            // C1: Show material selection before starting operation
            this._showMaterialSelection(op, roomId);
          }
        })),
        // C4: Add repair option if furnace is damaged
        furnaceDurability < 100 ? {
          label: `Repair the Furnace (${furnaceDurability}%)`,
          fn: () => { this.choice = null; this._showRepairConfirm(roomId, furnaceDurability); }
        } : null,
        { label: 'Back to Lab', fn: () => { this.choice = null; this._showLabMenu(); } }
      ].filter(opt => opt !== null),
      sel: 0
    };
    this.state = 'choice';
  }

  // C1: Show material selection UI before starting operation
  _showMaterialSelection(operationId, roomId) {
    const hero = this.hero;
    const availableMaterialIds = Object.keys(hero.materials || {}).filter(id => (hero.materials[id] || 0) > 0);

    if (availableMaterialIds.length === 0) {
      this.msg.push('You have no alchemical materials to use in this operation.');
      this._showFurnaceMenu(roomId);
      return;
    }

    // Track selected materials and their quantities
    this.selectedMaterials = this.selectedMaterials || {};
    const selected = { ...this.selectedMaterials };

    this.choice = {
      title: `Select Materials for ${operationId.charAt(0).toUpperCase() + operationId.slice(1)}`,
      lines: [
        'Choose materials to place in the crucible.',
        'Press ← to decrease qty, → to increase, Enter to confirm.',
        ''
      ],
      options: [
        ...availableMaterialIds.map(matId => ({
          label: `${MATERIALS[matId].name} (have: ${hero.materials[matId]}, selected: ${selected[matId] || 0})`,
          fn: () => {
            // Increment selected qty for this material
            const currentQty = selected[matId] || 0;
            const maxAvailable = hero.materials[matId] || 0;
            if (currentQty < maxAvailable) {
              selected[matId] = currentQty + 1;
              this._showMaterialSelection(operationId, roomId);
            }
          }
        })),
        { label: '--- Confirm & Start Operation ---', fn: () => {
          this.choice = null;
          const materials = Object.entries(selected)
            .filter(([_, qty]) => qty > 0)
            .map(([matId, qty]) => ({ id: matId, qty, name: MATERIALS[matId].name }));
          this.selectedMaterials = {};
          this.startFurnaceOperation(operationId, 80, materials, roomId);
          this.state = 'overworld';
        }},
        { label: 'Back', fn: () => {
          this.choice = null;
          this._showFurnaceMenu(roomId);
        } }
      ],
      sel: 0
    };
    this.state = 'choice';
    this.selectedMaterials = selected;
  }

  // C4: Show repair confirmation dialog
  _showRepairConfirm(roomId, currentDurability) {
    const repairCost = calculateRepairCost(currentDurability, 'prague');

    if (this.hero.gold < repairCost) {
      this.msg.push(`You lack the ${repairCost} gold required for repairs.`);
      this.state = 'overworld';
      return;
    }

    this.choice = {
      title: 'Repair the Furnace',
      lines: [`Repair cost: ${repairCost} gold. Confirm?`],
      options: [
        {
          label: 'Confirm',
          fn: () => {
            this.choice = null;
            this.hero.gold -= repairCost;
            if (this.activeFurnace) {
              this.activeFurnace.durability = 80;
            }
            this.msg.push('The furnace hums smoothly again.');
            this.state = 'overworld';
            this.save();
          }
        },
        {
          label: 'Cancel',
          fn: () => { this.choice = null; this._showFurnaceMenu(roomId); }
        }
      ],
      sel: 0
    };
    this.state = 'choice';
  }

  // A3: Start a furnace operation
  /**
   * Start a new furnace operation.
   * @param {string} operationId - Operation identifier ('calcination', etc.)
   * @param {number} targetTemp - Target temperature in Celsius (20-200)
   * @param {Array} materials - Array of { id, qty, name } for materials in the crucible
   */
  startFurnaceOperation(operationId, targetTemp, materials, roomId = null) {
    if (this.activeOperation && this.activeOperation.status === 'running') {
      this.msg.push('A furnace operation is already in progress!');
      return false;
    }

    // Pick the furnace for this room from the castle; fall back to main
    if (this.castle) {
      const roomFurnace = Object.values(this.castle.furnaces).find(f => f.location === roomId);
      this.activeFurnace = roomFurnace || this.castle.furnaces.main;
    }
    this.activeFurnace.targetTemp = targetTemp;

    // C1: Get NPCs present in this room from the castle (pass actual NPC objects, not just IDs)
    const npcsInRoom = [];
    if (this.castle && roomId) {
      Object.values(this.castle.NPCs).forEach(npc => {
        if (npc.location === roomId) npcsInRoom.push(npc);
      });
    }

    // Create and start the operation with furnace durability and NPCs
    this.activeOperation = new FurnaceOperation(
      operationId,
      materials,
      targetTemp,
      this.activeFurnace.durability || 100,
      npcsInRoom
    );
    const opDisplay = operationId.charAt(0).toUpperCase() + operationId.slice(1);
    this.msg.push(`▸ Beginning ${opDisplay}`);
    this.msg.push(`▸ Target: ${targetTemp}°C | Materials: ${totalMats} units`);
    this.msg.push(`▸ Monitor the operation panel (top-right). Press ESC to return.`);
    return true;
  }
  enterQueenCourt() {
    if (!this.hero.flags.metQueen) {
      this.hero.flags.metQueen = true;
      this.dialog([
        'You emerge into a moonlit garden. The Queen\'s bower rises before you, shimmering.',
        'The QUEEN awaits, crowned with silver starlight.',
        'QUEEN: I am Luna, sister and bride to the Sun. The volatile is mine to rule.',
        'QUEEN: Come to my bower for charges of the whitening and the gathering.'
      ], () => this.save());
    } else {
      this.offerQuest('queen');    // the Queen sets a charge from her bower
    }
  }
  // Elchyell, Queen of the Elves — faerie recipe-mentor (Grund, *Anglia*). A rare
  // benevolent glade encounter that gifts a boon of the hidden Art.
  faerieMentor() {
    const h = this.hero;
    h.flags.faerie = (h.flags.faerie || 0) + 1;
    let line, apply;
    const r = Math.random();
    if (!h.spells.includes('WASH')) {
      apply = () => { h.spells.push('WASH'); };
      line = 'ELCHYELL: Learn the Washing — say WASH, and curses fall away.';
    } else if (r < 0.4) {
      apply = () => { h.items.greekfire = (h.items.greekfire || 0) + 1; };
      line = 'She presses a vial of quenchless Greek Fire into thy hand.';
    } else if (r < 0.7) {
      apply = () => { h.items.theriac = (h.items.theriac || 0) + 1; h.items.apple = (h.items.apple || 0) + 1; };
      line = 'She gifts thee Theriac and a Golden Apple.';
    } else {
      const g = 20 + Math.floor(Math.random() * 30);
      apply = () => { h.gold += g; };
      line = `She scatters faerie gold at thy feet — ${g} pieces.`;
    }
    this.dialog([
      'A ring of glowing mushrooms opens in the wood.',
      'ELCHYELL, Queen of the Elves, steps from the green shade.',
      'ELCHYELL: Few find my glade, adept. Take a gift of the hidden Art.',
      line
    ], () => { apply(); this.save(); });
  }
  // The wandering adept (Moritz) — an ethics fork (Zuber, *Ambix*). Fund him
  // fairly for a loyal boon, or exploit him cheaply and bear his curse.
  adeptEncounter() {
    const h = this.hero;
    this.openChoice(
      'A RAGGED ADEPT',
      ['A starving foreign adept offers his secret process for coin.',
       '"Whenever I asked for bread, they sucked the blood from my heart…"'],
      [
        { label: 'Pay him fairly (60 gold) — gain a loyal craftsman', fn: () => {
          if (h.gold < 60) { this.dialog(['You have not 60 gold. The adept turns away, despairing.']); return; }
          h.gold -= 60; h.flags.adeptAlly = true;
          h.attribs.spirit = (h.attribs.spirit || 0) + 1; recomputeStats(h);
          h.items.greekfire = (h.items.greekfire || 0) + 2;
          this.dialog(['ADEPT: You are honest! Take my true process — and my loyalty.',
            'Gained +1 Spirit and 2 Greek Fire. (A loyal crafter remembers.)'], () => this.save());
        } },
        { label: 'Haggle him down (20 gold) — cheap, but he curses you', fn: () => {
          if (h.gold < 20) { this.dialog(['You have not even 20 gold. The adept spits and shuffles off.']); return; }
          h.gold -= 20; h.flags.adeptWronged = true;
          h.items.greekfire = (h.items.greekfire || 0) + 1;
          const loss = 4; h.maxHp = Math.max(10, h.maxHp - loss); h.hp = Math.min(h.hp, h.maxHp);
          this.audio.play('lose');
          this.dialog(['ADEPT: A pittance! Then take it — and my curse upon your house.',
            `Gained 1 Greek Fire, but his curse saps your vigour (−${loss} max HP).`], () => this.save());
        } },
        { label: 'Refuse and walk on', fn: () => { this.dialog(['You leave the adept to his laborynthory of woes.']); } },
      ]
    );
  }
  enterTown() {
    this.town = new Town(this, 'Village of Mercurius');
    this.state = 'town';
    this.msg.queue = []; this.msg.done = true;
  }
  leaveTown() {
    this.town = null;
    this.state = 'overworld';
    this.save();
  }
  enterDungeon() {
    if (this.hero.flags.dragonSlain) {
      this.dialog(['The Opus is complete. The Stone is yours.']);
      return;
    }
    this.dialog(
      ['You descend into the prima materia. Festina lente — make haste slowly.'],
      () => this.startDungeon(1)
    );
  }

  // ---- input ----
  _bindKeys() {
    const down = (e) => {
      const k = e.key;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(k)) e.preventDefault();
      this._key(k, true);
    };
    const up = (e) => this._key(e.key, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    // on-screen dpad / buttons. data-key = one key; data-keys = several at once
    // (used by the diagonal buttons, which must hold two directions together).
    document.querySelectorAll('[data-key],[data-keys]').forEach(el => {
      const keys = el.dataset.keys ? el.dataset.keys.split(',') : [el.dataset.key];
      const send = (v) => (ev) => { ev.preventDefault(); keys.forEach(kk => this._key(kk, v)); };
      el.addEventListener('touchstart', send(true), {passive:false});
      el.addEventListener('touchend', send(false), {passive:false});
      el.addEventListener('mousedown', send(true));
      el.addEventListener('mouseup', send(false));
      el.addEventListener('mouseleave', send(false));
    });
  }
  _mapKey(k) {
    switch (k) {
      case 'ArrowUp': case 'w': case 'W': return 'up';
      case 'ArrowDown': case 's': case 'S': return 'down';
      case 'ArrowLeft': case 'a': case 'A': return 'left';
      case 'ArrowRight': case 'd': case 'D': return 'right';
      case ' ': case 'Enter': case 'z': case 'Z': return 'confirm';
      case 'x': case 'X': case 'Backspace': return 'cancel';
      case 'Escape': case 'p': case 'P': case 'Tab': return 'menu';
      case 'm': case 'M': return 'mute';
      case 'n': case 'N': return 'musicnext';
    }
    return null;
  }
  _key(rawKey, isDown) {
    const k = this._mapKey(rawKey);
    if (!k) return;
    this.audio.unlock();
    this.music.start();
    if (k === 'mute') { if (isDown) this.music.toggleMute(); return; }
    if (k === 'musicnext') { if (isDown) this.music.next(); return; }
    // continuous movement flags for overworld
    if (['up','down','left','right'].includes(k)) this.input[k] = isDown;
    if (!isDown) return;            // discrete actions on press only
    this._press(k);
  }
  // ---- pause / system menu ----
  pauseOptions() {
    return ['Resume', 'Quest Log', 'Music: Next Fugue', this.music.muted ? 'Music: Off ▶ turn On' : 'Music: On ▶ turn Off', 'Save & Quit to Title'];
  }
  openPause() {
    this.input = { up: false, down: false, left: false, right: false };
    this.pause = { sel: 0 };
    this.audio.play('magic');
  }
  closePause() { this.pause = null; }
  _pressPause(k) {
    // Handle quest log navigation
    if (this.pause.mode === 'questlog') {
      if (k === 'menu' || k === 'cancel') this.pause = { sel: 1 };
      return;
    }

    const opts = this.pauseOptions();
    if (k === 'up') this.pause.sel = (this.pause.sel - 1 + opts.length) % opts.length;
    else if (k === 'down') this.pause.sel = (this.pause.sel + 1) % opts.length;
    else if (k === 'menu' || k === 'cancel') this.closePause();
    else if (k === 'confirm') {
      switch (this.pause.sel) {
        case 0: this.closePause(); break;
        case 1: this.pause = { sel: 0, mode: 'questlog' }; break;
        case 2: this.music.next(); break;
        case 3: this.music.toggleMute(); break;
        case 4: this.save(); this.closePause(); this.state = 'title'; this.titleSel = 0; break;
      }
    }
  }

  // ---- generic two-or-three way choice overlay (NPC decisions) ----
  openChoice(title, lines, options) {
    this.input = { up: false, down: false, left: false, right: false };
    this.choice = { title, lines, options, sel: 0 };
    this.audio.play('magic');
  }
  _pressChoice(k) {
    const c = this.choice;
    if (k === 'up') c.sel = (c.sel - 1 + c.options.length) % c.options.length;
    else if (k === 'down') c.sel = (c.sel + 1) % c.options.length;
    else if (k === 'confirm') {
      const opt = c.options[c.sel];
      this.choice = null;
      if (opt && opt.fn) opt.fn();
    }
  }

  // C1: Show danger choice dialog when furnace danger occurs
  _showDangerChoice() {
    if (!this.activeOperation || !this.activeOperation.triggered_danger) return;

    const dangerData = this.activeOperation.getDangerChoice();
    if (!dangerData) return;

    const options = dangerData.options.map(opt => ({
      label: opt.label,
      fn: () => {
        this._resolveDangerChoice(opt.value);
      }
    }));

    this.openChoice(dangerData.title, [dangerData.description], options);
  }

  // C1: Apply consequences of player's choice for danger
  _resolveDangerChoice(choice) {
    if (!this.activeOperation) return;

    const consequence = this.activeOperation.resolveDanger(choice, this.hero);
    if (!consequence) return;

    // Show consequence messages
    for (const msg of consequence.messages) {
      this.msg.push(msg);
    }

    // Update furnace durability if it was damaged
    if (consequence.furnace_damage && this.activeFurnace) {
      this.activeFurnace.durability = this.activeOperation.furnaceDurability;
    }

    this.save();
  }

  _press(k) {
    // overlays intercept all input while open
    if (this.choice) { this._pressChoice(k); return; }
    // the pause overlay intercepts all input while open
    if (this.pause) { this._pressPause(k); return; }
    // open the pause menu from any in-play state
    if (k === 'menu' && ['overworld', 'dungeon', 'town', 'dialog', 'quest'].includes(this.state)) {
      this.openPause(); return;
    }
    if (this.state === 'title') {
      const opts = this.titleOptions();
      if (k === 'up') this.titleSel = (this.titleSel - 1 + opts.length) % opts.length;
      if (k === 'down') this.titleSel = (this.titleSel + 1) % opts.length;
      if (k === 'confirm') {
        const choice = opts[this.titleSel];
        if (choice === 'New Quest') this.goCharSelect();
        else if (choice === 'Continue') this.continueGame();
      }
      return;
    }
    if (this.state === 'charselect') {
      if (this.charPhase === 'class') {
        const COLS = 3;
        const col = this.classSel % COLS, row = Math.floor(this.classSel / COLS);
        let newCol = col, newRow = row;
        if (k === 'left')  newCol = (col - 1 + COLS) % COLS;
        if (k === 'right') newCol = (col + 1) % COLS;
        if (k === 'up')    newRow = Math.max(0, row - 1);
        if (k === 'down')  newRow = Math.min(2, row + 1);
        this.classSel = newRow * COLS + newCol;
        if (k === 'confirm') { this.charPhase = 'attrib'; this.attribSel = 0; }
        if (k === 'cancel') { this.state = 'title'; this.titleSel = 0; }
      } else { // attribute point-buy
        if (k === 'up')   this.attribSel = (this.attribSel - 1 + ATTRIBS.length) % ATTRIBS.length;
        if (k === 'down') this.attribSel = (this.attribSel + 1) % ATTRIBS.length;
        const key = ATTRIBS[this.attribSel].key;
        if (k === 'right' && this.attribLeft() > 0) this.attribs[key]++;
        if (k === 'left' && this.attribs[key] > 0) this.attribs[key]--;
        if (k === 'confirm') this.newGame(CLASSES[this.classSel].id, { ...this.attribs });
        if (k === 'cancel') { this.charPhase = 'class'; }
      }
      return;
    }
    if (this.state === 'dialog') {
      if (k === 'confirm') this.msg.advance();
      return;
    }
    if (this.state === 'battle' && this.battle) {
      this.battle.input(k);
      return;
    }
    if (this.state === 'gameover' || this.state === 'victory') {
      if (k === 'confirm') { this.state = 'title'; this.titleSel = 0; }
      return;
    }
    if (this.state === 'quest') {
      if (k === 'confirm') this.acceptQuest();
      else if (k === 'cancel') this.declineQuest();
      return;
    }
    if (this.state === 'town' && this.town) { this.town.input(k); return; }
    if (this.state === 'dungeon') {
      if (!this.msg.empty) { if (k === 'confirm') this.msg.advance(); return; }
      if (k === 'up')    this.dungeon.step(-1, -1);
      else if (k === 'down')  this.dungeon.step(1, 1);
      else if (k === 'left')  this.dungeon.step(-1, 1);
      else if (k === 'right') this.dungeon.step(1, -1);
      return;
    }
    if (this.state === 'overworld') {
      if (k === 'confirm' && !this.msg.empty) this.msg.advance();
      if (k === 'cancel') this.save();
    }
  }

  titleOptions() { return this.hasSave() ? ['Continue', 'New Quest'] : ['New Quest']; }

  // ---- loop ----
  update(dt) {
    this.msg.update(dt);
    this.titleT += dt;
    this.music.setArea(this._musicArea());

    // A3: Tick active furnace operation
    if (this.activeOperation && (this.activeOperation.status === 'running' || this.activeOperation.status === 'paused')) {
      const tickResult = this.activeOperation.tick(dt);

      // C1: Check if danger was triggered
      if (tickResult && tickResult.danger_triggered) {
        this.msg.push(`⚠ DANGER: ${tickResult.danger.name}!`);
        this.msg.push(`▸ ${tickResult.danger.description}`);
        this._showDangerChoice();
        this.audio.play('warning'); // auditory alert for danger
      }
      // Check if operation just completed
      else if (this.activeOperation.status === 'completed') {
        const opName = this.activeOperation.operationId.charAt(0).toUpperCase() + this.activeOperation.operationId.slice(1);
        this.msg.push(`✓ ${opName} complete!`);
        this.msg.push(`Progress: ${Math.round(this.activeOperation.progress)}% | Fuel: ${this.activeOperation.fuel.toFixed(1)}`);
        // C3: Check and complete matching emblem quests
        this._completeFurnaceQuests(this.activeOperation);
      }
    }

    if (this.state === 'overworld') {
      this.world.update(dt, this.input);
    } else if (this.state === 'dungeon' && this.dungeon) {
      this.dungeon.update(dt, this.input);
    } else if (this.state === 'battle' && this.battle) {
      this.battle.update(dt);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    if (this.state === 'title') return this._renderTitle(ctx);
    if (this.state === 'charselect') return this._renderCharSelect(ctx);
    if (this.state === 'gameover') {
      return this._renderEnd(ctx, 'NIGREDO', '#1a0808',
        `${this.hero ? this.hero.name : 'The adept'} dissolves into the blackness.\n` +
        `Reached floor ${this.deathDepth}.   Deepest descent: ${this.bestDepth()}.`);
    }
    if (this.state === 'victory') return this._renderEnd(ctx, 'RUBEDO — THE STONE', '#2a0d0d',
      'The Dragon is undone and the Lapis is achieved.\nThe Great Work is complete.');

    if (this.state === 'overworld' || this.state === 'dialog') {
      this.world.render(ctx);
      this._hud(ctx);
      if (!this.msg.empty) this.msg.render(ctx, 14, this.H - 116, this.W - 28, 104);
    } else if (this.state === 'town' && this.town) {
      this.town.render(ctx);
    } else if (this.state === 'dungeon' && this.dungeon) {
      this.dungeon.render(ctx);
      if (!this.msg.empty) this.msg.render(ctx, 14, this.H - 116, this.W - 28, 104);
    } else if (this.state === 'quest' && this.questOffer) {
      if (this.returnState === 'overworld' && this.world) { this.world.render(ctx); this._hud(ctx); }
      else if (this.dungeon) this.dungeon.render(ctx);
      this._renderQuest(ctx);
    } else if (this.state === 'battle' && this.battle) {
      this.battle.render(ctx);
    }
    if (this.pause) this._renderPause(ctx);
    if (this.choice) this._renderChoice(ctx);

    // A3: Render furnace operation panel if active
    if (this.activeOperation && this.activeFurnace) {
      renderFurnacePanel(ctx, this.W - 340, 20, this.activeOperation, this.activeFurnace);
    }
  }

  _renderChoice(ctx) {
    const c = this.choice;
    ctx.fillStyle = 'rgba(8,6,14,0.74)'; ctx.fillRect(0, 0, this.W, this.H);
    const pw = 540, ph = 150 + c.lines.length * 22 + c.options.length * 30;
    const px = this.W / 2 - pw / 2, py = this.H / 2 - ph / 2;
    parchmentCard(ctx, px, py, pw, ph);
    text(ctx, c.title, this.W / 2, py + 18, { align: 'center', size: 18, color: '#7a2010', shadow: false });
    let yy = py + 52;
    c.lines.forEach(ln => { yy = this._wrapInk(ctx, ln, px + 28, yy, pw - 56, 18) + 4; });
    yy += 6;
    c.options.forEach((o, i) => {
      const sel = i === c.sel;
      if (sel) text(ctx, '▶', px + 30, yy, { size: 15, color: '#7a2010', shadow: false });
      text(ctx, o.label, px + 52, yy, { size: 15, color: sel ? '#7a2010' : '#3a2a18', shadow: false });
      yy += 30;
    });
    if (Math.floor(this.titleT * 1.5) % 2 === 0)
      text(ctx, '↑↓ choose   •   Z confirm', this.W / 2, py + ph - 18, { align: 'center', size: 12, color: '#5b4226', shadow: false });
  }

  _renderPause(ctx) {
    ctx.fillStyle = 'rgba(8,6,14,0.74)'; ctx.fillRect(0, 0, this.W, this.H);

    if (this.pause.mode === 'questlog') {
      return this._renderQuestLog(ctx);
    }

    const opts = this.pauseOptions();
    const pw = 360, ph = opts.length * 34 + 92, px = this.W / 2 - pw / 2, py = this.H / 2 - ph / 2;
    window9(ctx, px, py, pw, ph);
    text(ctx, '❖ PAUSED ❖', this.W / 2, py + 16, { align: 'center', size: 20, color: COLORS.hi });
    const np = this.music.nowPlaying();
    text(ctx, np ? `Now playing: Fugue ${np}` : 'Music idle', this.W / 2, py + 44, { align: 'center', size: 12, color: COLORS.textDim });
    menu(ctx, opts, px + 44, py + 70, this.pause.sel, { lh: 34 });
    text(ctx, 'Z select • Esc/X resume', this.W / 2, py + ph - 18, { align: 'center', size: 12, color: COLORS.textDim });
  }

  _renderQuestLog(ctx) {
    const pw = 500, ph = 380, px = this.W / 2 - pw / 2, py = this.H / 2 - ph / 2;
    window9(ctx, px, py, pw, ph);
    text(ctx, '▸ QUEST LOG ▸', px + 24, py + 16, { size: 16, color: COLORS.hi, shadow: false });

    const h = this.hero;
    let yy = py + 44;
    const lh = 18, tw = pw - 48;

    // Active quests
    if (h.quests && h.quests.length > 0) {
      text(ctx, 'ACTIVE CHARGES:', px + 24, yy, { size: 13, color: '#7a2010', shadow: false });
      yy += lh;
      for (const active of h.quests) {
        const def = QUEST_BY_ID[active.id];
        if (!def) continue;
        const progress = def.objective.kind === 'reach' ? `${active.count}/${def.objective.deeper || 1}` : `${active.count}/${def.objective.target || 1}`;
        text(ctx, `  ▸ ${def.title} [${progress}]`, px + 24, yy, { size: 12, color: '#5b4226', shadow: false });
        yy += lh;
      }
    } else {
      text(ctx, '(No active charges)', px + 24, yy, { size: 12, color: COLORS.textDim, shadow: false });
      yy += lh;
    }

    yy += 8;

    // Completed quests count
    const completed = h.questsDone || 0;
    text(ctx, `COMPLETED: ${completed} charges`, px + 24, yy, { size: 13, color: '#7a2010', shadow: false });

    text(ctx, 'Esc back', this.W / 2, py + ph - 16, { align: 'center', size: 12, color: COLORS.textDim, shadow: false });
  }

  _objectiveText(o) {
    if (o.kind === 'slay') return `Slay ${o.target} creatures of the Work.`;
    if (o.kind === 'slayType') {
      const nm = (MONSTERS[o.monId] || {}).name || o.monId;
      const alt = o.alt ? ` or ${(MONSTERS[o.alt] || {}).name || o.alt}` : '';
      return `Slay ${o.target} ${nm}${alt}.`;
    }
    if (o.kind === 'collect') return `Gather ${o.target} relics from the floors.`;
    if (o.kind === 'gold') return `Gather ${o.target} gold.`;
    if (o.kind === 'reach' && o.stage) return `Reach the ${o.stage.toUpperCase()} stage.`;
    if (o.kind === 'reach' && o.deeper) return `Descend ${o.deeper} floors deeper.`;
    // Emblem quest objectives
    if (o.kind === 'furnace_operation') return `Perform a ${o.operation} operation in the furnace.`;
    if (o.kind === 'furnace_maintain') return `Maintain furnace heat at ${o.target_temp}°C for ${o.duration} minutes.`;
    if (o.kind === 'npc_reconcile') return `Reconcile two NPCs and broker their union.`;
    if (o.kind === 'furnace_cycle') return `Complete ${o.cycles} full cycles of furnace operation.`;
    if (o.kind === 'garden_tend') return `Tend the garden and harvest materials.`;
    if (o.kind === 'furnace_balance') return `Balance opposing forces with precision.`;
    if (o.kind === 'furnace_sequence') return `Complete a sequence of operations flawlessly.`;
    if (o.kind === 'study_and_purify') return `Study texts and perform purification.`;
    if (o.kind === 'dual_track') return `Master both study and practice; seek wisdom.`;
    if (o.kind === 'furnace_conjunction') return `Achieve perfect conjunction of materials.`;
    if (o.kind === 'furnace_multi_stage') return `Complete a ${o.stages}-stage multi-day operation.`;
    if (o.kind === 'furnace_final_dissolution') return `Perform the ultimate alchemical work.`;
    return 'Complete the Work.';
  }
  _rewardText(r) {
    const p = [];
    if (r.gold) p.push(`${r.gold} gold`);
    if (r.xp) p.push(`${r.xp} EXP`);
    if (r.maxhp) p.push(`+${r.maxhp} max HP`);
    if (r.item) p.push(`${r.item[1]}× ${ITEMS[r.item[0]].name}`);
    return p.join(', ');
  }

  _renderQuest(ctx) {
    const { who, quest } = this.questOffer;
    ctx.fillStyle = 'rgba(8,6,14,0.72)'; ctx.fillRect(0, 0, this.W, this.H);
    const pw = 560, ph = 360, px = this.W / 2 - pw / 2, py = this.H / 2 - ph / 2;
    parchmentCard(ctx, px, py, pw, ph);
    // giver portrait
    const img = Assets.img(who === 'king' ? 'q_king' : 'q_queen');
    if (img) {
      const sc = (ph - 90) / img.height, dw = img.width * sc, dh = img.height * sc;
      ctx.drawImage(img, px + 28, py + ph - 30 - dh, dw, dh);
    }
    const tx = px + 200, tw = pw - 224;
    const royal = who === 'king' ? 'THE KING — Sol' : 'THE QUEEN — Luna';
    text(ctx, quest.line === 'opus' ? `✦ THE GREAT WORK — Stage ${quest.step}/4` : royal,
      tx, py + 22, { size: 14, color: quest.line === 'opus' ? '#7a2010' : '#5b4226', shadow: false });
    text(ctx, `${quest.title}`, tx, py + 44, { size: 17, color: '#7a2010', shadow: false });
    text(ctx, `Emblem ${quest.roman}`, tx, py + 66, { size: 12, color: '#5b4226', shadow: false });
    // the motto (authentic quote)
    let yy = this._wrapInk(ctx, `“${quest.call}”`, tx, py + 88, tw, 18);
    // the emblem-poem couplet (recited verse)
    if (quest.poem) {
      yy += 8;
      quest.poem.forEach(ln => { text(ctx, ln, tx, yy, { size: 13, color: '#4a3a6a', shadow: false }); yy += 17; });
    }
    const oy = py + 224;
    text(ctx, 'CHARGE:', tx, oy, { size: 13, color: '#5b4226', shadow: false });
    this._wrapInk(ctx, this._objectiveText(quest.objective), tx, oy + 19, tw, 17);
    text(ctx, 'REWARD:', tx, oy + 56, { size: 13, color: '#5b4226', shadow: false });
    this._wrapInk(ctx, this._rewardText(quest.reward), tx, oy + 75, tw, 17);
    if (Math.floor(this.titleT * 1.5) % 2 === 0)
      text(ctx, 'Z — accept the charge      X — decline', this.W / 2, py + ph - 22, { align: 'center', size: 14, color: '#3a2a18', shadow: false });
  }
  _wrapInk(ctx, str, x, y, maxW, lh) {
    ctx.font = '15px "Courier New", monospace';
    const words = str.split(' '); let line = '', yy = y;
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { text(ctx, line, x, yy, { size: 15, color: '#2a2118', shadow: false }); line = w; yy += lh; }
      else line = t;
    }
    if (line) { text(ctx, line, x, yy, { size: 15, color: '#2a2118', shadow: false }); yy += lh; }
    return yy;
  }

  _hud(ctx) {
    const h = this.hero;
    const w = 188, x = this.W - w - 12, y = 12;
    window9(ctx, x, y, w, 70);
    text(ctx, `${h.name}  Lv ${h.level}`, x + 12, y + 8, { size: 14, color: COLORS.hi });
    text(ctx, `HP ${h.hp}/${h.maxHp}`, x + 12, y + 26, { size: 13, color: COLORS.hpGreen });
    text(ctx, `MP ${h.mp}/${h.maxMp}`, x + 12, y + 44, { size: 13, color: COLORS.mpBlue });
    text(ctx, `G ${h.gold}`, x + 112, y + 26, { size: 13, color: COLORS.hi });
  }

  _renderTitle(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, this.H);
    g.addColorStop(0, '#10101f'); g.addColorStop(1, '#291a36');
    ctx.fillStyle = g; ctx.fillRect(0, 0, this.W, this.H);
    // sun emblem
    const sun = Assets.img('d_sun');
    if (sun) {
      const s = 1.1 + Math.sin(this.titleT) * 0.03;
      const dw = sun.width * s, dh = sun.height * s;
      ctx.save(); ctx.globalAlpha = 0.85;
      ctx.drawImage(sun, this.W/2 - dw/2, 70, dw, dh);
      ctx.restore();
    }
    text(ctx, 'EMBLEM  KNIGHT', this.W/2, 280, { align: 'center', size: 40, color: COLORS.hi });
    text(ctx, 'and the Alchemical Dragon', this.W/2, 326, { align: 'center', size: 18, color: COLORS.text });

    const opts = this.titleOptions();
    const ox = this.W/2 - 70, oy = 392;
    window9(ctx, ox - 20, oy - 14, 200, opts.length * 30 + 26);
    menu(ctx, opts, ox + 12, oy + 4, this.titleSel, { lh: 30 });
    const best = this.bestDepth();
    if (best > 0) text(ctx, `Deepest descent: floor ${best} / ${FINAL_FLOOR}`, this.W/2, oy + opts.length*30 + 24, { align: 'center', size: 13, color: COLORS.textDim });
    if (Math.floor(this.titleT * 1.5) % 2 === 0)
      text(ctx, 'Arrows / WASD  •  Z or Space = confirm', this.W/2, this.H - 36, { align: 'center', size: 13, color: COLORS.textDim });
  }

  _renderCharSelect(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, this.H);
    g.addColorStop(0, '#13101e'); g.addColorStop(1, '#241830');
    ctx.fillStyle = g; ctx.fillRect(0, 0, this.W, this.H);
    if (this.charPhase === 'attrib') { this._renderAttribs(ctx); return; }
    text(ctx, 'CHOOSE THY VESSEL', this.W/2, 30, { align: 'center', size: 26, color: COLORS.hi });

    // 3×3 grid layout for 9 classes
    const COLS = 3, cardW = 200, cardH = 280;
    const gridW = COLS * cardW + (COLS - 1) * 20;
    const startX = (this.W - gridW) / 2;
    const startY = 60;

    for (let i = 0; i < CLASSES.length; i++) {
      const c = CLASSES[i];
      const col = i % COLS, row = Math.floor(i / COLS);
      const cardX = startX + col * (cardW + 20);
      const cardY = startY + row * (cardH + 20);
      const sel = i === this.classSel;

      parchmentCard(ctx, cardX, cardY, cardW, cardH);
      const img = Assets.img(c.sprite);
      if (img) {
        const sc = Math.min((cardW - 40) / img.width, (cardH - 50) / img.height);
        const dw = img.width * sc, dh = img.height * sc;
        ctx.drawImage(img, cardX + cardW / 2 - dw / 2, cardY + cardH - 20 - dh, dw, dh);
      }
      if (sel) {
        ctx.lineWidth = 4; ctx.strokeStyle = COLORS.hi;
        ctx.strokeRect(cardX - 3, cardY - 3, cardW + 6, cardH + 6);
      }
      text(ctx, c.name, cardX + cardW / 2, cardY + cardH + 8, { align: 'center', size: 14, color: sel ? COLORS.hi : COLORS.text });
    }

    // detail panel for the selected class
    const c = CLASSES[this.classSel];
    const py = 420, pw = this.W - 80;
    window9(ctx, 40, py, pw, 100);
    text(ctx, c.name, 60, py + 12, { size: 16, color: COLORS.hi });
    this._wrap(ctx, c.blurb, 60, py + 34, pw - 40, 14);
    text(ctx, c.passive, 60, py + 76, { size: 12, color: COLORS.mpBlue });

    if (Math.floor(this.titleT * 1.5) % 2 === 0)
      text(ctx, '↑↓← → choose   •   Z confirm   •   X back', this.W/2, this.H - 26, { align: 'center', size: 13, color: COLORS.textDim });
  }

  _renderAttribs(ctx) {
    const c = CLASSES[this.classSel];
    text(ctx, 'TEMPER THY SPIRIT', this.W / 2, 30, { align: 'center', size: 26, color: COLORS.hi });
    text(ctx, `${c.name} — distribute ${ATTRIB_POINTS} points among the three principles`,
      this.W / 2, 66, { align: 'center', size: 14, color: COLORS.text });

    // class portrait on the left
    const img = Assets.img(c.sprite);
    if (img) {
      const sc = Math.min(220 / img.width, 300 / img.height), dw = img.width * sc, dh = img.height * sc;
      ctx.drawImage(img, this.W / 2 - 320 - dw / 2 + 60, 110, dw, dh);
    }

    // points-remaining banner
    const left = this.attribLeft();
    text(ctx, `Points remaining: ${left}`, this.W / 2 + 40, 96,
      { align: 'center', size: 16, color: left > 0 ? COLORS.hi : COLORS.textDim });

    // attribute rows
    const bx = this.W / 2 - 60, by = 130, rowH = 64;
    ATTRIBS.forEach((a, i) => {
      const yy = by + i * rowH, sel = i === this.attribSel;
      const val = this.attribs[a.key];
      window9(ctx, bx - 20, yy - 8, 420, rowH - 10);
      if (sel) { ctx.lineWidth = 3; ctx.strokeStyle = COLORS.hi; ctx.strokeRect(bx - 22, yy - 10, 424, rowH - 6); }
      text(ctx, a.name, bx, yy + 2, { size: 17, color: sel ? COLORS.hi : COLORS.text });
      // pip bar
      for (let p = 0; p < ATTRIB_POINTS; p++) {
        ctx.fillStyle = p < val ? COLORS.hpGreen : 'rgba(255,255,255,0.14)';
        ctx.fillRect(bx + 150 + p * 22, yy - 4, 16, 16);
      }
      text(ctx, sel ? '◀ ' + val + ' ▶' : String(val), bx + 150 + ATTRIB_POINTS * 22 + 14, yy + 2,
        { size: 15, color: sel ? COLORS.hi : COLORS.textDim });
      text(ctx, a.desc, bx, yy + 24, { size: 12, color: COLORS.textDim });
    });

    if (Math.floor(this.titleT * 1.5) % 2 === 0)
      text(ctx, '↑↓ pick principle  •  ← → spend/refund  •  Z begin  •  X back',
        this.W / 2, this.H - 26, { align: 'center', size: 13, color: COLORS.textDim });
  }

  _wrap(ctx, str, x, y, maxW, lh) {
    ctx.font = '15px "Courier New", monospace';
    const words = str.split(' ');
    let line = '', yy = y;
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { text(ctx, line, x, yy, { size: 15 }); line = w; yy += lh; }
      else line = t;
    }
    if (line) text(ctx, line, x, yy, { size: 15 });
  }

  _renderEnd(ctx, title, bg, sub) {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, this.W, this.H);
    text(ctx, title, this.W/2, this.H/2 - 60, { align: 'center', size: 46, color: COLORS.hi });
    sub.split('\n').forEach((ln, i) =>
      text(ctx, ln, this.W/2, this.H/2 + 10 + i*26, { align: 'center', size: 17, color: COLORS.text }));
    if (Math.floor(this.titleT * 1.5) % 2 === 0)
      text(ctx, 'Press Z to return', this.W/2, this.H - 60, { align: 'center', size: 15, color: COLORS.textDim });
  }
}

// ---- tiny WebAudio blip engine (no asset files needed) ---------------------
function makeAudio() {
  let ctx = null, unlocked = false;
  const ensure = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } };
  const blip = (freq, dur, type = 'square', vol = 0.06) => {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur);
  };
  const seq = (notes) => { let t = 0; notes.forEach(([f, d, ty]) => { setTimeout(() => blip(f, d, ty || 'square'), t * 1000); t += d * 0.85; }); };
  return {
    unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); unlocked = true; },
    ctx() { return ctx; },
    play(name) {
      ensure(); if (!ctx) return;
      switch (name) {
        case 'hit': blip(140, 0.12, 'square', 0.08); break;
        case 'magic': seq([[660,0.06],[880,0.06],[1180,0.1]]); break;
        case 'heal': seq([[520,0.07],[700,0.07],[920,0.1,'triangle']]); break;
        case 'encounter': seq([[200,0.08],[160,0.08],[120,0.14,'sawtooth']]); break;
        case 'win': seq([[523,0.1],[659,0.1],[784,0.16]]); break;
        case 'level': seq([[523,0.09],[659,0.09],[784,0.09],[1046,0.2]]); break;
        case 'lose': seq([[300,0.15,'sawtooth'],[200,0.2,'sawtooth'],[120,0.35,'sawtooth']]); break;
      }
    }
  };
}

// ---- boot ------------------------------------------------------------------
async function boot() {
  const canvas = document.getElementById('game');
  const game = new Game(canvas);
  await Assets.load();
  await game.music.load();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    game.update(dt);
    game.render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__game = game; // debug handle
}
boot();
