/* VAYRATHEN — tests/smoke.test.js — opens the real game in headless Chromium and plays it like a new player.
   Fails on any uncaught error or console.error. External network (Firebase, fonts) is blocked so it runs offline. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('new player: create account and hero, walk, fight, open windows, save and reload', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const keys = ['w', 'a', 's', 'd', 'e', 'Escape', 'm', 'Escape', 'k', 'Escape', 'c', 'Escape', 'q', 'Escape', 'g', 'Escape'];
    for (const k of keys){ await page.keyboard.press(k); await page.waitForTimeout(150); }
    for (let i = 0; i < 8; i++){ await page.mouse.click(400 + i * 60, 300 + (i % 3) * 50); await page.waitForTimeout(250); }
    await page.waitForTimeout(3000);

    const st = await page.evaluate(() => ({ map: S.map, hp: S.hp, lvl: S.lvl, mobs: window.__vay.mobs.length, x: P.x, y: P.y, T }));
    assert.ok(Number.isFinite(st.x) && Number.isFinite(st.y), 'player position is a number: ' + JSON.stringify(st));
    assert.ok(Number.isFinite(st.hp), 'hp is a number');
    assert.ok(st.T >= 0, 'game clock never runs backwards');
    assert.ok(st.mobs > 0, 'monsters spawned on the starting map');

    await page.evaluate(() => save());
    await page.reload();
    await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
    assert.ok((await page.$$('[data-play]')).length >= 1, 'saved character shows on the title screen after reload');
    await page.click('[data-play]');
    await page.waitForFunction(() => !PAUSED, null, { timeout: 30000 });
    assert.strictEqual(await page.evaluate(() => S.name), 'Tester', 'continue loads the same hero');
    await page.waitForTimeout(1500);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('works on a phone-sized landscape screen with touch', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame({ width: 844, height: 390 });
  try {
    await enterWorld(page, 'Phone');
    await page.waitForTimeout(3000);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
