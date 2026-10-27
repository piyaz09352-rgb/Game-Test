/* VAYRATHEN — tests/petnet.test.js — (v136) a caught pet is seen by the other players on the map */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('caught pets show for others', { skip, timeout: 180000 }, async () => {
  const { players, close } = await openPlayers(2);
  try {
    const [a, b] = players.map(p => p.page);
    for (const [i, pg] of [a, b].entries()){ await enterWorld(pg, 'Pet' + i); await pg.evaluate(() => { loadMap(0); P.x = VSPAWN.x; P.y = VSPAWN.y; NET.presT = 0; }); }
    const type = await a.evaluate(() => { const t = Object.keys(MOB).find(k => !MOB[k].boss && SHEETS[k]); S.pet = t; NET.presT = 0; return t; });
    await b.waitForFunction(t => [...NET.ghosts.values()].some(g => g.cp && g.cp.type === t), type, { timeout: 20000 });
    const drawn = await b.evaluate(async t => { let n = 0; const _d = SPR.draw; SPR.draw = function(g, sh){ if (sh === SHEETS[t]) n++; return _d.apply(this, arguments); }; await new Promise(r => setTimeout(r, 600)); SPR.draw = _d; return n; }, type);
    assert.ok(drawn > 0, 'the other player draws the pet');
    await a.evaluate(() => { S.pet = null; NET.presT = 0; });
    await b.waitForFunction(() => [...NET.ghosts.values()].every(g => !g.cp), null, { timeout: 20000 });
  } finally { await close(); }
  assert.deepStrictEqual(players.flatMap(p => p.errors), [], 'no runtime errors');
});
