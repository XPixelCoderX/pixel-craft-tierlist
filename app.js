import { gamemodes } from "./gamemodes.js";
import { supabase } from "./supabase.js";

const navbar = document.getElementById("navbar");
const tierlist = document.getElementById("tierlist");
const header = document.getElementById("gamemodeHeader");

let currentMode = gamemodes[0];

function format(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

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

function renderHeader() {
  header.innerHTML = `
    <img src="assets/gamemodes/${currentMode}.png">
    <h2>${format(currentMode)}</h2>
  `;
}

async function loadPlayers() {
  renderHeader();

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
    if (tiers[rank]) tiers[rank].push(p.name);
    else tiers.na.push(p.name);
  });

  tierlist.innerHTML = "";

  Object.keys(tiers).forEach(tier => {
    const div = document.createElement("div");
    div.className = "tier";

    div.innerHTML = `
      <div class="tier-title ${tier}">${tier.toUpperCase()}</div>
      <div class="tier-players">
        ${tiers[tier].map(p => `<div class="player">${p}</div>`).join("")}
      </div>
    `;

    tierlist.appendChild(div);
  });
}

createTabs();
loadPlayers();
