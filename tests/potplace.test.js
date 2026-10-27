/* VAYRATHEN — tests/potplace.test.js — (v146) the potions always end in the same neat spot: a column just left of the skill
   wheel, level with the dodge button, clear of every other button — on several screens and after re-layouts */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

for (const [W, H] of [[844, 390], [915, 412], [1024, 600]]){
  test(`potions ${W}×${H}`, { skip, timeout: 120000 }, async () => {
    const { page, errors, close } = await openGame({ width:W, height:H, ctx:{ isMobile:true, hasTouch:true, deviceScaleFactor:2 } });
    try {
      await enterWorld(page, 'Pp');
      const r = await page.evaluate(async () => { const c = el('confirm'); if (c) c.hidden = true; SETTINGS.control = 'joy'; applyControlMode(); S.inv[bestHp()] = 50; S.inv[bestSp()] = 40; renderMoba();
        const at = () => { const p = el('mobaPot').getBoundingClientRect(); return [Math.round(p.left), Math.round(p.top), Math.round(p.width), Math.round(p.height)]; };
        await new Promise(r => setTimeout(r, 600)); const a = at(); const snap = () => { const roll = document.querySelector('#mobaAct .mo.roll'); const rr = roll.getBoundingClientRect(); return [Math.round(rr.left), Math.round(rr.bottom), Math.round(Math.min(...[...document.querySelectorAll('#mobaAct .mo')].filter(e => e.offsetWidth).map(e => e.getBoundingClientRect().left)))]; }; const sa = snap();
        renderMoba(); heApply(); layoutHud(); await new Promise(r => setTimeout(r, 400)); const b = at(); const sb = snap(); window.__dbg = [sa, sb];
        const p = el('mobaPot').getBoundingClientRect(), roll = document.querySelector('#mobaAct .mo.roll'), rr = roll && roll.getBoundingClientRect();
        const others = [...document.querySelectorAll('#mobaAct .mo, #mobaUtil .mu')].filter(e => e.offsetWidth).map(e => e.getBoundingClientRect());
        const hits = others.filter(o => o.left < p.right - 1 && o.right > p.left + 1 && o.top < p.bottom - 1 && o.bottom > p.top + 1).length;
        const left = Math.min(...[...document.querySelectorAll('#mobaAct .mo')].filter(e => e.offsetWidth).map(e => e.getBoundingClientRect().left));
        return {a, b, hits, besideWheel:p.right <= left + 1 && left - p.right < 30, dbg2:window.__dbg, dbg:[Math.round(p.right), Math.round(left), el('mobaPot').className, el('mobaPot').getAttribute('style')], level:rr ? Math.abs(p.bottom - rr.bottom) : 0}; });
      assert.deepStrictEqual(r.b, r.a, 'the same spot after laying out again ' + JSON.stringify(r.dbg2));
      assert.strictEqual(r.hits, 0, 'touches no other button');
      assert.ok(r.besideWheel, 'just left of the skill wheel ' + JSON.stringify(r.dbg));
    } finally { await close(); }
    assert.deepStrictEqual(errors, [], 'no runtime errors');
  });
}
