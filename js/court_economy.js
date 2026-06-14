// court_economy.js — court-specific economic profiles and pricing systems

/**
 * COURT_ECONOMY object defines economic characteristics for each royal court.
 * Affects material pricing, scarcity, rewards, and maintenance costs.
 */
export const COURT_ECONOMY = {
  prague: {
    id: 'prague',
    name: 'Prague — Court of Rudolf II',
    reward_multiplier: 1.0,        // quest rewards unchanged
    material_multiplier: 1.0,      // base material prices
    material_scarcity: 'moderate', // materials sometimes unavailable
    maintenance_cost: 1.0,         // furnace repair costs normal
    material_availability: {
      common: 0.80,     // 80% chance commons are in stock
      uncommon: 0.60,   // 60% for uncommons
      rare: 0.40,       // 40% for rares
      very_rare: 0.20,  // 20% for very rares
    },
    market_refresh_interval: 50,   // game ticks between market updates
    seasonal_effect: 'none',       // no seasonal variation
    notes: 'Balanced court; good access to materials'
  },

  england: {
    id: 'england',
    name: 'England — Court of James I',
    reward_multiplier: 0.8,        // quest rewards reduced (harder court)
    material_multiplier: 1.2,      // materials cost 20% more
    material_scarcity: 'extreme',  // rare material shortages
    maintenance_cost: 1.2,         // furnace repairs cost 20% more
    material_availability: {
      common: 0.70,     // lower availability
      uncommon: 0.50,   // scarcer
      rare: 0.30,
      very_rare: 0.10,
    },
    market_refresh_interval: 60,   // slower market updates
    seasonal_effect: 'severe',     // winter makes materials scarcer
    notes: 'Harsh court; material scarcity forces strategic choices'
  },

  hesse_kassel: {
    id: 'hesse_kassel',
    name: 'Hesse-Kassel — Court of Moritz',
    reward_multiplier: 0.9,        // slightly reduced rewards
    material_multiplier: 0.9,      // materials cost 10% less
    material_scarcity: 'low',      // abundant materials
    maintenance_cost: 0.8,         // furnace repairs cheaper
    material_availability: {
      common: 0.90,     // nearly always in stock
      uncommon: 0.75,   // good availability
      rare: 0.60,       // still accessible
      very_rare: 0.35,  // uncommon but available
    },
    market_refresh_interval: 40,   // faster market updates
    seasonal_effect: 'mild',       // slight seasonal variation
    notes: 'Prosperous court; abundant materials but lower rewards'
  },
};

/**
 * MATERIAL_RARITY_TIERS — maps material rarity strings to multipliers
 */
export const MATERIAL_RARITY_TIERS = {
  common: 1.0,
  uncommon: 1.5,
  rare: 2.0,
  very_rare: 3.0,
  legendary: 5.0,
};

/**
 * Calculate final price of a material based on court, reputation, and rarity.
 * Formula: base_price * court_multiplier * (1 - reputation_discount) * rarity_multiplier
 *
 * @param {number} basePrice - Base price from MATERIALS
 * @param {string} courtId - 'prague', 'england', 'hesse_kassel'
 * @param {number} heroReputation - Hero's reputation with patron (0-100)
 * @param {string} rarity - Material rarity: 'common', 'uncommon', 'rare', 'very_rare', 'legendary'
 * @returns {number} Final price
 */
export function calculateMaterialPrice(basePrice, courtId, heroReputation, rarity) {
  const court = COURT_ECONOMY[courtId];
  if (!court) return basePrice;

  // Court multiplier
  const courtMult = court.material_multiplier || 1.0;

  // Reputation discount: -20% at max reputation (100), 0% at 0 reputation
  const repDiscount = (heroReputation / 100) * 0.20;
  const repFactor = 1 - repDiscount;

  // Rarity multiplier
  const rarityMult = MATERIAL_RARITY_TIERS[rarity] || 1.0;

  // Final formula
  const finalPrice = basePrice * courtMult * repFactor * rarityMult;
  return Math.max(1, Math.round(finalPrice));
}

/**
 * Check if a material is available in the current market.
 * Uses probability based on court economy and material rarity.
 *
 * @param {string} courtId - Court ID
 * @param {string} rarity - Material rarity level
 * @returns {boolean} True if material is in stock
 */
