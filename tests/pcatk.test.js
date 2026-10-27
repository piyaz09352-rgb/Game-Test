/* VAYRATHEN — tests/pcatk.test.js — the mouse layout has an attack button: tap attacks the nearest enemy, hold opens the target list. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('PC attack button: visible in mouse mode, tap targets, hold lists targets', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({width:1280, height:720});
  try {
    await enterWorld(page);
    await page.evaluate(() => { SETTINGS.control = 'mouse'; applyControlMode(); loadMap(1); });
    await page.waitForTimeout(1200);
    const vis = await page.evaluate(() => { const b = document.querySelector('#pcAtk [data-mo="atk"]'); return !!(b && b.offsetParent); });
    assert.ok(vis, 'the attack button shows with a mouse');
    await page.evaluate(() => { const m = mobs.find(x => !x.dead && !x.def.boss); if (m){ P.x = m.x - 60; P.y = m.y; } P.target = null; });
    const box = await page.locator('#pcAtk [data-mo="atk"]').boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(200);
    assert.ok(await page.evaluate(() => !!(P.target && !P.target.dead)), 'a tap picks an enemy to attack');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.waitForTimeout(800); await page.mouse.up();
    assert.ok(await page.evaluate(() => TPK.open && !el('tpick').hidden), 'holding opens the target list');
    await page.evaluate(() => { SETTINGS.control = 'joy'; applyControlMode(); });
    assert.ok(await page.evaluate(() => !document.querySelector('#pcAtk [data-mo="atk"]').offsetParent), 'hidden in the touch layout');
    await page.evaluate(() => { SETTINGS.control = 'auto'; applyControlMode(); });
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
