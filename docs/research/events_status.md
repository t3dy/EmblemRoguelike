# Status effects, room events & meta-systems — design notes

From Jung/Zosimos (colour symbolism → status), the Chemical Wedding & Twelve Keys
(room events), Nummedal/Smith (economic meta-systems). Tuned for ~30–250 HP actors.

## Status effects (colour operations) — implement in `battle.js`
A `statuses:[]` queue per combatant; `tickStatuses()` at turn start applies
dmg/heal/stat-mods and decrements `turns`. Damage reads live mods:
`dmg = max(1, atk*atkMult − def − defMod)`.

| Status | Op / stage | Effect | Turns | Source |
|---|---|---|---|---|
| **Blacken** | Nigredo (poison/curse) | −3 HP/turn, ×0.66 healing; stacks ×3 | 3 | raven, leaden man, swamp tiles |
| **Whiten** | Albedo (cleanse/heal) | +4 HP/turn, removes 1 Blacken/turn | 3 | bath/fountain, Whiten spell, swan |
| **Redden** | Rubedo (rage) | +50% ATK, −2 DEF | 4 | reddening, salamander, red king |
| **Coagulate** | fixation (petrify) | 50% skip turn, +3 DEF | 2 | basilisk gaze, leaden man |
| **Dissolve** | solve (weaken) | −40% ATK, −2 DEF | 3 | green lion, acids, the bath |
| **Sublimate** | volatilization (buff) | +30% dodge, act first | 2 | white eagle feather |
| **Venom** | viper | −2 HP/turn | 4 | viper, toad |
| **Charm/Siren** | Mercurius | skip a turn unless resisted | 1 | nymph queen, melusina |

Spells gain status riders: HEAL→adds Whiten; BLAZE/FIRE→chance Redden self or
Blacken foe. New player spell **WASH** (cleanse + Whiten), **PUTREFY** (Blacken foe).

## Room events / trials (procgen room templates) — `dungeon.js`
1. **Weighing of Virtues** — soft inventory cap; carrying too much loot/gold triggers a penalty (Chemical Wedding Day 3).
2. **The Four Ways** — 4 exits (short/deadly, long/safe, royal/rare, fourth/incorruptibles-only); fourth opens only with no "impure" items.
3. **Locked Gate + Key** — floor exit needs `Key_N`, forged from the floor's operation product (Twelve Keys).
4. **Riddle/Inscription gate** — Latin-motto door; answer or offering opens it.
5. **Bath/Fountain** — heals the pure, harms the impure; steam-bath cures Blacken.
6. **Ouroboros gate** — circular room, complete the circuit to open (timing/positioning).
7. **Seal the Egg** — timing mini-game; fail = lose brewed material.
8. **Collect the Dew / Fish the Golden Fish** — Mutus Liber resource gathering.
9. **Rescue the Drowning King** — timed escort; ignore = lose ally + reward (Atalanta XXXI).
10. **Dismemberment of Osiris** — collect scattered limbs; one piece unrecoverable (imperfect solution).
11. **Tomb** — 50/50 loot vs. undead-king ambush.
12. **Roast the Salamander** — defend a fire long enough to forge the Stone-core.

## Meta-systems (roguelike spine) — from history sources
- **The Contract** (Nummedal): `{patron, promisedYield, deadline, advance, reward, penalty}`. Failure → **Trial event** checking intent (con vs. desperation). Penalty: debt/jail/exile/execution. *The signature alchemy-roguelike mechanic.*
- **TRIA PRIMA + Equality meter** (Bacon): Mercury/Sulphur/Salt stats; a hidden Equality bonus (regen, corruption-resist) for keeping them balanced; lopsided = glass-cannon + faster doom. See [character_creation.md](character_creation.md).
- **Doom-clock** (Rupescissa): run countdown to a Saturn–Jupiter–Mars conjunction; final boss enrages as it nears 0. The descent is a race against the end of time.
- **Reputation currencies** (Smith): Court / Guild / Print / Commercial + hidden Suspicion (fraud heat) & Heresy (religious faction). Different cities/patrons read different currencies → different win/lose per run.
- **Reproducibility risk**: transmutation success is variable; a winning demo doesn't guarantee the next (great RNG hook).
- **Fraud skill tree** (Khunrath/Maier): double-bottomed crucible, false-bottom hook, fake-ruby vitriol — one skill set usable to cheat OR to detect cheats.
- **Print economy** (Eamon): publish a recipe → convert it to reputation + passive income; Frankfurt Fair = seasonal market.

## Implementation priority
1. **Status-effect engine in battle.js** (ship first — pure combat depth, no new art).
2. WASH/PUTREFY spells + status riders on existing spells.
3. Bath/fountain + tomb room events in dungeon.js.
4. Later/bigger: Contract+Trial, TRIA prima, doom-clock, reputation (these are larger system additions; stage them).
