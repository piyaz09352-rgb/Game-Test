/* VAYRATHEN — tests/fame.test.js — the Hall of Fame (js/sys/fame.js) through the fake online backend with its
   shared database (tests/mock-net.js, db:true): a party kill credits and rewards both players, the first clear is
   written once and never overwritten, a faster kill replaces the speed record (keeping the old one as prev), the
   other player hears about it (even when the 'fame' room topic is refused), and offline play keeps personal records. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

const BOSS = 'whitemonkeyking', CLR = `fame/clr_b_${BOSS}`, SPD = `fame/spd_b_${BOSS}`;
/* a boss of map 1 that this game saw at full HP, first wounded `ms` ago, falls now */
const killBoss = (page, ms) => page.evaluate(([type, ms]) => { const m = spawnMob(type, P.x + 60, P.y, {zone:MAPZ}); m.fmSeen = 1; m.fmFull = true; m.fmT0 = Date.now() - ms; m.hp = 0; killMob(m); }, [BOSS, ms]);
const until = async (what, fn, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return; await new Promise(r => setTimeout(r, 200)); } assert.fail('timed out waiting for ' + what); };
const fameOf = page => page.evaluate(() => ({ got: {...S.fame.got}, titles: Object.keys(S.fame.titles), coins: ACC.coins, shown: [...FM.shown], chat: NET.chat.filter(c => c.ch === 'sys').map(c => c.text) }));

test('hall of fame: party credit, first stays first, faster wins, announced and rewarded', { skip, timeout: 240000 }, async () => {
  const { players, broker, close } = await openPlayers(2, { db: true });
  try {
    const [A, B] = players.map(p => p.page);
    await enterWorld(A, 'Alpha', 'fameA'); await enterWorld(B, 'Beta', 'fameB');
    for (const p of [A, B]) await p.evaluate(() => { S.lvl = 80; derive(); S.hp = DER.maxhp; loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; NET.party = 'p-fame'; NET.lobbyT = 0; NET.presT = 0; });
    await until('a party of two on map 1', async () => (await A.evaluate(() => partyMembers().filter(p => !p.isMe && p.presence.m === 1).length)) === 1);
    await until('the fame list loaded', async () => (await Promise.all([A, B].map(p => p.evaluate(() => FM.loaded)))).every(Boolean));
    const coins0 = await Promise.all([A, B].map(p => p.evaluate(() => ACC.coins)));

    // Alpha's party kills the boss in 60 s: one record naming both, a speed record, both rewarded
    await killBoss(A, 60000);
    await until('the first clear in the database', () => broker.db.has(CLR) && broker.db.has(SPD));
    const clr = broker.db.get(CLR), spd = broker.db.get(SPD);
    assert.deepStrictEqual(clr.names, ['Alpha', 'Beta'], 'the whole party is named'); assert.deepStrictEqual(clr.uids, ['u0', 'u1']); assert.strictEqual(clr.party, true);
    assert.ok(Math.abs(spd.t - 60000) < 2000, `speed record ~60 s: ${spd.t}`);
    await until('both rewarded', async () => (await Promise.all([A, B].map(p => p.evaluate(([c, s]) => S.fame.got[c] && S.fame.got[s], [CLR.slice(5), SPD.slice(5)])))).every(Boolean));
    const [fa, fb] = await Promise.all([A, B].map(fameOf));
    for (const [f, c0, who] of [[fa, coins0[0], 'Alpha'], [fb, coins0[1], 'Beta']]){
      assert.ok(f.titles.includes('fm_clr') && f.titles.includes('fm_spd'), `${who} holds the titles: ${f.titles}`);
      assert.ok(f.coins >= c0 + 35, `${who} got Vayra Coins: ${c0} → ${f.coins}`);
    }
    assert.ok(fb.shown.includes(`clr_b_${BOSS}@${clr.at}`), 'Beta saw the announcement');
    assert.ok(fb.chat.some(t => t.includes('Alpha') && t.includes('Beta')), 'the announcement reached Beta\'s chat: ' + fb.chat.join(' | '));

    // Beta clears it again, slower (also with an empty local cache, so the database itself is re-checked): nothing changes
    await killBoss(B, 90000); await B.waitForTimeout(1500);
    await B.evaluate(() => { FM.recs = {}; }); await killBoss(B, 90000); await B.waitForTimeout(2500);
    assert.strictEqual(broker.writes[CLR], 1, 'the first clear was written once');
    assert.strictEqual(broker.writes[SPD], 1, 'a slower kill does not touch the speed record');
    assert.strictEqual(broker.db.get(CLR).at, clr.at, 'first stays first');

    // Beta alone, 30 s, with the 'fame' room topic refused: the record moves, Alpha still hears it from the database
    await B.evaluate(() => { NET.party = null; NET.lobbyT = 0; const e = NET.room.emit.bind(NET.room); NET.room.emit = async (t, d) => { if (t === 'fame') throw {code:'not_permitted'}; return e(t, d); }; });
    await killBoss(B, 30000);
    await until('the new speed record', () => broker.db.get(SPD).t < 40000);
    const spd2 = broker.db.get(SPD);
    assert.deepStrictEqual(spd2.names, ['Beta'], 'a solo record names one player'); assert.strictEqual(spd2.party, false);
    assert.deepStrictEqual(spd2.prev && spd2.prev.names, ['Alpha', 'Beta'], 'the old record is kept as the former one');
    assert.strictEqual(broker.writes[CLR], 1, 'the first clear is still untouched');
    await until('Alpha hears of it', async () => (await fameOf(A)).shown.includes(`spd_b_${BOSS}@${spd2.at}`));
    await until('Beta rewarded again', async () => (await B.evaluate(s => S.fame.got[s], SPD.slice(5))) === spd2.at);
    const fa2 = await fameOf(A);
    assert.strictEqual(fa2.got[SPD.slice(5)], spd.at, 'Alpha is not rewarded for a record without them');
    assert.ok(fa2.titles.includes('fm_spd'), 'Alpha keeps the title after the record is beaten');

    // the wiki tab shows it
    const page = await A.evaluate(() => { openWin('wiki'); WIKI.tab = 'fame'; WIKI.sel = 'spd'; renderWiki(); return el('wkPage').textContent; });
    assert.ok(page.includes('Beta') && page.includes('0:30') && page.includes('Alpha'), 'Hall of Fame page lists holder, time and former holders');
  } finally { await close(); }
  assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
});

