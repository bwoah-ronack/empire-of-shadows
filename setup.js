// js/ui/setup.js — setup screen build & interaction

const Setup = (() => {

  /** Build the setup form for single-player mode. */
  function buildSingle() {
    document.getElementById('setup-title').textContent = 'Single Player Setup';
    document.getElementById('setup-body').innerHTML = `
      <div class="form-group">
        <label class="setup-label" for="p1name">Your Name</label>
        <input class="setup-input" id="p1name" value="Warlord" maxlength="16" autocomplete="off">
      </div>
      <div class="form-group">
        <label class="setup-label">Choose Your Faction</label>
        <div class="faction-grid" id="faction-pick"></div>
      </div>
      <div class="form-group">
        <label class="setup-label">Difficulty</label>
        <div class="difficulty-row">
          <button class="diff-btn selected" data-d="easy">Novice</button>
          <button class="diff-btn"          data-d="normal">Warlord</button>
          <button class="diff-btn"          data-d="hard">Conqueror</button>
        </div>
      </div>
    `;
    G.difficulty       = 'easy';
    G.selectedFaction  = FACTIONS[0].id;
    _buildFactionGrid();
    _bindDiffButtons();
  }

  /** Build the setup form for multiplayer mode. */
  function buildMulti() {
    document.getElementById('setup-title').textContent = 'Multiplayer Setup';
    document.getElementById('setup-body').innerHTML = `
      <div class="form-group">
        <label class="setup-label">Number of Players</label>
        <div class="player-count-row">
          ${[2,3,4].map(n =>
            `<button class="diff-btn${n===2?' selected':''}" data-n="${n}">${n} Players</button>`
          ).join('')}
        </div>
      </div>
      <div id="player-names-area"></div>
    `;
    G.numPlayers = 2;
    _buildPlayerNames(2);
    _bindPlayerCountButtons();
  }

  /* ── private helpers ── */

  function _buildFactionGrid() {
    const el = document.getElementById('faction-pick');
    if (!el) return;
    el.innerHTML = FACTIONS.map((f, i) => `
      <button class="faction-btn${i===0?' selected':''}" data-id="${f.id}" aria-pressed="${i===0}">
        <span class="fi" aria-hidden="true">${f.icon}</span>
        <span class="fn">${f.name}</span>
        <span class="fb">+${f.bonus}</span>
      </button>
    `).join('');

    el.addEventListener('click', e => {
      const btn = e.target.closest('.faction-btn');
      if (!btn) return;
      el.querySelectorAll('.faction-btn').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed','false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed','true');
      G.selectedFaction = btn.dataset.id;
    });
  }

  function _buildPlayerNames(n) {
    const area = document.getElementById('player-names-area');
    if (!area) return;
    area.innerHTML = Array.from({ length: n }, (_, i) => `
      <div class="form-group">
        <label class="setup-label" for="pname${i}">Player ${i+1} Name</label>
        <input class="setup-input" id="pname${i}" value="Player ${i+1}" maxlength="16" autocomplete="off">
      </div>
    `).join('');
  }

  function _bindDiffButtons() {
    document.querySelector('.difficulty-row')?.addEventListener('click', e => {
      const btn = e.target.closest('.diff-btn[data-d]');
      if (!btn) return;
      document.querySelectorAll('.diff-btn[data-d]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      G.difficulty = btn.dataset.d;
    });
  }

  function _bindPlayerCountButtons() {
    document.querySelector('.player-count-row')?.addEventListener('click', e => {
      const btn = e.target.closest('.diff-btn[data-n]');
      if (!btn) return;
      document.querySelectorAll('.diff-btn[data-n]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      G.numPlayers = +btn.dataset.n;
      _buildPlayerNames(G.numPlayers);
    });
  }

  return { buildSingle, buildMulti };
})();