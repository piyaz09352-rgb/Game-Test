/* VAYRATHEN — js/sys/potright.js — the HP/SP potion buttons sit with the right thumb
   On touch controls the two potion buttons used to stand beside the joystick. They now sit in a row at the
   right edge, just above the skill cluster, so a potion is one short reach from the attack button and nothing
   covers the left side of the screen. */
'use strict';

function potPlace(){
  const ui = el('ui'), pot = el('mobaPot'), act = el('mobaAct');
  if (!ui || !pot || !act || !ui.classList.contains('moba') || !pot.offsetWidth) return;
  if (typeof HE !== 'undefined' && typeof heOri === 'function' && (HE.data[heOri()] || {}).pot) return;   // (v112) the player placed it by hand
  const u = brect(ui), k = (u.width / (ui.offsetWidth || 1)) || 1;
  const mos = [...act.querySelectorAll('.mo')].filter(b => b.offsetWidth).map(brect); if (!mos.length) return;
  // (v146) ONE rule, the same on every screen: the two potions stand as a column just left of the skill wheel, their
  // bottom level with the dodge button's — lifted above the small buttons if those reach that far. (Before there were
  // two layouts chosen by screen size, a step-by-step search for free room, and a run that could come before the
  // skill wheel had settled: sometimes neat, sometimes floating.)
  pot.classList.add('right', 'col');
  for (const k2 of ['inset', 'transform', 'transform-origin']) if (pot.style.getPropertyPriority(k2)) pot.style.removeProperty(k2);   // left over from an older placer
  const pr = brect(pot), w = pr.width, h = pr.height, gap = 8 * k;
  const roll = act.querySelector('.mo.roll'), anchor = roll && roll.offsetWidth ? brect(roll) : mos.reduce((a, r) => (r.bottom > a.bottom ? r : a));
  const left = Math.min(...mos.map(r => r.left));
  let x = left - gap - w, y = anchor.bottom - h;
  const util = [...document.querySelectorAll('#mobaUtil .mu')].filter(b => b.offsetWidth).map(brect);
  for (const r of util) if (r.left < x + w && r.right > x && r.top < y + h) y = Math.min(y, r.top - gap - h);
  y = Math.max(u.top + 4 * k, y);
  const L = Math.round((x - u.left) / k) + 'px', T = Math.round((y - u.top) / k) + 'px';
  if (pot.style.left !== L) pot.style.left = L;
  if (pot.style.top !== T) pot.style.top = T;
}
{ const _lh = layoutHud; layoutHud = function(){ const out = _lh.apply(this, arguments); potPlace(); return out; }; }
{ const _rm = renderMoba; renderMoba = function(){ const out = _rm.apply(this, arguments); potPlace(); return out; }; }
addEventListener('resize', () => setTimeout(potPlace, 120));
setTimeout(() => { if (typeof heApply === 'function'){ const _ha = heApply; heApply = function(){ const out = _ha.apply(this, arguments); requestAnimationFrame(potPlace); return out; }; } }, 0);   // (after hudedit.js and joylay.js have loaded)
{ const _rm2 = renderMoba; renderMoba = function(){ const out = _rm2.apply(this, arguments); requestAnimationFrame(potPlace); return out; }; }
setTimeout(potPlace, 0);
/* (v146) whenever a skill button is moved (the wheel is laid out by joylay/joyfit, sometimes a moment later), follow it */
{ let q = 0; const later = () => { if (!q) q = requestAnimationFrame(() => { q = 0; potPlace(); }); };
  const watch = () => { const a = el('mobaAct'), u = el('mobaUtil'); if (!a) return setTimeout(watch, 500);
    const mo = new MutationObserver(later); mo.observe(a, {attributes:true, attributeFilter:['style', 'class'], subtree:true, childList:true}); if (u) mo.observe(u, {attributes:true, attributeFilter:['style', 'class']}); };
  setTimeout(watch, 0); }
{
  const st = document.createElement('style');
  st.textContent = `.ui.moba .mobapot.right{flex-direction:row!important;right:auto!important;bottom:auto!important;gap:8px!important;z-index:9!important}
  .ui.moba .mobapot.right.col{flex-direction:column!important}`;
  document.head.appendChild(st);
}
