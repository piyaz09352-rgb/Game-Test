/* VAYRATHEN — js/sys/skillhold.js — skill buttons you can hold
   On the touch skill cluster and on the hotbar's skill slots:
   · tap            → use the skill (as before)
   · press and hold → a picker opens to change which skill sits in that slot (or empty it)
   · press, hold and slide down → Auto on/off for that skill (the same tick as in the Auto window)
   · area skills: drag the button up or sideways onto the field → a circle follows your finger, let go to cast there
   A small "A" badge marks the skills Auto will use. Empty skill slots can be held too, to fill them. */
'use strict';

const SKH = {p:null, timer:0, eatClick:false, HOLD:450, SLIDE:34, MOVE:14};
const skhAutoOn = id => { if (!id || typeof botSet !== 'function') return false; const e = botSet().list.find(v => v.id === id); return !!(e && e.on); };
function skhSlot(b){
  if (b.matches('.mo.sk')) return b.dataset.slot != null ? +b.dataset.slot : -1;
  if (b.matches('.hk[data-hot]')){ const i = +b.dataset.hot; return i < S.hot.length ? i : -1; }
  return -1;
}
function skhToggleAuto(id){
  if (!id){ toast(L('ช่องนี้ยังว่าง · กดค้างเพื่อใส่สกิล', 'This slot is empty · hold to put a skill in')); return; }
  const e = botSet().list.find(v => v.id === id);
  if (!e){ toast(L('สกิลนี้ใช้กับ Auto ไม่ได้', 'Auto cannot use this skill')); return; }
  e.on = !e.on; dirty = true;
  toast(e.on ? L(`Auto ใช้ ${skName(SKILLS[id])}`, `Auto uses ${skName(SKILLS[id])}`) : L(`Auto ไม่ใช้ ${skName(SKILLS[id])}`, `Auto skips ${skName(SKILLS[id])}`));
  if (typeof SFX !== 'undefined' && SFX.click) try { SFX.click(); } catch (err) {}
  renderHotbar(); if (UIS.open.auto && typeof renderAuto === 'function') renderAuto();
}
/* the slot picker: every learned skill you can press, plus "empty" */
function skhPick(b, slot){
  skhClose();
  const ids = ownedSkillIds().filter(id => skl(id) && SKILLS[id].type !== 'passive');
  const w = document.createElement('div'); w.id = 'skPick'; w.className = 'skpick';
  w.innerHTML = `<div class="skpk-h">${L(`เปลี่ยนสกิลช่อง ${slot + 1}`, `Skill for slot ${slot + 1}`)}<button class="ibtn" data-skpx="1" aria-label="${L('ปิด', 'Close')}">✕</button></div>
    <div class="skpk-l">${ids.map(id => `<button class="skpk-i${S.hot[slot] === id ? ' on' : ''}${skhAutoOn(id) ? ' auto' : ''}" data-skp="${id}" data-skslot="${slot}"><span class="ico">${skillIcon(id)}</span><b>${skName(SKILLS[id])}</b><small>${S.hot.indexOf(id) >= 0 ? L(`ช่อง ${S.hot.indexOf(id) + 1}`, `Slot ${S.hot.indexOf(id) + 1}`) : 'Lv ' + skl(id)}</small></button>`).join('')
      || `<p class="empty">${L('ยังไม่มีสกิลกดใช้ · ลงแต้มในหน้าต่างสกิลก่อน', 'No active skills yet · learn some in the Skill window first')}</p>`}
      ${S.hot[slot] ? `<button class="skpk-i clear" data-skp="" data-skslot="${slot}"><span class="ico">✕</span><b>${L('เอาออกจากช่อง', 'Empty this slot')}</b></button>` : ''}</div>
    <p class="skpk-tip">${L('แตะ = ใช้สกิล · กดค้าง = เปลี่ยนสกิล · กดค้างแล้วเลื่อนลง = เปิด/ปิด Auto', 'Tap = use · Hold = change skill · Hold and slide down = Auto on/off')}</p>`;
  el('ui').appendChild(w);
  const r = brect(b), u = brect(el('ui')), pw = w.offsetWidth, ph = w.offsetHeight;
  const vw = ROT.on ? u.width : Math.min(u.width, (window.visualViewport ? visualViewport.width : innerWidth) - u.left);   // never past the visible edge
  w.style.left = Math.round(Math.max(6, Math.min(vw - pw - 6, r.left - u.left + r.width / 2 - pw / 2))) + 'px';
  w.style.top = Math.round(Math.max(6, Math.min(u.height - ph - 6, r.top - u.top - ph - 8))) + 'px';
}
function skhClose(){ const w = el('skPick'); if (w) w.remove(); }
function skhAssign(slot, id){
  if (!id) S.hot[slot] = null;
  else { const was = S.hot.indexOf(id); if (was >= 0 && was !== slot) S.hot[was] = S.hot[slot]; S.hot[slot] = id; }
  skhClose(); renderHotbar(); if (UIS.open.skill && typeof renderSkills === 'function') renderSkills(); save();
}

