// js/engine/wincheck.js — victory & defeat detection

const WinCheck = (() => {

  const DOMINATION_THRESHOLD = 0.65; // 65% of territories = victory

  /**
   * Check all win/loss conditions and trigger overlay if met.
   * @param {GameState} G
   */
  function check(G) {
    const alive = G.players.filter(p => p.alive);
    if (alive.length === 0) return;

    // Last empire standing
    if (alive.length === 1) {
      _showResult(alive[0], G);
      return;
    }

    // Domination victory
    const totalTerr = G.territories.length;
    for (let i = 0; i < G.players.length; i++) {
      const p   = G.players[i];
      if (!p.alive) continue;
      const own = G.territories.filter(t => t.owner === i).length;
      if (own >= Math.ceil(totalTerr * DOMINATION_THRESHOLD)) {
        _showResult(p, G);
        return;
      }
    }
  }

  function _showResult(winner, G) {
    const isHumanWinner = !winner.isAI;

    const titleEl = document.getElementById('overlay-title');
    const subEl   = document.getElementById('overlay-sub');
    const overlay = document.getElementById('overlay-screen');

    titleEl.textContent = isHumanWinner ? 'VICTORY!' : 'DEFEAT';
    titleEl.className   = 'overlay-title ' + (isHumanWinner ? 'victory' : 'defeat');

    subEl.textContent = isHumanWinner
      ? `${winner.name} of ${winner.faction.name} has conquered the realm! The empire endures.`
      : `${winner.name} has crushed your empire. History will not remember you.`;

    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
  }

  return { check };
})();