test('hall of fame offline: personal records only, never an error', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Solo');
    const r = await page.evaluate(() => {
      S.lvl = 60; derive(); S.hp = DER.maxhp;
      const kill = ms => { const m = spawnMob('boss', P.x + 60, P.y, {zone:MAPZ}); m.fmSeen = 1; m.fmFull = true; m.fmT0 = Date.now() - ms; m.hp = 0; killMob(m); };
      kill(45000); const t1 = S.fame.mine.spd_b_boss.t; kill(80000); const t2 = S.fame.mine.spd_b_boss.t; kill(20000); const t3 = S.fame.mine.spd_b_boss.t;
      loadMap(16); fameMile();
      openWin('wiki'); WIKI.tab = 'fame'; for (const c of ['clr', 'spd', 'disc', 'mile', 'me']){ WIKI.sel = c; renderWiki(); }
      return { t1, t2, t3, ids: Object.keys(S.fame.mine), db: !!NET.db, text: el('wkPage').textContent };
    });
    assert.strictEqual(r.db, false, 'offline');
    assert.ok(Math.abs(r.t1 - 45000) < 2000 && r.t2 === r.t1 && Math.abs(r.t3 - 20000) < 2000, `personal best only improves: ${r.t1} ${r.t2} ${r.t3}`);
    for (const id of ['clr_b_boss', 'spd_b_boss', 'disc_map_16', 'mile_lv50']) assert.ok(r.ids.includes(id), `personal record ${id}: ${r.ids}`);
    assert.ok(r.text.length > 20, 'My records page renders');
    await page.waitForTimeout(1500);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
