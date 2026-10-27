/* VAYRATHEN — js/sys/authsec.js — account security (v30)
   · One browser, one claude.ai account: the first claude.ai account that opens the game in a browser owns that
     browser's copy (vayrathen-owner). When someone else's claude.ai account opens it later, the local copy is cleared
     before anything is synced (it stays safe in the first owner's cloud space), so nobody can take over, or push to
     their own cloud, a hero that a remembered log-in left on a shared device. Until that check has run, nothing is
     written to the cloud. A copy from before this check that does not match the claude.ai account's own cloud copy
     asks for the password again before it is linked.
   · Recovery code (offline): 16 letters made in the security panel and shown once. It is stored only as a PBKDF2 hash.
     Offline, "Forgot password" then sets a new password with the ID + the code instead of wiping the account (wiping
     stays as the last resort). Using the code makes a new one. Online, the claude.ai sign-in proves who you are and
     auth.js sets the new password with no code (v93; that replaced the v81 dialog that used to live here).
   · Security panel (account bar on the title, or Settings → Account security): what the account is linked to, the last
     log-ins with their device, change password, a new recovery code, and log out every other device (local mode: ACC.sv
     goes up, every older log-in token stops matching). Every action asks for the current password.
   · Password rules, the lockout that survives reloads, and the 30-day limit on "remember me" live in auth.js. */
'use strict';

const SEC = {uid:'', check:false, devK:'vayrathen-dev'};
const secDev = () => { let k = ''; try { k = localStorage.getItem(SEC.devK) || ''; if (!k){ k = authHex(crypto.getRandomValues(new Uint8Array(6))); localStorage.setItem(SEC.devK, k); } } catch (e) { k = 'tmp'; } return k; };
function secDevName(){
  const u = navigator.userAgent || '';
  const b = /Edg\//.test(u) ? 'Edge' : /SamsungBrowser/.test(u) ? 'Samsung' : /OPR\/|Opera/.test(u) ? 'Opera' : /Firefox\//.test(u) ? 'Firefox' : /Chrome\//.test(u) ? 'Chrome' : /Safari\//.test(u) ? 'Safari' : L('เบราว์เซอร์', 'Browser');
  const o = /Android/.test(u) ? 'Android' : /iPhone|iPad|iPod/.test(u) ? 'iOS' : /Windows/.test(u) ? 'Windows' : /Mac OS X/.test(u) ? 'Mac' : /Linux/.test(u) ? 'Linux' : '';
  return o ? `${b} · ${o}` : b;
}

/* ---------- one browser, one claude.ai account ---------- */
const secCloudOk = () => typeof NET === 'undefined' || !NET.uid || SEC.uid === NET.uid;
function secOwner(){
  if (typeof NET === 'undefined' || !NET.uid || SEC.uid === NET.uid) return;
  let prev = ''; try { prev = localStorage.getItem(AUTH.owner) || ''; } catch (e) {}
  if (prev && prev !== NET.uid){
    try { for (let i = 0; i < SLOTS; i++){ localStorage.removeItem(slotKey(i)); localStorage.removeItem(`vayrathen-bk-${i}`); } localStorage.removeItem(ACCKEY); } catch (e) {}
    ACC = accBlank(); S = newS(); setSlot(0); authDrop(); AUTH.mode = '';
    SEC.note = L('เบราว์เซอร์นี้เคยใช้กับบัญชี claude.ai อื่น ข้อมูลของบัญชีนั้นถูกเอาออกจากเครื่องนี้แล้ว (ยังอยู่บนคลาวด์ของเจ้าของ)', 'This browser was used by another claude.ai account; its data was removed from this device (it is still in its owner\'s cloud)');
  } else if (!prev && ACC.name && !authFbOn() && !SEC.fresh) SEC.check = true;   // a copy from before this check: compared with the cloud below
  try { localStorage.setItem(AUTH.owner, NET.uid); } catch (e) {}
  SEC.uid = SEC.check ? '' : NET.uid;
}
if (typeof cloudCheck === 'function'){ const _cc = cloudCheck; cloudCheck = function(){ secOwner(); return _cc.apply(this, arguments); }; }
if (typeof cloudSave === 'function'){ const _cs = cloudSave; cloudSave = function(){ if (!secCloudOk()) return; return _cs.apply(this, arguments); }; }
if (typeof cloudDelete === 'function'){ const _cd = cloudDelete; cloudDelete = function(){ if (!secCloudOk()) return; return _cd.apply(this, arguments); }; }
{ const _cl = accCloudLoad;
  accCloudLoad = async function(){
    secOwner();
    if (SEC.check && NET.db && NET.uid){ SEC.check = false; let mine = false;
      try { const s = await NET.db.doc(`data/users/${NET.uid}/account`).get(); mine = s.exists && String(JSON.parse(s.data().a || '{}').name || '').toLowerCase() === String(ACC.name).toLowerCase(); } catch (e) {}
      if (mine) SEC.uid = NET.uid; else if (!authFbOn()){ authDrop(); AUTH.mode = 'login'; }   // not this account's cloud copy: the password links it
    }
    return _cl.apply(this, arguments);
  };
}
/* every log-in through the panel (auth.js authDone) */
function secLoggedIn(){
  SEC.fresh = true;   // the password was typed in this page: whoever is signed in to claude.ai owns this copy
  if (typeof NET !== 'undefined' && NET.uid){ SEC.uid = NET.uid; try { localStorage.setItem(AUTH.owner, NET.uid); } catch (e) {} }
  const k = secDev(), lh = Array.isArray(ACC.lh) ? ACC.lh : [];
  SEC.newDev = lh.length > 0 && !lh.some(x => x.k === k);
  lh.unshift({t:Date.now(), d:secDevName(), k}); ACC.lh = lh.slice(0, 8); accSave(true);
}

