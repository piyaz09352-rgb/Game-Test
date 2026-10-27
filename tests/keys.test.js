/* VAYRATHEN — tests/keys.test.js — (v100) shortcuts by key position: the Thai layout works, typing never triggers them */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('keys: Thai layout shortcuts, number keys, typing and the guide', { skip, timeout: 120000 }, async () => {
  const { page, close } = await openGame({ width: 1280, height: 800 });
  try {
    await enterWorld(page, 'Keys');
    await page.evaluate(() => { if (typeof REST !== 'undefined'){ if (REST.on) leaveRest(); REST.lastIn = Date.now(); } });   // the rest screen eats the first key
    const press = (key, code, opt = {}) => page.evaluate(([key, code, opt]) => { if (REST.on) leaveRest(); REST.lastIn = Date.now(); const t = opt.on ? document.querySelector(opt.on) : document.body;
      t.dispatchEvent(new KeyboardEvent('keydown', {key, code, bubbles:true, cancelable:true, shiftKey:!!opt.shift})); }, [key, code, opt]);
    // Thai layout: A types "ฟ", but it is still the Status key
    await press('ฟ', 'KeyA');
    assert.ok(await page.evaluate(() => !!UIS.open.stat), 'A (ฟ) opens Status');
    await press('ฟ', 'KeyA');
    assert.ok(await page.evaluate(() => !UIS.open.stat), 'and closes it');
    // Thai layout: 3 types "-" and 2 types "/": they are hotbar keys, not zoom or the guide
    const z0 = await page.evaluate(() => ZOOM.target);
    await press('-', 'Digit3'); await press('/', 'Digit2');
    assert.strictEqual(await page.evaluate(() => ZOOM.target), z0, '3 does not zoom out');
    assert.ok(await page.evaluate(() => !UIS.open.help), '2 does not open the guide');
    // the real minus key still zooms, and ? opens the guide
    await press('ข', 'Minus');
    assert.ok(await page.evaluate(z => ZOOM.target < z, z0), 'the minus key zooms out');
    await press('ฦ', 'Slash', {shift:true});
    assert.ok(await page.evaluate(() => !!UIS.open.help), '? opens the guide');
    // the guide is drawn from KEYMAP
    assert.strictEqual(await page.evaluate(() => document.querySelectorAll('#win-help dl.keys dt').length), await page.evaluate(() => KEYMAP.length + 1));
    // typing in a text box never fires a shortcut
    await page.evaluate(() => { const i = document.createElement('input'); i.id = 'kTest'; el('ui').appendChild(i); i.focus(); });
    await press('ำ', 'KeyE', {on:'#kTest'});
    assert.ok(await page.evaluate(() => !UIS.open[invId('bag')]), 'E typed in a text box does not open the bag');
    await page.evaluate(() => el('kTest').remove());
    await press('ำ', 'KeyE');
    assert.ok(await page.evaluate(() => !!UIS.open[invId('bag')]), 'E opens the bag outside a text box');
  } finally { await close(); }
});
