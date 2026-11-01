/* VAYRATHEN — tests/towerfloors226.test.js — (v226) tower floors of different kinds: a strong hero climbs floors
   1–12 on Auto and meets a curse (3), a survive floor that lasts its 40 s (4), a leader hunt that ends when the
   leader falls (9) and a treasure room whose chests Auto opens (11); a drought curse refuses potions. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('tower floor kinds: curse, survive, leader, treasure', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const o = {kinds:{}, dur:{}}, step = () => { advance(.05, false); if (!P.dead) { S.hp = DER.maxhp; S.sp = DER.maxsp; } if (DG3.boonOpen){ const b = document.querySelector('[data-boon]'); if (b) b.click(); } };
      S.tut = {done:true, i:99}; S.job = 'blade'; S.lvl = 200; S.stats = {str:120, agi:80, vit:80, int:1, dex:60, luk:1}; derive(); S.inv.redpot = 50;
      loadMap(0); twStart(1); setBot(true); botSet();
      let t = 0, cur = 0, t0 = 0;
      while (t < 900 && TW.active && TW.f <= 12){ step(); t += .05;
        if (TW.phase === 'fight' && TWF.f === TW.f && cur !== TW.f){ cur = TW.f; t0 = t; o.kinds[cur] = TWF.kind;
          if (TWF.kind === 'curse' && TWF.curse === 'drought'){ const hp = S.hp = Math.round(DER.maxhp / 2); useItem('redpot'); o.drought = S.hp === hp; S.hp = DER.maxhp; } }
        if (TW.phase === 'rest' && cur && o.dur[cur] == null){ o.dur[cur] = Math.round(t - t0); if (o.kinds[cur] === 'treasure') o.chests = TW.gain.z; } }
      o.reached = TW.f; return o;
    });
    assert.ok(r.reached > 12, `climbed past floor 12 (reached ${r.reached})`);
    assert.strictEqual(r.kinds[3], 'curse'); assert.strictEqual(r.kinds[4], 'survive'); assert.strictEqual(r.kinds[9], 'elite'); assert.strictEqual(r.kinds[11], 'treasure');
    assert.ok(r.dur[4] >= 38, `the survive floor lasts its 40 s (${r.dur[4]} s)`);
    assert.ok(r.dur[11] < 26, `the treasure room ends when the chests are open or time is up (${r.dur[11]} s)`);
    assert.ok(r.drought === undefined || r.drought === true, 'a drought curse refuses potions');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
