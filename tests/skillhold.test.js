'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('skill buttons: hold to change the skill, hold and slide down to toggle Auto, tap to use', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.job = 'summoner'; S.lvl = 60; S.skills = S.skills || {}; S.skills.callsingha = 5; S.skills.callnaga = 3; S.skills.spiritburst = 3;
      S.hot = ['callsingha', 'callnaga', null, null, null, null]; derive(); S.sp = DER.maxsp; renderHotbar(); });
    const box = async i => { await page.waitForSelector(`#hotbar .hk[data-hot="${i}"]`, { state: 'visible' });
      return page.evaluate(i => { const r = document.querySelector(`#hotbar .hk[data-hot="${i}"]`).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }, i); };
    // hold on slot 1 → picker; pick Spirit Burst
    let r = await box(0); await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down(); await page.waitForTimeout(650); await page.mouse.up();
    assert.ok(await page.$('#skPick'), 'the picker opened');
    await page.click('#skPick [data-skp="spiritburst"]');
    assert.deepStrictEqual(await page.evaluate(() => S.hot.slice(0, 2)), ['spiritburst', 'callnaga']);
    // hold and slide down on slot 2 → Auto off for Naga, badge gone; again → back on
    const autoOf = id => page.evaluate(id => { const e = botSet().list.find(v => v.id === id); return !!(e && e.on); }, id);
    const before = await autoOf('callnaga');
    r = await box(1); await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down(); await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2 + 50, { steps: 5 }); await page.mouse.up();
    assert.strictEqual(await autoOf('callnaga'), !before);
    assert.strictEqual(!!(await page.$('#hotbar .hk[data-hot="1"] .autob')), !before);
    assert.ok(!(await page.$('#skPick')), 'sliding does not open the picker');
    // tap slot 2 → the skill is used (Naga is summoned)
    await page.evaluate(() => { S.sp = DER.maxsp; });
    r = await box(1); await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
    await page.waitForFunction(() => SUMMONS.some(s => s.beast === 'naga') || (P.cast && P.cast.id === 'callnaga'), null, { timeout: 5000 });
    // tap an empty slot → the picker opens to fill it
    r = await box(3); await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
    assert.ok(await page.$('#skPick'), 'empty slot opens the picker');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('menu: no My House button; emotes open from the chat box', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    assert.ok(!(await page.$('#rail .mb[data-win="house"]')), 'no house button');
    assert.ok(!(await page.$('#rail [data-emopen]')), 'no emote button in the menu');
    assert.ok(await page.$('#chatForm .cemo[data-emopen]'), 'emote button in the chat input row');
    await page.evaluate(() => document.querySelector('#chatForm .cemo').click());
    assert.ok(await page.evaluate(() => !el('emoWheel').hidden), 'emote wheel opens');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
