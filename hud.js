// js/ui/hud.js — Advanced Strategy HUD Client for Empire of Shadows
const HUD = (() => {
  'use strict';

  // --- Protected DOM Node Cache ---
  const DOM = {
    topbarPlayers: null,
    topbarTurn: null,
    topbarPhase: null,
    playerStats: null,
    actionGrid: null,
    intelPanel: null,
    eventLog: null,
    bottomMsg: null,
    bottomResources: null,
    advisorMsg: null,
    isInitialized: false
  };

  /**
   * String Sanitizer Pipeline
   * Prevents layout collapse if data tokens contain unexpected formatting.
   */
  function escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * State Validation Guard
   * Verifies that the global engine object 'G' is fully initialized before attempting UI draws.
   */
  function isEngineReady() {
    if (typeof G === 'undefined' || !G) return false;
    if (!Array.isArray(G.players) || !Array.isArray(G.territories)) return false;
    return true;
  }

  /**
   * Caches active element IDs exactly matching your distribution build index.
   */
  function verifyDOMHooks() {
    if (DOM.isInitialized) return true;

    DOM.topbarPlayers   = document.getElementById('topbar-players');
    DOM.topbarTurn      = document.getElementById('topbar-turn');
    DOM.topbarPhase     = document.getElementById('topbar-phase');
    DOM.playerStats     = document.getElementById('player-stats');
    DOM.actionGrid      = document.getElementById('action-grid');
    DOM.intelPanel      = document.getElementById('intel-panel');
    DOM.eventLog        = document.getElementById('event-log');
    DOM.bottomMsg       = document.getElementById('bottom-msg');
    DOM.bottomResources = document.getElementById('bottom-resources');
    DOM.advisorMsg      = document.getElementById('advisor-msg');

    DOM.isInitialized = true;
    return true;
  }

  /* ══════════════════════════════════════
       TOP BAR COMPONENT
     ══════════════════════════════════════ */
  function renderTopBar() {
    if (!isEngineReady() || !verifyDOMHooks() || !DOM.topbarPlayers) return;

    DOM.topbarPlayers.innerHTML = G.players
      .filter(p => p && p.alive)
      .map(p => {
        const pi     = G.players.indexOf(p);
        const active = pi === G.currentPlayer;
        const owned  = G.territories.filter(t => t.owner === pi).length;
        const borderAlpha = active ? '' : '55';
        
        return `
          <div class="player-chip${active ? ' active-player' : ''}" 
               style="color: ${p.faction?.color || '#fff'}; border-color: ${p.faction?.color || '#fff'}${borderAlpha}">
            ${p.faction?.icon || ''} ${escape(p.name)}${p.isAI ? ' 🤖' : ''}
            <span style="opacity: 0.65; margin-left: 4px;">⚔${owned}</span>
          </div>
        `;
      }).join('');

    if (DOM.topbarTurn) {
      DOM.topbarTurn.textContent = `Turn ${G.turn || 1}`;
    }
    
    if (DOM.topbarPhase) {
      const cp = G.players[G.currentPlayer];
      DOM.topbarPhase.textContent = cp?.isAI ? 'AI Thinking…' : `${escape(cp?.name)}'s Turn`;
    }
  }

  /* ══════════════════════════════════════
       PLAYER STATS (Left Control Board)
     ══════════════════════════════════════ */
  function renderPlayerStats() {
    if (!isEngineReady() || !verifyDOMHooks() || !DOM.playerStats) return;

    const cp = G.players[G.currentPlayer];
    if (!cp) return;

    const myTerrs = G.territories.filter(t => t.owner === G.currentPlayer);
    
    let stabColor = '#c0392b';
    let stabClass = 'bad';
    if (cp.stability >= 60) {
      stabColor = '#27ae60';
      stabClass = 'good';
    } else if (cp.stability >= 35) {
      stabColor = '#e67e22';
      stabClass = 'warn';
    }

    DOM.playerStats.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">${cp.faction?.icon || ''} ${escape(cp.faction?.name)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">💰 Treasury</span>
        <span class="stat-val gold-color">${(cp.gold || 0).toLocaleString()} g</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">📈 Income / Turn</span>
        <span class="stat-val good">+${(cp.income || 0).toLocaleString()} g</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">🗺 Territories</span>
        <span class="stat-val">${myTerrs.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">⚡ Actions Left</span>
        <span class="stat-val ${cp.actions > 0 ? 'good' : 'bad'}">${cp.actions || 0} / ${cp.actionsMax || 0}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">👥 Population</span>
        <span class="stat-val">${cp.population || 0}M</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">🕊 Stability</span>
        <span class="stat-val ${stabClass}">${cp.stability || 0}%</span>
      </div>
      <div class="progress-bar" style="background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; height: 6px;">
        <div class="progress-fill" style="width: ${cp.stability || 0}%; background: ${stabColor}; height: 100%; transition: width 0.2s ease;"></div>
      </div>
      <div class="stat-row" style="margin-top: 6px;">
        <span class="stat-label">⚔ Military</span>
        <span class="stat-val">${cp.militaryPower || 0}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">🗡 Espionage</span>
        <span class="stat-val">${cp.espionage || 0}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">📢 Influence</span>
        <span class="stat-val">${cp.influence || 0}</span>
      </div>
      ${cp.stockPortfolio > 0 ? `
      <div class="stat-row">
        <span class="stat-label">📊 Stocks (${cp.stockTurns || 0}t)</span>
        <span class="stat-val good">+${(cp.stockPortfolio || 0).toLocaleString()} g</span>
      </div>` : ''}
    `;
  }

  /* ══════════════════════════════════════
       ACTIONS GRID (Interactive Module)
     ══════════════════════════════════════ */
  function renderActions() {
    if (!isEngineReady() || !verifyDOMHooks() || !DOM.actionGrid) return;

    const cp = G.players[G.currentPlayer];
    if (!cp || cp.isAI) { 
      DOM.actionGrid.innerHTML = '<p style="color:var(--text-muted);font-size:12px;font-style:italic;text-align:center;padding:12px;">Waiting for AI…</p>'; 
      return; 
    }

    if (typeof ACTIONS === 'undefined' || !Array.isArray(ACTIONS)) return;

    DOM.actionGrid.innerHTML = ACTIONS.map(a => {
      const canAfford  = cp.gold >= a.cost;
      const hasActions = cp.actions > 0;
      const enabled    = canAfford && hasActions;
      
      return `
        <button class="action-btn" data-action="${a.id}" ${enabled ? '' : 'disabled'}
                title="${escape(a.desc)}">
          <span class="action-btn-name">${a.icon || ''} ${escape(a.name)}</span>
          <span class="action-btn-cost">💰 ${(a.cost || 0).toLocaleString()} gold</span>
          <span class="action-btn-desc">${escape(a.desc)}</span>
        </button>
      `;
    }).join('');
  }

  /* ══════════════════════════════════════
       INTELLIGENCE PANEL (Rival Tracking)
     ══════════════════════════════════════ */
  function renderIntel() {
    if (!isEngineReady() || !verifyDOMHooks() || !DOM.intelPanel) return;

    const rivals = G.players.filter((p, i) => p && i !== G.currentPlayer && p.alive);
    
    DOM.intelPanel.innerHTML = rivals.map(p => {
      const pi        = G.players.indexOf(p);
      const terrCount = G.territories.filter(t => t.owner === pi).length;
      return `
        <div class="intel-card" style="border-left: 3px solid ${p.faction?.color || '#fff'}; margin-bottom: 6px;">
          <div class="intel-name" style="color:${p.faction?.color || '#fff'}">
            ${p.faction?.icon || ''} ${escape(p.name)}${p.isAI ? ' 🤖' : ''}
          </div>
          <div class="intel-stat"><span>Gold</span>      <span>~${Math.round((p.gold || 0) / 1000)}k</span></div>
          <div class="intel-stat"><span>Territories</span><span>${terrCount}</span></div>
          <div class="intel-stat"><span>Military</span>  <span>${p.militaryPower || 0}</span></div>
          <div class="intel-stat"><span>Stability</span> <span>${p.stability || 0}%</span></div>
        </div>
      `;
    }).join('');
  }

  /* ══════════════════════════════════════
       EVENT LOG ENGINE
     ══════════════════════════════════════ */
  function renderLog() {
    if (!isEngineReady() || !verifyDOMHooks() || !DOM.eventLog) return;
    if (!Array.isArray(G.log)) return;

    DOM.eventLog.innerHTML = G.log.slice(0, 50).map(l => {
      if (!l) return '';
      return `<div class="log-entry ${escape(l.cls) || ''}">${escape(l.msg)}</div>`;
    }).join('');
  }

  /* ══════════════════════════════════════
       BOTTOM CONSOLE BAR
     ══════════════════════════════════════ */
  function renderBottomBar() {
    if (!isEngineReady() || !verifyDOMHooks()) return;

    const cp = G.players[G.currentPlayer];
    if (!cp) return;

    if (DOM.bottomMsg) {
      const sel = (G.selectedTerritory !== null && G.selectedTerritory !== undefined)
        ? G.territories[G.selectedTerritory] 
        : null;
        
      DOM.bottomMsg.textContent = sel
        ? `${sel.name} (${sel.label || sel.type}) — Garrison: ${sel.troops || 0} troops`
        : 'Click a territory for details.';
    }

    if (DOM.bottomResources) {
      DOM.bottomResources.innerHTML = `
        <span class="res-item" style="color:var(--gold)">💰 ${(cp.gold || 0).toLocaleString()}</span>
        <span class="res-item">⚔ ${cp.militaryPower || 0}</span>
        <span class="res-item">📢 ${cp.influence || 0}</span>
        <span class="res-item">⚡ ${cp.actions || 0} actions</span>
      `;
    }
  }

  /* ══════════════════════════════════════
       ADVISOR INSIGHT TAPE
     ══════════════════════════════════════ */
  function renderAdvisor() {
    if (!isEngineReady() || !verifyDOMHooks() || !DOM.advisorMsg) return;

    const cp = G.players[G.currentPlayer];
    if (!cp) return;

    const hints = [];
    if (cp.gold > 16000)                        hints.push('Your treasury overflows — invest in expansion or military.');
    if (cp.stability < 40)                      hints.push('Stability is critical. Bribe officials immediately.');
    if (cp.militaryPower < 25)                  hints.push('Your armies are weak. Train troops before rivals attack.');
    if (G.territories.filter(t => t.owner === null).length > 4) hints.push('Unclaimed lands await. Expand your dominion!');
    if (cp.income < 1000)                       hints.push('Income is meagre. Build businesses in your territories.');
    if (cp.influence < 20)                      hints.push('Your influence is low. Launch propaganda to assert dominance.');

    const hint = hints.length
      ? hints[Math.floor(Math.random() * hints.length)]
      : 'Your empire stands resolute. Choose wisely, my liege.';

    DOM.advisorMsg.textContent = `"${hint}"`;
  }

  /**
   * Complete Pipeline Execution Sync
   */
  function renderAll() {
    renderTopBar();
    renderPlayerStats();
    renderActions();
    renderIntel();
    renderLog();
    renderBottomBar();
    renderAdvisor();
  }

  return {
    renderTopBar,
    renderPlayerStats,
    renderActions,
    renderIntel,
    renderLog,
    renderBottomBar,
    renderAdvisor,
    renderAll
  };
})();