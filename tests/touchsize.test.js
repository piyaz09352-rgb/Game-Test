/* VAYRATHEN — tests/touchsize.test.js — (v113) phones: small icon buttons are easy to hit (a tap just beside one
   still lands on it) and keep their size on screen */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('touch: tap rings round small buttons; looks unchanged', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width:844, height:390, ctx:{ isMobile:true, hasTouch:true, deviceScaleFactor:3 } });
  try {
    await enterWorld(page, 'Ts');
    const r = await page.evaluate(async () => {
      const c = el('confirm'); if (c) c.hidden = true; SETTINGS.control = 'joy'; applyControlMode(); renderMoba();
      await new Promise(r => setTimeout(r, 1500)); tszZoom(); tszMark(); await new Promise(r => setTimeout(r, 100));
      const out = [];
      for (const sel of ['#goalCard .ibtn.fold', '#mmWorld', '.uitoggle']){
        const b = [...document.querySelectorAll(sel)].find(x => x.getClientRects().length); if (!b) continue;
        const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.bottom + 5, t = document.elementFromPoint(x, y);
        out.push({sel, w:Math.round(r.width), hit:!!t && (t === b || b.contains(t))}); }
      return out;
    });
    assert.ok(r.length >= 2, 'found the buttons');
    for (const b of r) assert.ok(b.hit, `a tap 5 px below ${b.sel} lands on it`);
    for (const b of r) assert.ok(b.w < 60, `${b.sel} keeps its size (${b.w} px)`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
