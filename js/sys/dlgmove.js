/* VAYRATHEN — js/sys/dlgmove.js — the NPC conversation window can be moved and resized
   · Opens in the middle of the screen every time, sized to the screen: (v159) every NPC window is 60% of the screen
     wide and at most 60% tall (its list scrolls inside), the workshops too. It no longer fades in each time it is
     placed, so pressing a button that redraws it does not make it blink.
   · Drag it by its header (the portrait and name); drag the corner grip to resize it.
   · A size you pick is remembered as a share of the screen, so it still fits after the screen or UI scale changes.
   · Rotated play (html.rot) works: pointer positions go through ptX/ptY/brect like the other windows.
   Inline !important styles win over the older stylesheet rules that pinned the dialog in place. */
'use strict';

const DLGM = {KEY:'vayrathen-dlg-v2', size:null, drag:null};
try { DLGM.size = JSON.parse(localStorage.getItem(DLGM.KEY) || 'null'); } catch (e) {}
{
  const st = document.createElement('style');
  st.textContent = `#dialog .dh{cursor:grab;touch-action:none;user-select:none}#dialog.dlg-drag .dh{cursor:grabbing}
    #dialog .dlg-grip{position:absolute;right:2px;bottom:2px;width:22px;height:22px;cursor:nwse-resize;touch-action:none;z-index:3;opacity:.75;
      background:linear-gradient(135deg,transparent 0 52%,rgba(227,176,75,.85) 52% 58%,transparent 58% 68%,rgba(227,176,75,.85) 68% 74%,transparent 74% 84%,rgba(227,176,75,.85) 84% 90%,transparent 90%)}
    #dialog .dlg-grip:hover{opacity:1}
    @keyframes dlgFade{from{opacity:0}to{opacity:1}}`;
  document.head.appendChild(st);
}
const dlgEl = () => document.getElementById('dialog');
/* the box the dialog lives in, in its own (unzoomed, unrotated) units */
function dlgBox(d){
  const par = d.offsetParent || d.parentElement, r = brect(par), k = (par.offsetWidth ? r.width / par.offsetWidth : 1) || 1;
  // the whole screen in the container's units (the container itself sits below the top bar)
  return {r, k, w:vpW() / k, h:vpH() / k, x0:-r.left / k, y0:-r.top / k};
}
const dlgSet = (d, o) => { for (const [p, v] of Object.entries(o)) d.style.setProperty(p, v, 'important'); };
/* screen-scaled size: 60% of the screen wide, up to 60% tall; or the share the player picked */
const DLG_SHARE = .6;
function dlgSize(b){
  const fw = DLGM.size ? DLGM.size[0] : null, fh = DLGM.size ? DLGM.size[1] : null;
  const w = clamp(fw ? fw * b.w : b.w * DLG_SHARE, Math.min(320, b.w - 16), b.w - 16);
  const h = fh ? clamp(fh * b.h, 160, b.h - 16) : null;
  return {w, h};
}
function dlgPlace(d, x, y, w, h){
  const b = dlgBox(d);
  w = clamp(w, Math.min(280, b.w - 16), b.w - 16);
  const hh = h || Math.min(d.offsetHeight || 400, b.h * .86);
  x = clamp(x, b.x0, b.x0 + Math.max(0, b.w - w)); y = clamp(y, b.y0, b.y0 + Math.max(0, b.h - 48));
  const room = b.y0 + b.h - y - 8;
  dlgSet(d, {left:x + 'px', top:y + 'px', right:'auto', bottom:'auto', transform:'none', width:w + 'px', 'max-width':'none', zoom:'1',
    'max-height':Math.min(room, Math.round(b.h * (DLGM.size ? .92 : DLG_SHARE))) + 'px', height:h ? Math.min(hh, room) + 'px' : 'auto', animation:'none'});
}
/* a fresh open: centre it, sized to the screen */
function dlgCenter(d){
  const b = dlgBox(d), z = dlgSize(b), w = z.w, h = z.h, mh = DLGM.size ? .92 : DLG_SHARE;
  dlgSet(d, {width:w + 'px', height:h ? h + 'px' : 'auto', 'max-height':Math.round(b.h * mh) + 'px', transform:'none', zoom:'1', animation:'none'});
  const hh = h || Math.min(d.offsetHeight, b.h * mh);
  dlgPlace(d, b.x0 + (b.w - w) / 2, b.y0 + Math.max(8, (b.h - hh) / 2), w, h);
}
function dlgGrip(d){ if (!d.hidden && !d.querySelector('.dlg-grip')){ const g = document.createElement('div'); g.className = 'dlg-grip'; g.setAttribute('aria-hidden', 'true'); d.appendChild(g); } }
/* watch the dialog: centre on open, keep the grip after each re-render */
{
  const d = dlgEl();
  if (d){
    let was = d.hidden;
    new MutationObserver(() => {
      if (was && !d.hidden) requestAnimationFrame(() => dlgCenter(d));
      was = d.hidden; dlgGrip(d);
    }).observe(d, {attributes:true, attributeFilter:['hidden'], childList:true});
  }
}
document.addEventListener('pointerdown', e => {
  const d = dlgEl(); if (!d || d.hidden || !d.contains(e.target)) return;
  const grip = e.target.closest('.dlg-grip'), head = !grip && e.target.closest('.dh');
  if (!grip && (!head || e.target.closest('button,a,input,select,.wallet'))) return;
  const b = dlgBox(d), r = brect(d);
  DLGM.drag = {mode:grip ? 'size' : 'move', b, sx:ptX(e), sy:ptY(e), x:(r.left - b.r.left) / b.k, y:(r.top - b.r.top) / b.k, w:r.width / b.k, h:r.height / b.k};
  d.classList.add('dlg-drag');
  try { e.target.setPointerCapture(e.pointerId); } catch (er) {}
  e.preventDefault(); e.stopPropagation();
}, true);
document.addEventListener('pointermove', e => {
  const g = DLGM.drag, d = dlgEl(); if (!g || !d) return;
  const dx = (ptX(e) - g.sx) / g.b.k, dy = (ptY(e) - g.sy) / g.b.k;
  if (g.mode === 'move') dlgPlace(d, g.x + dx, g.y + dy, g.w, d.style.height && d.style.height !== 'auto' ? g.h : null);
  else dlgPlace(d, g.x, g.y, Math.max(280, g.w + dx), Math.max(160, g.h + dy));
}, true);
const dlgUp = () => {
  const g = DLGM.drag, d = dlgEl(); if (!g) return; DLGM.drag = null; if (d) d.classList.remove('dlg-drag');
  if (g.mode === 'size' && d){ const b = dlgBox(d); DLGM.size = [+(d.offsetWidth / b.w).toFixed(3), +(d.offsetHeight / b.h).toFixed(3)];
    try { localStorage.setItem(DLGM.KEY, JSON.stringify(DLGM.size)); } catch (e) {} }
};
document.addEventListener('pointerup', dlgUp, true); document.addEventListener('pointercancel', dlgUp, true);
/* double-click the header: back to the middle at the screen-scaled size */
document.addEventListener('dblclick', e => { const d = dlgEl(); if (!d || d.hidden || !e.target.closest('#dialog .dh') || e.target.closest('button')) return;
  DLGM.size = null; try { localStorage.removeItem(DLGM.KEY); } catch (er) {} dlgCenter(d); });
/* screen or UI scale changed: keep it inside the screen and at its share of the screen */
addEventListener('resize', () => { const d = dlgEl(); if (d && !d.hidden) setTimeout(() => dlgCenter(d), 120); });
