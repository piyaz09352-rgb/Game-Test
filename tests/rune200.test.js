/* VAYRATHEN — tests/rune200.test.js — (v200) the mage line rework: removed skills give their points back, chain
   lightning jumps, gravity drags monsters together, the deluge throws them out, Rising Fortune makes spells cheaper and
   Star Step blinks. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('mage: reworked line', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => loadMap(3)); await page.waitForTimeout(1000);
    const r = await page.evaluate(async () => {
      const out = {}, wait = s => new Promise(res => setTimeout(res, s * 1000));
      S.job = 'archsage'; S.lvl = 110; S.jlvl = 50; S.skPts = 0;
      S.skills = {thunder:10, gravity:10, starveil:10, starstep:10, deluge:10, frostsea:5, wrath:3}; derive();
      out.refund = S.skPts; out.gone = !('frostsea' in S.skills); out.astro = JOBS.astro.skills.length;
      let ms = []; const place = () => { ms = mobs.filter(m => !m.dead && !m.def.boss).slice(0, 5); ms.forEach((m, i) => { m.maxhp = m.hp = 1e7; m.x = P.x + 80 + i * 35; m.y = P.y + (i % 2 ? 30 : -30); m.aggro = false; m.st = {stop:999}; }); };
      place(); execSkill('thunder', 10, ms[0]); await wait(3); out.chain = ms.filter(m => m.hp < 1e7).length; out.chainDbg = ms.map(m => [Math.round(m.x - ms[0].x), Math.round(m.y - ms[0].y), m.hp < 1e7]);
      place(); const t = ms[2]; execSkill('gravity', 10, t); out.pulled = ms.every(m => Math.hypot(m.x - t.x, m.y - t.y) < 30);
      place(); P.channel = null; const c = ms[2]; execSkill('deluge', 10, c); await wait(3.5); out.pushed = ms.filter(m => m !== c && Math.hypot(m.x - c.x, m.y - c.y) > 120).length; P.channel = null;
      const sp0 = SKILLS.meteor.sp(10); execSkill('starveil', 10, null); out.cheaper = SKILLS.meteor.sp(10) < sp0;
      const x0 = P.x; P.dir = 6; execSkill('starstep', 10, null); out.blink = Math.abs(P.x - x0);
      return out;
    });
    assert.ok(r.refund >= 8 && r.gone, 'removed skills give their points back');
    assert.strictEqual(r.astro, 6, 'astrologer: 6 skills');
    assert.ok(r.chain >= 4, 'chain lightning jumps on to more monsters ' + JSON.stringify(r.chainDbg));
    assert.ok(r.pulled, 'gravity drags the monsters into the middle');
    assert.ok(r.pushed >= 3, 'the deluge throws monsters out of the circle');
    assert.ok(r.cheaper, 'Rising Fortune makes spells cheaper');
    assert.ok(r.blink > 100, 'Star Step blinks');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
