/* VAYRATHEN — tests/recover.test.js — (v93) password recovery and guest play, online through tests/mock-net.js.
   The claude.ai sign-in is who you are: on a new device of the same sign-in, "forgot password" reads the account back
   from that sign-in's private space and sets a new password (characters kept, the old password stops working); a
   sign-in with no game ID is sent to Register. "Play as guest" makes a guest ID with no password, the account bar says
   so, and "Bind ID" gives it a real ID and password; a guest comes back with the same button. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

async function openNet(){
  const { createBroker } = require('./mock-net'), { serve } = require('./serve');
  const { srv, url } = await serve();
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const broker = createBroker({ merge: true, db: true, owners: [] }), errors = [];
  async function open(uid){   // a fresh browser each time: a new device of that claude.ai sign-in
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } }), page = await ctx.newPage();
    page.on('pageerror', e => errors.push(`${uid} pageerror: ` + (e.stack || e.message)));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) errors.push(`${uid} console.error: ` + m.text()); });
    await page.route(u => !u.href.startsWith(url), r => r.abort());
    await broker.attach(page, uid); await page.goto(url);
    await page.waitForFunction(() => !!window.__vay && typeof NET !== 'undefined' && !!NET.uid, null, { timeout: 60000 });
    await page.waitForSelector('#auBox', { timeout: 30000 });
    return { page, ctx };
  }
  return { open, broker, errors, close: async () => { await browser.close(); srv.close(); } };
}
const errText = page => page.evaluate(() => (el('auErr') ? el('auErr').textContent : ''));
const mode = page => page.evaluate(() => (el('auBox') ? el('auBox').dataset.m : ''));
async function submit(page){
  await page.click('#auBox [data-auth="go"]');
  await page.waitForFunction(() => !el('auBox') || (!AUTH.busy && !!el('auErr').textContent), null, { timeout: 30000 });
}
async function login(page, id, pw){
  await page.click('#auBox [data-autab="login"][role="tab"]'); await page.fill('#auLId', id); await page.fill('#auLPw', pw); await submit(page);
}

test('online: forgot password sets a new one and keeps the account; no account goes to Register', { skip, timeout: 300000 }, async () => {
  const { open, errors, close } = await openNet();
  try {
    const a = await open('u1');
    await enterWorld(a.page, 'Hero', 'rec_user');
    const before = await a.page.evaluate(() => { save(); accSave(true); return { id: ACC.id, coins: ACC.coins }; });
    await a.page.waitForTimeout(400); await a.ctx.close();
    const b = await open('u1');   // a new device, same claude.ai sign-in, password forgotten
    await b.page.click('#auBox [data-autab="login"][role="tab"]'); await b.page.click('#auBox [data-auforgot]');
    await b.page.waitForFunction(() => el('auBox') && el('auBox').dataset.m === 'reset', null, { timeout: 20000 });
    assert.match(await b.page.evaluate(() => document.querySelector('.au-mh').textContent), /@rec_user/, 'shows whose password is being set');
    await b.page.fill('#auRPw', '123456'); await b.page.fill('#auRPw2', '123456'); await submit(b.page);
    assert.match(await errText(b.page), /เดาง่าย|easy/, 'the usual password rules apply');
    await b.page.fill('#auRPw', 'newpass99'); await b.page.fill('#auRPw2', 'newpass98'); await submit(b.page);
    assert.match(await errText(b.page), /ไม่ตรง|match/);
    await b.page.fill('#auRPw', 'newpass99'); await b.page.fill('#auRPw2', 'newpass99'); await submit(b.page);
    await b.page.waitForSelector('.accbar', { timeout: 20000 });
    const after = await b.page.evaluate(() => ({ id: ACC.id, coins: ACC.coins, name: ACC.name, authed: authed(), ok: !!document.querySelector('.accbar .accok') }));
    assert.deepStrictEqual(after, { id: before.id, coins: before.coins, name: 'rec_user', authed: true, ok: true }, 'same account, logged in, shown as verified');
    await b.page.evaluate(() => authLogout()); await b.page.waitForSelector('#auBox');
    await login(b.page, 'rec_user', 'test-pass-1'); assert.match(await errText(b.page), /ไม่ถูกต้อง|Wrong/, 'the old password no longer works');
    await login(b.page, 'rec_user', 'newpass99'); await b.page.waitForSelector('.accbar', { timeout: 20000 });
    const c = await open('u9');   // a sign-in that never made an ID
    await c.page.click('#auBox [data-autab="login"][role="tab"]'); await c.page.click('#auBox [data-auforgot]');
    await c.page.waitForFunction(() => el('auBox').dataset.m === 'reg' && !!el('auErr').textContent, null, { timeout: 20000 });
    assert.match(await errText(c.page), /ยังไม่มีไอดี|no game ID/);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('online: play as guest, come back as the guest, then bind a real ID', { skip, timeout: 300000 }, async () => {
  const { open, broker, errors, close } = await openNet();
  try {
    const a = await open('g1');
    await a.page.click('#auBox [data-auguest]'); await a.page.waitForSelector('.accbar', { timeout: 20000 });
    const g = await a.page.evaluate(() => ({ name: ACC.name, guest: ACC.guest, pw: !!ACC.pw, authed: authed(), tag: !!document.querySelector('.accbar .accguest'), bind: !!document.querySelector('[data-aubind]'), out: !!document.querySelector('[data-aulogout]') }));
    assert.match(g.name, /^guest\d{5}$/); assert.deepStrictEqual({ ...g, name: 0 }, { name: 0, guest: 1, pw: false, authed: true, tag: true, bind: true, out: true }, 'a guest account, marked as one');
    await a.page.waitForTimeout(400); await a.ctx.close();
    const b = await open('g1');   // another device: the guest button brings the same guest back
    await b.page.click('#auBox [data-auguest]'); await b.page.waitForSelector('.accbar', { timeout: 20000 });
    assert.strictEqual(await b.page.evaluate(() => ACC.name), g.name, 'the same guest');
    await b.page.click('[data-aubind]'); await b.page.waitForFunction(() => el('auBox') && el('auBox').dataset.m === 'bind', null, { timeout: 10000 });
    await b.page.fill('#auId', 'bound_one'); await b.page.fill('#auPw', 'bindpass7'); await b.page.fill('#auPw2', 'bindpass7'); await submit(b.page);
    await b.page.waitForSelector('.accbar', { timeout: 20000 });
    assert.deepStrictEqual(await b.page.evaluate(() => ({ name: ACC.name, guest: !!ACC.guest, pw: !!ACC.pw && !ACC.pw.pw, ok: !!document.querySelector('.accbar .accok') })), { name: 'bound_one', guest: false, pw: true, ok: true }, 'bound: a real ID with a password');
    await b.page.evaluate(() => authLogout()); await b.page.waitForSelector('#auBox');
    await login(b.page, 'bound_one', 'bindpass7'); await b.page.waitForSelector('.accbar', { timeout: 20000 });
    const stored = JSON.stringify([...broker.store.docs.entries()]);
    assert.ok(!stored.includes('bindpass7') && !stored.includes('newpass99'), 'no password stored as text');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
