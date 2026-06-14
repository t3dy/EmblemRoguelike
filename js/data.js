// data.js — game content: map, monsters, regions, spells, items, level curve.

// ---- Overworld map (24 x 24) -----------------------------------------------
// Legend:
//   . grass        , plains       f forest(walkable, encounters)
//   ^ mountain(blk) ~ water(blk)   = path(no enc)
//   C castle(home)  T town(heal/shop)  D dungeon(boss)
export const MAP_LEGEND = {
  '.': 'grass', ',': 'plains', 'f': 'forest', 'w': 'woods',
  '^': 'mountain', 'm': 'peaks', '~': 'water', '=': 'path',
  'C': 'castle', 'T': 'town', 'D': 'dungeon', 'Q': 'queencourt',
  'b': 'badlands', 'v': 'cave', 'l': 'cliff'
};

export const MAP = [
  "~~~~~~~~~~~~~~~~~~~~~~~~",
  "~^^mm^~~..,,,,...~lbbb~~",
  "~^..ff..==.,,,.ff~.vbbb~",
  "~^.fww.,,=.,,..ff,~.lbb~",
  "~..fw.,,,=..^^^...,.bbv~",
  "~.Q,,,,,=..^mm^....,,bl~",
  "~.C======..^^^^...,,,,b~",
  "~.,,,,,,=...^^^...,,f,b~",
  "~,,..f,,=.....,,...ff,,~",
  "~,..fff.======,,,..f,.~~",
  "~..ffww.....,=,,,...,,l~",
  "~...ff..,,..,=.,,,,.,bb~",
  "~,,......l,,,=.....,,bv~",
  "~,,,..^^^..,,=,,...ff,b~",
  "~.,,.^mm^^.,,=,,,.ffw,b~",
  "~..,.^^^^..,,=T====,bbb~",
  "~...,.^^.v.,,,,,,,=,,vb~",
  "~....,,,..ffw,,..,=,llb~",
  "~.,,,,..ffff,,...,====b~",
  "~,,..f..fff,,..mm^..bbD~",
  "~,..fff..f,,..^^^^.vbbb~",
  "~..ffww...,,,.^^^..lbbb~",
  "~~...,,....,,.....,,bb~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~",
];

export const BLOCKED = new Set(['mountain', 'peaks', 'water']);
export const NO_ENCOUNTER = new Set(['path', 'castle', 'town', 'dungeon', 'queencourt']);

