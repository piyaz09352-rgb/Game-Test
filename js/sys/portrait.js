/* VAYRATHEN — js/sys/portrait.js — a big face in the character card
   The hero's face now fills the whole round portrait (head and shoulders, cropped close), the level number badge
   under it is gone (the level is already shown as "Base · Job"), and tapping the portrait opens the Status window. */
'use strict';

/* (v221) the portrait used SPR.ensure(): every idle frame plus a strip canvas, painted at once inside a game frame
   (~100 ms on a slow machine, part of the long frame when the login card opened, while the title still hid the HUD).
   Now: nothing while the title is up, one frame only (the one shown), painted in idle time, and kept per look. */
const PORT = {key:null, c:null, busy:false, drawn:null};
function portFrame(sh){ const img = SPR.renderFrame(sh.kind, sh.key, 'idle', 0, 0, sh.K), c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').putImageData(img, 0, 0); return c; }
drawPortrait = function(){
  if (!SHEETS) return;
  const cv = el('portrait'); if (!cv) return; const t = el('title'); if (t && !t.hidden) return;
  const g = cv.getContext('2d');
  if (S.job === 'novice' && SPR.lookKey(S.look) === 'm00' && ART.portrait(g, 'villager', 40)){ PORT.drawn = 'art'; return; }
  const sh = heroSheet(); if (!sh) return;
  if (PORT.key !== sh.key){ if (PORT.busy) return; PORT.busy = true;
    const idle = window.requestIdleCallback || (f => setTimeout(f, 30)); idle(() => { try { PORT.c = portFrame(sh); PORT.key = sh.key; } finally { PORT.busy = false; } }, {timeout:400}); return; }
  if (PORT.drawn === PORT.key + cv.width) return;   // the same face: nothing to repaint
  const fs = sh.fs, K = sh.K, top = (S.job === 'rune' ? 41 : 37), size = 26;   // 26×26 world units: the head and the top of the shoulders
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height);
  g.drawImage(PORT.c, fs / 2 - size / 2 * K, sh.anchor[1] - top * K, size * K, size * K, 0, 0, cv.width, cv.height); PORT.drawn = PORT.key + cv.width;
};
{ const p = el('portrait'), box = p && p.closest('.portrait');
  if (box){ box.style.cursor = 'pointer'; box.title = L('สถานะ (C)', 'Status (C)'); box.setAttribute('role', 'button');
    box.addEventListener('click', e => { e.stopPropagation(); if (typeof winOpen === 'function' && winOpen('stat')) closeWin('stat'); else openWin('stat'); }); } }
{ const st = document.createElement('style');
  st.textContent = `.char .lvb{display:none !important}
    .portrait canvas,.ui .portrait canvas{left:3px !important;top:3px !important;width:calc(100% - 6px) !important;height:calc(100% - 6px) !important}
    .portrait:hover::before{filter:brightness(1.08)}`;
  document.head.appendChild(st); }
