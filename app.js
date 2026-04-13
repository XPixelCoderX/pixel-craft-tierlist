import { gamemodes } from "./gamemodes.js";
import { supabase } from "./supabase.js";

const navbar = document.getElementById("navbar");
const tierlist = document.getElementById("tierlist");

let currentMode = gamemodes[0];

function formatGamemode(name) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2") // handles camelCase if needed
    .replace(/(^|\s)\S/g, l => l.toUpperCase()); // capitalize words
}

function createTabs() {
  gamemodes.forEach(mode => {
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.innerText = formatGamemode(mode);

    tab.onclick = () => {
      currentMode = mode;
      loadPlayers();
    };

    navbar.appendChild(tab);
  });
}

async function loadPlayers() {
  tierlist.innerHTML = "Loading...";

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("gamemode", currentMode);

  if (error) {
    tierlist.innerHTML = "Error loading players";
    return;
  }

  tierlist.innerHTML = "";

  if (data.length === 0) {
    tierlist.innerHTML = "No players yet (N/A)";
    return;
  }

  data.forEach(player => {
    const div = document.createElement("div");
    div.className = "player";
    div.innerText = `${player.name} - ${player.rank}`;
    tierlist.appendChild(div);
  });
}

createTabs();
loadPlayers();
