// music.js — plays Michael Maier's actual Atalanta Fugiens fugues (1617).
//
// Note data is parsed from sequencings of Maier's 50 three-voice canons into
// game/assets/fugues.json (see tools/build_fugues.py): each emblem = { bpm,
// beats, notes:[[startBeat, durBeat, midi], ...] } with all three voices —
// Atalanta (vox fugiens), Hippomenes (vox sequens), Pomum (vox morans) — written
// out exactly as in the score. We schedule every note via WebAudio.
//
// Emblems are grouped into per-area playlists by their colour-stage in the Work,
// and cycle: when one fugue finishes, the next in the area's list begins.

const LOOKAHEAD = 0.15;
const TICK = 25;

// area -> ordered list of emblem numbers (real Atalanta Fugiens fugues)
const PLAYLISTS = {
  title:      [1, 21],                 // "His nurse is the Earth"; the Stone
  overworld:  [3, 13, 7, 42],          // washing; Jordan; the bird; the four guides
  battle:     [25, 19, 50, 44],        // the Dragon; kill one of four; Dragon & woman; Osiris
  victory:    [21, 45],                // the Philosopher's Stone; Sol completes the work
  gameover:   [33, 5],                 // hermaphrodite in darkness; the toad
  nigredo:    [14, 24, 47, 5],         // ouroboros dragon; wolf & king; wolf & dog; toad
  albedo:     [3, 6, 11, 20],          // washerwoman; sow gold; whiten Latona; Nature
  citrinitas: [7, 16, 29, 46],         // the bird; winged lion; salamander; two eagles
  rubedo:     [21, 30, 40, 45],        // the Stone; hermaphrodite needs fire; one water; Sol
};

function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

export class Music {
  constructor(getCtx) {
    this.getCtx = getCtx;
    this.fugues = null;
    this.area = null;
    this.playlist = [];
    this.pIdx = 0;
    this.muted = false;
    this.timer = null;
    this.master = null;
    // current piece playback
    this.notes = null; this.i = 0; this.beat = 0.5; this.len = 0;
    this.pieceStart = 0; this.pending = false;
  }

  async load() {
    try { this.fugues = await (await fetch('assets/fugues.json')).json(); }
    catch (e) { console.warn('fugues.json failed', e); this.fugues = {}; }
    return this;
  }

  start() { if (!this.timer) this.timer = setInterval(() => this._tick(), TICK); }
  stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.9;
    return this.muted;
  }

  // skip to the next fugue in the current area's playlist
  next() {
    if (!this.playlist.length) return null;
    if (this.muted) { this.muted = false; if (this.master) this.master.gain.value = 0.9; }
    this._advance();
    return this.nowPlaying();
  }
  // emblem number of the currently selected fugue (for UI)
  nowPlaying() { return this.playlist.length ? this.playlist[this.pIdx] : null; }

  setArea(key) {
    if (key === this.area) return;
    this.area = key;
    this.playlist = PLAYLISTS[key] || PLAYLISTS.overworld;
    this.pIdx = 0;
    this._loadPiece();
  }

  _ensureMaster(ctx) {
    if (this.master && this.master.context === ctx) return;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    this.master.connect(ctx.destination);
  }

  _loadPiece() {
    if (!this.fugues) { this.notes = null; this.pending = true; return; }
    const f = this.fugues[String(this.playlist[this.pIdx])];
    if (!f) { this.notes = null; return; }
    this.beat = 60 / (f.bpm || 75);
    this.notes = f.notes;
    this.len = f.beats;
    this.i = 0;
    this.pending = true;           // (re)set pieceStart on next live tick
  }

  _advance() {
    this.pIdx = (this.pIdx + 1) % this.playlist.length;
    this._loadPiece();
  }

  _tick() {
    if (this.muted) return;
    const ctx = this.getCtx && this.getCtx();
    if (!ctx || ctx.state !== 'running') return;
    this._ensureMaster(ctx);
    if (!this.notes) { if (this.playlist.length) this._loadPiece(); if (!this.notes) return; }
    if (this.pending) { this.pieceStart = ctx.currentTime + 0.1; this.pending = false; this.i = 0; }

    const horizon = ctx.currentTime + LOOKAHEAD;
    while (this.i < this.notes.length) {
      const [start, dur, midi] = this.notes[this.i];
      const t = this.pieceStart + start * this.beat;
      if (t >= horizon) break;
      this._note(ctx, midiToFreq(midi), t, dur * this.beat, midi);
      this.i++;
    }
    // piece finished (all notes scheduled and its time has elapsed) -> next fugue
    if (this.i >= this.notes.length && ctx.currentTime > this.pieceStart + this.len * this.beat + 0.3) {
      this._advance();
    }
  }

  _note(ctx, freq, t, dur, midi) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    // lower (cantus firmus) voices on a rounder tone, upper voices reedier
    o.type = midi < 55 ? 'sine' : 'triangle';
    o.frequency.value = freq;
    o.connect(g); g.connect(this.master);
    const vol = midi < 55 ? 0.05 : 0.045;
    const a = 0.015, rel = Math.min(0.2, dur * 0.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.setValueAtTime(vol, t + Math.max(a, dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.03);
  }
}
