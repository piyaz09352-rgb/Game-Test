/* VAYRATHEN — js/ui/achpop271.js — (v271) the achievement card keeps out of the way
   It used to drop into the middle of the top of the screen, large, over the bag's search box, the character and on a
   phone half the view. Now it is a compact card that slides in beside your portrait card (top left), shorter-lived. */
'use strict';
{ const st = document.createElement('style'); st.textContent = `
html body #ui #achPop.achpop{left:var(--apx,260px) !important;top:var(--apy,8px) !important;transform:translate(-14px,0) scale(.96) !important;gap:8px !important;padding:5px 12px 5px 8px !important;border-radius:11px !important;max-width:min(300px,40vw);z-index:60 !important}
html body #ui #achPop.achpop.show{transform:translate(0,0) scale(1) !important}
html body #ui #achPop.achpop small{font-size:9.5px !important}
html body #ui #achPop.achpop b{font-size:13px !important;line-height:1.15 !important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html body #ui #achPop.achpop span{font-size:10px !important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html body #ui #achPop.achpop .achgem{width:18px !important;height:18px !important;border-radius:4px !important}`;
  document.head.appendChild(st); }
function achPlace(){
  const p = document.getElementById('achPop'), ui = document.getElementById('ui'), pt = document.getElementById('portrait'); if (!p || !ui) return;
  const card = pt && (pt.closest('.card,.hudcard,.pcard,[class*="hud"]') || pt.parentElement), u = ui.getBoundingClientRect(), z = u.width / (ui.offsetWidth || u.width) || 1;
  if (card){ const r = card.getBoundingClientRect(); p.style.setProperty('--apx', `${Math.round((r.right - u.left) / z + 8)}px`); p.style.setProperty('--apy', `${Math.round((r.top - u.top) / z)}px`); }
}
{ const _ap = achPop; achPop = function(){ const r = _ap.apply(this, arguments); try { achPlace(); const p = document.getElementById('achPop'); if (p){ clearTimeout(p._t);
      p._t = setTimeout(() => { p.classList.remove('show'); setTimeout(() => { achQ.shift(); if (achQ.length) achPop(); else p.hidden = true; }, 400); }, 2600); } } catch (e) {} return r; }; }
