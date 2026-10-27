/* VAYRATHEN — js/sys/balance.js — looks for the Lv 140–280 gear and the top potions (data lives in data/gear.js) */
'use strict';
const HI_LOOK = {a_infernal:'a_padded', a_vajra:'a_scale', a_devaraja:'a_suvarna', a_himmapan:'a_naga', a_chakra:'a_suvarna',
  h_infernal:'h_mongkhon', h_vajra:'h_chada', h_devaraja:'h_goldchada', h_himmapan:'h_chada', h_chakra:'h_goldchada',
  x_infernal:'x_moon', x_vajra:'x_tiger', x_devaraja:'x_naga', x_himmapan:'x_charm', x_chakra:'x_sun'};
for (const id in HI_LOOK){ if (!ITEMS[id]) continue; ITEMS[id].artAs = HI_LOOK[id]; if (SPR.GEAR_LOOK[HI_LOOK[id]]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[HI_LOOK[id]]; }
if (typeof IA_POT !== 'undefined'){ IA_POT.divinepot = [['#ffffff', '#ffd0f0', '#c04a9a'], 'elixir']; IA_POT.skypot = [['#e0f4ff', '#5aa8ff', '#1a3a9a'], 'elixir']; }
