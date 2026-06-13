// emblem_quests.js — the 50 Atalanta Fugiens emblems as playable quests

// Each emblem can spawn multiple quest types; format matches existing QUESTS structure
// but adds 'emblem' field and 'operation' for furnace-based quests

export const EMBLEM_QUESTS = [
  // ---- PHASE 1: FOUNDATION (I-II) ----
  {
    id: 'e_i_nurture', emblem: 1, giver: 'king', roman: 'I',
    title: 'His Nurse is the Earth',
    call: 'The philosophical child must be nurtured by the earth-mother.',
    poem: ['The infant stone seeks mother earth,', 'to learn of growth from death and birth.'],
    type: 'operational',
    objective: { kind: 'furnace_operation', operation: 'calcination', duration: 30 },
    reward: { gold: 20, xp: 15, item: ['herb', 1] },
  },

  {
    id: 'e_ii_heat', emblem: 2, giver: 'queen', roman: 'II',
    title: 'Maintain the Gentle Heat',
    call: 'Tend the incubating stone at perfect temperature.',
    poem: ['Too hot and all shall turn to smoke,', 'too cold and stone shall never soak.'],
    type: 'maintenance',
    objective: { kind: 'furnace_maintain', target_temp: 80, duration: 20, tolerance: 5 },
    reward: { gold: 15, xp: 10 },
  },

  // ---- PHASE 2: PURIFICATION (III-V) ----
  {
    id: 'e_iii_wash', emblem: 3, giver: 'queen', roman: 'III',
    title: 'Go to the Woman Who Washes',
    call: 'Whiten the black matter through repeated washing.',
    poem: ['Go where the washerwoman wrings the sheet,', 'and make the soilèd matter clean and sweet.'],
    type: 'operational',
    objective: { kind: 'furnace_operation', operation: 'dissolution', inputs: ['vitriol', 3], duration: 40 },
    reward: { gold: 30, xp: 20, item: ['white_stone', 1] },
  },

  {
    id: 'e_iv_marriage', emblem: 4, giver: 'king', roman: 'IV',
    title: 'Join Brother and Sister',
    call: 'Broker the marriage of two warring alchemists.',
    poem: ['Brother hot and sister cold,', 'must be joined in love and gold.'],
    type: 'diplomatic',
    objective: { kind: 'npc_reconcile', npcs: 2, reward_relationship: 'married' },
    reward: { gold: 40, xp: 25 },
  },

  {
    id: 'e_v_toad', emblem: 5, giver: 'queen', roman: 'V',
    title: 'The Toad Bearing Its Chain',
    call: 'Establish a circular system where waste becomes food.',
    poem: ['The toad bears the golden chain round,', 'in endless loops where dew is found.'],
    type: 'operational',
    objective: { kind: 'furnace_cycle', cycles: 3, output: 'material_regeneration' },
    reward: { gold: 25, xp: 18 },
  },

  // ---- PHASE 3: UNION & GROWTH (VI-IX) ----
  {
    id: 'e_vi_plant', emblem: 6, giver: 'queen', roman: 'VI',
    title: 'Sow Gold in White Foliated Earth',
    call: 'Plant the golden seed and tend through seasons.',
    poem: ['Sow thy gold in the foliate white,', 'and reap a harvest born of light.'],
    type: 'agricultural',
    objective: { kind: 'garden_tend', duration: 120, harvest: 'gold_seed' },
    reward: { gold: 50, xp: 30 },
  },

  {
    id: 'e_vii_birds', emblem: 7, giver: 'king', roman: 'VII',
    title: 'Balance the Winged and Wingless Birds',
    call: 'Understand when to restrain volatility and when to allow flight.',
    poem: ['One has wings and one has not,', 'both must rest within one pot.'],
    type: 'operational',
    objective: { kind: 'furnace_balance', materials: ['mercury', 'sulfur'], precision: 'high' },
    reward: { gold: 35, xp: 22 },
  },

  {
    id: 'e_viii_egg', emblem: 8, giver: 'king', roman: 'VIII',
    title: 'Hatch the Philosophical Bird',
    call: 'Pierce the egg with precisely-controlled heat.',
    poem: ['Pierce the sealed egg with the sword of flame,', 'and what slept within shall answer to its name.'],
    type: 'operational',
    objective: { kind: 'furnace_operation', operation: 'distillation', precision_required: true, duration: 45 },
    reward: { gold: 45, xp: 25, item: ['philosophical_water', 1] },
  },

  {
    id: 'e_ix_tree', emblem: 9, giver: 'queen', roman: 'IX',
    title: 'Nurture the Mercury Tree',
    call: 'Watch mercury crystallize and bear fruit.',
    poem: ['The tree bears apples, white then red,', 'from mercury crystallized and spread.'],
    type: 'agricultural',
    objective: { kind: 'garden_grow_tree', duration: 150, harvest_stages: ['white', 'yellow', 'red'] },
    reward: { gold: 60, xp: 35 },
  },

  // ---- PHASE 4: MASTERY & DISCERNMENT (X-XI, XVII-XXII) ----
  {
    id: 'e_x_sympathetic', emblem: 10, giver: 'king', roman: 'X',
    title: 'Master Sympathetic Addition',
    call: 'Add like to like without explosion or loss.',
    poem: ['Fire to fire, mercury to its kind,', 'yet balance is the key youll find.'],
    type: 'operational',
    objective: { kind: 'furnace_sequence', operations: ['calcination', 'conjunction'], flawless: true },
    reward: { gold: 50, xp: 28, skill_unlock: 'advanced_operations' },
  },

  {
    id: 'e_xi_latona', emblem: 11, giver: 'queen', roman: 'XI',
    title: 'Make Latona White and Tear Up False Books',
    call: 'Purify matter while discerning truth from falsehood.',
    poem: ['Whiten the dark body of Latona fair,', 'while burning lies that foul the air.'],
    type: 'scholarly',
    objective: { kind: 'study_and_purify', study_books: 3, furnace_operation: 'dissolution' },
    reward: { gold: 40, xp: 25, skill_unlock: 'discernment' },
  },

  // ---- PHASE 5: TURNING POINT (XXVI - centermost emblem) ----
  {
    id: 'e_xxvi_wisdom', emblem: 26, giver: 'queen', roman: 'XXVI',
    title: 'The Fruit of Human Wisdom is the Wood of Life',
    call: '**CENTERMOST EMBLEM** — Win the favor of Lady Sapientia.',
    poem: ['With head of knowledge, hand of toil,', 'approach the Lady, void of coil.'],
    type: 'philosophical',
    objective: { kind: 'dual_track', study: 5, practice: 5, npc: 'lady_sapientia' },
    reward: { gold: 100, xp: 60, item: ['tree_of_life', 1], unlock_all_operations: true },
  },

  // ---- PHASE 6: ADVANCED OPERATIONS (XII-XVI) ----
  {
    id: 'e_xvi_lions', emblem: 16, giver: 'king', roman: 'XVI',
    title: 'Reconcile the Winged Lioness and Wingless Lion',
    call: 'Achieve perfect union of volatility and fixation.',
    poem: ['She flies above, he holds the ground,', 'together they create the sound.'],
    type: 'operational',
    objective: { kind: 'furnace_conjunction', materials: ['white_stone', 'red_tincture'], precision: 'perfect' },
    reward: { gold: 80, xp: 45, item: ['philosophers_stone', 1] },
  },

  {
    id: 'e_xvii_fourfold', emblem: 17, giver: 'king', roman: 'XVII',
    title: 'Master the Four Fires',
    call: 'Apply the right fire at the right moment.',
    poem: ['Vulcan raw, then Mercury\'s might,', 'Luna\'s gentle, Apollo\'s bright.'],
    type: 'operational',
    objective: { kind: 'furnace_fire_sequence', fires: ['vulcan', 'mercury', 'luna', 'apollo'], flawless: true },
    reward: { gold: 70, xp: 40, skill_unlock: 'fire_mastery' },
  },

  // ---- PHASE 7: CELESTIAL & MEDICAL (XXIII-XXVIII) ----
  {
    id: 'e_xxiii_gold_rain', emblem: 23, giver: 'king', roman: 'XXIII',
    title: 'It Rains Gold',
    call: 'Engineer the union of Sol and Venus.',
    poem: ['When sun and Venus dance in sky,', 'the golden rain shall fall nearby.'],
    type: 'operational',
    objective: { kind: 'furnace_operation', operation: 'conjunction', inputs: ['mercury', 'sulfur'], output: 'gold_essence' },
    reward: { gold: 90, xp: 50 },
  },

  {
    id: 'e_xxviii_king_bath', emblem: 28, giver: 'queen', roman: 'XXVIII',
    title: 'Heal the King Through the Steam Bath',
    call: 'Purify through three-stage bathing and heating.',
    poem: ['Sweat the black bile from the King,', 'three baths shall make new life to spring.'],
    type: 'operational',
    objective: { kind: 'furnace_three_stage', stages: ['sweating', 'heating', 'anointing'], duration: 90 },
    reward: { gold: 75, xp: 40, healing_bonus: true },
  },

  // ---- PHASE 8: MYTHOLOGICAL SEQUENCE (XXIX-XL) ----
  {
    id: 'e_xxix_salamander', emblem: 29, giver: 'king', roman: 'XXIX',
    title: 'The Stone Lives in the Fire',
    call: 'Test the Stone\'s resistance to extreme heat.',
    poem: ['Like salamander born of flame,', 'the stone endures and stays the same.'],
    type: 'operational',
    objective: { kind: 'furnace_extreme_heat', target_temp: 190, duration: 60, materials: ['philosophers_stone'] },
    reward: { gold: 100, xp: 55 },
  },

  {
    id: 'e_xxx_marriage', emblem: 30, giver: 'queen', roman: 'XXX',
    title: 'The Sun Needs the Moon',
    call: 'Achieve the sacred marriage of Sol and Luna.',
    poem: ['Sun needs moon as cock needs hen,', 'and from their union life springs again.'],
    type: 'operational',
    objective: { kind: 'furnace_conjunction', materials: ['white_stone', 'red_tincture'], duration: 60 },
    reward: { gold: 100, xp: 55 },
  },

  // ---- FINAL (XLVIII) ----
  {
    id: 'e_xlviii_king', emblem: 48, giver: 'king', roman: 'XLVIII',
    title: '**CLIMACTIC** The King in the Closed Spring',
    call: 'Restore the king through multi-stage healing.',
    poem: ['The king lies sick within the spring,', 'through your work his health we\'ll bring.'],
    type: 'operational',
    objective: { kind: 'furnace_multi_stage', stages: 6, day_counts: [40, 20, 20, 40, 40, 1], planetaries: true },
    reward: { gold: 200, xp: 100, item: ['philosophers_stone', 1], victory_eligible: true },
  },

  // ---- ULTIMATE RETURN (XLIX-L) ----
  {
    id: 'e_xlix_three_fathers', emblem: 49, giver: 'king', roman: 'XLIX',
    title: 'The Child with Three Fathers',
    call: 'Generate the Stone from three paternal principles.',
    poem: ['Phoebus, Vulcan, Hermes three,', 'together birth what none can be.'],
    type: 'operational',
    objective: { kind: 'furnace_tripartite', principles: ['solar', 'vulcanic', 'mercurial'], synchronization: 'perfect' },
    reward: { gold: 150, xp: 80 },
  },

  {
    id: 'e_l_final_union', emblem: 50, giver: 'queen', roman: 'L',
    title: 'The Woman and the Serpent',
    call: 'Achieve ultimate union — dissolution and regeneration.',
    poem: ['Woman and serpent, blood to blood,', 'from death emerges life\'s great flood.'],
    type: 'operational',
    objective: { kind: 'furnace_final_dissolution', materials: ['philosophers_stone'], complete_opus: true },
    reward: { gold: 200, xp: 100, boon: 'master_alchemist' },
  },
];

