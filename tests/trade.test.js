/* VAYRATHEN — tests/trade.test.js — (v98) two players trade an item, a card and Bia through the trade window */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('trade: cards, items and Bia change hands through the window', { skip, timeout: 240000 }, async () => {
  const { players, close } = await openPlayers(2);
  try {
    const [a, b] = players.map(p => p.page);
    for (const [i, pg] of [a, b].entries()){
      await enterWorld(pg, 'Trader' + i);
      await pg.evaluate(() => { S.bia = 50000; S.inv.redpot = 20; S.cards = {c_dew:2}; derive(); });
    }
    await a.waitForFunction(() => NET.on && myPeer(), null, { timeout: 30000 });
    await b.waitForFunction(() => NET.on && myPeer(), null, { timeout: 30000 });
    const pb = await b.evaluate(() => myPeer());
    await a.evaluate(p => tradeRequest(p, 'Trader1'), pb);
    await b.waitForSelector('#sysPrompt:not([hidden]) [data-spy]', { timeout: 15000 });
    await b.click('#sysPrompt [data-spy]');
    await a.waitForFunction(() => TRADE.open && UIS.open.trade, null, { timeout: 15000 });

    // a picks the card from the Cards tab, then 5 potions with the amount box, then Bia by the quick button
    await a.click('#pane-trade [data-ttab="card"]');
    assert.strictEqual(await a.locator('#pane-trade [data-tsel]').count(), 1, 'the Cards tab lists only cards');
    await a.click('#pane-trade [data-tsel="c_dew"]');
    await a.click('#pane-trade [data-tput]');
    await a.click('#pane-trade [data-ttab="all"]');
    await a.fill('#pane-trade #tQ', 'ยาแดง');
    await a.click('#pane-trade [data-tsel="redpot"]');
    await a.fill('#pane-trade #tQty', '5');
    await a.click('#pane-trade [data-tput]');
    await a.click('#pane-trade [data-tzadd="10000"]');
    assert.deepStrictEqual(await a.evaluate(() => [TRADE.mine.items, TRADE.mine.z]), [[['c_dew', 1], ['redpot', 5]], 10000]);
    await b.waitForFunction(() => TRADE.theirs.items.length === 2 && TRADE.theirs.z === 10000, null, { timeout: 10000 });
    assert.ok(await b.evaluate(() => /Card|การ์ด/.test(el('pane-trade').textContent)), 'b sees the card in a\'s offer');

    // the window does not redraw when nothing changed
    const same = await a.evaluate(() => { const n = el('pane-trade').firstElementChild; WIN_RENDER.trade(); return n === el('pane-trade').firstElementChild; });
    assert.ok(same, 'no redraw without a change');

    // lock, lock, confirm, confirm
    await a.click('#pane-trade [data-tact="lock"]');
    await b.waitForFunction(() => TRADE.lockThem, null, { timeout: 10000 });
    await b.click('#pane-trade [data-tact="lock"]');
    await a.waitForFunction(() => TRADE.lockThem, null, { timeout: 10000 });
    await a.click('#pane-trade [data-tact="ok"]');
    await b.waitForFunction(() => TRADE.okThem, null, { timeout: 10000 });
    await b.click('#pane-trade [data-tact="ok"]');
    await a.waitForFunction(() => !TRADE.open, null, { timeout: 10000 });
    await b.waitForFunction(() => !TRADE.open, null, { timeout: 10000 });
    assert.deepStrictEqual(await a.evaluate(() => [S.cards.c_dew, S.inv.redpot, S.bia]), [1, 15, 40000], 'a gave a card, 5 potions and 10,000');
    assert.deepStrictEqual(await b.evaluate(() => [S.cards.c_dew, S.inv.redpot, S.bia]), [3, 25, 60000], 'b got them');
  } finally { await close(); }
});
