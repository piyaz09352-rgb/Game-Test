/* VAYRATHEN — tests/prices273.test.js — (v273) the owner's price list: coin-only goods take Vayra Coins and never Bia,
   the new Bia prices, 10,000 a bottle to cook or brew, the Swiftness Potion, and the Return Talisman retired. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('coin goods, new prices, swiftness potion, no talisman', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const p = await page.evaluate(() => ({ dg:ITEMS.drill_g.buy, di:ITEMS.drill_i.buy, cg:ITEMS.cardguard.buy, sz:ITEMS.sizepot.buy, gf:ITEMS.garudafeather.buy, rl:ITEMS.rf_luck.buy,
      fees:CK_RCP.every(r => r.fee === 10000 * r.n), tal:CK_RCP.some(r => r.out === 'talisman'), qp:GEAR.q_holy.pack, qz:GEAR.q_holy.buy, qf:GEAR.q_fire.buy }));
    assert.deepStrictEqual([p.dg, p.di, p.cg, p.sz, p.gf, p.rl], [1e6, 1e5, 1e5, 2e4, 1e5, 1e6], 'Bia prices');
    assert.ok(p.fees, 'every recipe costs 10,000 a bottle'); assert.ok(!p.tal, 'no talisman recipe');
    assert.strictEqual(p.qp, 500, 'coin arrows come 500 to a pack'); assert.ok(p.qz >= 1e12, 'holy arrows cannot be bought with Bia'); assert.ok(p.qf < 1e5, 'fire arrows still Bia');
    // the potion shop: coat rows show coins; buying one takes coins, not Bia
    const r = await page.evaluate(async () => { S.bia = 5e6; ACC.coins = 10; S.lvl = Math.max(S.lvl, 60);
      const n = NPCS.find(x => x.id === 'shop'); P.x = n.x; P.y = n.y + 30; P.tx = null; closeDialog(); openNpc(n);
      await new Promise(r => setTimeout(r, 150));
      const d = document.getElementById('dialog'), row = d.querySelector('.srow:has([data-qty="coat_fire"])'), pr = row && row.querySelector('.pr').textContent;
      const sw = !!d.querySelector('[data-qty="aspdpot"]'), b0 = S.bia, c0 = ACC.coins, have0 = S.inv.coat_fire || 0;
      d.querySelector('[data-cbuy="coat_fire"]').click(); await new Promise(r => setTimeout(r, 50));
      const out = { pr, sw, bia:S.bia - b0, coins:ACC.coins - c0, got:(S.inv.coat_fire || 0) - have0 };
      // too few coins: nothing happens
      ACC.coins = 1; closeDialog(); openNpc(n); await new Promise(r => setTimeout(r, 150));
      const btn = document.querySelector('#dialog [data-cbuy="coat_holy"]'); out.dis = btn.disabled;
      // the Swiftness Potion buys with Bia and adds 15% attack speed
      document.querySelector('#dialog .qty[data-qty="aspdpot"] .qn').value = 1; const z0 = S.bia; document.querySelector('#dialog [data-qbuy="aspdpot"]').click();
      out.swBia = z0 - S.bia; const a0 = DER.pas.aspdPct || 0; useItem('aspdpot'); out.aspd = +((DER.pas.aspdPct || 0) - a0).toFixed(3);
      closeDialog(); return out; });
    assert.match(r.pr, /◈\s*3/, 'the fire oil shows ◈ 3'); assert.ok(r.sw, 'the Swiftness Potion is sold');
    assert.deepStrictEqual([r.bia, r.coins, r.got], [0, -3, 1], 'a coin oil takes 3 coins and no Bia');
    assert.ok(r.dis, 'a holy oil cannot be bought with 1 coin'); assert.strictEqual(r.swBia, 20000); assert.strictEqual(r.aspd, .15);
    // talismans held are refunded; Auto walks to the shrine keeper to go home
    const t = await page.evaluate(async () => { S.inv.talisman = 4; const b0 = S.bia; await new Promise(r => setTimeout(r, 300)); return { gone:!S.inv.talisman, z:S.bia - b0 }; });
    assert.ok(t.gone); assert.strictEqual(t.z, 1000, '4 talismans refunded at 250');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
