(function() {
  const supabase = window.pixelSupabase;
  if (!supabase) return;

  const POINTS_MAP = {
    'HT1': 60, 'LT1': 50, 'HT2': 40, 'LT2': 30, 'HT3': 20, 'LT3': 15,
    'HT4': 10, 'LT4': 5, 'HT5': 2, 'LT5': 1
  };

  let allPlayers = [];
  let currentFilter = 'ALL';
  let currentGamemode = 'overall';

  function getTierClass(t) { return `tier-${t.toLowerCase()}`; }

  // Staff icon mapping
  function getStaffIcon(role) {
    const icons = {
      'sradmin': '👑', 'admin': '🛡️', 'mod': '⚔️', 'srhelper': '✨',
      'helper': '🔧', 'partner_manager': '🤝', 'partner_helper': '💼'
    };
    return icons[role] || '';
  }

  // Copy IP
  function initCopyButtons() {
    document.querySelectorAll('.copy-ip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ip = btn.dataset.ip;
        navigator.clipboard?.writeText(ip).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => btn.innerHTML = orig, 1500);
        }).catch(() => alert('Copy manually: ' + ip));
      });
    });
  }

  function renderSkeletons(count = 5) {
    const c = document.getElementById('skeletonContainer');
    if (!c) return;
    c.innerHTML = '';
    for (let i=0; i<count; i++) {
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
      c.appendChild(skel);
    }
  }

  async function loadLeaderboard() {
    const rows = document.getElementById('leaderboardRows');
    const skel = document.getElementById('skeletonContainer');
    const empty = document.getElementById('emptyState');
    rows.style.display = 'none'; skel.style.display = 'block'; empty.style.display = 'none';
    try {
      const { data, error } = await supabase.from('players').select('*');
      if (error) throw error;
      allPlayers = data || [];
      applyFiltersAndSort();
    } catch (err) {
      console.error(err);
      skel.style.display = 'none'; empty.style.display = 'flex';
    }
  }

  function applyFiltersAndSort() {
    const filterVal = document.getElementById('regionFilterSelect').value;
    let filtered = [...allPlayers];
    if (filterVal !== 'ALL') filtered = filtered.filter(p => p.region === filterVal);
    if (currentGamemode !== 'overall') filtered = filtered.filter(p => p.gamemode === currentGamemode);
    filtered = filtered.map(p => ({ ...p, points: POINTS_MAP[p.tier] || 0 }))
                       .sort((a,b) => b.points - a.points);
    renderRows(filtered);
  }

  function renderRows(players) {
    const rows = document.getElementById('leaderboardRows');
    const skel = document.getElementById('skeletonContainer');
    const empty = document.getElementById('emptyState');
    skel.style.display = 'none';
    if (!players.length) {
      rows.style.display = 'none'; empty.style.display = 'flex'; return;
    }
    rows.style.display = 'block'; empty.style.display = 'none';
    let html = '';
    players.forEach((p, idx) => {
      const rank = idx + 1;
      const tierClass = getTierClass(p.tier);
      const region = p.region || '🌍';
      const username = p.username;
      const skinUrl = `https://minotar.net/helm/${username}/40.png`;
      const displayName = p.nickname || username;
      const isOwner = username.toLowerCase() === 'n2ab';
      const staffIcon = getStaffIcon(p.staff_role);
      
      let nameHtml = `<span class="player-name">${displayName}</span>`;
      if (isOwner) nameHtml += `<i class="fas fa-crown owner-crown" title="Owner"></i>`;
      else if (staffIcon) nameHtml += `<span class="staff-badge-mini" title="${p.staff_role}">${staffIcon}</span>`;
      
      html += `
        <div class="row" onclick="showPlayerModal('${username}')">
          <div class="rank-col">${rank}</div>
          <div class="player-info">
            <img class="player-skin" src="${skinUrl}" alt="${username}" onerror="this.src='https://minotar.net/helm/Steve/40.png'">
            <div class="player-name-container">${nameHtml}</div>
          </div>
          <div class="tier-col">
            <div class="tier-bubble ${tierClass}" title="${p.tier} • ${POINTS_MAP[p.tier]} pts">${p.tier}</div>
          </div>
          <div class="region-col"><span class="region-tag">${region}</span></div>
          <div class="points-col">${p.points}</div>
        </div>
      `;
    });
    rows.innerHTML = html;
  }

  function showPlayerModal(username) {
    const player = allPlayers.find(p => p.username === username);
    if (!player) return;
    const modal = document.getElementById('playerModal');
    const content = document.getElementById('modalContent');
    const link = document.getElementById('viewFullProfileBtn');
    const points = POINTS_MAP[player.tier] || 0;
    const tierClass = getTierClass(player.tier);
    const skinUrl = `https://minotar.net/helm/${player.username}/100.png`;
    const displayName = player.nickname || player.username;
    const isOwner = player.username.toLowerCase() === 'n2ab';
    const staffIcon = getStaffIcon(player.staff_role);
    
    content.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:14px;">
        <img src="${skinUrl}" style="width:90px; height:90px; image-rendering:crisp-edges; border-radius:16px; box-shadow:0 6px 0 #0a1520,0 0 0 2px #2a5f8a;">
        <div style="display:flex; align-items:center; gap:6px;">
          <h2>${displayName}</h2>
          ${isOwner ? '<i class="fas fa-crown" style="color:#fbbf24;"></i>' : ''}
          ${staffIcon ? `<span style="font-size:1.2rem;">${staffIcon}</span>` : ''}
        </div>
        <div class="tier-bubble ${tierClass}" style="width:64px;height:64px;font-size:1.2rem;">${player.tier}</div>
        <div>${points} pts • ${player.region || 'Global'}</div>
      </div>
    `;
    link.href = `player.html?user=${encodeURIComponent(player.username)}`;
    modal.style.display = 'flex';
  }

  function closeModal() { document.getElementById('playerModal').style.display = 'none'; }

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

  window.renderSkeletons = renderSkeletons;
  window.initCopyButtons = initCopyButtons;
  window.showPlayerModal = showPlayerModal;
  window.closeModal = closeModal;
  window.renderGamemodeStrip = renderGamemodeStrip;

  document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    document.getElementById('regionFilterSelect').addEventListener('change', applyFiltersAndSort);
  });
})();
