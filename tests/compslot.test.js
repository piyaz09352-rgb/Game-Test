/* VAYRATHEN — tests/compslot.test.js — caught pet, rented helper and costume pet never stand on each other or on you. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('companions keep their own spots, standing and walking', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.lvl = 30; closeDialog && closeDialog(); loadMap(0);
      S.pet = Object.keys(MOB).find(k => !MOB[k].boss && MOB[k].lvl >= 20 && MOB[k].lvl <= 40); S.petd = null; petEnsure();
      S.helper = {k:Object.keys(HELPERS)[0], left:600}; derive();
      PET.x = HLP.x = P.x; PET.y = HLP.y = P.y; HLP.map = MAP_ID; HLP.tgt = null; P.target = null; });
    const gap = () => page.evaluate(() => ({pp:Math.hypot(PET.x - HLP.x, PET.y - HLP.y), pP:Math.hypot(PET.x - P.x, PET.y - P.y), hP:Math.hypot(HLP.x - P.x, HLP.y - P.y)}));
    await page.waitForTimeout(3000);
    const still = await gap();
    assert.ok(still.pp > 30, 'pet and helper apart while standing: ' + JSON.stringify(still));
    assert.ok(still.pP > 26 && still.hP > 26, 'both off the hero: ' + JSON.stringify(still));
    await page.evaluate(() => { P.dir = 2; window._wk = setInterval(() => { P.x += 4; P.moving = true; }, 16); });
    await page.waitForTimeout(1500);
    const walk = await gap();
    await page.evaluate(() => clearInterval(window._wk));
    assert.ok(walk.pp > 28, 'apart while walking: ' + JSON.stringify(walk));
    assert.deepStrictEqual(errors, []);
  } finally { await close(); }
});
