import { gamemodes } from "./gamemodes.js";
import { supabase } from "./supabase.js";

const tabs = document.getElementById("tabs");
const list = document.getElementById("list");

const pts = {
  ht1:100, ht2:80, ht3:60,
  lt1:50, lt2:40, lt3:30, lt4:20, lt5:10
};

/* TABS */
gamemodes.forEach(g=>{
  const t=document.createElement("div");
  t.className="tab";
  t.innerHTML=`<img src="assets/gamemodes/${g}.png">`;

  t.onclick=()=>load();
  tabs.appendChild(t);
});

/* LOAD */
async function load(){
  document.getElementById("loading").style.display="block";

  const { data } = await supabase.from("players").select("*");

  let map={};

  data.forEach(p=>{
    if(!map[p.name]) map[p.name]={points:0, region:p.region, modes:{}};

    let val = pts[p.rank.toLowerCase()] || 0;

    map[p.name].points+=val;
    map[p.name].modes[p.gamemode]=p.rank;
  });

  let arr = Object.entries(map).sort((a,b)=>b[1].points-a[1].points);

  list.innerHTML = arr.map(([name,p],i)=>{

    let cls = i===0?"first":i===1?"second":i===2?"third":"";

    let bubbles = gamemodes.slice(1).map(g=>{
      let r=p.modes[g];
      if(!r) return `<div class="bubble"></div>`;

      return `
      <div class="bubble">
        <img src="assets/gamemodes/${g}.png">
        <div class="tooltip">${r} (${pts[r.toLowerCase()]||0})</div>
      </div>`;
    }).join("");

    return `
    <div class="card ${cls}" onclick="window.location.href='player.html?name=${name}'">
      <div class="player">
        <img class="avatar" src="https://render.crafty.gg/3d/bust/${name}">
        <div>
          <strong>#${i+1} ${name}</strong>
          <div class="region ${p.region?.toLowerCase()}">${p.region}</div>
        </div>
      </div>

      <div class="bubbles">${bubbles}</div>

      <div><strong>${p.points}</strong> PTS</div>
    </div>`;
  }).join("");

  document.getElementById("loading").style.display="none";
}

load();
