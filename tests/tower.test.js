/* VAYRATHEN — tests/tower.test.js — the endless tower: a run starts, floors clear and climb, a guardian floor,
   no blessing (v235), first-clear rewards, leaving ends the run with a summary, the best floor is kept, checkpoints. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('tower: climb floors, guardian on floor 5, leave, best floor and checkpoints', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r0 = await page.evaluate(() => { S.lvl = 80; derive(); S.hp = DER.maxhp; const ok = twStart(1);
      return {ok, dg:DG.active, tw:TW.active, map:MAP_ID, room:dgRoom()}; });
    assert.ok(r0.ok && r0.dg && r0.tw, 'a run starts inside the dungeon instance');
    assert.ok(/^dg-tw/.test(r0.room), 'a private room of its own');
    await page.waitForFunction(() => TW.phase === 'fight' && mobs.some(m => m.tw && !m.dead), null, { timeout: 15000 });
    const lv1 = await page.evaluate(() => mobs.find(m => m.tw && !m.dead).def.lvl);
    assert.strictEqual(lv1, 6, 'floor 1 monsters are Lv 6');
    // clear floors 1..4 by hand
    const killAll = () => page.evaluate(() => { for (const m of mobs) if (m.dg && !m.dead){ m.hp = 0; m.dead = true; } S.hp = DER.maxhp; if (typeof TWF !== 'undefined' && TWF.kind === 'survive' && TWF.f === TW.f) TW.t = .5; });   // (v226) a survive floor ends when its time is up
    for (let f = 1; f <= 4; f++){
      await page.waitForFunction(n => TW.f === n && TW.phase === 'fight', f, { timeout: 15000 });
      await killAll();
      await page.waitForFunction(n => TW.f === n + 1, f, { timeout: 15000 });
    }
    await page.waitForFunction(() => TW.f === 5 && TW.phase === 'fight', null, { timeout: 15000 });
    const g = await page.evaluate(() => ({boss:mobs.some(m => m.tw && !m.dead && m.def.boss), lab:questTracker().includes('หอคอย') || questTracker().includes('Tower')}));
    assert.ok(g.boss, 'floor 5 brings a guardian'); assert.ok(g.lab, 'the quest card shows the climb');
    await killAll();
    await page.waitForFunction(() => TW.f === 6 && TW.phase === 'rest', null, { timeout: 15000 });
    await page.evaluate(() => { TW.restT = Math.min(TW.restT, .2); });   // (v235) no blessing: the stairs open, skip the wait
    await page.waitForFunction(() => TW.f === 6 && TW.phase === 'fight', null, { timeout: 20000 });
    const mid = await page.evaluate(() => ({best:S.tower.best, boons:Object.keys(P.buffs).filter(k => k.startsWith('dgb_')).length}));
    assert.strictEqual(mid.best, 5, 'the best floor is kept'); assert.strictEqual(mid.boons, 0, 'no blessing in the tower (v235)');
    await page.evaluate(() => twQuit('leave'));
    await page.waitForSelector('#twSum', { timeout: 10000 });
    const end = await page.evaluate(() => ({dg:DG.active, tw:TW.active, map:MAP_ID, reached:TW.end.reached, boons:Object.keys(P.buffs).filter(k => k.startsWith('dgb_')).length}));
    assert.ok(!end.dg && !end.tw, 'leaving ends the run'); assert.strictEqual(end.reached, 5);
    // checkpoints: only floor 1 until floor 10 is passed
    const ck = await page.evaluate(() => { const a = twCks(); S.tower.best = 23; const b = twCks(); return {a, b}; });
    assert.deepStrictEqual(ck.a, [1]); assert.deepStrictEqual(ck.b, [1, 11, 21]);
    // the window renders, with the ranking section
    await page.evaluate(() => openWin('tower'));
    const win = await page.evaluate(() => ({ck:document.querySelectorAll('#pane-tower [data-twck]').length, go:!!document.querySelector('#pane-tower [data-twgo]')}));
    assert.strictEqual(win.ck, 3); assert.ok(win.go);
    // falling ends a run too
    await page.evaluate(() => { closeWin('tower'); const b = document.getElementById('twSum'); if (b) b.remove(); twStart(21); });
    await page.waitForFunction(() => TW.phase === 'fight', null, { timeout: 15000 });
    await page.evaluate(() => playerDie());
    // (v241) the death sign: no feather in the Tower, «leave the Tower» ends the climb
    await page.waitForFunction(() => el('dth') && !el('dth').hidden, null, { timeout: 10000 });
    assert.ok(await page.evaluate(() => document.querySelector('[data-dth="here"]').disabled), 'no feather revive in the Tower');
    await page.click('[data-dth="town"]');
    await page.waitForFunction(() => !TW.active && TW.end && TW.end.why === 'fell', null, { timeout: 20000 });
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
