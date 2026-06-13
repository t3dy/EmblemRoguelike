// alchemical_materials.js — materials, sourcing, operations, dangers

// ---- MATERIALS ----
// Each material has: type (raw/intermediate/final), sources, danger profile, uses
export const MATERIALS = {
  // Raw materials (gathered/mined)
  vitriol: {
    id: 'vitriol', name: 'Vitriol', type: 'raw', symbol: '♦',
    desc: 'Green lion; caustic and dissolving',
    source: 'mining', rareness: 'common',
    value: 15, stack: true,
    dangers: ['fumes', 'burn'],
    operations: ['purification', 'dissolution'],
  },
  mercury: {
    id: 'mercury', name: 'Quicksilver', type: 'raw', symbol: '●',
    desc: 'Volatile silver spirit; the serpent',
    source: 'mining', rareness: 'uncommon',
    value: 40, stack: true,
    dangers: ['toxic_vapor', 'volatilization'],
    operations: ['circulation', 'sublimation'],
  },
  sulfur: {
    id: 'sulfur', name: 'Sulfur', type: 'raw', symbol: '⬥',
    desc: 'Red lion; brimstone; the fixed principle',
    source: 'mining', rareness: 'uncommon',
    value: 20, stack: true,
    dangers: ['explosion', 'combustion'],
    operations: ['fixation', 'calcination'],
  },
  saltpeter: {
    id: 'saltpeter', name: 'Saltpeter', type: 'raw', symbol: '✦',
    desc: 'Salt of the philosophers; crystalline force',
    source: 'gathering', rareness: 'common',
    value: 12, stack: true,
    dangers: ['explosion'],
    operations: ['salification'],
  },
  charcoal: {
    id: 'charcoal', name: 'Charcoal', type: 'raw', symbol: '◆',
    desc: 'Burnt matter; the reduced remnant',
    source: 'gathering', rareness: 'common',
    value: 8, stack: true,
    dangers: ['dust'],
    operations: ['calcination'],
  },

  // Intermediate materials (produced through operations)
  philosophical_water: {
    id: 'philosophical_water', name: 'Philosophical Water', type: 'intermediate', symbol: '≈',
    desc: 'Universal menstruum; the dissolving water',
    source: 'distillation', rareness: 'rare',
    value: 80, stack: true,
    dangers: ['contamination'],
    operations: ['all'],
  },
  white_stone: {
    id: 'white_stone', name: 'White Stone', type: 'intermediate', symbol: '◇',
    desc: 'Albedo achieved; purified matter at white stage',
    source: 'purification', rareness: 'rare',
    value: 120, stack: true,
    dangers: [],
    operations: ['conjunction', 'fermentation'],
  },
  red_tincture: {
    id: 'red_tincture', name: 'Red Tincture', type: 'intermediate', symbol: '❤',
    desc: 'The reddening; coloring power for transmutation',
    source: 'conjunction', rareness: 'very_rare',
    value: 250, stack: true,
    dangers: [],
    operations: ['transmutation'],
  },

  // Final materials (the goal)
  philosophers_stone: {
    id: 'philosophers_stone', name: "Philosopher's Stone", type: 'final', symbol: '◈',
    desc: 'The perfected Stone; transmutes base metals to gold',
    source: 'great_work', rareness: 'legendary',
    value: 1000, stack: false,
    dangers: [],
    operations: ['transmutation_gold', 'healing', 'resurrection'],
  },
  golden_elixir: {
    id: 'golden_elixir', name: 'Golden Elixir', type: 'final', symbol: '✧',
    desc: 'The medicinal stone; heals all ills',
    source: 'medicinal_path', rareness: 'legendary',
    value: 800, stack: false,
    dangers: [],
    operations: ['healing', 'disease_cure'],
  },
};

