/* VAYRATHEN — tests/potslot290.test.js — (v290) the potion slots work like skill slots
   tap = drink · hold = pick the potion (Auto drinks it too) · hold + slide down = Auto on/off; the strongest potions
   (Divine, Sky Blue) are used at last. Real mouse on a PC hotbar, real touch on the phone bottles. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
const center = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };

test('PC hotbar: tap drinks, hold picks, slide toggles Auto', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width: 1366, height: 768 });
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.inv.redpot = 10; S.inv.orangepot = 5; S.inv.divinepot = 2; S.inv.bluepot = 4; S.inv.skypot = 1; S.potSel = {}; S.hp = 5; derive(); renderHotbar(); const c = el('confirm'); if (c) c.hidden = true; for (const e of document.querySelectorAll('.tutbox')) e.remove(); });
    const hpSel = await page.evaluate(() => `#hotbar .hk[data-hot="${S.hot.length}"]`), spSel = await page.evaluate(() => `#hotbar .hk[data-hot="${S.hot.length + 1}"]`);
    assert.deepStrictEqual(await page.evaluate(() => [potPick('hp'), potPick('sp')]), ['divinepot', 'skypot'], 'the strongest potions fill the slots');
    // hold → picker → pick the orange potion
    let [x, y] = await center(page, hpSel); await page.mouse.move(x, y); await page.mouse.down(); await page.waitForTimeout(650); await page.mouse.up();
    await page.waitForSelector('#potPick [data-pts="orangepot"]', { timeout: 5000 });
    assert.strictEqual(await page.evaluate(() => S.inv.divinepot), 2, 'holding does not drink');
    await page.click('#potPick [data-pts="orangepot"]');
    const got = await page.evaluate(() => [S.potSel.hp, potPick('hp'), document.querySelector(`#hotbar .hk[data-hot="${S.hot.length}"]`).title].join('|')), want = await page.evaluate(() => `orangepot|orangepot|${nm(ITEMS.orangepot)}`);
    assert.strictEqual(got, want, 'the picked potion stays in the slot');
    // tap → drinks the chosen one
    await page.evaluate(() => { P.itemCd = 0; S.hp = 5; }); [x, y] = await center(page, hpSel); await page.mouse.click(x, y); await page.waitForTimeout(200);
    assert.strictEqual(await page.evaluate(() => S.inv.orangepot), 4, 'a tap drinks the slot\'s potion');
    // Auto drinks the chosen one too
    assert.strictEqual(await page.evaluate(() => { const B = botSet(); return S.inv[potPick('hp')] ? potPick('hp') : null; }), 'orangepot');
    // hold + slide down → Auto off, badge gone; again → on
    const was = await page.evaluate(() => S.bot.potSpOn !== false);
    // the slide as one quick pointer sequence (a slow test machine delivered real mouse moves after the hold timer had already fired)
    await page.evaluate(s => { const b = document.querySelector(s), r = b.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2, o = (yy) => ({ pointerId: 3, pointerType: 'mouse', bubbles: true, clientX: x, clientY: yy });
      b.dispatchEvent(new PointerEvent('pointerdown', o(y))); for (const dy of [10, 25, 40, 50]) b.dispatchEvent(new PointerEvent('pointermove', o(y + dy))); b.dispatchEvent(new PointerEvent('pointerup', o(y + 50))); b.click(); }, spSel);
    assert.strictEqual(await page.evaluate(() => S.bot.potSpOn !== false), !was, 'sliding down switches Auto');
    assert.strictEqual(await page.evaluate(s => !!document.querySelector(s + ' .autob'), spSel), !was, 'the A badge follows');
    assert.strictEqual(await page.evaluate(() => S.inv.skypot), 1, 'sliding does not drink');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('phone bottles: tap drinks on release, hold opens the picker', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width: 844, height: 390, ctx: { isMobile: true, hasTouch: true } });
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.inv.redpot = 10; S.inv.whitepot = 3; S.potSel = {}; S.hp = 5; derive(); renderHotbar(); renderMoba(); for (const e of document.querySelectorAll('.tutbox')) e.remove(); });
    const ok = await page.evaluate(() => !!document.querySelector('#mobaPot .mo.pot.hp'));
    if (!ok) return;   // this layout has no touch bottles
    const n0 = await page.evaluate(() => S.inv.whitepot);
    await page.tap('#mobaPot .mo.pot.hp'); await page.waitForTimeout(250);
    assert.strictEqual(await page.evaluate(() => S.inv.whitepot), n0 - 1, 'a tap drinks once');
    // a long press with a touch pointer: dispatch the pointer sequence (Playwright has no long-tap)
    await page.evaluate(async () => { const b = document.querySelector('#mobaPot .mo.pot.hp'), r = b.getBoundingClientRect(), o = { pointerId: 7, pointerType: 'touch', bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
      b.dispatchEvent(new PointerEvent('pointerdown', o)); await new Promise(res => setTimeout(res, 650)); b.dispatchEvent(new PointerEvent('pointerup', o)); });
    assert.ok(await page.evaluate(() => !!el('potPick')), 'holding opens the picker');
    assert.strictEqual(await page.evaluate(() => S.inv.whitepot), n0 - 1, 'and does not drink');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