// ---- Monsters ---------------------------------------------------------------
// atk/def feed the damage formula; hp pool; xp/gold reward; sprite = manifest name
export const MONSTERS = {
  toad:      { id:'toad',      name:'Venom Toad',  sprite:'m_toad',      hp:14,  atk:8,  def:3,  xp:4,  gold:3,  scale:0.55, spell:null },
  serpent:   { id:'serpent',   name:'River Serpent',sprite:'m_serpent',  hp:18,  atk:11, def:4,  xp:6,  gold:5,  scale:0.6,  spell:null },
  wolf:      { id:'wolf',      name:'Grey Wolf',   sprite:'m_wolf',      hp:22,  atk:14, def:6,  xp:9,  gold:7,  scale:0.7,  spell:null },
  bear:      { id:'bear',      name:'Forest Bear', sprite:'m_bear',      hp:34,  atk:18, def:8,  xp:14, gold:11, scale:0.85, spell:null },
  salamander:{ id:'salamander',name:'Salamander',  sprite:'m_salamander',hp:30,  atk:16, def:7,  xp:13, gold:14, scale:0.7,  spell:'BURN' },
  harpy:     { id:'harpy',     name:'Harpy',       sprite:'m_harpy',     hp:28,  atk:20, def:6,  xp:16, gold:12, scale:0.75, spell:null },
  wlion:     { id:'wlion',     name:'Winged Lion', sprite:'m_wlion',     hp:48,  atk:24, def:11, xp:28, gold:25, scale:0.9,  spell:null },
  // --- newly added beasts ---
  swan:      { id:'swan',      name:'Black Swan',  sprite:'m_swan',      hp:16,  atk:10, def:4,  xp:5,  gold:5,  scale:0.55, spell:null },
  stag:      { id:'stag',      name:'White Stag',  sprite:'m_stag',      hp:26,  atk:15, def:7,  xp:11, gold:9,  scale:0.7,  spell:null },
  boar:      { id:'boar',      name:'Wild Boar',   sprite:'m_boar',      hp:32,  atk:19, def:7,  xp:15, gold:10, scale:0.7,  spell:null },
  lion:      { id:'lion',      name:'The Red Lion',sprite:'m_lion',      hp:54,  atk:26, def:12, xp:32, gold:30, scale:0.85, spell:null },
  wyrm:      { id:'wyrm',      name:'Coiling Wyrm',sprite:'m_wyrm',      hp:72,  atk:27, def:12, xp:50, gold:55, scale:0.95, spell:'BURN' },
  ouroboros: { id:'ouroboros', name:'Ouroboros Wyrm', sprite:'m_ouroboros', hp:84, atk:29, def:13, xp:62, gold:70, scale:1.0, spell:'BURN' },
  // --- expansion beasts (more early/mid variety) ---
  dove:      { id:'dove',      name:'White Dove',   sprite:'m_dove',      hp:12, atk:7,  def:3,  xp:4,  gold:4,  scale:0.5,  spell:null },
  fish:      { id:'fish',      name:'River Fish',   sprite:'m_fish',      hp:14, atk:8,  def:4,  xp:5,  gold:4,  scale:0.5,  spell:null },
  tortoise:  { id:'tortoise',  name:'Stone Tortoise',sprite:'m_tortoise', hp:28, atk:6,  def:13, xp:9,  gold:7,  scale:0.6,  spell:null },
  peacock:   { id:'peacock',   name:'Cauda Pavonis',sprite:'m_peacock',   hp:24, atk:13, def:7,  xp:12, gold:16, scale:0.75, spell:null },
  eagle:     { id:'eagle',     name:'Eagle',        sprite:'m_eagle',     hp:24, atk:18, def:6,  xp:14, gold:10, scale:0.75, spell:null },
  horse:     { id:'horse',     name:'Night-Mare',   sprite:'m_horse',     hp:32, atk:17, def:8,  xp:15, gold:12, scale:0.8,  spell:null },
  // --- research expansion (alchemical bestiary; status/special effects) ---
  viper:        { id:'viper',        name:'Tyrian Viper',   sprite:'m_serpent',   hp:22, atk:12, def:4,  xp:14, gold:10, scale:0.6,  onHit:'venom' },
  leaden:       { id:'leaden',       name:'Leaden Man',     sprite:'villager',    hp:30, atk:9,  def:9,  xp:16, gold:8,  scale:0.7,  onHit:'coagulate' },
  white_eagle:  { id:'white_eagle',  name:'White Eagle',    sprite:'m_eagle',     hp:24, atk:14, def:6,  xp:16, gold:10, scale:0.7,  special:'dodge' },
  wingless:     { id:'wingless',     name:'Wingless Dragon',sprite:'m_wyrm',      hp:44, atk:14, def:7,  xp:30, gold:18, scale:0.85, special:'regen' },
  basilisk:     { id:'basilisk',     name:'Basilisk',       sprite:'m_serpent',   hp:46, atk:19, def:7,  xp:48, gold:38, scale:0.78, onHit:'coagulate' },
  nymph_queen:  { id:'nymph_queen',  name:'Nymph Queen',    sprite:'m_harpy',     hp:50, atk:18, def:9,  xp:44, gold:40, scale:0.85, onHit:'charm' },
  salamander_lord:{id:'salamander_lord',name:'Salamander Lord',sprite:'m_salamander',hp:60,atk:22,def:9,xp:55,gold:48,scale:0.95, onHit:'blacken', spell:'BURN' },
  eagle_sublime:{ id:'eagle_sublime',name:'Sublime Eagle',  sprite:'m_eagle',     hp:58, atk:18, def:9,  xp:70, gold:50, scale:0.9,  special:'ramp' },
  green_lion:   { id:'green_lion',   name:'Green Lion',     sprite:'m_lion',      hp:90, atk:20, def:12, xp:120,gold:90, scale:1.0,  special:'lifesteal' },
  red_lion:     { id:'red_lion',     name:'Red Lion',       sprite:'m_lion',      hp:130,atk:26, def:14, xp:200,gold:150,scale:1.0,  special:'lifesteal' },
  rex_marinus:  { id:'rex_marinus',  name:'Rex Marinus',    sprite:'king',        hp:120,atk:22, def:16, xp:160,gold:120,scale:1.0,  onHit:'dissolve' },
  dragon:    { id:'dragon',    name:'The Alchemical Dragon', sprite:'m_dragon', hp:160, atk:36, def:17, xp:240, gold:340, scale:1.0, spell:'BURN', boss:true },
};

