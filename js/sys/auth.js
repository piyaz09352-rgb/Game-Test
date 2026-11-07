/* VAYRATHEN — js/sys/auth.js — sign-up and log-in on the title screen (v2, rewritten from scratch)
   One log-in layer, ID + password, before character select. Nothing past the title without it.
   · Two backends, picked by where the game runs:
     - "fb"    : your own website with Firebase (js/net/firebase-shim.js, window.VAYFB). The password is checked by
                 Firebase Authentication (Email/Password, the ID becomes <id>@vayrathen.game), so one account works on
                 every device and the password never reaches this code's storage. The ID cannot be renamed.
     - "local" : claude.ai or offline. The password is PBKDF2-SHA256 (150,000 rounds, random 16-byte salt) kept in the
                 account record (ACC.pw), so it is a gate on this device / this claude.ai sign-in.
   · "Remember me" keeps the log-in (Firebase: local persistence; local: localStorage), otherwise until the tab closes.
   · Logging out saves first. On a Firebase site the page then reloads so the online connection restarts cleanly.
     Logging out also locks GM, as before.
   · One browser keeps one Firebase account's data: when another account logs in, this browser's local copy is cleared
     (it stays in the first account's cloud space).
   · (v93) Who you are is proven by the claude.ai sign-in: claude.ai has already checked that person's email, and the
     account lives in that person's private space (data/users/<their id>/account). So:
     - "Forgot password" (online): the account is read back from that private space and a new password is set; the
       characters, coins and costumes all stay. Offline there is nothing to prove who you are, so only a wipe is offered.
     - "Play as guest": no ID or password; a guest ID (guest#####) is made and kept in the same private space, and
       "Bind ID" later picks a real ID and a password without losing anything. A guest comes back by pressing the
       button again on the same claude.ai sign-in.
     Firebase has no mail server here, so a Firebase site still has no reset.
   · The old reserved-GM-ID and "secure your account" flows are gone; GM unlocks with the GM code box (gmlock.js). */
'use strict';

const AUTH = {key:'vayrathen-auth', owner:'vayrathen-owner', it:150000, mode:'', f:{keep:true}, busy:false, ok:false, sess:'', fails:0, waitT:0, cloudP:null};
const authFbOn = () => typeof VAYFB !== 'undefined' && VAYFB.state() !== 'off';
const authHasPw = () => !!(ACC.pw && ACC.pw.h && ACC.pw.s);
const authSleep = ms => new Promise(r => setTimeout(r, ms));
const authHex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
async function authDerive(pw, salt, it){
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return authHex(await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:new Uint8Array(salt.match(/../g).map(h => parseInt(h, 16))), iterations:it}, k, 256));
}
async function authSetPw(pw){ const s = authHex(crypto.getRandomValues(new Uint8Array(16))); ACC.pw = {s, h:await authDerive(pw, s, AUTH.it), it:AUTH.it}; }

/* ---------- the session ---------- */
/* a new password ends every old log-in; so does "log out everywhere" (ACC.sv, js/sys/authsec.js) */
const authTok = () => (ACC.id && authHasPw() ? `${ACC.id}:${ACC.pw.s.slice(0, 12)}${ACC.sv ? ':' + ACC.sv : ''}` : ACC.id && ACC.guest ? `${ACC.id}:guest${ACC.sv ? ':' + ACC.sv : ''}` : '');
const AUTH_DAYS = 30;   // "remember me" lasts this long, then the password is asked again
function authRead(){
  if (AUTH.sess) return AUTH.sess; let v = '';
  try { v = localStorage.getItem(AUTH.key) || sessionStorage.getItem(AUTH.key) || ''; } catch (e) {}
  const [tok, exp] = v.split('|'); return exp && +exp < Date.now() ? '' : tok;
}
function authed(){
  if (authFbOn()) return AUTH.ok && !!ACC.name;
  if (ACC._old && !ACC.name) return AUTH.ok;   // renaming: the ID is briefly empty
  return !!ACC.name && !!authTok() && authRead() === authTok();
}
function authDrop(){ AUTH.ok = false; AUTH.sess = ''; try { localStorage.removeItem(AUTH.key); sessionStorage.removeItem(AUTH.key); } catch (e) {} }
function authKeep(){
  authDrop(); AUTH.ok = true;
  if (authFbOn()) return;   // Firebase keeps its own session
  AUTH.sess = authTok();
  try { (AUTH.f.keep !== false ? localStorage : sessionStorage).setItem(AUTH.key, `${AUTH.sess}|${Date.now() + AUTH_DAYS * 864e5}`); } catch (e) {}
}
AUTH.ok = !authFbOn() && authed(); if (AUTH.ok) AUTH.sess = authTok();
const authMode = () => (AUTH.bind && ACC.guest ? 'bind' : AUTH.mode || (!authFbOn() && authHasPw() ? 'login' : 'reg'));

