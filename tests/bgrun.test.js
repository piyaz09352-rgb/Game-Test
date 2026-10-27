'use strict';
const test = require('node:test'), assert = require('node:assert');
const { openGame, enterWorld } = require('./browser');

const hide = page => page.evaluate(() => Object.defineProperty(document, 'hidden', { get: () => true, configurable: true }));
const show = page => page.evaluate(() => { delete document.hidden; });

test('hidden tab: the game keeps running from the background ticker, and never gets stuck on return', async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const t0 = await page.evaluate(() => S.worldT);
    await hide(page);
    await page.waitForTimeout(1600);
    const t1 = await page.evaluate(() => S.worldT);
    assert.ok(t1 - t0 > 1, 'game time advanced while hidden: ' + (t1 - t0));
    await show(page);
    await page.waitForFunction(t => S.worldT > t + .2, t1, { timeout: 20000 });   // game continues in the foreground (rAF may be slow on a busy machine)
    // setting off: a hidden tab stands still again
    await page.evaluate(() => { SETTINGS.bgRun = false; });
    await hide(page);
    const a = await page.evaluate(() => S.worldT); await page.waitForTimeout(1500);
    const b = await page.evaluate(() => S.worldT);
    assert.ok(b - a < .1, 'no stepping when background play is off');
    await page.evaluate(() => { SETTINGS.bgRun = true; }); await show(page);
    assert.deepEqual(errors, []);
  } finally { await close(); }
});

test('screen rest: black overlay, game logic keeps running, a tap wakes it, low HP wakes it', async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => enterRest());
    assert.ok(await page.evaluate(() => REST.on && !document.getElementById('restScr').hidden), 'overlay shown');
    const t0 = await page.evaluate(() => S.worldT);
    await page.waitForFunction(t => S.worldT > t + .3, t0, { timeout: 20000 });   // logic runs during rest
    await page.mouse.click(300, 300);
    assert.equal(await page.evaluate(() => REST.on), false, 'tap wakes');
    await page.waitForFunction(() => document.getElementById('restScr').hidden, null, { timeout: 10000 });   // fades out, then hides
    // low HP alert
    await page.evaluate(() => { enterRest(); S.hp = Math.max(1, Math.floor(DER.maxhp * .1)); });
    await page.waitForFunction(() => !REST.on, null, { timeout: 15000 });
    // auto start after idle time
    await page.evaluate(() => { S.hp = DER.maxhp; SETTINGS.restMin = 1; REST.lastIn = Date.now() - 61000; });
    await page.waitForFunction(() => REST.on, null, { timeout: 15000 });
    await page.keyboard.press('Space');
    assert.equal(await page.evaluate(() => REST.on), false);
    assert.deepEqual(errors, []);
  } finally { await close(); }
});
