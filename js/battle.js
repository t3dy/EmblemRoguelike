// battle.js — Dragon Warrior style first-person battle.
import { Assets } from './assets.js';
import { MONSTERS, SPELLS, ITEMS, WEAPONS, LEVELS, statsForLevel, spellsForLevel, recomputeStats } from './data.js';

// status effects (alchemical colour operations). turns + per-tick behaviour.
const STATUS = {
  venom:    { label: 'Venom', dot: 2 },
  blacken:  { label: 'Blacken', dot: 3, healMul: 0.5 },
  whiten:   { label: 'Whiten', hot: 4, cleanses: ['blacken', 'venom'] },
  redden:   { label: 'Redden', atkMul: 1.5, defMod: -2 },
  dissolve: { label: 'Dissolve', atkMul: 0.6, defMod: -2 },
  coagulate:{ label: 'Coagulate', defMod: 3, skip: 0.5 },
  charm:    { label: 'Charm', skip: 1 },
};
import { window9, parchmentCard, text, menu, bar, COLORS } from './ui.js';

const PHASE = {
  INTRO: 'intro', MENU: 'menu', SUBMENU: 'submenu',
  ANIM: 'anim', RESULT: 'result', DONE: 'done'
};

export class Battle {
  constructor(game, monsterId, scale = 1) {
    this.game = game;
    this.hero = game.hero;
    const base = MONSTERS[monsterId];
    const sc = base.boss ? 1 : scale;   // bosses keep their authored stats
    const hp = Math.round(base.hp * sc);
    this.mon = {
      ...base, hp, maxHp: hp,
      atk: Math.round(base.atk * sc), def: Math.round(base.def * sc),
      xp: Math.round(base.xp * sc), gold: Math.round(base.gold * sc),
    };
    this.phase = PHASE.INTRO;
    this.cmd = 0;                 // top menu selection
    this.commands = ['FIGHT', 'SPELL', 'ITEM', 'RUN'];
    this.sub = 0;                 // submenu selection
    this.subType = null;          // 'spell' | 'item'
    this.subList = [];
    this.flash = 0;               // enemy hit flash
    this.shake = 0;               // screen shake timer
    this.heroFlash = 0;
    this.monAlpha = 1;            // fade out on death
    this.result = null;           // 'win'|'lose'|'run'
    this.heroSt = [];             // hero status effects [{key,turns}]
    this.mon.st = [];             // monster status effects
    this.pendingResolve = null;   // fn run after message empties during ANIM
    const m = game.msg;
    m.push(`A ${this.mon.name} draws near!`);
    m.onEmpty = () => { this.phase = PHASE.MENU; };
  }

  // ---- input -----------------------------------------------------------------
  input(key) {
    const m = this.game.msg;
    if (!m.empty) { // message showing
      if (key === 'confirm') {
        m.advance();
        if (m.empty && this.pendingResolve) { const f = this.pendingResolve; this.pendingResolve = null; f(); }
      }
      return;
    }
    if (this.phase === PHASE.MENU) {
      if (key === 'up')    this.cmd = (this.cmd + 2) % 4;
      if (key === 'down')  this.cmd = (this.cmd + 2) % 4;
      if (key === 'left')  this.cmd = (this.cmd + 3) % 4;
      if (key === 'right') this.cmd = (this.cmd + 1) % 4;
      if (key === 'confirm') this._choose(this.commands[this.cmd]);
    } else if (this.phase === PHASE.SUBMENU) {
      if (key === 'up')   this.sub = (this.sub - 1 + this.subList.length) % this.subList.length;
      if (key === 'down') this.sub = (this.sub + 1) % this.subList.length;
      if (key === 'cancel') { this.phase = PHASE.MENU; }
      if (key === 'confirm') this._pickSub();
    }
  }

