// ui.js — canvas drawing helpers: Dragon-Warrior style windows, parchment cards,
// menus, and a typewriter message box.

export const COLORS = {
  windowBg: '#0b0b27',
  windowEdge: '#ffffff',
  windowEdge2: '#5a6bd8',
  text: '#f6f0d8',
  textDim: '#b9b39a',
  hi: '#ffe08a',
  parchment: '#e7d4a8',
  parchmentDk: '#c8ad79',
  ink: '#2a2118',
  hpGreen: '#5fd16b',
  hpRed: '#e0584b',
  mpBlue: '#6aa8ff',
};

// classic DW double-border window
export function window9(ctx, x, y, w, h, bg = COLORS.windowBg) {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.windowEdge;
  ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLORS.windowEdge2;
  ctx.strokeRect(x + 5.5, y + 5.5, w - 11, h - 11);
}

// aged parchment card (for the bestiary monster portrait)
export function parchmentCard(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#efe0bb');
  g.addColorStop(0.5, COLORS.parchment);
  g.addColorStop(1, COLORS.parchmentDk);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  // vignette
  const v = ctx.createRadialGradient(x + w/2, y + h/2, h*0.2, x + w/2, y + h/2, h*0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(60,40,15,0.35)');
  ctx.fillStyle = v;
  ctx.fillRect(x, y, w, h);
  // double frame
  ctx.lineWidth = 4; ctx.strokeStyle = '#5b4226';
  ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  ctx.lineWidth = 1; ctx.strokeStyle = '#8a6a3c';
  ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
}

export function text(ctx, str, x, y, opts = {}) {
  ctx.font = (opts.size || 16) + 'px "Courier New", monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = opts.align || 'left';
  if (opts.shadow !== false) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(str, x + 2, y + 2);
  }
  ctx.fillStyle = opts.color || COLORS.text;
  ctx.fillText(str, x, y);
}

// menu of commands, returns nothing; caller tracks selected index
export function menu(ctx, items, x, y, selected, opts = {}) {
  const lh = opts.lh || 26;
  const colW = opts.colW || 0; // if >0, two-column layout
  items.forEach((it, i) => {
    let ix = x, iy = y + i * lh;
    if (colW) { ix = x + (i % 2) * colW; iy = y + Math.floor(i / 2) * lh; }
    const sel = i === selected;
    if (sel) text(ctx, '▶', ix - 20, iy, { color: COLORS.hi });
    text(ctx, it, ix, iy, { color: sel ? COLORS.hi : COLORS.text });
  });
}

// a stat bar
export function bar(ctx, x, y, w, h, frac, color) {
  ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = '#333'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, h);
}

// Typewriter message box state machine
export class MessageBox {
  constructor() { this.queue = []; this.shown = ''; this.full = ''; this.t = 0; this.done = true; this.onEmpty = null; }
  push(...lines) { this.queue.push(...lines); if (this.done) this._next(); }
  _next() {
    if (this.queue.length === 0) { this.done = true; this.full = this.shown = ''; if (this.onEmpty) { const f = this.onEmpty; this.onEmpty = null; f(); } return; }
    this.full = this.queue.shift(); this.shown = ''; this.t = 0; this.done = false;
  }
  // advance: called on confirm key. if still typing -> reveal all; else next line.
  advance() {
    if (!this.done && this.shown.length < this.full.length) { this.shown = this.full; return false; }
    this._next();
    return this.done;
  }
  update(dt) {
    if (this.done) return;
    if (this.shown.length < this.full.length) {
      this.t += dt;
      const cps = 45; // chars per second
      const n = Math.floor(this.t * cps);
      this.shown = this.full.slice(0, Math.min(this.full.length, n));
    }
  }
  get typing() { return !this.done && this.shown.length < this.full.length; }
  get empty() { return this.done && this.queue.length === 0; }
  render(ctx, x, y, w, h) {
    window9(ctx, x, y, w, h);
    const pad = 18, lh = 22, size = 16, maxW = w - pad * 2;
    ctx.font = size + 'px "Courier New", monospace';
    // word-wrap each paragraph to fit the box width
    const lines = [];
    for (const para of this.shown.split('\n')) {
      if (para === '') { lines.push(''); continue; }
      let line = '';
      for (const word of para.split(' ')) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
        else line = test;
      }
      lines.push(line);
    }
    lines.forEach((ln, i) => text(ctx, ln, x + pad, y + 14 + i * lh, { size }));
    if (this.done === false && !this.typing) {
      text(ctx, '▼', x + w - 26, y + h - 26, { color: COLORS.hi });
    }
  }
}