// ---- Equipment ---------------------------------------------------------------
// weapons add to attack, armour adds to defence (folded into stats on equip).
export const WEAPONS = {
  fists:     { id:'fists',     name:'Bare Fists',     atk:0,  cost:0,   desc:'Nothing in hand.' },
  dagger:    { id:'dagger',    name:'Bronze Dagger',  atk:3,  cost:30,  desc:'+3 attack' },
  sword:     { id:'sword',     name:'Iron Sword',     atk:7,  cost:90,  desc:'+7 attack' },
  falchion:  { id:'falchion',  name:'Steel Falchion', atk:12, cost:220, desc:'+12 attack' },
  geber:     { id:'geber',     name:'Sword of Geber', atk:6,  cost:150, desc:'+6 attack; smoky, unreliable' },
  scythe:    { id:'scythe',    name:'Scythe of Saturn',atk:9, cost:300, desc:'+9 attack; rots foes (Blacken)', onHit:'blacken' },
  michael:   { id:'michael',   name:'Lance of Michael',atk:13,cost:420, desc:'+13 attack; smites dragons', vs:'dragon' },
  sol:       { id:'sol',       name:'Sword of Sol',   atk:15, cost:560, desc:'+15 attack; the red king’s gold' },
  flameblade:{ id:'flameblade',name:'Flaming Sword',  atk:18, cost:500, desc:'+18 attack' },
};
export const ARMOR = {
  rags:    { id:'rags',    name:'Linen Robe',    def:0,  cost:0,   desc:'No protection.' },
  leather: { id:'leather', name:'Leather Jerkin',def:4,  cost:40,  desc:'+4 defence' },
  mail:    { id:'mail',    name:'Chain Mail',    def:9,  cost:130, desc:'+9 defence' },
  whiterobe:{id:'whiterobe',name:'White-Earth Robe',def:6,cost:160, desc:'+6 defence; albedo purity' },
  salahide:{ id:'salahide',name:'Salamander Hide',def:7,  cost:300, desc:'+7 defence; resists fire' },
  peacockmantle:{id:'peacockmantle',name:'Peacock Mantle',def:8,cost:340,desc:'+8 defence; all-element resist' },
  plate:   { id:'plate',   name:'Steel Plate',   def:15, cost:320, desc:'+15 defence' },
  purple:  { id:'purple',  name:'Purple Robe & Crown',def:17,cost:780,desc:'+17 defence; the Red King’s vesture' },
};

// overworld encounter difficulty by tile type — west is gentle, east is deadly
export const REGION_SCALE = {
  grass: 0.7, plains: 0.8, forest: 0.95, woods: 1.05, cliff: 1.2, badlands: 1.45, cave: 1.45,
};

// region encounter pools keyed by tile type
export const REGION_POOLS = {
  grass:    ['dove', 'fish', 'toad', 'tortoise'],          // gentle starting country
  plains:   ['toad', 'serpent', 'tortoise', 'swan', 'leaden', 'viper'],
  forest:   ['wolf', 'stag', 'boar', 'peacock', 'viper', 'white_eagle'],
  woods:    ['wolf', 'bear', 'eagle', 'peacock', 'salamander', 'wingless'],
  cliff:    ['eagle', 'harpy', 'horse', 'stag', 'eagle_sublime', 'basilisk'],
  cave:     ['lion', 'wlion', 'salamander', 'ouroboros', 'basilisk', 'nymph_queen'],
  badlands: ['lion', 'wlion', 'horse', 'wyrm', 'ouroboros', 'green_lion', 'red_lion', 'rex_marinus'],
};

// ---- Spells -----------------------------------------------------------------
export const SPELLS = {
  HEAL:  { name:'Heal',  cost:4,  type:'heal',   power:30, desc:'Restore ~30 HP', learnLevel:1 },
  WASH:  { name:'Wash',  cost:3,  type:'cleanse',power:8,  desc:'Cleanse curses + Whiten (heal over time)', learnLevel:2 },
  BLAZE: { name:'Blaze', cost:3,  type:'attack', power:18, desc:'A burst of alchemical fire', learnLevel:3 },
  PUTREFY:{ name:'Putrefy',cost:5, type:'curse', power:10, desc:'Blacken the foe (rot damage over time)', learnLevel:5 },
  FIRE:  { name:'Fire',  cost:8,  type:'attack', power:42, desc:'Greater fire', learnLevel:7 },
  BURN:  { name:'Burn',  cost:0,  type:'attack', power:16, desc:'enemy fire breath' }, // enemy-only
};

