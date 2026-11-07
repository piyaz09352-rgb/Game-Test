/* VAYRATHEN — tests/phi247.test.js — (v247) golden windows fit their content: no tab or text runs past a window's
   edge, upright windows are height = width × φ, wide ones (wiki, skill…) width = height × φ, on PC and phone */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

for (const [w, h, phone] of [[1920, 1080, false], [844, 390, true]]){
  test(`golden windows fit at ${w}×${h}`, { skip, timeout: 240000 }, async () => {
    const { page, errors, close } = await openGame({ width: w, height: h, ctx: phone ? { isMobile: true, hasTouch: true } : {} });
    try {
      await enterWorld(page);
      for (const id of ['stat', 'skill', 'wiki', 'book', 'ach', 'quest']){
        const r = await page.evaluate(async id => {
          for (const o of document.querySelectorAll('#ui > section.win')) o.hidden = true;
          for (const k in UIS.open) delete UIS.open[k];
          openWin(id); await new Promise(r => setTimeout(r, 700));
          const W = document.getElementById('win-' + id), wr = W.getBoundingClientRect(), out = [];
          for (const e of W.querySelectorAll('*')){ if (e.children.length || !(e.textContent || '').trim()) continue; const r = e.getBoundingClientRect();
            if (r.width && (r.right > wr.right + 2 || r.left < wr.left - 2)) out.push(e.textContent.trim().slice(0, 16)); }
          return { ratio: wr.height / wr.width, out, fits: wr.left >= -1 && wr.top >= -1 && wr.right <= innerWidth + 1 && wr.bottom <= innerHeight + 1 };
        }, id);
        assert.deepStrictEqual(r.out, [], `${id}: text past the window edge`);
        assert.ok(r.fits, `${id}: window on screen`);
        assert.ok(Math.abs(r.ratio - 1.618) < .02 || Math.abs(r.ratio - .618) < .02, `${id}: golden (${r.ratio.toFixed(3)})`);
      }
      assert.deepStrictEqual(errors, []);
    } finally { await close(); }
  });
}
