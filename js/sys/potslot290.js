/* VAYRATHEN — js/sys/potslot290.js — (v290) the potion slots work like the skill slots
   The owner: the two potion slots (hotbar 7 = HP, 8 = SP, and the two bottles beside the joystick) could not be changed
   and Auto could not be switched from them. Now, exactly as on a skill button:
   · tap                       → drink it (as before)
   · press and hold            → a picker of every HP (or SP) potion you carry, strongest first, plus "strongest
                                 automatically"; the one you pick stays in the slot (S.potSel) and Auto drinks it too
   · press, hold and slide down → Auto drinking on/off for that kind (the same switch as in the Auto window)
   A green "A" badge marks a potion slot Auto drinks from. */
'use strict';

const PTS = {p:null, timer:0, eat:false, HOLD:450, SLIDE:34, MOVE:14};
const ptsKind = b => (b.matches('.hk[data-hot]') ? (+b.dataset.hot === S.hot.length ? 'hp' : +b.dataset.hot === S.hot.length + 1 ? 'sp' : null)
  : b.matches('.mo.pot') ? (b.classList.contains('sp') ? 'sp' : 'hp') : null);
const ptsAutoOn = k => { const B = S.bot || {}; return k === 'hp' ? B.potHpOn !== false : B.potSpOn !== false; };

function ptsToggleAuto(k){
  if (typeof botSet === 'function') botSet();
  const B = S.bot = S.bot || {}, key = k === 'hp' ? 'potHpOn' : 'potSpOn'; B[key] = !ptsAutoOn(k); dirty = true;
  toast(B[key] ? L(k === 'hp' ? 'Auto กินยา HP' : 'Auto กินยา SP', k === 'hp' ? 'Auto drinks HP potions' : 'Auto drinks SP potions')
    : L(k === 'hp' ? 'Auto ไม่กินยา HP' : 'Auto ไม่กินยา SP', k === 'hp' ? 'Auto skips HP potions' : 'Auto skips SP potions'));
  renderHotbar(); if (UIS.open.auto && typeof renderAuto === 'function') renderAuto(); save();
}
function ptsClose(){ const w = el('potPick'); if (w) w.remove(); }
function ptsPick(b, k){
  ptsClose(); if (typeof skhClose === 'function') skhClose();
  const cur = (S.potSel || {})[k] || '', ids = POT_LIST(k).filter(id => S.inv[id] > 0 || id === cur), best = POT_LIST(k).find(id => S.inv[id] > 0);
  const amt = id => (k === 'hp' ? `HP +${fmtN(ITEMS[id].heal)}` : `SP +${fmtN(ITEMS[id].spheal)}`);
  const w = document.createElement('div'); w.id = 'potPick'; w.className = 'skpick potpick';
  w.innerHTML = `<div class="skpk-h">${k === 'hp' ? L('ยาในช่อง HP', 'HP potion slot') : L('ยาในช่อง SP', 'SP potion slot')}<button class="ibtn" data-ptsx="1" aria-label="${L('ปิด', 'Close')}">✕</button></div>
    <div class="skpk-l"><button class="skpk-i${!cur ? ' on' : ''}" data-pts="" data-ptsk="${k}"><span class="ico">★</span><b>${L('แรงสุดอัตโนมัติ', 'Strongest (auto)')}</b><small>${best ? escH(nm(ITEMS[best])) : L('ยังไม่มียา', 'none carried')}</small></button>
      ${ids.map(id => `<button class="skpk-i${cur === id ? ' on' : ''}" data-pts="${id}" data-ptsk="${k}" ${S.inv[id] ? '' : 'disabled'}><span class="ico">${itemIcon(id)}</span><b>${escH(nm(ITEMS[id]))}</b><small>${amt(id)} · ×${fmtN(S.inv[id] || 0)}</small></button>`).join('')
      || `<p class="empty">${L('ยังไม่มียาประเภทนี้ในกระเป๋า · ซื้อได้ที่ร้านยา', 'No potion of this kind in your bag · the potion shop sells them')}</p>`}</div>
    <label class="set potauto"><span><b>${k === 'hp' ? L('Auto กินยา HP', 'Auto drinks HP potions') : L('Auto กินยา SP', 'Auto drinks SP potions')}</b></span><input type="checkbox" data-ptsauto="${k}" ${ptsAutoOn(k) ? 'checked' : ''}><i class="sw"></i></label>
    <p class="skpk-tip">${L('แตะ = ดื่ม · กดค้าง = เลือกยา · กดค้างแล้วเลื่อนลง = เปิด/ปิด Auto', 'Tap = drink · Hold = pick the potion · Hold and slide down = Auto on/off')}</p>`;
  el('ui').appendChild(w);
  const r = brect(b), u = brect(el('ui')), pw = w.offsetWidth, ph = w.offsetHeight;
  const vw = ROT.on ? u.width : Math.min(u.width, (window.visualViewport ? visualViewport.width : innerWidth) - u.left);
  w.style.left = Math.round(Math.max(6, Math.min(vw - pw - 6, r.left - u.left + r.width / 2 - pw / 2))) + 'px';
  w.style.top = Math.round(Math.max(6, Math.min(u.height - ph - 6, r.top - u.top - ph - 8))) + 'px';
}
function ptsAssign(k, id){
  S.potSel = {...(S.potSel || {}), [k]:id || ''}; dirty = true; ptsClose(); renderHotbar(); save();
  toast(id ? L(`ช่องยา: ${nm(ITEMS[id])}`, `Potion slot: ${nm(ITEMS[id])}`) : L('ช่องยา: ยาที่แรงที่สุดอัตโนมัติ', 'Potion slot: the strongest, automatically'));
}

