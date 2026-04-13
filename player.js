// player.js – fetch single player stats
const POINTS_MAP = {
  'HT1':60,'LT1':50,'HT2':40,'LT2':30,'HT3':20,'LT3':15,'HT4':10,'LT4':5,'HT5':2,'LT5':1
};

function getTierClass(tier) { return `tier-${tier.toLowerCase()}`; }

async function loadPlayerProfile() {
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get('id');
  const container = document.getElementById('playerProfileContent');
  
  if (!playerId) {
    container.innerHTML = '<p>No player ID provided.</p>';
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();
    
    if (error) throw error;
    
    const player = data;
    const points = POINTS_MAP[player.tier] || 0;
    const tierClass = getTierClass(player.tier);
    
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div class="tier-bubble ${tierClass}" style="width:100px; height:100px; font-size:2rem; margin-bottom:20px;">${player.tier}</div>
        <h1 style="font-size:2.4rem;">${player.username}</h1>
        <div style="display:flex; gap:32px; margin:20px 0;">
          <div class="stat-box"><span class="stat-label">Region</span><span class="stat-value">${player.region || '—'}</span></div>
          <div class="stat-box"><span class="stat-label">Points</span><span class="stat-value">${points}</span></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; width:100%; max-width:400px;">
          <div class="stat-card"><i class="fas fa-trophy"></i> Wins<br><strong>${player.wins || 0}</strong></div>
          <div class="stat-card"><i class="fas fa-joystick"></i> Games<br><strong>${player.games_played || 0}</strong></div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<p>Player not found.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadPlayerProfile);
