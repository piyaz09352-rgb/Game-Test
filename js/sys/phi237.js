/* VAYRATHEN — js/sys/phi237.js — (v237) keeps the quest card under the character card at a golden gap
   (the character card's height now follows its width ÷ φ, so the quest card below has to move with it). */
'use strict';
function phiLayout(){
  const c = el('charCard'), g = el('goalCard'), ui = el('ui'); if (!c || !g || !ui || g.hidden || getComputedStyle(g).position !== 'absolute') return;
  const edge = parseFloat(getComputedStyle(c).top) || 12, gap = Math.round(edge / 1.618), top = Math.round(c.offsetTop + c.offsetHeight + gap);
  if (g.style.getPropertyValue('top') !== top + 'px') g.style.setProperty('top', top + 'px', 'important');
}
setInterval(() => { try { phiLayout(); } catch (e) {} }, 400); window.addEventListener('resize', () => setTimeout(phiLayout, 50));
/* (v238) every window except the full-screen equipment screen takes the golden shape (css/phi237.css .phiw) */
function phiWins(){ for (const w of document.querySelectorAll('#ui > section.win')){ if (w.id === 'win-equip' || w.id === 'win-bag' || w.id === 'win-forge') continue; if (!w.classList.contains('phiw')) w.classList.add('phiw'); }
  const ui = el('ui'); if (ui){ const z = parseFloat(getComputedStyle(ui).zoom) || 1; if (document.documentElement.style.getPropertyValue('--uiz') !== String(z)) document.documentElement.style.setProperty('--uiz', String(z)); } }
setInterval(() => { try { phiWins(); } catch (e) {} }, 800); window.addEventListener('DOMContentLoaded', phiWins);
/* (v239) the joystick = the attack button × φ as seen on screen: the joystick group and the button group each have
   their own scale (the arrange mode / phone shrink), so the joystick's own size is set from what is on screen.
   Runs before the touch layout is placed (the joystick's frame is sized from it), never per frame. */
function phiJoy(){
  const ui = el('ui'), j = el('joy'), a = document.querySelector('#mobaAct .mo.atk'); if (!ui || !j || !a || !ui.classList.contains('moba') || !j.offsetWidth || !a.offsetWidth) return;
  const ka = a.getBoundingClientRect().width / a.offsetWidth, kj = j.getBoundingClientRect().width / j.offsetWidth; if (!ka || !kj) return;
  const want = Math.round(a.offsetWidth * ka * 1.618 / kj), now = parseFloat(document.documentElement.style.getPropertyValue('--phjoy')) || 168;
  if (Math.abs(want - now) >= 2) document.documentElement.style.setProperty('--phjoy', want + 'px');
  // the potions too (their own group, own scale): attack ÷ φ² on screen
  const pt = document.querySelector('#mobaPot .mo'); if (!pt || !pt.offsetWidth) return; const kp = pt.getBoundingClientRect().width / pt.offsetWidth; if (!kp) return;
  const wp = Math.round(a.offsetWidth * ka * .382 / kp), np = parseFloat(document.documentElement.style.getPropertyValue('--phpot')) || 40;
  if (Math.abs(wp - np) >= 2) document.documentElement.style.setProperty('--phpot', wp + 'px');
}
if (typeof heApply === 'function'){ const _ha = heApply; heApply = function(){ try { phiJoy(); } catch (e) {} return _ha.apply(this, arguments); }; }
setInterval(() => { try { phiJoy(); } catch (e) {} }, 1000);

/* (v247) wide windows lie down (css/phi237.css .phiwide). A window joins once and stays (no jumping between shapes):
   the ones whose content is a list beside a detail pane or a long tab bar, and any other window that turns out wider
   than its upright shape — measured right after it opens, while it is still upright. */
const PHI_WIDE = ['wiki', 'book', 'ach', 'craft', 'market', 'guild', 'siege', 'arena', 'house', 'gm'];
function phiTooWide(w){
  const bars = w.querySelectorAll('.wktabs, .sktabs, .tabs');
  for (const b of bars){ if (!b.offsetWidth) continue; let sum = 0; const gap = parseFloat(getComputedStyle(b).columnGap) || 4;
    for (const c of b.children) if (c.offsetWidth) sum += c.offsetWidth + gap; if (sum - gap > b.clientWidth + 4) return true; }
  for (const e of w.querySelectorAll('div, ul, section')){ if (!e.clientWidth || e.scrollWidth <= e.clientWidth + 4) continue;
    if (/auto|scroll|hidden/.test(getComputedStyle(e).overflowX) && !e.closest('.wktabs, .sktabs, .tabs')) return true; }
  return false;
}
function phiDecide(id){
  const w = winEl(id); if (!w || w.hidden || !w.classList.contains('phiw') || w.classList.contains('phiwide') || id === 'skill') return;
  if (PHI_WIDE.includes(id) || phiTooWide(w)){ w.classList.add('phiwide'); if (typeof fitWin === 'function') try { fitWin(id); } catch (e) {} }
}
if (typeof openWin === 'function'){ const _ow = openWin; openWin = function(id){ const r = _ow.apply(this, arguments);
  try { phiWins(); phiDecide(id); } catch (e) {} setTimeout(() => { try { phiDecide(id); } catch (e) {} }, 350); return r; }; }
