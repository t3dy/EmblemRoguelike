# Quests & questlines — design notes

From Chemical Wedding (7 days), Twelve Keys, Lambspring, Mutus Liber, Atalanta
Fugiens, Nummedal (contracts/fraud), Rosicrucian *Fama*. Objective kinds map to
our engine: **slay / collect / reach / gold** (+ proposed **craft / escort**).

## A. The Seven-Day Wedding — main story arc (Chemical Wedding)
7-step chained questline, giver **The Winged Herald**:
1. *The Invitation* (reach) — survive the tempest, open the sealed letter, reach the crossroads.
2. *The Four Ways* (reach) — choose a road (short/deadly, long/safe, royal/rare, fourth/incorruptible); sets `chosenPath` perk.
3. *The Three Gates* (collect) — give a token at each gate; pass the chained Lion.
4. *The Weighing of Souls* (survive trial) — the Golden Scales vs seven virtue-weights; free one captive.
5. *The Royal Murders* (slay→escort) — the beheading; collect the royal blood/ash; ship the coffins.
6. *The Tower of Olympus* (craft) — 7 storeys, one operation each, brew the Homunculi (reborn King & Queen allies).
7. *Knight of the Golden Stone* (reach) — swear the Order; unlock endgame class + NG+ "service" side-quests.

## B. The Twelve Keys — dungeon-descent questline (Basil Valentine)
12 sequential operations = 12 floors; giver **Brother Basil** grants one Key (the floor's exit key) per floor boss cleared. See [locations.md](locations.md) floor table. Pattern per floor: complete the operation (`collect`/`craft` the product) → forge `Key_N` → `reach` stairs. Core motif chain = the difficulty curve: **purify → dissolve → putrefy → wash → conjoin → fix → multiply**.

## C. The Alchemist's Contract — signature roguelike quest (Nummedal)
Reusable template `{patron, promisedYield, deadline, advance, reward, penalty}`:
- The Alchemist's Contract (gold) — sign for an exact yield; succeed by deadline or face the penalty clause (debt/jail/exile/execution → Trial event).
- The Great Transmutation Demonstration (reach+gold) — public projection before Rudolf at the Powder Tower at an astrologically favourable hour.
- Match the Pole (gold) — reproduce Sendivogius's irreproducible transmutation (the marble-plaque bounty).
- Betrüger on Trial (survive) — accused of breach; gather exculpatory evidence or flee before the gallows.

## D. Fraud & legitimacy (Maier/Khunrath)
- Swarm of Drones (slay/expose) — unmask a pseudo-chymicus using fraud-detection (Maier's *Examen fucorum*).
- Assay the Ore (collect) — learn to tell real gold from gilded fakes (mining-town assayer).
- The Earless Forger (gold) — run a projection con with Kelley (fast gold, betrayal risk; raises Suspicion).

## E. Rosicrucian path (the *Fama*)
- Cure Them Gratis (collect: heal N sick, no payment) — earn the C.R. seal; selling cures loses rep (inverted economy).
- The Seven-Sided Vault (reach/dungeon) — open *POST ANNOS 120 PATEBO*; descend to the inner-sun vault; founder's relic.

## F. Elixir / longevity (Rupescissa/Bacon/Paracelsus)
- The Fifth Essence (collect→reach→craft) — distil Quinta Essentia at the floor-4 distillery.
- The Secret Seven (collect) — gather Bacon's 7 longevity ingredients across stages → Gloria Inestimabilis.
- Theriac for the Plague Town (slay→collect→craft→reach) — viper flesh → theriac → cure the ward.
- The Ethiopian Dragon Hunt (reach→slay) — return dragon flesh from the lava caverns (keep out of sunlight).
- Grow the Homunculus (collect→craft) — brew a homunculus ally that reveals hidden rooms.

## G. Atalanta's Race — chase/time-attack (Atalanta Fugiens, 50 emblems)
Recurring chase event: drop **Golden Apples** (collect) to slow a pursuing boss.
Ready-made room events from individual emblems: XIV ouroboros gate; XXII Woman's Work craft station; XXIV wolf-devours-king; XXVIII steam-bath cure; XXXI drowning-king rescue; XLIV Osiris dismemberment.

## H. Lambspring / Mutus Liber side-questlines (wordless → icon-only)
- Threefold Journey (Lambspring, 3 acts of 5): recognise polarities → unite them → death transcended (grants a one-revive charm).
- The Mute Work (Mutus Liber): UI-text suppressed; collect dew & the golden fish, seal the egg, multiply (×10→×1000 loot loop).

## Implementation
- Extend `QUESTS`/`OPUS_LINE` in `data.js`. Most map directly to existing objective kinds; add `craft` (consume reagents at a station) and `escort` (protect/move an NPC) as two new kinds.
- The 7-Day Wedding and 12 Keys are chained questlines (reuse the `OPUS_LINE` step pattern).
- Contract+Trial, reputation, doom-clock are the larger meta-systems (staged; see events_status.md).
- Quest generation (PCG Ch.7): per colour stage, a template pool (slay X stage-monster / collect Y stage-material / reach Z special-chamber) filled with stage-appropriate slots — grammar/rule-based.
