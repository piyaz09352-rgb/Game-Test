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
function h6ChatBtn(){ const ui = el('ui'), cb = el('chatBtn'), ex = el('h6Exp'); if (!ui || !cb || cb.hidden || !ex || !ui.classList.contains('h6')) return;   // (v332) on PC too (it floated in the middle of the screen)
  const U = brect(ui), k = (U.height / (ui.offsetHeight || 1)) || 1, X = brect(ex), set = (n, v) => { v = Math.round(v) + 'px'; if (cb.style.getPropertyValue(n) !== v) cb.style.setProperty(n, v, 'important'); };
  const v = `auto auto ${Math.round((U.bottom - X.bottom) / k)}px ${Math.round((X.right - U.left) / k + 8)}px`; if (cb.style.getPropertyValue('inset') !== v) cb.style.setProperty('inset', v, 'important'); void set; }   // (moblay244 pins it with inset)
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
  const hand = h6Hand();   // a layout the player arranged: the buttons stay where they put them, the rest of the HUD is still placed
  // top right: the tiles, the minimap under them, the chips under that; the menu opens over the minimap
  hudPut(ic, m, m, 'r'); const I = R(ic);
  // the coin shop's own button (with its coin count) stands in the first tile's place, dressed as the gold orb
  { const cs = el('cshBtn'), slot = ic.querySelector('.h6-shop'); if (cs && slot){ const set = (n, v) => { v = Math.round(v) + 'px'; if (cs.style.getPropertyValue(n) !== v) cs.style.setProperty(n, v, 'important'); };
      const sb = brect(slot); set('left', (sb.left - U.left) / k); set('top', (sb.top - U.top) / k); if (cs.style.right !== 'auto') cs.style.setProperty('right', 'auto', 'important'); } }
  hudPut(mc, m, I.b + g * k, 'r'); const M = R(mc);
  if (ch && ch.offsetWidth) hudPut(ch, m, M.b + g * k, 'r');
  if (rl){ hudPut(rl, m, I.b + g * k, 'r'); rl.style.zIndex = rl.classList.contains('folded') ? '' : '45'; }
  // the open menu: as many columns as fit, as tall as the room under the orbs (down to the action buttons on PC)
  if (rl && !rl.classList.contains('folded')){ const top = I.b + g * k, low = moba ? U.height - m : (el('dock') && el('dock').offsetWidth ? Math.min(U.height - m, R(el('dock')).t - g * k) : U.height - m);
    const cols = (ui.offsetWidth < 900 ? 6 : 5), mh = Math.max(150, Math.round((low - top) / k - 8)); rl.style.setProperty('--h6c', cols); rl.style.setProperty('--h6mh', mh + 'px'); }
  // bottom left: EXP and the clock
  if (ex){ ex.style.left = Math.round(m / k) + 'px'; ex.style.bottom = Math.round(m / k * .8) + 'px'; }
  // the chat button on touch screens: beside the EXP pill along the bottom (it was dropped on top of the pill)
  h6ChatBtn();
  if (hand) return;
  if (moba){ const j = el('joy'), X = ex && R(ex); if (j && X){ const J = R(j); if (J.b > X.t - g * k && J.l < X.r){ const top = parseFloat(j.style.top) || (J.t / k); j.style.setProperty('top', Math.round(top - (J.b - X.t + g * k) / k) + 'px', 'important'); } } }
  else h6Pc(ui, U, k, m, g);
}
{ const _lh = layoutHud; layoutHud = function(){ const out = _lh.apply(this, arguments); try { h6Layout(); } catch (e) { console.warn('hud326', e); } return out; }; }
{ const _pc = placeChat; placeChat = function(){ const r = _pc.apply(this, arguments); try { h6Chat(); h6ChatBtn(); } catch (e) {} return r; }; }
{ const _rh = renderHotbar; renderHotbar = function(){ const r = _rh.apply(this, arguments); try { if (el('ui') && el('ui').classList.contains('h6pc')) h6Layout(); } catch (e) {} return r; }; }
setInterval(() => { try { h6Tick(); } catch (e) {} }, 1000);
/* the bright-theme readability pass (js/sys/sunread.js) darkens lettering it thinks sits on parchment: the new HUD is dark
   glass with white lettering, so it leaves the HUD cards alone (and what it already darkened goes back) */
