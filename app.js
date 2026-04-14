// app.js - Pixel Craft Tierlist (with Search & Pagination)
(function() {
  const supabase = window.pixelSupabase;
  if (!supabase) return;

  const POINTS_MAP = {
    'HT1': 60, 'LT1': 50, 'HT2': 40, 'LT2': 30, 'HT3': 20, 'LT3': 15,
    'HT4': 10, 'LT4': 5, 'HT5': 2, 'LT5': 1
  };

  const PAGE_SIZE = 10; // Players per page

  let allPlayers = [];
  let filteredPlayers = []; // After applying region, gamemode, search
  let currentFilter = 'ALL';
  let currentGamemode = 'overall';
  let currentSearchTerm = '';
  let currentPage = 1;

  const staffIcons = {
    'sradmin': '👑', 'admin': '🛡️', 'mod': '⚔️', 'srhelper': '✨',
    'helper': '🔧', 'partner_manager': '🤝', 'partner_helper': '💼'
  };

  function getTierClass(t) { return `tier-${t.toLowerCase()}`; }

  function calculateTotalPoints(player) {
    const gamemodeTiers = player.gamemode_tiers || {};
    let total = 0;
    for (const mode in gamemodeTiers) {
      const tier = gamemodeTiers[mode];
      total += POINTS_MAP[tier] || 0;
    }
    if (total === 0 && player.tier) {
      total = POINTS_MAP[player.tier] || 0;
    }
    return total;
  }

  function getTierAndPointsForMode(player, mode) {
    if (mode === 'overall') {
      return { tier: player.tier, points: calculateTotalPoints(player) };
    } else {
      const gamemodeTiers = player.gamemode_tiers || {};
      const tier = gamemodeTiers[mode];
      if (tier) return { tier, points: POINTS_MAP[tier] || 0 };
      return null;
    }
  }

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

  // --- Particles ---
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

  // --- Skeletons (now 10) ---
  function renderSkeletons(count = 10) {
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
      applyAllFilters();
    } catch (err) {
      console.error(err);
      skel.style.display = 'none';
      empty.style.display = 'flex';
      document.getElementById('paginationContainer').style.display = 'none';
    }
  }

  // --- Filtering & Searching ---
  function applyAllFilters() {
    // Region filter
    let filtered = [...allPlayers];
    if (currentFilter !== 'ALL') filtered = filtered.filter(p => p.region === currentFilter);

    // Gamemode filter (include only players who have that mode)
    if (currentGamemode !== 'overall') {
      filtered = filtered.filter(p => {
        const tiers = p.gamemode_tiers || {};
        return tiers[currentGamemode] !== undefined;
      });
    }

    // Search filter (username or nickname, case-insensitive)
    if (currentSearchTerm.trim()) {
      const term = currentSearchTerm.trim().toLowerCase();
      filtered = filtered.filter(p => {
        const username = (p.username || '').toLowerCase();
        const nickname = (p.nickname || '').toLowerCase();
        return username.includes(term) || nickname.includes(term);
      });
    }

    // Process with points for current gamemode
    const processed = [];
    filtered.forEach(player => {
      const result = getTierAndPointsForMode(player, currentGamemode);
      if (result) {
        processed.push({
          ...player,
          displayTier: result.tier,
          points: result.points
        });
      }
    });

    // Sort by points descending
    processed.sort((a, b) => b.points - a.points);
    filteredPlayers = processed;
    currentPage = 1; // reset to first page
    renderPaginatedRows();
    updatePaginationControls();
  }

  function renderPaginatedRows() {
    const rows = document.getElementById('leaderboardRows');
    const skel = document.getElementById('skeletonContainer');
    const empty = document.getElementById('emptyState');
    const pagination = document.getElementById('paginationContainer');
    
    skel.style.display = 'none';
    
    if (!filteredPlayers.length) {
      rows.style.display = 'none';
      empty.style.display = 'flex';
      pagination.style.display = 'none';
      return;
    }

    rows.style.display = 'block';
    empty.style.display = 'none';
    pagination.style.display = 'flex';

    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const endIdx = Math.min(startIdx + PAGE_SIZE, filteredPlayers.length);
    const pagePlayers = filteredPlayers.slice(startIdx, endIdx);

    let html = '';
    pagePlayers.forEach((p, idx) => {
      const globalRank = startIdx + idx + 1;
      let rankOutlineClass = '';
      if (globalRank === 1) rankOutlineClass = 'rank-gold';
      else if (globalRank === 2) rankOutlineClass = 'rank-silver';
      else if (globalRank === 3) rankOutlineClass = 'rank-bronze';

      const displayTier = p.displayTier;
      const tierClass = getTierClass(displayTier);
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
        <div class="row ${rankOutlineClass}" data-username="${username}" onclick="showPlayerModal('${username}')">
          <div class="rank-col">${globalRank}</div>
          <div class="player-info">
            <img class="player-skin" src="${skinUrl}" alt="${username}" onerror="this.src='https://minotar.net/helm/Steve/40.png'">
            <div class="player-name-container">${nameHtml}</div>
          </div>
          <div class="tier-col">
            <div class="tier-bubble ${tierClass}" title="${displayTier} • ${p.points} pts">${displayTier}</div>
          </div>
          <div class="region-col"><span class="region-tag">${region}</span></div>
          <div class="points-col">${p.points}</div>
        </div>
      `;
    });
    rows.innerHTML = html;

    // Attach context menu
    document.querySelectorAll('.row').forEach(row => {
      row.addEventListener('contextmenu', (e) => {
        const username = row.dataset.username;
        const player = allPlayers.find(p => p.username === username);
        if (player) showRowContextMenu(e, player);
      });
    });
  }

  function updatePaginationControls() {
    const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');

    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderPaginatedRows();
        updatePaginationControls();
      }
    };
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderPaginatedRows();
        updatePaginationControls();
      }
    };
  }

  // --- Context Menu ---
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
    const mode = currentGamemode;
    const tierInfo = getTierAndPointsForMode(player, mode);
    const displayTier = tierInfo ? tierInfo.tier : player.tier;

    menu.innerHTML = `
      <div class="context-menu-item" data-action="copy-username">
        <i class="fas fa-user"></i> Copy Username
      </div>
      <div class="context-menu-item" data-action="copy-tier">
        <i class="fas fa-trophy"></i> Copy ${mode === 'overall' ? 'Overall' : mode} Tier: ${displayTier}
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
      navigator.clipboard?.writeText(displayTier);
      closeMenu();
    };
    menu.querySelector('[data-action="copy-all-tiers"]').onclick = () => {
      const allTiers = `Overall: ${player.tier}\n` + 
        Object.entries(player.gamemode_tiers || {}).map(([m,t]) => `${m}: ${t}`).join('\n');
      navigator.clipboard?.writeText(allTiers);
      closeMenu();
    };
  }

  // --- Modal ---
  function showPlayerModal(username) {
    const player = allPlayers.find(p => p.username === username);
    if (!player) return;

    const modal = document.getElementById('playerModal');
    const content = document.getElementById('modalContent');
    const link = document.getElementById('viewFullProfileBtn');

    const mode = currentGamemode;
    const tierInfo = getTierAndPointsForMode(player, mode);
    const displayTier = tierInfo ? tierInfo.tier : player.tier;
    const points = tierInfo ? tierInfo.points : calculateTotalPoints(player);

    const tierClass = getTierClass(displayTier);
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
        <div class="tier-bubble ${tierClass}" style="width:64px;height:64px;font-size:1.2rem;">${displayTier}</div>
        <div>${points} pts • ${player.region || 'Global'}</div>
        ${mode !== 'overall' ? `<div style="font-size:0.9rem; opacity:0.8;">Gamemode: ${mode}</div>` : ''}
      </div>
    `;
    link.href = `player.html?user=${encodeURIComponent(player.username)}`;
    modal.style.display = 'flex';
  }

  function closeModal() { document.getElementById('playerModal').style.display = 'none'; }

  // --- Gamemode Strip ---
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
        applyAllFilters();
      });
    });
  }

  // --- Search & Pagination Initialization ---
  function initSearchAndPagination() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');

    searchInput.addEventListener('input', () => {
      currentSearchTerm = searchInput.value;
      clearBtn.style.display = currentSearchTerm ? 'block' : 'none';
      applyAllFilters();
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchTerm = '';
      clearBtn.style.display = 'none';
      applyAllFilters();
    });

    // Region filter change
    document.getElementById('regionFilterSelect').addEventListener('change', (e) => {
      currentFilter = e.target.value;
      applyAllFilters();
    });
  }

  // Expose functions
  window.renderSkeletons = renderSkeletons;
  window.initCopyButtons = initCopyButtons;
  window.initParticles = initParticles;
  window.showPlayerModal = showPlayerModal;
  window.closeModal = closeModal;
  window.renderGamemodeStrip = renderGamemodeStrip;
  window.initSearchAndPagination = initSearchAndPagination;

  document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
  });
})();
