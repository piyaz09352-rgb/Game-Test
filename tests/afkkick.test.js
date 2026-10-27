/* a hero who does nothing for 5 minutes is sent out of the server (limit shortened here); any activity keeps them */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('idle hero is removed from the server; active hero stays', { skip, timeout: 240000 }, async () => {
  const { players, close } = await openPlayers(2, { merge: false });
  try {
    for (const [i, p] of players.entries()){ await enterWorld(p.page, 'Hero' + i);
      await p.page.evaluate(i => { S.lvl = 80; derive(); S.hp = DER.maxhp; loadMap(0); P.x = VSPAWN.x; P.y = VSPAWN.y; P.x += i * 150; AFK.limit = 8; AFK.warn = 4; afkPing(); }, i); }
    const [idle, busy] = players.map(p => p.page);
    await idle.waitForTimeout(2500); await idle.evaluate(() => { AFK.sig = ''; afkPing(); });
    await busy.waitForFunction(() => NET.ghosts.size >= 1, null, { timeout: 20000 }).catch(() => {});   // a slow machine needs longer to meet
    assert.ok(await busy.evaluate(() => NET.ghosts.size) >= 1, 'they see each other first');
    for (let k = 0; k < 9; k++){ await busy.keyboard.press('Shift'); await busy.waitForTimeout(1500); }   // 13 s of activity on one side
    assert.strictEqual(await idle.evaluate(() => PAUSED), true, 'the idle hero was sent back to the title');
    assert.strictEqual(await busy.evaluate(() => PAUSED), false, 'the active hero stays');
    await busy.waitForTimeout(1500);
    assert.strictEqual(await busy.evaluate(() => NET.ghosts.size), 0, 'the idle hero is gone from the active hero\'s map');
  } finally { await close(); }
  assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
});
