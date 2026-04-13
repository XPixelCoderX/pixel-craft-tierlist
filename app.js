// app.js - Leaderboard with ranking, tier points, skeletons, popup
const POINTS_MAP = {
  'HT1': 60, 'LT1': 50,
  'HT2': 40, 'LT2': 30,
  'HT3': 20, 'LT3': 15,
  'HT4': 10, 'LT4': 5,
  'HT5': 2,  'LT5': 1
};

let allPlayers = [];
let currentFilter = 'ALL';

// Tier CSS class mapping
function getTierClass(tier) {
  return `tier-${tier.toLowerCase()}`;
}

// Render skeletons
function renderSkeletons(count = 5) {
  const container = document.getElementById('skeletonContainer');
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

// Fetch and display
async function loadLeaderboard() {
  const rowsDiv = document.getElementById('leaderboardRows');
  const skeletonDiv = document.getElementById('skeletonContainer');
  const emptyDiv = document.getElementById('emptyState');
  
  rowsDiv.style.display = 'none';
  skeletonDiv.style.display = 'block';
  emptyDiv.style.display = 'none';
  
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*');
    
    if (error) throw error;
    
    allPlayers = data || [];
    applyFilterAndSort();
  } catch (err) {
    console.error('Fetch error:', err);
    skeletonDiv.style.display = 'none';
    emptyDiv.style.display = 'flex';
    emptyDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i><p>Failed to load data. Check console.</p>`;
  }
}

function applyFilterAndSort() {
  const filterVal = document.getElementById('regionFilterSelect').value;
  currentFilter = filterVal;
  
  let filtered = [...allPlayers];
  if (filterVal !== 'ALL') {
    filtered = filtered.filter(p => p.region === filterVal);
  }
  
  // Calculate points and sort
  filtered = filtered.map(p => ({
    ...p,
    points: POINTS_MAP[p.tier] || 0
  })).sort((a, b) => b.points - a.points);
  
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
    const regionDisplay = player.region || '🌍';
    
    html += `
      <div class="row" onclick="showPlayerModal('${player.id}')" data-player-id="${player.id}">
        <div class="rank-col">${rank}</div>
        <div class="player-info">
          <div class="player-avatar">${player.username?.charAt(0) || '?'}</div>
          <span class="player-name">${player.username || 'Unknown'}</span>
        </div>
        <div class="tier-col">
          <div class="tier-bubble ${tierClass}" title="${player.tier} • ${POINTS_MAP[player.tier] || 0} pts">${player.tier}</div>
        </div>
        <div class="region-col"><span class="region-tag">${regionDisplay}</span></div>
        <div class="points-col">${player.points}</div>
      </div>
    `;
  });
  
  rowsDiv.innerHTML = html;
  
  // Re-attach tooltips via title (native)
}

// Modal popup
function showPlayerModal(playerId) {
  const player = allPlayers.find(p => p.id === playerId);
  if (!player) return;
  
  const modal = document.getElementById('playerModal');
  const content = document.getElementById('modalContent');
  const profileLink = document.getElementById('viewFullProfileBtn');
  
  const points = POINTS_MAP[player.tier] || 0;
  const tierClass = getTierClass(player.tier);
  
  content.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
      <div class="tier-bubble ${tierClass}" style="width:72px; height:72px; font-size:1.4rem;">${player.tier}</div>
      <h2 style="margin:4px 0 0;">${player.username}</h2>
      <div style="display:flex; gap:24px; margin: 8px 0;">
        <div><i class="fas fa-trophy"></i> ${points} pts</div>
        <div><i class="fas fa-globe"></i> ${player.region || 'Global'}</div>
      </div>
      <div style="background:#0b1a2a; padding:12px 16px; border-radius:24px; width:100%;">
        <p><i class="fas fa-gamepad"></i> Wins: ${player.wins || 0} &nbsp;|&nbsp; Games: ${player.games_played || 0}</p>
      </div>
    </div>
  `;
  
  profileLink.href = `player.html?id=${player.id}`;
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('playerModal').style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadLeaderboard();
  
  const filterSelect = document.getElementById('regionFilterSelect');
  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilterAndSort);
  }
  
  window.closeModal = closeModal;
  window.showPlayerModal = showPlayerModal;
});
