// js/ui/map.js — territory map rendering & interaction

const MapUI = (() => {

  /** Render all territory tiles into #map-grid. */
  function render() {
    const grid = document.getElementById('map-grid');
    if (!grid) return;

    grid.innerHTML = G.territories.map(t => _tileHTML(t)).join('');

    // Bind clicks via delegation
    grid.onclick = e => {
      const tile = e.target.closest('.territory');
      if (!tile) return;
      selectTerritory(+tile.dataset.id);
    };
  }

  /** Select (highlight) a territory and update bottom bar. */
  function selectTerritory(id) {
    G.selectedTerritory = id;
    render(); // re-render so selected class updates
    HUD.renderBottomBar();
  }

  /* ── private ── */

  function _tileHTML(t) {
    const owner    = t.owner !== null ? G.players[t.owner] : null;
    const isOwned  = t.owner === G.currentPlayer;
    const isSel    = G.selectedTerritory === t.id;
    const color    = owner ? owner.faction.color : 'rgba(255,255,255,0.15)';
    const bg       = owner ? owner.faction.color + '18' : 'rgba(255,255,255,0.02)';

    return `
      <div class="territory${isSel ? ' selected' : ''}${isOwned ? ' owned' : ''}"
           data-id="${t.id}"
           style="color:${color}; background:${bg};"
           title="${t.name} — ${t.label || t.type}">
        <span class="territory-icon" aria-hidden="true">${t.icon}</span>
        <span class="territory-name">${t.name}</span>
        <span class="territory-owner">${owner ? owner.faction.icon + ' ' + owner.name : 'Unclaimed'}</span>
        <span class="territory-troops" title="Garrison troops">⚔${t.troops}</span>
      </div>
    `;
  }

  return { render, selectTerritory };
})();