/* ---------- messages ---------- */
const AUTH_ERR = {
  id:() => L('ไอดีต้องเป็นภาษาอังกฤษ ตัวเลข หรือ _ ยาว 3–16 ตัว', 'Use 3–16 letters, digits or _ for the ID'),
  taken:() => L('ไอดีนี้มีคนใช้แล้ว ถ้าเป็นของคุณ กด "เข้าสู่ระบบ" · หรือลองชื่ออื่น', 'That ID is taken · if it is yours, use "Log in" · or try another'),
  device:() => L('เครื่องนี้มีไอดีอยู่แล้ว กด "เข้าสู่ระบบ" ด้านบน (ลืมรหัส กด "ลืมรหัสผ่าน")', 'This device already has an ID · use "Log in" above (or "Forgot password")'),
  short:() => L('รหัสผ่านต้องยาวอย่างน้อย 6 ตัว', 'The password needs at least 6 characters'),
  mix:() => L('รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข', 'Use both letters and digits in the password'),
  common:() => L('รหัสผ่านนี้เดาง่ายเกินไป ลองแบบอื่น', 'That password is too easy to guess'),
  hasid:() => L('รหัสผ่านห้ามซ้ำกับไอดี', 'The password must not be the same as your ID'),
  reserved:() => L('ไอดีนี้สงวนไว้สำหรับทีมงาน ลองชื่ออื่น', 'That ID is reserved for staff, try another'),
  match:() => L('ยืนยันรหัสผ่านไม่ตรงกัน', 'The two passwords do not match'),
  nopw:() => L('ใส่รหัสผ่าน', 'Enter your password'),
  bad:() => L('ไอดีหรือรหัสผ่านไม่ถูกต้อง', 'Wrong ID or password'),
  wait:s => s > 90 ? L(`ใส่ผิดหลายครั้ง รอ ${Math.ceil(s / 60)} นาทีแล้วลองใหม่`, `Too many wrong tries, wait ${Math.ceil(s / 60)} minutes`) : L(`ใส่ผิดหลายครั้ง รอ ${s} วินาทีแล้วลองใหม่`, `Too many wrong tries, wait ${s} seconds`),
  crypto:() => L('เบราว์เซอร์นี้เข้ารหัสไม่ได้ เปิดเกมผ่านลิงก์ https', 'This browser cannot hash passwords here; open the game over https'),
  closed:() => L('เซิร์ฟเวอร์ยังไม่เปิดระบบอีเมล/รหัสผ่าน (Firebase → Authentication → Email/Password)', 'Email/Password sign-in is not enabled on the server (Firebase → Authentication)'),
  net:() => L('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองอีกครั้ง', 'Cannot reach the server, try again'),
  offline:() => L('กู้รหัสผ่านต้องออนไลน์ เพื่อยืนยันตัวตนด้วยบัญชี Claude', 'Recovering a password needs the game online, to check your Claude sign-in'),
  noacc:() => L('บัญชี Claude นี้ยังไม่มีไอดีในเกม สมัครใหม่ได้เลย', 'This Claude sign-in has no game ID yet, register one'),
  oops:() => L('เกิดข้อผิดพลาด ลองอีกครั้ง', 'Something went wrong, try again')};
const AUTH_FBERR = {'auth/email-already-in-use':'taken', 'auth/user-not-found':'bad', 'auth/wrong-password':'bad', 'auth/invalid-credential':'bad', 'auth/invalid-login-credentials':'bad',
  'auth/weak-password':'short', 'auth/operation-not-allowed':'closed', 'auth/network-request-failed':'net', 'auth/too-many-requests':'wait'};

/* ---------- password rules (new passwords only: an old 6-character password still logs in) ---------- */
const AUTH_COMMON = ['123456', '1234567', '12345678', '123456789', '1234567890', '654321', '87654321', '111111', '000000', '123123', 'password', 'qwerty', 'abc123', 'vayrathen'];
/* kept easy on purpose (owner's choice): 6+ characters, not the ID itself, not one of the very easiest guesses */
function authPwBad(pw, id){
  if (pw.length < 6) return 'short';
  const lo = pw.toLowerCase();
  if (AUTH_COMMON.includes(lo) || /^(.)\1+$/.test(pw)) return 'common';
  if (id && lo === id.toLowerCase()) return 'hasid';
  return '';
}
/* 0–4 for the meter under the password box */
function authPwScore(pw){
  if (!pw) return 0; let k = 0;
  if (pw.length >= 8) k++; if (pw.length >= 12) k++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) k++; if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) k++;
  if (authPwBad(pw, '')) k = Math.min(k, 1); return Math.min(4, k);
}
/* names that would pass for staff cannot be registered (the GM is unlocked by the owner's code, never by a name) */
const authIdReserved = id => /^gm/i.test(id) || /(^|_)(gamemaster|admin|administrator|mod|moderator|staff|system|support|official|owner|dev|developer)\d*(_|$)/i.test(id);

/* wrong tries survive a reload: 5 in a row lock the form, each lock twice as long as the last (30 s up to 15 min) */
const AUTH_WAITK = 'vayrathen-authwait';
try { const w = JSON.parse(localStorage.getItem(AUTH_WAITK) || '{}'); AUTH.fails = w.n || 0; AUTH.waitT = w.t || 0; AUTH.lvl = w.l || 0; } catch (e) {}
function authWaitSave(){ try { localStorage.setItem(AUTH_WAITK, JSON.stringify({n:AUTH.fails, t:AUTH.waitT, l:AUTH.lvl || 0})); } catch (e) {} }