export function isMaterialAvailable(courtId, rarity) {
  const court = COURT_ECONOMY[courtId];
  if (!court) return true;

  const availabilityMap = court.material_availability;
  const probability = availabilityMap[rarity] || 0.5;

  return Math.random() < probability;
}

/**
 * Get the maximum quantity of a material that can be purchased this market day.
 * Rarer materials have smaller stock limits.
 *
 * @param {string} rarity - Material rarity
 * @returns {number} Maximum stock quantity
 */
export function getMaterialStockLimit(rarity) {
  const limits = {
    common: 20,
    uncommon: 12,
    rare: 5,
    very_rare: 2,
    legendary: 1,
  };
  return limits[rarity] || 10;
}

/**
 * Calculate furnace maintenance cost based on court and furnace condition.
 * Formula: 25 + (100 - durability) * 0.5 * court_multiplier
 *
 * @param {number} durability - Current furnace durability (0-100)
 * @param {string} courtId - Court ID
 * @returns {number} Repair cost in gold
 */
export function calculateRepairCost(durability, courtId) {
  const court = COURT_ECONOMY[courtId];
  if (!court) return 25 + (100 - durability) * 0.5;

  const baseCost = 25 + (100 - durability) * 0.5;
  const courtMult = court.maintenance_cost || 1.0;

  return Math.round(baseCost * courtMult);
}

/**
 * Get the interval (in game ticks) at which the marketplace refreshes.
 *
 * @param {string} courtId - Court ID
 * @returns {number} Number of ticks between refreshes
 */
export function getMarketRefreshInterval(courtId) {
  const court = COURT_ECONOMY[courtId];
  return court?.market_refresh_interval || 50;
}

/**
 * Apply seasonal adjustment to material prices and availability.
 * Some materials become more/less available or expensive in certain seasons.
 *
 * @param {number} gameTime - Current game time (can be divided by 100 for seasons)
 * @param {string} courtId - Court ID
 * @returns {object} { priceAdjustment: number, availabilityAdjustment: number }
 */
export function getSeasonalAdjustment(gameTime, courtId) {
  const court = COURT_ECONOMY[courtId];
  if (!court || court.seasonal_effect === 'none') {
    return { priceAdjustment: 1.0, availabilityAdjustment: 1.0 };
  }

  // Simple seasonal cycle: 4 seasons per ~400 ticks
  const season = Math.floor((gameTime / 100) % 4);
  // 0 = spring, 1 = summer, 2 = autumn, 3 = winter

  if (court.seasonal_effect === 'mild') {
    // Hesse-Kassel: winter slightly harder
    if (season === 3) {
      return { priceAdjustment: 1.1, availabilityAdjustment: 0.9 };
    }
  } else if (court.seasonal_effect === 'severe') {
    // England: winter much harder
    if (season === 3) {
      return { priceAdjustment: 1.3, availabilityAdjustment: 0.7 };
    }
  }

  return { priceAdjustment: 1.0, availabilityAdjustment: 1.0 };
}

/**
 * Check if a court is currently experiencing a material shortage event.
 * (e.g., a caravan was delayed, a merchant fled, etc.)
 * Returns true ~5% of the time on average.
 *
 * @returns {boolean} True if shortage is occurring
 */
export function isCurrentlyInShortage() {
  return Math.random() < 0.05;
}

/**
 * Get a human-readable description of current economic conditions in a court.
 * Used for flavor text and strategic hints.
 *
 * @param {string} courtId - Court ID
 * @param {number} heroReputation - Hero's reputation with patron
 * @returns {string} Description string
 */
export function getEconomicDescription(courtId, heroReputation) {
  const court = COURT_ECONOMY[courtId];
  if (!court) return 'The market is unremarkable.';

  let desc = '';

  // Court baseline
  if (court.material_scarcity === 'extreme') {
    desc = 'Materials are scarce and costly here. The merchant\'s shelves are nearly bare.';
  } else if (court.material_scarcity === 'moderate') {
    desc = 'Materials are reasonably available, though prices vary.';
  } else if (court.material_scarcity === 'low') {
    desc = 'Materials are abundant here. The merchant has a well-stocked shop.';
  }

  // Reputation bonus
  if (heroReputation > 70) {
    desc += ' The merchant smiles at you—old customers get special prices.';
  } else if (heroReputation < -20) {
    desc += ' The merchant eyes you with suspicion. Prices are higher for you.';
  }

  return desc;
}
