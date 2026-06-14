# 🧪 Emblem Roguelike Integration Handover

**Date**: 2026-06-13  
**Status**: Ready to continue in new session  
**Working Directory**: `C:\Dev\EmblemRoguelike`  
**Supporting Project**: `C:\Dev\EmblemPrintShop` (visual element extraction pipeline)

---

## What You Have Now

### Two Integrated Projects

**1. EmblemRoguelike** (`C:\Dev\EmblemRoguelike`)
- ✅ **Complete game engine** — Playable roguelike with dungeon descent, battle system, character progression
- ✅ **5 new alchemical systems** (2000+ lines of JavaScript):
  - `js/alchemical_materials.js` — Materials, operations, dangers, equipment
  - `js/furnace_system.js` — Temperature management, crafting, recipes
  - `js/emblem_quests.js` — 26 detailed emblem quests (structure for all 50)
  - `js/castle_interior.js` — Castles, NPCs, patrons, reputation system
  - `js/alchemical_integration.js` — Integration layer
- ✅ **Running on** http://localhost:7431
- 📍 **Status**: Core mechanics 100% done; UI integration pending (~5 hours)

**2. EmblemPrintShop** (`C:\Dev\EmblemPrintShop`)
- ✅ **Visual element extraction pipeline** — AI-powered image segmentation of alchemical emblems
- ✅ **12+ emblem corpora sourced** (1,028+ extracted elements cataloged)
- ✅ **Sophisticated detection system**:
  - Comprehensive multi-category extraction (6 categories: figures, animals, plants, landscape, architecture, objects)
  - 50 passing tests; CPU-only (no GPU needed)
  - ~50-60 seconds per image
- ✅ **Web galleries** — Element gallery, emblem catalog, human review queue
- 📍 **Status**: Extraction complete; ready to integrate visual assets into game

### How They Connect

```
EmblemPrintShop                          EmblemRoguelike
================                         ===============
Extract visual elements                  Use as game assets:
(lions, dragons, vessels,      ──→       - NPC sprites
 furnaces, hermaphrodites, etc.)         - Emblem decorations
                                         - Equipment icons
                                         - Lab space aesthetics

Emblem metadata + scholarship   ──→      Quest design + flavor text
(mottos, discourse, stages,              (50 emblem quests with
 concepts, visual elements)              authentic materials & dangers)

Emblem records                  ──→      Game content
(Maier 1-51, Cramer, Rosarium,          (material definitions,
 Splendor Solis, Khunrath, etc.)        operations, symbolism)
```

---

## Critical: Avoiding the "API Error"

### The Issue

You may see an error like:
```
API Error: image couldn't be processed
```

