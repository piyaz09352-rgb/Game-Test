/* VAYRATHEN — tests/skbonus.test.js — every class line has enough Skill Points to max all its skills. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('skill points: every class can max every skill, bonus given once', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { const out = {short:[]};
      for (const leaf of Object.keys(JOBS).filter(j => !(JOBS[j].next || []).length)){ let p = 0, n = 0;
        for (const j of jobChain(leaf)){ p += Math.max(0, JOBS[j].jobMax - 1) + skGap(j); n += skNeed(j); if (p < n) out.short.push(`${j} ${p}/${n}`); } }
      S.job = 'rogue'; S.skb = {}; const p0 = S.skPts; skBonusSync(); out.got = S.skPts - p0; skBonusSync(); out.once = S.skPts - p0;
      return out; });
    assert.deepStrictEqual(r.short, [], 'no class is short of points');
    assert.strictEqual(r.got, 6, 'Rogue gets its 6 missing points'); assert.strictEqual(r.once, 6, 'only once');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
