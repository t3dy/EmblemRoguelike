# Patrons & factions — design notes

From Nummedal *Alchemy & Authority in the HRE* (+ *Zieglerin*), Marshall *Magic
Circle of Rudolf II*, Churton *Golden Builders*, Smith, Eamon. **Core insight:**
patronage was *contract labour* — model each patron as a Contract issuer
(stipend, lab tier, success reward, **failure penalty**). See the Contract system
in [events_status.md](events_status.md).

## Patrons (quest-givers / faction heads)
| Patron | Court / era | Grants | Risk / personality |
|---|---|---|---|
| **Emperor Rudolf II** | Prague, r.1576–1608 | top lab (Powder Tower), huge gold, **ennoblement** (title/castle), the marble-plaque bounty | apex; reclusive, secretive, unstable; catastrophic fallout; court factions can denounce you |
| **Duke Friedrich I** | Württemberg/Stuttgart | lab+stipend, gave a village/castle to a winner | "execution court" — public gallows for failures |
| **Duke Julius & Duchess Hedwig** | Braunschweig-Wolfenbüttel | salaried post, materials; wants a dedicated recipe book | arc can end in a **trial** (the Zieglerin circle was executed) |
| **Vilém Rožmberk** | Bohemia (Třeboň) | sanctuary after exile, six private labs, patience | the "refuge patron" — fallback faction |
| **Landgrave Moritz "the Learned"** | Hessen-Kassel | pays in **recipes & legitimacy**, not raw gold | philosophical, tolerant |
| **Marx Fugger** | Augsburg | commercial loans at interest | the bank — debt risk |

## Alchemist NPCs (mentors / rivals / quest-givers)
- **John Dee** — magus, *Monas Hieroglyphica*, scryer; gives cryptic angelic quests + a shew-stone; associating raises Heresy/Suspicion (got expelled as heretic/spy).
- **Edward Kelley** — earless ex-forger, "red powder," charming con-man; companion with hidden low loyalty; high reward + betrayal risk.
- **Michael Sendivogius** — *Novum lumen chymicum*; did a real-seeming catalytic transmutation for Rudolf; others rob you for his secret ("the recipe you can't reproduce").
- **Michael Maier** — Rudolf's physician, *Atalanta Fugiens*, *Examen fucorum* (anti-fraud); legitimacy gatekeeper; gives quests to expose frauds.
- **Heinrich Khunrath** — *Treuhertzige Warnung*; his text = the literal list of cheat-techniques (use OR detect).
- **Paracelsus / Rupescissa / Roger Bacon** — see [character_creation.md] mentors: teach tria-prima crafting, quintessence distillation, the Equality mechanic.
- **Tycho Brahe / Kepler** — observatory faction; astrology timing buffs transmutation success.
- **Oswald Croll** — Prague Paracelsian apothecary; sells plague/astral-disease amulets.

## Factions (reputation, inverted economies, opposed pairs)
- **Rosicrucian Fraternity** — heal the sick *gratis* to gain rep (selling cures loses it); hidden identity (no faction tag); reward = the seven-sided vault + universal medicine. (Churton, the *Fama*: cure free, wear local dress, seal "C.R.", stay secret.)
- **Freemason precursors / "Golden Builders"** — late-game lodge; quests are degree-initiations; tiered membership gates a lodge safe-house.
- **Charlatans / "Drones" (Betrüger)** — join for fast gold + Suspicion heat, or hunt them for Maier's bounty; inversely tied to legitimacy.
- **Court religious factions (Catholic vs Protestant at Prague)** — two rep axes that gate denunciation events independent of patron favour.
- **Guilds (goldsmiths, apothecaries, assayers)** — craft-legitimacy; gate tool/medicine tiers; hostile to unlicensed alchemists.

## Implementation
- Patron/NPC = data record `{id, name, court, teaches?, contract?, faction, dialogue}` reusing the King/Queen quest-giver schema; place in towns.
- Reputation = a few numeric axes on the hero (`court/guild/print/commercial` + hidden `suspicion/heresy`); patrons/cities read different ones.
- Start small: add Rudolf II + Maier + an assayer + the Rosicrucian "cure gratis" loop as the first patrons/factions; expand later. The **Contract → Trial** loop is the headline system to build once the simpler content ships.
