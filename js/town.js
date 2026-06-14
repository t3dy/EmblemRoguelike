// town.js — an enterable settlement: church (heal), inn (full rest), apothecary
// (alchemical medicines), armoury (weapons & armour). Menu-driven, JRPG-style.
import { Assets } from './assets.js';
import { ITEMS, WEAPONS, ARMOR, recomputeStats } from './data.js';
import { window9, parchmentCard, text, menu, bar, COLORS } from './ui.js';

const ROOT_MENU = [
  { id: 'church',    label: 'Pray at the Church (restore HP)' },
  { id: 'inn',       label: 'Rest at the Inn (restore HP & MP)' },
  { id: 'apothecary',label: 'Apothecary (alchemical medicines)' },
  { id: 'armoury',   label: 'Armoury (weapons & armour)' },
  { id: 'bookstore', label: 'Bookstore (tomes of the Art)' },
  { id: 'assayer',   label: "Assayer (sell relics for gold)" },
  { id: 'leave',     label: 'Leave town' },
];

// what each shop sells
const APOTHECARY = ['herb', 'ardens', 'potion', 'theriac', 'elixir', 'quinta', 'aurum', 'apple'];
const ARMOURY = {
  weapons: ['dagger', 'sword', 'geber', 'falchion', 'scythe', 'michael', 'sol', 'flameblade'],
  armour: ['leather', 'whiterobe', 'mail', 'salahide', 'peacockmantle', 'plate', 'purple'],
};

// the Bookstore — printed tomes of the Art. Each is bought ONCE and confers a
// permanent boon (folded into hero.attribs so it survives level-ups), or teaches
// a spell. Sourced from the research corpus (Valentine, Trismosin, Rupescissa,
// Maier's Atalanta Fugiens, the Mutus Liber, Aurora consurgens).
const BOOKS = [
  { key: 'keys',     name: 'The Twelve Keys (Basil Valentine)', cost: 70, attrib: 'might',  blurb: 'Antimony and the work of fire. +1 Might (Attack).' },
  { key: 'splendor', name: 'Splendor Solis (Trismosin)',        cost: 70, attrib: 'ward',   blurb: 'The seven parables of the fixed body. +1 Ward (Defence).' },
  { key: 'quinta',   name: 'De Consideratione Quintae Essentiae', cost: 80, attrib: 'vigor', blurb: 'Rupescissa on the incorruptible fifth essence. +1 Vigor (+3 HP).' },
  { key: 'mutus',    name: 'Mutus Liber (the Mute Book)',       cost: 80, attrib: 'spirit', blurb: 'The wordless emblems of the dew-work. +1 Spirit (+3 MP).' },
  { key: 'aurora',   name: 'Aurora Consurgens',                 cost: 110, spell: 'HEAL',    blurb: 'The rising dawn. Teaches the Heal incantation.' },
  { key: 'atalanta', name: 'Atalanta Fugiens (Maier)',          cost: 40, gift: ['apple', 2], blurb: 'The fleeing huntress, in fugue and emblem. Gift: 2 Golden Apples.' },
];

export class Town {
  constructor(game, name) {
    this.game = game;
    this.name = name || 'Village of Mercurius';
    this.mode = 'menu';      // 'menu' | 'shop'
    this.shopKind = null;    // 'apothecary' | 'armoury'
    this.sel = 0;
    this.list = [];          // current shop entries
  }

  // ---- input -----------------------------------------------------------------
  input(k) {
    const m = this.game.msg;
    if (!m.empty) { if (k === 'confirm') m.advance(); return; }
    if (this.mode === 'menu') {
      if (k === 'up') this.sel = (this.sel - 1 + ROOT_MENU.length) % ROOT_MENU.length;
      if (k === 'down') this.sel = (this.sel + 1) % ROOT_MENU.length;
      if (k === 'cancel') { this.game.leaveTown(); }
      if (k === 'confirm') this._choose(ROOT_MENU[this.sel].id);
    } else if (this.mode === 'shop') {
      if (k === 'up') this.sel = (this.sel - 1 + this.list.length) % this.list.length;
      if (k === 'down') this.sel = (this.sel + 1) % this.list.length;
      if (k === 'cancel') { this.mode = 'menu'; this.sel = 0; }
      if (k === 'confirm') this._buy(this.list[this.sel]);
    }
  }

