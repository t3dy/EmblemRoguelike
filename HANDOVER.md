# HANDOVER — Emblem Knight & the Alchemical Dragon

Paste-ready context for continuing this project in a **new Claude Code window
opened in `C:\Dev\EmblemRoguelike`**. (A new session started in this folder
won't remember the old chat — this file is the bridge.)

---

## 1. What this is

A **Dragon Warrior–style RPG + roguelike** whose entire art and music are drawn
from Michael Maier's alchemical emblem book *Atalanta Fugiens* (1617). Built with
plain HTML5 canvas + vanilla JavaScript (ES modules), no frameworks, no build step.

- **Live (playable now):** https://t3dy.github.io/EmblemRoguelike/
- **GitHub repo:** https://github.com/t3dy/EmblemRoguelike
- **This folder** (`C:\Dev\EmblemRoguelike`) is the game's home and is a git clone
  of that repo (`origin` already set; `git push` works).

The art/music originate in a **separate** project, `C:\Dev\EmblemPrintShop` (an
emblem-extraction pipeline). The game does **not** need EmblemPrintShop to run —
all finished sprites and music note-data are copied into this repo. EmblemPrintShop
is only needed to *regenerate* assets (see §6).

> Note: a copy of the game also still exists at `C:\Dev\EmblemPrintShop\game\`
> (kept by user request). **Always edit the copy here in `EmblemRoguelike`** — the
> other one is not linked to GitHub and edits there go nowhere.

---

## 2. Run it locally

```
cd C:\Dev\EmblemRoguelike
python tools/serve_nocache.py        # serves this folder on http://localhost:7431/
```
Then open http://localhost:7431/. `tools/serve_nocache.py` sends no-cache headers
so edits show on reload (a plain `python -m http.server 7431` also works but the
browser may cache old JS — see §7).

**Controls:** arrows/WASD move · Z confirm · X cancel/save/back · M music on/off.

---

## 3. Current status — everything below is DONE and verified

- 35 emblem sprites (hero/classes, monsters, NPCs, structures, terrain, title Sol).
- Isometric overworld hub: Sun-Castle (King), Queen's bower, Town (rest), wild
  encounters, eastern stair into the dungeon. West→east difficulty gradient.
- Dragon-Warrior battle screen: monster on a parchment "bestiary card", FIGHT/
  SPELL/ITEM/RUN, crits, enemy fire-breath, EXP/gold/level-ups.
- **Roguelike "Opus":** procedural floors (rooms+corridors), fog of war, turn-based
  movement, enemies that wander/chase → battle, floor loot, stairs down. 12 floors
  themed as the four colour stages of the Great Work (Nigredo→Albedo→Citrinitas→
  Rubedo) with depth-scaled enemies. **Permadeath** (death wipes save; title tracks
  deepest descent). Dragon boss on floor 12 → Philosopher's Stone victory.
- 4 playable classes (Knight, Alchemist, Atalanta, Hippomenes), each a human emblem
  figure with stat mods + a passive, chosen on a character-select screen.
- Quest system: King (Sol) & Queen (Luna) give random "charges" quoting real
  *Atalanta Fugiens* mottoes + an emblem-poem couplet; objectives (slay/collect/
  gold/reach) pay gold/items/EXP/maxHP. Also a 4-step **Great Work questline**
  (one per stage) that grants the Crown (+5 atk/+4 def) and points you at the Dragon.
- **Music = Maier's actual 50 fugues** (1617), three voices each (Atalanta/
  Hippomenes/Pomum), played by area and cycling. See §6 for provenance.

---

## 4. File map

```
EmblemRoguelike/
  index.html              loads the game (script: js/main.js?v=2)
  css/style.css
  js/
    main.js     state machine, input, game loop, save, permadeath, char-select,
                quests, audio SFX, title/end screens   (imports music.js?v=2)
    data.js     ALL content data: MAP, MONSTERS, CLASSES, STAGES, QUESTS/OPUS_LINE,
                REGION_POOLS, SPELLS, ITEMS, level curve   <-- edit gameplay here
    world.js    isometric overworld renderer + movement
    dungeon.js  procedural roguelike descent (gen, fog of war, turns, loot, givers)
    battle.js   Dragon-Warrior battle (depth-scaled enemies)
    ui.js       windows, parchment cards, menus, typewriter message box
    assets.js   sprite manifest + image loader
    music.js    plays assets/fugues.json by area (PLAYLISTS map emblems->areas)
  assets/
    manifest.json     sprite list (name, file, label, kind)
    fugues.json       50 Maier fugues as {bpm, beats, notes:[[startBeat,dur,midi]]}
    sprites/*.png     the emblem artwork as game sprites
  tools/
    build_assets.py   regenerates sprites  (needs EmblemPrintShop sources — §6)
    build_fugues.py   regenerates fugues.json from MIDI (§6)
    serve_nocache.py  the local dev server
  README.md           full technical design doc (deeper than this file)
  GETTING_STARTED.md  plain-English quick start for a newcomer
```

Most gameplay tweaks happen in **`js/data.js`** (it's all data tables). The music
area→emblem mapping is the `PLAYLISTS` object at the top of **`js/music.js`**.

---

## 5. Architecture in one paragraph

`main.js` holds a `Game` object with a `state` string (`title`, `charselect`,
`overworld`, `dungeon`, `battle`, `quest`, `dialog`, `gameover`, `victory`). The
loop calls `game.update(dt)` then `game.render()`; each state delegates to `world`,
`dungeon`, or `battle`. Input is mapped to logical actions in `_press()`. Hero state
(stats, inventory, quests, depth) is one plain object saved to `localStorage`
(`emblem_knight_save_v1`; high score in `emblem_knight_score_v1`). `window.__game`
is exposed for debugging.

---

## 6. Asset & music provenance / regeneration

**Sprites** were extracted in EmblemPrintShop and processed by `tools/build_assets.py`
(crop → remove engraving-paper background → resize → light posterize). The `MANIFEST`
in that script lists each sprite's source path under `C:\Dev\EmblemPrintShop\...`.
To regenerate you must run it from a checkout that can see those source files
(currently it `os.chdir`'s to the EmblemPrintShop root). Dragons are hand-cropped
from Atalanta Fugiens plates (emblem-25/14/50); lions are mislabeled `dog` in the
extraction catalog (GroundingDINO had no "lion" class).

**Music** is Maier's public-domain 1617 fugues. `tools/build_fugues.py` parsed a
MIDI sequencing of all 50 (RIFF-wrapped `.mid` files; strip to `MThd`, parse with
`mido`, keep every note → preserves all three voices) into `assets/fugues.json`.
The authoritative MEI transcription of Fugue 1 (Brown University's *Furnace & Fugue*,
GitHub `Brown-University-Library/furnace-and-fugue-music`) confirmed the three-voice
structure. The raw MIDIs are **not** in this repo (they were in EmblemPrintShop's
`game/_curation/midi/`); re-fetch from classicalmidi.co.uk/maier.htm if regenerating.

`PLAYLISTS` in `music.js` maps each area to a list of emblem numbers chosen by their
*Atalanta Fugiens* colour-stage (Nigredo/Albedo/Citrinitas/Rubedo) and theme.

---

## 7. Gotchas a new session should know

- **Preview is localhost-only.** Claude's built-in preview pane only loads
  `localhost` URLs. Trying to open `https://t3dy.github.io/...` in it gives
  *"Link to t3dy.github.io was blocked. Preview only supports localhost URLs."*
  That's expected — open the live site in a normal browser; use the preview only
  for `http://localhost:7431/`.
- **ES module caching.** The browser caches `js/*.js` aggressively. `serve_nocache.py`
  fixes this; if you ever still see stale code, bump the version query on the entry
  (`index.html` → `js/main.js?v=3`, and the matching `import ... './music.js?v=3'`
  in main.js) or hard-refresh (Ctrl+Shift+R).
- **Headless verification.** When Claude drives the game without a visible browser,
  `requestAnimationFrame` is throttled, so screenshots can come up blank. The
  reliable pattern is to drive `window.__game` via preview eval and read
  `canvas.toDataURL()` for frames (see how earlier work verified states).
- **Audio needs a user gesture.** Music starts on the first key press (browser
  autoplay rule). **M** toggles it; `window.__game.music.stop()` silences it.
- **Two local copies** exist (here + EmblemPrintShop/game). Edit here only.

---

## 8. Deploy / publish workflow

This repo auto-deploys via **GitHub Pages** (Settings → Pages: branch `main`, `/`
root; already enabled). After editing:
```
git add -A
git commit -m "what changed"
git push
```
The live site rebuilds ~1 minute later. (Authenticated as GitHub user `t3dy` via the
`gh` CLI credential helper, so push needs no extra login.)

---

## 9. Suggested next steps (ideas, not committed)

- **Stage-guardian mini-bosses** ending each colour stage (e.g. the Green Lion
  guarding Citrinitas, the King & Queen's coniunctio before Rubedo).
- **A town shop** to spend gold between runs (the economy currently has no sink).
- **Tune Nigredo contrast** — its palette is intentionally very dark; may read as
  murky on some screens.
- **More fugue coverage** — currently a curated subset of emblems per area; could
  map all 50 or play the matching emblem's fugue during its themed floor.
- **A bestiary / codex** screen showing each defeated emblem-creature with its
  source plate and motto (ties the game back to the scholarship).
- **Mobile polish** — on-screen controls exist; could refine layout.

---

## 10. Quick orientation prompt for the new window

> This is Emblem Knight, an Atalanta-Fugiens-themed Dragon-Warrior roguelike
> (vanilla JS canvas, ES modules). Read HANDOVER.md and README.md. Gameplay data is
> in js/data.js; music mapping in js/music.js. Run locally with
> `python tools/serve_nocache.py` → http://localhost:7431/. Live on GitHub Pages.
> I want to work on: <your next task>.
