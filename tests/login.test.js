/* VAYRATHEN — tests/login.test.js — daily login card: one box a day, chests on day 7, the costume set on day 28, a new card after. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('login rewards: daily box, day 7 chest, day 28 costume, opens by itself', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.lvl = 10; if (typeof TUT !== 'undefined') TUT.on = false; LGN.t = 0; LGN.auto = false; });
    await page.waitForFunction(() => winOpen('login'), null, {timeout:15000}).catch(() => {});
    const r = await page.evaluate(() => { const out = {};
      out.auto = winOpen('login'); out.card = questTracker().includes('📅');
      ACC.login = {d:-1, n:0}; const z0 = S.bia; lgnClaim(); out.day1 = ACC.login.n === 1 && S.bia > z0;
      lgnClaim(); out.oncePerDay = ACC.login.n === 1;
      ACC.login = {d:-1, n:6}; const inv0 = Object.keys(S.inv).length; lgnClaim(); out.chest = Object.keys(S.inv).length > inv0;
      if (ACC.wardrobe){ delete ACC.wardrobe.c_login_gold; delete ACC.wardrobe.hc_login_gold; }
      ACC.login = {d:-1, n:27}; lgnClaim(); out.cos = cosOwned('c_login_gold') && cosOwned('hc_login_gold');
      ACC.login.d = -1; lgnState(); out.newCard = ACC.login.n === 0;
      reWin('login'); out.cells = document.querySelectorAll('#pane-login .lgnc').length;
      return out; });
    for (const k of ['auto', 'card', 'day1', 'oncePerDay', 'chest', 'cos', 'newCard']) assert.ok(r[k], k);
    assert.strictEqual(r.cells, 28);
    const ft = await page.evaluate(() => new Promise(res => { const t = []; let l = performance.now(), n = 0; const f = now => { t.push(now - l); l = now; if (++n < 60) requestAnimationFrame(f); else res(Math.max(...t.slice(5))); }; requestAnimationFrame(f); }));
    assert.ok(ft < 250, `no long frame (${ft.toFixed(0)} ms)`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
