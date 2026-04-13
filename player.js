// player.js - Full Profile (Fixed)
(function() {
  const supabase = window.pixelSupabase;
  if (!supabase) return;

  const POINTS_MAP = {
    'HT1':60,'LT1':50,'HT2':40,'LT2':30,'HT3':20,'LT3':15,'HT4':10,'LT4':5,'HT5':2,'LT5':1
  };

  const staffIcons = {
    'sradmin': '👑', 'admin': '🛡️', 'mod': '⚔️', 'srhelper': '✨',
    'helper': '🔧', 'partner_manager': '🤝', 'partner_helper': '💼'
  };
  const staffNames = {
    'sradmin': 'Sr. Admin', 'admin': 'Admin', 'mod': 'Moderator',
    'srhelper': 'Sr. Helper', 'helper': 'Helper',
    'partner_manager': 'Partner Manager', 'partner_helper': 'Partner Helper'
  };

  function getTierClass(t) { return `tier-${t.toLowerCase()}`; }
  function getRingClass(tier) {
    const pts = POINTS_MAP[tier] || 0;
    if (pts >= 50) return 'gold';
    if (pts >= 30) return 'silver';
    return 'bronze';
  }

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

  // Context menu for profile page
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

  function showProfileContextMenu(e, playerData) {
    e.preventDefault();
    const menu = createContextMenu();
    menu.innerHTML = `
      <div class="context-menu-item" data-action="copy-username">
        <i class="fas fa-user"></i> Copy Username
      </div>
      <div class="context-menu-item" data-action="copy-tier">
        <i class="fas fa-trophy"></i> Copy Tier: ${playerData.tier}
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
      navigator.clipboard?.writeText(playerData.username);
      closeMenu();
    };
    menu.querySelector('[data-action="copy-tier"]').onclick = () => {
      navigator.clipboard?.writeText(playerData.tier);
      closeMenu();
    };
    menu.querySelector('[data-action="copy-all-tiers"]').onclick = () => {
      const allTiers = `Overall: ${playerData.tier}\n` + 
        Object.entries(playerData.gamemode_tiers || {}).map(([m,t]) => `${m}: ${t}`).join('\n');
      navigator.clipboard?.writeText(allTiers);
      closeMenu();
    };
  }

  async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('user');
    const container = document.getElementById('playerProfileContent');
    if (!username) { container.innerHTML = '<p>No username provided.</p>'; return; }

    try {
      const { data: allPlayers, error: allErr } = await supabase.from('players').select('*');
      if (allErr) throw allErr;
      const player = allPlayers.find(p => p.username === username);
      if (!player) throw new Error('Player not found');

      // Calculate overall rank using total points
      const playersWithPoints = allPlayers.map(p => ({ ...p, points: calculateTotalPoints(p) }));
      playersWithPoints.sort((a,b) => b.points - a.points);
      const rank = playersWithPoints.findIndex(p => p.username === username) + 1;

      const points = calculateTotalPoints(player);
      const tierClass = getTierClass(player.tier);
      const displayName = player.nickname || player.username;
      const isOwner = player.username.toLowerCase() === 'n2ab';
      const staffRole = player.staff_role;
      const staffIcon = staffIcons[staffRole] || '';
      const staffTitle = staffNames[staffRole] || '';
      const skinUrl = `https://minotar.net/armor/bust/${player.username}/180.png`;

      // Build social links
      let socialsHtml = '';
      const addSocial = (url, icon, label) => {
        if (url) socialsHtml += `<a href="${url}" target="_blank" class="social-link" title="${label}"><i class="${icon}"></i></a>`;
      };
      addSocial(player.youtube_url, 'fab fa-youtube', 'YouTube');
      addSocial(player.tiktok_url, 'fab fa-tiktok', 'TikTok');
      addSocial(player.instagram_url, 'fab fa-instagram', 'Instagram');
      addSocial(player.twitch_url, 'fab fa-twitch', 'Twitch');
      addSocial(player.kick_url, 'fab fa-kickstarter', 'Kick');

      let discordHtml = '';
      if (player.discord_username) {
        discordHtml = `<div style="display:flex; align-items:center; gap:6px;"><i class="fab fa-discord"></i> ${player.discord_username}</div>`;
      }

      // Build top 6 gamemodes with rings
      const gamemodeTiers = player.gamemode_tiers || {};
      const sortedModes = Object.entries(gamemodeTiers)
        .map(([mode, tier]) => ({ mode, tier, points: POINTS_MAP[tier] || 0 }))
        .sort((a,b) => b.points - a.points)
        .slice(0, 6);

      let ringsHtml = '';
      sortedModes.forEach(item => {
        const ringClass = getRingClass(item.tier);
        const iconSvg = getGamemodeIconSvg(item.mode);
        ringsHtml += `
          <div class="gamemode-ring-item">
            <div class="gamemode-ring ${ringClass}">
              ${iconSvg}
            </div>
            <span class="gamemode-ring-text">${item.mode}</span>
            <span class="gamemode-tier-text">${item.tier} (${item.points} pts)</span>
          </div>
        `;
      });

      container.innerHTML = `
        <div class="profile-header" oncontextmenu="return false;">
          <img src="${skinUrl}" class="profile-skin-large" alt="${player.username}" onerror="this.src='https://minotar.net/armor/bust/Steve/180.png'">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:center;">
            <h1 style="font-size:2.5rem;">${displayName}</h1>
            ${isOwner ? '<i class="fas fa-crown" style="color:#fbbf24; font-size:2rem;" title="Owner"></i>' : ''}
          </div>
          ${staffRole ? `<div class="staff-badge-large">${staffIcon} ${staffTitle}</div>` : ''}
          ${discordHtml}
          <div style="font-size:1.2rem; background:#0f233b; padding:6px 20px; border-radius:40px;">
            <i class="fas fa-trophy"></i> Overall Rank: #${rank}
          </div>
          <div class="tier-bubble ${tierClass}" style="width:70px;height:70px;font-size:1.6rem;">${player.tier}</div>
          <div style="display:flex; gap:24px; font-size:1.2rem;">
            <span><i class="fas fa-globe"></i> ${player.region || 'Global'}</span>
            <span><i class="fas fa-star"></i> ${points} pts</span>
          </div>
          ${socialsHtml ? `<div class="social-links">${socialsHtml}</div>` : ''}
          ${player.bio ? `<div style="max-width:500px; text-align:center; margin:10px 0; padding:12px 20px; background:#0a1a2b; border-radius:30px;">${player.bio}</div>` : ''}
          
          <div class="gamemode-rings-section">
            <div class="gamemode-rings-title"><i class="fas fa-medal"></i> Top Gamemodes</div>
            <div class="gamemode-rings-grid">
              ${ringsHtml || '<p>No gamemode tiers set.</p>'}
            </div>
          </div>
        </div>
      `;

      // Attach context menu to profile card
      const card = container.querySelector('.profile-header');
      card.addEventListener('contextmenu', (e) => showProfileContextMenu(e, player));

    } catch (err) {
      container.innerHTML = '<p>Player not found.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', loadProfile);
})();