/* the gesture: handled before the old tap handlers, which then never see a skill-button press */
document.addEventListener('pointerdown', e => {
  if (el('skPick') && !e.target.closest('#skPick')) skhClose();
  const b = e.target.closest && e.target.closest('.mo.sk, .hk[data-hot]'); if (!b) return;
  const slot = skhSlot(b); if (slot < 0) return;
  e.stopPropagation(); e.preventDefault();
  clearTimeout(SKH.timer);
  SKH.p = {b, slot, id:S.hot[slot] && skl(S.hot[slot]) ? S.hot[slot] : null, x:e.clientX, y:e.clientY, pid:e.pointerId, t0:performance.now(), done:false, moved:false};
  b.classList.add('press');
  try { b.setPointerCapture(e.pointerId); } catch (err) {}
  SKH.timer = setTimeout(() => { const p = SKH.p; if (!p || p.done || p.moved) return; p.done = true; p.b.classList.remove('press', 'slide'); p.b.style.transform = ''; skhPick(p.b, p.slot); }, SKH.HOLD);
}, true);
document.addEventListener('pointermove', e => {
  const p = SKH.p; if (!p || p.done || e.pointerId !== p.pid) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  // drag an area skill off its button (up or sideways) to aim it on the ground; let go on the field to cast there
  if (p.id && typeof gtArea === 'function' && gtArea(SKILLS[p.id]) && (p.aim || (Math.hypot(dx, dy) > SKH.MOVE * 1.6 && !(dy > 6 && dy > Math.abs(dx))))){
    p.aim = true; p.moved = true; clearTimeout(SKH.timer); p.b.classList.remove('press', 'slide'); p.b.style.transform = '';
    GT.id = p.id; const w = worldPt(e); GT.mx = w.x; GT.my = w.y; if (typeof tip === 'function') tip('ground'); return; }
  if (dy > 6 && dy > Math.abs(dx)){ p.b.classList.add('slide'); p.b.style.transform = `translateY(${Math.min(dy, SKH.SLIDE) * .5}px)`; }
  if (dy > SKH.SLIDE && dy > Math.abs(dx) * 1.2){ p.done = true; clearTimeout(SKH.timer); p.b.classList.remove('press', 'slide'); p.b.style.transform = ''; skhToggleAuto(p.id); return; }
  if (Math.hypot(dx, dy) > SKH.MOVE){ p.moved = true; clearTimeout(SKH.timer); }
}, true);
const skhEnd = e => {
  const p = SKH.p; if (!p || e.pointerId !== p.pid) return;
  SKH.p = null; clearTimeout(SKH.timer); p.b.classList.remove('press', 'slide'); p.b.style.transform = '';
  if (p.b.matches('.hk')) SKH.eatClick = true;     // the hotbar acts on click: this press is already handled
  if (p.aim){ GT.id = null; const over = document.elementFromPoint(e.clientX, e.clientY);
    if (e.type !== 'pointercancel' && over === cv){ const w = worldPt(e), id = p.id;
      if (Math.hypot(w.x - P.x, w.y - P.y) <= skillRange(id)) gtCast(id, w.x, w.y); else { GT.pend = {id, x:w.x, y:w.y}; P.target = null; P.pending = null; P.tx = w.x; P.ty = w.y; } }
    return; }
  if (p.done || p.moved || e.type === 'pointercancel' || performance.now() - p.t0 > SKH.HOLD) return;
  if (!p.id){ skhPick(p.b, p.slot); return; }       // tapping an empty slot opens the picker
  if (p.b.matches('.mo')) mobaAction('skill', p.id); else { const h = hotbarDef()[p.slot]; if (h) useHot(h); }
};
document.addEventListener('pointerup', skhEnd, true);
document.addEventListener('pointercancel', skhEnd, true);
document.addEventListener('click', e => {
  const k = e.target.closest && e.target.closest('[data-skp],[data-skpx]');
  if (k){ e.stopPropagation(); if (k.dataset.skpx) skhClose(); else skhAssign(+k.dataset.skslot, k.dataset.skp); return; }
  if (SKH.eatClick && e.target.closest && e.target.closest('.hk[data-hot]')){ SKH.eatClick = false; e.stopPropagation(); e.preventDefault(); }
}, true);
addEventListener('keydown', e => { if (e.key === 'Escape') skhClose(); });
/* a long press must not open the phone's own menu or text callout over the button */
document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('.mo, .hk[data-hot], #skPick')) e.preventDefault(); }, true);

