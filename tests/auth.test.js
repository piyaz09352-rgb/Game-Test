/* VAYRATHEN — tests/auth.test.js — sign up and log in on the title screen (js/sys/auth.js, v2).
   Local mode (offline): nothing past the title before logging in; the register form's checks; register; log out from
   Settings; wrong password and unknown ID get the same refusal; the right password logs in; "remember me" keeps the
   log-in for a new tab and without it a new tab asks again; "forgot password" wipes the account on this device; no
   password is ever stored as text.
   Firebase mode: a stub of window.VAYFB (what js/net/firebase-shim.js provides) stands in for Firebase Authentication:
   the panel waits while it starts, registers and logs in through it, shows its errors, the ID cannot be renamed, and
   log-out signs out. Nothing here touches a real Firebase project. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

const errText = page => page.evaluate(() => (el('auErr') ? el('auErr').textContent : ''));
const mode = page => page.evaluate(() => (el('auBox') ? el('auBox').dataset.m : ''));
async function submit(page){
  await page.click('#auBox [data-auth="go"]');
  await page.waitForFunction(() => !el('auBox') || (!AUTH.busy && !!el('auErr').textContent), null, { timeout: 30000 });
}
async function register(page, { id, pw, pw2 = pw }){
  await page.click('#auBox [data-autab="reg"][role="tab"]');
  await page.fill('#auId', id); await page.fill('#auPw', pw); await page.fill('#auPw2', pw2);
  await submit(page);
}
async function login(page, id, pw){
  await page.click('#auBox [data-autab="login"][role="tab"]');
  await page.fill('#auLId', id); await page.fill('#auLPw', pw);
  await submit(page);
}
/* another tab of the same browser: the same localStorage, its own (empty) sessionStorage */
async function newTab(page, url){
  const ctx = await page.context().browser().newContext({ viewport: { width: 1280, height: 720 }, storageState: await page.context().storageState() });
  const tab = await ctx.newPage(); await tab.route(u => !u.href.startsWith(url), r => r.abort());
  await tab.goto(url); await tab.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
  return { tab, close: () => ctx.close() };
}
const stored = page => page.evaluate(() => { const out = [];
  for (const st of [localStorage, sessionStorage]) for (let i = 0; i < st.length; i++) out.push(st.key(i) + '=' + st.getItem(st.key(i)));
  return out.join('\n'); });

