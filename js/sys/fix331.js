/* VAYRATHEN — js/sys/fix331.js — (v331) the owner's removals and fixes
   · «ลบออกให้หมด» (three pictures): the picture of a tiled square with gold rings under Aren's plaza, the golden lamp
     posts, and the little stone statues are gone from every map (the town keeps its own ground; nothing else moves). */
'use strict';
const FX331 = {gone:new Set(['lamp', 'lotuslamp', 'statue'])};   // lotuslamp: the golden lantern posts of the heaven maps
function fx331Clear(){ let n = 0;
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!FX331.gone.has(p.type)) continue;
    PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); n++; }
  if (n && typeof NAV !== 'undefined') NAV.grid = null; return n; }
{ const _rm = repaintMap; repaintMap = function(){ const r = _rm.apply(this, arguments); try { fx331Clear(); } catch (e) {} return r; }; }
EV.on('map', () => { for (const ms of [0, 80, 500]) setTimeout(() => { try { fx331Clear(); } catch (e) {} }, ms); });
/* Aren's plaza picture is no longer painted (the rest of what that step did — clearing small plants off the square — still runs) */
if (typeof TIMG !== 'undefined'){ const blank = document.createElement('canvas'); blank.width = 16; blank.height = 10;
  let real = TIMG.plaza; Object.defineProperty(TIMG, 'plaza', {get(){ if (!real) return null; Object.defineProperty(blank, 'naturalWidth', {value:real.naturalWidth || 1600, configurable:true}); Object.defineProperty(blank, 'naturalHeight', {value:real.naturalHeight || 1000, configurable:true}); return blank; },
    set(v){ real = v; }, configurable:true}); }   // a see-through stand-in of the same shape: the square is measured as before, nothing is painted

/* · the storm (Thunder Tempest): the owner preferred the original look, so it stays — only its hard angles are smoothed,
     in js/sys/mage2.js (the funnel, the debris, its lightning) and js/render/vfx.js (the lightning of every bolt) */