  _choose(cmd) {
    if (cmd === 'FIGHT') { this._heroAttack(); }
    else if (cmd === 'RUN') { this._tryRun(); }
    else if (cmd === 'SPELL') {
      this.subType = 'spell';
      this.subList = this.hero.spells.map(k => ({ key: k, label: `${SPELLS[k].name}  ${SPELLS[k].cost}MP` }));
      if (this.subList.length === 0) { this.game.msg.push('No spells known.'); return; }
      this.sub = 0; this.phase = PHASE.SUBMENU;
    } else if (cmd === 'ITEM') {
      this.subType = 'item';
      this.subList = Object.keys(this.hero.items).filter(k => this.hero.items[k] > 0)
        .map(k => ({ key: k, label: `${ITEMS[k].name} x${this.hero.items[k]}` }));
      if (this.subList.length === 0) { this.game.msg.push('No items.'); return; }
      this.sub = 0; this.phase = PHASE.SUBMENU;
    }
  }

  _pickSub() {
    const entry = this.subList[this.sub];
    if (this.subType === 'spell') this._castSpell(entry.key);
    else this._useItem(entry.key);
  }

  // ---- status effects --------------------------------------------------------
  _st(who) { return who === 'hero' ? this.heroSt : this.mon.st; }
  _has(who, key) { return this._st(who).some(s => s.key === key); }
  _addSt(who, key, turns) {
    if (!STATUS[key]) return;
    const list = this._st(who), e = list.find(s => s.key === key);
    if (e) e.turns = Math.max(e.turns, turns); else list.push({ key, turns });
  }
  _atkMul(who) { let m = 1; for (const s of this._st(who)) m *= (STATUS[s.key].atkMul || 1); return m; }
  _defMod(who) { let d = 0; for (const s of this._st(who)) d += (STATUS[s.key].defMod || 0); return d; }
  _effAtk(who, base) { return base * this._atkMul(who); }
  _effDef(who, base) { return base + this._defMod(who); }
  // run start-of-turn ticks; returns {dead, line}
  _tickStatuses(who) {
    const list = this._st(who); if (!list.length) return { dead: false, line: '' };
    const name = who === 'hero' ? this.hero.name : this.mon.name;
    let hp = who === 'hero' ? this.hero.hp : this.mon.hp;
    const max = who === 'hero' ? this.hero.maxHp : this.mon.maxHp;
    const notes = [];
    for (const s of list) {
      const d = STATUS[s.key];
      if (d.dot) { hp -= d.dot; notes.push(`${STATUS[s.key].label} −${d.dot}`); }
      if (d.hot) { hp = Math.min(max, hp + d.hot); notes.push(`${STATUS[s.key].label} +${d.hot}`); }
      if (d.cleanses) for (const c of d.cleanses) { const x = list.find(z => z.key === c); if (x) x.turns = 0; }
      s.turns--;
    }
    const alive = list.filter(s => s.turns > 0);
    if (who === 'hero') { this.heroSt = alive; this.hero.hp = Math.max(0, hp); }
    else { this.mon.st = alive; this.mon.hp = hp; }
    return { dead: hp <= 0, line: notes.length ? `${name}: ${notes.join(', ')}.` : '' };
  }

  // ---- player actions --------------------------------------------------------
  _dmg(atk, def) {
    const base = Math.max(1, atk - Math.floor(def / 2));
    const v = Math.floor(base * (0.8 + Math.random() * 0.4));
    const crit = Math.random() < 0.07;
    return { value: crit ? Math.floor(v * 1.8) : v, crit };
  }

