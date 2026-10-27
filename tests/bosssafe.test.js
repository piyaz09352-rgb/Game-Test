/* VAYRATHEN — tests/bosssafe.test.js — a boss hit from the safe zone teleports away with full HP */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('boss pulled to the village teleports away; normal hits outside still land', { skip, timeout: 90000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      loadMap(0); const type = Object.keys(MOB).find(k => MOB[k].boss && !MOB[k].wb);
      P.x = VC; P.y = 900; const inV = inVillage(P);
      const b = spawnMob(type, VC + 330, 900); b.aggro = true; const x0 = b.x;
      b.hp = b.maxhp - 500; applyDamage(b, {dmg:100}, null);
      const esc = {moved:Math.hypot(b.x - x0, b.y - 900) > 200, full:b.hp === b.maxhp, calm:!b.aggro};
      P.x = b.x - 60; P.y = b.y; const out = !inVillage(P) && !inVillage(b); const hp0 = b.hp; applyDamage(b, {dmg:100}, null);
      const b2 = spawnMob(type, VC, 900); updMob(b2, .05); const intoTown = !inVillage(b2);
      return {inV, esc, out, hit:b.hp < hp0, intoTown};
    });
    assert.ok(r.inV, 'the hero stands in the village');
    assert.deepStrictEqual(r.esc, {moved:true, full:true, calm:true}, 'the boss teleported away with full HP');
    assert.ok(r.out && r.hit, 'outside the village the boss takes damage as usual');
    assert.ok(r.intoTown, 'a boss inside the village teleports out');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
