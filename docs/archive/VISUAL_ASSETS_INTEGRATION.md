# Visual Assets Integration Guide

**How to Use EmblemPrintShop Extracted Elements in EmblemRoguelike**

---

## Overview

EmblemPrintShop extracts transparent PNG images of alchemical visual elements (lions, dragons, vessels, furnaces, hermaphrodites, etc.) from digitized emblem plates. These can be used directly as game assets for:

- **NPC sprites** (kings, queens, mentors, alchemists)
- **Emblem decorations** (scene backgrounds, quest markers)
- **Equipment icons** (vessels, furnaces, retorts, alembics)
- **Material icons** (vitriol droplet, mercury sphere, sulfur crystal, etc.)
- **Castle decorations** (lab equipment, heraldic symbols)

---

## Asset Location

```
C:\Dev\EmblemPrintShop\assets\extracted_all\
├── emblem-01/
│   ├── individual/              ← Individual objects
│   │   ├── lion_transparent.png
│   │   ├── sword_transparent.png
│   │   ├── castle_transparent.png
│   │   └── ...
│   ├── composites/              ← Multi-object scenes
│   │   ├── lion+sun_composite_transparent.png
│   │   ├── king+sword_composite_transparent.png
│   │   └── ...
│   ├── summary.json             ← Metadata for this emblem
│   └── {objname}_crop.jpg       ← Source crops (optional)
├── emblem-02/
│   └── ... (same structure)
└── ... (51 total emblems for Maier)
```

---

## Step 1: Pre-Download Assets

Run comprehensive extraction on Maier emblems (Claudiens corpus):

```bash
cd C:\Dev\EmblemPrintShop

# This takes ~1-2 hours for all 51 emblems (50-60 seconds each)
# Safe to interrupt and resume with --resume flag
python -m scripts.batch_extract_all claudiens --resume

# After extraction completes, rebuild catalogs
python -m scripts.build_object_catalog
python scripts/build_catalog.py
python scripts/build_emblem_catalog.py
```

Check extraction results:
```bash
# List all extracted assets
ls assets/extracted_all/emblem-01/individual/
# → lion_transparent.png, sword_transparent.png, castle_transparent.png, etc.

# View in web gallery
python prototype/serve.py  # http://localhost:8765/prototype/
# Browse elements via gallery.html
```

---

## Step 2: Decide on Asset Categories

Group extracted elements by game use:

### Category A: NPCs & Character Sprites

**Sources**: Kings, queens, hermaphrodites, human figures, saints

```
Emblem X → [King figure detected]
         → assets/extracted_all/emblem-X/individual/king_transparent.png
         → Copy to game: assets/npc/king_transparent.png
         → Use as: NPC sprite, dialogue portrait, emblem decoration

Match to game NPCs:
- Rudolf II (Emperor) → human+crown figures from Maier/Cramer
- Lady Sapientia (Wise Woman) → feminine crowned figure from Emblem XXVI
- Master Alchemist → bearded scholar figures
- Patroness (Luna/Queen) → queen+moon figures
```

### Category B: Equipment & Apparatus

**Sources**: Furnaces, retorts, alembics, vessels, crucibles, balances

```
Emblem X → [Furnace/retort detected]
         → assets/extracted_all/emblem-X/individual/furnace_transparent.png
         → Copy to game: assets/equipment/furnace_icon.png
         → Use as: UI icon, lab decoration, equipment sprite

Match to game equipment:
- Furnace → furnace/oven figures from Khunrath, Fludd
- Retort/alembic → glass vessel figures
- Crucible → small pot/bowl figures
- Scales/balance → measuring device figures
```

### Category C: Materials & Substances

**Sources**: Lions (sulfur), dragons (mercury), serpents (mercury), leaves (philosophical water)

```
Emblem X → [Red lion detected]
         → assets/extracted_all/emblem-X/individual/lion_transparent.png
         → Copy to game: assets/materials/sulfur_lion.png
         → Use as: Material inventory icon, quest marker

Material icons:
- Vitriol (green lion) → green-tinted lion figure
- Mercury (serpent/dragon/quicksilver) → dragon/serpent coiled figure
- Sulfur (red lion) → red/golden lion figure
- Philosophical Water → fountain/water vessel figure
```

### Category D: Scene Decoration

**Sources**: Trees, mountains, castles, fountains, stars, suns, moons

```
Emblem X → [Castle/mountain/tree detected]
         → assets/extracted_all/emblem-X/individual/castle_transparent.png
         → Copy to game: assets/scenes/castle_bg.png
         → Use as: Background element, location marker, emblem scene

Scene decorations:
- Castle/tower → castle locations on overworld or in emblem scenes
- Tree/mountain → landscape backgrounds
- Sun/moon → stage markers (day/night, solar/lunar operations)
- Fountain/spring → water-related locations
```