  _vsMatch(vs) {
    const n = (this.mon.name || '').toLowerCase();
    if (vs === 'dragon') return /dragon|wyrm|serpent|ouroboros|basilisk|viper/.test(n);
    return n.includes(vs);
  }
  _heroAttack() {
    this.phase = PHASE.ANIM;
    if (this.mon.special === 'dodge' && Math.random() < 0.3) {
      this.game.sfx('hit');
      this.game.msg.push(`${this.hero.name} attacks!`, `${this.mon.name} soars above the blow — miss!`);
      this.pendingResolve = () => this._afterHeroAction();
      return;
    }
    const w = WEAPONS[this.hero.weapon];
    let eatk = this._effAtk('hero', this.hero.atk);
    if (w && w.vs && this._vsMatch(w.vs)) eatk *= 1.4;
    const d = this._dmg(eatk, this._effDef('mon', this.mon.def));
    if (this.hero.passiveKey === 'pursuer') d.value = Math.ceil(d.value * 1.15);
    this.mon.hp -= d.value; this.mon._hit = true;
    this.flash = 0.35; this.shake = 0.3;
    this.game.sfx('hit');
    let extra = '';
    if (w && w.onHit) { this._addSt('mon', w.onHit, 3); extra = ` — ${STATUS[w.onHit].label}!`; }
    this.game.msg.push(`${this.hero.name} attacks!`, (d.crit ? `A mighty blow! ${d.value} damage.` : `${this.mon.name} takes ${d.value} damage.`) + extra);
    this.pendingResolve = () => this._afterHeroAction();
  }

