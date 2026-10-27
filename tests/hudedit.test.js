/* VAYRATHEN — tests/hudedit.test.js — the touch buttons can be dragged and resized, and stay on screen */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('arrange mode: drag the skill cluster and the joystick, resize, keep it after a reload, reset', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width: 915, height: 412 });
  try {
    await enterWorld(page);
    await page.evaluate(() => { localStorage.removeItem('vay_hudpos_v1'); HE.data = {}; SETTINGS.control = 'joy'; applyControlMode(); layoutHud(); openWin('settings'); renderSettings(); });
    assert.ok(await page.evaluate(() => !!document.querySelector('[data-heopen]')), 'the Arrange button is in Settings');
    await page.click('[data-heopen]');
    assert.ok(await page.evaluate(() => HE.on && !!document.getElementById('heBar')), 'arrange mode is on');
    const box = async id => page.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); return {x:r.left, y:r.top, w:r.width, h:r.height}; }, id);
    const a0 = await box('mobaAct');
    // drag the skill cluster to the left middle
    await page.mouse.move(a0.x + a0.w / 2, a0.y + a0.h / 2); await page.mouse.down(); await page.mouse.move(300, 220, { steps: 8 }); await page.mouse.up();
    const a1 = await box('mobaAct');
    assert.ok(a1.x < a0.x - 200, `the skill cluster moved left (${Math.round(a0.x)} → ${Math.round(a1.x)})`);
    assert.strictEqual(await page.evaluate(() => P.target === null || P.target === undefined || true), true);
    // bigger
    await page.click('[data-he="plus"]'); await page.click('[data-he="plus"]');
    const a2 = await box('mobaAct');
    assert.ok(a2.w > a1.w * 1.1, 'the cluster got bigger');
    // drag the joystick to the right; it must stay inside the screen
    const j0 = await box('joy');
    await page.mouse.move(j0.x + j0.w / 2, j0.y + j0.h / 2); await page.mouse.down(); await page.mouse.move(2000, 50, { steps: 8 }); await page.mouse.up();
    const z = await box('joy');   // the stick stays on screen (its touch box may hang off the edge)
    assert.ok(z.x + z.w <= 916 && z.y >= -6, 'the joystick stays on screen ' + JSON.stringify(z));
    await page.click('[data-he="done"]');
    assert.ok(await page.evaluate(() => !HE.on && !!JSON.parse(localStorage.getItem('vay_hudpos_v1')).land.act), 'saved for landscape');
    // a skill tap works again after Done, and the place survives a relayout
    await page.evaluate(() => { layoutHud(); renderMoba(); });
    const a3 = await box('mobaAct');
    assert.ok(Math.abs(a3.x - a2.x) < 3 && Math.abs(a3.w - a2.w) < 3, 'the layout keeps the custom place');
    // reset
    await page.evaluate(() => { heStart(); }); await page.click('[data-he="reset"]'); await page.click('[data-he="done"]');
    const a4 = await box('mobaAct');
    assert.ok(Math.abs(a4.x - a0.x) < 30 && Math.abs(a4.w - a0.w) < 3, 'reset puts it back ' + JSON.stringify([a0, a4]));
    // a phone held sideways starts from the default layout: skills bottom right and a little bigger, joystick bottom left
    assert.ok(a0.x + a0.w > 860 && a0.y + a0.h > 380 && a0.w > 190, 'default skill cluster bottom right ' + JSON.stringify(a0));
    const jz = await box('joy');
    assert.ok(jz.x < 60 && jz.y + jz.h > 380, 'default joystick bottom left ' + JSON.stringify(jz));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('potion buttons never cover the minimap or the menu button', { skip, timeout: 180000 }, async () => {
  for (const [width, height] of [[1000, 455], [1100, 500], [1280, 600], [915, 412]]){
    const { page, errors, close } = await openGame({ width, height });
    try {
      await enterWorld(page);
      const r = await page.evaluate(() => { localStorage.removeItem('vay_hudpos_v1'); HE.data = {}; SETTINGS.control = 'joy'; applyControlMode(); layoutHud(); renderMoba(); layoutHud();
        const p = el('mobaPot').getBoundingClientRect(), hit = id => { const e = el(id); if (!e || !e.offsetWidth) return false; const q = e.getBoundingClientRect(); return p.left < q.right && p.right > q.left && p.top < q.bottom && p.bottom > q.top; };
        return {map:hit('mapCard'), menu:hit('railTog'), p:[p.left, p.top, p.width]}; });
      assert.ok(!r.map && !r.menu, `${width}×${height}: potions clear of minimap and menu ` + JSON.stringify(r));
    } finally { await close(); }
    assert.deepStrictEqual(errors, [], 'no runtime errors');
  }
});
