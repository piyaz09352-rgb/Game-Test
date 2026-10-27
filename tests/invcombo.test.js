/* VAYRATHEN — tests/invcombo.test.js — the bag and the equipment are one window; an item picked in the bag goes on at once */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('Inventory and equipment share one window, and wearing from the bag works', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    await enterWorld(page);
    const id = await page.evaluate(() => {
      const id = Object.keys(ITEMS).find(k => { const it = ITEMS[k]; return it.kind === 'gear' && it.slot === 'armor' && canWield(it) && (it.lv || 0) <= S.lvl && S.gear.armor !== k; });
      S.inv[id] = (S.inv[id] || 0) + 1; toggleWin('bag'); return id;
    });
    const r = await page.evaluate(() => ({ equipOpen: !el('win-equip').hidden, bagInside: !!document.querySelector('#win-equip #pane-bag #bagGrid'), doll: !!document.querySelector('#win-equip .eqdoll2'),
      equipBtn: !!document.querySelector('#rail .mb[data-win="equip"]'), bagBtn: document.querySelector('#rail .mb[data-win="bag"]').getAttribute('aria-pressed') }));
    assert.ok(r.equipOpen && r.bagInside && r.doll, 'one window holds the doll and the bag');
    assert.ok(!r.equipBtn, 'no separate Equipment button'); assert.strictEqual(r.bagBtn, 'true');
    await page.click(`#bagGrid [data-bagsel="${id}"]`);
    await page.click(`#bagInfo [data-wear="${id}"]`);
    assert.strictEqual(await page.evaluate(() => S.gear.armor), id, 'the armour is on');
    await page.evaluate(() => toggleWin('bag'));
    assert.ok(await page.evaluate(() => !UIS.open.equip), 'the bag button closes it again');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
