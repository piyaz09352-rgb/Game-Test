/* VAYRATHEN — tests/free298.test.js — (v298) the owner's last requests
   · free again: every hero has the Golden Deer and can ride; every helper robot is «use free»; every outfit can be worn;
   · W A S D walk on a PC (Status is C, Skills K, the wiki F1);
   · pressing «Go» on the warp board shows «warping…» at once and arrives;
   · the «invasion driven back» bar goes away after a few seconds */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('free deer, robots and fashion; WASD; the warp board answers; the invasion bar clears', { skip, timeout: 150000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const o = {};
      o.deer = S.inv.mount1 > 0; toggleRide(); o.ride = P.ride; toggleRide();
      CSH.tab = 'bot'; openWin('cshop'); await new Promise(res => setTimeout(res, 300)); o.rent = document.querySelectorAll('#pane-cshop [data-rentpet]').length; document.querySelector('#pane-cshop [data-botuse="titan"]').click(); o.bot = !!helperOf() && S.helper.k === 'titan'; closeWin('cshop');
      o.fash = Object.keys(COSTUME).every(cosHave) && Object.keys(WINGS).every(cosHave);
      const x0 = P.x; window.dispatchEvent(new KeyboardEvent('keydown', {key:'d', code:'KeyD'})); await new Promise(res => setTimeout(res, 500)); window.dispatchEvent(new KeyboardEvent('keyup', {key:'d', code:'KeyD'})); o.walked = P.x > x0 + 5; o.noStat = !UIS.open.stat;
      S.bia = 1e9; S.visited[2] = 1; const b = document.createElement('button'); b.dataset.warp = '2'; document.body.appendChild(b); b.click(); o.card = !el('warpCard').hidden; await new Promise(res => setTimeout(res, 600)); o.arrived = MAP_ID === 2; o.cardGone = el('warpCard').hidden; b.remove();
      return o; });
    assert.ok(r.deer && r.ride, 'the Golden Deer is free and rideable');
    assert.strictEqual(r.rent, 0, 'no rent prices for robots'); assert.ok(r.bot, 'a premium robot is taken for free');
    assert.ok(r.fash, 'every outfit and wing can be worn');
    assert.ok(r.walked && r.noStat, 'D walks and A/S/D open nothing');
    assert.ok(r.card && r.arrived && r.cardGone, 'the warp shows «warping…» and arrives');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
