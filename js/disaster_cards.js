// disaster_cards.js — 20 real-world alchemical disaster events
// Each disaster represents a hazardous chemical/thermal incident common in early modern labs

export const DISASTERS = {
  // 1. Hydrochloric Acid Spill
  hydrochloric_acid_spill: {
    id: 'hydrochloric_acid_spill',
    name: 'Hydrochloric Acid Spill',
    description: 'Vessel ruptures, caustic vapors fill the chamber',
    trigger: {
      hazardous_materials: ['vitriol'],
      heat_range: { min: 50, max: 100 },
      furnace_durability_below: 60,
    },
    effect: {
      damage_amount: 15,
      worker_state: 'sickened',
      material_loss: 0.4,
    },
    healing: {
      item_needed: 'sodium_bicarbonate',
      potency_required: 8,
    },
  },

  // 2. Crucible Explosion
  crucible_explosion: {
    id: 'crucible_explosion',
    name: 'Crucible Explosion',
    description: 'Molten metals erupt from vessel, scattering across the lab',
    trigger: {
      hazardous_materials: ['mercury', 'sulfur'],
      heat_range: { min: 80, max: 150 },
      furnace_durability_below: 40,
    },
    effect: {
      damage_amount: 25,
      worker_state: 'critical',
      material_loss: 0.8,
    },
    healing: {
      item_needed: 'burn_relief_gel',
      potency_required: 12,
    },
  },

  // 3. Mercury Spill
  mercury_spill: {
    id: 'mercury_spill',
    name: 'Mercury Spill',
    description: 'Quicksilver escapes vessel, pooling on the floor in toxic droplets',
    trigger: {
      hazardous_materials: ['mercury'],
      heat_range: { min: 60, max: 120 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 20,
      worker_state: 'sickened',
      material_loss: 0.6,
    },
    healing: {
      item_needed: 'activated_charcoal',
      potency_required: 10,
    },
  },

  // 4. Sulfur Fumes Leak
  sulfur_fumes_leak: {
    id: 'sulfur_fumes_leak',
    name: 'Sulfur Fumes Leak',
    description: 'Noxious yellow smoke escapes; workers gasp for breath',
    trigger: {
      hazardous_materials: ['sulfur'],
      heat_range: { min: 70, max: 110 },
      furnace_durability_below: 55,
    },
    effect: {
      damage_amount: 12,
      worker_state: 'sickened',
      material_loss: 0.3,
    },
    healing: {
      item_needed: 'mint_extract',
      potency_required: 7,
    },
  },

  // 5. Cinnabar Contamination
  cinnabar_contamination: {
    id: 'cinnabar_contamination',
    name: 'Cinnabar Contamination',
    description: 'Powdered cinnabar settles in the lungs; slow poisoning begins',
    trigger: {
      hazardous_materials: ['mercury'],
      heat_range: { min: 40, max: 90 },
      furnace_durability_below: 45,
    },
    effect: {
      damage_amount: 10,
      worker_state: 'sickened',
      material_loss: 0.2,
    },
    healing: {
      item_needed: 'herbal_antidote',
      potency_required: 8,
    },
  },

  // 6. Acidic Residue Burn
  acidic_residue_burn: {
    id: 'acidic_residue_burn',
    name: 'Acidic Residue Burn',
    description: 'Splashed caustic liquid leaves burning welts on exposed skin',
    trigger: {
      hazardous_materials: ['vitriol'],
      heat_range: { min: 50, max: 95 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 14,
      worker_state: 'injured',
      material_loss: 0.25,
    },
    healing: {
      item_needed: 'calamine_lotion',
      potency_required: 8,
    },
  },

  // 7. Explosive Reaction
  explosive_reaction: {
    id: 'explosive_reaction',
    name: 'Explosive Reaction',
    description: 'Unexpected combination ignites; furnace shakes violently',
    trigger: {
      hazardous_materials: ['sulfur', 'saltpeter'],
      heat_range: { min: 75, max: 130 },
      furnace_durability_below: 45,
    },
    effect: {
      damage_amount: 22,
      worker_state: 'critical',
      material_loss: 0.7,
    },
    healing: {
      item_needed: 'lavender_extract',
      potency_required: 11,
    },
  },

  // 8. Formaldehyde Exposure
  formaldehyde_exposure: {
    id: 'formaldehyde_exposure',
    name: 'Formaldehyde Exposure',
    description: 'Pungent, choking fumes cause headaches and nausea',
    trigger: {
      hazardous_materials: ['vitriol'],
      heat_range: { min: 60, max: 100 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 11,
      worker_state: 'sickened',
      material_loss: 0.2,
    },
    healing: {
      item_needed: 'vitamin_c_supplement',
      potency_required: 7,
    },
  },

  // 9. Acetone Fire
  acetone_fire: {
    id: 'acetone_fire',
    name: 'Acetone Fire',
    description: 'Flammable liquid ignites; flames spread rapidly across work surface',
    trigger: {
      hazardous_materials: ['charcoal'],
      heat_range: { min: 85, max: 140 },
      furnace_durability_below: 40,
    },
    effect: {
      damage_amount: 18,
      worker_state: 'injured',
      material_loss: 0.5,
    },
    healing: {
      item_needed: 'aloe_vera_gel',
      potency_required: 9,
    },
  },

  // 10. Oxidizing Agent Mishap
  oxidizing_agent_mishap: {
    id: 'oxidizing_agent_mishap',
    name: 'Oxidizing Agent Mishap',
    description: 'Runaway oxidation creates intense heat; materials ignite unexpectedly',
    trigger: {
      hazardous_materials: ['sulfur', 'charcoal'],
      heat_range: { min: 80, max: 135 },
      furnace_durability_below: 45,
    },
    effect: {
      damage_amount: 16,
      worker_state: 'injured',
      material_loss: 0.45,
    },
    healing: {
      item_needed: 'healing_ointment',
      potency_required: 9,
    },
  },

  // 11. Nitric Acid Blast
  nitric_acid_blast: {
    id: 'nitric_acid_blast',
    name: 'Nitric Acid Blast',
    description: 'Corrosive liquid erupts, burning through flesh and cloth alike',
    trigger: {
      hazardous_materials: ['vitriol'],
      heat_range: { min: 70, max: 125 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 23,
      worker_state: 'critical',
      material_loss: 0.55,
    },
    healing: {
      item_needed: 'healing_salve',
      potency_required: 11,
    },
  },

  // 12. Chlorine Gas Leak
  chlorine_gas_leak: {
    id: 'chlorine_gas_leak',
    name: 'Chlorine Gas Leak',
    description: 'Greenish toxic gas spreads; eyes water and lungs burn',
    trigger: {
      hazardous_materials: ['vitriol'],
      heat_range: { min: 65, max: 110 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 13,
      worker_state: 'sickened',
      material_loss: 0.3,
    },
    healing: {
      item_needed: 'respiratory_potion',
      potency_required: 8,
    },
  },

  // 13. Phosphorus Fire
  phosphorus_fire: {
    id: 'phosphorus_fire',
    name: 'Phosphorus Fire',
    description: 'White smoke and flames; substance reignites if not fully immersed',
    trigger: {
      hazardous_materials: ['charcoal', 'sulfur'],
      heat_range: { min: 80, max: 130 },
      furnace_durability_below: 45,
    },
    effect: {
      damage_amount: 19,
      worker_state: 'injured',
      material_loss: 0.5,
    },
    healing: {
      item_needed: 'healing_balm',
      potency_required: 10,
    },
  },

  // 14. Mercuric Chloride Poisoning
  mercuric_chloride_poisoning: {
    id: 'mercuric_chloride_poisoning',
    name: 'Mercuric Chloride Poisoning',
    description: 'Toxic compound absorbed through skin; violent tremors and pain',
    trigger: {
      hazardous_materials: ['mercury'],
      heat_range: { min: 75, max: 120 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 24,
      worker_state: 'critical',
      material_loss: 0.4,
    },
    healing: {
      item_needed: 'chelating_agent',
      potency_required: 13,
    },
  },

  // 15. Potassium Reaction
  potassium_reaction: {
    id: 'potassium_reaction',
    name: 'Potassium Reaction',
    description: 'Metal oxidizes explosively in contact with moisture; violent burns result',
    trigger: {
      hazardous_materials: ['saltpeter'],
      heat_range: { min: 70, max: 115 },
      furnace_durability_below: 45,
    },
    effect: {
      damage_amount: 20,
      worker_state: 'critical',
      material_loss: 0.6,
    },
    healing: {
      item_needed: 'burn_relief_gel',
      potency_required: 11,
    },
  },

  // 16. Dimethylmercury Spill
  dimethylmercury_spill: {
    id: 'dimethylmercury_spill',
    name: 'Dimethylmercury Spill',
    description: 'Highly volatile and toxic liquid escapes; invisible exposure causes delayed harm',
    trigger: {
      hazardous_materials: ['mercury'],
      heat_range: { min: 60, max: 110 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 21,
      worker_state: 'sickened',
      material_loss: 0.65,
    },
    healing: {
      item_needed: 'antidote_potion',
      potency_required: 12,
    },
  },

  // 17. Arsenic Contamination
  arsenic_contamination: {
    id: 'arsenic_contamination',
    name: 'Arsenic Contamination',
    description: 'Odorless, tasteless poison contaminates materials and air',
    trigger: {
      hazardous_materials: ['vitriol', 'mercury'],
      heat_range: { min: 50, max: 100 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 17,
      worker_state: 'sickened',
      material_loss: 0.35,
    },
    healing: {
      item_needed: 'restorative_tea',
      potency_required: 9,
    },
  },

  // 18. Sodium Hydroxide Burn
  sodium_hydroxide_burn: {
    id: 'sodium_hydroxide_burn',
    name: 'Sodium Hydroxide Burn',
    description: 'Caustic lye eats through skin and clothing with searing pain',
    trigger: {
      hazardous_materials: ['vitriol'],
      heat_range: { min: 55, max: 105 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 18,
      worker_state: 'injured',
      material_loss: 0.4,
    },
    healing: {
      item_needed: 'healing_salve',
      potency_required: 10,
    },
  },

  // 19. Lead Poisoning
  lead_poisoning: {
    id: 'lead_poisoning',
    name: 'Lead Poisoning',
    description: 'Toxic metal accumulates in body; weakness and confusion spread slowly',
    trigger: {
      hazardous_materials: ['vitriol', 'charcoal'],
      heat_range: { min: 40, max: 95 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 12,
      worker_state: 'sickened',
      material_loss: 0.25,
    },
    healing: {
      item_needed: 'detox_potion',
      potency_required: 10,
    },
  },

  // 20. Chloroform Exposure
  chloroform_exposure: {
    id: 'chloroform_exposure',
    name: 'Chloroform Exposure',
    description: 'Anesthetic vapors cause dizziness, unconsciousness, and respiratory distress',
    trigger: {
      hazardous_materials: ['vitriol'],
      heat_range: { min: 65, max: 115 },
      furnace_durability_below: 50,
    },
    effect: {
      damage_amount: 15,
      worker_state: 'sickened',
      material_loss: 0.3,
    },
    healing: {
      item_needed: 'oxygen_therapy',
      potency_required: 9,
    },
  },
};

/**
 * Retrieves a disaster by ID
 * @param {string} disasterId - The disaster ID
 * @returns {Object|null} The disaster object or null if not found
 */
export function getDisasterById(disasterId) {
  return DISASTERS[disasterId] || null;
}

/**
 * Retrieves all disasters
 * @returns {Array} Array of all disaster objects
 */
export function getAllDisasters() {
  return Object.values(DISASTERS);
}

/**
 * Gets disasters that can be triggered by specific materials
 * @param {Array<string>} materials - Array of material IDs
 * @returns {Array} Array of disasters that list these materials as hazardous
 */
export function getDisastersForMaterials(materials) {
  return getAllDisasters().filter(disaster =>
    materials.some(mat => disaster.trigger.hazardous_materials.includes(mat))
  );
}

/**
 * Gets disasters that can be triggered at a specific temperature range
 * @param {number} temperature - Current furnace temperature
 * @returns {Array} Array of disasters whose heat ranges include this temperature
 */
export function getDisastersForTemperature(temperature) {
  return getAllDisasters().filter(disaster => {
    const { min, max } = disaster.trigger.heat_range;
    return temperature >= min && temperature <= max;
  });
}

/**
 * Gets disasters that can be triggered at a specific furnace durability
 * @param {number} durability - Current furnace durability (0-100)
 * @returns {Array} Array of disasters triggered by this durability threshold
 */
export function getDisastersForDurability(durability) {
  return getAllDisasters().filter(disaster =>
    durability < disaster.trigger.furnace_durability_below
  );
}

/**
 * Gets potential disasters for current lab conditions
 * @param {Array<string>} materials - Materials currently in furnace
 * @param {number} temperature - Current furnace temperature
 * @param {number} durability - Current furnace durability
 * @returns {Array} Array of disasters that could trigger under these conditions
 */
export function getPotentialDisasters(materials, temperature, durability) {
  const byMaterial = getDisastersForMaterials(materials);
  const byTemp = getDisastersForTemperature(temperature);
  const byDurability = getDisastersForDurability(durability);

  // Return disasters that meet ALL conditions (intersection)
  const potential = byMaterial.filter(d =>
    byTemp.some(t => t.id === d.id) && byDurability.some(dur => dur.id === d.id)
  );

  return potential;
}
