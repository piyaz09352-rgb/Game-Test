/* VAYRATHEN — tests/lazylayout.test.js — (v114) the HUD lays out only when something changed, and still follows changes */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('idle HUD does not lay out again and again; a change is followed quickly', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width:844, height:390, ctx:{ isMobile:true, hasTouch:true, deviceScaleFactor:3 } });
  try {
    await enterWorld(page, 'Lz');
    const r = await page.evaluate(async () => {
      const c = el('confirm'); if (c) c.hidden = true; SETTINGS.control = 'joy'; applyControlMode(); loadMap(1);
      await new Promise(r => setTimeout(r, 1500));
      let n = 0; const f = layoutHud; layoutHud = function(){ n++; return f.apply(this, arguments); };
      await new Promise(r => setTimeout(r, 6000)); const idle = n;
      // a change: Auto on (its chip joins the top row) → the layout runs again soon
      n = 0; BOT.on = true; if (typeof renderBotChip === 'function') renderBotChip();
      await new Promise(r => setTimeout(r, 900)); const after = n; BOT.on = false; layoutHud = f;
      return {idle, after};
    });
    assert.ok(r.idle <= 4, `idle: ${r.idle} layouts in 6 s (was ~35)`);
    assert.ok(r.after >= 1, 'a change is laid out');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
