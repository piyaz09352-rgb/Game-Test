/* VAYRATHEN — tests/tower100_255.test.js — (v255) the Vayra Tower has 100 floors: floor 100 = Lv 300, clearing it wins */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('tower: 100 floors, Lv 3f monsters, the top ends the climb as a win', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Top');
    const a = await page.evaluate(() => { S.lvl = 300; derive(); S.tower = {best:140, runs:3};
      return {cap:TW_MAX, lv1:twLvC(1), lv10:twLvC(10), lv50:twLvC(50), lv100:twLvC(100), best:twSt().best, cks:twCks()}; });
    assert.strictEqual(a.cap, 100);
    assert.deepStrictEqual([a.lv10, a.lv50, a.lv100], [30, 150, 300], 'floor levels ' + JSON.stringify(a));
    assert.ok(a.lv1 >= 5, 'floor 1 is not below Lv 5');
    assert.strictEqual(a.best, 100, 'an old best past the top stops at 100');
    assert.strictEqual(Math.max(...a.cks), 91, 'the last checkpoint is floor 91 ' + a.cks);
    // climb from 91 and clear every floor by hand up to the top
    await page.evaluate(() => { twStart(91); });
    const end = await page.evaluate(async () => {
      for (let i = 0; i < 4000 && TW.active; i++){
        if (P.dead){ P.dead = false; S.hp = DER.maxhp; }
        S.hp = DER.maxhp;
        for (const m of mobs) if (m.tw && !m.dead){ m.hp = 0; m.dead = true; }
        if (typeof TWF !== 'undefined' && TWF.chests) TWF.chests.length = 0;
        const dl = el('dialog'); if (dl && !dl.hidden && typeof closeDialog === 'function') closeDialog(); else if (dl && !dl.hidden) dl.hidden = true;
        if (typeof DG3 !== 'undefined') DG3.boonOpen = false;
        if (typeof TWM !== 'undefined' && TWM.open && TW.phase === 'rest') twmClimb();   // (v273) the next floor waits for the door
        advance(.1, false); await new Promise(r => setTimeout(r, 0)); }
      return {active:TW.active, end:TW.end, f:TW.f, best:twSt().best, inDg:DG.active}; });
    assert.ok(!end.active && end.end && end.end.why === 'top', 'the climb ended at the top ' + JSON.stringify(end));
    assert.strictEqual(end.end.reached, 100); assert.strictEqual(end.best, 100);
    assert.ok(!end.inDg, 'back out of the tower');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