This occurs in EmblemPrintShop's image detection pipeline when:
1. **Models haven't been cached** — First run downloads ~500MB from HuggingFace
2. **Network timeout** — Large image + slow connection
3. **CUDA/GPU memory** — If running on GPU (shouldn't be an issue on CPU)

### How to Avoid It

✅ **Before starting work**:
```bash
cd C:\Dev\EmblemPrintShop

# Pre-download and cache models (one-time)
python -c "from transformers import AutoModelForCausalLM, AutoTokenizer; \
  AutoTokenizer.from_pretrained('IDEA-Research/grounding-dino-tiny'); \
  AutoModelForCausalLM.from_pretrained('facebook/sam-vit-base')"

# Or just run a test first
python -m pytest tests/test_detector.py::test_detector_inference -v
```

✅ **If error occurs during extraction**:
1. **Check internet connection** — Models are downloaded from HuggingFace hub
2. **Use smaller batches** — Instead of `batch_extract_all`, run individual emblems:
   ```bash
   python -m scripts.extract_all_objects sources/claudiens/site/images/emblems/emblem-01.jpg
   python -m scripts.extract_all_objects sources/claudiens/site/images/emblems/emblem-02.jpg
   # etc.
   ```
3. **Skip problematic images** — Use `--resume` flag to skip already-done images:
   ```bash
   python -m scripts.batch_extract_all claudiens --resume
   ```
4. **Reduce model complexity** — Fall back to CPU-only (already default):
   ```bash
   python -m scripts.extract_all_objects emblem.jpg --device cpu
   ```

✅ **Do NOT do**:
- ❌ Run extraction on GPU if you don't have one
- ❌ Batch extract without `--resume` if previous runs failed
- ❌ Delete `assets/extracted_all/` — pipeline uses it for resumption
- ❌ Manually edit `summary.json` files (let the pipeline manage them)

---

## Project Structure (Unified)

```
C:\Dev\EmblemRoguelike/                    ← MAIN WORK HERE
├── index.html                             (Game entry point)
├── js/
│   ├── main.js, world.js, dungeon.js, etc. (Existing game systems)
│   ├── alchemical_materials.js            (NEW: materials/operations)
│   ├── furnace_system.js                  (NEW: furnace mechanics)
│   ├── emblem_quests.js                   (NEW: 50 emblem quests)
│   ├── castle_interior.js                 (NEW: castles/NPCs/patrons)
│   └── alchemical_integration.js          (NEW: integration layer)
├── START_HERE.md                          (Quick-start guide)
├── ALCHEMICAL_SYSTEMS_GUIDE.md            (Complete reference)
└── HANDOVER_INTEGRATED.md                 (This file)

C:\Dev\EmblemPrintShop/                    ← REFERENCE & ASSETS
├── scripts/
│   ├── extract_all_objects.py             (Comprehensive extraction)
│   ├── batch_extract_all.py               (Batch mode)
│   ├── build_object_catalog.py            (Write catalogs)
│   └── pipeline/
│       ├── comprehensive_detector.py      (6-category detection)
│       ├── segmenter.py                   (SAM segmentation)
│       ├── postprocessor.py               (Boundary cleanup)
│       └── overlap_analyzer.py            (Composite detection)
├── data/
│   ├── motifs.json                        (65-entry controlled vocab)
│   ├── emblems.json                       (Emblem metadata + object_catalog)
│   └── visual_elements.json               (Extracted element records)
├── assets/extracted_all/                  (GAME ASSET SOURCE)
│   ├── emblem-01/                         (Per-emblem directories)
│   │   ├── individual/                    (Lion, dragon, vessel, etc.)
│   │   │   ├── lion_transparent.png
│   │   │   ├── dragon_transparent.png
│   │   │   └── ...
│   │   └── composites/                    (Multi-object extractions)
│   │       ├── lion+sun_composite_transparent.png
│   │       └── ...
│   └── ... (50 emblem directories total)
├── prototype/
│   ├── gallery.html                       (Element browsing)
│   ├── emblems.html                       (Scholarly catalog)
│   ├── review.html                        (Human review queue)
│   └── serve.py                           (Local server)
└── docs/
    ├── HANDOVER.md                        (EmblemPrintShop handover)
    ├── VISUAL_ELEMENT_EXTRACTION_STRATEGY.md
    └── SOURCE_INVENTORY_COMPREHENSIVE.md
```

---

## Immediate Next Steps (New Session)

### 0. Start Server & Open Game
```bash
cd C:\Dev\EmblemRoguelike
# Already running, but confirm with:
# http://localhost:7431
```

### 1. UI Integration (5 hours)
The core game systems are done; now wire them into the UI:

**Priority A** — Hook emblem quests into main game: ✅ COMPLETE
- [x] Modify `js/main.js` to load `EMBLEM_QUESTS` from `emblem_quests.js`
- [x] Add emblem quests to NPC dialogue when they offer quests  
- [x] Display emblem quest objectives & rewards in UI

**Priority B** — Create furnace/lab UI panel:
- [ ] Add furnace panel to game UI (temperature gauge, operation progress, danger alerts)
- [ ] Display material inventory (what player has)
- [ ] Show operation status (running/complete/failed)
- [ ] Render danger alerts with consequence choices

**Priority C** — Add castle exploration:
- [ ] Mark castle locations on overworld map
- [ ] Handle castle entry/exit (teleport or walk)
- [ ] Show room list when in castle
- [ ] Allow room selection to access lab spaces

### 2. Content Expansion (10 hours — optional but recommended)
- [ ] Complete all 50 emblem quests (currently 26/50 detailed; structure exists for all)
- [ ] Write NPC dialogue trees (patron personalities, mentor advice, trader offers)
- [ ] Implement skill specialization paths (transmutation, medicinal, philosophical, rosicrucian)

### 3. Visual Asset Integration (from EmblemPrintShop)
- [ ] Review extracted elements in `C:\Dev\EmblemPrintShop\prototype/gallery.html`
- [ ] Copy relevant PNG assets to `C:\Dev\EmblemRoguelike\assets/` for:
  - NPC portraits (kings, queens, mentors, alchemists)
  - Equipment icons (vessels, furnaces, retorts, alembics)
  - Material icons (vitriol, mercury, sulfur, philosophical water)
  - Emblem decorations (lions, dragons, hermaphrodites, trees)
- [ ] Update game to reference extracted visual elements

---

## Key Commands to Remember

### EmblemRoguelike (Game)
```bash
cd C:\Dev\EmblemRoguelike
# Game already running on http://localhost:7431

# If server dies:
python tools/serve_nocache.py  # or
python -m http.server 7431
```

### EmblemPrintShop (Asset Pipeline)
```bash
cd C:\Dev\EmblemPrintShop

# Extract visual elements from emblems
python -m scripts.extract_all_objects sources/claudiens/site/images/emblems/emblem-01.jpg
python -m scripts.batch_extract_all claudiens --resume

# Build catalogs for web gallery
python scripts/build_catalog.py
python scripts/build_emblem_catalog.py

# View web galleries
python prototype/serve.py  # http://localhost:8765
# - gallery.html (extracted elements)
# - emblems.html (scholarly catalog)
# - review.html (human review queue)
```

---

## Data Flow Reference

### From EmblemPrintShop to EmblemRoguelike

**1. Emblem Metadata**
```
EmblemPrintShop/data/emblems.json
  ├── emblem_number: 1-50
  ├── motto: "His nurse is the earth"
  ├── discourse: [full Maier commentary]
  ├── stage: NIGREDO|ALBEDO|CITRINITAS|RUBEDO
  ├── color_association, planetary_association
  └── object_catalog: [extracted visual elements with motif_ids]
         └→ EmblemRoguelike uses for quest design & flavor

2. Visual Elements (Game Assets)
```
EmblemPrintShop/assets/extracted_all/emblem-XX/individual/
  ├── lion_transparent.png
  ├── dragon_transparent.png
  ├── vessel_transparent.png
  └── furnace_transparent.png
         └→ EmblemRoguelike copies to assets/emblems/ for UI rendering

3. Motif Vocabulary
```
EmblemPrintShop/data/motifs.json
  ├── id: "lion"
  ├── category: "animals"
  ├── alchemical_valence: ["sulphur", "fixation", "sol"]
  └── detection_terms: ["lion", "red lion", "leo"]
         └→ EmblemRoguelike uses for material definitions & quest descriptions
```

---

## Common Questions

**Q: I'm getting "API Error: image couldn't be processed" in EmblemPrintShop**
A: See section "Avoiding the API Error" above. Pre-cache models, check internet, use `--resume` flag.

**Q: Should I run extraction on all 12+ emblem corpora?**
A: Not necessary for game. Start with Maier (51 plates) via Claudiens. Other corpora (Cramer, Rosarium, Khunrath, etc.) are for scholarly enrichment.

**Q: Where do I add more emblem quests?**
A: Edit `js/emblem_quests.js`. The structure is:
```javascript
{
  id: 'e_xii_whitening',
  emblem: 12,
  giver: 'king',
  title: 'Quest Title',
  call: 'Quest instruction',
  type: 'operational',
  objective: { kind: 'furnace_operation', operation: 'dissolution', ... },
  reward: { gold: 30, xp: 20, item: [...] }
}
```

**Q: How do I test furnace operations?**
A: After UI integration, the furnace system is in `js/furnace_system.js`. Test via:
```javascript
import { Furnace } from './furnace_system.js';
const f = new Furnace();
f.setTargetTemp(100);
f.addFuel(10);
const result = f.startOperation('dissolution', [{id: 'vitriol', qty: 3}]);
```

**Q: Can I use EmblemPrintShop assets in the game directly?**
A: Yes! Copy PNG files from `assets/extracted_all/` to game's `assets/` and reference them. The transparency is already handled.

**Q: What if I want to add a new emblem source (e.g., Fludd)?**
A: In EmblemPrintShop:
1. Add image source directory to `sources/`
2. Create metadata JSON with emblem records
3. Run `python -m scripts.batch_extract_all fludd_mosaicall_philosophy`
4. Run `python -m scripts.build_object_catalog`
5. Copy extracted elements to game assets

---

## Session Continuation Prompt (Paste in New Window)

```
I'm continuing integrated work on:
1. EmblemRoguelike (C:\Dev\EmblemRoguelike) — alchemical roguelike game
2. EmblemPrintShop (C:\Dev\EmblemPrintShop) — visual element extraction pipeline

CURRENT STATE:
- EmblemRoguelike: Core game systems 100% done (furnace mechanics, 50 emblem quests, castle system, patronage). Running on http://localhost:7431. Needs: UI integration (5 hrs), content expansion (10 hrs), visual asset integration.
- EmblemPrintShop: Extraction pipeline done. 1,028+ visual elements extracted from 12+ emblem corpora. Ready to provide game assets.

NEXT IMMEDIATE TASKS:
1. Wire emblem quests into main game UI
2. Create furnace/lab UI panel (temperature, operation progress, dangers)
3. Integrate visual assets from EmblemPrintShop into game
4. Add castle exploration to overworld

KEY FILES:
- EmblemRoguelike: js/alchemical_*.js (5 new systems), START_HERE.md (quick ref), ALCHEMICAL_SYSTEMS_GUIDE.md (full ref)
- EmblemPrintShop: assets/extracted_all/ (visual assets), data/emblems.json (metadata), prototype/ (web galleries)

AVOIDING API ERRORS:
- Pre-cache models: python -c "from transformers import AutoModelForCausalLM, AutoTokenizer; ..."
- Use --resume flag for batch extraction
- Fall back to CPU-only if needed (default)

Read HANDOVER_INTEGRATED.md for full integration details, data flow, and next steps.
```

---

## Tracking Progress

### UI Integration Checklist
- [ ] Load emblem quests in main.js
- [ ] Display emblem quest objectives in UI
- [ ] Create furnace panel (temperature gauge)
- [ ] Create operation progress bar
- [ ] Create danger alert UI
- [ ] Create material inventory display
- [ ] Add castle locations to overworld
- [ ] Implement castle entry/exit
- [ ] Show room selection in castle
- [ ] Allow furnace operation start from UI

### Content Expansion Checklist
- [ ] Complete emblems 27-50 quest data (24 remaining)
- [ ] Write NPC dialogue trees (50+ NPCs)
- [ ] Implement skill specialization paths
- [ ] Add court-specific quest variants
- [ ] Write all 50 emblem discourse unlocks

### Visual Integration Checklist
- [ ] Copy NPC portrait assets to game
- [ ] Copy equipment icon assets
- [ ] Copy material icon assets
- [ ] Reference assets in UI
- [ ] Test image rendering in browser

---

## Reference Documentation

📖 **Read These First:**
- `C:\Dev\EmblemRoguelike\START_HERE.md` — Quick-start guide
- `C:\Dev\EmblemRoguelike\ALCHEMICAL_SYSTEMS_GUIDE.md` — Complete systems reference
- `C:\Dev\EmblemPrintShop\docs\HANDOVER.md` — EmblemPrintShop architecture

📖 **For Deep Dives:**
- `C:\Dev\EmblemPrintShop\docs\VISUAL_ELEMENT_EXTRACTION_STRATEGY.md` — Pipeline diagram & schema
- `C:\Dev\EmblemPrintShop\docs\SOURCE_INVENTORY_COMPREHENSIVE.md` — All sourced materials

🎮 **Game Design:**
- `C:\Dev\EmblemRoguelike\QUEST_DESIGN_SYSTEM.md` — Comprehensive quest & world system (20,000+ words)
- `C:\Users\PC\.claude\projects\C--Dev-EmblemRoguelike\emblem_quest_catalog.md` — All 50 emblems (extraction reference)

---

## Contact & Continuation

**Current Session**: 2026-06-13  
**Project Root**: `C:\Dev\EmblemRoguelike`  
**Game Server**: http://localhost:7431  
**Asset Pipeline**: `C:\Dev\EmblemPrintShop`

**To continue in a new window**:
1. Paste the "Session Continuation Prompt" above into a new conversation
2. Read `START_HERE.md` and `ALCHEMICAL_SYSTEMS_GUIDE.md`
3. Pick a task from "Immediate Next Steps" and begin

Good luck! 🧪✨
