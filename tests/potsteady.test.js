/* VAYRATHEN — tests/potsteady.test.js — (v112) the potion buttons never jump: Auto on/off, layouts, potions used */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('touch: the potion buttons stay put', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width:844, height:390, ctx:{ isMobile:true, hasTouch:true, deviceScaleFactor:3 } });
  try {
    await enterWorld(page, 'Pot');
    const r = await page.evaluate(async () => {
      const c = el('confirm'); if (c) c.hidden = true;
      SETTINGS.control = 'joy'; applyControlMode(); S.lvl = 60; derive(); S.inv[bestHp()] = 50; S.inv[bestSp()] = 40; renderMoba(); loadMap(1);
      await new Promise(r => setTimeout(r, 400));
      const at = () => [...el('mobaPot').querySelectorAll('.mo')].map(b => { const r = b.getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.top); }).join(' ');
      const seen = new Set([at()]);
      for (let i = 0; i < 40; i++){
        if (i % 8 === 0){ BOT.on = !BOT.on; if (typeof renderBotChip === 'function') renderBotChip(); }
        if (i % 5 === 2){ S.hp = Math.round(DER.maxhp * .3); useItem(bestHp()); }
        if (i % 7 === 3) layoutHud(); if (i % 9 === 4) renderMoba();
        await new Promise(r => setTimeout(r, 60)); seen.add(at()); }
      BOT.on = false; return [...seen];
    });
    assert.strictEqual(r.length, 1, `the potion buttons stayed in one place (${r.join(' / ')})`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
