# New Ideas from the Exhaustive Pass — by asset type

Consolidated from the six-agent sweep (see [COVERAGE.md](COVERAGE.md)). Each entry is an
original game-design proposal with an implementation pointer. Tags:
**[quick]** wires into existing data-driven systems cheaply · **[medium]** needs a new
sub-system · **[deep]** large feature. Source cited as a pointer only.

---

## MONSTERS (target 10–20 — 22 below)

1. **Seven planetary-metal ladder** — Saturn/Lead (tank sponge), Jupiter/Tin (armour-shred onHit), Mars/Iron (high-def, fire-immune), Venus/Copper (enrages on one element), Sol/Luna (boss, only "examen" tools hurt). *(Geber)* **[quick]** add to `MONSTERS` + region/stage pools with existing `onHit`/`special` fields.
2. **The four spirits as fugitive foes** — Mercury (slow-immune, flees), Sulphur (burn), Arsenic (venom), Sal Armoniac (teleport). Escape if not killed in N turns. *(Geber)* **[quick]**.
3. **Two-Birds linked pair** — volatile (flees) + fixed (grounded); survivor revives partner unless both die same round. *(Ibn Umail; Regardie)* **[medium]** mutual-revive flag.
4. **Caput Corvi / Raven's Head** — nigredo herald; death blackens the room (triggers Nigredo state, stacking putrefaction DoT). *(Ibn Umail; Regardie)* **[quick]** monster + `onDeath` room hook.
5. **Animated cult-statue line** — black-bronze guardians, "Opening of the Mouth" lore. *(Grimes)* **[quick]** sprite + statblock.
6. **Alchemical-birth chimerae** — basilisk, cockatrice as "hermaphroditic Sol+Luna offspring"; a coniunctio boss that fuses two elemental enemies. *(Eggert; Rosarium)* **[medium]**.
7. **Gabricus & Beya devour-boss** — Beya engulfs Gabricus (absorbs an add to heal); must be "washed white then red." *(Rosarium)* **[deep]** phase boss.
8. **Elemental spirits family** — gnome (phases through walls), salamander (fire), sylph (air, evasive), nymph (water; spurned-marriage revenge boss). *(Paracelsus/Moran)* **[medium]** element-locked movement.
9. **Polyp / regrow-from-fragment** — splits when hit, each fragment a weaker copy. *(Mitchell)* **[medium]**.
10. **Suspended-animation foe** — inert until disturbed, then high burst. *(Mitchell)* **[quick]** `dormant` flag.
11. **Predatory animated flora / Vegetable Vampire** — entangle (root) status on hit. *(Darwin satire; Varo)* **[quick]**.
12. **Vengeful nymph** — appears if the player breaks a "marriage" vow boon. *(Paracelsus)* **[medium]**.
13. **The Executioner** — grows stronger the more you attack it; beatable only by the non-combat choice (hand it the golden key). *(Varo)* **[medium]** anti-DPS gimmick.
14. **Daughter-of-the-Minotaur guardian** — offers passage via dialogue, fights only if refused. *(Carrington/Varo)* **[medium]**.
15. **Antichrist 3-phase final boss** — terror (fear debuff) → bribes (corrupts your summons) → false prodigies (illusion adds). *(Adso)* **[deep]**.
16. **Bound-then-loosed devil** — sealed optional megaboss; keep sealed for a buff or break early for risk/reward. *(Lactantius)* **[deep]**.
17. **Mumia / hanged-corpse** — drops "mumia" vitality reagent at a notoriety cost. *(Paracelsus; Fludd)* **[quick]** drop table.
18. **Madness-afflicted humans** — proc one of four madness debuffs (lunatici only at night, etc.). *(Moran)* **[medium]** status set.
19. **Puffers / charlatans** — human enemies selling cursed fake elixirs. *(Jonson; Regardie)* **[quick]**.
20. **God-shortcut demon (saiṭānīl)** — late boss; defeat yields a top-tier crafting essence. *(Ibn Umail)* **[medium]**.
21. **Green Lion → Red Lion** — Green absorbs your Lumen/MP until tamed; tamed form becomes a companion. *(Regardie)* **[medium]**.
22. **Tribulation-wave factions** — each doom-clock "seal" spawns a different enemy faction table. *(Joachim)* **[deep]**.