// ---- OPERATIONS & THEIR REQUIREMENTS ----
// Each operation requires certain materials, temperature, time, and has danger profiles
export const OPERATIONS = {
  calcination: {
    id: 'calcination', name: 'Calcination', emblem: 'I',
    desc: 'Burning to ash; the blackening (Nigredo)',
    requires: { materials: [{ id: 'charcoal', qty: 2 }], temp: 'high' },
    duration: 30, // game minutes
    dangers: ['explosion', 'combustion', 'over_burn'],
    produces: ['white_stone'],
    difficulty: 'easy',
  },
  dissolution: {
    id: 'dissolution', name: 'Dissolution', emblem: 'III',
    desc: 'Washing in water; the purification',
    requires: { materials: [{ id: 'vitriol', qty: 3 }, { id: 'philosophical_water', qty: 2 }], temp: 'moderate' },
    duration: 40,
    dangers: ['contamination', 'fumes'],
    produces: ['white_stone'],
    difficulty: 'moderate',
  },
  distillation: {
    id: 'distillation', name: 'Distillation', emblem: 'IX',
    desc: 'Separating vapors; the purification of spirit',
    requires: { materials: [{ id: 'philosophical_water', qty: 1 }], temp: 'moderate' },
    duration: 50,
    dangers: ['vapor_loss'],
    produces: ['philosophical_water'],
    difficulty: 'moderate',
  },
  conjunction: {
    id: 'conjunction', name: 'Conjunction', emblem: 'IV',
    desc: 'Union of opposites; the marriage',
    requires: { materials: [{ id: 'white_stone', qty: 1 }, { id: 'red_tincture', qty: 1 }], temp: 'moderate' },
    duration: 60,
    dangers: ['volatilization'],
    produces: ['philosophers_stone'],
    difficulty: 'hard',
  },
  fermentation: {
    id: 'fermentation', name: 'Fermentation', emblem: 'VI',
    desc: 'Putrefaction in vessel; the putrefactio',
    requires: { materials: [{ id: 'white_stone', qty: 1 }], temp: 'warm' },
    duration: 120,
    dangers: ['contamination', 'bacterial_rot'],
    produces: ['red_tincture'],
    difficulty: 'hard',
  },
};

// ---- DANGERS & THEIR MECHANICAL EFFECTS ----
export const DANGERS = {
  explosion: {
    id: 'explosion', name: 'Explosion', severity: 'catastrophic',
    desc: 'Vessel ruptures; all materials lost',
    triggers: { temp_too_high: true, incompatible_mix: true },
    consequence: { material_loss: 1.0, hp_loss: 20 },
  },
  combustion: {
    id: 'combustion', name: 'Combustion', severity: 'major',
    desc: 'Fire spreads out of control; furnace damaged',
    triggers: { temp_too_high: true, sulfur: true },
    consequence: { material_loss: 0.5, furnace_damage: true },
  },
  toxic_vapor: {
    id: 'toxic_vapor', name: 'Toxic Vapor', severity: 'major',
    desc: 'Mercury fumes; slow poisoning',
    triggers: { mercury: true, ventilation_poor: true },
    consequence: { hp_loss: 15, persistent_damage: true },
  },
  fumes: {
    id: 'fumes', name: 'Noxious Fumes', severity: 'moderate',
    desc: 'Suffocating smoke; requires evacuation',
    triggers: { vitriol: true, heat: true },
    consequence: { hp_loss: 10, operation_interrupted: true },
  },
  volatilization: {
    id: 'volatilization', name: 'Volatilization', severity: 'major',
    desc: 'Liquid matter turns to vapor and escapes vessel',
    triggers: { mercury: true, temp_too_high: true },
    consequence: { material_loss: 0.7 },
  },
  contamination: {
    id: 'contamination', name: 'Contamination', severity: 'moderate',
    desc: 'Impure matter or bacteria ruins batch',
    triggers: { unclean_vessel: true, improper_technique: true },
    consequence: { material_loss: 1.0 },
  },
  over_burn: {
    id: 'over_burn', name: 'Over-Burning', severity: 'moderate',
    desc: 'Matter charred beyond recovery',
    triggers: { temp_too_high: true },
    consequence: { material_loss: 1.0 },
  },
  vapor_loss: {
    id: 'vapor_loss', name: 'Vapor Loss', severity: 'moderate',
    desc: 'Distilled spirits escape through cracks',
    triggers: { temp_variance: true },
    consequence: { material_loss: 0.5 },
  },
};

