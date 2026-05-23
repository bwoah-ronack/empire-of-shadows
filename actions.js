// js/data/actions.js — all available player actions

/**
 * Each action:
 *   id        — unique string key
 *   name      — display name
 *   icon      — emoji
 *   cost      — gold cost
 *   desc      — short description shown on button
 *   stat      — theme category (economy | military | espionage | propaganda | expansion)
 *   execute   — function(playerIndex, G) → void
 */
const ACTIONS = [
  {
    id:   'business',
    name: 'Buy Business',
    icon: '🏪',
    cost: 5000,
    desc: 'Build a business. +800 gold income per turn.',
    stat: 'economy',
    execute(pi, G) {
      const cp = G.players[pi];
      const t  = G.territories.find(x => x.owner === pi);
      if (t) {
        t.baseIncome  += 800;
        t.development  = Math.min(t.development + 0.2, 3);
      }
      Economy.recalcIncome(G);
      G.log.push({ msg: `${cp.name} built a business in ${t?.name || 'the realm'}.`, cls: 'good' });
    }
  },

  {
    id:   'bribe',
    name: 'Bribe Officials',
    icon: '💼',
    cost: 3000,
    desc: '+15 stability. Suppresses unrest.',
    stat: 'espionage',
    execute(pi, G) {
      const cp = G.players[pi];
      cp.stability = Math.min(100, cp.stability + 15);
      cp.espionage = Math.min(100, cp.espionage + 5);
      G.log.push({ msg: `${cp.name} bribed officials. Stability rising.`, cls: 'good' });
    }
  },

  {
    id:   'propaganda',
    name: 'Launch Propaganda',
    icon: '📢',
    cost: 4000,
    desc: '+20 influence. Weakens rival stability.',
    stat: 'propaganda',
    execute(pi, G) {
      const cp = G.players[pi];
      cp.influence  = Math.min(100, cp.influence + 20);
      cp.propaganda = Math.min(100, cp.propaganda + 8);
      const mult = cp.faction.bonus === 'propaganda' ? 2 : 1;
      G.players.forEach((r, i) => {
        if (i !== pi && r.alive) r.stability = Math.max(0, r.stability - 8 * mult);
      });
      G.log.push({ msg: `${cp.name} launches propaganda. Rivals destabilised!`, cls: 'important' });
    }
  },

  {
    id:   'expand',
    name: 'Expand Territory',
    icon: '🗺️',
    cost: 10000,
    desc: 'Claim an unclaimed territory.',
    stat: 'expansion',
    execute(pi, G) {
      const costMult = G.players[pi].faction.bonus === 'expansion' ? 0.8 : 1;
      const unclaimed = G.territories.filter(t => t.owner === null);
      if (unclaimed.length === 0) {
        Notify.show('No unclaimed territories remain!', 'error');
        return;
      }
      const t = unclaimed[Math.floor(Math.random() * unclaimed.length)];
      t.owner = pi;
      t.troops = 3;
      G.players[pi].territories.push(t.id);
      Economy.recalcIncome(G);
      G.log.push({ msg: `${G.players[pi].name} claims ${t.name}! 🗺️`, cls: 'important' });
    }
  },

  {
    id:   'train',
    name: 'Train Army',
    icon: '⚔️',
    cost: 6000,
    desc: '+10 military. Reinforce all territories.',
    stat: 'military',
    execute(pi, G) {
      const cp  = G.players[pi];
      const mult = cp.faction.bonus === 'military' ? 1.15 : 1;
      cp.militaryPower = Math.min(100, cp.militaryPower + Math.round(10 * mult));
      G.territories.filter(t => t.owner === pi).forEach(t => { t.troops += 2; });
      G.log.push({ msg: `${cp.name} trains new legions. Military power grows!`, cls: 'good' });
    }
  },

  {
    id:   'spy',
    name: 'Send Spies',
    icon: '🗡️',
    cost: 4500,
    desc: 'Reveal intel & steal rival gold.',
    stat: 'espionage',
    execute(pi, G) {
      const cp      = G.players[pi];
      const costMult = cp.faction.bonus === 'shadow' ? 0.8 : 1;
      const rivals  = G.players.filter((_, i) => i !== pi && G.players[i].alive);
      if (!rivals.length) return;
      const target  = rivals[Math.floor(Math.random() * rivals.length)];
      const stolen  = Math.min(target.gold, Math.floor(Math.random() * 2000 + 500));
      target.gold  -= stolen;
      cp.gold      += stolen;
      cp.espionage  = Math.min(100, cp.espionage + 10);
      G.log.push({ msg: `${cp.name}'s spies stole ${stolen.toLocaleString()} gold from ${target.name}! 🗡️`, cls: 'important' });
    }
  },

  {
    id:   'stocks',
    name: 'Invest in Stocks',
    icon: '📊',
    cost: 7000,
    desc: '60% chance of 2× return in 2 turns.',
    stat: 'economy',
    execute(pi, G) {
      const cp = G.players[pi];
      if (cp.stockPortfolio > 0) {
        Notify.show('You already have an active investment!', 'error');
        return;
      }
      cp.stockPortfolio = 7000;
      cp.stockTurns     = 2;
      G.log.push({ msg: `${cp.name} invested in the markets. Awaiting returns…` });
    }
  },

  {
    id:   'attack',
    name: 'Attack Rival',
    icon: '🏹',
    cost: 8000,
    desc: 'Military assault on a rival territory.',
    stat: 'military',
    execute(pi, G) {
      Combat.attack(pi, G);
    }
  },

  {
    id:   'fortify',
    name: 'Fortify Lands',
    icon: '🏰',
    cost: 5500,
    desc: '+3 troops per territory. +5 defence.',
    stat: 'military',
    execute(pi, G) {
      const cp = G.players[pi];
      G.territories.filter(t => t.owner === pi).forEach(t => { t.troops += 3; });
      cp.militaryPower = Math.min(100, cp.militaryPower + 5);
      G.log.push({ msg: `${cp.name} fortifies the realm's borders.`, cls: 'good' });
    }
  },

  {
    id:   'diplomacy',
    name: 'Diplomacy',
    icon: '🕊️',
    cost: 6000,
    desc: '+25 stability & influence. Improve standing.',
    stat: 'propaganda',
    execute(pi, G) {
      const cp = G.players[pi];
      cp.stability  = Math.min(100, cp.stability + 25);
      cp.influence  = Math.min(100, cp.influence + 15);
      cp.population = Math.min(999, cp.population + 2);
      G.log.push({ msg: `${cp.name} engages in diplomacy. The realm prospers.`, cls: 'good' });
    }
  }
];