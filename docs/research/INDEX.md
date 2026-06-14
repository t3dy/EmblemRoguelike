# Emblem Knight — Research & Design Notes (Master Index)

Systematic mining of the alchemy scholarship/primary-source corpus at
`E:\pdf\alchemy\Markdown` (96 works, ~4,000 files) for game ideas, mapped to
procedural-generation/roguelike design categories and to our existing systems.

**Method.** Prioritized passes (richest sources first), notes taken as artifacts
per asset type. All entries are **original game-design synthesis** — mechanics,
stat blocks, structures — *inspired by* the sources; source author/work is cited
as a pointer only (no copied passages; the texts are copyrighted scholarship).

## Artifact files (this folder)

| File | Asset type | Primary sources |
|------|-----------|-----------------|
| [monsters.md](monsters.md) | Monsters & bosses + stats | Abraham *Dictionary*; Zosimos; Jung; Paracelsus (elementals); emblem creatures |
| [equipment.md](equipment.md) | Weapons, armour, relics, keys | Abraham; Twelve Keys; material culture (Smith/Findlen) |
| [materials_operations.md](materials_operations.md) | Substances, operations, medicines | Abraham; Geber; Paracelsus; Rupescissa (quintessence) |
| [quests.md](quests.md) | Quests & questlines | Chemical Wedding (7 days); Twelve Keys; Atalanta mottoes; Nummedal (contracts) |
| [character_creation.md](character_creation.md) | Classes, backgrounds, traits | Jung archetypes; historical adepts; Paracelsus |
| [patrons.md](patrons.md) | Patrons & factions | Nummedal; *Magic Circle of Rudolf II*; Churton; Eamon |
| [locations.md](locations.md) | Regions, towns, castles, dungeons | Rudolf's Prague; Khunrath's oratory-laboratory; mining/university towns; Obrist cosmos |
| [events_status.md](events_status.md) | Room events, status effects, mechanics | Jung (stage symbolism); emblem trials; Splendor Solis |

## Procgen / roguelike category map (from our design readings)

From *Procedural Content Generation in Games* (Shaker, Togelius, Nelson) and the
RTOR roguelike notes. Each game asset type maps to one or more PCG approaches:

| Game asset | PCG chapter / approach | How we use it |
|-----------|------------------------|---------------|
| Dungeons / floors | Ch.3 *Dungeons & levels* (room-and-corridor, grammar) | Procedural floors themed by colour stage |
| Overworld regions / landscape | Ch.4–5 *Landscapes & vegetation* | Region tiers (grass→badlands), terrain decor |
| Quests & story | Ch.7 *Planning → quests & story* (grammar/rule-based) | Chained questlines (Great Work), random charges |
| Rules / mechanics | Ch.6 *Rules & mechanics* | Operations, status effects, crafting recipes |
| Search-based tuning | Ch.2, 9 *Search-based methods* | Balance/stat scaling by region & depth |
| Experience-driven | Ch.10 | Difficulty curve, region gating |
| Mixed-initiative | Ch.11 | Patron charges that steer the run |

## Existing systems we build on

**Live game (data-driven, wired):** `data.js` (MONSTERS, WEAPONS, ARMOR, ITEMS,
REGION_POOLS, REGION_SCALE, STAGES, QUESTS, OPUS_LINE, CLASSES), `world.js`
(iso overworld + landmarks), `dungeon.js` (procedural Opus, 4 colour stages),
`battle.js` (turn-based), `town.js` (church/inn/apothecary/armoury).

**Designed but dormant** (parallel design, see `ALCHEMICAL_SYSTEMS_GUIDE.md`):
furnace/lab crafting (`furnace_system.js`), materials economy
(`alchemical_materials.js`), 50 emblem quests (`emblem_quests.js`), castle
interiors + patron courts (`castle_interior.js`), integration glue
(`alchemical_integration.js`). New research aligns names (vitriol/mercury/sulphur;
courts of Rudolf II / James I / Moritz of Hesse) so these can be wired in later.

## Implementation plan

Research → artifacts (this folder) → **batched, reviewable implementation** into
the live data-driven systems, category by category, each batch verified in preview
and deployed. Target: 10–20 new assets of each type.

## Source bibliography (priority tier mined first)

Abraham *Dictionary of Alchemical Imagery* · DeVun *Rupescissa* · Meagan Allen
*Roger Bacon* · Paracelsus (+ Hartmann) · Nummedal *Alchemy & Authority in the HRE*
· Marshall *Magic Circle of Rudolf II* · Churton *Golden Builders* · Eamon
*Secrets of Nature* · *Chemical Wedding of C.R.* · Skinner et al. *Splendor Solis*
· *Twelve Keys of Basil Valentine* · McLean (Mutus Liber, Lambspring, Second
Collection) · Zosimos · Obrist *Visualization in Medieval Alchemy* / *Les débuts*
· Jung *Psychology and Alchemy* · Faivre *Eternal Hermes* · Linden *Alchemy Reader*.
(Second-pass: Cambridge Histories of Science, Ambix journal, Arabic alchemy,
Forshaw *Khunrath*, Pseudo-Geber *Summa*, Ibn Umail, Findlen, P. Smith.)
