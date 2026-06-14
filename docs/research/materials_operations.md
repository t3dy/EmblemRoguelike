# Materials, operations & medicines — design notes

From Abraham *Dictionary*, Geber, Paracelsus (tria prima), Rupescissa/Bacon
(quintessence, longevity), Chemical Wedding. Aligns with the dormant
`alchemical_materials.js` (vitriol/sulphur/mercury already defined there).

## Substances (crafting reagents / consumables)
| Substance | Meaning | Game use |
|---|---|---|
| **Mercury / Argent Vive** | volatile female seed, universal solvent | base reagent → consumables; pairs with sulphur |
| **Sulphur** | fixed male seed, secret fire | upgrade reagent → makes a temp buff permanent; weapons |
| **Salt** | the fixed body / ash | stabiliser; prevents item degradation; armour |
| **Vitriol** (green lion) | corrosive; *V.I.T.R.I.O.L.* | lowers a locked-door/enemy DEF |
| **Aqua Regia** (royal water) | dissolves even gold | key-item: opens "golden" sealed doors / boss fixed armour |
| **Cinnabar / Coral** | red mercury | top-tier rubedo crafting reagent |
| **Sal Ammoniac** | volatile salt | temporary +atk (spirit "ascends") |

## Medicines / elixirs (healing & buffs — for apothecary)
| Item | Source | Effect | ~gold |
|---|---|---|---|
| **Aqua Ardens** | Rupescissa | heal 20 + cure bleed | 15 |
| **Aqua Vitae** | (have) | heal 40 + 1 cleanse | 40 |
| **Quinta Essentia** | Rupescissa | full heal + cleanse all (+reset TRIA) | 120 / craft |
| **Theriac** | Bacon (viper) | cure poison + 5-turn immunity | craft 2× viper flesh |
| **Aurum Potabile** | drinkable gold | +10 max HP (caps) + brief +DEF | 200 |
| **Gloria Inestimabilis** | Bacon | restores lowest TRIA stat to full | craft, endgame |
| **Dragon Flesh Jerky** | Bacon | removes fatigue, +XP gain; spoils in fire/sun room | craft |
| **Red Elixir / White Stone** | (have elixir) | red = revive once; white = transmute loot→gold | unique |
| **Plague Amulet** (Croll) | Paracelsian | resist poison/"astral disease" | 60 |

## Operations (verbs at furnace/altar — crafting system)
Maps to the dormant `furnace_system.js`. Core craft chain mirrors the opus:
- **Calcination** — burn item → extract Salt/Ash; cleanses status.
- **Dissolution (Solve)** — break an item back into reagents.
- **Putrefaction** — "kill" a reagent to transform it (toad→volatile).
- **Conjunction (Coagula)** — combine two reagents/items into a higher one (the core craft).
- **Sublimation** — refine/upgrade (repeat N "eagles" = N applications).
- **Fixation / Congelation** — lock a temporary enchantment permanent (uses Sulphur).
- **Multiplication / Projection** — endgame: upgrade base gear to gold-tier; ×loot.

## Implementation
- Add medicines to `ITEMS` + the apothecary shop (already supports buying items).
  Ship the simple consumables first (Aqua Ardens, Aqua Vitae have, Quinta Essentia,
  Theriac, Aurum Potabile, Plague Amulet).
- Materials/operations crafting is the larger system — align with the dormant
  `alchemical_materials.js`/`furnace_system.js` and wire a simple **bench** in town
  (Conjunction = 2-input recipe) as the first crafting step.
- `craft` becomes a quest objective kind (consume reagents at a bench).
