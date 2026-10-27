/* VAYRATHEN — tests/gm.test.js — GM tools, server backup and the world reset (js/sys/gm.js, js/sys/season.js).
   Offline: a normal player never gets GM; ?gm=1 on a local page gives the offline test GM. Online (tests/mock-net.js
   with its db and isOwner()): the artifact owner is GM, others are not even with ?gm=1; backup writes db + a JSON file;
   a reset archives and wipes a connected player at once and a player who was away as soon as they come back. */
'use strict';
const GM_CODE = process.env.VAY_GM_CODE || [23, 10, 33].join('');   // put together here, never written out
const test = require('node:test'), assert = require('node:assert'), fs = require('node:fs');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

const gmState = page => page.evaluate(() => ({ on: GM.on, how: GM.how, btn: !!document.querySelector('#gmBtn:not([hidden])'), win: !el('win-gm').hidden }));
const settle = page => page.evaluate(() => new Promise(r => { const t0 = Date.now(), f = () => (GM.netDone || Date.now() - t0 > 8000 ? r() : setTimeout(f, 100)); f(); }));

test('offline: a normal player has no GM; ?gm=1 on a local page gives the test GM', { skip, timeout: 240000 }, async () => {
  const errors = [];
  { const { page, errors: e, close } = await openGame();
    try {
      await enterWorld(page); await settle(page);
      assert.deepStrictEqual(await gmState(page), { on: false, how: '', btn: false, win: false }, 'no GM without ?gm=1');
      await page.keyboard.press('F8'); await page.waitForTimeout(300);
      assert.strictEqual((await gmState(page)).win, false, 'F8 does not open the panel');
      const r = await page.evaluate(async () => { const inv = S.inv.redpot || 0, map = MAP_ID, lvl = S.lvl;
        const res = [await gmGive('redpot', 50), await gmTeleport(3), await gmSetLevel(99), await gmSpawn('boss', 1), await gmResetWorld('RESET')];
        return { res, inv: (S.inv.redpot || 0) - inv, map: MAP_ID === map, lvl: S.lvl === lvl, log: GM.log.length }; });
      assert.deepStrictEqual(r, { res: [false, false, false, false, false], inv: 0, map: true, lvl: true, log: 0 }, 'every GM call is refused');
      // the owner deploys RESET_SEASON = 2 (no GM needed): this browser is archived and starts again
      await page.evaluate(() => save());
      await page.route('**/js/net/firebase-config.js', async rt => { const res = await rt.fetch(); await rt.fulfill({ response: res, body: (await res.text()).replace('RESET_SEASON = 1', 'RESET_SEASON = 2') }); });
      await page.reload(); await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
      await page.waitForFunction(() => el('confirm').dataset.season === '1', null, { timeout: 10000 });
      const w = await page.evaluate(() => ({ slots: [0, 1, 2].some(i => !!localStorage.getItem(slotKey(i))), acc: ACC.name, season: localStorage.getItem('vayrathen-season'), arch: JSON.parse(localStorage.getItem('vayrathen-archive-1') || '{}').slots.filter(Boolean).length }));
      assert.deepStrictEqual(w, { slots: false, acc: '', season: '2', arch: 1 }, 'static reset: archived and wiped');
    } finally { await close(); } errors.push(...e); }
  { const { page, errors: e, close } = await openGame({ path: '?gm=1' });
    try {
      await enterWorld(page, 'GmLocal'); await settle(page);
      assert.deepStrictEqual(await gmState(page), { on: true, how: 'local', btn: true, win: false }, 'offline ?gm=1 on localhost is GM');
      await page.keyboard.press('F8'); await page.waitForTimeout(400);
      assert.strictEqual((await gmState(page)).win, true, 'F8 opens the panel');
      // search and give through the panel
      await page.fill('#gmQ', 'redpot'); await page.fill('#gmN', '7');
      const before = await page.evaluate(() => S.inv.redpot || 0);
      await page.click('#gmItems [data-gm="give"][data-id="redpot"]'); await page.waitForTimeout(300);
      assert.strictEqual(await page.evaluate(() => S.inv.redpot || 0), before + 7, 'gave 7 potions from the panel');
      const r = await page.evaluate(async () => {
        const out = {}; out.tp = await gmTeleport(3, 600, 700); out.map = MAP_ID; out.x = Math.round(P.x); out.y = Math.round(P.y);
        await gmSetLevel(120); await gmSetJob('blade'); await gmGiveBia(5); out.lvl = S.lvl; out.job = S.job;
        const boss0 = mobs.filter(m => !m.dead && m.type === 'boss').length; await gmSpawn('boss', 1); await gmSpawn('hare', 3);
        out.boss = mobs.filter(m => !m.dead && m.type === 'boss').length - boss0; out.hares = mobs.filter(m => !m.dead && m.gm && m.type === 'hare').length;
        await gmKillAll(); out.alive = mobs.filter(m => !m.dead).length;
        await gmToggle('god'); S.hp = 1; playerDie(); out.dead = P.dead; await gmToggle('god');
        await gmSpeed(2); out.move = DER.move; await gmSpeed(1);
        await gmUnlockMaps(); out.maps = MAPS.every((m, i) => S.visited[i]);
        out.local = S.gmLocal; out.log = GM.log.length; out.tag = el('gmBtn').textContent;
        return out; });
      assert.strictEqual(r.tp, true); assert.strictEqual(r.map, 3, 'teleported to map 3');
      assert.ok(Math.abs(r.x - 600) < 40 && Math.abs(r.y - 700) < 40, `at the coordinates: ${r.x},${r.y}`);
      assert.strictEqual(r.lvl, 120); assert.strictEqual(r.job, 'blade');
      assert.strictEqual(r.boss, 1, 'spawned a boss'); assert.strictEqual(r.hares, 3, 'spawned 3 monsters');
      assert.strictEqual(r.alive, 0, 'kill all'); assert.strictEqual(r.dead, false, 'god mode survives'); assert.ok(r.move >= 2, 'speed boost');
      assert.ok(r.maps, 'all maps unlocked'); assert.strictEqual(r.local, 1, 'hero marked as edited offline'); assert.ok(r.log >= 10, 'actions logged');
      assert.ok(JSON.parse(await page.evaluate(() => localStorage.getItem('vayrathen-gmlog'))).length >= 10, 'log kept in this browser');
    } finally { await close(); } errors.push(...e); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

/* several players sharing one fake online backend (rooms + db), each in their own browser context */
async function openNet(owners){
  const { createBroker } = require('./mock-net'), { serve } = require('./serve');
  const { srv, url } = await serve();
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const broker = createBroker({ merge: true, db: true, owners }), errors = [];
  async function open(uid, path = '', ctx = null){
    ctx = ctx || await browser.newContext({ viewport: { width: 1280, height: 720 }, acceptDownloads: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(`${uid} pageerror: ` + (e.stack || e.message)));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) errors.push(`${uid} console.error: ` + m.text()); });
    await page.route(u => !u.href.startsWith(url), r => r.abort());
    await broker.attach(page, uid);
    await page.goto(url + path);
    await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 }); await settle(page);
    return { page, ctx };
  }
  const close = async () => { await browser.close(); srv.close(); };
  return { open, broker, errors, close };
}
const until = async (page, fn, arg, ms = 20000) => page.waitForFunction(fn, arg, { timeout: ms, polling: 200 });

