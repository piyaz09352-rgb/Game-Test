/* VAYRATHEN — tests/wincenter.test.js — the Auto window opens in the middle of the screen */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
for (const [w, h] of [[1280, 720], [915, 412]]) test(`Auto window is centred at ${w}×${h} (even with an old saved spot)`, { skip, timeout: 60000 }, async () => {
  const { page, errors, close } = await openGame({ width: w, height: h });
  try {
    await enterWorld(page);
    // (v247) the golden-ratio sizing places a window a frame after it opens: wait for it to settle (up to 1.5 s)
    const r = await page.evaluate(async () => { UIS.pos.auto = [5, 5]; openWin('bag'); openWin('auto');
      const m = () => { const b = el('win-auto').getBoundingClientRect(), s = el('ui').getBoundingClientRect(); return {dx:Math.abs((b.left + b.width / 2) - (s.left + s.width / 2)), dy:Math.abs((b.top + b.height / 2) - (s.top + s.height / 2))}; };
      let o = m(); for (let i = 0; i < 15 && (o.dx > 3 || o.dy > 3); i++){ await new Promise(f => setTimeout(f, 100)); o = m(); } return o; });
    assert.ok(r.dx <= 3 && r.dy <= 3, 'centred: ' + JSON.stringify(r));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
