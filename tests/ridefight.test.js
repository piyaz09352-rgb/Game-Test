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
    // Rapid Fire (the old Mounted Archery) speeds up attacks. (v193 ranger193.js made it a passive: always on, no cast)
    const rf = await page.evaluate(() => { S.job = 'warden'; S.lvl = 99; S.skills.mountedarcher = 0; derive(); const iv0 = DER.interval;
      S.skills.mountedarcher = SKILLS.mountedarcher.max; derive(); const iv1 = DER.interval; S.job = 'novice'; derive(); return {iv0, iv1, type:SKILLS.mountedarcher.type}; });
    assert.strictEqual(rf.type, 'passive');
    assert.ok(rf.iv1 < rf.iv0, `faster attacks with it (${rf.iv0} → ${rf.iv1} s)`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