/* (v328) windows in the new palette: cream panels and tiles go frosted lavender-white, gold buttons and chosen tabs a
   violet-cyan gradient with white lettering, brown ink deep indigo, gold edges and rings lavender. Item art, rarity frames,
   the equipment ring's slot colours and anything drawn from a picture keep their own colours. */
const H6_WSKIP = 'svg, canvas, img, .iart, .sico, .rar:not(.r0), .gdx, .dy, .dyesw, .cdv, .wt, .eqsl, .tcard, .tc-art, [style*="url("]';
const h6Hsl = c => { const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l]; const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h * 60, s, l]; };
const h6Rgb = s => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
const h6Goldish = c => { if (!c || c[3] < .15) return false; const [h, s, l] = h6Hsl(c); return h >= 26 && h <= 58 && s >= .35 && l >= .32 && l <= .82; };
const H6_DONE = new WeakSet(), H6_GOLD = new WeakSet(), H6_SIGS = new Set();
/* (v328) the recolouring goes into a style sheet, one rule per kind of element (its window and its classes), not onto the
   elements: windows that rebuild their rows by copying attributes (the bag) would wipe inline styles at every update */
const H6_SHEET = (() => { const st = document.createElement('style'); st.id = 'h6WinRules'; document.head.appendChild(st); return st.sheet; })();
const H6_TRANSIENT = /^(sdk|slt|wout)$/;   // state classes (on, sel…) stay in the key: a chosen tab gets its own rule
function h6Sig(e){ const cls = [...e.classList].filter(c => !H6_TRANSIENT.test(c)); if (!cls.length) return null;
  const scope = e.closest('.win') ? '.win' : e.closest('#confirm') ? '#confirm' : e.closest('.dialog') ? '.dialog' : e.closest('.cubox') ? '.cubox' : '.tipcard';   // (windows share their contents: the bag moves between two of them)
  return scope + ' ' + e.tagName.toLowerCase() + cls.map(c => '.' + CSS.escape(c)).join(''); }
function h6Apply(e, sig, P){ const keys = Object.keys(P); if (!keys.length){ if (sig) H6_SIGS.add(sig); return; }
  if (!sig){ for (const k of keys) if (e.style.getPropertyValue(k) !== P[k]) e.style.setProperty(k, P[k], 'important'); return; }   // an element without classes: on itself
  H6_SIGS.add(sig); const bgK = keys.filter(k => /^background/.test(k)), oth = keys.filter(k => !/^background/.test(k)), pre = 'html:is(#h6z#h6z#h6z#h6z, html) body.h6w ' + sig;
  try { if (bgK.length) H6_SHEET.insertRule(`${pre}:not([style*="background"]):not(.wt *){${bgK.map(k => `${k}:${P[k]} !important`).join(';')}}`, H6_SHEET.cssRules.length);
    if (oth.length) H6_SHEET.insertRule(`${pre}:not([style*="color"]):not(.wt *){${oth.map(k => `${k}:${P[k]} !important`).join(';')}}`, H6_SHEET.cssRules.length); } catch (x) {} }   // each element is recoloured once (a redrawn window makes new elements; nothing is rewritten again and again)