## EQUIPMENT / VESSELS

1. **Greek fire** throwable — ignores armour type, only quenched by 3 specific consumables. *(Albertus)* **[quick]** item with `vs`-style flag.
2. **Flying-fire rocket** — two modes by component ratio (line-damage vs AoE-stun). *(Albertus)* **[quick]**.
3. **Acids as keys** — aqua fortis opens silver locks/dissolves silver armour; aqua regia opens gold. *(Moran)* **[medium]** lock types.
4. **Touchstone** — utility item: appraise/identify an enemy's stats. *(Khunrath)* **[quick]**.
5. **Bellows / scales / tongs** utility-slot gear — fire-damage buff / drop-rate buff. *(Khunrath)* **[quick]**.
6. **Lamen amulet** — planetary-school focus (amulet slot). *(Regardie)* **[medium]** new slot.
7. **Catoptric mirror** — Lumen upgrade: bounce light round corners / ricochet attack. *(Szulakowska; Dee)* **[deep]**.
8. **Powder of Projection** — rare throwable: instantly "transmute" a normal enemy into loot. *(Regardie)* **[quick]**.
9. **Weapon-salve** — heals an ally at range if you hold their blood. *(Moran/Fludd)* **[medium]**.
10. **Corpus-equale armour** — damage-immunity while elements stay perfectly balanced. *(Bacon/Allen)* **[deep]**.
11. **Three-principle reagent rolls** — every craftable rolls Sulphur(atk)/Mercury(utility)/Salt(def) values. *(Regardie)* **[medium]**.
12. **Furnaces as a tech-tree** — Calcination/Solution/Fixation/Reduction, each gating one operation. *(Geber)* **[deep]**.
13. **Tempering quench recipes** — different organic quenchants → different damage types. *(Moran)* **[quick]**.
14. **Aerial-niter restorative** — gather invisible life-salt from weather → universal heal. *(Sendivogius)* **[medium]**.
> *Shipped already this project:* Aqua Ardens, Theriac, Quinta Essentia, Aurum Potabile; Geber/Saturn-scythe/Michael's-lance/Sword-of-Sol; white-earth robe, salamander hide, peacock mantle, purple robe. The **Bookstore tomes** (Twelve Keys, Splendor Solis, De Quinta Essentia, Mutus Liber, Aurora Consurgens, Atalanta Fugiens) shipped in this UI batch as permanent-boon items.

## MATERIALS & OPERATIONS

1. **Operation-verb crafting grammar** — Grind/Calcine/Sublime/Solve/Fix/Distil/Ferment/Project; recipes = ordered verb chains; *order matters*. *(Geber; Moran)* **[deep]**.
2. **Dose slider** — every mineral has a therapeutic window; processing widens it; same item = grenade or heal. *(Moran)* **[medium]**.
3. **Doctrine of signatures ID** — unidentified reagents show an external hint (sometimes a decoy); distilling reveals the true effect. *(Crollius/Moran)* **[medium]**.
4. **Three Orders of Medicine = rarity tiers** — temporary / single-fix / full-perfection enchants. *(Geber)* **[quick]**.
5. **Quintessence upgrade currency** — distilled from any item with diminishing returns; loot sink. *(Rupescissa)* **[medium]**.
6. **Reversible "rewind the wheel"** — digest a material down a tier to recraft it purer. *(Rampling/ps-Lull)* **[medium]**.
7. **Two heat sources** — gentle dung-fire (slow, safe putrefaction) vs open flame (fast, can ruin the batch). *(Rosarium)* **[quick]**.
8. **Lunar-phase craft buff** — purer results on the waxing moon. *(Albertus)* **[quick]** tie to in-game clock.
9. **Affinity grid** — reagent-compatibility combos. *(Albertus)* **[medium]**.
10. **Dung-heap prima materia** — gross-out nigredo crafting node. *(Dalmas; Rosarium)* **[quick]**.
11. **Color = quality signal** — item tint encodes stage/rarity. *(Grimes)* **[quick]** render tint.
12. **Waste-matter recipes** — low-tier crafting from monster offal. *(Ibn Khaldūn)* **[quick]**.