// ---- Items ------------------------------------------------------------------
export const ITEMS = {
  herb:    { id:'herb',    name:'Healing Herb', type:'heal', power:25, desc:'Restores ~25 HP' },
  ardens:  { id:'ardens',  name:'Aqua Ardens',  type:'cure', power:20, desc:'Heals 20 HP & cleanses curses' },
  potion:  { id:'potion',  name:'Aqua Vitae',   type:'mp',   power:12, desc:'Restores 12 MP' },
  theriac: { id:'theriac', name:'Theriac',      type:'cure', power:10, desc:'Heals 10 & cures poison/curses' },
  elixir:  { id:'elixir',  name:'Red Elixir',   type:'full', power:0,  desc:'Fully restores HP & MP' },
  quinta:  { id:'quinta',  name:'Quinta Essentia',type:'full',power:0, desc:'Fully restores HP & MP & cleanses all' },
  aurum:   { id:'aurum',   name:'Aurum Potabile',type:'maxhp',power:10,desc:'+10 max HP, permanently' },
  apple:   { id:'apple',   name:'Golden Apple',  type:'flee', power:0,  desc:'Cast down to flee any battle (even bosses)' },
};

// ---- Level curve ------------------------------------------------------------
// index = level-1. each entry: xp needed to REACH that level (cumulative).
export const LEVELS = [
  0, 8, 22, 45, 80, 130, 200, 300, 440, 620, 860, 1180, 1600, 2150, 2900
];

export function statsForLevel(lvl) {
  return {
    maxHp: 30 + (lvl - 1) * 9,
    maxMp: 6  + (lvl - 1) * 4,
    atk:   10 + (lvl - 1) * 4,
    def:   6  + (lvl - 1) * 3,
  };
}

export function spellsForLevel(lvl) {
  return Object.keys(SPELLS).filter(k => SPELLS[k].learnLevel && SPELLS[k].learnLevel <= lvl);
}

// recompute max stats from level + class mods + passive (used on create + level-up)
export function recomputeStats(hero) {
  const cls = CLASS_BY_ID[hero.classId] || CLASSES[0];
  const s = statsForLevel(hero.level);
  let maxHp = s.maxHp + (cls.mods.maxHp || 0);
  if (cls.passiveKey === 'stout') maxHp = Math.round(maxHp * 1.1);
  let maxMp = Math.max(0, s.maxMp + (cls.mods.maxMp || 0));
  if (cls.passiveKey === 'opus') maxMp += (hero.level - 1) * 2;
  // attribute point-buy from character creation (folds in at every recompute)
  const a = hero.attribs || {};
  hero.maxHp = maxHp + (a.vigor || 0) * ATTRIB_GAIN.vigor;
  hero.maxMp = maxMp + (a.spirit || 0) * ATTRIB_GAIN.spirit;
  hero.atk = s.atk + (cls.mods.atk || 0) + (WEAPONS[hero.weapon] ? WEAPONS[hero.weapon].atk : 0) + (a.might || 0) * ATTRIB_GAIN.might;
  hero.def = s.def + (cls.mods.def || 0) + (ARMOR[hero.armor] ? ARMOR[hero.armor].def : 0) + (a.ward || 0) * ATTRIB_GAIN.ward;
}

// character-creation attributes: points → stat gains
export const ATTRIB_POINTS = 6;
export const ATTRIB_GAIN = { might: 1, ward: 1, vigor: 3, spirit: 3 };
export const ATTRIBS = [
  { key: 'might',  name: 'Might',  desc: 'Sulphur — the burning force. +1 Attack per point.' },
  { key: 'ward',   name: 'Ward',   desc: 'Salt — the fixed body. +1 Defence per point.' },
  { key: 'vigor',  name: 'Vigor',  desc: 'Vital spirit. +3 max HP per point.' },
  { key: 'spirit', name: 'Spirit', desc: 'Mercury — the volatile. +3 max MP per point.' },
];

