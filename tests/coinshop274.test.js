/* VAYRATHEN — tests/coinshop274.test.js — (v274) the Vayra Coin shop: a button beside the minimap opens it, every
   fashion piece has a coin price in ◈30–300, the free trial is over (an unbought piece cannot be worn), buying takes
   coins, the item and robot tabs sell, the top-up page is shown but closed; the tower is fuller and tougher. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('coin shop: button, prices, no free trial, buying, tabs, top-up closed; tower counts', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame({ width: 1366, height: 768 });
  try {
    await enterWorld(page);
    await page.waitForFunction(() => { const b = document.getElementById('cshBtn'); return b && !b.hidden; }, null, { timeout: 10000 });
    const pr = await page.evaluate(() => { const p = CSH_FASH().map(id => cshDef(id)).filter(d => d.src !== 'free' && d.src !== 'event' && d.src !== 'tower').map(d => d.price && d.price.c);
      return {all:p.every(c => c >= 30 && c <= 300), n:p.length, trial:COS_TRIAL.on}; });
    assert.ok(pr.all && pr.n > 200, 'every fashion piece has a coin price in 30–300'); assert.ok(!pr.trial, 'no free trial');
    // an unbought piece cannot be worn; the strip takes off what is not owned
    const tr = await page.evaluate(() => { const id = Object.keys(WINGS).find(k => !cosHave(k)); S.cos = S.cos || {}; S.cos.wing = id; cshStrip(); return {id, usable:cosUsable(id), worn:S.cos.wing}; });
    assert.ok(!tr.usable, 'not usable before buying'); assert.ok(!tr.worn, 'taken off');
    // open from the button, buy a piece
    await page.click('#cshBtn'); await page.waitForSelector('#pane-cshop .cshit');
    const buy = await page.evaluate(id => { ACC.coins = 1000; window.sysPrompt = (q, yes) => yes(); const c = cshDef(id).price.c; reWin('cshop');
      const b = document.querySelector(`[data-cshfash="${id}"]`); b.click(); return {c, coins:ACC.coins, have:cosHave(id)}; }, tr.id);
    assert.ok(buy.have, 'bought'); assert.strictEqual(buy.coins, 1000 - buy.c, 'paid in coins');
    // the other tabs
    const tabs = await page.evaluate(() => { const out = {};
      for (const t of ['item', 'bot', 'svc', 'topup']){ document.querySelector(`[data-cshtab="${t}"]`).click(); out[t] = document.querySelectorAll('#pane-cshop .cshit').length; }
      out.closed = [...document.querySelectorAll('#pane-cshop .pack button')].every(b => b.disabled);
      document.querySelector('[data-cshtab="item"]').click(); const c0 = ACC.coins, h0 = S.inv.coat_fire || 0; document.querySelector('[data-cshitem="coat_fire"][data-n="1"]').click();
      out.itemBuy = [c0 - ACC.coins, (S.inv.coat_fire || 0) - h0];
      document.querySelector('[data-cshtab="bot"]').click(); document.querySelector('[data-rentpet="nexa"][data-rt="0"]').click(); out.botRent = S.helper && S.helper.k;
      return out; });
    assert.ok(tabs.item >= 10 && tabs.bot === 9 && tabs.svc === 2 && tabs.topup === 6, 'every tab lists its goods ' + JSON.stringify(tabs));
    assert.ok(tabs.closed, 'top-up is not open yet'); assert.deepStrictEqual(tabs.itemBuy, [3, 1], 'an oil for 3 coins'); assert.strictEqual(tabs.botRent, 'nexa', 'a robot rented from the shop');
    // the tower: 12 monsters on floor 1, 20 from floor 81, guardians far tougher than their guards
    const tw = await page.evaluate(() => ({c1:twCount(1), c50:twCount(50), c81:twCount(81), g:TW_GUARDS, h:TW_HARD}));
    assert.deepStrictEqual([tw.c1, tw.c81, tw.g], [12, 20, 6]); assert.ok(tw.c50 > 12 && tw.c50 < 20);
    assert.deepStrictEqual(tw.h, {hp:2, atk:1.5, bhp:5, batk:2.5});
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