  _choose(id) {
    const h = this.game.hero;
    if (id === 'leave') { this.game.leaveTown(); return; }
    if (id === 'church') {
      h.hp = h.maxHp; this.game.sfx('heal');
      this.game.msg.push('The priest anoints thy wounds. HP fully restored.');
      return;
    }
    if (id === 'inn') {
      h.hp = h.maxHp; h.mp = h.maxMp; this.game.sfx('heal');
      this.game.msg.push('You rest the night at the inn. HP and MP restored.');
      return;
    }
    if (id === 'apothecary') {
      this.shopKind = 'apothecary'; this.mode = 'shop'; this.sel = 0;
      this.list = APOTHECARY.map(k => ({ kind: 'item', key: k, name: ITEMS[k].name, cost: this._itemCost(k), desc: ITEMS[k].desc }));
    } else if (id === 'armoury') {
      this.shopKind = 'armoury'; this.mode = 'shop'; this.sel = 0;
      this.list = [
        ...ARMOURY.weapons.map(k => ({ kind: 'weapon', key: k, name: WEAPONS[k].name, cost: WEAPONS[k].cost, desc: WEAPONS[k].desc })),
        ...ARMOURY.armour.map(k => ({ kind: 'armor', key: k, name: ARMOR[k].name, cost: ARMOR[k].cost, desc: ARMOR[k].desc })),
      ];
    } else if (id === 'bookstore') {
      this.shopKind = 'bookstore'; this.mode = 'shop'; this.sel = 0;
      this.list = BOOKS.map(b => ({ kind: 'book', key: b.key, name: b.name, cost: b.cost, desc: b.blurb, book: b }));
    } else if (id === 'assayer') {
      this.shopKind = 'assayer'; this.mode = 'shop'; this.sel = 0;
      // sell consumables the hero holds for half their apothecary value
      this.list = APOTHECARY
        .filter(k => (h.items[k] || 0) > 0)
        .map(k => ({ kind: 'sell', key: k, name: ITEMS[k].name, cost: Math.max(4, Math.floor(this._itemCost(k) / 2)), desc: `You hold ${h.items[k]}. Sell one for gold.` }));
      if (!this.list.length) { this.mode = 'menu'; this.game.msg.push('The assayer eyes thy empty satchel. "Bring me relics or medicines to weigh."'); }
    }
  }

  _itemCost(k) { return ({ herb: 15, ardens: 18, potion: 12, theriac: 35, elixir: 60, quinta: 120, aurum: 200, apple: 40 })[k] || 20; }

  _buy(entry) {
    const h = this.game.hero;
    if (!entry) return;
    // the assayer BUYS from the hero — handle before the gold check
    if (entry.kind === 'sell') {
      if ((h.items[entry.key] || 0) <= 0) { this.game.msg.push('Thou hast none to sell.'); return; }
      h.items[entry.key]--; h.gold += entry.cost;
      this.game.sfx('heal');
      this.game.msg.push(`Sold ${entry.name} for ${entry.cost} gold.`);
      // refresh the list (item may now be depleted)
      this._choose('assayer');
      this.game.save();
      return;
    }
    if (entry.cost > h.gold) { this.game.sfx('hit'); this.game.msg.push('Not enough gold.'); return; }
    if (entry.kind === 'book') {
      h.flags.books = h.flags.books || {};
      if (h.flags.books[entry.key]) { this.game.msg.push('Thou hast already studied that tome.'); return; }
      const b = entry.book;
      h.gold -= entry.cost; h.flags.books[entry.key] = true;
      let gained = '';
      if (b.attrib) {
        h.attribs = h.attribs || { might: 0, ward: 0, vigor: 0, spirit: 0 };
        h.attribs[b.attrib] = (h.attribs[b.attrib] || 0) + 1;
        recomputeStats(h);
        gained = `Attack ${h.atk}, Defence ${h.def}, HP ${h.maxHp}, MP ${h.maxMp}.`;
      } else if (b.spell) {
        if (!h.spells.includes(b.spell)) h.spells.push(b.spell);
        gained = `Learned ${b.spell}.`;
      } else if (b.gift) {
        const [k, n] = b.gift; h.items[k] = (h.items[k] || 0) + n;
        gained = `Received ${n}× ${ITEMS[k].name}.`;
      }
      this.game.sfx('level');
      this.game.msg.push(`You study ${b.name}.`, gained);
      this.game.save();
      return;
    }
    if (entry.kind === 'item') {
      h.gold -= entry.cost;
      h.items[entry.key] = (h.items[entry.key] || 0) + 1;
      this.game.sfx('heal');
      this.game.msg.push(`Bought ${entry.name}.`);
    } else if (entry.kind === 'weapon') {
      if (h.weapon === entry.key) { this.game.msg.push('Already wielding that.'); return; }
      h.gold -= entry.cost; h.weapon = entry.key; recomputeStats(h);
      this.game.sfx('level');
      this.game.msg.push(`Equipped ${entry.name}. Attack is now ${h.atk}.`);
    } else if (entry.kind === 'armor') {
      if (h.armor === entry.key) { this.game.msg.push('Already wearing that.'); return; }
      h.gold -= entry.cost; h.armor = entry.key; recomputeStats(h);
      this.game.sfx('level');
      this.game.msg.push(`Equipped ${entry.name}. Defence is now ${h.def}.`);
    }
    this.game.save();
  }

