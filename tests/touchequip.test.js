/* VAYRATHEN — tests/touchequip.test.js — (v110) a phone: tap a bag item → its card has a big Wear button that works;
   a quick double tap on an item wears it too */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('touch: wear gear from the bag by the card button and by double tap', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width:844, height:390, ctx:{ isMobile:true, hasTouch:true, deviceScaleFactor:3 } });
  try {
    await enterWorld(page, 'Eq');
    const ids = await page.evaluate(() => { const c = el('confirm'); if (c) c.hidden = true; const tb = el('tutBox'); if (tb) tb.hidden = true;
      SETTINGS.control = 'joy'; applyControlMode(); renderMoba(); S.lvl = 30;
      const pick = slot => Object.keys(ITEMS).find(k => ITEMS[k].kind === 'gear' && ITEMS[k].slot === slot && (ITEMS[k].lv || 0) <= 10 && !ITEMS[k].starter && !ITEMS[k].base);
      const a = pick('head'), b = pick('armor'); S.inv[a] = 1; S.inv[b] = 1; BAG.tab = 'all'; openWin('bag'); renderBag(); return [a, b]; });
    await page.waitForTimeout(600);
    const tapAt = async sel => { const r = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({block:'center'}); const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }, sel); assert.ok(r, 'found ' + sel); await page.touchscreen.tap(r[0], r[1]); };
    const worn = id => page.evaluate(id => Object.values(S.gear).some(g => g === id || (g && ITEMS[g] && ITEMS[g].base === id)), id);
    // 1) tap → card with a big Wear button → tap it
    await tapAt(`[data-bagsel="${ids[0]}"]`); await page.waitForTimeout(400);
    const bar = await page.evaluate(() => { const b = document.querySelector('#itTip:not([hidden]) .tebar [data-teact]'); if (!b) return null; const r = b.getBoundingClientRect(); return {h:r.height, w:r.width}; });
    assert.ok(bar, 'the item card shows an action bar');
    assert.ok(bar.h >= 40, `the Wear button is thumb-sized (${Math.round(bar.h)} px)`);
    await tapAt('#itTip .tebar [data-teact]'); await page.waitForTimeout(400);
    assert.ok(await worn(ids[0]), 'worn from the card button');
    assert.ok(await page.evaluate(() => el('itTip').hidden), 'the card closes');
    // 2) double tap on another item
    await page.evaluate(() => renderBag()); await page.waitForTimeout(300);
    const r = await page.evaluate(id => { const e = document.querySelector(`[data-bagsel="${id}"]`); e.scrollIntoView({block:'center'}); const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }, ids[1]);
    await page.touchscreen.tap(r[0], r[1]); await page.touchscreen.tap(r[0], r[1]); await page.waitForTimeout(400);   // two taps as quick as the test driver allows
    assert.ok(await worn(ids[1]), 'worn by a double tap');
  } finally { await close(); }
  assert.deepStrictEqual(errors.filter(e => !/Ignored attempt to cancel a touch/.test(e)), [], 'no runtime errors');
});
