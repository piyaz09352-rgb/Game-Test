/* VAYRATHEN — tests/inspect.test.js — (v125) the look inspector and the smoothness meter */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('inspector shows each monster in each move; meter shows FPS', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const c = el('confirm'); if (c) c.hidden = true;
      openWin('settings'); await new Promise(r => setTimeout(r, 300)); const inSettings = !!el('set-fpsm') && !!document.querySelector('[data-insopen]');
      el('set-fpsm').checked = true; el('set-fpsm').dispatchEvent(new Event('change', {bubbles:true})); closeWin('settings');
      const before = mobs.length; INS.f = 'boss'; openWin('inspect'); await new Promise(r => setTimeout(r, 500));
      const pics = []; for (const a of ['idle', 'attack']){ INS.act = a; reWin('inspect'); await new Promise(r => setTimeout(r, 450)); pics.push(el('insCv').toDataURL()); }
      INS.f = 'real'; reWin('inspect'); const real = insList().length;
      await new Promise(r => setTimeout(r, 1200));
      return {inSettings, bosses:(INS.f = 'boss', insList().length), real, drawn:pics[0].length > 5000, spawned:mobs.length - before, meter:(el('fpsMeter') || {}).textContent || ''}; });
    assert.ok(r.inSettings, 'both are in Settings');
    assert.ok(r.bosses >= 15 && r.real >= 50, `lists: ${r.bosses} bosses, ${r.real} real animals`);
    assert.ok(r.drawn, 'the stage draws the monster');
    assert.strictEqual(r.spawned, 0, 'nothing is spawned in the world');
    assert.ok(/\d+ FPS/.test(r.meter), `the meter shows FPS (${r.meter})`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
