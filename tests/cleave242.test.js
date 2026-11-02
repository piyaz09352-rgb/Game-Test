/* VAYRATHEN — tests/cleave242.test.js — (v242) a close-range normal attack hits every monster within reach in front
   (ahead, left and right) for the full hit; nothing behind or out of reach; bows, magic and stars unchanged. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('close-range normal attack sweeps the front half, full damage', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { const out = {}; S.tut = {done:true, i:99};
      for (const job of ['blade', 'muay', 'ranger']){
        S.job = job; S.lvl = 60; derive(); loadMap(3); mobs.length = 0; const x = P.x = 1500, y = P.y = 1000, R = DER.range;
        const k = Object.keys(MOB).find(k => !MOB[k].boss && MOB[k].lvl > 20 && MOB[k].lvl < 40);
        const mk = (dx, dy) => { const m = spawnMob(k, x + dx, y + dy); m.hp = m.maxhp = 1e6; m.def = {...m.def, def:0}; return m; };
        const t = mk(R, 0), l = mk(0, -R * .8), rr = mk(0, R * .8), b = mk(-R, 0), far = mk(R * 4, 0);
        const keep = Math.random; Math.random = () => .3; DER.hit = 9999; try { basicAttack(t); } finally { Math.random = keep; }
        const f = m => Math.round(1e6 - m.hp); out[job] = {t:f(t), l:f(l), r:f(rr), b:f(b), far:f(far)}; }
      return out; });
    const m = r.blade; assert.ok(m.t > 0 && m.l === m.t && m.r === m.t, 'sword: ahead, left and right all take the full hit ' + JSON.stringify(m));
    assert.ok(m.b === 0 && m.far === 0, 'nothing behind or out of reach');
    assert.ok(r.muay.t > 0 && r.muay.l === r.muay.t, 'fists sweep too (one rule for every close-range weapon)');
    assert.ok(r.ranger.l === 0 && r.ranger.r === 0, 'a bow does not sweep');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