/* ---------- the panel ---------- */
const AU_IC = {
  user:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="7" r="3.4"/><path d="M3.5 17c.8-3.4 3.3-5 6.5-5s5.7 1.6 6.5 5"/></svg>',
  lock:'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="9" width="12" height="8.5" rx="2"/><path d="M7 9V6.6a3 3 0 0 1 6 0V9"/><circle cx="10" cy="13.2" r="1.1"/></svg>',
  eye:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M1.8 10S5 4.6 10 4.6 18.2 10 18.2 10 15 15.4 10 15.4 1.8 10 1.8 10z"/><circle cx="10" cy="10" r="2.6"/><path class="au-slash" d="M3.5 16.5 16.5 3.5"/></svg>'};
/* twinkling four-point stars and rising gold dust: fixed positions, negative delays so they are already moving */
const AU_FX = (() => {
  let s = 11; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; let h = '';
  for (let i = 0; i < 24; i++) h += `<i style="--x:${(r() * 100).toFixed(1)}%;--y:${(r() * 100).toFixed(1)}%;--s:${Math.round(9 + r() * 15)}px;--d:${(-r() * 6).toFixed(2)}s;--t:${(2.6 + r() * 2.8).toFixed(2)}s"></i>`;
  for (let i = 0; i < 18; i++) h += `<b style="--x:${(r() * 100).toFixed(1)}%;--d:${(-r() * 10).toFixed(2)}s;--t:${(6 + r() * 6).toFixed(2)}s;--w:${(r() * 30 - 15).toFixed(0)}px"></b>`;
  return `<div class="au-fx" aria-hidden="true">${h}</div>`;
})();
function authPanel(){
  if (authFbOn() && (VAYFB.state() === 'init' || (VAYFB.user() && !AUTH.ok && !AUTH.busy)))   // Firebase is starting, or restoring a log-in
    return `<div class="au-box" id="auBox" data-m="login">${AU_FX}<p class="au-hint au-wait" style="display:block;padding:26px 0">${L('กำลังเชื่อมต่อเซิร์ฟเวอร์…', 'Connecting to the server…')}</p></div>`;
  const m = authMode(), f = AUTH.f, fb = authFbOn();
  const fld = (id, label, type, ic, ph, more) => `<label class="au-f" data-f="${id}"><span class="au-l">${label}</span>
      <span class="au-in"><span class="au-ic">${ic}</span><input id="${id}" type="${type}" value="${escH(f[id] || '')}" placeholder="${ph}" ${more}>${type === 'password'
        ? `<button type="button" class="au-eye" data-aueye="${id}" aria-pressed="false" aria-label="${L('แสดงรหัสผ่าน', 'Show password')}" title="${L('แสดง/ซ่อนรหัสผ่าน', 'Show / hide password')}">${AU_IC.eye}</button>` : ''}</span></label>`;
  const idf = id => fld(id, L('ไอดี', 'ID'), 'text', AU_IC.user, L('เช่น maprang_09', 'e.g. maprang_09'), 'maxlength="16" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false"');
  const pwf = (id, label, ac) => fld(id, label, 'password', AU_IC.lock, ac === 'new-password' ? L('อย่างน้อย 6 ตัว', 'at least 6 characters') : L('รหัสผ่านของคุณ', 'your password'), `maxlength="64" autocomplete="${ac}"`);
  const hint = {
    login:fb ? L('ไอดีเดียวเล่นได้ทุกเครื่อง · ยังไม่มีไอดี? กดแท็บ "สมัครสมาชิก"', 'One ID works on every device · no ID yet? Open the Register tab')
      : L('ลืมรหัสผ่าน? กด "ลืมรหัสผ่าน" แล้วตั้งรหัสใหม่ได้ ตัวละครไม่หาย (ยืนยันตัวตนด้วยบัญชี Claude)', 'Forgot it? "Forgot password" sets a new one and keeps your characters (checked by your Claude sign-in)'),
    reset:L('ยืนยันตัวตนด้วยบัญชี Claude ที่ล็อกอินอยู่แล้ว · ตัวละคร เหรียญ และชุดแฟชั่นอยู่ครบ · รหัสเดิมใช้ไม่ได้อีก', 'Checked by the Claude sign-in you are using · characters, coins and costumes all stay · the old password stops working'),
    bind:L(`ผูกไอดีจริงให้บัญชีแขก @${escH(ACC.name || '')} · ของทั้งหมดอยู่ครบ · ใช้ไอดีเดิมก็ได้`, `Give guest @${escH(ACC.name || '')} a real ID and password · everything stays · you may keep the same ID`),
    reg:L('รหัสผ่านอย่างน้อย 6 ตัว ห้ามซ้ำกับไอดี · รหัสผ่านถูกเข้ารหัสก่อนเก็บ · สมัครรับ 10 เหรียญวายรา', '6+ characters, not the same as your ID · your password is hashed before it is stored · get 10 Vayra Coins for joining')};
  return `<div class="au-box" id="auBox" data-m="${m}">${AU_FX}<i class="au-cn tl"></i><i class="au-cn tr"></i><i class="au-cn bl"></i><i class="au-cn br"></i>
    <button type="button" class="au-lang" data-aulang="1" aria-label="${L('Switch to English', 'เปลี่ยนเป็นภาษาไทย')}">${L('EN', 'ไทย')}</button>
    <div class="au-tabs" role="tablist"><span class="au-pill"></span>
      <button type="button" role="tab" data-autab="login" aria-selected="${m === 'login'}">${L('เข้าสู่ระบบ', 'Log in')}</button>
      <button type="button" role="tab" data-autab="reg" aria-selected="${m === 'reg'}">${L('สมัครสมาชิก', 'Register')}</button></div>
    ${m === 'reset' || m === 'bind' ? `<p class="au-mh">${m === 'reset' ? L(`🔑 ตั้งรหัสผ่านใหม่ให้ @${escH(ACC.name)}`, `🔑 New password for @${escH(ACC.name)}`) : L('🔗 ผูกไอดีให้บัญชีแขก', '🔗 Bind an ID to your guest account')}</p>` : ''}
    <div class="au-pane au-login" role="tabpanel"><div class="au-grid one">${idf('auLId')}${pwf('auLPw', L('รหัสผ่าน', 'Password'), 'current-password')}</div></div>
    <div class="au-pane au-reg" role="tabpanel"><div class="au-grid">${idf('auId')}${pwf('auPw', L('รหัสผ่าน', 'Password'), 'new-password')}${pwf('auPw2', L('ยืนยันรหัสผ่าน', 'Confirm password'), 'new-password')}</div>
      <div class="au-meter" id="auMeter" data-k="${authPwScore(f.auPw || '')}"><i></i><i></i><i></i><i></i><span>${authMeterTxt(authPwScore(f.auPw || ''), f.auPw)}</span></div></div>
    ${m === 'reset' ? `<div class="au-pane au-reset"><div class="au-grid">${pwf('auRPw', L('รหัสผ่านใหม่', 'New password'), 'new-password')}${pwf('auRPw2', L('ยืนยันรหัสผ่านใหม่', 'Confirm new password'), 'new-password')}</div></div>` : ''}
    <div class="au-row"><label class="au-keep"><input type="checkbox" id="auKeep" ${f.keep !== false ? 'checked' : ''}><span>${L('จดจำฉันในเครื่องนี้', 'Remember me on this device')}</span></label>
      ${fb ? '' : `<button type="button" class="au-link au-forgot" data-auforgot="1">${L('ลืมรหัสผ่าน?', 'Forgot password?')}</button>`}</div>
    <p class="au-err" id="auErr" role="alert" aria-live="assertive"></p>
    <button type="button" class="au-go" data-auth="go"><span class="au-t-login">${L('เข้าสู่ระบบ', 'Log in')}</span><span class="au-t-reg">${L('สมัครสมาชิก', 'Create account')}</span><span class="au-t-reset">${L('ตั้งรหัสใหม่และเข้าเกม', 'Set it and play')}</span><span class="au-t-bind">${L('ผูกไอดี', 'Bind ID')}</span></button>
    <p class="au-hint au-h-login">${hint.login}</p><p class="au-hint au-h-reg">${hint.reg}</p><p class="au-hint au-h-reset">${hint.reset}</p><p class="au-hint au-h-bind">${hint.bind}</p>
    ${m === 'reset' || m === 'bind' ? `<p class="au-hint au-back"><button type="button" class="au-link" data-auback="1">${L('← กลับ', '← Back')}</button>${m === 'reset' ? ` · <button type="button" class="au-link" data-auwipe="1">${L('ล้างบัญชีแล้วสมัครใหม่แทน', 'Wipe and start over instead')}</button>` : ''}</p>`
      : fb ? '' : `<button type="button" class="au-guest" data-auguest="1">${L('▶ เล่นแบบแขก · ไม่ต้องสมัคร', '▶ Play as guest · no sign-up')}</button>`}
    ${fb ? `<p class="au-hint" style="display:block"><button type="button" class="au-link" data-auoff="1">${L('เล่นออฟไลน์ (เซฟในเครื่องนี้)', 'Play offline (saves stay on this device)')}</button></p>` : ''}</div>`;
}
function authMeterTxt(k, pw){ return !pw ? L('ความแข็งแรงของรหัสผ่าน', 'Password strength') : [L('อ่อนมาก', 'Very weak'), L('อ่อน', 'Weak'), L('พอใช้', 'Fair'), L('ดี', 'Good'), L('แข็งแรงมาก', 'Strong')][k]; }
function authMeter(){ const m = el('auMeter'), pw = (el('auPw') || {}).value || ''; if (!m) return; const k = authPwScore(pw); m.dataset.k = pw ? k : 0; m.querySelector('span').textContent = authMeterTxt(k, pw); }
function authFocus(id){
  if (!matchMedia('(pointer:fine)').matches && !id) return;   // phones: do not pop the keyboard up by itself
  const box = el('auBox'); if (!box) return;
  const i = id ? el(id) : [...box.querySelectorAll(`${{login:'.au-login', reset:'.au-reset'}[authMode()] || '.au-reg'} input`)].find(x => !x.value); if (i) i.focus();
}
/* an error under the form; the field it is about turns red and gets the focus */
function authMsg(t, fid){
  const p = el('auErr'); if (p){ p.textContent = t || ''; p.classList.toggle('show', !!t); }
  document.querySelectorAll('#auBox .au-f').forEach(n => { const bad = !!fid && n.dataset.f === fid; n.classList.toggle('bad', bad); const i = n.querySelector('input'); if (i) i.setAttribute('aria-invalid', bad ? 'true' : 'false'); });
  if (fid){ const i = el(fid); if (i){ i.focus(); const w = i.closest('.au-f'); w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); } }
}
function authBusy(on){ AUTH.busy = on; const b = document.querySelector('#auBox [data-auth="go"]'); if (b){ b.disabled = on; b.classList.toggle('busy', on); } }
function authTab(m){
  AUTH.mode = m; const box = el('auBox'); if (!box) return;
  box.dataset.m = m; box.querySelectorAll('[data-autab][role="tab"]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.autab === m)));
  authMsg(''); authFocus();
}

/* ---------- Firebase backend ---------- */
/* one browser keeps one account's data: a different account clears this browser's local copy (the first one's cloud copy stays) */
function authAdopt(uid){
  let prev = ''; try { prev = localStorage.getItem(AUTH.owner) || ''; } catch (e) {}
  if (prev && prev !== uid){
    try { for (let i = 0; i < SLOTS; i++){ localStorage.removeItem(slotKey(i)); localStorage.removeItem(`vayrathen-bk-${i}`); } localStorage.removeItem(ACCKEY); } catch (e) {}
    ACC = accBlank(); S = newS(); setSlot(0);
  }
  try { localStorage.setItem(AUTH.owner, uid); } catch (e) {}
}
/* signed in to Firebase: take the account over (the cloud copy first, so a new device never overwrites it) */
async function authFbEnter(user){
  const id = user.displayName || String(user.email || '').split('@')[0];
  authAdopt(user.uid);
  if (window.claude && typeof window.claude.use === 'function'){   // the online connection starts by itself once signed in
    for (let i = 0; i < 80 && !NET.ready; i++) await authSleep(100);
    if (NET.db) await Promise.race([AUTH.cloudP, authSleep(8000)]);
  }
  if (!ACC.name){ const e = await accCreate(id); if (e) return e; }
  authKeep(); accSave(true); return '';
}
{ const _cl = accCloudLoad; AUTH.cloudP = new Promise(r => { accCloudLoad = async function(){ try { return await _cl.apply(this, arguments); } finally { r(); } }; }); }
if (typeof VAYFB !== 'undefined') VAYFB.onChange(async u => {   // first answer, a restored log-in, or a sign-out elsewhere
  if (u && !AUTH.ok && !AUTH.busy){ const e = await authFbEnter(u); if (e){ toast(e); try { await VAYFB.signOut(); } catch (er) {} } }
  else if (!u) AUTH.ok = false;
  if (!el('title').hidden) renderTitleBody();
});

/* ---------- register / log in ---------- */
const authIdOk = id => ACC_RE.test(id);
async function authGo(){
  if (AUTH.busy || !el('auBox') || !el('auId')) return;
  const m = authMode(), val = id => String((el(id) && el(id).value) || '');
  const fail = (k, fid, arg) => { authBusy(false); authMsg(AUTH_ERR[k](arg), fid); SFX.play('hurt'); return false; };
  if (AUTH.waitT > Date.now() && m !== 'reset' && m !== 'bind') return fail('wait', '', Math.ceil((AUTH.waitT - Date.now()) / 1000));
  if (m === 'reset') return authReset(val, fail);
  const idF = m === 'login' ? 'auLId' : 'auId', pwF = m === 'login' ? 'auLPw' : 'auPw', id = val(idF).trim(), pw = val(pwF);
  if (!authIdOk(id)) return fail('id', idF);
  if (m === 'reg' || m === 'bind'){ if (authIdReserved(id)) return fail('reserved', idF); const bad = authPwBad(pw, id); if (bad) return fail(bad, 'auPw'); if (val('auPw2') !== pw) return fail('match', 'auPw2'); }
  else if (!pw) return fail('nopw', pwF);
  const fb = authFbOn(); if (!fb && !(window.crypto && crypto.subtle)) return fail('crypto');
  authBusy(true); authMsg('');
  try {
    if (fb){
      let user; try { user = m === 'reg' ? await VAYFB.signUp(id, pw, AUTH.f.keep !== false) : await VAYFB.signIn(id, pw, AUTH.f.keep !== false); }
      catch (er){ const k = AUTH_FBERR[er && er.code] || 'oops'; if (k === 'bad') return authWrong(pwF, fail);
        // (v80) signing up with an ID that is already yours (same password): just log in instead of saying "taken"
        if (k === 'taken' && m === 'reg'){ try { user = await VAYFB.signIn(id, pw, AUTH.f.keep !== false); } catch (e2){ user = null; } }
        if (!user) return fail(k, k === 'taken' ? idF : '', 30); }
      const e = await authFbEnter(user); if (e){ authBusy(false); authMsg(e, idF); return false; }
      return authDone();
    }
    if (m === 'bind'){   // a guest picks a real ID (or keeps the guest one) and a password; nothing else changes
      if (!ACC.guest || !ACC.name) return authBack();
      if (id.toLowerCase() !== ACC.name.toLowerCase()){ const e = await accCreate(id); if (e){ authBusy(false); authMsg(e, idF); SFX.play('hurt'); return false; } }
      delete ACC.guest; await authSetPw(pw); accSave(true); if (typeof NET !== 'undefined') NET.dirSig = ''; return authDone();
    }
    if (m === 'reg'){
      if (ACC.name && authHasPw()){   // this device already has an account: the same ID and password just logs in; otherwise say so plainly
        if (ACC.name.toLowerCase() === id.toLowerCase() && (await authDerive(pw, ACC.pw.s, ACC.pw.it || AUTH.it)) === ACC.pw.h) return authDone();
        return fail('device', idF); }
      const e = await accCreate(id); if (e){ authBusy(false); authMsg(e, idF); SFX.play('hurt'); return false; }
      delete ACC._old; delete ACC.guest; await authSetPw(pw); accSave(true); return authDone();
    }
    if (authOnlineLocal() && NET.db && (ACC.name !== id || !authHasPw()) && typeof accCloudLoad === 'function') await accCloudLoad();
    if (!ACC.name || ACC.name.toLowerCase() !== id.toLowerCase() || !authHasPw()) return authWrong(pwF, fail);   // same words as a wrong password: nothing hints which IDs exist
    if ((await authDerive(pw, ACC.pw.s, ACC.pw.it || AUTH.it)) !== ACC.pw.h) return authWrong(pwF, fail);
    return authDone();
  } catch (e){ return fail('oops'); }
}
const authOnlineLocal = () => typeof NET !== 'undefined' && !!NET.uid;
function authWrong(fid, fail){
  AUTH.fails++; if (AUTH.fails >= 5){ AUTH.fails = 0; AUTH.waitT = Date.now() + Math.min(900000, 30000 * 2 ** (AUTH.lvl || 0)); AUTH.lvl = (AUTH.lvl || 0) + 1; }
  authWaitSave();
  const i = el(fid); if (i) i.value = ''; AUTH.f[fid] = '';
  return fail('bad', fid);
}
function authDone(){
  authKeep(); AUTH.fails = 0; AUTH.lvl = 0; AUTH.waitT = 0; authWaitSave(); if (typeof secLoggedIn === 'function') secLoggedIn(); AUTH.mode = ''; AUTH.f = {keep:AUTH.f.keep}; AUTH.busy = false;   // typed passwords leave memory
  AUTH.bind = false; SFX.play('quest'); renderTitleBody(); toast(L(`ยินดีต้อนรับ @${ACC.name}`, `Welcome, @${ACC.name}`));
  return true;
}
function authLockGm(){ try { localStorage.removeItem(GMLOCK.key); } catch (e) {} }
async function authLogout(){
  if (!PAUSED){ if (typeof WIN_IDS !== 'undefined') for (const w of WIN_IDS) closeWin(w); showTitle(); }
  const fb = authFbOn(), name = ACC.name; authLockGm();
  if (fb){   // save everything, sign out, and restart the page so the online connection starts over
    try { if (typeof save === 'function') save(); accSave(true); if (typeof cloudSave === 'function') cloudSave(true); } catch (e) {}
    await authSleep(900); authDrop(); try { await VAYFB.signOut(); } catch (e) {} location.reload(); return;
  }
  authDrop(); AUTH.mode = ACC.guest ? '' : 'login'; AUTH.f = ACC.guest ? {keep:AUTH.f.keep} : {keep:AUTH.f.keep, auLId:name};
  if (typeof gmVerify === 'function'){ if (UIS.open.gm) closeWin('gm'); await gmVerify(); }
  renderTitleBody(); toast(L('ออกจากระบบแล้ว', 'Logged out'));
}
const authLogoutAsk = () => askConfirm(L('ออกจากระบบ', 'Log out'), ACC.guest
  ? L(`บันทึกแล้วออกจากบัญชีแขก @${escH(ACC.name)} · กลับมาได้ด้วยปุ่ม "เล่นแบบแขก" บนบัญชี Claude เดียวกัน · แนะนำกด "ผูกไอดี" ก่อน`, `Save and log out of guest @${escH(ACC.name)} · come back with "Play as guest" on the same Claude sign-in · binding an ID first is safer`)
  : L(`บันทึกแล้วออกจากบัญชี @${escH(ACC.name)} · เข้าใหม่ได้ด้วยไอดีและรหัสผ่าน`, `Save and log out of @${escH(ACC.name)} · log in again with your ID and password`), L('ออกจากระบบ', 'Log out'), authLogout);
/* local mode: "forgot password" proves who you are with the claude.ai sign-in and sets a new password (v93) */
async function authForgot(){
  if (AUTH.busy) return;
  if (!authOnlineLocal() || !NET.db){ authMsg(AUTH_ERR.offline()); return authWipeAsk(); }
  authBusy(true); authMsg(L('กำลังตรวจบัญชี Claude…', 'Checking your Claude sign-in…'));
  let c = null, ok = true;
  try { const snap = await NET.db.doc(`data/users/${NET.uid}/account`).get(); if (snap.exists) c = JSON.parse(snap.data().a || '{}'); } catch (e){ ok = false; }
  authBusy(false);
  if (!ok) return authMsg(AUTH_ERR.net());
  if (c && typeof seasonOld === 'function' && seasonOld(c)) c = null;   // from before a world reset: gone
  if (!c || !c.name){ authTab('reg'); return authMsg(AUTH_ERR.noacc(), 'auId'); }
  if (typeof accCloudLoad === 'function') await accCloudLoad();
  if (!ACC.name || ACC.name !== c.name || ACC.id !== c.id) return authMsg(AUTH_ERR.oops());
  AUTH.reset = NET.uid; AUTH.mode = 'reset'; AUTH.f = {keep:AUTH.f.keep}; renderTitleBody();
}
async function authReset(val, fail){
  if (!AUTH.reset || !authOnlineLocal() || AUTH.reset !== NET.uid || !ACC.name) return authBack();
  const pw = val('auRPw'), bad = authPwBad(pw, ACC.name); if (bad) return fail(bad, 'auRPw'); if (val('auRPw2') !== pw) return fail('match', 'auRPw2');
  if (!(window.crypto && crypto.subtle)) return fail('crypto');
  authBusy(true);
  try { await authSetPw(pw); delete ACC.guest; accSave(true); AUTH.reset = ''; toast(L('ตั้งรหัสผ่านใหม่แล้ว', 'New password set')); return authDone(); }
  catch (e){ return fail('oops'); }
}
/* a guest: no ID or password typed; the guest ID lives in this claude.ai sign-in's private space */
async function authGuest(){
  if (AUTH.busy) return; authBusy(true); authMsg('');
  try {
    if (authOnlineLocal() && NET.db && typeof accCloudLoad === 'function') await accCloudLoad();
    if (ACC.name && authHasPw()){ authBusy(false); authTab('login'); return authMsg(AUTH_ERR.device(), 'auLId'); }
    if (!ACC.name){
      let e = '';
      for (let k = 0; k < 4; k++){ e = await accCreate('guest' + (10000 + Math.floor(Math.random() * 90000))); if (!e) break; }
      if (e){ authBusy(false); return authMsg(e); }
    }
    ACC.guest = 1; accSave(true); return authDone();
  } catch (e){ authBusy(false); authMsg(AUTH_ERR.oops()); }
}
function authBack(){ authBusy(false); AUTH.reset = ''; AUTH.bind = false; AUTH.mode = authHasPw() ? 'login' : ''; AUTH.f = {keep:AUTH.f.keep}; renderTitleBody(); return false; }
/* the old way out, kept for offline: start over on this device (the cloud copy of the account and the saves go too) */
function authWipeAsk(){
  askConfirm(L('ล้างบัญชีในเครื่องนี้', 'Wipe the account on this device'),
    L('การล้างจะลบบัญชี ตัวละคร เหรียญ และชุดของบัญชีนี้ทั้งหมด แล้วให้สมัครใหม่ · ย้อนกลับไม่ได้', 'This deletes this account with its characters, coins and costumes so you can register again · it cannot be undone'),
    L('ล้างและสมัครใหม่', 'Wipe and start over'), () => {
      try { for (let i = 0; i < SLOTS; i++){ localStorage.removeItem(slotKey(i)); localStorage.removeItem(`vayrathen-bk-${i}`); if (typeof cloudDelete === 'function') cloudDelete(i); } localStorage.removeItem(ACCKEY); } catch (e) {}
      if (NET && NET.db && NET.uid) NET.db.doc(`data/users/${NET.uid}/account`).delete().catch(() => {});
      ACC = accBlank(); S = newS(); setSlot(0); authDrop(); AUTH.reset = ''; AUTH.mode = 'reg'; AUTH.f = {keep:AUTH.f.keep}; renderTitleBody(); toast(L('ล้างบัญชีแล้ว สมัครใหม่ได้เลย', 'Account wiped, register again'));
    });
}

/* ---------- hooks ---------- */
/* the title: the panel until logged in; after that the account bar gets a log-out button (and a fixed ID on Firebase) */
{ const _rt = renderTitleBody;
  renderTitleBody = function(){
    const r = _rt.apply(this, arguments);
    const box = el('titleBody'), card = box && box.closest('.title-card'); if (!box) return r;
    if (TITLE.mode === 'make' || (authed() && !(AUTH.bind && ACC.guest))){
      card.classList.remove('authing');
      const ren = box.querySelector('[data-accren],[data-aubind]');
      if (ren){ if (authFbOn()) ren.remove(); else if (!box.querySelector('[data-aulogout]')) ren.insertAdjacentHTML('afterend', `<button class="tbtn sm" data-aulogout="1">${L('ออกจากระบบ', 'Log out')}</button>`); }
      if (authFbOn() && !box.querySelector('[data-aulogout]') && box.querySelector('.accbar')) box.querySelector('.accbar').insertAdjacentHTML('beforeend', `<button class="tbtn sm" data-aulogout="1">${L('ออกจากระบบ', 'Log out')}</button>`);
      if (ACC._old && !ACC.name){   // renaming (local mode): the old "create" box, worded for a rename
        const h = box.querySelector('.accnew .t-slots-h b'); if (h) h.textContent = L('เปลี่ยนไอดี', 'Change your ID');
        box.querySelectorAll('.accnew .mk-note').forEach((p, i) => { if (i) p.remove(); else p.textContent = L('ไอดีใหม่ต้องไม่ซ้ำกับผู้เล่นอื่น · รหัสผ่านเดิมยังใช้ได้', 'The new ID must be free · your password stays the same'); });
        const g = box.querySelector('[data-accgo]'); if (g) g.textContent = L('บันทึกไอดีใหม่', 'Save new ID');
      }
      return r;
    }
    card.classList.add('authing'); box.innerHTML = authPanel(); el('saveInfo').textContent = '';
    setTimeout(() => authFocus(), 0);
    return r;
  };
}
/* a taken ID can never be claimed by renaming either (online check in accCreate); nothing past the title without a log-in */
{ const _cg = continueGame; continueGame = function(){ if (!authed()){ renderTitleBody(); return; } return _cg.apply(this, arguments); }; }
{ const _ng = newGame; newGame = function(){ if (!authed()){ TITLE.mode = 'slots'; renderTitleBody(); return; } return _ng.apply(this, arguments); }; }
/* Settings → Other: log out next to "Back to title" */
{ const _rs = renderSettings; renderSettings = function(){
    const out = _rs.apply(this, arguments); const t = el('setTitle');
    if (t && !el('setLogout') && ACC.name) t.insertAdjacentHTML('afterend', `<button class="btn" id="setLogout">${L('ออกจากระบบ', 'Log out')} @${escH(ACC.name)}</button>`);
    return out; }; }

document.addEventListener('click', e => {
  const t = e.target; if (!t.closest) return;
  // (v240) «ตั้งค่า» on the title works before signing in too: js/sys/login234.js opens it above the title (the old block dated from when it entered the world)
  if (t.closest('#setLogout,[data-aulogout]')){ e.preventDefault(); e.stopPropagation(); authLogoutAsk(); return; }
  if (t.closest('[data-aubind]')){ e.preventDefault(); e.stopPropagation(); AUTH.bind = true; AUTH.f = {keep:AUTH.f.keep, auId:ACC.name}; renderTitleBody(); return; }
  const b = t.closest('#auBox [data-autab],#auBox [data-aueye],#auBox [data-auth],#auBox [data-aulang],#auBox [data-auforgot],#auBox [data-auoff],#auBox [data-auguest],#auBox [data-auback],#auBox [data-auwipe]'); if (!b) return;
  e.preventDefault(); const d = b.dataset;
  if (d.autab) authTab(d.autab);
  else if (d.auforgot) authForgot();
  else if (d.auguest) authGuest();
  else if (d.auback) authBack();
  else if (d.auwipe) authWipeAsk();
  else if (d.auoff){ VAYFB.offline(); AUTH.mode = ''; renderTitleBody(); }
  else if (d.aueye){ const i = el(d.aueye); if (!i) return; const show = i.type === 'password'; i.type = show ? 'text' : 'password';
    b.setAttribute('aria-pressed', String(show)); b.setAttribute('aria-label', show ? L('ซ่อนรหัสผ่าน', 'Hide password') : L('แสดงรหัสผ่าน', 'Show password')); }
  else if (d.auth) authGo();
  else if (d.aulang){ SETTINGS.lang = LANG === 'en' ? 'th' : 'en'; saveSettings(); setLang(SETTINGS.lang); renderHotbar(); renderBotChip(); renderTitleBody(); }
}, true);
/* typing: kept across redraws of the title (the cloud can redraw it); the game's keys stay out of the boxes */
document.addEventListener('input', e => { const i = e.target; if (!i.closest || !i.closest('#auBox')) return; AUTH.f[i.id === 'auKeep' ? 'keep' : i.id] = i.type === 'checkbox' ? i.checked : i.value; if (i.closest('.au-f.bad')) authMsg(''); if (i.id === 'auPw') authMeter(); });
document.addEventListener('change', e => { if (e.target.id === 'auKeep') AUTH.f.keep = e.target.checked; });
document.addEventListener('keydown', e => {
  const i = e.target; if (!i.closest || !i.closest('#auBox')) return;
  if (i.tagName === 'INPUT'){ e.stopPropagation(); if (e.key === 'Enter' && i.type !== 'checkbox'){ e.preventDefault(); authGo(); } }
}, true);

/* safety net: if the title is showing but its body is still the empty placeholder (a render that failed or never ran), draw the log-in panel again */
setInterval(() => { try { const t = el('title'), b = el('titleBody'); if (t && !t.hidden && b && !b.querySelector('#auBox, .slots, .accbar, .maker, [data-make], [data-play]')) renderTitleBody(); } catch (e) {} }, 1000);
