// gamemodes.js - Full list with icons
const gamemodes = [
  "overall","fireballmace","fireballfight","sword","axe","bedfight",
  "crystal","crystaldiamond","shieldlessuhc","diamondsmp","smp",
  "elytramace","mace","op","jousting","elytraspear","spear",
  "diamondpotion","netheritepotion","gapple","bridges","nodebuff",
  "boxing","sumo","battlerush","pearlfight","skywars","stickfight",
  "topfight","archer","sg"
];

// Helper to get icon SVG for any gamemode (returns data URI or <i> fallback)
function getGamemodeIconSvg(mode) {
  const icons = {
    overall: '<i class="fas fa-globe"></i>',
    sword: '<i class="fas fa-gavel"></i>',
    axe: '<i class="fas fa-axe"></i>',
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
    brides: '<i class="fas fa-bridge"></i>',
    nodebuff: '<i class="fas fa-ban"></i>',
    boxing: '<i class="fas fa-fist-raised"></i>',
    sumo: '<i class="fas fa-user-ninja"></i>',
    battlerush: '<i class="fas fa-running"></i>',
    pearlfight: '<i class="fas fa-circle"></i>',
    skywars: '<i class="fas fa-cloud"></i>',
    stickfight: '<i class="fas fa-tree"></i>',
    topfight: '<i class="fas fa-arrow-up"></i>',
    archer: '<i class="fas fa-bullseye"></i>',
    sg: '<i class="fas fa-skull"></i>'
  };
  return icons[mode] || '<i class="fas fa-gamepad"></i>';
}
