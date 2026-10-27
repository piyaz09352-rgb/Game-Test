/* VAYRATHEN — tests/classstats.test.js — (v150) each class keeps its own stat placement; a new class starts over */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('stats per class', { skip, timeout: 90000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Cls');
    const r = await page.evaluate(() => {
      S.job = 'blade'; S.lvl = 50; S.stats = {str:40, agi:20, vit:10, int:1, dex:5, luk:1}; S.statPts = 7; derive();
      const tot0 = csTotal(), C = csData();
      C.have.rune = {job:'rune', jlvl:1, jexp:0, skills:{}, skPts:0, hot:null};          // freshly unlocked
      csGo('rune', 'blade'); const rune1 = {stats:{...S.stats}, pts:S.statPts};
      S.stats.int = 30; S.statPts = tot0 - csSpent(S.stats);                              // place some points as a mage
      S.lvl = 55; S.statPts += 20;                                                        // level up: 20 more points
      csGo('blade', 'rune'); const blade = {stats:{...S.stats}, pts:S.statPts};
      csGo('rune', 'blade'); const rune2 = {stats:{...S.stats}, pts:S.statPts};
      return {tot0, rune1, blade, rune2}; });
    assert.ok(Object.values(r.rune1.stats).every(v => v === 1) && r.rune1.pts === r.tot0, 'a new class: all stats 1, every point free');
    assert.strictEqual(r.blade.stats.str, 40, 'back to the blade: its stats as left');
    assert.strictEqual(r.blade.pts, 7 + 20, 'plus the points earned since, free');
    assert.strictEqual(r.rune2.stats.int, 30, 'back to the mage: its own placement');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
