// js/engine/combat.js — military combat resolution

const Combat = (() => {

  /**
   * Execute an attack from playerIndex against a random rival territory.
   * @param {number}    pi — attacking player index
   * @param {GameState} G
   */
  function attack(pi, G) {
    const cp = G.players[pi];

    // Gather rivals who have territories
    const rivals = G.players
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => i !== pi && p.alive && G.territories.some(t => t.owner === i));

    if (!rivals.length) {
      Notify.show('No rivals to attack!', 'error');
      return;
    }

    // Pick a random rival
    const { p: target, i: ti } = rivals[Math.floor(Math.random() * rivals.length)];

    // Roll combat
    const attackPower  = cp.militaryPower     + Math.floor(Math.random() * 20);
    const defensePower = target.militaryPower + Math.floor(Math.random() * 15)
                         + _garrisonBonus(ti, G);

    const targetTerrs    = G.territories.filter(t => t.owner === ti);
    const tTerritory     = targetTerrs[Math.floor(Math.random() * targetTerrs.length)];

    if (attackPower > defensePower && tTerritory) {
      // Attacker wins
      tTerritory.owner  = pi;
      tTerritory.troops = Math.max(1, tTerritory.troops - 2);
      target.territories = target.territories.filter(id => id !== tTerritory.id);
      cp.territories.push(tTerritory.id);
      Economy.recalcIncome(G);

      G.log.push({
        msg: `⚔️ ${cp.name} conquers ${tTerritory.name} from ${target.name}!`,
        cls: 'important'
      });

      // Check if rival is eliminated
      if (G.territories.filter(t => t.owner === ti).length === 0) {
        target.alive = false;
        G.log.push({ msg: `💀 ${target.name}'s empire has fallen!`, cls: 'bad' });
      }
    } else {
      // Defender wins
      cp.militaryPower = Math.max(5, cp.militaryPower - 5);
      G.log.push({
        msg: `❌ ${cp.name}'s assault on ${target.name} was repelled!`,
        cls: 'bad'
      });
    }

    WinCheck.check(G);
  }

  /** Sum garrison troops for defence bonus */
  function _garrisonBonus(ti, G) {
    const total = G.territories
      .filter(t => t.owner === ti)
      .reduce((sum, t) => sum + t.troops, 0);
    return Math.floor(total / 3);
  }

  return { attack };
})();