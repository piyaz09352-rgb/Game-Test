/* VAYRATHEN — tests/bagsell279.test.js — (v279) sell from the bag; riding needs a mount; robot mounts; no dodge roll */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('bag selling, the mount rule, robot mounts and no roll', { skip, timeout: 150000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Seller');
    const r = await page.evaluate(async () => {
      const o = {}, wait = ms => new Promise(f => setTimeout(f, ms)), yes = () => { const b = [...document.querySelectorAll('#confirm button')].find(x => /ขาย|ซื้อ|Sell|Buy/.test(x.textContent)); if (b) b.click(); };
      const c = el('confirm'); if (c) c.hidden = true;
      const etc = Object.keys(ITEMS).filter(k => ITEMS[k].kind === 'etc' && ITEMS[k].sell > 0).slice(0, 3);
      for (const k of etc) S.inv[k] = 4; BAG.tab = 'all'; openWin('bag'); renderBag(); await wait(300);
      // one piece from the strip
      let b0 = S.bia; BAG.sel = etc[0]; bagInfo(); document.querySelector('#bagInfo [data-bslsell]:not([data-all])').click(); await wait(100);
      o.one = S.inv[etc[0]] === 3 && S.bia === b0 + bslUnit(etc[0]);
      // sell mode: tick two kinds, sell them all
      b0 = S.bia; document.querySelector('[data-bslmode="1"]').click(); await wait(100);
      for (const k of etc.slice(1)) document.querySelector(`#bagGrid [data-bagsel="${k}"]`).click();
      o.ticked = BSL.sel.size === 2 && !!document.querySelector('#bagGrid .bslpick');
      document.querySelector('[data-bslgo]').click(); await wait(100); yes(); await wait(200);
      o.many = !S.inv[etc[1]] && !S.inv[etc[2]] && S.bia === b0 + etc.slice(1).reduce((a, k) => a + ITEMS[k].sell * 4, 0) && !BSL.on;
      // riding needs a mount
      delete S.inv.mount1; P.ride = false; toggleRide(); o.noRide = P.ride === false; P.ride = true; o.noForce = P.ride === false;
      S.bia = 150000; addItem('mount1', 1); toggleRide(); o.ride = P.ride === true && MOVES.ride.speed === 1.3; P.ride = false;
      // robot mounts are in the coin shop's list
      o.robots = ['rb_m_steed', 'rb_m_unicorn', 'rb_m_drake', 'rb_m_dragon', 'rb_m_phoenix'].every(id => XMOUNT[id] && XMOUNT[id].price.c > 0 && CSH_FASH().includes(id));
      // no roll
      const x0 = P.x; doRoll(); o.noRoll = !P.roll && !document.querySelector('[data-move="roll"]');
      return o; });
    for (const k of ['one', 'ticked', 'many', 'noRide', 'noForce', 'ride', 'robots', 'noRoll']) assert.ok(r[k], k + ' ' + JSON.stringify(r));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
