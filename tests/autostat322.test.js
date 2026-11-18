/* VAYRATHEN — tests/autostat322.test.js — (v322) Auto spends stat points only when its switch is on and only while it runs */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('Auto spends stat points when asked', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Newbie', 'newbie');
    const r = await page.evaluate(async () => { const o = {}; loadMap(FIELDS306.id); botSet(); const step = n => { for (let i = 0; i < n; i++) advance(.05, false); };
      o.defOff = !S.bot.autoStat; S.statPts = 40; setBot(true); step(60); o.offLeft = S.statPts;
      S.bot.autoStat = true; step(60); o.onLeft = S.statPts; o.stats = {...S.stats};
      setBot(false); S.statPts = 30; step(60); o.stoppedLeft = S.statPts; S.bot.autoStat = false;
      o.ui = (() => { openWin('auto'); const ok = !!document.querySelector('[data-aset="autoStat"]'); return ok; })();
      return o; });
    assert.ok(r.defOff, 'off by default'); assert.ok(r.offLeft >= 40, 'switch off: nothing spent: ' + r.offLeft);
    assert.ok(r.onLeft < 6, 'switch on with Auto running: points spent (' + r.onLeft + ' left)');
    assert.ok(r.stats.str > 1 && r.stats.vit > 1, 'on the class main stats: ' + JSON.stringify(r.stats));
    assert.ok(r.stoppedLeft >= 30, 'Auto off: nothing spent (a level-up may add points): ' + r.stoppedLeft); assert.ok(r.ui, 'the switch is in the Auto settings');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
