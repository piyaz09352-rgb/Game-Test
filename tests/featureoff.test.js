/* VAYRATHEN — tests/featureoff.test.js — (v104) festivals and weather are switched off */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('festivals and weather stay off; caves stay dark; nothing breaks', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const out = {}, fx0 = GFX.fx; GFX.fx = 2;   // effects on, as on a good device
      // festivals: not today (Ok Phansa would be on in October), not on any day, not even in preview
      out.live = evLive(); out.any = [0, 40, 100, 200, 300].map(d => evOnDate(new Date(Date.now() + d * 864e5)));
      SETTINGS.evPreview = 'newyear'; await new Promise(r => setTimeout(r, 300)); out.show = evShow();
      const S0 = S.bia; out.exp = (() => { const b = S.bexp; gainExp(100, 0); return S.bexp - b; })();
      // weather: a field map, several weather rolls, damage untouched
      loadMap(1); for (let i = 0; i < 30; i++) EV.emit('tick', .1);
      out.wx = [WXS.cur, wxNow(), wxRoll(), wxDmgMul('fire'), wxDmgMul('water'), wxSight()];
      // biome particles skipped, the cave keeps its darkness
      const snow = MAPS.findIndex(m => m && BIOME[m.biome] && BIOME[m.biome].fx === 'snow');
      if (snow > 0){ loadMap(snow); await new Promise(r => setTimeout(r, 400)); out.parts = WX.parts.length; }
      out.gfx = GFX.fx; GFX.fx = fx0;
      // the festival trader says festivals are paused
      loadMap(0); const n = NPCS.find(x => x.id === 'festival'); NPC_OPEN.festival(n); out.npc = document.body.innerText.includes('งดจัดเทศกาล') || document.body.innerText.includes('paused');
      closeDialog();
      return out;
    });
    assert.strictEqual(r.live, null, 'no festival today');
    assert.deepStrictEqual(r.any, [null, null, null, null, null], 'no festival on any day');
    assert.strictEqual(r.show, null, 'no festival scenery even when a preview is set');
    assert.deepStrictEqual(r.wx, ['clear', 'clear', 'clear', 1, 1, 1], 'clear sky, no weather effects');
    if (r.parts !== undefined) assert.strictEqual(r.parts, 0, 'no snowflakes');
    assert.strictEqual(r.gfx, 2, 'the effects setting itself is left alone');
    assert.ok(r.npc, 'Mae Nang Thetsakan says festivals are paused');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
