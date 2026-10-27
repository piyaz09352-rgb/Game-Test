/* VAYRATHEN — js/sys/gmlock.js — the GM tools also need the GM code
   Being GM still needs everything gm.js checks (on claude.ai: the artifact's owner). On top of that the tools stay
   locked until the GM code is entered once on this device: the GM chip shows "GM 🔒", F8 or the chip asks for the
   code, and only a SHA-256 hash of it is kept here (never the code itself). "ล็อก GM" in the panel locks it again.
   Someone who is not the owner gets nothing from the code: the owner check runs first. */
'use strict';

const GMLOCK = {hash:'fa8db4905228efc39cb1977334f4cd81364657485fd3eaf45afc43224199d6bb', salt:'', key:'vay_gmkey', owner:false, loaded:false};
const gmKeyOk = () => { try { return localStorage.getItem(GMLOCK.key) === GMLOCK.hash; } catch (e) { return false; } };
async function gmHash(code, salt = GMLOCK.salt){
  const b = new TextEncoder().encode('vayrathen-gm:' + (salt ? salt + ':' : '') + String(code).trim());
  const h = await crypto.subtle.digest('SHA-256', b); return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join('');
}
{ const _gv = gmVerify; gmVerify = async function(){
    const r = await _gv.apply(this, arguments); GMLOCK.owner = !!r && GM.how !== 'local';
    if (r && GM.how !== 'local' && !gmKeyOk()){ GM.on = false; GM.how = ''; GM.god = GM.inv = false; GM.spd = 1; gmUi(); if (typeof derive === 'function' && DER) derive(); return false; }
    gmUi(); return r; }; }
{ const _ui = gmUi; gmUi = function(){ _ui.apply(this, arguments); const b = el('gmBtn'); if (!b) return;
    const locked = GMLOCK.owner && !GM.on; if (locked) b.hidden = false; b.textContent = locked ? 'GM 🔒' : 'GM'; }; }
function gmLockAsk(){
  if (!GMLOCK.owner || GM.on || el('gmLockBox')) return;
  const w = document.createElement('div'); w.id = 'gmLockBox'; w.className = 'gmlockbox';
  w.innerHTML = `<div class="gml-c"><b>${L('ใส่รหัส GM', 'Enter the GM code')}</b>
    <input id="gmLockIn" type="password" inputmode="numeric" autocomplete="off" maxlength="20" aria-label="${L('รหัส GM', 'GM code')}">
    <small id="gmLockMsg"></small>
    <div class="row"><button class="btn sm" data-gml="no">${L('ยกเลิก', 'Cancel')}</button><button class="btn sm gold" data-gml="ok">${L('เข้าสู่ GM', 'Unlock')}</button></div></div>`;
  el('ui').appendChild(w); setTimeout(() => { const i = el('gmLockIn'); if (i) i.focus(); }, 30);
}
async function gmLockTry(){
  const i = el('gmLockIn'); if (!i) return; const h = await gmHash(i.value);
  if (h !== GMLOCK.hash){ i.value = ''; const m = el('gmLockMsg'); if (m) m.textContent = L('รหัสไม่ถูกต้อง', 'Wrong code'); return; }
  try { localStorage.setItem(GMLOCK.key, h); } catch (e) {}
  const w = el('gmLockBox'); if (w) w.remove();
  if (await gmVerify()){ if (typeof gmLoadIds === 'function') gmLoadIds(); toast(L('เข้าสู่โหมด GM แล้ว · กด GM หรือ F8 เพื่อเปิดเครื่องมือ', 'GM unlocked · press GM or F8 for the tools')); }
}
function gmRelock(){ try { localStorage.removeItem(GMLOCK.key); } catch (e) {} if (UIS.open.gm) closeWin('gm'); gmVerify(); toast(L('ล็อก GM แล้ว', 'GM locked')); }
document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest && t.closest('#gmBtn') && GMLOCK.owner && !GM.on){ e.preventDefault(); e.stopPropagation(); gmLockAsk(); return; }
  const b = t.closest && t.closest('[data-gml]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  if (b.dataset.gml === 'ok') gmLockTry(); else if (b.dataset.gml === 'lock') gmRelock(); else if (b.dataset.gml === 'no'){ const w = el('gmLockBox'); if (w) w.remove(); }
}, true);
window.addEventListener('keydown', e => {
  if (e.target && e.target.id === 'gmLockIn'){ e.stopPropagation(); if (e.key === 'Enter'){ e.preventDefault(); gmLockTry(); } else if (e.key === 'Escape'){ const w = el('gmLockBox'); if (w) w.remove(); } return; }
  if (e.key === 'F8' && GMLOCK.owner && !GM.on) setTimeout(gmLockAsk, 50);
}, true);
{ const _r = WIN_RENDER.gm; WIN_RENDER.gm = function(){ const out = _r.apply(this, arguments); const p = el('pane-gm');
    if (p && GM.on && !p.querySelector('[data-gml="lock"]')) p.insertAdjacentHTML('afterbegin', `<div class="row" style="justify-content:flex-end;margin-bottom:6px"><button class="btn sm" data-gml="lock">🔒 ${L('ล็อก GM', 'Lock GM')}</button></div>`);
    return out; }; }
{
  const st = document.createElement('style');
  st.textContent = `.gmlockbox{position:absolute;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55)}
    .gml-c{display:flex;flex-direction:column;gap:8px;min-width:240px;padding:16px;border-radius:14px;background:#24140c;border:1px solid rgba(227,176,75,.6);box-shadow:0 10px 30px rgba(0,0,0,.6)}
    .gml-c b{color:#ffe6a8}.gml-c input{font:700 20px monospace;letter-spacing:6px;text-align:center;padding:8px;border-radius:9px;border:1px solid rgba(227,176,75,.5);background:#120a06;color:#fff}
    .gml-c small{color:#ff9a8a;min-height:14px}.gml-c .row{display:flex;gap:6px;justify-content:flex-end}`;
  document.head.appendChild(st);
}