// ---- Playable characters (the human figures from the emblems) ---------------
// Each class re-skins the hero sprite and tweaks stats / kit / a passive.
export const CLASSES = [
  {
    id: 'knight', name: 'The Knight', sprite: 'hero',
    blurb: 'A balanced warrior of the Sun-Castle. Hardy and dependable.',
    mods: { maxHp: +8, atk: +2, def: +2, maxMp: -2 },
    items: { herb: 3, apple: 1 }, spells: [],
    passive: 'Stout: +10% max HP.', passiveKey: 'stout',
  },
  {
    id: 'alchemist', name: 'The Alchemist', sprite: 'c_alchemist',
    blurb: 'Adept of the Work. Frail of body but rich in the philosophic fire.',
    mods: { maxHp: -8, atk: -1, def: -1, maxMp: +10 },
    items: { herb: 2, potion: 2 }, spells: ['HEAL', 'BLAZE'],
    passive: 'Opus: begins knowing Heal & Blaze; +MP each level.', passiveKey: 'opus',
  },
  {
    id: 'atalanta', name: 'Atalanta', sprite: 'c_atalanta',
    blurb: 'The fleeing huntress — swift, volatile, hard to pin down.',
    mods: { maxHp: -2, atk: +1, def: 0, maxMp: 0 },
    items: { herb: 2, apple: 3 }, spells: [],
    passive: 'Volatile: always flees; strikes first each battle.', passiveKey: 'volatile',
  },
  {
    id: 'hippomenes', name: 'Hippomenes', sprite: 'c_hippomenes',
    blurb: 'The suitor who fixed the volatile. Aggressive and well-supplied.',
    mods: { maxHp: +4, atk: +3, def: +1, maxMp: -2 },
    items: { herb: 3, potion: 1, apple: 1 }, spells: [],
    passive: 'Pursuer: +15% attack damage.', passiveKey: 'pursuer',
  },
  {
    id: 'soror', name: 'Soror Mystica', sprite: 'c_atalanta',
    blurb: 'The mystic sister who tends the Work — frail, but mistress of cleansing.',
    mods: { maxHp: -6, atk: -2, def: 0, maxMp: +12 },
    items: { herb: 2, ardens: 2 }, spells: ['HEAL', 'WASH'],
    passive: 'Purify: starts knowing Heal & Wash; +MP each level.', passiveKey: 'opus',
  },
  {
    id: 'senex', name: 'Saturnine Senex', sprite: 'sage',
    blurb: 'The leaden elder — slow and grim, but armoured against all harm.',
    mods: { maxHp: +14, atk: 0, def: +4, maxMp: -2 },
    items: { herb: 3, theriac: 1 }, spells: [],
    passive: 'Leaden Hide: −2 to all incoming damage.', passiveKey: 'leaden',
  },
  {
    id: 'hermes', name: 'Hermes-Magus', sprite: 'villager',
    blurb: 'Guide of souls between worlds — turns blood to gold and slips any snare.',
    mods: { maxHp: -2, atk: +1, def: 0, maxMp: +4 },
    items: { herb: 2, apple: 2 }, spells: [],
    passive: 'Caduceus: flees any non-boss; 10% of damage becomes gold.', passiveKey: 'caduceus',
  },
];
export const CLASS_BY_ID = Object.fromEntries(CLASSES.map(c => [c.id, c]));

// ---- The descent: stages of the Great Work (Atalanta Fugiens) ---------------
// floors are grouped into the four colour stages; each shows a real Maier motto.
export const STAGES = [
  { key: 'nigredo',    name: 'NIGREDO',    sub: 'The Blackening',  floors: [1, 3],
    tint: '#2a2630', wall: '#46414f', floor: '#2f2b36',
    motto: '"Putrefaction is the beginning of generation."',
    pool: ['toad', 'serpent', 'swan', 'wolf', 'bear', 'viper', 'leaden'] },
  { key: 'albedo',     name: 'ALBEDO',     sub: 'The Whitening',   floors: [4, 6],
    tint: '#4a4e57', wall: '#9aa0ab', floor: '#6f747e',
    motto: '"Go to the woman who washes the sheets, and do as she does."',
    pool: ['wolf', 'stag', 'boar', 'harpy', 'salamander', 'white_eagle', 'wingless', 'nymph_queen'] },
  { key: 'citrinitas', name: 'CITRINITAS', sub: 'The Yellowing',   floors: [7, 9],
    tint: '#5a4a22', wall: '#b9912f', floor: '#7d6322',
    motto: '"Nature teaches Nature; Nature conquers Nature."',
    pool: ['lion', 'wlion', 'harpy', 'salamander', 'boar', 'basilisk', 'eagle_sublime', 'green_lion'] },
  { key: 'rubedo',     name: 'RUBEDO',     sub: 'The Reddening',   floors: [10, 12],
    tint: '#4a1d1d', wall: '#a23a2f', floor: '#5a2420',
    motto: '"Make a circle of man and woman... and thou shalt have the Stone."',
    pool: ['lion', 'wlion', 'wyrm', 'ouroboros', 'red_lion', 'salamander_lord', 'rex_marinus'] },
];
export const FINAL_FLOOR = 12;     // the Dragon waits here; beyond it lies the Lapis

