/* VAYRATHEN — js/sys/hud326.js — (v326) one HUD for phone, tablet and PC, after the owner's reference
   The owner sent pictures of a phone and an iPad game screen: «UI like this on mobile», then «web and Windows to match»,
   «beautiful, fine, detailed, symmetrical», «colourful». Everything sits at the edges and the middle stays clear:
   · top left: a round portrait with the base level (red) and job level (blue) badges, slim HP and SP bars; the quest card under it;
   · top centre: the target in a pill (element ring, level and name, HP bar);
   · top right: four colour tiles — ร้านค้า · สกิล · กระเป๋า · เมนู — and the minimap under them (the menu opens over it);
   · bottom left: EXP and the clock in a small pill; the chat a see-through log;
   · bottom right: the attack button; on PC the six skill slots fan round it in two even rings (left, diagonal, up),
     the potions in a row above the fan and the small round buttons (ride, catch, Auto, settings, sit) in a row beside it.
     On touch screens the wheel keeps its own placing (js/sys/moblay244.js) and takes the same look.
   A layout the player arranged by hand (จัดตำแหน่งปุ่ม) is left alone. css/hud326.css draws it. */
'use strict';
const H6 = {on:true};
const H6_SVG = {
  shop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16l-1.2 10.2a2 2 0 01-2 1.8H7.2a2 2 0 01-2-1.8z"/><path d="M8.5 9V7a3.5 3.5 0 017 0v2"/><path d="M12 13.2l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 15.3l2-.3z" fill="currentColor" stroke-width="1"/></svg>',
  skill:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h9a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h9"/><path d="M11 6.5l.8 1.7 1.8.2-1.3 1.2.4 1.8-1.7-.9-1.7.9.4-1.8L8.4 8.4l1.8-.2z" fill="currentColor" stroke-width="1"/><path d="M19 7v10" opacity=".8"/></svg>',
  bag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12a2 2 0 012 2v8a3 3 0 01-3 3H7a3 3 0 01-3-3v-8a2 2 0 012-2z"/><path d="M9 8V6a3 3 0 016 0v2"/><path d="M4 13h16M10.5 13v2h3v-2"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
  ring:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>'};
function h6Hand(){ return typeof mlHand === 'function' ? mlHand() : false; }
function h6Build(){
  const ui = el('ui'); if (!ui || el('h6Icons')) return;
  ui.classList.add('h6');
  const ic = document.createElement('div'); ic.id = 'h6Icons';
  ic.innerHTML = [['shop', L('ร้านค้า', 'Shop')], ['skill', L('สกิล', 'Skills')], ['bag', L('กระเป๋า', 'Bag')], ['menu', L('เมนู', 'Menu')]]
    .map(([k, t]) => `<button class="h6-${k}" data-h6="${k}" aria-label="${t}"><span class="t">${H6_SVG[k]}<i class="dot"></i></span><b>${t}</b></button>`).join('');
  ic.addEventListener('click', e => { const b = e.target.closest('[data-h6]'); if (!b) return; e.stopPropagation(); const k = b.dataset.h6;
    if (typeof SFX !== 'undefined') try { SFX.play('click'); } catch (x) {}
    if (k === 'shop'){ const c = el('cshBtn'); if (c) c.click(); }
    else if (k === 'skill') toggleWin('skill'); else if (k === 'bag') toggleWin('bag');
    else if (k === 'menu' && typeof setRail === 'function'){ setRail(!RAIL.fold); layoutHud(); } });
  ui.appendChild(ic);
  const ex = document.createElement('div'); ex.id = 'h6Exp'; ex.innerHTML = '<i>EXP</i><span class="bar"><u></u></span><em>0%</em><s>00:00</s>'; ui.appendChild(ex);
  // the name plate: the level chips sit beside the name (the old badges on the portrait are hidden by the stylesheet)
  { const cn = document.querySelector('#charCard .cname'); if (cn && !cn.querySelector('.h6chips')){ const c = document.createElement('span'); c.className = 'h6chips'; c.innerHTML = '<i class="h6lv">Lv 1</i><i class="h6jl">Job 1</i>'; cn.appendChild(c); } }
  for (const [sel, t] of [['#hpBar', 'HP'], ['#charCard .bar.sp', 'SP']]){ const b = document.querySelector(sel); if (b) b.dataset.h6 = t; }
  const pt = document.querySelector('#charCard .portrait'); if (pt && !pt.querySelector('.h6job')){ const j = document.createElement('span'); j.className = 'h6job'; pt.appendChild(j); }
  const tg = el('target'); if (tg && !tg.querySelector('.h6ring')){ const r = document.createElement('span'); r.className = 'h6ring'; r.innerHTML = H6_SVG.ring; tg.appendChild(r); }
}
/* numbers that change: EXP, the clock, the job badge, the red dots */
function h6Tick(){
  const ex = el('h6Exp'); if (!ex || !S || !S.lvl) return;
  const nb = typeof nextBase === 'function' ? nextBase(S.lvl) : 0, p = nb ? Math.min(S.exp / nb, .999) * 100 : 0, d = new Date();
  const em = ex.querySelector('em'), u = ex.querySelector('u'), s = ex.querySelector('s'), pt = p.toFixed(1) + '%', ck = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  if (em.textContent !== pt){ em.textContent = pt; u.style.width = p + '%'; } if (s.textContent !== ck) s.textContent = ck;
  const j = document.querySelector('#charCard .h6job'); if (j && j.textContent !== String(S.jlvl)) j.textContent = String(S.jlvl);
  const lv = document.querySelector('#charCard .h6lv'), jl = document.querySelector('#charCard .h6jl'), lt = 'Lv ' + S.lvl, jt = 'Job ' + S.jlvl;
  if (lv && lv.textContent !== lt) lv.textContent = lt; if (jl && jl.textContent !== jt) jl.textContent = jt;
  const dot = (k, on) => { const e = document.querySelector(`#h6Icons .h6-${k} .dot`); if (e && e.classList.contains('on') !== !!on) e.classList.toggle('on', !!on); };
  dot('skill', S.skPts > 0); dot('menu', typeof railDot === 'function' && [...document.querySelectorAll('#rail .menu .dot')].some(x => !x.hidden));
}
/* PC: the action cluster round the attack button */
function h6Pc(ui, U, k, m, g){
  const hb = el('hotbar'), dock = el('dock'), pa = el('pcAtk'), atk = pa && pa.querySelector('.mo.atk'); if (!hb || !dock || !atk) return;
  const kids = [...hb.children].filter(e => e.classList.contains('hk')), sk = kids.slice(0, 6), pots = kids.slice(6, 8), ut = kids.slice(8);
  sk.forEach(e => e.classList.add('h6sk')); pots.forEach(e => e.classList.add('h6pot')); ut.forEach(e => e.classList.add('h6ut'));
  const W = ui.offsetWidth, H = ui.offsetHeight, A = atk.offsetWidth || 80, s = 54, p = 50, u = 44;
  const ar = brect(atk), ax = (ar.left + ar.width / 2 - U.left) / k, ay = (ar.top + ar.height / 2 - U.top) / k;
  // two even rings: left, the diagonal and straight up — symmetrical about the diagonal
  const r1 = A / 2 + g + s * .72, r2 = r1 + s + g + 4, at = [180, 135, 90].map(a => a * Math.PI / 180);
  const pts = [];
  at.forEach(a => pts.push([ax + Math.cos(a) * r1, ay - Math.sin(a) * r1, s]));
  at.forEach(a => pts.push([ax + Math.cos(a) * r2, ay - Math.sin(a) * r2, s]));
  const potY = ay - r2 - s / 2 - g - p / 2, potPts = pots.map((e, i) => [ax + A / 2 - p / 2 - i * (p + g), potY, p]);
  const utY = ay + A / 2 - u / 2, ut0 = ax - r2 - s / 2 - g * 2 - u / 2, utPts = ut.map((e, i) => [ut0 - (ut.length - 1 - i) * (u + g), utY, u]);
  const all = [...pts.slice(0, sk.length), ...potPts, ...utPts];
  const x0 = Math.min(...all.map(q => q[0] - q[2] / 2)) - 4, y0 = Math.min(...all.map(q => q[1] - q[2] / 2)) - 4, x1 = Math.max(...all.map(q => q[0] + q[2] / 2)) + 4, y1 = Math.max(...all.map(q => q[1] + q[2] / 2)) + 4;
  const set = (e, o) => { for (const n in o){ const v = typeof o[n] === 'number' ? Math.round(o[n]) + 'px' : o[n]; if (e.style.getPropertyValue(n) !== v || e.style.getPropertyPriority(n) !== 'important') e.style.setProperty(n, v, 'important'); } };
  set(dock, {left:x0, top:y0, width:x1 - x0, height:y1 - y0, right:'auto', bottom:'auto'});
  const put = (e, q) => set(e, {left:q[0] - q[2] / 2 - x0, top:q[1] - q[2] / 2 - y0});
  sk.forEach((e, i) => put(e, pts[i])); pots.forEach((e, i) => put(e, potPts[i])); ut.forEach((e, i) => put(e, utPts[i]));
  // the chat log: bottom, from a quarter of the screen to the small round buttons
  const ex = el('h6Exp'), exR = ex ? (brect(ex).right - U.left) / k : 0, cl = Math.max(exR + g * 2, W * .26), cr = x0 - g * 2;
  H6.chat = cr - cl > 220 ? {left:cl, width:Math.min(460, cr - cl), bottom:m / k} : null; h6Chat();
}
function h6Chat(){ const cb = el('chatBox'), ui = el('ui'); if (!cb || !H6.chat || !ui || !ui.classList.contains('h6pc') || h6Hand()) return;
  const c = H6.chat, set = (n, v) => { v = Math.round(v) + 'px'; if (cb.style.getPropertyValue(n) !== v) cb.style.setProperty(n, v, 'important'); };
  set('left', c.left); set('width', c.width); set('bottom', c.bottom); if (cb.style.right !== 'auto') cb.style.setProperty('right', 'auto', 'important'); if (cb.style.top !== 'auto') cb.style.setProperty('top', 'auto', 'important'); }
function h6Layout(){
  const ui = el('ui'); if (!ui || ui.classList.contains('on-title') || !H6.on) return;
  h6Build(); h6Tick();
  const cc = el('charCard'), mc = el('mapCard'), ic = el('h6Icons'), ch = el('chips'), rl = el('rail'), ex = el('h6Exp');
  if (!cc || !mc || !ic || cc.offsetWidth === 0) return;
  const U = brect(ui), k = (U.height / (ui.offsetHeight || 1)) || 1, R = e => { const b = brect(e); return {l:b.left - U.left, t:b.top - U.top, r:b.right - U.left, b:b.bottom - U.top, w:b.width, h:b.height}; };
  const c = R(cc), m = Math.max(6, Math.round(c.l)), g = 8, moba = ui.classList.contains('moba');
  ui.classList.toggle('h6pc', !moba);
  if (h6Hand()) return;
  // top right: the tiles, the minimap under them, the chips under that; the menu opens over the minimap
  hudPut(ic, m, m, 'r'); const I = R(ic);
  // the coin shop's own button (with its coin count) stands in the first tile's place, dressed as the gold orb
  { const cs = el('cshBtn'), slot = ic.querySelector('.h6-shop'); if (cs && slot){ const S0 = R(slot), set = (n, v) => { v = Math.round(v) + 'px'; if (cs.style.getPropertyValue(n) !== v) cs.style.setProperty(n, v, 'important'); };
      set('left', S0.l / k); set('top', S0.t / k); if (cs.style.right !== 'auto') cs.style.setProperty('right', 'auto', 'important'); } }
  hudPut(mc, m, I.b + g * k, 'r'); const M = R(mc);
  if (ch && ch.offsetWidth) hudPut(ch, m, M.b + g * k, 'r');
  if (rl){ hudPut(rl, m, I.b + g * k, 'r'); rl.style.zIndex = rl.classList.contains('folded') ? '' : '45'; }
  // bottom left: EXP and the clock
  if (ex){ ex.style.left = Math.round(m / k) + 'px'; ex.style.bottom = Math.round(m / k * .8) + 'px'; }
  if (moba){ const j = el('joy'), X = ex && R(ex); if (j && X){ const J = R(j); if (J.b > X.t - g * k && J.l < X.r){ const top = parseFloat(j.style.top) || (J.t / k); j.style.setProperty('top', Math.round(top - (J.b - X.t + g * k) / k) + 'px', 'important'); } } }
  else h6Pc(ui, U, k, m, g);
}
{ const _lh = layoutHud; layoutHud = function(){ const out = _lh.apply(this, arguments); try { h6Layout(); } catch (e) { console.warn('hud326', e); } return out; }; }
{ const _pc = placeChat; placeChat = function(){ const r = _pc.apply(this, arguments); try { h6Chat(); } catch (e) {} return r; }; }
{ const _rh = renderHotbar; renderHotbar = function(){ const r = _rh.apply(this, arguments); try { if (el('ui') && el('ui').classList.contains('h6pc')) h6Layout(); } catch (e) {} return r; }; }
setInterval(() => { try { h6Tick(); } catch (e) {} }, 1000);
/* the bright-theme readability pass (js/sys/sunread.js) darkens lettering it thinks sits on parchment: the new HUD is dark
   glass with white lettering, so it leaves the HUD cards alone (and what it already darkened goes back) */
if (typeof srCheck === 'function'){ const _sc = srCheck; const H6_OWN = '#charCard, #goalCard, #mapCard, #target, #achPop, #banner, #chips, #h6Icons, #h6Exp';
  srCheck = function(root){ if (root && root.closest && el('ui') && el('ui').classList.contains('h6') && root.closest(H6_OWN)){
      for (const e of [root, ...root.querySelectorAll('*')]){ e.classList.remove('sdk', 'slt'); if (e.style && e.style.getPropertyPriority('color') === 'important'){ e.style.removeProperty('color'); e.style.removeProperty('-webkit-text-fill-color'); } }
      return; }
    return _sc.apply(this, arguments); }; }
