/* VAYRATHEN — js/sys/lazylayout.js — (v114) the HUD lays itself out only when something changed
   Measured on a phone-sized screen: the HUD layout (layoutHud and everything hooked onto it: the button editor,
   joyfit, the potion row, the target card…) ran about 5–6 times a second — from the HUD loop every 8 frames and
   from a half-second timer — whether or not anything had moved. Each run reads sizes right after writing styles,
   which makes the browser lay the whole page out again; most of the long frames (70–110 ms) in a 20-second sample
   fell on those runs.
   Now those two periodic callers (placeChips) only go ahead when something that matters changed: a watched panel
   changed size or appeared/disappeared, the screen size changed, the HUD's mode classes changed, a window opened or
   closed, or the map changed — plus a safety run every 3 s. Direct calls (after a setting changes, etc.) run as before. */
'use strict';

const LZL = {dirty:true, env:'', last:0};
const lzlEnv = () => { const ui = el('ui'); return `${innerWidth}x${innerHeight}|${ui ? ui.className : ''}|${typeof UIS !== 'undefined' && UIS.open ? Object.keys(UIS.open).filter(k => UIS.open[k]).join(',') : ''}|${typeof MAP_ID !== 'undefined' ? MAP_ID : ''}`; };
const lzlDirty = () => { LZL.dirty = true; };
if (typeof placeChips === 'function'){
  const _pc = placeChips;
  placeChips = function(){
    const env = lzlEnv(), now = performance.now();
    if (!LZL.dirty && env === LZL.env && now - LZL.last < 3000) return;
    LZL.dirty = false; LZL.env = env; LZL.last = now;
    return _pc.apply(this, arguments);
  };
}
/* what makes a layout stale: the watched panels changing size (or showing/hiding), children of #ui coming and going */
function lzlWatch(){
  if (typeof ResizeObserver === 'undefined' || LZL.ro) return;
  LZL.ro = new ResizeObserver(lzlDirty);
  for (const id of ['charCard', 'goalCard', 'mapCard', 'chips', 'rail', 'railTog', 'chatBtn', 'chatBox', 'castBar', 'dock', 'mobaAct', 'mobaPot', 'mobaUtil', 'target', 'ptyHud', 'buffs', 'hotbar', 'botChip', 'restChip', 'lootChip']){ const e = el(id); if (e) LZL.ro.observe(e); }
  // (the class attribute of #ui is often written again with the same value: only a real change counts)
  const ui = el('ui'); if (ui){ LZL.mo = new MutationObserver(list => { for (const m of list) if (m.type === 'childList' || m.oldValue !== m.target.getAttribute(m.attributeName)){ lzlDirty(); return; } });
    LZL.mo.observe(ui, {childList:true, attributes:true, attributeOldValue:true, attributeFilter:['class', 'hidden']}); }
}
setTimeout(lzlWatch, 0);
EV.on('map', lzlDirty); addEventListener('resize', lzlDirty);
{ const _ow = openWin, _cw = closeWin; openWin = function(){ lzlDirty(); return _ow.apply(this, arguments); }; closeWin = function(){ lzlDirty(); return _cw.apply(this, arguments); }; }