### Category E: Abstract/Symbolic

**Sources**: Ouroboros, hermaphrodite, paired figures, geometric shapes, circles

```
Emblem X → [Hermaphrodite figure detected]
         → assets/extracted_all/emblem-X/individual/hermaphrodite_transparent.png
         → Copy to game: assets/symbols/hermaphrodite.png
         → Use as: Emblem decoration, quest illustration, philosophical concept art

Symbolic uses:
- Ouroboros → circular quest icon, endless cycle UI
- Hermaphrodite → dual-path quest marker, union concept
- King+Queen → conjunction quest illustration
- Multiple copies of same object → multiplication concept
```

---

## Step 3: Organize Assets in Game Directory

```
C:\Dev\EmblemRoguelike\assets\
├── emblems/                     ← NEW: Extracted elements organized
│   ├── npcs/
│   │   ├── king_transparent.png
│   │   ├── queen_transparent.png
│   │   ├── hermaphrodite_transparent.png
│   │   └── mentor_transparent.png
│   ├── equipment/
│   │   ├── furnace_icon.png
│   │   ├── retort_icon.png
│   │   ├── alembic_icon.png
│   │   └── crucible_icon.png
│   ├── materials/
│   │   ├── vitriol_lion.png
│   │   ├── mercury_dragon.png
│   │   ├── sulfur_lion.png
│   │   ├── philosophical_water.png
│   │   └── white_stone.png
│   ├── scenes/
│   │   ├── castle_bg.png
│   │   ├── furnace_chamber.png
│   │   ├── garden_bg.png
│   │   └── tree_of_life.png
│   └── symbols/
│       ├── ouroboros.png
│       ├── conjunction_symbol.png
│       ├── stone_symbol.png
│       └── emblem_marker.png
├── npc/                         ← EXISTING: NPC sprites
│   └── ... (existing game assets)
└── ... (other game assets)
```

---

## Step 4: Reference Assets in Game Code

### In `alchemical_materials.js`

```javascript
export const MATERIALS = {
  vitriol: {
    id: 'vitriol',
    name: 'Vitriol',
    icon: 'assets/emblems/materials/vitriol_lion.png',  // ADD THIS
    // ... rest of definition
  },
  mercury: {
    id: 'mercury',
    name: 'Quicksilver',
    icon: 'assets/emblems/materials/mercury_dragon.png',  // ADD THIS
    // ...
  },
  // ... etc
};
```

### In `castle_interior.js`

```javascript
export const COURTS = {
  prague: {
    patron: {
      id: 'rudolf_ii',
      name: 'Emperor Rudolf II',
      portrait: 'assets/emblems/npcs/king_transparent.png',  // ADD THIS
      // ...
    },
  },
};
```

### In `furnace_system.js`

```javascript
export const EQUIPMENT = {
  furnace: {
    id: 'furnace',
    name: 'Alchemical Furnace',
    icon: 'assets/emblems/equipment/furnace_icon.png',  // ADD THIS
    // ...
  },
};
```

### In Game UI

```javascript
// When rendering material inventory
function renderMaterialIcon(materialId) {
  const mat = MATERIALS[materialId];
  return `<img src="${mat.icon}" alt="${mat.name}">`;
}

// When rendering NPC
function renderNPCPortrait(npcId) {
  const npc = NPCs[npcId];
  return `<img src="${npc.portrait}" alt="${npc.name}">`;
}
```

---

## Step 5: Create Asset Manifest (Optional)

Create a JSON file linking extracted elements to game uses:

```json
{
  "emblem-37": {
    "individual": {
      "lion": {
        "source_emblem": 37,
        "source_file": "assets/extracted_all/emblem-37/individual/lion_transparent.png",
        "game_use": "material_icon",
        "game_path": "assets/emblems/materials/sulfur_lion.png",
        "alchemical_valence": ["sulfur", "fixation", "sol"],
        "confidence": "auto",
        "review_status": "pending"
      },
      "sword": {
        "source_emblem": 37,
        "source_file": "assets/extracted_all/emblem-37/individual/sword_transparent.png",
        "game_use": "equipment_icon",
        "game_path": "assets/emblems/equipment/sword_icon.png",
        "confidence": "auto",
        "review_status": "approved"
      }
    },
    "composites": {
      "lion+sun": {
        "source_emblem": 37,
        "source_file": "assets/extracted_all/emblem-37/composites/lion+sun_composite_transparent.png",
        "game_use": "emblem_decoration",
        "game_path": "assets/emblems/scenes/emblem-37-hero.png",
        "confidence": "auto",
        "review_status": "pending"
      }
    }
  }
}
```