document.addEventListener('pointerdown', e => {
  if (el('potPick') && !e.target.closest('#potPick')) ptsClose();
  const b = e.target.closest && e.target.closest('.hk[data-hot], .mo.pot'); if (!b) return;
  const k = ptsKind(b); if (!k) return;
  const mo = b.matches('.mo.pot'); if (mo){ e.stopPropagation(); e.preventDefault(); b.classList.add('press'); try { b.setPointerCapture(e.pointerId); } catch (er) {} }   // the touch bottles drank on press: now on release, so a hold can open the picker
  clearTimeout(PTS.timer);
  PTS.p = {b, k, mo, x:e.clientX, y:e.clientY, pid:e.pointerId, t0:performance.now(), done:false, moved:false};
  PTS.timer = setTimeout(() => { const p = PTS.p; if (!p || p.done || p.moved) return; p.done = true; PTS.eat = true; p.b.style.transform = ''; ptsPick(p.b, p.k); }, PTS.HOLD);
}, true);
document.addEventListener('pointermove', e => {
  const p = PTS.p; if (!p || p.done || e.pointerId !== p.pid) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  if (dy > 6 && dy > Math.abs(dx)) p.b.style.transform = `translateY(${Math.min(dy, PTS.SLIDE) * .5}px)`;
  if (dy > PTS.SLIDE && dy > Math.abs(dx) * 1.2){ p.done = true; PTS.eat = true; clearTimeout(PTS.timer); p.b.style.transform = ''; ptsToggleAuto(p.k); return; }
  if (Math.hypot(dx, dy) > PTS.MOVE){ p.moved = true; clearTimeout(PTS.timer); }
}, true);
const ptsEnd = e => { const p = PTS.p; if (!p || e.pointerId !== p.pid) return; PTS.p = null; clearTimeout(PTS.timer); p.b.style.transform = ''; p.b.classList.remove('press');
  if (p.mo && e.type === 'pointerup' && !p.done && !p.moved && performance.now() - p.t0 < PTS.HOLD && typeof mobaAction === 'function') mobaAction(p.b.dataset.mo); };
document.addEventListener('pointerup', ptsEnd, true);
document.addEventListener('pointercancel', ptsEnd, true);
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-pts],[data-ptsx]');
  if (t){ e.stopPropagation(); if (t.dataset.ptsx) ptsClose(); else if (!t.disabled) ptsAssign(t.dataset.ptsk, t.dataset.pts); return; }
  if (PTS.eat && e.target.closest && e.target.closest('.hk[data-hot], .mo.pot')){ PTS.eat = false; e.stopPropagation(); e.preventDefault(); }   // a hold or a slide is not a drink
}, true);
document.addEventListener('change', e => { const c = e.target.closest && e.target.closest('[data-ptsauto]'); if (!c) return; if (ptsAutoOn(c.dataset.ptsauto) !== c.checked) ptsToggleAuto(c.dataset.ptsauto); });
addEventListener('keydown', e => { if (e.key === 'Escape') ptsClose(); });
document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('.mo.pot, #potPick')) e.preventDefault(); }, true);

/* the green "A" on the potion slots Auto drinks from */
function ptsDecorate(){
  const hb = el('hotbar'); if (hb) for (const b of hb.querySelectorAll('.hk[data-hot]')){ const k = ptsKind(b); if (k && typeof skhBadge === 'function') skhBadge(b, ptsAutoOn(k)); }
  const mp = el('mobaPot'); if (mp) for (const b of mp.querySelectorAll('.mo.pot')){ const k = ptsKind(b); if (k && typeof skhBadge === 'function') skhBadge(b, ptsAutoOn(k)); }
}
{ const _rh = renderHotbar; renderHotbar = function(){ _rh.apply(this, arguments); ptsDecorate(); }; }
{ const _rm = renderMoba; renderMoba = function(){ _rm.apply(this, arguments); ptsDecorate(); }; }
{ const st = document.createElement('style'); st.textContent = '.potpick .potauto{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 2px 0}.potpick .skpk-i[disabled]{opacity:.45}'; document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'potslot', t:['ช่องยา: แตะ กดค้าง เลื่อนลง', 'Potion slots: tap, hold, slide'], b:() => L(
  '<p><b>แตะ</b> = ดื่ม · <b>กดค้าง</b> = เลือกยาที่จะใส่ช่อง (หรือให้เลือกยาที่แรงที่สุดเอง) · <b>กดค้างแล้วเลื่อนลง</b> = เปิด/ปิด Auto กินยา · ป้าย A สีเขียว = Auto กินยาช่องนี้</p>',
  '<p><b>Tap</b> = drink · <b>Hold</b> = pick the potion for the slot (or let it take the strongest) · <b>Hold and slide down</b> = Auto drinking on/off · a green A = Auto drinks from this slot</p>')});
