# Equipment — weapons, armour, relics, keys, quest items

From Abraham *Dictionary* (planetary metals/symbols), Twelve Keys, Smith (artisan
tools), Chemical Wedding. Effects: weapons `+atk`, armour `+def`, plus utility.

## Weapons (extend `WEAPONS` in data.js)
| Weapon | +atk | Lore | ~gold |
|---|---|---|---|
| Sword of Geber (smoky blade) | +6 | tool of "Geber's cooks"; small miss chance | 180 |
| Beheading Axe (caput) | +7, bonus vs birds | beheads the philosophical bird | 500 |
| Lance of Michael | +9, bonus vs dragon/serpent | Michael slaying the dragon (Angel coin) | 750 |
| Scythe of Saturn | +5, onHit Blacken/putrefy DoT | the lead-planet's death-scythe | 350 |
| Sword of Sol (solar blade) | +8 | forged of the red king's gold | 600 |
| Flaming Sword | +18 | (existing top weapon) | 500 |

## Armour (extend `ARMOR`)
| Armour | +def | Lore | ~gold |
|---|---|---|---|
| White Foliated Earth Robe | +6 | purified albedo body, free of passion | 450 |
| Salamander Hide | +4, fire immunity | skin of the beast that lives in flame | 550 |
| Tortoise Shell | +9, −speed | the slow gentle heat, patient & protective | 480 |
| Peacock Mantle | +3, flat all-element resist | the rainbow tail between black & white | 520 |
| Purple Robe & Crown | +8, passive regen | royal vesture of the perfected Red King | 900 |

## Relics / utility (new equip slot or trinkets)
- **Pelican Vessel** — per-step regen while exploring (cibation).
- **Alembic Helm** — converts gold pickups into small heals (distillation).
- **Argus-Eye Lens** — reveals hidden/secret rooms (Argus's hundred eyes).
- **Mirror of the Stone** — reveals untouchable image / hidden path; also blocks Basilisk petrify.
- **Bacon's Lens** — see-in-dark (Nigredo floors).
- **Shew-Stone** (Dee) — scrying: peek next floor's boss; raises Heresy.
- **Death-Defiance Charm** (Lambspring 15) — one free revive.
- **Golden Fleece & Flying Lion badge** — +reputation, royal dialogue.

## Keys & quest items
- **The Twelve Keys** (`Key_1…Key_12`) — each unlocks its floor exit; the 12th is the vault Master Key.
- **Golden Apple** — throw to slow a pursuing boss (have item `apple`).
- **The Philosophic Egg** — craft container; must be sealed (mini-game) or contents lost.
- **The Golden Bough** — pass one lava/hellfire hazard unscathed.
- **The Invitation (sealed letter)** — pass the Royal Portal (Chemical Wedding).
- **Gate tokens S.C./S.M./S.P.N.** — bartered at the three gates.
- **Virgin's Milk (Lac Virginis)** — solvent; dissolves "fixed" barriers/locks.
- **Flos Coeli (celestial dew) / Mystical Golden Fish** — rare conjunction reagents (Mutus Liber).

## Implementation
- Weapons/armour drop straight into `WEAPONS`/`ARMOR` + the town **Armoury** shop
  (already supports buy+equip). Add `vs:` (type bonus) and `onHit:` (status) fields
  to weapons; `immunity:`/`resist:`/`speed:` to armour.
- Relics = a new optional `trinket` slot on the hero (passive effects) — small
  addition to `recomputeStats`/exploration hooks.
- Keys = inventory flags checked at dungeon exit tiles (ties to the 12-floor design).
- Ship first: the new weapons/armour (pure data + shop), then the type-bonus/onHit
  weapon fields (needs battle hooks), then the trinket slot, then keys/quest items.