test('local: register, log out, wrong password refused, log in again, remember me', { skip, timeout: 420000 }, async () => {
  const { page, errors, url, close } = await openGame();
  try {
    assert.ok(await page.$('#auBox'), 'the title starts with the sign-up / log-in panel');
    assert.strictEqual(await page.$('[data-make]'), null, 'no character slots before logging in');
    assert.strictEqual(await mode(page), 'reg', 'a new browser opens on Register');
    assert.strictEqual(await page.$('#auMail'), null, 'no email field any more');
    assert.strictEqual(await page.evaluate(() => { continueGame(0); newGame(0, 'Sneak'); return PAUSED && !el('title').hidden; }), true, 'the game cannot start before logging in');

    await register(page, { id: 'ab', pw: 'secret12' }); assert.match(await errText(page), /3–16/);
    await register(page, { id: 'auth_user', pw: '12345' }); assert.match(await errText(page), /อย่างน้อย 6|at least 6/);
    await register(page, { id: 'auth_user', pw: '123456' }); assert.match(await errText(page), /เดาง่าย|easy to guess/);
    await register(page, { id: 'auth_user', pw: 'AUTH_USER' }); assert.match(await errText(page), /ซ้ำกับไอดี|same as your ID/);
    await register(page, { id: 'GM_boss', pw: 'secret12' }); assert.match(await errText(page), /สงวน|reserved/);
    await register(page, { id: 'admin_7', pw: 'secret12' }); assert.match(await errText(page), /สงวน|reserved/);
    await register(page, { id: 'auth_user', pw: 'secret12', pw2: 'secret13' }); assert.match(await errText(page), /ไม่ตรงกัน|do not match/);
    assert.strictEqual(await page.evaluate(() => ACC.name), '', 'no account yet');

    await page.click('#auBox [data-aueye="auPw"]'); assert.strictEqual(await page.getAttribute('#auPw', 'type'), 'text');
    await page.click('#auBox [data-aueye="auPw"]'); assert.strictEqual(await page.getAttribute('#auPw', 'type'), 'password');

    await register(page, { id: 'auth_user', pw: 'secret12' });
    await page.waitForSelector('[data-make]', { timeout: 30000 });
    assert.strictEqual(await page.$('#auBox'), null, 'the panel is gone after registering');
    assert.deepStrictEqual(await page.evaluate(() => ({ n: ACC.name, c: ACC.coins, p: authHasPw() })), { n: 'auth_user', c: 60, p: true }, 'account made with 10 coins (+50 from the starting-money achievements, once) and a password');
    assert.ok(!(await stored(page)).includes('secret12'), 'the password is never stored as text');

    // log out from the title screen's account bar (Settings no longer has a second log-out button)
    assert.strictEqual(await page.evaluate(() => { openWin('settings'); renderSettings(); return !!el('setLogout'); }), false, 'Settings has no log-out button');
    await page.evaluate(() => closeWin('settings'));
    await page.click('[data-aulogout]'); await page.click('#confirm [data-cf="ok"]');
    await page.waitForSelector('#auBox'); assert.strictEqual(await mode(page), 'login', 'after logging out the panel opens on Log in');

    // an unknown ID and a wrong password are refused with the same words
    await login(page, 'nobody_here', 'secret12'); const unknown = await errText(page);
    await login(page, 'auth_user', 'wrong-pass'); const wrong = await errText(page);
    assert.match(unknown, /ไม่ถูกต้อง|Wrong/); assert.strictEqual(unknown, wrong, 'nothing hints which IDs exist');
    // five wrong tries lock the form for 30 seconds
    for (let i = 0; i < 4; i++) await login(page, 'auth_user', 'wrong-pass' + i);
    await login(page, 'auth_user', 'secret12'); assert.match(await errText(page), /รอ|wait/, 'locked after five wrong tries');
    assert.ok(await page.evaluate(() => JSON.parse(localStorage.getItem('vayrathen-authwait')).t > Date.now()), 'the lock is kept across a reload');
    await page.evaluate(() => { AUTH.waitT = 0; });

    await login(page, 'AUTH_USER', 'secret12');   // the ID is not case sensitive
    await page.waitForSelector('[data-make]', { timeout: 30000 });

    // remember me (default): a new tab of the same browser is logged in; without it a new tab asks again
    const t1 = await newTab(page, url);
    try { await t1.tab.waitForSelector('[data-make], #auBox', { timeout: 30000 }); assert.ok(await t1.tab.$('[data-make]'), 'remembered'); } finally { await t1.close(); }
    await page.evaluate(() => authLogout()); await page.waitForSelector('#auBox');
    await page.uncheck('#auKeep'); await login(page, 'auth_user', 'secret12'); await page.waitForSelector('[data-make]', { timeout: 30000 });
    const t2 = await newTab(page, url);
    try { await t2.tab.waitForSelector('[data-make], #auBox', { timeout: 30000 }); assert.ok(await t2.tab.$('#auBox'), 'not remembered: asks again'); } finally { await t2.close(); }
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('local: registering over an existing account is refused; forgot password wipes it', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Keeper', 'keep_me');
    await page.evaluate(() => authLogout()); await page.waitForSelector('#auBox');
    await register(page, { id: 'thief_01', pw: 'secret12' }); assert.match(await errText(page), /มีคนใช้|taken|มีไอดีอยู่แล้ว|already has/, 'no taking over an account on this device');
    assert.strictEqual(await page.evaluate(() => ACC.name), 'keep_me');
    await page.click('#auBox [data-autab="login"][role="tab"]'); await page.click('#auBox [data-auforgot]'); await page.click('#confirm [data-cf="ok"]');
    await page.waitForSelector('#auBox');
    assert.deepStrictEqual(await page.evaluate(() => ({ n: ACC.name, slot: !!localStorage.getItem(slotKey(0)), m: el('auBox').dataset.m })), { n: '', slot: false, m: 'reg' }, 'account and heroes wiped, back to Register');
    await register(page, { id: 'fresh_01', pw: 'secret12' }); await page.waitForSelector('[data-make]', { timeout: 30000 });
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

/* Firebase mode with a stand-in for firebase-shim.js */
const FB_STUB = () => {
  const users = {}; let cur = null; const cbs = []; let st = 'init';
  const fire = () => cbs.forEach(f => f(cur));
  window.__fb = { users, signedOut: 0 };
  window.VAYFB = {
    state: () => st, user: () => cur, onChange: f => { cbs.push(f); if (st !== 'init') setTimeout(() => f(cur), 0); },
    signUp: async (id, pw) => { const k = id.toLowerCase(); if (users[k]) throw { code: 'auth/email-already-in-use' }; if (pw.length < 6) throw { code: 'auth/weak-password' };
      users[k] = { pw, uid: 'uid_' + k, displayName: id }; cur = { uid: users[k].uid, displayName: id, email: k + '@vayrathen.game' }; return cur; },
    signIn: async (id, pw) => { const u = users[id.toLowerCase()]; if (!u || u.pw !== pw) throw { code: 'auth/invalid-credential' };
      cur = { uid: u.uid, displayName: u.displayName, email: id.toLowerCase() + '@vayrathen.game' }; return cur; },
    signOut: async () => { cur = null; window.__fb.signedOut++; fire(); }, offline: () => { st = 'off'; }
  };
  setTimeout(() => { st = 'fb'; fire(); }, 400);   // Firebase answers a moment after the page opens
};
test('firebase mode: waits for the server, registers and logs in through it, fixed ID, log-out signs out', { skip, timeout: 240000 }, async () => {
  const { chromium: cr } = require('./browser'); const { serve } = require('./serve');
  const { srv, url } = await serve(); const browser = await cr.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }), errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e.message)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) errors.push('console.error: ' + m.text()); });
  await page.route(u => !u.href.startsWith(url), r => r.abort());
  await page.addInitScript(FB_STUB);
  try {
    await page.goto(url); await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
    await page.waitForSelector('#auBox [data-auth="go"]', { timeout: 15000 });   // the "connecting…" box turns into the form
    assert.strictEqual(await page.evaluate(() => authFbOn()), true);
    assert.strictEqual(await page.$('[data-auforgot]'), null, 'no forgot-password wipe on a server account');

    await register(page, { id: 'online_01', pw: 'secret12' }); await page.waitForSelector('[data-make]', { timeout: 30000 });
    assert.deepStrictEqual(await page.evaluate(() => ({ n: ACC.name, k: Object.keys(window.__fb.users), c: ACC.coins })), { n: 'online_01', k: ['online_01'], c: 60 });
    assert.strictEqual(await page.$('[data-accren]'), null, 'the ID is fixed on a server account');
    await page.evaluate(() => { VAYFB.signOut(); }); await page.waitForSelector('#auBox', { timeout: 15000 });

    await register(page, { id: 'ONLINE_01', pw: 'another1' }); assert.match(await errText(page), /มีคนใช้|taken/, 'the ID is taken, any case');
    await login(page, 'online_01', 'bad-pass'); assert.match(await errText(page), /ไม่ถูกต้อง|Wrong/);
    // signing up again with your own ID and password just logs you in
    await register(page, { id: 'online_01', pw: 'secret12' }); await page.waitForSelector('[data-make]', { timeout: 30000 });

    // another account on this browser: this browser's local copy is cleared, not shown to the new account
    await page.evaluate(() => { VAYFB.signOut(); }); await page.waitForSelector('#auBox');
    await register(page, { id: 'online_02', pw: 'secret12' }); await page.waitForSelector('[data-make]', { timeout: 30000 });
    assert.strictEqual(await page.evaluate(() => ACC.name), 'online_02', 'the second account starts clean');
  } finally { await browser.close(); srv.close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
