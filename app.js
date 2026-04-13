// app.js - Pixel Craft Tierlist (Complete)
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

  // Staff icons
  const staffIcons = {
    'sradmin': '👑', 'admin': '🛡️', 'mod': '⚔️', 'srhelper': '✨',
    'helper': '🔧', 'partner_manager': '🤝', 'partner_helper': '💼'
  };

  function getTierClass(t) { return `tier-${t.toLowerCase()}`; }

  // --- Copy IP ---
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

  // --- Particles (animated background) ---
  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 50;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#aad0ff';
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(170, 208, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // --- Skeletons ---
  function renderSkeletons(count = 5) {
    const c = document.getElementById('skeletonContainer');
    if (!c) return;
    c.innerHTML = '';
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
      c.appendChild(skel);
    }
  }

  // --- Fetch Data ---
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
      skel.style.display = 'none';
      empty.style.display = 'flex';
    }
  }

  function applyFiltersAndSort() {
    const filterVal = document.getElementById('regionFilterSelect').value;
    let filtered = [...allPlayers];
    if (filterVal !== 'ALL') filtered = filtered.filter(p => p.region === filterVal);
    if (currentGamemode !== 'overall') {
      filtered = filtered.filter(p => {
        const tiers = p.gamemode_tiers || {};
        return tiers[currentGamemode] !== undefined;
      });
    }
    filtered = filtered.map(p => ({ ...p, points: POINTS_MAP[p.tier] || 0 }))
                       .sort((a,b) => b.points - a.points);
    renderRows(filtered);
  }

  // --- Context Menu for Rows ---
  let contextMenu = null;
  function createContextMenu() {
    if (contextMenu) return contextMenu;
    const menu = document.createElement('div');
    menu.className = 'custom-context-menu';
    menu.style.display = 'none';
    document.body.appendChild(menu);
    contextMenu = menu;
    return menu;
  }

  function showRowContextMenu(e, player) {
    e.preventDefault();
    const menu = createContextMenu();
    const tiersSummary = player.tier;
    menu.innerHTML = `
      <div class="context-menu-item" data-action="copy-username">
        <i class="fas fa-user"></i> Copy Username
      </div>
      <div class="context-menu-item" data-action="copy-tier">
        <i class="fas fa-trophy"></i> Copy Tier: ${tiersSummary}
      </div>
      <div class="context-menu-item" data-action="copy-all-tiers">
        <i class="fas fa-list"></i> Copy All Tiers
      </div>
    `;
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    menu.style.display = 'block';

    const closeMenu = () => { menu.style.display = 'none'; };
    window.addEventListener('click', closeMenu, { once: true });
    window.addEventListener('contextmenu', closeMenu, { once: true });

    menu.querySelector('[data-action="copy-username"]').onclick = () => {
      navigator.clipboard?.writeText(player.username);
      closeMenu();
    };
    menu.querySelector('[data-action="copy-tier"]').onclick = () => {
      navigator.clipboard?.writeText(player.tier);
      closeMenu();
    };
    menu.querySelector('[data-action="copy-all-tiers"]').onclick = () => {
      const allTiers = `Overall: ${player.tier}\n` + 
        Object.entries(player.gamemode_tiers || {}).map(([m,t]) => `${m}: ${t}`).join('\n');
      navigator.clipboard?.writeText(allTiers);
      closeMenu();
    };
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
      const staffIcon = staffIcons[p.staff_role] || '';
      
      let nameHtml = `<span class="player-name">${displayName}</span>`;
      if (isOwner) nameHtml += `<i class="fas fa-crown owner-crown" title="Owner"></i>`;
      else if (staffIcon) nameHtml += `<span class="staff-badge-mini" title="${p.staff_role}">${staffIcon}</span>`;
      
      html += `
        <div class="row" data-username="${username}" onclick="showPlayerModal('${username}')">
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

    // Attach context menu to each row
    document.querySelectorAll('.row').forEach(row => {
      row.addEventListener('contextmenu', (e) => {
        const username = row.dataset.username;
        const player = allPlayers.find(p => p.username === username);
        if (player) showRowContextMenu(e, player);
      });
    });
  }

  // --- Modal ---
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
    const staffIcon = staffIcons[player.staff_role] || '';
    
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

  // --- Gamemode Strip with Icons ---
  function renderGamemodeStrip() {
    const strip = document.getElementById('gamemodeStrip');
    if (!strip || typeof gamemodes === 'undefined') return;
    let html = '';
    gamemodes.forEach(mode => {
      const active = mode === currentGamemode ? 'active' : '';
      const iconSvg = getGamemodeIconSvg(mode);
      html += `<div class="gamemode-chip ${active}" data-mode="${mode}">
        ${iconSvg} ${mode.replace(/([A-Z])/g,' $1').trim()}
      </div>`;
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

  // Expose functions
  window.renderSkeletons = renderSkeletons;
  window.initCopyButtons = initCopyButtons;
  window.initParticles = initParticles;
  window.showPlayerModal = showPlayerModal;
  window.closeModal = closeModal;
  window.renderGamemodeStrip = renderGamemodeStrip;

  document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    document.getElementById('regionFilterSelect').addEventListener('change', applyFiltersAndSort);
  });
})();