test('online: owner is GM, backup + reset wipe every player (also one who was away)', { skip, timeout: 420000 }, async () => {
  const { open, broker, errors, close } = await openNet(['u0']);
  const docs = broker.store.docs, has = p => docs.has(p);
  try {
    const gm = await open('u0'), p1 = await open('u1', '?gm=1');
    await enterWorld(gm.page, 'Master', 'boss_master'); await enterWorld(p1.page, 'Player1', 'player_one');
    assert.deepStrictEqual(await gmState(p1.page), { on: false, how: '', btn: false, win: false }, '?gm=1 does nothing online');
    // the owner still needs the GM code: locked chip first, a wrong code is refused, the right one unlocks
    assert.deepStrictEqual(await gmState(gm.page), { on: false, how: '', btn: true, win: false }, 'the owner sees a locked GM chip');
    assert.strictEqual(await gm.page.evaluate(() => el('gmBtn').textContent), 'GM 🔒');
    await gm.page.click('#gmBtn'); await gm.page.fill('#gmLockIn', '000000'); await gm.page.click('[data-gml="ok"]');
    await until(gm.page, () => /ไม่ถูกต้อง|Wrong/.test(el('gmLockMsg').textContent));
    assert.strictEqual(await gm.page.evaluate(() => GM.on), false, 'a wrong code does not unlock');
    await gm.page.fill('#gmLockIn', GM_CODE); await gm.page.click('[data-gml="ok"]');
    await until(gm.page, () => GM.on);
    assert.strictEqual(await gm.page.evaluate(code => localStorage.getItem('vay_gmkey').includes(code), GM_CODE), false, 'only a hash is kept');
    assert.deepStrictEqual(await gmState(gm.page), { on: true, how: 'owner', btn: true, win: false }, 'the owner is GM');
    // the code means nothing to someone who is not the owner
    assert.strictEqual(await p1.page.evaluate(async () => { localStorage.setItem('vay_gmkey', GMLOCK.hash); return await gmVerify(); }), false, 'non-owner with the code is not GM');
    assert.strictEqual(await p1.page.evaluate(() => !!document.querySelector('#gmBtn:not([hidden])')), false, 'no GM chip for a player');

    // the owner changes the GM code in the game: only a salted hash is stored, players cannot touch it, the old code stops working
    await gm.page.evaluate(() => { openWin('gm'); });
    await gm.page.click('[data-gml="key"]');
    await gm.page.fill('#gmKeyOld', GM_CODE); await gm.page.fill('#gmKeyNew', 'newcode77'); await gm.page.fill('#gmKeyNew2', 'newcode77'); await gm.page.click('[data-gml="set"]');
    await until(gm.page, () => !el('gmLockBox'));
    assert.ok(has('server/gmkey') && /^[0-9a-f]{64}$/.test(docs.get('server/gmkey').h) && !JSON.stringify(docs.get('server/gmkey')).includes('newcode77'), 'new code saved as a hash');
    assert.strictEqual(await p1.page.evaluate(async () => NET.db.doc('server/gmkey').set({ h: '0'.repeat(64), s: '' }).then(() => 'written', e => e.code)), 'invalid_argument', 'a player cannot change the code');
    await gm.page.evaluate(() => { closeWin('gm'); gmRelock(); });
    await until(gm.page, () => !GM.on);
    await gm.page.click('#gmBtn'); await gm.page.fill('#gmLockIn', GM_CODE); await gm.page.click('[data-gml="ok"]');
    await until(gm.page, () => /ไม่ถูกต้อง|Wrong/.test(el('gmLockMsg').textContent));
    await gm.page.fill('#gmLockIn', 'newcode77'); await gm.page.click('[data-gml="ok"]');
    await until(gm.page, () => GM.on);

    // a non-GM can neither call GM tools nor write GM-only data
    const deny = await p1.page.evaluate(async () => ({ give: await gmGive('redpot', 5), reset: await gmResetWorld('RESET'), backup: await gmServerBackup({ download: false }), restore: await gmRestore('x', 'RESTORE'),
      write: await NET.db.doc('server/season').set({ n: 9, by: NET.uid }).then(() => 'written', e => e.code) }));
    assert.deepStrictEqual(deny, { give: false, reset: false, backup: false, restore: false, write: 'invalid_argument' });
    assert.ok(!has('server/season'), 'no season written by a player');

    // the GM: teleport, give, spawn; others see the [GM] tag and the announcement
    const g = await gm.page.evaluate(async () => { const inv = S.inv.redpot || 0; await gmTeleport(1); await gmGive('redpot', 3); await gmSpawn('hare', 2);
      return { map: MAP_ID, inv: (S.inv.redpot || 0) - inv, spawned: mobs.filter(m => m.gm && !m.dead).length }; });
    assert.deepStrictEqual(g, { map: 1, inv: 3, spawned: 2 });
    assert.ok(has('server/gm') && docs.get('server/gm').ids.includes('u0'), 'GM listed in server/gm');
    assert.ok([...docs.keys()].some(k => k.startsWith('server/gmlog/entries/')), 'GM actions logged to the db');
    assert.strictEqual(await p1.page.evaluate(async () => { await gmLoadIds(); return gmTag('u0') + gmTag('u1'); }), '[GM] ', 'GM tag only for the GM');
    await gm.page.evaluate(() => gmAnnounce('Server test at 20:00'));
    await until(p1.page, () => GM.lastAnn === 'Server test at 20:00');

    // shared data from the players
    await p1.page.evaluate(async () => { await NET.db.doc('guilds/g1').set({ name: 'Test', leader: NET.uid, at: 1 }); await NET.db.doc(`guilds/g1/members/${NET.uid}`).set({ n: 'Player1', at: 1 });
      await NET.db.doc('market/m1').set({ s: NET.uid, i: 'redpot', n: 1, p: 10, at: 1 }); cloudSave(true); accSave(true); NET.dirT = 0; });
    await p1.page.waitForTimeout(1500);
    assert.ok(has('players/u1') && has('data/users/u1/save') && has('data/users/u1/account'), 'player 1 is in the cloud');

    // a third player plays, then goes away before the reset
    const p2 = await open('u2'); await enterWorld(p2.page, 'Away', 'player_two'); await p2.page.evaluate(() => { save(); cloudSave(true); accSave(true); }); await p2.page.waitForTimeout(800);
    assert.ok(has('data/users/u2/save'), 'player 2 saved to the cloud'); await p2.page.close();

    // server backup: db + downloaded JSON
    const [dl] = await Promise.all([gm.page.waitForEvent('download'), gm.page.evaluate(() => gmServerBackup())]);
    const file = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
    assert.strictEqual(file.kind, 'server-backup');
    for (const k of ['players/u1', 'guilds/g1', 'guilds/g1/members/u1', 'market/m1', 'server/gm']) assert.ok(file.docs[k], `backup has ${k}`);
    assert.ok(!Object.keys(file.docs).some(k => k.startsWith('data/')), 'private saves are not in the server backup');
    assert.ok(has(`backups/${file.id}`) && has(`backups/${file.id}/parts/0`), 'backup stored in the db');

    // the reset button asks twice and wants the word
    await gm.page.evaluate(() => openWin('gm')); await gm.page.click('#win-gm [data-gm="reset"]'); await gm.page.click('#confirm [data-cf="ok"]');
    await gm.page.fill('#gmWord', 'nope'); await gm.page.click('#confirm [data-cf="ok"]'); await gm.page.waitForTimeout(300);
    assert.ok(!has('server/season'), 'wrong word: nothing happens'); await gm.page.click('#confirm [data-cf="no"]');

    // reset (as the panel does after the word)
    const res = await gm.page.evaluate(() => gmResetWorld('RESET'));
    assert.strictEqual(res.n, 2, 'season 2'); assert.strictEqual(docs.get('server/season').n, 2);
    for (const k of ['guilds/g1', 'guilds/g1/members/u1', 'market/m1']) assert.ok(!has(k), `${k} deleted`);
    assert.ok(has(`backups/${res.backup}`), 'reset made its own backup first');

    // the connected player: archived, wiped, back on the title screen with the message
    await until(p1.page, () => PAUSED && !el('title').hidden && localStorage.getItem('vayrathen-season') === '2' && el('confirm').dataset.season === '1');
    const w1 = await p1.page.evaluate(() => ({ slots: [0, 1, 2].map(i => !!localStorage.getItem(slotKey(i))), acc: ACC.name, arch: !!localStorage.getItem('vayrathen-archive-1'), note: !el('confirm').hidden && el('confirm').dataset.season === '1' }));
    assert.deepStrictEqual(w1, { slots: [false, false, false], acc: '', arch: true, note: true });
    await p1.page.waitForTimeout(1000);
    assert.ok(!has('data/users/u1/save') && !has('data/users/u1/account') && !has('players/u1'), 'player 1 cloud wiped');
    assert.ok(has('data/users/u1/archive_1') && has('data/users/u1/archive_1_0'), 'player 1 cloud archive');
    const am = docs.get('data/users/u1/archive_1'), arch = JSON.parse(Array.from({ length: am.parts }, (_, i) => docs.get(`data/users/u1/archive_1_${i}`).d).join(''));
    assert.ok(arch.docs && arch.docs.save, 'the archive holds the old save');
    // the GM starts again too
    await until(gm.page, () => PAUSED && localStorage.getItem('vayrathen-season') === '2' && !localStorage.getItem(slotKey(0)));

    // the player who was away comes back: wiped on connect
    const back = await open('u2', '', p2.ctx);
    await until(back.page, () => localStorage.getItem('vayrathen-season') === '2' && !localStorage.getItem(slotKey(0)) && !!localStorage.getItem('vayrathen-archive-1') && el('confirm').dataset.season === '1');
    await back.page.waitForTimeout(800);
    assert.ok(!has('data/users/u2/save') && has('data/users/u2/archive_1'), 'player 2 cloud archived and wiped');
    assert.strictEqual(await back.page.evaluate(() => el('confirm').dataset.season), '1', 'player 2 sees the message');
    // and can start a new hero in season 2
    await back.page.click('#confirm [data-cf="ok"]'); await enterWorld(back.page, 'Fresh', 'player_two');
    assert.strictEqual(await back.page.evaluate(() => { save(); return JSON.parse(localStorage.getItem(slotKey(SLOT))).season; }), 2, 'new saves belong to season 2');

    // restore needs the GM and the word
    assert.strictEqual(await p1.page.evaluate(id => gmRestore(id, 'RESTORE'), res.backup), false, 'a player cannot restore');
    assert.strictEqual(await gm.page.evaluate(id => gmRestore(id, 'nope'), res.backup), false, 'restore wants the word');
    const n = await gm.page.evaluate(id => gmRestore(id, 'RESTORE'), res.backup);
    assert.ok(n >= 4 && has('market/m1') && has('guilds/g1/members/u1'), `restored ${n} docs`); assert.strictEqual(docs.get('server/season').n, 2, 'the season is never rolled back');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
