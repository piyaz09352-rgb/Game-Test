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
