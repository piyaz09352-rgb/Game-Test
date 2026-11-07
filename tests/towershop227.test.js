/* VAYRATHEN — tests/towershop227.test.js — (v227) tower tokens from cleared floors, the tower shop in the tower window,
   and the milestone pieces (floor 50 crown, floor 100 dais mount, floor 150 wings) that cannot be bought. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('tower shop: tokens, buying, milestone pieces', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const o = {}, adv = n => { for (let i = 0; i < n; i++){ advance(.05, false); if (!P.dead) S.hp = DER.maxhp; } };
      S.tut = {done:true, i:99}; S.lvl = 200; derive(); loadMap(0); const t0 = twsTok().tok;
      twStart(1); adv(70); for (const m of mobs) if (m.dg) m.dead = true; adv(4); o.tok1 = twsTok().tok - t0;   // floor 1 → 1 token
      twQuit('leave'); adv(10);
      openWin('tower'); o.shop = document.querySelectorAll('#pane-tower .twshop .twsr').length; o.buyOff = !!document.querySelector('#pane-tower [data-twsbuy="tws_crown"][disabled]');
      twsTok().tok = 1000; reWin('tower'); document.querySelector('#pane-tower [data-twsbuy="tws_crown"]').click();
      o.crown = twsHave('tws_crown') && twsTok().tok === 850; o.notSold = !COSTUME.tws_crown.price && !COSTUME.tws_night.price;
      document.querySelector('#pane-tower [data-twsbuy="whitepot"]').click(); o.pots = (S.inv.whitepot || 0) >= 10;
      twSt().best = 100; twsMilestones(); o.mile = twsHave('tws_night') && twsHave('tws_dais') && !twsHave('tws_heaven');
      closeWin('tower'); return o;
    });
    assert.strictEqual(r.tok1, 1, 'clearing floor 1 gives a tower token');
    assert.ok(r.shop >= 8 && r.buyOff, 'the tower window lists the shop and milestones; too few tokens = cannot buy');
    assert.ok(r.crown && r.notSold, 'the crown is bought with tokens and sold nowhere else');
    assert.ok(r.pots, 'potions from the tower shop');
    assert.ok(r.mile, 'floor 50 and 100 pieces unlock at best floor 100, the floor 150 wings do not yet');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
