# Monsters & Bosses — design notes

Compiled from research agents over: Abraham *Dictionary of Alchemical Imagery*;
Zosimos *Visions* (+ Grimes); Jung *Psychology & Alchemy*; Paracelsus *Liber de
Nymphis*; DeVun *Rupescissa*; Allen *Bacon*; Obrist. Citations are pointers.

Stats = {HP, ATK, DEF, XP, gold}. Sprite column: **have** = existing sprite to
reuse; **NEW** = needs an emblem-sourced sprite (art pass). Stage = colour stage /
region tier. Mapped to procgen Ch.3 (spawn tables per biome).

## Nigredo / early tier (blackening, putrefaction)
| Monster | Meaning | HP/ATK/DEF/XP/g | Special | Sprite |
|---|---|---|---|---|
| Black Raven (caput corvi) | nigredo death-head | 12/5/1/8/3 | onHit: **Blacken** | NEW (raven) |
| Toad (bufo) | heavy prima materia | 18/4/4/10/3 | *Swell*: +DEF each turn unhit | have `m_toad` |
| Leaden Man (Saturn) | basest poisonous metal | 28/5/6/16/6 | *Saturnine Weight*: slows player | NEW (grey figure) |
| Gnome (earth elemental) | Pygmy moving through rock | 14/6/8/5/3 | *Phase Earth*: ignores walls; tanky | NEW (miner) |
| Grey Wolf (antimony) | wolf of the metals | 18/6/2/12/5 | *Devour Metal*: −1 weapon atk for fight | have `m_wolf` |
| Drowned Host (flood) | drowned old race | 10/6/2/9/3 | pack-spawn (3–5); −ATK aura | have `m_serpent` |

## Albedo / mid tier (whitening, washing)
| Monster | Meaning | HP/ATK/DEF/XP/g | Special | Sprite |
|---|---|---|---|---|
| Undine (water elemental) | nymph, near-human | 14/6/3/8/4 | *Drown*: −ATK 1 turn | NEW (water-woman) |
| Sylph (air elemental) | elusive air-spirit | 10/7/2/8/4 | *Gust Dodge*: 30% evade | NEW (wisp) |
| White Eagle | volatile spirit rising | 22/7/2/18/8 | *Sublimation*: 30% dodge | have `m_eagle` |
| White Swan | washed albedo soul | 35/12/5/35/18 | *Sublime*: 30% dodge | have `m_swan` |
| Pelican (self-wounding) | feeds young with blood | 50/11/7/48/35 | *Vulning*: heals allies w/ own HP | NEW (pelican) |
| Agathodaimon (white serpent) | temple guardian | 30/8/3/26/12 | *Blinding Whiteness*: −accuracy | have `m_serpent` |
| Wingless Dragon | fixed sulphur | 40/9/5/34/18 | *Coil*: regen if unhit | have `m_wyrm` |
| Tyrian Viper | base of theriac | 22/11/4/18/12 | *Venom* DoT; flesh→theriac | have `m_serpent` |

## Citrinitas / late tier (yellowing, the gold dawns)
| Monster | Meaning | HP/ATK/DEF/XP/g | Special | Sprite |
|---|---|---|---|---|
| Cauda Pavonis (peacock) | iridescent transition | 45/13/6/50/26 | *Iridescence*: random element/status each turn | have `m_peacock` |
| Salamander (living fire) | unconsumed by fire | 40/16/8/55/28 | fire-immune; burn DoT; reflect | have `m_salamander` |
| Eagle of Sublimation | volatile, counted in "eagles" | 60/20/9/80/55 | *Ascend*: +ATK each turn alive | have `m_eagle` |
| Stag & Unicorn (pair) | lunar soul + solar spirit | 38/9/3 & 42/13/4 | *Conjunction*: +ATK while both live; enrage on one death | have `m_stag` / NEW unicorn |
| Antimimos (Mimic Daimon) | counterfeit spirit | 50/11/5/55/0 | *Counterfeit*: copies last-killed monster | NEW (dark double) |
| Ethiopian Dragon | Bacon's edible serpent | 50/16/9/45/35 | drops Dragon Flesh | have `m_wyrm` |
| Basilisk | gaze-king from cock's egg | 35/18/6/55/40 | *Petrify Gaze*: stun unless mirror item | NEW (crested serpent) |