---

## Step 6: Manual Review & Quality Control

**Before using assets in production:**

1. **Open extraction review queue**:
   ```bash
   cd C:\Dev\EmblemPrintShop
   python prototype/serve.py  # http://localhost:8765/prototype/review.html
   ```

2. **Review each extracted element**:
   - ✅ Approve: "This lion is clear and well-isolated"
   - ❌ Reject: "Background leakage; re-run with different parameters"
   - 🚩 Flag: "Edge clipping on the wing; manually crop?"

3. **Export approved elements**:
   - Copy approved PNG files to game's `assets/emblems/` directory
   - Note review status in asset manifest

4. **Handle flagged elements**:
   - Manually crop if clipping minor
   - Re-extract with adjusted thresholds if major
   - Or use higher-res source image from Claudiens/IA

---

## Step 7: API Error Troubleshooting

If you see **"API Error: image couldn't be processed"** during extraction:

**Quick fixes**:
```bash
# Pre-cache models (one-time)
python -c "from transformers import AutoTokenizer, AutoModel; \
  AutoTokenizer.from_pretrained('IDEA-Research/grounding-dino-tiny'); \
  AutoModel.from_pretrained('facebook/sam-vit-base')"

# Resume extraction with --resume flag
python -m scripts.batch_extract_all claudiens --resume

# Check extraction logs
tail -f logs/batch_run.log
```

**If still failing**:
- Check internet connection (models download from HuggingFace hub)
- Try extracting one image at a time: `python -m scripts.extract_all_objects emblem-37.jpg`
- Verify `assets/extracted_all/` directory exists and is writable
- Check disk space (extraction creates temporary files)

---

## Asset Categories Quick Reference

| Category | Examples | Game Use | Source Emblems |
|----------|----------|----------|---|
| **NPCs** | King, Queen, Hermaphrodite, Mentor, Sage | Character sprites, dialogue portraits | 1, 4, 26, 30, 33, 38 |
| **Equipment** | Furnace, Retort, Alembic, Crucible, Balance | Equipment icons, lab decoration | Various (check detections) |
| **Materials** | Red Lion, Green Lion, Dragon, Serpent, Water | Material inventory icons | 6, 16, 24, 25, 29, 30 |
| **Scenes** | Castle, Tower, Tree, Mountain, Fountain, Garden | Background elements, location markers | 1, 6, 8, 9, 31, 35, 36 |
| **Symbols** | Ouroboros, Circle, Star, Sun, Moon, Crown | Quest markers, emblem decorations | Various |

---

## Recommended Workflow

1. **Extract Maier (51 emblems)**: `batch_extract_all claudiens`
2. **Review extractions**: `prototype/review.html`, approve ~80% as-is
3. **Copy assets**: Transfer approved PNGs to game's `assets/emblems/` by category
4. **Reference in code**: Update material/NPC/equipment definitions with icon paths
5. **Test in game**: Load game, verify icons display correctly
6. **Iterate**: Flag unclear extractions, re-run with adjusted thresholds, copy updated PNGs
7. **(Optional) Extract other corpora**: Repeat for Cramer, Rosarium, Khunrath for expanded asset library

---

## Future Enhancements

- **Motif genealogy**: Track same motif (lion) across multiple emblems/sources
- **Color detection**: Extract specific colors from elements for material UI
- **Animated sprites**: Composite multiple images for furnace/cycle animations
- **Asset pack**: Pre-built asset bundles for different game themes
- **AI-assisted descriptions**: Generate emblem-specific appearance descriptions for each extracted element

---

## Help & Troubleshooting

**Q: PNG transparency is cutting off edges of the object**
A: See EmblemPrintShop's `docs/VISUAL_ELEMENT_EXTRACTION_STRATEGY.md`. Run extraction with `--threshold 0.15` (lower = more generous detection) instead of default 0.25.

**Q: Extracted lion has background/hatching attached**
A: Use `--overlap-threshold 0.20` (default 0.15) to merge overlapping detections and remove thin connections.

**Q: I want to use composite images (multiple objects together)**
A: Use files in `composites/` directory, e.g. `lion+sun_composite_transparent.png`. Great for emblem title decorations.

**Q: Should I edit the extracted PNGs?**
A: Avoid if possible; instead adjust extraction parameters and re-run. But minor manual cropping is OK for clipped edges.

**Q: Can I use EmblemPrintShop elements as-is without copying?**
A: Yes, reference them directly: `assets/../EmblemPrintShop/assets/extracted_all/emblem-37/individual/lion_transparent.png`. But copying to game directory is cleaner.

---

Good luck integrating the visual elements! 🧪✨
