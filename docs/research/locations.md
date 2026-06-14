# Locations, towns, castles & the 12-floor dungeon — design notes

From Marshall *Magic Circle of Rudolf II*, Nummedal, Smith (city typology),
Churton (vault), Chemical Wedding / Twelve Keys / Splendor Solis (floor themes),
Obrist (vessel-as-cosmos). Procgen maps to PCG Ch.3–4.

## Overworld towns/cities (each privileges a reputation currency)
| Place | Type | Function / services | Modifier |
|---|---|---|---|
| **Prague (Rudolfine court)** | capstone hub | St Vitus (church), inn, apothecary (Croll), armoury, **Powder Tower** (top lab), **Kunstkammer** (appraise/collection quests), observatory (astrology buffs) | `volatility:high` (audits, denunciations) |
| **Erzgebirge mining town** | mining | mine-shaft dungeons (ore = collect), **assayer** (verify gold / teach fraud-detection) | `+metallurgy yield` |
| **Cracow / Basel / Frankfurt** | university/print | library (skill training), **printer** (recipe→reputation+income), Frankfurt Fair (seasonal market) | `+print reputation` |
| **Nuremberg / Augsburg** | craft metropolis | best armoury/workshop; Fugger bank (loans at interest) | `+craft reliability`, Guild rep |
| **Stuttgart (Württemberg)** | execution court | big rewards; **visible gallows prop** | `failure→execution` |
| **Třeboň / Český Krumlov (Rožmberk)** | refuge | safe-haven after exile; dedicated tower lab | unlocks post-exile |
| **Monastery** | refuge | prayer/healing + hidden alchemical archive (Rupescissa distillation corpus) | Rosicrucian affinity |

### Prague sub-locations (dungeon/puzzle zones)
Powder Tower (random "patron inspection" event); Kunstkammer (appraise/steal rare
items — Dürer's Hare, a dodo, automata); Royal Gardens (herb beds, hedge **maze**,
Lions' Court menagerie, aviary); **Star Summer House (Hvězda)** — six-pointed plan,
four storeys = the four colour stages, uncanny acoustics (a ritual colour-stage
dungeon); Golden Lane (red-herring "alchemist" tourist trap); Hájek's House of the
Green Mound (hieroglyph puzzle room); Castle of Most (Kelley's prison — escape
sequence with the tower window-jump).

## Castles / set-piece dungeons
Rosicrucian **Seven-Sided Vault** (inner-sun-lit, central altar, *POST ANNOS 120
PATEBO*); the **sealed vessel/cosmos-egg** (Obrist — the whole dungeon is inside one
glass egg); the **Tower of Olympus** (7-storey alchemy climb, Chemical Wedding Day 6).

## THE OPUS — 12-floor dungeon (Twelve Keys × colour stages × Splendor Solis)
Floors data array `floors[12]` = `{stage, theme, operation, hazard, boss, roomTypes[], specialChambers[]}`. `stage` drives palette/lighting; exits gated by `Key_N`.

| Fl | Stage | Theme | Operation | Hazard | Boss / event | Special chamber |
|---|---|---|---|---|---|---|
| 1 | Nigredo | Leprous Mines | Purification | corrosive sludge taints loot | **Grey Wolf** (kill ×3) | ore veins |
| 2 | Nigredo | Forest of the Soul | Mortification | dragon poison; raven steals items | **Forest Dragon** + rescuable Knight | Three-Cedars crossroads (Four Ways) |
| 3 | Nigredo | Stinking Swamp | Putrefaction | black-bile mire (Blacken) | **Drowning King** rescue event | Tomb; steam-Bath (cures Blacken) |
| 4 | Albedo | Hall of Scales | Weighing/Ablution | weight trap-floors | **Inquisitor Virgin** (7 weights) | Golden Scales; prisoner cells |
| 5 | Albedo | Sealed Vessel | Dissolution/Distillation | flooding tide | **Swan** (death-song) + Icy Dragon & Eagle | Bath; sealed glass-egg (seal mini-game) |
| 6 | Albedo | Rose Garden | Conjunction (white) | thorn hedges; peacock-light | **Pelican** (heals via nest) | Rose Garden (white/red roses gate); Hermaphrodite shrine |
| 7 | Citrinitas | Besieged City | Sublimation | three ring-walls, one gate | **Peacock** (rotating resistance) | lamp-of-wisdom puzzle |
| 8 | Citrinitas | Field of Decay | Generation from rot | spawning vermin | **Four-Headed Element-Beast** (kill in order) | Woman's Work craft station |
| 9 | Citrinitas | Procession of Planets | Zodiac Balance | per-room planet hazard | gauntlet of **7 Planet-Lords** | Balance chamber |
| 10 | Rubedo | Empty Furnace | Fixation/Coction | rising heat timer (Redden) | **Triple-Headed Dragon** | threefold athanor |
| 11 | Rubedo | Tower of Olympus | Augmentation | 7-storey vertical climb | **Beheaded Royals** distil; Orpheus escort | alembic storeys; philosophic egg |
| 12 | Rubedo | Hall of Projection | Multiplication/Projection | mirror-doubles; Final Lock | **Red King & White Queen united** | projection altar; ×1000 loot |

## Implementation
- Add a `FLOORS` table to `data.js`; `dungeon.js` reads `FLOORS[depth]` for theme,
  palette tint, spawn pool, hazard tile type, and guaranteed `specialChambers`.
- `specialChambers` are tagged room templates (Bath, Tomb, Scales, Rose Garden,
  Athanor, Egg) the generator force-places once per applicable floor.
- Overworld towns: extend `town.js` with town "types" (services vary) and add new
  town tiles to the map (mining, print, court). Prague = a richer hub with extra
  service buttons (Powder Tower lab, Kunstkammer, observatory).
- Current live dungeon already groups 12 floors into the 4 colour stages — this
  table just names/themes each floor and adds special chambers + per-floor bosses.
