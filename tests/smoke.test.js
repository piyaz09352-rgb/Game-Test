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

    const st = await page.evaluate(() => ({ map: S.map, hp: S.hp, lvl: S.lvl, mobs: mobs.filter(m => !m.dead && !m.dummy).length, boss: !!boss, x: P.x, y: P.y, T }));
    assert.ok(Number.isFinite(st.x) && Number.isFinite(st.y), 'player position is a number: ' + JSON.stringify(st));
    assert.ok(Number.isFinite(st.hp), 'hp is a number');
    assert.ok(st.T >= 0, 'game clock never runs backwards');
    assert.ok(st.mobs === 0 && !st.boss, '(v306) no monsters and no boss in Aren, the starting town: ' + st.mobs);
    const fl = await page.evaluate(async () => { const m0 = MAP_ID; travel(FIELDS306.id, 0); for (let i = 0; i < 60 && mobs.filter(m => !m.dead).length <= 20; i++) await new Promise(r => setTimeout(r, 100));   /* (v310) about 80 monsters fill in over the first seconds */ const o = {map:MAP_ID, mobs:mobs.filter(m => !m.dead).length, kinds:new Set(mobs.map(m => m.type)).size, back:GATES.some(g => g.to === 0)}; travel(0, FIELDS306.id); await new Promise(r => setTimeout(r, 400)); o.home = MAP_ID === m0; return o; });
    assert.ok(fl.mobs > 20 && fl.kinds >= 5 && fl.back && fl.home, 'the monsters live in the Suwannin Fields outside the east gate, and the way back works: ' + JSON.stringify(fl));

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
