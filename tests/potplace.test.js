/* VAYRATHEN — tests/potplace.test.js — (v146) the potions always end in the same neat spot, clear of every other button,
   on several screens and after re-layouts. (v283) The spot itself moved: v244/v252 put them in the bottom row beside
   the joystick, and the dodge button the old test measured from left in v279. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

for (const [W, H] of [[844, 390], [915, 412], [1024, 600]]){
  test(`potions ${W}×${H}`, { skip, timeout: 120000 }, async () => {
    const { page, errors, close } = await openGame({ width:W, height:H, ctx:{ isMobile:true, hasTouch:true, deviceScaleFactor:2 } });
    try {
      await enterWorld(page, 'Pp');
      // (v283) since v244/v252 the potions sit in the bottom row beside the joystick (after the chat button), and the dodge
      // button left in v279: the spot must not move when the HUD lays out again, touch no other button and stay on screen
      const r = await page.evaluate(async () => { const c = el('confirm'); if (c) c.hidden = true; SETTINGS.control = 'joy'; applyControlMode(); S.inv[bestHp()] = 50; S.inv[bestSp()] = 40; renderMoba();
        // the pot buttons themselves: their group frame spans the screen since v244 (it only places them)
        const potR = () => [...el('mobaPot').querySelectorAll('.mo.pot')].filter(e => e.offsetWidth).map(e => e.getBoundingClientRect());
        const at = () => potR().map(p => [Math.round(p.left), Math.round(p.top), Math.round(p.width), Math.round(p.height)]);
        await new Promise(r => setTimeout(r, 600)); const a = at();
        renderMoba(); heApply(); layoutHud(); await new Promise(r => setTimeout(r, 400)); const b = at();
        const ps = potR(), pots = ps.length;
        const others = [...document.querySelectorAll('#mobaAct .mo, #mobaUtil .mu, button')].filter(e => e.offsetWidth && !el('mobaPot').contains(e) && !e.closest('.win,#dialog,#ui > .card') && getComputedStyle(e).visibility !== 'hidden').map(e => e.getBoundingClientRect());
        const hits = ps.reduce((n, p) => n + others.filter(o => o.left < p.right - 1 && o.right > p.left + 1 && o.top < p.bottom - 1 && o.bottom > p.top + 1).length, 0);
        return {a, b, hits, pots, onScreen:ps.every(p => p.left >= 0 && p.top >= 0 && p.right <= innerWidth + 1 && p.bottom <= innerHeight + 1)}; });
      assert.deepStrictEqual(r.b, r.a, 'the same spot after laying out again');
      assert.strictEqual(r.pots, 2, 'both potions show');
      assert.strictEqual(r.hits, 0, 'touches no other button');
      assert.ok(r.onScreen, 'all on screen');
    } finally { await close(); }
    assert.deepStrictEqual(errors, [], 'no runtime errors');
  });
}
