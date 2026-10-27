/* VAYRATHEN — tests/bossrelog.test.js — (v137) a region boss killed this round stays down after leaving and coming back */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('boss killed → reload the game → still down until the next round', { skip, timeout: 150000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Relog');
    const up = await page.evaluate(async () => { S.lvl = 200; derive(); S.hp = DER.maxhp; loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; bossTimer = 0;
      for (let i = 0; i < 60 && !(typeof boss !== 'undefined' && boss); i++) await new Promise(r => setTimeout(r, 100));
      return !!boss; });
    assert.ok(up, 'the boss is there to begin with');
    // a minute left in the round at least, or the next round would bring a new boss during the test
    const left = await page.evaluate(() => BCK.gap - (wNow() % BCK.gap));
    if (left < 60e3) await page.waitForTimeout(left + 2000);
    await page.evaluate(async () => { if (!boss) { bossTimer = 0; for (let i = 0; i < 60 && !boss; i++) await new Promise(r => setTimeout(r, 100)); } killMob(boss); await new Promise(r => setTimeout(r, 500)); save(); });
    await page.reload(); await page.waitForFunction(() => !!window.__vay, null, { timeout: 60000 });
    await enterWorld(page, 'Relog');
    const after = await page.evaluate(async () => { loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; await new Promise(r => setTimeout(r, 4000));
      return {boss:!!boss, killed:bckKilled(1), text:bossClockText()}; });
    assert.ok(after.killed, 'the kill is remembered after a reload');
    assert.strictEqual(after.boss, false, 'no boss again in the same round');
    assert.ok(/บอส|Boss/.test(after.text), `the tracker counts down to the next one (${after.text})`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
