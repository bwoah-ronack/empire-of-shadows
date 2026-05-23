// js/state.js — global game state (G) and player factory

/**
 * G — the single source of truth for the running game.
 * Mutated in place by all engine modules.
 */
const G = {
  mode:            'single',   // 'single' | 'multi'
  difficulty:      'normal',   // 'easy' | 'normal' | 'hard'
  numPlayers:      2,
  turn:            1,
  currentPlayer:   0,
  phase:           'action',   // 'action' | 'ai'
  selectedTerritory: null,

  /** @type {Player[]} */
  players:    [],
  /** @type {Territory[]} */
  territories: [],
  /** @type {LogEntry[]} */
  log:         []
};

/**
 * Create a fresh player object.
 * @param {string}  name
 * @param {Faction} faction
 * @param {boolean} isAI
 * @returns {Player}
 */
function makePlayer(name, faction, isAI = false) {
  return {
    name,
    faction,
    isAI,
    alive:          true,

    // Resources
    gold:           8000 + (faction.startBonus.gold || 0),
    income:         0,

    // Stats (0–100)
    population:     100,
    stability:      75  + (faction.startBonus.stability || 0),
    influence:      30  + (faction.startBonus.influence || 0),
    militaryPower:  20  + (faction.startBonus.militaryPower || 0),
    espionage:      10  + (faction.startBonus.espionage || 0),
    propaganda:     10  + (faction.startBonus.propaganda || 0),

    // Turn economy
    actions:        3,
    actionsMax:     3,

    // Stocks
    stockPortfolio: 0,
    stockTurns:     0,

    // Territory IDs this player owns
    territories:    []
  };
}

/**
 * Reset G to a clean state before a new game starts.
 * @param {Partial<GameConfig>} config
 */
function initState(config) {
  Object.assign(G, {
    mode:             config.mode,
    difficulty:       config.difficulty || 'normal',
    turn:             1,
    currentPlayer:    0,
    phase:            'action',
    selectedTerritory: null,
    players:          [],
    territories:      generateTerritories(18),
    log:              []
  });
}