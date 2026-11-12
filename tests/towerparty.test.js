/* VAYRATHEN — tests/towerparty.test.js — (v103) two party mates climb the Vayra Tower together:
   one invite, one room, one host runs the floors, the mate follows and is paid for every floor */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('tower party: invite, shared floors, both paid, host hand-over', { skip, timeout: 240000 }, async () => {
  const { players, close } = await openPlayers(2);
  try {
    const [a, b] = players.map(p => p.page);
    for (const [i, pg] of [a, b].entries()){
      await enterWorld(pg, 'Climber' + i);
      await pg.evaluate(() => { S.lvl = 60; S.bia = 0; S.tower = {best:0, runs:0}; derive(); S.hp = DER.maxhp; NET.party = 'pt_tower'; NET.presT = 0; });
    }
    await a.waitForFunction(() => twpMates().length === 2, null, { timeout: 20000 });
    await b.waitForFunction(() => twpMates().length === 2, null, { timeout: 20000 });

    // the window offers the party climb; a starts it, b accepts the invite
    await a.evaluate(() => openWin('tower'));
    await a.waitForSelector('#pane-tower [data-twpgo]');
    await a.click('#pane-tower [data-twpgo]');
    await b.waitForSelector('#sysPrompt:not([hidden]) [data-spy]', { timeout: 15000 });
    await b.click('#sysPrompt [data-spy]');
    await b.waitForFunction(() => TW.active && TW.party, null, { timeout: 10000 });
    const codes = await Promise.all([a, b].map(p => p.evaluate(() => [DG.code, DG.pc, NET.mapName])));
    assert.strictEqual(codes[0][0], codes[1][0], 'one room code'); assert.strictEqual(codes[0][1], 2, 'party of 2');
    assert.strictEqual(codes[0][2], codes[1][2], 'both in the same map room');

    // one host, one mate
    await a.waitForFunction(() => NM.host || NM.slave, null, { timeout: 20000 });
    await b.waitForFunction(() => NM.host || NM.slave, null, { timeout: 20000 });
    const aHost = await a.evaluate(() => NM.host), [H, M] = aHost ? [a, b] : [b, a];
    assert.ok(await M.evaluate(() => NM.slave && !twHost()), 'the other follows');

    // the host spawns floor 1, the mate sees the same foes; the host clears it
    await H.waitForFunction(() => TW.phase === 'fight' && mobs.some(m => m.dg && !m.dead), null, { timeout: 30000 });
    await M.waitForFunction(() => TW.phase === 'fight' && mobs.some(m => m.dg && !m.dead) && TW.t > 30, null, { timeout: 20000 });
    await H.evaluate(() => { for (const m of mobs) if (m.dg && !m.dead){ m.hp = 0; killMob(m); } });
    await H.waitForFunction(() => TW.f === 2, null, { timeout: 10000 });
    await M.waitForFunction(() => TW.f === 2 && S.bia > 0 && S.tower.best === 1, null, { timeout: 15000 });
    assert.ok(await M.evaluate(() => twkMine().f === 1), 'the floor counts for the mate\'s week too');

    // floor 2 for both, the mate's clock follows the host's. (v272–v273) the next floor starts when you walk through the
    // open door yourself: both step onto its sill
    for (const pg of [H, M]){ await pg.waitForFunction(() => typeof TWM !== 'undefined' && TWM.open, null, { timeout: 20000 }).catch(() => {});
      await pg.evaluate(() => { if (typeof twmStairs === 'function'){ const s = twmStairs(); P.x = s.x; P.y = s.y; P.tx = null; } }); }
    await M.waitForFunction(() => TW.phase === 'fight' && TW.f === 2, null, { timeout: 30000 });
    const [th, tm] = await Promise.all([H.evaluate(() => TW.t), M.evaluate(() => TW.t)]);
    assert.ok(Math.abs(th - tm) < 4, `clocks agree (${th.toFixed(1)} vs ${tm.toFixed(1)})`);

    // the host leaves: the mate becomes host and keeps climbing on the same floor
    await H.evaluate(() => twQuit('leave'));
    await M.waitForFunction(() => !NM.slave && twHost() && TW.active && TW.f === 2, null, { timeout: 20000 });
    assert.ok(await M.evaluate(() => mobs.some(m => m.dg && !m.dead)), 'no free floor: the foes are there to beat');
    await M.evaluate(() => { for (const m of mobs) if (m.dg && !m.dead){ m.hp = 0; killMob(m); } });
    await M.waitForFunction(() => TW.f === 3, null, { timeout: 15000 });
    assert.ok(await H.evaluate(() => !TW.active && !DG.active), 'the host is out');
  } finally { await close(); }
  assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
});
