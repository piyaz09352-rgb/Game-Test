/* VAYRATHEN — js/sys/winfit.js — phone windows fit the game screen (v30, with css/winfit.css)
   In the compact UI (phones) every open window is centred on the game screen, as wide as it (up to 720px sideways)
   and as tall as its content, up to the whole screen with a 4px margin (v31). The window
   and the UI can both be zoomed (and the page can be turned by rotate.js), so the box is set, measured on screen
   with brect() and corrected, a few passes, like wincenter.js. Runs on open, on resize, and when the UI turns compact. */
'use strict';
const WF_M = 4, WF_WIDE = 720;   // margin; widest a window gets on a phone held sideways
const WF_FULL = ['equip', 'bag', 'forge', 'craft', 'guild', 'siege', 'market'];   // (v58) the bag · equipment window fills the whole screen on a phone · (v188) so do the NPC workshops (long lists)
const WF_BIG = [];                 // (v132–v187) the smith's workshop took 80% of the screen; v188: whole screen like the other workshops
function winFit(id){
  const w = el('win-' + id), ui = el('ui'); if (!w || w.hidden || !ui) return;
  const props = ['left', 'top', 'width', 'height', 'right', 'bottom', 'transform', 'margin'];
  if (!compactUI() || w.classList.contains('min')){ if (w.dataset.wf){ for (const p of props) w.style.removeProperty(p); delete w.dataset.wf; } return; }
  w.dataset.wf = '1';
  const put = (p, v) => w.style.setProperty(p, v, 'important');
  put('right', 'auto'); put('bottom', 'auto'); put('transform', 'none'); put('margin', '0');
  let X = parseFloat(w.style.left) || 0, Y = parseFloat(w.style.top) || 0;
  for (let i = 0; i < 4; i++){
    const u = brect(ui), b = brect(w), k = (b.width / (w.offsetWidth || 1)) || 1;
    const full = WF_FULL.includes(id), big = WF_BIG.includes(id), tw = big ? u.width * .8 / k : Math.min((u.width - WF_M * 2) / k, u.width > u.height && !full ? WF_WIDE : 1e9);
    put('width', tw + 'px'); put('height', 'auto');                 // v31: as tall as what it holds, up to the screen
    const th = full ? (u.height - WF_M * 2) / k : big ? u.height * .8 / k : Math.min((u.height - WF_M * 2) / k, w.offsetHeight), b2 = brect(w);
    const dx = (u.left + (u.width - tw * k) / 2 - b2.left) / k, dy = (u.top + (u.height - th * k) / 2 - b2.top) / k;
    put('height', th + 'px');
    if (Math.abs(dx) < .75 && Math.abs(dy) < .75) break;
    X += dx; Y += dy; put('left', X + 'px'); put('top', Y + 'px');
  }
}
const winFitAll = () => { if (typeof WIN_IDS !== 'undefined') for (const id of WIN_IDS) if (UIS.open[id]) winFit(id); };
{ const _o = openWin; openWin = function(id){ const r = _o.apply(this, arguments); winFit(id); requestAnimationFrame(() => winFit(id)); return r; }; }
addEventListener('resize', () => setTimeout(winFitAll, 160));
addEventListener('orientationchange', () => setTimeout(winFitAll, 400));
/* the UI turns compact (or back) on its own timer in hud.js: follow it */
{ let was = null; setInterval(() => { try { const c = compactUI(); if (c !== was){ was = c; winFitAll(); } } catch (e) {} }, 700); }
/* minimise / restore */
// (v132) refit after a click only if the window's content changed height (a full fit costs ~60 ms of page layout; it ran on every tap)
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.win'); if (t) setTimeout(() => { const h = t.scrollHeight; if (t._wfh === h) return; t._wfh = h; winFit(t.id.replace(/^win-/, '')); }, 360); });
