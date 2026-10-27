'use strict';
const test = require('node:test'), assert = require('node:assert');
const { openGame, enterWorld } = require('./browser');

test('region boss is still there (same HP) after leaving the map and coming back', async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { loadMap(1); bossTimer = 0; });   // the first boss comes 1–30 min after arriving; skip the wait
    await page.waitForFunction(() => !!boss, null, { timeout: 30000 });
    await page.evaluate(() => { boss.hp = Math.round(boss.maxhp * .4); });
    await page.evaluate(() => { loadMap(0); });
    await page.waitForTimeout(500);
    await page.evaluate(() => { loadMap(1); });
    await page.waitForFunction(() => !!boss, null, { timeout: 30000 });
    const f = await page.evaluate(() => boss.hp / boss.maxhp);
    assert.ok(Math.abs(f - .4) < .02, 'boss keeps its HP: ' + f);
    // killed boss: the world-clock round keeps running while you are away (killed this round: back at the next round)
    await page.evaluate(() => { boss = null; BCK.kill[1] = Math.floor(wNow() / 900e3) * 900e3 + 1; const r = MVP.recs[MAPS[1].boss]; if (r){ r.up = false; r.at = BCK.kill[1]; } loadMap(0); loadMap(1); });
    await page.waitForTimeout(900);
    const [t, want] = await page.evaluate(() => [bossTimer, (Math.floor(wNow() / 900e3) * 900e3 + 900e3 - wNow()) / 1000]);
    assert.ok(Math.abs(t - want) < 3, 'respawn clock kept (next world round): ' + t + ' / ' + want);
    assert.deepEqual(errors, []);
  } finally { await close(); }
});
