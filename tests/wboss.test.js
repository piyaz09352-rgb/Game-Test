/* VAYRATHEN — tests/wboss.test.js — the world boss lands on a random hunting map (never the town), the quest bar
   names the map with a Warp button, and fewer small monsters stay out while it is there. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('world boss: random hunting map, warp button, thinned spawns', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const pick = await page.evaluate(() => { const ids = new Set(); for (let i = 0; i < 60; i++) ids.add(wbMap('2026-10-21-' + i));
      return {ids:[...ids], same:wbMap('k1') === wbMap('k1')}; });
    assert.ok(!pick.ids.includes(0), 'never in Aren');
    assert.ok(pick.ids.length > 5, 'spread over many maps');
    assert.ok(pick.same, 'everyone agrees on the map');
    // start one now: in town it does not land, the quest bar offers a warp
    await page.evaluate(() => { wbForce(15); dirty = true; renderGoal && renderGoal(); });
    await page.waitForTimeout(600);
    assert.ok(await page.evaluate(() => !WB.m), 'no boss in town');
    assert.ok(await page.evaluate(() => questTracker().includes('data-wbwarp')), 'the quest bar has a warp button');
    const target = await page.evaluate(() => wbMap(wbWindow().key));
    await page.evaluate(id => warpTo(id), target);
    await page.waitForFunction(() => WB.m && !WB.m.dead, null, { timeout: 8000 });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({map:MAP_ID, wb:WB.m.wb, odd:spawnSlots.filter((s, i) => i % 2 && s.mob && !s.mob.dead).length, slots:spawnSlots.length}));
    assert.strictEqual(r.map, target);
    assert.ok(r.wb);
    assert.strictEqual(r.odd, 0, 'every other spawn point rests while Rahu is here');
    // go to the boss + the damage ranking
    const g = await page.evaluate(() => { P.x = WB.m.x - 900 > 40 ? WB.m.x - 900 : WB.m.x + 900; P.y = WB.m.y; const hasGo = questTracker().includes('data-wbgo'); wbGo(); WB.my = .02;
      return {hasGo, walking:P.tx != null, rank:questTracker().includes('wbrank'), me:wbRank()[0].me}; });
    assert.ok(g.hasGo && g.walking, 'the Go to boss button walks you there');
    assert.ok(g.rank && g.me, 'the damage ranking shows');
    // leaving the map takes it away
    await page.evaluate(() => warpTo(0)); await page.waitForTimeout(400);
    assert.ok(await page.evaluate(() => !WB.m || WB.m.dead));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
