/* VAYRATHEN — js/sys/hudedit.js — move and resize the touch buttons yourself
   Settings → Controls → "จัดตำแหน่งปุ่ม" turns on
   arrange mode: the joystick, the skill cluster, the small buttons and the potions get a dashed frame and can be
   dragged anywhere on the screen; tap one, then − / + to shrink or grow it. "เสร็จ" keeps the layout,
   "คืนค่าเดิม" goes back to the automatic one. Layouts are kept per device (localStorage), separately for
   landscape and portrait, as the centre of each group in screen fractions plus its scale, and are always pulled
   back inside the screen, so a layout made on one size never ends up off-screen on another. */
'use strict';

const HE_GROUPS = [
  {k:'act', id:'mobaAct', th:'ปุ่มสกิล', en:'Skills'},
  {k:'util', id:'mobaUtil', th:'ปุ่มเสริม', en:'Small buttons'},
  {k:'pot', id:'mobaPot', th:'ปุ่มยา', en:'Potions'},
  {k:'joy', id:'joyZone', th:'จอย', en:'Joystick'}];
const HE = {on:false, sel:null, drag:null, key:'vay_hudpos_v1', data:{}};
try { HE.data = JSON.parse(localStorage.getItem(HE.key) || '{}') || {}; } catch (e) { HE.data = {}; }
const heSave = () => { try { localStorage.setItem(HE.key, JSON.stringify(HE.data)); } catch (e) {} };
const heOri = () => { const ui = el('ui'); return ui && ui.offsetWidth >= ui.offsetHeight ? 'land' : 'port'; };
const heMine = () => (HE.data[heOri()] = HE.data[heOri()] || {});
/* the automatic layout on a phone held sideways (the owner's own arrangement): skills bottom right, potions just
   above them on the left, the small buttons along the bottom, a bigger joystick bottom left. Anything the player
   arranges replaces it; "คืนค่าเดิม" comes back here. Portrait and big screens keep the old automatic layout. */
