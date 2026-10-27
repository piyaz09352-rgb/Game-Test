/* VAYRATHEN — js/core/rotate.js
   The game always fits the window it is given, upright or sideways, and never turns by itself.
   For apps that never rotate their window, Settings → "Turn picture to landscape" turns the whole game 90° with
   CSS (html.rot). Every size media query has a twin with width↔height swapped that only applies under html.rot
   (tools/rotcss.py), and pointer positions / element boxes are read back through ptX/ptY/brect. */
'use strict';

const ROT = {on:false, dir:1, q:matchMedia('(orientation:portrait)'), tilt:0, tiltT:0, sensor:false};
const vpW = () => (ROT.on ? innerHeight : innerWidth), vpH = () => (ROT.on ? innerWidth : innerHeight);
// dir 1: turned +90° (local x runs down the screen); dir -1: turned −90° (local x runs up the screen)
const ptX = e => (!ROT.on ? e.clientX : ROT.dir > 0 ? e.clientY : innerHeight - e.clientY);
const ptY = e => (!ROT.on ? e.clientY : ROT.dir > 0 ? innerWidth - e.clientX : e.clientX);
function brect(n){
  const r = n.getBoundingClientRect(); if (!ROT.on) return r;
  if (ROT.dir > 0){ const B = innerWidth; return {left:r.top, top:B - r.right, right:r.bottom, bottom:B - r.left, width:r.height, height:r.width, x:r.top, y:B - r.right}; }
  const A = innerHeight; return {left:A - r.bottom, top:r.left, right:A - r.top, bottom:r.right, width:r.height, height:r.width, x:A - r.bottom, y:r.left};
}
const autoRot = () => false;   // never turns by itself: only the Settings switch turns the picture
/* the on-screen keyboard: while you type, the picture keeps its size and stays turned (the keyboard used to shrink the
   window, so the game squashed into the top half or flipped upright) */
const kbOpen = () => { const a = document.activeElement; return !!(a && a.matches && a.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]),textarea,[contenteditable="true"]')); };
document.addEventListener('focusout', () => setTimeout(() => { if (!kbOpen()) rotApply(); }, 350));
/* media queries written without a turned twin (added later, or injected by a script) would read the upright window and
   pick the wrong layout (e.g. the bag window stacking its two halves on top of each other). While turned, every such
   rule gets width↔height and portrait↔landscape swapped; rules that already know about html.rot are left alone. */
const ROT_MQ = new Map();   // CSSMediaRule → its original media text
function rotSwapMQ(t){ return t.replace(/\b(width|height|portrait|landscape)\b/g, w => ({width:'height', height:'width', portrait:'landscape', landscape:'portrait'})[w]); }
function rotMedia(on){
  const visit = list => { for (const r of list){
    if (r.type === 4 && r.media){ const txt = ROT_MQ.has(r) ? ROT_MQ.get(r) : r.media.mediaText;
      if (/width|height|orientation/.test(txt) && !/\.rot\b/.test(r.cssText)){ if (!ROT_MQ.has(r)) ROT_MQ.set(r, txt); const want = on ? rotSwapMQ(txt) : txt; if (r.media.mediaText !== want) try { r.media.mediaText = want; } catch (e) {} }
      try { visit(r.cssRules); } catch (e) {} }
    else if (r.cssRules) try { visit(r.cssRules); } catch (e) {} } };
  for (const sh of document.styleSheets){ let rules; try { rules = sh.cssRules; } catch (e) { continue; } if (rules) visit(rules); }
}
if (typeof MutationObserver !== "undefined"){ let t = 0; new MutationObserver(() => { if (!ROT.on) return; clearTimeout(t); t = setTimeout(() => rotMedia(ROT.on), 60); }).observe(document.head, {childList:true}); }
function rotApply(){
  if (ROT.on && kbOpen()) return;
  const want = autoRot() ? ROT.tilt !== 0 : !!(typeof SETTINGS !== 'undefined' && SETTINGS.turn);
  const on = want && ROT.q.matches, dir = autoRot() && ROT.tilt ? ROT.tilt : (typeof SETTINGS !== 'undefined' && SETTINGS.turnDir) || 1;
  const app = document.querySelector('.app'), de = document.documentElement;
  if (on !== ROT.on || dir !== ROT.dir){ ROT.on = on; ROT.dir = dir; de.classList.toggle('rot', on); de.classList.toggle('rcw', on && dir > 0); de.classList.toggle('rccw', on && dir < 0); rotMedia(on);
    if (typeof JOY !== 'undefined'){ JOY.active = false; JOY.vx = JOY.vy = 0; } }
  if (app){ if (on){ app.style.width = innerHeight + 'px'; app.style.height = innerWidth + 'px'; } else { app.style.width = app.style.height = ''; } }
  rotBtns();
  if (typeof resize === 'function') setTimeout(resize, 60);
}
/* the Portrait / Landscape button: shown whenever the page is upright */
function rotBtns(){
  for (const b of document.querySelectorAll('[data-rot]')){ b.hidden = !ROT.q.matches; const t = b.querySelector('.rt');
    if (t) t.textContent = ROT.on ? (typeof L === 'function' ? L('แนวตั้ง', 'Portrait') : 'แนวตั้ง') : (typeof L === 'function' ? L('แนวนอน', 'Landscape') : 'แนวนอน'); }
}
function rotToggle(){
  SETTINGS.autoRot = false; SETTINGS.turn = !ROT.on; SETTINGS.turnDir = ROT.dir || 1; if (typeof saveSettings === 'function') saveSettings(); rotApply();
  if (typeof toast === 'function') toast(ROT.on ? L('เล่นแนวนอน (หมุนเอง) · เปิด "หมุนจอตามมือถือ" ได้ในตั้งค่า', 'Landscape (manual) · turn "Follow phone rotation" back on in Settings') : L('เล่นแนวตั้ง', 'Portrait'));
}
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-rot]')){ e.preventDefault(); rotToggle(); } });
ROT.q.addEventListener?.('change', rotApply);
addEventListener('resize', () => { if (ROT.on || ROT.q.matches) rotApply(); });

