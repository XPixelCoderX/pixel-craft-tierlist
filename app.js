// app.js - Pixel Craft Tierlist (fixed)
(function() {
  // Use the Supabase client from unique global
  const supabase = window.pixelSupabase;
  if (!supabase) {
    console.error('Supabase client not available');
    return;
  }

  const POINTS_MAP = {
    'HT1': 60, 'LT1': 50,
    'HT2': 40, 'LT2': 30,
    'HT3': 20, 'LT3': 15,
    'HT4': 10, 'LT4': 5,
    'HT5': 2,  'LT5': 1
  };

  let allPlayers = [];
  let currentFilter = 'ALL';
  let currentGamemode = 'overall';

  function getTierClass(tier) {
    return `tier-${tier.toLowerCase()}`;
  }

  // Copy IP buttons
  function initCopyButtons() {
    document.querySelectorAll('.copy-ip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ip = btn.dataset.ip;
        navigator.clipboard?.writeText(ip).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => btn.innerHTML = original, 1500);
        }).catch(() => alert('Copy manually: ' + ip));
      });
    });
  }

  // Skeletons
  function renderSkeletons(count = 5) {
    const container = document.getElementById('skeletonContainer');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const skel = document.createElement('div');
      skel.className = 'skeleton-row';
      skel.innerHTML = `
        <div></div>
        <div style="display:flex; gap:12px;">
          <div class="skeleton-avatar"></div>
          <div style="flex:1"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>
        </div>
        <div class="skeleton-line" style="width:50px;"></div>
        <div class="skeleton-line" style="width:40px;"></div>
        <div class="skeleton-line" style="width:30px;"></div>
      `;
      container.appendChild(skel);
    }
  }

  // Fetch data
  async function loadLeaderboard() {
    const rowsDiv = document.getElementById('leaderboardRows');
    const skeletonDiv = document.getElementById('skeletonContainer');
    const emptyDiv = document.getElementById('emptyState');
    
    rowsDiv.style.display = 'none';
    skeletonDiv.style.display = 'block';
    emptyDiv.style.display = 'none';
    
    try {
      const { data, error } = await supabase.from('players').select('*');
      if (error) throw error;
      allPlayers = data || [];
      applyFiltersAndSort();
    } catch (err) {
      console.error('Fetch error:', err);
      skeletonDiv.style.display = 'none';
      emptyDiv.style.display = 'flex';
      emptyDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Failed to load data</p>';
    }
  }

  function applyFiltersAndSort() {
    const filterVal = document.getElementById('regionFilterSelect').value;
    currentFilter = filterVal;
    
    let filtered = [...allPlayers];
    if (filterVal !== 'ALL') filtered = filtered.filter(p => p.region === filterVal);
    if (currentGamemode !== 'overall') filtered = filtered.filter(p => p.gamemode === currentGamemode);
    
    filtered = filtered.map(p => ({ ...p, points: POINTS_MAP[p.tier] || 0 }))
                       .sort((a, b) => b.points - a.points);
    renderRows(filtered);
  }

  function renderRows(players) {
    const rowsDiv = document.getElementById('leaderboardRows');
    const skeletonDiv = document.getElementById('skeletonContainer');
    const emptyDiv = document.getElementById('emptyState');
    
    skeletonDiv.style.display = 'none';
    if (!players.length) {
      rowsDiv.style.display = 'none';
      emptyDiv.style.display = 'flex';
      return;
    }
    rowsDiv.style.display = 'block';
    emptyDiv.style.display = 'none';
    
    let html = '';
    players.forEach((player, idx) => {
      const rank = idx + 1;
      const tierClass = getTierClass(player.tier);
      const region = player.region || '🌍';
      const username = player.username || 'Steve';
      const skinUrl = `https://minotar.net/helm/${username}/40.png`;
      
      html += `
        <div class="row" onclick="showPlayerModal('${player.id}')">
          <div class="rank-col">${rank}</div>
          <div class="player-info">
            <img class="player-skin" src="${skinUrl}" alt="${username}" loading="lazy" onerror="this.src='https://minotar.net/helm/Steve/40.png'">
            <span class="player-name">${username}</span>
          </div>
          <div class="tier-col">
            <div class="tier-bubble ${tierClass}" title="${player.tier} • ${POINTS_MAP[player.tier]} pts">${player.tier}</div>
          </div>
          <div class="region-col"><span class="region-tag">${region}</span></div>
          <div class="points-col">${player.points}</div>
        </div>
      `;
    });
    rowsDiv.innerHTML = html;
  }

  // Modal
  function showPlayerModal(playerId) {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;
    const modal = document.getElementById('playerModal');
    const content = document.getElementById('modalContent');
    const link = document.getElementById('viewFullProfileBtn');
    const points = POINTS_MAP[player.tier] || 0;
    const tierClass = getTierClass(player.tier);
    const username = player.username || 'Steve';
    const skinUrl = `https://minotar.net/helm/${username}/100.png`;
    
    content.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
        <img src="${skinUrl}" style="width:80px; height:80px; image-rendering:crisp-edges; border-radius:12px; box-shadow:0 6px 0 #0a1520,0 0 0 2px #2a5f8a;">
        <div class="tier-bubble ${tierClass}" style="width:64px;height:64px;font-size:1.2rem;">${player.tier}</div>
        <h2>${username}</h2>
        <div style="display:flex; gap:24px;">
          <div><i class="fas fa-trophy"></i> ${points} pts</div>
          <div><i class="fas fa-globe"></i> ${player.region || 'Global'}</div>
        </div>
      </div>
    `;
    link.href = `player.html?id=${player.id}`;
    modal.style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('playerModal').style.display = 'none';
  }

  // Gamemode strip
  function renderGamemodeStrip() {
    const strip = document.getElementById('gamemodeStrip');
    if (!strip || typeof gamemodes === 'undefined') return;
    let html = '';
    gamemodes.forEach(mode => {
      const active = mode === currentGamemode ? 'active' : '';
      html += `<div class="gamemode-chip ${active}" data-mode="${mode}">${mode.replace(/([A-Z])/g,' $1').trim()}</div>`;
    });
    strip.innerHTML = html;
    strip.querySelectorAll('.gamemode-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        currentGamemode = chip.dataset.mode;
        renderGamemodeStrip();
        applyFiltersAndSort();
      });
    });
  }

  // Attach public functions to window
  window.renderSkeletons = renderSkeletons;
  window.initCopyButtons = initCopyButtons;
  window.showPlayerModal = showPlayerModal;
  window.closeModal = closeModal;
  window.renderGamemodeStrip = renderGamemodeStrip;

  // Event listeners
  document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    const filterSelect = document.getElementById('regionFilterSelect');
    if (filterSelect) filterSelect.addEventListener('change', applyFiltersAndSort);
  });

})();
