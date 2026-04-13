import { gamemodes } from "./gamemodes.js";
import { supabase } from "./supabase.js";

const tabs = document.getElementById("tabs");
const list = document.getElementById("list");

let mode = "overall";

/* POINT SYSTEM */
const pts = { ht1:100, ht2:90, ht3:80, lt1:70, lt2:60, lt3:50 };

/* FORMAT NAMES */
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

/* CREATE TABS */
gamemodes.forEach(g => {
  const t = document.createElement("div");
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

/* LOAD DATA */
async function load() {
  const { data } = await supabase.from("players").select("*");

  let map={};

  data.forEach(p=>{
    let val = pts[p.rank.toLowerCase()] || 0;
    if(!map[p.name]) map[p.name]=0;
    map[p.name]+=val;
  });

  let arr = Object.entries(map).sort((a,b)=>b[1]-a[1]);

  list.innerHTML = arr.map(([name,points],i)=>{
    let cls = i===0?"first":i===1?"second":i===2?"third":"";

    return `
    <div class="card ${cls}">
      <div class="player">
        <img class="avatar" src="https://render.crafty.gg/3d/bust/${name}">
        <strong>#${i+1} ${name}</strong>
      </div>
      <div class="points">
        <strong>${points}</strong><br>PTS
      </div>
    </div>`;
  }).join("");
}

load();
