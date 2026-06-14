// healing_items.js — 20 healing items for treating alchemical disasters
// Each item can heal one or more specific conditions caused by disasters

export const HEALING_ITEMS = {
  // 1. Sodium Bicarbonate (Baking Soda)
  sodium_bicarbonate: {
    id: 'sodium_bicarbonate',
    name: 'Sodium Bicarbonate',
    description: 'Fine white powder; neutralizes acids and soothes burned tissues',
    heals: ['hydrochloric_acid_spill'],
    potency: 8,
    rarity: 'common',
    value: 10,
  },

  // 2. Activated Charcoal
  activated_charcoal: {
    id: 'activated_charcoal',
    name: 'Activated Charcoal',
    description: 'Porous black powder that binds toxins and poisons',
    heals: ['mercury_spill', 'chloroform_exposure'],
    potency: 10,
    rarity: 'common',
    value: 12,
  },

  // 3. Mint Extract
  mint_extract: {
    id: 'mint_extract',
    name: 'Mint Extract',
    description: 'Aromatic liquid distilled from mint; soothes respiratory irritation',
    heals: ['sulfur_fumes_leak'],
    potency: 7,
    rarity: 'common',
    value: 8,
  },

  // 4. Herbal Antidote
  herbal_antidote: {
    id: 'herbal_antidote',
    name: 'Herbal Antidote',
    description: 'Complex blend of protective herbs; guards against mercury and cinnabar',
    heals: ['cinnabar_contamination'],
    potency: 8,
    rarity: 'uncommon',
    value: 20,
  },

  // 5. Calamine Lotion
  calamine_lotion: {
    id: 'calamine_lotion',
    name: 'Calamine Lotion',
    description: 'Zinc oxide suspension; cools and soothes acidic burns',
    heals: ['acidic_residue_burn'],
    potency: 8,
    rarity: 'uncommon',
    value: 15,
  },

  // 6. Lavender Extract
  lavender_extract: {
    id: 'lavender_extract',
    name: 'Lavender Extract',
    description: 'Purple-hued essence; calms nerves and speeds healing of severe wounds',
    heals: ['explosive_reaction'],
    potency: 11,
    rarity: 'uncommon',
    value: 18,
  },

  // 7. Vitamin C Supplement
  vitamin_c_supplement: {
    id: 'vitamin_c_supplement',
    name: 'Vitamin C Supplement',
    description: 'Crystalline acid from citrus; strengthens immune function against vapors',
    heals: ['formaldehyde_exposure'],
    potency: 7,
    rarity: 'common',
    value: 12,
  },

  // 8. Aloe Vera Gel
  aloe_vera_gel: {
    id: 'aloe_vera_gel',
    name: 'Aloe Vera Gel',
    description: 'Translucent jelly from desert plant; heals burns and accelerates recovery',
    heals: ['acetone_fire'],
    potency: 9,
    rarity: 'uncommon',
    value: 14,
  },

  // 9. Healing Ointment
  healing_ointment: {
    id: 'healing_ointment',
    name: 'Healing Ointment',
    description: 'Thick paste of herbs and oils; promotes tissue repair and reduces pain',
    heals: ['oxidizing_agent_mishap'],
    potency: 9,
    rarity: 'uncommon',
    value: 16,
  },

  // 10. Healing Salve
  healing_salve: {
    id: 'healing_salve',
    name: 'Healing Salve',
    description: 'Potent herbal balm; mends corrosive burns and deep wounds',
    heals: ['nitric_acid_blast', 'sodium_hydroxide_burn'],
    potency: 11,
    rarity: 'uncommon',
    value: 22,
  },

  // 11. Respiratory Potion
  respiratory_potion: {
    id: 'respiratory_potion',
    name: 'Respiratory Potion',
    description: 'Liquid elixir; clears lungs and restores breathing after gas exposure',
    heals: ['chlorine_gas_leak'],
    potency: 8,
    rarity: 'uncommon',
    value: 18,
  },

  // 12. Healing Balm
  healing_balm: {
    id: 'healing_balm',
    name: 'Healing Balm',
    description: 'Soothing cream infused with wax and essential oils; prevents infection and pain',
    heals: ['phosphorus_fire'],
    potency: 10,
    rarity: 'uncommon',
    value: 19,
  },

  // 13. Chelating Agent
  chelating_agent: {
    id: 'chelating_agent',
    name: 'Chelating Agent',
    description: 'Complex chemical that binds heavy metals like mercury for safe elimination',
    heals: ['mercuric_chloride_poisoning'],
    potency: 13,
    rarity: 'rare',
    value: 35,
  },

  // 14. Burn Relief Gel
  burn_relief_gel: {
    id: 'burn_relief_gel',
    name: 'Burn Relief Gel',
    description: 'Cool, translucent gel; rapidly heals severe burns from explosions',
    heals: ['crucible_explosion', 'potassium_reaction'],
    potency: 12,
    rarity: 'rare',
    value: 28,
  },

  // 15. Antidote Potion
  antidote_potion: {
    id: 'antidote_potion',
    name: 'Antidote Potion',
    description: 'Powerful elixir with mystical properties; cures mercury poisoning and toxins',
    heals: ['dimethylmercury_spill'],
    potency: 12,
    rarity: 'rare',
    value: 32,
  },

  // 16. Restorative Tea
  restorative_tea: {
    id: 'restorative_tea',
    name: 'Restorative Tea',
    description: 'Warm herbal brew; purges arsenic and other heavy metal contaminants',
    heals: ['arsenic_contamination'],
    potency: 9,
    rarity: 'uncommon',
    value: 15,
  },

  // 17. Detox Potion
  detox_potion: {
    id: 'detox_potion',
    name: 'Detox Potion',
    description: 'Bitter alchemical mixture; removes accumulated toxins and lead poisoning',
    heals: ['lead_poisoning'],
    potency: 10,
    rarity: 'uncommon',
    value: 20,
  },

  // 18. Oxygen Therapy
  oxygen_therapy: {
    id: 'oxygen_therapy',
    name: 'Oxygen Therapy',
    description: 'Alchemical technique using enriched air; restores consciousness and respiration',
    heals: ['chloroform_exposure'],
    potency: 9,
    rarity: 'uncommon',
    value: 17,
  },

  // 19. Universal Antidote
  universal_antidote: {
    id: 'universal_antidote',
    name: 'Universal Antidote',
    description: 'Legendary formula; effective against most poisons and disasters',
    heals: ['mercury_spill', 'sulfur_fumes_leak', 'chlorine_gas_leak', 'arsenic_contamination'],
    potency: 15,
    rarity: 'rare',
    value: 50,
  },

  // 20. Philosopher\'s Tincture
  philosophers_tincture: {
    id: 'philosophers_tincture',
    name: "Philosopher's Tincture",
    description: 'Golden liquid of legendary potency; heals any alchemical malady',
    heals: ['hydrochloric_acid_spill', 'crucible_explosion', 'mercury_spill', 'sulfur_fumes_leak',
            'cinnabar_contamination', 'acidic_residue_burn', 'explosive_reaction', 'formaldehyde_exposure',
            'acetone_fire', 'oxidizing_agent_mishap', 'nitric_acid_blast', 'chlorine_gas_leak',
            'phosphorus_fire', 'mercuric_chloride_poisoning', 'potassium_reaction', 'dimethylmercury_spill',
            'arsenic_contamination', 'sodium_hydroxide_burn', 'lead_poisoning', 'chloroform_exposure'],
    potency: 20,
    rarity: 'legendary',
    value: 100,
  },
};