// ---- QUEST LINE GROUPING ----
export function questsByEmblemGroup(phase) {
  // phase: 'foundation', 'purification', 'union', 'mastery', 'turning_point', 'advanced', 'celestial', 'mythological', 'final', 'ultimate'
  const ranges = {
    foundation: [1, 2],
    purification: [3, 5],
    union: [6, 9],
    mastery: [10, 11, 17, 22],
    turning_point: [26],
    advanced: [12, 16],
    celestial: [23, 28],
    mythological: [29, 47],
    final: [48],
    ultimate: [49, 50],
  };
  const range = ranges[phase];
  if (!range) return [];
  return EMBLEM_QUESTS.filter(q => q.emblem >= range[0] && q.emblem <= range[1]);
}

// ---- COMPATIBILITY WITH EXISTING QUEST SYSTEM ----
// Convert emblem quests to match existing format
export function emblemQuestToGameFormat(emblemQuest) {
  return {
    id: emblemQuest.id,
    giver: emblemQuest.giver,
    roman: emblemQuest.roman,
    title: emblemQuest.title,
    call: emblemQuest.call,
    poem: emblemQuest.poem,
    objective: emblemQuest.objective,
    reward: emblemQuest.reward,
    emblem: emblemQuest.emblem,
    type: emblemQuest.type,
  };
}
