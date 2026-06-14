# Character creation — classes, backgrounds, traits — design notes

From Bacon (equality stat system), Paracelsus (tria prima, elementals), Jung
(archetypes), Nummedal/Smith (historical backgrounds + reputation).

## TRIA PRIMA stat system (Bacon's *corpus equale*)
Three principles as core stats:
- **Mercury** — spirit: magic power, MP, speed/initiative, volatility.
- **Sulphur** — soul: attack, fire affinity, passion.
- **Salt** — body: defence, max HP, fixedness, durability.

**Equality meter** (hidden): keeping all three near-balanced grants regen +
resistance to the Archeus's "corrupt complexion" + slows the doom-clock; going
lopsided gives a glass-cannon spike but speeds doom. A genuine risk/reward dial.
*Impl:* `hero.tria = {mercury, sulphur, salt}`; derive atk/def/mp from them;
`equality = 1 − (spread/total)`; apply small regen/resist when equality high.

## Classes (Jungian/elemental archetypes — gameplay-first)
| Class | Source | Traits | Passive | Kit |
|---|---|---|---|---|
| **The Adept (Artifex)** | Jung's central figure | balanced TRIA | *Projection*: +10% boss XP | 1 Whiten charge |
| **Soror Mystica** | the mystic sister | low HP, high Mercury | cleanses also remove Coagulate | knows Whiten + Dissolve |
| **Puer / Divine Child** | Jung *filius* | low DEF, high ATK & growth | *Rebirth*: revive once at 30% HP | — |
| **Saturnine Senex** | the leaden elder | high HP/DEF, slow | *Leaden Hide*: −2 all incoming dmg; resist Coagulate | heavy weapon |
| **Hermes-Magus** (unlock) | Faivre *Eternal Hermes* | utility/explorer | *Caduceus*: 10% dmg→gold; flee any non-boss; see 1 room ahead | knows Sublimate |
| **Physician-Alchemist** | Rupescissa/Paracelsus | high Mercury | reads monster "complexions" (shows weaknesses) | flask, 2× Aqua Ardens, lancet |
| **Transmuting Smith** | Paracelsus/Vulcanus | high Sulphur | fire resist; forge anywhere | hammer, sulphur, apron |
| **Franciscan Adept** | Bacon | high Salt | *Lumen*: see-in-dark | lens, skill book, staff |

(These extend our current 4 classes Knight/Alchemist/Atalanta/Hippomenes — keep
those as the simple default set; add the above as unlocks/variants.)

## Historical backgrounds (reputation-flavoured starts — Nummedal/Smith)
| Background | Traits | Start reputation / hook |
|---|---|---|
| **Court Alchemist** (Maier) | +legitimacy, can read cryptic texts | high court rep; **starts mid-contract** (a debt to repay) |
| **Wandering Puffer/Charlatan** (Kelley) | +con, +mobility, −legitimacy | high charlatan rep, hostile guilds; starts one step ahead of an angry mark |
| **Mining Assayer** (Ercker) | +metallurgy, +fraud-detection | neutral; strong in mining regions |
| **Monastic Adept** (Rupescissa) | +distillation, +healing, +piety | Rosicrucian affinity, low gold |
| **Goldsmith's Apprentice** (Smith) | +craft reliability, +appraisal | high guild rep |
| **Physician-Distiller (Paracelsian)** (Croll) | +medicine, dual medical/transmutation | mid court rep; plague-amulet recipe |

## Implementation
- Class/background = data records: starting `tria` vector, perk flags, inventory,
  and (for backgrounds) starting `rep` axes + an opening quest hook.
- Phase 1 (ship soon): keep the 4 existing classes; add TRIA prima as an *optional*
  display/under-the-hood (derive existing atk/def from it) without breaking saves.
- Phase 2: add 2–3 new selectable classes (Soror Mystica caster, Saturnine tank,
  Hermes-Magus utility) on the character-select screen — each just remaps starting
  stats/kit/passive (no special-casing needed).