function skhBadge(b, on){ b.classList.toggle('auto', on); const i = b.querySelector('.autob'); if (on && !i) b.insertAdjacentHTML('beforeend', '<i class="autob">A</i>'); else if (!on && i) i.remove(); }
/* after each redraw: number the touch slots, let empty skill slots be held, and badge the skills Auto uses */
function skhDecorate(){
  const box = el('mobaAct');
  if (box) [...box.querySelectorAll('.mo.sk')].forEach((b, i) => { b.dataset.slot = i; if (b.disabled){ b.disabled = false; b.classList.add('hold-empty'); } skhBadge(b, skhAutoOn(b.dataset.id)); });
  const hb = el('hotbar');
  if (hb) [...hb.querySelectorAll('.hk')].slice(0, S.hot.length).forEach((b, i) => { if (b.classList.contains('empty')){ b.disabled = false; b.dataset.hot = i; b.classList.add('hold-empty'); } skhBadge(b, skhAutoOn(S.hot[i])); });
}
{ const _rh = renderHotbar; renderHotbar = function(){ _rh.apply(this, arguments); skhDecorate(); }; }
{ const _rm = renderMoba; renderMoba = function(){ _rm.apply(this, arguments); skhDecorate(); }; }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'skhold', t:['ปุ่มสกิล: แตะ กดค้าง เลื่อนลง', 'Skill buttons: tap, hold, slide'], b:() => L(
  '<p><b>แตะ</b> = ใช้สกิล · <b>กดค้าง</b> = เปลี่ยนสกิลในช่องนั้น (หรือเอาออก) · <b>กดค้างแล้วเลื่อนลง</b> = เปิด/ปิดให้ Auto ใช้สกิลนั้น ปุ่มที่ Auto ใช้จะมีป้าย <b>A</b> สีเขียว ช่องว่างแตะหรือกดค้างเพื่อใส่สกิลได้</p>',
  '<p><b>Tap</b> = use the skill · <b>Hold</b> = change the skill in that slot (or empty it) · <b>Hold and slide down</b> = turn Auto on or off for that skill. Skills Auto uses wear a green <b>A</b> badge. Tap or hold an empty slot to fill it.</p>')});
