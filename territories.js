// js/data/territories.js — territory types and name pool

const TERRITORY_TYPES = [
  { type: 'city',     icon: '🏙️', label: 'City',      baseIncome: 1200, baseTroops: 2 },
  { type: 'port',     icon: '⚓',  label: 'Port',      baseIncome: 900,  baseTroops: 1 },
  { type: 'fortress', icon: '🏰',  label: 'Fortress',  baseIncome: 600,  baseTroops: 4 },
  { type: 'mine',     icon: '⛏️',  label: 'Mine',      baseIncome: 1500, baseTroops: 1 },
  { type: 'farm',     icon: '🌾',  label: 'Farmland',  baseIncome: 500,  baseTroops: 1 },
  { type: 'ruins',    icon: '🏚️',  label: 'Ruins',     baseIncome: 200,  baseTroops: 0 },
];

const TERRITORY_NAMES = [
  'Ashenvale', 'Ironhold',   'Port Maris',  'Ember Keep',
  'Goldshire', 'Shadow Peak', 'Stormwatch', 'Verdant Hill',
  'The Citadel','Black Marsh','Silver Ford', 'Cragmore',
  'Duskwood',  'Sunhaven',   'The Wastes',  'Frostgate',
  'Red Valley', 'New Moria', 'Saltrock',    'Drake Pass',
  'The Narrows','Whitefall', 'Ironveil',    'Grimstone'
];

/**
 * Generate a shuffled set of territory objects.
 * @param {number} count — number of territories to create
 * @returns {Territory[]}
 */
function generateTerritories(count = 18) {
  const names = [...TERRITORY_NAMES]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  return names.map((name, id) => {
    const ttype = TERRITORY_TYPES[Math.floor(Math.random() * TERRITORY_TYPES.length)];
    return {
      id,
      name,
      type:       ttype.type,
      icon:       ttype.icon,
      label:      ttype.label,
      baseIncome: ttype.baseIncome,
      baseTroops: ttype.baseTroops,
      troops:     ttype.baseTroops + Math.floor(Math.random() * 3),
      development: 1,   // multiplier for income, max 3
      owner:      null  // player index or null
    };
  });
}