## QUESTS

1. **Contract→Trial court loop** — deliver promised gold/elixir by a deadline or face trial (escape/execution branch). *(Nummedal)* **[deep]**.
2. **Lion's-blood questline** — fabricated wonder-substance with a withheld ingredient that unravels into fraud. *(Nummedal)* **[deep]**.
3. **Cure the sick metal** — restore a corrupted unique item via successive operations. *(Avicenna/Moureau)* **[medium]**.
4. **Decode the Decknamen** — master recipe split across NPCs/texts; decode riddles; final step taught only by a mentor. *(Principe; Perrone-Compagni)* **[medium]**.
5. **Expose-the-fraud** (Surly/Sceptic faction) — reproduce a "miracle" mechanically to debunk it. *(Moran; Jonson)* **[medium]**.
6. **Con mini-quests** — endless-ritual fee-drain, Fairy-Queen grift, swap-the-plate substitution, plague-cure pitch. *(Jonson)* **[deep]**.
7. **Smuggle the banned book** past a censor (alchemy-as-contraband). *(Debus; Albertus)* **[quick]** fetch+stealth flavour.
8. **Squaring-the-circle gate** — recurring boss-door requiring a charged ritual. *(Szulakowska)* **[medium]**.
9. **Bloom-the-garden-in-winter** miracle reward. *(Albertus legend)* **[quick]**.
10. **Lost-treatise hunt** — recover Sendivogius's *De sale* / *Harmonia* as quest items. *(Prinke)* **[quick]**.
11. **Latin-motto acts** — *Visita Interiora Terrae* (descend), *Festina Lente* (timed-but-careful), *Solve et Coagula*. *(poetry corpus)* **[quick]** name existing acts.
12. **Collect the four spirits** to unlock the next operation. *(Geber)* **[quick]**.

## CHARACTER CREATION

1. **TRIA PRIMA point-buy** — Sulphur/Mercury/Salt attributes. **SHIPPED** this batch as Might/Ward/Vigor/Spirit (Sulphur/Mercury/Salt framing in tooltips). *(Paracelsus; Regardie)* **[done]**.
2. **Physician class** — XP from travel + talking to commoners, not books; unlocks unbuyable recipes. *(Paracelsus/Moran)* **[medium]**.
3. **Warrior-alchemist hybrid** (Count Batthyány "Sword and the Crucible"). *(Prinke)* **[quick]** class entry.
4. **Spagyricus / Puffer rank titles** — cosmetic ladder Puffer→Adeptus by milestone. *(Regardie)* **[quick]**.
5. **Sephirotic 10-grade level names** — Malkuth→Kether as level titles; Tiphareth = adept threshold. *(Regardie)* **[quick]** rename level-ups.
6. **Background fantasies** (greed/luck/status/zeal) as starting traits — buff + matching vulnerability. *(Jonson)* **[medium]**.

## PATRONS / FIGURES

1. **Albertus Magnus assay-mentor** — gates progress behind a fire-test mini-quest. *(Partington)* **[medium]**.
2. **Wandering adept (Moritz)** — sells real cheap recipes but dies/curses you if underpaid; fund fairly → loyal crafter ally. *(Zuber)* **[medium]** ethics fork.
3. **Anna Zieglerin + Count Carl MacGuffin** — courtly patron + never-arriving "son of Paracelsus." *(Nummedal)* **[deep]**.
4. **Elchyell, Queen of the Elves** — faerie recipe-mentor via verse riddles. *(Grund)* **[quick]** NPC.
5. **Reformer-patron tracks** — Joachite "spiritual arms" (conversion) vs Savonarolan "the scourge" (purge); mutually exclusive. *(Apocalyptic Spirituality)* **[deep]**.
6. **Maria the Jewess / soror mystica** — required companion for the Greater Work. *(Ibn Umail)* **[medium]**.
7. **Planetary patron deities** — Hermes (base Lumen), Dee (mirror/ray), Khunrath (pray+work dual buff), Maier (talisman/music), Flamel (shop prices), Pico (meditation buff). *(Regardie)* **[medium]**.
8. **Client-scholar court patron** — funds you for performing transmutation "party tricks." *(Grimes/Dufault)* **[medium]**.

