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
  { id: 'leave',     label: 'Leave town' },
];

// what each shop sells
const APOTHECARY = ['herb', 'ardens', 'potion', 'theriac', 'elixir', 'quinta', 'aurum', 'apple'];
const ARMOURY = {
  weapons: ['dagger', 'sword', 'geber', 'falchion', 'scythe', 'michael', 'sol', 'flameblade'],
  armour: ['leather', 'whiterobe', 'mail', 'salahide', 'peacockmantle', 'plate', 'purple'],
};

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
    }
  }

  _itemCost(k) { return ({ herb: 15, ardens: 18, potion: 12, theriac: 35, elixir: 60, quinta: 120, aurum: 200, apple: 40 })[k] || 20; }

  _buy(entry) {
    const h = this.game.hero;
    if (!entry) return;
    if (entry.cost > h.gold) { this.game.sfx('hit'); this.game.msg.push('Not enough gold.'); return; }
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
    this._building(ctx, 's_church', W * 0.18, H - 150, 1.1, 'Church');
    this._building(ctx, 's_house', W * 0.40, H - 150, 1.0, 'Inn');
    this._building(ctx, 's_furnace', W * 0.60, H - 150, 1.0, 'Apothecary');
    this._building(ctx, 's_town', W * 0.82, H - 150, 0.8, 'Armoury');

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
      const bw = 460, bx = W / 2 - bw / 2, by = H - 250;
      window9(ctx, bx, by, bw, 230);
      text(ctx, this.shopKind === 'apothecary' ? 'APOTHECARY' : 'ARMOURY', bx + 20, by + 12, { size: 15, color: COLORS.hi });
      text(ctx, `Gold ${h.gold}`, bx + bw - 110, by + 12, { size: 14, color: COLORS.hi });
      this.list.forEach((e, i) => {
        const yy = by + 40 + i * 22, sel = i === this.sel;
        const owned = (e.kind === 'weapon' && h.weapon === e.key) || (e.kind === 'armor' && h.armor === e.key);
        const col = sel ? COLORS.hi : (e.cost > h.gold ? '#9a6a6a' : COLORS.text);
        if (sel) text(ctx, '▶', bx + 16, yy, { color: COLORS.hi });
        text(ctx, e.name + (owned ? ' (equipped)' : ''), bx + 36, yy, { size: 14, color: col });
        text(ctx, e.cost + 'g', bx + bw - 150, yy, { size: 14, color: col });
        if (sel) text(ctx, e.desc, bx + 36, by + 200, { size: 12, color: COLORS.textDim });
      });
      text(ctx, 'Z buy   •   X back', bx + bw - 150, by + 200, { size: 12, color: COLORS.textDim });
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