// the twelve themed floors of the Opus (Twelve Keys × colour stages, from research)
export const FLOORS = [
  { name: 'The Leprous Mines',        op: 'Purification' },
  { name: 'The Forest of the Soul',   op: 'Mortification' },
  { name: 'The Stinking Swamp',       op: 'Putrefaction' },
  { name: 'The Hall of Scales',       op: 'Ablution' },
  { name: 'The Sealed Vessel',        op: 'Dissolution' },
  { name: 'The Rose Garden',          op: 'Conjunction' },
  { name: 'The Besieged City',        op: 'Sublimation' },
  { name: 'The Field of Decay',       op: 'Generation' },
  { name: 'The Procession of Planets',op: 'The Zodiac Balance' },
  { name: 'The Empty Furnace',        op: 'Fixation' },
  { name: 'The Tower of Olympus',     op: 'Augmentation' },
  { name: 'The Hall of Projection',   op: 'Multiplication' },
];
export function floorInfo(f) { return FLOORS[(f - 1)] || FLOORS[FLOORS.length - 1]; }

// ---- Quests: random "calls to action" from Sol (King) & Luna (Queen) --------
// Each quest is themed on a genuine Atalanta Fugiens motto (the imperative
// "calls to action"). objective.kind: 'slay' (any), 'slayType' (monId),
// 'collect' (floor items), 'reach' (floor depth), 'gold' (gold gained), 'apple'.
export const QUESTS = [
  // --- THE KING (Sol — fire, slaying, descent, the Stone) ---
  { id: 'k_egg', giver: 'king', roman: 'VIII', title: 'The Fiery Sword',
    call: 'Take the egg and pierce it with a fiery sword.',
    poem: ['Pierce the sealed egg with the sword of flame,', 'and what slept within shall answer to its name.'],
    objective: { kind: 'slay', target: 3 },
    reward: { gold: 30, item: ['herb', 1] } },
  { id: 'k_four', giver: 'king', roman: 'XIX', title: 'Kill One of the Four',
    call: 'If you kill one of the four, every body will be dead immediately.',
    poem: ['Strike but one of the elements four,', 'and the body entire shall breathe no more.'],
    objective: { kind: 'slay', target: 5 },
    reward: { item: ['elixir', 1] } },
  { id: 'k_wolf', giver: 'king', roman: 'XXIV', title: 'The Wolf and the King',
    call: 'The wolf devoured the king; burnt, it gave the king back to life.',
    poem: ['The grey wolf swallows the crownèd head;', 'burn the beast, and the king leaves the dead.'],
    objective: { kind: 'slayType', monId: 'wolf', target: 3 },
    reward: { gold: 45 } },
  { id: 'k_dragon', giver: 'king', roman: 'XXV', title: 'Sol and Luna',
    call: 'The Dragon dies only when slain by its brother and sister — Sol and Luna.',
    poem: ['No blade alone may end the worm —', 'only sun and moon together can confirm.'],
    objective: { kind: 'slayType', monId: 'wyrm', target: 2, alt: 'ouroboros' },
    reward: { maxhp: 6, xp: 25 } },
  { id: 'k_shadow', giver: 'king', roman: 'XLV', title: 'Sol and His Shadow',
    call: 'Sol and his shadow complete the work.',
    poem: ['Sol and the shadow he casts below', 'together finish what they sow.'],
    objective: { kind: 'reach', deeper: 3 },
    reward: { xp: 30 } },
  { id: 'k_stone', giver: 'king', roman: 'XXI', title: 'The Squared Circle',
    call: 'Make a circle of man and woman, a square, a triangle, a circle — the Stone.',
    poem: ['Of man and woman draw the round,', 'then square, then triangle — the Stone is found.'],
    objective: { kind: 'reach', stage: 'rubedo' },
    reward: { item: ['elixir', 1], maxhp: 8 } },

  // --- THE QUEEN (Luna — washing, gathering, the woman, flight) ---
  { id: 'q_wash', giver: 'queen', roman: 'III', title: 'The Woman Who Washes',
    call: 'Go to the woman who washes the sheets, and do as she does.',
    poem: ['Go where the washerwoman wrings the sheet,', 'and make the soilèd matter clean and sweet.'],
    objective: { kind: 'collect', target: 3 },
    reward: { item: ['potion', 1], gold: 15 } },
  { id: 'q_cook', giver: 'queen', roman: 'XXII', title: "Woman's Work",
    call: 'When you have the white lead, do woman’s work — that is to say: cook.',
    poem: ['When the white lead at last is won,', 'take to the hearth — the cooking is not done.'],
    objective: { kind: 'collect', target: 4 },
    reward: { item: ['herb', 2] } },
  { id: 'q_toad', giver: 'queen', roman: 'V', title: 'The Toad at the Breast',
    call: 'Put a toad to the breast of a woman, that she may suckle it.',
    poem: ['Set the cold toad to the white breast;', 'it swells with milk while she sinks to rest.'],
    objective: { kind: 'slayType', monId: 'toad', target: 3 },
    reward: { item: ['potion', 1], gold: 20 } },
  { id: 'q_owl', giver: 'queen', roman: 'XLIII', title: 'The Screech Owl',
    call: 'Listen to the screech owl’s voice; heed no bird that cries at evening.',
    poem: ['Heed the screech-owl’s truer cry,', 'and let the evening criers pass you by.'],
    objective: { kind: 'slayType', monId: 'harpy', target: 3, alt: 'swan' },
    reward: { item: ['apple', 1] } },
  { id: 'q_gold', giver: 'queen', roman: 'VI', title: 'Sow Your Gold',
    call: 'Sow your gold in the white foliated earth.',
    poem: ['Sow thy gold in the foliate white,', 'and reap a harvest born of light.'],
    objective: { kind: 'gold', target: 40 },
    reward: { item: ['apple', 1], xp: 10 } },
  { id: 'q_nature', giver: 'queen', roman: 'XLII', title: 'Nature, Reason, Reading',
    call: 'Let Nature, Reason, Experience and Reading be fire, vessel, water, earth.',
    poem: ['Let Nature, Reason, Reading, and the tried', 'be fire and vessel, water, earth, and guide.'],
    objective: { kind: 'reach', deeper: 2 },
    reward: { xp: 18, item: ['herb', 1] } },

  // --- research-derived charges (Rupescissa/Bacon/Nummedal/Maier) ---
  { id: 'q_theriac', giver: 'queen', roman: '—', title: 'Theriac for the Plague',
    call: 'Brew the universal antidote from the flesh of the Tyrian viper.',
    poem: ['From the viper’s bane the cure is wrung,', 'and the plague-struck ward finds breath and tongue.'],
    objective: { kind: 'slayType', monId: 'viper', target: 3 },
    reward: { item: ['theriac', 2], gold: 20 } },
  { id: 'q_fifth', giver: 'queen', roman: '—', title: 'The Fifth Essence',
    call: 'Distil the incorruptible quintessence from the matter of the floors.',
    poem: ['Draw off the heaven hid in earthly dross —', 'the fifth pure essence, gain without loss.'],
    objective: { kind: 'collect', target: 3 },
    reward: { item: ['quinta', 1], xp: 20 } },
  { id: 'k_greenlion', giver: 'king', roman: 'XXXVII', title: 'Slay the Green Lion',
    call: 'The green lion swallows the sun; take its blood for the Work.',
    poem: ['The green beast gnaws the golden sun —', 'spill its blood and the gold is won.'],
    objective: { kind: 'slayType', monId: 'green_lion', target: 1, alt: 'lion' },
    reward: { gold: 80, item: ['aurum', 1] } },
  { id: 'k_assay', giver: 'king', roman: '—', title: 'Assay the Ore',
    call: 'Learn to tell true gold from gilded counterfeit.',
    poem: ['On the touchstone the truth is read —', 'real gold, or a charlatan’s lead.'],
    objective: { kind: 'gold', target: 50 },
    reward: { xp: 15, item: ['herb', 2] } },
  { id: 'q_gratis', giver: 'queen', roman: '—', title: 'Cure Them Gratis',
    call: 'Heal the sick and take no payment — the Rose-Cross rule.',
    poem: ['Wear no badge and charge no fee;', 'heal the poor, and hidden be.'],
    objective: { kind: 'collect', target: 4 },
    reward: { item: ['apple', 1], xp: 12 } },

  // --- THE GREAT WORK questline (chained, in order, culminates at the Dragon) ---
  { id: 'opus1', giver: 'king', line: 'opus', step: 1, roman: 'XIV', title: 'The Great Work I — Nigredo',
    call: 'This is the dragon that devours its own tail.',
    poem: ['First the blackening: all must rot —', 'the serpent eats the thing it wrought.'],
    objective: { kind: 'slay', target: 4 },
    reward: { gold: 25, xp: 15 } },
  { id: 'opus2', giver: 'queen', line: 'opus', step: 2, roman: 'VI', title: 'The Great Work II — Albedo',
    call: 'Sow your gold in the white foliated earth.',
    poem: ['Then the whitening, washed and bright;', 'the soilèd body bathed in light.'],
    objective: { kind: 'collect', target: 3 },
    reward: { item: ['elixir', 1], xp: 20 } },
  { id: 'opus3', giver: 'king', line: 'opus', step: 3, roman: 'XVI', title: 'The Great Work III — Citrinitas',
    call: 'The feathers one lion has not, the other has.',
    poem: ['Now the yellowing: the lion wakes,', 'and gold its tawny pelt now takes.'],
    objective: { kind: 'slayType', monId: 'lion', target: 2, alt: 'wlion' },
    reward: { maxhp: 8, xp: 30 } },
  { id: 'opus4', giver: 'queen', line: 'opus', step: 4, roman: 'XXI', title: 'The Great Work IV — Rubedo',
    call: 'Make a circle of man and woman… and thou shalt have the Stone.',
    poem: ['Last the reddening: crown the King —', 'face the Dragon, and win everything.'],
    objective: { kind: 'reach', stage: 'rubedo' },
    reward: { maxhp: 14, item: ['elixir', 2], xp: 40, boon: 'crowned' } },
];

