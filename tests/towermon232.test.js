/* VAYRATHEN — tests/towermon232.test.js — (v232) the 100-floor Tower monument in Aren: it stands on clear ground,
   a tap on its shaft walks you over and opens the tower window, and the tower button is gone from the menu rail. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('tower monument: in Aren, tap the spire, the tower window opens; no menu button', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width: 1366, height: 768 });
  try {
    await enterWorld(page);
    await page.waitForTimeout(1200);
    const pre = await page.evaluate(() => { document.querySelectorAll('.win').forEach(x => { if (!x.hidden) closeWin(x.id.replace('win-', '')); }); closeDialog();
      S.tut = {done:true, i:99}; loadMap(0); const m = NPCS.find(n => n.id === 'tw_monument'); P.x = m.x + 150; P.y = m.y + 60; for (let i = 0; i < 6; i++) advance(.05, true);
      const r = cv.getBoundingClientRect(); return {ok:!!m && walkable(m.x, m.y + 30, 12) && walkable(m.x, m.y + 16, 4), rail:document.querySelectorAll('.mb[data-win="tower"]').length, x:r.left + (m.x - cam.x) / VW * r.width, y:r.top + (m.y - 75 - cam.y) / VH * r.height}; });
    await page.mouse.click(pre.x, pre.y);
    const r = await page.evaluate(() => { for (let i = 0; i < 160 && !winOpen('tower'); i++) advance(.05, true); return {open:!!winOpen('tower')}; });
    assert.ok(pre.ok, 'the monument stands in Aren on ground you can walk up to');
    assert.strictEqual(pre.rail, 0, 'the tower button is gone from the menu rail');
    assert.ok(r.open, 'a tap on the spire walks you over and opens the tower window');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