/* ---------- recovery code ---------- */
const SEC_ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const secCodeNorm = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
async function secNewCode(){
  const r = crypto.getRandomValues(new Uint8Array(16)), raw = [...r].map(x => SEC_ABC[x % SEC_ABC.length]).join('');
  const s = authHex(crypto.getRandomValues(new Uint8Array(16))); ACC.rc = {s, h:await authDerive(raw, s, 60000), it:60000, at:Date.now()};
  accSave(true); return raw.match(/.{4}/g).join('-');
}
const secCodeOk = async c => !!(ACC.rc && ACC.rc.h) && (await authDerive(secCodeNorm(c), ACC.rc.s, ACC.rc.it || 60000)) === ACC.rc.h;

/* ---------- the panel (in the #confirm box) ---------- */
const secFld = (id, label, ac, ph) => `<label class="au-f" data-f="${id}"><span class="au-l">${label}</span><span class="au-in"><span class="au-ic">${AU_IC.lock}</span><input id="${id}" type="password" maxlength="64" autocomplete="${ac}" placeholder="${ph || ''}"></span></label>`;
const secTime = t => new Date(t).toLocaleString(LANG === 'en' ? 'en-GB' : 'th-TH', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
function secLink(){
  if (authFbOn()) return [L('เซิร์ฟเวอร์เกม', 'Game server'), L('ไอดีและรหัสผ่านตรวจที่เซิร์ฟเวอร์ ใช้ได้ทุกเครื่อง', 'Checked by the server, works on every device')];
  if (typeof NET !== 'undefined' && NET.uid) return [L('เชื่อมกับบัญชี claude.ai แล้ว', 'Linked to your claude.ai account'), L('ข้อมูลเก็บในพื้นที่ส่วนตัวของบัญชี claude.ai นี้ บัญชีอื่นเปิดไม่ได้ · เบราว์เซอร์นี้ล็อกกับบัญชีนี้', 'Kept in this claude.ai account\'s private space; no other account can open it · this browser is locked to it')];
  return [L('ยังไม่เชื่อมออนไลน์', 'Not linked online'), L('บัญชีอยู่ในเครื่องนี้เท่านั้น เปิดเกมผ่านลิงก์ claude.ai เพื่อเชื่อมบัญชี', 'The account is on this device only; open the game from its claude.ai link to link it')];
}
function secOpen(msg){
  if (!ACC.name) return; const d = el('confirm'), fb = authFbOn(), [lt, ls] = secLink(), me = secDev(), lh = Array.isArray(ACC.lh) ? ACC.lh : [];
  d.innerHTML = `<div class="secp"><h3>${L('ความปลอดภัยบัญชี', 'Account security')} · @${escH(ACC.name)}</h3>
    <div class="secrow"><b>${lt}</b><small>${ls}</small></div>
    ${SEC.newDev ? `<p class="secwarn">${L('เข้าสู่ระบบจากอุปกรณ์ใหม่ ถ้าไม่ใช่คุณ ให้เปลี่ยนรหัสผ่านทันที', 'Signed in from a new device; if that was not you, change your password now')}</p>` : ''}
    <div class="sech">${L('เข้าสู่ระบบล่าสุด', 'Recent log-ins')}</div>
    <ul class="seclog">${lh.length ? lh.slice(0, 6).map(x => `<li><span>${escH(x.d)}${x.k === me ? ` <em>${L('เครื่องนี้', 'this device')}</em>` : ''}</span><small>${secTime(x.t)}</small></li>`).join('') : `<li><small>${L('ยังไม่มีบันทึก', 'Nothing yet')}</small></li>`}</ul>
    <div class="au-grid one">${secFld('secCur', L('รหัสผ่านปัจจุบัน (ยืนยันทุกการเปลี่ยนแปลง)', 'Current password (confirms every change)'), 'current-password')}</div>
    <div class="sech">${L('เปลี่ยนรหัสผ่าน', 'Change password')}</div>
    <div class="au-grid">${secFld('secNew', L('รหัสผ่านใหม่', 'New password'), 'new-password', L('อย่างน้อย 6 ตัว', 'at least 6 characters'))}${secFld('secNew2', L('ยืนยันรหัสผ่านใหม่', 'Confirm new password'), 'new-password')}</div>
    <div class="row"><button class="btn gold" data-sec="pw">${L('เปลี่ยนรหัสผ่าน', 'Change password')}</button></div>
    ${fb ? '' : `<div class="sech">${L('รหัสกู้คืน', 'Recovery code')}</div>
    <p class="hint">${ACC.rc ? L(`มีรหัสกู้คืนแล้ว (สร้าง ${secTime(ACC.rc.at)}) ใช้ตั้งรหัสผ่านใหม่ตอนลืม โดยไม่ต้องล้างบัญชี`, `You have a recovery code (made ${secTime(ACC.rc.at)}); it resets a forgotten password without wiping the account`)
      : L('ยังไม่มีรหัสกู้คืน ถ้าลืมรหัสผ่านจะต้องล้างบัญชี สร้างไว้แล้วจดเก็บในที่ปลอดภัย', 'No recovery code yet: a forgotten password would mean wiping the account. Make one and keep it somewhere safe')}</p>
    <div id="secCode"></div>
    <div class="row"><button class="btn" data-sec="rc">${ACC.rc ? L('สร้างรหัสกู้คืนใหม่', 'New recovery code') : L('สร้างรหัสกู้คืน', 'Make a recovery code')}</button>
      <button class="btn" data-sec="out">${L('ออกจากระบบทุกเครื่องอื่น', 'Log out all other devices')}</button></div>`}
    <p class="au-err" id="secErr" role="alert">${msg ? escH(msg) : ''}</p>
    <div class="row"><button class="btn" data-sec="close">${L('ปิด', 'Close')}</button></div></div>`;
  d.classList.add('secbox'); d.hidden = false; d.onclick = secClick; SEC.newDev = false;
  setTimeout(() => { const i = el('secCur'); if (i && matchMedia('(pointer:fine)').matches) i.focus(); }, 30);
}
function secClose(){ const d = el('confirm'); d.hidden = true; d.classList.remove('secbox'); d.onclick = null; }
const secErr = (t, ok) => { const p = el('secErr'); if (p){ p.textContent = t; p.classList.toggle('ok', !!ok); } if (!ok) SFX.play('hurt'); };
async function secCurOk(){
  const pw = (el('secCur') || {}).value || ''; if (!pw){ secErr(AUTH_ERR.nopw()); return false; }
  if (AUTH.waitT > Date.now()){ secErr(AUTH_ERR.wait(Math.ceil((AUTH.waitT - Date.now()) / 1000))); return false; }
  if (authFbOn()) return pw;   // checked by the server when it is used
  if (!authHasPw() || (await authDerive(pw, ACC.pw.s, ACC.pw.it || AUTH.it)) !== ACC.pw.h){ authWrong('secCur', () => false); secErr(AUTH_ERR.bad()); return false; }
  return pw;
}
async function secClick(e){
  const b = e.target.closest && e.target.closest('[data-sec],[data-seccopy]'); if (!b || SEC.busy) return;
  if (b.dataset.seccopy){ try { await navigator.clipboard.writeText(b.dataset.seccopy); b.textContent = L('คัดลอกแล้ว', 'Copied'); } catch (er) {} return; }
  const k = b.dataset.sec; if (k === 'close'){ secClose(); return; }
  SEC.busy = true; b.disabled = true;
  try {
    const cur = await secCurOk(); if (!cur) return;
    if (k === 'pw'){
      const nw = el('secNew').value, n2 = el('secNew2').value, bad = authPwBad(nw, ACC.name);
      if (bad) return secErr(AUTH_ERR[bad]()); if (nw !== n2) return secErr(AUTH_ERR.match()); if (nw === cur) return secErr(L('รหัสผ่านใหม่ต้องไม่ซ้ำของเดิม', 'Pick a password different from the old one'));
      if (authFbOn()){ try { await VAYFB.changePw(cur, nw); } catch (er){ const c = AUTH_FBERR[er && er.code] || 'oops'; return secErr(AUTH_ERR[c](30)); } }
      else { await authSetPw(nw); authKeep(); accSave(true); }   // a new salt: every other log-in ends
      secOpen(L('เปลี่ยนรหัสผ่านแล้ว อุปกรณ์อื่นต้องเข้าสู่ระบบใหม่', 'Password changed; other devices must log in again')); el('secErr').classList.add('ok'); SFX.play('quest');
    } else if (k === 'rc'){
      const code = await secNewCode(); secOpen(); const box = el('secCode');
      if (box) box.innerHTML = `<div class="seccode"><b>${code}</b><button class="btn sm" data-seccopy="${code}">${L('คัดลอก', 'Copy')}</button></div><p class="secwarn">${L('จดรหัสนี้เก็บไว้ จะแสดงครั้งเดียวเท่านั้น รหัสเก่า (ถ้ามี) ใช้ไม่ได้แล้ว', 'Write this down; it is shown only once and any older code no longer works')}</p>`;
      SFX.play('quest');
    } else if (k === 'out'){
      ACC.sv = (ACC.sv || 0) + 1; authKeep(); accSave(true);
      secOpen(L('ออกจากระบบทุกเครื่องอื่นแล้ว (มีผลเมื่อเครื่องนั้นซิงก์บัญชี)', 'Logged out every other device (takes effect when they sync the account)')); el('secErr').classList.add('ok'); SFX.play('quest');
    }
  } catch (er){ secErr(AUTH_ERR.oops()); }
  finally { SEC.busy = false; if (b.isConnected) b.disabled = false; }
}

/* ---------- forgot password with the recovery code (local mode) ---------- */
{ const _af = authForgot;
  authForgot = function(){
    if (authFbOn() || !(ACC.rc && ACC.rc.h) || (authOnlineLocal() && NET.db)) return _af.apply(this, arguments);   // online: the Claude sign-in proves it (auth.js)
    const d = el('confirm');
    d.innerHTML = `<div class="secp"><h3>${L('ตั้งรหัสผ่านใหม่ด้วยรหัสกู้คืน', 'Reset your password with the recovery code')}</h3>
      <div class="au-grid one"><label class="au-f"><span class="au-l">${L('ไอดี', 'ID')}</span><span class="au-in"><span class="au-ic">${AU_IC.user}</span><input id="recId" maxlength="16" autocomplete="username" autocapitalize="off" spellcheck="false" value="${escH(AUTH.f.auLId || '')}"></span></label>
      <label class="au-f"><span class="au-l">${L('รหัสกู้คืน', 'Recovery code')}</span><span class="au-in"><span class="au-ic">${AU_IC.lock}</span><input id="recCode" maxlength="24" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX"></span></label></div>
      <div class="au-grid">${secFld('recPw', L('รหัสผ่านใหม่', 'New password'), 'new-password', L('อย่างน้อย 6 ตัว', 'at least 6 characters'))}${secFld('recPw2', L('ยืนยันรหัสผ่านใหม่', 'Confirm new password'), 'new-password')}</div>
      <p class="au-err" id="secErr" role="alert"></p>
      <div class="row"><button class="btn" data-rec="no">${L('ยกเลิก', 'Cancel')}</button><button class="btn gold" data-rec="go">${L('ตั้งรหัสผ่านใหม่', 'Set new password')}</button></div>
      <p class="hint"><button type="button" class="au-link" data-rec="wipe">${L('ไม่มีรหัสกู้คืน? ล้างบัญชีแล้วสมัครใหม่', 'No recovery code? Wipe the account and start over')}</button></p></div>`;
    d.classList.add('secbox'); d.hidden = false;
    d.onclick = async e => {
      const b = e.target.closest && e.target.closest('[data-rec]'); if (!b || SEC.busy) return; const k = b.dataset.rec;
      if (k === 'no'){ secClose(); return; } if (k === 'wipe'){ secClose(); _af(); return; }
      if (AUTH.waitT > Date.now()) return secErr(AUTH_ERR.wait(Math.ceil((AUTH.waitT - Date.now()) / 1000)));
      const id = el('recId').value.trim(), pw = el('recPw').value, bad = authPwBad(pw, id);
      SEC.busy = true; b.disabled = true;
      try {
        if (!ACC.name || ACC.name.toLowerCase() !== id.toLowerCase() || !(await secCodeOk(el('recCode').value))){ authWrong('recCode', () => false); return secErr(L('ไอดีหรือรหัสกู้คืนไม่ถูกต้อง', 'Wrong ID or recovery code')); }
        if (bad) return secErr(AUTH_ERR[bad]()); if (el('recPw2').value !== pw) return secErr(AUTH_ERR.match());
        await authSetPw(pw); delete ACC.rc; accSave(true); secClose(); authDone();   // the code is used up; a new one is made in the panel
        setTimeout(() => secOpen(L('ตั้งรหัสผ่านใหม่แล้ว รหัสกู้คืนเดิมใช้ไปแล้ว สร้างอันใหม่เก็บไว้', 'Password reset; that recovery code is used up, make a new one')), 400);
      } catch (er){ secErr(AUTH_ERR.oops()); }
      finally { SEC.busy = false; if (b.isConnected) b.disabled = false; }
    };
    setTimeout(() => { const i = el(AUTH.f.auLId ? 'recCode' : 'recId'); if (i) i.focus(); }, 30);
  };
}

/* ---------- entry points ---------- */
{ const _rt = renderTitleBody;
  renderTitleBody = function(){
    const r = _rt.apply(this, arguments), bar = el('titleBody') && el('titleBody').querySelector('.accbar');
    if (bar && authed() && !ACC.guest && !bar.querySelector('[data-secopen]'))   // a guest has no password to protect yet: "Bind ID" first
      bar.insertAdjacentHTML('beforeend', `<button class="tbtn sm" data-secopen="1" title="${L('ความปลอดภัยบัญชี', 'Account security')}">${L('ความปลอดภัย', 'Security')}${!authFbOn() && !ACC.rc ? ' <i class="secdot"></i>' : ''}</button>`);
    if (SEC.note){ toast(SEC.note); SEC.note = ''; }
    return r;
  };
}
{ const _rs = renderSettings; renderSettings = function(){
    const out = _rs.apply(this, arguments), t = el('setTitle');
    if (t && ACC.name && !ACC.guest && !el('setSecurity')) t.closest('.row').insertAdjacentHTML('beforebegin', `<div class="row"><button class="btn" id="setSecurity">${L('ความปลอดภัยบัญชี', 'Account security')}</button></div>`);
    return out; }; }
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-secopen],#setSecurity')){ e.preventDefault(); e.stopPropagation(); secOpen(); } }, true);
document.addEventListener('keydown', e => { const i = e.target; if (i && i.closest && i.closest('#confirm.secbox') && i.tagName === 'INPUT'){ e.stopPropagation(); if (e.key === 'Escape') secClose(); } }, true);

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'authsec', t:['ความปลอดภัยบัญชี', 'Account security'], b:() => `<p>${L(
  'รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัว ห้ามซ้ำกับไอดี และไม่ใช่รหัสง่ายสุดอย่าง 123456 · ใส่รหัสผิด 5 ครั้งติดจะถูกล็อก และนานขึ้นทุกครั้ง (สูงสุด 15 นาที) แม้รีโหลดหน้า · "จดจำฉัน" อยู่ได้ 30 วัน · บัญชีเชื่อมกับบัญชี claude.ai ของคุณ บัญชีอื่นที่เปิดเบราว์เซอร์เดียวกันจะไม่เห็นข้อมูลคุณ · หน้า "ความปลอดภัย" ดูการเข้าสู่ระบบล่าสุด เปลี่ยนรหัสผ่าน สร้างรหัสกู้คืน และออกจากระบบทุกเครื่องอื่น · ไอดีที่ดูเหมือนทีมงาน (GM, admin…) สมัครไม่ได้',
  'New passwords need 6+ characters, must not be the same as the ID and must not be one of the easiest guesses like 123456 · 5 wrong tries in a row lock the form, longer each time (up to 15 minutes), even after a reload · "Remember me" lasts 30 days · the account is linked to your claude.ai account; another account opening the same browser never sees your data · the Security page shows recent log-ins and lets you change the password, make a recovery code and log out every other device · IDs that pass for staff (GM, admin…) cannot be registered')}</p>`});
