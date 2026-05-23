// js/engine/economy.js — income calculation & turn-end collection

const Economy = (() => {

  /**
   * Recalculate income for all players based on owned territories.
   * @param {GameState} G
   */
  function recalcIncome(G) {
    G.players.forEach((p, pi) => {
      let inc = 500; // base stipend
      G.territories.forEach(t => {
        if (t.owner === pi) inc += t.baseIncome * t.development;
      });
      // Faction economy bonus
      if (p.faction.bonus === 'economy') inc = Math.round(inc * 1.15);
      p.income = Math.round(inc);
    });
  }

  /**
   * Collect income & process stocks for all living players.
   * @param {GameState} G
   */
  function collectAll(G) {
    G.players.forEach((p, i) => {
      if (!p.alive) return;

      // Income
      p.gold += p.income;

      // Stock resolution
      if (p.stockPortfolio > 0) {
        p.stockTurns--;
        if (p.stockTurns <= 0) {
          const win = Math.random() < 0.60;
          const ret = win ? p.stockPortfolio * 2 : 0;
          p.gold += ret;
          G.log.push({
            msg: win
              ? `${p.name}'s market investment paid off! +${ret.toLocaleString()} gold 📈`
              : `${p.name}'s investments crashed! 📉`,
            cls: win ? 'good' : 'bad'
          });
          p.stockPortfolio = 0;
          p.stockTurns     = 0;
        }
      }

      // Stability natural decay / recovery
      const owned = G.territories.filter(t => t.owner === i).length;
      if (owned === 0) p.stability = Math.max(0, p.stability - 5);
      else if (owned >= 5) p.stability = Math.min(100, p.stability + 1);

      // Population growth tied to stability
      if (p.stability > 60) {
        p.population = Math.min(999, p.population + Math.floor(Math.random() * 3));
      }
    });
  }

  return { recalcIncome, collectAll };
})();