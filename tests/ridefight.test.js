/* VAYRATHEN — tests/ridefight.test.js — only the warrior line fights mounted */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
test('only Swordsman / Warlord keep riding when they attack', { skip, timeout: 60000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { const out = {};
      for (const job of ['blade', 'warlord', 'ranger', 'warden', 'rune', 'muay']){ S.job = job; if (job === 'warden') S.skills.mountedarcher = 3; derive(); out[job] = !!DER.pas.rideAtk; }
      S.job = 'novice'; derive(); return out; });
    assert.deepStrictEqual(r, {blade:true, warlord:true, ranger:false, warden:false, rune:false, muay:false});
    // Rapid Fire (the old Mounted Archery) is a buff that speeds up attacks
    const rf = await page.evaluate(() => new Promise(res => { S.job = 'warden'; S.lvl = 99; S.skills.mountedarcher = SKILLS.mountedarcher.max; derive(); const iv0 = DER.interval; S.sp = DER.maxsp; P.cds = {}; P.acd = 0; P.cast = null;
      trySkill('mountedarcher'); setTimeout(() => res({iv0, iv1:DER.interval, buff:!!P.buffs.mountedarcher, type:SKILLS.mountedarcher.type}), 1500); }));
    assert.strictEqual(rf.type, 'buff'); assert.ok(rf.buff, 'the buff is on');
    assert.ok(rf.iv1 < rf.iv0 * .85, `faster attacks (${rf.iv0} → ${rf.iv1} s)`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
