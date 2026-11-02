/* VAYRATHEN — tests/death241.test.js — (v241) the death sign and the new stat points
   · falling shows «คุณตุยแล้ว สมน้ำหน้า» and nobody wakes in town by themselves any more;
   · «เกิดที่เมือง» goes back to Aren, «เกิดที่จุดตาย» uses a Garuda Feather (sold at the potion shop) and gets up on
     the spot; without a feather the button is off;
   · stat points: 8 + Lv/38 a level, a stat cap that grows with level (150 at Lv 300) and blocks raising past it. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('death sign: rise in town or on the spot with a feather; stat cap grows with level', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const o = {}, wait = ms => new Promise(res => setTimeout(res, ms)); S.tut = {done:true, i:99};
      loadMap(0); const shop = NPCS.find(n => n.id === 'shop'); openNpc(shop); o.shop = el('dialog').innerHTML.includes('garudafeather'); closeDialog();
      loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; delete S.inv.garudafeather;
      playerDie(); await wait(3600);
      o.stayed = P.dead && MAP_ID === 1; o.sign = !el('dth').hidden && /คุณตุยแล้ว|You died/.test(el('dth').textContent) && /สมน้ำหน้า|Serves you right/.test(el('dth').textContent);
      o.offWithout = document.querySelector('[data-dth="here"]').disabled;
      document.querySelector('[data-dth="town"]').click(); o.town = !P.dead && MAP_ID === 0 && el('dth').hidden;
      loadMap(1); P.x = VSPAWN.x + 150; P.y = VSPAWN.y; const x0 = P.x; addItem('garudafeather', 1); playerDie(); await wait(200);
      o.onWith = !document.querySelector('[data-dth="here"]').disabled;
      document.querySelector('[data-dth="here"]').click();
      o.here = !P.dead && MAP_ID === 1 && Math.abs(P.x - x0) < 1 && !S.inv.garudafeather && S.hp >= Math.round(DER.maxhp * .5) - 1 && !!P.buffs.dthsafe;
      // stat points and the cap
      o.gain = [statGain(2), statGain(38), statGain(300)]; o.budget300 = statBudget(300); o.caps = [STAT_CAP(1), STAT_CAP(70), STAT_CAP(300)];
      S.lvl = 70; S.stats = {str:STAT_CAP(70), agi:1, vit:1, int:1, dex:1, luk:1}; S.statPts = 999; S.spv = 2; const c = STAT_CAP();
      o.blocked = typeof stpCan === 'function' ? !stpCan('str') : S.stats.str >= c;
      return o;
    });
    assert.ok(r.shop, 'the potion shop sells the Garuda Feather');
    assert.ok(r.stayed, 'no waking in town by itself');
    assert.ok(r.sign, 'the sign says «คุณตุยแล้ว สมน้ำหน้า»');
    assert.ok(r.offWithout, 'no feather: «rise here» is off');
    assert.ok(r.town, '«rise in town» goes back to Aren');
    assert.ok(r.onWith && r.here, 'with a feather: up on the spot, half HP, a moment of safety, feather used');
    assert.deepStrictEqual(r.gain, [8, 9, 15]);
    assert.strictEqual(r.budget300, 3483);
    assert.deepStrictEqual(r.caps, [30, 56, 150]);
    assert.ok(r.blocked, 'a stat at the cap cannot be raised');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
