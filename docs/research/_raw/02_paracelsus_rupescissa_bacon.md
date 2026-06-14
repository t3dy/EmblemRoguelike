# Raw synthesis — Paracelsus / Rupescissa / Bacon (+ spiritual alchemy)

Source-mining agent output. Original game-design synthesis; citations are pointers
(DeVun *Rupescissa*; Allen *Roger Bacon*; Waite *Paracelsus, Liber de Nymphis*;
Szulakowska *Alchemy of Light*). To be merged into the per-category artifacts.

Two standout systems to build first:
- **TRIA PRIMA balance (Bacon's corpus equale)** — Mercury(spirit/magic), Sulphur
  (soul/attack/fire), Salt(body/defence). A hidden "Equality" meter rewards keeping
  all three balanced (regen, corruption-resistance); going lopsided = glass-cannon
  spike but speeds the doom track.
- **Apocalyptic doom-clock (Rupescissa)** — a run countdown tied to a
  Saturn–Jupiter–Mars conjunction; final boss (Antichrist of the East) enrages as
  it nears zero. The whole descent is a race against the end of time.

## Monsters
- Gnomus (earth) T1 — HP14 ATK6 DEF8 XP5 g3 — *Phase Earth* (ignores walls), slow/tanky. Sprite: squat bearded miner.
- Undine (water) T1 — HP10 ATK5 DEF3 XP6 g4 — *Drown* (−ATK 1 turn). Sprite: blue-green woman dissolving into ripples.
- Sylph (air) T1 — HP8 ATK7 DEF2 XP6 g4 — *Gust Dodge* (30% evade). Sprite: translucent grey wisp.
- Salamander (fire) T2 — HP12 ATK9 DEF4 XP9 g6 — fire-immune, melee burn DoT. (have m_salamander)
- Nymph Queen / Melusina T3 — HP40 ATK14 DEF8 XP30 g25 — *Siren Pact* (charm/skip turn unless TRIA-resist).
- Salamander Lord T4 — HP70 ATK22 DEF10 XP60 g50 — *Forge-Heat* adjacency aura.
- Basilisk T4 — HP35 ATK18 DEF6 XP55 g40 — *Petrify Gaze* (freeze unless mirror item). Sprite: crested serpent.
- Ethiopian Dragon T3 — HP50 ATK16 DEF9 XP45 g35 — drops Dragon Flesh. Sprite: red-collared serpent.
- Tyrian Viper T2 — HP22 ATK11 DEF4 XP18 g12 — *Venom* DoT; flesh → theriac.
- Homunculus T5 — HP60 ATK20 DEF12 XP80 g30 — *Mimic* (copies player's last ability). Sprite: little man in flask-aura.
- Archeus T5 — HP45 ATK24 DEF8 XP90 — *Corrupt Complexion* (unbalances a TRIA stat). Sprite: luminous vapour.
- Antichrist of the East T6 BOSS — HP200 ATK35 DEF18 XP500 g999 — *End of Time* (enrages as doom-clock nears 0).

## Equipment / materials
- Aqua Ardens: heal 20 + cure bleed. 15g.
- Aqua Vitae: heal 40 + 1 cleanse. 40g.
- Quinta Essentia: full heal + cleanse all + reset TRIA to neutral. 120g/craft.
- Theriac: cure poison + 5-turn immunity. craft 2× viper flesh.
- Aurum Potabile: +10 max HP (caps) + brief +DEF. 200g rare.
- Gloria Inestimabilis: restores lowest TRIA stat to full. craft endgame.
- Dragon Flesh Jerky: removes fatigue, +5 XP gain 10 turns; spoils in sunlit/fire room. craft.
- Stag's-Heart Bone: +2 max HP trinket. rare.
- Elixir/Philosophers' Stone: red=revive once; white=transmute loot→gold. unique.
- Tria reagents: Mercury→consumables, Sulphur→weapons/fire, Salt→armour/durability. Crafting currency from monster drops via apothecary.

## Character creation — TRIA PRIMA + classes
- Physician-Alchemist (Rupescissa): high Mercury; reads monster complexions (see weaknesses). Kit: flask, 2× aqua ardens, lancet.
- Apocalyptic Friar (Rupescissa): balanced; *Prophecy* sees doom-clock + 1 upcoming event. Kit: cross, psalter, robe.
- Franciscan Adept (Bacon): high Salt; *Lumen* see-in-dark. Kit: lens, skill book, staff.
- Transmuting Smith (Paracelsus/Vulcanus): high Sulphur; fire resist; forge anywhere. Kit: hammer, sulphur, apron.
- Spagyric Vagabond: mobile; foot-salve. Kit: staff, salve, cloak.

## Patrons / mentors (town NPCs, teaches: flag)
- John of Rupescissa — imprisoned Franciscan visionary; teaches quintessence distillation; gives doom-clock quest. Urgent, apocalyptic, kind to poor.
- Roger Bacon — teaches TRIA balance + Secret-Seven locations + Lens. Encyclopedic, secretive.
- Paracelsus — teaches tria-prima crafting + elemental weaknesses. Brash drunk-genius.
- Arnald of Vilanova (cameo) — potable-gold vendor.

## Quests (objective kinds slay/collect/reach/craft/gold)
- The Fifth Essence (Rupescissa): collect reagents → reach distillery floor → craft Quinta Essentia.
- The Secret Seven (Bacon): collect 7 longevity ingredients across stages → Gloria Inestimabilis.
- Theriac for the Plague Town: slay 5 vipers → collect flesh → craft theriac → reach sick ward.
- Ethiopian Dragon Hunt (Paracelsus): reach lava caverns → slay/tame dragon → return flesh.
- Catching the Falling Sky (Rupescissa): amass 200g → craft Aurum Potabile.
- The Doom Conjunction (meta): countdown clock → reach bottom → slay Antichrist before zero.
- Grow the Homunculus (Paracelsus): collect vessel+reagents → craft homunculus ally (reveals rooms).

## Dungeon colour stages
Nigredo(black/dark, gnomes/archeus) → Albedo(white/water, undines) → Citrinitas(yellow/air+gold, sylphs/basilisk) → Rubedo(red/fire, salamanders/Antichrist). `stageColour` enum drives tint+spawns+hazard.
