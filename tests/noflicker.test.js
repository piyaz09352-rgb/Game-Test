/* VAYRATHEN — tests/noflicker.test.js — (v100) a window redrawn by a tap is recoloured for the bright theme before the
   frame is painted (nothing pale or dark for a moment), and the forge keeps its list of pieces when one is picked */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('forge: picking a piece does not blink', { skip, timeout: 120000 }, async () => {
  const { page, close } = await openGame({ width: 1280, height: 800 });
  try {
    await enterWorld(page, 'Smith');
    await page.evaluate(() => { for (const id of Object.keys(GEAR).filter(k => GEAR[k].slot === 'armor').slice(0, 8)) addItem(id, 1); RF.tab = 'refine'; openWin('forge'); });
    await page.waitForTimeout(2500);   // the first full pass
    const r = await page.evaluate(async () => {
      const pane = el('pane-forge'), tiles = pane.querySelectorAll('[data-rfsel]'), list0 = pane.querySelector('.rflist');
      const marks = () => pane.querySelectorAll('.slt,.sdk').length + [...pane.querySelectorAll('[style*="color"]')].length;
      tiles[tiles.length - 1].click(); await Promise.resolve();
      const before = marks(); srCheck(pane); const after = marks();
      return {n:tiles.length, kept:pane.querySelector('.rflist') === list0, before, after, on:pane.querySelector('[data-rfsel].on') === tiles[tiles.length - 1]};
    });
    assert.ok(r.n >= 2, `pieces listed: ${r.n}`);
    assert.ok(r.kept, 'the list of pieces is the same nodes after a pick');
    assert.ok(r.on, 'the picked piece is marked');
    assert.strictEqual(r.after, r.before, 'everything was recoloured before the frame was painted');
  } finally { await close(); }
});