// ---- A2: FURNACE UI PANEL ----
/**
 * Render the furnace operation status panel.
 * Shows: temperature gauge, fuel bar, progress bar, materials list, operation name.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Panel X position
 * @param {number} y - Panel Y position
 * @param {FurnaceOperation} operation - The active operation
 * @param {Furnace} furnace - The furnace performing the operation
 */
export function renderFurnacePanel(ctx, x, y, operation, furnace) {
  const panelW = 320, panelH = 280;

  // Draw panel background and border
  window9(ctx, x, y, panelW, panelH);

  const pad = 15, lh = 24, barH = 16, barW = 260;
  let cy = y + pad;

  // ---- Title: Operation Name ----
  const opName = operation.operationId ? operation.operationId.charAt(0).toUpperCase() + operation.operationId.slice(1) : 'Operation';
  text(ctx, opName.toUpperCase(), x + pad, cy, { size: 14, color: COLORS.hi });
  cy += lh;

  // ---- Status Badge ----
  const statusColor = operation.status === 'paused' ? '#e0584b' : '#8bc34a';
  const statusText = operation.status === 'paused' ? '⚠ PAUSED' : operation.status.toUpperCase();
  text(ctx, statusText, x + pad + barW - 80, cy - lh, { size: 11, color: statusColor });

  // ---- Temperature Gauge ----
  const currentTemp = operation.currentTemp || 20;
  const tempPercent = Math.min(1, currentTemp / 200); // 0-200°C range
  const tempColor = tempPercent < 0.3 ? '#4a90e2'      // blue (cold)
                  : tempPercent < 0.6 ? '#f5a623'      // orange (warming)
                  : tempPercent < 0.85 ? '#f8e71c'     // yellow (hot)
                  : '#e0584b';                           // red (very hot)

  text(ctx, `Temp: ${Math.floor(currentTemp)}°C / ${operation.targetTemp}°C`, x + pad, cy, { size: 12 });
  cy += 16;
  bar(ctx, x + pad, cy, barW, barH, tempPercent, tempColor);
  cy += barH + 8;

  // ---- Fuel Bar ----
  const fuelPercent = Math.min(1, operation.fuel / 20);
  text(ctx, `Fuel: ${Math.floor(fuelPercent * 100)}%`, x + pad, cy, { size: 12 });
  cy += 16;
  bar(ctx, x + pad, cy, barW, barH, fuelPercent, '#8b6f47');
  cy += barH + 8;

  // ---- Progress Bar ----
  const progressPercent = operation.progress / 100;
  text(ctx, `Progress: ${Math.floor(operation.progress)}%`, x + pad, cy, { size: 12 });
  cy += 16;
  bar(ctx, x + pad, cy, barW, barH, progressPercent, COLORS.hpGreen);
  cy += barH + 8;

  // ---- Estimated Time Remaining ----
  const remaining = Math.max(0, operation.duration - (Date.now() - operation.startTime));
  const remainingSeconds = Math.ceil(remaining / 1000);
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  text(ctx, `Time: ${timeStr}`, x + pad, cy, { size: 12, color: COLORS.textDim });
  cy += lh;

  // ---- Materials List ----
  text(ctx, 'Materials:', x + pad, cy, { size: 12, color: COLORS.hi });
  cy += 16;

  if (operation.materials && operation.materials.length > 0) {
    for (const mat of operation.materials) {
      const matName = mat.name || mat.id;
      text(ctx, `  ${mat.qty}x ${matName}`, x + pad + 10, cy, { size: 11, color: COLORS.textDim });
      cy += lh - 6;
      if (cy > y + panelH - 20) break; // don't overflow
    }
  } else {
    text(ctx, '  (none)', x + pad + 10, cy, { size: 11, color: COLORS.textDim });
  }
}
