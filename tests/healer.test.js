/* VAYRATHEN — tests/healer.test.js — หมออ้อน in Aren heals and blesses for free */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
test('Doctor Oon fills HP and SP and gives her blessing', { skip, timeout: 60000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { const n = NPCS.find(x => x.id === 'healer_oon'); P.x = n.x - 40; P.y = n.y + 30; S.hp = 5; S.sp = 1; openNpc(n);
      return {hp:S.hp === DER.maxhp, sp:S.sp === DER.maxsp, t:P.buffs.oon && P.buffs.oon.t, atk:buffSum('atkPct')}; });
    await page.waitForTimeout(200);
    r.closed = await page.evaluate(() => document.getElementById('dialog').hidden);
    assert.deepStrictEqual(r, {hp:true, sp:true, t:600, atk:.05, closed:true}, 'healed, blessed, and no window left open');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
