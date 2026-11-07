/* VAYRATHEN — js/sys/moblay244.js — (v244) one layout for the touch controls, worked out from the real screen
   The owner on a phone: buttons on top of each other, cut off at the edges, too big — not playable. Five placers
   (hudedit's default spots with a fixed ×1.2 scale, joylay's rings, joyfit's search, potright, phi239's sizes) each
   moved part of it, all from fixed pixel sizes, so a shorter phone (or one with the browser bars showing) broke it.
   This runs last, every time the HUD is laid out, and places everything from the screen's own width and height:
   · sizes in golden steps from the attack button A (about a quarter of the screen height, less if the minimap would
     be in the way): big skills A/φ · dodge, small skills, potions, small buttons A/φ² · joystick A·φ;
   · the attack button in the bottom-right corner, the big skills on a ring round it and the dodge + small skills on a
     wider ring (from just below its left round to just past straight up), never under the minimap;
   · the potions and the small buttons in a row along the bottom between the joystick and the ring (a second row
     above it when the screen is too narrow); the chat button under the quest card, above the joystick;
   · the joystick in the bottom-left corner, whole on screen.
   A layout the player arranged by hand (จัดตำแหน่งปุ่ม) is left exactly as they made it. */
'use strict';
const MLY = {key:'', on:false};
const mlVis = e => e && !e.hidden && e.offsetWidth > 0 && getComputedStyle(e).display !== 'none';
function mlSet(e, o){ for (const k in o){ const v = typeof o[k] === 'number' ? Math.round(o[k]) + 'px' : o[k]; if (e.style.getPropertyValue(k) !== v || e.style.getPropertyPriority(k) !== 'important') e.style.setProperty(k, v, 'important'); } }
function mlHand(){ return typeof HE !== 'undefined' && (HE.on || Object.keys((HE.data && typeof heOri === 'function' && HE.data[heOri()]) || {}).length > 0); }
function mlyLayout(){
  const ui = el('ui'); if (!ui || !ui.classList.contains('moba') || ui.classList.contains('on-title')) { mlyOff(); return; }
  if (mlHand()){ mlyOff(); return; }
  const act = el('mobaAct'), pot = el('mobaPot'), util = el('mobaUtil'), zone = el('joyZone'), joy = el('joy'), chat = el('chatBtn');
  if (!act || !mlVis(act)) return;
  const W = ui.offsetWidth, H = ui.offsetHeight, ub = ui.getBoundingClientRect(), k = (ub.height / (H || 1)) || 1;
  const rel = e => { const r = e.getBoundingClientRect(); return {x:(r.left - ub.left) / k, y:(r.top - ub.top) / k, w:r.width / k, h:r.height / k}; };
  const atk = act.querySelector('.mo.atk'), big = [...act.querySelectorAll('.mo.sk:not(.mini)')], small = [...act.querySelectorAll('.mo.sk.mini')], roll = act.querySelector('.mo.roll');
  const pots = pot ? [...pot.children].filter(e => e.offsetWidth || e.classList.contains('mo')) : [], mus = util ? [...util.querySelectorAll('.mu')].filter(e => !e.hidden && getComputedStyle(e).display !== 'none') : [];
  const map = el('mapCard'), goal = el('goalCard'), char = el('charCard');
  const mapR = mlVis(map) && !map.classList.contains('folded') ? rel(map) : null, goalR = mlVis(goal) ? rel(goal) : (mlVis(char) ? rel(char) : null);
  const key = [W, H, big.length, small.length, !!roll, pots.length, mus.length, mapR ? Math.round(mapR.y + mapR.h) : 0, goalR ? Math.round(goalR.y + goalR.h) : 0].join('|');
  MLY.on = true; ui.classList.add('ml244');
  // sizes
  const m = Math.max(6, Math.round(H * .028)), g = Math.max(4, Math.round(H * .016));
  const top = mapR ? mapR.y + mapR.h + g : m;
  let A = Math.min(H * .25, W * .13, (H - m - 2.5 * g - top) / 2.25);
  A = Math.round(Math.max(64, Math.min(112, A)));   // a thumb is a thumb: big tablets do not get giant buttons
  const S = Math.round(A / 1.618), s = Math.round(A / 2.618);
  let J = Math.round(Math.min(A * 1.618, H * .44));
  // the attack button: bottom right (its gold rim reaches past its box: keep 8% clear)
  const pad = A * .08, ax = W - m - pad - A / 2, ay = H - m - pad - A / 2;
  const rects = [];
  const put = (e, cx, cy, d) => { mlSet(e, {position:'absolute', left:cx - d / 2, top:cy - d / 2, width:d, height:d, right:'auto', bottom:'auto', margin:'0px'}); rects.push({x:cx - d / 2, y:cy - d / 2, w:d, h:d, cx, cy, r:d / 2}); };
  for (const c of [act, pot, util]) if (c) mlSet(c, {left:'0px', top:'0px', right:'auto', bottom:'auto', width:W + 'px', height:H + 'px', transform:'none', display:'block', 'pointer-events':'none', padding:'0px'});
  for (const e of [atk, ...big, ...small, roll, ...pots, ...mus]) if (e) e.style.setProperty('pointer-events', 'auto', 'important');
  if (atk) put(atk, ax, ay, A);
  // rings: from just below the left (165°) round to just past straight up (285°)
  const a0 = Math.PI * 165 / 180, a1 = Math.PI * 285 / 180;
  const ring = (items, d, rMin) => { const n = items.length; if (!n) return rMin; const step = n > 1 ? (a1 - a0) / (n - 1) : 0;
    const r = Math.max(rMin, n > 1 ? (d + g) / (2 * Math.sin(step / 2)) : rMin);
    items.forEach((e, i) => { const a = a0 + step * i; put(e, ax + Math.cos(a) * r, ay + Math.sin(a) * r, d); }); return r; };
  const r1 = ring(big, S, A / 2 + g + S / 2);
  const outer = roll ? [roll, ...small] : small;
  ring(outer, s, r1 + S / 2 + g + s / 2);
  // the joystick: bottom left, whole on screen (its ring is drawn a little outside its box)
  const jp = J * .05, jx = m + jp + J / 2, jy = H - m - jp - J / 2;
  if (zone) mlSet(zone, {left:'0px', bottom:'0px', top:'auto', right:'auto', width:Math.max(W * .42, J + 2 * m + 40) + 'px', height:Math.max(H * .6, J + 2 * m + 40) + 'px', transform:'none'});
  ui.style.setProperty('--mlJ', J + 'px'); ui.style.setProperty('--mlJx', (jx) + 'px'); ui.style.setProperty('--mlJb', (m + jp) + 'px');
  const joyR = {x:jx - J / 2, y:jy - J / 2, w:J, h:J};
  // the chat button: under the quest card, above the joystick (else at the start of the bottom row)
  let chatInRow = false;
  if (chat && mlVis(chat)){ const cw = chat.offsetWidth, ch = chat.offsetHeight, cy = (goalR ? goalR.y + goalR.h : m) + g;
    if (cy + ch <= joyR.y - g) mlSet(chat, {position:'absolute', left:m + 'px', top:cy + 'px', right:'auto', bottom:'auto'}); else chatInRow = true; }
  // the bottom row(s): potions then small buttons, right to left, from the ring's lower-left edge to the joystick
  const row = [...pots, ...mus]; let y = H - m - s / 2, rowN = 0;
  const leftEdge = joyR.x + joyR.w + g, rightEdgeAt = yc => { let xr = W - m; for (const q of rects) if (q.y < yc + s / 2 + g && q.y + q.h > yc - s / 2 - g) xr = Math.min(xr, q.x - g); return xr; };
  let x = rightEdgeAt(y) - s / 2;
  for (const e of row){
    if (x - s / 2 < leftEdge){ rowN++; y -= s + g; x = rightEdgeAt(y) - s / 2; }
    put(e, x, y, s); x -= s + g;
  }
  if (chatInRow && chat){ const cw = chat.offsetWidth, ch = chat.offsetHeight; mlSet(chat, {position:'absolute', left:Math.max(leftEdge, x - cw + s / 2) + 'px', top:(y - ch / 2) + 'px', right:'auto', bottom:'auto'}); }
  MLY.key = key;
}
function mlyOff(){ if (!MLY.on) return; MLY.on = false; const ui = el('ui'); if (ui) ui.classList.remove('ml244');
  for (const id of ['mobaAct', 'mobaPot', 'mobaUtil', 'joyZone', 'chatBtn']){ const c = el(id); if (!c) continue;
    for (const p of ['left', 'top', 'right', 'bottom', 'width', 'height', 'transform', 'display', 'pointer-events', 'padding', 'position']) if (c.style.getPropertyPriority(p) === 'important') c.style.removeProperty(p);
    for (const e of c.querySelectorAll('.mo,.mu')) for (const p of ['left', 'top', 'right', 'bottom', 'width', 'height', 'position', 'margin', 'pointer-events']) e.style.removeProperty(p); }
  if (typeof heApply === 'function') try { heApply(); } catch (e) {} }