const HE_DEF = {land:{act:{cx:.875, cy:.72, s:1.2}, pot:{cx:.815, cy:.6, s:1.2}, util:{cx:.65, cy:.935, s:1.2}, joy:{cx:.09, cy:.83, s:1.25}}};
const heDef = () => { const ui = el('ui'); return ui && heOri() === 'land' && Math.min(innerHeight, screen.height || 1e4) <= 540 ? HE_DEF.land : null; };   // a phone held sideways
const heMoba = () => { const ui = el('ui'); return !!(ui && ui.classList.contains('moba')); };
/* the joystick group: its zone becomes a square around the stick, the stick sits in its middle */
const heJoyBox = () => { const j = el('joy'); return Math.round(((j && j.offsetWidth) || 132) * 1.9); };
function heBaseScale(e){ const t = getComputedStyle(e).transform; if (!t || t === 'none') return 1; const m = t.match(/matrix\(([^,]+),\s*([^,]+)/); return m ? Math.hypot(+m[1], +m[2]) || 1 : 1; }
function heClear(e){ for (const p of ['left', 'top', 'right', 'bottom', 'transform', 'transform-origin', 'width', 'height']) e.style.removeProperty(p); }
function hePlace(g, e, v){
  const ui = el('ui'), W = ui.offsetWidth, H = ui.offsetHeight;
  if (g.k === 'joy'){ const b = heJoyBox(); e.style.setProperty('width', b + 'px', 'important'); e.style.setProperty('height', b + 'px', 'important'); ui.classList.add('hejoy'); }
  const w = e.offsetWidth * v.s, h = e.offsetHeight * v.s;
  const m = g.k === 'joy' ? (w - w / 1.9) / 2 : 0;   // the joystick's box may hang off the edge, the stick itself stays on screen
  const x = clamp(v.cx * W - w / 2, -m, Math.max(-m, W - w + m)), y = clamp(v.cy * H - h / 2, -m, Math.max(-m, H - h + m));
  const set = (p, val) => e.style.setProperty(p, val, 'important');
  set('left', Math.round(x) + 'px'); set('top', Math.round(y) + 'px'); set('right', 'auto'); set('bottom', 'auto');
  set('transform', `scale(${v.s})`); set('transform-origin', '0 0');
}
/* put every saved group where it was left (runs after the automatic layout) */
function heApply(){
  const ui = el('ui'); if (!ui) return;
  const mine = HE.data[heOri()] || {}, def = heDef() || {}; let joy = false;
  for (const g of HE_GROUPS){ const e = el(g.id); if (!e) continue; const v = mine[g.k] || def[g.k];
    if (!heMoba() || !v){ if (e.dataset.he){ heClear(e); delete e.dataset.he; } continue; }
    e.dataset.he = '1'; hePlace(g, e, v); if (g.k === 'joy') joy = true; }
  if (!joy) ui.classList.remove('hejoy');
}
{ const _lh = layoutHud; layoutHud = function(){ const out = _lh.apply(this, arguments); heApply(); return out; }; }
{ const _rm = renderMoba; renderMoba = function(){ const out = _rm.apply(this, arguments); heApply(); return out; }; }
if (typeof potPlace === 'function'){ const _pp = potPlace; potPlace = function(){ const out = _pp.apply(this, arguments); if ((HE.data[heOri()] || {}).pot || (heDef() || {}).pot) heApply(); return out; }; }
addEventListener('resize', () => setTimeout(heApply, 200));

/* ---------- arrange mode ---------- */
function heGroupOf(t){ for (const g of HE_GROUPS){ const e = el(g.id); if (e && (e === t || e.contains(t))) return g; } return null; }
/* the current spot of a group as {cx, cy, s}, read from the screen */
function heRead(g){
  const ui = el('ui'), e = el(g.id), u = brect(ui), k = (u.width / (ui.offsetWidth || 1)) || 1;
  let r = brect(e), s = heBaseScale(e);
  if (g.k === 'joy' && !e.dataset.he){ r = brect(el('joy')); s = 1; return {cx:(r.left + r.width / 2 - u.left) / k / ui.offsetWidth, cy:(r.top + r.height / 2 - u.top) / k / ui.offsetHeight, s}; }
  return {cx:(r.left + r.width / 2 - u.left) / k / ui.offsetWidth, cy:(r.top + r.height / 2 - u.top) / k / ui.offsetHeight, s};
}
function heBar(){
  let b = el('heBar');
  if (!HE.on){ if (b) b.remove(); return; }
  if (!b){ b = document.createElement('div'); b.id = 'heBar'; b.className = 'hebar'; el('ui').appendChild(b); }
  const g = HE_GROUPS.find(x => x.k === HE.sel);
  b.innerHTML = `<b>${g ? L(g.th, g.en) : L('ลากปุ่มไปวางตรงไหนก็ได้', 'Drag the buttons anywhere')}</b>
    <button class="btn sm" data-he="minus" ${g ? '' : 'disabled'} aria-label="${L('เล็กลง', 'Smaller')}">−</button><button class="btn sm" data-he="plus" ${g ? '' : 'disabled'} aria-label="${L('ใหญ่ขึ้น', 'Bigger')}">+</button>
    <button class="btn sm" data-he="reset">${L('คืนค่าเดิม', 'Reset')}</button><button class="btn sm gold" data-he="done">${L('เสร็จ', 'Done')}</button>`;
  for (const x of HE_GROUPS){ const e = el(x.id); if (e){ e.classList.toggle('he-sel', HE.on && x.k === HE.sel); e.dataset.heLabel = L(x.th, x.en); } }
}
function heStart(){
  if (!heMoba()){ toast(L('ใช้ได้เมื่อเล่นแบบจอย (ตั้งค่า → รูปแบบการควบคุม → จอย)', 'Works with joystick controls (Settings → Control style → Joystick)')); return; }
  if (typeof closeWin === 'function' && typeof winOpen === 'function' && winOpen('settings')) closeWin('settings');
  HE.on = true; HE.sel = null; el('ui').classList.add('hedit'); heBar();
  toast(L('ลากปุ่มไปวาง · แตะเพื่อเลือกแล้วกด − / + ปรับขนาด', 'Drag to move · tap one, then − / + to resize'));
}
function heStop(){ HE.on = false; HE.sel = null; HE.drag = null; el('ui').classList.remove('hedit'); heBar(); heSave(); if (typeof layoutHud === 'function') layoutHud(); }
document.addEventListener('pointerdown', e => {
  if (!HE.on || e.target.closest('#heBar')) return;
  const g = heGroupOf(e.target); if (!g) return;
  e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
  const v = heMine()[g.k] || heRead(g); heMine()[g.k] = v; HE.sel = g.k;
  const ui = el('ui'), u = brect(ui), k = (u.width / (ui.offsetWidth || 1)) || 1;
  HE.drag = {g, id:e.pointerId, x:ptX(e), y:ptY(e), cx:v.cx, cy:v.cy, W:ui.offsetWidth * k, H:ui.offsetHeight * k};
  heApply(); heBar();
}, true);
document.addEventListener('pointermove', e => {
  const d = HE.drag; if (!HE.on || !d || e.pointerId !== d.id) return;
  e.preventDefault(); e.stopPropagation();
  const v = heMine()[d.g.k]; v.cx = clamp(d.cx + (ptX(e) - d.x) / d.W, 0, 1); v.cy = clamp(d.cy + (ptY(e) - d.y) / d.H, 0, 1); heApply();
}, true);
for (const ev of ['pointerup', 'pointercancel']) document.addEventListener(ev, e => {
  const d = HE.drag; if (!d || e.pointerId !== d.id) return; HE.drag = null;
  const v = heMine()[d.g.k], ui = el('ui'), e2 = el(d.g.id);   // store where it really ended up (pulled inside the screen)
  if (v && e2){ const r = brect(e2), u = brect(ui), k = (u.width / (ui.offsetWidth || 1)) || 1; v.cx = (r.left + r.width / 2 - u.left) / k / ui.offsetWidth; v.cy = (r.top + r.height / 2 - u.top) / k / ui.offsetHeight; }
  heSave();
}, true);
/* while arranging, a tap on a button only picks it (no skill, no potion) */
for (const ev of ['click', 'touchstart', 'touchend']) document.addEventListener(ev, e => { if (HE.on && heGroupOf(e.target)) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); } }, {capture:true, passive:false});
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-he],[data-heopen]'); if (!b || b.disabled) return;
  e.preventDefault(); e.stopPropagation();
  if (b.dataset.heopen){ heStart(); return; }
  const a = b.dataset.he, mine = heMine();
  if (a === 'done') heStop();
  else if (a === 'reset'){ delete HE.data[heOri()]; HE.sel = null; heSave(); heApply(); if (typeof layoutHud === 'function') layoutHud(); heBar(); toast(L('คืนตำแหน่งปุ่มเริ่มต้นแล้ว', 'Buttons back to the default layout')); }
  else if ((a === 'minus' || a === 'plus') && HE.sel){ const g = HE_GROUPS.find(x => x.k === HE.sel), v = mine[HE.sel] || heRead(g); mine[HE.sel] = v;
    v.s = clamp(Math.round((v.s + (a === 'plus' ? .1 : -.1)) * 100) / 100, .5, 1.8); heApply(); heSave(); }
}, true);
/* Settings → Controls: the way in */
{ const _rs = renderSettings; renderSettings = function(){ const out = _rs.apply(this, arguments);
    const sel = el('set-control'), row = sel && sel.closest('.set');
    if (row && !el('heOpenRow')) row.insertAdjacentHTML('afterend', `<div class="set" id="heOpenRow"><span><b>${L('จัดตำแหน่งปุ่ม', 'Arrange buttons')}</b><small>${L('ลากจอย ปุ่มสกิล ปุ่มยา ปุ่มเสริม ไปวางเองได้ และปรับขนาดได้ (แยกแนวตั้ง/แนวนอน)', 'Drag the joystick, skills, potions and small buttons anywhere and resize them (portrait and landscape separately)')}</small></span><button class="btn sm gold" data-heopen="1">${L('จัดปุ่ม', 'Arrange')}</button></div>`);
    return out; }; }
{
  const st = document.createElement('style');
  st.textContent = `.ui.moba.hejoy .joyzone{display:block}
    .ui.moba.hejoy .joyzone .joy:not(.live){left:50%!important;top:50%!important;bottom:auto!important;transform:translate(-50%,-50%)!important}
    .ui.hedit #mobaAct,.ui.hedit #mobaUtil,.ui.hedit #mobaPot,.ui.hedit #joyZone{outline:2px dashed rgba(255,214,120,.85);outline-offset:4px;border-radius:14px;background:rgba(255,214,120,.08);cursor:grab;touch-action:none;z-index:40!important}
    .ui.hedit #mobaAct.he-sel,.ui.hedit #mobaUtil.he-sel,.ui.hedit #mobaPot.he-sel,.ui.hedit #joyZone.he-sel{outline:3px solid #7dffb0;background:rgba(125,255,176,.12)}
    .ui.hedit #mobaAct::before,.ui.hedit #mobaUtil::before,.ui.hedit #mobaPot::before,.ui.hedit #joyZone::before{content:attr(data-he-label);position:absolute;left:0;top:-22px;padding:1px 8px;border-radius:8px;background:rgba(20,10,4,.85);color:#ffe6a8;font:700 11px var(--thai,Mali),sans-serif;white-space:nowrap;pointer-events:none}
    .ui.hedit #mobaUtil,.ui.hedit #mobaPot{position:absolute}
    .hebar{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:9998;display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 16px);padding:8px 10px;border-radius:12px;background:rgba(20,10,4,.92);border:1px solid rgba(227,176,75,.6);box-shadow:0 6px 20px rgba(0,0,0,.5)}
    .hebar b{color:#ffe6a8;font-size:13px;margin-right:4px}
    .hebar .btn{min-width:40px}`;
  document.head.appendChild(st);
}
setTimeout(heApply, 0);