  // ---- render ----------------------------------------------------------------
  render(ctx) {
    const W = this.game.W, H = this.game.H, h = this.game.hero;
    // warm dusk townscape backdrop
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#3a2c44'); g.addColorStop(1, '#6a4a3a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // ground
    ctx.fillStyle = '#5a4632'; ctx.fillRect(0, H - 150, W, 150);

    // building sprites along the street
    this._building(ctx, 's_church', W * 0.10, H - 150, 1.0, 'Church');
    this._building(ctx, 's_house', W * 0.26, H - 150, 0.9, 'Inn');
    this._building(ctx, 's_furnace', W * 0.42, H - 150, 0.9, 'Apothecary');
    this._building(ctx, 's_town', W * 0.58, H - 150, 0.7, 'Armoury');
    this._building(ctx, 's_house', W * 0.74, H - 150, 0.8, 'Bookstore');
    this._building(ctx, 's_furnace', W * 0.90, H - 150, 0.7, 'Assayer');

    // title
    text(ctx, this.name, W / 2, 18, { align: 'center', size: 22, color: COLORS.hi });

    // gold + HP/MP readout
    window9(ctx, 12, 50, 196, 64);
    text(ctx, `${h.name}  Lv ${h.level}`, 24, 58, { size: 13, color: COLORS.hi });
    text(ctx, `HP ${h.hp}/${h.maxHp}`, 24, 76, { size: 13, color: COLORS.hpGreen });
    text(ctx, `MP ${h.mp}/${h.maxMp}`, 24, 94, { size: 13, color: COLORS.mpBlue });
    text(ctx, `Gold ${h.gold}`, 120, 76, { size: 13, color: COLORS.hi });

    if (!this.game.msg.empty) { this.game.msg.render(ctx, 14, H - 116, W - 28, 104); return; }

    if (this.mode === 'menu') {
      const bw = 360, bx = W / 2 - bw / 2, by = H - 210;
      window9(ctx, bx, by, bw, 190);
      menu(ctx, ROOT_MENU.map(o => o.label), bx + 36, by + 18, this.sel, { lh: 30 });
      text(ctx, 'Z select   •   X leave', W / 2, by + 168, { align: 'center', size: 12, color: COLORS.textDim });
    } else {
      // shop list
      const TITLES = { apothecary: 'APOTHECARY', armoury: 'ARMOURY', bookstore: 'BOOKSTORE', assayer: 'ASSAYER' };
      const selling = this.shopKind === 'assayer';
      const bw = 500, bx = W / 2 - bw / 2, by = H - 260;
      window9(ctx, bx, by, bw, 240);
      text(ctx, TITLES[this.shopKind] || 'SHOP', bx + 20, by + 12, { size: 15, color: COLORS.hi });
      text(ctx, `Gold ${h.gold}`, bx + bw - 110, by + 12, { size: 14, color: COLORS.hi });
      this.list.forEach((e, i) => {
        const yy = by + 40 + i * 22, sel = i === this.sel;
        const owned = (e.kind === 'weapon' && h.weapon === e.key) || (e.kind === 'armor' && h.armor === e.key);
        const studied = e.kind === 'book' && h.flags.books && h.flags.books[e.key];
        const tooDear = !selling && e.cost > h.gold;
        const col = sel ? COLORS.hi : (studied ? '#8a8a6a' : (tooDear ? '#9a6a6a' : COLORS.text));
        if (sel) text(ctx, '▶', bx + 16, yy, { color: COLORS.hi });
        const tag = owned ? ' (equipped)' : (studied ? ' (studied)' : '');
        text(ctx, e.name + tag, bx + 36, yy, { size: 14, color: col });
        text(ctx, (selling ? '+' : '') + e.cost + 'g', bx + bw - 150, yy, { size: 14, color: col });
      });
      if (this.list[this.sel]) text(ctx, this.list[this.sel].desc, bx + 36, by + 210, { size: 12, color: COLORS.textDim });
      text(ctx, selling ? 'Z sell   •   X back' : 'Z buy   •   X back', bx + bw - 150, by + 210, { size: 12, color: COLORS.textDim });
    }
  }

  _building(ctx, sprite, cx, groundY, scale, label) {
    const img = Assets.img(sprite);
    if (img) {
      const s = Math.min(scale, 150 / img.height);
      const dw = img.width * s, dh = img.height * s;
      ctx.drawImage(img, cx - dw / 2, groundY - dh, dw, dh);
    }
    text(ctx, label, cx, groundY + 6, { align: 'center', size: 12, color: COLORS.parchment });
  }
}