/* after every other placer */
for (const fn of ['heApply', 'layoutHud', 'renderMoba']){ if (typeof window[fn] !== 'function') continue; const _f = window[fn];
  window[fn] = function(){ const r = _f.apply(this, arguments); try { if (fn !== 'heApply' || !MLY.busy) mlyLayout(); } catch (e) {} return r; }; }
{ const _off = mlyOff; mlyOff = function(){ MLY.busy = true; try { return _off.apply(this, arguments); } finally { MLY.busy = false; } }; }
window.addEventListener('resize', () => setTimeout(() => { try { mlyLayout(); } catch (e) {} }, 120));
setInterval(() => { try { mlyLayout(); } catch (e) {} }, 700);
{ const st = document.createElement('style'); st.textContent = `
  html body #ui.ui.moba.ml244 .joy{width:var(--mlJ)!important;height:var(--mlJ)!important}
  html body #ui.ui.moba.ml244 .joy:not(.live){left:var(--mlJx)!important;bottom:var(--mlJb)!important;top:auto!important;transform:translate(-50%,0)!important}
  html body #ui.ui.moba.ml244 .joy .knob{width:calc(var(--mlJ) * .382)!important;height:calc(var(--mlJ) * .382)!important;margin:calc(var(--mlJ) * -.191) 0 0 calc(var(--mlJ) * -.191)!important}
  html body #ui.ui.moba.ml244 #mobaAct .mo,html body #ui.ui.moba.ml244 #mobaPot .mo,html body #ui.ui.moba.ml244 #mobaUtil .mu{position:absolute!important}`; document.head.appendChild(st); }
/* a group redrawn on its own (the potion counts, the small buttons) is placed again at once */
{ let q = 0; const mo = new MutationObserver(() => { if (q) return; q = requestAnimationFrame(() => { q = 0; try { mlyLayout(); } catch (e) {} }); });
  const watch = () => { for (const id of ['mobaAct', 'mobaPot', 'mobaUtil']){ const c = el(id); if (c && !c._mly){ c._mly = 1; mo.observe(c, {childList:true}); } } };
  watch(); setInterval(watch, 2000); }
/* the old placers stand aside while this layout is in charge (potright set the potion box's left/top every HUD pass,
   which wiped this layout's position for a moment: the potions jumped between two spots) */
if (typeof potPlace === 'function'){ const _pp = potPlace; potPlace = function(){ if (MLY.on) return; return _pp.apply(this, arguments); }; }
if (typeof jlLayout === 'function'){ const _jl = jlLayout; jlLayout = function(){ if (MLY.on) return; return _jl.apply(this, arguments); }; }
if (typeof jfFitHE === 'function'){ const _jf = jfFitHE; jfFitHE = function(){ if (MLY.on) return; return _jf.apply(this, arguments); }; }