/**
 * Retrieves a healing item by ID
 * @param {string} itemId - The item ID
 * @returns {Object|null} The healing item object or null if not found
 */
export function getHealingItemById(itemId) {
  return HEALING_ITEMS[itemId] || null;
}

/**
 * Retrieves all healing items
 * @returns {Array} Array of all healing item objects
 */
export function getAllHealingItems() {
  return Object.values(HEALING_ITEMS);
}

/**
 * Gets all healing items that can cure a specific disaster
 * @param {string} disasterId - The disaster ID (e.g., 'mercury_spill')
 * @returns {Array} Array of healing items that cure this disaster
 */
export function getItemsForDisaster(disasterId) {
  return getAllHealingItems().filter(item => item.heals.includes(disasterId));
}

/**
 * Gets healing items by rarity
 * @param {string} rarity - Rarity level ('common', 'uncommon', 'rare', 'legendary')
 * @returns {Array} Array of items matching that rarity
 */
export function getItemsByRarity(rarity) {
  return getAllHealingItems().filter(item => item.rarity === rarity);
}

/**
 * Gets healing items by potency threshold (>=)
 * @param {number} minPotency - Minimum potency value
 * @returns {Array} Array of items with potency >= minPotency
 */
export function getItemsByMinPotency(minPotency) {
  return getAllHealingItems().filter(item => item.potency >= minPotency);
}

/**
 * Gets the most potent item that can heal a specific disaster
 * @param {string} disasterId - The disaster ID
 * @returns {Object|null} The most potent healing item for this disaster, or null
 */
export function getBestItemForDisaster(disasterId) {
  const items = getItemsForDisaster(disasterId);
  return items.length > 0 ? items.reduce((best, item) =>
    item.potency > best.potency ? item : best
  ) : null;
}

/**
 * Calculates effectiveness of a healing item against a disaster
 * Takes into account the item's potency and the disaster's severity
 * @param {string} itemId - The healing item ID
 * @param {Object} disaster - The disaster object
 * @returns {number} Effectiveness score (0-100)
 */
export function calculateHealingEffectiveness(itemId, disaster) {
  const item = getHealingItemById(itemId);
  if (!item || !item.heals.includes(disaster.id)) return 0;

  // Effectiveness is based on item potency and how well-matched it is
  const potencyMatch = (item.potency / 20) * 100; // Normalize to 0-100
  const perfectMatch = item.heals.length === 1 ? 1.2 : 1.0; // Boost for specialized items

  return Math.min(100, potencyMatch * perfectMatch);
}

/**
 * Gets all items that can heal a condition/damage type
 * @param {string} workerState - Worker state ('healthy', 'sickened', 'injured', 'critical')
 * @returns {Array} Array of items that can help with this state
 */
export function getItemsForWorkerState(workerState) {
  // This is a convenience function; in full implementation,
  // would track which disasters cause which states and map to items
  const stateMapping = {
    healthy: [],
    sickened: ['mint_extract', 'herbal_antidote', 'vitamin_c_supplement', 'respiratory_potion'],
    injured: ['aloe_vera_gel', 'healing_ointment', 'healing_salve', 'healing_balm'],
    critical: ['burn_relief_gel', 'chelating_agent', 'antidote_potion'],
  };

  return (stateMapping[workerState] || [])
    .map(itemId => getHealingItemById(itemId))
    .filter(item => item !== null);
}