## LOCATIONS

1. **Khunrath's Oratory-Laboratory home base** — pray-zone (buff next craft / ward) + craft-zone (workbench), splitting your turn yields the best outcome. *(Forshaw)* **[deep]**.
2. **House of Gold prestige workshop** — rank-gated; ritual mini-game yields consecrated top-tier gear. *(Grimes)* **[medium]**.
3. **Büsīr temple dungeon** — antechamber→sanctuary gating a recipe reveal (Hermes' tablet). *(Ibn Umail)* **[medium]**.
4. **Ripley's twelve-gated castle + concentric spiral** — 12 process-gates wrapping a spiral that contracts from open "sky" arenas to puzzle-cells, boss at the elemental hub. *(Rampling)* **[deep]**.
5. **W-N-E-S seasonal traversal** — clockwise biome quadrants (earth/dark/iridescent/gold); opposites only via a "mean" room. *(Rampling)* **[medium]**.
6. **10-sphere descending tower** with an A/B/G/D cardinal-glyph door puzzle on the last level. *(Obrist)* **[medium]**.
7. **Low-life district generator** — poor/play/bawdy/mad-houses, hospitals, the lawless "liberties" where charlatan heat doesn't accrue. *(Jonson/Martin)* **[deep]** town type.
8. **Dream-biome (active imagination)** — fuse two opposed motifs to manifest the exit. *(Varo/Jung)* **[deep]**.
9. **Third-Age monastery base** — six oratories, each an NPC service; completing all six = a non-violent "harmony" victory. *(Joachim)* **[deep]**.
10. **Town types** — mining / print / court, each with special services (Powder Tower, Kunstkammer, assayer's bank). *(Debus; Nummedal)* **[medium]**.
> *Shipped this batch:* the **town** now has Bookstore + Assayer alongside Church/Inn/Apothecary/Armoury.

## EVENTS / STATUS EFFECTS

1. **Neighbour-suspicion / heat meter** — per-district; con actions raise it, exposure → stocks/gallows. *(Jonson)* **[deep]**.
2. **Seven-seals doom-clock** — telegraphed tribulation waves, one segment ahead. *(Joachim)* **[deep]**.
3. **Cosmic-week hard turn-cap** — losing the keystone "City" fast-forwards to an apocalypse gauntlet. *(Lactantius)* **[deep]**.
4. **Per-room light meter (Lumen)** — fully-lit rooms buff + suppress shadow-spawns; dark corners spawn nigredo mobs. *(Szulakowska)* **[deep]**.
5. **Madness statuses** — lunatici (night-only proc), insani, vesani (from tainted food), melancholici (cured only by aurum potabile). *(Moran)* **[medium]**.
6. **Tartar debuff** — slowly petrifies a limb (move/atk penalty), cured only by spagyric solvent. *(Debus)* **[quick]**.
7. **Three-light meditation buff** — standing still ramps Vespertina→Matutina→Meridiana (crit + reveal-all at noon). *(Pico)* **[medium]**.
8. **Solve / Coagula paired ability** — Solve dispels/dissolves barriers; Coagula fixes/creates cover or freezes. *(poetry corpus)* **[medium]**.
9. **Stardust Crown** — buff scaling with damage previously taken. *(Varo)* **[quick]**.
10. **Woven Destiny** — shared-fate link to an ally/target. *(Varo)* **[medium]**.
11. **Willful-credulity stat** on marks — easier con, harsher eventual ruin. *(Eggert)* **[medium]**.
12. **Planetary-hour timing bonus** — casting a school during its hour empowers it. *(Dee)* **[medium]**.

---

### Recommended next implementation batch (quick wins)
Planetary-metal monsters (1–2), Greek-fire/flying-fire/powder-of-projection items,
Three-Orders rarity tiers, dung-fire vs open-flame heat, Tartar debuff, Stardust-Crown
status, Latin-motto act names, Elchyell faerie mentor, warrior-alchemist & physician
classes, Sephirotic level titles. All wire into the existing `MONSTERS`/`ITEMS`/`STATUS`/
`CLASSES`/`QUESTS` data with no new sub-systems.
