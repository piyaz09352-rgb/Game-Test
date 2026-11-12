/* VAYRATHEN — tools/rules-test/honest.test.js — (v284) the honest game still works under the hardened rules
   Two real players play through the game's own code (market: list, buy, collect, cancel · mail: send, take ·
   guild: found, join, notice · player cards · tower week · MVP) on the test backend (tests/mock-net.js). Every write
   the game makes is recorded, then replayed in the same order, as the same player, against the Firestore emulator
   with firebase/firestore.rules. Every one must be allowed. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { chromium } = require(path.join(ROOT, 'tests/browser.js'));
const { createBroker } = require(path.join(ROOT, 'tests/mock-net.js'));
const { serve } = require(path.join(ROOT, 'tests/serve.js'));

const UIDS = ['aliceUid0000000000000000001', 'bobUid000000000000000000002'];

test('every write the game makes is allowed by the rules', { timeout: 300000 }, async () => {
  const { srv, url } = await serve();
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const broker = createBroker({ db: true }), log = [], errors = [];
  const handle = broker.store.handle;
  broker.store.handle = (uid, m) => { const r = handle(uid, m); if (['set', 'update', 'delete'].includes(m.k) && r && r.ok) log.push({ uid, k: m.k, path: m.path, data: m.data }); return r; };
  const pages = [];
  try {
    for (const [i, uid] of UIDS.entries()){
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } }), page = await ctx.newPage();
      page.on('pageerror', e => errors.push(`P${i} ` + (e.stack || e.message)));
      await page.route(u => !u.href.startsWith(url), r => r.abort());
      await broker.attach(page, uid); await page.goto(url);
      await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
      const { signIn } = require(path.join(ROOT, 'tests/browser.js'));
      await signIn(page, 'honest' + i);
      await page.waitForSelector('[data-make], [data-play]', { timeout: 30000 });
      if (await page.$('[data-play]')) await page.click('[data-play]');
      else { await page.click('[data-make]'); await page.waitForSelector('[data-mkgo]'); await page.fill('#mkName', ['Alice', 'Bob'][i]); await page.click('[data-mkgo]'); }
      await page.waitForFunction(() => !PAUSED && document.getElementById('title').hidden && typeof mlOk === 'function' && mlOk(), null, { timeout: 60000, polling: 250 });
      await page.evaluate(() => { S.bia = 500000; S.inv.redpot = 30; derive(); NET.dirT = 0; });
      pages.push(page);
    }
    const [a, b] = pages;
    await a.waitForTimeout(1500);   // the player card goes out
    // the market: a lists two stacks, b buys one, a collects it and cancels the other
    await a.evaluate(async () => { for (const p of [700, 900]){ MK.sel = 'redpot'; MK.n = 3; MK.price = String(p); await mkList(); } await mkMine(); });
    const ids = await a.evaluate(() => MK.mine.map(r => r.id));
    assert.strictEqual(ids.length, 2, 'two listings');
    await b.evaluate(async id => { const s = await NET.db.doc('market/' + id).get(); await mkBuy({id, ...s.data()}); }, ids[0]);
    assert.ok(await b.evaluate(() => S.inv.redpot === 33), 'b bought 3 potions');
    await a.waitForTimeout(4500);   // (the claude.ai-style lease the buyer held runs out)
    await a.evaluate(async () => { await mkCollect(); });
    await a.evaluate(async id => { await mkMine(); const r = MK.mine.find(x => x.id === id); await mkCancel(r); }, ids[1]);
    // mail: a writes to b with Bia and potions; b takes them
    await a.evaluate(async u => { mlCompose(u, 'Bob'); Object.assign(ML, {s:'Hi', m:'gift', z:'1000', item:'redpot', n:2}); await mlSend(); }, UIDS[1]);
    await b.waitForFunction(() => ML.rows.length >= 1, null, { timeout: 15000, polling: 250 });
    await b.evaluate(async () => { const r = ML.rows[0]; await mlRead(r); await mlTake(r.id, true); });
    // the game's own letter to a (the weekly tower prize path)
    await a.evaluate(async () => { await mlSystem('Tower', 'prize', {z:4500, c:3}); });
    // a guild: a founds it, b joins, a writes the notice
    const gid = await a.evaluate(async () => { const e = await guildCreate('Tigers'); return S.guild && S.guild.id; });
    assert.ok(gid, 'a guild was founded');
    await b.evaluate(g => { S.guild = {id:g, name:'Tigers'}; guildJoinDb(); }, gid);
    await a.evaluate(async () => { await guildNotice('Welcome all'); });
    // the tower week, MVP
    await a.evaluate(async () => { const k = twkMine(); k.f = 9; k.pub = 0; await twkPublish(); });
    await a.evaluate(async () => { await mvpWrite('testboss', {up:true, sp:Date.now(), map:MAP_ID}); await mvpWrite('testboss', {up:false, at:Date.now(), names:['Alice'], uids:[NET.uid], map:MAP_ID, lv:S.lvl, kill:1}); });
    await a.waitForTimeout(800);
  } finally { await browser.close(); srv.close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');

  const kinds = new Set(log.map(w => w.path.split('/')[0]));
  for (const k of ['players', 'data', 'market', 'mail', 'guilds', 'towerwk', 'mvp']) assert.ok(kinds.has(k), 'the game wrote to ' + k + ': ' + [...kinds]);
  assert.ok(log.some(w => w.path.startsWith('market/') && w.k === 'update' && w.data.sold), 'a purchase was recorded');
  assert.ok(log.some(w => w.path.startsWith('market/') && w.k === 'update' && w.data.paid), 'a collection was recorded');
  assert.ok(log.some(w => w.path.startsWith('mail/') && w.k === 'update' && w.data.taken), 'an attachment was taken');

  // replay on the emulator
  const env = await initializeTestEnvironment({ projectId: 'demo-vayrathen',
    firestore: { rules: fs.readFileSync(path.join(ROOT, 'firebase/firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8181 } });
  const refused = [];
  try {
    await env.clearFirestore();
    const dbs = new Map(UIDS.map(u => [u, env.authenticatedContext(u).firestore()]));
    for (const w of log){
      const ref = dbs.get(w.uid).doc(w.path);
      try { if (w.k === 'set') await ref.set(w.data); else if (w.k === 'update') await ref.update(w.data); else await ref.delete(); }
      catch (e){ refused.push(`${w.k} ${w.path} as ${w.uid.slice(0, 5)}: ${JSON.stringify(w.data || null).slice(0, 300)} → ${e.code || e.message}`); }
    }
  } finally { await env.cleanup(); }
  console.log(`replayed ${log.length} writes: ${[...kinds].join(', ')}`);
  assert.deepStrictEqual(refused, [], 'the rules allow everything the honest game writes');
});
