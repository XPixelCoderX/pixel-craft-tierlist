import { gamemodes } from "./gamemodes.js";
import { supabase } from "./supabase.js";

const navbar = document.getElementById("navbar");
const tierlist = document.getElementById("tierlist");
const header = document.getElementById("gamemodeHeader");

let currentMode = "overall";

/* POINT SYSTEM */
function getPoints(rank) {
  const r = rank.toLowerCase();
  if (r === "ht1") return 100;
  if (r === "ht2") return 90;
  if (r === "ht3") return 80;
  if (r === "lt1") return 70;
  if (r === "lt2") return 60;
  if (r === "lt3") return 50;
  return 0;
}

/* FORMAT */
function format(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/* NAVBAR */
function createTabs() {
  gamemodes.forEach(mode => {
    const tab = document.createElement("div");
    tab.className = "tab";

    const img = document.createElement("img");
    img.src = `assets/gamemodes/${mode}.png`;

    const text = document.createElement("span");
    text.innerText = format(mode);

    tab.appendChild(img);
    tab.appendChild(text);

    tab.onclick = () => {
      currentMode = mode;

      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      loadPlayers();
    };

    navbar.appendChild(tab);
  });

  navbar.firstChild.classList.add("active");
}

/* HEADER */
function renderHeader() {
  header.innerHTML = `
    <img src="assets/gamemodes/${currentMode}.png">
    <h2>${format(currentMode)}</h2>
  `;
}

/* LOAD */
async function loadPlayers() {
  renderHeader();

  if (currentMode === "overall") {
    const { data } = await supabase.from("players").select("*");

    const totals = {};

    data.forEach(p => {
      const pts = getPoints(p.rank);
      if (!totals[p.name]) totals[p.name] = 0;
      totals[p.name] += pts;
    });

    const sorted = Object.entries(totals)
      .sort((a, b) => b[1] - a[1]);

    tierlist.innerHTML = sorted.map(([name, pts], i) => {
      let cls = "";
      if (i === 0) cls = "first";
      if (i === 1) cls = "second";
      if (i === 2) cls = "third";

      return `
        <div class="player ${cls}" onclick="openProfile('${name}')">
          #${i+1} ${name} - ${pts} pts
        </div>
      `;
    }).join("");

    return;
  }

  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("gamemode", currentMode);

  const tiers = {
    ht1: [], ht2: [], ht3: [],
    lt1: [], lt2: [], lt3: [],
    na: []
  };

  data.forEach(p => {
    const rank = p.rank.toLowerCase();
    if (tiers[rank]) tiers[rank].push(p);
    else tiers.na.push(p);
  });

  tierlist.innerHTML = "";

  Object.keys(tiers).forEach(tier => {
    const div = document.createElement("div");

    div.innerHTML = `
      <div class="tier-title ${tier}">${tier.toUpperCase()}</div>
      <div>
        ${tiers[tier].map(p => `
          <div class="player" onclick="openProfile('${p.name}')">
            ${p.name} (${getPoints(p.rank)} pts)
          </div>
        `).join("")}
      </div>
    `;

    tierlist.appendChild(div);
  });
}

/* PROFILE */
window.openProfile = async function(name) {
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("name", name);

  let total = 0;

  const rows = data.map(p => {
    const pts = getPoints(p.rank);
    total += pts;

    return `
      <div class="player">
        ${p.gamemode} - ${p.rank.toUpperCase()} (${pts})
      </div>
    `;
  }).join("");

  tierlist.innerHTML = `
    <h2>${name}</h2>
    <h3>Total Points: ${total}</h3>
    ${rows}
    <br>
    <button onclick="location.reload()">Back</button>
  `;
};

createTabs();
loadPlayers();
