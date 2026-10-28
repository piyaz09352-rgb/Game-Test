/* VAYRATHEN — tests/skbonus.test.js — every class line has enough Skill Points to max all its skills. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('skill points: the novice can max its skills; tiers 2–4 have to choose (v161)', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { const out = {short:[]};
      for (const leaf of Object.keys(JOBS).filter(j => !(JOBS[j].next || []).length)){ let p = 0, n = 0;
        for (const j of jobChain(leaf)){ if (SK8[j]) continue; p += Math.max(0, JOBS[j].jobMax - 1) + skGap(j); n += skNeed(j); if (p < n) out.short.push(`${j} ${p}/${n}`); } }
      out.sk8 = Object.keys(SK8).every(j => skGap(j) === 0 && skNeed(j) > JOBS[j].jobMax - 1);
      S.job = 'rogue'; S.skb = {}; const p0 = S.skPts; skBonusSync(); out.got = S.skPts - p0; skBonusSync(); out.once = S.skPts - p0;
      return out; });
    assert.deepStrictEqual(r.short, [], 'no class is short of points');
    // (v161) the eight-skill tiers are meant to fall short of maxing everything: no top-up there
    assert.ok(r.sk8, 'tiers 2–4 get no bonus and cannot max all eight skills');
    assert.strictEqual(r.got, 0, 'Rogue gets no bonus'); assert.strictEqual(r.once, 0, 'and none later');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
