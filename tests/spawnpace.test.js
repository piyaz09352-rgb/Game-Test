/* VAYRATHEN — tests/spawnpace.test.js — monsters respawn fast; the region boss runs on the world clock (15 min after a kill, else the next quarter hour);
   Auto avoids real bosses but fights pack alphas */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { openGame, enterWorld } = require('./browser');

test('respawn pace, boss clock and Auto vs alphas', async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      loadMap(1);
      const out = {};
      out.first = bossTimer; out.slot = (Math.ceil(Date.now() / 900e3) * 900e3 - Date.now()) / 1000;
      out.gaps = Array.from({ length: 200 }, () => bossGap());
      // a slot spawns, and then waits this long again after its monster is killed
      let waits = []; for (let i = 0; i < 60; i++){ const s = spawnSlots[i]; s.mob = null; s.timer = 0; updSlots(.01); waits.push(s.timer); }
      out.waits = waits.filter(x => x > 0);
      // killing the region boss re-arms the clock
      boss = spawnMob(MAPS[1].boss, P.x + 900, P.y, {}); boss.hp = 1; killMob(boss); out.afterKill = bossTimer; out.due = (bckDue(1) - wNow()) / 1000; out.round = (Math.ceil((wNow() + 600e3) / 900e3) * 900e3 - wNow()) / 1000;
      // Auto: bosses are shunned, alphas are not
      S.bot = S.bot || {}; S.bot.avoidBoss = true;
      const near = mobs.find(m => !m.dead && !m.def.boss); near.x = P.x + 60; near.y = P.y; near.dead = false; near.elite = false;
      const b = spawnMob(MAPS[1].boss, P.x + 3000, P.y, {}); const al = spawnMob(near.type, P.x + 150, P.y + 100, {}); al.elite = true;
      out.shunBoss = botShun(b); out.shunAlpha = botShun(al); out.nearAlpha = botBosses().includes(al); out.bossListed = botBosses().includes(b);
      return out;
    });
    assert.ok(r.slot >= 0 && r.slot <= 900, 'first boss at the next quarter hour of the world clock: ' + r.slot);
    assert.ok(r.gaps.every(g => g === 900), 'every gap is 15 min');
    assert.ok(r.waits.length && r.waits.every(w => w >= 2.4 && w <= 5.1), 'monster respawn wait 2.5–5 s: ' + r.waits.slice(0, 5));
    assert.ok(Math.abs(r.due - r.round) < 2 && r.due >= 598, 'after a kill the next boss comes at the first quarter-hour mark at least 10 minutes later: ' + r.due + ' / ' + r.round);
    assert.equal(r.shunBoss, true, 'Auto avoids a boss'); assert.equal(r.bossListed, true);
    assert.equal(r.shunAlpha, false, 'Auto does not avoid a pack alpha'); assert.equal(r.nearAlpha, false);
    assert.deepEqual(errors, []);
  } finally { await close(); }
});
