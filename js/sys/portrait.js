/* VAYRATHEN — js/sys/portrait.js — a big face in the character card
   The hero's face now fills the whole round portrait (head and shoulders, cropped close), the level number badge
   under it is gone (the level is already shown as "Base · Job"), and tapping the portrait opens the Status window. */
'use strict';

drawPortrait = function(){
  if (!SHEETS) return;
  const cv = el('portrait'); if (!cv) return; const g = cv.getContext('2d');
  if (S.job === 'novice' && SPR.lookKey(S.look) === 'm00' && ART.portrait(g, 'villager', 40)) return;
  const sh = heroSheet(), f = 0, fs = sh.fs, K = sh.K, c = SPR.ensure(sh, 'idle');
  const top = (S.job === 'rune' ? 41 : 37), size = 26;   // 26×26 world units: the head and the top of the shoulders
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height);
  g.drawImage(c, f * fs + fs / 2 - size / 2 * K, sh.anchor[1] - top * K, size * K, size * K, 0, 0, cv.width, cv.height);
};
{ const p = el('portrait'), box = p && p.closest('.portrait');
  if (box){ box.style.cursor = 'pointer'; box.title = L('สถานะ (A)', 'Status (A)'); box.setAttribute('role', 'button');
    box.addEventListener('click', e => { e.stopPropagation(); if (typeof winOpen === 'function' && winOpen('stat')) closeWin('stat'); else openWin('stat'); }); } }
{ const st = document.createElement('style');
  st.textContent = `.char .lvb{display:none !important}
    .portrait canvas,.ui .portrait canvas{left:3px !important;top:3px !important;width:calc(100% - 6px) !important;height:calc(100% - 6px) !important}
    .portrait:hover::before{filter:brightness(1.08)}`;
  document.head.appendChild(st); }
