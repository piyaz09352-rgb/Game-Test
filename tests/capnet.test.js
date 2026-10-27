/* VAYRATHEN — tests/capnet.test.js — Boonma sells capture gear in four tiers; better gear means better grades */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('capture gear: bought from Boonma, lifts the grade a step, used up on a catch', { skip, timeout: 90000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { S.lvl = 80; S.bia = 1e6; derive(); const n = NPCS.find(x => x.id === 'beastkeeper'); P.x = n.x + 30; P.y = n.y + 10; openNpc(n);
      const rows = CAP_NETS.filter(c => document.querySelector(`#dialog [data-qbuy="${c.id}"]`)).length;
      document.querySelector('#dialog [data-qbuy="net4"]').click(); const have = S.inv.net4;
      const gr = use => { CAP_USE = use; const g = petRoll('hare').g; CAP_USE = null; return g; };
      const odds = {none:gr(null), rope:gr(CAP_NETS[0]), gold:gr(CAP_NETS[3]), again:gr(CAP_NETS[3])};
      closeDialog(); loadMap(1); S.pet = null; S.petd = null; const m = spawnMob('hare', P.x + 30, P.y, {zone:MAPZ}); m.hp = 1; P.target = m;
      const b = MOVES.capture.base; MOVES.capture.base = 1000; tryCapture(); resolveCapture(); MOVES.capture.base = b;
      return {rows, have, odds, pet:S.pet, left:S.inv.net4 || 0, base:MOVES.capture.base}; });
    assert.strictEqual(r.rows, 4, 'four tiers for sale');
    assert.strictEqual(r.have, 1, 'bought one');
    assert.ok(r.odds.gold === r.odds.none + 1 && r.odds.rope === r.odds.none && r.odds.again === r.odds.gold, `the golden lasso lifts the grade one step, every time (${JSON.stringify(r.odds)})`);
    assert.strictEqual(r.pet, 'hare', 'caught');
    assert.strictEqual(r.left, 0, 'the lasso was used up');
    assert.strictEqual(r.base, 45, 'the base catch chance is unchanged afterwards');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
