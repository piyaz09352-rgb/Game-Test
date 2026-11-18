/* VAYRATHEN — tests/death315.test.js — (v315) the death sign shows its ribbon and both buttons even on a device that
   asks for less motion (css/hud.css turns every animation off there; the parts used to stay invisible) */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

for (const rm of ['reduce', 'no-preference']) test(`death sign is whole (reduced motion: ${rm})`, { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ ctx:{reducedMotion:rm} });
  try {
    await enterWorld(page);
    await page.evaluate(() => { loadMap(1); });
    await page.waitForTimeout(600);
    await page.evaluate(() => { S.hp = 0; playerDie(); });
    await page.waitForTimeout(2600);
    const r = await page.evaluate(() => Object.fromEntries(['.dthcard', '.dtht', '.dthrib', '.dthb.town', '.dthb.here'].map(s => { const e = document.querySelector('#dth ' + s), cs = getComputedStyle(e), b = e.getBoundingClientRect(); return [s, +cs.opacity > .9 && b.width > 20 && b.height > 10]; })));
    assert.deepStrictEqual(r, {'.dthcard':true, '.dtht':true, '.dthrib':true, '.dthb.town':true, '.dthb.here':true}, JSON.stringify(r));
    await page.click('#dth .dthb.town'); await page.waitForTimeout(800);
    assert.strictEqual(await page.evaluate(() => [P.dead, MAP_ID].join()), 'false,0', 'pressing «Rise in town» brings you back to Aren');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
