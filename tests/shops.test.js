/* VAYRATHEN — tests/shops.test.js — one shop per kind of goods, buy any amount, hold + to raise a stat. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

/* what every NPC in town (and a field camp) offers to buy */
const shopMap = page => page.evaluate(() => {
  const out = {}, seen = (id, who) => { (out[id] = out[id] || new Set()).add(who); };
  const scan = who => { const d = document.getElementById('dialog');
    for (const b of d.querySelectorAll('button')) for (const [k, v] of Object.entries(b.dataset)) if (/^(buy|buygear|qbuy|fgbuy)$/.test(k)) seen(v, who); };
  S.bia = 1e9; S.lvl = 120;
  for (const n of NPCS){ closeDialog(); openNpc(n); scan(n.id); }
  // Blacksmith Phet's shop window, every sub-tab
  if (typeof RF !== 'undefined' && WIN_RENDER.forge){ RF.tab = 'buy';
    for (const sub of ['weapon', 'head', 'armor', 'shoes', 'acc', 'ammo', 'mat']){ RF.shop = sub; openWin('forge'); WIN_RENDER.forge();
      for (const b of document.querySelectorAll('#win-forge button')) for (const [k, v] of Object.entries(b.dataset)) if (/^(fgbuy|qbuy)$/.test(k)) seen(v, 'smith'); } }
  // a field camp's NPCs
  closeDialog(); loadMap(1); for (const n of NPCS){ closeDialog(); openNpc(n); scan(n.id + '@camp'); } closeDialog(); loadMap(0);
  return Object.fromEntries(Object.entries(out).map(([k, s]) => [k, [...s]]));
});

test('every item is sold by exactly one shop; (v158) the potion shop sells only potions, arrows at Blacksmith Phet', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const m = await shopMap(page), ITEMS_AMMO = await page.evaluate(() => GEAR_LIST.filter(g => g[1] === 'ammo').map(g => g[0]));
    const dup = Object.entries(m).filter(([id, who]) => who.length > 1 && !(ITEMS_AMMO.includes(id) && who.join() === 'shop,smith')).map(([id, who]) => `${id}: ${who.join(' + ')}`);
    assert.deepStrictEqual(dup, [], 'nothing is sold in two places');
    assert.deepStrictEqual(m.q_wood, ['smith'], 'arrows: Blacksmith Phet');
    assert.deepStrictEqual(m.redpot, ['shop'], 'potions: general store only');
    assert.ok(!(await page.evaluate(() => NPCS.some(n => n.id === 'armorer'))), 'the duplicate armourer is gone');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('buy any amount: type it, use − / + / MAX, hold +', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.bia = 100000; S.inv.redpot = 0; const n = NPCS.find(n => n.id === 'shop'); P.x = n.x; P.y = n.y + 30; closeDialog(); openNpc(n); });
    const box = '#dialog .qty[data-qty="redpot"]';
    await page.fill(`${box} .qn`, '37');
    await page.click('#dialog [data-qbuy="redpot"]');
    const st = await page.evaluate(() => ({ have: S.inv.redpot || 0, bia: S.bia, price: ITEMS.redpot.buy }));
    assert.strictEqual(st.have, 37, 'bought the typed amount');
    assert.strictEqual(st.bia, 100000 - 37 * st.price, 'paid for exactly that many');
    // hold + for a while: the amount climbs past single steps
    const plus = await page.$(`${box} [data-qd="1"]`), pb = await plus.boundingBox();
    await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2); await page.mouse.down(); await page.waitForTimeout(2500); await page.mouse.up();
    const held = +(await page.inputValue(`${box} .qn`));
    assert.ok(held > 20, `holding + counts up quickly (${held})`);
    // MAX = as many as the wallet allows
    await page.click(`${box} [data-qmax]`);
    const mx = await page.evaluate(() => ({ n: +document.querySelector('#dialog .qty[data-qty="redpot"] .qn').value, can: Math.floor(S.bia / ITEMS.redpot.buy) }));
    assert.strictEqual(mx.n, Math.min(9999, mx.can), 'MAX fills what you can afford');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('hold a stat + button to keep raising it; a tap adds one; nothing is spent until confirmed', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.statPts = 400; S.stats.str = 1; stpClear(); dirty = true; openWin('stat'); });
    await page.waitForTimeout(400);
    const planned = () => page.evaluate(() => S.stats.str + (STP.add.str || 0));
    await page.click('button[data-stat="str"]');
    await page.waitForTimeout(200);
    assert.strictEqual(await planned(), 2, 'one tap = +1 planned');
    assert.strictEqual(await page.evaluate(() => S.stats.str), 1, 'not spent yet');
    assert.ok(await page.$('#pane-stat .stpbar [data-stpok]'), 'a confirm bar shows');
    const b = await page.evaluate(() => { const r = document.querySelector('button[data-stat="str"]').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
    await page.waitForFunction(() => S.stats.str + (STP.add.str || 0) >= 20, null, { timeout: 15000 }).catch(() => {}); await page.mouse.up();
    const after = await planned();
    assert.ok(after >= 20, `holding raises it many times (STR ${after})`);
    await page.waitForTimeout(600);
    assert.strictEqual(await planned(), after, 'stops when released');
    const view = await page.evaluate(() => ({ row: document.querySelector('button[data-stat="str"]').closest('tr').textContent, atk: [...document.querySelectorAll('#pane-stat dl.derived .stp-ch')].map(d => d.textContent).join('|'), atkNow: DER.atk }));
    assert.match(view.row, new RegExp(`1 → ${after}`), 'the row shows old → new');
    assert.match(view.atk, /ATK/, 'the changed ATK is listed');
    // cancel drops the plan
    await page.click('[data-stpno]'); assert.strictEqual(await planned(), 1);
    // plan again and confirm: now the points are spent and the stat is raised
    await page.click('button[data-stat="str"]'); await page.click('button[data-stat="str"]');
    const atk0 = await page.evaluate(() => DER.atk);
    await page.click('[data-stpok]');
    const done = await page.evaluate(() => ({ str: S.stats.str, pts: S.statPts, pend: STP.spent, atk: DER.atk }));
    assert.strictEqual(done.str, 3); assert.strictEqual(done.pend, 0); assert.ok(done.pts < 400); assert.ok(done.atk > atk0, 'ATK went up after confirming');
    // runs out of points: stops by itself, never plans more than it has
    await page.evaluate(() => { S.statPts = 5; dirty = true; });
    await page.waitForTimeout(300);
    const b2 = await page.evaluate(() => { const r = document.querySelector('button[data-stat="agi"]').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2); await page.mouse.down(); await page.waitForTimeout(2000); await page.mouse.up();
    assert.ok(await page.evaluate(() => STP.spent <= S.statPts), 'never plans points it does not have');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
