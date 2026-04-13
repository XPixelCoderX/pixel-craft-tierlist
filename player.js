import { supabase } from "./supabase.js";

const params = new URLSearchParams(window.location.search);
const name = params.get("name");

const pts = {
  ht1:100, ht2:80, ht3:60,
  lt1:50, lt2:40, lt3:30, lt4:20, lt5:10
};

async function load(){
  const { data } = await supabase.from("players").select("*").eq("name",name);

  let total=0;

  let rows = data.map(p=>{
    let val = pts[p.rank.toLowerCase()]||0;
    total+=val;

    return `
    <div class="card">
      <img src="assets/gamemodes/${p.gamemode}.png">
      <span>${p.gamemode}</span>
      <strong>${p.rank}</strong>
      <span>${val} pts</span>
    </div>`;
  }).join("");

  document.getElementById("profile").innerHTML=`
    <h1>${name}</h1>
    <h2>${total} points</h2>
    ${rows}
  `;
}

load();