// ---- LAB SPACES (different castle rooms with different functions) ----
export const LAB_SPACES = {
  furnace_chamber: {
    id: 'furnace_chamber', name: 'Grand Furnace', icon: '🔥',
    desc: 'High-temperature calcination and distillation',
    equipment: ['furnace', 'retort', 'alembic'],
    supports: ['calcination', 'combustion', 'distillation'],
    dangers: ['explosion', 'combustion', 'fumes'],
  },
  distillery: {
    id: 'distillery', name: 'Distillery', icon: '🧪',
    desc: 'Separation and purification of essences',
    equipment: ['still', 'condenser', 'flasks'],
    supports: ['distillation', 'sublimation'],
    dangers: ['volatile_vapor', 'contamination'],
  },
  brewhouse: {
    id: 'brewhouse', name: 'Brewhouse', icon: '🍶',
    desc: 'Fermentation and slow cooking',
    equipment: ['vats', 'barrels', 'heating_stone'],
    supports: ['fermentation', 'maceration'],
    dangers: ['bacterial_rot', 'contamination'],
  },
  glassmaker: {
    id: 'glassmaker', name: "Glassmaker's Workshop", icon: '🔮',
    desc: 'Vessel creation and repair',
    equipment: ['glass_furnace', 'molds', 'annealing_oven'],
    supports: ['vessel_repair', 'distillation'],
    dangers: ['explosion', 'combustion'],
  },
  library: {
    id: 'library', name: 'Library', icon: '📚',
    desc: 'Study of alchemical texts and knowledge',
    equipment: ['books', 'writing_desk', 'star_chart'],
    supports: ['study_operation', 'knowledge_gain'],
    dangers: [],
  },
  garden: {
    id: 'garden', name: 'Alchemical Garden', icon: '🌿',
    desc: 'Gathering of herbs and minerals',
    equipment: ['plants', 'mineral_beds', 'tools'],
    supports: ['gathering', 'plant_processing'],
    dangers: [],
  },
  treasury: {
    id: 'treasury', name: 'Treasury', icon: '💰',
    desc: 'Trade, storage, and wealth management',
    equipment: ['scales', 'strongbox', 'ledgers'],
    supports: ['trade', 'storage', 'crafting'],
    dangers: ['theft'],
  },
};

// ---- EQUIPMENT (furnace, retorts, vessels, etc.) ----
export const EQUIPMENT = {
  furnace: {
    id: 'furnace', name: 'Alchemical Furnace', value: 500,
    desc: 'Controls heat precisely; requires fuel',
    allows_operations: ['calcination', 'distillation', 'conjunction'],
    fuel_type: 'charcoal',
    fuel_consumption_per_hour: 2,
  },
  retort: {
    id: 'retort', name: 'Glass Retort', value: 150,
    desc: 'Sealed reaction vessel for heat-intensive operations',
    allows_operations: ['distillation', 'calcination'],
    durability: 10, // operations before break
  },
  alembic: {
    id: 'alembic', name: 'Alembic Head', value: 120,
    desc: 'Condensing head for distillation columns',
    allows_operations: ['distillation'],
    durability: 8,
  },
  still: {
    id: 'still', name: 'Copper Still', value: 300,
    desc: 'Large-scale distillation apparatus',
    allows_operations: ['distillation'],
    durability: 15,
  },
  crucible: {
    id: 'crucible', name: 'Clay Crucible', value: 40,
    desc: 'Container for molten metals',
    allows_operations: ['fusion'],
    durability: 3,
  },
};
