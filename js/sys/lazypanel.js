/* VAYRATHEN — js/sys/lazypanel.js — (v113) picking things up no longer hitches the game
   Measured on a phone-sized screen with a full bag: every pickup marks the game "dirty", and the next frame redrew
   the whole side panel (renderPanel) — the bag grid (~60 ms, up to 90), the equipment doll (~17 ms) and the skill
   tree — even with all those windows closed. That was the hitch at each pickup.
   Now the bag, the equipment and the skill tree are drawn only while their window is open; when closed they are
   only marked out of date and drawn once, the moment their window opens. Everything always on screen (hotbar,
   quest card, buffs, the red dots) still updates at once. */
'use strict';

const LZP = {bag:false, equip:false, skill:false};
const lzOpen = k => typeof UIS !== 'undefined' && UIS.open && (k === 'bag' || k === 'equip' ? !!(UIS.open.equip || UIS.open.bag || UIS.open.inventory) : !!UIS.open[k]);
for (const [k, fn] of [['bag', 'renderBag'], ['equip', 'renderEquip'], ['skill', 'renderSkills']]){
  if (typeof window[fn] !== 'function') continue;
  const real = window[fn];
  window[fn] = function(){ if (!lzOpen(k)){ LZP[k] = true; return; } LZP[k] = false; return real.apply(this, arguments); };
  LZP['real_' + k] = real;
}
/* catch up the moment a window opens */
{ const _ow = openWin; openWin = function(id){ const r = _ow.apply(this, arguments);
    for (const k of ['bag', 'equip', 'skill']) if (LZP[k] && lzOpen(k)){ LZP[k] = false; try { LZP['real_' + k](); } catch (e) {} }
    return r; }; }