function h6Recolor(root){
  const all = [root, ...root.querySelectorAll('*:not(svg *)')];
  for (const e of all){ if (!e.style || H6_DONE.has(e) || (e.closest && e.closest(H6_WSKIP))) continue; H6_DONE.add(e); if (e.classList.contains('sdk') || e.classList.contains('slt')) e.classList.remove('sdk', 'slt');
    const sig = h6Sig(e); if (sig && H6_SIGS.has(sig)) continue;   // this kind of element already has its rule
    const P = {}, set = (x, k, v) => { P[k] = v; };
    const cs = getComputedStyle(e), bg = typeof srOwnBg === 'function' ? srOwnBg(cs) : h6Rgb(cs.backgroundColor);
    let kind = null; if (bg && bg[3] >= .2 && !/url\(/.test(cs.backgroundImage)){ const [h, s, l] = h6Hsl(bg); if (h >= 18 && h <= 62 && s >= .16 && l >= .8) kind = 'cream'; else if (h >= 26 && h <= 58 && s >= .45 && l >= .4 && l < .8) kind = 'gold'; }
    if (!kind && /url\(/.test(cs.backgroundImage) && /gradient\(/.test(cs.backgroundImage)){   // layers: picture(s) + cream gradient(s) → keep the pictures, the gradients go lavender
      const L = h6Layers(cs.backgroundImage); let ch = false; const out = L.map(x => { if (!/gradient\(/.test(x)) return x; const cols = (x.match(/rgba?\([^)]+\)/g) || []).map(h6Rgb); if (!cols.length) return x;
        const avg = cols.reduce((a, c) => a.map((v, i) => v + c[i]), [0, 0, 0, 0]).map(v => v / cols.length), [h, s2, l] = h6Hsl(avg); if (h >= 18 && h <= 62 && s2 >= .14 && l >= .74){ ch = true; return 'linear-gradient(180deg, rgba(252,251,255,.96), rgba(238,236,253,.96))'; } return x; });
      if (ch) set(e, 'background-image', out.join(', ')); }
    if (!kind && /url\(/.test(cs.backgroundImage)){ const bc = h6Rgb(cs.backgroundColor); if (bc && bc[3] >= .2){ const [h, s2, l] = h6Hsl(bc); if (h >= 18 && h <= 62 && s2 >= .16 && l >= .78) set(e, 'background-color', 'rgba(244,242,254,.96)'); } }   // a tile with a watermark: only its colour
    if (kind === 'cream'){ set(e, 'background', 'linear-gradient(180deg, rgba(252,251,255,.95), rgba(240,238,253,.95))'); }
    else if (kind === 'gold'){ H6_GOLD.add(e); set(e, 'background', 'linear-gradient(135deg, #9a6cff, #3fc6ff)'); set(e, 'color', '#fff'); set(e, '-webkit-text-fill-color', '#fff'); set(e, 'text-shadow', '0 1px 2px rgba(40,20,90,.45)'); set(e, 'box-shadow', '0 0 10px rgba(120,140,255,.55), 0 2px 6px rgba(40,20,90,.25)'); set(e, 'border-color', 'rgba(255,255,255,.6)'); }
    // edges and rings: gold → lavender
    if (kind !== 'gold'){ for (const side of ['Top', 'Right', 'Bottom', 'Left']){ const w = parseFloat(cs['border' + side + 'Width']); if (w > 0 && h6Goldish(h6Rgb(cs['border' + side + 'Color']))){ set(e, 'border-color', 'rgba(150,125,235,.5)'); break; } }
      if (cs.boxShadow && cs.boxShadow !== 'none' && /rgb/.test(cs.boxShadow)){ const nb = cs.boxShadow.replace(/rgba?\([^)]+\)/g, m => { const c = h6Rgb(m); return h6Goldish(c) ? `rgba(150,125,235,${Math.min(.65, c[3])})` : m; }); if (nb !== cs.boxShadow) set(e, 'box-shadow', nb); } }
    // lettering: brown ink → deep indigo, gold lettering → violet (only on its own text, never on the gradient buttons)
    if (kind !== 'gold' && [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())){ const fg = h6Rgb(cs.webkitTextFillColor && !/0\)$/.test(cs.webkitTextFillColor) ? cs.webkitTextFillColor : cs.color);
      if (fg){ const [h, s, l] = h6Hsl(fg); const inGold = e.closest && [...(function*(){ let n = e.parentElement; for (let i = 0; n && i < 3; i++, n = n.parentElement) yield n; })()].some(p => H6_GOLD.has(p));
        if (!inGold && h >= 12 && h <= 48 && s >= .12 && l < .42){ set(e, 'color', '#352c6a'); set(e, '-webkit-text-fill-color', '#352c6a'); }
        else if (!inGold && h >= 28 && h <= 56 && s >= .5 && l >= .3 && l <= .72){ set(e, 'color', '#6a44d8'); set(e, '-webkit-text-fill-color', '#6a44d8'); } } }
    h6Apply(e, sig, P); }
}
const h6Layers = v => { const out = []; let d = 0, cur = ''; for (const ch of v){ if (ch === '(') d++; else if (ch === ')') d--; if (ch === ',' && !d){ out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
const H6_WROOT = '.win, .dialog, .cubox, .tipcard, #confirm';
document.body.classList.add('h6w');
if (typeof srCheck === 'function'){ const _sc = srCheck; const H6_OWN = '#charCard, #goalCard, #mapCard, #target, #achPop, #banner, #chips, #h6Icons, #h6Exp';
  srCheck = function(root){ if (root && root.closest && document.body.classList.contains('h6w') && root.closest(H6_WROOT) && !root.closest(H6_OWN)){ try { h6Recolor(root); } catch (e) { console.warn('h6Recolor', e); } return; }
    if (root && root.closest && el('ui') && el('ui').classList.contains('h6') && root.closest(H6_OWN)){
      for (const e of [root, ...root.querySelectorAll('*')]){ if (e.classList.contains('sdk') || e.classList.contains('slt')) e.classList.remove('sdk', 'slt'); if (e.style && e.style.getPropertyPriority('color') === 'important'){ e.style.removeProperty('color'); e.style.removeProperty('-webkit-text-fill-color'); } }
      return; }
    return _sc.apply(this, arguments); }; }
/* new window content is recoloured at once, before it is painted (the shared queue above waits up to 1.5 s, so a window
   would first show cream and then change, and its later recolouring counted as the window "changing" while you play) */
new MutationObserver(list => { if (!document.body.classList.contains('h6w')) return;
  for (const r of list){
    if (r.type === 'attributes'){ const e = r.target; if (!e.hidden && e.matches && e.matches(H6_WROOT)) try { h6Recolor(e); } catch (x) {} continue; }
    for (const n of r.addedNodes){ if (n.nodeType !== 1 || !n.isConnected || !n.closest || !n.closest(H6_WROOT) || n.closest('#charCard, #goalCard, #mapCard, #target, #h6Icons')) continue; try { h6Recolor(n); } catch (x) {} } } })
  .observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['hidden']});
/* (v330) lite mode: the effect setting on low, or a phone with few cores / little memory */
function h6LiteCheck(){ const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3, coarse = matchMedia('(pointer:coarse)').matches;
  const on = (typeof GFX !== 'undefined' && GFX.fx === 0) || (coarse && weak); if (document.body.classList.contains('h6lite') !== on) document.body.classList.toggle('h6lite', on); }
h6LiteCheck(); setInterval(h6LiteCheck, 3000);
/* the coin shop placed its own button next to the minimap twice a second (js/sys/coinshop274.js cshPlace), undoing the orb's place
   (on PC it sat below the row); under the new HUD the HUD places it */
if (typeof cshPlace === 'function'){ const _cp = cshPlace; cshPlace = function(){ if (el('ui') && el('ui').classList.contains('h6') && el('h6Icons')) return; return _cp.apply(this, arguments); }; }
/* the touch layout (js/sys/moblay244.js) runs after the HUD and puts the chat button back under the quest card: place it after that too */
if (typeof mlyLayout === 'function'){ const _ml = mlyLayout; mlyLayout = function(){ const r = _ml.apply(this, arguments); try { h6ChatBtn(); } catch (e) {} return r; }; }
/* (v332) the banner (festival, boss news) always sits under the target pill: it was placed once when it appeared, so a
   target picked afterwards slid under it, and the HUD's zoom on PC was not counted */
function h6Banner(){ const b = el('banner'), ui = el('ui'); if (!b || !ui || !ui.classList.contains('h6') || b.hidden || !b.offsetWidth) return;
  const U = brect(ui), k = (U.height / (ui.offsetHeight || 1)) || 1; let y = 8;
  for (const id of ['target', 'tSt']){ const e = el(id); if (e && !e.hidden && e.offsetWidth){ const r = brect(e); if (r.height) y = Math.max(y, (r.bottom - U.top) / k + 6); } }
  const v = Math.round(y) + 'px'; if (b.style.getPropertyValue('top') !== v) b.style.setProperty('top', v, 'important'); }
setInterval(() => { try { h6Banner(); } catch (e) {} }, 200);
if (typeof banner === 'function'){ const _bn = banner; banner = function(){ const r = _bn.apply(this, arguments); requestAnimationFrame(() => { try { h6Banner(); } catch (e) {} }); return r; }; }
