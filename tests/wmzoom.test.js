/* VAYRATHEN — tests/wmzoom.test.js — (v124) the world map zooms by double-tap on a phone, markers spread apart */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('world map: double-tap zooms in, markers get further apart', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width:844, height:390, ctx:{ isMobile:true, hasTouch:true, deviceScaleFactor:3 } });
  try {
    await enterWorld(page, 'Wz');
    const gap = () => page.evaluate(() => { const m = [...document.querySelectorAll('#wmPic .wmk')].slice(0, 2).map(e => e.getBoundingClientRect()); return Math.hypot(m[0].left - m[1].left, m[0].top - m[1].top); });
    await page.evaluate(() => { const c = el('confirm'); if (c) c.hidden = true; WM.zl = 0; openWin('world'); });
    await page.waitForTimeout(700);
    const z0 = await page.evaluate(() => WM.zl || 0), g0 = await gap();
    const p = await page.evaluate(() => { const r = el('wmView').getBoundingClientRect(); const ms = [...document.querySelectorAll('#wmPic .wmk, #wmPic .wml, .wmzoom, .wmprog, .wmhere')].map(e => e.getBoundingClientRect()); for (let y = r.top + 15; y < r.bottom - 15; y += 12) for (let x = r.left + 15; x < r.right - 15; x += 12) if (!ms.some(b => x > b.left - 14 && x < b.right + 14 && y > b.top - 14 && y < b.bottom + 14)) return [x, y]; return [r.left + 20, r.top + 20]; });
    await page.touchscreen.tap(p[0], p[1]); await page.waitForTimeout(90); await page.touchscreen.tap(p[0], p[1]); await page.waitForTimeout(600);
    const z1 = await page.evaluate(() => WM.zl || 0), g1 = await gap();
    assert.strictEqual(z1, z0 + 1, 'a double tap zooms in one step');
    assert.ok(g1 > g0 * 1.2, `markers spread apart (${Math.round(g0)} → ${Math.round(g1)} px)`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
