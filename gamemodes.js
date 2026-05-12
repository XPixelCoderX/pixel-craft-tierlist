// gamemodes.js – All modes with proper SVG icons
const gamemodes = [
  "overall","fireballmace","fireballfight","sword","axe","bedfight",
  "crystal","crystaldiamond","shieldlessuhc","diamondsmp","smp",
  "elytramace","mace","op","jousting","elytraspear","spear",
  "diamondpotion","netheritepotion","gapple","bridges","nodebuff",
  "boxing","sumo","battlerush","pearlfight","skywars","stickfight",
  "topfight","archer","sg",
  "quake"                // ← new gamemode
];

// Helper to return an icon (HTML string) for each gamemode
function getGamemodeIconSvg(mode) {
  // Inline SVG icons (data URIs)
  const axeSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs><linearGradient id="a"><stop offset="0" stop-color="#c0c0c0"/><stop offset="1" stop-color="#808080"/></linearGradient></defs><path d="M20 6h4v4h-4zM22 10h2v4h-2zM18 4h8v2h-8zM15 28l4-4 8 8-4 4z" fill="url(#a)"/><path d="M15 28l-6 6 4 4 6-6z" fill="#8b4513"/><path d="M33 24l4 4-2 2-4-4z" fill="#5c4033"/></svg>';
  const gunSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><path d="M14 32h6v6h-6zM20 32h8v4h-8zM28 28h4v4h-4zM30 24h4v4h-4zM32 20h6v4h-6zM34 16h4v4h-4z" fill="#444"/><path d="M14 34h20v2H14zM20 28h8v4h-8z" fill="#2a2a2a"/><rect x="10" y="34" width="4" height="4" rx="1" fill="#666"/><rect x="32" y="32" width="8" height="4" rx="1" fill="#555"/><circle cx="38" cy="34" r="3" fill="#222"/></svg>';

  const icons = {
    overall: '<i class="fas fa-globe"></i>',
    sword: '<i class="fas fa-gavel"></i>',
    axe: axeSvg,                              // ← fixed axe icon (SVG)
    mace: '<i class="fas fa-hammer"></i>',
    crystal: '<i class="fas fa-gem"></i>',
    bedfight: '<i class="fas fa-bed"></i>',
    fireballmace: '<i class="fas fa-fire"></i>',
    fireballfight: '<i class="fas fa-fire-alt"></i>',
    shieldlessuhc: '<i class="fas fa-shield-alt"></i>',
    diamondsmp: '<i class="fas fa-diamond"></i>',
    smp: '<i class="fas fa-users"></i>',
    elytramace: '<i class="fas fa-feather-alt"></i>',
    op: '<i class="fas fa-crown"></i>',
    jousting: '<i class="fas fa-horse"></i>',
    elytraspear: '<i class="fas fa-feather"></i>',
    spear: '<i class="fas fa-bolt"></i>',
    diamondpotion: '<i class="fas fa-flask"></i>',
    netheritepotion: '<i class="fas fa-vial"></i>',
    gapple: '<i class="fas fa-apple-alt"></i>',
    bridges: '<i class="fas fa-bridge"></i>',   // ← fixed typo (was "brides")
    nodebuff: '<i class="fas fa-ban"></i>',
    boxing: '<i class="fas fa-fist-raised"></i>',
    sumo: '<i class="fas fa-user-ninja"></i>',
    battlerush: '<i class="fas fa-running"></i>',
    pearlfight: '<i class="fas fa-circle"></i>',
    skywars: '<i class="fas fa-cloud"></i>',
    stickfight: '<i class="fas fa-tree"></i>',
    topfight: '<i class="fas fa-arrow-up"></i>',
    archer: '<i class="fas fa-bullseye"></i>',
    sg: '<i class="fas fa-skull"></i>',
    quake: gunSvg                           // ← new gun icon for Quake
  };

  return icons[mode] || '<i class="fas fa-gamepad"></i>';
}
