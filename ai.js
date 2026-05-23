// js/engine/ai.js — AI player decision-making

const AI = (() => {

  /** Number of actions AI takes per difficulty */
  const MOVES_BY_DIFF = { easy: 1, normal: 2, hard: 3 };

  /**
   * Execute an AI turn for the given player index.
   * @param {number}    pi
   * @param {GameState} G
   */
  function takeTurn(pi, G) {
    const cp      = G.players[pi];
    if (!cp || !cp.alive) return;

    // Collect income first
    cp.gold += cp.income;

    const movesAllowed = MOVES_BY_DIFF[G.difficulty] || 2;
    let   movesLeft    = movesAllowed;

    while (movesLeft > 0 && cp.actions > 0) {
      const chosen = _pickAction(pi, cp, G);
      if (!chosen) break;

      cp.gold    -= chosen.cost;
      cp.actions--;
      chosen.execute(pi, G);
      movesLeft--;
    }

    WinCheck.check(G);
  }

  /**
   * Heuristic action selection.
   * Priority: survive → economy → military → aggression
   */
  function _pickAction(pi, cp, G) {
    const affordable = ACTIONS.filter(a => cp.gold >= a.cost);
    if (!affordable.length) return null;

    const hasTerritories = G.territories.some(t => t.owner === pi);
    const isStrong       = cp.militaryPower > 40;
    const isRich         = cp.gold > 15000;
    const isWeak         = cp.stability < 35;

    // Defensive: bribe if stability is critically low
    if (isWeak) {
      const bribe = affordable.find(a => a.id === 'bribe');
      if (bribe) return bribe;
    }

    // Aggressive on hard: attack if strong
    if (isStrong && G.difficulty === 'hard') {
      const attack = affordable.find(a => a.id === 'attack');
      if (attack) return attack;
    }

    // Economy: build business if poor income
    if (cp.income < 3000 && hasTerritories) {
      const biz = affordable.find(a => a.id === 'business');
      if (biz) return biz;
    }

    // Expand if rich and there's unclaimed land
    if (isRich && G.territories.some(t => t.owner === null)) {
      const expand = affordable.find(a => a.id === 'expand');
      if (expand) return expand;
    }

    // Train army on normal/hard
    if (G.difficulty !== 'easy' && cp.militaryPower < 50) {
      const train = affordable.find(a => a.id === 'train');
      if (train) return train;
    }

    // Random fallback
    return affordable[Math.floor(Math.random() * affordable.length)];
  }

  return { takeTurn };
})();