/* ---------- (v92) the owner changes the GM code in the game ----------
   GM panel → "เปลี่ยนรหัส GM": the current code, then the new one twice. Only its salted hash is saved, in the shared
   database (server/gmkey: only the owner can write there) and on this device; every other device has to enter the
   new code once. The code never has to be typed in a chat. */
async function gmKeyLoad(){
  if (typeof NET === 'undefined' || !NET.db) return;
  try { const d = await NET.db.doc('server/gmkey').get(), v = d.exists ? d.data() || {} : {};
    if (typeof v.h === 'string' && /^[0-9a-f]{64}$/.test(v.h)){ GMLOCK.hash = v.h; GMLOCK.salt = typeof v.s === 'string' ? v.s.slice(0, 40) : ''; } } catch (e) {}
  GMLOCK.loaded = true;
  if (typeof gmVerify === 'function') gmVerify();   // a device holding the old code is locked again
}
EV.on('netready', gmKeyLoad);
function gmKeyAsk(){
  if (!GM.on || el('gmLockBox')) return;
  const w = document.createElement('div'); w.id = 'gmLockBox'; w.className = 'gmlockbox';
  const f = (id, th, en) => `<input id="${id}" type="password" autocomplete="off" maxlength="20" placeholder="${L(th, en)}" aria-label="${L(th, en)}">`;
  w.innerHTML = `<div class="gml-c"><b>${L('เปลี่ยนรหัส GM', 'Change the GM code')}</b>
    ${f('gmKeyOld', 'รหัสเดิม', 'Current code')}${f('gmKeyNew', 'รหัสใหม่ (6–20 ตัว)', 'New code (6–20)')}${f('gmKeyNew2', 'ใส่รหัสใหม่อีกครั้ง', 'New code again')}
    <small id="gmLockMsg"></small>
    <div class="row"><button class="btn sm" data-gml="no">${L('ยกเลิก', 'Cancel')}</button><button class="btn sm gold" data-gml="set">${L('บันทึก', 'Save')}</button></div></div>`;
  el('ui').appendChild(w); setTimeout(() => { const i = el('gmKeyOld'); if (i) i.focus(); }, 30);
}
async function gmKeySet(){
  const v = id => (el(id) || {}).value || '', msg = t => { const m = el('gmLockMsg'); if (m) m.textContent = t; };
  if (!GM.on) return;
  if (typeof NET === 'undefined' || !NET.db || !NET.uid) return msg(L('ต้องออนไลน์ก่อนจึงจะเปลี่ยนรหัสได้', 'Go online to change the code'));
  if (await gmHash(v('gmKeyOld')) !== GMLOCK.hash) return msg(L('รหัสเดิมไม่ถูกต้อง', 'The current code is wrong'));
  const n = v('gmKeyNew').trim();
  if (n.length < 6) return msg(L('รหัสใหม่ต้องยาว 6 ตัวขึ้นไป', 'The new code needs 6 or more characters'));
  if (n !== v('gmKeyNew2').trim()) return msg(L('รหัสใหม่สองช่องไม่ตรงกัน', 'The two new codes differ'));
  const salt = [...crypto.getRandomValues(new Uint8Array(12))].map(x => x.toString(16).padStart(2, '0')).join(''), h = await gmHash(n, salt);
  try { await NET.db.doc('server/gmkey').set({h, s:salt, at:Date.now()}); }
  catch (e) { return msg(L('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง', 'Could not save, try again')); }
  GMLOCK.hash = h; GMLOCK.salt = salt; try { localStorage.setItem(GMLOCK.key, h); } catch (e) {}
  const w = el('gmLockBox'); if (w) w.remove();
  if (typeof gmLog === 'function') try { gmLog('gmkey', [], 'changed'); } catch (e) {}
  toast(L('เปลี่ยนรหัส GM แล้ว · เครื่องอื่นต้องใส่รหัสใหม่', 'GM code changed · other devices need the new code'));
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-gml]'); if (!b) return;
  if (b.dataset.gml === 'key'){ e.preventDefault(); e.stopPropagation(); gmKeyAsk(); }
  else if (b.dataset.gml === 'set'){ e.preventDefault(); e.stopPropagation(); gmKeySet(); } }, true);
window.addEventListener('keydown', e => { if (e.target && /^gmKey/.test(e.target.id)){ e.stopPropagation(); if (e.key === 'Enter'){ e.preventDefault(); gmKeySet(); } else if (e.key === 'Escape'){ const w = el('gmLockBox'); if (w) w.remove(); } } }, true);
{ const _r = WIN_RENDER.gm; WIN_RENDER.gm = function(){ const out = _r.apply(this, arguments); const b = document.querySelector('#pane-gm [data-gml="lock"]');
    if (b && !b.parentElement.querySelector('[data-gml="key"]')) b.insertAdjacentHTML('beforebegin', `<button class="btn sm" data-gml="key">🔑 ${L('เปลี่ยนรหัส GM', 'Change GM code')}</button>`);
    return out; }; }
