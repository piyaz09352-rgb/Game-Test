/* VAYRATHEN — tests/online.test.js — two players on one map through a fake online backend (tests/mock-net.js).
   v27: no host on field maps — both build the map from the world clock. Both must see the same monsters, the SAME boss in the same place, hits from either player must reach it, and its death must show
   for both. Runs with Firebase-style presence (each call replaces the record) and claude.ai-style (merge). */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

const bossOf = page => page.evaluate(() => (boss && !boss.dead ? { nid: boss.nid || null, type: boss.type, x: boss.x, y: boss.y, hp: boss.hp, maxhp: boss.maxhp, own: boss.netOwner || null, mine: !!boss.mine, aggro: !!boss.aggro, me: NM.me, w: typeof nwWander === 'function' && boss.nid ? nwWander(boss, wNow()) : null, home: [boss.whx, boss.why, Math.round(boss.hx), Math.round(boss.hy)], now: Math.round(wNow() / 1000), lair: [Math.round(LAIR.x), Math.round(LAIR.y)], p: [Math.round(P.x), Math.round(P.y)] } : null));
const role = page => page.evaluate(() => (NM.mode === 'world' ? 'world' : NM.host ? 'host' : NM.slave ? 'slave' : 'alone'));

for (const merge of [false, true]){
  test(`two players share one boss (${merge ? 'merging' : 'Firebase'} presence)`, { skip, timeout: 240000 }, async () => {
    const { players, close } = await openPlayers(2, { merge });
    try {
      for (const [i, p] of players.entries()){
        await enterWorld(p.page, 'Hero' + i);
        await p.page.evaluate(() => { S.lvl = 80; derive(); S.hp = DER.maxhp; loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; });
      }
      // v27: no host — both run the map from the world clock
      const t0 = Date.now(); let roles;
      while (Date.now() - t0 < 20000){ roles = await Promise.all(players.map(p => role(p.page))); if (roles.every(r => r === 'world')) break; await players[0].page.waitForTimeout(300); }
      assert.deepStrictEqual(roles, ['world', 'world'], 'both run the world clock, nobody hosts');
      const [a, b] = players.map(p => p.page);
      // b's device clock is 90 s fast: the players agree on one world clock anyway
      await b.evaluate(() => { const n = Date.now; Date.now = () => n() + 90e3; });
      await a.waitForTimeout(11000);
      const [wa, wb] = await Promise.all([a, b].map(pg => pg.evaluate(() => wNow())));
      assert.ok(Math.abs(wa - wb) < 2500, `one world clock: a ${wa} b ${wb} (diff ${wa - wb})`);
      await a.waitForTimeout(2500);
      // the same monsters, by id, in about the same places
      const field = pg => pg.evaluate(() => Object.fromEntries(mobs.filter(m => m.nid && !m.dead && !m.def.boss).map(m => [m.nid, [Math.round(m.x), Math.round(m.y)]])));
      const [fa, fb] = [await field(a), await field(b)], ids = Object.keys(fa).filter(k => fb[k]);
      assert.ok(ids.length >= 10, `shared monsters: ${ids.length} (a ${Object.keys(fa).length}, b ${Object.keys(fb).length})`);
      const far = ids.filter(k => Math.hypot(fa[k][0] - fb[k][0], fa[k][1] - fb[k][1]) > 90);
      assert.ok(far.length <= ids.length * .15, `same places: ${far.length} of ${ids.length} apart`);
      // (v98) elites come from the world clock only: both games mark the same monsters as elite
      const elites = pg => pg.evaluate(() => mobs.filter(m => m.nid && !m.dead && m.elite).map(m => m.nid).sort());
      const [ea, eb] = [await elites(a), await elites(b)];
      assert.deepStrictEqual(ea.filter(k => ids.includes(k)), eb.filter(k => ids.includes(k)), 'the same elites');
      // (v98) the same build: no "different version" warning; a different world fingerprint is noticed
      assert.strictEqual(await a.evaluate(() => NWV.warned), '', 'no version warning between the same builds');
      await b.evaluate(() => { window.__sig = nwSig; nwSig = () => 'other'; });
      // checked every 5 s of game time; a slow test machine runs game time slower than the wall clock
      await a.waitForFunction(() => NWV.warned !== '', null, { timeout: 20000 }).catch(() => {});
      assert.notStrictEqual(await a.evaluate(() => NWV.warned), '', 'a different build on the map is noticed');
      await b.evaluate(() => { nwSig = window.__sig; });

      // the region boss comes from the clock: one, the same id, the same place
      const obsOf = pg => pg.evaluate(() => obstacles.map(o => [Math.round(o.x), Math.round(o.y), Math.round(o.r), Object.keys(o).filter(k => !['x', 'y', 'r'].includes(k)).join('/')].join(':')));
      const [oa, ob] = [await obsOf(a), await obsOf(b)], obDiff = {a:oa.filter(x => !ob.includes(x)).slice(0, 8), b:ob.filter(x => !oa.includes(x)).slice(0, 8)};
      const [hb, sb] = [await bossOf(a), await bossOf(b)];
      assert.ok(hb && sb, `both see a boss: ${JSON.stringify(hb)} / ${JSON.stringify(sb)}`);
      assert.strictEqual(sb.nid, hb.nid, 'it is the same boss');
      assert.ok(Math.hypot(hb.x - sb.x, hb.y - sb.y) < 120, `in the same place: ${Math.round(hb.x)},${Math.round(hb.y)} vs ${Math.round(sb.x)},${Math.round(sb.y)} · ${JSON.stringify(hb)} / ${JSON.stringify(sb)} · obstacles only in one game: ${JSON.stringify(obDiff)}`);
      assert.strictEqual(await b.evaluate(() => mobs.filter(m => !m.dead && m.def.boss && !m.wb).length), 1, 'exactly one boss');

      // b hits it: a's boss loses HP too
      await b.evaluate(() => { const x = boss; const dmg = Math.round(x.maxhp * .2); x.hp -= dmg; nmHit(x, dmg); nmFlushHits(); });
      await a.waitForTimeout(1500);
      const hb2 = await bossOf(a);
      assert.ok(hb2.hp < hb.hp - hb.maxhp * .1, `a sees the hit: ${Math.round(hb.hp)} → ${Math.round(hb2.hp)}`);

      // a kills it: gone for both, and the kill time is the same in both games
      await a.evaluate(() => { const x = boss; x.hp = 1; killMob(x); });
      await a.waitForTimeout(2000);
      assert.strictEqual(await bossOf(a), null, 'a: boss is dead');
      assert.strictEqual(await bossOf(b), null, 'b: boss is dead');
      const [ka, kb] = await Promise.all([a, b].map(pg => pg.evaluate(() => BCK.kill[MAP_ID] || 0)));
      assert.ok(ka && ka === kb, `same kill stamp ${ka} / ${kb}`);

      // a field monster killed by b: gone for a, and its slot moves to the next generation in both
      const victim = ids[0];
      await b.evaluate(id => { const m = NM.byId.get(id); if (m){ m.hp = 1; killMob(m); } }, victim);
      await a.waitForTimeout(1500);
      assert.ok(!(await a.evaluate(id => { const m = NM.byId.get(id); return !!(m && !m.dead); }, victim)), 'a: that monster died too');
      const [ga, gb] = await Promise.all([a, b].map(pg => pg.evaluate(id => { const k = nwSlotOf(id); return k ? NM.gen[k.key].g : -1; }, victim)));
      assert.ok(ga >= 1 && ga === gb, `generation ${ga} / ${gb}`);

      // either can leave: the other keeps the same world (no host hand-over, no reset)
      await b.evaluate(() => { NET.mapRoom && NET.mapRoom.leave && NET.mapRoom.leave(); });
    } finally { await close(); }
    assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
  });
}
