// js/ui/hud.js — Advanced, High-Performance HUD Rendering Client
const HUD = (() => {
  'use strict';

  // --- Element Cache Pool ---
  // Avoids looking up elements via the DOM tree every single frame/render cycle
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
   * Safe HTML Sanitizer to prevent layout explosions or XSS injection 
   * if player names or custom factions contain dynamic strings.
   */
  function sanitize(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Lazy-initializes and caches core DOM hooks to guarantee ultra-fast lookup.
   */
  function initDOMHooks() {
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
    initDOMHooks();
    if (!DOM.topbarPlayers) return;

    // Build the dynamic player chips securely using map safely handling missing elements
    DOM.topbarPlayers.innerHTML = (G.players || [])
      .filter(p => p && p.alive)
      .map(p => {
        const pi     = G.players.indexOf(p);
        const active = pi === G.currentPlayer;
        const owned  = (G.territories || []).filter(t => t.owner === pi).length;
        const opacityBorder = active ? '' : '55';
        
        return `
          <div class="player-chip${active ? ' active-player' : ''}" 
               style="color: ${p.faction.color}; border-color: ${p.faction.color}${opacityBorder}">
            ${p.faction.icon || ''} ${sanitize(p.name)}${p.isAI ? ' 🤖' : ''}
            <span style="opacity: 0.65; margin-left: 4px;">⚔${owned}</span>
          </div>
        `;
      }).join('');

    if (DOM.topbarTurn) {
      DOM.topbarTurn.textContent = `Turn ${G.turn}`;
    }
    
    if (DOM.topbarPhase) {
      const cp = G.players?.[G.currentPlayer];
      DOM.topbarPhase.textContent = cp?.isAI ? 'AI Thinking…' : `${sanitize(cp?.name)}'s Turn`;
    }
  }

  /* ══════════════════════════════════════
       PLAYER STATS COMPONENT (Left Side)
     ══════════════════════════════════════ */
  function renderPlayerStats() {
    initDOMHooks();
    if (!DOM.playerStats) return;

    const cp = G.players?.[G.currentPlayer];
    if (!cp) return;

    const myTerrs = (G.territories || []).filter(t => t.owner === G.currentPlayer);
    
    // Smooth color stepping logic for stability states
    let stabColor = '#c0392b'; // Bad
    let stabClass = 'bad';
    if (cp.stability >= 60) {
      stabColor = '#27ae60'; // Good
      stabClass = 'good';
    } else if (cp.stability >= 35) {
      stabColor = '#e67e22'; // Warning
      stabClass = 'warn';
    }

    DOM.playerStats.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">${cp.faction.icon || ''} ${sanitize(cp.faction.name)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">💰 Treasury</span>
        <span class="stat-val gold-color">${cp.gold.toLocaleString()} g</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">📈 Income / Turn</span>
        <span class="stat-val good">+${cp.income.toLocaleString()} g</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">🗺 Territories</span>
        <span class="stat-val">${myTerrs.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">⚡ Actions Left</span>
        <span class="stat-val ${cp.actions > 0 ? 'good' : 'bad'}">${cp.actions} / ${cp.actionsMax}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">👥 Population</span>
        <span class="stat-val">${cp.population}M</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">🕊 Stability</span>
        <span class="stat-val ${stabClass}">${cp.stability}%</span>
      </div>
      <div class="progress-bar" style="background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
        <div class="progress-fill" style="width: ${cp.stability}%; background: ${stabColor}; height: 100%; transition: width 0.3s ease;"></div>
      </div>
      <div class="stat-row">
        <span class="stat-label">⚔ Military</span>
        <span class="stat-val">${cp.militaryPower}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">🗡 Espionage</span>
        <span class="stat-val">${cp.espionage}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">📢 Influence</span>
        <span class="stat-val">${cp.influence}</span>
      </div>
      ${cp.stockPortfolio > 0 ? `
      <div class="stat-row">
        <span class="stat-label">📊 Stocks (${cp.stockTurns}t)</span>
        <span class="stat-val good">+${cp.stockPortfolio.toLocaleString()} g</span>
      </div>` : ''}
    `;
  }

  /* ══════════════════════════════════════
       ACTIONS GRID COMPONENT (Center Engine)
     ══════════════════════════════════════ */
  function renderActions() {
    initDOMHooks();
    if (!DOM.actionGrid) return;

    const cp = G.players?.[G.currentPlayer];
    if (!cp || cp.isAI) { 
      DOM.actionGrid.innerHTML = '<p style="color:var(--text-muted);font-size:12px;font-style:italic;text-align:center;padding:10px;">Waiting for AI…</p>'; 
      return; 
    }

    if (!window.ACTIONS || !Array.isArray(ACTIONS)) {
      DOM.actionGrid.innerHTML = '<p style="color:var(--text-muted);font-size:12px;">No actions registered.</p>';
      return;
    }

    // High performance DOM generation avoiding input field/button lockups
    DOM.actionGrid.innerHTML = ACTIONS.map(a => {
      const canAfford  = cp.gold >= a.cost;
      const hasActions = cp.actions > 0;
      const enabled    = canAfford && hasActions;
      
      return `
        <button class="action-btn" data-action="${a.id}" ${enabled ? '' : 'disabled'}
                title="${sanitize(a.desc)}">
          <span class="action-btn-name">${a.icon || ''} ${sanitize(a.name)}</span>
          <span class="action-btn-cost">💰 ${a.cost.toLocaleString()} gold</span>
          <span class="action-btn-desc">${sanitize(a.desc)}</span>
        </button>
      `;
    }).join('');
  }

  /* ══════════════════════════════════════
       INTELLIGENCE COMPONENT (Right Side)
     ══════════════════════════════════════ */
  function renderIntel() {
    initDOMHooks();
    if (!DOM.intelPanel) return;

    const rivals = (G.players || []).filter((p, i) => p && i !== G.currentPlayer && p.alive);
    
    DOM.intelPanel.innerHTML = rivals.map(p => {
      const pi        = G.players.indexOf(p);
      const terrCount = (G.territories || []).filter(t => t.owner === pi).length;
      return `
        <div class="intel-card" style="border-left: 3px solid ${p.faction.color}; margin-bottom: 8px; padding: 6px;">
          <div class="intel-name" style="color:${p.faction.color}; font-weight: bold;">
            ${p.faction.icon || ''} ${sanitize(p.name)}${p.isAI ? ' 🤖' : ''}
          </div>
          <div class="intel-stat"><span>Gold</span>      <span>~${Math.round(p.gold / 1000)}k</span></div>
          <div class="intel-stat"><span>Territories</span><span>${terrCount}</span></div>
          <div class="intel-stat"><span>Military</span>  <span>${p.militaryPower}</span></div>
          <div class="intel-stat"><span>Stability</span> <span>${p.stability}%</span></div>
        </div>
      `;
    }).join('');
  }

  /* ══════════════════════════════════════
       EVENT LOG COMPONENT
     ══════════════════════════════════════ */
  function renderLog() {
    initDOMHooks();
    if (!DOM.eventLog) return;

    if (!G.log || !Array.isArray(G.log)) return;

    // Use a lightweight batch layout mapping to keep game logs incredibly fluid
    DOM.eventLog.innerHTML = G.log.slice(0, 50).map(l => {
      if (!l) return '';
      return `<div class="log-entry ${sanitize(l.cls) || ''}">${sanitize(l.msg)}</div>`;
    }).join('');
  }

  /* ══════════════════════════════════════
       BOTTOM RESOURCE BAR COMPONENT
     ══════════════════════════════════════ */
  function renderBottomBar() {
    initDOMHooks();
    const cp = G.players?.[G.currentPlayer];
    if (!cp) return;

    if (DOM.bottomMsg) {
      const sel = G.selectedTerritory !== null && G.selectedTerritory !== undefined
        ? G.territories?.[G.selectedTerritory] 
        : null;
        
      DOM.bottomMsg.textContent = sel
        ? `${sel.name} (${sel.label || sel.type}) — Garrison: ${sel.troops} troops`
        : 'Click a territory for details.';
    }

    if (DOM.bottomResources) {
      DOM.bottomResources.innerHTML = `
        <span class="res-item" style="color:var(--gold); font-weight:bold;">💰 ${cp.gold.toLocaleString()}</span>
        <span class="res-item">⚔ ${cp.militaryPower}</span>
        <span class="res-item">📢 ${cp.influence}</span>
        <span class="res-item" style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius:3px;">⚡ ${cp.actions} actions</span>
      `;
    }
  }

  /* ══════════════════════════════════════
       DYNAMIC ADVISOR SYSTEM
     ══════════════════════════════════════ */
  function renderAdvisor() {
    initDOMHooks();
    if (!DOM.advisorMsg) return;

    const cp = G.players?.[G.currentPlayer];
    if (!cp) return;

    const hints = [];
    if (cp.gold > 16000)                        hints.push('Your treasury overflows — invest in expansion or military.');
    if (cp.stability < 40)                      hints.push('Stability is critical. Bribe officials immediately.');
    if (cp.militaryPower < 25)                  hints.push('Your armies are weak. Train troops before rivals attack.');
    if ((G.territories || []).filter(t => t.owner === null).length > 4) hints.push('Unclaimed lands await. Expand your dominion!');
    if (cp.income < 1000)                       hints.push('Income is meagre. Build businesses in your territories.');
    if (cp.influence < 20)                      hints.push('Your influence is low. Launch propaganda to assert dominance.');

    const hint = hints.length
      ? hints[Math.floor(Math.random() * hints.length)]
      : 'Your empire stands resolute. Choose wisely, my liege.';

    DOM.advisorMsg.textContent = `"${hint}"`;
  }

  /**
   * Universal HUD Update Pipeline. Can be hooked directly into your central ticker loop.
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

  // API Exposed to Empire of Shadows Main Game Engine
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