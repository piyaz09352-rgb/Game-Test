/* VAYRATHEN — tests/minion.test.js — a boss's minions reach the other player once, and are never echoed back
   (v27e bug: each game re-announced the other's minions and the fields filled with hundreds of jellies) */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
test('minions are shared once, no echo storm', { skip, timeout: 240000 }, async () => {
  const { players, close } = await openPlayers(2, { merge: false });
  try {
    for (const [i, p] of players.entries()){ await enterWorld(p.page, 'Hero' + i); await p.page.evaluate(() => { S.lvl = 80; derive(); loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; }); }
    const [a, b] = players.map(p => p.page);
    const t0 = Date.now(); while (Date.now() - t0 < 20000 && !(await a.evaluate(() => NM.mode === 'world') && await b.evaluate(() => NM.mode === 'world'))) await a.waitForTimeout(300);
    const count = pg => pg.evaluate(() => mobs.filter(m => m.minion && !m.dead).length);
    await a.evaluate(() => { for (let i = 0; i < 2; i++) spawnMob(MAPS[1].mobs[0], P.x + 80 + i * 20, P.y, {zone:MAPZ, minion:true}); });
    await a.waitForTimeout(6000);
    const [ca, cb] = [await count(a), await count(b)];
    assert.strictEqual(ca, 2, `the summoner keeps its 2 minions (has ${ca})`);
    assert.strictEqual(cb, 2, `the other player sees the same 2, not an echo storm (has ${cb})`);
  } finally { await close(); }
  assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
});
