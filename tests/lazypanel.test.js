/* VAYRATHEN — tests/lazypanel.test.js — (v113) picking things up does not redraw closed windows;
   opening a window shows it up to date */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('pickups skip closed bag/equipment/skill windows; they catch up on open', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const c = el('confirm'); if (c) c.hidden = true; loadMap(1); for (const w of Object.keys(UIS.open)) if (UIS.open[w]) closeWin(w);
      await new Promise(r => setTimeout(r, 300));
      let bagDraws = 0; const _bd = bagDraw; bagDraw = function(){ bagDraws++; return _bd.apply(this, arguments); };
      const id = Object.keys(ITEMS).find(k => ITEMS[k].kind === 'etc' && !S.inv[k]);
      for (let i = 0; i < 4; i++){ LOOT.push({id, x:P.x, y:P.y, t:60}); pickLoot(LOOT[LOOT.length - 1]); await new Promise(r => setTimeout(r, 120)); }
      const closedDraws = bagDraws;
      openWin('bag'); await new Promise(r => setTimeout(r, 300));
      const shown = !!document.querySelector(`[data-bagsel="${id}"]`);
      bagDraw = _bd; return {closedDraws, shown, n:S.inv[id]};
    });
    assert.strictEqual(r.n, 4, 'all four were picked up');
    assert.strictEqual(r.closedDraws, 0, 'the closed bag was not redrawn on each pickup');
    assert.ok(r.shown, 'opening the bag shows the new item');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
