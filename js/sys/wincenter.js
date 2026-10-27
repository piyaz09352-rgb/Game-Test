/* VAYRATHEN — js/sys/wincenter.js — the Auto window always opens in the middle of the screen
   Whatever its old saved spot, other open windows or the screen size, ตั้งค่า Auto (B) opens centred both ways
   (dragging it still works until it is closed; the next open is centred again). */
'use strict';

const WC_IDS = ['auto'];
function winCenter(id){
  const w = el('win-' + id), ui = el('ui'); if (!w || w.hidden || !ui) return;
  const W0 = ui.clientWidth, H0 = ui.clientHeight, ww = w.offsetWidth, hh = w.offsetHeight;
  const x = Math.max(4, Math.round((W0 - ww) / 2)), y = Math.max(4, Math.round((H0 - hh) / 2));
  const put = (X, Y) => { for (const [p, v] of [['left', Math.round(X) + 'px'], ['top', Math.round(Y) + 'px'], ['right', 'auto'], ['bottom', 'auto'], ['transform', 'none'], ['margin', '0']]) w.style.setProperty(p, v, 'important'); };
  // the window may sit in a zoomed or offset box: measure on screen and correct (a few passes)
  let X = x, Y = y; put(X, Y);
  for (let i = 0; i < 4; i++){ const b = brect(w), u = brect(ui), k = (u.width / (ui.clientWidth || 1)) || 1;
    const dx = (u.left + u.width / 2) - (b.left + b.width / 2), dy = (u.top + u.height / 2) - (b.top + b.height / 2);
    if (Math.abs(dx) <= 1.5 && Math.abs(dy) <= 1.5) break; X = Math.max(4, X + dx / k); Y = Math.max(4, Y + dy / k); put(X, Y); }
}
{ const _o = openWin; openWin = function(id, ...a){ const r = _o.call(this, id, ...a);
    if (WC_IDS.includes(id)){ if (typeof UIS !== 'undefined' && UIS.pos) delete UIS.pos[id]; winCenter(id); requestAnimationFrame(() => winCenter(id)); }
    return r; }; }
/* a drag moves it: drop the forced centring while it is dragged */
document.addEventListener('pointerdown', e => { const h = e.target.closest && e.target.closest('[data-drag]'); if (!h || !WC_IDS.includes(h.dataset.drag) || e.target.closest('button') || (typeof compactUI === 'function' && compactUI())) return;   // (v90) a phone has no window dragging: touching the title used to drop the centring and the window jumped to the corner
  const w = el('win-' + h.dataset.drag); if (!w) return; const l = w.style.left, t = w.style.top;
  for (const p of ['left', 'top', 'right', 'bottom', 'transform']) w.style.removeProperty(p); w.style.left = l; w.style.top = t; }, true);
addEventListener('resize', () => setTimeout(() => WC_IDS.forEach(id => { if (typeof UIS !== 'undefined' && UIS.open[id] && !(UIS.pos && UIS.pos[id])) winCenter(id); }), 150));
