/* VAYRATHEN — tests/featureoff.test.js — (v104) weather is switched off; (v213) festivals are back on */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('festivals run, weather stays off; caves stay dark; nothing breaks', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const out = {}, fx0 = GFX.fx; GFX.fx = 2;   // effects on, as on a good device
      // festivals: on the calendar again (Loy Krathong all November, Songkran in April, New Year), and the preview works
      out.any = ['2026-11-01', '2026-11-20', '2026-04-12', '2026-12-31', '2026-03-01'].map(d => evOnDate(new Date(d + 'T05:00:00Z')));
      out.show = evShow() === evLive();   // the world dresses for the festival that is on (the preview is GM-only: onlineclean.js)
      // weather: a field map, several weather rolls, damage untouched
      loadMap(1); for (let i = 0; i < 30; i++) EV.emit('tick', .1);
      out.wx = [WXS.cur, wxNow(), wxRoll(), wxDmgMul('fire'), wxDmgMul('water'), wxSight()];
      // biome particles skipped, the cave keeps its darkness
      const snow = MAPS.findIndex(m => m && BIOME[m.biome] && BIOME[m.biome].fx === 'snow');
      if (snow > 0){ loadMap(snow); await new Promise(r => setTimeout(r, 400)); out.parts = WX.parts.length; }
      out.gfx = GFX.fx; GFX.fx = fx0;
      // the festival trader opens her shop of limited costumes (no "festivals are paused")
      loadMap(0); const n = NPCS.find(x => x.id === 'festival'); NPC_OPEN.festival(n); const tx = el('dialog').innerText; out.npc = !tx.includes('งดจัดเทศกาล') && !!el('dialog').querySelector('[data-evbuy]');
      closeDialog();
      return out;
    });
    assert.deepStrictEqual(r.any, ['loykrathong', 'loykrathong', 'songkran', 'newyear', null], 'festivals follow the calendar again');
    assert.ok(r.show, 'the scenery follows the festival that is on');
    assert.deepStrictEqual(r.wx, ['clear', 'clear', 'clear', 1, 1, 1], 'clear sky, no weather effects');
    if (r.parts !== undefined) assert.strictEqual(r.parts, 0, 'no snowflakes');
    assert.strictEqual(r.gfx, 2, 'the effects setting itself is left alone');
    assert.ok(r.npc, 'Mae Nang Thetsakan trades festival costumes again');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
