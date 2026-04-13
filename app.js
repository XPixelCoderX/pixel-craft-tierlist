import { gamemodes } from "./gamemodes.js";
import { supabase } from "./supabase.js";

const tabs = document.getElementById("tabs");
const list = document.getElementById("list");

/* POINT SYSTEM */
const pts = {
  ht1:100, ht2:80, ht3:60,
  lt1:50, lt2:40, lt3:30, lt4:20, lt5:10
};

let mode = "overall";

/* FORMAT */
const names = {
  fireballmace:"Fireball Mace",
  fireballfight:"Fireball Fight",
  elytraspear:"Elytra-Spear",
  elytramace:"Elytra-Mace",
  battlerush:"BattleRush",
  bedfight:"BedFight",
  crystaldiamond:"Crystal Diamond",
  diamondsmp:"Diamond SMP",
  shieldlessuhc:"Shieldless UHC",
  skywars:"SkyWars",
  smp:"SMP",
  sg:"SG",
  overall:"Overall"
};

const format = n => names[n] || n;

/* TABS */
gamemodes.forEach(g=>{
  const t=document.createElement("div");
  t.className="tab";
  t.innerHTML=`<img src="assets/gamemodes/${g}.png">`;

  t.onclick=()=>{
    mode=g;
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    t.classList.add("active");
    load();
  };

  tabs.appendChild(t);
});
tabs.firstChild.classList.add("active");

/* LOAD */
async function load() {
  const { data } = await supabase.from("players").select("*");

  let players = {};

  data.forEach(p=>{
    if(!players[p.name]) {
      players[p.name] = {
        points:0,
        region:p.region,
        modes:{}
      };
    }

    let val = pts[p.rank.toLowerCase()] || 0;

    players[p.name].points += val;
    players[p.name].modes[p.gamemode] = p.rank;
  });

  let sorted = Object.entries(players).sort((a,b)=>b[1].points-a[1].points);

  list.innerHTML = sorted.map(([name,p],i)=>{

    let cls = i===0?"first":i===1?"second":i===2?"third":"";

    /* TIER BUBBLES */
    let bubbles = gamemodes.slice(1).map(g=>{
      let r = p.modes[g];
      if(!r) return `<div class="bubble empty"></div>`;

      return `
      <div class="bubble ${r.toLowerCase()}">
        <img src="assets/gamemodes/${g}.png">
        <span>${r}</span>
      </div>`;
    }).join("");

    return `
    <div class="card ${cls}" onclick="openProfile('${name}')">

      <div class="player">
        <img class="avatar" src="https://render.crafty.gg/3d/bust/${name}">
        <div>
          <strong>#${i+1} ${name}</strong>
          <div class="region ${p.region?.toLowerCase()}">${p.region || "NA"}</div>
        </div>
      </div>

      <div class="bubbles">${bubbles}</div>

      <div class="points">
        <strong>${p.points}</strong><br>PTS
      </div>

    </div>`;
  }).join("");
}

window.openProfile = async function(name){
  const { data } = await supabase.from("players").select("*").eq("name",name);

  let content = data.map(p=>`
    <div class="profile-row">
      <img src="assets/gamemodes/${p.gamemode}.png">
      <span>${format(p.gamemode)}</span>
      <strong>${p.rank}</strong>
    </div>
  `).join("");

  document.getElementById("popup").innerHTML = `
    <div class="popup-inner">
      <h2>${name}</h2>
      ${content}
      <button onclick="closePopup()">Close</button>
    </div>
  `;

  document.getElementById("popup").classList.remove("hidden");
};

window.closePopup = ()=>{
  document.getElementById("popup").classList.add("hidden");
};

load();
