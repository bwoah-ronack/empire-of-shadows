// js/data/events.js — random world events

/**
 * Each event: { msg, effect(player, G) }
 * Triggered at ~8% chance per player per turn-end.
 */
const RANDOM_EVENTS = [
  {
    msg:    p => `🦠 Plague strikes ${p.name}'s lands! Population and stability fall.`,
    effect: (p) => {
      p.population = Math.max(1, p.population - 5);
      p.stability  = Math.max(0, p.stability - 12);
    }
  },
  {
    msg:    p => `🪙 A trade boon blesses ${p.name}! The treasury swells.`,
    effect: (p) => {
      p.gold += 2500;
    }
  },
  {
    msg:    p => `⛪ Religious uprising in ${p.name}'s realm! Stability falls.`,
    effect: (p) => {
      p.stability = Math.max(0, p.stability - 15);
    }
  },
  {
    msg:    p => `⛏️ ${p.name} discovers ancient gold reserves!`,
    effect: (p) => {
      p.gold += 4000;
    }
  },
  {
    msg:    p => `⚔️ Mercenaries flock to ${p.name}'s banner!`,
    effect: (p) => {
      p.militaryPower = Math.min(100, p.militaryPower + 10);
    }
  },
  {
    msg:    p => `🌾 A bountiful harvest fills ${p.name}'s granaries. Population grows.`,
    effect: (p) => {
      p.population = Math.min(999, p.population + 4);
      p.stability  = Math.min(100, p.stability + 5);
    }
  },
  {
    msg:    p => `🔥 Fire destroys a district in ${p.name}'s territory!`,
    effect: (p, G) => {
      const terr = G.territories.find(t => t.owner === G.players.indexOf(p));
      if (terr) terr.baseIncome = Math.max(100, terr.baseIncome - 300);
    }
  },
  {
    msg:    p => `🌊 Floods ravage the coast of ${p.name}'s realm.`,
    effect: (p) => {
      p.gold      = Math.max(0, p.gold - 1500);
      p.stability = Math.max(0, p.stability - 8);
    }
  },
  {
    msg:    p => `🧙 A great scholar joins ${p.name}'s court. Influence grows.`,
    effect: (p) => {
      p.influence = Math.min(100, p.influence + 12);
    }
  }
];

/**
 * Roll a random event for the given player.
 * @param {number} pi — player index
 * @param {GameState} G
 */
function rollRandomEvent(pi, G) {
  if (Math.random() > 0.08) return;
  const p   = G.players[pi];
  const ev  = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  ev.effect(p, G);
  G.log.push({ msg: ev.msg(p), cls: '' });
}