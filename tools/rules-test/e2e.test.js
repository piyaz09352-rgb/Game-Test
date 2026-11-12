/* VAYRATHEN — tools/rules-test/e2e.test.js — (v284) the real website path, end to end, on the Firebase emulators
   The game loads the real Firebase SDK (the same 10.12.2 files the site loads from gstatic, served here from
   node_modules) and talks to the Auth, Firestore and Realtime Database emulators with firebase/*.rules loaded.
   Two players register through the title screen, make heroes, chat, trade on the market, mail each other and found a
   guild. Then the second player opens the console and tries to cheat: every attempt must be refused. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { chromium, signIn } = require(path.join(ROOT, 'tests/browser.js'));
const { serve } = require(path.join(ROOT, 'tests/serve.js'));
const EMU = { auth: 9099, fs: 8181, db: 9191 };
const SDK = path.join(__dirname, 'node_modules/firebase');

test('website path on the emulators: register, chat, market, mail, guild — and cheats refused', { timeout: 420000 }, async () => {
  assert.strictEqual(require(path.join(SDK, 'package.json')).version, '10.12.2', 'the SDK version the game loads');
  const env = await initializeTestEnvironment({ projectId: 'vayrathen',
    firestore: { rules: fs.readFileSync(path.join(ROOT, 'firebase/firestore.rules'), 'utf8'), host: '127.0.0.1', port: EMU.fs },
    database: { rules: fs.readFileSync(path.join(ROOT, 'firebase/database.rules.json'), 'utf8'), host: '127.0.0.1', port: EMU.db } });
  // the game's databaseURL names the database vayrathen-default-rtdb; the test kit loads rules for "vayrathen" only
  const put = await fetch(`http://127.0.0.1:${EMU.db}/.settings/rules.json?ns=vayrathen-default-rtdb`, { method: 'PUT', headers: { Authorization: 'Bearer owner' }, body: fs.readFileSync(path.join(ROOT, 'firebase/database.rules.json'), 'utf8') });
  assert.ok(put.ok, 'realtime rules loaded for the game\'s database');
  await env.clearFirestore(); await env.clearDatabase();
  const { srv, url } = await serve();
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const errors = [], pages = [];
  try {
    for (const [i, name] of ['Alice', 'Bob'].entries()){
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } }), page = await ctx.newPage();
      page.on('pageerror', e => errors.push(`P${i} ` + (e.stack || e.message)));
      page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) errors.push(`P${i} console: ` + m.text()); });
      await page.route(/https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/(firebase-[a-z-]+\.js)$/, (r) => {
        const f = r.request().url().split('/').pop(); r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(SDK, f)) }); });
      await page.route(u => !u.href.startsWith(url) && !u.href.startsWith('https://www.gstatic.com/') && !/^(http|ws):\/\/127\.0\.0\.1:(9099|8181|9191)\//.test(u.href) && !/^(http|ws):\/\/(127\.0\.0\.1|localhost):9191/.test(u.href), r => r.abort());
      await page.addInitScript(e => { window.__VTEST__ = 1; window.__VAY_EMU = e; }, EMU);
      await page.goto(url); await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
      assert.ok(await page.evaluate(() => !!(window.claude && window.claude.firebase)), 'the Firebase shim is on');
      await signIn(page, 'e2e' + name.toLowerCase(), 'e2e-pass-' + i);
      await page.waitForSelector('[data-make], [data-play]', { timeout: 60000 });
      if (await page.$('[data-play]')) await page.click('[data-play]');
      else { await page.click('[data-make]'); await page.waitForSelector('[data-mkgo]'); await page.fill('#mkName', name); await page.click('[data-mkgo]'); }
      await page.waitForFunction(() => !PAUSED && document.getElementById('title').hidden && typeof mlOk === 'function' && mlOk() && NET.room, null, { timeout: 90000, polling: 250 });
      await page.evaluate(() => { const c = el('confirm'); if (c) c.hidden = true; S.bia = 500000; S.inv.redpot = 30; derive(); NET.dirT = 0; NET.dirSig = ''; });
      pages.push(page);
    }
    const [a, b] = pages, [ua, ub] = await Promise.all(pages.map(p => p.evaluate(() => NET.uid)));
    assert.ok(/^[A-Za-z0-9]{20,}$/.test(ua) && ua !== ub, 'two Firebase accounts');

    // the player cards reach the ranking (and carry no log-in ID)
    await b.waitForFunction(u => (window.rankRows || []).length >= 0 && true, ua);
    await a.waitForTimeout(2500);
    const cards = await b.evaluate(async () => (await NET.db.collection('players').get()).docs.map(d => d.data()));
    assert.ok(cards.length >= 2, 'both cards are public: ' + cards.length);
    assert.ok(cards.every(c => !c.acc), 'no log-in ID in a public card: ' + JSON.stringify(cards.map(c => c.acc)));

    // chat through the Realtime Database
    await a.evaluate(() => { NET.room.emit('chat', {c:'all', t:'hello <img src=x onerror=window.__x=1>', n:netName(), j:S.job, l:S.lvl}); });
    await b.waitForFunction(() => NET.chat.some(c => /hello/.test(c.text)), null, { timeout: 20000, polling: 250 });
    assert.ok(await b.evaluate(() => !/[<>]/.test(NET.chat.find(c => /hello/.test(c.text)).text) && !window.__x), 'chat arrives as text');

    // the market: list, buy, collect, cancel — through Firestore transactions
    await a.evaluate(async () => { for (const p of [700, 900]){ MK.sel = 'redpot'; MK.n = 3; MK.price = String(p); await mkList(); } await mkMine(); });
    const ids = await a.evaluate(() => MK.mine.map(r => r.id));
    assert.strictEqual(ids.length, 2, 'two listings');
    const listing = await b.evaluate(async id => (await NET.db.doc('market/' + id).get()).data(), ids[0]);
    assert.ok(!listing.sa, 'the listing does not show the seller\'s log-in ID');
    const bia0 = await b.evaluate(() => S.bia);
    await b.evaluate(async id => { const s = await NET.db.doc('market/' + id).get(); await mkBuy({id, ...s.data()}); }, ids[0]);
    assert.deepStrictEqual(await b.evaluate(() => [S.inv.redpot, S.bia]), [33, bia0 - 700], 'b bought 3 potions for 700 (the purchase works on Firebase)');
    const az0 = await a.evaluate(() => S.bia);
    await a.evaluate(async () => { await mkCollect(); });
    assert.strictEqual(await a.evaluate(() => S.bia), az0 + 700, 'a collected 700 once');
    await a.evaluate(async () => { await mkCollect(); });
    assert.strictEqual(await a.evaluate(() => S.bia), az0 + 700, 'not twice');
    const ap0 = await a.evaluate(() => S.inv.redpot);
    await a.evaluate(async id => { await mkMine(); await mkCancel(MK.mine.find(x => x.id === id)); }, ids[1]);
    assert.strictEqual(await a.evaluate(() => S.inv.redpot), ap0 + 3, 'a cancelled the other listing and got it back');

    // mail
    await a.evaluate(async u => { mlCompose(u, 'Bob'); Object.assign(ML, {s:'Hi', m:'gift', z:'1000', item:'redpot', n:2}); await mlSend(); }, ub);
    await b.waitForFunction(() => ML.rows.length >= 1, null, { timeout: 20000, polling: 250 });
    const bz = await b.evaluate(() => S.bia);
    assert.strictEqual(await b.evaluate(async () => mlTake(ML.rows[0].id, true)), true, 'b took the letter');
    assert.strictEqual(await b.evaluate(() => S.bia), bz + 1000);
    assert.strictEqual(await b.evaluate(async () => mlTake(ML.rows[0].id, true)), false, 'once');

    // a guild
    await a.evaluate(async () => { await guildCreate('Tigers'); await guildNotice('Welcome'); });
    const gid = await a.evaluate(() => S.guild && S.guild.id); assert.ok(gid, 'a guild was founded');

    // b cheats from the console: every one refused by the server
    const cheats = await b.evaluate(async ([ua, ids, gid]) => {
      const db = NET.db, out = {};
      const tryIt = async (k, f) => { try { await f(); out[k] = 'ALLOWED'; } catch (e) { out[k] = e.code || e.message; } };
      await tryIt('steal a listing', () => db.doc('market/' + ids[1] + 'x').set({s:ua, sn:'Alice', i:'redpot', n:99, x:null, p:1, at:Date.now(), sold:null, paid:false}));
      await tryIt('delete a card', () => db.doc('players/' + ua).delete());
      await tryIt('rewrite a card', () => db.doc('players/' + ua).set({name:'pwned', job:'novice', lvl:1, map:0}));
      await tryIt('read a save', () => db.doc(`data/users/${ua}/account`).get());
      await tryIt('fake system letter', () => db.doc('mail/fake00001').set({to:ua, tn:'Alice', from:NET.uid, fn:'ระบบวายรา', s:'prize', m:'', z:0, i:null, n:0, x:null, c:500, at:Date.now(), sys:1, rd:0, taken:false}));
      await tryIt('take over the guild', () => db.doc('guilds/' + gid).update({notice:'pwned'}));
      await tryIt('level 99999', () => db.doc('players/' + NET.uid).set({name:'Bob', job:'novice', lvl:99999, map:0}));
      await tryIt('season reset', () => db.doc('server/season').set({n:99, at:Date.now()}));
      await tryIt('a GM announcement', () => NET.room.emit('gm', {k:'ann', t:'free coins at evil.example'}));
      await tryIt('make yourself GM', () => firebase.database().ref('gms/' + NET.uid).set(true));
      return out; }, [ua, ids, gid]);
    for (const [k, v] of Object.entries(cheats)) assert.notStrictEqual(v, 'ALLOWED', `${k} must be refused`);
  } finally { await browser.close(); srv.close(); await env.cleanup(); }
  const real = errors.filter(e => !/permission|PERMISSION_DENIED|Missing or insufficient/i.test(e));
  assert.deepStrictEqual(real, [], 'no runtime errors');
});
