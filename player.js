(function() {
  const supabase = window.pixelSupabase;
  if (!supabase) return;

  const POINTS_MAP = {
    'HT1':60,'LT1':50,'HT2':40,'LT2':30,'HT3':20,'LT3':15,'HT4':10,'LT4':5,'HT5':2,'LT5':1
  };

  function getTierClass(t) { return `tier-${t.toLowerCase()}`; }

  const staffIcons = {
    'sradmin': '👑', 'admin': '🛡️', 'mod': '⚔️', 'srhelper': '✨',
    'helper': '🔧', 'partner_manager': '🤝', 'partner_helper': '💼'
  };
  const staffNames = {
    'sradmin': 'Sr. Admin', 'admin': 'Admin', 'mod': 'Moderator',
    'srhelper': 'Sr. Helper', 'helper': 'Helper',
    'partner_manager': 'Partner Manager', 'partner_helper': 'Partner Helper'
  };

  async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('user');
    const container = document.getElementById('playerProfileContent');
    if (!username) { container.innerHTML = '<p>No username provided.</p>'; return; }

    try {
      const { data, error } = await supabase.from('players').select('*').eq('username', username).single();
      if (error) throw error;
      const p = data;
      const points = POINTS_MAP[p.tier] || 0;
      const tierClass = getTierClass(p.tier);
      const displayName = p.nickname || p.username;
      const isOwner = p.username.toLowerCase() === 'n2ab';
      const staffRole = p.staff_role;
      const staffIcon = staffIcons[staffRole] || '';
      const staffTitle = staffNames[staffRole] || '';
      const skinUrl = `https://minotar.net/armor/bust/${p.username}/180.png`;

      // Build social links
      let socialsHtml = '';
      const addSocial = (url, icon, label) => {
        if (url) socialsHtml += `<a href="${url}" target="_blank" class="social-link" title="${label}"><i class="${icon}"></i></a>`;
      };
      addSocial(p.youtube_url, 'fab fa-youtube', 'YouTube');
      addSocial(p.tiktok_url, 'fab fa-tiktok', 'TikTok');
      addSocial(p.instagram_url, 'fab fa-instagram', 'Instagram');
      addSocial(p.twitch_url, 'fab fa-twitch', 'Twitch');
      addSocial(p.kick_url, 'fab fa-kickstarter', 'Kick'); // using kickstarter as fallback icon

      let discordHtml = '';
      if (p.discord_username) {
        discordHtml = `<div style="display:flex; align-items:center; gap:6px;"><i class="fab fa-discord"></i> ${p.discord_username}</div>`;
      }

      container.innerHTML = `
        <div class="profile-header">
          <img src="${skinUrl}" class="profile-skin-large" alt="${p.username}" onerror="this.src='https://minotar.net/armor/bust/Steve/180.png'">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:center;">
            <h1 style="font-size:2.5rem;">${displayName}</h1>
            ${isOwner ? '<i class="fas fa-crown" style="color:#fbbf24; font-size:2rem;" title="Owner"></i>' : ''}
          </div>
          ${staffRole ? `<div class="staff-badge-large">${staffIcon} ${staffTitle}</div>` : ''}
          ${discordHtml}
          <div class="tier-bubble ${tierClass}" style="width:70px;height:70px;font-size:1.6rem;">${p.tier}</div>
          <div style="display:flex; gap:24px; font-size:1.2rem;">
            <span><i class="fas fa-globe"></i> ${p.region || 'Global'}</span>
            <span><i class="fas fa-star"></i> ${points} pts</span>
          </div>
          ${socialsHtml ? `<div class="social-links">${socialsHtml}</div>` : ''}
          <div style="margin-top:20px; width:100%; max-width:400px;">
            <div class="stat-card"><i class="fas fa-gamepad"></i> Gamemode: ${p.gamemode || 'overall'}</div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = '<p>Player not found.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', loadProfile);
})();
