/* VAYRATHEN — js/sys/hudfit.js — the HUD cards fit a phone and never sit on each other (v58)
   On a phone (joystick controls) the left column used to stack the hero card, the quest card, the target card and the
   party list on top of each other. Now, in joystick mode:
   · the target card always sits at the top in the middle (between the hero card and the menu), never in the column
     (hud.js layoutHud),
   · the party list starts under the quest card as it really is (open or folded),
   · on a short screen the hero, quest and party cards are drawn smaller, so the column still fits above the joystick.
   (v90) smaller again on a phone (70%), and the target card too (78%), so more of the field shows. */
'use strict';

const HFIT = {t:0};
function hudFit(){
  const ui = el('ui'); if (!ui) return; const moba = ui.classList.contains('moba');
  const pty = el('ptyHud'), gc = el('goalCard');
  document.documentElement.classList.toggle('hfit', moba);
  document.documentElement.classList.toggle('hfit-s', moba && brect(ui).height < 430);
  if (moba && pty && !pty.hidden && gc && !gc.hidden && gc.offsetHeight){
    const u = brect(ui), k = (u.width / (ui.offsetWidth || 1)) || 1, z = parseFloat(getComputedStyle(pty).zoom) || 1;   // CSS zoom scales 'top' too
    const top = Math.round(((brect(gc).bottom - u.top) / k + 6) / z) + 'px';
    if (pty.style.top !== top) pty.style.top = top;
  }
}
EV.on('tick', dt => { if ((HFIT.t -= dt) > 0) return; HFIT.t = .25; hudFit(); });
{ const _ph = typeof ptyHud === 'function' ? ptyHud : null; if (_ph) ptyHud = function(){ const r = _ph.apply(this, arguments); hudFit(); return r; }; }
{ const st = document.createElement('style');
  // (v132) the hero card and the quest card were made smaller (they took a big corner of the screen) — (v138) half was
  // too small to read: .72 (a short phone screen .6); the party list stays at .7 there
  st.textContent = `html body #ui.ui #charCard,html body #ui.ui #goalCard{zoom:.72}
  html.hfit-s body #ui.ui #charCard,html.hfit-s body #ui.ui #goalCard{zoom:.6}
  html.hfit-s body #ui.ui #ptyHud{zoom:.7}
  html.hfit-s body #ui.ui #target{zoom:.78}
  html.hfit body #ui.ui #ptyHud{left:8px}`;
  document.head.appendChild(st); }