## Rubedo / endgame tier (reddening, the Stone)
| Monster | Meaning | HP/ATK/DEF/XP/g | Special | Sprite |
|---|---|---|---|---|
| Green Lion (mini-boss) | vitriol swallowing the sun | 90/18/12/120/90 | *Devour the Sun*: lifesteal + steals gold | have `m_lion` |
| Red Lion | red tincture | 130/26/14/200/150 | *Tincture Roar*: AoE execute low-HP | have `m_lion` |
| Homunculus | artificial man in flask | 60/20/12/80/30 | *Mimic*: copies player's last ability | NEW (flask-man) |
| Archeus | body-invading inner-spirit | 45/24/8/90/0 | *Corrupt Complexion*: unbalance a TRIA stat | NEW (vapour) |
| Salamander Lord | Vulcanus's beast | 70/22/10/60/50 | *Forge-Heat*: adjacency fire aura | have `m_salamander` |
| Nymph Queen (Melusina) | royal undine | 40/14/8/30/25 | *Siren Pact*: charm (skip turn) | have `q_queen` |
| Rex Marinus | drowning king | 180/22/16/400/300 | *Undertow*: forced move + drown DoT | have `king`/`q_king` |

## Stage bosses (one per colour stage)
| Boss | Stage | HP/ATK/DEF/XP/g | Special | Sprite |
|---|---|---|---|---|
| Ouroboros-Dragon | Nigredo | 120/12/6/150/80 | *Eat the Tail*: heal+cleanse <50% once, then enrage | have `m_ouroboros` |
| Swan / White Queen | Albedo | 150/14/8/220/120 | *Ablution*: cleanse + 20 shield every 3 turns | have `m_swan`/`q_queen` |
| Green Lion King | Citrinitas | 180/18/9/320/200 | *Solar Eclipse*: disables player healing 2 turns, double lifesteal | have `m_lion` |
| Phoenix / Red King | Rubedo | 250/22/10/500/500 | *Resurrection*: revives once at 40% enraged | NEW (phoenix) / `q_king` |
| The Alchemical Dragon (current boss) | floor 12 | 160/36/17/240/340 | fire breath | have `m_dragon` |
| Rebis (final, hermaphrodite) | post-Rubedo | 250/30/18/1000/500 | *Solve et Coagula*: two stances (pierce / tank) | NEW (rebis) |
| Antichrist of the East (doom-clock) | secret/timed | 200/35/18/500/999 | *End of Time*: enrages as run-timer nears 0 | NEW (crowned dark) |
| The Pelican (secret) | any | 200/16/7/400/300 | *Vulning*: self-damage to summon chicks/heal | NEW (pelican) |

## Implementation
- Monsters are pure data in `data.js MONSTERS` `{id,name,hp,atk,def,xp,gold,sprite,spell?,onHit?,tier,stage}`.
- **Batch 1 (sprite-reuse, ship now):** Raven→(reuse toad temporarily or add), Green Lion, Red Lion, White Eagle, Eagle of Sublimation, Cauda Pavonis (have peacock), Wingless Dragon, Viper, Ethiopian Dragon, Salamander Lord, Nymph Queen, Rex Marinus, Drowned Host, Agathodaimon — all reuse existing sprites.
- **Recurring boss idea (Mercurius the shapeshifter):** one entity returns each stage in a new form/sprite (dragon→lion→mermaid→hermaphrodite). Cheap, thematic.
- **New-sprite art pass (batch later):** raven, leaden man, gnome, undine, sylph, pelican, basilisk, homunculus, archeus, unicorn, rebis, phoenix — source from emblem corpus.
- Specials map onto the **status-effect system** (see [events_status.md](events_status.md)).