/* finger scrolling while turned: the phone's own scrolling follows the upright screen, so a list turned sideways would
   not move (or move the wrong way). While turned, a finger drag inside any scrolling box (windows, menu, chat, dialogs)
   scrolls it along the picture's own axes, with a little glide after you let go. */
const RSC = {el:null, x:0, y:0, vx:0, vy:0, t:0, raf:0, moved:false};
function rscFind(n){
  for (; n && n !== document.body; n = n.parentElement){ if (!(n instanceof Element)) continue;
    if (n.matches('canvas,input[type=range],#joyZone,.mo,.mu')) return null;
    const cs = getComputedStyle(n);
    if ((/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 2) || (/(auto|scroll)/.test(cs.overflowX) && n.scrollWidth > n.clientWidth + 2)) return n; }
  return null;
}
document.addEventListener('touchstart', e => { if (!ROT.on || e.touches.length !== 1) { RSC.el = null; return; } cancelAnimationFrame(RSC.raf);
  const t = e.touches[0]; RSC.el = rscFind(e.target); RSC.x = ptX(t); RSC.y = ptY(t); RSC.vx = RSC.vy = 0; RSC.t = performance.now(); RSC.moved = false; }, {passive:true, capture:true});
document.addEventListener('touchmove', e => { const s = RSC.el; if (!ROT.on || !s || e.touches.length !== 1) return;
  const t = e.touches[0], x = ptX(t), y = ptY(t), dx = x - RSC.x, dy = y - RSC.y, now = performance.now(), dt = Math.max(1, now - RSC.t);
  if (!RSC.moved && Math.hypot(dx, dy) < 6) return; RSC.moved = true;
  s.scrollTop -= dy; s.scrollLeft -= dx; RSC.vy = dy / dt; RSC.vx = dx / dt; RSC.x = x; RSC.y = y; RSC.t = now;
  if (e.cancelable) e.preventDefault(); }, {passive:false, capture:true});
document.addEventListener('touchend', () => { const s = RSC.el; if (!s || !RSC.moved) { RSC.el = null; return; } let vx = RSC.vx * 16, vy = RSC.vy * 16; RSC.el = null;
  const glide = () => { vx *= .93; vy *= .93; if (Math.abs(vx) < .4 && Math.abs(vy) < .4) return; s.scrollTop -= vy; s.scrollLeft -= vx; RSC.raf = requestAnimationFrame(glide); };
  RSC.raf = requestAnimationFrame(glide); }, {capture:true});
/* a drag that scrolled is not also a tap on whatever button it started on */
document.addEventListener('click', e => { if (ROT.on && RSC.moved && performance.now() - RSC.t < 250){ RSC.moved = false; e.stopPropagation(); e.preventDefault(); } }, true);
