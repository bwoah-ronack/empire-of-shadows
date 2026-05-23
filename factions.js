// js/data/factions.js — faction definitions

const FACTIONS = [
  {
    id: 'iron',
    name: 'Iron Throne',
    icon: '⚔️',
    color: '#C0392B',
    bg: 'rgba(192,57,43,0.15)',
    bonus: 'military',
    description: 'Masters of war. +15% military power gains.',
    startBonus: { militaryPower: 10 }
  },
  {
    id: 'gold',
    name: 'Golden League',
    icon: '💰',
    color: '#F39C12',
    bg: 'rgba(243,156,18,0.15)',
    bonus: 'economy',
    description: 'Merchants of the realm. +15% income from all territories.',
    startBonus: { gold: 2000 }
  },
  {
    id: 'shadow',
    name: 'Shadow Court',
    icon: '🗡️',
    color: '#8E44AD',
    bg: 'rgba(142,68,173,0.15)',
    bonus: 'espionage',
    description: 'Eyes in every court. Spy actions cost 20% less.',
    startBonus: { espionage: 15 }
  },
  {
    id: 'storm',
    name: 'Storm Coast',
    icon: '⛵',
    color: '#2980B9',
    bg: 'rgba(41,128,185,0.15)',
    bonus: 'expansion',
    description: 'Seafarers and conquerors. Territory expansion costs 20% less.',
    startBonus: { influence: 20 }
  },
  {
    id: 'ember',
    name: 'Ember Cult',
    icon: '🔥',
    color: '#E74C3C',
    bg: 'rgba(231,76,60,0.15)',
    bonus: 'propaganda',
    description: 'Zealots of fire. Propaganda actions have double effect.',
    startBonus: { propaganda: 15 }
  },
  {
    id: 'verdant',
    name: 'Verdant Pact',
    icon: '🌿',
    color: '#27AE60',
    bg: 'rgba(39,174,96,0.15)',
    bonus: 'stability',
    description: 'Keepers of the old ways. Start with higher stability.',
    startBonus: { stability: 15 }
  }
];