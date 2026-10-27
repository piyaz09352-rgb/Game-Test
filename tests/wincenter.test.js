/* VAYRATHEN — tests/wincenter.test.js — the Auto window opens in the middle of the screen */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
for (const [w, h] of [[1280, 720], [915, 412]]) test(`Auto window is centred at ${w}×${h} (even with an old saved spot)`, { skip, timeout: 60000 }, async () => {
  const { page, errors, close } = await openGame({ width: w, height: h });
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { UIS.pos.auto = [5, 5]; openWin('bag'); openWin('auto'); const b = el('win-auto').getBoundingClientRect(), s = el('ui').getBoundingClientRect();
      return {dx:Math.abs((b.left + b.width / 2) - (s.left + s.width / 2)), dy:Math.abs((b.top + b.height / 2) - (s.top + s.height / 2))}; });
    assert.ok(r.dx <= 3 && r.dy <= 3, 'centred: ' + JSON.stringify(r));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
