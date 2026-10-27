/* VAYRATHEN — tests/dialog.test.js — the NPC conversation window: opens centred, sized to the screen,
   can be dragged by its header and resized from its corner, and re-opens in the centre. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

const box = page => page.evaluate(() => { const r = document.getElementById('dialog').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2, vw: innerWidth, vh: innerHeight }; });
const talk = page => page.evaluate(() => { closeDialog(); openNpc(NPCS.find(n => n.id === 'aunt') || NPCS[0]); });

for (const [w, h] of [[1280, 720], [1920, 1080], [844, 390]]){
  test(`NPC window at ${w}×${h}: centred, draggable, resizable`, { skip, timeout: 180000 }, async () => {
    const { page, errors, close } = await openGame({ width: w, height: h });
    try {
      await enterWorld(page);
      await talk(page); await page.waitForTimeout(500);
      let b = await box(page);
      assert.ok(Math.abs(b.cx - b.vw / 2) < 4, `centred across: ${JSON.stringify(b)}`);
      assert.ok(Math.abs(b.cy - b.vh / 2) < 12 || b.y <= 10, `centred down (or as high as fits): ${JSON.stringify(b)}`);
      assert.ok(b.w <= b.vw && b.h <= b.vh, 'fits on screen');
      if (w >= 1280) assert.ok(b.w > b.vw * .35 && b.w < b.vw * .6, `scales with the screen: ${b.w} of ${b.vw}`);

      // drag by the header (not on the close button)
      const hd = await page.$('#dialog .dn');
      const hb = await hd.boundingBox();
      await page.mouse.move(hb.x + 10, hb.y + 10); await page.mouse.down();
      await page.mouse.move(hb.x - 60, hb.y + 30, { steps: 5 }); await page.mouse.up();
      const moved = await box(page);
      assert.ok(Math.abs(moved.x - (b.x - 70)) < 3 || moved.x <= 1, `moved left: ${b.x} → ${moved.x}`);
      assert.ok(Math.abs(moved.y - (b.y + 20)) < 3 || moved.y + moved.h >= moved.vh - 9, `moved down: ${b.y} → ${moved.y}`);
      assert.ok(!(await page.evaluate(() => document.getElementById('dialog').hidden)), 'still open after dragging');

      // resize from the corner grip
      const gb = await (await page.$('#dialog .dlg-grip')).boundingBox();
      await page.mouse.move(gb.x + 10, gb.y + 10); await page.mouse.down();
      await page.mouse.move(gb.x - 40, gb.y - 30, { steps: 5 }); await page.mouse.up();
      const sized = await box(page);
      assert.ok(sized.w < moved.w - 30 || sized.w <= 281, `narrower: ${moved.w} → ${sized.w}`);

      // re-open: back in the middle, remembered size
      await page.evaluate(() => closeDialog()); await talk(page); await page.waitForTimeout(500);
      b = await box(page);
      assert.ok(Math.abs(b.cx - b.vw / 2) < 4, `re-opens centred: ${JSON.stringify(b)}`);
      assert.ok(Math.abs(b.w - sized.w) < 3, `keeps the picked size: ${sized.w} → ${b.w}`);
    } finally { await close(); }
    assert.deepStrictEqual(errors, [], 'no runtime errors');
  });
}