export const OPUS_LINE = QUESTS.filter(q => q.line === 'opus').sort((a, b) => a.step - b.step);
export function questsByGiver(who) { return QUESTS.filter(q => q.giver === who && q.line !== 'opus'); }

export function stageForFloor(f) {
  return STAGES.find(s => f >= s.floors[0] && f <= s.floors[1]) || STAGES[STAGES.length - 1];
}

// decent starting weapon + armour per class (so the first fight is survivable)
const START_GEAR = {
  knight:     { weapon: 'sword',  armor: 'mail' },
  alchemist:  { weapon: 'dagger', armor: 'leather' },
  atalanta:   { weapon: 'dagger', armor: 'leather' },
  hippomenes: { weapon: 'sword',  armor: 'leather' },
  soror:      { weapon: 'dagger', armor: 'whiterobe' },
  senex:      { weapon: 'sword',  armor: 'mail' },
  hermes:     { weapon: 'dagger', armor: 'leather' },
};

// starting hero for a chosen class
export function newHero(classId = 'knight', attribs = null) {
  const cls = CLASS_BY_ID[classId] || CLASSES[0];
  const gear = START_GEAR[cls.id] || { weapon: 'dagger', armor: 'leather' };
  const hero = {
    name: cls.name.replace(/^The /, ''),
    classId: cls.id, sprite: cls.sprite, passiveKey: cls.passiveKey,
    attribs: attribs || { might: 0, ward: 0, vigor: 0, spirit: 0 },
    level: 1, xp: 0,
    hp: 1, maxHp: 1, mp: 0, maxMp: 0, atk: 1, def: 1,
    weapon: gear.weapon, armor: gear.armor,
    gold: 30,
    items: { ...cls.items },
    spells: [...new Set([...spellsForLevel(1), ...cls.spells])],
    // overworld position (grid) — open ground just east of the Sun-Castle
    gx: 4, gy: 8, facing: 'down',
    flags: { metKing: false, dragonSlain: false },
    depth: 0, maxDepth: 0,
    quests: [],           // active quests {id, progress, baseGold}
    questsDone: 0,
    opusStep: 0,          // progress through the Great-Work questline (0..4)
  };
  recomputeStats(hero);
  hero.hp = hero.maxHp;
  hero.mp = hero.maxMp;
  return hero;
}