  _castSpell(key) {
    const sp = SPELLS[key];
    if (this.hero.mp < sp.cost) { this.phase = PHASE.MENU; this.game.msg.push('Not enough MP!'); return; }
    this.hero.mp -= sp.cost;
    this.phase = PHASE.ANIM;
    if (sp.type === 'heal') {
      const amt = sp.power + Math.floor(Math.random() * 8);
      this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + amt);
      this.game.sfx('heal');
      this.game.msg.push(`${this.hero.name} casts ${sp.name}!`, `HP restored by ${amt}.`);
      this.pendingResolve = () => this._afterHeroAction(false);
    } else if (sp.type === 'cleanse') {
      this.heroSt = []; this._addSt('hero', 'whiten', 3);
      this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + sp.power);
      this.game.sfx('heal');
      this.game.msg.push(`${this.hero.name} casts ${sp.name}!`, `Curses washed away; the whitening sustains.`);
      this.pendingResolve = () => this._afterHeroAction(false);
    } else if (sp.type === 'curse') {
      const d = this._dmg(sp.power, this._effDef('mon', this.mon.def));
      this.mon.hp -= d.value; this._addSt('mon', 'blacken', 3); this.flash = 0.4;
      this.game.sfx('magic');
      this.game.msg.push(`${this.hero.name} casts ${sp.name}!`, `${this.mon.name} rots — ${d.value} damage and Blacken.`);
      this.pendingResolve = () => this._afterHeroAction();
    } else {
      const d = this._dmg(sp.power + 6, this.mon.def);
      this.mon.hp -= d.value;
      this.flash = 0.4; this.shake = 0.35;
      this.game.sfx('magic');
      this.game.msg.push(`${this.hero.name} casts ${sp.name}!`, `${this.mon.name} takes ${d.value} damage.`);
      this.pendingResolve = () => this._afterHeroAction();
    }
  }

  _useItem(key) {
    const it = ITEMS[key];
    this.hero.items[key]--;
    this.phase = PHASE.ANIM;
    if (it.type === 'heal') {
      const amt = it.power + Math.floor(Math.random() * 8);
      this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + amt);
      this.game.sfx('heal');
      this.game.msg.push(`Used ${it.name}.`, `HP restored by ${amt}.`);
      this.pendingResolve = () => this._afterHeroAction(false);
    } else if (it.type === 'mp') {
      this.hero.mp = Math.min(this.hero.maxMp, this.hero.mp + it.power);
      this.game.sfx('heal');
      this.game.msg.push(`Used ${it.name}.`, `MP restored by ${it.power}.`);
      this.pendingResolve = () => this._afterHeroAction(false);
    } else if (it.type === 'full') {
      this.hero.hp = this.hero.maxHp; this.hero.mp = this.hero.maxMp;
      if (it.id === 'quinta') this.heroSt = [];
      this.game.sfx('heal');
      this.game.msg.push(`Quaffed the ${it.name}!`, it.id === 'quinta' ? 'Fully restored; all curses cleansed.' : 'HP and MP fully restored.');
      this.pendingResolve = () => this._afterHeroAction(false);
    } else if (it.type === 'cure') {
      const amt = it.power + Math.floor(Math.random() * 6);
      this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + amt);
      this.heroSt = this.heroSt.filter(s => !['blacken', 'venom', 'coagulate', 'dissolve'].includes(s.key));
      this.game.sfx('heal');
      this.game.msg.push(`Used ${it.name}.`, `Healed ${amt} and cleansed of poison & curse.`);
      this.pendingResolve = () => this._afterHeroAction(false);
    } else if (it.type === 'maxhp') {
      this.hero.maxHp += it.power; this.hero.hp += it.power;
      this.game.sfx('level');
      this.game.msg.push(`Quaffed the ${it.name}!`, `Max HP raised by ${it.power}.`);
      this.pendingResolve = () => this._afterHeroAction(false);
    } else if (it.type === 'flee') {
      // Golden Apple — Atalanta's trick: escape any battle, even a boss.
      this.game.sfx('heal');
      this.game.msg.push('A Golden Apple is cast down!', `${this.mon.name} is distracted — ${this.hero.name} slips away!`);
      this.result = 'run';
      this.pendingResolve = () => this._finish();
    }
  }

  _tryRun() {
    this.phase = PHASE.ANIM;
    // Atalanta's volatility: she always escapes
    if (this.hero.passiveKey === 'volatile') {
      this.game.msg.push(`${this.hero.name} is too swift to catch — fled!`);
      this.result = 'run'; this.pendingResolve = () => this._finish(); return;
    }
    if (this.mon.boss) { this.game.msg.push('The Dragon blocks your escape!'); this.pendingResolve = () => this._enemyTurn(); return; }
    const ok = Math.random() < 0.6;
    if (ok) { this.game.msg.push('The Knight fled!'); this.result = 'run'; this.pendingResolve = () => this._finish(); }
    else { this.game.msg.push('Could not escape!'); this.pendingResolve = () => this._enemyTurn(); }
  }

  _afterHeroAction(checkDeath = true) {
    if (checkDeath && this.mon.hp <= 0) { this._enemyDefeated(); return; }
    this._enemyTurn();
  }

  // hand control back to the player: tick hero statuses, handle charm
  _toPlayer() {
    const ht = this._tickStatuses('hero');
    if (ht.line) this.game.msg.push(ht.line);
    if (ht.dead || this.hero.hp <= 0) { this.hero.hp = 0; this.pendingResolve = () => this._heroDefeated(); if (!ht.line) this._heroDefeated(); return; }
    if (this._has('hero', 'charm')) {
      this.heroSt = this.heroSt.filter(s => s.key !== 'charm');
      this.game.msg.push(`${this.hero.name} is charmed and loses a turn!`);
      this.pendingResolve = () => this._enemyTurn();
      return;
    }
    this.phase = PHASE.MENU;
  }

  // ---- enemy turn ------------------------------------------------------------
  _enemyTurn() {
    // monster status tick (DoT may finish it)
    const mt = this._tickStatuses('mon');
    if (mt.line) this.game.msg.push(mt.line);
    if (mt.dead || this.mon.hp <= 0) { this.pendingResolve = () => this._enemyDefeated(); if (!mt.line) this._enemyDefeated(); return; }
    // passive specials
    if (this.mon.special === 'regen' && !this.mon._hit && this.mon.hp < this.mon.maxHp) this.mon.hp = Math.min(this.mon.maxHp, this.mon.hp + 5);
    if (this.mon.special === 'ramp') this.mon.atk += 2;
    this.mon._hit = false;
    if (this._has('mon', 'coagulate') && Math.random() < 0.5) {
      this.game.msg.push(`${this.mon.name} is frozen fast and cannot act!`);
      this.pendingResolve = () => this._toPlayer();
      return;
    }
    // attack or spell
    const canSpell = this.mon.spell && Math.random() < 0.3;
    let d, label;
    if (canSpell) {
      const sp = SPELLS[this.mon.spell];
      d = this._dmg(this._effAtk('mon', sp.power + this.mon.atk * 0.4), this._effDef('hero', this.hero.def));
      label = `${this.mon.name} breathes ${sp.name}!`; this.game.sfx('magic');
    } else {
      d = this._dmg(this._effAtk('mon', this.mon.atk), this._effDef('hero', this.hero.def));
      label = `${this.mon.name} attacks!`; this.game.sfx('hit');
    }
    this.hero.hp -= d.value; this.heroFlash = 0.4; this.shake = 0.3;
    if (this.mon.special === 'lifesteal') this.mon.hp = Math.min(this.mon.maxHp, this.mon.hp + Math.floor(d.value / 2));
    let extra = '';
    if (this.mon.onHit && this.hero.hp > 0) {
      const key = this.mon.onHit === 'rand' ? ['blacken', 'dissolve', 'coagulate'][Math.floor(Math.random() * 3)] : this.mon.onHit;
      this._addSt('hero', key, key === 'charm' ? 1 : 3);
      extra = ` — ${STATUS[key].label}!`;
    }
    this.game.msg.push(label, (d.crit ? `A savage hit! ${d.value} damage.` : `${this.hero.name} takes ${d.value} damage.`) + extra);
    this.pendingResolve = () => {
      if (this.hero.hp <= 0) { this.hero.hp = 0; this._heroDefeated(); return; }
      this._toPlayer();
    };
  }

  // ---- resolution ------------------------------------------------------------
  _enemyDefeated() {
    this.monAlpha = 0; // fade handled in render via timer
    this.result = 'win';
    this.game.sfx('win');
    const xp = this.mon.xp, gold = this.mon.gold;
    this.hero.xp += xp; this.hero.gold += gold;
    this.game.msg.push(`${this.mon.name} is vanquished!`, `${xp} EXP and ${gold} gold gained.`);
    const ups = this._applyLevelUps();
    ups.forEach(line => this.game.msg.push(line));
    if (this.mon.boss) {
      this.hero.flags.dragonSlain = true;
      this.game.msg.push('The land is freed from the Dragon!');
    }
    this.pendingResolve = () => this._finish();
  }

  _applyLevelUps() {
    const lines = [];
    let leveled = false;
    while (this.hero.level < LEVELS.length && this.hero.xp >= LEVELS[this.hero.level]) {
      this.hero.level++;
      leveled = true;
      recomputeStats(this.hero);
      this.hero.hp = this.hero.maxHp; this.hero.mp = this.hero.maxMp;
      lines.push(`${this.hero.name} is now level ${this.hero.level}!`);
      const newSpells = spellsForLevel(this.hero.level).filter(k => !this.hero.spells.includes(k));
      newSpells.forEach(k => { this.hero.spells.push(k); lines.push(`Learned ${SPELLS[k].name}!`); });
    }
    if (leveled) this.game.sfx('level');
    return lines;
  }

  _heroDefeated() {
    this.result = 'lose';
    this.game.sfx('lose');
    this.game.msg.push(`${this.hero.name} has fallen...`);
    this.pendingResolve = () => this._finish();
  }

  _finish() {
    this.phase = PHASE.DONE;
    this.game.endBattle(this.result);
  }

  // ---- update / render -------------------------------------------------------
  update(dt) {
    if (this.flash > 0) this.flash -= dt;
    if (this.heroFlash > 0) this.heroFlash -= dt;
    if (this.shake > 0) this.shake -= dt;
  }

  render(ctx) {
    const W = this.game.W, H = this.game.H;
    let sx = 0, sy = 0;
    if (this.shake > 0) { sx = (Math.random() - 0.5) * 8; sy = (Math.random() - 0.5) * 8; }
    ctx.save();
    ctx.translate(sx, sy);

    // battle backdrop: dim sky gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1b1430'); g.addColorStop(1, '#0a0712');
    ctx.fillStyle = g; ctx.fillRect(-10, -10, W + 20, H + 20);

    // parchment monster card
    const cardW = 360, cardH = 300, cardX = W / 2 - cardW / 2, cardY = 70;
    parchmentCard(ctx, cardX, cardY, cardW, cardH);

    // monster sprite on card
    if (this.result !== 'win' || this.monAlpha > 0) {
      const img = Assets.img(this.mon.sprite);
      if (img) {
        const maxW = cardW - 60, maxH = cardH - 70;
        let scale = Math.min(maxW / img.width, maxH / img.height) * (this.mon.scale || 1);
        const dw = img.width * scale, dh = img.height * scale;
        ctx.save();
        ctx.globalAlpha = (this.result === 'win') ? Math.max(0, this.monAlpha) : 1;
        if (this.flash > 0 && Math.floor(this.flash * 20) % 2 === 0) ctx.globalAlpha *= 0.35;
        ctx.drawImage(img, cardX + cardW / 2 - dw / 2, cardY + cardH - 30 - dh, dw, dh);
        ctx.restore();
      }
    }
    // monster name plate
    text(ctx, this.mon.name, W / 2, cardY - 30, { align: 'center', size: 18, color: COLORS.hi });
    // enemy hp pips
    bar(ctx, cardX + 40, cardY + cardH + 6, cardW - 80, 8, this.mon.hp / this.mon.maxHp, COLORS.hpRed);
    if (this.mon.st && this.mon.st.length)
      text(ctx, this.mon.st.map(s => STATUS[s.key].label).join(' · '), W / 2, cardY + cardH + 18, { align: 'center', size: 12, color: COLORS.hi });

    // ---- hero status window (top-left) ----
    this._statusWindow(ctx, 14, 12);
    if (this.heroSt && this.heroSt.length)
      text(ctx, this.heroSt.map(s => STATUS[s.key].label).join(' · '), 18, 108, { size: 12, color: COLORS.hi });

    // ---- command / message area (bottom) ----
    const boxY = H - 132, boxH = 120;
    if (this.game.msg.empty && (this.phase === PHASE.MENU || this.phase === PHASE.SUBMENU)) {
      // command window
      const cw = 220;
      window9(ctx, 14, boxY, cw, boxH);
      menu(ctx, this.commands, 50, boxY + 18, this.cmd, { colW: 95, lh: 30 });
      if (this.phase === PHASE.SUBMENU) {
        const subW = W - cw - 44;
        window9(ctx, cw + 30, boxY, subW, boxH);
        menu(ctx, this.subList.map(s => s.label), cw + 66, boxY + 16, this.sub, { lh: 24 });
      } else {
        // prompt
        const subW = W - cw - 44;
        window9(ctx, cw + 30, boxY, subW, boxH);
        text(ctx, 'Command?', cw + 52, boxY + 16, { size: 16 });
      }
    } else {
      this.game.msg.render(ctx, 14, boxY, W - 28, boxH);
    }

    // hero hit flash overlay
    if (this.heroFlash > 0 && Math.floor(this.heroFlash * 20) % 2 === 0) {
      ctx.fillStyle = 'rgba(200,40,40,0.18)'; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  _statusWindow(ctx, x, y) {
    const w = 200, h = 96;
    window9(ctx, x, y, w, h);
    const h0 = this.hero;
    text(ctx, `${h0.name}  Lv ${h0.level}`, x + 14, y + 10, { size: 15, color: COLORS.hi });
    text(ctx, `HP ${h0.hp}/${h0.maxHp}`, x + 14, y + 32, { size: 14 });
    bar(ctx, x + 14, y + 50, w - 28, 6, h0.hp / h0.maxHp, COLORS.hpGreen);
    text(ctx, `MP ${h0.mp}/${h0.maxMp}`, x + 14, y + 60, { size: 14 });
    bar(ctx, x + 14, y + 78, w - 28, 6, h0.maxMp ? h0.mp / h0.maxMp : 0, COLORS.mpBlue);
  }
}
