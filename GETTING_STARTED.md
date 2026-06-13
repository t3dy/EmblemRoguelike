# Getting started (plain-English)

This folder **is** the game *Emblem Knight — and the Alchemical Dragon*. It is its
own project, separate from `EmblemPrintShop` (which is only the "art workshop" where
the pictures and music were originally made). Everything the game needs is already
inside this folder.

## Play it online
Already live — nothing to do:
**https://t3dy.github.io/EmblemRoguelike/**

## Run it on your computer
1. Open a terminal in this folder (`C:\Dev\EmblemRoguelike`).
2. Run:  `python tools/serve_nocache.py`
3. Open your browser to:  `http://localhost:7431/`
4. Press a key to start (music begins on first key press).

Controls: arrows/WASD move · Z confirm · X cancel/save · M music on/off.

## Two places your project lives
- **This folder on your PC** — where you edit the game.
- **GitHub** (`https://github.com/t3dy/EmblemRoguelike`) — the online copy + what
  powers the live website above.

When you change files here and want them online, you "push" to GitHub:
```
git add -A
git commit -m "describe what you changed"
git push
```
The live website updates itself a minute or so after you push.

## Working with Claude here
This folder is the game's home. To have Claude work on the game, open Claude Code
**in this folder** (`C:\Dev\EmblemRoguelike`) rather than in `EmblemPrintShop`.

## Where things are
- `index.html` — the page that loads the game
- `js/` — the game code (main loop, overworld, dungeon, battle, music, etc.)
- `assets/sprites/` — the emblem artwork turned into game sprites
- `assets/fugues.json` — Michael Maier's 50 fugues as playable note data
- `tools/` — scripts that *generated* the art/music from EmblemPrintShop
  (only needed if you want to regenerate assets; the game runs without them)
- `README.md` — the full technical design document
